import { Metadata } from 'next';
import { getProcessedBreweryData } from '../../../lib/brewery-data';
import { slugify } from '@/lib/data-utils';
import IndexPageTemplate from '@/components/directory/IndexPageTemplate';

export const metadata: Metadata = {
  title: 'Brewery Amenities & Features - Maryland Brewery Directory',
  description: 'Browse Maryland breweries by amenities and features. Find dog-friendly breweries, outdoor seating, live music, food options, tours, and more across the state.',
  alternates: {
    canonical: '/amenities',
  },
  openGraph: {
    title: 'Brewery Amenities & Features - Maryland Brewery Directory',
    description: 'Browse Maryland breweries by amenities and features. Find dog-friendly breweries, outdoor seating, live music, and more.',
    url: 'https://www.marylandbrewery.com/amenities',
    siteName: 'Maryland Brewery Directory',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Maryland Brewery Directory - Amenities',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Brewery Amenities & Features - Maryland Brewery Directory',
    description: 'Browse Maryland breweries by amenities and features.',
    images: ['/og-image.jpg'],
  },
};

const AMENITY_SLUGS = [
  'dog-friendly', 'outdoor-seating', 'live-music', 'food-trucks', 'full-kitchen', 'beer-garden',
  'games', 'wifi', 'parking', 'private-events', 'tours', 'tastings', 'merchandise', 'growlers', 'crowlers'
] as const;

function normalizeAmenityLabel(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/\bWifi\b/i, 'WiFi');
}

export const revalidate = 3600;

export default async function AmenitiesIndexPage() {
  const processed = await getProcessedBreweryData();

  // Calculate counts for each amenity
  const items = AMENITY_SLUGS.map((slug) => {
    const label = normalizeAmenityLabel(slug);
    const key = label.toLowerCase();
    const breweries = processed.breweries.filter(
      (b) => ((b as any).amenities || (b as any).features || []).some((a: string) => 
        a.toLowerCase().includes(key)
      )
    );
    
    return {
      name: label,
      slug,
      count: breweries.length,
      url: `/amenities/${slug}`,
    };
  }).filter(item => item.count > 0).sort((a, b) => b.count - a.count);

  // Group by category
  const categories: Record<string, string[]> = {
    'Dining & Food': ['Food Trucks', 'Full Kitchen'],
    'Outdoor & Atmosphere': ['Dog Friendly', 'Outdoor Seating', 'Beer Garden'],
    'Entertainment': ['Live Music', 'Games'],
    'Services': ['WiFi', 'Parking', 'Private Events'],
    'Brewery Experience': ['Tours', 'Tastings'],
    'Take Home': ['Merchandise', 'Growlers', 'Crowlers'],
  };

  const grouped: Record<string, typeof items> = {
    'Most Popular': [],
    'Dining & Food': [],
    'Outdoor & Atmosphere': [],
    'Entertainment': [],
    'Services': [],
    'Brewery Experience': [],
    'Take Home': [],
  };

  // Top 3 go to "Most Popular"
  grouped['Most Popular'] = items.slice(0, 3);

  // Categorize the rest
  for (const item of items.slice(3)) {
    let categorized = false;
    for (const [category, amenityList] of Object.entries(categories)) {
      if (amenityList.some(a => item.name.toLowerCase().includes(a.toLowerCase()))) {
        grouped[category].push(item);
        categorized = true;
        break;
      }
    }
    if (!categorized) {
      grouped['Services'].push(item);
    }
  }

  // Remove empty groups
  Object.keys(grouped).forEach(key => {
    if (grouped[key].length === 0) delete grouped[key];
  });

  // Stats
  const totalBreweries = processed.breweries.length;
  const totalAmenities = items.length;
  const mostPopular = items[0];
  const avgPerAmenity = totalAmenities > 0 ? Math.round(totalBreweries / totalAmenities) : 0;

  const stats = [
    { label: 'Total Amenities', value: totalAmenities },
    { label: 'Total Breweries', value: totalBreweries },
    { label: 'Most Popular', value: mostPopular ? `${mostPopular.name} (${mostPopular.count})` : 'N/A' },
    { label: 'Avg Coverage', value: `${avgPerAmenity} breweries` },
  ];

  // Breadcrumbs
  const breadcrumbs = [
    { name: 'Home', url: '/', isActive: false },
    { name: 'Amenities', url: '/amenities', isActive: true },
  ];

  return (
    <IndexPageTemplate
      h1="Brewery Amenities & Features"
      introText="Browse Maryland breweries by the amenities and features they offer. From dog-friendly patios to live music venues, find breweries that match your preferences. Whether you're looking for food options, outdoor seating, tours, or take-home options, discover breweries that provide the experience you're seeking."
      breadcrumbs={breadcrumbs}
      items={items}
      stats={stats}
      groupedItems={grouped}
      allBreweries={processed.breweries as any}
      pageType="amenity"
      showMap={true}
      showStats={true}
      mapZoom={9}
    />
  );
}

