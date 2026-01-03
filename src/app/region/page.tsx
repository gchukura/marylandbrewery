import { Metadata } from 'next';
import IndexPageTemplate from '@/components/directory/IndexPageTemplate';
import { slugify } from '@/lib/data-utils';
import { getProcessedBreweryData } from '../../../lib/brewery-data';

export const metadata: Metadata = {
  title: 'Maryland Brewery Regions | Explore Breweries by Region',
  description: 'Discover Maryland breweries organized by region: Eastern Shore, Western Maryland, Central Maryland, Southern Maryland, and the Capital Region. Plan your regional brewery tour.',
  alternates: {
    canonical: '/region',
  },
};

const MARYLAND_REGIONS = [
  {
    name: 'Eastern Shore',
    slug: 'eastern-shore',
    counties: ['Talbot', 'Dorchester', 'Wicomico', 'Worcester', 'Somerset', 'Caroline', 'Kent', "Queen Anne's", 'Cecil'],
    description: "Maryland's Eastern Shore offers a relaxed, rural brewery experience with scenic waterfront locations.",
  },
  {
    name: 'Western Maryland',
    slug: 'western-maryland',
    counties: ['Allegany', 'Garrett', 'Washington'],
    description: 'The mountains of Western Maryland are home to breweries celebrating natural beauty and outdoor recreation.',
  },
  {
    name: 'Central Maryland',
    slug: 'central-maryland',
    counties: ['Baltimore City', 'Baltimore County', 'Howard', 'Carroll', 'Harford'],
    description: "The heart of Maryland's craft beer scene with the highest concentration of breweries.",
  },
  {
    name: 'Southern Maryland',
    slug: 'southern-maryland',
    counties: ['Calvert', 'Charles', "St. Mary's"],
    description: "Waterfront breweries combining craft beer with Chesapeake Bay culture and historic charm.",
  },
  {
    name: 'Capital Region',
    slug: 'capital-region',
    counties: ['Montgomery', "Prince George's"],
    description: 'Diverse brewery experiences in the DC suburbs, from upscale taprooms to community brewpubs.',
  },
];

export default async function RegionsIndexPage() {
  const processed = await getProcessedBreweryData();
  
  const items = MARYLAND_REGIONS.map((region) => {
    const breweries = processed.breweries.filter((b: any) =>
      region.counties.some(county => 
        b.county && b.county.toLowerCase() === county.toLowerCase()
      )
    );
    
    return {
      name: region.name,
      slug: region.slug,
      count: breweries.length,
      url: `/region/${region.slug}`,
      description: region.description,
    };
  }).filter(item => item.count > 0);

  // Stats
  const totalBreweries = processed.breweries.length;
  const totalRegions = items.length;
  const avgPerRegion = totalRegions > 0 ? Math.round(totalBreweries / totalRegions) : 0;
  const topRegion = items.sort((a, b) => b.count - a.count)[0];

  const stats = [
    { label: 'Total Regions', value: totalRegions },
    { label: 'Total Breweries', value: totalBreweries },
    { label: 'Avg per Region', value: avgPerRegion },
    { label: 'Top Region', value: topRegion ? `${topRegion.name} (${topRegion.count})` : 'N/A' },
  ];

  // Breadcrumbs
  const breadcrumbs = [
    { name: 'Home', url: '/', isActive: false },
    { name: 'Regions', url: '/region', isActive: true },
  ];

  return (
    <IndexPageTemplate
      h1="Maryland Brewery Regions"
      introText="Explore Maryland's craft breweries organized by region. Each region offers unique brewery experiences, from waterfront locations on the Eastern Shore to mountain views in Western Maryland."
      breadcrumbs={breadcrumbs}
      items={items}
      stats={stats}
      groupedItems={{}}
      pageType="region"
    />
  );
}

