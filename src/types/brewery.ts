/**
 * Brewery Directory TypeScript Types
 * Comprehensive types for a brewery directory with 500+ programmatically generated pages
 */

/**
 * Social media links for a brewery
 */
export interface SocialMedia {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  untappd?: string;
  beerAdvocate?: string;
  rateBeer?: string;
}

/**
 * Beer information
 */
export interface Beer {
  name: string;
  style: string;
  abv: string;
  availability: string;
}

/**
 * Operating hours for each day of the week
 */
export interface OperatingHours {
  sunday?: string;
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
}

/**
 * Membership information
 */
export interface Membership {
  name: string;
  description?: string;
  benefits?: string[];
  price?: number;
  duration?: string; // e.g., "annual", "monthly"
}

/**
 * Site statistics for analytics and display
 */
export interface SiteStatistics {
  totalBreweries: number;
  totalCities: number;
  totalCounties: number;
  breweriesByType: Record<string, number>;
  breweriesByCounty: Record<string, number>;
  averageBreweriesPerCity: number;
  newestBrewery?: string;
  oldestBrewery?: string;
  lastUpdated: string;
}

/**
 * Review theme analysis result for a single theme category
 */
export interface ThemeResult {
  detected: boolean;
  score: number;
  keywords: string[];
  matchCount: number;
}

/**
 * Amenities extracted from reviews
 */
export interface ReviewAmenities {
  allows_visitors: boolean;
  offers_tours: boolean;
  beer_to_go: boolean;
  has_merch: boolean;
  dog_friendly: boolean;
  outdoor_seating: boolean;
  food: string | null; // "In-House", "Food Trucks", or null
  other_drinks: string; // "yes" or "no"
  parking: string; // "yes" or "no"
}

/**
 * Complete review themes object stored in breweries.review_themes
 */
export interface ReviewThemes {
  beer_quality: ThemeResult;
  food_menu: ThemeResult;
  service_staff: ThemeResult;
  atmosphere: ThemeResult;
  amenities: ReviewAmenities;
  last_analyzed: string;
  review_count_analyzed: number;
}

/**
 * Main Brewery interface containing all fields from Google Sheets
 */
export interface Brewery {
  // Core identification
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: string[]; // normalized: always an array, e.g. ['Microbrewery', 'Taproom']
  
  // Location information
  street: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  latitude: number;
  longitude: number;
  
  // Contact information
  phone?: string;
  website?: string;
  socialMedia: SocialMedia;
  
  // Operating hours
  hours: OperatingHours;
  
  // Features and amenities
  amenities: string[];
  allowsVisitors: boolean;
  offersTours: boolean;
  beerToGo: boolean;
  hasMerch: boolean;
  memberships: Membership[];
  
  // Beer information
  beers?: Beer[];
  
  // Articles
  
  // Additional fields from Google Sheets
  food?: string;
  otherDrinks?: string;
  parking?: string;
  dogFriendly?: boolean;
  outdoorSeating?: boolean;
  logo?: string;
  photoUrl?: string;
  photos?: string[]; // Array of photo paths
  
  // Additional fields (add your new columns here)
  featured?: boolean;
  specialEvents?: string[];
  awards?: string[];
  certifications?: string[];
  
  // Metadata
  openedDate?: string;
  lastUpdated: string;
  /** When data:verify-hours last found these hours matching Google's (cleared when hours change) */
  hoursVerifiedAt?: string;
  
  // Google Reviews summary
  googleRating?: number;
  googleRatingCount?: number;
  googleReviewsLastUpdated?: string;
  placeId?: string;
  
  // Yelp Reviews summary
  yelpBusinessId?: string;
  yelpRating?: number;
  yelpRatingCount?: number;
  yelpReviewsLastUpdated?: string;
  
  // Review themes (extracted from reviews)
  reviewThemes?: ReviewThemes;
  
  // Raw data for debugging
}

/**
 * Processed brewery data with organized collections for efficient querying
 * This structure supports fast lookups for generating pages programmatically
 */
export interface ProcessedBreweryData {
  // Raw brewery data
  breweries: Brewery[];
  
  // Organized collections for fast lookups
  byCity: Map<string, Brewery[]>;
  byCounty: Map<string, Brewery[]>;
  byType: Map<string, Brewery[]>;
  byAmenity: Map<string, Brewery[]>;
  
  // Unique values for filtering and navigation
  cities: string[];
  counties: string[]; // All 24 Maryland counties
  amenities: string[];
  types: string[];
  
  // Site statistics
  stats: SiteStatistics;
}

/**
 * Maryland counties for reference and validation
 */
export const MARYLAND_COUNTIES = [
  'Allegany',
  'Anne Arundel',
  'Baltimore',
  'Baltimore City',
  'Calvert',
  'Caroline',
  'Carroll',
  'Cecil',
  'Charles',
  'Dorchester',
  'Frederick',
  'Garrett',
  'Harford',
  'Howard',
  'Kent',
  'Montgomery',
  'Prince George\'s',
  'Queen Anne\'s',
  'Somerset',
  'St. Mary\'s',
  'Talbot',
  'Washington',
  'Wicomico',
  'Worcester'
] as const;

