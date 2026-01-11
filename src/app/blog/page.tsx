import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import PageHero from '@/components/directory/PageHero';
import { existsSync } from 'fs';
import { join } from 'path';
import '@/components/home-v2/styles.css';

export const metadata: Metadata = {
  title: 'Blog - Coming Soon | Maryland Brewery Directory',
  description: 'The Maryland Brewery Directory blog is coming soon. Stay tuned for brewery news, craft beer guides, and stories from Maryland\'s thriving beer scene.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Blog - Coming Soon | Maryland Brewery Directory',
    description: 'The Maryland Brewery Directory blog is coming soon. Stay tuned for brewery news, craft beer guides, and stories from Maryland\'s thriving beer scene.',
    url: 'https://www.marylandbrewery.com/blog',
    siteName: 'Maryland Brewery Directory',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - Coming Soon | Maryland Brewery Directory',
    description: 'The Maryland Brewery Directory blog is coming soon. Stay tuned for brewery news, craft beer guides, and stories from Maryland\'s thriving beer scene.',
  },
};

export default function BlogPage() {
  // Check for blog hero image
  const blogHeroImagePath = '/blog-hero.jpg';
  const blogHeroImageFile = join(process.cwd(), 'public', 'blog-hero.jpg');
  const hasBlogHeroImage = existsSync(blogHeroImageFile);

  const breadcrumbs = [
    { name: 'Maryland Breweries', url: '/', isActive: false },
    { name: 'Blog', url: '/blog', isActive: true },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <PageHero
        h1="Blog"
        introText="Stay tuned for brewery news, craft beer guides, and stories from Maryland's thriving beer scene."
        breadcrumbs={breadcrumbs}
        heroImage={hasBlogHeroImage ? blogHeroImagePath : null}
        heroImageAlt="Maryland Brewery Blog"
      />

      {/* Coming Soon Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 
              className="text-2xl md:text-3xl font-bold text-[#1C1C1C] mb-4"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              We're Brewing Up Something Great
            </h2>

            <p 
              className="text-lg text-[#6B6B6B] mb-8 leading-relaxed"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              Our blog is in the works! Soon you'll find brewery news, craft beer guides, 
              brewer interviews, and stories from Maryland's thriving beer scene.
            </p>

            {/* What to Expect */}
            <div className="bg-white border border-[#E8E6E1] rounded-lg p-6 md:p-8 text-left mb-8">
              <h3 
                className="text-lg font-semibold text-[#1C1C1C] mb-4"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                What to Expect
              </h3>
              <ul 
                className="space-y-3 text-[#6B6B6B]"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#D4A017] mt-2 flex-shrink-0" />
                  <span>Brewery spotlights and behind-the-scenes stories</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#D4A017] mt-2 flex-shrink-0" />
                  <span>Craft beer guides and tasting notes</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#D4A017] mt-2 flex-shrink-0" />
                  <span>Maryland beer events and festivals</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#D4A017] mt-2 flex-shrink-0" />
                  <span>Brewery tours and travel tips</span>
                </li>
              </ul>
            </div>

            {/* CTA */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#9B2335] text-white font-semibold rounded-lg hover:bg-[#7A1C2A] transition-colors"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              Explore Breweries
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

