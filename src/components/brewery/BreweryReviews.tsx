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

export default function BreweryReviews({ breweryId, reviewsPerPage = 5 }: BreweryReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      setLoading(true);
      try {
        const offset = (currentPage - 1) * reviewsPerPage;
        const response = await fetch(`/api/reviews?breweryId=${breweryId}&limit=${reviewsPerPage}&offset=${offset}`);
        const data = await response.json();
        setReviews(data.reviews || []);
        setTotalReviews(data.total || 0);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
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
            <div className="flex items-start gap-4">
              {review.profile_photo_url ? (
                <img
                  src={review.profile_photo_url}
                  alt={review.reviewer_name || 'Reviewer'}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-sm font-medium">
                    {(review.reviewer_name || 'A')[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-black">
                    {review.reviewer_name || 'Anonymous'}
                  </h3>
                  {review.rating && renderStars(review.rating)}
                </div>
                <div className="text-sm text-gray-500 mb-3">
                  {formatDate(review.review_date, review.review_timestamp)}
                </div>
                {review.review_text && (
                  <p className="text-gray-700 leading-relaxed">{review.review_text}</p>
                )}
              </div>
            </div>
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

