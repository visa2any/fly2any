'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Tag, Copy, Check, Clock, Plane, ArrowRight, Sparkles,
  CheckCircle2, Users, TrendingUp, Shield, Gift
} from 'lucide-react'

interface PromoDetails {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  description: string
  minSpend?: number
  maxDiscount?: number
  validUntil: Date
  usageCount: number
  applicableProducts: string[]
}

// Mock promo data - In production, fetch from API
const MOCK_PROMOS: Record<string, PromoDetails> = {
  'SAVE20': {
    code: 'SAVE20',
    type: 'percentage',
    value: 20,
    description: 'Get 20% off your next flight booking',
    minSpend: 200,
    maxDiscount: 100,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    usageCount: 1247,
    applicableProducts: ['flight']
  },
  'WELCOME50': {
    code: 'WELCOME50',
    type: 'fixed',
    value: 50,
    description: '$50 off for new customers',
    minSpend: 300,
    validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    usageCount: 3892,
    applicableProducts: ['flight', 'hotel']
  },
  'SUMMER25': {
    code: 'SUMMER25',
    type: 'percentage',
    value: 25,
    description: 'Summer special - 25% off all bookings',
    maxDiscount: 150,
    validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    usageCount: 892,
    applicableProducts: ['flight', 'hotel', 'car']
  }
}

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 })

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = targetDate.getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 })
        return
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60)
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className="flex items-center gap-2">
      {[
        { value: timeLeft.days, label: 'days' },
        { value: timeLeft.hours, label: 'hrs' },
        { value: timeLeft.minutes, label: 'min' }
      ].map((item, i) => (
        <div key={i} className="text-center">
          <div className="bg-white/10 backdrop-blur rounded-lg px-3 py-2 min-w-[50px]">
            <span className="text-2xl font-bold">{item.value}</span>
          </div>
          <span className="text-xs text-white/70 mt-1">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function CouponLandingPage() {
  const params = useParams()
  const router = useRouter()
  const code = (params.code as string)?.toUpperCase()
  const [copied, setCopied] = useState(false)
  const [promo, setPromo] = useState<PromoDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setPromo(MOCK_PROMOS[code] || null)
      setLoading(false)
    }, 500)
  }, [code])

  const handleCopy = async () => {
    if (!promo) return
    await navigator.clipboard.writeText(promo.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleUseCode = () => {
    router.push(`/flights?promo=${code}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!promo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Code Not Found</h1>
          <p className="text-gray-500 mb-6">
            The promo code "{code}" doesn't exist or has expired.
          </p>
          <button
            onClick={() => router.push('/flights')}
            className="w-full py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600"
          >
            Browse Flights Anyway
          </button>
        </div>
      </div>
    )
  }

  const discountText = promo.type === 'percentage'
    ? `${promo.value}% OFF`
    : `$${promo.value} OFF`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-white rounded-full blur-2xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-full mb-6">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Exclusive Offer</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-4">{discountText}</h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
              {promo.description}
            </p>

            {/* Coupon Code Box */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="inline-block bg-white rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center gap-4">
                <div className="bg-primary-50 rounded-xl px-6 py-4">
                  <p className="text-xs text-primary-600 font-medium mb-1">Your Code</p>
                  <p className="text-3xl font-mono font-bold text-primary-600 tracking-wider">
                    {promo.code}
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className={`
                    px-6 py-4 rounded-xl font-semibold transition-all
                    ${copied
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {copied ? (
                    <span className="flex items-center gap-2"><Check className="w-5 h-5" /> Copied!</span>
                  ) : (
                    <span className="flex items-center gap-2"><Copy className="w-5 h-5" /> Copy</span>
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* Countdown */}
            <div className="mt-8">
              <p className="text-white/80 mb-3 flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" /> Offer expires in:
              </p>
              <CountdownTimer targetDate={promo.validUntil} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Details Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Terms */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary-500" /> Offer Details
            </h3>
            <ul className="space-y-3">
              {promo.minSpend && (
                <li className="flex items-start gap-2 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  Minimum spend: ${promo.minSpend}
                </li>
              )}
              {promo.maxDiscount && (
                <li className="flex items-start gap-2 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  Maximum discount: ${promo.maxDiscount}
                </li>
              )}
              <li className="flex items-start gap-2 text-gray-600">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                Valid for: {promo.applicableProducts.join(', ')} bookings
              </li>
              <li className="flex items-start gap-2 text-gray-600">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                Expires: {promo.validUntil.toLocaleDateString()}
              </li>
            </ul>
          </div>

          {/* Social Proof */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-500" /> Trusted by Travelers
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{promo.usageCount.toLocaleString()}+</p>
                  <p className="text-sm text-gray-500">People used this code</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">100% Verified</p>
                  <p className="text-sm text-gray-500">Official Fly2Any promo</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Gift className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Instant Apply</p>
                  <p className="text-sm text-gray-500">Discount applied at checkout</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleUseCode}
          className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
        >
          <Plane className="w-6 h-6" />
          Search Flights with {discountText}
          <ArrowRight className="w-5 h-5" />
        </motion.button>

        <p className="text-center text-gray-500 text-sm mt-4">
          Code will be automatically applied at checkout
        </p>
      </div>
    </div>
  )
}
