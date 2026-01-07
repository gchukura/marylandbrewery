import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/layout-utils';
import PageHero from '@/components/directory/PageHero';

export const metadata: Metadata = createPageMetadata({
  title: 'Review Guidelines',
  description: 'Guidelines for writing helpful and honest reviews of Maryland breweries. Learn how to share your brewery experience effectively.',
  path: '/review-guidelines',
  keywords: ['brewery reviews', 'review guidelines', 'Maryland brewery reviews'],
});

export default function ReviewGuidelinesPage() {
  const breadcrumbs = [
    { name: 'Maryland Breweries', url: '/', isActive: false },
    { name: 'Review Guidelines', url: '/review-guidelines', isActive: true },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <PageHero
        h1="Review Guidelines"
        introText="Help fellow craft beer enthusiasts discover great breweries by writing helpful, honest reviews."
        breadcrumbs={breadcrumbs}
        heroImage="/cities-hero.jpg"
      />
      
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Writing Great Reviews</h2>
            <p className="text-gray-700 mb-4">
              Your reviews help others discover amazing breweries and make informed decisions. Here's how to write reviews that are helpful and authentic.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">What to Include</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span><strong>Beer Quality:</strong> Share your thoughts on the beer selection, quality, and unique offerings.</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span><strong>Atmosphere:</strong> Describe the vibe, ambiance, and overall experience.</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span><strong>Service:</strong> Comment on staff friendliness, knowledge, and attentiveness.</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span><strong>Food & Amenities:</strong> Mention food options, outdoor seating, parking, and other amenities.</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span><strong>Value:</strong> Share your perspective on pricing and overall value.</span>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Best Practices</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span><strong>Be Honest:</strong> Share your genuine experience, both positive and negative.</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span><strong>Be Specific:</strong> Provide concrete details rather than vague statements.</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span><strong>Be Respectful:</strong> Critique the experience, not the people. Keep it professional.</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span><strong>Be Recent:</strong> Review based on recent visits to ensure accuracy.</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span><strong>Be Helpful:</strong> Focus on information that helps others make decisions.</span>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">What to Avoid</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span>Personal attacks or offensive language</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span>False or misleading information</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span>Reviews for breweries you haven't visited</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span>Promotional content or spam</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span>Conflicts of interest (e.g., reviewing your own brewery)</span>
              </li>
            </ul>
          </section>

          <section className="bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Ready to Write a Review?</h3>
            <p className="text-gray-700 mb-4">
              Find your favorite brewery and share your experience with the Maryland craft beer community.
            </p>
            <a
              href="/map"
              className="inline-block bg-[#9B2335] text-white font-semibold px-6 py-2 rounded hover:bg-[#7A1C2A] transition-colors"
            >
              Browse Breweries
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}

