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

  // Sort cities alphabetically by name
  const sortedCities = [...cities].sort((a, b) => a.name.localeCompare(b.name));
  
  // Sort counties alphabetically by name (without "County" suffix for sorting)
  const sortedCounties = [...counties].sort((a, b) => 
    a.name.replace(/\s+County$/i, '').localeCompare(b.name.replace(/\s+County$/i, ''))
  );

  // Organize cities into columns (5 columns)
  // Reading order: down column 1, then down column 2, etc. (alphabetical progression)
  const citiesPerColumn = Math.ceil(sortedCities.length / 5);
  const cityColumns: CityData[][] = [];
  for (let i = 0; i < 5; i++) {
    cityColumns.push(sortedCities.slice(i * citiesPerColumn, (i + 1) * citiesPerColumn));
  }

  // Organize counties into columns (5 columns)
  const countiesPerColumn = Math.ceil(sortedCounties.length / 5);
  const countyColumns: CountyData[][] = [];
  for (let i = 0; i < 5; i++) {
    countyColumns.push(sortedCounties.slice(i * countiesPerColumn, (i + 1) * countiesPerColumn));
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
        <div className="flex items-center justify-center gap-0 mb-8 sm:mb-12 max-w-4xl mx-auto px-2">
          <div className="relative flex bg-white/80 backdrop-blur-sm rounded-t-xl border-2 border-[#E8E6E1] shadow-lg overflow-hidden w-full sm:w-auto">
            {/* Active tab indicator background */}
            <div 
              className={`absolute top-0 h-full bg-gradient-to-br from-[#9B2335] to-[#7A1C2A] transition-all duration-500 ease-out rounded-t-xl ${
                activeTab === 'city' ? 'left-0 w-1/2' : 'left-1/2 w-1/2'
              }`}
            />
            
            <button
              onClick={() => setActiveTab('city')}
              className={`relative z-10 py-4 sm:py-5 px-4 sm:px-10 text-center font-semibold transition-all duration-300 flex-1 sm:flex-none min-h-[48px] sm:min-h-0 ${
                activeTab === 'city'
                  ? 'text-white'
                  : 'text-[#6B6B6B] hover:text-[#1C1C1C]'
              }`}
              style={{ 
                fontFamily: "'Source Sans 3', sans-serif",
                letterSpacing: '0.025em',
                textTransform: 'uppercase',
                fontSize: '0.75rem sm:0.875rem',
              }}
            >
              <span className="relative inline-block w-full sm:w-auto">
                <span className="hidden sm:inline">Breweries by City</span>
                <span className="sm:hidden">By City</span>
                {activeTab === 'city' && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#D4A017] animate-pulse" style={{ width: '100%' }} />
                )}
              </span>
            </button>
            
            <div className="w-px h-8 bg-[#E8E6E1] my-auto hidden sm:block" />
            
            <button
              onClick={() => setActiveTab('county')}
              className={`relative z-10 py-4 sm:py-5 px-4 sm:px-10 text-center font-semibold transition-all duration-300 flex-1 sm:flex-none min-h-[48px] sm:min-h-0 ${
                activeTab === 'county'
                  ? 'text-white'
                  : 'text-[#6B6B6B] hover:text-[#1C1C1C]'
              }`}
              style={{ 
                fontFamily: "'Source Sans 3', sans-serif",
                letterSpacing: '0.025em',
                textTransform: 'uppercase',
                fontSize: '0.75rem sm:0.875rem',
              }}
            >
              <span className="relative inline-block w-full sm:w-auto">
                <span className="hidden sm:inline">Breweries by County</span>
                <span className="sm:hidden">By County</span>
                {activeTab === 'county' && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#D4A017] animate-pulse" style={{ width: '100%' }} />
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
                      href={`/cities/${city.slug}/breweries`}
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
                      href={`/counties/${county.slug}/breweries`}
                      className="group relative py-3 px-0 text-[#1C1C1C] hover:text-[#9B2335] transition-colors duration-300 text-sm border-b border-[#E5E7EB] last:border-b-0 hover:bg-[#FAF9F6]/50 rounded-sm"
                      style={{ 
                        fontFamily: "'Source Sans 3', sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      <span className="relative inline-block">
                        {county.name.replace(/\s+County$/i, '')}
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

