import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/layout-utils';
import PageHero from '@/components/directory/PageHero';
import Link from 'next/link';

export const metadata: Metadata = createPageMetadata({
  title: 'Marketing Tips for Brewery Owners',
  description: 'Marketing tips and strategies to help Maryland brewery owners grow their business and reach more customers.',
  path: '/marketing-tips',
  keywords: ['brewery marketing', 'brewery business tips', 'craft beer marketing'],
});

export default function MarketingTipsPage() {
  const breadcrumbs = [
    { name: 'Maryland Breweries', url: '/', isActive: false },
    { name: 'Marketing Tips', url: '/marketing-tips', isActive: true },
  ];

  const tips = [
    {
      title: 'Optimize Your Online Presence',
      description: 'Ensure your brewery is listed accurately across all directories, Google My Business, and social media platforms. Consistent information builds trust.',
    },
    {
      title: 'Engage on Social Media',
      description: 'Share behind-the-scenes content, new beer releases, events, and customer photos. Regular posting keeps your brewery top-of-mind.',
    },
    {
      title: 'Encourage Customer Reviews',
      description: 'Positive reviews are powerful marketing tools. Make it easy for customers to leave reviews and respond to all feedback professionally.',
    },
    {
      title: 'Host Events & Collaborations',
      description: 'Events bring people in and create shareable content. Partner with local businesses, food trucks, or other breweries for unique experiences.',
    },
    {
      title: 'Tell Your Story',
      description: 'People connect with stories. Share your brewery\'s origin, brewing philosophy, and what makes you unique. Authenticity resonates.',
    },
    {
      title: 'Leverage Local Partnerships',
      description: 'Partner with local restaurants, hotels, and tourism boards. Cross-promotion expands your reach within the community.',
    },
    {
      title: 'Offer Tours & Experiences',
      description: 'Brewery tours and special experiences create memorable visits that customers want to share with others.',
    },
    {
      title: 'Stay Active in the Community',
      description: 'Participate in local festivals, charity events, and community gatherings. Being visible locally builds a loyal customer base.',
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <PageHero
        h1="Marketing Tips for Brewery Owners"
        introText="Practical marketing strategies to help your Maryland brewery grow and reach more craft beer enthusiasts."
        breadcrumbs={breadcrumbs}
        heroImage="/cities-hero.jpg"
      />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Growing Your Brewery Business</h2>
          <p className="text-gray-700 mb-6">
            Effective marketing helps your brewery stand out in Maryland's competitive craft beer scene. Here are proven strategies to attract and retain customers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {tips.map((tip, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{tip.title}</h3>
              <p className="text-gray-700">{tip.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Additional Resources</h3>
          <ul className="space-y-2 text-gray-700">
            <li>
              <Link href="/become-featured" className="text-[#9B2335] hover:text-[#7A1C2A] underline">
                Become a Featured Listing
              </Link>
              {' '}— Increase your visibility in our directory
            </li>
            <li>
              <Link href="/customer-reviews" className="text-[#9B2335] hover:text-[#7A1C2A] underline">
                Customer Reviews
              </Link>
              {' '}— Learn how reviews can help your business
            </li>
            <li>
              <Link href="/contact" className="text-[#9B2335] hover:text-[#7A1C2A] underline">
                Contact Us
              </Link>
              {' '}— Get personalized marketing advice
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

