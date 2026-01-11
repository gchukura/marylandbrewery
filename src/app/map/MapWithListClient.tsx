"use client";

import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { MapPin, Phone, Globe, Search, Filter, X, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import BreweryLogo from '@/components/brewery/BreweryLogo';
import { slugify } from '@/lib/data-utils';

const GoogleMap = dynamic(() => import('@/components/maps/GoogleMap'), { 
  ssr: false, 
  loading: () => (
    <div className="h-full w-full bg-[#FAF9F6] rounded-lg flex items-center justify-center">
      <div className="text-[#6B6B6B] text-sm font-body">Loading map...</div>
    </div>
  )
});

interface MapWithListClientProps {
  breweries: any[];
}

export default function MapWithListClient({ breweries }: MapWithListClientProps) {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [search, setSearch] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Update search when URL parameter changes
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    if (urlSearch !== search) {
      setSearch(urlSearch);
    }
  }, [searchParams, search]);

  // Filter breweries
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
  const paginatedBreweries = filtered.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const clearFilters = () => {
    setSearch('');
    setCurrentPage(1);
  };

  const hasActiveFilters = search;

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
      <div className="flex flex-col bg-white border border-[#E8E6E1] rounded-lg overflow-hidden h-[600px] lg:h-[1000px]">
        {/* Filter Header */}
        <div className="p-4 border-b border-[#E8E6E1] bg-[#FAF9F6] flex-shrink-0 font-body">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1C1C1C] font-display">Brewery Directory</h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-[#9B2335] hover:text-[#7A1C2A] flex items-center gap-1 font-body"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6B6B6B]" />
            <input
              type="text"
              placeholder="Search breweries..."
              className="w-full pl-10 pr-4 py-2 border border-[#E8E6E1] rounded-lg focus:ring-2 focus:ring-[#9B2335] focus:border-transparent text-sm font-body"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Results Count */}
          <div className="mt-3 text-sm text-[#6B6B6B] font-body">
            Showing {startIndex + 1}-{Math.min(endIndex, filtered.length)} of {filtered.length} breweries
            {filtered.length !== breweries.length && ` (filtered from ${breweries.length} total)`}
          </div>
        </div>

        {/* Brewery List - Scrollable */}
        <div id="brewery-list" className="flex-1 overflow-y-auto min-h-0">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-[#6B6B6B] font-body">
              <p className="text-base font-medium mb-2">
                {search.trim() 
                  ? `No breweries found matching "${search}"`
                  : 'No breweries found matching your filters.'}
              </p>
              {search.trim() && (
                <p className="text-sm text-[#6B6B6B] mb-4">
                  Try searching by brewery name or a different city name.
                </p>
              )}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-2 text-[#9B2335] hover:text-[#7A1C2A] text-sm font-medium font-body"
                >
                  Clear filters to see all breweries
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-[#E8E6E1]">
              {paginatedBreweries.map((brewery) => {
                const slug = (brewery as any).slug || brewery.id;
                return (
                  <div
                    key={brewery.id}
<<<<<<< HEAD
                    href={`/breweries/${slug}`}
                    className="block p-4 font-body"
                  >
                    <div className="flex items-start gap-3">
                      {/* Logo on the left - square with border like inspiration */}
                      {brewery.logo ? (
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 border-2 border-[#E8E6E1] rounded bg-white flex items-center justify-center p-1.5 shadow-sm">
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
                          <div className="w-16 h-16 border-2 border-[#E8E6E1] rounded bg-[#FAF9F6] flex items-center justify-center">
                            <div className="text-[#6B6B6B] text-xs font-semibold text-center px-1 font-body">
                              {brewery.name?.substring(0, 2).toUpperCase() || 'BW'}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Content on the right - Two columns */}
                      <div className="flex-1 min-w-0 grid grid-cols-2 gap-4">
                        {/* Name Column */}
                        <div className="min-w-0">
                          <h3 className="font-semibold text-[#9B2335] text-base mb-1">
                            {brewery.name}
                          </h3>
                          {/* Maryland Brewery in City, MD */}
                          {brewery.city && (
                            <div className="text-sm font-bold text-[#1C1C1C] mb-1 font-body">
                              Maryland Brewery in {brewery.city}, MD
                            </div>
                          )}
                          {/* Reviews below name */}
                          {brewery.googleRating && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm text-[#1C1C1C] font-body">
                                {brewery.googleRating.toFixed(1)}{brewery.googleRatingCount ? ` - ${brewery.googleRatingCount} ${brewery.googleRatingCount === 1 ? 'review' : 'reviews'}` : ''}
                              </span>
                            </div>
                          )}
                          {(brewery.amenities || brewery.features) && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {((brewery.amenities || brewery.features) as string[]).slice(0, 3).map((a: string) => (
                                <span
                                  key={a}
                                  className="text-sm bg-[#FAF9F6] text-[#1C1C1C] px-2 py-1 rounded font-body"
                                >
                                  {a}
                                </span>
                              ))}
                              {((brewery.amenities || brewery.features) as string[]).length > 3 && (
                                <span className="text-sm text-[#6B6B6B] font-body">
                                  +{((brewery.amenities || brewery.features) as string[]).length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Address Column */}
                        <div className="min-w-0 text-sm text-[#6B6B6B] font-body">
                          <div className="flex items-start mb-1">
                            <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              {brewery.street && (
                                <div>{brewery.street}</div>
                              )}
                              <div>
                                {[brewery.city, brewery.state, brewery.zip]
                                  .filter(Boolean)
                                  .join(', ')}
                              </div>
                            </div>
                          </div>
                          {/* Phone below address */}
                          {brewery.phone && (
                            <div className="flex items-center gap-1 mt-1">
                              <Phone className="h-4 w-4 flex-shrink-0" />
                              <span>{brewery.phone}</span>
=======
                    className="p-4"
                    style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                  >
                    <Link
                      href={`/breweries/${slug}`}
                      className="block"
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
                        
                        {/* Content on the right - Two columns */}
                        <div className="flex-1 min-w-0 grid grid-cols-2 gap-4">
                          {/* Name Column */}
                          <div className="min-w-0">
                            <h3 className="font-semibold text-[#9B2335] text-sm mb-1">
                              {brewery.name}
                            </h3>
                            {/* Maryland Brewery in City, MD */}
                            {brewery.city && (
                              <div className="text-xs font-bold text-gray-700 mb-1">
                                Maryland Brewery in {brewery.city}, MD
                              </div>
                            )}
                            {/* Reviews below name - same star handling as brewery detail page */}
                            {(() => {
                              // Calculate the rating to display - use combined average if both Google and Yelp exist
                              const hasGoogle = brewery.googleRating && brewery.googleRating > 0 && brewery.googleRatingCount && brewery.googleRatingCount > 0;
                              const hasYelp = (brewery as any).yelpRating && (brewery as any).yelpRating > 0 && (brewery as any).yelpRatingCount && (brewery as any).yelpRatingCount > 0;
                              
                              let displayRating: number | null = null;
                              let totalReviewCount = 0;
                              
                              if (hasGoogle && hasYelp) {
                                // Calculate combined weighted average
                                const totalReviews = brewery.googleRatingCount! + (brewery as any).yelpRatingCount!;
                                displayRating = (brewery.googleRating! * brewery.googleRatingCount! + (brewery as any).yelpRating! * (brewery as any).yelpRatingCount!) / totalReviews;
                                totalReviewCount = totalReviews;
                              } else if (hasGoogle) {
                                displayRating = brewery.googleRating!;
                                totalReviewCount = (brewery as any).actualReviewCount || brewery.googleRatingCount || 0;
                              } else if (hasYelp) {
                                displayRating = (brewery as any).yelpRating!;
                                totalReviewCount = (brewery as any).yelpRatingCount || 0;
                              }
                              
                              if (!displayRating) return null;
                              
                              return (
                                <div className="flex items-center gap-1 mt-1">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => {
                                      const decimal = displayRating! % 1;
                                      const fullStars = Math.floor(displayRating!);
                                      // Round up to full star if decimal >= 0.75
                                      const effectiveFullStars = decimal >= 0.75 ? fullStars + 1 : fullStars;
                                      const hasHalfStar = decimal >= 0.25 && decimal < 0.75;
                                      const isFull = i < effectiveFullStars;
                                      const isHalf = i === fullStars && hasHalfStar;
                                      
                                      return (
                                        <div key={i} className="relative h-3 w-3 flex-shrink-0">
                                          {/* Base empty star */}
                                          <Star className="h-3 w-3 absolute text-gray-300" />
                                          {/* Full star overlay */}
                                          {isFull && (
                                            <Star className="h-3 w-3 absolute fill-[#D4A017] text-[#D4A017]" />
                                          )}
                                          {/* Half star overlay */}
                                          {isHalf && (
                                            <div className="absolute overflow-hidden" style={{ width: '50%' }}>
                                              <Star className="h-3 w-3 fill-[#D4A017] text-[#D4A017]" />
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <span className="text-xs font-semibold text-gray-700" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                                    {displayRating.toFixed(1)}
                                  </span>
                                  {totalReviewCount > 0 && (
                                    <span className="text-xs text-gray-500" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                                      ({totalReviewCount})
                                    </span>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                          
                          {/* Address Column */}
                          <div className="min-w-0 text-xs text-gray-600">
                            <div className="flex items-start mb-1">
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
                              </div>
>>>>>>> 258d37a6754b4a766d41d3d3f95f7bc9970ff784
                            </div>
                            {/* Phone below address */}
                            {brewery.phone && (
                              <div className="flex items-center gap-1 mt-1">
                                <Phone className="h-3 w-3 flex-shrink-0" />
                                <span>{brewery.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                    
                    {/* Amenities spanning full width below both columns - outside the Link to avoid nested anchors */}
                    {(() => {
                      const amenityList = (brewery.amenities || brewery.features || []) as string[];
                      if (!amenityList || amenityList.length === 0) return null;
                      
                      // Sort amenities alphabetically
                      const sortedAmenities = [...amenityList].sort((a, b) => 
                        (a || '').localeCompare(b || '', undefined, { sensitivity: 'base' })
                      );
                      
                      return (
                        <div className="flex flex-wrap gap-x-1.5 gap-y-1 mt-6">
                          {sortedAmenities.map((a: string) => {
                            if (!a) return null;
                            const amenitySlug = slugify(a);
                            return (
                              <Link
                                key={a}
                                href={`/amenities/${amenitySlug}`}
                                className="inline-flex items-center justify-center text-xs text-[#9B2335] bg-white border border-[#9B2335] hover:bg-[#9B2335] hover:text-white px-2 py-1 rounded transition-colors font-medium whitespace-nowrap"
                                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                              >
                                {a}
                              </Link>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {filtered.length > itemsPerPage && (
          <div className="p-3 sm:p-4 border-t border-[#E8E6E1] bg-[#FAF9F6]">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
              <div className="text-xs sm:text-sm text-[#6B6B6B] order-2 sm:order-1 whitespace-nowrap font-body">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 order-1 sm:order-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2.5 sm:p-2 border border-[#E8E6E1] rounded-lg hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center touch-manipulation font-body"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-5 w-5 sm:h-4 sm:w-4" />
                </button>
                
                {/* Page numbers - show fewer on mobile */}
                <div className="flex items-center gap-1">
                  {(() => {
                    const getVisiblePages = () => {
                      if (totalPages <= 3) {
                        return Array.from({ length: totalPages }, (_, i) => i + 1);
                      } else if (currentPage <= 2) {
                        return [1, 2, 3];
                      } else if (currentPage >= totalPages - 1) {
                        return [totalPages - 2, totalPages - 1, totalPages];
                      } else {
                        return [currentPage - 1, currentPage, currentPage + 1];
                      }
                    };
                    
                    const mobilePages = getVisiblePages();
                    const desktopPages = (() => {
                      if (totalPages <= 5) {
                        return Array.from({ length: totalPages }, (_, i) => i + 1);
                      } else if (currentPage <= 3) {
                        return [1, 2, 3, 4, 5];
                      } else if (currentPage >= totalPages - 2) {
                        return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                      } else {
                        return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
                      }
                    })();
                    
                    return desktopPages.map((pageNum) => {
                      const isVisibleOnMobile = mobilePages.includes(pageNum);
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`px-3 sm:px-3 py-2 sm:py-1 text-sm border rounded-lg transition-colors min-h-[44px] sm:min-h-[36px] min-w-[44px] sm:min-w-[36px] flex items-center justify-center touch-manipulation ${
                            isVisibleOnMobile ? 'flex' : 'hidden sm:flex'
                          } ${
                            currentPage === pageNum
                              ? 'bg-[#9B2335] text-white border-[#9B2335] font-body'
                              : 'border-[#E8E6E1] hover:bg-gray-100 active:bg-gray-200 font-body'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    });
                  })()}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2.5 sm:p-2 border border-[#E8E6E1] rounded-lg hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center touch-manipulation font-body"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-5 w-5 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Side - Map */}
      <div className="flex flex-col bg-white border border-[#E8E6E1] rounded-lg overflow-hidden h-[600px] lg:h-[1000px]">
        <div className="flex-1 min-h-0 relative">
          {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
            <GoogleMap 
              breweries={filtered as any} 
              height="100%" 
              showClusters={true}
              zoom={9}
            />
          ) : (
            <div className="h-full w-full bg-[#FAF9F6] rounded-lg flex items-center justify-center text-sm text-[#6B6B6B] px-4 font-body">
              Map is unavailable: missing Google Maps API key. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY and redeploy.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

