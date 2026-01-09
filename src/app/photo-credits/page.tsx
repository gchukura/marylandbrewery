import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/layout-utils';
import PageHero from '@/components/directory/PageHero';

export const metadata: Metadata = createPageMetadata({
  title: 'Photo Credits',
  description: 'Photo credits and attribution information for images used on MarylandBrewery.com.',
  path: '/photo-credits',
  keywords: ['photo credits', 'image attribution', 'photography'],
});

export default function PhotoCreditsPage() {
  const breadcrumbs = [
    { name: 'Maryland Breweries', url: '/', isActive: false },
    { name: 'Photo Credits', url: '/photo-credits', isActive: true },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <PageHero
        h1="Photo Credits"
        introText="Attribution and credits for photography used throughout MarylandBrewery.com."
        breadcrumbs={breadcrumbs}
        heroImage="/cities-hero.jpg"
      />
      
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Image Attribution</h2>
            <p className="text-gray-700 mb-4">
              MarylandBrewery.com uses images from various sources to showcase Maryland's craft breweries. We strive to properly attribute all photographs and respect the rights of photographers and content creators.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Image Sources</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2 font-bold">•</span>
                <span><strong>Brewery-Provided Photos:</strong> Many breweries have provided their own photos for use on our site</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2 font-bold">•</span>
                <span><strong>Stock Photography:</strong> Some images are sourced from stock photo services with appropriate licenses</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2 font-bold">•</span>
                <span><strong>Public Domain:</strong> Some images are in the public domain or used under Creative Commons licenses</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2 font-bold">•</span>
                <span><strong>User Contributions:</strong> Photos submitted by users with permission for use on our site</span>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Using Our Images</h3>
            <p className="text-gray-700 mb-4">
              Images on MarylandBrewery.com are protected by copyright. If you wish to use any images from our site:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span>Contact us for permission before using images for commercial purposes</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span>Provide proper attribution when using images with permission</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span>Respect the rights of original photographers and content creators</span>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Copyright Concerns</h3>
            <p className="text-gray-700 mb-4">
              If you believe that any image on our site infringes on your copyright, please contact us immediately. We take copyright concerns seriously and will address them promptly.
            </p>
            <p className="text-gray-700">
              When reporting a copyright concern, please include:
            </p>
            <ul className="space-y-2 text-gray-700 mt-2">
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span>A description of the copyrighted work</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span>The URL where the image appears on our site</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span>Your contact information and proof of ownership</span>
              </li>
            </ul>
          </section>

          <section className="bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Have Questions?</h3>
            <p className="text-gray-700 mb-4">
              For questions about photo credits, image usage, or copyright concerns, please contact us.
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

