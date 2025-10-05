import React from 'react';
import StatsBarClient from './StatsBarClient';
import { getProcessedBreweryData } from '../../../lib/brewery-data';

async function getStats() {
  const processed = await getProcessedBreweryData();
  
  // Calculate stats based on actual brewery data
  const totalBreweries = processed.breweries.length;
  const activeBreweries = processed.breweries.filter(b => b.allowsVisitors).length;
  const microbreweries = processed.breweries.filter(b => b.type === 'microbrewery').length;
  const brewpubs = processed.breweries.filter(b => b.type === 'brewpub').length;
  
  return { 
    totalBreweries, 
    activeBreweries, 
    microbreweries, 
    brewpubs 
  };
}

export default async function StatsBar() {
  const stats = await getStats();
  return <StatsBarClient {...stats} />;
}
