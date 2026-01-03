import { Metadata } from 'next';
import DirectoryPageTemplate from '@/components/directory/DirectoryPageTemplate';
import { getProcessedBreweryData } from '../../../../../lib/brewery-data';
import { slugify, deslugify } from '@/lib/data-utils';
import { generateCountyIntroText, generateCountyContentBlocks } from '@/lib/content-generators';
import { existsSync } from 'fs';
import { join } from 'path';
import BreweriesByLocationTabs from '@/components/home-v2/BreweriesByLocationTabs';

const ALL_MD_COUNTIES = [
  'Allegany', 'Anne Arundel', 'Baltimore', 'Calvert', 'Caroline', 'Carroll', 'Cecil', 'Charles',
  'Dorchester', 'Frederick', 'Garrett', 'Harford', 'Howard', 'Kent', 'Montgomery',
  'Prince Georges', 'Queen Annes', 'Somerset', 'St Marys', 'Talbot', 'Washington', 'Wicomico', 'Worcester'
];

export async function generateStaticParams() {
  return ALL_MD_COUNTIES.map(c => ({ county: slugify(c) }));
}

export async function generateMetadata({ params }: { params: Promise<{ county: string }> }): Promise<Metadata> {
  const { county } = await params;
  const processed = await getProcessedBreweryData();
  const countyName = deslugify(county);
  const list = processed.breweries.filter(b => (b as any).county?.toLowerCase() === countyName.toLowerCase());
  const total = list.length;

  const title = `${countyName} County Breweries | ${total} in MD`;
  const description = total > 0
    ? `Explore ${total} craft breweries across ${countyName} County, Maryland. From historic downtowns to scenic countryside, discover taprooms, brewpubs, and tasting rooms with detailed information, hours, and amenities.`
    : `Discover Maryland's craft beer scene. While ${countyName} County doesn't have listed breweries yet, check nearby counties like Baltimore, Anne Arundel, and Montgomery for great craft beer options.`;

  return {
    title,
    description,
    alternates: { canonical: `/counties/${county}/breweries` },
    openGraph: {
      title,
      description,
      url: `https://www.marylandbrewery.com/counties/${county}/breweries`,
      siteName: 'Maryland Brewery Directory',
      type: 'website',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: `${countyName} County Breweries`,
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

export default async function CountyBreweriesPage({ params }: { params: Promise<{ county: string }> }) {
  const { county } = await params;
  const processed = await getProcessedBreweryData();
  const countyName = deslugify(county);
  const countyKey = countyName.toLowerCase();
  
  // Optimize filtering - use pre-indexed data if available
  const breweries = processed.breweries.filter(b => {
    const breweryCounty = (b as any).county;
    return breweryCounty && breweryCounty.toLowerCase() === countyKey;
  });
  
  // Optimize city extraction
  const citiesInCounty = Array.from(new Set(breweries.map(b => b.city))).sort();

  // Intro text
  const statsForIntro = { totalBreweries: breweries.length, totalCounties: processed.counties.length, totalTypes: 0 };
  const introText = generateCountyIntroText(countyName, breweries.length, statsForIntro);

  // Breadcrumbs
  const breadcrumbs = [
    { name: 'Home', url: '/', isActive: false },
    { name: 'Counties', url: '/counties', isActive: false },
    { name: `${countyName} County`, url: `/counties/${county}/breweries`, isActive: true },
  ];

  // Stats
  const microbreweries = breweries.filter(b => {
    const types = Array.isArray(b.type) ? b.type : [b.type];
    return types.some((t: string) => t?.toLowerCase() === 'microbrewery');
  }).length;
  const brewpubs = breweries.filter(b => {
    const types = Array.isArray(b.type) ? b.type : [b.type];
    return types.some((t: string) => t?.toLowerCase() === 'brewpub');
  }).length;

  const stats = [
    { label: 'Total Breweries', value: breweries.length },
    { label: 'Cities Covered', value: citiesInCounty.length },
    { label: 'Microbreweries', value: microbreweries },
    { label: 'Brewpubs', value: brewpubs },
  ];

  // Content blocks
  const contentBlocks = generateCountyContentBlocks(countyName, breweries, citiesInCounty);

  // Related pages - enhanced for better internal linking
  // Cities in this county
  const cityPages = citiesInCounty.slice(0, 6).map(city => ({
    title: `${city} Breweries`,
    url: `/cities/${slugify(city)}/breweries`,
    count: breweries.filter(b => b.city === city).length,
  }));

  // Nearby counties
  const neighbors = ALL_MD_COUNTIES
    .filter(c => c.toLowerCase() !== countyName.toLowerCase())
    .slice(0, 4)
    .map(c => {
      const neighborBreweries = processed.breweries.filter(b => (b as any).county?.toLowerCase() === c.toLowerCase());
      return {
        title: `${c} County Breweries`,
        url: `/counties/${slugify(c)}/breweries`,
        count: neighborBreweries.length,
      };
    });

  // Top amenities in this county
  const amenityCounts = new Map<string, number>();
  breweries.forEach(b => {
    const amenities = (b as any).amenities || (b as any).features || [];
    amenities.forEach((a: string) => {
      const key = a.trim().toLowerCase();
      amenityCounts.set(key, (amenityCounts.get(key) || 0) + 1);
    });
  });
  
  const topAmenities = Array.from(amenityCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([amenity]) => {
      const amenitySlug = amenity.replace(/\s+/g, '-').toLowerCase();
      return {
        title: `${countyName} ${amenity.charAt(0).toUpperCase() + amenity.slice(1)} Breweries`,
        url: `/amenities/${amenitySlug}`,
        count: amenityCounts.get(amenity) || 0,
      };
    });

  const relatedPages = [...cityPages, ...neighbors, ...topAmenities];

  // Get county hero image - check for local county image from Pexels
  const countySlug = slugify(countyName);
  const localCountyImagePath = `/counties/${countySlug}.jpg`;
  const localCountyImageFile = join(process.cwd(), 'public', 'counties', `${countySlug}.jpg`);
  
  // Check if local county image exists
  const hasLocalCountyImage = existsSync(localCountyImageFile);
  
  // Use local county image if available
  const countyHeroImage = hasLocalCountyImage ? localCountyImagePath : null;

  // Prepare data for BreweriesByLocationTabs
  // Process cities - get unique cities with counts
  const cityCounts = new Map<string, { name: string; slug: string; count: number }>();
  processed.breweries.forEach((brewery: any) => {
    if (brewery.city) {
      const slug = slugify(brewery.city);
      const existing = cityCounts.get(slug);
      if (existing) {
        existing.count++;
      } else {
        cityCounts.set(slug, { name: brewery.city, slug, count: 1 });
      }
    }
  });
  const cities = Array.from(cityCounts.values()).sort((a, b) => a.name.localeCompare(b.name));

  // Process counties - get unique counties with counts
  const countyCounts = new Map<string, { name: string; slug: string; count: number }>();
  processed.breweries.forEach((brewery: any) => {
    if (brewery.county) {
      const slug = slugify(brewery.county);
      const existing = countyCounts.get(slug);
      if (existing) {
        existing.count++;
      } else {
        countyCounts.set(slug, { name: `${brewery.county} County`, slug, count: 1 });
      }
    }
  });
  const counties = Array.from(countyCounts.values()).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <DirectoryPageTemplate
        h1={`${countyName} County Breweries`}
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
        mapZoom={9}
        heroImage={countyHeroImage}
      />
      <BreweriesByLocationTabs cities={cities} counties={counties} />
    </>
  );
}
