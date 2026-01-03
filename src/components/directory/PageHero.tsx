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
}

export default function PageHero({ h1, introText, breadcrumbs, heroImage }: PageHeroProps) {
  return (
    <section className="bg-white border-b-4 border-[#9B2335] relative overflow-hidden">
      {/* Hero Image Background */}
      {heroImage && (
        <div className="absolute inset-0">
          {heroImage.startsWith('http') ? (
            <img 
              src={heroImage} 
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <Image
              src={heroImage}
              alt=""
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
      
      <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
        {/* Breadcrumbs */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className={`flex items-center flex-wrap gap-2 text-sm ${heroImage ? 'text-white/90' : 'text-gray-600'}`}>
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className={`h-4 w-4 mx-2 ${heroImage ? 'text-white/70' : 'text-gray-400'}`} />
                )}
                {crumb.isActive ? (
                  <span className={`font-medium ${heroImage ? 'text-white drop-shadow-md' : 'text-gray-900'}`}>
                    {crumb.name}
                  </span>
                ) : (
                  <Link 
                    href={crumb.url} 
                    className={`transition-colors ${heroImage ? 'hover:text-white drop-shadow-md' : 'hover:text-red-600'}`}
                  >
                    {crumb.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* H1 Title */}
        <h1 
          className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight ${
            heroImage 
              ? 'text-white drop-shadow-lg' 
              : 'text-gray-900'
          }`}
          style={heroImage ? { textShadow: '2px 2px 4px rgba(0,0,0,0.5)' } : {}}
        >
          {h1}
        </h1>

        {/* Intro Paragraph */}
        <p 
          className={`text-lg md:text-xl max-w-4xl leading-relaxed ${
            heroImage 
              ? 'text-white/95 drop-shadow-md' 
              : 'text-gray-700'
          }`}
        >
          {introText}
        </p>
      </div>
    </section>
  );
}

