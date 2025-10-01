import { getProcessedBreweryData } from '../../../lib/brewery-data';
import MapClient from './MapClient';

export const revalidate = 3600;

export default async function MapPage() {
  const processed = await getProcessedBreweryData();
  const breweries = processed.breweries as any[];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="p-4 bg-white border-b">
        <h1 className="text-2xl font-bold text-gray-900">Interactive Brewery Map</h1>
        <p className="text-gray-600">Explore all Maryland breweries on the map.</p>
      </div>
      <div className="flex-1">
        <MapClient breweries={breweries} />
      </div>
    </div>
  );
}
