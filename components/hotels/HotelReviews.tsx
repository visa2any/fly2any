'use client';

import { useState, useEffect } from 'react';
import { Star, ThumbsUp, CheckCircle2, User, MapPin, Calendar, ChevronDown, ChevronUp, Quote, TrendingUp, Users, Briefcase, Heart, Plane, Sparkles, ThumbsDown, Brain, Lightbulb, AlertCircle } from 'lucide-react';
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

// AI Sentiment Analysis from LiteAPI
interface SentimentAnalysis {
  overallScore: number;
  totalReviews: number;
  categories?: {
    cleanliness?: number;
    service?: number;
    location?: number;
    roomQuality?: number;
    amenities?: number;
    valueForMoney?: number;
    foodAndBeverage?: number;
    overallExperience?: number;
  };
  pros?: string[];
  cons?: string[];
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

// Country code to name mapping
const countryNames: Record<string, string> = {
  us: 'United States', usa: 'United States', 'united states': 'United States',
  br: 'Brazil', bra: 'Brazil', brazil: 'Brazil',
  gb: 'United Kingdom', uk: 'United Kingdom', 'united kingdom': 'United Kingdom',
  ca: 'Canada', can: 'Canada',
  de: 'Germany', deu: 'Germany',
  fr: 'France', fra: 'France',
  es: 'Spain', esp: 'Spain',
  it: 'Italy', ita: 'Italy',
  pt: 'Portugal', prt: 'Portugal',
  au: 'Australia', aus: 'Australia',
  jp: 'Japan', jpn: 'Japan',
  mx: 'Mexico', mex: 'Mexico',
  ar: 'Argentina', arg: 'Argentina',
  cl: 'Chile', chl: 'Chile',
  co: 'Colombia', col: 'Colombia',
  nl: 'Netherlands', nld: 'Netherlands',
  be: 'Belgium', bel: 'Belgium',
  ch: 'Switzerland', che: 'Switzerland',
  at: 'Austria', aut: 'Austria',
  se: 'Sweden', swe: 'Sweden',
  no: 'Norway', nor: 'Norway',
  dk: 'Denmark', dnk: 'Denmark',
  fi: 'Finland', fin: 'Finland',
  ie: 'Ireland', irl: 'Ireland',
  nz: 'New Zealand', nzl: 'New Zealand',
  sg: 'Singapore', sgp: 'Singapore',
  hk: 'Hong Kong', hkg: 'Hong Kong',
  kr: 'South Korea', kor: 'South Korea',
  cn: 'China', chn: 'China',
  in: 'India', ind: 'India',
  ae: 'UAE', are: 'UAE',
  sa: 'Saudi Arabia', sau: 'Saudi Arabia',
  za: 'South Africa', zaf: 'South Africa',
  ru: 'Russia', rus: 'Russia',
  pl: 'Poland', pol: 'Poland',
  cz: 'Czech Republic', cze: 'Czech Republic',
};

const getCountryName = (code: string | undefined): string => {
  if (!code) return '';
  const normalized = code.toLowerCase().trim();
  return countryNames[normalized] || code.toUpperCase();
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
                  {getCountryName(review.authorCountry)}
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

// AI Sentiment Category Card
function SentimentCategoryCard({ label, score, icon }: { label: string; score?: number; icon: React.ReactNode }) {
  if (score === undefined || score === null) return null;

  const getScoreColor = (s: number) => {
    if (s >= 8) return 'text-green-600 bg-green-50';
    if (s >= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getScoreColor(score)}`}>
      {icon}
      <span className="text-sm font-medium">{label}</span>
      <span className="ml-auto font-bold">{score.toFixed(1)}</span>
    </div>
  );
}

// AI Sentiment Section
function AISentimentSection({ sentiment }: { sentiment: SentimentAnalysis }) {
  const categoryIcons: Record<string, React.ReactNode> = {
    cleanliness: <Sparkles className="w-4 h-4" />,
    service: <Users className="w-4 h-4" />,
    location: <MapPin className="w-4 h-4" />,
    roomQuality: <Star className="w-4 h-4" />,
    amenities: <CheckCircle2 className="w-4 h-4" />,
    valueForMoney: <TrendingUp className="w-4 h-4" />,
    foodAndBeverage: <Heart className="w-4 h-4" />,
    overallExperience: <Brain className="w-4 h-4" />,
  };

  const categoryLabels: Record<string, string> = {
    cleanliness: 'Cleanliness',
    service: 'Service',
    location: 'Location',
    roomQuality: 'Room Quality',
    amenities: 'Amenities',
    valueForMoney: 'Value',
    foodAndBeverage: 'Food & Drink',
    overallExperience: 'Experience',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100 mb-6"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Brain className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">AI Sentiment Analysis</h3>
          <p className="text-xs text-gray-500">Analyzed from {sentiment.totalReviews || 'multiple'} guest reviews</p>
        </div>
        <div className="ml-auto text-right">
          <div className="text-3xl font-bold text-purple-600">{sentiment.overallScore?.toFixed(1) || 'N/A'}</div>
          <div className="text-xs text-gray-500">/10 score</div>
        </div>
      </div>

      {/* Category Ratings Grid */}
      {sentiment.categories && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {Object.entries(sentiment.categories).map(([key, value]) => (
            <SentimentCategoryCard
              key={key}
              label={categoryLabels[key] || key}
              score={value}
              icon={categoryIcons[key] || <Star className="w-4 h-4" />}
            />
          ))}
        </div>
      )}

      {/* Pros & Cons from AI */}
      {((sentiment.pros && sentiment.pros.length > 0) || (sentiment.cons && sentiment.cons.length > 0)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* AI-identified Pros */}
          {sentiment.pros && sentiment.pros.length > 0 && (
            <div className="bg-white/70 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-green-700 text-sm">What Guests Love</span>
              </div>
              <ul className="space-y-2">
                {sentiment.pros.slice(0, 5).map((pro, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-green-700">
                    <ThumbsUp className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI-identified Cons */}
          {sentiment.cons && sentiment.cons.length > 0 && (
            <div className="bg-white/70 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <span className="font-semibold text-orange-700 text-sm">Areas for Improvement</span>
              </div>
              <ul className="space-y-2">
                {sentiment.cons.slice(0, 5).map((con, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-orange-700">
                    <ThumbsDown className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
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
  const [sentiment, setSentiment] = useState<SentimentAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'rating_high' | 'rating_low' | 'helpful'>('recent');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/hotels/${hotelId}/reviews?limit=${maxReviews}&sort=${sortBy}&sentiment=true`
        );
        const data = await response.json();

        if (data.success) {
          setReviews(data.data || []);
          setSummary(data.summary || null);
          // Set AI sentiment analysis from LiteAPI
          if (data.sentiment) {
            setSentiment(data.sentiment);
          }
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

  // Show empty state with call to action when no reviews exist
  if (error || reviews.length === 0) {
    return (
      <div className="space-y-6">
        {/* AI Sentiment Analysis - Show even with no individual reviews */}
        {showSummary && sentiment && (
          <AISentimentSection sentiment={sentiment} />
        )}

        {/* No Reviews Yet State */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border border-slate-200 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-orange-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No Reviews Yet
          </h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Be the first to share your experience at {hotelName || 'this hotel'}!
            Guest reviews help other travelers make informed decisions.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Verified stays only</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ThumbsUp className="w-4 h-4 text-blue-500" />
              <span>Helpful ratings</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayedReviews = showAll ? reviews : reviews.slice(0, compact ? 2 : 3);

  return (
    <div className="space-y-6">
      {/* AI Sentiment Analysis Section - Show when available */}
      {showSummary && sentiment && (
        <AISentimentSection sentiment={sentiment} />
      )}

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
