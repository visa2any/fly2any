'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';

// Initialize Stripe - Only if key is available
// Prevents "empty string" error in development/staging without Stripe configured
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)
  : null;

interface StripePaymentFormProps {
  clientSecret: string;
  amount: number;
  currency: string;
  bookingReference: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

function PaymentForm({
  clientSecret,
  amount,
  currency,
  bookingReference,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Confirm the payment
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payments/confirm/${bookingReference}`,
        },
        redirect: 'if_required', // Only redirect for 3D Secure
      });

      if (submitError) {
        setError(submitError.message || 'Payment failed');
        onError(submitError.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      } else if (paymentIntent && paymentIntent.status === 'requires_action') {
        // 3D Secure authentication required - Stripe will handle redirect
        console.log('3D Secure authentication required');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      onError(err.message || 'An unexpected error occurred');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-gray-200 rounded-lg bg-white">
        <PaymentElement />
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-900">Payment Error</p>
            <p className="text-xs text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className={`
          w-full py-4 px-6 rounded-xl font-black text-white text-lg shadow-2xl transition-all transform
          ${processing || !stripe
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-success-500 via-success-600 to-success-500 hover:from-success-600 hover:via-success-700 hover:to-success-600 hover:shadow-2xl hover:scale-105 active:scale-95 animate-pulse'
          }
        `}
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            Processing Payment...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Lock className="w-5 h-5" />
            PAY {currency} {amount.toFixed(2)}
          </span>
        )}
      </button>

      <div className="flex items-center justify-center gap-3 text-xs text-gray-600 font-medium">
        <div className="flex items-center gap-1">
          <Lock className="w-3.5 h-3.5 text-success-600" />
          <span>256-bit SSL</span>
        </div>
        <span>•</span>
        <span>PCI DSS Compliant</span>
        <span>•</span>
        <span>3D Secure</span>
      </div>
    </form>
  );
}

export function StripePaymentForm(props: StripePaymentFormProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Check if Stripe is configured
  if (!stripePromise) {
    return (
      <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-900">Payment Configuration Missing</p>
          <p className="text-xs text-red-700 mt-1">
            Stripe publishable key is not configured. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  if (!props.clientSecret) {
    return (
      <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-yellow-900">Payment Setup Required</p>
          <p className="text-xs text-yellow-700 mt-1">Please wait while we set up your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret: props.clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#D63A35',
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            colorDanger: '#ef4444',
            fontFamily: 'system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px',
          },
        },
      }}
    >
      <PaymentForm {...props} />
    </Elements>
  );
}
