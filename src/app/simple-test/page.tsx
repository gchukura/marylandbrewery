/**
 * Simple test page to verify server is working
 */

export default function SimpleTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Simple Test Page
          </h1>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Server Status: ✅ Working
            </h2>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                If you can see this page, the Next.js development server is running correctly.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  ✅ Server is Running
                </h3>
                <p className="text-green-700">
                  The development server is working. The 500 errors on other pages are due to template issues.
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  🔧 Next Steps
                </h3>
                <ul className="text-blue-700 list-disc list-inside space-y-1">
                  <li>Fix template runtime errors</li>
                  <li>Test template components</li>
                  <li>Verify all functionality</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
