import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/layout-utils';
import ContentPage from '@/components/layout/ContentPage';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = createPageMetadata({
  title: 'Customer Reviews',
  description:
    'Learn how customer reviews help Maryland breweries grow and how to effectively manage your online reputation.',
  path: '/customer-reviews',
  keywords: ['brewery reviews', 'customer reviews', 'online reputation'],
});

export default function CustomerReviewsPage() {
  return (
    <ContentPage
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Customer Reviews', path: '/customer-reviews' },
      ]}
      title="Customer Reviews"
      intro="Understanding how customer reviews can help your brewery grow and build trust with potential customers."
    >
      <section>
        <h2>The Power of Customer Reviews</h2>
        <p>
          Many people read reviews before choosing a brewery to visit. On
          Maryland Brewery, the rating, review count and review highlights on
          your page come from your Google reviews, so the advice below applies
          to how your brewery looks here too.
        </p>
      </section>

      <section>
        <h3>Why Reviews Matter</h3>
        <ul>
          <li>
            <strong>Build Trust:</strong> Authentic reviews from real customers
            build credibility and trust with potential visitors
          </li>
          <li>
            <strong>Improve Visibility:</strong> Reviews help your brewery
            appear in search results and recommendations
          </li>
          <li>
            <strong>Provide Feedback:</strong> Reviews offer valuable insights
            into what customers love and what could be improved
          </li>
          <li>
            <strong>Drive Decisions:</strong> Many customers rely on reviews to
            choose which brewery to visit
          </li>
        </ul>
      </section>

      <section>
        <h3>Encouraging Reviews</h3>
        <div>
          <p>
            Here are effective ways to encourage customers to leave reviews:
          </p>
          <ul>
            <li>
              Ask satisfied customers directly after a positive experience
            </li>
            <li>
              Include review links on receipts, menus, or follow-up emails
            </li>
            <li>
              Make it easy with QR codes that link directly to review pages
            </li>
            <li>Thank customers who leave reviews publicly on social media</li>
            <li>
              Never offer incentives for reviews, as this violates platform
              policies
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h3>Responding to Reviews</h3>
        <p>
          How you respond to reviews shows your commitment to customer service:
        </p>
        <ul>
          <li>
            <strong>Respond Promptly:</strong> Acknowledge all reviews,
            especially positive ones
          </li>
          <li>
            <strong>Be Professional:</strong> Thank customers and address
            concerns constructively
          </li>
          <li>
            <strong>Take Action:</strong> Use negative feedback as an
            opportunity to improve
          </li>
          <li>
            <strong>Stay Authentic:</strong> Personal, genuine responses
            resonate better than generic templates
          </li>
        </ul>
      </section>

      <section className="rounded-panel bg-cream p-6">
        <h3>Learn More</h3>
        <p>
          Visitors can&apos;t post reviews on Maryland Brewery; everything shown
          comes from Google. Our review guidelines explain where reviews come
          from and how to write a helpful one.
        </p>
        <Link href="/review-guidelines" className={buttonVariants()}>
          Review Guidelines
        </Link>
      </section>
    </ContentPage>
  );
}
