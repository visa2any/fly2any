'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Camera, X, Sparkles, Gift, CheckCircle2 } from 'lucide-react'
import { REVIEW_POINTS } from '@/lib/growth/reviews'

interface ReviewFormProps {
  bookingId?: string
  route?: string
  airline?: string
  onSubmit: (data: ReviewFormData) => Promise<void>
  onClose?: () => void
}

export interface ReviewFormData {
  rating: number
  title: string
  content: string
  pros: string[]
  cons: string[]
  tripType?: 'business' | 'leisure' | 'family' | 'solo'
  images?: File[]
}

const TRIP_TYPES = [
  { value: 'leisure', label: 'Leisure', emoji: '🏖️' },
  { value: 'business', label: 'Business', emoji: '💼' },
  { value: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
  { value: 'solo', label: 'Solo', emoji: '🎒' }
]

function StarSelector({ rating, onChange }: { rating: number; onChange: (r: number) => void }) {
  const [hover, setHover] = useState(0)

  const labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent']

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <motion.button
            key={star}
            type="button"
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(star)}
            className="p-1 focus:outline-none"
          >
            <Star
              className={`w-10 h-10 transition-all duration-150 ${
                star <= (hover || rating)
                  ? 'text-yellow-400 fill-yellow-400 scale-110'
                  : 'text-gray-200'
              }`}
            />
          </motion.button>
        ))}
      </div>
      <p className={`text-sm font-medium h-5 ${rating ? 'text-gray-700' : 'text-gray-400'}`}>
        {labels[hover || rating] || 'Tap to rate'}
      </p>
    </div>
  )
}

export function ReviewForm({ bookingId, route, airline, onSubmit, onClose }: ReviewFormProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 0,
    title: '',
    content: '',
    pros: [''],
    cons: [''],
    tripType: undefined,
    images: []
  })

  const addPro = () => setFormData(d => ({ ...d, pros: [...d.pros, ''] }))
  const addCon = () => setFormData(d => ({ ...d, cons: [...d.cons, ''] }))
  const updatePro = (i: number, v: string) => setFormData(d => ({ ...d, pros: d.pros.map((p, idx) => idx === i ? v : p) }))
  const updateCon = (i: number, v: string) => setFormData(d => ({ ...d, cons: d.cons.map((c, idx) => idx === i ? v : c) }))
  const removePro = (i: number) => setFormData(d => ({ ...d, pros: d.pros.filter((_, idx) => idx !== i) }))
  const removeCon = (i: number) => setFormData(d => ({ ...d, cons: d.cons.filter((_, idx) => idx !== i) }))

  const canProceed = () => {
    if (step === 1) return formData.rating > 0
    if (step === 2) return formData.title.length >= 5 && formData.content.length >= 20
    return true
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await onSubmit({
        ...formData,
        pros: formData.pros.filter(p => p.trim()),
        cons: formData.cons.filter(c => c.trim())
      })
      setSuccess(true)
    } finally {
      setSubmitting(false)
    }
  }

  const pointsPreview = REVIEW_POINTS.submit +
    (formData.images?.length ? REVIEW_POINTS.withPhoto : 0) +
    (bookingId ? REVIEW_POINTS.verified : 0)

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
        <p className="text-gray-600 mb-4">Your review has been submitted for approval.</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-xl font-medium">
          <Gift className="w-5 h-5" />
          +{pointsPreview} points earned!
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="block w-full mt-6 py-3 text-gray-600 hover:text-gray-900"
          >
            Close
          </button>
        )}
      </motion.div>
    )
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 md:p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Write a Review</h3>
            {route && <p className="text-white/80 text-sm mt-1">{route} • {airline}</p>}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-xl">
            <Sparkles className="w-4 h-4" />
            <span className="font-semibold">+{pointsPreview} pts</span>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mt-4">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors ${
                s <= step ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Rating & Trip Type */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                  How was your experience?
                </label>
                <StarSelector
                  rating={formData.rating}
                  onChange={r => setFormData(d => ({ ...d, rating: r }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What type of trip was this?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {TRIP_TYPES.map(type => (
                    <motion.button
                      key={type.value}
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setFormData(d => ({ ...d, tripType: type.value as any }))}
                      className={`
                        p-3 rounded-xl border-2 text-center transition-all duration-150
                        ${formData.tripType === type.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <span className="text-2xl">{type.emoji}</span>
                      <p className="text-sm font-medium text-gray-700 mt-1">{type.label}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Review Content */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(d => ({ ...d, title: e.target.value }))}
                  placeholder="Summarize your experience"
                  className="w-full px-4 py-3 rounded-xl border-[1.5px] border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review
                </label>
                <textarea
                  value={formData.content}
                  onChange={e => setFormData(d => ({ ...d, content: e.target.value }))}
                  placeholder="Share your experience with others. What did you like? What could be improved?"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-[1.5px] border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
                  maxLength={1000}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {formData.content.length}/1000
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 3: Pros, Cons, Photos */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Pros */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pros (Optional)
                </label>
                <div className="space-y-2">
                  {formData.pros.map((pro, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={pro}
                        onChange={e => updatePro(i, e.target.value)}
                        placeholder="What did you like?"
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500/20"
                      />
                      {formData.pros.length > 1 && (
                        <button type="button" onClick={() => removePro(i)} className="p-2 text-gray-400 hover:text-red-500">
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {formData.pros.length < 5 && (
                    <button type="button" onClick={addPro} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                      + Add another pro
                    </button>
                  )}
                </div>
              </div>

              {/* Cons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cons (Optional)
                </label>
                <div className="space-y-2">
                  {formData.cons.map((con, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={con}
                        onChange={e => updateCon(i, e.target.value)}
                        placeholder="What could be improved?"
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-400 focus:ring-1 focus:ring-red-400/20"
                      />
                      {formData.cons.length > 1 && (
                        <button type="button" onClick={() => removeCon(i)} className="p-2 text-gray-400 hover:text-red-500">
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {formData.cons.length < 5 && (
                    <button type="button" onClick={addCon} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                      + Add another con
                    </button>
                  )}
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Photos (Optional) <span className="text-primary-500">+{REVIEW_POINTS.withPhoto} pts</span>
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-gray-300 transition-colors cursor-pointer">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Click to upload photos</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-4 md:p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep((step - 1) as 1 | 2)}
            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            Back
          </button>
        )}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => step < 3 ? setStep((step + 1) as 2 | 3) : handleSubmit()}
          disabled={!canProceed() || submitting}
          className="flex-1 py-3 px-6 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
        >
          {submitting ? 'Submitting...' : step < 3 ? 'Continue' : 'Submit Review'}
        </motion.button>
      </div>
    </div>
  )
}
