import { Compass, Filter, Clock } from 'lucide-react';

const propositions = [
  {
    icon: Compass,
    title: 'Local Expertise',
    description: 'Every brewery verified with detailed hours, directions, and insider tips from fellow craft beer enthusiasts.',
  },
  {
    icon: Filter,
    title: 'Find Your Perfect Fit',
    description: 'Filter by dog-friendly patios, live music venues, food trucks, brewery tours, and dozens more amenities.',
  },
  {
    icon: Clock,
    title: 'Always Up-to-Date',
    description: 'Real-time hours, seasonal releases, and instant alerts when new breweries open across Maryland.',
  },
];

export default function ValuePropsV2() {
  return (
    <section className="pt-8 md:pt-12 pb-16 md:pb-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          {propositions.map((prop, index) => (
            <div 
              key={index} 
              className="text-center group"
            >
              {/* Icon Container */}
              <div className="relative inline-flex mb-6">
                <div className="relative w-16 h-16 flex items-center justify-center bg-[#FAF9F6] border-2 border-[#E8E6E1] rounded-full">
                  <prop.icon className="h-7 w-7 text-[#9B2335]" strokeWidth={1.5} />
                </div>
              </div>
              
              {/* Title */}
              <h3 
                className="text-xl font-semibold text-[#1C1C1C] mb-3"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {prop.title}
              </h3>
              
              {/* Description */}
              <p 
                className="text-[#6B6B6B] leading-relaxed"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                {prop.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

