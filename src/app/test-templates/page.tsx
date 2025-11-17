/**
 * Test Templates Index Page
 * Links to all template test pages
 */

import Link from 'next/link';

export default function TestTemplatesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Template Testing Dashboard
          </h1>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Test Your Page Templates
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Programmatic Template Test */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  ProgrammaticPageTemplate
                </h3>
                <p className="text-gray-600 mb-4">
                  Test the template used for listing pages (city, county, type, amenity pages)
                </p>
                <div className="space-y-2 mb-4">
                  <div className="text-sm text-gray-500">
                    <strong>Features:</strong>
                  </div>
                  <ul className="text-sm text-gray-600 list-disc list-inside">
                    <li>Brewery grid/list view</li>
                    <li>Interactive Google Maps</li>
                    <li>Sorting and filtering</li>
                    <li>Statistics bar</li>
                    <li>Related pages</li>
                    <li>SEO optimization</li>
                  </ul>
                </div>
                <Link
                  href="/test-programmatic"
                  className="inline-block bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Test Programmatic Template
                </Link>
              </div>

              {/* Brewery Template Test */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  BreweryPageTemplate
                </h3>
                <p className="text-gray-600 mb-4">
                  Test the template used for individual brewery pages
                </p>
                <div className="space-y-2 mb-4">
                  <div className="text-sm text-gray-500">
                    <strong>Features:</strong>
                  </div>
                  <ul className="text-sm text-gray-600 list-disc list-inside">
                    <li>Complete brewery information</li>
                    <li>Tabbed interface (Overview, Hours, Amenities)</li>
                    <li>Dynamic open/closed status</li>
                    <li>Embedded map</li>
                    <li>Nearby breweries</li>
                    <li>Social media links</li>
                  </ul>
                </div>
                <Link
                  href="/test-brewery"
                  className="inline-block bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Test Brewery Template
                </Link>
              </div>
            </div>

            {/* Testing Instructions */}
            <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                🧪 Testing Instructions
              </h3>
              <div className="text-sm text-yellow-700 space-y-2">
                <p><strong>1. Visual Testing:</strong> Check that all components render correctly</p>
                <p><strong>2. Responsive Testing:</strong> Test on different screen sizes</p>
                <p><strong>3. Interactive Testing:</strong> Test buttons, links, and map interactions</p>
                <p><strong>4. SEO Testing:</strong> Check meta tags and structured data</p>
                <p><strong>5. Performance Testing:</strong> Check loading times and smooth interactions</p>
              </div>
            </div>

            {/* Development Notes */}
            <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                📝 Development Notes
              </h3>
              <div className="text-sm text-blue-700 space-y-2">
                <p><strong>Google Maps Integration:</strong> Requires NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable</p>
                <p><strong>Styling:</strong> Uses Maryland flag colors (red, yellow, black)</p>
                <p><strong>TypeScript:</strong> Fully typed for better development experience</p>
                <p><strong>SEO:</strong> Optimized for search engines with structured data</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
