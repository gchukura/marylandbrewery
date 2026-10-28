import { Metadata } from 'next';
import Link from 'next/link';
import {
  breweriesInRegion,
  getProcessedBreweryData,
  getRegions,
} from '@/lib/db';
import { heroPhotoFor } from '@/config/home';
import {
  MARYLAND_TZ,
  isOpenAt,
  nextOpening,
  zonedDayAndMinutes,
  DAYS,
} from '@/lib/hours';
import { buildMetadata } from '@/lib/seo/metadata';
import type { Brewery } from '@/types/brewery';
import BreweryCard from '@/components/ui/BreweryCard';
import MarkMono from '@/components/ui/MarkMono';
import SectionHeading from '@/components/ui/SectionHeading';
import CountyMap from '@/components/home/CountyMap';
import HomeHero from '@/components/home/HomeHero';

// "Open right now" is computed at render, so re-render every five minutes; badges re-check in the browser
export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: 'Maryland Brewery: Every Craft Brewery in Maryland',
  description:
    "Every craft brewery in Maryland on one map, with hours, what's open now, and guides by city, county, region and amenity.",
  path: '/',
  absoluteTitle: true,
});

const OPEN_CARDS = 4;

// Only claims the site can stand behind (Prompt 10, item 4)
const VALUES = [
  {
    title: 'Open now, at a glance',
    body: "Every listing shows today's hours and whether it's open right now, in Maryland time. Something wrong? Report it from the brewery's page.",
  },
  {
    title: 'Amenities from real reviews',
    body: "Patios, dogs, food and beer to go: from each brewery's own listing and what its reviewers mention, linked to every brewery that has them.",
  },
  {
    title: 'Plan it on one map',
    body: "Every Maryland brewery on one map. Filter by what's open, what you want and what's near you, then save the ones to visit.",
  },
];

const reviews = (b: Brewery) => b.googleRatingCount ?? 0;

/** Up to four open at render, most reviewed first; if none are open, the next to open. */
function openRightNow(breweries: Brewery[], now: Date) {
  const open = breweries
    .filter((b) => isOpenAt(b.hours, now).open)
    .sort((a, b) => reviews(b) - reviews(a));
  if (open.length > 0)
    return { open: true, total: open.length, cards: open.slice(0, OPEN_CARDS) };
  const { day } = zonedDayAndMinutes(now);
  const order = (b: Brewery) => {
    const next = nextOpening(b.hours, now);
    if (!next) return Infinity;
    const days = (DAYS.indexOf(next.day) - DAYS.indexOf(day) + 7) % 7;
    const [time, meridiem] = next.time.split(' ');
    const [h, m] = time.split(':').map(Number);
    return days * 1440 + ((h % 12) + (meridiem === 'PM' ? 12 : 0)) * 60 + m;
  };
  const upcoming = breweries
    .filter((b) => nextOpening(b.hours, now))
    .sort((a, b) => order(a) - order(b) || reviews(b) - reviews(a));
  return { open: false, total: 0, cards: upcoming.slice(0, OPEN_CARDS) };
}

export default async function HomePage() {
  const [{ breweries, cities }, regions] = await Promise.all([
    getProcessedBreweryData(),
    getRegions(),
  ]);
  const now = new Date();

  const countyCounts: Record<string, number> = {};
  for (const b of breweries)
    if (b.county) countyCounts[b.county] = (countyCounts[b.county] ?? 0) + 1;
  const countiesWithBreweries = Object.keys(countyCounts).length;

  const regionLinks = regions
    .map((r) => ({
      name: r.name,
      slug: r.slug,
      count: breweriesInRegion(r, breweries).length,
    }))
    .filter((r) => r.count > 0);

  const { open, total, cards } = openRightNow(breweries, now);
  const when = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: MARYLAND_TZ,
  })
    .format(now)
    .replace(' at ', ' · ')
    .replace(/, /, ' · ');

  return (
    <div className="flex flex-col">
      <HomeHero
        photo={heroPhotoFor(now)}
        breweries={breweries.length}
        counties={countiesWithBreweries}
        openNow={total}
      />

      {/* Open right now */}
      {cards.length > 0 && (
        <section className="mx-auto flex w-full max-w-[1240px] flex-col gap-4 px-3 pt-8 md:gap-6 md:px-6 md:pt-16">
          <SectionHeading
            eyebrow={when}
            title={open ? 'Open right now' : 'Opening next'}
            action={
              open
                ? {
                    label: `All ${total} open ${total === 1 ? 'brewery' : 'breweries'} →`,
                    href: '/open-now',
                  }
                : { label: 'Brewery map →', href: '/map' }
            }
          />
          {/* A sideways rail on phones (Mobile.html), a grid from sm up */}
          <div className="-mx-3 flex snap-x gap-3 overflow-x-auto px-3 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-4">
            {cards.map((b, i) => (
              <BreweryCard
                key={b.slug}
                brewery={b}
                priority={i < 2}
                className="w-[200px] shrink-0 snap-start sm:w-auto"
              />
            ))}
          </div>
        </section>
      )}

      {/* Regions and the county map */}
      <section className="mt-10 border-t-8 border-ink bg-cream md:mt-[72px]">
        <div className="mx-auto grid max-w-[1240px] grid-cols-[minmax(0,1fr)] gap-8 px-3 py-8 md:px-6 md:py-14 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-5">
            <h2 className="m-0 font-display text-2xl font-semibold leading-[1.1] text-ink md:text-4xl">
              Browse by region
            </h2>
            <p className="m-0 max-w-[420px] text-base leading-[1.55] text-muted">
              {regionLinks.length} regions, {countiesWithBreweries} counties
              with breweries, {cities.length} cities. Pick a region for every
              brewery in it on one map, or tap a county.
            </p>
            <ul className="m-0 mt-2 grid list-none grid-cols-2 gap-2 p-0 lg:grid-cols-1">
              {regionLinks.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/region/${r.slug}`}
                    className="tap flex items-center justify-between gap-3 rounded-[12px] bg-paper px-[18px] py-3.5 text-[15px] font-semibold text-ink hover:text-brand-red md:text-base"
                  >
                    <span>{r.name}</span>
                    <span className="font-medium text-muted">
                      {r.count}
                      <span className="hidden lg:inline"> breweries</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3 rounded-panel bg-paper p-4 md:p-6 lg:col-span-7">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Maryland · tap a county
            </div>
            <CountyMap counts={countyCounts} />
          </div>
        </div>
      </section>

      {/* Why this directory */}
      <section className="mx-auto grid w-full max-w-[1240px] gap-8 px-3 py-12 md:grid-cols-3 md:px-6 md:py-[72px]">
        {VALUES.map((v) => (
          <div key={v.title} className="flex flex-col gap-2.5">
            <MarkMono className="h-7 w-7 text-brand-red" />
            <h3 className="m-0 font-display text-[22px] font-semibold text-ink">
              {v.title}
            </h3>
            <p className="m-0 text-[15px] leading-[1.55] text-muted">
              {v.body}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
