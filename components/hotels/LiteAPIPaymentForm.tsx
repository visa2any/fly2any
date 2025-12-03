'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Shield, Lock, AlertCircle, Loader2, CreditCard, RefreshCw, CheckCircle,
  Sparkles, Clock, Calendar, BadgeCheck, Zap, ShieldCheck, Info
} from 'lucide-react';
import { loadStripe, Stripe, StripeElements, StripePaymentElement } from '@stripe/stripe-js';

/**
 * LiteAPI Payment Form Component
 *
 * Uses direct Stripe integration with the secretKey (PaymentIntent client_secret) from prebook.
 * The secretKey format is: pi_xxx_secret_xxx (standard Stripe PaymentIntent client_secret)
 *
 * The publishable key is LiteAPI's Stripe account key, obtained from their /config endpoint.
 * This allows us to process payments through LiteAPI's Stripe account.
 */

// LiteAPI's Stripe publishable key (from their /config endpoint)
// This is LiteAPI's account - payments go through their Stripe Connect setup
const LITEAPI_STRIPE_PUBLISHABLE_KEY = 'pk_live_51OyYnVA4FXPoRk9YKY2X48OOO0Dr8mjk4LngAtzHnb8vOoN6sbCY1MKPlqkqcHEK0hzkR7v2tQtveNapXcBBGEkh00qZt4s1FA';

interface LiteAPIPaymentFormProps {
  /** Secret key from prebook response (Stripe PaymentIntent client_secret) */
  secretKey: string;
  /** Transaction ID from prebook response */
  transactionId: string;
  /** Amount to display (with markup) */
  displayAmount: number;
  /** Currency code */
  currency: string;
  /** Callback when payment is successful */
  onPaymentSuccess: (transactionId: string) => void;
  /** Callback when payment fails */
  onPaymentError: (error: string) => void;
  /** Callback when user cancels */
  onPaymentCancel?: () => void;
  /** Loading state from parent */
  isProcessing?: boolean;
}

// BNPL Payment method configurations
const BNPL_METHODS: Record<string, {
  name: string;
  color: string;
  bgColor: string;
  textColor: string;
  icon: string;
  tagline: string;
  benefits: string[];
}> = {
  klarna: {
    name: 'Klarna',
    color: 'pink',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-700',
    icon: 'K',
    tagline: 'Pay in 4 interest-free installments',
    benefits: ['No interest ever', 'Instant approval', 'Soft credit check only'],
  },
  afterpay_clearpay: {
    name: 'Afterpay',
    color: 'teal',
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-700',
    icon: 'A',
    tagline: 'Split into 4 payments, every 2 weeks',
    benefits: ['Always 0% interest', 'No impact on credit', 'Pay on your schedule'],
  },
  affirm: {
    name: 'Affirm',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    icon: 'a',
    tagline: 'Monthly payments that fit your budget',
    benefits: ['0% APR available', 'No hidden fees', 'Pay early & save'],
  },
  cashapp: {
    name: 'Cash App Pay',
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    icon: '$',
    tagline: 'Fast & secure payment with Cash App',
    benefits: ['Instant payment', 'Linked to your Cash App', 'Boost rewards eligible'],
  },
  amazon_pay: {
    name: 'Amazon Pay',
    color: 'orange',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    icon: 'a',
    tagline: 'Use your Amazon account to pay',
    benefits: ['No new accounts needed', 'A-to-z Guarantee', 'Quick checkout'],
  },
};

export function LiteAPIPaymentForm({
  secretKey,
  transactionId,
  displayAmount,
  currency,
  onPaymentSuccess,
  onPaymentError,
  onPaymentCancel,
  isProcessing = false,
}: LiteAPIPaymentFormProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'processing' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [elements, setElements] = useState<StripeElements | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [paymentMethodComplete, setPaymentMethodComplete] = useState(false);

  const paymentElementRef = useRef<HTMLDivElement>(null);
  const paymentElement = useRef<StripePaymentElement | null>(null);
  const initialized = useRef(false);

  // Build return URL for redirect-based payments (like 3D Secure)
  const returnUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/hotels/booking/confirm?tid=${transactionId}&status=success`
    : '';

  // Initialize Stripe and create Payment Element
  useEffect(() => {
    if (initialized.current || !secretKey || typeof window === 'undefined') return;
    initialized.current = true;

    const initStripe = async () => {
      try {
        console.log('[LiteAPI Payment] Initializing Stripe...');
        console.log('[LiteAPI Payment] SecretKey prefix:', secretKey.substring(0, 20));

        // Load Stripe with LiteAPI's publishable key
        const stripeInstance = await loadStripe(LITEAPI_STRIPE_PUBLISHABLE_KEY);

        if (!stripeInstance) {
          throw new Error('Failed to load Stripe');
        }

        console.log('[LiteAPI Payment] Stripe loaded successfully');
        setStripe(stripeInstance);

        // Create Elements instance with the PaymentIntent client_secret
        const elementsInstance = stripeInstance.elements({
          clientSecret: secretKey,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#F97316', // Orange
              colorBackground: '#ffffff',
              colorText: '#1f2937',
              colorDanger: '#ef4444',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              borderRadius: '8px',
              spacingUnit: '4px',
            },
            rules: {
              '.Input': {
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              },
              '.Input:focus': {
                border: '1px solid #F97316',
                boxShadow: '0 0 0 3px rgba(249,115,22,0.1)',
              },
              '.Label': {
                fontWeight: '500',
                marginBottom: '6px',
              },
            },
          },
        });

        console.log('[LiteAPI Payment] Elements instance created');
        setElements(elementsInstance);

        // Wait for container to be ready
        await new Promise(resolve => setTimeout(resolve, 100));

        // Create and mount Payment Element
        if (paymentElementRef.current) {
          const paymentElementInstance = elementsInstance.create('payment', {
            layout: {
              type: 'tabs',
              defaultCollapsed: false,
            },
          });

          paymentElementInstance.mount(paymentElementRef.current);
          console.log('[LiteAPI Payment] Payment Element mounted');

          // Listen for ready event
          paymentElementInstance.on('ready', () => {
            console.log('[LiteAPI Payment] Payment Element ready');
            setStatus('ready');
          });

          // Listen for change events (validation & payment method detection)
          paymentElementInstance.on('change', (event: any) => {
            console.log('[LiteAPI Payment] Change event:', event);

            // Track completion status
            setPaymentMethodComplete(event.complete);

            if (event.complete) {
              setErrorMessage(null);
            }

            // Detect selected payment method
            if (event.value?.type) {
              const methodType = event.value.type;
              console.log('[LiteAPI Payment] Payment method selected:', methodType);
              setSelectedPaymentMethod(methodType);
            }
          });

          // Store reference for cleanup
          paymentElement.current = paymentElementInstance;
        } else {
          throw new Error('Payment container not found');
        }
      } catch (error: any) {
        console.error('[LiteAPI Payment] Initialization error:', error);
        setErrorMessage(error.message || 'Failed to initialize payment form');
        setStatus('error');
      }
    };

    initStripe();

    // Cleanup
    return () => {
      if (elements) {
        // Stripe Elements cleanup is automatic
      }
    };
  }, [secretKey]);

  // Handle payment submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setStatus('processing');
    setErrorMessage(null);

    try {
      console.log('[LiteAPI Payment] Confirming payment...');

      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: 'if_required', // Only redirect if 3D Secure or similar is needed
      });

      if (error) {
        console.error('[LiteAPI Payment] Payment error:', error);

        // Handle specific error types
        if (error.type === 'card_error' || error.type === 'validation_error') {
          setErrorMessage(error.message || 'Payment failed. Please check your card details.');
        } else {
          setErrorMessage('An unexpected error occurred. Please try again.');
        }
        setStatus('error');
        onPaymentError(error.message || 'Payment failed');
      } else if (paymentIntent) {
        console.log('[LiteAPI Payment] Payment successful:', paymentIntent.status);

        if (paymentIntent.status === 'succeeded') {
          setStatus('success');
          onPaymentSuccess(transactionId);
        } else if (paymentIntent.status === 'processing') {
          // Payment is processing - treat as success for now
          setStatus('success');
          onPaymentSuccess(transactionId);
        } else if (paymentIntent.status === 'requires_action') {
          // 3D Secure or additional action needed - Stripe will handle redirect
          console.log('[LiteAPI Payment] Requires action - redirecting...');
        } else {
          setErrorMessage(`Payment status: ${paymentIntent.status}`);
          setStatus('error');
        }
      }
    } catch (err: any) {
      console.error('[LiteAPI Payment] Submit error:', err);
      setErrorMessage(err.message || 'Payment submission failed');
      setStatus('error');
      onPaymentError(err.message || 'Payment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number, curr: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
    }).format(amount);
  };

  // Retry initialization
  const handleRetry = () => {
    initialized.current = false;
    setErrorMessage(null);
    setStatus('loading');
    window.location.reload();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Amount Display */}
      <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 font-medium">Total Amount</span>
          <span className="text-2xl font-bold text-orange-600">
            {formatCurrency(displayAmount, currency)}
          </span>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="p-6">
        {/* Error Message */}
        {errorMessage && status === 'error' && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Payment Error</p>
              <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Success Message */}
        {status === 'success' && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">Payment Successful!</p>
              <p className="text-sm text-green-600 mt-1">Your booking is being confirmed...</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-3" />
            <p className="text-gray-600">Loading secure payment form...</p>
          </div>
        )}

        {/* Stripe Payment Element Container */}
        <div
          ref={paymentElementRef}
          className="min-h-[200px]"
          style={{ display: status === 'loading' ? 'none' : 'block' }}
        />

        {/* BNPL Contextual Info - Shows when BNPL method is selected */}
        {selectedPaymentMethod && BNPL_METHODS[selectedPaymentMethod] && status !== 'success' && (
          <div className={`mt-4 p-4 rounded-xl border ${BNPL_METHODS[selectedPaymentMethod].bgColor} border-${BNPL_METHODS[selectedPaymentMethod].color}-200 animate-fadeIn`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${BNPL_METHODS[selectedPaymentMethod].bgColor} border border-${BNPL_METHODS[selectedPaymentMethod].color}-200`}>
                <span className={`font-bold text-lg ${BNPL_METHODS[selectedPaymentMethod].textColor}`}>
                  {BNPL_METHODS[selectedPaymentMethod].icon}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">
                    {BNPL_METHODS[selectedPaymentMethod].name}
                  </p>
                  <span className="text-[10px] font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3" /> 0% APR
                  </span>
                </div>
                <p className={`text-sm ${BNPL_METHODS[selectedPaymentMethod].textColor} mt-0.5`}>
                  {BNPL_METHODS[selectedPaymentMethod].tagline}
                </p>

                {/* Benefits */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {BNPL_METHODS[selectedPaymentMethod].benefits.map((benefit, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-xs text-gray-600 bg-white px-2 py-1 rounded-full border border-gray-200"
                    >
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {benefit}
                    </span>
                  ))}
                </div>

                {/* Payment Schedule Preview for BNPL */}
                {(selectedPaymentMethod === 'klarna' || selectedPaymentMethod === 'afterpay_clearpay' || selectedPaymentMethod === 'affirm') && (
                  <div className="mt-3 pt-3 border-t border-gray-200/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-medium text-gray-700">Payment Schedule</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[0, 1, 2, 3].map((i) => {
                        const paymentAmount = displayAmount / 4;
                        const date = new Date();
                        date.setDate(date.getDate() + (i * 14));
                        return (
                          <div key={i} className="text-center">
                            <p className={`text-sm font-bold ${i === 0 ? 'text-purple-700' : 'text-gray-600'}`}>
                              {formatCurrency(paymentAmount, currency)}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              {i === 0 ? 'Today' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        {status !== 'loading' && status !== 'success' && (
          <button
            type="submit"
            disabled={status !== 'ready' || isSubmitting || isProcessing}
            className={`w-full mt-6 py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform ${
              status !== 'ready' || isSubmitting || isProcessing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            {isSubmitting || isProcessing || status === 'processing' ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing Payment...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Lock className="w-5 h-5" />
                Pay {formatCurrency(displayAmount, currency)}
              </span>
            )}
          </button>
        )}

        {/* Security Badges */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          {/* Main Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-green-600" />
              <span>Secure Checkout</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>PCI Compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BadgeCheck className="w-4 h-4 text-purple-600" />
              <span>3D Secure</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-orange-600" />
              <span>256-bit SSL</span>
            </div>
          </div>

          {/* Payment Methods Accepted */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="text-xs text-gray-400">Accepted:</span>
            <div className="flex items-center gap-2">
              {/* Visa */}
              <div className="w-10 h-6 bg-white border border-gray-200 rounded flex items-center justify-center">
                <span className="text-[10px] font-bold text-blue-700">VISA</span>
              </div>
              {/* Mastercard */}
              <div className="w-10 h-6 bg-white border border-gray-200 rounded flex items-center justify-center">
                <span className="text-[10px] font-bold text-orange-600">MC</span>
              </div>
              {/* Amex */}
              <div className="w-10 h-6 bg-white border border-gray-200 rounded flex items-center justify-center">
                <span className="text-[10px] font-bold text-blue-500">AMEX</span>
              </div>
              {/* Klarna */}
              <div className="w-10 h-6 bg-pink-50 border border-pink-200 rounded flex items-center justify-center">
                <span className="text-[10px] font-bold text-pink-600">K.</span>
              </div>
              {/* Afterpay */}
              <div className="w-10 h-6 bg-teal-50 border border-teal-200 rounded flex items-center justify-center">
                <span className="text-[10px] font-bold text-teal-600">AP</span>
              </div>
            </div>
          </div>

          {/* Powered by Stripe */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-xs text-gray-400">Powered by</span>
            <div className="flex items-center gap-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-2 py-0.5 rounded text-[10px] font-semibold">
              <span>Stripe</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default LiteAPIPaymentForm;
