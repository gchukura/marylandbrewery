/**
 * BreweryCard - Server Component for Individual Brewery Display
 * Optimized for rendering 140+ breweries efficiently
 */

import { Brewery } from '@/types/brewery';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Globe, Clock, ExternalLink } from 'lucide-react';
import AmenityIcons from './AmenityIcons';
import BreweryHours from './BreweryHours';

interface BreweryCardProps {
  brewery: Brewery;
  showHours?: boolean;
  showAmenities?: boolean;
  showContact?: boolean;
  className?: string;
}

export default function BreweryCard({
  brewery,
  showHours = true,
  showAmenities = true,
  showContact = true,
  className = ''
}: BreweryCardProps) {
  // Determine if brewery is currently open
  const isOpenNow = (() => {
    if (!brewery.hours) return null;
    
    const now = new Date();
    const currentDay = now
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase();
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const todayHours = brewery.hours[currentDay as keyof typeof brewery.hours];
    if (!todayHours || todayHours === 'Closed') return false;
    
    // Simple time comparison (can be enhanced)
    const [openTime, closeTime] = todayHours.split(' - ');
    if (!openTime || !closeTime) return null;
    
    return currentTime >= openTime && currentTime <= closeTime;
  })();

  // Format address
  const fullAddress = `${brewery.address}, ${brewery.city}, ${brewery.state} ${brewery.zipCode}`;

  return (
    <Card className={`h-full border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all duration-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold text-gray-900 truncate">
              {brewery.name}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 mt-1">
              {(brewery as any).type || 'Brewery'} • {(brewery as any).county || brewery.city}
            </CardDescription>
          </div>
          
          {/* Open/Closed Status */}
          {isOpenNow !== null && (
            <div className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
              isOpenNow 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isOpenNow ? 'Open Now' : 'Closed'}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Location */}
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-2 text-red-600" />
          <span className="truncate">{fullAddress}</span>
        </div>

        {/* Hours */}
        {showHours && brewery.hours && (
          <div className="mb-3">
            <BreweryHours hours={brewery.hours} />
          </div>
        )}

        {/* Amenities */}
        {showAmenities && brewery.features && brewery.features.length > 0 && (
          <div className="mb-3">
            <AmenityIcons amenities={brewery.features} />
          </div>
        )}

        {/* Contact Information */}
        {showContact && (
          <div className="space-y-2">
            {brewery.phone && (
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2 text-red-600" />
                <a 
                  href={`tel:${brewery.phone}`}
                  className="hover:text-red-600 transition-colors"
                >
                  {brewery.phone}
                </a>
              </div>
            )}
            
            {brewery.website && (
              <div className="flex items-center text-sm text-gray-600">
                <Globe className="h-4 w-4 mr-2 text-red-600" />
                <a 
                  href={brewery.website.startsWith('http') ? brewery.website : `https://${brewery.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-red-600 transition-colors flex items-center"
                >
                  Visit Website
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {brewery.description && (
          <p className="text-sm text-gray-600 mt-3 line-clamp-2">
            {brewery.description}
          </p>
        )}

        {/* Social Media */}
        {brewery.socialMedia && (
          <div className="flex items-center space-x-3 mt-3 pt-3 border-t border-gray-100">
            {brewery.socialMedia.facebook && (
              <a
                href={brewery.socialMedia.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-600 transition-colors"
                aria-label="Facebook"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            )}
            {brewery.socialMedia.instagram && (
              <a
                href={brewery.socialMedia.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-600 transition-colors"
                aria-label="Instagram"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z"/>
                </svg>
              </a>
            )}
            {brewery.socialMedia.twitter && (
              <a
                href={brewery.socialMedia.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors"
                aria-label="Twitter"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
