/**
 * Simplified ProgrammaticPageTemplate - Client Component
 * Used for brewery listings by city, county, type, amenity, etc.
 */

"use client";

// Removed NextSeo to avoid SSR context issues; use page metadata instead
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Globe, Clock, Users, Map, ChevronRight } from 'lucide-react';
import { Brewery } from '@/types/brewery';
// Local layout system
import PageContainer from '@/components/layout/PageContainer';
import SectionHeader from '@/components/layout/SectionHeader';
import ContentWithSidebar from '@/components/layout/ContentWithSidebar';
import GridContainer from '@/components/layout/GridContainer';

interface SimpleProgrammaticPageTemplateProps {
  // Page content
  title: string;
  metaDescription: string;
  h1: string;
  introText: string;
  
  // Data
  breweries: Brewery[];
  stats: any;
  breadcrumbs: any[];
  relatedPages: any[];
  
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
  return true; // simplified indicator
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
  // Structured Data
  const sd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description: metaDescription,
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(sd) }} />

      <div className="min-h-screen bg-gray-50">
        <PageContainer>
          {/* Breadcrumbs */}
          <nav className="flex items-center text-sm text-gray-600 py-4">
            {breadcrumbs.map((item: any, index: number) => (
              <div key={index} className="flex items-center">
                {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
                <a 
                  href={item.url} 
                  className={`transition-colors ${
                    item.isActive 
                      ? 'text-gray-900 font-medium' 
                      : 'hover:text-md-red'
                  }`}
                >
                  {item.name}
                </a>
              </div>
            ))}
          </nav>

          <SectionHeader title={h1} subtitle={introText} />

          <ContentWithSidebar
            stickySidebar
            sidebar={(
              <div className="space-y-6">
                {showMap && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Map className="h-5 w-5" /> Brewery Locations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-500">Interactive Map</div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {showRelatedPages && relatedPages.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Related Pages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {relatedPages.map((page: any, i: number) => (
                          <a key={i} href={page.url} className="block p-3 rounded-lg border border-gray-200 hover:border-md-red hover:bg-md-red/5 transition-colors">
                            <div className="font-medium text-gray-900">{page.title}</div>
                            {page.description && <div className="text-sm text-gray-600 mt-1">{page.description}</div>}
                          </a>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          >
            <div className="space-y-6">
              {showStats && stats && (
                <Card className="card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> {stats.title}</CardTitle>
                    {stats.description && <CardDescription>{stats.description}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {stats.stats.map((s: any, idx: number) => (
                        <div key={idx} className="text-center">
                          <div className="text-h2 font-bold text-md-red">{s.value}</div>
                          <div className="text-small text-gray-600">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="card">
                <CardHeader>
                  <CardTitle>Breweries ({breweries.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <GridContainer>
                    {breweries.map((brewery) => (
                      <div key={brewery.id} className="card card-hover border-l-4 border-l-md-red">
                        <div className="p-4">
                          <h3 className="text-h3 font-semibold text-gray-900 mb-2">{brewery.name}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1"><MapPin className="h-4 w-4" />{brewery.city}, {brewery.state}</div>
                            {brewery.phone && (
                              <div className="flex items-center gap-1"><Phone className="h-4 w-4" /><a href={`tel:${brewery.phone}`} className="hover:text-md-red">{brewery.phone}</a></div>
                            )}
                            {brewery.website && (
                              <div className="flex items-center gap-1"><Globe className="h-4 w-4" /><a href={brewery.website} target="_blank" rel="noopener noreferrer" className="hover:text-md-red">Website</a></div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mb-2"><Clock className="h-4 w-4" /><span className={isOpenNow(brewery) ? 'text-status-open' : 'text-status-closed'}>{isOpenNow(brewery) ? 'Open Now' : 'Closed'}</span></div>
                          {brewery.description && (<p className="text-gray-600 text-sm mb-3 line-clamp-2">{brewery.description}</p>)}
                          {(brewery as any).features && (brewery as any).features.length > 0 && (
                            <div className="flex flex-wrap gap-1"><Badge variant="secondary" className="text-xs">{(brewery as any).features.slice(0, 3).join(' • ')}</Badge></div>
                          )}
                          <div className="mt-3">
                            <a href={`/breweries/${(brewery as any).slug || brewery.id}`} className="btn btn-secondary-red">View Details</a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </GridContainer>
                </CardContent>
              </Card>
            </div>
          </ContentWithSidebar>
        </PageContainer>
      </div>
    </>
  );
}
