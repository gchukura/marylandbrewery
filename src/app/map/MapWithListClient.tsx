"use client";

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { MapPin, Phone, Globe, Search, Filter, X } from 'lucide-react';

const GoogleMap = dynamic(() => import('@/components/maps/GoogleMap'), { 
  ssr: false, 
  loading: () => (
    <div className="h-full w-full bg-gray-200 rounded-lg flex items-center justify-center">
      <div className="text-gray-500 text-sm">Loading map...</div>
    </div>
  )
});

interface MapWithListClientProps {
  breweries: any[];
}

export default function MapWithListClient({ breweries }: MapWithListClientProps) {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [amenity, setAmenity] = useState('');
  const [selectedBrewery, setSelectedBrewery] = useState<string | null>(null);

  // Get unique values for filters
  const uniqueCities = useMemo(() => {
    const cities = new Set(breweries.map(b => b.city).filter(Boolean));
    return Array.from(cities).sort();
  }, [breweries]);

  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    breweries.forEach(b => {
      if (Array.isArray(b.type)) {
        b.type.forEach(t => types.add(t));
      } else if (b.type) {
        types.add(b.type);
      }
    });
    return Array.from(types).sort();
  }, [breweries]);

  const uniqueAmenities = useMemo(() => {
    const amenities = new Set<string>();
    breweries.forEach(b => {
      const amenityList = (b.amenities || b.features || []) as string[];
      amenityList.forEach(a => amenities.add(a));
    });
    return Array.from(amenities).sort();
  }, [breweries]);

  // Filter breweries
  const filtered = useMemo(() => {
    return breweries.filter((b) => {
      const searchLower = search.trim().toLowerCase();
      const cityLower = city.trim().toLowerCase();
      const typeLower = type.trim().toLowerCase();
      const amenityLower = amenity.trim().toLowerCase();

      const matchesSearch = !searchLower || 
        b.name?.toLowerCase().includes(searchLower) ||
        b.city?.toLowerCase().includes(searchLower);

      const matchesCity = !cityLower || b.city?.toLowerCase().includes(cityLower);

      const matchesType = !typeLower || 
        (Array.isArray(b.type) ? b.type.some(t => t.toLowerCase().includes(typeLower)) : 
         b.type?.toLowerCase().includes(typeLower));

      const amenityList: string[] = (b.amenities || b.features || []) as string[];
      const matchesAmenity = !amenityLower || 
        amenityList.some(a => a?.toLowerCase().includes(amenityLower));

      return matchesSearch && matchesCity && matchesType && matchesAmenity;
    });
  }, [breweries, search, city, type, amenity]);

  const clearFilters = () => {
    setSearch('');
    setCity('');
    setType('');
    setAmenity('');
  };

  const hasActiveFilters = search || city || type || amenity;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
      {/* Left Side - Filterable List */}
      <div className="w-full lg:w-1/2 flex flex-col border-r border-gray-200 bg-white">
        {/* Filter Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Brewery Directory</h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search breweries..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-3 gap-2">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="">All Cities</option>
              {uniqueCities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">All Types</option>
              {uniqueTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={amenity}
              onChange={(e) => setAmenity(e.target.value)}
            >
              <option value="">All Amenities</option>
              {uniqueAmenities.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="mt-3 text-sm text-gray-600">
            Showing {filtered.length} of {breweries.length} breweries
          </div>
        </div>

        {/* Brewery List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No breweries found matching your filters.</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-2 text-red-600 hover:text-red-700 text-sm"
                >
                  Clear filters to see all breweries
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filtered.map((brewery) => {
                const slug = (brewery as any).slug || brewery.id;
                return (
                  <Link
                    key={brewery.id}
                    href={`/breweries/${slug}`}
                    className={`block p-4 hover:bg-gray-50 transition-colors ${
                      selectedBrewery === brewery.id ? 'bg-red-50 border-l-4 border-red-600' : ''
                    }`}
                    onMouseEnter={() => setSelectedBrewery(brewery.id)}
                    onMouseLeave={() => setSelectedBrewery(null)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1 hover:text-red-600">
                          {brewery.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{brewery.city}</span>
                          {brewery.type && (
                            <>
                              <span className="mx-2">•</span>
                              <span>{Array.isArray(brewery.type) ? brewery.type.join(', ') : brewery.type}</span>
                            </>
                          )}
                        </div>
                        {(brewery.amenities || brewery.features) && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {((brewery.amenities || brewery.features) as string[]).slice(0, 3).map((a: string) => (
                              <span
                                key={a}
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                              >
                                {a}
                              </span>
                            ))}
                            {((brewery.amenities || brewery.features) as string[]).length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{((brewery.amenities || brewery.features) as string[]).length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Map */}
      <div className="w-full lg:w-1/2 flex flex-col bg-gray-50">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Interactive Map</h2>
          <p className="text-sm text-gray-600 mt-1">
            Click on markers or list items to explore breweries
          </p>
        </div>
        <div className="flex-1 min-h-[400px]">
          {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
            <GoogleMap 
              breweries={filtered as any} 
              height="100%" 
              showClusters={true}
              zoom={9}
            />
          ) : (
            <div className="h-full w-full bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-600 px-4">
              Map is unavailable: missing Google Maps API key. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY and redeploy.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

