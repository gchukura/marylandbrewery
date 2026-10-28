import Link from 'next/link';
import FooterAd from '@/components/ads/FooterAd';
import CheckerBand from '@/components/ui/CheckerBand';
import Logo from '@/components/ui/Logo';

const COLUMNS = [
  {
    title: 'Browse',
    links: [
      { label: 'Cities', href: '/cities' },
      { label: 'Counties', href: '/counties' },
      { label: 'Regions', href: '/region' },
      { label: 'Brewery types', href: '/type' },
    ],
  },
  {
    title: 'Amenities',
    links: [
      { label: 'Dog-friendly', href: '/amenities/pet-friendly' },
      { label: 'Outdoor seating', href: '/amenities/outdoor-seating' },
      { label: 'Food on site', href: '/amenities/full-kitchen' },
      { label: 'Beer to go', href: '/amenities/beer-to-go' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'Our story', href: '/our-story' },
      { label: 'Add a brewery', href: '/add-brewery' },
      { label: 'Contact', href: '/contact' },
      { label: 'Photo credits', href: '/photo-credits' },
    ],
  },
];

const LEGAL = [
  { label: 'FAQ', href: '/faq' },
  { label: 'Privacy', href: '/privacy-policy' },
  { label: 'Terms', href: '/terms' },
];

/** Server component; the ad slot above it is the only client part. */
export default function SiteFooter() {
  return (
    <>
      <FooterAd />
      <footer className="mt-auto bg-ink text-paper">
        <CheckerBand variant="bottom" />
        <div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-8 px-4 pb-10 pt-12 sm:px-6 md:grid-cols-5">
          <div className="col-span-2 flex flex-col gap-3">
            <Logo size="sm" tone="paper" />
            <p className="m-0 max-w-[320px] text-sm leading-[1.55] text-paper/70">
              An independent directory of Maryland&apos;s breweries, taprooms, cideries and meaderies.
            </p>
          </div>
          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title} className="flex flex-col gap-2 text-sm">
              <div className="mb-1 font-semibold text-gold">{column.title}</div>
              {column.links.map((link) => (
                <Link key={link.href} href={link.href} className="text-paper/80 hover:text-gold">
                  {link.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>
        <div className="border-t border-paper/15">
          <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 px-4 py-5 text-[13px] text-paper/70 sm:px-6">
            <span>© {new Date().getFullYear()} Maryland Brewery</span>
            <ul className="flex gap-5">
              {LEGAL.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-paper/70 hover:text-gold">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
}
