import Link from 'next/link';
import { 
  Dog, Utensils, Music, Compass, Wifi, Car, 
  Users, Sun, Baby, PartyPopper, GlassWater 
} from 'lucide-react';

interface AmenityData {
  name: string;
  slug: string;
  count: number;
}

interface AmenityGridV2Props {
  amenities: AmenityData[];
}

const amenityIcons: Record<string, any> = {
  'dog-friendly': Dog,
  'food': Utensils,
  'live-music': Music,
  'tours': Compass,
  'wifi': Wifi,
  'parking': Car,
  'pet-friendly': Dog,
  'family-friendly': Users,
  'outdoor-seating': Sun,
  'kid-friendly': Baby,
  'private-events': PartyPopper,
  'flights': GlassWater,
};

export default function AmenityGridV2({ amenities }: AmenityGridV2Props) {
  return (
    <section className="py-16 md:py-24 bg-[#FAF9F6]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 
            className="text-3xl md:text-4xl font-semibold text-[#1C1C1C] mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Filter by Amenities
          </h2>
          <div className="flex items-center justify-center gap-2">
            <div className="h-0.5 w-12 bg-[#9B2335]" />
            <div className="h-2 w-2 bg-[#D4A017] rotate-45" />
            <div className="h-0.5 w-12 bg-[#9B2335]" />
          </div>
          <p 
            className="text-[#6B6B6B] mt-4 max-w-xl mx-auto"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            Find breweries with exactly what you're looking for
          </p>
        </div>

        {/* Amenity Pills */}
        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {amenities.map((amenity) => {
            const Icon = amenityIcons[amenity.slug] || GlassWater;
            return (
              <Link
                key={amenity.slug}
                href={`/amenities/${amenity.slug}`}
                className="group inline-flex items-center gap-2 px-5 py-3 bg-white border border-[#E8E6E1] hover:border-[#9B2335] rounded-full transition-all duration-200 hover:shadow-md"
              >
                <Icon className="h-4 w-4 text-[#9B2335] group-hover:text-[#D4A017] transition-colors" strokeWidth={2} />
                <span 
                  className="text-[#1C1C1C] group-hover:text-[#9B2335] font-medium transition-colors"
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                >
                  {amenity.name}
                </span>
                <span className="text-xs text-[#9CA3AF] bg-[#F3F4F6] px-2 py-0.5 rounded-full">
                  {amenity.count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

