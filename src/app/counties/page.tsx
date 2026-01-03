import { Metadata } from 'next';
import { getProcessedBreweryData } from '../../../lib/brewery-data';
import { slugify } from '@/lib/data-utils';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import '@/components/home-v2/styles.css';

export const metadata: Metadata = {
  title: 'Maryland Counties with Breweries - Browse by County',
  description: 'Browse all 24 Maryland counties with breweries. Find breweries by county across Maryland. Explore Baltimore City, Anne Arundel, Montgomery, and more.',
  alternates: {
    canonical: '/counties',
  },
  openGraph: {
    title: 'Maryland Counties with Breweries - Browse by County',
    description: 'Browse all 24 Maryland counties with breweries. Find breweries by county across Maryland.',
      url: 'https://www.marylandbrewery.com/counties',
    siteName: 'Maryland Brewery Directory',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Maryland Brewery Directory - Counties',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Maryland Counties with Breweries - Browse by County',
    description: 'Browse all 24 Maryland counties with breweries. Find breweries by county across Maryland.',
    images: ['/og-image.jpg'],
  },
};

const ALL_MD_COUNTIES = [
  'Allegany', 'Anne Arundel', 'Baltimore', 'Calvert', 'Caroline', 'Carroll', 'Cecil', 'Charles',
  'Dorchester', 'Frederick', 'Garrett', 'Harford', 'Howard', 'Kent', 'Montgomery',
  'Prince Georges', 'Queen Annes', 'Somerset', 'St Marys', 'Talbot', 'Washington', 'Wicomico', 'Worcester'
];

export const revalidate = 3600;

export default async function CountiesIndexPage() {
  const processed = await getProcessedBreweryData();

  // Process counties the same way as homepage - directly from breweries array
  const countyCounts = new Map<string, { name: string; slug: string; count: number }>();
  processed.breweries.forEach((brewery: any) => {
    if (brewery.county) {
      const slug = slugify(brewery.county);
      const existing = countyCounts.get(slug);
      if (existing) {
        existing.count++;
      } else {
        countyCounts.set(slug, { name: `${brewery.county} County`, slug, count: 1 });
      }
    }
  });
  
  const items = Array.from(countyCounts.values()).sort((a, b) => b.count - a.count).map(item => ({
    ...item,
    url: `/counties/${item.slug}/breweries`,
  }));

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Hero Section */}
      <section className="bg-white border-b-4 border-[#9B2335] relative overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 md-pattern-bg pointer-events-none" />
        
        <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
          {/* Breadcrumbs */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center flex-wrap gap-2 text-sm" style={{ fontFamily: "'Source Sans 3', sans-serif", color: '#6B6B6B' }}>
              <li>
                <Link 
                  href="/" 
                  className="hover:text-[#9B2335] transition-colors"
                >
                  Home
                </Link>
              </li>
              <li><ChevronRight className="h-4 w-4 mx-2" /></li>
              <li className="text-[#1C1C1C] font-medium">Counties</li>
            </ol>
          </nav>

          {/* H1 Title */}
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1C1C1C] mb-6 leading-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Maryland Counties with Breweries
          </h1>

          {/* Intro Paragraph */}
          <p 
            className="text-lg md:text-xl text-[#6B6B6B] max-w-3xl leading-relaxed"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            Browse all counties in Maryland with craft breweries. From urban centers like Baltimore City and Montgomery County to rural areas across the state, discover breweries organized by county.
          </p>
        </div>
      </section>

      {/* All Counties Listing - 5 columns like BimmerShops */}
      <section className="bg-white py-12 md:py-16 border-b border-[#E8E6E1]">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="section-divider mb-4" />
            <h2 
              className="text-3xl md:text-4xl font-bold text-[#1C1C1C] mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Find Maryland Breweries in Your County
            </h2>
          </div>

          {/* All Counties Grid - 5 columns like BimmerShops */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-1">
            {items.map((county) => (
              <Link
                key={county.slug}
                href={county.url}
                className="group relative py-3 px-0 text-[#1C1C1C] hover:text-[#9B2335] transition-colors duration-300 text-sm border-b border-[#E5E7EB] last:border-b-0 hover:bg-[#FAF9F6]/50 rounded-sm"
                style={{ 
                  fontFamily: "'Source Sans 3', sans-serif",
                  fontWeight: 500,
                }}
              >
                <span className="relative inline-block">
                  {county.name}
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-gradient-to-r from-[#9B2335] to-[#D4A017] group-hover:w-full transition-all duration-300" />
                </span>
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-4 bg-[#D4A017]/20 group-hover:w-1 transition-all duration-300 rounded-r" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-white py-12 md:py-16 border-t border-[#E8E6E1]">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 
            className="text-3xl md:text-4xl font-bold text-[#1C1C1C] mb-6"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            About Maryland Brewery Directory
          </h2>
          <div 
            className="prose prose-lg text-[#6B6B6B] space-y-4"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            <p>
              Maryland Brewery Directory is your complete guide to craft breweries across the Old Line State. 
              We connect beer enthusiasts with local breweries, providing detailed information about locations, 
              hours, amenities, and beer selections.
            </p>
            <p>
              Our directory includes breweries across counties in Maryland, 
              from urban centers like Baltimore City and Montgomery County to rural areas across the state. 
              Whether you're planning a brewery tour or looking for a local spot, we make it easy to discover 
              Maryland's vibrant craft beer scene.
            </p>
            <p>
              <strong className="text-[#1C1C1C]">Brewery Owners:</strong> Want to list your brewery or update 
              your information? <Link href="/contact" className="text-[#9B2335] hover:text-[#D4A017] transition-colors underline">
                Contact us
              </Link> to get started.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
