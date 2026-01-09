import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Newspaper } from 'lucide-react';

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
  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Hero Section */}
      <section className="bg-white border-b-4 border-[#9B2335] relative overflow-hidden">
        <div className="absolute inset-0 md-pattern-bg pointer-events-none opacity-5" />
        
        <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
          {/* Breadcrumbs */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol 
              className="flex items-center flex-wrap gap-2 text-sm text-[#6B6B6B]"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              <li>
                <Link href="/" className="hover:text-[#9B2335] transition-colors">
                  Maryland Breweries
                </Link>
              </li>
              <li><ChevronRight className="h-4 w-4 mx-2" /></li>
              <li>
                <span className="text-[#1C1C1C] font-medium">Blog</span>
              </li>
            </ol>
          </nav>

          {/* H1 Title */}
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1C1C1C] mb-6 leading-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Blog
          </h1>
        </div>
      </section>

      {/* Coming Soon Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            {/* Icon */}
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-[#9B2335]/10 flex items-center justify-center">
              <Newspaper className="w-12 h-12 text-[#9B2335]" />
            </div>

            {/* Coming Soon Badge */}
            <span 
              className="inline-block px-4 py-2 bg-[#D4A017]/20 text-[#8B6914] text-sm font-semibold rounded-full mb-6"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              Coming Soon
            </span>

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

