'use client'

/**
 * Stripe Payment Form Component
 * Integrated Stripe Elements for secure hotel booking payments
 */

import { useState, useEffect } from 'react'
import { useStripe, useElements, CardElement, PaymentElement } from '@stripe/react-stripe-js'
import { CreditCard, Lock, AlertCircle } from 'lucide-react'

interface StripePaymentFormProps {
  amount: number
  currency: string
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
  disabled?: boolean
}

export function StripePaymentForm({
  amount,
  currency,
  onSuccess,
  onError,
  disabled = false,
}: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      setErrorMessage('Payment system is loading. Please wait.')
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    try {
      // Submit the payment to Stripe
      const { error: submitError } = await elements.submit()

      if (submitError) {
        throw new Error(submitError.message)
      }

      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: `${window.location.origin}/hotels/booking/confirmation`,
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id)
      } else {
        throw new Error('Payment was not successful. Please try again.')
      }
    } catch (err: any) {
      console.error('Payment error:', err)
      const message = err.message || 'An unexpected error occurred. Please try again.'
      setErrorMessage(message)
      onError(message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Security Badge */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
        <Lock className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-green-900">Secure Payment</p>
          <p className="text-xs text-green-700 mt-1">
            Your payment information is encrypted and secure. We use industry-leading payment processing by Stripe.
          </p>
        </div>
      </div>

      {/* Payment Amount Summary */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-gray-700 font-medium">Total Amount</span>
          <span className="text-2xl font-bold text-primary-600">{formattedAmount}</span>
        </div>
      </div>

      {/* Stripe Payment Element */}
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-gray-700 flex items-center space-x-2 mb-3">
            <CreditCard className="h-4 w-4" />
            <span>Payment Details</span>
          </span>
          <div className="border border-gray-300 rounded-lg p-4 bg-white focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
            <PaymentElement
              options={{
                layout: 'tabs',
                fields: {
                  billingDetails: {
                    address: 'auto',
                  },
                },
              }}
            />
          </div>
        </label>

        {/* Accepted Cards */}
        <div className="flex items-center space-x-3 text-xs text-gray-500">
          <span>We accept:</span>
          <div className="flex items-center space-x-2">
            <img src="/images/cards/visa.svg" alt="Visa" className="h-6" onError={(e) => e.currentTarget.style.display = 'none'} />
            <img src="/images/cards/mastercard.svg" alt="Mastercard" className="h-6" onError={(e) => e.currentTarget.style.display = 'none'} />
            <img src="/images/cards/amex.svg" alt="Amex" className="h-6" onError={(e) => e.currentTarget.style.display = 'none'} />
            <span className="text-gray-400">Visa • Mastercard • Amex • Discover</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-900">Payment Error</p>
            <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing || disabled}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-white text-lg transition-all duration-200 flex items-center justify-center space-x-3 ${
          !stripe || isProcessing || disabled
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
        }`}
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <Lock className="h-5 w-5" />
            <span>Complete Booking - {formattedAmount}</span>
          </>
        )}
      </button>

      {/* Trust Indicators */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-green-600 font-bold text-sm">256-bit SSL</div>
          <div className="text-xs text-gray-500">Encryption</div>
        </div>
        <div className="text-center">
          <div className="text-green-600 font-bold text-sm">PCI DSS</div>
          <div className="text-xs text-gray-500">Compliant</div>
        </div>
        <div className="text-center">
          <div className="text-green-600 font-bold text-sm">3D Secure</div>
          <div className="text-xs text-gray-500">Protected</div>
        </div>
      </div>
    </form>
  )
}
