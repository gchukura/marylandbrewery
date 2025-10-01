/**
 * Ultra-simple test page without any complex components
 */

import Link from 'next/link';

export default function TestSimpleProgrammaticPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-red-600">Home</Link>
            <span>/</span>
            <a href="/breweries" className="hover:text-red-600">Breweries</a>
            <span>/</span>
            <span className="text-gray-900 font-medium">Baltimore</span>
          </nav>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Breweries in Baltimore</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Explore Baltimore's vibrant craft beer scene with our comprehensive directory of local breweries, brewpubs, and taprooms.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Baltimore Brewery Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">2</div>
                  <div className="text-sm text-gray-600">Breweries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">2</div>
                  <div className="text-sm text-gray-600">Counties</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">2</div>
                  <div className="text-sm text-gray-600">Types</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">5</div>
                  <div className="text-sm text-gray-600">Amenities</div>
                </div>
              </div>
            </div>

            {/* Breweries List */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Breweries (2)</h2>
              </div>
              <div className="p-6 space-y-4">
                {/* Test Brewery 1 */}
                <div className="border-l-4 border-l-red-600 p-4 bg-gray-50 rounded">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Test Brewery 1</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <span>📍</span>
                          Baltimore, MD
                        </div>
                        <div className="flex items-center gap-1">
                          <span>📞</span>
                          <a href="tel:410-555-0123" className="hover:text-red-600">410-555-0123</a>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>🌐</span>
                          <a href="https://testbrewery1.com" target="_blank" rel="noopener noreferrer" className="hover:text-red-600">Website</a>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        <span>🕒</span>
                        <span className="text-green-600">Open Now</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        A great test brewery in Baltimore with amazing craft beer and a welcoming atmosphere.
                      </p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">Food</span>
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">Outdoor Seating</span>
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">Live Music</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <a
                        href="/breweries/test-brewery-1"
                        className="inline-flex items-center justify-center rounded-md font-medium transition-colors h-8 px-3 text-sm bg-red-600 text-white hover:bg-red-700"
                      >
                        View Details
                      </a>
                    </div>
                  </div>
                </div>

                {/* Test Brewery 2 */}
                <div className="border-l-4 border-l-red-600 p-4 bg-gray-50 rounded">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Test Brewery 2</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <span>📍</span>
                          Annapolis, MD
                        </div>
                        <div className="flex items-center gap-1">
                          <span>📞</span>
                          <a href="tel:410-555-0456" className="hover:text-red-600">410-555-0456</a>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>🌐</span>
                          <a href="https://testbrewery2.com" target="_blank" rel="noopener noreferrer" className="hover:text-red-600">Website</a>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        <span>🕒</span>
                        <span className="text-red-600">Closed</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        Another great test brewery in Annapolis with excellent craft beer selection.
                      </p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">Food</span>
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">Outdoor Seating</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <a
                        href="/breweries/test-brewery-2"
                        className="inline-flex items-center justify-center rounded-md font-medium transition-colors h-8 px-3 text-sm bg-red-600 text-white hover:bg-red-700"
                      >
                        View Details
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Map Placeholder */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 Brewery Locations</h3>
              <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">🗺️</div>
                  <div className="text-gray-500">Interactive Map</div>
                  <div className="text-sm text-gray-400">Click to view locations</div>
                </div>
              </div>
            </div>

            {/* Related Pages */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Pages</h3>
              <div className="space-y-3">
                <a
                  href="/breweries/annapolis"
                  className="block p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">Breweries in Annapolis</div>
                  <div className="text-sm text-gray-600 mt-1">Discover breweries in Annapolis, MD</div>
                </a>
                <a
                  href="/breweries/microbrewery"
                  className="block p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">Microbreweries in Maryland</div>
                  <div className="text-sm text-gray-600 mt-1">Explore microbreweries across Maryland</div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
