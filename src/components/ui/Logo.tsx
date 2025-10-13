import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      {/* Logo Image */}
      <img
        src="/logo.png"
        alt="MarylandBrewery.com"
        style={{ height: '300px', width: 'auto' }}
      />
    </div>
  );
}
