'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Star, Filter, ChevronDown, CheckCircle2, TrendingUp,
  Users, Award, Sparkles
} from 'lucide-react'
import { ReviewCard, ReviewStatsSummary } from '@/components/reviews/ReviewCard'
import { ReviewForm, type ReviewFormData } from '@/components/reviews/ReviewForm'
import type { Review, ReviewStats } from '@/lib/growth/reviews'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { ReviewsAnswers } from '@/components/seo/DirectAnswerBlock'

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'helpful', label: 'Most Helpful' },
  { value: 'rating_high', label: 'Highest Rated' },
  { value: 'rating_low', label: 'Lowest Rated' }
]

const FILTER_RATINGS = [
  { value: 0, label: 'All Ratings' },
  { value: 5, label: '5 Stars' },
  { value: 4, label: '4 Stars' },
  { value: 3, label: '3 Stars' },
  { value: 2, label: '2 Stars' },
  { value: 1, label: '1 Star' }
]

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [sortBy, setSortBy] = useState('recent')
  const [filterRating, setFilterRating] = useState(0)
  const [verifiedOnly, setVerifiedOnly] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [sortBy, filterRating, verifiedOnly])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        sortBy,
        ...(filterRating && { rating: filterRating.toString() }),
        ...(verifiedOnly && { verified: 'true' })
      })

      const res = await fetch(`/api/reviews?${params}`)
      const data = await res.json()

      if (data.success) {
        setReviews(data.data.reviews)
        setStats(data.data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (formData: ReviewFormData) => {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    const data = await res.json()
    if (!data.success) throw new Error(data.error)

    // Refresh reviews
    fetchReviews()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by Thousands of Travelers
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              See what our community says about their Fly2Any experience
            </p>

            {/* Quick Stats */}
            {stats && (
              <div className="flex items-center justify-center gap-8 mt-8 flex-wrap">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-4xl font-bold">{stats.averageRating.toFixed(1)}</span>
                    <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                  </div>
                  <p className="text-white/70 text-sm">Average Rating</p>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div className="text-center">
                  <p className="text-4xl font-bold">{stats.totalReviews.toLocaleString()}</p>
                  <p className="text-white/70 text-sm">Total Reviews</p>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div className="text-center">
                  <p className="text-4xl font-bold">{stats.recommendPercentage}%</p>
                  <p className="text-white/70 text-sm">Recommend</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters Bar */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
              <div className="flex flex-wrap items-center gap-4">
                {/* Sort */}
                <div className="flex-1 min-w-[150px]">
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  >
                    {SORT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Rating Filter */}
                <div className="flex-1 min-w-[150px]">
                  <select
                    value={filterRating}
                    onChange={e => setFilterRating(parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  >
                    {FILTER_RATINGS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Verified Toggle */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${verifiedOnly
                      ? 'bg-green-100 text-green-700 border-2 border-green-200'
                      : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }
                  `}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Verified Only
                </motion.button>
              </div>
            </div>

            {/* Stats Summary */}
            {stats && <ReviewStatsSummary stats={stats} />}

            {/* Reviews List */}
            <div className="space-y-4">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl h-48 animate-pulse" />
                ))
              ) : reviews.length > 0 ? (
                reviews.map((review, idx) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <ReviewCard review={review} />
                  </motion.div>
                ))
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews found</h3>
                  <p className="text-gray-500">Try adjusting your filters</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Write Review CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white"
            >
              <Sparkles className="w-8 h-8 mb-3" />
              <h3 className="text-xl font-bold mb-2">Share Your Experience</h3>
              <p className="text-white/80 text-sm mb-4">
                Help fellow travelers by sharing your review and earn rewards!
              </p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowForm(true)}
                className="w-full py-3 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Write a Review
              </motion.button>
            </motion.div>

            {/* Trust Badges */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-4">
              <h4 className="font-semibold text-gray-900">Why Trust Fly2Any?</h4>
              {[
                { icon: CheckCircle2, label: 'Verified Purchase Reviews', color: 'text-green-500' },
                { icon: Users, label: '15,000+ Happy Travelers', color: 'text-blue-500' },
                { icon: Award, label: 'Top Rated Flight Search', color: 'text-yellow-500' },
                { icon: TrendingUp, label: '$2.5M+ Saved by Users', color: 'text-purple-500' }
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-3">
                  <badge.icon className={`w-5 h-5 ${badge.color}`} />
                  <span className="text-sm text-gray-700">{badge.label}</span>
                </div>
              ))}
            </div>

            {/* AEO Quick Answers */}
            <div className="mb-6">
              <ReviewsAnswers />
            </div>

            {/* Related Links */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <RelatedLinks
                category="reviews"
                variant="vertical"
                title="Explore More"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg w-full"
          >
            <ReviewForm
              onSubmit={handleSubmitReview}
              onClose={() => setShowForm(false)}
            />
          </motion.div>
        </div>
      )}
    </div>
  )
}
