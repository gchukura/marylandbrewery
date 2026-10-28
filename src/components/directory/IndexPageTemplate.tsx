'use client';

import Link from 'next/link';
import PageHero from './PageHero';
import DirectoryStatsBar from './DirectoryStatsBar';
import { breadcrumbList } from '@/lib/seo/jsonld';
import JsonLd from '@/components/seo/JsonLd';
import BreweryMapLazy from '@/components/maps/BreweryMapLazy';
import { toListingBrewery } from '@/lib/listing';
import { isOpenAt } from '@/lib/hours';

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
  heroImage?: string | null;

  // Data
  items: IndexItem[];
  stats: Array<{ label: string; value: string | number }>;
  groupedItems?: Record<string, IndexItem[]>;
  allBreweries?: any[]; // For map display

  // Configuration
  pageType: 'city' | 'county' | 'amenity' | 'type' | 'region';
  showMap?: boolean;
  showStats?: boolean;
  mapZoom?: number;
}

export default function IndexPageTemplate({
  h1,
  introText,
  breadcrumbs,
  heroImage,
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
  const displayGroups = groupedItems || { All: items };

  return (
    <div className="min-h-screen bg-cream">
      <JsonLd
        data={breadcrumbList(
          breadcrumbs.map((crumb) => ({ name: crumb.name, path: crumb.url }))
        )}
      />
      {/* 1. Hero Section */}
      <PageHero
        h1={h1}
        introText={introText}
        breadcrumbs={breadcrumbs}
        heroImage={heroImage}
      />

      {/* 2. Stats Bar */}
      {showStats && stats.length > 0 && <DirectoryStatsBar stats={stats} />}

      {/* 3. Interactive Map */}
      {showMap && allBreweries && allBreweries.length > 0 && (
        <section className="bg-white py-8 md:py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-ink mb-6">
              Interactive Map
            </h2>
            <div className="h-[400px] md:h-[500px] rounded-lg overflow-hidden border border-line shadow-sm">
              <BreweryMapLazy
                points={allBreweries.map((b) => ({
                  brewery: toListingBrewery(b),
                  open: isOpenAt(b.hours).open,
                }))}
              />
            </div>
          </div>
        </section>
      )}

      {/* 4. Directory Listing */}
      <section className="bg-cream py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="space-y-10">
            {Object.entries(displayGroups).map(([groupName, groupItems]) => (
              <div key={groupName}>
                <h2 className="text-2xl md:text-3xl font-bold text-ink mb-6">
                  {groupName}
                </h2>
                {groupItems.length === 0 ? (
                  <p className="text-muted">No items in this category.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {groupItems.map((item) => (
                      <Link
                        key={item.slug}
                        href={item.url}
                        className="bg-white rounded-lg p-5 border border-line hover:border-brand-red hover:shadow-lg transition-all group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-ink group-hover:text-brand-red transition-colors">
                            {item.name}
                          </h3>
                          <span className="text-sm font-medium text-brand-red bg-cream px-2 py-1 rounded">
                            {item.count}
                          </span>
                        </div>
                        <p className="text-sm text-muted">
                          {item.count === 1
                            ? '1 brewery'
                            : `${item.count} breweries`}
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
