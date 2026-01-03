import { Metadata } from 'next';
import DirectoryPageTemplate from '@/components/directory/DirectoryPageTemplate';
import { getProcessedBreweryData } from '../../../../lib/brewery-data';
import { slugify, deslugify } from '@/lib/data-utils';
import { supabase } from '@/lib/supabase';

// Region definitions (fallback if database not available)
const MARYLAND_REGIONS: Record<string, { name: string; counties: string[]; description: string }> = {
  'eastern-shore': {
    name: 'Eastern Shore',
    counties: ['Talbot', 'Dorchester', 'Wicomico', 'Worcester', 'Somerset', 'Caroline', 'Kent', "Queen Anne's", 'Cecil'],
    description: "Maryland's Eastern Shore offers a relaxed, rural brewery experience with scenic waterfront locations and farm-to-glass craft beer.",
  },
  'western-maryland': {
    name: 'Western Maryland',
    counties: ['Allegany', 'Garrett', 'Washington'],
    description: "The mountains of Western Maryland are home to breweries that celebrate the region's natural beauty and outdoor recreation culture.",
  },
  'central-maryland': {
    name: 'Central Maryland',
    counties: ['Baltimore City', 'Baltimore County', 'Howard', 'Carroll', 'Harford'],
    description: "The heart of Maryland's craft beer scene, Central Maryland features the highest concentration of breweries from urban Baltimore to suburban Howard County.",
  },
  'southern-maryland': {
    name: 'Southern Maryland',
    counties: ['Calvert', 'Charles', "St. Mary's"],
    description: "Southern Maryland's waterfront breweries combine craft beer with Chesapeake Bay culture and historic charm.",
  },
  'capital-region': {
    name: 'Capital Region',
    counties: ['Montgomery', "Prince George's"],
    description: "The DC suburbs offer diverse brewery experiences, from upscale taprooms to community-focused brewpubs serving the metropolitan area.",
  },
};

export async function generateStaticParams() {
  return Object.keys(MARYLAND_REGIONS).map((region) => ({ region }));
}

export async function generateMetadata({ params }: { params: Promise<{ region: string }> }): Promise<Metadata> {
  const { region } = await params;
  const regionData = MARYLAND_REGIONS[region];
  
  if (!regionData) {
    return {
      title: 'Region Not Found',
    };
  }

  const processed = await getProcessedBreweryData();
  const breweries = processed.breweries.filter((b: any) =>
    regionData.counties.some(county => 
      b.county && b.county.toLowerCase() === county.toLowerCase()
    )
  );

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
          url: '/og-image.jpg',
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
      images: ['/og-image.jpg'],
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
  const regionData = MARYLAND_REGIONS[region];

  if (!regionData) {
    return <div>Region not found</div>;
  }

  const processed = await getProcessedBreweryData();
  const breweries = processed.breweries.filter((b: any) =>
    regionData.counties.some(county => 
      b.county && b.county.toLowerCase() === county.toLowerCase()
    )
  );

  // Intro text
  const introText = `Discover ${breweries.length} craft breweries across ${regionData.name}, spanning ${regionData.counties.length} counties. ${regionData.description}`;

  // Breadcrumbs
  const breadcrumbs = [
    { name: 'Home', url: '/', isActive: false },
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
      url: `/county/${slugify(county)}/breweries`,
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
      url: `/city/${slugify(city)}/breweries`,
      count: cityCounts.get(city),
    }));

  const relatedPages = [
    ...topCounties,
    ...topCities,
    { title: 'Best Breweries in Maryland', url: '/best-breweries', count: null },
    { title: 'Interactive Map', url: '/map', count: null },
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

