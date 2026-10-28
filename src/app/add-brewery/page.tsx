import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/layout-utils';
import ContentPage from '@/components/layout/ContentPage';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = createPageMetadata({
  title: 'Add Your Brewery',
  description:
    'Add your Maryland brewery to our comprehensive directory. Help craft beer enthusiasts discover your brewery.',
  path: '/add-brewery',
  keywords: ['add brewery', 'list brewery', 'Maryland brewery directory'],
});

export default function AddBreweryPage() {
  return (
    <ContentPage
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Add Your Brewery', path: '/add-brewery' },
      ]}
      title="Add Your Brewery"
      intro="Join Maryland's most comprehensive craft brewery directory and help beer enthusiasts discover your brewery."
    >
      <section>
        <h2>Get Listed</h2>
        <p>
          Adding your brewery to our directory is free and helps connect you
          with craft beer enthusiasts across Maryland. We're always looking to
          expand our directory with new and existing breweries.
        </p>
      </section>

      <section>
        <h3>What We Need</h3>
        <p>To add your brewery, please provide the following information:</p>
        <ul>
          <li>
            <strong>Brewery Name:</strong> Official name of your brewery
          </li>
          <li>
            <strong>Address:</strong> Full street address, city, state, and ZIP
            code
          </li>
          <li>
            <strong>Contact Information:</strong> Phone number, email, and
            website
          </li>
          <li>
            <strong>Hours:</strong> Regular operating hours
          </li>
          <li>
            <strong>Brewery Type:</strong> Production brewery, brewpub, taproom,
            etc.
          </li>
          <li>
            <strong>Amenities:</strong> Food service, outdoor seating, parking,
            tours, etc.
          </li>
          <li>
            <strong>Photos:</strong> High-quality photos of your brewery
            (optional but recommended)
          </li>
        </ul>
      </section>

      <section>
        <h3>How It Works</h3>
        <ol>
          <li>
            <strong>Submit Your Information.</strong> Use our contact form to
            send us your brewery details.
          </li>
          <li>
            <strong>We Review & Verify.</strong> We'll verify your information
            and may contact you with questions.
          </li>
          <li>
            <strong>You're live!</strong> Your brewery appears in our directory
            and is discoverable by thousands of visitors.
          </li>
        </ol>
      </section>

      <section className="rounded-panel bg-cream p-6">
        <h3>Ready to Add Your Brewery?</h3>
        <p>
          Use our contact form to submit your brewery information. We typically
          add new listings within 1-2 business days.
        </p>
        <Link href="/contact" className={buttonVariants()}>
          Submit Your Brewery
        </Link>
      </section>

      <section className="border-t border-line pt-6">
        <h3>Already Listed?</h3>
        <p>
          If your brewery is already in our directory and you need to update
          information, please contact us with the changes.
        </p>
        <Link href="/contact">Update Brewery Information →</Link>
      </section>
    </ContentPage>
  );
}
