import { Metadata } from 'next';
import { getProcessedBreweryData } from '../../../lib/brewery-data';
import { slugify } from '@/lib/data-utils';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { existsSync } from 'fs';
import { join } from 'path';
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
        url: '/opengraph-image',
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
    images: ['/opengraph-image'],
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
  
  const items = Array.from(countyCounts.values()).sort((a, b) => a.name.localeCompare(b.name)).map(item => ({
    ...item,
    url: `/counties/${item.slug}/breweries`,
  }));

  // Check for counties index hero image
  const countiesHeroImagePath = '/counties-hero.jpg';
  const countiesHeroImageFile = join(process.cwd(), 'public', 'counties-hero.jpg');
  const hasCountiesHeroImage = existsSync(countiesHeroImageFile);

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Hero Section */}
      <section className="bg-white border-b-4 border-[#9B2335] relative overflow-hidden">
        {/* Counties Hero Image Background */}
        {hasCountiesHeroImage && (
          <div className="absolute inset-0">
            <Image
              src={countiesHeroImagePath}
              alt="Craft breweries"
              fill
              className="object-cover"
              sizes="100vw"
              priority
              unoptimized={false}
            />
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
          </div>
        )}
        
        {/* Pattern overlay (only if no hero image) */}
        {!hasCountiesHeroImage && (
          <div className="absolute inset-0 md-pattern-bg pointer-events-none" />
        )}
        
        <div className="container mx-auto px-4 py-10 md:py-14 relative z-10">
          {/* Breadcrumbs */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className={`flex items-center flex-wrap gap-2 text-sm font-body ${hasCountiesHeroImage ? 'text-white/90' : 'text-[#6B6B6B]'}`}>
              <li>
                <Link 
                  href="/" 
                  className={`transition-colors ${hasCountiesHeroImage ? 'hover:text-white drop-shadow-md' : 'hover:text-[#9B2335]'}`}
                >
                  Maryland Breweries
                </Link>
              </li>
              <li><ChevronRight className={`h-4 w-4 mx-2 ${hasCountiesHeroImage ? 'text-white/70' : 'text-[#6B6B6B]'}`} /></li>
              <li>
                <Link 
                  href="/counties" 
                  className={`font-medium transition-colors ${hasCountiesHeroImage ? 'text-white drop-shadow-md hover:text-white' : 'text-[#1C1C1C] hover:text-[#9B2335]'}`}
                >
                  Counties
                </Link>
              </li>
            </ol>
          </nav>

          {/* H1 Title */}
          <h1 
            className={`text-h1 md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 leading-snug font-display ${
              hasCountiesHeroImage 
                ? 'text-white drop-shadow-lg' 
                : 'text-[#1C1C1C]'
            }`}
            style={hasCountiesHeroImage ? { textShadow: '2px 2px 4px rgba(0,0,0,0.5)' } : undefined}
          >
            Maryland Counties with Breweries
          </h1>

          {/* Intro Paragraph */}
          <p 
            className={`text-body-large md:text-xl max-w-3xl leading-snug font-body ${
              hasCountiesHeroImage 
                ? 'text-white/95 drop-shadow-md' 
                : 'text-[#6B6B6B]'
            }`}
          >
            Browse all counties in Maryland with craft breweries. From urban centers like Baltimore City and Montgomery County to rural areas across the state, discover breweries organized by county.
          </p>
        </div>
      </section>

      {/* All Counties Listing - 5 columns like BimmerShops */}
      <section className="bg-white py-10 md:py-14 border-b border-[#E8E6E1]">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="section-divider mb-4" />
            <h2 
              className="text-h2 md:text-3xl lg:text-4xl font-bold text-[#1C1C1C] mb-3 font-display"
            >
              Find Maryland Breweries in Your County
            </h2>
          </div>

          {/* All Counties Grid - 5 columns like BimmerShops */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 md:gap-x-6 gap-y-1">
            {items.map((county) => (
              <Link
                key={county.slug}
                href={county.url}
                className="group relative py-3 px-0 text-[#1C1C1C] hover:text-[#9B2335] transition-colors duration-300 text-base border-b border-gray-200 last:border-b-0 hover:bg-[#FAF9F6]/50 rounded-sm font-body font-medium"
              >
                <span className="relative inline-block">
                  {county.name.replace(/\s+County$/i, '')}
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-gradient-to-r from-[#9B2335] to-[#D4A017] group-hover:w-full transition-all duration-300" />
                </span>
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-4 bg-[#D4A017]/20 group-hover:w-1 transition-all duration-300 rounded-r" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-white py-10 md:py-14 border-t border-[#E8E6E1]">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 
            className="text-h2 md:text-3xl lg:text-4xl font-bold text-[#1C1C1C] mb-6 font-display"
          >
            About Maryland Brewery Directory
          </h2>
          <div 
            className="prose prose-lg text-[#6B6B6B] space-y-4 font-body"
          >
            <p className="text-body leading-loose">
              Maryland Brewery Directory is your complete guide to craft breweries across Maryland. 
              We connect beer enthusiasts with local breweries, providing detailed information about locations, 
              hours, amenities, and beer selections.
            </p>
            <p className="text-body leading-loose">
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
