import { Metadata } from 'next';
import { getAllCities, getProcessedBreweryData } from '../../../lib/brewery-data';
import { slugify } from '@/lib/data-utils';
import Link from 'next/link';
import { ChevronRight, MapPin } from 'lucide-react';
import Image from 'next/image';
import { existsSync } from 'fs';
import { join } from 'path';
import '@/components/home-v2/styles.css';

export const metadata: Metadata = {
  title: 'Maryland Cities with Breweries - Browse by City',
  description: 'Browse all Maryland cities with breweries. Find breweries by city across the Old Line State. Explore Baltimore, Annapolis, Frederick, and more.',
  alternates: {
    canonical: '/cities',
  },
  openGraph: {
    title: 'Maryland Cities with Breweries - Browse by City',
    description: 'Browse all Maryland cities with breweries. Find breweries by city across the Old Line State.',
    url: 'https://www.marylandbrewery.com/cities',
    siteName: 'Maryland Brewery Directory',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Maryland Brewery Directory - Cities',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Maryland Cities with Breweries - Browse by City',
    description: 'Browse all Maryland cities with breweries. Find breweries by city across the Old Line State.',
    images: ['/og-image.jpg'],
  },
};

const REGIONS: Record<string, { name: string; cities: string[]; description: string }> = {
  'Central Maryland': {
    name: 'Central Maryland',
    cities: ['Baltimore', 'Columbia', 'Annapolis', 'Towson', 'Ellicott City', 'Catonsville'],
    description: 'The heart of Maryland\'s craft beer scene',
  },
  'Western Maryland': {
    name: 'Western Maryland',
    cities: ['Cumberland', 'Hagerstown', 'Frederick', 'Westminster'],
    description: 'Mountain views and historic charm',
  },
  'Eastern Shore': {
    name: 'Eastern Shore',
    cities: ['Salisbury', 'Easton', 'Ocean City', 'Chestertown', 'Berlin'],
    description: 'Waterfront locations and rural brewery experiences',
  },
};

export const revalidate = 3600; // refresh hourly

export default async function CitiesIndexPage() {
  const processed = await getProcessedBreweryData();
  
  // Process cities the same way as homepage - directly from breweries array
  const cityCounts = new Map<string, { name: string; slug: string; count: number }>();
  processed.breweries.forEach((brewery: any) => {
    if (brewery.city) {
      const slug = slugify(brewery.city);
      const existing = cityCounts.get(slug);
      if (existing) {
        existing.count++;
      } else {
        cityCounts.set(slug, { name: brewery.city, slug, count: 1 });
      }
    }
  });
  
  const items = Array.from(cityCounts.values()).sort((a, b) => a.name.localeCompare(b.name)).map(item => ({
    ...item,
    url: `/cities/${item.slug}/breweries`,
  }));

  // Group by regions
  const grouped: Record<string, typeof items> = {};
  
  for (const [regionKey, regionData] of Object.entries(REGIONS)) {
    grouped[regionKey] = items.filter(item => 
      regionData.cities.some(c => c.toLowerCase() === item.name.toLowerCase())
    );
  }
  
  // Add "Other" for cities not in defined regions
  const otherCities = items.filter(item => 
    !Object.values(REGIONS).some(region => 
      region.cities.some(c => c.toLowerCase() === item.name.toLowerCase())
    )
  );
  
  if (otherCities.length > 0) {
    grouped['Other Cities'] = otherCities;
  }


  // Check for cities index hero image
  const citiesHeroImagePath = '/cities-hero.jpg';
  const citiesHeroImageFile = join(process.cwd(), 'public', 'cities-hero.jpg');
  const hasCitiesHeroImage = existsSync(citiesHeroImageFile);

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Hero Section */}
      <section className="bg-white border-b-4 border-[#9B2335] relative overflow-hidden">
        {/* Cities Hero Image Background */}
        {hasCitiesHeroImage && (
          <div className="absolute inset-0">
            <Image
              src={citiesHeroImagePath}
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
        {!hasCitiesHeroImage && (
          <div className="absolute inset-0 md-pattern-bg pointer-events-none" />
        )}
        
        <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
          {/* Breadcrumbs */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className={`flex items-center flex-wrap gap-2 text-sm ${hasCitiesHeroImage ? 'text-white/90' : ''}`} style={{ fontFamily: "'Source Sans 3', sans-serif", color: hasCitiesHeroImage ? undefined : '#6B6B6B' }}>
              <li>
                <Link 
                  href="/" 
                  className={`transition-colors ${hasCitiesHeroImage ? 'hover:text-white drop-shadow-md' : 'hover:text-[#9B2335]'}`}
                >
                  Home
                </Link>
              </li>
              <li><ChevronRight className={`h-4 w-4 mx-2 ${hasCitiesHeroImage ? 'text-white/70' : ''}`} /></li>
              <li>
                <Link 
                  href="/cities" 
                  className={`font-medium transition-colors ${hasCitiesHeroImage ? 'text-white drop-shadow-md hover:text-white' : 'text-[#1C1C1C] hover:text-[#9B2335]'}`}
                >
                  Cities
                </Link>
              </li>
            </ol>
          </nav>

          {/* H1 Title */}
          <h1 
            className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${
              hasCitiesHeroImage 
                ? 'text-white drop-shadow-lg' 
                : 'text-[#1C1C1C]'
            }`}
            style={{ fontFamily: "'Playfair Display', Georgia, serif", textShadow: hasCitiesHeroImage ? '2px 2px 4px rgba(0,0,0,0.5)' : undefined }}
          >
            Maryland Cities with Breweries
          </h1>

          {/* Intro Paragraph */}
          <p 
            className={`text-lg md:text-xl max-w-3xl leading-relaxed ${
              hasCitiesHeroImage 
                ? 'text-white/95 drop-shadow-md' 
                : 'text-[#6B6B6B]'
            }`}
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            Browse all cities in Maryland with craft breweries. From Baltimore's historic neighborhoods to Annapolis' waterfront locations, discover breweries across the state organized by city.
          </p>
        </div>
      </section>

      {/* All Cities Listing - 5 columns like BimmerShops */}
      <section className="bg-white py-12 md:py-16 border-b border-[#E8E6E1]">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="section-divider mb-4" />
            <h2 
              className="text-3xl md:text-4xl font-bold text-[#1C1C1C] mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Find Maryland Breweries in Your City
            </h2>
          </div>

          {/* All Cities Grid - 5 columns like BimmerShops */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-1">
            {items.map((city) => (
              <Link
                key={city.slug}
                href={city.url}
                className="group relative py-3 px-0 text-[#1C1C1C] hover:text-[#9B2335] transition-colors duration-300 text-sm border-b border-[#E5E7EB] last:border-b-0 hover:bg-[#FAF9F6]/50 rounded-sm"
                style={{ 
                  fontFamily: "'Source Sans 3', sans-serif",
                  fontWeight: 500,
                }}
              >
                <span className="relative inline-block">
                  {city.name}
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
