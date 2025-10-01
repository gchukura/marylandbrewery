import { getProcessedBreweryData } from '../../../lib/brewery-data';
import MapClient from './MapClient';

export default async function MapPage() {
  const processed = await getProcessedBreweryData();
  const breweries = processed.breweries as any[];
  return (
    <MapClient breweries={breweries} />
  );
}
