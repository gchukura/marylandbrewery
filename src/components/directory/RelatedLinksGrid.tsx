import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface RelatedPage {
  title: string;
  url: string;
  count?: number;
  type?: string;
}

interface RelatedLinksGridProps {
  title?: string;
  pages: RelatedPage[];
}

export default function RelatedLinksGrid({ title = 'Explore More', pages }: RelatedLinksGridProps) {
  if (pages.length === 0) return null;

  return (
    <section className="bg-gray-50 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
          {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {pages.map((page, index) => (
            <Link
              key={index}
              href={page.url}
              className="bg-white rounded-lg p-5 border border-gray-200 hover:border-red-500 hover:shadow-lg transition-all group"
            >
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                {page.title}
              </h3>
              {page.count !== undefined && (
                <p className="text-sm text-gray-600 mb-3">
                  {page.count} {page.count === 1 ? 'brewery' : 'breweries'}
                </p>
              )}
              <div className="flex items-center text-red-600 text-sm font-medium group-hover:gap-2 transition-all">
                View
                <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

