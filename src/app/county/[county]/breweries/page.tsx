import { Metadata } from 'next';
import SimpleProgrammaticPageTemplate from '@/components/templates/SimpleProgrammaticPageTemplate';
import { getProcessedBreweryData } from '../../../../../lib/brewery-data';
import { slugify, deslugify } from '@/lib/data-utils';

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
      url: `https://marylandbrewery.com/county/${params.county}/breweries`,
      type: 'website',
    },
  };
}

export default async function CountyBreweriesPage({ params }: { params: { county: string } }) {
  const processed = await getProcessedBreweryData();
  const countyName = deslugify(params.county);
  const breweries = processed.breweries.filter(b => (b as any).county?.toLowerCase() === countyName.toLowerCase());
  const citiesInCounty = Array.from(new Set(breweries.map(b => b.city))).sort();

  // Stats & demographics (placeholder; can be enriched later)
  const stats = {
    title: `${countyName} County Statistics`,
    stats: [
      { label: 'Total Breweries', value: breweries.length },
      { label: 'Cities with Breweries', value: citiesInCounty.length },
    ],
    lastUpdated: new Date().toISOString(),
  } as any;

  // Nearby counties: pick a few others alphabetically as a simple heuristic
  const neighbors = ALL_MD_COUNTIES
    .filter(c => c.toLowerCase() !== countyName.toLowerCase())
    .slice(0, 6)
    .map(c => ({ title: `${c} County Breweries`, url: `/county/${slugify(c)}/breweries`, type: 'county' }));

  const breadcrumbs = [
    { name: 'Home', url: '/', position: 1, isActive: false },
    { name: 'Maryland', url: '/county', position: 2, isActive: false },
    { name: `${countyName} County`, url: `/county/${params.county}/breweries`, position: 3, isActive: true },
  ];

  const introText = breweries.length > 0
    ? `${countyName} County's craft beer scene features ${breweries.length} breweries across ${citiesInCounty.length} cities.`
    : `${countyName} County doesn’t have listed breweries yet. Explore nearby counties while we update listings.`;

  return (
    <SimpleProgrammaticPageTemplate
      title={`${countyName} County Breweries - ${breweries.length} Craft Breweries`}
      metaDescription={`Discover breweries in ${countyName} County, Maryland. ${breweries.length > 0 ? `${breweries.length} breweries listed.` : 'No breweries listed yet.'}`}
      h1={`${countyName} County Breweries`}
      introText={introText}
      breweries={breweries as any}
      stats={stats}
      breadcrumbs={breadcrumbs as any}
      relatedPages={neighbors as any}
      pageType="county"
      showMap={true}
      showStats={true}
      showRelatedPages={true}
      currentFilters={{ county: countyName }}
    />
  );
}
