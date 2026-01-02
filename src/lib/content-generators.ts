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
  const landmarksKey = city.toLowerCase().replace(/\s+/g, '_') as keyof typeof MARYLAND_LANDMARKS;
  const landmarks = MARYLAND_LANDMARKS[landmarksKey] || [];
  const landmark = landmarks[Math.floor(Math.random() * landmarks.length)] || 'downtown area';
  
  const cityVariations: Record<string, string[]> = {
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

  const cityKey = city.toLowerCase();
  const variations = cityVariations[cityKey] || [];
  const baseIntro = variations[Math.floor(Math.random() * variations.length)] || 
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
  const countyKey = county as keyof typeof MARYLAND_COUNTIES;
  const countyData = MARYLAND_COUNTIES[countyKey] || {
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
  const amenityKey = amenity as keyof typeof AMENITY_DESCRIPTIONS;
  const amenityData = AMENITY_DESCRIPTIONS[amenityKey] || {
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
  const landmarksKey = city.toLowerCase().replace(/\s+/g, '_') as keyof typeof MARYLAND_LANDMARKS;
  const landmarks = MARYLAND_LANDMARKS[landmarksKey] || [];
  const landmark = landmarks[Math.floor(Math.random() * landmarks.length)] || 'downtown area';
  
  const amenityKey = amenity as keyof typeof AMENITY_DESCRIPTIONS;
  const amenityData = AMENITY_DESCRIPTIONS[amenityKey] || {
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

  const cityKey = city.toLowerCase() as keyof typeof historicalInsights;
  const cityInsights = historicalInsights[cityKey] || [
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
  
  let season: 'spring' | 'summer' | 'fall' | 'winter';
  if (month >= 3 && month <= 5) season = 'spring';
  else if (month >= 6 && month <= 8) season = 'summer';
  else if (month >= 9 && month <= 11) season = 'fall';
  else season = 'winter';
  
  return {
    season,
    ...SEASONAL_CONTENT[season]
  };
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

/**
 * Generate city page content blocks
 */
export function generateCityContentBlocks(
  city: string,
  breweries: Brewery[]
): { title: string; content: string }[] {
  const cityKey = city.toLowerCase().replace(/\s+/g, '_') as keyof typeof MARYLAND_LANDMARKS;
  const landmarks = MARYLAND_LANDMARKS[cityKey] || [];
  
  // Block 1: About City's Brewery Scene
  const historicalContext: Record<string, string> = {
    baltimore: "Baltimore's brewing heritage dates back to the 1800s, when German immigrants established the city as a brewing powerhouse. Today's craft beer renaissance continues this tradition across neighborhoods like Fells Point, Canton, and Federal Hill. The city's brewery scene reflects its industrial heritage, waterfront location, and diverse communities, with everything from historic brewpubs in converted warehouses to modern taprooms in revitalized neighborhoods.",
    annapolis: "Annapolis' craft beer scene blends the city's historic maritime character with modern brewing innovation. As Maryland's capital, the city attracts both locals and visitors seeking quality craft beer experiences. Many breweries incorporate local ingredients and celebrate Chesapeake Bay culture, creating a unique regional identity in Maryland's brewing landscape.",
    frederick: "Frederick's craft beer scene has grown rapidly, transforming the historic downtown into a destination for beer enthusiasts. The city's agricultural roots provide access to fresh, local ingredients, while its location between Baltimore and Washington creates a diverse customer base. Frederick's breweries range from small nano operations to larger production facilities, all contributing to the city's reputation as a craft beer destination."
  };
  
  const block1Content = historicalContext[city.toLowerCase()] || 
    `${city}'s craft beer scene reflects the city's unique character and community spirit. Local breweries have become gathering places that celebrate the area's culture while contributing to economic development and tourism. From traditional brewing methods to innovative techniques, ${city}'s breweries offer diverse experiences for craft beer enthusiasts.`;
  
  // Block 2: Popular Neighborhoods
  const neighborhoods = landmarks.slice(0, 4);
  const neighborhoodCounts = new Map<string, number>();
  breweries.forEach(b => {
    // Simple heuristic - could be improved with actual neighborhood data
    neighborhoods.forEach(neighborhood => {
      if (b.name.toLowerCase().includes(neighborhood.toLowerCase().split(' ')[0])) {
        neighborhoodCounts.set(neighborhood, (neighborhoodCounts.get(neighborhood) || 0) + 1);
      }
    });
  });
  
  let block2Content = '';
  if (neighborhoods.length > 0) {
    block2Content = neighborhoods.slice(0, 3).map(neighborhood => {
      const count = neighborhoodCounts.get(neighborhood) || Math.floor(breweries.length / neighborhoods.length);
      return `${neighborhood} (${count} ${count === 1 ? 'brewery' : 'breweries'}): ${neighborhood.includes('Historic') ? 'Historic district' : 'Vibrant area'} with ${count === 1 ? 'a' : 'multiple'} local ${count === 1 ? 'brewery' : 'breweries'}`;
    }).join('\n\n');
  } else {
    block2Content = `${city} features breweries distributed across various neighborhoods and districts. Each area offers its own character and atmosphere, from downtown locations to suburban settings.`;
  }
  
  // Block 3: Planning Your Visit
  const openCount = breweries.filter(b => b.hours).length;
  const block3Content = `Most ${city} breweries open at 4pm on weekdays and noon on weekends. Plan for 1-2 hours per brewery if doing a tour. ${openCount > 0 ? `${openCount} breweries` : 'Many breweries'} have regular hours posted. Peak times are Friday and Saturday evenings; visit weekday afternoons for quieter experiences.`;
  
  return [
    { title: `About ${city}'s Brewery Scene`, content: block1Content },
    { title: 'Popular Neighborhoods & Districts', content: block2Content },
    { title: 'Planning Your Visit', content: block3Content }
  ];
}

/**
 * Generate county page content blocks
 */
export function generateCountyContentBlocks(
  county: string,
  breweries: Brewery[],
  cities: string[]
): { title: string; content: string }[] {
  const countyKey = county as keyof typeof MARYLAND_COUNTIES;
  const countyData = MARYLAND_COUNTIES[countyKey] || {
    population: 'diverse',
    economic_impact: 'vibrant',
    landmarks: [],
    industries: []
  };
  
  // Block 1: About County's Craft Beer Scene
  const industries = countyData.industries.slice(0, 2).join(' and ');
  const block1Content = `${county} County's craft beer scene reflects the region's ${countyData.economic_impact} economy and ${industries} heritage. With ${breweries.length} breweries across ${cities.length} ${cities.length === 1 ? 'city' : 'cities'}, the county offers diverse brewing experiences from urban taprooms to rural production facilities. These breweries contribute to local economic development while celebrating Maryland's brewing traditions.`;
  
  // Block 2: Cities & Communities
  const cityList = cities.slice(0, 6).map(city => {
    const cityBreweries = breweries.filter(b => b.city === city);
    return `${city} (${cityBreweries.length} ${cityBreweries.length === 1 ? 'brewery' : 'breweries'})`;
  }).join(', ');
  const block2Content = `${county} County's breweries are distributed across ${cities.length} ${cities.length === 1 ? 'city' : 'cities and communities'}: ${cityList}. Each location offers unique characteristics, from historic downtowns to suburban commercial areas, creating a diverse craft beer landscape throughout the county.`;
  
  // Block 3: County Highlights
  const block3Content = `${county} County's breweries benefit from the region's ${countyData.economic_impact} economy and strategic location. Many breweries participate in local events, festivals, and community initiatives, strengthening the connection between craft beer and local culture. The county's ${industries} industries provide both customers and potential partnerships for local breweries.`;
  
  return [
    { title: `About ${county} County's Craft Beer Scene`, content: block1Content },
    { title: 'Cities & Communities', content: block2Content },
    { title: 'County Highlights', content: block3Content }
  ];
}

/**
 * Generate amenity page content blocks
 */
export function generateAmenityContentBlocks(
  amenity: string,
  breweryCount: number,
  percentage: number,
  topCities: { city: string; count: number }[]
): { title: string; content: string }[] {
  const amenityKey = amenity as keyof typeof AMENITY_DESCRIPTIONS;
  const amenityData = AMENITY_DESCRIPTIONS[amenityKey] || {
    value_prop: 'enhanced experience',
    keywords: ['special features']
  };
  
  // Block 1: Why This Amenity Matters
  const block1Content = `${amenity} breweries recognize that craft beer enthusiasts often want ${amenityData.value_prop}. These breweries typically feature ${amenityData.keywords.slice(0, 2).join(' and ')} that enhance the overall experience. With ${percentage}% of Maryland breweries now offering ${amenity.toLowerCase()}, it's easier than ever to find breweries that meet your specific preferences and needs.`;
  
  // Block 2: What to Expect
  const block2Content = `When visiting breweries with ${amenity.toLowerCase()}, you can expect ${amenityData.value_prop}. Most breweries clearly indicate their ${amenity.toLowerCase()} offerings on their websites and social media. It's always a good idea to call ahead or check online for specific details, hours, and any restrictions that may apply.`;
  
  // Block 3: Top Cities
  const topCitiesList = topCities.slice(0, 5).map(({ city, count }) => 
    `${city} (${count} ${count === 1 ? 'brewery' : 'breweries'})`
  ).join(', ');
  const block3Content = `The cities with the most breweries offering ${amenity.toLowerCase()} include: ${topCitiesList}. These areas lead in ${amenity.toLowerCase()} adoption, making them ideal destinations for craft beer enthusiasts seeking this specific amenity.`;
  
  return [
    { title: `Why ${amenity} Matters`, content: block1Content },
    { title: 'What to Expect', content: block2Content },
    { title: `Top Cities for ${amenity}`, content: block3Content }
  ];
}

/**
 * Generate type page content blocks
 */
export function generateTypeContentBlocks(
  type: string,
  breweryCount: number,
  percentage: number,
  topCities: { city: string; count: number }[]
): { title: string; content: string }[] {
  const typeDefinitions: Record<string, string> = {
    microbrewery: "Microbreweries are small, independent breweries that produce limited quantities of beer, typically under 15,000 barrels annually. They focus on quality, creativity, and community connections, often experimenting with unique flavors and brewing techniques.",
    brewpub: "Brewpubs combine brewing operations with full-service restaurants, offering fresh beer alongside quality food. They create a complete dining experience where beer and food are designed to complement each other.",
    taproom: "Taprooms are brewery-owned tasting rooms where customers can sample and purchase beer directly from the source. They often feature a rotating selection of beers and provide an intimate setting to experience the brewery's offerings.",
    production: "Production breweries focus on brewing beer for distribution, often producing larger volumes for retail and wholesale markets. They may have tasting rooms but prioritize brewing and packaging operations.",
    nano: "Nano breweries are the smallest scale operations, typically producing just a few barrels at a time. They emphasize experimentation, local community focus, and often feature the most unique and limited-edition beers."
  };
  
  // Block 1: Understanding the Type
  const block1Content = typeDefinitions[type.toLowerCase()] || 
    `${type} breweries represent a specific category in Maryland's craft beer industry. These breweries follow industry standards and regulations while bringing their unique approach to brewing and serving craft beer.`;
  
  // Block 2: Maryland's Scene
  const topCitiesList = topCities.slice(0, 4).map(({ city, count }) => 
    `${city} (${count})`
  ).join(', ');
  const block2Content = `Maryland has ${breweryCount} ${type.toLowerCase()} breweries, representing ${percentage}% of the state's total breweries. The top cities for ${type.toLowerCase()} breweries include: ${topCitiesList}. These locations showcase the diversity and quality of ${type.toLowerCase()} brewing across Maryland.`;
  
  // Block 3: What Makes It Special
  const block3Content = `${type} breweries offer unique characteristics that set them apart. They typically focus on ${type === 'microbrewery' ? 'small-batch quality and innovation' : type === 'brewpub' ? 'food and beer pairings' : type === 'taproom' ? 'direct customer experience' : type === 'production' ? 'consistent quality and distribution' : 'experimentation and community connection'}, creating distinct experiences for craft beer enthusiasts.`;
  
  return [
    { title: `Understanding ${type.charAt(0).toUpperCase() + type.slice(1)}`, content: block1Content },
    { title: `Maryland's ${type.charAt(0).toUpperCase() + type.slice(1)} Scene`, content: block2Content },
    { title: `What Makes ${type.charAt(0).toUpperCase() + type.slice(1)} Special`, content: block3Content }
  ];
}

/**
 * Generate type-specific "What to Expect" content for brewery detail pages
 */
export function generateWhatToExpect(brewery: {
  name: string;
  type?: string | string[];
  food?: string;
  otherDrinks?: string;
  offersTours?: boolean;
  allowsVisitors?: boolean;
  beerToGo?: boolean;
  hours?: Record<string, string>;
  amenities?: string[];
}): string {
  const typeStr = Array.isArray(brewery.type) 
    ? brewery.type[0]?.toLowerCase() 
    : brewery.type?.toLowerCase() || 'brewery';
  
  let content = '';
  
  if (typeStr.includes('brewpub')) {
    content = `As a brewpub, ${brewery.name} combines craft beer with a full dining experience. `;
    if (brewery.food) {
      content += `The kitchen serves ${brewery.food.toLowerCase()}, `;
    }
    content += `making it perfect for a complete meal paired with house-brewed beers.`;
    if (brewery.otherDrinks) {
      content += ` Non-beer drinkers can enjoy ${brewery.otherDrinks.toLowerCase()}.`;
    }
    
  } else if (typeStr.includes('taproom')) {
    content = `The taproom at ${brewery.name} focuses on the beer experience. `;
    if (brewery.food) {
      content += `${brewery.food} is available on-site`;
    } else {
      content += `Food trucks often visit`;
    }
    content += `, but the star of the show is their craft beer selection.`;
    if (brewery.offersTours) {
      content += ` Tours are available for those interested in seeing the brewing process.`;
    }
    
  } else if (typeStr.includes('micro')) {
    content = `${brewery.name} produces small-batch craft beers with an emphasis on quality and creativity. `;
    if (brewery.allowsVisitors) {
      content += `Visitors can sample their latest creations in the taproom`;
    }
    if (brewery.beerToGo) {
      content += `, and take favorites home via growlers or cans.`;
    } else {
      content += `.`;
    }
    
  } else if (typeStr.includes('nano')) {
    content = `As a nano brewery, ${brewery.name} produces ultra-small batches, making each visit unique. `;
    content += `Availability is limited and beers rotate frequently—call ahead to confirm what's on tap.`;
    
  } else if (typeStr.includes('production') || typeStr.includes('regional')) {
    content = `${brewery.name} is a production brewery crafting beer at scale while maintaining quality. `;
    if (brewery.allowsVisitors) {
      content += `Their taproom welcomes visitors to sample the full lineup.`;
    }
    if (brewery.offersTours) {
      content += ` Brewery tours offer a behind-the-scenes look at the operation.`;
    }
    
  } else {
    // Default/generic
    content = `${brewery.name} welcomes visitors to experience their craft beer offerings. `;
    if (brewery.amenities && brewery.amenities.length > 0) {
      const topAmenities = brewery.amenities.slice(0, 3).join(', ').toLowerCase();
      content += `The space features ${topAmenities}.`;
    }
  }
  
  return content;
}

/**
 * Generate atmosphere/vibe content for brewery detail pages
 */
export function generateAtmosphere(brewery: {
  name: string;
  amenities?: string[];
  outdoorSeating?: boolean;
}): string | null {
  if (!brewery.amenities || brewery.amenities.length === 0) {
    return null;
  }
  
  const amenitiesLower = brewery.amenities.map(a => a.toLowerCase());
  
  const hasGames = amenitiesLower.some(a => 
    a.includes('game') || a.includes('cornhole') || a.includes('dart') || a.includes('pool')
  );
  const hasMusic = amenitiesLower.some(a => a.includes('music'));
  const isFamily = amenitiesLower.some(a => a.includes('family'));
  const isDate = amenitiesLower.some(a => a.includes('date'));
  const hasFirePit = amenitiesLower.some(a => a.includes('fire pit'));
  const hasBeerGarden = amenitiesLower.some(a => a.includes('beer garden') || a.includes('patio'));
  
  // Only generate if we have relevant amenities
  if (!hasGames && !hasMusic && !isFamily && !isDate && !brewery.outdoorSeating) {
    return null;
  }
  
  let content = '';
  
  // Audience type
  if (isFamily && isDate) {
    content += `${brewery.name} is versatile enough for family outings and date nights alike. `;
  } else if (isFamily) {
    content += `A family-friendly destination where all ages are welcome. `;
  } else if (isDate) {
    content += `The relaxed atmosphere makes ${brewery.name} a great spot for date night. `;
  }
  
  // Games
  if (hasGames) {
    const games: string[] = [];
    if (amenitiesLower.some(a => a.includes('cornhole'))) games.push('cornhole');
    if (amenitiesLower.some(a => a.includes('dart'))) games.push('darts');
    if (amenitiesLower.some(a => a.includes('pool'))) games.push('pool');
    if (amenitiesLower.some(a => a === 'games')) games.push('board games');
    
    if (games.length > 0) {
      content += `Games are available, including ${games.join(', ')}. `;
    }
  }
  
  // Music
  if (hasMusic) {
    content += `Live music is featured regularly—follow them on social media for upcoming shows. `;
  }
  
  // Outdoor
  if (brewery.outdoorSeating || hasBeerGarden) {
    content += `The outdoor seating area is popular during warmer months`;
    if (hasFirePit) {
      content += `, and a fire pit keeps things cozy when it cools down`;
    }
    content += `. `;
  }
  
  return content.trim() || null;
}
