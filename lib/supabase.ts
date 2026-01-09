/**
 * Supabase Client Configuration
 * Replaces Google Sheets as the primary data source
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Brewery, Beer } from '../src/types/brewery';

// Lazy initialization of Supabase clients
let supabaseClient: SupabaseClient | null = null;
let supabaseAdminClient: SupabaseClient | null | undefined = undefined;

function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
}

function getSupabaseAdminClient(): SupabaseClient | null {
  if (supabaseAdminClient === undefined) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      supabaseAdminClient = null;
      return null;
    }

    if (supabaseServiceKey) {
      supabaseAdminClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    } else {
      supabaseAdminClient = null;
    }
  }
  return supabaseAdminClient;
}

// Client for public operations (uses anon key) - lazy loaded via getter
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = client[prop as keyof SupabaseClient];
    // If it's a function, bind it to the client
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
}) as SupabaseClient;

// Admin client for server-side operations (uses service role key) - lazy loaded via getter
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseAdminClient();
    if (!client) {
      // Return a no-op function or null for methods
      if (typeof prop === 'string' && prop in {}) {
        return () => null;
      }
      return null;
    }
    const value = client[prop as keyof SupabaseClient];
    // If it's a function, bind it to the client
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
}) as SupabaseClient | null;

/**
 * Database Types (matching Supabase schema)
 */

export interface DatabaseBrewery {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: string | string[]; // Stored as JSONB in Supabase
  
  // Location
  street: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  latitude: number;
  longitude: number;
  
  // Contact
  phone?: string;
  website?: string;
  social_media?: Record<string, string>; // JSONB
  
  // Hours (stored as JSONB)
  hours?: {
    sunday?: string;
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
  };
  
  // Features
  amenities?: string[]; // JSONB array
  allows_visitors?: boolean;
  offers_tours?: boolean;
  beer_to_go?: boolean;
  has_merch?: boolean;
  memberships?: Array<{
    name: string;
    description?: string;
    benefits?: string[];
    price?: number;
    duration?: string;
  }>; // JSONB array
  
  // Additional fields
  food?: string;
  other_drinks?: string;
  parking?: string;
  dog_friendly?: boolean;
  outdoor_seating?: boolean;
  logo?: string;
  photo_url?: string;
  photos?: string[]; // Array of photo paths (e.g., ["/photos/brewery-1.jpg"])
  featured?: boolean;
  special_events?: string[]; // JSONB array
  awards?: string[]; // JSONB array
  certifications?: string[]; // JSONB array
  
  // Metadata
  opened_date?: string;
  
  // Google Reviews summary
  google_rating?: number;
  google_rating_count?: number;
  google_reviews_last_updated?: string;
  place_id?: string;
  
  // Yelp Reviews summary
  yelp_business_id?: string;
  yelp_rating?: number;
  yelp_rating_count?: number;
  yelp_reviews_last_updated?: string;
  
  // Review themes (extracted from reviews)
  review_themes?: Record<string, any>; // JSONB - ReviewThemes structure
  
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseBeer {
  id?: string;
  brewery_id: string;
  name: string;
  style: string;
  abv: string;
  availability: string;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseNewsletterSubscriber {
  id?: string;
  email: string;
  subscribed_at?: string;
  ip_address?: string;
  user_agent?: string;
  source?: string;
}

export interface DatabaseAttraction {
  id?: string;
  place_id: string;
  name: string;
  slug: string;
  type: string;
  google_types?: string[];
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
  rating_count?: number;
  price_level?: number;
  hours?: Record<string, string>;
  photos?: string[];
  last_updated?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseNeighborhood {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  city?: string;
  county?: string;
  state: string;
  url?: string;
  homes_url?: string;
  latitude?: number;
  longitude?: number;
  place_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseBreweryArticle {
  id?: string;
  brewery_id: string;
  title: string;
  description?: string;
  url: string;
  source?: string;
  author?: string;
  image_url?: string;
  published_at?: string;
  fetched_at?: string;
  relevance_score?: number;
  created_at?: string;
  updated_at?: string;
}

