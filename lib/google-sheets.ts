/**
 * Google Sheets API Integration for Brewery Directory
 * Optimized for Vercel deployment with connection pooling and timeout handling
 */

import { google } from 'googleapis';
import { Brewery, BreweryType, Membership, SocialMedia, OperatingHours } from '../src/types/brewery';

// Connection pooling for API client reuse
let sheetsClient: any = null;
let authClient: any = null;

/**
 * Initialize Google Sheets API client with proper authentication
 * Handles private key formatting for Vercel environment
 */
async function initializeSheetsClient() {
  if (sheetsClient && authClient) {
    return { sheetsClient, authClient };
  }

  try {
    // Handle private key formatting for Vercel
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    if (!privateKey) {
      throw new Error('GOOGLE_PRIVATE_KEY environment variable is required');
    }

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_EMAIL environment variable is required');
    }

    if (!process.env.GOOGLE_SHEET_ID) {
      throw new Error('GOOGLE_SHEET_ID environment variable is required');
    }

    // Create JWT auth client
    authClient = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        'https://www.googleapis.com/auth/spreadsheets'
      ],
    });

    // Initialize sheets client with timeout
    sheetsClient = google.sheets({
      version: 'v4',
      auth: authClient,
      timeout: 9000, // 9 second timeout for Vercel's 10 second limit
    });

    return { sheetsClient, authClient };
  } catch (error) {
    console.error('Failed to initialize Google Sheets client:', error);
    throw error;
  }
}

/**
 * Exponential backoff retry logic for API calls
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`API call failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms:`, error);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Parse comma-separated string to array
 */
function parseCommaSeparated(value: string | undefined): string[] {
  if (!value || value.trim() === '') return [];
  return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
}

/**
 * Generate URL-friendly slug from brewery name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Parse social media links from comma-separated string
 */
function parseSocialMedia(socialMediaString: string | undefined): SocialMedia {
  if (!socialMediaString) return {};
  
  const socialMedia: SocialMedia = {};
  const links = parseCommaSeparated(socialMediaString);
  
  links.forEach(link => {
    const trimmedLink = link.trim();
    if (trimmedLink.includes('facebook.com') || trimmedLink.includes('fb.com')) {
      socialMedia.facebook = trimmedLink;
    } else if (trimmedLink.includes('instagram.com')) {
      socialMedia.instagram = trimmedLink;
    } else if (trimmedLink.includes('twitter.com') || trimmedLink.includes('x.com')) {
      socialMedia.twitter = trimmedLink;
    } else if (trimmedLink.includes('untappd.com')) {
      socialMedia.untappd = trimmedLink;
    } else if (trimmedLink.includes('beeradvocate.com')) {
      socialMedia.beerAdvocate = trimmedLink;
    } else if (trimmedLink.includes('ratebeer.com')) {
      socialMedia.rateBeer = trimmedLink;
    }
  });
  
  return socialMedia;
}


/**
 * Parse memberships from comma-separated string
 */
function parseMemberships(membershipsString: string | undefined): Membership[] {
  if (!membershipsString) return [];
  
  const membershipStrings = parseCommaSeparated(membershipsString);
  return membershipStrings.map(membership => ({
    name: membership.trim(),
    description: undefined,
    benefits: undefined,
    price: undefined,
    duration: undefined,
  }));
}

/**
 * Parse boolean values from string with more comprehensive checking
 */
function parseBoolean(value: string | undefined): boolean {
  if (!value) return false;
  const lowerValue = value.toLowerCase().trim();
  return lowerValue === 'true' || 
         lowerValue === 'yes' || 
         lowerValue === '1' || 
         lowerValue === 'y' ||
         lowerValue === 'on' ||
         lowerValue === 'enabled';
}

/**
 * Parse brewery type from string (supports comma-separated values)
 */
function parseBreweryType(typeString: string | undefined): string | string[] {
  if (!typeString) return 'Microbrewery';
  
  // Split by comma and clean up each type
  const types = typeString.split(',').map(type => {
    const trimmed = type.trim();
    // Capitalize each word
    return trimmed.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  });
  
  // If only one type, return as string
  if (types.length === 1) {
    return types[0];
  }
  
  // Return array of types
  return types;
}


/**
 * Main function to fetch brewery data from Google Sheets
 * Optimized for Vercel with timeout handling and retry logic
 */
/**
 * Format ABV to preserve decimal values without % sign
 */
function formatABV(abv: string): string {
  if (!abv) return '';
  
  // Remove any existing % sign
  const cleanABV = abv.replace('%', '').trim();
  
  // Try to parse as number and format to preserve decimals
  const num = parseFloat(cleanABV);
  if (!isNaN(num)) {
    // Always show at least one decimal place to preserve values like 6.0
    return num.toFixed(1);
  }
  
  // If not a number, return cleaned value
  return cleanABV;
}

/**
 * Fetch beer data from the "Beers" sheet
 */
export async function getBeerDataFromSheets(): Promise<Record<string, any[]>> {
  try {
    const { sheetsClient } = await initializeSheetsClient();
    const sheetId = process.env.GOOGLE_SHEET_ID!;

    // Fetch data from the "Beers" sheet
    const response = await withRetry(async () => {
      return await sheetsClient.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Beers!A:E', // brewery_id, beer_name, beer_style, beer_abv, beer_availability
        valueRenderOption: 'UNFORMATTED_VALUE',
        dateTimeRenderOption: 'FORMATTED_STRING',
      });
    });

    const rows = response.data.values;
    if (!rows || rows.length < 2) {
      return {};
    }

    const headers = rows[0];
    const beerData: Record<string, any[]> = {};

    // Process each beer row
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const breweryId = row[0]?.toString().trim();
      if (!breweryId) continue;

      const beer = {
        name: row[1]?.toString().trim() || '',
        style: row[2]?.toString().trim() || '',
        abv: formatABV(row[3]?.toString().trim() || ''),
        availability: row[4]?.toString().trim() || '',
      };

      if (!beerData[breweryId]) {
        beerData[breweryId] = [];
      }
      beerData[breweryId].push(beer);
    }

    return beerData;
  } catch (error) {
    console.error('Error fetching beer data from Google Sheets:', error);
    return {};
  }
}

export async function getBreweryDataFromSheets(): Promise<Brewery[]> {
  const startTime = Date.now();
  console.log('Starting Google Sheets data fetch...');

  try {
    const { sheetsClient } = await initializeSheetsClient();
    const sheetId = process.env.GOOGLE_SHEET_ID!;

    // Fetch data with retry logic
    const response = await withRetry(async () => {
      return await sheetsClient.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'A:AP', // Get all columns up to AP (includes place_id, google_rating, etc.)
        valueRenderOption: 'UNFORMATTED_VALUE',
        dateTimeRenderOption: 'FORMATTED_STRING',
      });
    });

    const rows = response.data.values;
    if (!rows || rows.length < 2) {
      throw new Error('No data found in Google Sheets');
    }

    // Get headers and create column index map
    const headers = rows[0];
    const columnIndex = (headerName: string) => {
      const index = headers.findIndex((header: any) => 
        header?.toString().trim().toLowerCase() === headerName.toLowerCase()
      );
      return index >= 0 ? index : -1;
    };

    // Skip header row and process data
    const dataRows = rows.slice(1);
    const breweries: Brewery[] = [];

    console.log(`Processing ${dataRows.length} brewery records...`);

    for (let i = 0; i < dataRows.length; i++) {
      try {
        const row = dataRows[i];
        
        // Skip empty rows
        if (!row[0] || row[0].toString().trim() === '') continue;

        // Helper function to get column value safely
        const getColumn = (headerName: string) => {
          const index = columnIndex(headerName);
          return index >= 0 ? row[index] : undefined;
        };

        // Parse coordinates using dynamic lookup
        const latitude = getColumn('latitude') ? parseFloat(getColumn('latitude').toString()) : 0;
        const longitude = getColumn('longitude') ? parseFloat(getColumn('longitude').toString()) : 0;
        
        // Create raw data object for debugging
        const rawData: Record<string, any> = {};
        headers.forEach((header: string, index: number) => {
          if (header) {
            rawData[header.trim()] = row[index];
          }
        });

        const brewery: Brewery = {
          // Core identification
          id: getColumn('id')?.toString().trim() || `brewery-${i}`,
          name: getColumn('name')?.toString().trim() || 'Unknown Brewery',
          slug: generateSlug(getColumn('name')?.toString().trim() || 'unknown-brewery'),
          description: getColumn('description')?.toString().trim() || undefined,
          type: parseBreweryType(getColumn('type')),
          
          // Location information
          street: getColumn('street')?.toString().trim() || '',
          city: getColumn('city')?.toString().trim() || '',
          state: getColumn('state')?.toString().trim() || 'MD',
          zip: getColumn('zip')?.toString().trim() || '',
          county: getColumn('county')?.toString().trim() || '',
          latitude: latitude,
          longitude: longitude,
          
          // Contact information
          phone: getColumn('phone')?.toString().trim() || undefined,
          website: getColumn('website')?.toString().trim() || undefined,
          socialMedia: {
            facebook: getColumn('facebook')?.toString().trim() || undefined,
            instagram: getColumn('instagram')?.toString().trim() || undefined,
            twitter: getColumn('twitter')?.toString().trim() || undefined,
            untappd: getColumn('untappd')?.toString().trim() || undefined,
          },
          
          // Operating hours from individual day columns
          hours: {
            sunday: getColumn('hours_sunday')?.toString().trim() || undefined,
            monday: getColumn('hours_monday')?.toString().trim() || undefined,
            tuesday: getColumn('hours_tuesday')?.toString().trim() || undefined,
            wednesday: getColumn('hours_wednesday')?.toString().trim() || undefined,
            thursday: getColumn('hours_thursday')?.toString().trim() || undefined,
            friday: getColumn('hours_friday')?.toString().trim() || undefined,
            saturday: getColumn('hours_saturday')?.toString().trim() || undefined,
          },
          
          // Features and amenities
          amenities: parseCommaSeparated(getColumn('amenities')),
          allowsVisitors: parseBoolean(getColumn('allows_visitors')),
          offersTours: parseBoolean(getColumn('offers_tours')),
          beerToGo: parseBoolean(getColumn('beer_to_go')),
          hasMerch: parseBoolean(getColumn('has_merch')),
          memberships: parseMemberships(getColumn('memberships')),
          
          // Additional fields from Google Sheets
          food: getColumn('food')?.toString().trim() || undefined,
          otherDrinks: getColumn('other_drinks')?.toString().trim() || undefined,
          parking: getColumn('parking')?.toString().trim() || undefined,
          dogFriendly: parseBoolean(getColumn('dog_friendly')),
          outdoorSeating: parseBoolean(getColumn('outdoor_seating')),
          logo: getColumn('logo')?.toString().trim() || undefined,
          
          // Additional fields (add your new columns here)
          featured: parseBoolean(getColumn('featured')),
          specialEvents: parseCommaSeparated(getColumn('special_events')),
          awards: parseCommaSeparated(getColumn('awards')),
          certifications: parseCommaSeparated(getColumn('certifications')),
          
          // Metadata
          openedDate: getColumn('opened_date')?.toString().trim() || undefined,
          lastUpdated: new Date().toISOString(),
          
          // Raw data for debugging
          rawData: rawData,
        };

        breweries.push(brewery);
      } catch (error) {
        console.error(`Error processing brewery at row ${i + 2}:`, error);
        // Continue processing other breweries
      }
    }

    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`Successfully processed ${breweries.length} breweries in ${duration}ms`);
    
    return breweries;
  } catch (error) {
    console.error('Failed to fetch brewery data from Google Sheets:', error);
    throw error;
  }
}

/**
 * Test connection to Google Sheets
 */
export async function testSheetsConnection(): Promise<boolean> {
  try {
    const { sheetsClient } = await initializeSheetsClient();
    const sheetId = process.env.GOOGLE_SHEET_ID!;
    
    await sheetsClient.spreadsheets.get({
      spreadsheetId: sheetId,
    });
    
    console.log('Google Sheets connection test successful');
    return true;
  } catch (error) {
    console.error('Google Sheets connection test failed:', error);
    return false;
  }
}

/**
 * Get sheet metadata for debugging
 */
export async function getSheetMetadata() {
  try {
    const { sheetsClient } = await initializeSheetsClient();
    const sheetId = process.env.GOOGLE_SHEET_ID!;
    
    const response = await sheetsClient.spreadsheets.get({
      spreadsheetId: sheetId,
    });
    
    return {
      title: response.data.properties?.title,
      sheets: response.data.sheets?.map((sheet: any) => ({
        title: sheet.properties?.title,
        rowCount: sheet.properties?.gridProperties?.rowCount,
        columnCount: sheet.properties?.gridProperties?.columnCount,
      })),
    };
  } catch (error) {
    console.error('Failed to get sheet metadata:', error);
    throw error;
  }
}

/**
 * Check if email already exists in newsletter subscribers
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const { sheetsClient } = await initializeSheetsClient();
    const sheetId = process.env.GOOGLE_SHEET_ID!;
    
    // Get all emails from the Newsletter sheet
    const response = await sheetsClient.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Newsletter!A:A', // Column A contains emails
      valueRenderOption: 'UNFORMATTED_VALUE',
    });
    
    const emails = response.data.values?.flat() || [];
    const normalizedEmail = email.toLowerCase().trim();
    
    return emails.some((existingEmail: any) => 
      existingEmail?.toString().toLowerCase().trim() === normalizedEmail
    );
  } catch (error) {
    console.error('Error checking email existence:', error);
    return false; // If check fails, allow the signup (fail open)
  }
}

/**
 * Add newsletter subscriber to Google Sheets
 */
export async function addNewsletterSubscriber(email: string, metadata: any = {}) {
  try {
    // Check if email already exists
    const emailExists = await checkEmailExists(email);
    if (emailExists) {
      return { success: false, error: 'Email already subscribed' };
    }
    
    const { sheetsClient } = await initializeSheetsClient();
    const sheetId = process.env.GOOGLE_SHEET_ID!;
    
    const values = [
      [
        email.toLowerCase().trim(), // Normalize email
        new Date().toISOString(),
        metadata.ipAddress || '',
        metadata.userAgent || '',
        metadata.source || 'newsletter'
      ]
    ];
    
    await sheetsClient.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Newsletter!A:E',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: { values }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Failed to add newsletter subscriber:', error);
    throw error;
  }
}

/**
 * Google Review interface matching Places API response
 */
export interface GoogleReview {
  author_name: string;
  author_url?: string;
  language?: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

/**
 * Write reviews to Google Sheets Reviews sheet
 * Uses brewery.id to link reviews to breweries
 */
export async function writeReviewsToSheets(
  breweryId: string,
  breweryName: string,
  reviews: GoogleReview[]
): Promise<void> {
  try {
    const { sheetsClient } = await initializeSheetsClient();
    const sheetId = process.env.GOOGLE_SHEET_ID!;
    
    if (!reviews || reviews.length === 0) {
      return;
    }
    
    const fetchedAt = new Date().toISOString();
    
    // Prepare review rows
    const values = reviews.map(review => [
      breweryId,
      breweryName,
      review.author_name || '',
      review.rating || 0,
      review.text || '',
      review.relative_time_description || '',
      review.time || 0,
      review.author_url || '',
      review.profile_photo_url || '',
      review.language || 'en',
      fetchedAt
    ]);
    
    // Append reviews to Reviews sheet
    await withRetry(async () => {
      return await sheetsClient.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: 'Reviews!A:K', // brewery_id, brewery_name, reviewer_name, rating, review_text, review_date, review_timestamp, reviewer_url, profile_photo_url, language, fetched_at
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: { values }
      });
    });
    
    // Logging is handled by the calling script
  } catch (error) {
    console.error('Failed to write reviews to Google Sheets:', error);
    throw error;
  }
}

/**
 * Update review summary in main sheet
 * Finds brewery by id column and updates summary columns
 */
export async function updateReviewSummary(
  breweryId: string,
  breweryName: string,
  rating: number,
  ratingCount: number
): Promise<void> {
  try {
    const { sheetsClient } = await initializeSheetsClient();
    const sheetId = process.env.GOOGLE_SHEET_ID!;
    
    // First, get all data to find the row index
    const response = await withRetry(async () => {
      return await sheetsClient.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'A:AP', // Get all columns including new review columns
        valueRenderOption: 'UNFORMATTED_VALUE',
      });
    });
    
    const rows = response.data.values;
    if (!rows || rows.length < 2) {
      throw new Error('No data found in Google Sheets');
    }
    
    // Get headers and find column indices
    const headers = rows[0];
    const columnIndex = (headerName: string) => {
      const index = headers.findIndex((header: any) => 
        header?.toString().trim().toLowerCase() === headerName.toLowerCase()
      );
      return index >= 0 ? index : -1;
    };
    
    const idColIndex = columnIndex('id');
    if (idColIndex === -1) {
      throw new Error('Could not find "id" column in Google Sheets');
    }
    
    // Find the row with matching brewery ID
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      const rowId = rows[i][idColIndex]?.toString().trim();
      if (rowId === breweryId.toString().trim()) {
        rowIndex = i + 1; // Google Sheets uses 1-based indexing
        break;
      }
    }
    
    if (rowIndex === -1) {
      console.warn(`   ⚠️  Could not find brewery with ID ${breweryId} in Google Sheets`);
      return;
    }
    
    // Find or create column indices for review summary columns
    const placeIdColIndex = columnIndex('place_id');
    const ratingColIndex = columnIndex('google_rating');
    const ratingCountColIndex = columnIndex('google_rating_count');
    const lastUpdatedColIndex = columnIndex('google_reviews_last_updated');
    
    // Prepare updates
    const updates: Array<{ range: string; values: any[][] }> = [];
    const now = new Date().toISOString();
    
    // Helper function to convert column index to letter
    const indexToColumnLetter = (index: number): string => {
      if (index < 26) {
        return String.fromCharCode(65 + index);
      } else {
        const first = String.fromCharCode(64 + Math.floor(index / 26));
        const second = String.fromCharCode(65 + (index % 26));
        return first + second;
      }
    };
    
    // Update google_rating (column AM, index 38)
    if (ratingColIndex >= 0) {
      const colLetter = indexToColumnLetter(ratingColIndex);
      updates.push({
        range: `${colLetter}${rowIndex}:${colLetter}${rowIndex}`,
        values: [[rating > 0 ? rating.toString() : '']]
      });
    }
    
    // Update google_rating_count (column AN, index 39)
    if (ratingCountColIndex >= 0) {
      const colLetter = indexToColumnLetter(ratingCountColIndex);
      updates.push({
        range: `${colLetter}${rowIndex}:${colLetter}${rowIndex}`,
        values: [[ratingCount.toString()]]
      });
    }
    
    // Update google_reviews_last_updated (column AO, index 40)
    if (lastUpdatedColIndex >= 0) {
      const colLetter = indexToColumnLetter(lastUpdatedColIndex);
      updates.push({
        range: `${colLetter}${rowIndex}:${colLetter}${rowIndex}`,
        values: [[now]]
      });
    }
    
    // Batch update all columns
    if (updates.length > 0) {
      await withRetry(async () => {
        return await sheetsClient.spreadsheets.values.batchUpdate({
          spreadsheetId: sheetId,
          resource: {
            valueInputOption: 'RAW',
            data: updates.map(update => ({
              range: update.range,
              values: update.values
            }))
          }
        });
      });
    }
    
  } catch (error) {
    console.error('Failed to update review summary in Google Sheets:', error);
    throw error;
  }
}

/**
 * Store Place ID for a brewery
 * Updates place_id column in main sheet
 */
export async function storePlaceId(
  breweryId: string,
  placeId: string
): Promise<void> {
  try {
    const { sheetsClient } = await initializeSheetsClient();
    const sheetId = process.env.GOOGLE_SHEET_ID!;
    
    // First, get all data to find the row index
    const response = await withRetry(async () => {
      return await sheetsClient.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'A:AP', // Get all columns
        valueRenderOption: 'UNFORMATTED_VALUE',
      });
    });
    
    const rows = response.data.values;
    if (!rows || rows.length < 2) {
      throw new Error('No data found in Google Sheets');
    }
    
    // Get headers and find column indices
    const headers = rows[0];
    const columnIndex = (headerName: string) => {
      const index = headers.findIndex((header: any) => 
        header?.toString().trim().toLowerCase() === headerName.toLowerCase()
      );
      return index >= 0 ? index : -1;
    };
    
    const idColIndex = columnIndex('id');
    if (idColIndex === -1) {
      throw new Error('Could not find "id" column in Google Sheets');
    }
    
    // Find the row with matching brewery ID
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      const rowId = rows[i][idColIndex]?.toString().trim();
      if (rowId === breweryId.toString().trim()) {
        rowIndex = i + 1; // Google Sheets uses 1-based indexing
        break;
      }
    }
    
    if (rowIndex === -1) {
      console.warn(`   ⚠️  Could not find brewery with ID ${breweryId} in Google Sheets`);
      return;
    }
    
    // Helper function to convert column index to letter
    const indexToColumnLetter = (index: number): string => {
      if (index < 26) {
        return String.fromCharCode(65 + index);
      } else {
        const first = String.fromCharCode(64 + Math.floor(index / 26));
        const second = String.fromCharCode(65 + (index % 26));
        return first + second;
      }
    };
    
    // Find or create place_id column index
    let placeIdColIndex = columnIndex('place_id');
    
    // If place_id column doesn't exist, we'll use column AL (index 37)
    if (placeIdColIndex === -1) {
      placeIdColIndex = 37; // Column AL (0-based: A=0, B=1, ..., AL=37)
    }
    
    // Convert column index to letter
    const colLetter = indexToColumnLetter(placeIdColIndex);
    
    await withRetry(async () => {
      return await sheetsClient.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${colLetter}${rowIndex}:${colLetter}${rowIndex}`,
        valueInputOption: 'RAW',
        resource: {
          values: [[placeId]]
        }
      });
    });
    
  } catch (error) {
    console.error('Failed to store Place ID in Google Sheets:', error);
    throw error;
  }
}
