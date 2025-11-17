import React from 'react';
import { Brewery } from '@/types/brewery';
import BreweryTable from './BreweryTable';
import GoogleMap from '../maps/GoogleMap';

interface MapAndTableSectionProps {
  breweries: Brewery[];
}

export default function MapAndTableSection({ breweries }: MapAndTableSectionProps) {
  return (
    <section className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="space-y-12">
          {/* Interactive Map */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Interactive Map</h3>
            <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
              <GoogleMap breweries={breweries as any} height="100%" showClusters={true} zoom={10} />
            </div>
          </div>

          {/* Brewery Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Brewery Directory</h3>
            <BreweryTable breweries={breweries} />
          </div>
        </div>
      </div>
    </section>
  );
}
