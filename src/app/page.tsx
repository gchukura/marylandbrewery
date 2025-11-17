import { Metadata } from 'next';
import HeroSection from '@/components/home/HeroSection';
import MapAndTableSection from '@/components/home/MapAndTableSection';
import Link from 'next/link';
import { getProcessedBreweryData } from '../../lib/brewery-data';
import { slugify } from '../lib/data-utils';

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

  return (
    <>
      {/* 1. Hero Title */}
      <HeroSection />
      
      {/* 2. Interactive Map and Table */}
      <MapAndTableSection breweries={processed.breweries} />
      
      {/* 3. Quick Links */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Quick <span className="text-red-600">Navigation</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Top Cities */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-red-200 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-4">Popular Cities</h3>
              <ul className="space-y-2">
                {topCities.map(city => (
                  <li key={city.name}>
                    <Link href={`/city/${city.slug}/breweries`} 
                          className="text-gray-600 hover:text-red-600 transition-colors">
                      {city.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link href="/city" 
                      className="text-sm text-red-600 hover:text-red-700 font-medium">
                  Browse All Cities →
                </Link>
              </div>
            </div>
            
            {/* Popular Features */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-yellow-200 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-4">Popular Features</h3>
              <ul className="space-y-2">
                <li><Link href="/amenities/dog-friendly" 
                         className="text-gray-600 hover:text-yellow-600 transition-colors">
                      Dog-Friendly
                    </Link></li>
                <li><Link href="/amenities/tours" 
                         className="text-gray-600 hover:text-yellow-600 transition-colors">
                      Tours
                    </Link></li>
                <li><Link href="/amenities/food" 
                         className="text-gray-600 hover:text-yellow-600 transition-colors">
                      Food
                    </Link></li>
                <li><Link href="/amenities/outdoor-seating" 
                         className="text-gray-600 hover:text-yellow-600 transition-colors">
                      Outdoor Seating
                    </Link></li>
                <li><Link href="/amenities/live-music" 
                         className="text-gray-600 hover:text-yellow-600 transition-colors">
                      Live Music
                    </Link></li>
              </ul>
            </div>
            
            {/* Resources */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-red-200 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="/open-now" 
                         className="text-gray-600 hover:text-red-600 transition-colors">
                      Open Now
                    </Link></li>
                <li><Link href="/map" 
                         className="text-gray-600 hover:text-red-600 transition-colors">
                      Map
                    </Link></li>
                <li><Link href="/county" 
                         className="text-gray-600 hover:text-red-600 transition-colors">
                      Counties
                    </Link></li>
                <li><Link href="/contact" 
                         className="text-gray-600 hover:text-red-600 transition-colors">
                      Contact
                    </Link></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Browse All Section - Comprehensive Links for SEO */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Browse <span className="text-red-600">All</span>
            </h2>
            <p className="text-gray-600">Explore all breweries, cities, counties, types, and amenities</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Browse by City */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Browse by City</h3>
              <p className="text-sm text-gray-600 mb-4">Find breweries in specific cities across Maryland</p>
              <Link href="/city" 
                    className="inline-block text-red-600 hover:text-red-700 font-medium">
                View All Cities →
              </Link>
            </div>

            {/* Browse by County */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Browse by County</h3>
              <p className="text-sm text-gray-600 mb-4">Explore breweries across all 24 Maryland counties</p>
              <Link href="/county" 
                    className="inline-block text-red-600 hover:text-red-700 font-medium">
                View All Counties →
              </Link>
            </div>

            {/* Browse by Type */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Browse by Type</h3>
              <ul className="space-y-2 text-sm mb-4">
                <li><Link href="/type/microbrewery" className="text-gray-600 hover:text-red-600">Microbrewery</Link></li>
                <li><Link href="/type/brewpub" className="text-gray-600 hover:text-red-600">Brewpub</Link></li>
                <li><Link href="/type/taproom" className="text-gray-600 hover:text-red-600">Taproom</Link></li>
                <li><Link href="/type/production" className="text-gray-600 hover:text-red-600">Production</Link></li>
                <li><Link href="/type/nano" className="text-gray-600 hover:text-red-600">Nano</Link></li>
              </ul>
            </div>

            {/* Browse by Amenity */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Browse by Amenity</h3>
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
    </>
  );
}
