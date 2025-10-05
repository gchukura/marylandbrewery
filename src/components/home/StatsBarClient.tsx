"use client";

import React from 'react';
import CountUp from './CountUp';

interface StatsBarClientProps {
  totalBreweries: number;
  activeBreweries: number;
  microbreweries: number;
  brewpubs: number;
}

export default function StatsBarClient({ totalBreweries, activeBreweries, microbreweries, brewpubs }: StatsBarClientProps) {
  return (
    <div className="bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Active Breweries Box */}
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-4xl font-bold text-md-red mb-2">
              <CountUp end={activeBreweries} />
            </div>
            <div className="text-gray-600">Active Breweries</div>
          </div>

          {/* Microbreweries Box */}
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-4xl font-bold text-md-gold mb-2">
              <CountUp end={microbreweries} />
            </div>
            <div className="text-gray-600">Microbreweries</div>
          </div>

          {/* Brewpubs Box */}
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-4xl font-bold text-black mb-2">
              <CountUp end={brewpubs} />
            </div>
            <div className="text-gray-600">Brewpubs</div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
