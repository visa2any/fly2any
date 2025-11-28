'use client';

import { useState, useEffect } from 'react';
import { Star, ThumbsUp, CheckCircle2, User, MapPin, Calendar, ChevronDown, ChevronUp, Quote, TrendingUp, Users, Briefcase, Heart, Plane } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Review {
  id: string;
  rating: number;
  title?: string;
  content: string;
  authorName: string;
  authorCountry?: string;
  travelType?: 'business' | 'leisure' | 'family' | 'couple' | 'solo';
  stayDate: string;
  createdAt: string;
  verified?: boolean;
  helpful?: number;
  pros?: string[];
  cons?: string[];
}

interface ReviewsSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recommendationRate?: number;
}

interface HotelReviewsProps {
  hotelId: string;
  hotelName?: string;
  compact?: boolean;
  maxReviews?: number;
  showSummary?: boolean;
}

const travelTypeIcons = {
  business: Briefcase,
  leisure: Plane,
  family: Users,
  couple: Heart,
  solo: User,
};

const travelTypeLabels = {
  business: 'Business',
  leisure: 'Leisure',
  family: 'Family',
  couple: 'Couple',
  solo: 'Solo',
};

function RatingStars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : star - 0.5 <= rating
              ? 'fill-yellow-400/50 text-yellow-400'
              : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

function RatingBar({ label, count, total, rating }: { label: string; count: number; total: number; rating: number }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-6 text-gray-600 font-medium">{rating}</span>
      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, delay: rating * 0.1 }}
          className="h-full bg-yellow-400 rounded-full"
        />
      </div>
      <span className="w-8 text-right text-gray-500">{count}</span>
    </div>
  );
}

function ReviewCard({ review, index }: { review: Review; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [helpful, setHelpful] = useState(review.helpful || 0);
  const [hasVoted, setHasVoted] = useState(false);

  const TravelIcon = review.travelType ? travelTypeIcons[review.travelType] : User;
  const travelLabel = review.travelType ? travelTypeLabels[review.travelType] : 'Guest';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const handleHelpful = () => {
    if (!hasVoted) {
      setHelpful(prev => prev + 1);
      setHasVoted(true);
    }
  };

  const shouldTruncate = review.content.length > 200;
  const displayContent = shouldTruncate && !expanded
    ? review.content.substring(0, 200) + '...'
    : review.content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white rounded-xl p-5 border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
            <User className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{review.authorName}</span>
              {review.verified && (
                <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {review.authorCountry && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {review.authorCountry}
                </span>
              )}
              <span className="flex items-center gap-1">
                <TravelIcon className="w-3 h-3" />
                {travelLabel}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <RatingStars rating={review.rating} size="sm" />
          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1 justify-end">
            <Calendar className="w-3 h-3" />
            {formatDate(review.stayDate)}
          </div>
        </div>
      </div>

      {/* Title */}
      {review.title && (
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Quote className="w-4 h-4 text-orange-400" />
          {review.title}
        </h4>
      )}

      {/* Content */}
      <p className="text-gray-600 text-sm leading-relaxed mb-3">
        {displayContent}
        {shouldTruncate && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-orange-600 hover:text-orange-700 font-medium ml-1 inline-flex items-center"
          >
            {expanded ? (
              <>Show less <ChevronUp className="w-3 h-3 ml-0.5" /></>
            ) : (
              <>Read more <ChevronDown className="w-3 h-3 ml-0.5" /></>
            )}
          </button>
        )}
      </p>

      {/* Pros & Cons */}
      {((Array.isArray(review.pros) && review.pros.length > 0) || (Array.isArray(review.cons) && review.cons.length > 0)) && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          {Array.isArray(review.pros) && review.pros.length > 0 && (
            <div className="bg-green-50 rounded-lg p-2.5">
              <span className="text-xs font-semibold text-green-700 block mb-1">Pros</span>
              <ul className="space-y-0.5">
                {review.pros.map((pro, i) => (
                  <li key={i} className="text-xs text-green-600 flex items-center gap-1">
                    <span className="w-1 h-1 bg-green-500 rounded-full" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {Array.isArray(review.cons) && review.cons.length > 0 && (
            <div className="bg-red-50 rounded-lg p-2.5">
              <span className="text-xs font-semibold text-red-700 block mb-1">Cons</span>
              <ul className="space-y-0.5">
                {review.cons.map((con, i) => (
                  <li key={i} className="text-xs text-red-600 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full" />
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <button
          onClick={handleHelpful}
          disabled={hasVoted}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all ${
            hasVoted
              ? 'bg-orange-100 text-orange-600'
              : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600'
          }`}
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-orange-600' : ''}`} />
          Helpful ({helpful})
        </button>
        <span className="text-xs text-gray-400">
          Reviewed {formatDate(review.createdAt)}
        </span>
      </div>
    </motion.div>
  );
}

export function HotelReviews({
  hotelId,
  hotelName,
  compact = false,
  maxReviews = 5,
  showSummary = true,
}: HotelReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'rating_high' | 'rating_low' | 'helpful'>('recent');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/hotels/${hotelId}/reviews?limit=${maxReviews}&sort=${sortBy}`
        );
        const data = await response.json();

        if (data.success) {
          setReviews(data.data || []);
          setSummary(data.summary || null);
        } else {
          setError(data.error || 'Failed to load reviews');
        }
      } catch (err) {
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [hotelId, maxReviews, sortBy]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-24 bg-gray-200 rounded" />
        <div className="h-24 bg-gray-200 rounded" />
      </div>
    );
  }

  if (error || reviews.length === 0) {
    return null; // Silently hide if no reviews
  }

  const displayedReviews = showAll ? reviews : reviews.slice(0, compact ? 2 : 3);

  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      {showSummary && summary && (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Overall Rating */}
            <div className="text-center md:text-left md:border-r md:border-orange-200 md:pr-6">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <span className="text-4xl font-bold text-gray-900">{summary.averageRating}</span>
                <div className="text-left">
                  <RatingStars rating={summary.averageRating} size="md" />
                  <span className="text-sm text-gray-600">{summary.totalReviews} reviews</span>
                </div>
              </div>
              {summary.recommendationRate && (
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>{summary.recommendationRate}% recommend</span>
                </div>
              )}
            </div>

            {/* Rating Distribution */}
            {summary.ratingDistribution && (
              <div className="flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <RatingBar
                    key={rating}
                    label={`${rating} stars`}
                    count={summary.ratingDistribution![rating as 1 | 2 | 3 | 4 | 5]}
                    total={summary.totalReviews}
                    rating={rating}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sort Options */}
      {!compact && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Guest Reviews</h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="recent">Most Recent</option>
            <option value="rating_high">Highest Rated</option>
            <option value="rating_low">Lowest Rated</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <AnimatePresence>
          {displayedReviews.map((review, index) => (
            <ReviewCard key={review.id} review={review} index={index} />
          ))}
        </AnimatePresence>
      </div>

      {/* Show More Button */}
      {reviews.length > (compact ? 2 : 3) && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-3 text-center text-orange-600 hover:text-orange-700 font-semibold bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          Show all {reviews.length} reviews
          <ChevronDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default HotelReviews;
