import { Metadata } from 'next';
import { getProcessedBreweryData } from '@/lib/db';
import DirectoryPageTemplate from '@/components/directory/DirectoryPageTemplate';
import { amenityByDbValue, amenityPath } from '@/lib/amenities';
import { breweryScore } from '@/lib/best-breweries';
import { buildMetadata } from '@/lib/seo/metadata';
import { slugify } from '@/lib/slug';

export const metadata: Metadata = buildMetadata({
  title: "Best Breweries in Maryland",
  description: "Maryland's top-rated craft breweries, ranked by Google rating and review volume, with best-of lists for the biggest beer towns.",
  path: '/best-breweries',
});


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
  
  // Calculate scores for all breweries
  const breweriesWithScores = processed.breweries
    .map((brewery: any) => ({
      ...brewery,
      score: breweryScore(brewery),
    }))
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 50); // Top 50 breweries

  // Intro text
  const introText = `Discover Maryland's top-rated craft breweries, ranked by a combination of Google ratings and review counts. These ${breweriesWithScores.length} breweries represent the best of Maryland's craft beer scene, from award-winning microbreweries to beloved brewpubs.`;

  // Breadcrumbs
  const breadcrumbs = [
    { name: 'Maryland Breweries', url: '/', isActive: false },
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
      url: `/cities/${slugify(city)}/breweries`,
      count: cityCounts.get(city),
    }));

  // Top amenities among best breweries
  const amenityCounts = new Map<string, number>();
  breweriesWithScores.forEach((brewery: any) => {
    const amenities = brewery.amenities ?? [];
    amenities.forEach((a: string) => {
      const key = a.trim(); // stored value, matched exactly by amenityByDbValue
      amenityCounts.set(key, (amenityCounts.get(key) || 0) + 1);
    });
  });

  const topAmenities = Array.from(amenityCounts.entries())
    .map(([amenity, count]) => ({ page: amenityByDbValue(amenity), count }))
    .filter((x): x is { page: NonNullable<typeof x.page>; count: number } => x.page !== undefined)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map(({ page, count }) => ({
      title: `Best ${page.label} Breweries`,
      url: amenityPath(page),
      count,
    }));

  const relatedPages = [
    ...topCities,
    ...topAmenities,
    { title: 'All Maryland Breweries', url: '/', count: processed.breweries.length },
    { title: 'Interactive Map', url: '/map' },
  ];

  return (
    <DirectoryPageTemplate
      h1="Best Breweries in Maryland"
      introText={introText}
      breadcrumbs={breadcrumbs}
      breweries={breweriesWithScores}
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

