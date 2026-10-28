import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/layout-utils';
import ContentPage from '@/components/layout/ContentPage';
import { buttonVariants } from '@/components/ui/button';

export const metadata: Metadata = createPageMetadata({
  title: 'Our Story',
  description:
    "Learn about MarylandBrewery.com and our mission to connect craft beer enthusiasts with Maryland's amazing breweries.",
  path: '/our-story',
  keywords: ['Maryland brewery directory', 'about us', 'craft beer Maryland'],
});

export default function OurStoryPage() {
  return (
    <ContentPage
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Our Story', path: '/our-story' },
      ]}
      title="Our Story"
      intro="Discovering Maryland's craft beer scene, one brewery at a time."
    >
      <section>
        <h2>About MarylandBrewery.com</h2>
        <p>
          MarylandBrewery.com was created to celebrate and support Maryland's
          vibrant craft beer community. We're passionate about connecting craft
          beer enthusiasts with the amazing breweries that make Maryland's beer
          scene special.
        </p>
        <p>
          Our mission is simple: make it easy for people to discover, explore,
          and enjoy Maryland's craft breweries. Whether you're a local looking
          for a new favorite spot or a visitor exploring the state, we want to
          help you find the perfect brewery experience.
        </p>
      </section>

      <section>
        <h3>What We Do</h3>
        <ul>
          <li>
            <strong>Comprehensive Directory:</strong> We maintain an up-to-date
            directory of craft breweries across Maryland
          </li>
          <li>
            <strong>Detailed Information:</strong> Hours, amenities, beer types,
            and more to help you plan your visit
          </li>
          <li>
            <strong>Interactive Tools:</strong> Maps, search filters, and
            location-based recommendations
          </li>
          <li>
            <strong>Community Support:</strong> We support both brewery owners
            and craft beer enthusiasts
          </li>
        </ul>
      </section>

      <section>
        <h3>Our Values</h3>
        <div>
          <div>
            <h4>Supporting Local</h4>
            <p>
              We believe in supporting local businesses and the craft beer
              community that makes Maryland special.
            </p>
          </div>
          <div>
            <h4>Accuracy & Trust</h4>
            <p>
              We strive to provide accurate, up-to-date information you can rely
              on when planning your brewery visits.
            </p>
          </div>
          <div>
            <h4>Community First</h4>
            <p>
              This directory is built for the community, by the community. We
              welcome feedback and contributions.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h3>Independent & Unbiased</h3>
        <p>
          MarylandBrewery.com is an independent directory. We are not affiliated
          with any of the breweries listed on our site. This allows us to
          provide unbiased information and fair representation for all Maryland
          breweries.
        </p>
        <p>
          Our goal is to help you discover great breweries, whether they're
          well-established favorites or hidden gems waiting to be found.
        </p>
      </section>

      <section className="rounded-panel bg-cream p-6">
        <h3>Get Involved</h3>
        <p>
          Have a suggestion, found an error, or want to add your brewery? We'd
          love to hear from you.
        </p>
        <a href="/contact" className={buttonVariants()}>
          Contact Us
        </a>
      </section>
    </ContentPage>
  );
}
