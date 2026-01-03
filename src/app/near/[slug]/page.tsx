import { Metadata } from 'next';
import DirectoryPageTemplate from '@/components/directory/DirectoryPageTemplate';
import { getProcessedBreweryData } from '../../../../lib/brewery-data';
import { slugify } from '@/lib/data-utils';
import { getAttractionBySlug } from '../../../../lib/supabase-attractions';

// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function generateStaticParams() {
  // For now, return empty array - pages will be generated on-demand
  // In production, you could pre-generate for high-value attractions
  // This avoids expensive distance calculations during build
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  const attraction = await getAttractionBySlug(slug);

  if (!attraction) {
    return {
      title: 'Attraction Not Found',
    };
  }

  const processed = await getProcessedBreweryData();
  const nearbyBreweries = processed.breweries
    .filter((brewery: any) => {
      if (!brewery.latitude || !brewery.longitude) return false;
      const distance = calculateDistance(
        attraction.latitude,
        attraction.longitude,
        brewery.latitude,
        brewery.longitude
      );
      return distance <= 10;
    })
    .map((brewery: any) => ({
      ...brewery,
      distance: calculateDistance(
        attraction.latitude,
        attraction.longitude,
        brewery.latitude,
        brewery.longitude
      ),
    }))
    .sort((a: any, b: any) => a.distance - b.distance);

  const title = `Breweries Near ${attraction.name} | ${nearbyBreweries.length} Craft Breweries Within 10 Miles`;
  const description = `Find ${nearbyBreweries.length} breweries near ${attraction.name} in ${attraction.city || 'Maryland'}. Plan your visit to ${attraction.name} and discover nearby craft breweries.`;

  return {
    title,
    description,
    alternates: { canonical: `/near/${slug}` },
    openGraph: {
      title,
      description,
      url: `https://www.marylandbrewery.com/near/${slug}`,
      siteName: 'Maryland Brewery Directory',
      type: 'website',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: `Breweries Near ${attraction.name}`,
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

function computeNearStats(breweries: any[]) {
  const total = breweries.length;
  const avgDistance = breweries.length > 0
    ? (breweries.reduce((sum, b: any) => sum + (b.distance || 0), 0) / breweries.length).toFixed(1)
    : '0.0';
  const closest = breweries.length > 0 ? breweries[0].distance?.toFixed(1) || '0.0' : '0.0';
  const farthest = breweries.length > 0 
    ? breweries[breweries.length - 1].distance?.toFixed(1) || '0.0' 
    : '0.0';

  return [
    { label: 'Nearby Breweries', value: total },
    { label: 'Avg Distance', value: `${avgDistance} mi` },
    { label: 'Closest', value: `${closest} mi` },
    { label: 'Farthest', value: `${farthest} mi` },
  ];
}

export default async function NearAttractionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const attraction = await getAttractionBySlug(slug);

  if (!attraction) {
    return <div>Attraction not found</div>;
  }

  const processed = await getProcessedBreweryData();
  const nearbyBreweries = processed.breweries
    .filter((brewery: any) => {
      if (!brewery.latitude || !brewery.longitude) return false;
      const distance = calculateDistance(
        attraction.latitude,
        attraction.longitude,
        brewery.latitude,
        brewery.longitude
      );
      return distance <= 10;
    })
    .map((brewery: any) => ({
      ...brewery,
      distance: calculateDistance(
        attraction.latitude,
        attraction.longitude,
        brewery.latitude,
        brewery.longitude
      ),
    }))
    .sort((a: any, b: any) => a.distance - b.distance);

  // Intro text
  const introText = `Discover ${nearbyBreweries.length} craft breweries within 10 miles of ${attraction.name} in ${attraction.city || 'Maryland'}. Perfect for planning your visit to ${attraction.name} and exploring the local craft beer scene.`;

  // Breadcrumbs
  const breadcrumbs = [
    { name: 'Home', url: '/', isActive: false },
    { name: 'Near Attractions', url: '/near', isActive: false },
    { name: attraction.name, url: `/near/${slug}`, isActive: true },
  ];

  // Stats
  const stats = computeNearStats(nearbyBreweries);

  // Content blocks
  const contentBlocks = [
    {
      title: `About ${attraction.name}`,
      content: attraction.description || `${attraction.name} is a popular ${attraction.type || 'attraction'} in ${attraction.city || 'Maryland'}.`,
    },
    {
      title: 'Plan Your Visit',
      content: `Combine your visit to ${attraction.name} with a brewery tour. The nearby breweries offer a great way to relax after exploring ${attraction.name}. Many breweries are within a short drive, making it easy to visit multiple locations in one day.`,
    },
  ];

  // Related pages
  const relatedPages = [
    ...(attraction.city ? [{
      title: `${attraction.city} Breweries`,
      url: `/cities/${slugify(attraction.city)}/breweries`,
    }] : []),
    ...(attraction.county ? [{
      title: `${attraction.county} Breweries`,
      url: `/counties/${slugify(attraction.county)}/breweries`,
    }] : []),
    { title: 'Interactive Map', url: '/map' },
    { title: 'Best Breweries', url: '/best-breweries' },
  ];

  return (
    <DirectoryPageTemplate
      h1={`Breweries Near ${attraction.name}`}
      introText={introText}
      breadcrumbs={breadcrumbs}
      breweries={nearbyBreweries as any}
      stats={stats}
      contentBlocks={contentBlocks}
      relatedPages={relatedPages}
      pageType="search"
      showMap={true}
      showStats={true}
      showTable={true}
      mapZoom={11}
    />
  );
}

