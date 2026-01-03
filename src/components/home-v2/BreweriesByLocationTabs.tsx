'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { slugify } from '@/lib/data-utils';

interface CityData {
  name: string;
  slug: string;
  count: number;
}

interface CountyData {
  name: string;
  slug: string;
  count: number;
}

interface BreweriesByLocationTabsProps {
  cities: CityData[];
  counties: CountyData[];
}

export default function BreweriesByLocationTabs({ cities, counties }: BreweriesByLocationTabsProps) {
  const [activeTab, setActiveTab] = useState<'city' | 'county'>('city');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Organize cities into columns (5 columns like bimmershops)
  const citiesPerColumn = Math.ceil(cities.length / 5);
  const cityColumns: CityData[][] = [];
  for (let i = 0; i < 5; i++) {
    cityColumns.push(cities.slice(i * citiesPerColumn, (i + 1) * citiesPerColumn));
  }

  // Organize counties into columns (5 columns)
  const countiesPerColumn = Math.ceil(counties.length / 5);
  const countyColumns: CountyData[][] = [];
  for (let i = 0; i < 5; i++) {
    countyColumns.push(counties.slice(i * countiesPerColumn, (i + 1) * countiesPerColumn));
  }

  return (
    <section className="relative pt-8 md:pt-12 pb-20 md:pb-28 bg-gradient-to-b from-[#FAF9F6] via-white to-[#FAF9F6] overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                #9B2335 2px,
                #9B2335 4px
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 2px,
                #D4A017 2px,
                #D4A017 4px
              )
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Tabs - Bold, distinctive design */}
        <div className="flex items-center justify-center gap-0 mb-12 max-w-4xl mx-auto">
          <div className="relative flex bg-white/80 backdrop-blur-sm rounded-t-xl border-2 border-[#E8E6E1] shadow-lg overflow-hidden">
            {/* Active tab indicator background */}
            <div 
              className={`absolute top-0 h-full bg-gradient-to-br from-[#9B2335] to-[#7A1C2A] transition-all duration-500 ease-out rounded-t-xl ${
                activeTab === 'city' ? 'left-0 w-1/2' : 'left-1/2 w-1/2'
              }`}
            />
            
            <button
              onClick={() => setActiveTab('city')}
              className={`relative z-10 py-5 px-10 text-center font-semibold transition-all duration-300 ${
                activeTab === 'city'
                  ? 'text-white'
                  : 'text-[#6B6B6B] hover:text-[#1C1C1C]'
              }`}
              style={{ 
                fontFamily: "'Source Sans 3', sans-serif",
                letterSpacing: '0.025em',
                textTransform: 'uppercase',
                fontSize: '0.875rem',
              }}
            >
              <span className="relative">
                Maryland Breweries by City
                {activeTab === 'city' && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#D4A017] animate-pulse" />
                )}
              </span>
            </button>
            
            <div className="w-px h-8 bg-[#E8E6E1] my-auto" />
            
            <button
              onClick={() => setActiveTab('county')}
              className={`relative z-10 py-5 px-10 text-center font-semibold transition-all duration-300 ${
                activeTab === 'county'
                  ? 'text-white'
                  : 'text-[#6B6B6B] hover:text-[#1C1C1C]'
              }`}
              style={{ 
                fontFamily: "'Source Sans 3', sans-serif",
                letterSpacing: '0.025em',
                textTransform: 'uppercase',
                fontSize: '0.875rem',
              }}
            >
              <span className="relative">
                Maryland Breweries by County
                {activeTab === 'county' && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#D4A017] animate-pulse" />
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content - 5 columns with staggered animation */}
        <div className={`max-w-7xl mx-auto transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          {activeTab === 'city' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-0">
              {cityColumns.map((column, colIndex) => (
                <div 
                  key={colIndex} 
                  className="flex flex-col"
                  style={{
                    animation: isVisible ? `fadeSlideUp 0.6s ease-out ${colIndex * 0.1}s both` : 'none',
                  }}
                >
                  {column.map((city, itemIndex) => (
                    <Link
                      key={city.slug}
                      href={`/city/${city.slug}/breweries`}
                      className="group relative py-3 px-0 text-[#1C1C1C] hover:text-[#9B2335] transition-colors duration-300 text-sm border-b border-[#E5E7EB] last:border-b-0 hover:bg-[#FAF9F6]/50 rounded-sm"
                      style={{ 
                        fontFamily: "'Source Sans 3', sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      <span className="relative inline-block">
                        {city.name}
                        <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-gradient-to-r from-[#9B2335] to-[#D4A017] group-hover:w-full transition-all duration-300" />
                      </span>
                      {/* Subtle hover accent */}
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-4 bg-[#D4A017]/20 group-hover:w-1 transition-all duration-300 rounded-r" />
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-0">
              {countyColumns.map((column, colIndex) => (
                <div 
                  key={colIndex} 
                  className="flex flex-col"
                  style={{
                    animation: isVisible ? `fadeSlideUp 0.6s ease-out ${colIndex * 0.1}s both` : 'none',
                  }}
                >
                  {column.map((county) => (
                    <Link
                      key={county.slug}
                      href={`/county/${county.slug}/breweries`}
                      className="group relative py-3 px-0 text-[#1C1C1C] hover:text-[#9B2335] transition-colors duration-300 text-sm border-b border-[#E5E7EB] last:border-b-0 hover:bg-[#FAF9F6]/50 rounded-sm"
                      style={{ 
                        fontFamily: "'Source Sans 3', sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      <span className="relative inline-block">
                        {county.name}
                        <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-gradient-to-r from-[#9B2335] to-[#D4A017] group-hover:w-full transition-all duration-300" />
                      </span>
                      {/* Subtle hover accent */}
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-4 bg-[#D4A017]/20 group-hover:w-1 transition-all duration-300 rounded-r" />
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}

