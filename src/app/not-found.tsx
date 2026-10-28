import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: false },
  description: 'The page you are looking for could not be found. Explore Maryland breweries, browse by city, or use the interactive map.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-4 py-12">
      {/* Large 404 */}
      <div className="text-center mb-8">
        <h1 
          className="font-display text-8xl md:text-9xl font-bold text-brand-red mb-4"
        >
          404
        </h1>
        <h2 
          className="font-display text-2xl md:text-3xl font-semibold text-ink mb-4"
        >
          Page Not Found
        </h2>
        <p 
          className="text-lg text-muted max-w-md mx-auto mb-8"
        >
          Looks like this page wandered off to the taproom. Let's get you back on track to discover Maryland's best craft breweries.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-brand-red text-white font-medium rounded-md hover:bg-brand-red-dark transition-colors"
        >
          Back to Homepage
        </Link>
        <Link
          href="/map"
          className="inline-flex items-center justify-center px-6 py-3 border-2 border-brand-red text-brand-red font-medium rounded-md hover:bg-brand-red hover:text-white transition-colors"
        >
          Explore the Map
        </Link>
      </div>

      {/* Popular Links */}
      <div className="w-full max-w-2xl">
        <h3 
          className="font-display text-lg font-semibold text-ink text-center mb-6"
        >
          Popular Destinations
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/cities"
            className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="text-2xl mb-2 block">🏙️</span>
            <span className="text-sm font-medium text-ink">Browse Cities</span>
          </Link>
          <Link
            href="/counties"
            className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="text-2xl mb-2 block">🗺️</span>
            <span className="text-sm font-medium text-ink">Browse Counties</span>
          </Link>
          <Link
            href="/type"
            className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="text-2xl mb-2 block">🍺</span>
            <span className="text-sm font-medium text-ink">Brewery Types</span>
          </Link>
          <Link
            href="/amenities"
            className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="text-2xl mb-2 block">✨</span>
            <span className="text-sm font-medium text-ink">Amenities</span>
          </Link>
        </div>
      </div>

      {/* Search suggestion */}
      <p 
        className="mt-12 text-sm text-muted"
      >
        Looking for a specific brewery?{' '}
        <Link href="/map" className="text-brand-red hover:underline">
          Try the interactive map
        </Link>
      </p>
    </div>
  );
}

