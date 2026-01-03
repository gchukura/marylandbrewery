import { Metadata } from 'next';
import { getAllCities, getProcessedBreweryData, getBreweriesByCity } from '../../../../../lib/brewery-data';
import { slugify, deslugify, isOpenNow } from '@/lib/data-utils';
import { generateCityTitle, generateCityDescription } from '@/lib/seo-utils';
import { getNeighborhoodsByCity } from '../../../../../lib/supabase-client';
import Link from 'next/link';
import { ChevronRight, MapPin, Star, Phone, Globe } from 'lucide-react';
import Image from 'next/image';
import '@/components/home-v2/styles.css';
import CityBreweriesMapSection from '@/components/directory/CityBreweriesMapSection';

// Build all city pages (no limit)
export async function generateStaticParams() {
  const cities = await getAllCities();
  return cities.map((city) => ({ city: slugify(city) }));
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  const cityName = deslugify(city);
  const breweries = await getBreweriesByCity(cityName);
  const total = breweries.length;

  let title: string;
  let description: string;
  
  if (cityName.toLowerCase() === 'frederick') {
    title = `Breweries in Frederick Maryland | ${total} Local Craft Breweries`;
    description = `Explore ${total} breweries in Frederick, Maryland. Find the best craft beer spots in downtown Frederick and the surrounding area. Plan your Frederick brewery tour today!`;
  } else if (cityName.toLowerCase() === 'ocean city') {
    title = `Breweries in Ocean City Maryland | Beach Town Craft Beer Guide`;
    description = `Discover breweries in Ocean City, Maryland and nearby beach towns. Perfect for your next vacation or weekend getaway. Find ${total} craft breweries in the Ocean City area.`;
  } else {
    title = generateCityTitle(cityName, total);
    description = generateCityDescription(cityName, total, '');
  }

  return {
    title,
    description,
    alternates: { canonical: `/cities/${city}/breweries` },
    openGraph: {
      title,
      description,
      url: `https://www.marylandbrewery.com/cities/${city}/breweries`,
      siteName: 'Maryland Brewery Directory',
      type: 'website',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: `${cityName} Breweries`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.jpg'],
    },
  };
}

export default async function CityBreweriesPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const cityName = deslugify(city);
  
  // Use the helper function which handles Map serialization properly
  let breweries = await getBreweriesByCity(cityName);
  
  // Fallback: if no breweries found, try with processed data directly
  if (breweries.length === 0) {
    const processed = await getProcessedBreweryData();
    const cityKey = cityName.toLowerCase().trim();
    breweries = (processed.byCity instanceof Map 
      ? processed.byCity.get(cityKey)
      : (processed.byCity as any)?.[cityKey]) || [];
  }

  // Sort breweries by rating (highest first), then by name
  const sortedBreweries = [...breweries].sort((a: any, b: any) => {
    const aRating = a.googleRating || a.yelpRating || 0;
    const bRating = b.googleRating || b.yelpRating || 0;
    if (bRating !== aRating) return bRating - aRating;
    return (a.name || '').localeCompare(b.name || '');
  });

  // Featured breweries (top 6 by rating)
  const featuredBreweries = sortedBreweries.slice(0, 6);

  // Get a representative city hero image from the top-rated brewery
  const cityHeroImage = sortedBreweries.length > 0 
    ? (sortedBreweries[0].photos && sortedBreweries[0].photos.length > 0
        ? sortedBreweries[0].photos[0]
        : sortedBreweries[0].photoUrl)
    : null;

  // Get neighborhoods for this city from Supabase
  const dbNeighborhoods = await getNeighborhoodsByCity(cityName);
  const neighborhoods = dbNeighborhoods.map(n => n.name);
  
  // Fallback to hardcoded neighborhoods if database is empty
  const cityNeighborhoods: Record<string, string[]> = {
    baltimore: [
      'Fells Point', 'Canton', 'Federal Hill', 'Mount Vernon', 'Hampden',
      'Charles Village', 'Patterson Park', 'Druid Hill Park', 'Little Italy',
      'Bolton Hill', 'Riverside', 'Locust Point', 'Highlandtown'
    ],
    annapolis: [
      'Historic Downtown', 'Eastport', 'West Street', 'Parole', 'Cape St. Claire',
      'Arnold', 'Severna Park', 'Crownsville'
    ],
    frederick: [
      'Historic Downtown', 'Carroll Creek', 'Baker Park', 'West Frederick',
      'North Market', 'South Market'
    ],
  };
  
  const finalNeighborhoods = neighborhoods.length > 0 
    ? neighborhoods 
    : (cityNeighborhoods[cityName.toLowerCase()] || []);

  // Calculate stats
  const totalBreweries = breweries.length;
  const openNow = breweries.filter((b) => isOpenNow(b)).length;

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Hero Section */}
      <section className="bg-white border-b-4 border-[#9B2335] relative overflow-hidden">
        {/* City Hero Image Background */}
        {cityHeroImage && (
          <div className="absolute inset-0">
            {cityHeroImage.startsWith('http') ? (
              <img 
                src={cityHeroImage} 
                alt={`${cityName} breweries`}
                className="w-full h-full object-cover opacity-20"
              />
            ) : (
              <Image
                src={cityHeroImage}
                alt={`${cityName} breweries`}
                fill
                className="object-cover opacity-20"
                sizes="100vw"
                priority
              />
            )}
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />
          </div>
        )}
        
        {/* Pattern overlay (only if no hero image) */}
        {!cityHeroImage && (
          <div className="absolute inset-0 md-pattern-bg pointer-events-none" />
        )}
        
        <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
          {/* Breadcrumbs */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center flex-wrap gap-2 text-sm" style={{ fontFamily: "'Source Sans 3', sans-serif", color: '#6B6B6B' }}>
              <li>
                <Link href="/" className="hover:text-[#9B2335] transition-colors">
                  Maryland Breweries
                </Link>
              </li>
              <li><ChevronRight className="h-4 w-4 mx-2" /></li>
              <li>
                <Link href="/cities" className="hover:text-[#9B2335] transition-colors">
                  Cities
                </Link>
              </li>
              <li><ChevronRight className="h-4 w-4 mx-2" /></li>
              <li className="text-[#1C1C1C] font-medium">
                {cityName}, MD
              </li>
            </ol>
          </nav>

          {/* H1 Title */}
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1C1C1C] mb-4 leading-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Breweries in {cityName}, MD
          </h1>

          {/* Count Display */}
          <p 
            className="text-lg md:text-xl text-[#6B6B6B] mb-6"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            <strong className="text-[#1C1C1C]">{totalBreweries}</strong> {totalBreweries === 1 ? 'brewery' : 'breweries'} found.
          </p>
        </div>
      </section>

      {/* Sort Options */}
      <section className="bg-white border-b border-[#E8E6E1] py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            <span className="text-[#6B6B6B] font-medium">Sort</span>
            <div className="flex gap-4">
              <button className="text-[#1C1C1C] hover:text-[#9B2335] transition-colors font-medium">
                Sort by Rating
              </button>
              <button className="text-[#6B6B6B] hover:text-[#9B2335] transition-colors">
                Sort by Distance
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Neighborhoods Section */}
      {neighborhoods.length > 0 && (
        <section className="bg-white py-8 md:py-12 border-b border-[#E8E6E1]">
          <div className="container mx-auto px-4">
            <h2 
              className="text-2xl md:text-3xl font-bold text-[#1C1C1C] mb-6"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Neighborhoods in {cityName}, MD
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {finalNeighborhoods.map((neighborhood) => (
                <Link
                  key={neighborhood}
                  href={`/cities/${city}/${slugify(neighborhood)}`}
                  className="text-[#1C1C1C] hover:text-[#9B2335] transition-colors text-sm py-2"
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                >
                  {neighborhood}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="bg-white py-8 md:py-12 border-b border-[#E8E6E1]">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 
            className="text-2xl md:text-3xl font-bold text-[#1C1C1C] mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            About Maryland Brewery Directory
          </h2>
          <div 
            className="prose prose-lg text-[#6B6B6B]"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            <p>
              <strong className="text-[#1C1C1C]">Looking for a trusted local brewery?</strong> Since 2024, Maryland Brewery Directory has helped beer enthusiasts find craft breweries across the Old Line State.
            </p>
            <p className="mt-4">
              Brewery enthusiasts are looking for great craft beer experiences. <Link href="/contact" className="text-[#9B2335] hover:text-[#D4A017] transition-colors underline">List your brewery</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Featured Breweries */}
      {featuredBreweries.length > 0 && (
        <section className="bg-white py-12 md:py-16 border-b border-[#E8E6E1]">
          <div className="container mx-auto px-4">
            <h2 
              className="text-2xl md:text-3xl font-bold text-[#1C1C1C] mb-8"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Featured Breweries
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredBreweries.map((brewery: any, index: number) => {
                const rating = brewery.googleRating || brewery.yelpRating || 0;
                const ratingCount = brewery.googleRatingCount || brewery.yelpRatingCount || 0;
                const letter = String.fromCharCode(65 + index); // A, B, C, D, E, F

                return (
                  <div key={brewery.id} className="border border-[#E8E6E1] rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4 mb-4">
                      <span className="text-2xl font-bold text-[#9B2335]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        {letter}
                      </span>
                      <div className="flex-1">
                        <Link 
                          href={`/breweries/${brewery.slug || brewery.id}`}
                          className="text-xl font-bold text-[#1C1C1C] hover:text-[#9B2335] transition-colors block mb-2"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                          {brewery.name}
                        </Link>
                        <p className="text-sm text-[#6B6B6B] mb-2" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                          {brewery.street && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {brewery.street}
                            </span>
                          )}
                          {brewery.city && brewery.state && (
                            <span className="block mt-1">
                              {brewery.city}, {brewery.state} {brewery.zip}
                            </span>
                          )}
                        </p>
                        {rating > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 fill-[#D4A017] text-[#D4A017]" />
                              <span className="ml-1 text-sm font-medium text-[#1C1C1C]">{rating.toFixed(1)}</span>
                            </div>
                            {ratingCount > 0 && (
                              <span className="text-sm text-[#6B6B6B]">
                                {ratingCount} {ratingCount === 1 ? 'Review' : 'Reviews'}
                              </span>
                            )}
                          </div>
                        )}
                        {brewery.phone && (
                          <a 
                            href={`tel:${brewery.phone}`}
                            className="flex items-center gap-2 text-sm text-[#9B2335] hover:text-[#D4A017] transition-colors mt-2"
                          >
                            <Phone className="h-4 w-4" />
                            {brewery.phone}
                          </a>
                        )}
                        {brewery.website && (
                          <a 
                            href={brewery.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-[#9B2335] hover:text-[#D4A017] transition-colors mt-1"
                          >
                            <Globe className="h-4 w-4" />
                            Visit Website
                          </a>
                        )}
                      </div>
                    </div>
                    {brewery.description && (
                      <p 
                        className="text-sm text-[#6B6B6B] line-clamp-2"
                        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                      >
                        {brewery.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* All Breweries */}
      <section className="bg-white py-12 md:py-16 border-b border-[#E8E6E1]">
        <div className="container mx-auto px-4">
          <h2 
            className="text-2xl md:text-3xl font-bold text-[#1C1C1C] mb-8"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            All Breweries
          </h2>
          <div className="space-y-6">
            {sortedBreweries.map((brewery: any) => {
              const rating = brewery.googleRating || brewery.yelpRating || 0;
              const ratingCount = brewery.googleRatingCount || brewery.yelpRatingCount || 0;

              return (
                <div key={brewery.id} className="border-b border-[#E8E6E1] pb-6 last:border-b-0">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex-1">
                      <Link 
                        href={`/breweries/${brewery.slug || brewery.id}`}
                        className="text-xl font-bold text-[#1C1C1C] hover:text-[#9B2335] transition-colors block mb-2"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        {brewery.name}
                      </Link>
                      <p className="text-sm text-[#6B6B6B] mb-2" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                        {brewery.street && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {brewery.street}
                          </span>
                        )}
                        {brewery.city && brewery.state && (
                          <span className="block mt-1">
                            {brewery.city}, {brewery.state} {brewery.zip}
                          </span>
                        )}
                      </p>
                      {rating > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-[#D4A017] text-[#D4A017]" />
                            <span className="ml-1 text-sm font-medium text-[#1C1C1C]">{rating.toFixed(1)}</span>
                          </div>
                          {ratingCount > 0 && (
                            <span className="text-sm text-[#6B6B6B]">
                              {ratingCount} {ratingCount === 1 ? 'Review' : 'Reviews'}
                            </span>
                          )}
                        </div>
                      )}
                      {brewery.phone && (
                        <a 
                          href={`tel:${brewery.phone}`}
                          className="flex items-center gap-2 text-sm text-[#9B2335] hover:text-[#D4A017] transition-colors mt-2"
                        >
                          <Phone className="h-4 w-4" />
                          {brewery.phone}
                        </a>
                      )}
                    </div>
                    {brewery.description && (
                      <p 
                        className="text-sm text-[#6B6B6B] md:max-w-md"
                        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                      >
                        {brewery.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Map */}
      {breweries.length > 0 && (
        <section className="bg-white py-12 md:py-16 border-b border-[#E8E6E1]">
          <div className="container mx-auto px-4">
            <h2 
              className="text-2xl md:text-3xl font-bold text-[#1C1C1C] mb-6"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Interactive Map
            </h2>
            <CityBreweriesMapSection breweries={breweries as any} zoom={11} />
          </div>
        </section>
      )}
    </div>
  );
}
