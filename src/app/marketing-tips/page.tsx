import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/layout-utils';
import ContentPage from '@/components/layout/ContentPage';
import Link from 'next/link';

export const metadata: Metadata = createPageMetadata({
  title: 'Marketing Tips for Brewery Owners',
  description:
    'Marketing tips and strategies to help Maryland brewery owners grow their business and reach more customers.',
  path: '/marketing-tips',
  keywords: [
    'brewery marketing',
    'brewery business tips',
    'craft beer marketing',
  ],
});

export default function MarketingTipsPage() {
  const tips = [
    {
      title: 'Optimize Your Online Presence',
      description:
        'Ensure your brewery is listed accurately across all directories, Google My Business, and social media platforms. Consistent information builds trust.',
    },
    {
      title: 'Engage on Social Media',
      description:
        'Share behind-the-scenes content, new beer releases, events, and customer photos. Regular posting keeps your brewery top-of-mind.',
    },
    {
      title: 'Encourage Customer Reviews',
      description:
        'Positive reviews are powerful marketing tools. Make it easy for customers to leave reviews and respond to all feedback professionally.',
    },
    {
      title: 'Host Events & Collaborations',
      description:
        'Events bring people in and create shareable content. Partner with local businesses, food trucks, or other breweries for unique experiences.',
    },
    {
      title: 'Tell Your Story',
      description:
        "People connect with stories. Share your brewery's origin, brewing philosophy, and what makes you unique. Authenticity resonates.",
    },
    {
      title: 'Leverage Local Partnerships',
      description:
        'Partner with local restaurants, hotels, and tourism boards. Cross-promotion expands your reach within the community.',
    },
    {
      title: 'Offer Tours & Experiences',
      description:
        'Brewery tours and special experiences create memorable visits that customers want to share with others.',
    },
    {
      title: 'Stay Active in the Community',
      description:
        'Participate in local festivals, charity events, and community gatherings. Being visible locally builds a loyal customer base.',
    },
  ];

  return (
    <ContentPage
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Marketing Tips', path: '/marketing-tips' },
      ]}
      title="Marketing Tips for Brewery Owners"
      intro="Practical marketing strategies to help your Maryland brewery grow and reach more craft beer enthusiasts."
    >
      <section>
        <h2>Growing Your Brewery Business</h2>
        <p>
          Effective marketing helps your brewery stand out in Maryland's
          competitive craft beer scene. Here are proven strategies to attract
          and retain customers.
        </p>
        {tips.map((tip) => (
          <div key={tip.title}>
            <h3>{tip.title}</h3>
            <p>{tip.description}</p>
          </div>
        ))}
      </section>

      <section className="mt-10 rounded-panel bg-cream p-6">
        <h3>Additional Resources</h3>
        <ul>
          <li>
            <Link href="/become-featured">Become a Featured Listing</Link> —
            Increase your visibility in our directory
          </li>
          <li>
            <Link href="/customer-reviews">Customer Reviews</Link> — Learn how
            reviews can help your business
          </li>
          <li>
            <Link href="/contact">Contact Us</Link> — Get personalized marketing
            advice
          </li>
        </ul>
      </section>
    </ContentPage>
  );
}
