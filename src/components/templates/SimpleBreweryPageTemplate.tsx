/**
 * Simplified BreweryPageTemplate - Client Component
 * Template for individual brewery pages
 */

"use client";

import { NextSeo } from 'next-seo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  Calendar,
  Users,
  Star,
  ExternalLink,
  ChevronRight,
  Facebook,
  Instagram,
  Twitter,
  Map
} from 'lucide-react';
import { Brewery } from '@/types/brewery';
import { BreadcrumbItem, RelatedPage } from '@/types/seo';

interface SimpleBreweryPageTemplateProps {
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

const getBreweryStatus = (brewery: Brewery): { status: string; color: string } => {
  const isOpen = isOpenNow(brewery);
  return {
    status: isOpen ? 'Open Now' : 'Closed',
    color: isOpen ? 'text-green-600' : 'text-red-600'
  };
};

const getCurrentDay = (): string => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
};

export default function SimpleBreweryPageTemplate({
  brewery,
  nearbyBreweries,
  title,
  metaDescription,
  breadcrumbs,
  relatedPages,
}: SimpleBreweryPageTemplateProps) {
  
  const breweryStatus = getBreweryStatus(brewery);
  const isOpen = isOpenNow(brewery);
  const currentDay = getCurrentDay();

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
        streetAddress: brewery.address,
        addressLocality: brewery.city,
        addressRegion: brewery.state,
        postalCode: brewery.zipCode,
        addressCountry: 'US',
      },
    };

    if (brewery.latitude && brewery.longitude) {
      structuredData.geo = {
        '@type': 'GeoCoordinates',
        latitude: brewery.latitude,
        longitude: brewery.longitude,
      };
    }

    if (brewery.website) {
      structuredData.url = brewery.website;
    }

    if (brewery.socialMedia) {
      const sameAs = [];
      if (brewery.socialMedia.facebook) sameAs.push(brewery.socialMedia.facebook);
      if (brewery.socialMedia.instagram) sameAs.push(brewery.socialMedia.instagram);
      if (brewery.socialMedia.twitter) sameAs.push(brewery.socialMedia.twitter);
      if (sameAs.length > 0) {
        structuredData.sameAs = sameAs;
      }
    }

    return structuredData;
  };

  return (
    <>
      <NextSeo
        title={title}
        description={metaDescription}
        canonical={`https://marylandbrewery.com/breweries/${(brewery as any).slug || brewery.id}`}
        openGraph={{
          title,
          description: metaDescription,
          type: 'business.business',
          url: `https://marylandbrewery.com/breweries/${(brewery as any).slug || brewery.id}`,
          site_name: 'Maryland Brewery Directory',
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

            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{brewery.name}</h1>
                <div className="flex items-center gap-4 text-lg text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-5 w-5" />
                    {brewery.city}, {brewery.state}
                  </div>
                  <div className={`flex items-center gap-1 ${breweryStatus.color}`}>
                    <Clock className="h-5 w-5" />
                    {breweryStatus.status}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {brewery.phone && (
                  <a
                    href={`tel:${brewery.phone}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </a>
                )}
                {brewery.website && (
                  <a
                    href={brewery.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>About {brewery.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {brewery.description && (
                    <p className="text-gray-700 leading-relaxed">{brewery.description}</p>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">Location</h4>
                      <p className="text-gray-600">
                        {brewery.address}<br />
                        {brewery.city}, {brewery.state} {brewery.zipCode}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">Contact</h4>
                      <div className="space-y-1">
                        {brewery.phone && (
                          <p className="text-gray-600">
                            <Phone className="h-4 w-4 inline mr-2" />
                            <a href={`tel:${brewery.phone}`} className="hover:text-red-600">
                              {brewery.phone}
                            </a>
                          </p>
                        )}
                        {brewery.website && (
                          <p className="text-gray-600">
                            <Globe className="h-4 w-4 inline mr-2" />
                            <a 
                              href={brewery.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:text-red-600"
                            >
                              Visit Website
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Social Media */}
                  {brewery.socialMedia && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">Follow Us</h4>
                      <div className="flex gap-3">
                        {brewery.socialMedia.facebook && (
                          <a
                            href={brewery.socialMedia.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            <Facebook className="h-4 w-4" />
                            Facebook
                          </a>
                        )}
                        {brewery.socialMedia.instagram && (
                          <a
                            href={brewery.socialMedia.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
                          >
                            <Instagram className="h-4 w-4" />
                            Instagram
                          </a>
                        )}
                        {brewery.socialMedia.twitter && (
                          <a
                            href={brewery.socialMedia.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 bg-blue-400 text-white rounded-md hover:bg-blue-500 transition-colors"
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

              {/* Hours */}
              {brewery.hours && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(brewery.hours).map(([day, hours]) => (
                        <div 
                          key={day} 
                          className={`flex justify-between items-center p-2 rounded ${
                            day === currentDay ? 'bg-red-50 border border-red-200' : ''
                          }`}
                        >
                          <span className={`font-medium ${day === currentDay ? 'text-red-700' : 'text-gray-700'}`}>
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                          </span>
                          <span className={day === currentDay ? 'text-red-600 font-medium' : 'text-gray-600'}>
                            {hours || 'Closed'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Features */}
              {brewery.features && brewery.features.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Features & Amenities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {brewery.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {feature}
                        </Badge>
                      ))}
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
                  <div className="h-72 bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Map className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <div className="text-gray-500">Interactive Map</div>
                      <div className="text-sm text-gray-400">Click to view location</div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      {brewery.address}<br />
                      {brewery.city}, {brewery.state} {brewery.zipCode}
                    </p>
                    <a
                      href={`https://maps.google.com/?q=${brewery.latitude},${brewery.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 mt-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Get Directions
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Nearby Breweries */}
              {nearbyBreweries.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Nearby Breweries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {nearbyBreweries.slice(0, 3).map((nearbyBrewery) => (
                        <a
                          key={nearbyBrewery.id}
                          href={`/breweries/${(nearbyBrewery as any).slug || nearbyBrewery.id}`}
                          className="block p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors"
                        >
                          <div className="font-medium text-gray-900">{nearbyBrewery.name}</div>
                          <div className="text-sm text-gray-600">{nearbyBrewery.city}, {nearbyBrewery.state}</div>
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
