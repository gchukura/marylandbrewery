import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProcessedBreweryData, getBreweriesByCity } from '../../../../../lib/brewery-data';
import { slugify, deslugify } from '@/lib/data-utils';
import { parseNeighborhoodSlug, isNeighborhoodSlug, isCitySlug } from '@/lib/neighborhood-utils';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { existsSync } from 'fs';
import { join } from 'path';
import '@/components/home-v2/styles.css';
import CityBreweriesMapClient from '../../../cities/[city]/breweries/CityBreweriesMapClient';
import BreweriesByLocationTabs from '@/components/home-v2/BreweriesByLocationTabs';

// Major city coordinates
const MAJOR_CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  baltimore: { lat: 39.2904, lng: -76.6122 },
  annapolis: { lat: 38.9784, lng: -76.4922 },
  frederick: { lat: 39.4143, lng: -77.4105 },
  rockville: { lat: 39.0840, lng: -77.1528 },
  gaithersburg: { lat: 39.1434, lng: -77.2014 },
  columbia: { lat: 39.2037, lng: -76.8610 },
  'silver spring': { lat: 38.9907, lng: -77.0261 },
  towson: { lat: 39.4015, lng: -76.6019 },
  bethesda: { lat: 38.9847, lng: -77.0947 },
  'ellicott city': { lat: 39.2673, lng: -76.7983 },
  westminster: { lat: 39.5754, lng: -76.9958 },
  cumberland: { lat: 39.6529, lng: -78.7575 },
  hagerstown: { lat: 39.6418, lng: -77.7200 },
  salisbury: { lat: 38.3607, lng: -75.5994 },
  'ocean city': { lat: 38.3365, lng: -75.0849 },
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function getCityCoordinates(cityName: string): Promise<{ lat: number; lng: number } | null> {
  const cityKey = cityName.toLowerCase().trim();
  if (MAJOR_CITY_COORDINATES[cityKey]) {
    return MAJOR_CITY_COORDINATES[cityKey];
  }
  const cityBreweries = await getBreweriesByCity(cityName);
  const breweriesWithCoords = cityBreweries.filter((b: any) => b.latitude && b.longitude);
  if (breweriesWithCoords.length === 0) {
    return null;
  }
  const avgLat = breweriesWithCoords.reduce((sum: number, b: any) => sum + b.latitude, 0) / breweriesWithCoords.length;
  const avgLng = breweriesWithCoords.reduce((sum: number, b: any) => sum + b.longitude, 0) / breweriesWithCoords.length;
  return { lat: avgLat, lng: avgLng };
}

function calculateBreweryScore(brewery: any): number {
  const rating = brewery.googleRating || 0;
  const reviewCount = brewery.googleRatingCount || 0;
  const ratingScore = rating * 20;
  const reviewScore = reviewCount > 0 ? Math.log10(reviewCount) * 10 : 0;
  return ratingScore + reviewScore;
}


export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const city = resolvedParams?.city;
  
  if (!city) {
    return {
      title: 'Location Not Found',
    };
  }

  // Check if it's a neighborhood slug first
  const neighborhoodData = await parseNeighborhoodSlug(city);
  if (neighborhoodData) {
    const { neighborhood, cityName } = neighborhoodData;
    
    if (!neighborhood.latitude || !neighborhood.longitude) {
      return {
        title: `Best Breweries near ${neighborhood.name}, ${cityName}, MD`,
        description: `Find the best breweries near ${neighborhood.name}, ${cityName}, Maryland.`,
      };
    }
    
    const processed = await getProcessedBreweryData();
    const allBreweries = processed.breweries;
    
    const filteredBreweries = allBreweries.filter((brewery: any) => {
      if (!brewery.latitude || !brewery.longitude) return false;
      if (brewery.latitude < 37 || brewery.latitude > 40 || 
          brewery.longitude < -80 || brewery.longitude > -75) {
        return false;
      }
      const distance = calculateDistance(
        neighborhood.latitude!,
        neighborhood.longitude!,
        brewery.latitude,
        brewery.longitude
      );
      return distance <= 10.01;
    });
    
    const title = `Best Breweries near ${neighborhood.name}, ${cityName}, MD | Top-Rated Craft Breweries`;
    const description = `Find the best breweries within 10 miles of ${neighborhood.name}, ${cityName}, Maryland ranked by ratings and reviews. Discover ${filteredBreweries.length} breweries near ${neighborhood.name}.`;

    return {
      title,
      description,
      alternates: { canonical: `/best-breweries/near/${city}` },
      openGraph: {
        title,
        description,
        url: `https://www.marylandbrewery.com/best-breweries/near/${city}`,
        siteName: 'Maryland Brewery Directory',
        type: 'website',
        images: [
          {
            url: '/og-image.jpg',
            width: 1200,
            height: 630,
            alt: `Best Breweries near ${neighborhood.name}, ${cityName}, MD`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['/og-image.jpg'],
      },
    };
  }
  
  // Otherwise, check if it's a city slug
  if (!isCitySlug(city)) {
    return {
      title: 'Location Not Found',
    };
  }

  const isMdRoute = city.endsWith('-md');
  const citySlug = isMdRoute ? city.substring(0, city.length - 3) : city;
  const cityName = deslugify(citySlug);
  const cityCoords = await getCityCoordinates(cityName);
  
  if (!cityCoords) {
    return {
      title: `Best Breweries near ${cityName}, MD`,
      description: `Find the best breweries near ${cityName}, Maryland.`,
    };
  }
  
  const processed = await getProcessedBreweryData();
  const allBreweries = processed.breweries;
  
  const filteredBreweries = allBreweries.filter((brewery: any) => {
    if (!brewery.latitude || !brewery.longitude) return false;
    if (brewery.latitude < 37 || brewery.latitude > 40 || 
        brewery.longitude < -80 || brewery.longitude > -75) {
      return false;
    }
    const distance = calculateDistance(cityCoords.lat, cityCoords.lng, brewery.latitude, brewery.longitude);
    return distance <= 10.01;
  });
  
  const title = `Best Breweries near ${cityName}, MD | Top-Rated Craft Breweries`;
  const description = `Find the best breweries within 10 miles of ${cityName}, Maryland ranked by ratings and reviews. Discover ${filteredBreweries.length} breweries near ${cityName}.`;

  return {
    title,
    description,
    alternates: { canonical: `/best-breweries/near/${city}` },
    openGraph: {
      title,
      description,
      url: `https://www.marylandbrewery.com/best-breweries/near/${city}`,
      siteName: 'Maryland Brewery Directory',
      type: 'website',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: `Best Breweries near ${cityName}, MD`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.jpg'],
    },
  };
}

export default async function BestBreweriesNearCityPage({ params }: { params: Promise<{ city: string }> }) {
  const resolvedParams = await params;
  const city = resolvedParams?.city;
  
  if (!city) {
    notFound();
  }

  // Check if it's a neighborhood slug first
  const neighborhoodData = await parseNeighborhoodSlug(city);
  if (neighborhoodData) {
    const { neighborhood, cityName } = neighborhoodData;
    
    if (!neighborhood.latitude || !neighborhood.longitude) {
      // Fallback: show city breweries if neighborhood has no coordinates
      const cityBreweries = await getBreweriesByCity(cityName);
      const breweriesWithScores = cityBreweries
        .map((brewery: any) => ({
          ...brewery,
          score: calculateBreweryScore(brewery),
        }))
        .sort((a: any, b: any) => b.score - a.score);
      
      return (
        <div className="min-h-screen bg-[#FAF9F6]">
          <section className="bg-white border-b-4 border-[#9B2335] py-12 md:py-16">
            <div className="container mx-auto px-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                Best Breweries near {neighborhood.name}, {cityName}, MD
              </h1>
              <p className="text-lg md:text-xl mb-6">
                <strong>{breweriesWithScores.length}</strong> {breweriesWithScores.length === 1 ? 'brewery' : 'breweries'} found.
              </p>
            </div>
          </section>
          <section className="bg-white py-8 md:py-12">
            <div className="container mx-auto px-4">
              <CityBreweriesMapClient 
                breweries={breweriesWithScores} 
                cityName={cityName} 
                neighborhoods={[]}
                neighborhood={neighborhood}
                showNeighborhoods={false}
                isNearPage={true}
              />
            </div>
          </section>
        </div>
      );
    }
    
    const processed = await getProcessedBreweryData();
    const allBreweries = processed.breweries;
    
    const filteredBreweries = allBreweries
      .filter((brewery: any) => {
        if (!brewery.latitude || !brewery.longitude) return false;
        if (brewery.latitude < 37 || brewery.latitude > 40 || 
            brewery.longitude < -80 || brewery.longitude > -75) {
          return false;
        }
        const distance = calculateDistance(
          neighborhood.latitude!,
          neighborhood.longitude!,
          brewery.latitude,
          brewery.longitude
        );
        return distance <= 10.01;
      })
      .map((brewery: any) => {
        const distance = calculateDistance(
          neighborhood.latitude!,
          neighborhood.longitude!,
          brewery.latitude,
          brewery.longitude
        );
        return {
          ...brewery,
          distance: Math.round(distance * 10) / 10,
        };
      })
      .filter((brewery: any) => brewery.distance <= 10);

    const breweriesWithScores = filteredBreweries
      .map((brewery: any) => ({
        ...brewery,
        score: calculateBreweryScore(brewery),
      }))
      .sort((a: any, b: any) => b.score - a.score);

    // Get city hero image
    const citySlugForImage = slugify(cityName);
    const localCityImagePath = `/cities/${citySlugForImage}.jpg`;
    const localCityImageFile = join(process.cwd(), 'public', 'cities', `${citySlugForImage}.jpg`);
    const hasLocalCityImage = existsSync(localCityImageFile);
    
    // Get brewery fallback image
    const breweryFallbackImage = breweriesWithScores.length > 0 
      ? (breweriesWithScores[0].photos && breweriesWithScores[0].photos.length > 0
          ? breweriesWithScores[0].photos[0]
          : breweriesWithScores[0].photoUrl)
      : null;
    
    const heroImage = hasLocalCityImage ? localCityImagePath : breweryFallbackImage;

    // Prepare data for BreweriesByLocationTabs
    const cityCounts = new Map<string, { name: string; slug: string; count: number }>();
    processed.breweries.forEach((brewery: any) => {
      if (brewery.city) {
        const slug = slugify(brewery.city);
        const existing = cityCounts.get(slug);
        if (existing) {
          existing.count++;
        } else {
          cityCounts.set(slug, { name: brewery.city, slug, count: 1 });
        }
      }
    });
    const cities = Array.from(cityCounts.values()).sort((a, b) => a.name.localeCompare(b.name));
    
    const countyCounts = new Map<string, { name: string; slug: string; count: number }>();
    processed.breweries.forEach((brewery: any) => {
      if (brewery.county) {
        const slug = slugify(brewery.county);
        const existing = countyCounts.get(slug);
        if (existing) {
          existing.count++;
        } else {
          countyCounts.set(slug, { name: `${brewery.county} County`, slug, count: 1 });
        }
      }
    });
    const counties = Array.from(countyCounts.values()).sort((a, b) => a.name.localeCompare(b.name));

    return (
      <div className="min-h-screen bg-[#FAF9F6]">
        {/* Hero Section */}
        <section className="bg-white border-b-4 border-[#9B2335] relative overflow-hidden">
          {/* Hero Image Background */}
          {heroImage && (
            <div className="absolute inset-0">
              {heroImage.startsWith('http') ? (
                <img 
                  src={heroImage} 
                  alt={`Best breweries near ${neighborhood.name}, ${cityName}, MD`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={heroImage}
                  alt={`Best breweries near ${neighborhood.name}, ${cityName}, MD`}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority
                  unoptimized={false}
                />
              )}
              {/* Dark overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
            </div>
          )}
          
          {/* Pattern overlay (only if no hero image) */}
          {!heroImage && (
            <div className="absolute inset-0 md-pattern-bg pointer-events-none" />
          )}
          
          <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
            {/* Breadcrumbs */}
            <nav className="mb-6" aria-label="Breadcrumb">
              <ol className="flex items-center flex-wrap gap-2 text-sm text-white/90" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                <li>
                  <Link href="/" className="hover:text-white transition-colors drop-shadow-md">
                    Maryland Breweries
                  </Link>
                </li>
                <li><ChevronRight className="h-4 w-4 mx-2 text-white/70" /></li>
                <li>
                  <Link href="/cities" className="hover:text-white transition-colors drop-shadow-md">
                    Cities
                  </Link>
                </li>
                <li><ChevronRight className="h-4 w-4 mx-2 text-white/70" /></li>
                <li>
                  <Link href={`/best-breweries/near/${city}`} className="text-white font-medium drop-shadow-md hover:text-white transition-colors">
                    Near {neighborhood.name}, {cityName}, MD
                  </Link>
                </li>
              </ol>
            </nav>

            {/* H1 Title */}
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-lg"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
            >
              Best Breweries near {neighborhood.name}, {cityName}, MD
            </h1>

            {/* Count Display */}
            <p 
              className="text-lg md:text-xl text-white/95 mb-6 drop-shadow-md"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              <strong className="text-white font-semibold">{filteredBreweries.length}</strong> {filteredBreweries.length === 1 ? 'brewery' : 'breweries'} found.
            </p>
          </div>
        </section>

        {/* Map and List Layout */}
        <section className="bg-white py-8 md:py-12">
          <div className="container mx-auto px-4">
            <CityBreweriesMapClient 
              breweries={breweriesWithScores} 
              cityName={cityName} 
              neighborhoods={[]}
              neighborhood={neighborhood}
              showNeighborhoods={false}
              isNearPage={true}
            />
          </div>
        </section>

        {/* Breweries by Location Tabs */}
        <BreweriesByLocationTabs cities={cities} counties={counties} />
      </div>
    );
  }
  
  // Otherwise, check if it's a city slug
  if (!isCitySlug(city)) {
    notFound();
  }

  const isMdRoute = city.endsWith('-md');
  const citySlug = isMdRoute ? city.substring(0, city.length - 3) : city;
  const cityName = deslugify(citySlug);
  const cityCoords = await getCityCoordinates(cityName);
  
  if (!cityCoords) {
    notFound();
  }
  
  const processed = await getProcessedBreweryData();
  const allBreweries = processed.breweries;
  
  const filteredBreweries = allBreweries
    .filter((brewery: any) => {
      if (!brewery.latitude || !brewery.longitude) return false;
      if (brewery.latitude < 37 || brewery.latitude > 40 || 
          brewery.longitude < -80 || brewery.longitude > -75) {
        return false;
      }
      const distance = calculateDistance(cityCoords.lat, cityCoords.lng, brewery.latitude, brewery.longitude);
      return distance <= 10.01;
    })
    .map((brewery: any) => {
      const distance = calculateDistance(cityCoords.lat, cityCoords.lng, brewery.latitude, brewery.longitude);
      return {
        ...brewery,
        distance: Math.round(distance * 10) / 10,
      };
    })
    .filter((brewery: any) => brewery.distance <= 10);

  const breweriesWithScores = filteredBreweries
    .map((brewery: any) => ({
      ...brewery,
      score: calculateBreweryScore(brewery),
    }))
    .sort((a: any, b: any) => b.score - a.score);

  // Get city hero image
  const citySlugForImage = slugify(cityName);
  const localCityImagePath = `/cities/${citySlugForImage}.jpg`;
  const localCityImageFile = join(process.cwd(), 'public', 'cities', `${citySlugForImage}.jpg`);
  const hasLocalCityImage = existsSync(localCityImageFile);
  
  // Get brewery fallback image
  const breweryFallbackImage = breweriesWithScores.length > 0 
    ? (breweriesWithScores[0].photos && breweriesWithScores[0].photos.length > 0
        ? breweriesWithScores[0].photos[0]
        : breweriesWithScores[0].photoUrl)
    : null;
  
  const cityHeroImage = hasLocalCityImage ? localCityImagePath : breweryFallbackImage;

  // Prepare data for BreweriesByLocationTabs
  const cityCounts = new Map<string, { name: string; slug: string; count: number }>();
  processed.breweries.forEach((brewery: any) => {
    if (brewery.city) {
      const slug = slugify(brewery.city);
      const existing = cityCounts.get(slug);
      if (existing) {
        existing.count++;
      } else {
        cityCounts.set(slug, { name: brewery.city, slug, count: 1 });
      }
    }
  });
  const cities = Array.from(cityCounts.values()).sort((a, b) => a.name.localeCompare(b.name));
  
  const countyCounts = new Map<string, { name: string; slug: string; count: number }>();
  processed.breweries.forEach((brewery: any) => {
    if (brewery.county) {
      const slug = slugify(brewery.county);
      const existing = countyCounts.get(slug);
      if (existing) {
        existing.count++;
      } else {
        countyCounts.set(slug, { name: `${brewery.county} County`, slug, count: 1 });
      }
    }
  });
  const counties = Array.from(countyCounts.values()).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Hero Section */}
      <section className="bg-white border-b-4 border-[#9B2335] relative overflow-hidden">
        {/* City Hero Image Background */}
        {cityHeroImage && (
          <div className="absolute inset-0">
            {cityHeroImage.startsWith('http') ? (
              <img 
                src={cityHeroImage} 
                alt={`Best breweries near ${cityName}, MD`}
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={cityHeroImage}
                alt={`Best breweries near ${cityName}, MD`}
                fill
                className="object-cover"
                sizes="100vw"
                priority
                unoptimized={false}
              />
            )}
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
          </div>
        )}
        
        {/* Pattern overlay (only if no hero image) */}
        {!cityHeroImage && (
          <div className="absolute inset-0 md-pattern-bg pointer-events-none" />
        )}
        
        <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
          {/* Breadcrumbs */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center flex-wrap gap-2 text-sm text-white/90" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              <li>
                <Link href="/" className="hover:text-white transition-colors drop-shadow-md">
                  Maryland Breweries
                </Link>
              </li>
              <li><ChevronRight className="h-4 w-4 mx-2 text-white/70" /></li>
              <li>
                <Link href="/cities" className="hover:text-white transition-colors drop-shadow-md">
                  Cities
                </Link>
              </li>
              <li><ChevronRight className="h-4 w-4 mx-2 text-white/70" /></li>
              <li>
                <Link href={`/best-breweries/near/${city}`} className="text-white font-medium drop-shadow-md hover:text-white transition-colors">
                  Near {cityName}, MD
                </Link>
              </li>
            </ol>
          </nav>

          {/* H1 Title */}
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-lg"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
          >
            Best Breweries near {cityName}, MD
          </h1>

          {/* Count Display */}
          <p 
            className="text-lg md:text-xl text-white/95 mb-6 drop-shadow-md"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            <strong className="text-white font-semibold">{filteredBreweries.length}</strong> {filteredBreweries.length === 1 ? 'brewery' : 'breweries'} found.
          </p>
        </div>
      </section>

      {/* Map and List Layout */}
      <section className="bg-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <CityBreweriesMapClient 
            breweries={breweriesWithScores} 
            cityName={cityName} 
            neighborhoods={[]}
            neighborhood={null}
            showNeighborhoods={false}
            isNearPage={true}
          />
        </div>
      </section>

      {/* Breweries by Location Tabs */}
      <BreweriesByLocationTabs cities={cities} counties={counties} />
    </div>
  );
}
