import { Metadata } from 'next';
import SimpleProgrammaticPageTemplate from '@/components/templates/SimpleProgrammaticPageTemplate';
import { getProcessedBreweryData } from '../../../../lib/brewery-data';
import { slugify, deslugify } from '@/lib/data-utils';

const TYPES = ['microbrewery', 'brewpub', 'taproom', 'production', 'nano'] as const;

export async function generateStaticParams() {
  return TYPES.map((t) => ({ type: t }));
}

export async function generateMetadata({ params }: { params: { type: string } }): Promise<Metadata> {
  const processed = await getProcessedBreweryData();
  const typeKey = params.type.toLowerCase();
  const breweries = processed.breweries.filter((b) => {
    if (Array.isArray(b.type)) {
      return b.type.some(type => type.toLowerCase() === typeKey);
    }
    return b.type?.toLowerCase() === typeKey;
  });
  const typeLabel = deslugify(params.type);
  const typeLabelLower = typeLabel.toLowerCase();
  const title = `${typeLabel} Breweries - ${breweries.length} in Maryland`;
  const description = `Explore ${breweries.length} ${typeLabelLower} breweries across Maryland. Find top ${typeLabelLower} breweries in Baltimore, Annapolis, Frederick, and other cities. Complete guide to ${typeLabelLower} breweries in the Old Line State.`;
  return {
    title,
    description,
    alternates: { canonical: `/type/${params.type}` },
    openGraph: {
      title,
      description,
      url: `https://www.marylandbrewery.com/type/${params.type}`,
      siteName: 'Maryland Brewery Directory',
      type: 'website',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: `${typeLabel} Breweries in Maryland`,
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

export default async function TypePage({ params }: { params: { type: string } }) {
  const processed = await getProcessedBreweryData();
  const typeKey = params.type.toLowerCase();
  const breweries = processed.breweries.filter((b) => {
    if (Array.isArray(b.type)) {
      return b.type.some(type => type.toLowerCase() === typeKey);
    }
    return b.type?.toLowerCase() === typeKey;
  });

  // Top cities by this type
  const cityCounts = new Map<string, number>();
  for (const b of breweries) {
    cityCounts.set(b.city, (cityCounts.get(b.city) || 0) + 1);
  }
  const topCities = Array.from(cityCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([city]) => ({ title: `${city} Breweries`, url: `/city/${slugify(city)}/breweries`, type: 'city' }));

  const stats = {
    title: `${deslugify(params.type)} Overview`,
    stats: [
      { label: 'Total Breweries', value: breweries.length },
      { label: 'Top Cities', value: topCities.length },
      { label: 'Share of All', value: processed.breweries.length > 0 ? `${Math.round((breweries.length / processed.breweries.length) * 100)}%` : '0%' },
    ],
    lastUpdated: new Date().toISOString(),
  } as any;

  const introText = breweries.length > 0
    ? `Maryland has ${breweries.length} ${deslugify(params.type).toLowerCase()} breweries, with strong presence in ${topCities.slice(0, 3).map(c => c.title.replace(' Breweries','')).join(', ')}.`
    : `No ${deslugify(params.type).toLowerCase()} breweries listed yet. Check back soon.`;

  const breadcrumbs = [
    { name: 'Home', url: '/', position: 1, isActive: false },
    { name: 'Brewery Types', url: '/type', position: 2, isActive: false },
    { name: deslugify(params.type), url: `/type/${params.type}`, position: 3, isActive: true },
  ];

  // Related types
  const related = TYPES.filter((t) => t !== params.type)
    .slice(0, 5)
    .map((t) => ({ title: `${deslugify(t)} Breweries`, url: `/type/${t}`, type: 'type' }));

  return (
    <SimpleProgrammaticPageTemplate
      title={`${deslugify(params.type)} Breweries in Maryland`}
      metaDescription={`Explore Maryland ${deslugify(params.type).toLowerCase()} breweries and where to find them.`}
      h1={`${deslugify(params.type)} Breweries`}
      introText={introText}
      breweries={breweries as any}
      stats={stats}
      breadcrumbs={breadcrumbs as any}
      relatedPages={related as any}
      pageType="type"
      showMap={true}
      showStats={true}
      showRelatedPages={true}
      currentFilters={{ type: deslugify(params.type) }}
    />
  );
}
