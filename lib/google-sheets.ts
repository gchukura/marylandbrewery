/**
 * Google Sheets API Integration for Brewery Directory
 * Optimized for Vercel deployment with connection pooling and timeout handling
 */

import { google } from 'googleapis';
import { Brewery, BreweryType, Membership, SocialMedia, OperatingHours } from '../types/brewery';

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
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
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
 * Parse brewery type from string
 */
function parseBreweryType(typeString: string | undefined): BreweryType {
  if (!typeString) return BreweryType.MICROBREWERY;
  
  const type = typeString.toLowerCase().trim();
  switch (type) {
    case 'microbrewery':
    case 'micro':
      return BreweryType.MICROBREWERY;
    case 'brewpub':
    case 'brew pub':
      return BreweryType.BREWPUB;
    case 'taproom':
    case 'tap room':
      return BreweryType.TAPROOM;
    case 'production':
      return BreweryType.PRODUCTION;
    case 'nano':
    case 'nanobrewery':
      return BreweryType.NANO;
    case 'regional':
      return BreweryType.REGIONAL;
    default:
      return BreweryType.MICROBREWERY;
  }
}


/**
 * Main function to fetch brewery data from Google Sheets
 * Optimized for Vercel with timeout handling and retry logic
 */
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
        range: 'A:Z', // Get all columns
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
        header?.toString().toLowerCase().includes(headerName.toLowerCase())
      );
      return index >= 0 ? index : -1;
    };

    // Skip header row and process data
    const dataRows = rows.slice(1);
    const breweries: Brewery[] = [];

    console.log(`Processing ${dataRows.length} brewery records...`);
    console.log('Column mapping:', {
      id: columnIndex('id'),
      name: columnIndex('name'),
      phone: columnIndex('phone'),
      latitude: columnIndex('latitude'),
      longitude: columnIndex('longitude'),
      website: columnIndex('website'),
      amenities: columnIndex('amenities'),
    });

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
          socialMedia: parseSocialMedia(getColumn('facebook') || getColumn('instagram') || getColumn('twitter')),
          
          // Operating hours (will be empty for now, can be enhanced later)
          hours: {
            sunday: undefined,
            monday: undefined,
            tuesday: undefined,
            wednesday: undefined,
            thursday: undefined,
            friday: undefined,
            saturday: undefined,
          },
          
          // Features and amenities
          amenities: parseCommaSeparated(getColumn('amenities')),
          allowsVisitors: parseBoolean(getColumn('allows_visitors')),
          offersTours: parseBoolean(getColumn('offers_tours')),
          beerToGo: parseBoolean(getColumn('beer_to_go')),
          hasMerch: parseBoolean(getColumn('has_merch')),
          memberships: parseMemberships(getColumn('memberships')),
          
          // Metadata
          openedDate: getColumn('opened_date')?.toString().trim() || undefined,
          lastUpdated: new Date().toISOString(),
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
