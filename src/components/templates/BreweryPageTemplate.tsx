/**
 * BreweryPageTemplate - Template for individual brewery pages
 * Displays comprehensive brewery information with dynamic status and nearby breweries
 */

"use client";

import { NextSeo } from 'next-seo';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  Users, 
  Map, 
  ExternalLink, 
  ChevronRight,
  Facebook,
  Instagram,
  Twitter,
  Calendar,
  Star,
  Navigation
} from 'lucide-react';
import { Brewery } from '@/types/brewery';
import { BreadcrumbItem, RelatedPage } from '@/types/seo';
import { isOpenNow, getBreweryStatus, formatDistance, calculateDistance } from '@/lib/data-utils';
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

interface BreweryPageTemplateProps {
  // Brewery data
  brewery: Brewery;
  nearbyBreweries: Brewery[];
  
  // SEO
  title: string;
  metaDescription: string;
  
  // Navigation
  breadcrumbs: BreadcrumbItem[];
  relatedPages: RelatedPage[];
}

export default function BreweryPageTemplate({
  brewery,
  nearbyBreweries,
  title,
  metaDescription,
  breadcrumbs,
  relatedPages,
}: BreweryPageTemplateProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'hours' | 'amenities'>('overview');
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const breweryStatus = getBreweryStatus(brewery);
  const isOpen = isOpenNow(brewery);

  // Generate structured data for individual brewery
  const generateStructuredData = () => {
    const structuredData: any = {
      '@context': 'https://schema.org',
      '@type': 'Brewery',
      name: brewery.name,
      description: brewery.description,
      url: `https://marylandbrewery.com/breweries/${(brewery as any).slug || brewery.id}`,
      telephone: brewery.phone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: (brewery as any).street || '',
        addressLocality: brewery.city,
        addressRegion: brewery.state,
        postalCode: (brewery as any).zip || '',
        addressCountry: 'US',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: brewery.latitude,
        longitude: brewery.longitude,
      },
      sameAs: [
        brewery.website,
        (brewery as any).socialMedia?.facebook,
        (brewery as any).socialMedia?.instagram,
        (brewery as any).socialMedia?.twitter,
      ].filter(Boolean),
    };

    // Add opening hours if available
    if (brewery.hours && Object.values(brewery.hours).some(hour => hour)) {
      structuredData.openingHoursSpecification = Object.entries(brewery.hours)
        .filter(([_, hours]) => hours)
        .map(([day, hours]) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: `https://schema.org/${day.charAt(0).toUpperCase() + day.slice(1)}`,
          opens: hours?.split(' - ')[0] || '',
          closes: hours?.split(' - ')[1] || '',
        }));
    }

    return structuredData;
  };

  // Get current day for hours highlighting
  const getCurrentDay = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  };

  const currentDay = getCurrentDay();

  return (
    <>
      <NextSeo
        title={title}
        description={metaDescription}
        canonical={`https://marylandbrewery.com/breweries/${(brewery as any).slug || brewery.id}`}
        openGraph={{
          title,
          description: metaDescription,
          type: 'website',
          url: `https://marylandbrewery.com/breweries/${(brewery as any).slug || brewery.id}`,
          siteName: 'Maryland Brewery Directory',
          images: [
            {
              url: `https://marylandbrewery.com/api/og?title=${encodeURIComponent(brewery.name)}&location=${encodeURIComponent(brewery.city)}`,
              width: 1200,
              height: 630,
              alt: `${brewery.name} - Maryland Brewery`,
            },
          ],
        }}
        additionalMetaTags={[
          {
            name: 'keywords',
            content: `${brewery.name}, ${brewery.city} brewery, Maryland craft beer, ${(brewery as any).type || 'brewery'}, brewery directory`,
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

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold mb-4">{brewery.name}</h1>
                <div className="flex items-center gap-4 text-xl text-yellow-200 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {brewery.city}, {brewery.state}
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`${
                      isOpen 
                        ? 'bg-green-100 text-green-800 border-green-300' 
                        : 'bg-red-100 text-red-800 border-red-300'
                    }`}
                  >
                    {breweryStatus.status === 'open' ? 'Open Now' : 'Closed'}
                  </Badge>
                </div>
                {brewery.description && (
                  <p className="text-lg text-yellow-100 max-w-3xl">{brewery.description}</p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                {brewery.phone && (
                  <a
                    href={`tel:${brewery.phone}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black hover:bg-yellow-300 rounded-md font-medium transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    Call Now
                  </a>
                )}
                {brewery.website && (
                  <a
                    href={brewery.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black hover:bg-yellow-300 rounded-md font-medium transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    Visit Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                <a
                  href={`https://maps.google.com/?q=${brewery.latitude},${brewery.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black hover:bg-yellow-300 rounded-md font-medium transition-colors"
                >
                  <Navigation className="h-4 w-4" />
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'hours', label: 'Hours' },
                    { id: 'amenities', label: 'Amenities' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-red-500 text-red-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Brewery Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Type</label>
                          <p className="text-lg font-semibold capitalize">{(brewery as any).type || 'Brewery'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">County</label>
                          <p className="text-lg font-semibold">{(brewery as any).county || 'Unknown'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Address</label>
                          <p className="text-lg">
                            {(brewery as any).street || 'Address not available'}<br />
                            {brewery.city}, {brewery.state} {(brewery as any).zip || ''}
                          </p>
                        </div>
                        {(brewery as any).openedDate && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Established</label>
                            <p className="text-lg font-semibold">
                              {new Date((brewery as any).openedDate).getFullYear()}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contact Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {brewery.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="font-medium">Phone</p>
                              <a
                                href={`tel:${brewery.phone}`}
                                className="text-red-600 hover:underline"
                              >
                                {brewery.phone}
                              </a>
                            </div>
                          </div>
                        )}
                        {brewery.website && (
                          <div className="flex items-center gap-3">
                            <Globe className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="font-medium">Website</p>
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
                          </div>
                        )}
                      </div>

                      {/* Social Media */}
                      {((brewery as any).socialMedia?.facebook || (brewery as any).socialMedia?.instagram || (brewery as any).socialMedia?.twitter) && (
                        <div>
                          <p className="font-medium mb-3">Follow Us</p>
                          <div className="flex gap-3">
                            {(brewery as any).socialMedia?.facebook && (
                              <a
                                href={(brewery as any).socialMedia?.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                <Facebook className="h-4 w-4" />
                                Facebook
                              </a>
                            )}
                            {(brewery as any).socialMedia?.instagram && (
                              <a
                                href={(brewery as any).socialMedia?.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                              >
                                <Instagram className="h-4 w-4" />
                                Instagram
                              </a>
                            )}
                            {(brewery as any).socialMedia?.twitter && (
                              <a
                                href={(brewery as any).socialMedia?.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
                              >
                                <Twitter className="h-4 w-4" />
                                Twitter
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'hours' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Operating Hours</CardTitle>
                    <CardDescription>
                      {breweryStatus.message}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries((brewery as any).hours || {}).map(([day, hours]) => (
                        <div
                          key={day}
                          className={`flex justify-between items-center p-3 rounded-lg ${
                            day === currentDay
                              ? 'bg-red-50 border-2 border-red-200'
                              : 'bg-gray-50'
                          }`}
                        >
                          <span className="font-medium capitalize">
                            {day}
                            {day === currentDay && (
                              <Badge variant="secondary" className="ml-2 bg-red-100 text-red-800">
                                Today
                              </Badge>
                            )}
                          </span>
                          <span className={hours ? 'text-gray-900' : 'text-gray-500'}>
                            {hours as string || 'Closed'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'amenities' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Amenities & Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(brewery as any).amenities && (brewery as any).amenities.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {(brewery as any).amenities.map((amenity: string) => (
                          <div
                            key={amenity}
                            className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                          >
                            <Star className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm font-medium">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        No amenities information available
                      </p>
                    )}

                    {/* Additional Features */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="font-medium mb-4">Additional Features</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            (brewery as any).allowsVisitors ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                          <span className="text-sm">Allows Visitors</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            (brewery as any).offersTours ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                          <span className="text-sm">Offers Tours</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            (brewery as any).beerToGo ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                          <span className="text-sm">Beer To Go</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            (brewery as any).hasMerch ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                          <span className="text-sm">Merchandise</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Map */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Map className="h-5 w-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isClient ? (
                    <GoogleMap
                      breweries={[brewery]}
                      height="300px"
                      showClusters={false}
                      center={{ lat: brewery.latitude, lng: brewery.longitude }}
                      zoom={15}
                    />
                  ) : (
                    <div className="h-72 bg-gray-200 rounded-lg flex items-center justify-center">
                      <div className="text-gray-500">Loading map...</div>
                    </div>
                  )}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      {(brewery as any).street || 'Address not available'}<br />
                      {brewery.city}, {brewery.state} {(brewery as any).zip || ''}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Nearby Breweries */}
              {nearbyBreweries.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Nearby Breweries</CardTitle>
                    <CardDescription>
                      Other breweries in the area
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {nearbyBreweries.slice(0, 5).map((nearbyBrewery) => (
                        <a
                          key={nearbyBrewery.id}
                          href={`/breweries/${(nearbyBrewery as any).slug || nearbyBrewery.id}`}
                          className="block p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors"
                        >
                          <div className="font-medium text-gray-900">
                            {nearbyBrewery.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {nearbyBrewery.city}, {nearbyBrewery.state}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDistance(calculateDistance(brewery.latitude, brewery.longitude, nearbyBrewery.latitude, nearbyBrewery.longitude))} miles away
                          </div>
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Related Pages */}
              {relatedPages.length > 0 && (
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
