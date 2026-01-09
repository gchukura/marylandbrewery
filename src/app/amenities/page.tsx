import { Metadata } from 'next';
import { getProcessedBreweryData } from '../../../lib/brewery-data';
import { slugify } from '@/lib/data-utils';
import Link from 'next/link';
import { ChevronRight, Dog, Music, Utensils, TreePine, Gamepad2, Wifi, Car, Calendar, MapPin, Wine, ShoppingBag, Beer, Tv, Flame, Users, Heart, LucideIcon } from 'lucide-react';
import Image from 'next/image';
import { existsSync } from 'fs';
import { join } from 'path';
import '@/components/home-v2/styles.css';

export const metadata: Metadata = {
  title: 'Brewery Amenities & Features - Maryland Brewery Directory',
  description: 'Browse Maryland breweries by amenities and features. Find dog-friendly breweries, outdoor seating, live music, food options, tours, and more across the state.',
  alternates: {
    canonical: '/amenities',
  },
  openGraph: {
    title: 'Brewery Amenities & Features - Maryland Brewery Directory',
    description: 'Browse Maryland breweries by amenities and features. Find dog-friendly breweries, outdoor seating, live music, and more.',
    url: 'https://www.marylandbrewery.com/amenities',
    siteName: 'Maryland Brewery Directory',
    type: 'website',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Maryland Brewery Directory - Amenities',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Brewery Amenities & Features - Maryland Brewery Directory',
    description: 'Browse Maryland breweries by amenities and features.',
    images: ['/opengraph-image'],
  },
};

// Amenity definitions with descriptions - keyed by lowercase amenity name
const AMENITY_DEFINITIONS: Record<string, {
  definition: string;
  characteristics: string[];
  icon: LucideIcon;
}> = {
  'food': {
    definition: 'More than just bar snacks—these breweries have food options. Expect everything from appetizers to full meals, often designed to complement the house beers.',
    characteristics: [
      'Food menu available',
      'Beer-pairing options',
      'From snacks to entrées',
      'Great for dinner dates',
    ],
    icon: Utensils,
  },
  'outdoor seating': {
    definition: 'Enjoy your craft beer under the open sky. Breweries with outdoor seating offer patios, decks, beer gardens, or lawn areas—perfect for soaking up Maryland\'s beautiful weather.',
    characteristics: [
      'Patios and decks',
      'Beer garden vibes',
      'Seasonal availability',
      'Fresh air and good brews',
    ],
    icon: TreePine,
  },
  'live music': {
    definition: 'Good beer and good tunes go hand in hand. These breweries feature live performances from local musicians, bands, and artists—turning your brewery visit into a full entertainment experience.',
    characteristics: [
      'Local bands and artists',
      'Weekend performances',
      'Acoustic to full bands',
      'Check schedules ahead',
    ],
    icon: Music,
  },
  'games': {
    definition: 'Add some friendly competition to your brewery visit. From cornhole and shuffleboard to board games and arcade cabinets, these breweries keep you entertained between sips.',
    characteristics: [
      'Cornhole and lawn games',
      'Board games available',
      'Arcade cabinets',
      'Fun for groups',
    ],
    icon: Gamepad2,
  },
  'parking': {
    definition: 'Skip the parking hassle. These breweries offer dedicated parking lots or ample street parking, making it easy to visit without the stress of finding a spot.',
    characteristics: [
      'Dedicated parking lots',
      'Easy access',
      'No parking stress',
      'Convenient visits',
    ],
    icon: Car,
  },
  'pet friendly': {
    definition: 'Bring your four-legged friend along for the adventure. Pet-friendly breweries welcome well-behaved animals, often offering water bowls, treats, and plenty of pats from fellow beer lovers.',
    characteristics: [
      'Pets welcome on patios',
      'Water bowls provided',
      'Leashed pets required',
      'Great for weekend outings',
    ],
    icon: Dog,
  },
  'wheelchair accessible': {
    definition: 'These breweries ensure everyone can enjoy great craft beer. With accessible entrances, restrooms, and seating, they welcome guests of all abilities.',
    characteristics: [
      'Accessible entrances',
      'ADA-compliant restrooms',
      'Accessible seating',
      'Welcoming to all',
    ],
    icon: Users,
  },
  'private events': {
    definition: 'Celebrate at a brewery! These spots offer private event spaces for birthdays, corporate gatherings, weddings, and more—with craft beer flowing all night.',
    characteristics: [
      'Private event spaces',
      'Birthday parties',
      'Corporate events',
      'Custom packages',
    ],
    icon: Calendar,
  },
  'growler fills': {
    definition: 'Take fresh draft beer home with you. Breweries offering growler fills let you bring your own jug or buy one on-site—keeping the party going at home.',
    characteristics: [
      'Fresh draft to-go',
      'Bring your own or buy',
      '32oz and 64oz options',
      'Refillable and reusable',
    ],
    icon: Beer,
  },
  'crowler machine': {
    definition: 'The best of both worlds—draft freshness in a convenient can. Crowlers are 32oz cans filled and sealed on-site, perfect for taking fresh beer wherever you go.',
    characteristics: [
      'Canned fresh on-site',
      '32oz sealed cans',
      'Stays fresh longer',
      'Convenient to-go option',
    ],
    icon: Beer,
  },
  'merchandise': {
    definition: 'Take home more than memories. These breweries sell branded merchandise—t-shirts, hats, glassware, and more—so you can rep your favorite spot.',
    characteristics: [
      'Branded apparel',
      'Glassware and gear',
      'Support local breweries',
      'Great gifts',
    ],
    icon: ShoppingBag,
  },
  'tours': {
    definition: 'Go behind the scenes and see how the magic happens. Brewery tours take you through the brewing process, from grain to glass, often ending with tastings.',
    characteristics: [
      'Behind-the-scenes access',
      'Learn the brewing process',
      'Often includes tastings',
      'Great for beer enthusiasts',
    ],
    icon: MapPin,
  },
  'tastings': {
    definition: 'Sample before you commit. Breweries offering tastings let you try flights of different beers, perfect for discovering new favorites or exploring the full lineup.',
    characteristics: [
      'Flight options',
      'Sample multiple beers',
      'Discover new favorites',
      'Great for exploring',
    ],
    icon: Wine,
  },
  'food trucks': {
    definition: 'The best of local food culture meets craft beer. Breweries with food trucks bring in rotating vendors serving everything from tacos to BBQ—so you can pair your pint with something delicious.',
    characteristics: [
      'Rotating vendors',
      'Diverse cuisine options',
      'Check social media for schedules',
      'Perfect pairing possibilities',
    ],
    icon: Utensils,
  },
  'wifi': {
    definition: 'Need to catch up on work or share your brewery adventures? These breweries offer free WiFi so you can stay connected while enjoying your craft beer.',
    characteristics: [
      'Free WiFi access',
      'Work-friendly spaces',
      'Stay connected',
      'Share your experience',
    ],
    icon: Wifi,
  },
  'tvs': {
    definition: 'Catch the game while enjoying a cold one. These breweries have TVs for sports, events, and entertainment—perfect for game days.',
    characteristics: [
      'Sports on screens',
      'Great for game days',
      'Multiple viewing areas',
      'Community atmosphere',
    ],
    icon: Tv,
  },
  'pool table': {
    definition: 'Challenge your friends to a game of pool while sipping on local brews. These breweries have pool tables for some classic bar entertainment.',
    characteristics: [
      'Classic bar game',
      'Great for groups',
      'Friendly competition',
      'Relaxed atmosphere',
    ],
    icon: Gamepad2,
  },
  'cornhole': {
    definition: 'The quintessential outdoor bar game. These breweries have cornhole boards for laid-back fun in the sun with your favorite craft beer.',
    characteristics: [
      'Outdoor lawn game',
      'Perfect for groups',
      'Casual competition',
      'Great weather activity',
    ],
    icon: Gamepad2,
  },
  'fire pit': {
    definition: 'Cozy up by the fire with a great beer. Fire pits add warmth and ambiance, making these breweries perfect for cooler evenings.',
    characteristics: [
      'Warm ambiance',
      'Perfect for cooler nights',
      'Gathering spot',
      'Unique atmosphere',
    ],
    icon: Flame,
  },
  'family friendly': {
    definition: 'The whole family is welcome here. Family-friendly breweries offer a welcoming environment for kids, often with games, kid-friendly menu options, and plenty of space.',
    characteristics: [
      'Kids welcome',
      'Family-oriented space',
      'Games for children',
      'Inclusive atmosphere',
    ],
    icon: Users,
  },
  'date night': {
    definition: 'Looking for the perfect spot for two? These breweries offer a romantic or intimate atmosphere ideal for date nights.',
    characteristics: [
      'Intimate atmosphere',
      'Great for couples',
      'Romantic vibes',
      'Quality experience',
    ],
    icon: Heart,
  },
  'group friendly': {
    definition: 'Bring the whole crew! These breweries have space and amenities to accommodate larger groups comfortably.',
    characteristics: [
      'Large group seating',
      'Great for celebrations',
      'Accommodates parties',
      'Social atmosphere',
    ],
    icon: Users,
  },
};

export const revalidate = 3600;

export default async function AmenitiesIndexPage() {
  const processed = await getProcessedBreweryData();

  // Get actual amenities from database and calculate counts
  const amenityCounts = new Map<string, number>();
  processed.breweries.forEach((brewery: any) => {
    const amenities = (brewery.amenities || brewery.features || []) as string[];
    amenities.forEach((amenity: string) => {
      const key = amenity.toLowerCase().trim();
      amenityCounts.set(key, (amenityCounts.get(key) || 0) + 1);
    });
  });

  // Convert to array and sort by count
  const items = Array.from(amenityCounts.entries())
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([amenityKey, count]) => {
      // Find the original casing from a brewery
      let displayName = amenityKey;
      for (const brewery of processed.breweries) {
        const amenities = ((brewery as any).amenities || (brewery as any).features || []) as string[];
        const match = amenities.find((a: string) => a.toLowerCase().trim() === amenityKey);
        if (match) {
          displayName = match;
          break;
        }
      }
      
      return {
        name: displayName,
        slug: slugify(displayName),
        count,
        url: `/amenities/${slugify(displayName)}`,
        definition: AMENITY_DEFINITIONS[amenityKey],
      };
    });

  // Stats
  const totalBreweries = processed.breweries.length;
  const totalAmenities = items.length;

  // Check for hero image
  const amenitiesHeroImagePath = '/cities-hero.jpg';
  const amenitiesHeroImageFile = join(process.cwd(), 'public', 'cities-hero.jpg');
  const hasAmenitiesHeroImage = existsSync(amenitiesHeroImageFile);

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Hero Section */}
      <section className="bg-white border-b-4 border-[#9B2335] relative overflow-hidden">
        {/* Hero Image Background */}
        {hasAmenitiesHeroImage && (
          <div className="absolute inset-0">
            <Image
              src={amenitiesHeroImagePath}
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
        {!hasAmenitiesHeroImage && (
          <div className="absolute inset-0 md-pattern-bg pointer-events-none" />
        )}
        
        <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
          {/* Breadcrumbs */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className={`flex items-center flex-wrap gap-2 text-sm ${hasAmenitiesHeroImage ? 'text-white/90' : ''}`} style={{ fontFamily: "'Source Sans 3', sans-serif", color: hasAmenitiesHeroImage ? undefined : '#6B6B6B' }}>
              <li>
                <Link 
                  href="/" 
                  className={`transition-colors ${hasAmenitiesHeroImage ? 'hover:text-white drop-shadow-md' : 'hover:text-[#9B2335]'}`}
                >
                  Maryland Breweries
                </Link>
              </li>
              <li><ChevronRight className={`h-4 w-4 mx-2 ${hasAmenitiesHeroImage ? 'text-white/70' : ''}`} /></li>
              <li>
                <Link 
                  href="/amenities" 
                  className={`font-medium transition-colors ${hasAmenitiesHeroImage ? 'text-white drop-shadow-md hover:text-white' : 'text-[#1C1C1C] hover:text-[#9B2335]'}`}
                >
                  Amenities
                </Link>
              </li>
            </ol>
          </nav>

          {/* H1 Title */}
          <h1 
            className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${
              hasAmenitiesHeroImage 
                ? 'text-white drop-shadow-lg' 
                : 'text-[#1C1C1C]'
            }`}
            style={{ fontFamily: "'Playfair Display', Georgia, serif", textShadow: hasAmenitiesHeroImage ? '2px 2px 4px rgba(0,0,0,0.5)' : undefined }}
          >
            Brewery Amenities & Features
          </h1>

          {/* Intro Paragraph */}
          <p 
            className={`text-lg md:text-xl max-w-3xl leading-relaxed ${
              hasAmenitiesHeroImage 
                ? 'text-white/95 drop-shadow-md' 
                : 'text-[#6B6B6B]'
            }`}
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            Find the perfect brewery for your next visit. Browse {totalBreweries} Maryland breweries by {totalAmenities} different amenities—from outdoor seating to live music venues.
          </p>
        </div>
      </section>

      {/* Amenities with Definitions */}
      <section className="bg-white py-12 md:py-16 border-b border-[#E8E6E1]">
        <div className="container mx-auto px-4">
          <div className="mb-10">
            <div className="section-divider mb-4" />
            <h2 
              className="text-3xl md:text-4xl font-bold text-[#1C1C1C] mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Explore Breweries by Amenity
            </h2>
            <p 
              className="text-lg text-[#6B6B6B]"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              Whether you're looking for a casual hangout with your dog, a dinner destination, or a place with games and live music—we've got you covered.
            </p>
          </div>

          {/* Amenity Cards */}
          <div className="flex flex-col gap-6 md:gap-8">
            {items.map((item) => {
              const amenityDef = item.definition;
              const IconComponent = amenityDef?.icon || Beer;
              
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
                  {amenityDef && (
                    <>
                      <p 
                        className="text-[#6B6B6B] mb-4 leading-relaxed"
                        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                      >
                        {amenityDef.definition}
                      </p>

                      {/* Characteristics */}
                      <ul className="space-y-1.5">
                        {amenityDef.characteristics.map((char, idx) => (
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
