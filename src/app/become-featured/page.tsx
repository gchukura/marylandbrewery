import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/layout-utils';
import ContentPage from '@/components/layout/ContentPage';
import { buttonVariants } from '@/components/ui/button';

export const metadata: Metadata = createPageMetadata({
  title: 'Become a Featured Listing',
  description:
    'Get your Maryland brewery featured prominently in our directory. Increase visibility and reach more craft beer enthusiasts.',
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
        { name: 'Become a Featured Listing', path: '/become-featured' },
      ]}
      title="Become a Featured Listing"
      intro="Stand out from the crowd and reach more craft beer enthusiasts with a featured listing."
    >
      <section>
        <h2>Why Become Featured?</h2>
        <p>
          Featured listings receive prominent placement throughout our
          directory, helping you reach more customers and grow your brewery's
          visibility in Maryland's craft beer community.
        </p>
      </section>

      <section>
        <h3>Featured Listing Benefits</h3>
        <ul>
          <li>
            <strong>Prominent Placement:</strong> Your brewery appears at the
            top of search results and category pages
          </li>
          <li>
            <strong>Enhanced Profile:</strong> More photos, detailed
            descriptions, and special highlighting
          </li>
          <li>
            <strong>Priority Updates:</strong> Your information gets updated
            faster when you request changes
          </li>
          <li>
            <strong>Marketing Support:</strong> Featured breweries are
            highlighted in our marketing materials
          </li>
          <li>
            <strong>Analytics Access:</strong> See how many people view your
            listing
          </li>
        </ul>
      </section>

      <section>
        <h3>What's Included</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-card border border-line p-4">
            <h4>Enhanced Profile</h4>
            <p className="m-0 text-[15px] text-muted">
              Extended description, multiple photos, and custom content
            </p>
          </div>
          <div className="rounded-card border border-line p-4">
            <h4>Priority Placement</h4>
            <p className="m-0 text-[15px] text-muted">
              Featured at the top of relevant search results and category pages
            </p>
          </div>
          <div className="rounded-card border border-line p-4">
            <h4>Social Media Promotion</h4>
            <p className="m-0 text-[15px] text-muted">
              Included in our social media features and newsletters
            </p>
          </div>
          <div className="rounded-card border border-line p-4">
            <h4>Quick Updates</h4>
            <p className="m-0 text-[15px] text-muted">
              Fast-track updates when you need to change information
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-panel bg-cream p-6">
        <h3>Get Started</h3>
        <p>
          Interested in becoming a featured listing? Contact us to learn more
          about pricing and availability.
        </p>
        <a href="/contact" className={buttonVariants()}>
          Contact Us
        </a>
      </section>
    </ContentPage>
  );
}
