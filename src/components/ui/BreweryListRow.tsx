import Link from 'next/link';
import type { Brewery } from '@/types/brewery';
import { cn } from '@/lib/utils';
import AmenityChip from './AmenityChip';
import { amenityLabels } from './BreweryCard';
import BreweryPhoto from './BreweryPhoto';
import StatusBadge from './StatusBadge';

export type BreweryListRowData = Pick<Brewery, 'slug' | 'name' | 'street' | 'city' | 'description' | 'hours' | 'amenities' | 'photos' | 'photoUrl'>;

interface BreweryListRowProps {
  brewery: BreweryListRowData;
  /** Already formatted, e.g. "0.4 mi" */
  distance?: string;
  priority?: boolean;
  className?: string;
}

/** Horizontal listing row (City.html): photo left, name + status, address, description, amenity chips. */
export default function BreweryListRow({ brewery, distance, priority, className }: BreweryListRowProps) {
  const meta = [brewery.street, brewery.city, distance].filter(Boolean).join(' · ');
  return (
    <Link
      href={`/breweries/${brewery.slug}`}
      className={cn(
        'group grid grid-cols-[112px_minmax(0,1fr)] gap-3.5 rounded-panel border border-line bg-white p-3 text-ink hover:border-line-strong hover:text-ink sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-[18px] sm:p-3.5',
        className
      )}
    >
      <div className="relative aspect-[4/3] self-start overflow-hidden rounded-control bg-cream">
        <BreweryPhoto src={brewery.photos?.[0] ?? brewery.photoUrl} name={brewery.name} sizes="(max-width: 640px) 112px, 200px" priority={priority} />
      </div>
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
          <div className="font-display text-lg font-semibold leading-[1.15] group-hover:text-brand-red sm:text-[22px]">{brewery.name}</div>
          <StatusBadge hours={brewery.hours} className="shrink-0" />
        </div>
        {meta && <div className="text-sm text-muted">{meta}</div>}
        {brewery.description && (
          <div className="hidden sm:block">
            <p className="m-0 line-clamp-2 text-sm leading-normal">{brewery.description}</p>
          </div>
        )}
        {brewery.amenities?.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-2">
            {amenityLabels(brewery.amenities, 4).map((label) => (
              <AmenityChip key={label} value={label} />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
