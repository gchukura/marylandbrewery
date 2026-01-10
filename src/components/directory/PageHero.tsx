import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import '@/components/home-v2/styles.css';

interface BreadcrumbItem {
  name: string;
  url: string;
  isActive?: boolean;
}

interface PageHeroProps {
  h1: string;
  introText: string;
  breadcrumbs: BreadcrumbItem[];
  heroImage?: string | null;
  heroImageAlt?: string;
}

export default function PageHero({ h1, introText, breadcrumbs, heroImage, heroImageAlt }: PageHeroProps) {
  // Generate descriptive alt text from h1 if not provided
  const altText = heroImageAlt || `${h1} - Maryland Brewery Directory`;
  
  return (
    <section className="bg-white border-b-4 border-[#9B2335] relative overflow-hidden">
      {/* Hero Image Background */}
      {heroImage && (
        <div className="absolute inset-0">
          {heroImage.startsWith('http') ? (
            <img 
              src={heroImage} 
              alt={altText}
              className="w-full h-full object-cover"
            />
          ) : (
            <Image
              src={heroImage}
              alt={altText}
              fill
              className="object-cover"
              sizes="100vw"
              priority
              unoptimized={false}
            />
          )}
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        </div>
      )}
      
      {/* Pattern overlay (only if no hero image) */}
      {!heroImage && (
        <div className="absolute inset-0 md-pattern-bg pointer-events-none" />
      )}
      
      <div className="container mx-auto px-4 py-10 md:py-14 relative z-10">
        {/* Breadcrumbs */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className={`flex items-center flex-wrap gap-2 text-sm font-body ${heroImage ? 'text-white/90' : 'text-[#6B6B6B]'}`}>
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className={`h-4 w-4 mx-2 ${heroImage ? 'text-white/70' : 'text-[#6B6B6B]'}`} />
                )}
                <Link 
                  href={crumb.url} 
                  className={`transition-colors font-medium font-body ${
                    crumb.isActive 
                      ? heroImage 
                        ? 'text-white drop-shadow-md' 
                        : 'text-[#1C1C1C]'
                      : heroImage 
                        ? 'hover:text-white drop-shadow-md' 
                        : 'hover:text-[#9B2335]'
                  }`}
                >
                  {crumb.name}
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        {/* H1 Title */}
        <h1 
          className={`text-h1 md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 leading-snug font-display ${
            heroImage 
              ? 'text-white drop-shadow-lg' 
              : 'text-[#1C1C1C]'
          }`}
          style={heroImage ? { textShadow: '2px 2px 4px rgba(0,0,0,0.5)' } : undefined}
        >
          {h1}
        </h1>

        {/* Intro Paragraph */}
        <p 
          className={`text-body-large md:text-xl max-w-3xl leading-snug font-body ${
            heroImage 
              ? 'text-white/95 drop-shadow-md' 
              : 'text-[#6B6B6B]'
          }`}
        >
          {introText}
        </p>
      </div>
    </section>
  );
}

