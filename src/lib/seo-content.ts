/**
 * SEO Content Generator for Maryland Brewery Directory
 * Creates unique, valuable content for 500+ programmatic pages
 */

import { Brewery } from '@/types/brewery';

// Maryland-specific landmarks and neighborhoods for city pages
const CITY_LANDMARKS = {
  baltimore: {
    neighborhoods: [
      'Fells Point', 'Canton', 'Federal Hill', 'Mount Vernon', 'Hampden',
      'Charles Village', 'Patterson Park', 'Druid Hill Park', 'Little Italy',
      'Bolton Hill', 'Riverside', 'Locust Point', 'Highlandtown'
    ],
    landmarks: [
      'Inner Harbor', 'Camden Yards', 'Fort McHenry', 'National Aquarium',
      'Baltimore Museum of Art', 'Walters Art Museum', 'Lexington Market',
      'Cross Street Market', 'Fells Point Historic District'
    ],
    economic_facts: [
      'major port city', 'healthcare hub', 'biotech center', 'financial district',
      'university town', 'cultural center', 'tourism destination'
    ]
  },
  annapolis: {
    neighborhoods: [
      'Historic Downtown', 'Eastport', 'West Street', 'Parole', 'Cape St. Claire',
      'Arnold', 'Severna Park', 'Crownsville'
    ],
    landmarks: [
      'Maryland State House', 'Naval Academy', 'City Dock', 'St. John\'s College',
      'William Paca House', 'Hammond-Harwood House', 'Chase-Lloyd House',
      'Banneker-Douglass Museum', 'Kunta Kinte-Alex Haley Memorial'
    ],
    economic_facts: [
      'state capital', 'naval academy', 'maritime heritage', 'historic preservation',
      'tourism center', 'government hub', 'Chesapeake Bay gateway'
    ]
  },
  frederick: {
    neighborhoods: [
      'Historic Downtown', 'Carroll Creek', 'Baker Park', 'Schifferstadt',
      'Rose Hill Manor', 'Westview', 'Ballenger Creek', 'Urbana'
    ],
    landmarks: [
      'Carroll Creek Linear Park', 'Baker Park', 'Schifferstadt Architectural Museum',
      'Rose Hill Manor Park', 'Catoctin Mountains', 'Monocacy National Battlefield',
      'National Museum of Civil War Medicine', 'Weinberg Center for the Arts'
    ],
    economic_facts: [
      'historic preservation', 'agricultural center', 'mountain gateway',
      'cultural hub', 'tourism destination', 'educational center'
    ]
  },
  rockville: {
    neighborhoods: [
      'Town Square', 'Rockville Town Center', 'Twinbrook', 'King Farm',
      'Pike & Rose', 'Rockville Pike', 'Montrose', 'Woodley Gardens'
    ],
    landmarks: [
      'Rockville Town Square', 'Montrose Shopping Center', 'Pike & Rose',
      'Rockville Civic Center', 'F. Scott Fitzgerald Theatre', 'Rockville Metro Station'
    ],
    economic_facts: [
      'biotech corridor', 'government contractor hub', 'transit-oriented development',
      'mixed-use development', 'technology center', 'retail destination'
    ]
  },
  columbia: {
    neighborhoods: [
      'Town Center', 'Wilde Lake', 'Harper\'s Choice', 'Oakland Mills',
      'Long Reach', 'Kings Contrivance', 'River Hill', 'Dorsey\'s Search'
    ],
    landmarks: [
      'Merriweather Post Pavilion', 'Lake Kittamaqundi', 'Symphony Woods',
      'Columbia Mall', 'Centennial Park', 'Robinson Nature Center'
    ],
    economic_facts: [
      'planned community', 'mixed-use development', 'cultural center',
      'retail hub', 'recreation destination', 'family-friendly community'
    ]
  }
};

// County economic impact data
const COUNTY_ECONOMIC_DATA = {
  'Baltimore City': {
    population: '575,000',
    gdp: '$45 billion',
    industries: ['healthcare', 'finance', 'technology', 'tourism', 'education'],
    economic_impact: 'major urban economic engine',
    brewery_contribution: 'urban revitalization and tourism'
  },
  'Anne Arundel': {
    population: '588,000',
    gdp: '$28 billion',
    industries: ['government', 'defense', 'maritime', 'tourism', 'healthcare'],
    economic_impact: 'state capital and defense hub',
    brewery_contribution: 'tourism and local business development'
  },
  'Montgomery': {
    population: '1,062,000',
    gdp: '$85 billion',
    industries: ['biotechnology', 'government', 'technology', 'healthcare', 'education'],
    economic_impact: 'biotech and government powerhouse',
    brewery_contribution: 'innovation and entrepreneurship'
  },
  'Prince George\'s': {
    population: '967,000',
    gdp: '$42 billion',
    industries: ['education', 'government', 'retail', 'hospitality', 'healthcare'],
    economic_impact: 'diverse economic base',
    brewery_contribution: 'community development and job creation'
  },
  'Howard': {
    population: '332,000',
    gdp: '$22 billion',
    industries: ['technology', 'education', 'healthcare', 'retail', 'government'],
    economic_impact: 'planned community excellence',
    brewery_contribution: 'quality of life and community engagement'
  },
  'Frederick': {
    population: '271,000',
    gdp: '$18 billion',
    industries: ['agriculture', 'tourism', 'manufacturing', 'healthcare', 'defense'],
    economic_impact: 'historic and agricultural center',
    brewery_contribution: 'heritage tourism and local agriculture'
  },
  'Baltimore County': {
    population: '828,000',
    gdp: '$35 billion',
    industries: ['healthcare', 'education', 'retail', 'manufacturing', 'technology'],
    economic_impact: 'suburban economic powerhouse',
    brewery_contribution: 'suburban development and community building'
  }
};

// Amenity value propositions and SEO keywords
const AMENITY_SEO_DATA = {
  'Food': {
    value_proposition: 'Complete dining experience with expertly paired craft beer',
    seo_keywords: ['brewpub', 'gastropub', 'craft food', 'beer and food pairing', 'restaurant brewery'],
    target_audience: 'food enthusiasts', 'date night', 'family dining', 'culinary experiences',
    economic_impact: 'increased revenue per customer', 'longer visit duration', 'repeat business'
  },
  'Outdoor Seating': {
    value_proposition: 'Fresh air and natural ambiance enhance the craft beer experience',
    seo_keywords: ['patio', 'beer garden', 'outdoor dining', 'al fresco', 'seasonal seating'],
    target_audience: 'outdoor enthusiasts', 'dog owners', 'families', 'social groups',
    economic_impact: 'seasonal revenue boost', 'weather-dependent business', 'expanded capacity'
  },
  'Live Music': {
    value_proposition: 'Entertainment and craft beer create memorable experiences',
    seo_keywords: ['live entertainment', 'music venue', 'concerts', 'entertainment', 'nightlife'],
    target_audience: 'music lovers', 'entertainment seekers', 'social groups', 'date night',
    economic_impact: 'increased foot traffic', 'premium pricing', 'event-driven revenue'
  },
  'Tours': {
    value_proposition: 'Educational experiences deepen appreciation for craft beer',
    seo_keywords: ['brewery tours', 'educational', 'behind the scenes', 'brewing process', 'learning'],
    target_audience: 'beer enthusiasts', 'tourists', 'groups', 'educational groups',
    economic_impact: 'premium experience pricing', 'group bookings', 'educational tourism'
  },
  'Pet Friendly': {
    value_proposition: 'Inclusive experiences for pet owners and their companions',
    seo_keywords: ['dog friendly', 'pet friendly', 'family friendly', 'pets welcome', 'animal friendly'],
    target_audience: 'pet owners', 'families', 'outdoor enthusiasts', 'community groups',
    economic_impact: 'expanded customer base', 'community engagement', 'loyalty building'
  },
  'WiFi': {
    value_proposition: 'Remote work flexibility meets craft beer culture',
    seo_keywords: ['remote work', 'WiFi', 'laptop friendly', 'work space', 'digital nomad'],
    target_audience: 'remote workers', 'digital nomads', 'students', 'professionals',
    economic_impact: 'extended visit duration', 'off-peak business', 'loyalty programs'
  },
  'Parking': {
    value_proposition: 'Convenient access removes barriers to craft beer enjoyment',
    seo_keywords: ['free parking', 'parking available', 'easy access', 'convenient', 'accessible'],
    target_audience: 'drivers', 'families', 'accessibility needs', 'convenience seekers',
    economic_impact: 'increased accessibility', 'customer satisfaction', 'competitive advantage'
  }
};

/**
 * Generate city-specific descriptions with landmarks and neighborhoods
 */
export function generateCityDescription(
  city: string,
  breweryCount: number,
  breweries: Brewery[]
): string {
  const cityKey = city.toLowerCase() as keyof typeof CITY_LANDMARKS;
  const cityData = CITY_LANDMARKS[cityKey] || {
    neighborhoods: ['downtown area'],
    landmarks: ['local attractions'],
    economic_facts: ['vibrant community']
  };

  const neighborhoods = cityData.neighborhoods.slice(0, 3).join(', ');
  const landmarks = cityData.landmarks.slice(0, 2).join(' and ');
  const economicFact = cityData.economic_facts[0];

  const breweryTypes = [...new Set(breweries.map(b => (b as any).type || 'brewery'))];
  const typeText = breweryTypes.length > 1 
    ? `${breweryTypes.slice(0, 2).join(' and ')} breweries`
    : `${breweryTypes[0]} breweries`;

  return `${city}, Maryland's ${economicFact}, is home to ${breweryCount} exceptional ${typeText} that showcase the city's unique character. From the historic ${landmarks} to vibrant neighborhoods like ${neighborhoods}, these breweries reflect ${city}'s rich heritage and innovative spirit. Whether you're exploring the ${landmarks} or discovering hidden gems in ${neighborhoods}, ${city}'s craft beer scene offers diverse experiences that celebrate local culture and community.`;
}

/**
 * Generate county economic impact statements
 */
export function generateCountyEconomicImpact(
  county: string,
  breweryCount: number,
  totalBreweries: number
): string {
  const countyData = COUNTY_ECONOMIC_DATA[county] || {
    population: 'diverse population',
    gdp: 'significant economic output',
    industries: ['diverse industries'],
    economic_impact: 'vibrant economic center',
    brewery_contribution: 'community development'
  };

  const percentage = ((breweryCount / totalBreweries) * 100).toFixed(1);
  const industries = countyData.industries.slice(0, 3).join(', ');

  return `${county} County, with its ${countyData.population} residents and ${countyData.gdp} economic output, represents a ${countyData.economic_impact} in Maryland. The county's ${countyData.industries.join(', ')} industries provide a strong foundation for craft brewing innovation. With ${breweryCount} breweries (${percentage}% of Maryland's total), ${county} County's craft beer industry contributes significantly to ${countyData.brewery_contribution}, creating jobs, supporting local agriculture, and enhancing tourism. These breweries not only serve exceptional craft beer but also drive economic development through local sourcing, community events, and cultural preservation.`;
}

/**
 * Generate amenity value propositions
 */
export function generateAmenityValueProposition(
  amenity: string,
  breweryCount: number,
  percentage: number
): string {
  const amenityData = AMENITY_SEO_DATA[amenity] || {
    value_proposition: 'enhanced experience',
    seo_keywords: ['special features'],
    target_audience: 'visitors',
    economic_impact: 'business growth'
  };

  const percentageText = percentage > 50 ? 'majority' : percentage > 25 ? 'significant portion' : 'growing number';
  
  return `Maryland's craft beer scene increasingly recognizes the value of ${amenity.toLowerCase()}, with a ${percentageText} of breweries offering this amenity. This trend reflects the industry's understanding that ${amenityData.value_proposition} creates more memorable and satisfying experiences for ${amenityData.target_audience}. The economic impact is clear: breweries with ${amenity.toLowerCase()} see ${amenityData.economic_impact}, demonstrating how thoughtful amenities drive both customer satisfaction and business success.`;
}

/**
 * Generate statistical insights for each page type
 */
export function generateStatisticalInsights(
  pageType: 'city' | 'county' | 'amenity' | 'type',
  data: {
    count: number;
    total: number;
    percentage?: number;
    growth?: number;
    averageRating?: number;
  }
): string[] {
  const { count, total, percentage, growth, averageRating } = data;
  const insights: string[] = [];

  // Market share insights
  if (percentage && percentage > 30) {
    insights.push(`This represents ${percentage.toFixed(1)}% of Maryland's total brewery market, indicating a significant concentration of craft beer activity.`);
  } else if (percentage && percentage > 15) {
    insights.push(`With ${percentage.toFixed(1)}% of Maryland's breweries, this area offers substantial craft beer diversity.`);
  } else if (percentage && percentage < 5) {
    insights.push(`This emerging market represents ${percentage.toFixed(1)}% of Maryland's breweries, showing growth potential.`);
  }

  // Growth insights
  if (growth && growth > 20) {
    insights.push(`The craft beer scene here has grown ${growth}% in recent years, reflecting strong community support and market demand.`);
  } else if (growth && growth > 10) {
    insights.push(`Steady growth of ${growth}% demonstrates the area's commitment to craft beer culture.`);
  }

  // Quality insights
  if (averageRating && averageRating > 4.5) {
    insights.push(`With an average rating of ${averageRating.toFixed(1)}/5, this area's breweries consistently deliver exceptional quality.`);
  } else if (averageRating && averageRating > 4.0) {
    insights.push(`Strong average ratings of ${averageRating.toFixed(1)}/5 indicate high customer satisfaction.`);
  }

  // Density insights
  if (count > 15) {
    insights.push(`This density of ${count} breweries creates a vibrant craft beer ecosystem with diverse options for every palate.`);
  } else if (count > 5) {
    insights.push(`These ${count} breweries provide a solid foundation for craft beer exploration and community building.`);
  } else {
    insights.push(`These carefully curated ${count} breweries offer focused, high-quality experiences.`);
  }

  return insights;
}

/**
 * Generate local business impact statements
 */
export function generateLocalBusinessImpact(
  location: string,
  breweryCount: number,
  amenities: string[]
): string {
  const impactAreas = [
    'local agriculture through ingredient sourcing',
    'tourism through brewery tours and events',
    'community engagement through local partnerships',
    'economic development through job creation',
    'cultural preservation through heritage brewing'
  ];

  const selectedImpacts = impactAreas.slice(0, 3);
  const amenityText = amenities.length > 0 
    ? `, particularly those offering ${amenities.slice(0, 2).join(' and ')}`
    : '';

  return `${location}'s ${breweryCount} breweries${amenityText} contribute significantly to local economic development through ${selectedImpacts.join(', ')}. These establishments not only serve exceptional craft beer but also support the broader community by creating jobs, sourcing local ingredients, and hosting events that bring residents and visitors together. The craft beer industry in ${location} represents a growing sector that balances tradition with innovation, contributing to the area's unique character and economic vitality.`;
}

/**
 * Generate seasonal content variations
 */
export function generateSeasonalContent(
  season: 'spring' | 'summer' | 'fall' | 'winter',
  pageType: 'city' | 'county' | 'amenity',
  location: string
): string {
  const seasonalThemes = {
    spring: {
      city: `${location} comes alive in spring with outdoor seating, seasonal releases, and beer garden events.`,
      county: `Spring brings renewed energy to ${location} County's craft beer scene with fresh ingredients and outdoor events.`,
      amenity: `Spring is the perfect time to enjoy ${location.toLowerCase()} with outdoor seating and seasonal beer releases.`
    },
    summer: {
      city: `${location}'s summer craft beer scene features outdoor events, beer gardens, and refreshing seasonal brews.`,
      county: `Summer in ${location} County offers abundant opportunities for outdoor craft beer experiences and festivals.`,
      amenity: `Summer is ideal for enjoying ${location.toLowerCase()} with outdoor seating and outdoor events.`
    },
    fall: {
      city: `${location} celebrates fall with harvest festivals, Oktoberfest events, and seasonal beer releases.`,
      county: `${location} County's fall craft beer scene features harvest celebrations and cozy indoor experiences.`,
      amenity: `Fall is perfect for ${location.toLowerCase()} with harvest events and seasonal beer pairings.`
    },
    winter: {
      city: `${location}'s winter craft beer scene offers cozy indoor experiences, holiday events, and warming seasonal brews.`,
      county: `Winter in ${location} County provides opportunities for intimate craft beer experiences and holiday celebrations.`,
      amenity: `Winter is ideal for ${location.toLowerCase()} with indoor events and holiday-themed experiences.`
    }
  };

  return seasonalThemes[season][pageType] || seasonalThemes[season].city;
}

/**
 * Generate unique page descriptions for SEO
 */
export function generateSEOPageDescription(
  pageType: 'city' | 'county' | 'amenity' | 'type',
  name: string,
  count: number,
  additionalData?: {
    landmarks?: string[];
    amenities?: string[];
    economicImpact?: string;
  }
): string {
  const breweryText = count === 1 ? 'brewery' : 'breweries';
  
  const baseDescriptions = {
    city: `Discover ${count} ${breweryText} in ${name}, Maryland. From historic neighborhoods to modern brewing, explore ${name}'s craft beer scene with detailed brewery information, hours, and amenities.`,
    county: `Explore ${count} ${breweryText} across ${name} County, Maryland. From urban centers to rural communities, discover the diverse craft beer culture that makes ${name} County a destination for beer enthusiasts.`,
    amenity: `Find ${count} Maryland ${breweryText} with ${name.toLowerCase()}. Discover breweries offering ${name.toLowerCase()} amenities for the perfect craft beer experience.`,
    type: `Explore ${count} ${name.toLowerCase()} ${breweryText} in Maryland. From traditional to innovative, discover the best ${name.toLowerCase()} breweries across the state.`
  };

  let description = baseDescriptions[pageType];

  // Add location-specific enhancements
  if (additionalData?.landmarks && additionalData.landmarks.length > 0) {
    const landmarks = additionalData.landmarks.slice(0, 2).join(' and ');
    description += ` Plan your brewery tour around ${landmarks} and other local attractions.`;
  }

  // Add amenity-specific enhancements
  if (additionalData?.amenities && additionalData.amenities.length > 0) {
    const amenities = additionalData.amenities.slice(0, 2).join(' and ');
    description += ` Many breweries offer ${amenities.toLowerCase()} for enhanced experiences.`;
  }

  // Add economic impact
  if (additionalData?.economicImpact) {
    description += ` These breweries contribute to ${additionalData.economicImpact} through local sourcing and community engagement.`;
  }

  return description;
}
