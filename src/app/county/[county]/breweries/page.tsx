import { Metadata } from 'next';
import DirectoryPageTemplate from '@/components/directory/DirectoryPageTemplate';
import { getProcessedBreweryData } from '../../../../../lib/brewery-data';
import { slugify, deslugify } from '@/lib/data-utils';
import { generateCountyIntroText, generateCountyContentBlocks } from '@/lib/content-generators';

const ALL_MD_COUNTIES = [
  'Allegany', 'Anne Arundel', 'Baltimore', 'Calvert', 'Caroline', 'Carroll', 'Cecil', 'Charles',
  'Dorchester', 'Frederick', 'Garrett', 'Harford', 'Howard', 'Kent', 'Montgomery',
  'Prince Georges', 'Queen Annes', 'Somerset', 'St Marys', 'Talbot', 'Washington', 'Wicomico', 'Worcester'
];

export async function generateStaticParams() {
  return ALL_MD_COUNTIES.map(c => ({ county: slugify(c) }));
}

export async function generateMetadata({ params }: { params: { county: string } }): Promise<Metadata> {
  const processed = await getProcessedBreweryData();
  const countyName = deslugify(params.county);
  const list = processed.breweries.filter(b => (b as any).county?.toLowerCase() === countyName.toLowerCase());
  const total = list.length;

  const title = `${countyName} County Breweries - ${total} Craft Breweries in ${countyName}, MD`;
  const description = total > 0
    ? `${countyName} County has ${total} craft breweries. Explore taprooms, brewpubs, and tasting rooms across ${countyName}, Maryland.`
    : `${countyName} County does not have listed breweries yet. Check nearby counties for great craft beer options.`;

  return {
    title,
    description,
    alternates: { canonical: `/county/${params.county}/breweries` },
    openGraph: {
      title,
      description,
      url: `https://www.marylandbrewery.com/county/${params.county}/breweries`,
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

export default async function CountyBreweriesPage({ params }: { params: { county: string } }) {
  const processed = await getProcessedBreweryData();
  const countyName = deslugify(params.county);
  const breweries = processed.breweries.filter(b => (b as any).county?.toLowerCase() === countyName.toLowerCase());
  const citiesInCounty = Array.from(new Set(breweries.map(b => b.city))).sort();

  // Intro text
  const statsForIntro = { totalBreweries: breweries.length, totalCounties: processed.counties.length, totalTypes: 0 };
  const introText = generateCountyIntroText(countyName, breweries.length, statsForIntro);

  // Breadcrumbs
  const breadcrumbs = [
    { name: 'Home', url: '/', isActive: false },
    { name: 'Counties', url: '/county', isActive: false },
    { name: `${countyName} County`, url: `/county/${params.county}/breweries`, isActive: true },
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

  // Related pages
  // Cities in this county
  const cityPages = citiesInCounty.slice(0, 5).map(city => ({
    title: `${city} Breweries`,
    url: `/city/${slugify(city)}/breweries`,
    count: breweries.filter(b => b.city === city).length,
  }));

  // Nearby counties
  const neighbors = ALL_MD_COUNTIES
    .filter(c => c.toLowerCase() !== countyName.toLowerCase())
    .slice(0, 3)
    .map(c => {
      const neighborBreweries = processed.breweries.filter(b => (b as any).county?.toLowerCase() === c.toLowerCase());
      return {
        title: `${c} County Breweries`,
        url: `/county/${slugify(c)}/breweries`,
        count: neighborBreweries.length,
      };
    });

  const relatedPages = [...cityPages, ...neighbors];

  return (
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
    />
  );
}
