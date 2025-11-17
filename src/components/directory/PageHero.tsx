import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  name: string;
  url: string;
  isActive?: boolean;
}

interface PageHeroProps {
  h1: string;
  introText: string;
  breadcrumbs: BreadcrumbItem[];
}

export default function PageHero({ h1, introText, breadcrumbs }: PageHeroProps) {
  return (
    <section className="bg-white border-b border-gray-200 py-8 md:py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center flex-wrap gap-2 text-sm text-gray-600">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />}
                {crumb.isActive ? (
                  <span className="text-gray-900 font-medium">{crumb.name}</span>
                ) : (
                  <Link 
                    href={crumb.url} 
                    className="hover:text-red-600 transition-colors"
                  >
                    {crumb.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* H1 Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          {h1}
        </h1>

        {/* Intro Paragraph */}
        <p className="text-lg md:text-xl text-gray-700 max-w-4xl leading-relaxed">
          {introText}
        </p>
      </div>
    </section>
  );
}

