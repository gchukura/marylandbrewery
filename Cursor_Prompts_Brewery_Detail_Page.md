# CURSOR PROMPTS: Brewery Detail Page Enhancement
## Maryland Brewery Directory - pSEO Implementation

Use these prompts sequentially in Cursor to implement the enhanced brewery detail page template.

---

# PROMPT 1: Add Computed Values to page.tsx

```
I need to enhance the brewery detail page with computed values for SEO content generation.

In `src/app/breweries/[slug]/page.tsx`, add the following computed values before passing to SimpleBreweryPageTemplate:

1. Calculate `isOpenNow` and `closingTime` based on current day/time and brewery.hours
2. Calculate `nextOpenDay` and `nextOpenTime` if currently closed
3. Calculate `cityAverageRating` - average google_rating of all breweries in the same city
4. Calculate `stateAverageRating` - average google_rating of all breweries
5. Calculate `sameCityCount` - number of breweries in the same city
6. Calculate `sameCountyCount` - number of breweries in the same county
7. Get `currentDayIndex` (1-7 for Monday-Sunday)

Add these to a `computed` object and pass it to SimpleBreweryPageTemplate:

```typescript
// After getting nearbyBreweries, add:

// Calculate city average rating
const sameCityBreweries = processed.breweries.filter(
  b => b.city.toLowerCase() === brewery.city.toLowerCase()
);
const cityRatings = sameCityBreweries
  .filter(b => b.googleRating)
  .map(b => b.googleRating!);
const cityAverageRating = cityRatings.length > 0 
  ? cityRatings.reduce((a, b) => a + b, 0) / cityRatings.length 
  : 0;

// Calculate state average rating
const stateRatings = processed.breweries
  .filter(b => b.googleRating)
  .map(b => b.googleRating!);
const stateAverageRating = stateRatings.length > 0
  ? stateRatings.reduce((a, b) => a + b, 0) / stateRatings.length
  : 0;

// Calculate same county count
const sameCountyCount = processed.breweries.filter(
  b => b.county?.toLowerCase() === brewery.county?.toLowerCase()
).length;

// Get current day info
const now = new Date();
const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const currentDay = days[now.getDay()];
const currentDayIndex = now.getDay() === 0 ? 7 : now.getDay(); // 1-7 Mon-Sun

// Check if open now (simplified - you can enhance this)
const todayHours = brewery.hours?.[currentDay as keyof typeof brewery.hours];
const isOpenNow = todayHours && todayHours !== 'Closed';

const computed = {
  isOpenNow,
  currentDay,
  currentDayIndex,
  cityAverageRating,
  stateAverageRating,
  sameCityCount: sameCityBreweries.length,
  sameCountyCount,
  sameCityBreweries: sameCityBreweries.filter(b => b.id !== brewery.id).slice(0, 5),
};
```

Then update the SimpleBreweryPageTemplate props to accept `computed` and pass it through.
```

---

# PROMPT 2: Enhanced Meta Description Generator

```
Create an enhanced meta description generator function in `src/lib/seo-utils.ts`.

Add this function that generates dynamic, unique meta descriptions based on brewery data:

```typescript
export function generateEnhancedBreweryDescription(brewery: {
  name: string;
  city: string;
  county?: string;
  type?: string | string[];
  description?: string;
  googleRating?: number;
  amenities?: string[];
  offersTours?: boolean;
  dogFriendly?: boolean;
  food?: string;
  outdoorSeating?: boolean;
}): string {
  const parts: string[] = [];
  
  // Opening with name and location
  parts.push(`Visit ${brewery.name} in ${brewery.city}, Maryland.`);
  
  // Type context
  const typeStr = Array.isArray(brewery.type) 
    ? brewery.type[0] 
    : brewery.type || 'brewery';
  
  // Build highlights based on available data
  const highlights: string[] = [];
  
  if (brewery.googleRating && brewery.googleRating >= 4.5) {
    highlights.push(`exceptional ${brewery.googleRating.toFixed(1)}★ rating`);
  } else if (brewery.googleRating && brewery.googleRating >= 4.0) {
    highlights.push(`${brewery.googleRating.toFixed(1)}★ rated`);
  }
  
  if (brewery.food || brewery.amenities?.some(a => a.toLowerCase().includes('food'))) {
    highlights.push('on-site food');
  }
  
  if (brewery.outdoorSeating || brewery.amenities?.some(a => a.toLowerCase().includes('outdoor'))) {
    highlights.push('outdoor seating');
  }
  
  if (brewery.offersTours || brewery.amenities?.some(a => a.toLowerCase().includes('tour'))) {
    highlights.push('brewery tours');
  }
  
  if (brewery.dogFriendly || brewery.amenities?.some(a => a.toLowerCase().includes('dog') || a.toLowerCase().includes('pet'))) {
    highlights.push('dog-friendly');
  }
  
  if (brewery.amenities?.some(a => a.toLowerCase().includes('music'))) {
    highlights.push('live music');
  }
  
  // Add type and highlights
  if (highlights.length > 0) {
    parts.push(`This ${typeStr.toLowerCase()} offers ${highlights.slice(0, 3).join(', ')}.`);
  } else {
    parts.push(`A ${typeStr.toLowerCase()} in ${brewery.county || 'Maryland'} County.`);
  }
  
  // CTA
  parts.push('Hours, directions & beer selection.');
  
  // Join and truncate to 160 chars
  let result = parts.join(' ');
  if (result.length > 160) {
    result = result.substring(0, 157) + '...';
  }
  
  return result;
}
```

Then update `src/app/breweries/[slug]/page.tsx` generateMetadata to use this new function instead of the basic one.
```

---

# PROMPT 3: Type-Specific Content Generator

```
Create a content generator for type-specific "What to Expect" sections in `src/lib/content-generators.ts`.

Add this function:

```typescript
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
```

This function will be called from SimpleBreweryPageTemplate to generate unique content based on brewery type.
```

---

# PROMPT 4: Atmosphere Content Generator

```
Add an atmosphere/vibe content generator to `src/lib/content-generators.ts`:

```typescript
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
```
```

---

# PROMPT 5: Update SimpleBreweryPageTemplate - About Section

```
Update the About section in `src/components/templates/SimpleBreweryPageTemplate.tsx` to include dynamic content.

Find the section that displays the brewery description and enhance it:

```tsx
import { generateWhatToExpect, generateAtmosphere } from '@/lib/content-generators';

// Inside the component, after the description display:

{/* About Section - Enhanced */}
<section className="mt-8">
  <h2 className="text-2xl font-bold text-black mb-4">About {brewery.name}</h2>
  
  {/* Primary Description */}
  {brewery.description ? (
    <p className="text-gray-700 mb-4">{brewery.description}</p>
  ) : (
    <p className="text-gray-700 mb-4">
      {brewery.name} is a {Array.isArray(brewery.type) ? brewery.type.join(' and ').toLowerCase() : (brewery.type || 'brewery').toLowerCase()} located in {brewery.city}, {brewery.county} County, Maryland.
      {brewery.amenities && brewery.amenities.length > 0 && (
        <> Featuring {brewery.amenities.slice(0, 3).join(', ').toLowerCase()}, this local brewery welcomes craft beer enthusiasts.</>
      )}
    </p>
  )}
  
  {/* What to Expect - Type-specific content */}
  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">What to Expect</h3>
  <p className="text-gray-700 mb-4">
    {generateWhatToExpect(brewery)}
  </p>
  
  {/* Atmosphere - Only if relevant amenities exist */}
  {(() => {
    const atmosphere = generateAtmosphere(brewery);
    if (atmosphere) {
      return (
        <>
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">The Atmosphere</h3>
          <p className="text-gray-700 mb-4">{atmosphere}</p>
        </>
      );
    }
    return null;
  })()}
  
  {/* Awards - If available */}
  {brewery.awards && brewery.awards.length > 0 && (
    <>
      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Awards & Recognition</h3>
      <ul className="list-disc list-inside text-gray-700">
        {brewery.awards.map((award, index) => (
          <li key={index}>{award}</li>
        ))}
      </ul>
    </>
  )}
</section>
```

This adds 100-200+ words of unique, type-specific content to each brewery page.
```

---

# PROMPT 6: Enhanced Hours Section with Insights

```
Update the hours table section in `src/components/templates/SimpleBreweryPageTemplate.tsx` to include planning insights:

After the hours table, add:

```tsx
{/* Hours Insights */}
{brewery.hours && (
  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
    <p className="text-sm text-gray-600">
      <strong>Planning tip: </strong>
      {(() => {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const openDays = days.filter(day => {
          const hours = brewery.hours?.[day as keyof typeof brewery.hours];
          return hours && hours !== 'Closed';
        });
        
        const hasWeekend = brewery.hours?.saturday || brewery.hours?.sunday;
        const weekendOnly = !brewery.hours?.monday && !brewery.hours?.tuesday && 
                          !brewery.hours?.wednesday && !brewery.hours?.thursday && 
                          !brewery.hours?.friday && hasWeekend;
        
        if (openDays.length === 7) {
          return "Open 7 days a week—stop by anytime!";
        } else if (weekendOnly) {
          return "Weekend destination. Plan your visit for Saturday or Sunday.";
        } else if (hasWeekend) {
          return "Best visited on weekends when hours are typically longer.";
        } else {
          return "Weekday destination. Check specific hours before visiting.";
        }
      })()}
      {brewery.offersTours && " Brewery tours available—call ahead to schedule."}
    </p>
  </div>
)}
```
```

---

# PROMPT 7: Categorized Amenities Section

```
Create a new component `src/components/brewery/CategorizedAmenities.tsx` for the enhanced amenities display:

```tsx
import Link from 'next/link';
import { slugify } from '@/lib/data-utils';

interface CategorizedAmenitiesProps {
  amenities: string[];
  food?: string;
  otherDrinks?: string;
  offersTours?: boolean;
  hasMerch?: boolean;
  beerToGo?: boolean;
  dogFriendly?: boolean;
  outdoorSeating?: boolean;
  breweryName: string;
  city: string;
  phone?: string;
}

const CATEGORIES = {
  food: ['Food', 'Full Kitchen', 'Food Trucks', 'Snacks', 'Growler Fills', 'Crowler Machine', 'Beer To Go'],
  entertainment: ['Live Music', 'Games', 'TVs', 'Trivia', 'Cornhole', 'Dart Board', 'Pool Table'],
  outdoor: ['Outdoor Seating', 'Beer Garden', 'Patio', 'Fire Pit', 'Heated Patio', 'Covered Patio'],
  accessibility: ['Family Friendly', 'Pet Friendly', 'Dog Friendly', 'Wheelchair Accessible'],
  services: ['Tours', 'Tastings', 'Private Events', 'Merchandise', 'WiFi', 'Parking'],
};

export default function CategorizedAmenities({
  amenities,
  food,
  otherDrinks,
  offersTours,
  hasMerch,
  beerToGo,
  dogFriendly,
  outdoorSeating,
  breweryName,
  city,
  phone,
}: CategorizedAmenitiesProps) {
  const amenitiesLower = amenities.map(a => a.toLowerCase());
  
  const getAmenitiesInCategory = (categoryAmenities: string[]) => {
    return amenities.filter(a => 
      categoryAmenities.some(ca => a.toLowerCase().includes(ca.toLowerCase()))
    );
  };
  
  const foodAmenities = getAmenitiesInCategory(CATEGORIES.food);
  const entertainmentAmenities = getAmenitiesInCategory(CATEGORIES.entertainment);
  const outdoorAmenities = getAmenitiesInCategory(CATEGORIES.outdoor);
  const accessibilityAmenities = getAmenitiesInCategory(CATEGORIES.accessibility);
  const serviceAmenities = getAmenitiesInCategory(CATEGORIES.services);
  
  const citySlug = slugify(city);
  
  return (
    <div className="space-y-6">
      <p className="text-gray-600">
        {breweryName} offers {amenities.length} amenities to enhance your visit:
      </p>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Food & Drink */}
        {(foodAmenities.length > 0 || food || otherDrinks || beerToGo) && (
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">🍔 Food & Drink</h3>
            <ul className="space-y-1 text-sm">
              {food && <li><strong>Kitchen:</strong> {food}</li>}
              {foodAmenities.map(a => (
                <li key={a}>
                  <Link href={`/city/${citySlug}/${slugify(a)}`} className="text-red-600 hover:underline">
                    {a}
                  </Link>
                </li>
              ))}
              {otherDrinks && <li><strong>Also serves:</strong> {otherDrinks}</li>}
            </ul>
          </div>
        )}
        
        {/* Entertainment */}
        {entertainmentAmenities.length > 0 && (
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">🎮 Entertainment</h3>
            <ul className="space-y-1 text-sm">
              {entertainmentAmenities.map(a => (
                <li key={a}>
                  <Link href={`/city/${citySlug}/${slugify(a)}`} className="text-red-600 hover:underline">
                    {a}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Outdoor */}
        {(outdoorAmenities.length > 0 || outdoorSeating) && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">🌳 Outdoor Space</h3>
            <ul className="space-y-1 text-sm">
              {outdoorSeating && !outdoorAmenities.some(a => a.toLowerCase().includes('outdoor')) && (
                <li>
                  <Link href={`/city/${citySlug}/outdoor-seating`} className="text-red-600 hover:underline">
                    Outdoor Seating
                  </Link>
                </li>
              )}
              {outdoorAmenities.map(a => (
                <li key={a}>
                  <Link href={`/city/${citySlug}/${slugify(a)}`} className="text-red-600 hover:underline">
                    {a}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Accessibility */}
        {(accessibilityAmenities.length > 0 || dogFriendly) && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">👨‍👩‍👧 Accessibility</h3>
            <ul className="space-y-1 text-sm">
              {dogFriendly && !accessibilityAmenities.some(a => a.toLowerCase().includes('dog')) && (
                <li>
                  <Link href={`/city/${citySlug}/dog-friendly`} className="text-red-600 hover:underline">
                    Dog Friendly
                  </Link>
                </li>
              )}
              {accessibilityAmenities.map(a => (
                <li key={a}>
                  <Link href={`/city/${citySlug}/${slugify(a)}`} className="text-red-600 hover:underline">
                    {a}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Services */}
        {(serviceAmenities.length > 0 || offersTours || hasMerch) && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">🎯 Services</h3>
            <ul className="space-y-1 text-sm">
              {offersTours && !serviceAmenities.some(a => a.toLowerCase().includes('tour')) && (
                <li>
                  <Link href={`/city/${citySlug}/tours`} className="text-red-600 hover:underline">
                    Brewery Tours
                  </Link>
                </li>
              )}
              {hasMerch && !serviceAmenities.some(a => a.toLowerCase().includes('merch')) && (
                <li>
                  <Link href={`/amenities/merchandise`} className="text-red-600 hover:underline">
                    Merchandise
                  </Link>
                </li>
              )}
              {serviceAmenities.map(a => (
                <li key={a}>
                  <Link href={`/city/${citySlug}/${slugify(a)}`} className="text-red-600 hover:underline">
                    {a}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Special Feature Callouts */}
      {offersTours && (
        <div className="bg-amber-100 border border-amber-300 p-4 rounded-lg">
          <h4 className="font-semibold text-amber-900">🏭 Brewery Tours Available</h4>
          <p className="text-sm text-amber-800 mt-1">
            See how the beer is made! {breweryName} offers tours of their brewing facility.
            {phone ? (
              <> Call <a href={`tel:${phone}`} className="underline">{phone}</a> to schedule.</>
            ) : (
              <> Contact them through their website to book.</>
            )}
          </p>
        </div>
      )}
      
      {beerToGo && (
        <div className="bg-amber-100 border border-amber-300 p-4 rounded-lg">
          <h4 className="font-semibold text-amber-900">🍺 Beer To Go</h4>
          <p className="text-sm text-amber-800 mt-1">
            Take {breweryName}'s craft beer home!
            {amenitiesLower.some(a => a.includes('growler')) && amenitiesLower.some(a => a.includes('crowler'))
              ? ' Growler fills and crowlers available.'
              : amenitiesLower.some(a => a.includes('growler'))
                ? ' Bring your growler or buy one on-site.'
                : amenitiesLower.some(a => a.includes('crowler'))
                  ? ' Fresh-filled 32oz crowlers available.'
                  : ' Cans, bottles, or draft fills available.'}
          </p>
        </div>
      )}
    </div>
  );
}
```

Then update SimpleBreweryPageTemplate to use this component instead of the current amenity icons grid.
```

---

# PROMPT 8: Rating Context Component

```
Create a rating context component `src/components/brewery/RatingContext.tsx`:

```tsx
interface RatingContextProps {
  breweryName: string;
  breweryRating: number;
  reviewCount: number;
  cityName: string;
  cityAverageRating: number;
  stateAverageRating: number;
}

export default function RatingContext({
  breweryName,
  breweryRating,
  reviewCount,
  cityName,
  cityAverageRating,
  stateAverageRating,
}: RatingContextProps) {
  const diffFromCity = breweryRating - cityAverageRating;
  const diffFromState = breweryRating - stateAverageRating;
  
  // Determine badge type
  let badge = null;
  let contextText = null;
  
  if (breweryRating >= 4.5) {
    badge = (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
        Top Rated
      </span>
    );
  } else if (diffFromCity > 0.2) {
    badge = (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
        Above {cityName} Average
      </span>
    );
  }
  
  // Context text
  if (diffFromCity > 0.3) {
    contextText = (
      <p className="text-sm text-gray-600 mt-2">
        {breweryName} is rated <strong>{diffFromCity.toFixed(1)} stars above</strong> the {cityName} average of {cityAverageRating.toFixed(1)}★.
      </p>
    );
  } else if (diffFromState > 0.2) {
    contextText = (
      <p className="text-sm text-gray-600 mt-2">
        Above the Maryland brewery average of {stateAverageRating.toFixed(1)}★.
      </p>
    );
  }
  
  return (
    <div className="rating-context">
      <div className="flex items-center">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={`text-xl ${i < Math.round(breweryRating) ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              ★
            </span>
          ))}
        </div>
        <span className="ml-2 text-lg font-semibold">{breweryRating.toFixed(1)}</span>
        <span className="ml-1 text-gray-500">({reviewCount} reviews)</span>
        {badge}
      </div>
      {contextText}
    </div>
  );
}
```

Use this in the hero section of SimpleBreweryPageTemplate where the rating is displayed.
```

---

# PROMPT 9: Enhanced Related Links Section

```
Update the related pages section in `src/components/templates/SimpleBreweryPageTemplate.tsx` to have categorized internal links:

```tsx
{/* Related Links Section - Enhanced */}
<section className="mt-12 pt-8 border-t border-gray-200">
  <h2 className="text-2xl font-bold text-black mb-6">Explore More</h2>
  
  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
    {/* By Location */}
    <div>
      <h3 className="font-semibold text-gray-900 mb-3">By Location</h3>
      <ul className="space-y-2 text-sm">
        <li>
          <Link href={`/city/${slugify(brewery.city)}/breweries`} className="text-red-600 hover:underline">
            All {brewery.city} Breweries
            {computed?.sameCityCount && <span className="text-gray-500 ml-1">({computed.sameCityCount})</span>}
          </Link>
        </li>
        <li>
          <Link href={`/county/${slugify(brewery.county)}/breweries`} className="text-red-600 hover:underline">
            {brewery.county} County Breweries
            {computed?.sameCountyCount && <span className="text-gray-500 ml-1">({computed.sameCountyCount})</span>}
          </Link>
        </li>
        <li>
          <Link href="/map" className="text-red-600 hover:underline">
            Interactive Brewery Map
          </Link>
        </li>
      </ul>
    </div>
    
    {/* By Amenity */}
    {brewery.amenities && brewery.amenities.length > 0 && (
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">By Amenity</h3>
        <ul className="space-y-2 text-sm">
          {brewery.amenities.slice(0, 4).map(amenity => (
            <li key={amenity}>
              <Link 
                href={`/city/${slugify(brewery.city)}/${slugify(amenity)}`} 
                className="text-red-600 hover:underline"
              >
                {amenity} in {brewery.city}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    )}
    
    {/* By Type */}
    <div>
      <h3 className="font-semibold text-gray-900 mb-3">By Type</h3>
      <ul className="space-y-2 text-sm">
        {(Array.isArray(brewery.type) ? brewery.type : [brewery.type]).filter(Boolean).map(t => (
          <li key={t}>
            <Link href={`/type/${slugify(t)}`} className="text-red-600 hover:underline">
              Maryland {t} Breweries
            </Link>
          </li>
        ))}
        <li>
          <Link href="/open-now" className="text-red-600 hover:underline">
            Open Now
          </Link>
        </li>
      </ul>
    </div>
    
    {/* More in City */}
    {computed?.sameCityBreweries && computed.sameCityBreweries.length > 0 && (
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">More in {brewery.city}</h3>
        <ul className="space-y-2 text-sm">
          {computed.sameCityBreweries.slice(0, 4).map(b => (
            <li key={b.id} className="flex items-center justify-between">
              <Link href={`/breweries/${b.slug}`} className="text-red-600 hover:underline">
                {b.name}
              </Link>
              {b.googleRating && (
                <span className="text-gray-500 text-xs">{b.googleRating.toFixed(1)}★</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
</section>
```

This creates 15-20 internal links per page with proper anchor text for SEO.
```

---

# PROMPT 10: Enhanced Structured Data

```
Update the structured data in `src/components/templates/SimpleBreweryPageTemplate.tsx` to include all available data:

```tsx
// Generate comprehensive structured data
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Brewery',
  '@id': `https://www.marylandbrewery.com/breweries/${brewery.slug}#brewery`,
  name: brewery.name,
  description: brewery.description || `${brewery.type || 'Brewery'} in ${brewery.city}, ${brewery.county} County, Maryland.`,
  url: `https://www.marylandbrewery.com/breweries/${brewery.slug}`,
  ...(brewery.logo && { image: brewery.logo }),
  ...(brewery.phone && { telephone: brewery.phone }),
  ...(brewery.website && { 
    sameAs: [
      brewery.website,
      brewery.socialMedia?.facebook,
      brewery.socialMedia?.instagram,
      brewery.socialMedia?.twitter,
    ].filter(Boolean)
  }),
  priceRange: '$$',
  servesCuisine: 'Craft Beer',
  address: {
    '@type': 'PostalAddress',
    streetAddress: brewery.street,
    addressLocality: brewery.city,
    addressRegion: brewery.state,
    postalCode: brewery.zip,
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: brewery.latitude,
    longitude: brewery.longitude,
  },
  ...(brewery.hours && {
    openingHoursSpecification: Object.entries(brewery.hours)
      .filter(([_, hours]) => hours && hours !== 'Closed')
      .map(([day, hours]) => {
        const daysMap: Record<string, string> = {
          monday: 'Monday',
          tuesday: 'Tuesday',
          wednesday: 'Wednesday',
          thursday: 'Thursday',
          friday: 'Friday',
          saturday: 'Saturday',
          sunday: 'Sunday',
        };
        const [opens, closes] = (hours as string).split('-').map(s => s.trim());
        return {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: daysMap[day],
          opens,
          closes: closes || opens,
        };
      }),
  }),
  ...(brewery.googleRating && {
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: brewery.googleRating.toString(),
      reviewCount: brewery.googleRatingCount?.toString() || '0',
      bestRating: '5',
      worstRating: '1',
    },
  }),
  ...(brewery.amenities && brewery.amenities.length > 0 && {
    amenityFeature: brewery.amenities.map(amenity => ({
      '@type': 'LocationFeatureSpecification',
      name: amenity,
      value: true,
    })),
  }),
};

// Breadcrumb structured data
const breadcrumbData = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://www.marylandbrewery.com',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Cities',
      item: 'https://www.marylandbrewery.com/city',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: brewery.city,
      item: `https://www.marylandbrewery.com/city/${slugify(brewery.city)}/breweries`,
    },
    {
      '@type': 'ListItem',
      position: 4,
      name: brewery.name,
    },
  ],
};

// In the return statement, add both:
<>
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
  />
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
  />
  {/* Rest of component */}
</>
```
```

---

# PROMPT 11: Final Integration Check

```
Review the SimpleBreweryPageTemplate.tsx file and ensure all the following are integrated:

1. ✅ Import statements for new components and functions:
   - generateWhatToExpect from '@/lib/content-generators'
   - generateAtmosphere from '@/lib/content-generators'
   - CategorizedAmenities from '@/components/brewery/CategorizedAmenities'
   - RatingContext from '@/components/brewery/RatingContext'

2. ✅ Props interface updated to include `computed` object:
   ```typescript
   interface SimpleBreweryPageTemplateProps {
     brewery: Brewery;
     nearbyBreweries: Brewery[];
     title: string;
     metaDescription: string;
     breadcrumbs: any[];
     relatedPages: any[];
     computed?: {
       isOpenNow: boolean;
       currentDay: string;
       currentDayIndex: number;
       cityAverageRating: number;
       stateAverageRating: number;
       sameCityCount: number;
       sameCountyCount: number;
       sameCityBreweries: Brewery[];
     };
   }
   ```

3. ✅ Hero section uses RatingContext component

4. ✅ About section includes:
   - Primary description (or generated fallback)
   - "What to Expect" subsection
   - "The Atmosphere" subsection (conditional)
   - Awards (conditional)

5. ✅ Hours section includes planning insights

6. ✅ Amenities section uses CategorizedAmenities component

7. ✅ Related links section has 4-column layout with categories

8. ✅ Structured data includes both Brewery and BreadcrumbList schemas

9. ✅ All internal links use correct URL patterns:
   - /city/[city]/breweries
   - /county/[county]/breweries
   - /city/[city]/[amenity]
   - /type/[type]
   - /amenities/[amenity]

Run a build to check for any TypeScript errors: `npm run build`
```

---

# SUMMARY

These 11 prompts will implement:

| Feature | SEO Benefit |
|---------|-------------|
| Enhanced meta descriptions | Higher CTR in search results |
| Type-specific "What to Expect" | 100-200 unique words per page |
| Atmosphere section | Additional unique content |
| Hours insights | User value + content |
| Categorized amenities | Better UX + internal links |
| Rating context | Trust signals + social proof |
| Enhanced related links | 15-20 internal links per page |
| Full structured data | Rich results eligibility |

**Estimated content increase per page:** 300-500 words of unique, dynamic content
**Internal links added per page:** 15-25 contextual links
