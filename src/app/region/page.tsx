import { Metadata } from 'next';
import IndexPageTemplate from '@/components/directory/IndexPageTemplate';
import { slugify } from '@/lib/slug';
import { breweriesInRegion, getProcessedBreweryData, getRegions } from '@/lib/db';
import { existsSync } from 'fs';
import { join } from 'path';

export const metadata: Metadata = {
  title: 'Maryland Brewery Regions | Explore Breweries by Region',
  description: 'Discover Maryland breweries organized by region: Eastern Shore, Western Maryland, Central Maryland, Southern Maryland, and the Capital Region. Plan your regional brewery tour.',
  alternates: {
    canonical: '/region',
  },
  openGraph: {
    title: 'Maryland Brewery Regions | Explore Breweries by Region',
    description: 'Discover Maryland breweries organized by region: Eastern Shore, Western Maryland, Central Maryland, Southern Maryland, and the Capital Region. Plan your regional brewery tour.',
    url: 'https://www.marylandbrewery.com/region',
    siteName: 'Maryland Brewery Directory',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Maryland Brewery Regions | Explore Breweries by Region',
    description: 'Discover Maryland breweries organized by region: Eastern Shore, Western Maryland, Central Maryland, Southern Maryland, and the Capital Region. Plan your regional brewery tour.',
  },
};

export default async function RegionsIndexPage() {
  const processed = await getProcessedBreweryData();
  
  const regions = await getRegions();
  const items = regions.map((region) => {
    const breweries = breweriesInRegion(region, processed.breweries);
    
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
    { name: 'Maryland Breweries', url: '/', isActive: false },
    { name: 'Regions', url: '/region', isActive: true },
  ];

  // Check for hero image
  const regionHeroImagePath = '/cities-hero.jpg';
  const regionHeroImageFile = join(process.cwd(), 'public', 'cities-hero.jpg');
  const hasRegionHeroImage = existsSync(regionHeroImageFile);

  return (
    <IndexPageTemplate
      h1="Maryland Brewery Regions"
      introText="Explore Maryland's craft breweries organized by region. Each region offers unique brewery experiences, from waterfront locations on the Eastern Shore to mountain views in Western Maryland."
      breadcrumbs={breadcrumbs}
      heroImage={hasRegionHeroImage ? regionHeroImagePath : null}
      items={items}
      stats={stats}
      groupedItems={{}}
      pageType="region"
    />
  );
}

