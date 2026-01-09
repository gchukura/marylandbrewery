'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center px-4 py-12">
      {/* Error Icon */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🍺</div>
        <h1 
          className="text-3xl md:text-4xl font-bold text-[#1C1C1C] mb-4"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Something Went Wrong
        </h1>
        <p 
          className="text-lg text-[#6B6B6B] max-w-md mx-auto mb-8"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          We hit an unexpected issue while loading this page. Our team has been notified and we're working on it.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center px-6 py-3 bg-[#9B2335] text-white font-medium rounded-md hover:bg-[#7A1C2A] transition-colors"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 border-2 border-[#9B2335] text-[#9B2335] font-medium rounded-md hover:bg-[#9B2335] hover:text-white transition-colors"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          Back to Homepage
        </Link>
      </div>

      {/* Alternative actions */}
      <div className="text-center">
        <p 
          className="text-sm text-[#6B6B6B] mb-4"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          Or try one of these instead:
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/map"
            className="text-[#9B2335] hover:underline text-sm"
          >
            Interactive Map
          </Link>
          <span className="text-[#6B6B6B]">•</span>
          <Link
            href="/cities"
            className="text-[#9B2335] hover:underline text-sm"
          >
            Browse Cities
          </Link>
          <span className="text-[#6B6B6B]">•</span>
          <Link
            href="/counties"
            className="text-[#9B2335] hover:underline text-sm"
          >
            Browse Counties
          </Link>
        </div>
      </div>

      {/* Error details for debugging (only in development) */}
      {process.env.NODE_ENV === 'development' && error.digest && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg max-w-md">
          <p className="text-xs text-gray-500 font-mono">
            Error ID: {error.digest}
          </p>
        </div>
      )}
    </div>
  );
}

