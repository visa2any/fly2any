'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Star, ThumbsUp, ThumbsDown, CheckCircle2, Quote,
  Plane, Calendar, User, Flag, MessageSquare, ChevronDown
} from 'lucide-react'
import type { Review } from '@/lib/growth/reviews'

const TRIP_TYPE_LABELS: Record<string, string> = {
  business: 'Business',
  leisure: 'Leisure',
  family: 'Family',
  solo: 'Solo'
}

interface ReviewCardProps {
  review: Review
  onHelpful?: (reviewId: string, helpful: boolean) => void
  onFlag?: (reviewId: string) => void
  compact?: boolean
}

function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5' }

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

export function ReviewCard({ review, onHelpful, onFlag, compact = false }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [voted, setVoted] = useState<'helpful' | 'not' | null>(null)

  const handleVote = (helpful: boolean) => {
    if (voted) return
    setVoted(helpful ? 'helpful' : 'not')
    onHelpful?.(review.id, helpful)
  }

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-white rounded-2xl p-4 shadow-md border border-gray-100"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {review.userName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900 text-sm">{review.userName}</span>
              {review.verified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              )}
            </div>
            <StarRating rating={review.rating} size="sm" />
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{review.content}</p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
      className="w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 md:p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0 shadow-md">
            {review.userAvatar ? (
              <img src={review.userAvatar} alt="" className="w-full h-full rounded-xl object-cover" />
            ) : (
              review.userName[0]
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900">{review.userName}</span>
              {review.verified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              )}
              {review.tripType && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {TRIP_TYPE_LABELS[review.tripType]}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <StarRating rating={review.rating} />
              <span className="text-sm text-gray-500">
                {new Date(review.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>

            {/* Route/Flight info */}
            {review.route && (
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span className="inline-flex items-center gap-1.5">
                  <Plane className="w-4 h-4 text-primary-500" />
                  {review.route}
                </span>
                {review.airline && (
                  <span className="text-gray-400">• {review.airline}</span>
                )}
                {review.travelDate && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {review.travelDate}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Title & Content */}
        <div className="mt-4">
          <h4 className="font-semibold text-gray-900 text-lg">{review.title}</h4>
          <p className={`mt-2 text-gray-600 leading-relaxed ${!expanded && 'line-clamp-3'}`}>
            {review.content}
          </p>
          {review.content.length > 200 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-sm text-primary-600 font-medium hover:text-primary-700 inline-flex items-center gap-1"
            >
              {expanded ? 'Show less' : 'Read more'}
              <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {/* Pros & Cons */}
        {(review.pros?.length || review.cons?.length) && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {review.pros?.length ? (
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-green-700 mb-2">Pros</p>
                <ul className="space-y-1">
                  {review.pros.map((pro, i) => (
                    <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {review.cons?.length ? (
              <div className="bg-red-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-red-700 mb-2">Cons</p>
                <ul className="space-y-1">
                  {review.cons.map((con, i) => (
                    <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">✗</span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}

        {/* Business Response */}
        {review.response && (
          <div className="mt-4 bg-gray-50 rounded-xl p-4 border-l-4 border-primary-500">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-semibold text-gray-900">Response from Fly2Any</span>
            </div>
            <p className="text-sm text-gray-600">{review.response.content}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Was this helpful?</span>
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleVote(true)}
                disabled={!!voted}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                  transition-all duration-150
                  ${voted === 'helpful'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                  ${voted && voted !== 'helpful' ? 'opacity-50' : ''}
                `}
              >
                <ThumbsUp className="w-4 h-4" />
                {review.helpful + (voted === 'helpful' ? 1 : 0)}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleVote(false)}
                disabled={!!voted}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                  transition-all duration-150
                  ${voted === 'not'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                  ${voted && voted !== 'not' ? 'opacity-50' : ''}
                `}
              >
                <ThumbsDown className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          <button
            onClick={() => onFlag?.(review.id)}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// Review Stats Summary Component
export function ReviewStatsSummary({ stats }: { stats: { averageRating: number; totalReviews: number; ratingDistribution: Record<number, number> } }) {
  const maxCount = Math.max(...Object.values(stats.ratingDistribution))

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6">
      <div className="flex items-center gap-6 flex-wrap">
        {/* Average Rating */}
        <div className="text-center">
          <p className="text-5xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
          <StarRating rating={Math.round(stats.averageRating)} size="lg" />
          <p className="text-sm text-gray-500 mt-1">{stats.totalReviews.toLocaleString()} reviews</p>
        </div>

        {/* Distribution */}
        <div className="flex-1 min-w-[200px] space-y-2">
          {[5, 4, 3, 2, 1].map(rating => (
            <div key={rating} className="flex items-center gap-2">
              <span className="text-sm text-gray-600 w-3">{rating}</span>
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.ratingDistribution[rating] / maxCount) * 100}%` }}
                  transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                  className="h-full bg-yellow-400 rounded-full"
                />
              </div>
              <span className="text-sm text-gray-500 w-12 text-right">
                {stats.ratingDistribution[rating]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
