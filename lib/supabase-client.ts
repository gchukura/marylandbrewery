/**
 * Supabase Client Functions
 * Replaces Google Sheets API integration
 * Provides the same interface as google-sheets.ts but uses Supabase
 */

import { supabase, supabaseAdmin, DatabaseBrewery, DatabaseBeer, DatabaseNewsletterSubscriber } from './supabase';
import { Brewery, Beer, SocialMedia, OperatingHours, Membership } from '../src/types/brewery';

/**
 * Convert database brewery to application brewery type
 */
function dbBreweryToBrewery(dbBrewery: DatabaseBrewery, beers: Beer[] = []): Brewery {
  return {
    id: dbBrewery.id,
    name: dbBrewery.name,
    slug: dbBrewery.slug,
    description: dbBrewery.description,
    type: dbBrewery.type || 'Microbrewery',
    
    // Location
    street: dbBrewery.street,
    city: dbBrewery.city,
    state: dbBrewery.state,
    zip: dbBrewery.zip,
    county: dbBrewery.county,
    latitude: dbBrewery.latitude,
    longitude: dbBrewery.longitude,
    
    // Contact
    phone: dbBrewery.phone,
    website: dbBrewery.website,
    socialMedia: (dbBrewery.social_media || {}) as SocialMedia,
    
    // Hours
    hours: (dbBrewery.hours || {}) as OperatingHours,
    
    // Features
    amenities: dbBrewery.amenities || [],
    allowsVisitors: dbBrewery.allows_visitors || false,
    offersTours: dbBrewery.offers_tours || false,
    beerToGo: dbBrewery.beer_to_go || false,
    hasMerch: dbBrewery.has_merch || false,
    memberships: (dbBrewery.memberships || []) as Membership[],
    
    // Additional fields
    food: dbBrewery.food,
    otherDrinks: dbBrewery.other_drinks,
    parking: dbBrewery.parking,
    dogFriendly: dbBrewery.dog_friendly || false,
    outdoorSeating: dbBrewery.outdoor_seating || false,
    logo: dbBrewery.logo,
    featured: dbBrewery.featured || false,
    specialEvents: dbBrewery.special_events || [],
    awards: dbBrewery.awards || [],
    certifications: dbBrewery.certifications || [],
    
    // Metadata
    openedDate: dbBrewery.opened_date,
    lastUpdated: dbBrewery.updated_at || new Date().toISOString(),
    
    // Beer data
    beers: beers.length > 0 ? beers : undefined,
  };
}

/**
 * Convert application brewery to database brewery type
 */
function breweryToDbBrewery(brewery: Brewery): DatabaseBrewery {
  return {
    id: brewery.id,
    name: brewery.name,
    slug: brewery.slug,
    description: brewery.description,
    type: brewery.type,
    
    // Location
    street: brewery.street,
    city: brewery.city,
    state: brewery.state,
    zip: brewery.zip,
    county: brewery.county,
    latitude: brewery.latitude,
    longitude: brewery.longitude,
    
    // Contact
    phone: brewery.phone,
    website: brewery.website,
    social_media: brewery.socialMedia as Record<string, string>,
    
    // Hours
    hours: brewery.hours,
    
    // Features
    amenities: brewery.amenities,
    allows_visitors: brewery.allowsVisitors,
    offers_tours: brewery.offersTours,
    beer_to_go: brewery.beerToGo,
    has_merch: brewery.hasMerch,
    memberships: brewery.memberships,
    
    // Additional fields
    food: brewery.food,
    other_drinks: brewery.otherDrinks,
    parking: brewery.parking,
    dog_friendly: brewery.dogFriendly,
    outdoor_seating: brewery.outdoorSeating,
    logo: brewery.logo,
    featured: brewery.featured,
    special_events: brewery.specialEvents,
    awards: brewery.awards,
    certifications: brewery.certifications,
    
    // Metadata
    opened_date: brewery.openedDate,
  };
}

/**
 * Fetch all brewery data from Supabase
 */
export async function getBreweryDataFromSupabase(): Promise<Brewery[]> {
  const startTime = Date.now();

  try {
    // Fetch breweries
    const { data: breweriesData, error: breweriesError } = await supabase
      .from('breweries')
      .select('*')
      .order('name');

    if (breweriesError) {
      throw new Error(`Failed to fetch breweries: ${breweriesError.message}`);
    }

    if (!breweriesData || breweriesData.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('No breweries found in Supabase');
      }
      return [];
    }

    // Fetch all beers
    const { data: beersData, error: beersError } = await supabase
      .from('beers')
      .select('*');

    if (beersError && process.env.NODE_ENV === 'development') {
      console.warn(`Failed to fetch beers: ${beersError.message}`);
    }

    // Group beers by brewery_id
    const beersByBrewery = new Map<string, Beer[]>();
    if (beersData) {
      beersData.forEach((beer: DatabaseBeer) => {
        if (!beersByBrewery.has(beer.brewery_id)) {
          beersByBrewery.set(beer.brewery_id, []);
        }
        beersByBrewery.get(beer.brewery_id)!.push({
          name: beer.name,
          style: beer.style || '',
          abv: beer.abv || '',
          availability: beer.availability || '',
        });
      });
    }

    // Convert database breweries to application breweries
    const breweries: Brewery[] = breweriesData.map((dbBrewery: DatabaseBrewery) => {
      const beers = beersByBrewery.get(dbBrewery.id) || [];
      return dbBreweryToBrewery(dbBrewery, beers);
    });

    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Only log in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log(`Successfully fetched ${breweries.length} breweries from Supabase in ${duration}ms`);
    }

    return breweries;
  } catch (error) {
    console.error('Failed to fetch brewery data from Supabase:', error);
    throw error;
  }
}

/**
 * Fetch beer data from Supabase
 * Returns a map of brewery_id to beers array
 */
export async function getBeerDataFromSupabase(): Promise<Record<string, Beer[]>> {
  try {
    const { data: beersData, error } = await supabase
      .from('beers')
      .select('*');

    if (error) {
      console.error('Error fetching beer data from Supabase:', error);
      return {};
    }

    if (!beersData) {
      return {};
    }

    const beerData: Record<string, Beer[]> = {};

    beersData.forEach((beer: DatabaseBeer) => {
      if (!beerData[beer.brewery_id]) {
        beerData[beer.brewery_id] = [];
      }
      beerData[beer.brewery_id].push({
        name: beer.name,
        style: beer.style || '',
        abv: beer.abv || '',
        availability: beer.availability || '',
      });
    });

    return beerData;
  } catch (error) {
    console.error('Error fetching beer data from Supabase:', error);
    return {};
  }
}

/**
 * Check if email already exists in newsletter subscribers
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('email', normalizedEmail)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking email existence:', error);
      return false; // Fail open
    }

    return !!data;
  } catch (error) {
    console.error('Error checking email existence:', error);
    return false; // Fail open
  }
}

/**
 * Add newsletter subscriber to Supabase
 */
export async function addNewsletterSubscriber(email: string, metadata: any = {}) {
  try {
    // Check if email already exists
    const emailExists = await checkEmailExists(email);
    if (emailExists) {
      return { success: false, error: 'Email already subscribed' };
    }

    const normalizedEmail = email.toLowerCase().trim();

    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: normalizedEmail,
        ip_address: metadata.ipAddress || '',
        user_agent: metadata.userAgent || '',
        source: metadata.source || 'newsletter',
      });

    if (error) {
      // Check if it's a unique constraint violation (duplicate email)
      if (error.code === '23505') {
        return { success: false, error: 'Email already subscribed' };
      }
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to add newsletter subscriber:', error);
    throw error;
  }
}

/**
 * Test connection to Supabase
 */
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('breweries')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }

    console.log('Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
}

/**
 * Get brewery by ID
 */
export async function getBreweryById(id: string): Promise<Brewery | null> {
  try {
    const { data: breweryData, error } = await supabase
      .from('breweries')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !breweryData) {
      return null;
    }

    // Fetch beers for this brewery
    const { data: beersData } = await supabase
      .from('beers')
      .select('*')
      .eq('brewery_id', id);

    const beers: Beer[] = (beersData || []).map((beer: DatabaseBeer) => ({
      name: beer.name,
      style: beer.style || '',
      abv: beer.abv || '',
      availability: beer.availability || '',
    }));

    return dbBreweryToBrewery(breweryData, beers);
  } catch (error) {
    console.error('Error fetching brewery by ID:', error);
    return null;
  }
}

/**
 * Get brewery by slug
 */
export async function getBreweryBySlug(slug: string): Promise<Brewery | null> {
  try {
    const { data: breweryData, error } = await supabase
      .from('breweries')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !breweryData) {
      return null;
    }

    // Fetch beers for this brewery
    const { data: beersData } = await supabase
      .from('beers')
      .select('*')
      .eq('brewery_id', breweryData.id);

    const beers: Beer[] = (beersData || []).map((beer: DatabaseBeer) => ({
      name: beer.name,
      style: beer.style || '',
      abv: beer.abv || '',
      availability: beer.availability || '',
    }));

    return dbBreweryToBrewery(breweryData, beers);
  } catch (error) {
    console.error('Error fetching brewery by slug:', error);
    return null;
  }
}

/**
 * Search breweries using full-text search
 */
export async function searchBreweries(query: string): Promise<Brewery[]> {
  try {
    const { data, error } = await supabase
      .from('breweries')
      .select('*')
      .textSearch('name,description', query, {
        type: 'websearch',
        config: 'english',
      })
      .limit(50);

    if (error) {
      console.error('Error searching breweries:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    return data.map((dbBrewery: DatabaseBrewery) => dbBreweryToBrewery(dbBrewery));
  } catch (error) {
    console.error('Error searching breweries:', error);
    return [];
  }
}

/**
 * Get nearby breweries using PostGIS (if enabled)
 * Falls back to client-side calculation if PostGIS is not available
 */
export async function getNearbyBreweries(
  latitude: number,
  longitude: number,
  radiusMiles: number = 10
): Promise<Brewery[]> {
  try {
    // Convert miles to meters (PostGIS uses meters)
    const radiusMeters = radiusMiles * 1609.34;

    // Use PostGIS if available, otherwise fetch all and filter client-side
    let data: DatabaseBrewery[] | null = null;
    let error: any = null;
    
    try {
      const result = await supabase.rpc('get_nearby_breweries', {
        lat: latitude,
        lng: longitude,
        radius_meters: radiusMeters,
      });
      data = result.data;
      error = result.error;
    } catch (rpcError) {
      // RPC function doesn't exist, fall through to client-side filtering
      error = rpcError;
    }

    if (error) {
      // If RPC doesn't exist, fetch all and filter client-side
      const { data: allBreweries } = await supabase.from('breweries').select('*');
      if (!allBreweries) return [];

      // Filter by distance
      return allBreweries
        .map((dbBrewery: DatabaseBrewery) => {
          const distance = calculateDistance(
            latitude,
            longitude,
            dbBrewery.latitude,
            dbBrewery.longitude
          );
          return { brewery: dbBrewery, distance };
        })
        .filter((item) => item.distance <= radiusMiles)
        .sort((a, b) => a.distance - b.distance)
        .map((item) => dbBreweryToBrewery(item.brewery));
    }

    if (!data) {
      return [];
    }

    return data.map((dbBrewery: DatabaseBrewery) => dbBreweryToBrewery(dbBrewery));
  } catch (error) {
    console.error('Error fetching nearby breweries:', error);
    return [];
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

