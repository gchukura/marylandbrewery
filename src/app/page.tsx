'use client';

import { useBreweries } from '@/hooks/use-breweries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Globe, Clock } from 'lucide-react';

export default function Home() {
  const { breweries, loading, error } = useBreweries();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-md-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading breweries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading breweries: {error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-md-red text-md-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-2">
            Maryland Brewery Directory
          </h1>
          <p className="text-center text-md-gold text-lg">
            Discover the best craft breweries across the Old Line State
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Featured Breweries
          </h2>
          <p className="text-gray-600">
            Explore {breweries.length} breweries across Maryland
          </p>
        </div>

        {/* Breweries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {breweries.map((brewery) => (
            <Card key={brewery.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl text-md-red">{brewery.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {brewery.city}, {brewery.state}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {brewery.description && (
                    <p className="text-gray-600 text-sm">{brewery.description}</p>
                  )}
                  
                  <div className="space-y-2">
                    {brewery.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <a 
                          href={`tel:${brewery.phone}`}
                          className="text-md-red hover:underline"
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
                          className="text-md-red hover:underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                    
                    {brewery.established && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Est. {brewery.established}</span>
                      </div>
                    )}
                  </div>

                  {brewery.features && brewery.features.length > 0 && (
                    <div className="pt-3">
                      <div className="flex flex-wrap gap-1">
                        {brewery.features.map((feature) => (
                          <span
                            key={feature}
                            className="inline-block bg-md-gold text-md-black text-xs px-2 py-1 rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {breweries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No breweries found.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-md-black text-md-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-md-gold font-semibold mb-2">Maryland Brewery Directory</p>
          <p className="text-sm text-gray-300">
            Supporting Maryland's craft brewing community since 2024
          </p>
        </div>
      </footer>
    </div>
  );
}
