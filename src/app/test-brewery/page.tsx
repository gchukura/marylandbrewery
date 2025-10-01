/**
 * Test page for BreweryPageTemplate
 * This demonstrates how to use the template for individual brewery pages
 */

import SimpleBreweryPageTemplate from '@/components/templates/SimpleBreweryPageTemplate';
import { BreadcrumbItem, RelatedPage } from '@/types/seo';

// Mock brewery data for testing
const mockBrewery = {
  id: '1',
  name: 'Test Brewery 1',
  address: '123 Test St',
  city: 'Baltimore',
  state: 'MD',
  zipCode: '21201',
  phone: '410-555-0123',
  website: 'https://testbrewery1.com',
  description: 'A great test brewery in Baltimore with amazing craft beer and a welcoming atmosphere. We specialize in IPAs, stouts, and seasonal brews.',
  latitude: 39.2904,
  longitude: -76.6122,
  established: '2020-01-01',
  hours: {
    monday: '11:00 AM - 10:00 PM',
    tuesday: '11:00 AM - 10:00 PM',
    wednesday: '11:00 AM - 10:00 PM',
    thursday: '11:00 AM - 10:00 PM',
    friday: '11:00 AM - 11:00 PM',
    saturday: '10:00 AM - 11:00 PM',
    sunday: '10:00 AM - 9:00 PM',
  },
  features: ['Food', 'Outdoor Seating', 'Live Music', 'Pet Friendly', 'WiFi'],
  socialMedia: {
    facebook: 'https://facebook.com/testbrewery1',
    instagram: 'https://instagram.com/testbrewery1',
    twitter: 'https://twitter.com/testbrewery1',
  },
  images: [],
  isActive: true,
  createdAt: '2020-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const nearbyBreweries = [
  {
    id: '2',
    name: 'Nearby Brewery 1',
    address: '456 Nearby St',
    city: 'Baltimore',
    state: 'MD',
    zipCode: '21202',
    latitude: 39.2950,
    longitude: -76.6100,
    isActive: true,
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Nearby Brewery 2',
    address: '789 Another St',
    city: 'Baltimore',
    state: 'MD',
    zipCode: '21203',
    latitude: 39.2850,
    longitude: -76.6150,
    isActive: true,
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const breadcrumbs: BreadcrumbItem[] = [
  { name: 'Home', url: '/', position: 1, isActive: false },
  { name: 'Breweries', url: '/breweries', position: 2, isActive: false },
  { name: 'Baltimore', url: '/breweries/baltimore', position: 3, isActive: false },
  { name: 'Test Brewery 1', url: '/breweries/test-brewery-1', position: 4, isActive: true },
];

const relatedPages: RelatedPage[] = [
  {
    title: 'Breweries in Baltimore',
    url: '/breweries/baltimore',
    description: 'Explore all breweries in Baltimore, MD',
    type: 'city',
  },
  {
    title: 'Microbreweries in Maryland',
    url: '/breweries/microbrewery',
    description: 'Discover microbreweries across Maryland',
    type: 'type',
  },
  {
    title: 'Breweries with Food',
    url: '/breweries/amenity/food',
    description: 'Find breweries that serve food',
    type: 'amenity',
  },
];

export default function TestBreweryPage() {
  return (
    <SimpleBreweryPageTemplate
      brewery={mockBrewery}
      nearbyBreweries={nearbyBreweries}
      title="Test Brewery 1 | Baltimore, MD | Maryland Brewery Directory"
      metaDescription="Visit Test Brewery 1 in Baltimore, MD. Enjoy craft beer, food, and live music. Open daily with tours available. Located in Baltimore City."
      breadcrumbs={breadcrumbs}
      relatedPages={relatedPages}
    />
  );
}
