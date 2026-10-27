import { Metadata } from 'next';
import DirectoryPageTemplate from '@/components/directory/DirectoryPageTemplate';
import { breweriesInRegion, getProcessedBreweryData, getRegions } from '@/lib/db';
import { slugify, deslugify } from '@/lib/slug';

// Region definitions (fallback if database not available)

export async function generateStaticParams() {
  return (await getRegions()).map((region) => ({ region: region.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ region: string }> }): Promise<Metadata> {
  const { region } = await params;
  const regionData = (await getRegions()).find((r) => r.slug === region);
  
  if (!regionData) {
    return {
      title: 'Region Not Found',
      robots: { index: false, follow: false },
    };
  }

  const processed = await getProcessedBreweryData();
  const breweries = breweriesInRegion(regionData, processed.breweries);

  const title = `${regionData.name} Breweries | ${breweries.length} Craft Breweries in ${regionData.name}`;
  const description = `Explore ${breweries.length} breweries across ${regionData.name}. Plan your brewery tour through ${regionData.counties.join(', ')} with our complete guide.`;

  return {
    title,
    description,
    alternates: { canonical: `/region/${region}` },
    openGraph: {
      title,
      description,
      url: `https://www.marylandbrewery.com/region/${region}`,
      siteName: 'Maryland Brewery Directory',
      type: 'website',
      images: [
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: `${regionData.name} Breweries`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/opengraph-image'],
    },
  };
}

function computeRegionStats(breweries: any[]) {
  const total = breweries.length;
  const counties = new Set(breweries.map((b: any) => b.county).filter(Boolean));
  const avgRating = breweries.length > 0
    ? (breweries
        .filter((b: any) => b.googleRating)
        .reduce((sum, b) => sum + (b.googleRating || 0), 0) / 
       breweries.filter((b: any) => b.googleRating).length).toFixed(1)
    : '0.0';

  return [
    { label: 'Total Breweries', value: total },
    { label: 'Counties', value: counties.size },
    { label: 'Avg Rating', value: avgRating },
    { label: 'Region', value: 'Maryland' },
  ];
}

export default async function RegionPage({ params }: { params: Promise<{ region: string }> }) {
  const { region } = await params;
  const regionData = (await getRegions()).find((r) => r.slug === region);

  if (!regionData) {
    return <div>Region not found</div>;
  }

  const processed = await getProcessedBreweryData();
  const breweries = breweriesInRegion(regionData, processed.breweries);

  // Intro text
  const introText = `Discover ${breweries.length} craft breweries across ${regionData.name}, spanning ${regionData.counties.length} counties. ${regionData.description}`;

  // Breadcrumbs
  const breadcrumbs = [
    { name: 'Maryland Breweries', url: '/', isActive: false },
    { name: 'Regions', url: '/region', isActive: false },
    { name: regionData.name, url: `/region/${region}`, isActive: true },
  ];

  // Stats
  const stats = computeRegionStats(breweries);

  // Content blocks
  const contentBlocks = [
    {
      title: `About ${regionData.name}`,
      content: regionData.description,
    },
    {
      title: `${regionData.name} Brewery Trail`,
      content: `Plan your brewery tour through ${regionData.name} with breweries in ${regionData.counties.join(', ')}. Each county offers unique brewery experiences, from urban taprooms to rural farm breweries.`,
    },
    {
      title: `What Makes ${regionData.name} Unique`,
      content: `The breweries in ${regionData.name} reflect the region's character, from waterfront locations on the Eastern Shore to mountain views in Western Maryland. Many breweries source local ingredients and celebrate regional traditions.`,
    },
  ];

  // Related pages - counties in this region
  const countyCounts = new Map<string, number>();
  breweries.forEach((b: any) => {
    if (b.county) {
      const county = b.county.toLowerCase().trim();
      countyCounts.set(county, (countyCounts.get(county) || 0) + 1);
    }
  });

  const topCounties = Array.from(countyCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([county]) => ({
      title: `${county.charAt(0).toUpperCase() + county.slice(1)} Breweries`,
      url: `/counties/${slugify(county)}/breweries`,
      count: countyCounts.get(county),
    }));

  // Top cities in this region
  const cityCounts = new Map<string, number>();
  breweries.forEach((b: any) => {
    if (b.city) {
      const city = b.city.toLowerCase().trim();
      cityCounts.set(city, (cityCounts.get(city) || 0) + 1);
    }
  });

  const topCities = Array.from(cityCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([city]) => ({
      title: `${city.charAt(0).toUpperCase() + city.slice(1)} Breweries`,
      url: `/cities/${slugify(city)}/breweries`,
      count: cityCounts.get(city),
    }));

  const relatedPages = [
    ...topCounties,
    ...topCities,
    { title: 'Best Breweries in Maryland', url: '/best-breweries' },
    { title: 'Interactive Map', url: '/map' },
  ];

  return (
    <DirectoryPageTemplate
      h1={`Breweries in ${regionData.name}`}
      introText={introText}
      breadcrumbs={breadcrumbs}
      breweries={breweries as any}
      stats={stats}
      contentBlocks={contentBlocks}
      relatedPages={relatedPages}
      pageType="county"
      showMap={true}
      showStats={true}
      showTable={true}
      mapZoom={8}
    />
  );
}

