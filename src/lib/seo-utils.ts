/**
 * SEO utility functions for optimizing titles and descriptions
 */

/**
 * Truncates a title to SEO-optimal length (60 characters)
 * @param title The title to truncate
 * @param maxLength Maximum length (default: 60)
 * @returns Truncated title
 */
export function truncateTitle(title: string, maxLength: number = 60): string {
  if (title.length <= maxLength) {
    return title;
  }

  // Truncate at word boundary
  const truncated = title.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.8) {
    // If we can find a good word boundary, use it
    return truncated.substring(0, lastSpace).trim() + '...';
  }

  // Otherwise, hard truncate with ellipsis
  return truncated.substring(0, maxLength - 3).trim() + '...';
}

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
 * Generates SEO-optimized title for brewery pages (<60 chars)
 * @param breweryName Brewery name
 * @param city City name
 * @returns Optimized title
 */
export function generateBreweryTitle(breweryName: string, city: string): string {
  const baseTitle = `${breweryName} - ${city}, MD`;
  const suffix = ' | MD';
  const fullTitle = baseTitle + suffix;

  if (fullTitle.length <= 60) {
    return fullTitle;
  }

  // If too long, try without suffix
  if (baseTitle.length <= 60) {
    return baseTitle;
  }

  // If still too long, truncate brewery name
  const maxBreweryLength = 60 - ` - ${city}, MD`.length;
  const truncatedName = breweryName.length > maxBreweryLength
    ? breweryName.substring(0, maxBreweryLength - 3) + '...'
    : breweryName;

  return `${truncatedName} - ${city}, MD`;
}

/**
 * Generates SEO-optimized title for city pages
 * @param cityName City name
 * @param count Number of breweries
 * @returns Optimized title
 */
export function generateCityTitle(cityName: string, count: number): string {
  const baseTitle = `${cityName} Breweries - ${count} Craft Breweries`;

  if (baseTitle.length <= 60) {
    return baseTitle;
  }

  // Shorter version
  return `${cityName} Breweries - ${count} in MD`;
}

/**
 * Generates SEO-optimized description for brewery pages
 * @param breweryName Brewery name
 * @param city City name
 * @param description Optional brewery description
 * @param type Optional brewery type
 * @returns Optimized description
 */
export function generateBreweryDescription(
  breweryName: string,
  city: string,
  description?: string,
  type?: string
): string {
  let baseDesc = `${breweryName} in ${city}, Maryland.`;

  if (description && description.length > 20) {
    baseDesc += ` ${description}`;
  } else {
    const typeStr = type || 'craft brewery';
    baseDesc += ` Discover this ${typeStr} in the Old Line State.`;
  }

  return optimizeDescription(baseDesc);
}

/**
 * Generates SEO-optimized description for city pages
 * @param cityName City name
 * @param count Number of breweries
 * @param topAmenities Top amenities string
 * @returns Optimized description
 */
export function generateCityDescription(
  cityName: string,
  count: number,
  topAmenities?: string
): string {
  let desc = `Discover ${count} craft breweries in ${cityName}, Maryland.`;

  if (topAmenities) {
    desc += ` Popular amenities: ${topAmenities}.`;
  }

  desc += ` Find brewery hours, locations, and visitor information for all ${cityName} breweries.`;

  return optimizeDescription(desc);
}
