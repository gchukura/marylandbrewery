import type { Metadata } from 'next';
import { getProcessedBreweryData } from '@/lib/db';
import { DAYS, isOpenOnDay } from '@/lib/hours';
import { buildMetadata } from '@/lib/seo/metadata';
import { openOnDayMeta } from '@/lib/seo/page-meta';
import { collectionPage } from '@/lib/seo/jsonld';
import JsonLd from '@/components/seo/JsonLd';
import ListingPage from '@/components/listing/ListingPage';

export const revalidate = 3600; // ISR hourly
// Only the seven days; anything else is a 404
export const dynamicParams = false;

export function generateStaticParams() {
  return DAYS.map((day) => ({ day }));
}

const label = (day: string) => day.charAt(0).toUpperCase() + day.slice(1);

async function breweriesOpenOn(day: string) {
  const processed = await getProcessedBreweryData();
  return processed.breweries.filter((b) => isOpenOnDay(b.hours, day));
}

export async function generateMetadata({ params }: { params: Promise<{ day: string }> }): Promise<Metadata> {
  const { day } = await params;
  const list = await breweriesOpenOn(day);
  return buildMetadata({ ...openOnDayMeta(day, list.length), path: `/open/${day}` });
}

export default async function OpenOnDayPage({ params }: { params: Promise<{ day: string }> }) {
  const { day } = await params;
  const list = await breweriesOpenOn(day);
  const Day = label(day);
  const path = `/open/${day}`;

  return (
    <>
      <JsonLd data={collectionPage({ name: `Breweries Open ${Day} in Maryland`, path, breweries: list })} />
      <ListingPage
        scope="day"
        title={`Breweries open on ${Day}`}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Open Now', path: '/open-now' },
          { name: Day, path },
        ]}
        breweries={list}
        context={`open ${Day}s`}
        related={[
          {
            title: 'Open on another day',
            links: DAYS.filter((d) => d !== day).map((d) => ({ label: label(d), href: `/open/${d}` })),
          },
          {
            title: 'Browse',
            links: [
              { label: 'Open right now', href: '/open-now' },
              { label: 'Brewery map', href: '/map' },
              { label: 'All cities', href: '/cities' },
            ],
          },
        ]}
      />
    </>
  );
}
