/**
 * Layout Utilities for Static Generation
 * Provides consistent metadata and styling for 500+ pages
 */

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
export function createPageMetadata({
  title,
  description,
  path,
  keywords = [],
  image = '/og-image.jpg',
  type = 'website'
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article';
}): Metadata {
  const fullTitle = title.includes('Maryland Brewery Directory') 
    ? title 
    : `${title} | Maryland Brewery Directory`;

  return {
    title: fullTitle,
    description,
    keywords: [
      'Maryland breweries',
      'craft beer Maryland',
      'Maryland brewery directory',
      'breweries near me',
      ...keywords
    ],
    authors: [{ name: 'Maryland Brewery Directory' }],
    creator: 'Maryland Brewery Directory',
    publisher: 'Maryland Brewery Directory',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL('https://www.marylandbrewery.com'),
    alternates: {
      canonical: path,
    },
    openGraph: {
      type,
      locale: 'en_US',
      url: `https://www.marylandbrewery.com${path}`,
      siteName: 'Maryland Brewery Directory',
      title: fullTitle,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${title} - Maryland Brewery Directory`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@marylandbrewery',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// Generate breadcrumb structured data
export function generateBreadcrumbStructuredData(breadcrumbs: Array<{
  name: string;
  url: string;
  position: number;
}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map(breadcrumb => ({
      '@type': 'ListItem',
      position: breadcrumb.position,
      name: breadcrumb.name,
      item: `https://www.marylandbrewery.com${breadcrumb.url}`
    }))
  };
}

// Generate organization structured data
export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Maryland Brewery Directory',
    url: 'https://www.marylandbrewery.com',
    logo: 'https://www.marylandbrewery.com/logo.png',
    description: 'Complete directory of craft breweries across Maryland',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
      addressRegion: 'MD'
    },
    sameAs: [
      'https://facebook.com/marylandbrewery',
      'https://instagram.com/marylandbrewery',
      'https://twitter.com/marylandbrewery'
    ]
  };
}

// Generate local business structured data for breweries
export function generateBreweryStructuredData(brewery: {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  website?: string;
  latitude: number;
  longitude: number;
  hours?: Record<string, string>;
  description?: string;
}) {
  const structuredData: any = {
    '@context': 'https://schema.org',
    '@type': 'Brewery',
    name: brewery.name || 'Brewery',
    address: {
      '@type': 'PostalAddress',
      addressLocality: brewery.city || '',
      addressRegion: brewery.state || 'MD',
      postalCode: brewery.zipCode || '',
      addressCountry: 'US'
    }
  };

  // Only add fields if they have valid values
  if (brewery.address && brewery.address.trim()) {
    structuredData.address.streetAddress = brewery.address;
  }
  
  if (brewery.description && brewery.description.trim()) {
    structuredData.description = brewery.description;
  }
  
  if (brewery.website && brewery.website.trim()) {
    structuredData.url = brewery.website;
  }
  
  if (brewery.phone && brewery.phone.trim()) {
    structuredData.telephone = brewery.phone;
  }
  
  if (brewery.latitude && brewery.longitude) {
    structuredData.geo = {
      '@type': 'GeoCoordinates',
      latitude: brewery.latitude,
      longitude: brewery.longitude
    };
  }
  
  if (brewery.hours) {
    const openingHours = Object.entries(brewery.hours)
      .filter(([_, hours]) => hours && hours !== 'Closed' && hours.trim())
      .map(([day, hours]) => {
        // Format: Mo 10:00-22:00
        const dayAbbr = day.substring(0, 2);
        return `${dayAbbr} ${hours}`;
      });
    
    if (openingHours.length > 0) {
      structuredData.openingHours = openingHours.join(', ');
    }
  }
  
  if (brewery.website && brewery.website.trim()) {
    structuredData.sameAs = [brewery.website];
  }

  return structuredData;
}

// Generate collection page structured data
export function generateCollectionStructuredData({
  name,
  description,
  url,
  itemCount,
  items
}: {
  name: string;
  description: string;
  url: string;
  itemCount: number;
  items: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: `https://www.marylandbrewery.com${url}`,
    numberOfItems: itemCount,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: itemCount,
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Brewery',
          name: item.name,
          url: `https://www.marylandbrewery.com${item.url}`
        }
      }))
    }
  };
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
