/**
 * BreweryHours - Hours Display with Current Day Highlighting
 * Efficiently parses hours strings and shows open/closed status
 */

import { Clock } from 'lucide-react';

interface BreweryHoursProps {
  hours: {
    [key: string]: string | undefined;
  };
  showCurrentDayOnly?: boolean;
  className?: string;
}

interface DayHours {
  day: string;
  hours: string;
  isToday: boolean;
  isOpen: boolean;
}

export default function BreweryHours({
  hours,
  showCurrentDayOnly = false,
  className = ''
}: BreweryHoursProps) {
  // Get current day and time
  const now = new Date();
  const currentDay = now
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toLowerCase();
  const currentTime = now.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Parse hours data
  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  const parseHours = (): DayHours[] => {
    return dayOrder.map(day => {
      const dayHours = hours[day];
      const isToday = day === currentDay;
      
      if (!dayHours || dayHours.toLowerCase() === 'closed') {
        return {
          day: day.charAt(0).toUpperCase() + day.slice(1),
          hours: 'Closed',
          isToday,
          isOpen: false
        };
      }

      // Parse time range (e.g., "11:00 AM - 10:00 PM")
      const timeMatch = dayHours.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
      
      if (timeMatch) {
        const [, openTime, closeTime] = timeMatch;
        
        // Convert to 24-hour format for comparison
        const parseTime = (time: string) => {
          const [timePart, period] = time.trim().split(/\s+/);
          const [hours, minutes] = timePart.split(':').map(Number);
          
          if (period?.toUpperCase() === 'PM' && hours !== 12) {
            return hours + 12;
          } else if (period?.toUpperCase() === 'AM' && hours === 12) {
            return 0;
          }
          return hours;
        };

        const openHour = parseTime(openTime);
        const closeHour = parseTime(closeTime);
        const currentHour = parseInt(currentTime.split(':')[0]);

        const isOpen = isToday && currentHour >= openHour && currentHour < closeHour;

        return {
          day: day.charAt(0).toUpperCase() + day.slice(1),
          hours: dayHours,
          isToday,
          isOpen
        };
      }

      return {
        day: day.charAt(0).toUpperCase() + day.slice(1),
        hours: dayHours,
        isToday,
        isOpen: false
      };
    });
  };

  const dayHours = parseHours();

  // Filter to show only today if requested
  const displayHours = showCurrentDayOnly 
    ? dayHours.filter(day => day.isToday)
    : dayHours;

  if (displayHours.length === 0) {
    return (
      <div className={`flex items-center text-sm text-gray-500 ${className}`}>
        <Clock className="h-4 w-4 mr-2" />
        <span>Hours not available</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center text-sm text-gray-600 mb-2">
        <Clock className="h-4 w-4 mr-2 text-red-600" />
        <span className="font-medium">Hours</span>
      </div>
      
      <div className="space-y-1">
        {displayHours.map((day) => (
          <div
            key={day.day}
            className={`flex justify-between items-center text-sm ${
              day.isToday 
                ? 'font-semibold text-red-700 bg-red-50 px-2 py-1 rounded' 
                : 'text-gray-600'
            }`}
          >
            <span className={day.isToday ? 'text-red-800' : ''}>
              {day.day}
            </span>
            <span className={`${
              day.isToday 
                ? 'text-red-700' 
                : day.hours === 'Closed' 
                  ? 'text-gray-400' 
                  : 'text-gray-700'
            }`}>
              {day.hours}
            </span>
          </div>
        ))}
      </div>

      {/* Current Status Indicator */}
      {!showCurrentDayOnly && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          {(() => {
            const today = dayHours.find(day => day.isToday);
            if (!today) return null;

            return (
              <div className={`text-xs font-medium ${
                today.isOpen 
                  ? 'text-green-700 bg-green-50 px-2 py-1 rounded' 
                  : 'text-red-700 bg-red-50 px-2 py-1 rounded'
              }`}>
                {today.isOpen ? 'Open Now' : 'Currently Closed'}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
