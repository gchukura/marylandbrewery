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
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-4 py-12">
      {/* Error Icon */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🍺</div>
        <h1 
          className="font-display text-3xl md:text-4xl font-bold text-ink mb-4"
        >
          Something Went Wrong
        </h1>
        <p 
          className="text-lg text-muted max-w-md mx-auto mb-8"
        >
          We hit an unexpected issue while loading this page. Our team has been notified and we're working on it.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center px-6 py-3 bg-brand-red text-white font-medium rounded-md hover:bg-brand-red-dark transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 border-2 border-brand-red text-brand-red font-medium rounded-md hover:bg-brand-red hover:text-white transition-colors"
        >
          Back to Homepage
        </Link>
      </div>

      {/* Alternative actions */}
      <div className="text-center">
        <p 
          className="text-sm text-muted mb-4"
        >
          Or try one of these instead:
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/map"
            className="text-brand-red hover:underline text-sm"
          >
            Interactive Map
          </Link>
          <span className="text-muted">•</span>
          <Link
            href="/cities"
            className="text-brand-red hover:underline text-sm"
          >
            Browse Cities
          </Link>
          <span className="text-muted">•</span>
          <Link
            href="/counties"
            className="text-brand-red hover:underline text-sm"
          >
            Browse Counties
          </Link>
        </div>
      </div>

      {/* Error details for debugging (only in development) */}
      {process.env.NODE_ENV === 'development' && error.digest && (
        <div className="mt-8 p-4 bg-cream rounded-lg max-w-md">
          <p className="text-xs text-muted font-mono">
            Error ID: {error.digest}
          </p>
        </div>
      )}
    </div>
  );
}

