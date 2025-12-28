import { notFound } from 'next/navigation';
import { getProcessedBreweryData, getNearbyBreweries } from '../../../../lib/brewery-data';
import { deslugify } from '../../../../lib/utils';
import { slugify } from '@/lib/data-utils';
import SimpleBreweryPageTemplate from '@/components/templates/SimpleBreweryPageTemplate';
import { generateBreweryTitle, generateBreweryDescription } from '@/lib/seo-utils';

interface BreweryPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const processed = await getProcessedBreweryData();
  
  return processed.breweries.map((brewery) => ({
    slug: (brewery as any).slug || brewery.id,
  }));
}

export async function generateMetadata({ params }: BreweryPageProps) {
  const processed = await getProcessedBreweryData();
  const brewery = processed.breweries.find(
    (b) => (b as any).slug === params.slug || b.id === params.slug
  );

  if (!brewery) {
    return {
      title: 'Brewery Not Found',
      description: 'The requested brewery could not be found.',
    };
  }

  const title = generateBreweryTitle(brewery.name, brewery.city);
  const description = generateBreweryDescription(
    brewery.name,
    brewery.city,
    brewery.description,
    (brewery as any).type
  );

  return {
    title,
    description,
    alternates: {
      canonical: `/breweries/${params.slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://www.marylandbrewery.com/breweries/${params.slug}`,
      siteName: 'Maryland Brewery Directory',
      images: [
        {
          url: `https://www.marylandbrewery.com/api/og?title=${encodeURIComponent(brewery.name)}&location=${encodeURIComponent(brewery.city)}`,
          width: 1200,
          height: 630,
          alt: `${brewery.name} - Maryland Brewery`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`https://www.marylandbrewery.com/api/og?title=${encodeURIComponent(brewery.name)}&location=${encodeURIComponent(brewery.city)}`],
    },
  };
}

export default async function BreweryPage({ params }: BreweryPageProps) {
  const processed = await getProcessedBreweryData();
  const brewery = processed.breweries.find(
    (b) => (b as any).slug === params.slug || b.id === params.slug
  );

  if (!brewery) {
    notFound();
  }

  // Validate required fields
  if (!brewery.name || !brewery.city) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Brewery missing required fields:', {
        name: brewery.name,
        city: brewery.city,
        id: brewery.id
      });
    }
    notFound();
  }

  // Get nearby breweries (within 10 miles)
  const nearbyBreweries = await getNearbyBreweries(brewery.latitude, brewery.longitude, 10);

  // Generate breadcrumbs with more links
  const citySlug = (brewery as any).citySlug || slugify(brewery.city);
  const breadcrumbs = [
    { name: 'Home', url: '/', position: 1, isActive: false },
    { name: 'Cities', url: '/city', position: 2, isActive: false },
    { name: brewery.city, url: `/city/${citySlug}/breweries`, position: 3, isActive: false },
    { name: brewery.name, url: `/breweries/${params.slug}`, position: 4, isActive: true },
  ];

  // Get same city breweries for related links
  const sameCityBreweries = processed.byCity.get(brewery.city.toLowerCase()) || [];
  const sameCityOther = sameCityBreweries
    .filter(b => b.id !== brewery.id)
    .slice(0, 4)
    .map(b => ({
      title: b.name,
      url: `/breweries/${(b as any).slug || b.id}`,
      type: 'brewery' as const,
    }));

  // Get breweries with similar amenities
  const breweryAmenities = ((brewery as any).amenities || (brewery as any).features || []).map((a: string) => a.toLowerCase());
  const similarAmenityBreweries = processed.breweries
    .filter(b => {
      if (b.id === brewery.id) return false;
      const bAmenities = ((b as any).amenities || (b as any).features || []).map((a: string) => a.toLowerCase());
      return breweryAmenities.some((a: string) => bAmenities.includes(a));
    })
    .slice(0, 3)
    .map(b => ({
      title: b.name,
      url: `/breweries/${(b as any).slug || b.id}`,
      type: 'brewery' as const,
    }));

  // Generate related pages with more links
  const relatedPages = [
    { title: `All ${brewery.city} Breweries`, url: `/city/${citySlug}/breweries`, type: 'city' as const, count: sameCityBreweries.length },
    { title: 'Interactive Map', url: '/map', type: 'general' as const },
    { title: 'Open Now', url: '/open-now', type: 'general' as const },
    ...sameCityOther,
    ...similarAmenityBreweries,
  ];

  const title = `${brewery.name} - ${brewery.city}, MD`;
  const metaDescription = `${brewery.name} in ${brewery.city}, Maryland. ${brewery.description || `Discover this ${(brewery as any).type || 'brewery'} in the Old Line State.`}`;

  return (
    <SimpleBreweryPageTemplate
      brewery={brewery as any}
      nearbyBreweries={nearbyBreweries as any}
      title={title}
      metaDescription={metaDescription}
      breadcrumbs={breadcrumbs as any}
      relatedPages={relatedPages as any}
    />
  );
}
