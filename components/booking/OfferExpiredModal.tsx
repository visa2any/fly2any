'use client';

/**
 * Offer Expired Modal — Fly2Any
 *
 * Apple-Class Level 6 modal for handling expired offers.
 * Provides options to refresh price or search again.
 */

import { useState } from 'react';
import { AlertTriangle, RefreshCw, Search, X, Check, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OfferExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchParams: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    adults: number;
    children?: number;
    infants?: number;
  };
  originalOffer: {
    id: string;
    price: number;
    airline?: string;
    departureTime?: string;
  };
  onRefreshed?: (newOffer: any) => void;
}

export function OfferExpiredModal({
  isOpen,
  onClose,
  searchParams,
  originalOffer,
  onRefreshed,
}: OfferExpiredModalProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshResult, setRefreshResult] = useState<{
    success: boolean;
    offer?: any;
    priceChange?: number;
    message?: string;
    error?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshResult(null);

    try {
      const response = await fetch('/api/flights/offer/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalOfferId: originalOffer.id,
          origin: searchParams.origin,
          destination: searchParams.destination,
          departureDate: searchParams.departureDate,
          returnDate: searchParams.returnDate,
          adults: searchParams.adults,
          children: searchParams.children,
          infants: searchParams.infants,
          originalPrice: originalOffer.price,
          originalAirline: originalOffer.airline,
          originalDepartureTime: originalOffer.departureTime,
        }),
      });

      const data = await response.json();

      if (data.success && data.offer) {
        setRefreshResult({
          success: true,
          offer: data.offer,
          priceChange: data.priceChange,
          message: data.message,
        });
      } else {
        setRefreshResult({
          success: false,
          error: data.message || 'Unable to refresh price',
        });
      }
    } catch (error) {
      setRefreshResult({
        success: false,
        error: 'Network error. Please try again.',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleContinueWithNew = () => {
    if (refreshResult?.offer && onRefreshed) {
      onRefreshed(refreshResult.offer);
      onClose();
    }
  };

  const handleSearchAgain = () => {
    const params = new URLSearchParams({
      from: searchParams.origin,
      to: searchParams.destination,
      departure: searchParams.departureDate,
      adults: searchParams.adults.toString(),
    });

    if (searchParams.returnDate) {
      params.set('return', searchParams.returnDate);
    }

    router.push(`/flights/results?${params.toString()}`);
  };

  const newPrice = refreshResult?.offer?.price?.total
    ? parseFloat(refreshResult.offer.price.total)
    : null;
  const priceDiff = newPrice ? newPrice - originalOffer.price : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-white" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white">Price Expired</h2>
            <p className="text-sm text-white/80">Offers are valid for 30 minutes</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Route info */}
          <div className="flex items-center justify-center gap-2 text-lg font-medium text-gray-900">
            <span>{searchParams.origin}</span>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <span>{searchParams.destination}</span>
          </div>

          <p className="text-center text-gray-600">
            The price for this flight has expired. Would you like to check for the current price?
          </p>

          {/* Refresh Result */}
          {refreshResult && (
            <div className={`
              p-4 rounded-xl border
              ${refreshResult.success
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'}
            `}>
              {refreshResult.success && newPrice ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">New Price</span>
                    <span className="text-xl font-bold text-gray-900">
                      ${newPrice.toFixed(2)}
                    </span>
                  </div>
                  {priceDiff !== 0 && (
                    <div className={`
                      text-sm font-medium text-center py-1 px-2 rounded
                      ${priceDiff > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}
                    `}>
                      {priceDiff > 0 ? '+' : ''}${priceDiff.toFixed(2)} from original
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-red-700 text-center">
                  {refreshResult.error}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-2">
            {refreshResult?.success ? (
              <button
                onClick={handleContinueWithNew}
                className="
                  w-full flex items-center justify-center gap-2 px-4 py-3
                  bg-[#E74035] text-white font-semibold rounded-xl
                  hover:bg-[#D63930] transition-colors
                "
              >
                <Check className="w-5 h-5" />
                Continue with New Price
              </button>
            ) : (
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="
                  w-full flex items-center justify-center gap-2 px-4 py-3
                  bg-[#E74035] text-white font-semibold rounded-xl
                  hover:bg-[#D63930] transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Checking Price...' : 'Check Current Price'}
              </button>
            )}

            <button
              onClick={handleSearchAgain}
              className="
                w-full flex items-center justify-center gap-2 px-4 py-3
                bg-gray-100 text-gray-700 font-semibold rounded-xl
                hover:bg-gray-200 transition-colors
              "
            >
              <Search className="w-5 h-5" />
              Search All Flights
            </button>
          </div>

          {/* Tip */}
          <p className="text-xs text-gray-500 text-center pt-2">
            Tip: Complete your booking within 25 minutes to lock in the price.
          </p>
        </div>
      </div>
    </div>
  );
}
