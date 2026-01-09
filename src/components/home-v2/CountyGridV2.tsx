import Link from 'next/link';

interface CountyData {
  name: string;
  slug: string;
  count: number;
}

interface CountyGridV2Props {
  counties: CountyData[];
}

export default function CountyGridV2({ counties }: CountyGridV2Props) {
  return (
    <section className="py-16 md:py-24 bg-white border-t border-[#E8E6E1]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 
            className="text-3xl md:text-4xl font-semibold text-[#1C1C1C] mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Explore by County
          </h2>
          {/* Decorative Divider */}
          <div className="flex items-center justify-center gap-2">
            <div className="h-0.5 w-12 bg-[#9B2335]" />
            <div className="h-2 w-2 bg-[#D4A017] rotate-45" />
            <div className="h-0.5 w-12 bg-[#9B2335]" />
          </div>
          <p 
            className="text-[#6B6B6B] mt-4 max-w-xl mx-auto"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            All 22 Maryland counties represented. From the Eastern Shore to Western Maryland.
          </p>
        </div>

        {/* County Grid - ALL 22 counties visible */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
          {counties.map((county) => (
            <Link
              key={county.slug}
              href={`/counties/${county.slug}/breweries`}
              className="group relative p-4 bg-[#FAF9F6] hover:bg-white border border-[#E8E6E1] hover:border-[#D4A017] rounded-lg transition-all duration-200 hover:shadow-md"
            >
              {/* County Name */}
              <div 
                className="font-medium text-[#1C1C1C] group-hover:text-[#9B2335] transition-colors"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                {county.name}
              </div>
              {/* Count */}
              <div 
                className="text-sm text-[#6B6B6B]"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                {county.count} {county.count === 1 ? 'brewery' : 'breweries'}
              </div>
              {/* Accent Corner */}
              <div className="absolute top-0 right-0 w-0 h-0 border-t-[20px] border-t-transparent group-hover:border-t-[#D4A017] border-l-[20px] border-l-transparent transition-colors duration-200 rounded-tr-lg" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

