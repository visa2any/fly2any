'use client';

import { useState } from 'react';
import { OrderChangeOffer, OrderChangeConfirmation } from '@/lib/bookings/types';

interface ModifyOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  bookingReference: string;
  currentDepartureDate: string;
  currentReturnDate?: string;
  origin: string;
  destination: string;
  sourceApi?: 'Amadeus' | 'Duffel';
  onModificationComplete?: (confirmation: OrderChangeConfirmation) => void;
}

export default function ModifyOrderDialog({
  isOpen,
  onClose,
  bookingId,
  bookingReference,
  currentDepartureDate,
  currentReturnDate,
  origin,
  destination,
  sourceApi,
  onModificationComplete,
}: ModifyOrderDialogProps) {
  const [step, setStep] = useState<'select' | 'offers' | 'confirm' | 'success'>('select');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newDepartureDate, setNewDepartureDate] = useState('');
  const [newReturnDate, setNewReturnDate] = useState('');
  const [changeRequestId, setChangeRequestId] = useState<string | null>(null);
  const [offers, setOffers] = useState<OrderChangeOffer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<OrderChangeOffer | null>(null);
  const [confirmation, setConfirmation] = useState<OrderChangeConfirmation | null>(null);

  // Check if Duffel booking
  const isDuffelBooking = sourceApi === 'Duffel';

  // Reset state when dialog opens
  const handleOpen = () => {
    setStep('select');
    setLoading(false);
    setError(null);
    setNewDepartureDate('');
    setNewReturnDate('');
    setChangeRequestId(null);
    setOffers([]);
    setSelectedOffer(null);
    setConfirmation(null);
  };

  // Request modification
  const handleRequestModification = async () => {
    if (!newDepartureDate) {
      setError('Please select a new departure date');
      return;
    }

    if (!isDuffelBooking) {
      setError('Modifications are currently only supported for Duffel bookings. Please contact support.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Build change request
      const changes = {
        slices: [
          {
            origin: origin,
            destination: destination,
            departure_date: newDepartureDate,
          },
        ],
      };

      // Add return flight if applicable
      if (currentReturnDate && newReturnDate) {
        changes.slices.push({
          origin: destination,
          destination: origin,
          departure_date: newReturnDate,
        });
      }

      const response = await fetch('/api/orders/modify/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          bookingReference,
          changes,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to create change request');
      }

      setChangeRequestId(data.data.changeRequestId);
      await fetchChangeOffers(data.data.changeRequestId);
      setStep('offers');
    } catch (err: any) {
      setError(err.message || 'Failed to request modification');
    } finally {
      setLoading(false);
    }
  };

  // Fetch change offers
  const fetchChangeOffers = async (requestId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/orders/modify/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changeRequestId: requestId }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to get change offers');
      }

      if (data.data.length === 0) {
        throw new Error('No change options available for the selected dates');
      }

      setOffers(data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch change offers');
    } finally {
      setLoading(false);
    }
  };

  // Confirm modification
  const handleConfirmModification = async () => {
    if (!selectedOffer) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/orders/modify/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          changeOfferId: selectedOffer.offerId,
          bookingId,
          bookingReference,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to confirm modification');
      }

      setConfirmation(data.data);
      setStep('success');

      // Notify parent component
      if (onModificationComplete) {
        onModificationComplete(data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to confirm modification');
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 'select' && 'Modify Booking'}
            {step === 'offers' && 'Select New Flight'}
            {step === 'confirm' && 'Confirm Changes'}
            {step === 'success' && 'Booking Modified'}
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

          {/* Step 1: Select New Dates */}
          {step === 'select' && (
            <div>
              {/* Current Booking */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Current Booking</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reference:</span>
                    <span className="font-mono font-semibold">{bookingReference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Route:</span>
                    <span className="font-semibold">{origin} → {destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Departure:</span>
                    <span className="font-semibold">{formatDate(currentDepartureDate)}</span>
                  </div>
                  {currentReturnDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Return:</span>
                      <span className="font-semibold">{formatDate(currentReturnDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              {!isDuffelBooking && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-yellow-800">
                    Modifications are currently only supported for Duffel bookings. For Amadeus bookings, please contact our support team.
                  </p>
                </div>
              )}

              {/* New Dates */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Departure Date *
                  </label>
                  <input
                    type="date"
                    value={newDepartureDate}
                    onChange={(e) => setNewDepartureDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={!isDuffelBooking}
                  />
                </div>

                {currentReturnDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Return Date *
                    </label>
                    <input
                      type="date"
                      value={newReturnDate}
                      onChange={(e) => setNewReturnDate(e.target.value)}
                      min={newDepartureDate || new Date().toISOString().split('T')[0]}
                      className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      disabled={!isDuffelBooking}
                    />
                  </div>
                )}
              </div>

              {/* Important Info */}
              <div className="bg-info-50 border border-info-200 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-neutral-800 mb-2">Important Information</h4>
                <ul className="text-sm text-neutral-600 space-y-1 list-disc list-inside">
                  <li>Change fees may apply depending on your fare type</li>
                  <li>Price differences will be calculated for the new dates</li>
                  <li>Your original booking will be replaced with the new booking</li>
                  <li>Refunds for price decreases may take 7-10 business days</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestModification}
                  className="flex-1 px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || !isDuffelBooking || !newDepartureDate || (!!currentReturnDate && !newReturnDate)}
                >
                  {loading ? 'Searching...' : 'Search New Flights'}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Select Offer */}
          {step === 'offers' && (
            <div>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mb-4" />
                  <p className="text-gray-600">Finding available flights...</p>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-4">
                    Select a new flight option. Additional charges or refunds will be calculated.
                  </p>

                  <div className="space-y-3 mb-6">
                    {offers.map((offer) => (
                      <button
                        key={offer.offerId}
                        onClick={() => {
                          setSelectedOffer(offer);
                          setStep('confirm');
                        }}
                        className={`w-full border-2 rounded-xl p-4 text-left transition-all hover:border-primary-500 ${
                          selectedOffer?.offerId === offer.offerId ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">Flight Option</h4>
                            <p className="text-sm text-gray-500">Change Request ID: {offer.changeRequestId}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Total Cost</div>
                            <div className="text-xl font-bold text-gray-900">
                              {formatCurrency(offer.totalCost, offer.currency)}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Change Fee:</span>
                            <span className="ml-2 font-semibold">
                              {formatCurrency(offer.changeFee, offer.currency)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Price Difference:</span>
                            <span className={`ml-2 font-semibold ${offer.priceDifference >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {offer.priceDifference >= 0 ? '+' : ''}
                              {formatCurrency(offer.priceDifference, offer.currency)}
                            </span>
                          </div>
                        </div>

                        {offer.restrictions && offer.restrictions.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-gray-500">Restrictions:</p>
                            {offer.restrictions.map((restriction, idx) => (
                              <p key={idx} className="text-xs text-gray-600 mt-1">{restriction}</p>
                            ))}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setStep('select')}
                    className="w-full px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back to Date Selection
                  </button>
                </>
              )}
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && selectedOffer && (
            <div>
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-bold text-neutral-800 mb-4">Confirm Booking Change</h3>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Change Fee:</span>
                    <span className="font-semibold text-neutral-800">
                      {formatCurrency(selectedOffer.changeFee, selectedOffer.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Price Difference:</span>
                    <span className={`font-semibold ${selectedOffer.priceDifference >= 0 ? 'text-error-500' : 'text-success-500'}`}>
                      {selectedOffer.priceDifference >= 0 ? '+' : ''}
                      {formatCurrency(selectedOffer.priceDifference, selectedOffer.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-primary-200">
                    <span className="font-bold text-neutral-800">Total to Pay:</span>
                    <span className="text-2xl font-bold text-primary-600">
                      {formatCurrency(selectedOffer.totalCost, selectedOffer.currency)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('offers')}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmModification}
                  className="flex-1 px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    'Confirm & Pay'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && confirmation && (
            <div>
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Modified Successfully!</h3>
                <p className="text-gray-600 mb-4">{confirmation.message}</p>
                <p className="text-sm text-gray-500">
                  New Booking Reference: <span className="font-mono font-semibold">{confirmation.newBookingReference}</span>
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-green-900 mb-3">Change Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Change Fee:</span>
                    <span className="font-semibold text-green-900">
                      {formatCurrency(confirmation.changeFee, confirmation.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Price Difference:</span>
                    <span className={`font-semibold ${confirmation.priceDifference >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {confirmation.priceDifference >= 0 ? '+' : ''}
                      {formatCurrency(confirmation.priceDifference, confirmation.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-green-200">
                    <span className="font-bold text-green-900">Total Charged:</span>
                    <span className="font-bold text-green-900">
                      {formatCurrency(confirmation.totalCharged, confirmation.currency)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
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
