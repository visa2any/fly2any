'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { CreditCard, Shield, Lock, AlertCircle, Loader2, CheckCircle } from 'lucide-react';

// Declare the global LiteAPI Payment SDK type
declare global {
  interface Window {
    liteAPIPayment?: {
      init: (config: {
        publicKey: string;
        secretKey: string;
        returnUrl: string;
        onSuccess?: (data: { transactionId: string }) => void;
        onError?: (error: { message: string }) => void;
        onCancel?: () => void;
      }) => void;
      render: (containerId: string) => void;
    };
  }
}

interface LiteAPIPaymentFormProps {
  /** Secret key from prebook response */
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

/**
 * LiteAPI Payment Form Component
 *
 * Integrates with LiteAPI's User Payment SDK to process payments directly.
 * The customer pays the full amount (including markup) via LiteAPI's secure portal.
 *
 * Flow:
 * 1. Prebook returns secretKey + transactionId
 * 2. SDK renders payment form using secretKey
 * 3. User enters card details and pays
 * 4. SDK returns transactionId on success
 * 5. Use transactionId in book API with method: TRANSACTION_ID
 */
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
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'ready' | 'processing' | 'success' | 'error'>('idle');
  const containerRef = useRef<HTMLDivElement>(null);
  const sdkInitialized = useRef(false);

  // Get the return URL for post-payment redirect
  const returnUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/hotels/booking/confirm`
    : '';

  // Load the LiteAPI Payment SDK script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if script is already loaded
    const existingScript = document.querySelector('script[src*="liteAPIPayment.js"]');
    if (existingScript) {
      setSdkLoaded(true);
      return;
    }

    setPaymentStatus('loading');

    const script = document.createElement('script');
    script.src = 'https://payment-wrapper.liteapi.travel/dist/liteAPIPayment.js?v=a1';
    script.async = true;

    script.onload = () => {
      console.log('[LiteAPI Payment] SDK loaded successfully');
      setSdkLoaded(true);
      setPaymentStatus('ready');
    };

    script.onerror = () => {
      console.error('[LiteAPI Payment] Failed to load SDK');
      setSdkError('Failed to load payment system. Please refresh and try again.');
      setPaymentStatus('error');
    };

    document.head.appendChild(script);

    return () => {
      // Don't remove script on unmount as it might be reused
    };
  }, []);

  // Initialize the payment SDK when loaded
  useEffect(() => {
    if (!sdkLoaded || !secretKey || sdkInitialized.current) return;

    // Wait for SDK to be available on window
    const initSDK = () => {
      if (!window.liteAPIPayment) {
        console.warn('[LiteAPI Payment] SDK not yet available, retrying...');
        setTimeout(initSDK, 100);
        return;
      }

      try {
        console.log('[LiteAPI Payment] Initializing SDK...');
        console.log('  Secret Key:', secretKey.substring(0, 10) + '...');
        console.log('  Transaction ID:', transactionId);
        console.log('  Return URL:', returnUrl);

        // Determine environment based on API key or env var
        const isProduction = process.env.NODE_ENV === 'production' ||
          process.env.NEXT_PUBLIC_LITEAPI_ENV === 'live';

        window.liteAPIPayment.init({
          publicKey: isProduction ? 'live' : 'sandbox',
          secretKey: secretKey,
          returnUrl: returnUrl,
          onSuccess: (data) => {
            console.log('[LiteAPI Payment] Payment successful!', data);
            setPaymentStatus('success');
            onPaymentSuccess(data.transactionId || transactionId);
          },
          onError: (error) => {
            console.error('[LiteAPI Payment] Payment error:', error);
            setPaymentStatus('error');
            onPaymentError(error.message || 'Payment failed');
          },
          onCancel: () => {
            console.log('[LiteAPI Payment] Payment cancelled');
            setPaymentStatus('ready');
            onPaymentCancel?.();
          },
        });

        // Render the payment form
        window.liteAPIPayment.render('liteapi-payment-container');
        sdkInitialized.current = true;
        setPaymentStatus('ready');

      } catch (err) {
        console.error('[LiteAPI Payment] SDK initialization error:', err);
        setSdkError('Failed to initialize payment form');
        setPaymentStatus('error');
      }
    };

    initSDK();
  }, [sdkLoaded, secretKey, transactionId, returnUrl, onPaymentSuccess, onPaymentError, onPaymentCancel]);

  // Format currency
  const formatCurrency = (amount: number, curr: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
    }).format(amount);
  };

  // Error state
  if (sdkError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800">Payment Error</h3>
            <p className="text-red-600 mt-1">{sdkError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (paymentStatus === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-800">Payment Successful!</h3>
            <p className="text-green-600 mt-1">Processing your booking...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <CreditCard className="w-5 h-5" />
            <span className="font-semibold">Secure Payment</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-200" />
            <span className="text-sm text-blue-100">256-bit SSL</span>
          </div>
        </div>
      </div>

      {/* Amount Display */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Total Amount</span>
          <span className="text-2xl font-bold text-gray-900">
            {formatCurrency(displayAmount, currency)}
          </span>
        </div>
      </div>

      {/* Payment Form Container */}
      <div className="p-6">
        {paymentStatus === 'loading' && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-gray-600">Loading secure payment form...</p>
          </div>
        )}

        {/* LiteAPI Payment SDK will render here */}
        <div
          id="liteapi-payment-container"
          ref={containerRef}
          className={paymentStatus === 'loading' ? 'hidden' : ''}
        />

        {isProcessing && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
              <p className="text-gray-600">Processing payment...</p>
            </div>
          </div>
        )}
      </div>

      {/* Security Badges */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Lock className="w-4 h-4" />
            <span>Secure Checkout</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-4 h-4" />
            <span>PCI Compliant</span>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          Powered by LiteAPI - Your payment is processed securely
        </p>
      </div>

      {/* Test Card Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="px-6 py-3 bg-yellow-50 border-t border-yellow-200">
          <p className="text-xs text-yellow-700 text-center">
            <strong>Test Mode:</strong> Use card 4242 4242 4242 4242, any future date, any CVC
          </p>
        </div>
      )}
    </div>
  );
}

export default LiteAPIPaymentForm;
