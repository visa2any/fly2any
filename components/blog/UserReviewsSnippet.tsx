'use client';

import { useState, useEffect } from 'react';

interface Review {
  name: string;
  rating: number;
  comment: string;
  date: string;
}

interface UserReviewsSnippetProps {
  averageRating: number;
  totalReviews: number;
  recentReviews?: Review[];
}

const StarRating = ({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <div className={`flex items-center gap-0.5 ${sizeClasses[size]}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>
          ⭐
        </span>
      ))}
    </div>
  );
};

export default function UserReviewsSnippet({
  averageRating,
  totalReviews,
  recentReviews = []
}: UserReviewsSnippetProps) {
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  useEffect(() => {
    if (recentReviews.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % recentReviews.length);
    }, 5000); // Rotate every 5 seconds

    return () => clearInterval(interval);
  }, [recentReviews.length]);

  const displayedReviews = recentReviews.slice(currentReviewIndex, currentReviewIndex + 3);
  if (displayedReviews.length < 3 && recentReviews.length >= 3) {
    displayedReviews.push(...recentReviews.slice(0, 3 - displayedReviews.length));
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      {/* Overall rating header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <StarRating rating={Math.round(averageRating)} size="lg" />
            <span className="text-3xl font-bold text-gray-800">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-gray-600">/5</span>
          </div>
          <p className="text-sm text-gray-600">
            Based on {totalReviews.toLocaleString()} reviews
          </p>
        </div>

        {/* Trustpilot badge */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg text-center shadow-md">
          <div className="font-bold text-sm uppercase tracking-wide">Excellent</div>
          <div className="text-xs mt-1 opacity-90">Trustpilot</div>
        </div>
      </div>

      {/* Review carousel */}
      {recentReviews.length > 0 && (
        <div className="space-y-4">
          {displayedReviews.map((review, index) => (
            <div
              key={`${review.name}-${review.date}-${index}`}
              className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 animate-slide-up-fade"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {review.name.charAt(0)}
                </div>

                {/* Review content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-800">{review.name}</h4>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    <span className="text-xs text-gray-500">{review.date}</span>
                  </div>
                  <p className="text-sm text-gray-700 italic leading-relaxed">
                    "{review.comment}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Carousel indicator */}
      {recentReviews.length > 3 && (
        <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-gray-200">
          {Array.from({ length: Math.ceil(recentReviews.length / 3) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentReviewIndex(index * 3)}
              className={`w-2 h-2 rounded-full transition-all ${
                Math.floor(currentReviewIndex / 3) === index
                  ? 'bg-blue-600 w-6'
                  : 'bg-gray-300'
              }`}
              aria-label={`View reviews ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Call to action */}
      <div className="mt-4 pt-4 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500">
          Join {totalReviews.toLocaleString()}+ happy travelers
        </p>
      </div>
    </div>
  );
}
