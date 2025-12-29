'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star, CheckCircle2, TrendingUp, Users, Award, Sparkles,
  ThumbsUp, MessageCircle, Shield, Plane, Hotel, Heart,
  Quote, ChevronDown, Filter, Verified, Globe
} from 'lucide-react'
import { ReviewCard, ReviewStatsSummary } from '@/components/reviews/ReviewCard'
import { ReviewForm, type ReviewFormData } from '@/components/reviews/ReviewForm'
import type { Review, ReviewStats } from '@/lib/growth/reviews'
import { RelatedLinks, RelatedCTA } from '@/components/seo/RelatedLinks'

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent', icon: '🕐' },
  { value: 'helpful', label: 'Most Helpful', icon: '👍' },
  { value: 'rating_high', label: 'Highest Rated', icon: '⭐' },
  { value: 'rating_low', label: 'Lowest Rated', icon: '📉' }
]

const FILTER_RATINGS = [
  { value: 0, label: 'All Ratings', stars: 0 },
  { value: 5, label: '5 Stars', stars: 5 },
  { value: 4, label: '4 Stars', stars: 4 },
  { value: 3, label: '3 Stars', stars: 3 },
  { value: 2, label: '2 Stars', stars: 2 },
  { value: 1, label: '1 Star', stars: 1 }
]

// Featured testimonials for hero
const featuredTestimonials = [
  { name: 'Sarah M.', location: 'New York', text: 'Saved $340 on my flight to Paris!', rating: 5, avatar: '👩‍💼' },
  { name: 'James R.', location: 'London', text: 'Best travel booking experience ever.', rating: 5, avatar: '👨‍💻' },
  { name: 'Maria L.', location: 'Miami', text: 'Found amazing deals to Tokyo.', rating: 5, avatar: '👩‍🎨' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [sortBy, setSortBy] = useState('recent')
  const [filterRating, setFilterRating] = useState(0)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    fetchReviews()
  }, [sortBy, filterRating, verifiedOnly])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % featuredTestimonials.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

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
    fetchReviews()
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Level-6 Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-600/20 via-transparent to-transparent" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative z-10">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Award className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white/90">Trusted by 15,000+ Travelers</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight">
              Customer <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent">Reviews</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
              Real stories from real travelers. See why thousands choose Fly2Any for their journeys.
            </p>

            {/* Stats Cards */}
            {stats && (
              <motion.div
                className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-4xl font-bold text-white">{stats.averageRating.toFixed(1)}</span>
                    <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                  </div>
                  <p className="text-white/60 text-sm">Average Rating</p>
                </motion.div>
                <motion.div variants={itemVariants} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
                  <p className="text-4xl font-bold text-white mb-2">{stats.totalReviews.toLocaleString()}</p>
                  <p className="text-white/60 text-sm">Total Reviews</p>
                </motion.div>
                <motion.div variants={itemVariants} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
                  <p className="text-4xl font-bold text-white mb-2">{stats.recommendPercentage}%</p>
                  <p className="text-white/60 text-sm">Recommend Us</p>
                </motion.div>
              </motion.div>
            )}

            {/* Rotating Testimonials */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-lg mx-auto"
              >
                <Quote className="w-8 h-8 text-yellow-400/50 mb-3" />
                <p className="text-white text-lg font-medium mb-4">"{featuredTestimonials[activeTestimonial].text}"</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl">{featuredTestimonials[activeTestimonial].avatar}</span>
                  <div className="text-left">
                    <p className="text-white font-semibold">{featuredTestimonials[activeTestimonial].name}</p>
                    <p className="text-white/60 text-sm">{featuredTestimonials[activeTestimonial].location}</p>
                  </div>
                  <div className="flex ml-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Testimonial dots */}
            <div className="flex justify-center gap-2 mt-4">
              {featuredTestimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === activeTestimonial ? 'bg-white w-6' : 'bg-white/40'}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters Bar */}
            <motion.div
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Filter className="w-5 h-5 text-teal-600" />
                <span className="font-semibold text-gray-900">Filter Reviews</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="flex-1 min-w-[140px] px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>
                  ))}
                </select>

                {/* Rating Filter */}
                <select
                  value={filterRating}
                  onChange={e => setFilterRating(parseInt(e.target.value))}
                  className="flex-1 min-w-[140px] px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  {FILTER_RATINGS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.stars > 0 ? '⭐'.repeat(opt.stars) : '🌟'} {opt.label}
                    </option>
                  ))}
                </select>

                {/* Verified Toggle */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                    verifiedOnly
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                      : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Verified Only
                </motion.button>
              </div>
            </motion.div>

            {/* Stats Summary */}
            {stats && <ReviewStatsSummary stats={stats} />}

            {/* Reviews List */}
            <motion.div
              className="space-y-5"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl h-48 animate-pulse shadow-sm" />
                ))
              ) : reviews.length > 0 ? (
                reviews.map((review, idx) => (
                  <motion.div key={review.id} variants={itemVariants}>
                    <ReviewCard review={review} />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  variants={itemVariants}
                  className="bg-white rounded-3xl p-12 text-center shadow-lg border border-gray-100"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Star className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No reviews found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your filters to see more reviews</p>
                  <button
                    onClick={() => { setFilterRating(0); setVerifiedOnly(false); }}
                    className="px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                  >
                    Reset Filters
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Write Review CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl p-6 text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <Sparkles className="w-10 h-10 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Share Your Story</h3>
              <p className="text-white/80 text-sm mb-6">Help fellow travelers by sharing your experience and earn rewards!</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowForm(true)}
                className="w-full py-4 bg-white text-teal-600 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-lg"
              >
                Write a Review
              </motion.button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
            >
              <h4 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-600" />
                Why Trust Fly2Any?
              </h4>
              <div className="space-y-4">
                {[
                  { icon: CheckCircle2, label: 'Verified Purchase Reviews', color: 'from-emerald-500 to-green-600' },
                  { icon: Users, label: '15,000+ Happy Travelers', color: 'from-blue-500 to-indigo-600' },
                  { icon: Award, label: 'Top Rated Flight Search', color: 'from-amber-500 to-orange-600' },
                  { icon: TrendingUp, label: '$2.5M+ Saved by Users', color: 'from-purple-500 to-violet-600' }
                ].map((badge, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3 group"
                    whileHover={{ x: 4 }}
                  >
                    <div className={`w-10 h-10 bg-gradient-to-br ${badge.color} rounded-xl flex items-center justify-center`}>
                      <badge.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{badge.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Rating Breakdown */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
              >
                <h4 className="font-bold text-gray-900 mb-5">Rating Breakdown</h4>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map(rating => {
                    const count = stats.ratingDistribution[rating] || 0
                    const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
                    return (
                      <button
                        key={rating}
                        onClick={() => setFilterRating(rating)}
                        className="w-full flex items-center gap-3 group"
                      >
                        <span className="text-sm font-medium text-gray-600 w-8">{rating}★</span>
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, delay: 0.3 + rating * 0.1 }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-12 text-right">{Math.round(percentage)}%</span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Related Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
            >
              <RelatedLinks category="reviews" variant="vertical" title="Explore More" />
            </motion.div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16">
          <RelatedCTA
            title="Ready to Book Your Trip?"
            description="Join thousands of satisfied travelers. Search flights now and save."
            href="/journey/flights"
            buttonText="Search Flights"
          />
        </div>
      </div>

      {/* Review Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="max-w-lg w-full"
              onClick={e => e.stopPropagation()}
            >
              <ReviewForm onSubmit={handleSubmitReview} onClose={() => setShowForm(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
