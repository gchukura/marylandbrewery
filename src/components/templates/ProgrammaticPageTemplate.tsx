/**
 * ProgrammaticPageTemplate - Reusable template for all 500+ programmatic pages
 * Used for brewery listings by city, county, type, amenity, etc.
 */

"use client";

import { NextSeo } from 'next-seo';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Globe, Clock, Users, Map, ExternalLink, ChevronRight } from 'lucide-react';
import { Brewery } from '@/types/brewery';
import { BreadcrumbItem, RelatedPage } from '@/types/seo';
import { StatisticsBlock } from '@/types/content';
import { slugify, isOpenNow, formatDistance } from '@/lib/data-utils';
import dynamic from 'next/dynamic';

// Dynamically import GoogleMap to avoid SSR issues
const GoogleMap = dynamic(() => import('@/components/maps/GoogleMap'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
});

interface ProgrammaticPageTemplateProps {
  // Page content
  title: string;
  metaDescription: string;
  h1: string;
  introText: string;
  
  // Data
  breweries: Brewery[];
  stats: StatisticsBlock;
  
  // Navigation
  breadcrumbs: BreadcrumbItem[];
  relatedPages: RelatedPage[];
  
  // Page configuration
  pageType: 'city' | 'county' | 'amenity' | 'type' | 'search' | 'home';
  showMap?: boolean;
  showStats?: boolean;
  showRelatedPages?: boolean;
  
  // Optional filters
  currentFilters?: {
    city?: string;
    county?: string;
    type?: string;
    amenity?: string;
  };
}

export default function ProgrammaticPageTemplate({
  title,
  metaDescription,
  h1,
  introText,
  breweries,
  stats,
  breadcrumbs,
  relatedPages,
  pageType,
  showMap = true,
  showStats = true,
  showRelatedPages = true,
  currentFilters = {},
}: ProgrammaticPageTemplateProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'distance' | 'opened'>('name');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Generate structured data based on page type
  const generateStructuredData = () => {
    const baseStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      description: metaDescription,
      url: typeof window !== 'undefined' ? window.location.href : '',
    };

    if (pageType === 'city' && currentFilters.city) {
      return {
        ...baseStructuredData,
        '@type': 'CollectionPage',
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: breweries.length,
          itemListElement: breweries.map((brewery, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'Brewery',
              name: brewery.name,
              url: `/breweries/${(brewery as any).slug || brewery.id}`,
              address: {
                '@type': 'PostalAddress',
                streetAddress: (brewery as any).street || '',
                addressLocality: brewery.city,
                addressRegion: brewery.state,
                postalCode: (brewery as any).zip || '',
              },
            },
          })),
        },
      };
    }

    return baseStructuredData;
  };

  // Sort breweries based on current sort option
  const sortedBreweries = [...breweries].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'distance':
        // This would need user location - for now sort by name
        return a.name.localeCompare(b.name);
      case 'opened':
        return new Date((b as any).openedDate || '').getTime() - new Date((a as any).openedDate || '').getTime();
      default:
        return 0;
    }
  });

  return (
    <>
      <NextSeo
        title={title}
        description={metaDescription}
        canonical={`https://www.marylandbrewery.com/${pageType}/${slugify(h1)}`}
        openGraph={{
          title,
          description: metaDescription,
          type: 'website',
          url: `https://www.marylandbrewery.com/${pageType}/${slugify(h1)}`,
          siteName: 'Maryland Brewery Directory',
        }}
        additionalMetaTags={[
          {
            name: 'keywords',
            content: `Maryland breweries, ${currentFilters.city || ''}, ${currentFilters.county || ''}, craft beer, brewery directory`,
          },
        ]}
      />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData()),
        }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-red-600 to-red-800 text-white py-8">
          <div className="container mx-auto px-4">
            {/* Breadcrumbs */}
            <nav className="mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <li key={index} className="flex items-center">
                    {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
                    {crumb.isActive ? (
                      <span className="text-yellow-300 font-medium">{crumb.name}</span>
                    ) : (
                      <a
                        href={crumb.url}
                        className="text-yellow-200 hover:text-white transition-colors"
                      >
                        {crumb.name}
                      </a>
                    )}
                  </li>
                ))}
              </ol>
            </nav>

            <h1 className="text-4xl font-bold mb-4">{h1}</h1>
            <p className="text-xl text-yellow-200 max-w-3xl">{introText}</p>
          </div>
        </header>

        {/* Statistics Bar */}
        {showStats && (
          <div className="bg-yellow-400 text-black py-4">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{stats.stats[0]?.value || breweries.length}</div>
                  <div className="text-sm font-medium">Breweries</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.stats[1]?.value || '24'}</div>
                  <div className="text-sm font-medium">Counties</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.stats[2]?.value || '6'}</div>
                  <div className="text-sm font-medium">Types</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.stats[3]?.value || '25+'}</div>
                  <div className="text-sm font-medium">Amenities</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-semibold text-gray-900">
                {breweries.length} Breweries Found
              </h2>
              {currentFilters.city && (
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  {currentFilters.city}
                </Badge>
              )}
              {currentFilters.county && (
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  {currentFilters.county} County
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Sort Options */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="name">Sort by Name</option>
                <option value="distance">Sort by Distance</option>
                <option value="opened">Sort by Date Opened</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${
                    viewMode === 'grid'
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 ${
                    viewMode === 'list'
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Breweries List */}
            <div className="lg:col-span-2">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sortedBreweries.map((brewery) => (
                    <Card key={brewery.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-xl text-red-600">
                          <a
                            href={`/breweries/${(brewery as any).slug || brewery.id}`}
                            className="hover:text-red-800 transition-colors"
                          >
                            {brewery.name}
                          </a>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {brewery.city}, {brewery.state}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {brewery.description && (
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {brewery.description}
                            </p>
                          )}
                          
                          <div className="space-y-2">
                            {brewery.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-gray-500" />
                                <a
                                  href={`tel:${brewery.phone}`}
                                  className="text-red-600 hover:underline"
                                >
                                  {brewery.phone}
                                </a>
                              </div>
                            )}
                            
                            {brewery.website && (
                              <div className="flex items-center gap-2 text-sm">
                                <Globe className="h-4 w-4 text-gray-500" />
                                <a
                                  href={brewery.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-red-600 hover:underline flex items-center gap-1"
                                >
                                  Visit Website
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span className={`font-medium ${
                                isOpenNow(brewery) ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {isOpenNow(brewery) ? 'Open Now' : 'Closed'}
                              </span>
                            </div>
                          </div>

                          {(brewery as any).amenities && (brewery as any).amenities.length > 0 && (
                            <div className="pt-3">
                              <div className="flex flex-wrap gap-1">
                                {(brewery as any).amenities.slice(0, 3).map((amenity: string) => (
                                  <Badge
                                    key={amenity}
                                    variant="outline"
                                    className="text-xs border-yellow-400 text-yellow-700"
                                  >
                                    {amenity}
                                  </Badge>
                                ))}
                                {(brewery as any).amenities.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{(brewery as any).amenities.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedBreweries.map((brewery) => (
                    <Card key={brewery.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-red-600 mb-2">
                              <a
                                href={`/breweries/${(brewery as any).slug || brewery.id}`}
                                className="hover:text-red-800 transition-colors"
                              >
                                {brewery.name}
                              </a>
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {brewery.city}, {brewery.state}
                              </div>
                              {brewery.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-4 w-4" />
                                  <a href={`tel:${brewery.phone}`} className="text-red-600 hover:underline">
                                    {brewery.phone}
                                  </a>
                                </div>
                              )}
                              <div className={`flex items-center gap-1 ${
                                isOpenNow(brewery) ? 'text-green-600' : 'text-red-600'
                              }`}>
                                <Clock className="h-4 w-4" />
                                {isOpenNow(brewery) ? 'Open Now' : 'Closed'}
                              </div>
                            </div>
                            {brewery.description && (
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {brewery.description}
                              </p>
                            )}
                          </div>
                          <div className="ml-4">
                            <a
                              href={`/breweries/${(brewery as any).slug || brewery.id}`}
                              className="inline-flex items-center justify-center rounded-md font-medium transition-colors h-8 px-3 text-sm bg-red-600 text-white hover:bg-red-700"
                            >
                              View Details
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Map */}
              {showMap && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Map className="h-5 w-5" />
                      Brewery Locations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isClient ? (
                      <GoogleMap
                        breweries={breweries}
                        height="400px"
                        showClusters={true}
                      />
                    ) : (
                      <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                        <div className="text-gray-500">Loading map...</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Related Pages */}
              {showRelatedPages && relatedPages.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Related Pages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {relatedPages.map((page, index) => (
                        <a
                          key={index}
                          href={page.url}
                          className="block p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors"
                        >
                          <div className="font-medium text-gray-900">{page.title}</div>
                          {page.description && (
                            <div className="text-sm text-gray-600 mt-1">
                              {page.description}
                            </div>
                          )}
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-black text-white py-8 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-yellow-400 font-semibold mb-2">Maryland Brewery Directory</p>
            <p className="text-sm text-gray-300">
              Supporting Maryland's craft brewing community since 2024
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
