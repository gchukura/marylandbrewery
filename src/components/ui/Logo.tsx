import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      {/* Logo Image - with transparent background */}
      <Image
        src="/logo-transparent.png"
        alt="MarylandBrewery.com"
        width={200}
        height={60}
        className="h-12 w-auto"
        priority
      />
    </div>
  );
}
