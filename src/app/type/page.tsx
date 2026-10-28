import type { Metadata } from 'next';
import { getProcessedBreweryData } from '@/lib/db';
import { slugify } from '@/lib/slug';
import { buildMetadata } from '@/lib/seo/metadata';
import { typePlural } from '@/lib/seo/page-meta';
import PageHeader from '@/components/ui/PageHeader';
import IndexCard, { IndexGrid } from '@/components/ui/IndexCard';

export const metadata: Metadata = buildMetadata({
  title: 'Maryland Breweries by Type',
  description:
    'Browse Maryland breweries by type: microbreweries, brewpubs, taprooms, regional and contract breweries.',
  path: '/type',
});

/** What each type means, in our own voice, keyed by type slug. Types without one show just the count. */
const TYPE_DESCRIPTIONS: Record<string, string> = {
  microbrewery:
    "These are the heart of Maryland's craft beer movement. Microbreweries focus on quality over quantity, brewing smaller batches with care and creativity. Most of their beer heads out to local bars, restaurants, and bottle shops—though many have cozy tasting rooms where you can sample the latest creations straight from the source.",
  brewpub:
    'The best of both worlds—a restaurant and brewery under one roof. Brewpubs serve their house-brewed beers alongside a full food menu, making them perfect for a complete night out. The kitchen often creates dishes designed to pair perfectly with the beers being poured just feet away.',
  taproom:
    'Taprooms put the beer front and center. These spaces are all about the drinking experience—think rotating taps, knowledgeable staff, and a relaxed atmosphere. Food is usually minimal (think snacks or food trucks), so you can focus on what matters: exploring great craft beer with friends.',
  production:
    "These are Maryland's brewing powerhouses. Production breweries have the capacity to brew large quantities and distribute their beer across the region—and sometimes beyond. Many still welcome visitors to their facilities, offering tours and taprooms where you can see brewing in action.",
  nano: "The smallest of the small, nano breweries are often passion projects run by dedicated brewers. With tiny batch sizes, they can experiment freely and create beers you won't find anywhere else. If you love discovering something truly unique, nano breweries are where the magic happens.",
  'farm-brewery':
    "Farm breweries bring the farm-to-glass movement to Maryland's craft beer scene. Located on working farms, these breweries often grow their own hops, barley, or other ingredients. The result? Beer with a true sense of place, plus the chance to enjoy a beautiful rural setting while you sip.",
};

export const revalidate = 3600;

export default async function TypesIndexPage() {
  const { breweries, types } = await getProcessedBreweryData();
  // Every type in the data, as in the footer and /type/[type]
  const items = types
    .map((type) => ({
      type,
      count: breweries.filter((b) => b.type.includes(type)).length,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 pb-16 pt-6 sm:px-6">
      <PageHeader
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Types', path: '/type' },
        ]}
        title="Breweries by type"
        intro="Microbreweries, brewpubs, taprooms and the rest: what each kind of brewery is, and how many Maryland has."
      />
      <IndexGrid>
        {items.map(({ type, count }) => (
          <IndexCard
            key={type}
            href={`/type/${slugify(type)}`}
            title={typePlural(type)}
            count={count}
            description={TYPE_DESCRIPTIONS[slugify(type)]}
          />
        ))}
      </IndexGrid>
    </div>
  );
}
