"use client";

import React, { useState, useMemo } from 'react';
import { Brewery } from '@/types/brewery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Link from 'next/link';

interface BreweryTableProps {
  breweries: Brewery[];
}

interface FilterState {
  search: string;
  city: string;
  type: string;
  amenity: string;
  sortBy: 'name' | 'city' | 'type';
  sortOrder: 'asc' | 'desc';
}

export default function BreweryTable({ breweries }: BreweryTableProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    city: 'all',
    type: 'all',
    amenity: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Get unique values for filter dropdowns
  const uniqueCities = useMemo(() => {
    const cities = new Set(breweries.map(b => b.city));
    return ['all', ...Array.from(cities).sort()];
  }, [breweries]);

  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    breweries.forEach(b => b.type.forEach(type => types.add(type)));
    return ['all', ...Array.from(types).sort()];
  }, [breweries]);

  const uniqueAmenities = useMemo(() => {
    const amenities = new Set<string>();
    breweries.forEach(b => b.amenities?.forEach(a => amenities.add(a)));
    return ['all', ...Array.from(amenities).sort()];
  }, [breweries]);

  // Filter and sort breweries
  const filteredBreweries = useMemo(() => {
    const filtered = breweries.filter(brewery => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          brewery.name.toLowerCase().includes(searchTerm) ||
          brewery.city.toLowerCase().includes(searchTerm) ||
          brewery.description?.toLowerCase().includes(searchTerm) ||
          brewery.amenities?.some(a => a.toLowerCase().includes(searchTerm));
        if (!matchesSearch) return false;
      }

      // City filter
      if (filters.city !== 'all' && brewery.city !== filters.city) {
        return false;
      }

      // Type filter
      if (filters.type !== 'all' && !brewery.type.includes(filters.type)) {
        return false;
      }

      // Amenity filter
      if (filters.amenity !== 'all' && !brewery.amenities?.some(a => a === filters.amenity)) {
        return false;
      }

      return true;
    });

    // Sort breweries
    filtered.sort((a, b) => {
      let aValue: string;
      let bValue: string;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'city':
          aValue = a.city;
          bValue = b.city;
          break;
        case 'type':
          aValue = a.type.join(', ');
          bValue = b.type.join(', ');
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (filters.sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    return filtered;
  }, [breweries, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredBreweries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBreweries = filteredBreweries.slice(startIndex, startIndex + itemsPerPage);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSort = (sortBy: 'name' | 'city' | 'type') => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      city: 'all',
      type: 'all',
      amenity: 'all',
      sortBy: 'name',
      sortOrder: 'asc'
    });
    setCurrentPage(1);
  };

  return (
    <Card className="w-full border border-line shadow-sm">
      <CardHeader className="border-b border-line">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-ink">
            Breweries <span className="text-brand-red">({filteredBreweries.length})</span>
          </CardTitle>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 border-line-strong text-brand-red hover:bg-cream hover:border-line-strong"
          >
            <Filter className="h-4 w-4" />
            Filters
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
              <Input
                placeholder="Search breweries..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10"
              />
            </div>
            <Button variant="secondary" onClick={clearFilters}>
              Clear
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-cream rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <select
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {uniqueCities.map(city => (
                    <option key={city} value={city}>
                      {city === 'all' ? 'All Cities' : city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {uniqueTypes.map(type => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'All Types' : type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Amenity</label>
                <select
                  value={filters.amenity}
                  onChange={(e) => handleFilterChange('amenity', e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {uniqueAmenities.map(amenity => (
                    <option key={amenity} value={amenity}>
                      {amenity === 'all' ? 'All Amenities' : amenity}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-line bg-cream">
                <th 
                  className="text-left p-4 cursor-pointer hover:bg-cream transition-colors font-medium text-ink"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Name
                    {filters.sortBy === 'name' && (
                      <span className="text-brand-red text-sm">
                        {filters.sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="text-left p-4 cursor-pointer hover:bg-cream transition-colors font-medium text-ink"
                  onClick={() => handleSort('city')}
                >
                  <div className="flex items-center gap-2">
                    City
                    {filters.sortBy === 'city' && (
                      <span className="text-brand-red text-sm">
                        {filters.sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="text-left p-4 cursor-pointer hover:bg-cream transition-colors font-medium text-ink"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center gap-2">
                    Type
                    {filters.sortBy === 'type' && (
                      <span className="text-brand-red text-sm">
                        {filters.sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedBreweries.map((brewery, index) => (
                <tr key={brewery.id} className={`border-b border-line hover:bg-cream transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-cream'}`}>
                  <td className="p-4">
                    <Link 
                      href={`/breweries/${brewery.slug}`}
                      className="font-medium text-ink hover:text-brand-red transition-colors"
                    >
                      {brewery.name}
                    </Link>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-sm text-muted">
                      <MapPin className="h-4 w-4 text-brand-red" />
                      {brewery.city}, {brewery.state}
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge className="capitalize">
                      {brewery.type}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredBreweries.length)} of {filteredBreweries.length} breweries
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-3 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {filteredBreweries.length === 0 && (
          <div className="text-center py-8 text-muted">
            No breweries found matching your filters.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
