import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/layout-utils';
import ContentPage from '@/components/layout/ContentPage';
import { buttonVariants } from '@/components/ui/button';

export const metadata: Metadata = createPageMetadata({
  title: 'Review Guidelines',
  description:
    'Guidelines for writing helpful and honest reviews of Maryland breweries. Learn how to share your brewery experience effectively.',
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
      title="Review Guidelines"
      intro="Help fellow craft beer enthusiasts discover great breweries by writing helpful, honest reviews."
    >
      <section>
        <h2>Writing Great Reviews</h2>
        <p>
          Your reviews help others discover amazing breweries and make informed
          decisions. Here's how to write reviews that are helpful and authentic.
        </p>
      </section>

      <section>
        <h3>What to Include</h3>
        <ul>
          <li>
            <strong>Beer Quality:</strong> Share your thoughts on the beer
            selection, quality, and unique offerings.
          </li>
          <li>
            <strong>Atmosphere:</strong> Describe the vibe, ambiance, and
            overall experience.
          </li>
          <li>
            <strong>Service:</strong> Comment on staff friendliness, knowledge,
            and attentiveness.
          </li>
          <li>
            <strong>Food & Amenities:</strong> Mention food options, outdoor
            seating, parking, and other amenities.
          </li>
          <li>
            <strong>Value:</strong> Share your perspective on pricing and
            overall value.
          </li>
        </ul>
      </section>

      <section>
        <h3>Best Practices</h3>
        <ul>
          <li>
            <strong>Be Honest:</strong> Share your genuine experience, both
            positive and negative.
          </li>
          <li>
            <strong>Be Specific:</strong> Provide concrete details rather than
            vague statements.
          </li>
          <li>
            <strong>Be Respectful:</strong> Critique the experience, not the
            people. Keep it professional.
          </li>
          <li>
            <strong>Be Recent:</strong> Review based on recent visits to ensure
            accuracy.
          </li>
          <li>
            <strong>Be Helpful:</strong> Focus on information that helps others
            make decisions.
          </li>
        </ul>
      </section>

      <section>
        <h3>What to Avoid</h3>
        <ul>
          <li>Personal attacks or offensive language</li>
          <li>False or misleading information</li>
          <li>Reviews for breweries you haven't visited</li>
          <li>Promotional content or spam</li>
          <li>Conflicts of interest (e.g., reviewing your own brewery)</li>
        </ul>
      </section>

      <section className="rounded-panel bg-cream p-6">
        <h3>Ready to Write a Review?</h3>
        <p>
          Find your favorite brewery and share your experience with the Maryland
          craft beer community.
        </p>
        <a href="/map" className={buttonVariants()}>
          Browse Breweries
        </a>
      </section>
    </ContentPage>
  );
}
