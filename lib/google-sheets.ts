/**
 * Google Sheets API Integration for Brewery Directory
 * Optimized for Vercel deployment with connection pooling and timeout handling
 */

import { google } from 'googleapis';
import { Brewery, BreweryType, Membership, SocialMedia, OperatingHours } from '@/types/brewery';

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
 * Parse operating hours from individual day columns
 */
function parseOperatingHours(row: any[]): OperatingHours {
  return {
    sunday: row[15]?.toString().trim() || undefined,
    monday: row[16]?.toString().trim() || undefined,
    tuesday: row[17]?.toString().trim() || undefined,
    wednesday: row[18]?.toString().trim() || undefined,
    thursday: row[19]?.toString().trim() || undefined,
    friday: row[20]?.toString().trim() || undefined,
    saturday: row[21]?.toString().trim() || undefined,
  };
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
 * Parse boolean values from string
 */
function parseBoolean(value: string | undefined): boolean {
  if (!value) return false;
  const lowerValue = value.toLowerCase().trim();
  return lowerValue === 'true' || lowerValue === 'yes' || lowerValue === '1';
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
 * Parse coordinates from string
 */
function parseCoordinates(latString: string | undefined, lngString: string | undefined): { latitude: number; longitude: number } {
  const latitude = latString ? parseFloat(latString) : 0;
  const longitude = lngString ? parseFloat(lngString) : 0;
  
  return { latitude, longitude };
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

    // Skip header row and process data
    const dataRows = rows.slice(1);
    const breweries: Brewery[] = [];

    console.log(`Processing ${dataRows.length} brewery records...`);

    for (let i = 0; i < dataRows.length; i++) {
      try {
        const row = dataRows[i];
        
        // Skip empty rows
        if (!row[0] || row[0].toString().trim() === '') continue;

        const coordinates = parseCoordinates(row[10], row[11]);
        
        const brewery: Brewery = {
          // Core identification
          id: row[0]?.toString().trim() || `brewery-${i}`,
          name: row[1]?.toString().trim() || 'Unknown Brewery',
          slug: generateSlug(row[1]?.toString().trim() || 'unknown-brewery'),
          description: row[2]?.toString().trim() || undefined,
          type: parseBreweryType(row[3]),
          
          // Location information
          street: row[4]?.toString().trim() || '',
          city: row[5]?.toString().trim() || '',
          state: row[6]?.toString().trim() || 'MD',
          zip: row[7]?.toString().trim() || '',
          county: row[8]?.toString().trim() || '',
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          
          // Contact information
          phone: row[9]?.toString().trim() || undefined,
          website: row[12]?.toString().trim() || undefined,
          socialMedia: parseSocialMedia(row[13]),
          
          // Operating hours
          hours: parseOperatingHours(row),
          
          // Features and amenities
          amenities: parseCommaSeparated(row[22]),
          allowsVisitors: parseBoolean(row[23]),
          offersTours: parseBoolean(row[24]),
          beerToGo: parseBoolean(row[25]),
          hasMerch: parseBoolean(row[26]),
          memberships: parseMemberships(row[27]),
          
          // Metadata
          openedDate: row[28]?.toString().trim() || undefined,
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
