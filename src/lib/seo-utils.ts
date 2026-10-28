/**
 * SEO utility functions for optimizing titles and descriptions
 */

/**
 * Ensures meta description is within SEO-optimal length (120-160 characters)
 * @param description The description to optimize
 * @param minLength Minimum length (default: 120)
 * @param maxLength Maximum length (default: 160)
 * @returns Optimized description
 */
export function optimizeDescription(description: string, minLength: number = 120, maxLength: number = 160): string {
  // Remove extra whitespace
  const cleaned = description.replace(/\s+/g, ' ').trim();

  // If too short, pad with Maryland brewery context
  if (cleaned.length < minLength) {
    const padding = ' Explore Maryland\'s craft beer scene with brewery hours, amenities, and visitor information.';
    const result = cleaned + padding;
    return result.substring(0, maxLength);
  }

  // If too long, truncate at word boundary
  if (cleaned.length > maxLength) {
    const truncated = cleaned.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace).trim() + '...';
    }

    return truncated.substring(0, maxLength - 3).trim() + '...';
  }

  return cleaned;
}

/**
 * Generates enhanced, dynamic meta descriptions based on brewery data
 * @param brewery Brewery data object
 * @returns Enhanced meta description (max 160 chars)
 */
export function generateEnhancedBreweryDescription(brewery: {
  name: string;
  city: string;
  county?: string;
  type?: string | string[];
  description?: string;
  googleRating?: number;
  amenities?: string[];
  offersTours?: boolean;
  dogFriendly?: boolean;
  food?: string;
  outdoorSeating?: boolean;
}): string {
  const parts: string[] = [];
  
  // Opening with name and location
  parts.push(`Visit ${brewery.name} in ${brewery.city}, Maryland.`);
  
  // Type context
  const typeStr = Array.isArray(brewery.type) 
    ? brewery.type[0] 
    : brewery.type || 'brewery';
  
  // Build highlights based on available data
  const highlights: string[] = [];
  
  if (brewery.googleRating && brewery.googleRating >= 4.5) {
    highlights.push(`exceptional ${brewery.googleRating.toFixed(1)}★ rating`);
  } else if (brewery.googleRating && brewery.googleRating >= 4.0) {
    highlights.push(`${brewery.googleRating.toFixed(1)}★ rated`);
  }
  
  if (brewery.food || brewery.amenities?.some(a => a.toLowerCase().includes('food'))) {
    highlights.push('on-site food');
  }
  
  if (brewery.outdoorSeating || brewery.amenities?.some(a => a.toLowerCase().includes('outdoor'))) {
    highlights.push('outdoor seating');
  }
  
  if (brewery.offersTours || brewery.amenities?.some(a => a.toLowerCase().includes('tour'))) {
    highlights.push('brewery tours');
  }
  
  if (brewery.dogFriendly || brewery.amenities?.some(a => a.toLowerCase().includes('dog') || a.toLowerCase().includes('pet'))) {
    highlights.push('dog-friendly');
  }
  
  if (brewery.amenities?.some(a => a.toLowerCase().includes('music'))) {
    highlights.push('live music');
  }
  
  // Add type and highlights
  if (highlights.length > 0) {
    parts.push(`This ${typeStr.toLowerCase()} offers ${highlights.slice(0, 3).join(', ')}.`);
  } else {
    parts.push(`A ${typeStr.toLowerCase()} in ${brewery.county || 'Maryland'} County.`);
  }
  
  // CTA
  parts.push('Hours, directions & beer selection.');
  
  // Join and truncate to 160 chars
  let result = parts.join(' ');
  if (result.length > 160) {
    result = result.substring(0, 157) + '...';
  }
  
  return result;
}
