import { Metadata } from 'next';
import { getProcessedBreweryData } from '../../../lib/brewery-data';
import DirectoryPageTemplate from '@/components/directory/DirectoryPageTemplate';
import { slugify } from '@/lib/data-utils';

export const metadata: Metadata = {
  title: 'Best Breweries in Maryland | Top-Rated Craft Breweries 2025',
  description: 'Find the best breweries in Maryland ranked by ratings and reviews. Our curated list features the top craft breweries across the state, from Baltimore to Frederick and beyond.',
  alternates: {
    canonical: '/best-breweries',
  },
  openGraph: {
    title: 'Best Breweries in Maryland | Top-Rated Craft Breweries',
    description: 'Discover the best breweries in Maryland ranked by ratings and reviews. Find top craft breweries across the state.',
    url: 'https://www.marylandbrewery.com/best-breweries',
    siteName: 'Maryland Brewery Directory',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Best Breweries in Maryland',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Breweries in Maryland | Top-Rated Craft Breweries',
    description: 'Discover the best breweries in Maryland ranked by ratings and reviews.',
    images: ['/og-image.jpg'],
  },
};

// Calculate weighted score for ranking
// Score = (google_rating × 20) + log10(review_count) × 10
function calculateBreweryScore(brewery: any): number {
  const rating = brewery.googleRating || 0;
  const reviewCount = brewery.googleRatingCount || 0;
  
  // Weighted score: rating is more important, but review count adds credibility
  const ratingScore = rating * 20;
  const reviewScore = reviewCount > 0 ? Math.log10(reviewCount) * 10 : 0;
  
  return ratingScore + reviewScore;
}

function computeBestBreweriesStats(breweries: any[]) {
  const total = breweries.length;
  const avgRating = breweries.length > 0
    ? (breweries.reduce((sum, b) => sum + (b.googleRating || 0), 0) / breweries.length).toFixed(1)
    : '0.0';
  const totalReviews = breweries.reduce((sum, b) => sum + (b.googleRatingCount || 0), 0);
  const topRated = breweries.length > 0 ? breweries[0].googleRating?.toFixed(1) || '0.0' : '0.0';

  return [
    { label: 'Top Breweries', value: total },
    { label: 'Avg Rating', value: avgRating },
    { label: 'Total Reviews', value: totalReviews.toLocaleString() },
    { label: 'Highest Rated', value: topRated },
  ];
}

export default async function BestBreweriesPage() {
  const processed = await getProcessedBreweryData();
  
  // Filter breweries with ratings and calculate scores
  const breweriesWithScores = processed.breweries
    .filter((brewery: any) => brewery.googleRating && brewery.googleRatingCount && brewery.googleRatingCount > 0)
    .map((brewery: any) => ({
      ...brewery,
      score: calculateBreweryScore(brewery),
    }))
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 50); // Top 50 breweries

  // Intro text
  const introText = `Discover Maryland's top-rated craft breweries, ranked by a combination of Google ratings and review counts. These ${breweriesWithScores.length} breweries represent the best of Maryland's craft beer scene, from award-winning microbreweries to beloved brewpubs.`;

  // Breadcrumbs
  const breadcrumbs = [
    { name: 'Home', url: '/', isActive: false },
    { name: 'Best Breweries', url: '/best-breweries', isActive: true },
  ];

  // Stats
  const stats = computeBestBreweriesStats(breweriesWithScores);

  // Content blocks
  const contentBlocks = [
    {
      title: 'What Makes These Breweries Stand Out',
      content: `These top breweries have earned their rankings through consistently high ratings and strong community support. Each brewery on this list has received hundreds or thousands of reviews, demonstrating their popularity and quality. From innovative beer styles to exceptional service, these breweries represent the pinnacle of Maryland's craft beer culture.`,
    },
    {
      title: 'How We Rank Breweries',
      content: `Our ranking system combines Google ratings with review counts to identify breweries that are both highly rated and widely recognized. The formula weights ratings more heavily while also considering the number of reviews to ensure credibility. This approach helps surface breweries that have earned consistent praise from the craft beer community.`,
    },
  ];

  // Related pages - top cities with best breweries
  const cityCounts = new Map<string, number>();
  breweriesWithScores.forEach((brewery: any) => {
    if (brewery.city) {
      const city = brewery.city.toLowerCase().trim();
      cityCounts.set(city, (cityCounts.get(city) || 0) + 1);
    }
  });

  const topCities = Array.from(cityCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([city]) => ({
      title: `${city.charAt(0).toUpperCase() + city.slice(1)} Breweries`,
      url: `/city/${slugify(city)}/breweries`,
      count: cityCounts.get(city),
    }));

  // Top amenities among best breweries
  const amenityCounts = new Map<string, number>();
  breweriesWithScores.forEach((brewery: any) => {
    const amenities = (brewery as any).amenities || (brewery as any).features || [];
    amenities.forEach((a: string) => {
      const key = a.trim().toLowerCase();
      amenityCounts.set(key, (amenityCounts.get(key) || 0) + 1);
    });
  });

  const topAmenities = Array.from(amenityCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([amenity]) => ({
      title: `Best ${amenity.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Breweries`,
      url: `/amenities/${slugify(amenity)}`,
      count: amenityCounts.get(amenity),
    }));

  const relatedPages = [
    ...topCities,
    ...topAmenities,
    { title: 'All Maryland Breweries', url: '/', count: processed.breweries.length },
    { title: 'Interactive Map', url: '/map', count: null },
  ];

  return (
    <DirectoryPageTemplate
      h1="Best Breweries in Maryland"
      introText={introText}
      breadcrumbs={breadcrumbs}
      breweries={breweriesWithScores as any}
      stats={stats}
      contentBlocks={contentBlocks}
      relatedPages={relatedPages}
      pageType="search"
      showMap={true}
      showStats={true}
      showTable={true}
      mapZoom={8}
    />
  );
}

