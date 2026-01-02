/**
 * Brewery Content Utilities
 * Functions for generating dynamic About section content using stored review themes
 */

import { ReviewThemes, Beer } from '@/types/brewery';
import { getBreweryDataFromSupabase } from '../../lib/supabase-client';

// ============================================
// LOCATION HELPERS
// ============================================

const MAJOR_CITIES = [
  'baltimore',
  'annapolis',
  'frederick',
  'rockville',
  'gaithersburg',
  'columbia',
  'silver spring',
  'towson',
  'bethesda',
  'ellicott city',
  'westminster',
  'cumberland',
  'hagerstown',
  'salisbury',
  'ocean city',
];

const MAJOR_CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  baltimore: { lat: 39.2904, lng: -76.6122 },
  annapolis: { lat: 38.9784, lng: -76.4922 },
  frederick: { lat: 39.4143, lng: -77.4105 },
  rockville: { lat: 39.0840, lng: -77.1528 },
  gaithersburg: { lat: 39.1434, lng: -77.2014 },
  columbia: { lat: 39.2037, lng: -76.8610 },
  'silver spring': { lat: 38.9907, lng: -77.0261 },
  towson: { lat: 39.4015, lng: -76.6019 },
  bethesda: { lat: 38.9847, lng: -77.0947 },
  'ellicott city': { lat: 39.2673, lng: -76.7983 },
  westminster: { lat: 39.5754, lng: -76.9958 },
  cumberland: { lat: 39.6529, lng: -78.7575 },
  hagerstown: { lat: 39.6418, lng: -77.7200 },
  salisbury: { lat: 38.3607, lng: -75.5994 },
  'ocean city': { lat: 38.3365, lng: -75.0849 },
};

/**
 * Check if a city is a major city in Maryland
 */
export async function isMajorCity(city: string): Promise<boolean> {
  const cityLower = city.toLowerCase().trim();
  return MAJOR_CITIES.includes(cityLower);
}

/**
 * Find the nearest major city to given coordinates
 */
export async function findNearestMajorCity(
  latitude: number,
  longitude: number,
  currentCity: string
): Promise<{ name: string; distance: number } | null> {
  // Don't return the same city
  const currentCityLower = currentCity.toLowerCase().trim();
  if (MAJOR_CITIES.includes(currentCityLower)) {
    return null;
  }

  let nearest: { name: string; distance: number } | null = null;
  let minDistance = Infinity;

  for (const [cityName, coords] of Object.entries(MAJOR_CITY_COORDINATES)) {
    const distance = calculateDistance(latitude, longitude, coords.lat, coords.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = { name: cityName, distance };
    }
  }

  return nearest;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in miles
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// ============================================
// BEER STYLE EXTRACTION
// ============================================

/**
 * Extract unique beer styles from beer list
 */
export function extractBeerStyles(beers: Beer[]): string[] {
  const styles = new Set<string>();
  beers.forEach(beer => {
    if (beer.style) {
      // Normalize style names
      const style = beer.style.trim();
      if (style.length > 0) {
        styles.add(style);
      }
    }
  });
  return Array.from(styles);
}

/**
 * Get beer availability summary
 */
export function getBeerAvailabilitySummary(beers: Beer[]): string | null {
  if (beers.length === 0) return null;

  const availabilityTypes = new Set<string>();
  beers.forEach(beer => {
    if (beer.availability) {
      const avail = beer.availability.toLowerCase().trim();
      if (avail.includes('year-round') || avail.includes('year round')) {
        availabilityTypes.add('year-round favorites');
      } else if (avail.includes('seasonal')) {
        availabilityTypes.add('seasonal selections');
      } else if (avail.includes('rotating') || avail.includes('limited')) {
        availabilityTypes.add('rotating selections');
      }
    }
  });

  if (availabilityTypes.size === 0) return null;

  const types = Array.from(availabilityTypes);
  if (types.length === 1) {
    return types[0];
  } else if (types.length === 2) {
    return `${types[0]} and ${types[1]}`;
  } else {
    return `${types.slice(0, -1).join(', ')}, and ${types[types.length - 1]}`;
  }
}

// ============================================
// THEME FORMATTING FOR ABOUT SECTION
// ============================================

// Standardized theme category names for display (lowercase for natural sentence flow)
const THEME_DISPLAY_NAMES = {
  beer_quality: 'beer quality & selection',
  food_menu: 'food & menu',
  service_staff: 'service & staff',
  atmosphere: 'atmosphere & ambiance',
  // Amenity categories
  dog_friendly: 'dog-friendly environment',
  outdoor_seating: 'outdoor seating',
  offers_tours: 'brewery tours',
  beer_to_go: 'beer to-go',
  has_merch: 'merchandise',
  food_in_house: 'in-house kitchen',
  food_trucks: 'food trucks',
  other_drinks: 'wine & cocktails',
  parking: 'convenient parking',
} as const;

/**
 * Format stored themes into readable text for the About section
 * Uses standardized category names for consistency
 */
export function formatReviewThemesForAbout(
  breweryName: string,
  reviewThemes?: ReviewThemes
): string | null {
  if (!reviewThemes) return null;

  // Collect themes with scores above threshold (0.3)
  const SCORE_THRESHOLD = 0.3;
  const significantThemes: Array<{ name: string; score: number }> = [];

  // Add main theme categories (using standardized names)
  if (reviewThemes.beer_quality.detected && reviewThemes.beer_quality.score >= SCORE_THRESHOLD) {
    significantThemes.push({
      name: THEME_DISPLAY_NAMES.beer_quality,
      score: reviewThemes.beer_quality.score,
    });
  }

  if (reviewThemes.food_menu.detected && reviewThemes.food_menu.score >= SCORE_THRESHOLD) {
    significantThemes.push({
      name: THEME_DISPLAY_NAMES.food_menu,
      score: reviewThemes.food_menu.score,
    });
  }

  if (reviewThemes.service_staff.detected && reviewThemes.service_staff.score >= SCORE_THRESHOLD) {
    significantThemes.push({
      name: THEME_DISPLAY_NAMES.service_staff,
      score: reviewThemes.service_staff.score,
    });
  }

  if (reviewThemes.atmosphere.detected && reviewThemes.atmosphere.score >= SCORE_THRESHOLD) {
    significantThemes.push({
      name: THEME_DISPLAY_NAMES.atmosphere,
      score: reviewThemes.atmosphere.score,
    });
  }

  // Add amenity-based themes (using standardized names)
  const amenities = reviewThemes.amenities;
  if (amenities.dog_friendly) {
    significantThemes.push({ name: THEME_DISPLAY_NAMES.dog_friendly, score: 0.5 });
  }
  if (amenities.outdoor_seating) {
    significantThemes.push({ name: THEME_DISPLAY_NAMES.outdoor_seating, score: 0.5 });
  }
  if (amenities.offers_tours) {
    significantThemes.push({ name: THEME_DISPLAY_NAMES.offers_tours, score: 0.5 });
  }
  if (amenities.beer_to_go) {
    significantThemes.push({ name: THEME_DISPLAY_NAMES.beer_to_go, score: 0.4 });
  }
  if (amenities.food === 'In-House') {
    significantThemes.push({ name: THEME_DISPLAY_NAMES.food_in_house, score: 0.45 });
  } else if (amenities.food === 'Food Trucks') {
    significantThemes.push({ name: THEME_DISPLAY_NAMES.food_trucks, score: 0.4 });
  }

  // Sort by score and take top 3
  significantThemes.sort((a, b) => b.score - a.score);
  const topThemes = significantThemes.slice(0, 3);

  if (topThemes.length === 0) return null;

  // Format the themes text
  const themeNames = topThemes.map(t => t.name);
  let themesText: string;

  if (themeNames.length === 1) {
    themesText = themeNames[0];
  } else if (themeNames.length === 2) {
    themesText = `${themeNames[0]} and ${themeNames[1]}`;
  } else {
    themesText = `${themeNames.slice(0, -1).join(', ')}, and ${themeNames[themeNames.length - 1]}`;
  }

  return `${breweryName} is regarded for its ${themesText}.`;
}

/**
 * Get list of all applicable theme names for a brewery
 * Returns standardized category names
 */
export function getAllApplicableThemes(reviewThemes?: ReviewThemes): string[] {
  if (!reviewThemes) return [];

  const SCORE_THRESHOLD = 0.3;
  const themes: string[] = [];

  // Main categories
  if (reviewThemes.beer_quality.detected && reviewThemes.beer_quality.score >= SCORE_THRESHOLD) {
    themes.push(THEME_DISPLAY_NAMES.beer_quality);
  }
  if (reviewThemes.food_menu.detected && reviewThemes.food_menu.score >= SCORE_THRESHOLD) {
    themes.push(THEME_DISPLAY_NAMES.food_menu);
  }
  if (reviewThemes.service_staff.detected && reviewThemes.service_staff.score >= SCORE_THRESHOLD) {
    themes.push(THEME_DISPLAY_NAMES.service_staff);
  }
  if (reviewThemes.atmosphere.detected && reviewThemes.atmosphere.score >= SCORE_THRESHOLD) {
    themes.push(THEME_DISPLAY_NAMES.atmosphere);
  }

  // Amenities
  const amenities = reviewThemes.amenities;
  if (amenities.dog_friendly) themes.push(THEME_DISPLAY_NAMES.dog_friendly);
  if (amenities.outdoor_seating) themes.push(THEME_DISPLAY_NAMES.outdoor_seating);
  if (amenities.offers_tours) themes.push(THEME_DISPLAY_NAMES.offers_tours);
  if (amenities.beer_to_go) themes.push(THEME_DISPLAY_NAMES.beer_to_go);
  if (amenities.has_merch) themes.push(THEME_DISPLAY_NAMES.has_merch);
  if (amenities.food === 'In-House') themes.push(THEME_DISPLAY_NAMES.food_in_house);
  if (amenities.food === 'Food Trucks') themes.push(THEME_DISPLAY_NAMES.food_trucks);
  if (amenities.other_drinks === 'yes') themes.push(THEME_DISPLAY_NAMES.other_drinks);
  if (amenities.parking === 'yes') themes.push(THEME_DISPLAY_NAMES.parking);

  return themes;
}

/**
 * Get amenity highlights from stored themes using standardized names
 */
export function getAmenityHighlights(reviewThemes?: ReviewThemes): string[] {
  if (!reviewThemes?.amenities) return [];

  const highlights: string[] = [];
  const amenities = reviewThemes.amenities;

  if (amenities.outdoor_seating) highlights.push(THEME_DISPLAY_NAMES.outdoor_seating);
  if (amenities.dog_friendly) highlights.push(THEME_DISPLAY_NAMES.dog_friendly);
  if (amenities.offers_tours) highlights.push(THEME_DISPLAY_NAMES.offers_tours);
  if (amenities.beer_to_go) highlights.push(THEME_DISPLAY_NAMES.beer_to_go);
  if (amenities.food === 'In-House') highlights.push(THEME_DISPLAY_NAMES.food_in_house);
  if (amenities.food === 'Food Trucks') highlights.push(THEME_DISPLAY_NAMES.food_trucks);
  if (amenities.other_drinks === 'yes') highlights.push(THEME_DISPLAY_NAMES.other_drinks);
  if (amenities.has_merch) highlights.push(THEME_DISPLAY_NAMES.has_merch);
  if (amenities.parking === 'yes') highlights.push(THEME_DISPLAY_NAMES.parking);

  return highlights;
}

// ============================================
// ABOUT CONTENT GENERATION
// ============================================

export interface AboutContentData {
  brewery: {
    name: string;
    city: string;
    county?: string;
    type?: string | string[];
    latitude: number;
    longitude: number;
    googleRating?: number;
    googleRatingCount?: number;
    description?: string;
    reviewThemes?: ReviewThemes; // ADD THIS
  };
  beers?: Beer[];
  yelpRating?: number;
  yelpRatingCount?: number;
}

export async function generateAboutBreweryContent(
  data: AboutContentData
): Promise<string> {
  const { brewery, beers = [] } = data;
  const parts: string[] = [];

  // Part 1: Location
  let locationText = `${brewery.name} is located in ${brewery.city}, Maryland`;
  const isMajor = await isMajorCity(brewery.city);
  if (!isMajor) {
    const nearest = await findNearestMajorCity(
      brewery.latitude,
      brewery.longitude,
      brewery.city
    );
    if (nearest && nearest.distance > 5) {
      // Capitalize first letter of nearest city name
      const capitalizedCity = nearest.name.charAt(0).toUpperCase() + nearest.name.slice(1);
      locationText += `, approximately ${Math.round(nearest.distance)} miles from ${capitalizedCity}`;
    }
  }
  locationText += '.';
  parts.push(locationText);

  // Part 2: Type and Beer Specialization
  const breweryType = Array.isArray(brewery.type)
    ? brewery.type[0]
    : brewery.type || 'brewery';

  // Normalize type for display (ensure "micro"/"Microbrewery" becomes "microbrewery" and "nano"/"Nanobrewery" becomes "nanobrewery" for proper grammar)
  const lowerType = breweryType.toLowerCase();
  let normalizedType: string;
  if (lowerType === 'micro' || lowerType === 'microbrewery') {
    normalizedType = 'microbrewery';
  } else if (lowerType === 'nano' || lowerType === 'nanobrewery') {
    normalizedType = 'nanobrewery';
  } else {
    normalizedType = lowerType;
  }

  let typeText = `${brewery.name} is a ${normalizedType}`;

  if (beers.length > 0) {
    const styles = extractBeerStyles(beers);
    const availabilitySummary = getBeerAvailabilitySummary(beers);
    
    // Helper function to extract availability type (year-round, seasonal, rotating)
    const extractAvailabilityType = (summary: string | null): string | null => {
      if (!summary) return null;
      
      // Check for each type and extract the first one found
      if (summary.includes('year-round')) {
        return 'year-round';
      } else if (summary.includes('seasonal')) {
        return 'seasonal';
      } else if (summary.includes('rotating')) {
        return 'rotating';
      }
      return null;
    };
    
    const availabilityType = extractAvailabilityType(availabilitySummary);
    
    if (styles.length >= 2) {
      const styleList = styles.slice(0, 3);
      // Format with "and" before the last item: "Style1, Style2, and Style3"
      let styleText: string;
      if (styleList.length === 2) {
        styleText = `${styleList[0]} and ${styleList[1]}`;
      } else {
        styleText = `${styleList.slice(0, -1).join(', ')}, and ${styleList[styleList.length - 1]}`;
      }
      // Format: "specializing in craft beers, including [availability] beers like Style1, Style2, and Style3"
      if (availabilityType) {
        typeText += ` specializing in craft beers, including ${availabilityType} beers like ${styleText}`;
      } else {
        typeText += ` specializing in craft beers like ${styleText}`;
      }
    } else if (styles.length === 1) {
      if (availabilityType) {
        typeText += ` specializing in craft beers, including ${availabilityType} beers like ${styles[0]}`;
      } else {
        typeText += ` specializing in craft beers like ${styles[0]}`;
      }
    } else {
      typeText += ' specializing in craft beers';
    }

    typeText += `, with ${beers.length} beer${beers.length === 1 ? '' : 's'} currently available`;
  } else {
    typeText += ' offering craft beer';
  }
  typeText += '.';
  parts.push(typeText);

  // Part 3: Ratings
  const hasGoogle = brewery.googleRatingCount && brewery.googleRatingCount > 0 && brewery.googleRating;
  const hasYelp = data.yelpRatingCount && data.yelpRatingCount > 0 && data.yelpRating;

  if (hasGoogle || hasYelp) {
    let ratingsText = '';

    if (hasGoogle && hasYelp) {
      // Both Google and Yelp ratings exist
      ratingsText = `Patrons have rated this brewery ${brewery.googleRatingCount!.toLocaleString()} times on Google and ${data.yelpRatingCount!.toLocaleString()} times on Yelp`;
      
      // Calculate combined weighted average
      const totalReviews = brewery.googleRatingCount! + data.yelpRatingCount!;
      const combinedAvg =
        (brewery.googleRating! * brewery.googleRatingCount! +
          data.yelpRating! * data.yelpRatingCount!) /
        totalReviews;
      ratingsText += `, with a combined average rating of ${combinedAvg.toFixed(1)} stars`;
    } else if (hasGoogle) {
      // Only Google ratings
      ratingsText = `Patrons have rated this brewery ${brewery.googleRatingCount!.toLocaleString()} times on Google, with an average rating of ${brewery.googleRating!.toFixed(1)} stars`;
    } else if (hasYelp) {
      // Only Yelp ratings
      ratingsText = `Patrons have rated this brewery ${data.yelpRatingCount!.toLocaleString()} times on Yelp, with an average rating of ${data.yelpRating!.toFixed(1)} stars`;
    }

    ratingsText += '.';
    parts.push(ratingsText);
  }

  // Part 4: Review Themes (NEW - uses stored themes)
  // Only include themes if we have ratings (themes are based on reviews)
  const hasAnyRatings = hasGoogle || hasYelp;
  if (hasAnyRatings) {
    const themesText = formatReviewThemesForAbout(brewery.name, brewery.reviewThemes);
    if (themesText) {
      parts.push(themesText);
    } else if (brewery.description) {
      // Fallback to existing description if no themes
      parts.push(brewery.description);
    }
  } else if (brewery.description) {
    // If no ratings, just use description (no themes since they're based on reviews)
    parts.push(brewery.description);
  }

  return parts.join(' ');
}

