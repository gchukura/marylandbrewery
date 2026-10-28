import Image from 'next/image';
import Link from 'next/link';
import type { HeroPhoto } from '@/config/home';
import { cn } from '@/lib/utils';
import SearchCombobox from '@/components/search/SearchCombobox';

interface HomeHeroProps {
  photo: HeroPhoto;
  breweries: number;
  counties: number;
  openNow: number;
}

const CHIPS = [
  { label: 'Near me', href: '/map?near=1' },
  { label: 'Dog-friendly', href: '/map?amenity=pet-friendly' },
  { label: 'Food on site', href: '/map?amenity=full-kitchen' },
  { label: 'Outdoor seating', href: '/map?amenity=outdoor-seating' },
];

const chip =
  'tap inline-flex shrink-0 items-center whitespace-nowrap rounded-chip px-3.5 py-2 text-[13px] font-semibold md:px-4 md:py-2.5 md:text-sm';

/**
 * Desktop (Home.html): a full-bleed photo with the search and chips over it. Phone (Mobile.html): a
 * rounded photo card with the headline, then search and chips below. One DOM; a grid overlays the
 * search on the photo from md up.
 */
export default function HomeHero({
  photo,
  breweries,
  counties,
  openNow,
}: HomeHeroProps) {
  return (
    <section className="grid grid-cols-[minmax(0,1fr)] md:min-h-[560px] md:grid-rows-[1fr_auto]">
      {/* Photo: row 1 on phones (a card), rows 1-2 from md (full bleed) */}
      <div className="on-dark relative col-start-1 row-start-1 mx-3 mt-3 h-[300px] overflow-hidden rounded-hero md:row-end-3 md:mx-0 md:mt-0 md:h-auto md:rounded-none">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          priority
          sizes="100vw"
          placeholder={photo.blurDataURL ? 'blur' : 'empty'}
          blurDataURL={photo.blurDataURL || undefined}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(20_20_20/0.88)_0%,rgb(20_20_20/0.35)_55%,rgb(20_20_20/0.1)_100%)]" />
        <Link
          href={`/breweries/${photo.brewerySlug}`}
          className="absolute right-3 top-3 rounded-[6px] bg-ink/55 px-2 py-1 text-[11px] text-paper/85 hover:bg-ink/75 hover:text-paper"
        >
          Photo: {photo.breweryName}
        </Link>
      </div>

      {/* Headline: over the photo at every size */}
      <div className="relative col-start-1 row-start-1 mx-3 flex flex-col justify-end gap-2 self-end p-[18px] md:mx-0 md:w-full md:max-w-[1240px] md:justify-self-center md:gap-6 md:px-6 md:pb-6 md:pt-16">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold md:text-[13px]">
          {breweries} breweries · {counties} counties
        </div>
        <h1 className="m-0 max-w-[760px] font-display text-[30px] font-bold leading-[1.05] text-paper md:text-[64px] md:leading-none md:tracking-[-0.015em]">
          Every brewery in Maryland, one map.
        </h1>
        <p className="m-0 hidden max-w-[560px] text-[19px] leading-[1.5] text-paper/85 md:block">
          Hours, taprooms, patios and what&apos;s open tonight, kept
          independently. Not a listings farm.
        </p>
      </div>

      {/* Search and chips: below the card on phones, over the photo's foot from md */}
      <div className="relative col-start-1 row-start-2 flex flex-col gap-2.5 px-3 pt-3.5 md:w-full md:max-w-[1240px] md:justify-self-center md:px-6 md:pb-14 md:pt-0">
        <SearchCombobox
          className="max-w-[760px]"
          submitLabel="Search"
          placeholder="Brewery, city, county or amenity"
        />
        <div className="-mx-3 flex gap-2 overflow-x-auto px-3 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
          <Link
            href="/map?open=1"
            className={cn(
              chip,
              'bg-gold text-ink hover:bg-gold/90 hover:text-ink'
            )}
          >
            Open now · {openNow}
          </Link>
          {CHIPS.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className={cn(
                chip,
                'border-[1.5px] border-line-strong bg-white text-ink hover:border-ink hover:text-ink',
                'md:border md:border-paper/40 md:bg-paper/15 md:text-paper md:hover:border-paper md:hover:bg-paper/25 md:hover:text-paper'
              )}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
