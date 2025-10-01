/**
 * Simplified ProgrammaticPageTemplate - Client Component
 * Used for brewery listings by city, county, type, amenity, etc.
 */

"use client";

import { NextSeo } from 'next-seo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Globe, Clock, Users, Map, ExternalLink, ChevronRight } from 'lucide-react';
import { Brewery } from '@/types/brewery';
import { BreadcrumbItem, RelatedPage } from '@/types/seo';
import { StatisticsBlock } from '@/types/content';

interface SimpleProgrammaticPageTemplateProps {
  // Page content
  title: string;
  metaDescription: string;
  h1: string;
  introText: string;
  
  // Data
  breweries: Brewery[];
  stats: StatisticsBlock;
  breadcrumbs: BreadcrumbItem[];
  relatedPages: RelatedPage[];
  
  // Page configuration
  pageType: 'city' | 'county' | 'type' | 'amenity' | 'search';
  showMap?: boolean;
  showStats?: boolean;
  showRelatedPages?: boolean;
  currentFilters?: {
    city?: string;
    county?: string;
    type?: string;
    amenity?: string;
  };
}

// Simple utility functions (no hooks)
const isOpenNow = (brewery: Brewery): boolean => {
  if (!brewery.hours) return false;
  
  const now = new Date();
  const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5);
  
  const hours = brewery.hours[day as keyof typeof brewery.hours];
  if (!hours || hours === 'Closed') return false;
  
  // Simple time comparison (this is basic - you'd want more robust parsing)
  return true; // Simplified for now
};

const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 5280)} ft`;
  }
  return `${distance.toFixed(1)} mi`;
};

export default function SimpleProgrammaticPageTemplate({
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
}: SimpleProgrammaticPageTemplateProps) {
  
  // Generate structured data based on page type
  const generateStructuredData = () => {
    const baseStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      description: metaDescription,
    };

    if (pageType === 'city' && currentFilters.city) {
      return {
        ...baseStructuredData,
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
            },
          })),
        },
      };
    }

    return baseStructuredData;
  };

  return (
    <>
      <NextSeo
        title={title}
        description={metaDescription}
        canonical={`https://marylandbrewery.com${typeof window !== 'undefined' ? window.location.pathname : ''}`}
        openGraph={{
          title,
          description: metaDescription,
          type: 'website',
          url: `https://marylandbrewery.com${typeof window !== 'undefined' ? window.location.pathname : ''}`,
        }}
        additionalMetaTags={[
          {
            name: 'robots',
            content: 'index, follow',
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
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            {/* Breadcrumbs */}
            <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
              {breadcrumbs.map((item, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
                  {item.isActive ? (
                    <span className="text-gray-900 font-medium">{item.name}</span>
                  ) : (
                    <a href={item.url} className="hover:text-red-600">
                      {item.name}
                    </a>
                  )}
                </div>
              ))}
            </nav>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">{h1}</h1>
            <p className="text-lg text-gray-600 max-w-3xl">{introText}</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Statistics */}
              {showStats && stats && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {stats.title}
                    </CardTitle>
                    {stats.description && (
                      <CardDescription>{stats.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {stats.stats.map((stat, index) => (
                        <div key={index} className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {stat.value}
                          </div>
                          <div className="text-sm text-gray-600">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Breweries List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Breweries ({breweries.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {breweries.map((brewery) => (
                      <Card key={brewery.id} className="border-l-4 border-l-red-600">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {brewery.name}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {brewery.city}, {brewery.state}
                                </div>
                                {brewery.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-4 w-4" />
                                    <a href={`tel:${brewery.phone}`} className="hover:text-red-600">
                                      {brewery.phone}
                                    </a>
                                  </div>
                                )}
                                {brewery.website && (
                                  <div className="flex items-center gap-1">
                                    <Globe className="h-4 w-4" />
                                    <a 
                                      href={brewery.website} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="hover:text-red-600"
                                    >
                                      Website
                                    </a>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-1 mb-2">
                                <Clock className="h-4 w-4" />
                                <span className={isOpenNow(brewery) ? 'text-green-600' : 'text-red-600'}>
                                  {isOpenNow(brewery) ? 'Open Now' : 'Closed'}
                                </span>
                              </div>
                              {brewery.description && (
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                  {brewery.description}
                                </p>
                              )}
                              {brewery.features && brewery.features.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {brewery.features.slice(0, 3).map((feature, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {feature}
                                    </Badge>
                                  ))}
                                  {brewery.features.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{brewery.features.length - 3} more
                                    </Badge>
                                  )}
                                </div>
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
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Map Placeholder */}
              {showMap && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Map className="h-5 w-5" />
                      Brewery Locations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Map className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <div className="text-gray-500">Interactive Map</div>
                        <div className="text-sm text-gray-400">Click to view locations</div>
                      </div>
                    </div>
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
                            <div className="text-sm text-gray-600 mt-1">{page.description}</div>
                          )}
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
