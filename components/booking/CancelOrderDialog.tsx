'use client';

import { useState } from 'react';
import { OrderCancellationQuote, OrderCancellationConfirmation } from '@/lib/bookings/types';

interface CancelOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  bookingReference: string;
  onCancellationComplete?: (confirmation: OrderCancellationConfirmation) => void;
}

export default function CancelOrderDialog({
  isOpen,
  onClose,
  bookingId,
  bookingReference,
  onCancellationComplete,
}: CancelOrderDialogProps) {
  const [step, setStep] = useState<'quote' | 'confirm' | 'success'>('quote');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<OrderCancellationQuote | null>(null);
  const [confirmation, setConfirmation] = useState<OrderCancellationConfirmation | null>(null);
  const [reason, setReason] = useState('');

  // Reset state when dialog opens
  const handleOpen = () => {
    setStep('quote');
    setLoading(true);
    setError(null);
    setQuote(null);
    setConfirmation(null);
    setReason('');
    fetchCancellationQuote();
  };

  // Fetch cancellation quote
  const fetchCancellationQuote = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/orders/cancel/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, bookingReference }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to get cancellation quote');
      }

      setQuote(data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch cancellation quote');
    } finally {
      setLoading(false);
    }
  };

  // Confirm cancellation
  const handleConfirmCancellation = async () => {
    if (!quote) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/orders/cancel/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          bookingReference,
          reason: reason || 'Customer requested cancellation',
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to cancel booking');
      }

      setConfirmation(data.data);
      setStep('success');

      // Notify parent component
      if (onCancellationComplete) {
        onCancellationComplete(data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 'quote' && 'Cancel Booking'}
            {step === 'confirm' && 'Confirm Cancellation'}
            {step === 'success' && 'Cancellation Confirmed'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Loading State */}
          {loading && step === 'quote' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-600">Calculating cancellation fees...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Quote */}
          {step === 'quote' && quote && !loading && (
            <div>
              {/* Booking Reference */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-500 mb-1">Booking Reference</p>
                <p className="text-xl font-mono font-bold text-gray-900">{bookingReference}</p>
              </div>

              {/* Warning Messages */}
              {quote.warnings && quote.warnings.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      {quote.warnings.map((warning, idx) => (
                        <p key={idx} className="text-sm text-blue-700">{warning}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Refund Summary */}
              <div className="border rounded-xl overflow-hidden mb-6">
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <h3 className="font-semibold text-gray-900">Cancellation Summary</h3>
                </div>

                <div className="divide-y">
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-gray-600">Refundable</span>
                    <span className={`font-semibold ${quote.refundable ? 'text-green-600' : 'text-red-600'}`}>
                      {quote.refundable ? 'Yes' : 'No'}
                    </span>
                  </div>

                  {quote.cancellationFee > 0 && (
                    <div className="flex justify-between items-center px-4 py-3">
                      <span className="text-gray-600">Cancellation Fee</span>
                      <span className="font-semibold text-red-600">
                        -{formatCurrency(quote.cancellationFee, quote.currency)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center px-4 py-3 bg-green-50">
                    <span className="font-semibold text-gray-900">Refund Amount</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(quote.refundAmount, quote.currency)}
                    </span>
                  </div>

                  {quote.refundAmount > 0 && (
                    <>
                      <div className="flex justify-between items-center px-4 py-3">
                        <span className="text-gray-600">Refund Method</span>
                        <span className="font-semibold text-gray-900">
                          {quote.refundMethod === 'original_payment' ? 'Original Payment Method' : 'Voucher'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center px-4 py-3">
                        <span className="text-gray-600">Processing Time</span>
                        <span className="font-semibold text-gray-900">{quote.processingTime}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Reason (optional) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Cancellation (Optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Help us improve by sharing why you're cancelling..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Keep Booking
                </button>
                <button
                  onClick={() => setStep('confirm')}
                  className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                  disabled={loading}
                >
                  Continue to Cancel
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Confirm */}
          {step === 'confirm' && quote && (
            <div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-900 mb-2">Are you absolutely sure?</h3>
                    <p className="text-red-700 text-sm mb-3">
                      This action cannot be undone. Your booking {bookingReference} will be permanently cancelled.
                    </p>
                    {quote.refundAmount > 0 && (
                      <p className="text-red-700 text-sm">
                        You will receive a refund of {formatCurrency(quote.refundAmount, quote.currency)} within {quote.processingTime}.
                      </p>
                    )}
                    {quote.refundAmount === 0 && (
                      <p className="text-red-700 text-sm font-semibold">
                        This is a non-refundable booking. You will not receive any refund.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('quote')}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Go Back
                </button>
                <button
                  onClick={handleConfirmCancellation}
                  className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Cancelling...
                    </span>
                  ) : (
                    'Yes, Cancel Booking'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 'success' && confirmation && (
            <div>
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Cancelled</h3>
                <p className="text-gray-600">{confirmation.message}</p>
              </div>

              {confirmation.refundAmount > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                  <h4 className="font-semibold text-green-900 mb-3">Refund Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">Amount:</span>
                      <span className="font-semibold text-green-900">
                        {formatCurrency(confirmation.refundAmount, confirmation.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Processing Time:</span>
                      <span className="font-semibold text-green-900">{confirmation.refundProcessingTime}</span>
                    </div>
                    {confirmation.refundReference && (
                      <div className="flex justify-between">
                        <span className="text-green-700">Reference:</span>
                        <span className="font-mono text-xs text-green-900">{confirmation.refundReference}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
