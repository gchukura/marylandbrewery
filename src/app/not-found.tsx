import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for could not be found. Explore Maryland breweries, browse by city, or use the interactive map.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center px-4 py-12">
      {/* Large 404 */}
      <div className="text-center mb-8">
        <h1 
          className="text-8xl md:text-9xl font-bold text-[#9B2335] mb-4"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          404
        </h1>
        <h2 
          className="text-2xl md:text-3xl font-semibold text-[#1C1C1C] mb-4"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Page Not Found
        </h2>
        <p 
          className="text-lg text-[#6B6B6B] max-w-md mx-auto mb-8"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          Looks like this page wandered off to the taproom. Let's get you back on track to discover Maryland's best craft breweries.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-[#9B2335] text-white font-medium rounded-md hover:bg-[#7A1C2A] transition-colors"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          Back to Homepage
        </Link>
        <Link
          href="/map"
          className="inline-flex items-center justify-center px-6 py-3 border-2 border-[#9B2335] text-[#9B2335] font-medium rounded-md hover:bg-[#9B2335] hover:text-white transition-colors"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          Explore the Map
        </Link>
      </div>

      {/* Popular Links */}
      <div className="w-full max-w-2xl">
        <h3 
          className="text-lg font-semibold text-[#1C1C1C] text-center mb-6"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Popular Destinations
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/cities"
            className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="text-2xl mb-2 block">🏙️</span>
            <span className="text-sm font-medium text-[#1C1C1C]">Browse Cities</span>
          </Link>
          <Link
            href="/counties"
            className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="text-2xl mb-2 block">🗺️</span>
            <span className="text-sm font-medium text-[#1C1C1C]">Browse Counties</span>
          </Link>
          <Link
            href="/type"
            className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="text-2xl mb-2 block">🍺</span>
            <span className="text-sm font-medium text-[#1C1C1C]">Brewery Types</span>
          </Link>
          <Link
            href="/amenities"
            className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="text-2xl mb-2 block">✨</span>
            <span className="text-sm font-medium text-[#1C1C1C]">Amenities</span>
          </Link>
        </div>
      </div>

      {/* Search suggestion */}
      <p 
        className="mt-12 text-sm text-[#6B6B6B]"
        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
      >
        Looking for a specific brewery?{' '}
        <Link href="/map" className="text-[#9B2335] hover:underline">
          Try the interactive map
        </Link>
      </p>
    </div>
  );
}

