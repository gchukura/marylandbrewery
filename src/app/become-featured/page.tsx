import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/layout-utils';
import PageHero from '@/components/directory/PageHero';

export const metadata: Metadata = createPageMetadata({
  title: 'Become a Featured Listing',
  description: 'Get your Maryland brewery featured prominently in our directory. Increase visibility and reach more craft beer enthusiasts.',
  path: '/become-featured',
  keywords: ['featured brewery listing', 'brewery marketing', 'Maryland brewery promotion'],
});

export default function BecomeFeaturedPage() {
  const breadcrumbs = [
    { name: 'Maryland Breweries', url: '/', isActive: false },
    { name: 'Become a Featured Listing', url: '/become-featured', isActive: true },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <PageHero
        h1="Become a Featured Listing"
        introText="Stand out from the crowd and reach more craft beer enthusiasts with a featured listing."
        breadcrumbs={breadcrumbs}
        heroImage="/cities-hero.jpg"
      />
      
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Become Featured?</h2>
            <p className="text-gray-700 mb-4">
              Featured listings receive prominent placement throughout our directory, helping you reach more customers and grow your brewery's visibility in Maryland's craft beer community.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Featured Listing Benefits</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2 font-bold">•</span>
                <span><strong>Prominent Placement:</strong> Your brewery appears at the top of search results and category pages</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2 font-bold">•</span>
                <span><strong>Enhanced Profile:</strong> More photos, detailed descriptions, and special highlighting</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2 font-bold">•</span>
                <span><strong>Priority Updates:</strong> Your information gets updated faster when you request changes</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2 font-bold">•</span>
                <span><strong>Marketing Support:</strong> Featured breweries are highlighted in our marketing materials</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2 font-bold">•</span>
                <span><strong>Analytics Access:</strong> See how many people view your listing</span>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">What's Included</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Enhanced Profile</h4>
                <p className="text-sm text-gray-700">Extended description, multiple photos, and custom content</p>
              </div>
              <div className="bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Priority Placement</h4>
                <p className="text-sm text-gray-700">Featured at the top of relevant search results and category pages</p>
              </div>
              <div className="bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Social Media Promotion</h4>
                <p className="text-sm text-gray-700">Included in our social media features and newsletters</p>
              </div>
              <div className="bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Quick Updates</h4>
                <p className="text-sm text-gray-700">Fast-track updates when you need to change information</p>
              </div>
            </div>
          </section>

          <section className="bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Started</h3>
            <p className="text-gray-700 mb-4">
              Interested in becoming a featured listing? Contact us to learn more about pricing and availability.
            </p>
            <a
              href="/contact"
              className="inline-block bg-[#9B2335] text-white font-semibold px-6 py-2 rounded hover:bg-[#7A1C2A] transition-colors"
            >
              Contact Us
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}

