import { Metadata } from 'next';
import { getProcessedBreweryData } from '../../../lib/brewery-data';
import { slugify, deslugify } from '@/lib/data-utils';
import Link from 'next/link';
import { ChevronRight, Beer, Store, Warehouse, Leaf, FlaskConical } from 'lucide-react';
import Image from 'next/image';
import { existsSync } from 'fs';
import { join } from 'path';
import '@/components/home-v2/styles.css';

export const metadata: Metadata = {
  title: 'Brewery Types - Maryland Brewery Directory',
  description: 'Browse Maryland breweries by type. Explore microbreweries, brewpubs, taprooms, production facilities, nano breweries, and farm breweries across the state.',
  alternates: {
    canonical: '/type',
  },
  openGraph: {
    title: 'Brewery Types - Maryland Brewery Directory',
    description: 'Browse Maryland breweries by type. Explore microbreweries, brewpubs, taprooms, and more across the state.',
    url: 'https://www.marylandbrewery.com/type',
    siteName: 'Maryland Brewery Directory',
    type: 'website',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Maryland Brewery Directory - Brewery Types',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Brewery Types - Maryland Brewery Directory',
    description: 'Browse Maryland breweries by type.',
    images: ['/opengraph-image'],
  },
};

// Brewery type definitions in our own voice
const BREWERY_TYPE_DEFINITIONS: Record<string, {
  name: string;
  definition: string;
  characteristics: string[];
  icon: React.ElementType;
}> = {
  'microbrewery': {
    name: 'Microbrewery',
    definition: 'These are the heart of Maryland\'s craft beer movement. Microbreweries focus on quality over quantity, brewing smaller batches with care and creativity. Most of their beer heads out to local bars, restaurants, and bottle shops—though many have cozy tasting rooms where you can sample the latest creations straight from the source.',
    characteristics: [
      'Small-batch, artisanal brewing',
      'Beer sold at local bars & shops',
      'Often have on-site tasting rooms',
      'Known for creative, unique recipes',
    ],
    icon: FlaskConical,
  },
  'brewpub': {
    name: 'Brewpub',
    definition: 'The best of both worlds—a restaurant and brewery under one roof. Brewpubs serve their house-brewed beers alongside a full food menu, making them perfect for a complete night out. The kitchen often creates dishes designed to pair perfectly with the beers being poured just feet away.',
    characteristics: [
      'Full restaurant and bar service',
      'Fresh beer brewed on-site',
      'Food menu crafted for beer pairing',
      'Great for dinner and drinks',
    ],
    icon: Store,
  },
  'taproom': {
    name: 'Taproom',
    definition: 'Taprooms put the beer front and center. These spaces are all about the drinking experience—think rotating taps, knowledgeable staff, and a relaxed atmosphere. Food is usually minimal (think snacks or food trucks), so you can focus on what matters: exploring great craft beer with friends.',
    characteristics: [
      'Beer-focused experience',
      'Relaxed, social atmosphere',
      'Limited food, often food trucks',
      'Perfect for casual hangouts',
    ],
    icon: Beer,
  },
  'production': {
    name: 'Production Brewery',
    definition: 'These are Maryland\'s brewing powerhouses. Production breweries have the capacity to brew large quantities and distribute their beer across the region—and sometimes beyond. Many still welcome visitors to their facilities, offering tours and taprooms where you can see brewing in action.',
    characteristics: [
      'Large-scale brewing operations',
      'Wide distribution network',
      'Often offer facility tours',
      'May have on-site taproom',
    ],
    icon: Warehouse,
  },
  'nano': {
    name: 'Nano Brewery',
    definition: 'The smallest of the small, nano breweries are often passion projects run by dedicated brewers. With tiny batch sizes, they can experiment freely and create beers you won\'t find anywhere else. If you love discovering something truly unique, nano breweries are where the magic happens.',
    characteristics: [
      'Ultra-small batch brewing',
      'Highly experimental recipes',
      'Intimate, personal experience',
      'True hidden gems',
    ],
    icon: FlaskConical,
  },
  'farm-brewery': {
    name: 'Farm Brewery',
    definition: 'Farm breweries bring the farm-to-glass movement to Maryland\'s craft beer scene. Located on working farms, these breweries often grow their own hops, barley, or other ingredients. The result? Beer with a true sense of place, plus the chance to enjoy a beautiful rural setting while you sip.',
    characteristics: [
      'Located on agricultural land',
      'Locally grown ingredients',
      'Beautiful rural settings',
      'Farm-to-glass experience',
    ],
    icon: Leaf,
  },
};

const TYPES = ['microbrewery', 'brewpub', 'taproom', 'production', 'nano', 'farm-brewery'] as const;

export const revalidate = 3600;

export default async function TypesIndexPage() {
  const processed = await getProcessedBreweryData();

  // Calculate counts for each type
  const items = TYPES.map((type) => {
    const breweries = processed.breweries.filter((b) => {
      if (Array.isArray(b.type)) {
        return b.type.some(t => t.toLowerCase() === type);
      }
      return b.type?.toLowerCase() === type;
    });
    
    return {
      name: deslugify(type),
      slug: type,
      count: breweries.length,
      url: `/type/${type}`,
      definition: BREWERY_TYPE_DEFINITIONS[type],
    };
  }).filter(item => item.count > 0).sort((a, b) => b.count - a.count);

  // Stats
  const totalBreweries = processed.breweries.length;
  const totalTypes = items.length;
  const mostCommon = items[0];

  // Check for hero image
  const typesHeroImagePath = '/cities-hero.jpg';
  const typesHeroImageFile = join(process.cwd(), 'public', 'cities-hero.jpg');
  const hasTypesHeroImage = existsSync(typesHeroImageFile);

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Hero Section */}
      <section className="bg-white border-b-4 border-[#9B2335] relative overflow-hidden">
        {/* Hero Image Background */}
        {hasTypesHeroImage && (
          <div className="absolute inset-0">
            <Image
              src={typesHeroImagePath}
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
        {!hasTypesHeroImage && (
          <div className="absolute inset-0 md-pattern-bg pointer-events-none" />
        )}
        
        <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
          {/* Breadcrumbs */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className={`flex items-center flex-wrap gap-2 text-sm ${hasTypesHeroImage ? 'text-white/90' : ''}`} style={{ fontFamily: "'Source Sans 3', sans-serif", color: hasTypesHeroImage ? undefined : '#6B6B6B' }}>
              <li>
                <Link 
                  href="/" 
                  className={`transition-colors ${hasTypesHeroImage ? 'hover:text-white drop-shadow-md' : 'hover:text-[#9B2335]'}`}
                >
                  Maryland Breweries
                </Link>
              </li>
              <li><ChevronRight className={`h-4 w-4 mx-2 ${hasTypesHeroImage ? 'text-white/70' : ''}`} /></li>
              <li>
                <Link 
                  href="/type" 
                  className={`font-medium transition-colors ${hasTypesHeroImage ? 'text-white drop-shadow-md hover:text-white' : 'text-[#1C1C1C] hover:text-[#9B2335]'}`}
                >
                  Brewery Types
                </Link>
              </li>
            </ol>
          </nav>

          {/* H1 Title */}
          <h1 
            className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${
              hasTypesHeroImage 
                ? 'text-white drop-shadow-lg' 
                : 'text-[#1C1C1C]'
            }`}
            style={{ fontFamily: "'Playfair Display', Georgia, serif", textShadow: hasTypesHeroImage ? '2px 2px 4px rgba(0,0,0,0.5)' : undefined }}
          >
            Maryland Brewery Types
          </h1>

          {/* Intro Paragraph */}
          <p 
            className={`text-lg md:text-xl max-w-3xl leading-relaxed ${
              hasTypesHeroImage 
                ? 'text-white/95 drop-shadow-md' 
                : 'text-[#6B6B6B]'
            }`}
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            From intimate nano breweries to full-service brewpubs, Maryland's craft beer scene offers something for everyone. Explore {totalBreweries} breweries across {totalTypes} different types and find your perfect spot.
          </p>
        </div>
      </section>

      {/* Brewery Types with Definitions */}
      <section className="bg-white py-12 md:py-16 border-b border-[#E8E6E1]">
        <div className="container mx-auto px-4">
          <div className="mb-10">
            <div className="section-divider mb-4" />
            <h2 
              className="text-3xl md:text-4xl font-bold text-[#1C1C1C] mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Explore Breweries by Type
            </h2>
            <p 
              className="text-lg text-[#6B6B6B]"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              Each brewery type offers a unique experience. Whether you're looking for a casual hangout, a dinner destination, or a hidden gem, we've got you covered.
            </p>
          </div>

          {/* Brewery Type Cards */}
          <div className="flex flex-col gap-6 md:gap-8">
            {items.map((item) => {
              const typeDef = BREWERY_TYPE_DEFINITIONS[item.slug];
              const IconComponent = typeDef?.icon || Beer;
              
              return (
                <Link
                  key={item.slug}
                  href={item.url}
                  className="group bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg p-6 md:p-8 hover:border-[#9B2335] hover:shadow-lg transition-all duration-300"
                >
                  {/* Header with Icon and Count */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#9B2335]/10 flex items-center justify-center group-hover:bg-[#9B2335] transition-colors">
                        <IconComponent className="w-6 h-6 text-[#9B2335] group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <h3 
                          className="text-xl md:text-2xl font-bold text-[#1C1C1C] group-hover:text-[#9B2335] transition-colors"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                          {item.name}
                        </h3>
                        <span 
                          className="text-sm font-medium text-[#9B2335]"
                          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                        >
                          {item.count} {item.count === 1 ? 'brewery' : 'breweries'} in Maryland
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#9B2335] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Definition */}
                  {typeDef && (
                    <>
                      <p 
                        className="text-[#6B6B6B] mb-4 leading-relaxed"
                        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                      >
                        {typeDef.definition}
                      </p>

                      {/* Characteristics */}
                      <ul className="space-y-1.5">
                        {typeDef.characteristics.map((char, idx) => (
                          <li 
                            key={idx}
                            className="text-sm text-[#6B6B6B] flex items-center gap-2"
                            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A017] flex-shrink-0" />
                            {char}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  {/* CTA */}
                  <div className="mt-6 pt-4 border-t border-[#E8E6E1]">
                    <span 
                      className="text-[#9B2335] font-semibold group-hover:text-[#D4A017] transition-colors inline-flex items-center gap-2"
                      style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                    >
                      View All {item.name} Breweries
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
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
              Maryland Brewery Directory is your complete guide to craft breweries across Maryland. 
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
