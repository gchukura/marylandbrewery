'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';

export default function HeroV2() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/map?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/map');
    }
  };

  return (
    <section className="relative overflow-hidden">
      {/* Subtle Pattern Background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                #9B2335 0px,
                #9B2335 10px,
                #D4A017 10px,
                #D4A017 20px
              )
            `,
          }}
        />
      </div>
      
      <div className="relative bg-gradient-to-b from-[#FAF9F6] to-white pt-20 md:pt-32 pb-8 md:pb-12">
        <div className="container mx-auto px-4">

          {/* Main Headline */}
          <h1 
            className="text-center text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold text-[#1C1C1C] mb-6 leading-[1.1]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Discover Maryland's
            <br />
            <span className="text-[#9B2335]">Craft Brewery</span> Scene
          </h1>

          {/* Subtitle */}
          <p 
            className="text-center text-lg md:text-xl text-[#6B6B6B] max-w-2xl mx-auto mb-10"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            A local curated directory of craft breweries in the state of Maryland. Find a brewery for your next event, outing, or place to hang with family and friends.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-0">
            <div className="relative">
              <div className="relative flex flex-col sm:flex-row bg-white rounded-lg shadow-lg border border-[#E8E6E1]">
                <div className="flex items-center pl-4 sm:pl-5 flex-1 min-w-0">
                  <Search className="h-5 w-5 text-[#6B6B6B] flex-shrink-0" />
                  <input
                    type="search"
                    inputMode="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by brewery name, city, or county..."
                    className="flex-1 px-3 sm:px-4 py-4 sm:py-5 text-base sm:text-lg bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-[#9B2335] focus:ring-inset text-[#1C1C1C] placeholder-[#9CA3AF] min-w-0"
                    style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                    autoComplete="off"
                  />
                </div>
                <button
                  type="submit"
                  className="m-2 px-6 sm:px-8 py-3 sm:py-3 bg-[#9B2335] hover:bg-[#7A1C2A] active:bg-[#6A1623] text-white font-medium rounded-md transition-colors duration-200 flex items-center justify-center gap-2 min-h-[48px] touch-manipulation"
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                >
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">Find Breweries</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

