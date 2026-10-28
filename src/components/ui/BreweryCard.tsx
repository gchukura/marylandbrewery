import Link from 'next/link';
import type { Brewery } from '@/types/brewery';
import { amenityForValue } from '@/lib/amenities';
import { cn } from '@/lib/utils';
import BreweryPhoto from './BreweryPhoto';
import StatusBadge from './StatusBadge';

export type BreweryCardData = Pick<
  Brewery,
  | 'slug'
  | 'name'
  | 'city'
  | 'county'
  | 'hours'
  | 'amenities'
  | 'photos'
  | 'photoUrl'
>;

/** Up to `max` amenity labels, in the order the brewery lists them; labels in `prefer` (active filters) first. */
export function amenityLabels(
  amenities: string[] | undefined,
  max: number,
  prefer: string[] = []
): string[] {
  const labels = (amenities ?? [])
    .map((a) => amenityForValue(a)?.label ?? a)
    .filter((label, i, all) => all.indexOf(label) === i);
  return [
    ...labels.filter((l) => prefer.includes(l)),
    ...labels.filter((l) => !prefer.includes(l)),
  ].slice(0, max);
}

/** Vertical card: 4:3 photo with the open/closed badge, name, city · county, up to three amenities. */
export default function BreweryCard({
  brewery,
  priority,
  className,
}: {
  brewery: BreweryCardData;
  priority?: boolean;
  className?: string;
}) {
  const amenities = amenityLabels(brewery.amenities, 3);
  return (
    <Link
      href={`/breweries/${brewery.slug}`}
      className={cn(
        'group flex flex-col gap-3 text-ink hover:text-ink',
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-cream">
        <BreweryPhoto
          src={brewery.photos?.[0] ?? brewery.photoUrl}
          name={brewery.name}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
          priority={priority}
          className="transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <StatusBadge
          hours={brewery.hours}
          className="absolute bottom-3 left-3"
        />
      </div>
      <div className="flex flex-col gap-1">
        <div className="font-display text-xl font-semibold leading-[1.15] group-hover:text-brand-red">
          {brewery.name}
        </div>
        <div className="text-sm text-muted">
          {[brewery.city, brewery.county].filter(Boolean).join(' · ')}
        </div>
        {amenities.length > 0 && (
          <div className="mt-0.5 flex flex-wrap gap-x-2.5 text-[13px] text-muted">
            {amenities.map((label, i) => (
              <span key={label} className="flex gap-2.5">
                {i > 0 && <span aria-hidden="true">·</span>}
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
