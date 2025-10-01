/**
 * Data Utility Functions for Brewery Directory
 * Utility functions for data processing, formatting, and calculations
 */

import { Brewery, OperatingHours } from '@/types/brewery';

/**
 * Convert string to URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Convert slug back to readable text
 */
export function deslugify(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Check if brewery is currently open based on hours
 */
export function isOpenNow(brewery: Brewery): boolean {
  const now = new Date();
  const currentDay = getDayName(now.getDay());
  const currentTime = formatTime(now);
  
  const hours = brewery.hours;
  const todayHours = hours[currentDay as keyof OperatingHours];
  
  if (!todayHours || todayHours.toLowerCase().includes('closed')) {
    return false;
  }
  
  // Parse hours (assuming format like "11:00 AM - 9:00 PM" or "11:00-21:00")
  const timeRange = parseTimeRange(todayHours);
  if (!timeRange) return false;
  
  return isTimeInRange(currentTime, timeRange.open, timeRange.close);
}

/**
 * Check if brewery is open on a specific day
 */
export function isOpenOnDay(brewery: Brewery, dayName: string): boolean {
  const hours = brewery.hours;
  const dayHours = hours[dayName.toLowerCase() as keyof OperatingHours];
  
  if (!dayHours || dayHours.toLowerCase().includes('closed')) {
    return false;
  }
  
  return true;
}

/**
 * Get next opening time for a brewery
 */
export function getNextOpeningTime(brewery: Brewery): { day: string; time: string } | null {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const now = new Date();
  const currentDay = now.getDay();
  
  // Check today first
  const todayHours = brewery.hours[days[currentDay] as keyof OperatingHours];
  if (todayHours && !todayHours.toLowerCase().includes('closed')) {
    const timeRange = parseTimeRange(todayHours);
    if (timeRange && isTimeInRange(formatTime(now), timeRange.open, timeRange.close)) {
      return { day: days[currentDay], time: timeRange.open };
    }
  }
  
  // Check next 7 days
  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = (currentDay + i) % 7;
    const nextDay = days[nextDayIndex];
    const nextDayHours = brewery.hours[nextDay as keyof OperatingHours];
    
    if (nextDayHours && !nextDayHours.toLowerCase().includes('closed')) {
      const timeRange = parseTimeRange(nextDayHours);
      if (timeRange) {
        return { day: nextDay, time: timeRange.open };
      }
    }
  }
  
  return null;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Get day name from day index (0 = Sunday, 1 = Monday, etc.)
 */
function getDayName(dayIndex: number): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[dayIndex];
}

/**
 * Format time to HH:MM format
 */
function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Parse time range from string (e.g., "11:00 AM - 9:00 PM")
 */
function parseTimeRange(timeString: string): { open: string; close: string } | null {
  if (!timeString) return null;
  
  // Handle various formats
  const formats = [
    /(\d{1,2}:\d{2}\s*[AP]M?)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M?)/i, // 11:00 AM - 9:00 PM
    /(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/, // 11:00 - 21:00
    /(\d{1,2}:\d{2})\s*to\s*(\d{1,2}:\d{2})/i, // 11:00 to 21:00
  ];
  
  for (const format of formats) {
    const match = timeString.match(format);
    if (match) {
      return {
        open: normalizeTime(match[1]),
        close: normalizeTime(match[2])
      };
    }
  }
  
  return null;
}

/**
 * Normalize time to 24-hour format (HH:MM)
 */
function normalizeTime(time: string): string {
  const trimmed = time.trim();
  
  // If already in 24-hour format, return as is
  if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
    const [hours, minutes] = trimmed.split(':');
    return `${hours.padStart(2, '0')}:${minutes}`;
  }
  
  // Convert from 12-hour format
  const match = trimmed.match(/(\d{1,2}):(\d{2})\s*([AP]M?)/i);
  if (match) {
    let hours = parseInt(match[1]);
    const minutes = match[2];
    const ampm = match[3].toUpperCase();
    
    if (ampm === 'PM' && hours !== 12) {
      hours += 12;
    } else if (ampm === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }
  
  return trimmed;
}

/**
 * Check if time is within range
 */
function isTimeInRange(currentTime: string, openTime: string, closeTime: string): boolean {
  const current = timeToMinutes(currentTime);
  const open = timeToMinutes(openTime);
  const close = timeToMinutes(closeTime);
  
  if (open <= close) {
    // Normal case: 9:00 AM - 5:00 PM
    return current >= open && current <= close;
  } else {
    // Overnight case: 9:00 PM - 2:00 AM
    return current >= open || current <= close;
  }
}

/**
 * Convert time string to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Generic function to group array by property
 */
export function groupByProperty<T, K extends keyof T>(
  array: T[], 
  property: K
): Map<T[K], T[]> {
  const groups = new Map<T[K], T[]>();
  
  array.forEach(item => {
    const key = item[property];
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  });
  
  return groups;
}

/**
 * Group breweries by multiple properties
 */
export function groupBreweriesByMultiple(
  breweries: Brewery[], 
  properties: (keyof Brewery)[]
): Map<string, Brewery[]> {
  const groups = new Map<string, Brewery[]>();
  
  breweries.forEach(brewery => {
    const key = properties
      .map(prop => {
        const value = brewery[prop];
        if (Array.isArray(value)) {
          return value.join(',');
        }
        return String(value);
      })
      .join('|');
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(brewery);
  });
  
  return groups;
}

/**
 * Sort breweries by distance from a point
 */
export function sortBreweriesByDistance(
  breweries: Brewery[], 
  latitude: number, 
  longitude: number
): Brewery[] {
  return breweries
    .map(brewery => ({
      ...brewery,
      distance: calculateDistance(latitude, longitude, brewery.latitude, brewery.longitude)
    }))
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Filter breweries by multiple criteria
 */
export function filterBreweries(
  breweries: Brewery[],
  filters: {
    city?: string;
    county?: string;
    type?: string;
    amenity?: string;
    openNow?: boolean;
    hasWebsite?: boolean;
    hasPhone?: boolean;
    allowsVisitors?: boolean;
    offersTours?: boolean;
    beerToGo?: boolean;
    hasMerch?: boolean;
  }
): Brewery[] {
  return breweries.filter(brewery => {
    // City filter
    if (filters.city && brewery.city.toLowerCase() !== filters.city.toLowerCase()) {
      return false;
    }
    
    // County filter
    if (filters.county && brewery.county.toLowerCase() !== filters.county.toLowerCase()) {
      return false;
    }
    
    // Type filter
    if (filters.type && brewery.type.toLowerCase() !== filters.type.toLowerCase()) {
      return false;
    }
    
    // Amenity filter
    if (filters.amenity && !brewery.amenities.some(amenity => 
      amenity.toLowerCase().includes(filters.amenity!.toLowerCase())
    )) {
      return false;
    }
    
    // Open now filter
    if (filters.openNow && !isOpenNow(brewery)) {
      return false;
    }
    
    // Website filter
    if (filters.hasWebsite && !brewery.website) {
      return false;
    }
    
    // Phone filter
    if (filters.hasPhone && !brewery.phone) {
      return false;
    }
    
    // Feature filters
    if (filters.allowsVisitors !== undefined && brewery.allowsVisitors !== filters.allowsVisitors) {
      return false;
    }
    
    if (filters.offersTours !== undefined && brewery.offersTours !== filters.offersTours) {
      return false;
    }
    
    if (filters.beerToGo !== undefined && brewery.beerToGo !== filters.beerToGo) {
      return false;
    }
    
    if (filters.hasMerch !== undefined && brewery.hasMerch !== filters.hasMerch) {
      return false;
    }
    
    return true;
  });
}

/**
 * Format distance for display
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 10) / 10} mi`;
  }
  return `${Math.round(distance)} mi`;
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * Get brewery status (open/closed/opening soon)
 */
export function getBreweryStatus(brewery: Brewery): {
  status: 'open' | 'closed' | 'opening-soon';
  message: string;
  nextOpen?: { day: string; time: string };
} {
  if (isOpenNow(brewery)) {
    return {
      status: 'open',
      message: 'Open now'
    };
  }
  
  const nextOpen = getNextOpeningTime(brewery);
  if (nextOpen) {
    return {
      status: 'closed',
      message: `Closed - Opens ${nextOpen.day} at ${nextOpen.time}`,
      nextOpen
    };
  }
  
  return {
    status: 'closed',
    message: 'Currently closed'
  };
}
