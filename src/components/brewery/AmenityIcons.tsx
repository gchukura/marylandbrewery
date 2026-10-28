"use client";

import { Suspense, useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy import a minimal tooltip to avoid heavy deps
const Tooltip = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <span className="group relative inline-flex items-center">
    {children}
    <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
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
  const DynamicIcon = dynamic<{ className?: string }>(async () => {
    const icons = await import('lucide-react');
    const byName = icons as unknown as Record<string, LucideIcon | undefined>;
    return byName[iconName] ?? icons.Sparkles;
  });
  return DynamicIcon;
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
            <Suspense fallback={<span className="h-6 w-6 rounded bg-line" />}> 
              <span className="inline-flex items-center justify-center rounded-full bg-cream text-brand-red border border-line-strong p-1">
                <Icon className={iconClassName} />
              </span>
            </Suspense>
          </Tooltip>
        );
      })}

      {amenities.length > max && (
        <span className="text-xs text-muted">+{amenities.length - max} more</span>
      )}
    </div>
  );
}
