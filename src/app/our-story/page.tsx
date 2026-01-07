import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/layout-utils';
import PageHero from '@/components/directory/PageHero';

export const metadata: Metadata = createPageMetadata({
  title: 'Our Story',
  description: 'Learn about MarylandBrewery.com and our mission to connect craft beer enthusiasts with Maryland\'s amazing breweries.',
  path: '/our-story',
  keywords: ['Maryland brewery directory', 'about us', 'craft beer Maryland'],
});

export default function OurStoryPage() {
  const breadcrumbs = [
    { name: 'Maryland Breweries', url: '/', isActive: false },
    { name: 'Our Story', url: '/our-story', isActive: true },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <PageHero
        h1="Our Story"
        introText="Discovering Maryland's craft beer scene, one brewery at a time."
        breadcrumbs={breadcrumbs}
        heroImage="/cities-hero.jpg"
      />
      
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About MarylandBrewery.com</h2>
            <p className="text-gray-700 mb-4">
              MarylandBrewery.com was created to celebrate and support Maryland's vibrant craft beer community. We're passionate about connecting craft beer enthusiasts with the amazing breweries that make Maryland's beer scene special.
            </p>
            <p className="text-gray-700 mb-4">
              Our mission is simple: make it easy for people to discover, explore, and enjoy Maryland's craft breweries. Whether you're a local looking for a new favorite spot or a visitor exploring the state, we want to help you find the perfect brewery experience.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">What We Do</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2 font-bold">•</span>
                <span><strong>Comprehensive Directory:</strong> We maintain an up-to-date directory of craft breweries across Maryland</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2 font-bold">•</span>
                <span><strong>Detailed Information:</strong> Hours, amenities, beer types, and more to help you plan your visit</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2 font-bold">•</span>
                <span><strong>Interactive Tools:</strong> Maps, search filters, and location-based recommendations</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2 font-bold">•</span>
                <span><strong>Community Support:</strong> We support both brewery owners and craft beer enthusiasts</span>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Our Values</h3>
            <div className="space-y-4 text-gray-700">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Supporting Local</h4>
                <p>We believe in supporting local businesses and the craft beer community that makes Maryland special.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Accuracy & Trust</h4>
                <p>We strive to provide accurate, up-to-date information you can rely on when planning your brewery visits.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Community First</h4>
                <p>This directory is built for the community, by the community. We welcome feedback and contributions.</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Independent & Unbiased</h3>
            <p className="text-gray-700 mb-4">
              MarylandBrewery.com is an independent directory. We are not affiliated with any of the breweries listed on our site. This allows us to provide unbiased information and fair representation for all Maryland breweries.
            </p>
            <p className="text-gray-700">
              Our goal is to help you discover great breweries, whether they're well-established favorites or hidden gems waiting to be found.
            </p>
          </section>

          <section className="bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Involved</h3>
            <p className="text-gray-700 mb-4">
              Have a suggestion, found an error, or want to add your brewery? We'd love to hear from you.
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

