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
    metadataBase: new URL('https://marylandbrewery.com'),
    alternates: {
      canonical: path,
    },
    openGraph: {
      type,
      locale: 'en_US',
      url: `https://marylandbrewery.com${path}`,
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
      item: `https://marylandbrewery.com${breadcrumb.url}`
    }))
  };
}

// Generate organization structured data
export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Maryland Brewery Directory',
    url: 'https://marylandbrewery.com',
    logo: 'https://marylandbrewery.com/logo.png',
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
  return {
    '@context': 'https://schema.org',
    '@type': 'Brewery',
    name: brewery.name,
    description: brewery.description,
    url: brewery.website,
    telephone: brewery.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: brewery.address,
      addressLocality: brewery.city,
      addressRegion: brewery.state,
      postalCode: brewery.zipCode,
      addressCountry: 'US'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: brewery.latitude,
      longitude: brewery.longitude
    },
    openingHours: brewery.hours ? Object.entries(brewery.hours)
      .filter(([_, hours]) => hours && hours !== 'Closed')
      .map(([day, hours]) => `${day.substring(0, 2)} ${hours}`)
      .join(', ') : undefined,
    sameAs: brewery.website ? [brewery.website] : []
  };
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
    url: `https://marylandbrewery.com${url}`,
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
          url: `https://marylandbrewery.com${item.url}`
        }
      }))
    }
  };
}

// Utility for consistent page titles
export function generatePageTitle(
  pageType: 'city' | 'county' | 'amenity' | 'type' | 'brewery',
  name: string,
  count?: number
): string {
  const breweryText = count === 1 ? 'Brewery' : 'Breweries';
  
  switch (pageType) {
    case 'city':
      return `${name} ${breweryText} | Maryland Brewery Directory`;
    case 'county':
      return `${name} County ${breweryText} | Maryland Brewery Guide`;
    case 'amenity':
      return `Maryland ${breweryText} with ${name} | Complete Guide`;
    case 'type':
      return `${name} ${breweryText} in Maryland | Directory`;
    case 'brewery':
      return `${name} | Maryland Brewery Directory`;
    default:
      return `${name} | Maryland Brewery Directory`;
  }
}

// Utility for consistent meta descriptions
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
      return `Discover ${count} ${breweryText} in ${name}, Maryland. Find craft breweries, brewpubs, and taprooms with detailed information, hours, and amenities. Plan your ${name} brewery tour today.`;
    case 'county':
      return `Explore ${count} ${breweryText} across ${name} County, Maryland. From urban centers to rural communities, discover the diverse craft beer culture that makes ${name} County a destination for beer enthusiasts.`;
    case 'amenity':
      return `Find ${count} Maryland ${breweryText} with ${name.toLowerCase()}. Discover breweries offering ${name.toLowerCase()} amenities for the perfect craft beer experience.`;
    case 'type':
      return `Explore ${count} ${name.toLowerCase()} ${breweryText} in Maryland. From traditional to innovative, discover the best ${name.toLowerCase()} breweries across the state.`;
    case 'brewery':
      return `Visit ${name} in ${city || county || 'Maryland'}. Enjoy craft beer, ${amenities.slice(0, 2).join(' and ').toLowerCase()}, and more. Find hours, location, and amenities at this Maryland brewery.`;
    default:
      return `Discover ${count} ${breweryText} in Maryland. Find craft breweries, brewpubs, and taprooms with detailed information and amenities.`;
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
