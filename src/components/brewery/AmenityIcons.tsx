"use client";

import { Suspense, useMemo } from 'react';
import dynamic from 'next/dynamic';

// Lazy import a minimal tooltip to avoid heavy deps
const Tooltip = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <span className="group relative inline-flex items-center">
    {children}
    <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
      {label}
    </span>
  </span>
);

// Map amenity names to lucide-react icon component names
const AMENITY_ICON_MAP: Record<string, string> = {
  'Food': 'Utensils',
  'Outdoor Seating': 'Sun',
  'Live Music': 'Music',
  'Pet Friendly': 'Dog',
  'WiFi': 'Wifi',
  'Tours': 'Map',
  'Family Friendly': 'Users',
  'Merchandise': 'ShoppingBag',
  'Beer To Go': 'Beer',
  'Accessibility': 'Accessibility',
  'Events': 'Calendar',
};

// Dynamic icon loader
function getLucide(iconName: string) {
  const DynamicIcon = dynamic(async () => {
    const icons = await import('lucide-react');
    const Comp = (icons as Record<string, any>)[iconName] || (icons as Record<string, any>)['Sparkles'];
    const Wrapped = (props: any) => (Comp ? <Comp {...props} /> : null);
    (Wrapped as any).displayName = `Lucide${iconName}`;
    return Wrapped as any;
  });
  return DynamicIcon as React.ComponentType<{ className?: string }>;
}

interface AmenityIconsProps {
  amenities: string[];
  max?: number; // cap icons for performance
  className?: string;
  iconClassName?: string;
}

export default function AmenityIcons({
  amenities,
  max = 8,
  className = '',
  iconClassName = 'h-4 w-4'
}: AmenityIconsProps) {
  if (!amenities || amenities.length === 0) return null;

  const items = amenities.slice(0, max);

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {items.map((amenity) => {
        const key = amenity.trim();
        const iconName = AMENITY_ICON_MAP[key] || 'Sparkles';
        const Icon = getLucide(iconName);
        return (
          <Tooltip key={key} label={key}>
            <Suspense fallback={<span className="h-6 w-6 rounded bg-gray-200" />}> 
              <span className="inline-flex items-center justify-center rounded-full bg-red-50 text-red-700 border border-red-100 p-1">
                <Icon className={iconClassName} />
              </span>
            </Suspense>
          </Tooltip>
        );
      })}

      {amenities.length > max && (
        <span className="text-xs text-gray-500">+{amenities.length - max} more</span>
      )}
    </div>
  );
}
