import { NextRequest, NextResponse } from 'next/server';
import { getAllBreweryData } from '../../../../lib/brewery-data';
import { ApiResponse, PaginatedResponse } from '@/types/api';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const city = searchParams.get('city');
    const county = searchParams.get('county');
    const type = searchParams.get('type');
    const amenity = searchParams.get('amenity');
    const search = searchParams.get('search');
    const sortField = searchParams.get('sortField') || 'name';
    const sortDirection = searchParams.get('sortDirection') as 'asc' | 'desc' || 'asc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get brewery data from Supabase
    const breweries = await getAllBreweryData();
    
    // Transform data to match frontend expectations
    const transformedBreweries = breweries.map(brewery => ({
      id: brewery.id,
      name: brewery.name,
      address: brewery.street,
      city: brewery.city,
      state: brewery.state,
      zipCode: brewery.zip,
      county: brewery.county, // Add county field
      type: brewery.type, // Add type field
      phone: brewery.phone,
      website: brewery.website?.startsWith('http') ? brewery.website : `https://${brewery.website}`,
      email: undefined, // Not in Google Sheets
      description: brewery.description,
      latitude: brewery.latitude,
      longitude: brewery.longitude,
      established: brewery.openedDate,
      hours: brewery.hours,
      features: brewery.amenities,
      socialMedia: brewery.socialMedia,
      images: [], // Not in Google Sheets
      isActive: true, // Assume all are active
      createdAt: brewery.lastUpdated,
      updatedAt: brewery.lastUpdated,
    }));
    
    // Apply filters
    const filteredBreweries = transformedBreweries.filter((brewery) => {
      if (city && brewery.city.toLowerCase() !== city.toLowerCase()) return false;
      if (county && brewery.county?.toLowerCase() !== county.toLowerCase()) return false;
      if (type) {
        const breweryType = Array.isArray(brewery.type) ? brewery.type.join(', ') : brewery.type;
        if (breweryType?.toLowerCase() !== type.toLowerCase()) return false;
      }
      if (amenity && !brewery.features?.some(a => a.toLowerCase().includes(amenity.toLowerCase()))) return false;
      if (search && !brewery.name.toLowerCase().includes(search.toLowerCase()) && 
          !brewery.city.toLowerCase().includes(search.toLowerCase()) &&
          !brewery.county?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    // Apply sorting
    filteredBreweries.sort((a, b) => {
      const aValue = a[sortField as keyof typeof a];
      const bValue = b[sortField as keyof typeof b];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBreweries = filteredBreweries.slice(startIndex, endIndex);

    const response: ApiResponse<PaginatedResponse<typeof transformedBreweries[0]>> = {
      success: true,
      data: {
        data: paginatedBreweries,
        pagination: {
          page,
          limit,
          total: filteredBreweries.length,
          totalPages: Math.ceil(filteredBreweries.length / limit),
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('API Error:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
