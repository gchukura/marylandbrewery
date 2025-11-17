import { Metadata } from 'next';
import HeroSection from '@/components/home/HeroSection';
import Link from 'next/link';
import { getProcessedBreweryData } from '../../lib/brewery-data';
import { slugify } from '../lib/data-utils';
import { MapPin, Beer, Utensils, Music, Dog, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Maryland Brewery Directory | Craft Breweries Across Maryland',
  description: 'Discover the best craft breweries across Maryland. Find breweries by city, county, type, and amenities. Interactive map, brewery hours, and complete guide to Maryland\'s craft beer scene.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Maryland Brewery Directory | Craft Breweries Across Maryland',
    description: 'Discover the best craft breweries across Maryland. Find breweries by city, county, type, and amenities. Interactive map and complete guide.',
    url: 'https://www.marylandbrewery.com',
    siteName: 'Maryland Brewery Directory',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Maryland Brewery Directory - Craft Breweries Across Maryland',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Maryland Brewery Directory | Craft Breweries Across Maryland',
    description: 'Discover the best craft breweries across Maryland. Find breweries by city, county, type, and amenities.',
    images: ['/og-image.jpg'],
  },
};

export default async function HomePage() {
  const processed = await getProcessedBreweryData();
  const totalBreweries = processed.breweries.length;
  const totalCounties = processed.counties.length;
  
  // Get top cities by brewery count
  const cityCounts = new Map<string, number>();
  processed.breweries.forEach(brewery => {
    if (brewery.city) {
      const city = brewery.city.toLowerCase().trim();
      cityCounts.set(city, (cityCounts.get(city) || 0) + 1);
    }
  });
  
  const topCities = Array.from(cityCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([city, count]) => ({ 
      name: city.charAt(0).toUpperCase() + city.slice(1), 
      count,
      slug: slugify(city)
    }));

  // Get total cities count
  const totalCities = cityCounts.size;

  return (
    <>
      {/* 1. Hero Section with CTA */}
      <HeroSection 
        totalBreweries={totalBreweries}
        totalCities={totalCities}
        totalCounties={totalCounties}
      />
      
      {/* 2. Introduction Section - SEO Content */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
              Your Complete Guide to Maryland Craft Breweries
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                Welcome to the most comprehensive directory of craft breweries in Maryland. Whether you're planning a brewery tour in Baltimore, exploring taprooms in Annapolis, or discovering hidden gems in Frederick, we've got you covered.
              </p>
              <p>
                Our directory features {totalBreweries}+ breweries across {totalCities} cities and all {totalCounties} Maryland counties. Find breweries by location, brewery type, amenities, and more. Each listing includes hours, contact information, amenities, and detailed descriptions to help you plan your perfect brewery visit.
              </p>
              <p>
                From microbreweries and brewpubs to taprooms and production facilities, discover the diverse craft beer scene that makes Maryland a destination for beer enthusiasts. Use our interactive map, browse by city or county, or search for specific features like dog-friendly patios, live music, food options, and brewery tours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Popular Destinations */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore Popular <span className="text-red-600">Destinations</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Start your brewery journey in Maryland's most popular cities
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {topCities.map(city => (
              <Link 
                key={city.name}
                href={`/city/${city.slug}/breweries`}
                className="bg-white rounded-lg p-6 border border-gray-200 hover:border-red-500 hover:shadow-lg transition-all text-center group"
              >
                <MapPin className="h-8 w-8 text-red-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="font-semibold text-gray-900 mb-1">{city.name}</div>
                <div className="text-sm text-gray-600">{city.count} breweries</div>
              </Link>
            ))}
          </div>
          
          <div className="text-center">
            <Link 
              href="/city"
              className="inline-flex items-center text-red-600 hover:text-red-700 font-semibold text-lg"
            >
              View All Cities
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Popular Features */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Find Breweries by <span className="text-red-600">Features</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover breweries with the amenities you're looking for
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link 
              href="/amenities/dog-friendly"
              className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200 hover:border-yellow-400 hover:shadow-lg transition-all group"
            >
              <Dog className="h-10 w-10 text-yellow-700 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 mb-2">Dog-Friendly</h3>
              <p className="text-sm text-gray-600">Bring your furry friend</p>
            </Link>
            
            <Link 
              href="/amenities/food"
              className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200 hover:border-orange-400 hover:shadow-lg transition-all group"
            >
              <Utensils className="h-10 w-10 text-orange-700 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 mb-2">Food Available</h3>
              <p className="text-sm text-gray-600">Full kitchen or food trucks</p>
            </Link>
            
            <Link 
              href="/amenities/live-music"
              className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all group"
            >
              <Music className="h-10 w-10 text-purple-700 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 mb-2">Live Music</h3>
              <p className="text-sm text-gray-600">Entertainment while you drink</p>
            </Link>
            
            <Link 
              href="/amenities/tours"
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all group"
            >
              <Beer className="h-10 w-10 text-blue-700 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 mb-2">Brewery Tours</h3>
              <p className="text-sm text-gray-600">See how beer is made</p>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Browse All Section - Comprehensive Links for SEO */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Browse <span className="text-red-600">All</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore breweries by location, type, and amenities
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Browse by City */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">Browse by City</h3>
              <p className="text-sm text-gray-600 mb-4">Find breweries in {totalCities}+ cities across Maryland</p>
              <Link href="/city" 
                    className="inline-flex items-center text-red-600 hover:text-red-700 font-medium">
                View All Cities
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Browse by County */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">Browse by County</h3>
              <p className="text-sm text-gray-600 mb-4">Explore breweries across all {totalCounties} Maryland counties</p>
              <Link href="/county" 
                    className="inline-flex items-center text-red-600 hover:text-red-700 font-medium">
                View All Counties
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Browse by Type */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">Browse by Type</h3>
              <p className="text-sm text-gray-600 mb-4">Microbreweries, brewpubs, taprooms, and more</p>
              <ul className="space-y-2 text-sm mb-4">
                <li><Link href="/type/microbrewery" className="text-gray-600 hover:text-red-600">Microbrewery</Link></li>
                <li><Link href="/type/brewpub" className="text-gray-600 hover:text-red-600">Brewpub</Link></li>
                <li><Link href="/type/taproom" className="text-gray-600 hover:text-red-600">Taproom</Link></li>
                <li><Link href="/type/production" className="text-gray-600 hover:text-red-600">Production</Link></li>
                <li><Link href="/type/nano" className="text-gray-600 hover:text-red-600">Nano</Link></li>
              </ul>
            </div>

            {/* Browse by Amenity */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">Browse by Amenity</h3>
              <p className="text-sm text-gray-600 mb-4">Find breweries with specific features</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/amenities/dog-friendly" className="text-gray-600 hover:text-red-600">Dog-Friendly</Link></li>
                <li><Link href="/amenities/outdoor-seating" className="text-gray-600 hover:text-red-600">Outdoor Seating</Link></li>
                <li><Link href="/amenities/live-music" className="text-gray-600 hover:text-red-600">Live Music</Link></li>
                <li><Link href="/amenities/food" className="text-gray-600 hover:text-red-600">Food</Link></li>
                <li><Link href="/amenities/tours" className="text-gray-600 hover:text-red-600">Tours</Link></li>
                <li><Link href="/amenities/parking" className="text-gray-600 hover:text-red-600">Parking</Link></li>
                <li><Link href="/amenities/wifi" className="text-gray-600 hover:text-red-600">WiFi</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Quick Resources */}
      <section className="bg-white py-12 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/map" className="text-gray-700 hover:text-red-600 font-medium">
              Interactive Map
            </Link>
            <Link href="/open-now" className="text-gray-700 hover:text-red-600 font-medium">
              Open Now
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-red-600 font-medium">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
