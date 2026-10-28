interface StatItem {
  label: string;
  value: string | number;
}

interface DirectoryStatsBarProps {
  stats: StatItem[];
}

export default function DirectoryStatsBar({ stats }: DirectoryStatsBarProps) {
  return (
    <section className="bg-cream py-8 border-b border-line">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg p-4 md:p-6 border border-line text-center hover:border-brand-red transition-colors"
            >
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-red mb-1">
                {stat.value}
              </div>
              <div className="text-sm md:text-base text-muted font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

