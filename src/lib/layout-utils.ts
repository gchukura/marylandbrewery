/**
 * Layout Utilities for Static Generation
 * Provides consistent metadata and styling for 500+ pages
 */

import { openingHoursSpecification } from '@/lib/hours';
import { buildMetadata } from '@/lib/seo/metadata';
import { Metadata } from 'next';

// Maryland flag colors for consistent theming
export const MARYLAND_COLORS = {
  red: '#dc2626',
  yellow: '#fbbf24',
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  }
} as const;

// Base metadata template for consistent SEO
/**
 * Metadata for static pages (FAQ, terms, ...). A thin wrapper over buildMetadata; the title
 * must not include the brand, which the layout template adds.
 */
export function createPageMetadata({
  title,
  description,
  path,
  keywords = [],
  image,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
}): Metadata {
  return { ...buildMetadata({ title, description, path, image }), keywords };
}

// Utility for consistent page titles (optimized for <60 chars)
export function generatePageTitle(
  pageType: 'city' | 'county' | 'amenity' | 'type' | 'brewery',
  name: string,
  count?: number
): string {
  const breweryText = count === 1 ? 'Brewery' : 'Breweries';
  
  switch (pageType) {
    case 'city':
      return `${name} ${breweryText} | MD Directory`;
    case 'county':
      return `${name} County ${breweryText} | MD`;
    case 'amenity':
      return `${name} Breweries in MD | Guide`;
    case 'type':
      return `${name} Breweries in MD`;
    case 'brewery':
      return `${name} | MD Breweries`;
    default:
      return `${name} | MD Directory`;
  }
}

// Utility for consistent meta descriptions (optimized for 120-160 chars)
export function generateMetaDescription(
  pageType: 'city' | 'county' | 'amenity' | 'type' | 'brewery',
  data: {
    name: string;
    count: number;
    amenities?: string[];
    city?: string;
    county?: string;
  }
): string {
  const { name, count, amenities = [], city, county } = data;
  const breweryText = count === 1 ? 'brewery' : 'breweries';
  
  switch (pageType) {
    case 'city':
      return `Discover ${count} craft ${breweryText} in ${name}, Maryland. Find local taprooms, brewpubs, and microbreweries with food, outdoor seating, live music, and more. Explore ${name}'s beer scene today!`;
    case 'county':
      return `Explore ${count} craft ${breweryText} across ${name} County, Maryland. From urban centers to rural communities, discover diverse brewing experiences with detailed hours, amenities, and visitor information.`;
    case 'amenity':
      return `Find ${count} Maryland ${breweryText} with ${name.toLowerCase()}. Browse our curated selection of craft beer locations offering ${name.toLowerCase()} across cities like Baltimore, Annapolis, and Frederick. Plan your visit now!`;
    case 'type':
      return `Discover ${count} ${name.toLowerCase()} ${breweryText} throughout Maryland. Find the perfect ${name.toLowerCase()} locations with great beer, food, events, and more. Your complete guide to Maryland craft beer.`;
    case 'brewery':
      const amenityText = amenities.length > 0 
        ? ` Features include ${amenities.slice(0, 3).join(', ').toLowerCase()}.` 
        : ' A premier Maryland craft brewery.';
      return `Visit ${name} in ${city || county || 'Maryland'}. Enjoy exceptional local beer, unique atmosphere, and memorable experiences.${amenityText} Check hours, location, and special events.`;
    default:
      return `Explore Maryland's vibrant craft brewery scene. Find the perfect spot for great local beer, food, and atmosphere across all Maryland cities and counties.`;
  }
}

// Utility for consistent CSS classes
export const LAYOUT_CLASSES = {
  container: 'container mx-auto px-4',
  section: 'py-8 md:py-12',
  heading: 'text-3xl md:text-4xl font-bold text-gray-900',
  subheading: 'text-xl md:text-2xl font-semibold text-gray-800',
  body: 'text-gray-600 leading-relaxed',
  button: 'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors',
  card: 'bg-white rounded-lg shadow-md border border-gray-200 p-6',
  badge: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800',
} as const;
