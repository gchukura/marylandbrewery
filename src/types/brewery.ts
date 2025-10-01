export interface Brewery {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  website?: string;
  email?: string;
  description?: string;
  latitude: number;
  longitude: number;
  established?: string;
  hours?: {
    [key: string]: string;
  };
  features?: string[];
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  images?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BreweryFilters {
  city?: string;
  features?: string[];
  isActive?: boolean;
  search?: string;
}

export interface BrewerySortOptions {
  field: 'name' | 'city' | 'established' | 'createdAt';
  direction: 'asc' | 'desc';
}
