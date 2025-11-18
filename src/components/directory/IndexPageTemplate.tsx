"use client";

import Link from 'next/link';
import PageHero from './PageHero';
import DirectoryStatsBar from './DirectoryStatsBar';
import dynamic from 'next/dynamic';

// Dynamically import GoogleMap to avoid SSR issues
const DynamicGoogleMap = dynamic(() => import('@/components/maps/GoogleMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] bg-gray-200 rounded-lg flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
});

interface IndexItem {
  name: string;
  slug: string;
  count: number;
  url: string;
}

interface IndexPageTemplateProps {
  // Page content
  h1: string;
  introText: string;
  breadcrumbs: Array<{ name: string; url: string; isActive?: boolean }>;
  
  // Data
  items: IndexItem[];
  stats: Array<{ label: string; value: string | number }>;
  groupedItems?: Record<string, IndexItem[]>;
  allBreweries?: any[]; // For map display
  
  // Configuration
  pageType: 'city' | 'county' | 'amenity' | 'type';
  showMap?: boolean;
  showStats?: boolean;
  mapZoom?: number;
}

export default function IndexPageTemplate({
  h1,
  introText,
  breadcrumbs,
  items,
  stats,
  groupedItems,
  allBreweries,
  pageType,
  showMap = true,
  showStats = true,
  mapZoom = 9,
}: IndexPageTemplateProps) {
  // If no grouped items, create a simple list
  const displayGroups = groupedItems || { 'All': items };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 1. Hero Section */}
      <PageHero h1={h1} introText={introText} breadcrumbs={breadcrumbs} />

      {/* 2. Stats Bar */}
      {showStats && stats.length > 0 && (
        <DirectoryStatsBar stats={stats} />
      )}

      {/* 3. Interactive Map */}
      {showMap && allBreweries && allBreweries.length > 0 && (
        <section className="bg-white py-8 md:py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Interactive Map
            </h2>
            <div className="h-[400px] md:h-[500px] rounded-lg overflow-hidden border border-gray-200 shadow-sm">
              <DynamicGoogleMap 
                breweries={allBreweries as any} 
                height="100%" 
                showClusters={true}
                zoom={mapZoom}
              />
            </div>
          </div>
        </section>
      )}

      {/* 4. Directory Listing */}
      <section className="bg-gray-50 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="space-y-10">
            {Object.entries(displayGroups).map(([groupName, groupItems]) => (
              <div key={groupName}>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                  {groupName}
                </h2>
                {groupItems.length === 0 ? (
                  <p className="text-gray-500">No items in this category.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {groupItems.map((item) => (
                      <Link
                        key={item.slug}
                        href={item.url}
                        className="bg-white rounded-lg p-5 border border-gray-200 hover:border-red-500 hover:shadow-lg transition-all group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                            {item.name}
                          </h3>
                          <span className="text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
                            {item.count}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {item.count === 1 ? '1 brewery' : `${item.count} breweries`}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

