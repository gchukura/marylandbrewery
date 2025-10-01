/**
 * Example Usage of Content Generators
 * Demonstrates how to create unique content for 500+ programmatic pages
 */

import { 
  generateCityIntroText, 
  generateCountyIntroText, 
  generateAmenityIntroText,
  generateComboIntroText,
  generateLocalInsights,
  getSeasonalInfo,
  generateMetaDescription,
  generateStatisticalInsights,
  generatePageTitle
} from './content-generators';

import {
  generateCityDescription,
  generateCountyEconomicImpact,
  generateAmenityValueProposition,
  generateLocalBusinessImpact,
  generateSeasonalContent,
  generateSEOPageDescription
} from './seo-content';

// Example: Generate content for Baltimore city page
export function generateBaltimoreCityPage(breweries: any[], stats: any) {
  const breweryCount = breweries.length;
  const city = 'Baltimore';
  
  // Generate unique intro text
  const introText = generateCityIntroText(city, breweryCount, stats);
  
  // Generate city-specific description with landmarks
  const cityDescription = generateCityDescription(city, breweryCount, breweries);
  
  // Generate local insights
  const localInsights = generateLocalInsights(city, 'Food', breweries);
  
  // Generate seasonal content
  const seasonalInfo = getSeasonalInfo();
  const seasonalContent = generateSeasonalContent(seasonalInfo.season as 'spring' | 'summer' | 'fall' | 'winter', 'city', city);
  
  // Generate meta description
  const metaDescription = generateMetaDescription('city', {
    name: city,
    count: breweryCount,
    amenities: ['Food', 'Outdoor Seating']
  });
  
  // Generate page title
  const pageTitle = generatePageTitle('city', city, breweryCount);
  
  // Generate statistical insights
  const statisticalInsights = generateStatisticalInsights('city', {
    count: breweryCount,
    total: stats.totalBreweries,
    percentage: (breweryCount / stats.totalBreweries) * 100
  });
  
  return {
    title: pageTitle,
    metaDescription,
    introText,
    cityDescription,
    localInsights,
    seasonalContent,
    statisticalInsights,
    // Additional content sections
    contentSections: [
      {
        title: "Baltimore's Brewing Heritage",
        content: introText
      },
      {
        title: "Local Landmarks & Breweries",
        content: cityDescription
      },
      {
        title: "Community Impact",
        content: localInsights.join(' ')
      },
      {
        title: "Seasonal Highlights",
        content: seasonalContent
      }
    ]
  };
}

// Example: Generate content for Anne Arundel County page
export function generateAnneArundelCountyPage(breweries: any[], stats: any) {
  const breweryCount = breweries.length;
  const county = 'Anne Arundel';
  
  const introText = generateCountyIntroText(county, breweryCount, stats);
  const economicImpact = generateCountyEconomicImpact(county, breweryCount, stats.totalBreweries);
  const businessImpact = generateLocalBusinessImpact(county, breweryCount, ['Tours', 'Food']);
  
  const metaDescription = generateMetaDescription('county', {
    name: county,
    count: breweryCount
  });
  
  const pageTitle = generatePageTitle('county', county, breweryCount);
  
  return {
    title: pageTitle,
    metaDescription,
    introText,
    economicImpact,
    businessImpact,
    contentSections: [
      {
        title: "County Overview",
        content: introText
      },
      {
        title: "Economic Impact",
        content: economicImpact
      },
      {
        title: "Local Business Development",
        content: businessImpact
      }
    ]
  };
}

// Example: Generate content for "Food" amenity page
export function generateFoodAmenityPage(breweries: any[], stats: any) {
  const breweryCount = breweries.length;
  const amenity = 'Food';
  const percentage = (breweryCount / stats.totalBreweries) * 100;
  
  const introText = generateAmenityIntroText(amenity, breweryCount, percentage);
  const valueProposition = generateAmenityValueProposition(amenity, breweryCount, percentage);
  
  const metaDescription = generateMetaDescription('amenity', {
    name: amenity,
    count: breweryCount
  });
  
  const pageTitle = generatePageTitle('amenity', amenity, breweryCount);
  
  return {
    title: pageTitle,
    metaDescription,
    introText,
    valueProposition,
    contentSections: [
      {
        title: "Why Food Matters",
        content: introText
      },
      {
        title: "Industry Value Proposition",
        content: valueProposition
      }
    ]
  };
}

// Example: Generate content for "Baltimore + Food" combination page
export function generateBaltimoreFoodPage(breweries: any[]) {
  const city = 'Baltimore';
  const amenity = 'Food';
  const count = breweries.length;
  
  const introText = generateComboIntroText(city, amenity, count);
  const cityDescription = generateCityDescription(city, count, breweries);
  const localInsights = generateLocalInsights(city, amenity, breweries);
  
  const metaDescription = generateMetaDescription('city', {
    name: city,
    count,
    amenities: [amenity]
  });
  
  return {
    title: `Baltimore Breweries with Food | Maryland Brewery Directory`,
    metaDescription,
    introText,
    cityDescription,
    localInsights,
    contentSections: [
      {
        title: "Baltimore's Food & Beer Scene",
        content: introText
      },
      {
        title: "Local Character",
        content: cityDescription
      },
      {
        title: "Community Insights",
        content: localInsights.join(' ')
      }
    ]
  };
}

// Example: Generate content for individual brewery page
export function generateBreweryPage(brewery: any, nearbyBreweries: any[]) {
  const city = brewery.city;
  const county = (brewery as any).county;
  const amenities = (brewery as any).amenities || [];
  
  const metaDescription = generateMetaDescription('brewery', {
    name: brewery.name,
    count: 1,
    amenities,
    city,
    county
  });
  
  const localInsights = generateLocalInsights(city, amenities[0] || 'general', [brewery]);
  const businessImpact = generateLocalBusinessImpact(city, 1, amenities);
  
  return {
    title: `${brewery.name} | ${city}, MD | Maryland Brewery Directory`,
    metaDescription,
    localInsights,
    businessImpact,
    contentSections: [
      {
        title: "About This Brewery",
        content: brewery.description || `Discover ${brewery.name} in ${city}, Maryland.`
      },
      {
        title: "Local Impact",
        content: businessImpact
      },
      {
        title: "Community Connection",
        content: localInsights.join(' ')
      }
    ]
  };
}

// Example: Batch generate content for multiple pages
export function generateBatchContent(breweries: any[], stats: any): any[] {
  const pages: any[] = [];
  
  // Generate city pages
  const cities = [...new Set(breweries.map(b => b.city))];
  cities.forEach(city => {
    const cityBreweries = breweries.filter(b => b.city === city);
    pages.push(generateBaltimoreCityPage(cityBreweries, stats));
  });
  
  // Generate county pages
  const counties = [...new Set(breweries.map(b => (b as any).county))];
  counties.forEach(county => {
    const countyBreweries = breweries.filter(b => (b as any).county === county);
    pages.push(generateAnneArundelCountyPage(countyBreweries, stats));
  });
  
  // Generate amenity pages
  const amenities = [...new Set(breweries.flatMap(b => (b as any).amenities || []))];
  amenities.forEach(amenity => {
    const amenityBreweries = breweries.filter(b => 
      (b as any).amenities && (b as any).amenities.includes(amenity)
    );
    if (amenityBreweries.length > 0) {
      pages.push(generateFoodAmenityPage(amenityBreweries, stats));
    }
  });
  
  return pages;
}
