import { notFound, permanentRedirect } from 'next/navigation';
import { getBreweryBySlug, getProcessedBreweryData, getNearbyBreweries, throwDuringBuild } from '@/lib/db';
import { deslugify } from '@/lib/slug';
import { DAYS, isOpenAt, nextOpening, zonedDayAndMinutes } from '@/lib/hours';
import { slugify } from '@/lib/slug';
import SimpleBreweryPageTemplate from '@/components/templates/SimpleBreweryPageTemplate';
import { generateBreweryTitle, generateEnhancedBreweryDescription } from '@/lib/seo-utils';
import { getBreweryReviews, getBreweryArticles } from '@/lib/db';
import { generateAboutBreweryContent } from '@/lib/brewery-content-utils';
import { BreweryArticle } from '@/types/brewery';

interface BreweryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  // No try/catch: a data error here should fail the build, not ship zero brewery pages
  const processed = await getProcessedBreweryData();
  return processed.breweries
    .map((brewery) => ({ slug: brewery.slug || brewery.id }))
    .filter(({ slug }) => {
      // Filter out invalid slugs (URLs, empty strings, etc.)
      if (!slug || typeof slug !== 'string') return false;
      if (slug.includes('www.') || slug.includes('http://') || slug.includes('https://')) return false;
      if (slug.includes('//') || slug.startsWith('/') || slug.endsWith('/')) return false;
      return true;
    });
}

export async function generateMetadata({ params }: BreweryPageProps) {
  const { slug } = await params;
  
  let processed;
  try {
    processed = await getProcessedBreweryData();
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string' 
        ? error 
        : 'Failed to fetch brewery data';
    console.error(`Error fetching brewery data for metadata (${slug}):`, errorMessage);
    throwDuringBuild(error);
    return {
      title: 'Brewery Not Found',
      robots: { index: false, follow: false },
      description: 'The requested brewery could not be found.',
    };
  }
  
  const brewery = processed.breweries.find(
    (b) => b.slug === slug || b.id === slug
  );

  if (!brewery) {
    return {
      title: 'Brewery Not Found',
      robots: { index: false, follow: false },
      description: 'The requested brewery could not be found.',
    };
  }

  const title = generateBreweryTitle(brewery.name, brewery.city);
  const description = generateEnhancedBreweryDescription({
    name: brewery.name,
    city: brewery.city,
    county: brewery.county,
    type: brewery.type,
    description: brewery.description,
    googleRating: brewery.googleRating,
    amenities: brewery.amenities,
    offersTours: brewery.offersTours,
    dogFriendly: brewery.dogFriendly,
    food: brewery.food,
    outdoorSeating: brewery.outdoorSeating,
  });

  return {
    title,
    description,
    alternates: {
      canonical: `/breweries/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://www.marylandbrewery.com/breweries/${slug}`,
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
  const { slug } = await params;
  
  let processed;
  try {
    processed = await getProcessedBreweryData();
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string' 
        ? error 
        : 'Failed to fetch brewery data';
    console.error(`Error fetching brewery data for ${slug}:`, errorMessage);
    throwDuringBuild(error); // never bake a 404 into the build because Supabase failed
    notFound();
  }
  
  const listed = processed.breweries.find((b) => b.slug === slug || b.id === slug);
  if (!listed) {
    notFound();
  }
  // /breweries/{id} is a duplicate of the slug URL
  if (listed.slug && slug !== listed.slug) {
    permanentRedirect(`/breweries/${listed.slug}`);
  }

  // The cached list leaves out review themes and beers; load this brewery's full record
  const brewery = await getBreweryBySlug(listed.slug);
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

  // Independent fetches run together: nearby breweries (10 miles), reviews, articles, About copy
  const [nearbyBreweries, reviewData, dbArticles, aboutContent] = await Promise.all([
    getNearbyBreweries(brewery.latitude, brewery.longitude, 10),
    getBreweryReviews(brewery.id, 100, 0), // Google returns ~5 and Yelp ~3 per brewery
    getBreweryArticles(brewery.id, 5),
    generateAboutBreweryContent({
      brewery: {
        name: brewery.name,
        city: brewery.city,
        county: brewery.county,
        type: brewery.type,
        latitude: brewery.latitude,
        longitude: brewery.longitude,
        googleRating: brewery.googleRating,
        googleRatingCount: brewery.googleRatingCount,
        description: brewery.description,
        reviewThemes: brewery.reviewThemes, // Pre-computed themes from DB
      },
      beers: brewery.beers ?? [],
      yelpRating: brewery.yelpRating,
      yelpRatingCount: brewery.yelpRatingCount,
    }),
  ]);

  // Calculate city average rating
  const sameCityBreweries = processed.breweries.filter(
    (b) => b.city.toLowerCase() === brewery.city.toLowerCase()
  );
  const cityRatings = sameCityBreweries
    .filter((b) => b.googleRating)
    .map((b) => b.googleRating!);
  const cityAverageRating = cityRatings.length > 0 
    ? cityRatings.reduce((a, b) => a + b, 0) / cityRatings.length 
    : 0;

  // Calculate state average rating
  const stateRatings = processed.breweries
    .filter((b) => b.googleRating)
    .map((b) => b.googleRating!);
  const stateAverageRating = stateRatings.length > 0
    ? stateRatings.reduce((a, b) => a + b, 0) / stateRatings.length
    : 0;

  // Calculate same county count
  const sameCountyCount = processed.breweries.filter(
    (b) => b.county?.toLowerCase() === brewery.county?.toLowerCase()
  ).length;

  // Open/closed status and next opening, in Maryland time (src/lib/hours.ts)
  const now = new Date();
  const { day: currentDay } = zonedDayAndMinutes(now);
  const currentDayIndex = DAYS.indexOf(currentDay) === 0 ? 7 : DAYS.indexOf(currentDay); // 1-7 Mon-Sun
  const { open: isOpenNow, closesAt } = isOpenAt(brewery.hours, now);
  const closingTime = closesAt ?? null;
  const next = nextOpening(brewery.hours, now);
  const nextOpenDay = next?.day ?? null;
  const nextOpenTime = next?.time ?? null;

  // Generate breadcrumbs
  const citySlug = slugify(brewery.city);
  const breadcrumbs = [
    { name: 'Maryland Brewery', url: '/', position: 1, isActive: false },
    { name: brewery.city, url: `/cities/${citySlug}/breweries`, position: 2, isActive: false },
    { name: brewery.name, url: `/breweries/${slug}`, position: 3, isActive: true },
  ];

  // Get same city breweries for related links
  const sameCityBreweriesForLinks = processed.byCity.get(brewery.city.toLowerCase()) || [];
  const sameCityOther = sameCityBreweriesForLinks
    .filter((b: any) => b.id !== brewery.id)
    .slice(0, 4)
    .map((b: any) => ({
      title: b.name,
      url: `/breweries/${b.slug || b.id}`,
      type: 'brewery' as const,
    }));

  // Get breweries with similar amenities
  const breweryAmenities = (brewery.amenities ?? []).map((a: string) => a.toLowerCase());
  const similarAmenityBreweries = processed.breweries
    .filter(b => {
      if (b.id === brewery.id) return false;
      const bAmenities = (b.amenities ?? []).map((a: string) => a.toLowerCase());
      return breweryAmenities.some((a: string) => bAmenities.includes(a));
    })
    .slice(0, 3)
    .map(b => ({
      title: b.name,
      url: `/breweries/${b.slug || b.id}`,
      type: 'brewery' as const,
    }));

  // Generate related pages with more links
  const relatedPages = [
    { title: `All ${brewery.city} Breweries`, url: `/cities/${citySlug}/breweries`, type: 'city' as const, count: sameCityBreweriesForLinks.length },
    { title: 'Interactive Map', url: '/map', type: 'general' as const },
    { title: 'Open Now', url: '/open-now', type: 'general' as const },
    ...sameCityOther,
    ...similarAmenityBreweries,
  ];

  const title = `${brewery.name} - ${brewery.city}, MD`;
  const metaDescription = generateEnhancedBreweryDescription({
    name: brewery.name,
    city: brewery.city,
    county: brewery.county,
    type: brewery.type,
    description: brewery.description,
    googleRating: brewery.googleRating,
    amenities: brewery.amenities,
    offersTours: brewery.offersTours,
    dogFriendly: brewery.dogFriendly,
    food: brewery.food,
    outdoorSeating: brewery.outdoorSeating,
  });

  const actualReviewCount = reviewData.total;
  const allReviews = reviewData.reviews;

  // Computed values for enhanced template
  const computed = {
    isOpenNow,
    closingTime,
    nextOpenDay,
    nextOpenTime,
    currentDay,
    currentDayIndex,
    cityAverageRating,
    stateAverageRating,
    sameCityCount: sameCityBreweries.length,
    sameCountyCount,
    sameCityBreweries: sameCityBreweries.filter(b => b.id !== brewery.id).slice(0, 5),
  };

  // Add actual review count to brewery object
  const breweryWithReviewCount = {
    ...brewery,
    actualReviewCount,
  };

  
  // Convert database articles to BreweryArticle type (snake_case to camelCase)
  const articles: BreweryArticle[] = dbArticles.map((dbArticle) => ({
    id: dbArticle.id || '',
    breweryId: dbArticle.brewery_id,
    title: dbArticle.title,
    description: dbArticle.description ?? undefined,
    url: dbArticle.url,
    source: dbArticle.source ?? undefined,
    author: dbArticle.author ?? undefined,
    imageUrl: dbArticle.image_url ?? undefined,
    publishedAt: dbArticle.published_at ?? undefined,
    fetchedAt: dbArticle.fetched_at || new Date().toISOString(),
    relevanceScore: dbArticle.relevance_score ?? undefined,
  }));

  return (
    <SimpleBreweryPageTemplate
      brewery={breweryWithReviewCount}
      nearbyBreweries={nearbyBreweries}
      title={title}
      metaDescription={metaDescription}
      breadcrumbs={breadcrumbs}
      relatedPages={relatedPages}
      computed={computed}
      aboutContent={aboutContent}
      articles={articles}
      reviews={allReviews}
      totalReviews={actualReviewCount}
    />
  );
}
