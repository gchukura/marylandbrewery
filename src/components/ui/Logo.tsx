import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      {/* Logo Text */}
      {showText && (
        <span className="text-white font-bold text-xl">
          MarylandBrewery.com
        </span>
      )}
    </div>
  );
}
