import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/layout-utils';
import PageHero from '@/components/directory/PageHero';
import Link from 'next/link';

export const metadata: Metadata = createPageMetadata({
  title: 'Add Your Brewery',
  description: 'Add your Maryland brewery to our comprehensive directory. Help craft beer enthusiasts discover your brewery.',
  path: '/add-brewery',
  keywords: ['add brewery', 'list brewery', 'Maryland brewery directory'],
});

export default function AddBreweryPage() {
  const breadcrumbs = [
    { name: 'Maryland Breweries', url: '/', isActive: false },
    { name: 'Add Your Brewery', url: '/add-brewery', isActive: true },
  ];

  return (
    <div className="bg-cream min-h-screen">
      <PageHero
        h1="Add Your Brewery"
        introText="Join Maryland's most comprehensive craft brewery directory and help beer enthusiasts discover your brewery."
        breadcrumbs={breadcrumbs}
        heroImage="/cities-hero.jpg"
      />
      
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-line p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-ink mb-4">Get Listed</h2>
            <p className="text-muted mb-4">
              Adding your brewery to our directory is free and helps connect you with craft beer enthusiasts across Maryland. We're always looking to expand our directory with new and existing breweries.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-ink mb-3">What We Need</h3>
            <p className="text-muted mb-3">To add your brewery, please provide the following information:</p>
            <ul className="space-y-2 text-muted">
              <li className="flex items-start">
                <span className="text-brand-red mr-2">•</span>
                <span><strong>Brewery Name:</strong> Official name of your brewery</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-red mr-2">•</span>
                <span><strong>Address:</strong> Full street address, city, state, and ZIP code</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-red mr-2">•</span>
                <span><strong>Contact Information:</strong> Phone number, email, and website</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-red mr-2">•</span>
                <span><strong>Hours:</strong> Regular operating hours</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-red mr-2">•</span>
                <span><strong>Brewery Type:</strong> Production brewery, brewpub, taproom, etc.</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-red mr-2">•</span>
                <span><strong>Amenities:</strong> Food service, outdoor seating, parking, tours, etc.</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-red mr-2">•</span>
                <span><strong>Photos:</strong> High-quality photos of your brewery (optional but recommended)</span>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-ink mb-3">How It Works</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-brand-red text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold mr-4 flex-shrink-0">1</div>
                <div>
                  <h4 className="font-semibold text-ink mb-1">Submit Your Information</h4>
                  <p className="text-muted">Use our contact form to send us your brewery details</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-brand-red text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold mr-4 flex-shrink-0">2</div>
                <div>
                  <h4 className="font-semibold text-ink mb-1">We Review & Verify</h4>
                  <p className="text-muted">We'll verify your information and may contact you with questions</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-brand-red text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold mr-4 flex-shrink-0">3</div>
                <div>
                  <h4 className="font-semibold text-ink mb-1">You're Live!</h4>
                  <p className="text-muted">Your brewery appears in our directory and is discoverable by thousands of visitors</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-paper border border-line rounded-lg p-6">
            <h3 className="text-xl font-semibold text-ink mb-3">Ready to Add Your Brewery?</h3>
            <p className="text-muted mb-4">
              Use our contact form to submit your brewery information. We typically add new listings within 1-2 business days.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-brand-red text-white font-semibold px-6 py-2 rounded hover:bg-brand-red-dark transition-colors"
            >
              Submit Your Brewery
            </Link>
          </section>

          <section className="border-t border-line pt-6">
            <h3 className="text-xl font-semibold text-ink mb-3">Already Listed?</h3>
            <p className="text-muted mb-4">
              If your brewery is already in our directory and you need to update information, please contact us with the changes.
            </p>
            <Link
              href="/contact"
              className="text-brand-red hover:text-brand-red-dark font-semibold underline"
            >
              Update Brewery Information →
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}

