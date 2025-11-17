import { notFound } from 'next/navigation';
import { getProcessedBreweryData, getNearbyBreweries } from '../../../../lib/brewery-data';
import { deslugify } from '../../../../lib/utils';
import SimpleBreweryPageTemplate from '@/components/templates/SimpleBreweryPageTemplate';

interface BreweryPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const processed = await getProcessedBreweryData();
  
  return processed.breweries.map((brewery) => ({
    slug: (brewery as any).slug || brewery.id,
  }));
}

export async function generateMetadata({ params }: BreweryPageProps) {
  const processed = await getProcessedBreweryData();
  const brewery = processed.breweries.find(
    (b) => (b as any).slug === params.slug || b.id === params.slug
  );

  if (!brewery) {
    return {
      title: 'Brewery Not Found',
      description: 'The requested brewery could not be found.',
    };
  }

  const title = `${brewery.name} - ${brewery.city}, MD | Maryland Brewery Directory`;
  const description = `${brewery.name} in ${brewery.city}, Maryland. ${brewery.description || `Discover this ${(brewery as any).type || 'brewery'} in the Old Line State.`}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/breweries/${params.slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://marylandbrewery.com/breweries/${params.slug}`,
      siteName: 'Maryland Brewery Directory',
      images: [
        {
          url: `https://marylandbrewery.com/api/og?title=${encodeURIComponent(brewery.name)}&location=${encodeURIComponent(brewery.city)}`,
          width: 1200,
          height: 630,
          alt: `${brewery.name} - Maryland Brewery`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`https://marylandbrewery.com/api/og?title=${encodeURIComponent(brewery.name)}&location=${encodeURIComponent(brewery.city)}`],
    },
  };
}

export default async function BreweryPage({ params }: BreweryPageProps) {
  const processed = await getProcessedBreweryData();
  const brewery = processed.breweries.find(
    (b) => (b as any).slug === params.slug || b.id === params.slug
  );

  if (!brewery) {
    console.log(`Brewery not found for slug: ${params.slug}`);
    console.log('Available slugs:', processed.breweries.slice(0, 10).map(b => ({
      slug: (b as any).slug || b.id,
      name: b.name
    })));
    
    // Try to find by name if slug doesn't match
    const breweryByName = processed.breweries.find(b => 
      b.name.toLowerCase().includes('1623') || 
      b.name.toLowerCase().includes('brewing company')
    );
    
    if (breweryByName) {
      console.log('Found brewery by name:', breweryByName.name, 'with slug:', (breweryByName as any).slug || breweryByName.id);
    }
    
    notFound();
  }

  // Debug: Log visitor information fields
  console.log('=== BREWERY VISITOR INFORMATION DEBUG ===');
  console.log('Brewery:', brewery.name);
  console.log('allowsVisitors:', brewery.allowsVisitors);
  console.log('offersTours:', brewery.offersTours);
  console.log('beerToGo:', brewery.beerToGo);
  console.log('hasMerch:', brewery.hasMerch);
  console.log('food:', brewery.food);
  console.log('otherDrinks:', brewery.otherDrinks);
  console.log('parking:', brewery.parking);
  console.log('dogFriendly:', brewery.dogFriendly);
  console.log('outdoorSeating:', brewery.outdoorSeating);
  
  // Debug: Check if brewery has raw data
  console.log('=== CHECKING FOR RAW DATA ===');
  console.log('Brewery has rawData:', !!(brewery as any).rawData);
  console.log('Brewery keys:', Object.keys(brewery));
  
  if ((brewery as any).rawData) {
    console.log('=== RAW GOOGLE SHEETS DATA ===');
    console.log('Raw food:', (brewery as any).rawData.food);
    console.log('Raw other_drinks:', (brewery as any).rawData['other_drinks']);
    console.log('Raw parking:', (brewery as any).rawData.parking);
    console.log('Raw dog_friendly:', (brewery as any).rawData.dog_friendly);
    console.log('Raw outdoor_seating:', (brewery as any).rawData.outdoor_seating);
    
    // Debug: Show all available column names
    console.log('=== ALL AVAILABLE COLUMNS ===');
    const allColumns = Object.keys((brewery as any).rawData);
    console.log('Available columns:', allColumns);
    
    // Check for variations of the column names
    const foodVariations = allColumns.filter(col => col.toLowerCase().includes('food'));
    const drinkVariations = allColumns.filter(col => col.toLowerCase().includes('drink'));
    const parkingVariations = allColumns.filter(col => col.toLowerCase().includes('park'));
    
    console.log('Food variations:', foodVariations);
    console.log('Drink variations:', drinkVariations);
    console.log('Parking variations:', parkingVariations);
  } else {
    console.log('=== NO RAW DATA FOUND ===');
    console.log('This means the raw Google Sheets data is not being passed through to the component.');
  }

  // Validate required fields
  if (!brewery.name || !brewery.city) {
    console.error('Brewery missing required fields:', {
      name: brewery.name,
      city: brewery.city,
      id: brewery.id
    });
    notFound();
  }

  // Get nearby breweries (within 10 miles)
  const nearbyBreweries = await getNearbyBreweries(brewery.latitude, brewery.longitude, 10);

  // Generate breadcrumbs
  const breadcrumbs = [
    { name: 'Home', url: '/', position: 1, isActive: false },
    { name: 'Breweries', url: '/breweries', position: 2, isActive: false },
    { name: brewery.name, url: `/breweries/${params.slug}`, position: 3, isActive: true },
  ];

  // Generate related pages
  const relatedPages = [
    { title: `${brewery.city} Breweries`, url: `/city/${(brewery as any).citySlug || brewery.city.toLowerCase().replace(/\s+/g, '-')}/breweries`, type: 'city' },
    { title: 'All Breweries', url: '/breweries', type: 'general' },
    { title: 'Interactive Map', url: '/map', type: 'general' },
  ];

  const title = `${brewery.name} - ${brewery.city}, MD`;
  const metaDescription = `${brewery.name} in ${brewery.city}, Maryland. ${brewery.description || `Discover this ${(brewery as any).type || 'brewery'} in the Old Line State.`}`;

  return (
    <SimpleBreweryPageTemplate
      brewery={brewery as any}
      nearbyBreweries={nearbyBreweries as any}
      title={title}
      metaDescription={metaDescription}
      breadcrumbs={breadcrumbs as any}
      relatedPages={relatedPages as any}
    />
  );
}
