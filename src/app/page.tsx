import HeroSection from '@/components/home/HeroSection';
import MapAndTableSection from '@/components/home/MapAndTableSection';
import Link from 'next/link';
import { getProcessedBreweryData } from '../../lib/brewery-data';
import { slugify } from '../lib/data-utils';

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
            </div>
            
            {/* Popular Features */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-yellow-200 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
              <ul className="space-y-2">
                <li><Link href="/breweries/dog-friendly" 
                         className="text-gray-600 hover:text-yellow-600 transition-colors">
                      Dog-Friendly
                    </Link></li>
                <li><Link href="/breweries/tours" 
                         className="text-gray-600 hover:text-yellow-600 transition-colors">
                      Tours
                    </Link></li>
                <li><Link href="/breweries/food" 
                         className="text-gray-600 hover:text-yellow-600 transition-colors">
                      Food
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
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
