"use client";

import { Brewery } from '@/types/brewery';
import dynamic from 'next/dynamic';
import PageHero from './PageHero';
import DirectoryStatsBar from './DirectoryStatsBar';
import ContentBlock from './ContentBlock';
import RelatedLinksGrid from './RelatedLinksGrid';
import BreweryTable from '@/components/home/BreweryTable';

// Dynamically import GoogleMap to avoid SSR issues
const GoogleMap = dynamic(() => import('@/components/maps/GoogleMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] bg-gray-200 rounded-lg flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
});

interface ContentBlock {
  title: string;
  content: string;
}

interface RelatedPage {
  title: string;
  url: string;
  count?: number;
  type?: string;
}

interface StatItem {
  label: string;
  value: string | number;
}

interface DirectoryPageTemplateProps {
  // Page content
  h1: string;
  introText: string;
  breadcrumbs: Array<{ name: string; url: string; isActive?: boolean }>;
  
  // Data
  breweries: Brewery[];
  stats: StatItem[];
  contentBlocks: ContentBlock[];
  relatedPages: RelatedPage[];
  
  // Configuration
  pageType: 'city' | 'county' | 'type' | 'amenity';
  showMap?: boolean;
  showStats?: boolean;
  showTable?: boolean;
  mapZoom?: number;
}

export default function DirectoryPageTemplate({
  h1,
  introText,
  breadcrumbs,
  breweries,
  stats,
  contentBlocks,
  relatedPages,
  pageType,
  showMap = true,
  showStats = true,
  showTable = true,
  mapZoom = 10,
}: DirectoryPageTemplateProps) {
  // Structured Data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: h1,
    description: introText,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: breweries.length,
      itemListElement: breweries.map((brewery, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Brewery',
          name: brewery.name,
          url: `/breweries/${(brewery as any).slug || brewery.id}`,
        },
      })),
    },
  };

  return (
    <>
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} 
      />

      <div className="min-h-screen bg-gray-50">
        {/* 1. Hero Section */}
        <PageHero h1={h1} introText={introText} breadcrumbs={breadcrumbs} />

        {/* 2. Stats Bar */}
        {showStats && stats.length > 0 && (
          <DirectoryStatsBar stats={stats} />
        )}

        {/* 3. Interactive Map */}
        {showMap && breweries.length > 0 && (
          <section className="bg-white py-8 md:py-12">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                Interactive Map
              </h2>
              <div className="h-[400px] md:h-[500px] rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                <GoogleMap 
                  breweries={breweries as any} 
                  height="100%" 
                  showClusters={true}
                  zoom={mapZoom}
                />
              </div>
            </div>
          </section>
        )}

        {/* 4. Directory Table */}
        {showTable && breweries.length > 0 && (
          <section className="bg-gray-50 py-8 md:py-12">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                All Breweries
              </h2>
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <BreweryTable breweries={breweries} />
              </div>
            </div>
          </section>
        )}

        {/* 5. Content Section (SEO-Rich) */}
        {contentBlocks.length > 0 && (
          <section className="bg-white py-12 md:py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto space-y-12">
                {contentBlocks.map((block, index) => (
                  <ContentBlock
                    key={index}
                    title={block.title}
                    content={block.content}
                    className={index < contentBlocks.length - 1 ? 'border-b border-gray-200 pb-12' : ''}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 6. Related Links */}
        {relatedPages.length > 0 && (
          <RelatedLinksGrid pages={relatedPages} />
        )}
      </div>
    </>
  );
}

