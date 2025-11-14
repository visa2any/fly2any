'use client';


import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';

interface PaymentConfirmation {
  success: boolean;
  payment: {
    paymentIntentId: string;
    status: string;
    amount: number;
    currency: string;
    last4?: string;
    brand?: string;
  };
  booking?: {
    id: string;
    bookingReference: string;
    status: string;
  };
  message?: string;
  warning?: string;
}

export default function PaymentConfirmPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'processing' | 'failed'>('loading');
  const [confirmation, setConfirmation] = useState<PaymentConfirmation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const paymentId = params.paymentId as string;
  const paymentIntentId = searchParams.get('payment_intent');
  const bookingReference = searchParams.get('booking_reference');

  useEffect(() => {
    const confirmPayment = async () => {
      if (!paymentIntentId) {
        setError('Payment intent ID not found');
        setStatus('failed');
        return;
      }

      try {
        console.log('Confirming payment:', paymentIntentId);

        // Call API to confirm payment
        const response = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId,
            bookingReference: bookingReference || paymentId,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setConfirmation(data);

          if (data.payment.status === 'succeeded') {
            setStatus('success');
          } else if (data.payment.status === 'processing') {
            setStatus('processing');
          } else {
            setStatus('failed');
          }
        } else {
          setError(data.message || 'Failed to confirm payment');
          setStatus('failed');
        }
      } catch (err: any) {
        console.error('Payment confirmation error:', err);
        setError(err.message || 'An unexpected error occurred');
        setStatus('failed');
      }
    };

    confirmPayment();
  }, [paymentIntentId, paymentId, bookingReference]);

  const handleViewBooking = () => {
    if (confirmation?.booking?.bookingReference) {
      router.push(`/flights/booking/confirmation?ref=${confirmation.booking.bookingReference}`);
    }
  };

  const handleRetryPayment = () => {
    router.back();
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 border-8 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Confirming Payment...</h1>
          <p className="text-gray-600">Please wait while we process your payment.</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-success-50 to-success-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-success-600" />
            </div>
          </div>

          <h1 className="text-3xl font-black text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">Your booking has been confirmed.</p>

          {confirmation && (
            <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left space-y-3">
              {confirmation.booking && (
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Booking Reference</p>
                  <p className="text-lg font-black text-gray-900">{confirmation.booking.bookingReference}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-600 font-semibold">Amount Paid</p>
                <p className="text-lg font-bold text-gray-900">
                  {confirmation.payment.currency.toUpperCase()} {confirmation.payment.amount.toFixed(2)}
                </p>
              </div>

              {confirmation.payment.last4 && (
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Payment Method</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {confirmation.payment.brand?.toUpperCase()} •••• {confirmation.payment.last4}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-600 font-semibold">Transaction ID</p>
                <p className="text-xs font-mono text-gray-700">{confirmation.payment.paymentIntentId}</p>
              </div>
            </div>
          )}

          {confirmation?.warning && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-6 text-left">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-yellow-900">Note</p>
                <p className="text-xs text-yellow-700 mt-1">{confirmation.warning}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleViewBooking}
              className="w-full py-3 px-6 bg-gradient-to-r from-success-500 to-success-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              View Booking Details
            </button>

            <button
              onClick={() => router.push('/')}
              className="w-full py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
            >
              Return to Home
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            A confirmation email has been sent to your email address.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-12 h-12 text-yellow-600" />
            </div>
          </div>

          <h1 className="text-2xl font-black text-gray-900 mb-2">Payment Processing</h1>
          <p className="text-gray-600 mb-6">
            Your payment is being processed. This may take a few minutes.
          </p>

          {confirmation && (
            <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left space-y-3">
              <div>
                <p className="text-xs text-gray-600 font-semibold">Status</p>
                <p className="text-sm font-bold text-yellow-600">Processing</p>
              </div>

              <div>
                <p className="text-xs text-gray-600 font-semibold">Amount</p>
                <p className="text-lg font-bold text-gray-900">
                  {confirmation.payment.currency.toUpperCase()} {confirmation.payment.amount.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => router.push('/')}
            className="w-full py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
          >
            Return to Home
          </button>

          <p className="text-xs text-gray-500 mt-6">
            You will receive a confirmation email once the payment is completed.
          </p>
        </div>
      </div>
    );
  }

  // Failed state
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-6">
          {error || 'We were unable to process your payment. Please try again.'}
        </p>

        {confirmation && (
          <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left space-y-3">
            <div>
              <p className="text-xs text-gray-600 font-semibold">Transaction ID</p>
              <p className="text-xs font-mono text-gray-700">{confirmation.payment.paymentIntentId}</p>
            </div>

            {confirmation.message && (
              <div>
                <p className="text-xs text-gray-600 font-semibold">Details</p>
                <p className="text-xs text-red-600">{confirmation.message}</p>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleRetryPayment}
            className="w-full py-3 px-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            Try Again
          </button>

          <button
            onClick={() => router.push('/')}
            className="w-full py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
          >
            Return to Home
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          If you continue to experience issues, please contact support.
        </p>
      </div>
    </div>
  );
}
