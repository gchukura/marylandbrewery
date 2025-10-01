/**
 * Content Generators for Dynamic Page Content
 * Creates unique, SEO-optimized content for 500+ programmatic pages
 */

import { Brewery } from '@/types/brewery';

// Maryland-specific data for content generation
const MARYLAND_LANDMARKS = {
  baltimore: [
    'Inner Harbor', 'Fells Point', 'Canton', 'Federal Hill', 'Mount Vernon',
    'Hampden', 'Charles Village', 'Patterson Park', 'Druid Hill Park'
  ],
  annapolis: [
    'Historic Downtown', 'State House', 'City Dock', 'West Street',
    'Eastport', 'Naval Academy'
  ],
  frederick: [
    'Historic Downtown', 'Carroll Creek', 'Baker Park', 'Schifferstadt',
    'Rose Hill Manor', 'Catoctin Mountains'
  ],
  rockville: [
    'Town Square', 'Rockville Town Center', 'Twinbrook', 'King Farm',
    'Pike & Rose', 'Rockville Pike'
  ],
  gaithersburg: [
    'Kentlands', 'Rio', 'Crown', 'Olde Towne', 'Quince Orchard'
  ],
  columbia: [
    'Town Center', 'Lake Kittamaqundi', 'Merriweather Post Pavilion',
    'Symphony Woods', 'Wilde Lake'
  ],
  silver_spring: [
    'Downtown Silver Spring', 'AFI Silver Theatre', 'Discovery Building',
    'Long Branch', 'Takoma Park'
  ],
  towson: [
    'Towson Town Center', 'Goucher College', 'Towson University',
    'Hampton National Historic Site'
  ]
};

const MARYLAND_COUNTIES = {
  'Baltimore City': {
    population: '575,000',
    economic_impact: 'major urban center',
    landmarks: ['Inner Harbor', 'Camden Yards', 'Fort McHenry'],
    industries: ['tourism', 'healthcare', 'finance', 'technology']
  },
  'Anne Arundel': {
    population: '588,000',
    economic_impact: 'state capital region',
    landmarks: ['Annapolis Historic District', 'Naval Academy', 'Chesapeake Bay'],
    industries: ['government', 'defense', 'maritime', 'tourism']
  },
  'Montgomery': {
    population: '1,062,000',
    economic_impact: 'biotech and government hub',
    landmarks: ['NIH', 'Bethesda', 'Rockville', 'Silver Spring'],
    industries: ['biotechnology', 'government', 'technology', 'healthcare']
  },
  'Prince George\'s': {
    population: '967,000',
    economic_impact: 'diverse economic base',
    landmarks: ['University of Maryland', 'National Harbor', 'FedEx Field'],
    industries: ['education', 'government', 'retail', 'hospitality']
  },
  'Howard': {
    population: '332,000',
    economic_impact: 'planned community excellence',
    landmarks: ['Columbia', 'Merriweather Post Pavilion', 'Savage Mill'],
    industries: ['technology', 'education', 'healthcare', 'retail']
  },
  'Frederick': {
    population: '271,000',
    economic_impact: 'historic and agricultural center',
    landmarks: ['Historic Downtown', 'Catoctin Mountains', 'Antietam'],
    industries: ['agriculture', 'tourism', 'manufacturing', 'healthcare']
  },
  'Baltimore County': {
    population: '828,000',
    economic_impact: 'suburban economic powerhouse',
    landmarks: ['Towson', 'Hampton National Historic Site', 'Loch Raven'],
    industries: ['healthcare', 'education', 'retail', 'manufacturing']
  },
  'Carroll': {
    population: '172,000',
    economic_impact: 'rural and agricultural',
    landmarks: ['Westminster', 'Sykesville', 'Liberty Reservoir'],
    industries: ['agriculture', 'manufacturing', 'tourism', 'retail']
  },
  'Harford': {
    population: '260,000',
    economic_impact: 'industrial and defense',
    landmarks: ['Aberdeen Proving Ground', 'Havre de Grace', 'Conowingo Dam'],
    industries: ['defense', 'manufacturing', 'tourism', 'agriculture']
  },
  'Cecil': {
    population: '103,000',
    economic_impact: 'Chesapeake Bay gateway',
    landmarks: ['Elkton', 'North East', 'Chesapeake Bay'],
    industries: ['tourism', 'agriculture', 'manufacturing', 'maritime']
  }
};

const SEASONAL_CONTENT = {
  spring: {
    themes: ['patio season', 'outdoor dining', 'spring festivals', 'fresh ingredients'],
    activities: ['outdoor seating', 'beer gardens', 'spring releases', 'patio parties']
  },
  summer: {
    themes: ['summer festivals', 'outdoor events', 'refreshing brews', 'vacation season'],
    activities: ['beer gardens', 'outdoor concerts', 'summer releases', 'patio dining']
  },
  fall: {
    themes: ['harvest season', 'Oktoberfest', 'pumpkin beers', 'fall festivals'],
    activities: ['harvest celebrations', 'Oktoberfest events', 'fall releases', 'cozy indoor seating']
  },
  winter: {
    themes: ['holiday celebrations', 'winter warmers', 'indoor events', 'holiday markets'],
    activities: ['holiday parties', 'winter releases', 'indoor dining', 'special events']
  }
};

const AMENITY_DESCRIPTIONS = {
  'Food': {
    value_prop: 'Complete dining experience with craft beer pairings',
    keywords: ['brewpub', 'gastropub', 'craft food', 'beer and food pairing']
  },
  'Outdoor Seating': {
    value_prop: 'Enjoy fresh air while sampling local brews',
    keywords: ['patio', 'beer garden', 'outdoor dining', 'al fresco']
  },
  'Live Music': {
    value_prop: 'Entertainment and craft beer in one venue',
    keywords: ['live entertainment', 'music venue', 'concerts', 'entertainment']
  },
  'Tours': {
    value_prop: 'Behind-the-scenes brewery experience',
    keywords: ['brewery tours', 'educational', 'behind the scenes', 'brewing process']
  },
  'Pet Friendly': {
    value_prop: 'Bring your furry friends along',
    keywords: ['dog friendly', 'pet friendly', 'family friendly', 'pets welcome']
  },
  'WiFi': {
    value_prop: 'Work remotely while enjoying craft beer',
    keywords: ['remote work', 'WiFi', 'laptop friendly', 'work space']
  },
  'Parking': {
    value_prop: 'Convenient access with dedicated parking',
    keywords: ['free parking', 'parking available', 'easy access', 'convenient']
  },
  'Private Events': {
    value_prop: 'Host special occasions in a unique setting',
    keywords: ['private parties', 'event space', 'special occasions', 'group events']
  }
};

/**
 * Generate unique intro text for city pages
 */
export function generateCityIntroText(
  city: string,
  breweryCount: number,
  stats: { totalBreweries: number; totalCounties: number; totalTypes: number }
): string {
  const cityKey = city.toLowerCase().replace(/\s+/g, '_') as keyof typeof MARYLAND_LANDMARKS;
  const landmarks = MARYLAND_LANDMARKS[cityKey] || [];
  const landmark = landmarks[Math.floor(Math.random() * landmarks.length)] || 'downtown area';
  
  const cityVariations = {
    baltimore: [
      `Discover Baltimore's thriving craft beer scene in the heart of Maryland's largest city.`,
      `Explore Baltimore's historic neighborhoods through their local breweries and craft beer culture.`,
      `From the Inner Harbor to Fells Point, Baltimore's brewery scene reflects the city's rich history and vibrant present.`
    ],
    annapolis: [
      `Experience Annapolis' maritime heritage through its growing craft beer community.`,
      `Discover how Maryland's capital city blends historic charm with modern craft brewing.`,
      `From the State House to City Dock, Annapolis breweries offer a taste of Chesapeake Bay culture.`
    ],
    frederick: [
      `Explore Frederick's historic downtown through its innovative craft beer scene.`,
      `Discover how Maryland's second-largest city balances history with cutting-edge brewing.`,
      `From Carroll Creek to the Catoctin Mountains, Frederick's breweries showcase local character.`
    ]
  };

  const baseIntro = cityVariations[city.toLowerCase()]?.[Math.floor(Math.random() * cityVariations[city.toLowerCase()]?.length || 1)] || 
    `Discover ${city}'s vibrant craft beer scene and local brewing culture.`;

  const breweryText = breweryCount === 1 
    ? '1 exceptional brewery' 
    : `${breweryCount} outstanding breweries`;

  const landmarkText = landmark ? ` near ${landmark}` : '';

  return `${baseIntro} With ${breweryText}${landmarkText}, ${city} offers craft beer enthusiasts a diverse range of brewing styles and experiences. Whether you're a local resident or visiting Maryland, these breweries showcase the unique character and community spirit that makes ${city} a must-visit destination for craft beer lovers.`;
}

/**
 * Generate county-specific intro text
 */
export function generateCountyIntroText(
  county: string,
  breweryCount: number,
  stats: { totalBreweries: number; totalCounties: number; totalTypes: number }
): string {
  const countyData = MARYLAND_COUNTIES[county] || {
    population: 'diverse',
    economic_impact: 'vibrant',
    landmarks: [],
    industries: []
  };

  const economicImpact = countyData.economic_impact;
  const population = countyData.population;
  const industries = countyData.industries.slice(0, 2).join(' and ');

  const breweryText = breweryCount === 1 
    ? '1 exceptional brewery' 
    : `${breweryCount} outstanding breweries`;

  return `${county} County, home to ${population} residents and a ${economicImpact} economy, boasts ${breweryText} that reflect the region's ${industries} heritage. These breweries not only serve exceptional craft beer but also contribute to the local economy and community fabric. From traditional brewing methods to innovative techniques, ${county} County's breweries offer a diverse range of experiences that showcase Maryland's rich brewing tradition and entrepreneurial spirit.`;
}

/**
 * Generate amenity-focused intro text
 */
export function generateAmenityIntroText(
  amenity: string,
  breweryCount: number,
  percentage: number
): string {
  const amenityData = AMENITY_DESCRIPTIONS[amenity] || {
    value_prop: 'enhanced experience',
    keywords: ['special features']
  };

  const breweryText = breweryCount === 1 
    ? '1 brewery' 
    : `${breweryCount} breweries`;

  const percentageText = percentage > 50 
    ? 'most' 
    : percentage > 25 
    ? 'many' 
    : 'several';

  return `Discover ${breweryText} in Maryland that offer ${amenity.toLowerCase()}, providing ${amenityData.value_prop}. With ${percentageText} of Maryland's breweries featuring this amenity, you'll find ${amenity.toLowerCase()} options that enhance your craft beer experience. Whether you're looking for ${amenityData.keywords.join(', ')}, these breweries deliver exceptional value and memorable experiences for craft beer enthusiasts.`;
}

/**
 * Generate combination page content (city + amenity)
 */
export function generateComboIntroText(
  city: string,
  amenity: string,
  count: number
): string {
  const landmarks = MARYLAND_LANDMARKS[city.toLowerCase().replace(/\s+/g, '_')] || [];
  const landmark = landmarks[Math.floor(Math.random() * landmarks.length)] || 'downtown area';
  
  const amenityData = AMENITY_DESCRIPTIONS[amenity] || {
    value_prop: 'enhanced experience',
    keywords: ['special features']
  };

  const breweryText = count === 1 
    ? '1 brewery' 
    : `${count} breweries`;

  return `Experience the perfect combination of ${city}'s vibrant craft beer scene and ${amenity.toLowerCase()} amenities. With ${breweryText} offering ${amenity.toLowerCase()} near ${landmark}, you can enjoy ${amenityData.value_prop} while exploring ${city}'s unique character. These breweries provide ${amenityData.keywords.join(', ')} that make your visit to ${city} both memorable and satisfying.`;
}

/**
 * Generate local insights and context
 */
export function generateLocalInsights(
  city: string,
  amenity: string,
  breweries: Brewery[]
): string[] {
  const insights: string[] = [];
  
  // Historical context
  const historicalInsights = {
    baltimore: [
      "Baltimore's brewing history dates back to the 1800s when German immigrants established the city's first breweries.",
      "The city's industrial heritage and port access made it a natural hub for brewing and distribution.",
      "Today's craft breweries continue Baltimore's tradition of innovation and community-focused brewing."
    ],
    annapolis: [
      "Annapolis' maritime heritage influences its brewing culture, with many breweries incorporating local ingredients.",
      "The city's historic charm provides a unique backdrop for modern craft brewing experiences.",
      "Naval Academy traditions and Chesapeake Bay culture inspire many local brewing innovations."
    ],
    frederick: [
      "Frederick's agricultural roots provide access to fresh, local ingredients for innovative brewing.",
      "The city's historic downtown offers a charming setting for craft beer exploration.",
      "Frederick's location between Baltimore and Washington creates a diverse customer base for local breweries."
    ]
  };

  const cityInsights = historicalInsights[city.toLowerCase()] || [
    `${city}'s unique character and community spirit are reflected in its local breweries.`,
    `The city's location and demographics create opportunities for diverse brewing styles.`,
    `Local breweries contribute to ${city}'s economic development and community identity.`
  ];

  insights.push(cityInsights[Math.floor(Math.random() * cityInsights.length)]);

  // Amenity-specific insights
  if (amenity === 'Food') {
    insights.push("Many breweries partner with local restaurants and food trucks to offer diverse dining options.");
  } else if (amenity === 'Outdoor Seating') {
    insights.push("Maryland's seasonal weather makes outdoor seating particularly popular during spring and fall.");
  } else if (amenity === 'Live Music') {
    insights.push("Local breweries often feature regional artists, supporting the area's music scene.");
  }

  // Economic impact
  insights.push(`These breweries contribute to ${city}'s local economy through job creation, tourism, and community events.`);

  return insights;
}

/**
 * Get seasonal content based on current date
 */
export function getSeasonalInfo(): { season: string; themes: string[]; activities: string[] } {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  
  let season: string;
  if (month >= 3 && month <= 5) season = 'spring';
  else if (month >= 6 && month <= 8) season = 'summer';
  else if (month >= 9 && month <= 11) season = 'fall';
  else season = 'winter';
  
  return SEASONAL_CONTENT[season];
}

/**
 * Generate dynamic meta descriptions
 */
export function generateMetaDescription(
  pageType: 'city' | 'county' | 'amenity' | 'type' | 'brewery',
  data: {
    name: string;
    count: number;
    amenities?: string[];
    city?: string;
    county?: string;
  }
): string {
  const { name, count, amenities = [], city, county } = data;
  
  const breweryText = count === 1 ? 'brewery' : 'breweries';
  
  switch (pageType) {
    case 'city':
      return `Discover ${count} ${breweryText} in ${name}, Maryland. Find craft breweries, brewpubs, and taprooms with detailed information, hours, and amenities. Plan your ${name} brewery tour today.`;
    
    case 'county':
      return `Explore ${count} ${breweryText} in ${name} County, Maryland. From historic downtowns to scenic countryside, discover the best craft breweries across ${name} County.`;
    
    case 'amenity':
      return `Find ${count} Maryland ${breweryText} with ${name.toLowerCase()}. Discover breweries offering ${name.toLowerCase()} amenities for the perfect craft beer experience.`;
    
    case 'type':
      return `Explore ${count} ${name.toLowerCase()} ${breweryText} in Maryland. From traditional to innovative, discover the best ${name.toLowerCase()} breweries across the state.`;
    
    case 'brewery':
      return `Visit ${name} in ${city || county || 'Maryland'}. Enjoy craft beer, ${amenities.slice(0, 2).join(' and ').toLowerCase()}, and more. Find hours, location, and amenities at this Maryland brewery.`;
    
    default:
      return `Discover ${count} ${breweryText} in Maryland. Find craft breweries, brewpubs, and taprooms with detailed information and amenities.`;
  }
}

/**
 * Generate statistical insights for page content
 */
export function generateStatisticalInsights(
  pageType: string,
  data: { count: number; total: number; percentage?: number }
): string[] {
  const { count, total, percentage } = data;
  const insights: string[] = [];
  
  if (percentage && percentage > 50) {
    insights.push(`This represents ${percentage.toFixed(1)}% of Maryland's total breweries, making it a significant concentration.`);
  }
  
  if (count > 10) {
    insights.push(`With ${count} breweries, this area offers one of Maryland's most diverse craft beer scenes.`);
  } else if (count > 5) {
    insights.push(`This area's ${count} breweries provide a solid foundation for craft beer exploration.`);
  } else {
    insights.push(`These ${count} breweries offer a focused, high-quality craft beer experience.`);
  }
  
  if (percentage && percentage < 20) {
    insights.push(`This represents a growing but emerging craft beer scene in Maryland.`);
  }
  
  return insights;
}

/**
 * Generate unique page titles
 */
export function generatePageTitle(
  pageType: 'city' | 'county' | 'amenity' | 'type',
  name: string,
  count: number
): string {
  const breweryText = count === 1 ? 'Brewery' : 'Breweries';
  
  const titleVariations = {
    city: [
      `${name} ${breweryText} | Maryland Brewery Directory`,
      `Best ${breweryText} in ${name}, MD | Maryland Brewery Guide`,
      `${name} Craft Beer Scene | ${count} ${breweryText} | Maryland`
    ],
    county: [
      `${name} County ${breweryText} | Maryland Brewery Directory`,
      `Best ${breweryText} in ${name} County, MD | Complete Guide`,
      `${name} County Craft Beer | ${count} ${breweryText} | Maryland`
    ],
    amenity: [
      `Maryland ${breweryText} with ${name} | Complete Guide`,
      `Best ${breweryText} with ${name} in Maryland | Directory`,
      `${name} ${breweryText} in Maryland | ${count} Options`
    ],
    type: [
      `${name} ${breweryText} in Maryland | Complete Directory`,
      `Best ${name} ${breweryText} in Maryland | Guide`,
      `Maryland ${name} ${breweryText} | ${count} Options`
    ]
  };
  
  const variations = titleVariations[pageType] || titleVariations.city;
  return variations[Math.floor(Math.random() * variations.length)];
}
