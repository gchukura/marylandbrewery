import { NextRequest, NextResponse } from 'next/server';
import { Brewery, BreweryFilters, BrewerySortOptions } from '@/types/brewery';
import { ApiResponse, PaginatedResponse } from '@/types/api';

// Mock data for development
const mockBreweries: Brewery[] = [
  {
    id: '1',
    name: 'Flying Dog Brewery',
    address: '4607 Wedgewood Blvd',
    city: 'Frederick',
    state: 'MD',
    zipCode: '21703',
    phone: '(301) 694-7899',
    website: 'https://www.flyingdog.com',
    email: 'info@flyingdog.com',
    description: 'Independent craft brewery known for bold, irreverent beers.',
    latitude: 39.4143,
    longitude: -77.4105,
    established: '1990',
    hours: {
      Monday: '11:00 AM - 10:00 PM',
      Tuesday: '11:00 AM - 10:00 PM',
      Wednesday: '11:00 AM - 10:00 PM',
      Thursday: '11:00 AM - 10:00 PM',
      Friday: '11:00 AM - 11:00 PM',
      Saturday: '11:00 AM - 11:00 PM',
      Sunday: '11:00 AM - 9:00 PM',
    },
    features: ['Food', 'Tours', 'Merchandise', 'Parking'],
    socialMedia: {
      facebook: 'https://facebook.com/flyingdog',
      twitter: 'https://twitter.com/flyingdog',
      instagram: 'https://instagram.com/flyingdog',
    },
    images: [],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Heavy Seas Beer',
    address: '4615 Hollins Ferry Rd',
    city: 'Halethorpe',
    state: 'MD',
    zipCode: '21227',
    phone: '(410) 247-7822',
    website: 'https://www.heavyseasbeer.com',
    email: 'info@heavyseasbeer.com',
    description: 'Brewery specializing in bold, full-flavored ales and lagers.',
    latitude: 39.2304,
    longitude: -76.6758,
    established: '1995',
    hours: {
      Monday: 'Closed',
      Tuesday: '4:00 PM - 9:00 PM',
      Wednesday: '4:00 PM - 9:00 PM',
      Thursday: '4:00 PM - 9:00 PM',
      Friday: '4:00 PM - 10:00 PM',
      Saturday: '12:00 PM - 10:00 PM',
      Sunday: '12:00 PM - 8:00 PM',
    },
    features: ['Tours', 'Merchandise', 'Parking'],
    socialMedia: {
      facebook: 'https://facebook.com/heavyseasbeer',
      instagram: 'https://instagram.com/heavyseasbeer',
    },
    images: [],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const city = searchParams.get('city');
    const features = searchParams.getAll('features');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');
    const sortField = searchParams.get('sortField') as keyof Brewery || 'name';
    const sortDirection = searchParams.get('sortDirection') as 'asc' | 'desc' || 'asc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Apply filters
    let filteredBreweries = mockBreweries.filter((brewery) => {
      if (city && brewery.city.toLowerCase() !== city.toLowerCase()) return false;
      if (features.length > 0 && !features.every(feature => brewery.features?.includes(feature))) return false;
      if (isActive !== null && brewery.isActive !== (isActive === 'true')) return false;
      if (search && !brewery.name.toLowerCase().includes(search.toLowerCase()) && 
          !brewery.city.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    // Apply sorting
    filteredBreweries.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
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

    const response: ApiResponse<PaginatedResponse<Brewery>> = {
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
    const response: ApiResponse<never> = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
