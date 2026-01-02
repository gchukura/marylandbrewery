import { notFound } from 'next/navigation';
import { getProcessedBreweryData, getNearbyBreweries } from '../../../../lib/brewery-data';
import { deslugify } from '../../../../lib/utils';
import { slugify } from '@/lib/data-utils';
import SimpleBreweryPageTemplate from '@/components/templates/SimpleBreweryPageTemplate';
import { generateBreweryTitle, generateEnhancedBreweryDescription } from '@/lib/seo-utils';
import { getBreweryReviews, getBreweryArticles } from '../../../../lib/supabase-client';
import { generateAboutBreweryContent } from '@/lib/brewery-content-utils';
import { supabase } from '../../../../lib/supabase';
import { BreweryArticle } from '@/types/brewery';

interface BreweryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const processed = await getProcessedBreweryData();
  
  return processed.breweries.map((brewery) => ({
    slug: (brewery as any).slug || brewery.id,
  }));
}

export async function generateMetadata({ params }: BreweryPageProps) {
  const { slug } = await params;
  const processed = await getProcessedBreweryData();
  const brewery = processed.breweries.find(
    (b) => (b as any).slug === slug || b.id === slug
  );

  if (!brewery) {
    return {
      title: 'Brewery Not Found',
      description: 'The requested brewery could not be found.',
    };
  }

  const title = generateBreweryTitle(brewery.name, brewery.city);
  const description = generateEnhancedBreweryDescription({
    name: brewery.name,
    city: brewery.city,
    county: (brewery as any).county,
    type: (brewery as any).type,
    description: brewery.description,
    googleRating: (brewery as any).googleRating,
    amenities: (brewery as any).amenities || (brewery as any).features,
    offersTours: (brewery as any).offersTours,
    dogFriendly: (brewery as any).dogFriendly,
    food: (brewery as any).food,
    outdoorSeating: (brewery as any).outdoorSeating,
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
  const processed = await getProcessedBreweryData();
  const brewery = processed.breweries.find(
    (b) => (b as any).slug === slug || b.id === slug
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

  // Calculate city average rating
  const sameCityBreweries = processed.breweries.filter(
    (b) => b.city.toLowerCase() === brewery.city.toLowerCase()
  );
  const cityRatings = sameCityBreweries
    .filter((b) => (b as any).googleRating)
    .map((b) => (b as any).googleRating!);
  const cityAverageRating = cityRatings.length > 0 
    ? cityRatings.reduce((a, b) => a + b, 0) / cityRatings.length 
    : 0;

  // Calculate state average rating
  const stateRatings = processed.breweries
    .filter((b) => (b as any).googleRating)
    .map((b) => (b as any).googleRating!);
  const stateAverageRating = stateRatings.length > 0
    ? stateRatings.reduce((a, b) => a + b, 0) / stateRatings.length
    : 0;

  // Calculate same county count
  const sameCountyCount = processed.breweries.filter(
    (b) => (b as any).county?.toLowerCase() === (brewery as any).county?.toLowerCase()
  ).length;

  // Get current day info
  const now = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = days[now.getDay()];
  const currentDayIndex = now.getDay() === 0 ? 7 : now.getDay(); // 1-7 Mon-Sun

  // Helper function to parse time from hours string (e.g., "11:00 AM - 10:00 PM" or "2:00 – 9:00 PM")
  const parseTimeRange = (hoursString: string): { open: string; close: string } | null => {
    if (!hoursString || hoursString.toLowerCase() === 'closed') return null;
    
    // Match formats like "11:00 AM - 10:00 PM", "2:00 – 9:00 PM", or "11:00-21:00"
    // Handle both regular hyphens (-) and en dashes (–)
    const match = hoursString.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*[–-]\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
    if (match) {
      let openTime = match[1].trim();
      const closeTime = match[2].trim();
      
      // If open time doesn't have AM/PM but close time does, infer it
      const openHasAmPm = /AM|PM/i.test(openTime);
      const closeHasAmPm = /AM|PM/i.test(closeTime);
      
      if (!openHasAmPm && closeHasAmPm) {
        // Extract hour from open time
        const openHourMatch = openTime.match(/(\d{1,2}):(\d{2})/);
        if (openHourMatch) {
          const openHour = parseInt(openHourMatch[1], 10);
          const closeHourMatch = closeTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
          if (closeHourMatch) {
            const closeHour = parseInt(closeHourMatch[1], 10);
            const closeAmPm = closeHourMatch[3].toUpperCase();
            
            // If open hour is less than close hour, assume same AM/PM
            // If open hour is greater, assume it's PM (afternoon/evening)
            if (openHour < closeHour || (closeAmPm === 'PM' && openHour >= 12)) {
              openTime = openTime + ' ' + closeAmPm;
            } else {
              // If open is later in the day, it's likely PM
              openTime = openTime + ' PM';
            }
          }
        }
      }
      
      return {
        open: openTime,
        close: closeTime,
      };
    }
    return null;
  };

  // Helper function to convert time string to minutes since midnight for comparison
  const timeToMinutes = (timeStr: string): number => {
    const isPM = timeStr.toUpperCase().includes('PM');
    const isAM = timeStr.toUpperCase().includes('AM');
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (!timeMatch) return 0;
    
    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    
    if (isPM && hours !== 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    
    return hours * 60 + minutes;
  };

  // Check if open now and get closing time
  const breweryHours = (brewery as any).hours;
  const todayHours = breweryHours?.[currentDay];
  const timeRange = todayHours ? parseTimeRange(todayHours) : null;
  
  // Determine if actually open now (not just if hours exist)
  let isOpenNow = false;
  let closingTime: string | null = null;
  
  if (timeRange) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const openMinutes = timeToMinutes(timeRange.open);
    const closeMinutes = timeToMinutes(timeRange.close);
    
    // Check if current time is within open hours
    if (openMinutes <= closeMinutes) {
      // Normal case: open time is before close time (e.g., 11 AM - 10 PM)
      isOpenNow = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
    } else {
      // Overnight case: open time is after close time (e.g., 10 PM - 2 AM)
      isOpenNow = currentMinutes >= openMinutes || currentMinutes < closeMinutes;
    }
    
    closingTime = timeRange.close;
  }

  // Calculate next open day and time (always calculate, even if open now)
  let nextOpenDay: string | null = null;
  let nextOpenTime: string | null = null;
  
  if (breweryHours) {
    // Use the same day order as the days array for consistency
    const dayOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDayIndexInOrder = dayOrder.indexOf(currentDay);
    
    // If closed today but has hours today, check if it opens later today
    if (!isOpenNow && timeRange) {
      // Closed now but has hours - will open later today
      nextOpenDay = currentDay;
      nextOpenTime = timeRange.open;
    } else {
      // Check next 7 days starting from tomorrow (if open now) or tomorrow (if closed)
      const startDay = 1; // Always start from tomorrow
      
      for (let i = startDay; i <= 7; i++) {
        const checkDayIndex = (currentDayIndexInOrder + i) % 7;
        const checkDay = dayOrder[checkDayIndex];
        const checkDayHours = breweryHours[checkDay];
        
        if (checkDayHours && checkDayHours.toLowerCase() !== 'closed') {
          const checkTimeRange = parseTimeRange(checkDayHours);
          if (checkTimeRange) {
            nextOpenDay = checkDay;
            nextOpenTime = checkTimeRange.open;
            break;
          }
        }
      }
    }
  }

  // Generate breadcrumbs
  const citySlug = (brewery as any).citySlug || slugify(brewery.city);
  const breadcrumbs = [
    { name: 'Maryland Brewery', url: '/', position: 1, isActive: false },
    { name: brewery.city, url: `/city/${citySlug}/breweries`, position: 2, isActive: false },
    { name: brewery.name, url: `/breweries/${slug}`, position: 3, isActive: true },
  ];

  // Get same city breweries for related links
  const sameCityBreweriesForLinks: any[] = (processed.byCity instanceof Map 
    ? processed.byCity.get(brewery.city.toLowerCase())
    : (processed.byCity as any)?.[brewery.city.toLowerCase()]) || [];
  const sameCityOther = sameCityBreweriesForLinks
    .filter((b: any) => b.id !== brewery.id)
    .slice(0, 4)
    .map((b: any) => ({
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
    { title: `All ${brewery.city} Breweries`, url: `/city/${citySlug}/breweries`, type: 'city' as const, count: sameCityBreweriesForLinks.length },
    { title: 'Interactive Map', url: '/map', type: 'general' as const },
    { title: 'Open Now', url: '/open-now', type: 'general' as const },
    ...sameCityOther,
    ...similarAmenityBreweries,
  ];

  const title = `${brewery.name} - ${brewery.city}, MD`;
  const metaDescription = generateEnhancedBreweryDescription({
    name: brewery.name,
    city: brewery.city,
    county: (brewery as any).county,
    type: (brewery as any).type,
    description: brewery.description,
    googleRating: (brewery as any).googleRating,
    amenities: (brewery as any).amenities || (brewery as any).features,
    offersTours: (brewery as any).offersTours,
    dogFriendly: (brewery as any).dogFriendly,
    food: (brewery as any).food,
    outdoorSeating: (brewery as any).outdoorSeating,
  });

  // Fetch actual review count from database
  const reviewData = await getBreweryReviews(brewery.id, 1, 0);
  const actualReviewCount = reviewData.total;

  // Fetch beers for this brewery
  const { data: beersData } = await supabase
    .from('beers')
    .select('name, style, abv, availability')
    .eq('brewery_id', brewery.id);

  // Generate dynamic About content using stored review themes
  const aboutContent = await generateAboutBreweryContent({
    brewery: {
      name: brewery.name,
      city: brewery.city,
      county: (brewery as any).county,
      type: (brewery as any).type,
      latitude: brewery.latitude,
      longitude: brewery.longitude,
      googleRating: brewery.googleRating,
      googleRatingCount: brewery.googleRatingCount,
      description: brewery.description,
      reviewThemes: brewery.reviewThemes, // Pre-computed themes from DB
    },
    beers: beersData || [],
    yelpRating: brewery.yelpRating,
    yelpRatingCount: brewery.yelpRatingCount,
  });

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

  // Fetch articles for this brewery
  const dbArticles = await getBreweryArticles(brewery.id, 5);
  
  // Convert database articles to BreweryArticle type (snake_case to camelCase)
  const articles: BreweryArticle[] = dbArticles.map((dbArticle) => ({
    id: dbArticle.id || '',
    breweryId: dbArticle.brewery_id,
    title: dbArticle.title,
    description: dbArticle.description,
    url: dbArticle.url,
    source: dbArticle.source,
    author: dbArticle.author,
    imageUrl: dbArticle.image_url,
    publishedAt: dbArticle.published_at,
    fetchedAt: dbArticle.fetched_at || new Date().toISOString(),
    relevanceScore: dbArticle.relevance_score,
  }));

  return (
    <SimpleBreweryPageTemplate
      brewery={breweryWithReviewCount as any}
      nearbyBreweries={nearbyBreweries as any}
      title={title}
      metaDescription={metaDescription}
      breadcrumbs={breadcrumbs as any}
      relatedPages={relatedPages as any}
      computed={computed}
      aboutContent={aboutContent}
      articles={articles}
    />
  );
}
