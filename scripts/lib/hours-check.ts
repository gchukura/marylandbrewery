import {
  DAYS,
  parseDayHours,
  type DayName,
  type WeeklyHours,
} from '@/lib/hours';

/**
 * Google's `opening_hours.weekday_text` ("Monday: 4:00 – 10:00 PM") as stored hours: the same
 * strings, keyed by lowercase day, closed days left out (how the breweries table stores them).
 */
export function hoursFromWeekdayText(lines: string[]): WeeklyHours {
  const hours: WeeklyHours = {};
  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(.+)$/);
    const day = match?.[1].toLowerCase() as DayName | undefined;
    if (!match || !day || !DAYS.includes(day)) continue;
    const text = match[2].trim();
    if (!/^closed$/i.test(text)) hours[day] = text;
  }
  return hours;
}

/** One day's open ranges as a comparable string; missing means closed. */
function dayKey(text: string | undefined): string {
  if (!text) return 'closed';
  const ranges = parseDayHours(text);
  if (ranges === null) return `unparsed: ${text}`;
  if (ranges.length === 0) return 'closed';
  return ranges
    .map((r) => `${r.open}-${r.close}`)
    .sort()
    .join(',');
}

export interface DayDifference {
  day: DayName;
  stored: string;
  google: string;
}

/** Days whose open times differ (by parsed times, so spacing and "PM" placement don't count). */
export function hoursDifferences(
  stored: WeeklyHours | null | undefined,
  google: WeeklyHours
): DayDifference[] {
  return DAYS.filter(
    (day) => dayKey(stored?.[day]) !== dayKey(google[day])
  ).map((day) => ({
    day,
    stored: stored?.[day] ?? 'Closed',
    google: google[day] ?? 'Closed',
  }));
}
