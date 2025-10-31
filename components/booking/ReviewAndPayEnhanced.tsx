'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Lock, Clock, ChevronDown, ChevronUp, MapPin, Wallet } from 'lucide-react';
import { StripePaymentForm } from './StripePaymentForm';

interface PaymentData {
  method: 'card' | 'hold';
  isHold?: boolean;
  holdDuration?: number;
  cardNumber?: string;
  cardName?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  billingAddress?: string;
  billingCity?: string;
  billingZip?: string;
  billingCountry?: string;
  saveCard?: boolean;
}

interface DOTCompliance {
  noCarryOn: boolean;
  noCheckedBag: boolean;
  nonRefundable: boolean;
  noChanges: boolean;
  totalPrice: boolean;
  hour24Cancellation: boolean;
}

interface HoldTier {
  label: string;
  hours: number;
  price: number;
  currency: string;
  description: string;
}

interface ReviewAndPayEnhancedProps {
  flightSummary: {
    route: string;
    date: string;
    airline: string;
    fareClass: string;
    passengers: number;
  };
  totalPrice: number;
  currency: string;
  onSubmit: (paymentData: PaymentData) => void;
  onPaymentSuccess?: (paymentIntentId: string) => void;
  isProcessing?: boolean;
  requiresDOTCompliance?: boolean;
  formId?: string;
  clientSecret?: string;
  bookingReference?: string;
}

export function ReviewAndPayEnhanced({
  flightSummary,
  totalPrice,
  currency,
  onSubmit,
  onPaymentSuccess,
  isProcessing = false,
  requiresDOTCompliance = false,
  formId,
  clientSecret,
  bookingReference,
}: ReviewAndPayEnhancedProps) {
  const [paymentMode, setPaymentMode] = useState<'now' | 'hold'>('now');
  const [selectedHoldDuration, setSelectedHoldDuration] = useState(24);
  const [expandedSection, setExpandedSection] = useState<'flight' | null>(null);
  const [sameAsContact, setSameAsContact] = useState(true);

  // Hold pricing tiers
  const holdTiers: HoldTier[] = [
    { label: '6 Hours', hours: 6, price: 19.99, currency: 'USD', description: 'Quick decision' },
    { label: '24 Hours', hours: 24, price: 39.99, currency: 'USD', description: 'Standard hold' },
    { label: '48 Hours', hours: 48, price: 59.99, currency: 'USD', description: 'Extended hold' },
    { label: '72 Hours', hours: 72, price: 89.99, currency: 'USD', description: 'Maximum hold' },
  ];

  const selectedTier = holdTiers.find(t => t.hours === selectedHoldDuration) || holdTiers[1];
  const holdPrice = selectedTier.price;
  const finalTotal = paymentMode === 'hold' ? holdPrice : totalPrice;

  // DOT Compliance checkboxes
  const [dotCompliance, setDotCompliance] = useState<DOTCompliance>({
    noCarryOn: false,
    noCheckedBag: false,
    nonRefundable: false,
    noChanges: false,
    totalPrice: false,
    hour24Cancellation: false,
  });

  const allDOTChecked = Object.values(dotCompliance).every(v => v);

  // Calculate hold expiration
  const getHoldExpiration = () => {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + selectedHoldDuration);
    return expiresAt;
  };

  const handleStripeSuccess = (paymentIntentId: string) => {
    if (onPaymentSuccess) {
      onPaymentSuccess(paymentIntentId);
    }
  };

  const handleStripeError = (error: string) => {
    console.error('Stripe payment error:', error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (requiresDOTCompliance && !allDOTChecked) {
      alert('Please acknowledge all fare restrictions before proceeding.');
      return;
    }

    const paymentData: PaymentData = {
      method: paymentMode === 'hold' ? 'hold' : 'card',
      isHold: paymentMode === 'hold',
      holdDuration: paymentMode === 'hold' ? selectedHoldDuration : undefined,
    };

    onSubmit(paymentData);
  };

  const toggleSection = (section: 'flight') => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4">
      {/* Flight Summary (Collapsible) */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => toggleSection('flight')}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
              ✈️
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold text-gray-900">Flight Details</h4>
              <p className="text-xs text-gray-600">{flightSummary.route} • {flightSummary.date}</p>
            </div>
          </div>
          {expandedSection === 'flight' ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSection === 'flight' && (
          <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Airline:</span>
                <p className="font-semibold text-gray-900">{flightSummary.airline}</p>
              </div>
              <div>
                <span className="text-gray-600">Fare Class:</span>
                <p className="font-semibold text-gray-900">{flightSummary.fareClass}</p>
              </div>
              <div>
                <span className="text-gray-600">Passengers:</span>
                <p className="font-semibold text-gray-900">{flightSummary.passengers}</p>
              </div>
              <div>
                <span className="text-gray-600">Total:</span>
                <p className="font-bold text-primary-600 text-lg">{currency} {totalPrice.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Mode Toggle */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Choose Payment Option</h3>

        <div className="grid grid-cols-2 gap-3">
          {/* Pay Now */}
          <button
            type="button"
            onClick={() => setPaymentMode('now')}
            className={`
              p-4 rounded-lg border-2 transition-all text-left
              ${paymentMode === 'now'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className={`w-5 h-5 ${paymentMode === 'now' ? 'text-primary-600' : 'text-gray-400'}`} />
              <span className="font-bold text-sm text-gray-900">Pay Now</span>
            </div>
            <p className="text-xs text-gray-600">Instant booking confirmation</p>
            <p className="text-sm font-bold text-gray-900 mt-2">{currency} {totalPrice.toFixed(2)}</p>
          </button>

          {/* Hold Booking */}
          <button
            type="button"
            onClick={() => setPaymentMode('hold')}
            className={`
              p-4 rounded-lg border-2 transition-all text-left
              ${paymentMode === 'hold'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className={`w-5 h-5 ${paymentMode === 'hold' ? 'text-primary-600' : 'text-gray-400'}`} />
              <span className="font-bold text-sm text-gray-900">Hold Booking</span>
            </div>
            <p className="text-xs text-gray-600">Reserve now, pay later</p>
            <p className="text-sm font-bold text-gray-900 mt-2">
              {holdPrice === 0 ? 'FREE' : `${currency} ${holdPrice.toFixed(2)}`}
            </p>
          </button>
        </div>
      </div>

      {/* Hold Duration Selector */}
      {paymentMode === 'hold' && (
        <div className="border border-primary-200 rounded-lg overflow-hidden bg-primary-50 p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-600" />
            Select Hold Duration
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {holdTiers.map((tier) => (
              <button
                key={tier.hours}
                type="button"
                onClick={() => setSelectedHoldDuration(tier.hours)}
                className={`
                  p-3 rounded-lg border-2 transition-all text-left
                  ${selectedHoldDuration === tier.hours
                    ? 'border-primary-500 bg-white shadow-md'
                    : 'border-primary-200 bg-white hover:border-primary-300'
                  }
                `}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-gray-900">{tier.label}</span>
                  <span className={`text-xs font-bold ${tier.price === 0 ? 'text-success-600' : 'text-primary-600'}`}>
                    {tier.price === 0 ? 'FREE' : `$${tier.price}`}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{tier.description}</p>
              </button>
            ))}
          </div>

          <div className="mt-4 p-3 bg-white rounded-lg border border-primary-200">
            <p className="text-xs font-semibold text-gray-700">Hold expires:</p>
            <p className="text-sm font-bold text-primary-600">
              {getHoldExpiration().toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      )}

      {/* Stripe Payment Form (Only for "Pay Now") */}
      {paymentMode === 'now' && clientSecret && (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <div className="p-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              <h3 className="text-base font-bold">Secure Payment</h3>
            </div>
            <p className="text-xs mt-1 opacity-90">
              Your payment information is encrypted with 256-bit SSL
            </p>
          </div>

          <div className="p-4">
            <StripePaymentForm
              clientSecret={clientSecret}
              amount={finalTotal}
              currency={currency}
              bookingReference={bookingReference || 'temp'}
              onSuccess={handleStripeSuccess}
              onError={handleStripeError}
            />
          </div>
        </div>
      )}

      {/* DOT Compliance Checklist */}
      {requiresDOTCompliance && (
        <div className="border-2 border-warning-300 bg-warning-50 rounded-lg p-4">
          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>⚠️</span> Before Completing Your Purchase
          </h4>

          <div className="space-y-2">
            {[
              { key: 'noCarryOn', text: 'I understand: No carry-on bag allowed (personal item only)' },
              { key: 'noCheckedBag', text: 'I understand: No checked baggage included' },
              { key: 'nonRefundable', text: 'I understand: This ticket is non-refundable' },
              { key: 'noChanges', text: 'I understand: Changes are not permitted' },
              { key: 'totalPrice', text: `I confirm the total price is ${currency} ${finalTotal.toFixed(2)}` },
              { key: 'hour24Cancellation', text: 'I understand I have 24 hours to cancel for a full refund' },
            ].map(({ key, text }) => (
              <label key={key} className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dotCompliance[key as keyof DOTCompliance]}
                  onChange={(e) => setDotCompliance(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="mt-0.5 w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  required
                />
                <span className="text-xs text-gray-800">{text}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Terms & Conditions */}
      <div className="border border-gray-300 rounded-lg p-4 bg-white">
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
            required
          />
          <span className="text-xs text-gray-700">
            I accept the <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary-600 underline hover:text-primary-700 font-semibold">Terms of Service</a> and{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-600 underline hover:text-primary-700 font-semibold">Privacy Policy</a>
          </span>
        </label>
      </div>

      {/* Submit Button (Only show for hold bookings, Stripe handles payment for instant) */}
      {paymentMode === 'hold' && (
        <div className="border-2 border-primary-500 rounded-lg p-4 bg-gradient-to-br from-primary-50 to-primary-100 shadow-lg">
          <button
            type="submit"
            disabled={isProcessing}
            className={`
              w-full py-4 px-6 rounded-xl font-black text-white text-lg shadow-2xl transition-all transform
              ${isProcessing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500 hover:from-primary-600 hover:via-primary-700 hover:to-primary-600 hover:shadow-2xl hover:scale-105 active:scale-95'
              }
            `}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />
                HOLD BOOKING • {currency} {finalTotal.toFixed(2)}
              </span>
            )}
          </button>

          <div className="mt-3 text-center text-xs text-gray-600">
            Your booking will be reserved for {selectedHoldDuration} hours
          </div>
        </div>
      )}
    </form>
  );
}
