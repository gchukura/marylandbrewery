"use client";

import { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { MapPin, Phone, Globe, Search, Filter, X, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import BreweryLogo from '@/components/brewery/BreweryLogo';

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get unique values for filters
  const uniqueCities = useMemo(() => {
    const cities = new Set(breweries.map(b => b.city).filter(Boolean));
    return Array.from(cities).sort();
  }, [breweries]);

  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    breweries.forEach(b => {
      if (Array.isArray(b.type)) {
        b.type.forEach((t: string) => types.add(t));
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
        (Array.isArray(b.type) ? b.type.some((t: string) => t.toLowerCase().includes(typeLower)) : 
         b.type?.toLowerCase().includes(typeLower));

      const amenityList: string[] = (b.amenities || b.features || []) as string[];
      const matchesAmenity = !amenityLower || 
        amenityList.some((a: string) => a?.toLowerCase().includes(amenityLower));

      return matchesSearch && matchesCity && matchesType && matchesAmenity;
    });
  }, [breweries, search, city, type, amenity]);

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBreweries = filtered.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, city, type, amenity]);

  const clearFilters = () => {
    setSearch('');
    setCity('');
    setType('');
    setAmenity('');
    setCurrentPage(1);
  };

  const hasActiveFilters = search || city || type || amenity;

  const goToPage = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of list
    const listElement = document.getElementById('brewery-list');
    if (listElement) {
      listElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[650px_1fr] gap-4 max-w-[1700px] mx-auto">
      {/* Left Side - Filterable List */}
      <div className="flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden h-[600px] lg:h-[1000px]">
        {/* Filter Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-3 gap-2">
            <select
              className="px-2 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="">All Cities</option>
              {uniqueCities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              className="px-2 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">All Types</option>
              {uniqueTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select
              className="px-2 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
            Showing {startIndex + 1}-{Math.min(endIndex, filtered.length)} of {filtered.length} breweries
            {filtered.length !== breweries.length && ` (filtered from ${breweries.length} total)`}
          </div>
        </div>

        {/* Brewery List - Scrollable */}
        <div id="brewery-list" className="flex-1 overflow-y-auto min-h-0">
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
              {paginatedBreweries.map((brewery) => {
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
                    <div className="flex items-start gap-3">
                      {/* Logo on the left - square with border like inspiration */}
                      {brewery.logo ? (
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 border-2 border-gray-300 rounded bg-white flex items-center justify-center p-1.5 shadow-sm">
                            <BreweryLogo 
                              logo={brewery.logo} 
                              breweryName={brewery.name}
                              size="sm"
                              className="w-full h-full"
                            />
                          </div>
                        </div>
                      ) : (
                        // Placeholder for breweries without logos
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 border-2 border-gray-200 rounded bg-gray-50 flex items-center justify-center">
                            <div className="text-gray-400 text-xs font-semibold text-center px-1">
                              {brewery.name?.substring(0, 2).toUpperCase() || 'BW'}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Content on the right */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 hover:text-red-600 text-sm">
                            {brewery.name}
                          </h3>
                          {brewery.googleRating && (
                            <div className="flex items-center gap-0.5">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-medium text-gray-700">
                                {brewery.googleRating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          <div className="flex items-start">
                            <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              {brewery.street && (
                                <div>{brewery.street}</div>
                              )}
                              <div>
                                {[brewery.city, brewery.state, brewery.zip]
                                  .filter(Boolean)
                                  .join(', ')}
                              </div>
                              {brewery.type && (
                                <div className="mt-1">
                                  <span className="text-gray-500">
                                    {Array.isArray(brewery.type) ? brewery.type.join(', ') : brewery.type}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
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

        {/* Pagination */}
        {filtered.length > itemsPerPage && (
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-1 text-sm border rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? 'bg-red-600 text-white border-red-600'
                          : 'border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Side - Map */}
      <div className="flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden h-[600px] lg:h-[1000px]">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Interactive Map</h2>
          <p className="text-sm text-gray-600 mt-1">
            Click on markers or list items to explore breweries
          </p>
        </div>
        <div className="flex-1 min-h-0 relative">
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

