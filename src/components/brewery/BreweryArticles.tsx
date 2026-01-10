"use client";

import { useState } from 'react';
import { BreweryArticle } from '@/types/brewery';

interface BreweryArticlesProps {
  articles: BreweryArticle[];
  breweryName: string;
}

const INITIAL_DISPLAY_COUNT = 3;

export default function BreweryArticles({ articles, breweryName }: BreweryArticlesProps) {
  const [showAll, setShowAll] = useState(false);

  if (!articles || articles.length === 0) {
    return null;
  }

  const displayArticles = showAll ? articles : articles.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMore = articles.length > INITIAL_DISPLAY_COUNT;

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch (e) {
      return 'Unknown date';
    }
  };

  const formatSource = (source: string | undefined): string => {
    if (!source) return '';
    
    // Handle common sources
    if (source.includes('news.google.com')) return 'Google News';
    if (source.includes('baltimoresun.com')) return 'Baltimore Sun';
    if (source.includes('washingtonpost.com')) return 'Washington Post';
    
    // Extract readable name from domain
    const domain = source.replace('www.', '').split('.')[0];
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl md:text-2xl font-semibold text-[#1C1C1C] font-display">
          News & Articles
        </h2>
      </div>

      <div className="space-y-6">
        {displayArticles.map((article) => (
          <div key={article.id} className="pb-6 border-b border-[#E8E6E1] last:border-b-0 last:pb-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2 font-body">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#9B2335] hover:text-[#7A1C2A] hover:underline"
                  >
                    {article.title}
                  </a>
                </h3>
                {(article.publishedAt || article.source) && (
                  <div className="text-body text-[#6B6B6B] mb-3 font-body">
                    {article.publishedAt && formatDate(article.publishedAt)}
                    {article.source && (
                      <span>
                        {article.publishedAt && ' '}
                        via {formatSource(article.source)}
                      </span>
                    )}
                  </div>
                )}
                {article.description && (
                  <p className="text-[#1C1C1C] line-clamp-2 text-body font-body">{article.description}</p>
                )}
              </div>
              {article.imageUrl && (
                <div className="relative w-24 h-24 flex-shrink-0 rounded overflow-hidden">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="border border-[#E8E6E1] text-[#1C1C1C] hover:bg-[#FAF9F6] hover:border-[#9B2335] px-6 py-3 rounded-md transition-colors font-medium text-body font-body"
          >
            {showAll ? 'Show Less' : `Show More (${articles.length - INITIAL_DISPLAY_COUNT} more)`}
          </button>
        </div>
      )}
    </div>
  );
}

