import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/layout-utils';
import PageHero from '@/components/directory/PageHero';
import Link from 'next/link';

export const metadata: Metadata = createPageMetadata({
  title: 'Customer Reviews',
  description: 'Learn how customer reviews help Maryland breweries grow and how to effectively manage your online reputation.',
  path: '/customer-reviews',
  keywords: ['brewery reviews', 'customer reviews', 'online reputation'],
});

export default function CustomerReviewsPage() {
  const breadcrumbs = [
    { name: 'Maryland Breweries', url: '/', isActive: false },
    { name: 'Customer Reviews', url: '/customer-reviews', isActive: true },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <PageHero
        h1="Customer Reviews"
        introText="Understanding how customer reviews can help your brewery grow and build trust with potential customers."
        breadcrumbs={breadcrumbs}
        heroImage="/cities-hero.jpg"
      />
      
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">The Power of Customer Reviews</h2>
            <p className="text-gray-700 mb-4">
              Customer reviews are one of the most influential factors in a consumer's decision to visit your brewery. Studies show that the majority of customers read reviews before making a purchase decision, and positive reviews can significantly increase foot traffic and sales.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Why Reviews Matter</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2 font-bold">•</span>
                <span><strong>Build Trust:</strong> Authentic reviews from real customers build credibility and trust with potential visitors</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2 font-bold">•</span>
                <span><strong>Improve Visibility:</strong> Reviews help your brewery appear in search results and recommendations</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2 font-bold">•</span>
                <span><strong>Provide Feedback:</strong> Reviews offer valuable insights into what customers love and what could be improved</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2 font-bold">•</span>
                <span><strong>Drive Decisions:</strong> Many customers rely on reviews to choose which brewery to visit</span>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Encouraging Reviews</h3>
            <div className="space-y-3 text-gray-700">
              <p className="mb-3">Here are effective ways to encourage customers to leave reviews:</p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-[#9B2335] mr-2">•</span>
                  <span>Ask satisfied customers directly after a positive experience</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#9B2335] mr-2">•</span>
                  <span>Include review links on receipts, menus, or follow-up emails</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#9B2335] mr-2">•</span>
                  <span>Make it easy with QR codes that link directly to review pages</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#9B2335] mr-2">•</span>
                  <span>Thank customers who leave reviews publicly on social media</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#9B2335] mr-2">•</span>
                  <span>Never offer incentives for reviews, as this violates platform policies</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Responding to Reviews</h3>
            <p className="text-gray-700 mb-3">
              How you respond to reviews shows your commitment to customer service:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span><strong>Respond Promptly:</strong> Acknowledge all reviews, especially positive ones</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span><strong>Be Professional:</strong> Thank customers and address concerns constructively</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span><strong>Take Action:</strong> Use negative feedback as an opportunity to improve</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span><strong>Stay Authentic:</strong> Personal, genuine responses resonate better than generic templates</span>
              </li>
            </ul>
          </section>

          <section className="bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Learn More</h3>
            <p className="text-gray-700 mb-4">
              For more information about reviews and how they work on our platform, check out our review guidelines.
            </p>
            <Link
              href="/review-guidelines"
              className="inline-block bg-[#9B2335] text-white font-semibold px-6 py-2 rounded hover:bg-[#7A1C2A] transition-colors"
            >
              Review Guidelines
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}

