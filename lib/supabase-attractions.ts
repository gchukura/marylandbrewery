/**
 * Supabase Attractions Client Functions
 * Provides functions for querying and managing Maryland attractions
 */

import { supabase, supabaseAdmin, DatabaseAttraction } from './supabase';

/**
 * Application-level Attraction type (camelCase)
 */
export interface Attraction {
  id?: string;
  placeId: string;
  name: string;
  slug: string;
  type: string;
  googleTypes?: string[];
  street?: string;
  city: string;
  state: string;
  zip?: string;
  county?: string;
  latitude: number;
  longitude: number;
  description?: string;
  phone?: string;
  website?: string;
  rating?: number;
  ratingCount?: number;
  priceLevel?: number;
  hours?: Record<string, string>;
  photos?: string[];
  lastUpdated?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Convert database attraction to application attraction type
 */
function dbAttractionToAttraction(dbAttraction: DatabaseAttraction): Attraction {
  return {
    id: dbAttraction.id,
    placeId: dbAttraction.place_id,
    name: dbAttraction.name,
    slug: dbAttraction.slug,
    type: dbAttraction.type,
    googleTypes: dbAttraction.google_types || [],
    street: dbAttraction.street,
    city: dbAttraction.city,
    state: dbAttraction.state,
    zip: dbAttraction.zip,
    county: dbAttraction.county,
    latitude: dbAttraction.latitude,
    longitude: dbAttraction.longitude,
    description: dbAttraction.description,
    phone: dbAttraction.phone,
    website: dbAttraction.website,
    rating: dbAttraction.rating,
    ratingCount: dbAttraction.rating_count,
    priceLevel: dbAttraction.price_level,
    hours: dbAttraction.hours || {},
    photos: dbAttraction.photos || [],
    lastUpdated: dbAttraction.last_updated,
    createdAt: dbAttraction.created_at,
    updatedAt: dbAttraction.updated_at,
  };
}

/**
 * Convert application attraction to database attraction type
 */
function attractionToDbAttraction(attraction: Attraction): DatabaseAttraction {
  return {
    id: attraction.id,
    place_id: attraction.placeId,
    name: attraction.name,
    slug: attraction.slug,
    type: attraction.type,
    google_types: attraction.googleTypes || [],
    street: attraction.street,
    city: attraction.city,
    state: attraction.state,
    zip: attraction.zip,
    county: attraction.county,
    latitude: attraction.latitude,
    longitude: attraction.longitude,
    description: attraction.description,
    phone: attraction.phone,
    website: attraction.website,
    rating: attraction.rating,
    rating_count: attraction.ratingCount,
    price_level: attraction.priceLevel,
    hours: attraction.hours || {},
    photos: attraction.photos || [],
    last_updated: attraction.lastUpdated,
    created_at: attraction.createdAt,
    updated_at: attraction.updatedAt,
  };
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in miles
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

/**
 * Get nearby attractions using PostGIS (if enabled)
 * Falls back to client-side calculation if PostGIS is not available
 */
export async function getAttractionsNearBrewery(
  latitude: number,
  longitude: number,
  radiusKm: number = 5,
  limit: number = 10,
  type?: string
): Promise<Attraction[]> {
  try {
    // Convert km to meters (PostGIS uses meters)
    const radiusMeters = radiusKm * 1000;

    // Use PostGIS if available, otherwise fetch all and filter client-side
    let data: (DatabaseAttraction & { distance_meters?: number })[] | null = null;
    let error: any = null;
    
    try {
      const result = await supabase.rpc('get_nearby_attractions', {
        lat: latitude,
        lng: longitude,
        radius_meters: radiusMeters,
        attraction_type: type || null,
      });
      data = result.data;
      error = result.error;
    } catch (rpcError) {
      // RPC function doesn't exist, fall through to client-side filtering
      error = rpcError;
    }

    if (error) {
      // If RPC doesn't exist, fetch all and filter client-side
      let query = supabase.from('maryland_attractions').select('*');
      
      // Apply type filter if specified
      if (type) {
        query = query.eq('type', type);
      }
      
      const { data: allAttractions } = await query;
      if (!allAttractions) return [];

      // Convert km to miles for client-side calculation
      const radiusMiles = radiusKm * 0.621371;

      // Filter by distance
      const filtered = allAttractions
        .map((attraction: DatabaseAttraction) => {
          const distance = calculateDistance(
            latitude,
            longitude,
            attraction.latitude,
            attraction.longitude
          );
          return { attraction, distance };
        })
        .filter((item) => item.distance <= radiusMiles)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit)
        .map((item) => dbAttractionToAttraction(item.attraction));

      return filtered;
    }

    if (!data) {
      return [];
    }

    // Convert distance from meters to miles and sort
    const attractions = data
      .map((dbAttraction) => {
        const attraction = dbAttractionToAttraction(dbAttraction);
        return {
          attraction,
          distance: dbAttraction.distance_meters ? dbAttraction.distance_meters / 1609.34 : 0,
        };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)
      .map((item) => item.attraction);

    return attractions;
  } catch (error) {
    console.error('Error fetching nearby attractions:', error);
    return [];
  }
}

/**
 * Get attractions by city
 */
export async function getAttractionsByCity(city: string, limit: number = 50): Promise<Attraction[]> {
  try {
    const { data, error } = await supabase
      .from('maryland_attractions')
      .select('*')
      .eq('city', city)
      .limit(limit);

    if (error) {
      console.error('Error fetching attractions by city:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    return data.map((dbAttraction: DatabaseAttraction) => dbAttractionToAttraction(dbAttraction));
  } catch (error) {
    console.error('Error fetching attractions by city:', error);
    return [];
  }
}

/**
 * Get attractions by type
 */
export async function getAttractionsByType(type: string, limit: number = 50): Promise<Attraction[]> {
  try {
    const { data, error } = await supabase
      .from('maryland_attractions')
      .select('*')
      .eq('type', type)
      .limit(limit);

    if (error) {
      console.error('Error fetching attractions by type:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    return data.map((dbAttraction: DatabaseAttraction) => dbAttractionToAttraction(dbAttraction));
  } catch (error) {
    console.error('Error fetching attractions by type:', error);
    return [];
  }
}

/**
 * Upsert attraction (insert or update) for syncing from Google Places
 */
export async function upsertAttraction(attraction: Attraction): Promise<Attraction | null> {
  try {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available');
    }

    const dbAttraction = attractionToDbAttraction(attraction);
    
    // Set updated_at timestamp
    dbAttraction.updated_at = new Date().toISOString();

    // If no id, set created_at
    if (!dbAttraction.id) {
      dbAttraction.created_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from('maryland_attractions')
      .upsert(dbAttraction, {
        onConflict: 'place_id',
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting attraction:', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    return dbAttractionToAttraction(data);
  } catch (error) {
    console.error('Error upserting attraction:', error);
    throw error;
  }
}

/**
 * Get attraction by slug
 */
export async function getAttractionBySlug(slug: string): Promise<Attraction | null> {
  try {
    const { data, error } = await supabase
      .from('maryland_attractions')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return null;
    }

    return dbAttractionToAttraction(data);
  } catch (error) {
    console.error('Error fetching attraction by slug:', error);
    return null;
  }
}

/**
 * Get attraction by place_id
 */
export async function getAttractionByPlaceId(placeId: string): Promise<Attraction | null> {
  try {
    const { data, error } = await supabase
      .from('maryland_attractions')
      .select('*')
      .eq('place_id', placeId)
      .single();

    if (error || !data) {
      return null;
    }

    return dbAttractionToAttraction(data);
  } catch (error) {
    console.error('Error fetching attraction by place_id:', error);
    return null;
  }
}

