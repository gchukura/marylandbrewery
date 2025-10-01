/**
 * SEO and Meta Types for Brewery Directory
 * Types for dynamic SEO, structured data, and page metadata
 */

import { Brewery } from './brewery';

/**
 * Enum for different types of structured data
 */
export enum StructuredDataType {
  ORGANIZATION = 'Organization',
  LOCAL_BUSINESS = 'LocalBusiness',
  BREWERY = 'Brewery',
  RESTAURANT = 'Restaurant',
  PLACE = 'Place',
  POSTAL_ADDRESS = 'PostalAddress',
  GEO_COORDINATES = 'GeoCoordinates',
  OPENING_HOURS = 'OpeningHoursSpecification',
  BREADCRUMB_LIST = 'BreadcrumbList',
  WEB_SITE = 'WebSite',
  COLLECTION_PAGE = 'CollectionPage',
  ITEM_LIST = 'ItemList'
}

/**
 * Dynamic page metadata for SEO optimization
 */
export interface PageMeta {
  // Core meta tags
  title: string;
  description: string;
  keywords?: string[];
  
  // Open Graph tags
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'business.business';
  ogUrl?: string;
  
  // Twitter Card tags
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterSite?: string;
  twitterCreator?: string;
  
  // Additional SEO
  canonicalUrl?: string;
  robots?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  
  // Structured data
  structuredData?: Record<string, any>;
  
  // Page-specific data
  brewery?: Brewery;
  location?: {
    city?: string;
    county?: string;
    state?: string;
  };
  filters?: {
    type?: string;
    amenity?: string;
    county?: string;
  };
}

/**
 * Breadcrumb navigation item
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
  position: number;
  isActive?: boolean;
}

/**
 * Related page for internal linking and navigation
 */
export interface RelatedPage {
  title: string;
  url: string;
  description?: string;
  image?: string;
  type: 'brewery' | 'city' | 'county' | 'amenity' | 'type' | 'general';
  relevanceScore?: number;
}

/**
 * SEO configuration for different page types
 */
export interface SEOConfig {
  // Default meta values
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string[];
  
  // Site-wide settings
  siteName: string;
  siteUrl: string;
  defaultImage: string;
  twitterHandle?: string;
  
  // Page type specific templates
  templates: {
    brewery: (brewery: Brewery) => PageMeta;
    city: (city: string, breweries: Brewery[]) => PageMeta;
    county: (county: string, breweries: Brewery[]) => PageMeta;
    amenity: (amenity: string, breweries: Brewery[]) => PageMeta;
    type: (type: string, breweries: Brewery[]) => PageMeta;
    home: () => PageMeta;
    search: (query: string) => PageMeta;
  };
}

/**
 * Structured data for LocalBusiness (Brewery)
 */
export interface LocalBusinessStructuredData {
  '@context': 'https://schema.org';
  '@type': 'Brewery' | 'Restaurant' | 'LocalBusiness';
  name: string;
  description?: string;
  url?: string;
  telephone?: string;
  address: {
    '@type': 'PostalAddress';
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: {
    '@type': 'GeoCoordinates';
    latitude: number;
    longitude: number;
  };
  openingHoursSpecification?: Array<{
    '@type': 'OpeningHoursSpecification';
    dayOfWeek: string;
    opens?: string;
    closes?: string;
  }>;
  sameAs?: string[];
  servesCuisine?: string;
  priceRange?: string;
  amenityFeature?: Array<{
    '@type': 'LocationFeatureSpecification';
    name: string;
  }>;
}

/**
 * Structured data for BreadcrumbList
 */
export interface BreadcrumbStructuredData {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }>;
}

/**
 * Structured data for CollectionPage
 */
export interface CollectionPageStructuredData {
  '@context': 'https://schema.org';
  '@type': 'CollectionPage';
  name: string;
  description?: string;
  url: string;
  mainEntity?: {
    '@type': 'ItemList';
    numberOfItems: number;
    itemListElement: Array<{
      '@type': 'ListItem';
      position: number;
      item: {
        '@type': 'Brewery';
        name: string;
        url: string;
      };
    }>;
  };
}

/**
 * SEO analytics and tracking
 */
export interface SEOAnalytics {
  pageViews?: number;
  uniqueVisitors?: number;
  bounceRate?: number;
  averageTimeOnPage?: number;
  searchQueries?: string[];
  clickThroughRate?: number;
  lastUpdated: string;
}

/**
 * SEO performance metrics
 */
export interface SEOPerformance {
  // Core Web Vitals
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
  
  // Additional metrics
  firstContentfulPaint?: number;
  timeToInteractive?: number;
  totalBlockingTime?: number;
  
  // SEO scores
  lighthouseScore?: number;
  mobileUsability?: number;
  accessibility?: number;
  bestPractices?: number;
  
  lastMeasured: string;
}
