import React from 'react';
import PageContainer from '@/components/layout/PageContainer';
import StatsBarClient from './StatsBarClient';
import { getProcessedBreweryData } from '../../../lib/brewery-data';

async function getStats() {
  const processed = await getProcessedBreweryData();
  const total = processed.breweries.length;
  const counties = processed.counties?.length || new Set(processed.breweries.map(b => (b as any).county)).size;
  const cities = processed.cities?.length || new Set(processed.breweries.map(b => b.city)).size;
  return { total, counties, cities };
}

export default async function StatsBar() {
  const { total, counties, cities } = await getStats();
  return (
    <div className="w-full">
      <PageContainer>
        <StatsBarClient total={total} counties={counties} cities={cities} />
      </PageContainer>
    </div>
  );
}
