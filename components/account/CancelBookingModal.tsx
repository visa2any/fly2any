'use client';

import { useState } from 'react';
import {
  XCircle,
  AlertTriangle,
  DollarSign,
  Clock,
  Shield,
  Loader2,
  CheckCircle,
  X,
} from 'lucide-react';
import type { Booking } from '@/lib/bookings/types';

interface CancelBookingModalProps {
  booking: Booking;
  onClose: () => void;
  onSuccess: () => void;
}

const CANCELLATION_REASONS = [
  { value: 'change_of_plans', label: 'Change of plans' },
  { value: 'found_better_price', label: 'Found better price' },
  { value: 'travel_restrictions', label: 'Travel restrictions' },
  { value: 'personal_emergency', label: 'Personal emergency' },
  { value: 'duplicate_booking', label: 'Duplicate booking' },
  { value: 'other', label: 'Other reason' },
];

export default function CancelBookingModal({
  booking,
  onClose,
  onSuccess,
}: CancelBookingModalProps) {
  const [step, setStep] = useState<'confirm' | 'reason' | 'processing' | 'success'>(
    'confirm'
  );
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Calculate refund details
  const calculateRefund = () => {
    if (!booking.refundPolicy || !booking.refundPolicy.refundable) {
      return {
        refundable: false,
        refundAmount: 0,
        cancellationFee: booking.payment.amount,
        netRefund: 0,
      };
    }

    const cancellationFee = booking.refundPolicy.cancellationFee || 0;
    const refundAmount = booking.payment.amount - cancellationFee;

    return {
      refundable: true,
      refundAmount: booking.payment.amount,
      cancellationFee,
      netRefund: Math.max(0, refundAmount),
    };
  };

  const refundDetails = calculateRefund();

  const handleCancel = async () => {
    try {
      setStep('processing');
      setError(null);

      const selectedReason =
        reason === 'other' ? customReason : CANCELLATION_REASONS.find((r) => r.value === reason)?.label;

      const response = await fetch(`/api/bookings/${booking.id}?reason=${encodeURIComponent(selectedReason || 'Customer request')}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setStep('success');
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        throw new Error(data.error?.message || 'Failed to cancel booking');
      }
    } catch (err: any) {
      console.error('Cancellation error:', err);
      setError(err.message || 'Failed to cancel booking. Please try again.');
      setStep('reason');
    }
  };

  const renderConfirmStep = () => (
    <>
      <div className="flex items-center justify-center mb-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
        Cancel This Booking?
      </h2>
      <p className="text-gray-600 text-center mb-6">
        You are about to cancel booking <strong>{booking.bookingReference}</strong>
      </p>

      {/* Booking Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Route:</span>
            <div className="font-semibold text-gray-900">
              {booking.flight.segments[0].departure.iataCode} →{' '}
              {
                booking.flight.segments[booking.flight.segments.length - 1].arrival
                  .iataCode
              }
            </div>
          </div>
          <div>
            <span className="text-gray-600">Departure:</span>
            <div className="font-semibold text-gray-900">
              {new Date(
                booking.flight.segments[0].departure.at
              ).toLocaleDateString()}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Passengers:</span>
            <div className="font-semibold text-gray-900">
              {booking.passengers.length}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Total Amount:</span>
            <div className="font-semibold text-gray-900">
              {booking.payment.currency}
              {booking.payment.amount.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Refund Information */}
      <div
        className={`border-2 rounded-lg p-4 mb-6 ${
          refundDetails.refundable
            ? 'border-green-300 bg-green-50'
            : 'border-red-300 bg-red-50'
        }`}
      >
        <div className="flex items-start gap-3">
          {refundDetails.refundable ? (
            <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <h3
              className={`font-bold mb-2 ${
                refundDetails.refundable ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {refundDetails.refundable ? 'Refundable Booking' : 'Non-Refundable Booking'}
            </h3>

            {refundDetails.refundable ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Original Amount:</span>
                  <span className="font-semibold text-green-900">
                    {booking.payment.currency}
                    {refundDetails.refundAmount.toFixed(2)}
                  </span>
                </div>
                {refundDetails.cancellationFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-green-700">Cancellation Fee:</span>
                    <span className="font-semibold text-green-900">
                      -{booking.payment.currency}
                      {refundDetails.cancellationFee.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-green-300">
                  <span className="text-green-700 font-bold">You will receive:</span>
                  <span className="font-bold text-green-900 text-lg">
                    {booking.payment.currency}
                    {refundDetails.netRefund.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-green-700 mt-2">
                  <Clock className="w-3 h-3" />
                  Refund will be processed within 5-7 business days
                </div>
              </div>
            ) : (
              <p className="text-sm text-red-700">
                This booking is non-refundable. You will not receive a refund if you
                proceed with cancellation.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <strong className="font-semibold">Important:</strong> Once cancelled, this
            booking cannot be restored. You will need to make a new booking if you change
            your mind.
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
        >
          Keep Booking
        </button>
        <button
          onClick={() => setStep('reason')}
          className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
        >
          Continue to Cancel
        </button>
      </div>
    </>
  );

  const renderReasonStep = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Cancellation Reason</h2>
        <button
          onClick={() => setStep('confirm')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <p className="text-gray-600 mb-6">
        Please tell us why you're cancelling this booking. This helps us improve our
        service.
      </p>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      <div className="space-y-3 mb-6">
        {CANCELLATION_REASONS.map((r) => (
          <label
            key={r.value}
            className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
              reason === r.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="reason"
              value={r.value}
              checked={reason === r.value}
              onChange={(e) => setReason(e.target.value)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="font-medium text-gray-900">{r.label}</span>
          </label>
        ))}
      </div>

      {reason === 'other' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Please specify your reason:
          </label>
          <textarea
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="Enter your reason..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setStep('confirm')}
          className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleCancel}
          disabled={!reason || (reason === 'other' && !customReason.trim())}
          className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirm Cancellation
        </button>
      </div>
    </>
  );

  const renderProcessingStep = () => (
    <div className="text-center py-8">
      <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Cancelling Your Booking
      </h2>
      <p className="text-gray-600">
        Please wait while we process your cancellation...
      </p>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Booking Cancelled Successfully
      </h2>
      <p className="text-gray-600 mb-4">
        Your booking <strong>{booking.bookingReference}</strong> has been cancelled.
      </p>
      {refundDetails.refundable && refundDetails.netRefund > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 inline-block">
          <div className="text-sm text-green-700 mb-1">Refund Amount</div>
          <div className="text-2xl font-bold text-green-800">
            {booking.payment.currency}
            {refundDetails.netRefund.toFixed(2)}
          </div>
          <div className="text-xs text-green-600 mt-1">
            Will be processed in 5-7 business days
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {step === 'confirm' && renderConfirmStep()}
          {step === 'reason' && renderReasonStep()}
          {step === 'processing' && renderProcessingStep()}
          {step === 'success' && renderSuccessStep()}
        </div>
      </div>
    </div>
  );
}
