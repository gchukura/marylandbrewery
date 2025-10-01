import dynamic from 'next/dynamic';
import type { Brewery } from '@/types/brewery';

function MapSkeleton() {
  return (
    <div className="w-full h-[500px] bg-gray-200 rounded-lg animate-pulse" />
  );
}

const Map = dynamic(() => import('./BreweryMap'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

interface BreweryMapWrapperProps {
  breweries: Brewery[];
  height?: string;
}

export default function BreweryMapWrapper({ breweries, height }: BreweryMapWrapperProps) {
  return <Map breweries={breweries} height={height} />;
}
