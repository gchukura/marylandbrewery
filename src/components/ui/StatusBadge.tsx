import { openStatusLabel, type WeeklyHours } from '@/lib/hours';
import { cn } from '@/lib/utils';
import StatusBadgeLive from './StatusBadgeLive';

const SIZES = {
  sm: 'px-[11px] py-1.5 text-xs', // card overlays and list rows
  md: 'px-3 py-1.5 text-[13px]', // next to a page title
};

/**
 * Gold "Open until 10 PM" or ink "Closed · opens Thu 4 PM", from the brewery's hours.
 * Renders nothing when the hours can't be read.
 */
export default function StatusBadge({ hours, size = 'sm', className }: { hours: WeeklyHours | null | undefined; size?: keyof typeof SIZES; className?: string }) {
  if (!hours) return null;
  return <StatusBadgeLive hours={hours} initial={openStatusLabel(hours)} className={cn(SIZES[size], className)} />;
}
