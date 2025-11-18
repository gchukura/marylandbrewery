import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  totalBreweries: number;
  totalCities: number;
  totalCounties: number;
}

export default function HeroSection({ totalBreweries, totalCities, totalCounties }: HeroSectionProps) {
  return (
    <section className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Discover Maryland's Craft Brewery Scene
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
            Your complete guide to {totalBreweries}+ craft breweries across {totalCities} cities and {totalCounties} counties in the Old Line State
          </p>
          <div className="flex justify-center items-center mb-12">
            <Link 
              href="/map"
              className="inline-flex items-center justify-center bg-red-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              Start Here
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto pt-8 border-t border-gray-700">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-1">{totalBreweries}+</div>
              <div className="text-sm md:text-base text-gray-300">Breweries</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-1">{totalCities}+</div>
              <div className="text-sm md:text-base text-gray-300">Cities</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-1">{totalCounties}</div>
              <div className="text-sm md:text-base text-gray-300">Counties</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
