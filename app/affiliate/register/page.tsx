'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Award,
  Building2,
  Globe,
  Mail,
  CreditCard,
  Code,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Info,
  TrendingUp,
  DollarSign,
  Users,
  Lock,
  Shield
} from 'lucide-react'
import toast from 'react-hot-toast'

interface FormData {
  businessName: string
  website: string
  taxId: string
  description: string
  payoutEmail: string
  payoutMethod: 'paypal' | 'stripe' | 'bank_transfer'
  referralCode: string
  agreeToTerms: boolean
}

export default function AffiliateRegisterPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    website: '',
    taxId: '',
    description: '',
    payoutEmail: '',
    payoutMethod: 'paypal',
    referralCode: '',
    agreeToTerms: false,
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [checkingExisting, setCheckingExisting] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/affiliate/register')
    } else if (status === 'authenticated') {
      checkExistingAffiliate()
      if (session.user?.email) {
        setFormData(prev => ({
          ...prev,
          payoutEmail: session.user.email,
        }))
      }
    }
  }, [status, session])

  const checkExistingAffiliate = async () => {
    try {
      const response = await fetch('/api/affiliates/me')
      if (response.ok) {
        // User already has affiliate account
        toast.success('You already have an affiliate account!')
        router.push('/affiliate/dashboard')
      }
    } catch (error) {
      // No affiliate account, continue with registration
    } finally {
      setCheckingExisting(false)
    }
  }

  const generateReferralCode = () => {
    if (!session?.user?.email) return

    const emailPrefix = session.user.email.split('@')[0].substring(0, 6).toUpperCase()
    const randomNum = Math.floor(Math.random() * 1000)
    const code = `${emailPrefix}${randomNum}`

    setFormData(prev => ({ ...prev, referralCode: code }))
    toast.success('Referral code generated!')
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.payoutEmail.trim()) {
      newErrors.payoutEmail = 'Payout email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.payoutEmail)) {
      newErrors.payoutEmail = 'Invalid email format'
    }

    if (!formData.referralCode.trim()) {
      newErrors.referralCode = 'Referral code is required'
    } else if (!/^[A-Z0-9]{4,20}$/.test(formData.referralCode)) {
      newErrors.referralCode = 'Code must be 4-20 uppercase letters/numbers only'
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the form errors')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/affiliates/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: formData.businessName.trim() || null,
          website: formData.website.trim() || null,
          taxId: formData.taxId.trim() || null,
          description: formData.description.trim() || null,
          payoutEmail: formData.payoutEmail.trim(),
          payoutMethod: formData.payoutMethod,
          referralCode: formData.referralCode.trim().toUpperCase(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error) {
          toast.error(data.error)
        } else {
          toast.error('Failed to register as affiliate')
        }
        return
      }

      toast.success('Affiliate application submitted successfully!')
      toast.success('Your application is pending admin approval')

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/affiliate/dashboard')
      }, 1500)

    } catch (error) {
      console.error('Registration error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (status === 'loading' || checkingExisting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
            <Award className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Become a Fly2Any Affiliate Partner
          </h1>
          <p className="text-lg text-gray-600">
            Earn up to 35% commission on every booking you refer
          </p>
        </div>

        {/* Benefits Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md border-2 border-blue-100">
            <TrendingUp className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">High Commission</h3>
            <p className="text-sm text-gray-600">15-35% of our profit on every sale</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border-2 border-purple-100">
            <DollarSign className="h-8 w-8 text-purple-600 mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">Low Payout Threshold</h3>
            <p className="text-sm text-gray-600">Withdraw earnings at just $50</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border-2 border-green-100">
            <Users className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">5-Tier System</h3>
            <p className="text-sm text-gray-600">Grow your commission as you succeed</p>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Information Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Business Information (Optional)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => handleChange('businessName', e.target.value)}
                    placeholder="Your Company LLC"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleChange('website', e.target.value)}
                      placeholder="https://yoursite.com"
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax ID / EIN (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.taxId}
                    onChange={(e) => handleChange('taxId', e.target.value)}
                    placeholder="For 1099 tax reporting"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tell us about your marketing channels
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="e.g., Travel blog with 50k monthly visitors, Instagram account @travelgram with 100k followers..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Payout Settings Section */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                Payout Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payout Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.payoutEmail}
                      onChange={(e) => handleChange('payoutEmail', e.target.value)}
                      placeholder="payouts@yourcompany.com"
                      required
                      className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.payoutEmail ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.payoutEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.payoutEmail}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {(['paypal', 'stripe', 'bank_transfer'] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => handleChange('payoutMethod', method)}
                        className={`p-4 border-2 rounded-lg text-center transition-all ${
                          formData.payoutMethod === method
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium capitalize">{method.replace('_', ' ')}</div>
                        {formData.payoutMethod === method && (
                          <CheckCircle2 className="h-5 w-5 text-blue-600 mx-auto mt-2" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Referral Code Section */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Code className="h-5 w-5 text-purple-600" />
                Your Unique Referral Code
              </h2>
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-purple-900">
                    <p className="font-medium mb-1">This code will be in your tracking URL</p>
                    <p className="text-purple-700">
                      Example: fly2any.com/?ref=<strong>{formData.referralCode || 'YOUR123'}</strong>
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={formData.referralCode}
                    onChange={(e) => handleChange('referralCode', e.target.value.toUpperCase())}
                    placeholder="e.g., TRAVEL2024"
                    required
                    maxLength={20}
                    pattern="[A-Z0-9]{4,20}"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-lg ${
                      errors.referralCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.referralCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.referralCode}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    4-20 characters, uppercase letters and numbers only
                  </p>
                </div>
                <button
                  type="button"
                  onClick={generateReferralCode}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <Sparkles className="h-5 w-5" />
                  Auto-Generate
                </button>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="border-t border-gray-200 pt-6">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) => handleChange('agreeToTerms', e.target.checked)}
                    className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <span className="text-gray-900 font-medium">
                      I agree to the Affiliate Terms & Conditions <span className="text-red-500">*</span>
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      By registering, you agree to our commission structure, payout terms, and affiliate guidelines.
                    </p>
                  </div>
                </label>
                {errors.agreeToTerms && (
                  <p className="mt-2 text-sm text-red-600">{errors.agreeToTerms}</p>
                )}
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Your application will be reviewed</p>
                <p className="text-blue-700">
                  Our team typically reviews applications within 1-2 business days. You'll receive an email once approved.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Application</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Commission Tiers Preview */}
        <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Commission Tier Structure
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {[
              { tier: 'Starter', trips: '0-4', commission: '15%', color: 'gray' },
              { tier: 'Bronze', trips: '5-14', commission: '20%', color: 'orange' },
              { tier: 'Silver', trips: '15-29', commission: '25%', color: 'gray' },
              { tier: 'Gold', trips: '30-49', commission: '30%', color: 'yellow' },
              { tier: 'Platinum', trips: '50+', commission: '35%', color: 'purple' },
            ].map((tier) => (
              <div key={tier.tier} className={`bg-${tier.color}-50 border border-${tier.color}-200 rounded-lg p-4 text-center`}>
                <div className="font-bold text-gray-900">{tier.tier}</div>
                <div className="text-sm text-gray-600 my-1">{tier.trips} trips/mo</div>
                <div className="text-lg font-bold text-blue-600">{tier.commission}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
