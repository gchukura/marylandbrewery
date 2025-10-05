'use client';

import { useState, useEffect } from 'react';
import { Brewery, BreweryFilters, BrewerySortOptions } from '@/types/brewery';
import { ApiResponse, PaginatedResponse } from '@/types/api';

interface UseBreweriesOptions {
  filters?: BreweryFilters;
  sort?: {
    field: BrewerySortOptions;
    direction: 'asc' | 'desc';
  };
  page?: number;
  limit?: number;
}

interface UseBreweriesReturn {
  breweries: Brewery[];
  loading: boolean;
  error: string | null;
  pagination: PaginatedResponse<Brewery>['pagination'] | null;
  refetch: () => Promise<void>;
}

export function useBreweries(options: UseBreweriesOptions = {}): UseBreweriesReturn {
  const [breweries, setBreweries] = useState<Brewery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginatedResponse<Brewery>['pagination'] | null>(null);

  const fetchBreweries = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      
      if (options.filters?.city) params.append('city', options.filters.city);
      if (options.filters?.amenity) {
        params.append('amenity', options.filters.amenity);
      }
      if (options.filters?.search) params.append('search', options.filters.search);
      if (options.sort?.field) params.append('sortField', options.sort.field);
      if (options.sort?.direction) params.append('sortDirection', options.sort.direction);
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());

      const response = await fetch(`/api/breweries?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<PaginatedResponse<Brewery>> = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch breweries');
      }

      setBreweries(result.data.data);
      setPagination(result.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBreweries();
  }, [options.filters, options.sort, options.page, options.limit]);

  return {
    breweries,
    loading,
    error,
    pagination,
    refetch: fetchBreweries,
  };
}
