import React from 'react';
import PageContainer from '@/components/layout/PageContainer';
import StatsBarClient from './StatsBarClient';
import Link from 'next/link';

interface HeroSectionProps {
  stats?: { total: number; counties: number; cities: number };
}

export default function HeroSection({ stats }: HeroSectionProps) {
  return (
    <section className="relative">
      <div className="absolute inset-0 bg-gradient-to-b from-md-gold/10 via-white to-white pointer-events-none" />
      <PageContainer className="relative py-section-y">
        <div className="max-w-3xl">
          <h1 className="text-display font-extrabold text-gray-900">
            Find Every Maryland Brewery.
            <br />
            <span className="text-md-red">Discover Every Maryland Beer.</span>
          </h1>
          <p className="mt-3 text-body text-gray-700">
            Explore the complete directory of Maryland breweries, from Baltimore to the Eastern Shore.
          </p>
          <div className="mt-6 flex items-center gap-3">
            {/* Swap to HeroSearchBar when ready */}
            <input
              type="text"
              placeholder="Search breweries, cities, or features..."
              className="w-full max-w-lg border rounded-btn px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-md-red"
            />
            <Link href="/map" className="btn btn-primary-gold">View Map</Link>
            <Link href="/city" className="btn btn-outline text-md-red border-md-red hover:bg-md-red/10">Browse All</Link>
          </div>
        </div>
      </PageContainer>
      <div className="mt-6">
        {stats && <StatsBarClient total={stats.total} counties={stats.counties} cities={stats.cities} />}
      </div>
    </section>
  );
}
