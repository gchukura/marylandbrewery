/**
 * Test page for BreweryPageTemplate - Simplified
 * This demonstrates how to use the template for individual brewery pages
 */

export default function TestBreweryPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Test Brewery Page</h1>
        <p className="text-lg text-gray-600 mb-8">
          This page is temporarily simplified to resolve build issues. The template components are working but need to be optimized for static generation.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">Build Status</h2>
          <p className="text-yellow-700">
            The template components are functional but need to be converted to server components for optimal static generation.
          </p>
        </div>
      </div>
    </div>
  );
}