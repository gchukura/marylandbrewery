/**
 * Content and Template Types for Brewery Directory
 * Types for page templates, filtering, and content management
 */

import { Brewery } from './brewery';
import { PageMeta, BreadcrumbItem, RelatedPage } from './seo';

/**
 * Base props for all page templates
 */
export interface PageTemplateProps {
  // Core data
  breweries: Brewery[];
  processedData: any; // TODO: Define proper type
  
  // SEO and metadata
  meta: PageMeta;
  breadcrumbs: BreadcrumbItem[];
  relatedPages: RelatedPage[];
  
  // Page configuration
  pageType: 'home' | 'brewery' | 'city' | 'county' | 'amenity' | 'type' | 'search' | 'about' | 'contact';
  pageTitle: string;
  pageDescription: string;
  
  // Navigation
  navigation: {
    cities: string[];
    counties: string[];
    amenities: string[];
    types: string[];
  };
  
  // Site-wide data
  siteStats: {
    totalBreweries: number;
    totalCities: number;
    totalCounties: number;
    lastUpdated: string;
  };
}

/**
 * Brewery detail page props
 */
export interface BreweryPageProps extends PageTemplateProps {
  brewery: Brewery;
  nearbyBreweries: Brewery[];
  similarBreweries: Brewery[];
}

/**
 * City listing page props
 */
export interface CityPageProps extends PageTemplateProps {
  city: string;
  county: string;
  breweriesInCity: Brewery[];
  nearbyCities: string[];
}

/**
 * County listing page props
 */
export interface CountyPageProps extends PageTemplateProps {
  county: string;
  breweriesInCounty: Brewery[];
  citiesInCounty: string[];
  nearbyCounties: string[];
}

/**
 * Amenity listing page props
 */
export interface AmenityPageProps extends PageTemplateProps {
  amenity: string;
  breweriesWithAmenity: Brewery[];
  relatedAmenities: string[];
}

/**
 * Type listing page props
 */
export interface TypePageProps extends PageTemplateProps {
  type: string;
  breweriesOfType: Brewery[];
  relatedTypes: string[];
}

/**
 * Search results page props
 */
export interface SearchPageProps extends PageTemplateProps {
  searchQuery: string;
  searchResults: Brewery[];
  searchFilters: FilterState;
  totalResults: number;
  currentPage: number;
  totalPages: number;
}

/**
 * Filter state for search and filtering functionality
 */
export interface FilterState {
  // Location filters
  city?: string;
  county?: string;
  state?: string;
  zipCode?: string;
  radius?: number; // in miles
  centerLat?: number;
  centerLng?: number;
  
  // Brewery type filters
  types: string[];
  
  // Amenity filters
  amenities: string[];
  
  // Feature filters
  features: {
    allowsVisitors?: boolean;
    offersTours?: boolean;
    beerToGo?: boolean;
    hasMerch?: boolean;
    hasFood?: boolean;
    hasOutdoorSeating?: boolean;
    petFriendly?: boolean;
    wheelchairAccessible?: boolean;
  };
  
  // Hours filters
  hours: {
    openNow?: boolean;
    openToday?: boolean;
    dayOfWeek?: string;
    timeRange?: {
      start: string;
      end: string;
    };
  };
  
  // Search and sorting
  searchQuery?: string;
  sortBy: 'name' | 'distance' | 'openedDate' | 'rating' | 'relevance';
  sortOrder: 'asc' | 'desc';
  
  // Pagination
  page: number;
  pageSize: number;
  
  // Additional filters
  openedAfter?: string; // date
  openedBefore?: string; // date
  hasWebsite?: boolean;
  hasPhone?: boolean;
  hasSocialMedia?: boolean;
}

/**
 * Statistics block for displaying brewery data
 */
export interface StatisticsBlock {
  title: string;
  description?: string;
  stats: Array<{
    label: string;
    value: number | string;
    change?: {
      value: number;
      period: 'day' | 'week' | 'month' | 'year';
      direction: 'up' | 'down' | 'neutral';
    };
    format?: 'number' | 'currency' | 'percentage' | 'date';
  }>;
  visualizations?: Array<{
    type: 'chart' | 'map' | 'list' | 'grid';
    data: any;
    config?: Record<string, any>;
  }>;
  lastUpdated: string;
}

/**
 * Content block for rich content sections
 */
export interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'video' | 'map' | 'list' | 'quote' | 'statistics' | 'gallery';
  title?: string;
  content: string;
  metadata?: Record<string, any>;
  order: number;
  isVisible: boolean;
}

/**
 * Page section for organizing content
 */
export interface PageSection {
  id: string;
  title: string;
  description?: string;
  contentBlocks: ContentBlock[];
  order: number;
  isVisible: boolean;
  template?: string;
}

/**
 * Template configuration for different page types
 */
export interface TemplateConfig {
  name: string;
  description: string;
  pageType: PageTemplateProps['pageType'];
  sections: PageSection[];
  layout: {
    header: boolean;
    sidebar: boolean;
    footer: boolean;
    navigation: boolean;
  };
  styling: {
    theme: 'light' | 'dark' | 'auto';
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
}

/**
 * Content management system types
 */
export interface ContentManager {
  // Page management
  createPage: (props: PageTemplateProps) => Promise<string>;
  updatePage: (id: string, props: Partial<PageTemplateProps>) => Promise<void>;
  deletePage: (id: string) => Promise<void>;
  getPage: (id: string) => Promise<PageTemplateProps | null>;
  
  // Template management
  getTemplates: () => TemplateConfig[];
  getTemplate: (name: string) => TemplateConfig | null;
  
  // Content blocks
  createContentBlock: (block: ContentBlock) => Promise<string>;
  updateContentBlock: (id: string, block: Partial<ContentBlock>) => Promise<void>;
  deleteContentBlock: (id: string) => Promise<void>;
  
  // Search and filtering
  searchPages: (query: string, filters?: FilterState) => Promise<PageTemplateProps[]>;
  getPagesByType: (type: PageTemplateProps['pageType']) => Promise<PageTemplateProps[]>;
  
  // Analytics
  getPageViews: (pageId: string) => Promise<number>;
  getPopularPages: (limit?: number) => Promise<Array<PageTemplateProps & { views: number }>>;
}

/**
 * Dynamic content generation
 */
export interface ContentGenerator {
  // Page generation
  generateBreweryPages: (breweries: Brewery[]) => Promise<BreweryPageProps[]>;
  generateCityPages: (cities: string[], processedData: any) => Promise<CityPageProps[]>;
  generateCountyPages: (counties: string[], processedData: any) => Promise<CountyPageProps[]>;
  generateAmenityPages: (amenities: string[], processedData: any) => Promise<AmenityPageProps[]>;
  generateTypePages: (types: string[], processedData: any) => Promise<TypePageProps[]>;
  
  // Content optimization
  optimizeContent: (content: string, keywords: string[]) => string;
  generateMetaDescriptions: (breweries: Brewery[]) => Record<string, string>;
  generateRelatedPages: (brewery: Brewery, allBreweries: Brewery[]) => RelatedPage[];
  
  // SEO content
  generateBreadcrumbs: (pageType: string, context: any) => BreadcrumbItem[];
  generateStructuredData: (page: PageTemplateProps) => Record<string, any>;
}
