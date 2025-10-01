/**
 * Test page for ProgrammaticPageTemplate
 * This demonstrates how to use the template for listing pages
 */

import SimpleProgrammaticPageTemplate from '@/components/templates/SimpleProgrammaticPageTemplate';
import { BreadcrumbItem, RelatedPage } from '@/types/seo';
import { StatisticsBlock } from '@/types/content';

// Mock data for testing
const mockBreweries = [
  {
    id: '1',
    name: 'Test Brewery 1',
    address: '123 Test St',
    city: 'Baltimore',
    state: 'MD',
    zipCode: '21201',
    phone: '410-555-0123',
    website: 'https://testbrewery1.com',
    description: 'A great test brewery in Baltimore',
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
    features: ['Food', 'Outdoor Seating', 'Live Music'],
    socialMedia: {
      facebook: 'https://facebook.com/testbrewery1',
      instagram: 'https://instagram.com/testbrewery1',
      twitter: 'https://twitter.com/testbrewery1',
    },
    images: [],
    isActive: true,
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Test Brewery 2',
    address: '456 Test Ave',
    city: 'Annapolis',
    state: 'MD',
    zipCode: '21401',
    phone: '410-555-0456',
    website: 'https://testbrewery2.com',
    description: 'Another great test brewery in Annapolis',
    latitude: 38.9784,
    longitude: -76.4928,
    established: '2019-06-15',
    hours: {
      monday: 'Closed',
      tuesday: '4:00 PM - 10:00 PM',
      wednesday: '4:00 PM - 10:00 PM',
      thursday: '4:00 PM - 10:00 PM',
      friday: '4:00 PM - 11:00 PM',
      saturday: '12:00 PM - 11:00 PM',
      sunday: '12:00 PM - 8:00 PM',
    },
    features: ['Food', 'Outdoor Seating'],
    socialMedia: {
      facebook: 'https://facebook.com/testbrewery2',
      instagram: 'https://instagram.com/testbrewery2',
    },
    images: [],
    isActive: true,
    createdAt: '2019-06-15T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const breadcrumbs: BreadcrumbItem[] = [
  { name: 'Home', url: '/', position: 1, isActive: false },
  { name: 'Breweries', url: '/breweries', position: 2, isActive: false },
  { name: 'Baltimore', url: '/breweries/baltimore', position: 3, isActive: true },
];

const relatedPages: RelatedPage[] = [
  {
    title: 'Breweries in Annapolis',
    url: '/breweries/annapolis',
    description: 'Discover breweries in Annapolis, MD',
    type: 'city',
  },
  {
    title: 'Microbreweries in Maryland',
    url: '/breweries/microbrewery',
    description: 'Explore microbreweries across Maryland',
    type: 'type',
  },
];

const stats: StatisticsBlock = {
  title: 'Baltimore Brewery Statistics',
  description: 'Key statistics about breweries in Baltimore, MD',
  stats: [
    { label: 'Breweries', value: '2' },
    { label: 'Counties', value: '2' },
    { label: 'Types', value: '2' },
    { label: 'Amenities', value: '5' },
  ],
  lastUpdated: '2024-01-01T00:00:00Z',
};

export default function TestProgrammaticPage() {
  return (
    <SimpleProgrammaticPageTemplate
      title="Breweries in Baltimore, MD | Maryland Brewery Directory"
      metaDescription="Discover the best breweries in Baltimore, Maryland. Find microbreweries, brewpubs, and taprooms with detailed information, hours, and amenities."
      h1="Breweries in Baltimore"
      introText="Explore Baltimore's vibrant craft beer scene with our comprehensive directory of local breweries, brewpubs, and taprooms."
      breweries={mockBreweries}
      stats={stats}
      breadcrumbs={breadcrumbs}
      relatedPages={relatedPages}
      pageType="city"
      showMap={true}
      showStats={true}
      showRelatedPages={true}
      currentFilters={{
        city: 'Baltimore',
        county: 'Baltimore City',
      }}
    />
  );
}
