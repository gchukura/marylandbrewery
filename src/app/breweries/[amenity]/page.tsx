import { Metadata } from 'next';
import SimpleProgrammaticPageTemplate from '@/components/templates/SimpleProgrammaticPageTemplate';
import { getProcessedBreweryData } from '../../../../lib/brewery-data';
import { slugify, deslugify } from '@/lib/data-utils';

const AMENITY_SLUGS = [
  'dog-friendly', 'outdoor-seating', 'live-music', 'food-trucks', 'full-kitchen', 'beer-garden',
  'games', 'wifi', 'parking', 'private-events', 'tours', 'tastings', 'merchandise', 'growlers', 'crowlers'
] as const;

function normalizeAmenityLabel(slug: string): string {
  return deslugify(slug).replace(/\bWifi\b/i, 'WiFi');
}

export async function generateStaticParams() {
  return AMENITY_SLUGS.map((a) => ({ amenity: a }));
}

export async function generateMetadata({ params }: { params: { amenity: string } }): Promise<Metadata> {
  const processed = await getProcessedBreweryData();
  const label = normalizeAmenityLabel(params.amenity);
  const key = label.toLowerCase();
  const breweries = processed.breweries.filter(
    (b) => ((b as any).amenities || (b as any).features || []).some((a: string) => a.toLowerCase().includes(key))
  );
  const pct = processed.breweries.length > 0 ? Math.round((breweries.length / processed.breweries.length) * 100) : 0;

  const title = `${label} Breweries - ${breweries.length} in Maryland (${pct}%)`;
  const description = `${pct}% of Maryland breweries offer ${label.toLowerCase()}. Explore ${breweries.length} breweries with ${label.toLowerCase()} across Maryland.`;

  return {
    title,
    description,
    alternates: { canonical: `/breweries/${params.amenity}` },
    openGraph: {
      title,
      description,
      url: `https://marylandbrewery.com/breweries/${params.amenity}`,
      type: 'website',
    },
  };
}

export default async function AmenityPage({ params }: { params: { amenity: string } }) {
  const processed = await getProcessedBreweryData();
  const label = normalizeAmenityLabel(params.amenity);
  const key = label.toLowerCase();

  // Filter efficiently from preprocessed list
  const breweries = processed.breweries.filter(
    (b) => ((b as any).amenities || (b as any).features || []).some((a: string) => a.toLowerCase().includes(key))
  );

  // Compute stats
  const total = breweries.length;
  const pct = processed.breweries.length > 0 ? Math.round((total / processed.breweries.length) * 100) : 0;

  // Top cities for this amenity
  const cityCounts = new Map<string, number>();
  for (const b of breweries) {
    cityCounts.set(b.city, (cityCounts.get(b.city) || 0) + 1);
  }
  const topCities = Array.from(cityCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([city]) => ({ title: `${city} Breweries`, url: `/city/${slugify(city)}/breweries`, type: 'city' }));

  // Related amenities: pick a few others
  const related = AMENITY_SLUGS.filter((a) => a !== params.amenity)
    .slice(0, 6)
    .map((a) => ({ title: `${normalizeAmenityLabel(a)} Breweries`, url: `/breweries/${a}`, type: 'amenity' }));

  const stats = {
    title: `${label} Availability`,
    stats: [
      { label: 'Total Breweries', value: total },
      { label: 'Share of All Breweries', value: `${pct}%` },
      { label: 'Top Cities', value: topCities.length },
    ],
    lastUpdated: new Date().toISOString(),
  } as any;

  const introText = total > 0
    ? `Discover ${total} Maryland breweries offering ${label.toLowerCase()}. Popular in ${topCities.slice(0, 3).map(c => c.title.replace(' Breweries','')).join(', ')}.`
    : `We haven't listed breweries with ${label.toLowerCase()} yet. Check back soon or explore related amenities.`;

  const breadcrumbs = [
    { name: 'Home', url: '/', position: 1, isActive: false },
    { name: 'Breweries', url: '/breweries', position: 2, isActive: false },
    { name: label, url: `/breweries/${params.amenity}`, position: 3, isActive: true },
  ];

  return (
    <SimpleProgrammaticPageTemplate
      title={`${label} Breweries in Maryland`}
      metaDescription={`Explore Maryland breweries with ${label.toLowerCase()}.`}
      h1={`${label} Breweries`}
      introText={introText}
      breweries={breweries as any}
      stats={stats}
      breadcrumbs={breadcrumbs as any}
      relatedPages={related as any}
      pageType="amenity"
      showMap={true}
      showStats={true}
      showRelatedPages={true}
      currentFilters={{ amenity: label }}
    />
  );
}
