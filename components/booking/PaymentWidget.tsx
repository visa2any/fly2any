'use client';

import { useState } from 'react';
import { CreditCard, Shield, Lock, Info } from 'lucide-react';
import { StripePaymentForm } from './StripePaymentForm';
import type { PassengerInfo } from './PassengerDetailsWidget';

interface PaymentWidgetProps {
  amount: number;
  currency: string;
  bookingReference: string;
  clientSecret: string;
  passengers: PassengerInfo[];
  flight?: {
    airline?: string;
    flightNumber?: string;
    origin?: string;
    destination?: string;
  };
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  onBack?: () => void;
}

export function PaymentWidget({
  amount,
  currency,
  bookingReference,
  clientSecret,
  passengers,
  flight,
  onSuccess,
  onError,
  onBack,
}: PaymentWidgetProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Secure Payment</h3>
            <p className="text-sm text-primary-100">Complete your booking</p>
          </div>
        </div>

        {/* Amount Summary */}
        <div className="bg-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Total Amount</span>
            <div className="text-right">
              <div className="text-3xl font-black">
                {currency} {amount.toFixed(2)}
              </div>
              <div className="text-xs text-primary-100">All fees included</div>
            </div>
          </div>

          {/* Flight Summary */}
          {flight && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="text-sm">
                <div className="font-semibold">
                  {flight.airline} {flight.flightNumber}
                </div>
                <div className="text-primary-100 text-xs">
                  {flight.origin} → {flight.destination}
                </div>
              </div>
            </div>
          )}

          {/* Passengers */}
          <div className="mt-3 pt-3 border-t border-white/20">
            <div className="text-sm">
              <div className="font-semibold mb-1">
                {passengers.length} {passengers.length === 1 ? 'Passenger' : 'Passengers'}
              </div>
              <div className="space-y-0.5">
                {passengers.map((p, idx) => (
                  <div key={idx} className="text-xs text-primary-100">
                    {p.firstName} {p.lastName}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <div className="p-6">
        {/* Security Badges */}
        <div className="flex items-center justify-center gap-4 mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Shield className="w-4 h-4 text-green-600" />
            <span>PCI DSS Compliant</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Lock className="w-4 h-4 text-green-600" />
            <span>256-bit SSL</span>
          </div>
        </div>

        {/* Stripe Payment Form */}
        <StripePaymentForm
          clientSecret={clientSecret}
          amount={amount}
          currency={currency}
          bookingReference={bookingReference}
          onSuccess={onSuccess}
          onError={onError}
        />

        {/* Payment Info */}
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full mt-4 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Info className="w-4 h-4" />
            <span>Payment Information & Security</span>
          </div>
          <span className="text-xs text-gray-500">{showDetails ? 'Hide' : 'Show'}</span>
        </button>

        {showDetails && (
          <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3 text-sm">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Payment Security</h4>
              <p className="text-gray-700 text-xs leading-relaxed">
                Your payment is processed securely by Stripe. We never store your card details
                on our servers. All transactions are encrypted with industry-leading 256-bit
                SSL technology.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-1">3D Secure Authentication</h4>
              <p className="text-gray-700 text-xs leading-relaxed">
                Your bank may require additional verification (3D Secure) to complete this
                payment. If prompted, please follow your bank's authentication process.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Booking Reference</h4>
              <p className="text-gray-700 text-xs">
                Your booking reference is{' '}
                <span className="font-mono font-bold">{bookingReference}</span>
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-1">What Happens Next?</h4>
              <ol className="text-gray-700 text-xs space-y-1 list-decimal list-inside">
                <li>Your payment will be processed securely</li>
                <li>Your flight will be booked with the airline</li>
                <li>You'll receive a confirmation email with your e-ticket</li>
                <li>Your booking reference will be provided immediately</li>
              </ol>
            </div>

            <div className="pt-3 border-t border-blue-300">
              <p className="text-xs text-gray-600">
                Need help?{' '}
                <a href="mailto:support@fly2any.com" className="text-primary-600 underline">
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Back Button */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-full mt-4 py-3 px-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Passenger Details
          </button>
        )}

        {/* Money-Back Guarantee */}
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900 text-sm">
                100% Booking Protection
              </h4>
              <p className="text-xs text-green-800 mt-1 leading-relaxed">
                If we cannot confirm your booking, you will receive a full refund within 3-5
                business days. Your payment is protected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
