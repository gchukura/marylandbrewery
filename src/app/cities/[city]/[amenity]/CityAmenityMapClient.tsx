"use client";

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { MapPin, Phone, Search, X, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { slugify } from '@/lib/data-utils';
import BreweryLogo from '@/components/brewery/BreweryLogo';

const GoogleMap = dynamic(() => import('@/components/maps/GoogleMap'), { 
  ssr: false, 
  loading: () => (
    <div className="h-full w-full bg-gray-200 rounded-lg flex items-center justify-center">
      <div className="text-gray-500 text-sm">Loading map...</div>
    </div>
  )
});

interface CityAmenityMapClientProps {
  breweries: any[];
  cityName: string;
  amenityLabel: string;
  amenitySlug: string;
}

export default function CityAmenityMapClient({ breweries, cityName, amenityLabel, amenitySlug }: CityAmenityMapClientProps) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter breweries by search
  const filtered = useMemo(() => {
    return breweries.filter((b) => {
      const searchLower = search.trim().toLowerCase();
      const matchesSearch = !searchLower || 
        b.name?.toLowerCase().includes(searchLower) ||
        b.city?.toLowerCase().includes(searchLower);
      return matchesSearch;
    });
  }, [breweries, search]);

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginated = filtered.slice(startIndex, endIndex);

  // Map center - calculate from breweries or default to Maryland center
  const mapCenter = useMemo(() => {
    const breweriesWithCoords = breweries.filter(b => b.latitude && b.longitude);
    if (breweriesWithCoords.length > 0) {
      const avgLat = breweriesWithCoords.reduce((sum, b) => sum + b.latitude, 0) / breweriesWithCoords.length;
      const avgLng = breweriesWithCoords.reduce((sum, b) => sum + b.longitude, 0) / breweriesWithCoords.length;
      return { lat: avgLat, lng: avgLng };
    }
    return { lat: 39.0458, lng: -76.6413 }; // Maryland center
  }, [breweries]);

  // Filter breweries with valid coordinates for the map
  const breweriesWithCoords = useMemo(() => {
    return filtered.filter(b => b.latitude && b.longitude);
  }, [filtered]);

  // Pagination controls
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPaginationRange = () => {
    const delta = 2;
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l) {
        if (typeof i === 'number' && i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (typeof i === 'number' && i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = typeof i === 'number' ? i : l;
    }

    return rangeWithDots;
  };

  // Render star rating
  const renderStarRating = (rating: number | null | undefined) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
        <span className="text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Search and Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Brewery List */}
        <div className="w-full lg:w-1/2 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${amenityLabel.toLowerCase()} breweries in ${cityName}...`}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#9B2335] focus:border-transparent transition-all"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Results count */}
          <div className="text-sm text-gray-600" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            Showing {filtered.length} {filtered.length === 1 ? 'brewery' : 'breweries'}
            {search && ` matching "${search}"`}
          </div>

          {/* Brewery Cards */}
          <div className="space-y-4">
            {paginated.map((brewery) => {
              const brewerySlug = brewery.slug || slugify(brewery.name);
              const rating = brewery.googleRating || brewery.yelpRating;
              
              return (
                <div 
                  key={brewery.id || brewerySlug}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                      <BreweryLogo 
                        logo={brewery.logo || ''}
                        breweryName={brewery.name}
                        size="md"
                        className="rounded-lg"
                      />
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/breweries/${brewerySlug}`}
                        className="text-lg font-semibold text-[#1a1a1a] hover:text-[#9B2335] transition-colors line-clamp-1"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        {brewery.name}
                      </Link>
                      
                      {/* Rating */}
                      {rating && (
                        <div className="mt-1">
                          {renderStarRating(rating)}
                        </div>
                      )}
                      
                      {/* Address */}
                      {brewery.address && (
                        <div className="flex items-start gap-1.5 mt-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{brewery.address}</span>
                        </div>
                      )}
                      
                      {/* Phone */}
                      {brewery.phone && (
                        <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-600">
                          <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <a 
                            href={`tel:${brewery.phone}`}
                            className="hover:text-[#9B2335] transition-colors"
                          >
                            {brewery.phone}
                          </a>
                        </div>
                      )}

                      {/* Amenities preview */}
                      {brewery.amenities && brewery.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {brewery.amenities.slice(0, 3).map((amenity: string) => (
                            <span 
                              key={amenity}
                              className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-full"
                            >
                              {amenity}
                            </span>
                          ))}
                          {brewery.amenities.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{brewery.amenities.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  No breweries found matching your search.
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              {getPaginationRange().map((page, idx) => (
                typeof page === 'number' ? (
                  <button
                    key={idx}
                    onClick={() => handlePageChange(page)}
                    className={`min-w-[40px] h-10 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-[#9B2335] text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ) : (
                  <span key={idx} className="px-2 text-gray-400">...</span>
                )
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Map */}
        <div className="w-full lg:w-1/2">
          <div className="sticky top-4">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden" style={{ height: '600px' }}>
              <GoogleMap
                breweries={breweriesWithCoords}
                center={mapCenter}
                zoom={11}
                useFitBounds={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-[#FAF9F6] rounded-xl p-6 md:p-8 border border-gray-200">
        <h2 
          className="text-2xl font-bold text-[#1a1a1a] mb-4"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          About {amenityLabel} Breweries in {cityName}
        </h2>
        <div className="prose prose-gray max-w-none" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          <p className="text-gray-700 leading-relaxed">
            {cityName} offers {breweries.length} {breweries.length === 1 ? 'brewery' : 'breweries'} with {amenityLabel.toLowerCase()}, 
            providing excellent options for craft beer enthusiasts seeking this specific amenity. 
            These breweries enhance the local craft beer scene by combining quality beer with {amenityLabel.toLowerCase()}.
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            When visiting breweries with {amenityLabel.toLowerCase()} in {cityName}, you can expect 
            a welcoming atmosphere that caters to a variety of visitors. Each brewery offers its own 
            unique take on this amenity, so we encourage you to explore multiple spots to find your favorite.
          </p>
        </div>
      </div>

      {/* About Maryland Brewery Directory */}
      <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-200">
        <h2 
          className="text-2xl font-bold text-[#1a1a1a] mb-4"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          About Maryland Brewery Directory
        </h2>
        <div className="prose prose-gray max-w-none" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          <p className="text-gray-700 leading-relaxed">
            Maryland Brewery Directory is your comprehensive guide to the craft beer scene across Maryland. 
            We feature detailed information about breweries, taprooms, and brewpubs throughout the state, 
            helping you discover new favorites and plan your next brewery adventure.
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            Whether you're a local looking for your next taproom visit or a visitor exploring Maryland's 
            craft beer offerings, our directory provides up-to-date information including hours, locations, 
            amenities, and more to help you make the most of your brewery experiences.
          </p>
        </div>
      </div>
    </div>
  );
}

