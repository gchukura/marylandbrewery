import Link from 'next/link';

interface CityData {
  name: string;
  slug: string;
  count: number;
}

interface CityGridV2Props {
  cities: CityData[];
}

export default function CityGridV2({ cities }: CityGridV2Props) {
  return (
    <section className="py-16 md:py-24 bg-[#FAF9F6]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 
            className="text-3xl md:text-4xl font-semibold text-[#1C1C1C] mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Browse by City
          </h2>
          {/* Decorative Divider */}
          <div className="flex items-center justify-center gap-2">
            <div className="h-0.5 w-12 bg-[#9B2335]" />
            <div className="h-2 w-2 bg-[#D4A017] rotate-45" />
            <div className="h-0.5 w-12 bg-[#9B2335]" />
          </div>
        </div>

        {/* City Grid - ALL cities visible, no "View All" */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-1">
          {cities.map((city) => (
            <Link
              key={city.slug}
              href={`/cities/${city.slug}/breweries`}
              className="group py-2 flex items-center text-[#1C1C1C] hover:text-[#9B2335] transition-colors duration-200"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              <span className="w-0 group-hover:w-2 h-0.5 bg-[#D4A017] mr-0 group-hover:mr-2 transition-all duration-200" />
              <span className="truncate">{city.name}</span>
              <span className="ml-1 text-[#9CA3AF] text-sm">({city.count})</span>
            </Link>
          ))}
        </div>

        {/* Link Count - Dev reference */}
        <p className="text-center text-xs text-[#9CA3AF] mt-8">
          Showing all {cities.length} cities with breweries
        </p>
      </div>
    </section>
  );
}

