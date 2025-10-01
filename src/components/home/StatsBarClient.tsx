"use client";

import CountUp from './CountUp';

export default function StatsBarClient({ total, counties, cities }: { total: number; counties: number; cities: number }) {
  const cards = [
    { label: 'Total Active Breweries', value: total },
    { label: 'Counties Covered (of 24)', value: counties },
    { label: 'Cities with Breweries', value: cities },
  ];

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 min-w-full">
        {cards.map((c) => (
          <div key={c.label} className="relative card card-hover">
            <div className="absolute inset-0 bg-md-flag pointer-events-none" />
            <div className="relative">
              <div className="text-display font-extrabold text-md-red">
                <CountUp value={c.value} />
              </div>
              <div className="mt-1 text-small text-gray-600">{c.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
