/**
 * BreweryGrid - CSS Grid Layout for Brewery Lists
 * Optimized for rendering 140+ breweries with pagination
 */

"use client";

import { useState, useEffect } from 'react';
import { Brewery } from '@/types/brewery';
import BreweryCard from './BreweryCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Grid, List } from 'lucide-react';

interface BreweryGridProps {
  breweries: Brewery[];
  itemsPerPage?: number;
  showPagination?: boolean;
  showViewToggle?: boolean;
  className?: string;
  cardClassName?: string;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Button>

      <div className="flex items-center space-x-1">
        {getVisiblePages().map((page, index) => (
          page === '...' ? (
            <span key={index} className="px-3 py-2 text-gray-500">...</span>
          ) : (
            <Button
              key={index}
              variant={currentPage === page ? "primary" : "outline"}
              size="sm"
              onClick={() => onPageChange(page as number)}
              className="min-w-[40px]"
            >
              {page}
            </Button>
          )
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center"
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-6 animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="flex space-x-2">
              <div className="h-6 w-12 bg-gray-200 rounded"></div>
              <div className="h-6 w-16 bg-gray-200 rounded"></div>
              <div className="h-6 w-14 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BreweryGrid({
  breweries,
  itemsPerPage = 12,
  showPagination = true,
  showViewToggle = true,
  className = '',
  cardClassName = ''
}: BreweryGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Calculate pagination
  const totalPages = Math.ceil(breweries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBreweries = breweries.slice(startIndex, endIndex);

  // Reset to first page when breweries change
  useEffect(() => {
    setCurrentPage(1);
  }, [breweries]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of grid
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (breweries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">No breweries found</div>
        <p className="text-gray-400 mt-2">Try adjusting your search criteria</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header with count and view toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, breweries.length)} of {breweries.length} breweries
        </div>
        
        {showViewToggle && (
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="flex items-center"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="flex items-center"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Grid/List Layout */}
      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
      }>
        {currentBreweries.map((brewery) => (
          <BreweryCard
            key={brewery.id}
            brewery={brewery}
            className={viewMode === 'list' ? 'flex flex-row' : cardClassName}
          />
        ))}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

// Export loading skeleton for use in other components
export { LoadingSkeleton };
