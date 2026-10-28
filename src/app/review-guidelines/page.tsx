import { Metadata } from 'next';
import Link from 'next/link';
import { createPageMetadata } from '@/lib/layout-utils';
import ContentPage from '@/components/layout/ContentPage';
import { buttonVariants } from '@/components/ui/button';

export const metadata: Metadata = createPageMetadata({
  title: 'Reviews and Review Guidelines',
  description:
    'Where the ratings and reviews on Maryland Brewery come from, and tips for writing a helpful review of a Maryland brewery.',
  path: '/review-guidelines',
  keywords: [
    'brewery reviews',
    'review guidelines',
    'Maryland brewery reviews',
  ],
});

export default function ReviewGuidelinesPage() {
  return (
    <ContentPage
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Review Guidelines', path: '/review-guidelines' },
      ]}
      title="Reviews and Review Guidelines"
      intro="Where the reviews on this site come from, and how to write one that helps other visitors."
    >
      <section>
        <h2>Where our reviews come from</h2>
        <p>
          You can&apos;t post reviews on Maryland Brewery. The ratings, review
          counts and review excerpts on brewery pages come from Google reviews
          of each brewery, and the &quot;What people mention&quot; themes are
          drawn from those reviews.
        </p>
        <p>
          To review a brewery, leave your review on Google. It can then appear
          on that brewery&apos;s page here the next time we update our data.
        </p>
      </section>

      <section>
        <h3>What to include</h3>
        <ul>
          <li>
            <strong>The beer:</strong> what you drank, what stood out,
            what&apos;s unique there.
          </li>
          <li>
            <strong>The place:</strong> the atmosphere, seating, and whether it
            suits groups, kids or dogs.
          </li>
          <li>
            <strong>Service:</strong> how friendly and knowledgeable the staff
            were.
          </li>
          <li>
            <strong>Food and amenities:</strong> food on site or food trucks,
            outdoor seating, parking, beer to go.
          </li>
          <li>
            <strong>Value:</strong> prices and pour sizes.
          </li>
        </ul>
      </section>

      <section>
        <h3>Good practice</h3>
        <ul>
          <li>
            <strong>Be honest:</strong> share your real experience, good and
            bad.
          </li>
          <li>
            <strong>Be specific:</strong> concrete details help more than
            general praise.
          </li>
          <li>
            <strong>Be respectful:</strong> critique the experience, not the
            people.
          </li>
          <li>
            <strong>Be recent:</strong> review a visit while it&apos;s fresh.
          </li>
          <li>
            <strong>Skip conflicts of interest:</strong> don&apos;t review your
            own brewery or a competitor.
          </li>
        </ul>
      </section>

      <section className="rounded-panel bg-cream p-6">
        <h3>Find a brewery to visit</h3>
        <p>
          Browse every brewery in Maryland on the map, then share how it went on
          Google.
        </p>
        <Link href="/map" className={buttonVariants()}>
          Brewery map
        </Link>
      </section>
    </ContentPage>
  );
}
