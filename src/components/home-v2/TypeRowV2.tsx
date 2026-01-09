import Link from 'next/link';
import { Beer, Store, GlassWater, Factory, Beaker } from 'lucide-react';

interface TypeData {
  name: string;
  slug: string;
  count: number;
}

interface TypeRowV2Props {
  types: TypeData[];
}

const typeIcons: Record<string, any> = {
  microbrewery: Beer,
  brewpub: Store,
  taproom: GlassWater,
  production: Factory,
  nano: Beaker,
  nanobrewery: Beaker,
};

export default function TypeRowV2({ types }: TypeRowV2Props) {
  return (
    <section className="py-16 md:py-20 bg-[#1C1C1C] text-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 
            className="text-3xl md:text-4xl font-semibold mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Find by Brewery Type
          </h2>
          <div className="flex items-center justify-center gap-2">
            <div className="h-0.5 w-12 bg-[#D4A017]" />
            <div className="h-2 w-2 bg-[#9B2335] rotate-45" />
            <div className="h-0.5 w-12 bg-[#D4A017]" />
          </div>
        </div>

        {/* Type Cards */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 max-w-4xl mx-auto">
          {types.map((type) => {
            const Icon = typeIcons[type.slug] || Beer;
            return (
              <Link
                key={type.slug}
                href={`/type/${type.slug}`}
                className="group flex flex-col items-center p-6 bg-[#2A2A2A] hover:bg-[#333] border border-[#3A3A3A] hover:border-[#D4A017] rounded-xl transition-all duration-300 min-w-[140px]"
              >
                <Icon className="h-8 w-8 text-[#D4A017] mb-3 group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
                <div 
                  className="font-medium text-white mb-1"
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                >
                  {type.name}
                </div>
                <div 
                  className="text-sm text-[#9CA3AF]"
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                >
                  {type.count} locations
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

