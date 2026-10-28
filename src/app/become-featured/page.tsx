import { Metadata } from 'next';
import Link from 'next/link';
import { createPageMetadata } from '@/lib/layout-utils';
import ContentPage from '@/components/layout/ContentPage';
import { buttonVariants } from '@/components/ui/button';

export const metadata: Metadata = createPageMetadata({
  title: 'Featured Listings',
  description:
    "Featured listings for Maryland breweries aren't available yet. Tell us you're interested and we'll let you know when they are.",
  path: '/become-featured',
  keywords: [
    'featured brewery listing',
    'brewery marketing',
    'Maryland brewery promotion',
  ],
});

export default function BecomeFeaturedPage() {
  return (
    <ContentPage
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Featured Listings', path: '/become-featured' },
      ]}
      title="Featured Listings"
      intro="Featured listings aren't available yet. We're working out what they'll include."
    >
      <section>
        <h2>Not available yet</h2>
        <p>
          Every brewery in the directory is listed the same way today, for free.
          There are no paid or featured placements, and no brewery is ranked
          higher because of a business relationship with us.
        </p>
        <p>
          We may offer featured listings in the future. If we do, they'll be
          clearly labeled, and we'll describe exactly what's included here
          before anyone signs up.
        </p>
      </section>

      <section>
        <h3>What you can do today</h3>
        <ul>
          <li>
            <Link href="/add-brewery">Add your brewery</Link> if it isn&apos;t
            listed yet. It&apos;s free.
          </li>
          <li>
            Keep your listing accurate: send corrections to hours, address,
            website or amenities through our{' '}
            <Link href="/contact">contact form</Link>.
          </li>
          <li>
            Ratings and review highlights on your page come from Google, so
            keeping your Google Business Profile up to date helps. See our{' '}
            <Link href="/marketing-tips">marketing tips</Link>.
          </li>
        </ul>
      </section>

      <section className="rounded-panel bg-cream p-6">
        <h3>Interested?</h3>
        <p>
          Let us know you&apos;d like to hear about featured listings and
          we&apos;ll get in touch if and when they launch.
        </p>
        <Link href="/contact" className={buttonVariants()}>
          Contact us
        </Link>
      </section>
    </ContentPage>
  );
}
