"use client";

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Review {
  id: string;
  reviewer_name: string | null;
  rating: number | null;
  review_text: string | null;
  review_date: string | null;
  review_timestamp: number | null;
  reviewer_url: string | null;
  profile_photo_url: string | null;
}

interface BreweryReviewsProps {
  breweryId: string;
  reviewsPerPage?: number;
}

const MAX_PREVIEW_LENGTH = 250; // Character limit for preview

export default function BreweryReviews({ breweryId, reviewsPerPage = 5 }: BreweryReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    async function fetchReviews() {
      setLoading(true);
      try {
        const offset = (currentPage - 1) * reviewsPerPage;
        const response = await fetch(`/api/reviews?breweryId=${breweryId}&limit=${reviewsPerPage}&offset=${offset}`);
        const data = await response.json();
        
        if (cancelled) return;

        // Deduplicate reviews by content (brewery_id + review_timestamp + reviewer_name) in case of duplicates
        const uniqueReviews = (data.reviews || []).reduce((acc: Review[], review: Review) => {
          const timestamp = review.review_timestamp || 0;
          const reviewerName = (review.reviewer_name || '').toLowerCase().trim();
          const duplicateKey = `${timestamp}|${reviewerName}`;
          
          // Check if we already have a review with the same content
          const existing = acc.find(r => {
            const rTimestamp = r.review_timestamp || 0;
            const rName = (r.reviewer_name || '').toLowerCase().trim();
            return `${rTimestamp}|${rName}` === duplicateKey;
          });
          
          if (!existing) {
            acc.push(review);
          }
          return acc;
        }, []);

        setReviews(uniqueReviews);
        setTotalReviews(data.total || 0);
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to fetch reviews:', error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchReviews();

    return () => {
      cancelled = true;
    };
  }, [breweryId, currentPage, reviewsPerPage]);

  const totalPages = Math.ceil(totalReviews / reviewsPerPage);

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-300 text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string | null, timestamp: number | null) => {
    if (dateString) return dateString;
    if (timestamp) {
      const date = new Date(timestamp * 1000);
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
    return 'Unknown date';
  };

  const formatReviewerName = (name: string | null): string => {
    if (!name) return 'Anonymous';
    
    const trimmed = name.trim();
    const parts = trimmed.split(/\s+/);
    
    if (parts.length === 0) return 'Anonymous';
    if (parts.length === 1) return parts[0];
    
    // First name + last initial
    const firstName = parts[0];
    const lastInitial = parts[parts.length - 1][0].toUpperCase();
    return `${firstName} ${lastInitial}.`;
  };

  const toggleReview = (reviewId: string) => {
    setExpandedReviews((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const shouldTruncate = (text: string | null): boolean => {
    return text ? text.length > MAX_PREVIEW_LENGTH : false;
  };

  const getPreviewText = (text: string | null): string => {
    if (!text) return '';
    if (text.length <= MAX_PREVIEW_LENGTH) return text;
    // Find the last space before the limit to avoid cutting words
    const truncated = text.substring(0, MAX_PREVIEW_LENGTH);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  };

  if (loading && currentPage === 1) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-black mb-6">Reviews</h2>
        <div className="text-gray-600">Loading reviews...</div>
      </div>
    );
  }

  if (totalReviews === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-black mb-6">
        {totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'}
      </h2>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-black">
                {formatReviewerName(review.reviewer_name)}
              </h3>
              {review.rating && renderStars(review.rating)}
            </div>
            <div className="text-sm text-gray-500 mb-3">
              {formatDate(review.review_date, review.review_timestamp)}
            </div>
            {review.review_text && (
              <div>
                <p className="text-gray-700 leading-relaxed">
                  {expandedReviews.has(review.id) || !shouldTruncate(review.review_text)
                    ? review.review_text
                    : getPreviewText(review.review_text)}
                </p>
                {shouldTruncate(review.review_text) && (
                  <button
                    onClick={() => toggleReview(review.id)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {expandedReviews.has(review.id) ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || loading}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || loading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

