import type { ReactNode } from 'react';
import type { Brewery } from '@/types/brewery';
import type { LatLng } from '@/lib/geo';
import type { Crumb } from '@/lib/seo/jsonld';
import {
  toListingBrewery,
  type FilterDefaults,
  type SortKey,
} from '@/lib/listing';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import BreweryListMap from './BreweryListMap';
import OpenNowCount from './OpenNowCount';
import RelatedLinks, { type RelatedGroup } from './RelatedLinks';

export type ListingScope =
  | 'city'
  | 'county'
  | 'region'
  | 'amenity'
  | 'type'
  | 'city-amenity'
  | 'best'
  | 'open-now'
  | 'day'
  | 'neighborhood'
  | 'state';

interface ListingPageProps {
  scope: ListingScope;
  /** The h1 */
  title: string;
  breadcrumbs: Crumb[];
  /** In the page's default order. Sorted by rating here unless the scope brings its own order (best, neighborhood). */
  breweries: Brewery[];
  /** Middle part of the summary line, e.g. "Frederick County" */
  context?: string;
  /** Replaces the computed summary line (neighborhoods describe distances instead) */
  summary?: ReactNode;
  intro?: ReactNode;
  /** Filters the page fixes (an amenity page's amenity, a type page's type) */
  locked?: { amenity?: string; type?: string };
  /** For distance sorting and miles on each row (neighborhood pages) */
  origin?: LatLng | null;
  related?: RelatedGroup[];
  /** Anything else under the list (e.g. attractions) */
  children?: ReactNode;
}

const SCOPE_SORTS: Partial<
  Record<ListingScope, { defaults: FilterDefaults; sorts: SortKey[] }>
> = {
  best: { defaults: { sort: 'rank' }, sorts: ['rank', 'open', 'name'] },
  neighborhood: {
    defaults: { sort: 'distance' },
    sorts: ['distance', 'open', 'rank', 'name'],
  },
  'open-now': {
    defaults: { sort: 'rank', open: true },
    sorts: ['rank', 'name'],
  },
};
const DEFAULT_SORTS = {
  defaults: { sort: 'open' } as FilterDefaults,
  sorts: ['open', 'rank', 'name'] as SortKey[],
};

const rating = (b: Brewery) => b.googleRating || b.yelpRating || 0;

/** Highest rated first, then by name: the "Top rated" order. */
export function byRating(breweries: Brewery[]): Brewery[] {
  return [...breweries].sort(
    (a, b) => rating(b) - rating(a) || a.name.localeCompare(b.name)
  );
}

/** One template for every brewery listing (docs/design/artboards/City.html). */
export default function ListingPage({
  scope,
  title,
  breadcrumbs,
  breweries,
  context,
  summary,
  intro,
  locked,
  origin = null,
  related = [],
  children,
}: ListingPageProps) {
  const ordered =
    scope === 'best' || scope === 'neighborhood'
      ? breweries
      : byRating(breweries);
  const listing = ordered.map(toListingBrewery);
  const { defaults, sorts } = SCOPE_SORTS[scope] ?? DEFAULT_SORTS;
  const renderedAt = Date.now();
  const count = listing.length;

  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-10 px-4 pb-14 pt-6 sm:px-6 sm:pt-7">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-3.5">
          <Breadcrumbs items={breadcrumbs} />
          <h1 className="m-0 font-display text-[32px] font-bold leading-[1.05] tracking-[-0.01em] text-ink md:text-[44px]">
            {title}
          </h1>
          <p className="m-0 text-base text-muted">
            {summary ?? (
              <>
                {count} {count === 1 ? 'brewery' : 'breweries'}
                {context && <> · {context}</>}
                {scope !== 'open-now' && (
                  <>
                    {' · '}
                    <OpenNowCount
                      hours={listing.map((b) => b.hours)}
                      renderedAt={renderedAt}
                    />
                  </>
                )}
              </>
            )}
          </p>
          {intro && (
            <div className="max-w-3xl text-[15px] leading-[1.6] text-muted">
              {intro}
            </div>
          )}
        </header>
        <BreweryListMap
          breweries={listing}
          defaults={defaults}
          sorts={sorts}
          locked={locked}
          origin={origin}
          renderedAt={renderedAt}
        />
      </div>
      {children}
      <RelatedLinks groups={related} />
    </div>
  );
}
