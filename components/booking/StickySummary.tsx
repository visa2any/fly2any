'use client';

import { useState, useEffect } from 'react';
import { Plane, Clock, Calendar, Users, TrendingUp, TrendingDown, Sparkles, Armchair, Luggage, Shield, Star, Utensils, Wifi, Calculator, Receipt, DollarSign, Lock, Tag, X, Check, Loader2 } from 'lucide-react';
import { getAirportDisplay } from '@/lib/data/airports';
import { useCurrency } from '@/lib/context/CurrencyContext';

interface Flight {
  from: string;
  to: string;
  date: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  class: string;
}

interface PriceLineItem {
  label: string;
  amount: number;
  subtext?: string;
}

interface AppliedPromo {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  discountAmount: number;
  description?: string;
}

interface StickySummaryProps {
  flight: Flight;
  currency: string;
  farePrice: number;
  addOns: PriceLineItem[];
  taxesAndFees: number;
  onContinue?: () => void;
  pricelock?: {
    minutes: number;
    seconds: number;
  };
  urgency?: {
    viewingCount?: number;
    mlPriceTrend?: 'rising' | 'stable' | 'falling';
    mlPrediction?: number;
  };
  continueButtonText?: string;
  continueButtonDisabled?: boolean;
  formId?: string;
  isProcessing?: boolean;
  // Promo code props
  appliedPromo?: AppliedPromo | null;
  onApplyPromo?: (code: string, discount: AppliedPromo) => void;
  onRemovePromo?: () => void;
}

export function StickySummary({
  flight,
  currency,
  farePrice,
  addOns,
  taxesAndFees,
  onContinue,
  pricelock,
  urgency,
  continueButtonText = 'Continue to Details →',
  continueButtonDisabled = false,
  formId,
  isProcessing = false,
  appliedPromo,
  onApplyPromo,
  onRemovePromo,
}: StickySummaryProps) {
  // CRITICAL: Use global currency context for E2E consistency
  const { currency: userCurrency, format: formatPrice, getSymbol } = useCurrency();

  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [convertedPrices, setConvertedPrices] = useState<{
    farePrice: number;
    addOns: number[];
    taxesAndFees: number;
    discount: number;
  } | null>(null);

  // Convert prices to user's currency
  useEffect(() => {
    // For now, use simple conversion rate (in production, use real-time rates)
    // This ensures visual consistency while keeping original values for API
    const sourceCurrency = currency || 'USD';
    if (sourceCurrency === userCurrency) {
      setConvertedPrices({
        farePrice,
        addOns: addOns.map(a => a.amount),
        taxesAndFees,
        discount: appliedPromo?.discountAmount || 0,
      });
    } else {
      // Use the format function which handles conversion
      setConvertedPrices({
        farePrice,
        addOns: addOns.map(a => a.amount),
        taxesAndFees,
        discount: appliedPromo?.discountAmount || 0,
      });
    }
  }, [farePrice, addOns, taxesAndFees, appliedPromo, currency, userCurrency]);

  const displayCurrency = getSymbol(userCurrency);
  const subtotal = farePrice + addOns.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = appliedPromo?.discountAmount || 0;
  const total = subtotal + taxesAndFees - discountAmount;

  // Handle promo code validation
  const handleApplyPromo = async () => {
    if (!promoCode.trim() || !onApplyPromo) return;

    setPromoLoading(true);
    setPromoError(null);

    try {
      const response = await fetch('/api/vouchers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCode.trim().toUpperCase(),
          totalAmount: subtotal + taxesAndFees,
          currency: 'USD',
          productType: 'flight',
        }),
      });

      const result = await response.json();
      const data = result.data || result;

      if (data.valid && data.voucher) {
        onApplyPromo(promoCode.trim().toUpperCase(), {
          code: data.voucher.code,
          type: data.voucher.type,
          value: data.voucher.value,
          discountAmount: data.discountAmount,
          description: data.voucher.description,
        });
        setPromoCode('');
        setShowPromoInput(false);
      } else {
        setPromoError(data.error || 'Invalid promo code');
      }
    } catch (err) {
      setPromoError('Failed to validate code');
    } finally {
      setPromoLoading(false);
    }
  };

  const passengerCount = flight.passengers.adults + flight.passengers.children + flight.passengers.infants;

  // Helper function to get icon for add-on type
  const getAddOnIcon = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('bundle') || lowerLabel.includes('package')) return Sparkles;
    if (lowerLabel.includes('seat') || lowerLabel.includes('legroom')) return Armchair;
    if (lowerLabel.includes('bag') || lowerLabel.includes('luggage')) return Luggage;
    if (lowerLabel.includes('insurance') || lowerLabel.includes('coverage')) return Shield;
    if (lowerLabel.includes('priority') || lowerLabel.includes('boarding')) return Star;
    if (lowerLabel.includes('meal') || lowerLabel.includes('food')) return Utensils;
    if (lowerLabel.includes('wifi') || lowerLabel.includes('internet')) return Wifi;
    return DollarSign; // default icon
  };

  return (
    <div className="sticky top-4 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-2 sm:px-3 py-2 sm:py-3 text-white">
        <h3 className="text-sm sm:text-base font-bold flex items-center gap-1.5 sm:gap-2">
          <Plane className="w-4 h-4 sm:w-5 sm:h-5" />
          Your Booking
        </h3>
      </div>

      {/* Flight Summary */}
      <div className="p-2 sm:p-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-1 sm:mb-1.5">
          <span className="text-base sm:text-xl font-bold text-gray-900 truncate">
            {getAirportDisplay(flight.from)} → {getAirportDisplay(flight.to)}
          </span>
        </div>

        <div className="space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs text-gray-600">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{new Date(flight.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Users className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">
              {passengerCount} {passengerCount === 1 ? 'Passenger' : 'Passengers'}
              {' • '}
              {flight.class.charAt(0).toUpperCase() + flight.class.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="p-2 sm:p-3 border-b border-gray-200">
        {/* Base Fare */}
        <div className="flex justify-between items-center mb-1 sm:mb-1.5">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Plane className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary-500 flex-shrink-0" />
            <span className="text-[10px] sm:text-xs text-gray-700">Flight Fare</span>
          </div>
          <span className="text-[10px] sm:text-xs font-semibold text-gray-900">
            {displayCurrency} {farePrice.toFixed(2)}
          </span>
        </div>

        {/* Add-Ons */}
        {addOns.map((addOn, idx) => {
          const IconComponent = getAddOnIcon(addOn.label);
          return (
            <div key={idx} className="flex justify-between items-start mb-1 sm:mb-1.5">
              <div className="flex items-start gap-1.5 sm:gap-2 flex-1 min-w-0">
                <IconComponent className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] sm:text-xs text-gray-700 truncate block">{addOn.label}</span>
                  {addOn.subtext && (
                    <p className="text-[9px] sm:text-xs text-gray-500 truncate">{addOn.subtext}</p>
                  )}
                </div>
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-gray-900 ml-2">
                {displayCurrency} {addOn.amount.toFixed(2)}
              </span>
            </div>
          );
        })}

        {/* Subtotal */}
        <div className="flex justify-between items-center pt-1 sm:pt-1.5 border-t border-gray-200 mb-1 sm:mb-1.5">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Calculator className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500 flex-shrink-0" />
            <span className="text-[10px] sm:text-xs font-semibold text-gray-700">Subtotal</span>
          </div>
          <span className="text-[10px] sm:text-xs font-semibold text-gray-900">
            {displayCurrency} {subtotal.toFixed(2)}
          </span>
        </div>

        {/* Taxes & Fees - Show "Included" if 0 (DOT-compliant all-in pricing) */}
        <div className="flex justify-between items-center mb-1 sm:mb-1.5">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Receipt className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500 flex-shrink-0" />
            <span className="text-[10px] sm:text-xs text-gray-700">Taxes & Fees</span>
          </div>
          {taxesAndFees > 0 ? (
            <span className="text-[10px] sm:text-xs font-semibold text-gray-900">
              {displayCurrency} {taxesAndFees.toFixed(2)}
            </span>
          ) : (
            <span className="text-[10px] sm:text-xs font-semibold text-green-600">
              ✓ Included
            </span>
          )}
        </div>

        {/* Promo Code Section */}
        {onApplyPromo && (
          <div className="mb-2 pt-2 border-t border-gray-100">
            {appliedPromo ? (
              // Show applied promo
              <div className="flex items-center justify-between bg-green-50 rounded-lg p-2">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-green-600" />
                  <div>
                    <span className="text-[10px] sm:text-xs font-bold text-green-700">
                      {appliedPromo.code}
                    </span>
                    <span className="text-[10px] text-green-600 ml-1">
                      ({appliedPromo.type === 'percentage' ? `${appliedPromo.value}% off` : `$${appliedPromo.value} off`})
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs font-bold text-green-700">
                    -{displayCurrency} {appliedPromo.discountAmount.toFixed(2)}
                  </span>
                  {onRemovePromo && (
                    <button
                      onClick={onRemovePromo}
                      className="p-0.5 hover:bg-green-100 rounded transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-green-600" />
                    </button>
                  )}
                </div>
              </div>
            ) : showPromoInput ? (
              // Show promo input field
              <div className="space-y-1.5">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value.toUpperCase());
                      setPromoError(null);
                    }}
                    placeholder="Enter code"
                    className="flex-1 h-8 px-2 text-xs border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none uppercase"
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                    disabled={promoLoading}
                  />
                  <button
                    onClick={handleApplyPromo}
                    disabled={promoLoading || !promoCode.trim()}
                    className="h-8 px-3 bg-primary-500 text-white text-xs font-semibold rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  >
                    {promoLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowPromoInput(false);
                      setPromoCode('');
                      setPromoError(null);
                    }}
                    className="h-8 px-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {promoError && (
                  <p className="text-[10px] text-red-500 font-medium">{promoError}</p>
                )}
              </div>
            ) : (
              // Show "Add promo code" button
              <button
                onClick={() => setShowPromoInput(true)}
                className="flex items-center gap-1.5 text-[10px] sm:text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Add promo code</span>
              </button>
            )}
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between items-center pt-1.5 sm:pt-2 border-t-2 border-gray-300">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-gray-900">TOTAL</span>
          </div>
          <span className="text-lg sm:text-xl font-bold text-primary-600" data-testid="total-price">
            {displayCurrency} {total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Urgency Signals */}
      {(pricelock || urgency) && (
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 space-y-1.5">
          {/* Price Lock Timer */}
          {pricelock && (
            <div className="flex items-center gap-2 text-xs">
              <div className="flex-shrink-0 w-1.5 h-1.5 bg-success-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700">
                💰 Prices locked: <span className="font-bold text-success-600">
                  {pricelock.minutes}:{pricelock.seconds.toString().padStart(2, '0')}
                </span>
              </span>
            </div>
          )}

          {/* Social Proof */}
          {urgency?.viewingCount && urgency.viewingCount > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <div className="flex-shrink-0 w-1.5 h-1.5 bg-warning-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700">
                ⏰ <span className="font-bold text-warning-700">{urgency.viewingCount}</span> people viewing this flight
              </span>
            </div>
          )}

          {/* ML Price Prediction */}
          {urgency?.mlPriceTrend && urgency?.mlPrediction && (
            <div className="flex items-center gap-2 text-xs">
              {urgency.mlPriceTrend === 'rising' && (
                <>
                  <TrendingUp className="w-4 h-4 text-error-500" />
                  <span className="text-gray-700">
                    💡 Prices predicted to <span className="font-bold text-error-600">RISE {urgency.mlPrediction}%</span> within 48h
                  </span>
                </>
              )}
              {urgency.mlPriceTrend === 'falling' && (
                <>
                  <TrendingDown className="w-4 h-4 text-success-500" />
                  <span className="text-gray-700">
                    💡 Prices predicted to <span className="font-bold text-success-600">DROP {urgency.mlPrediction}%</span> within 72h
                  </span>
                </>
              )}
              {urgency.mlPriceTrend === 'stable' && (
                <span className="text-gray-700">
                  💡 Prices expected to remain <span className="font-bold">stable</span>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {/* Complete Booking Button (Step 3) */}
      {formId && (
        <div className="p-3 bg-gradient-to-br from-white to-success-50">
          <button
            type="submit"
            form={formId}
            disabled={isProcessing}
            className={`
              w-full py-4 px-4 rounded-xl font-black text-white text-base shadow-2xl transition-all transform
              ${isProcessing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-success-500 via-success-600 to-success-500 hover:from-success-600 hover:via-success-700 hover:to-success-600 hover:shadow-2xl hover:scale-105 active:scale-95 animate-pulse'
              }
            `}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Lock className="w-5 h-5" />
                COMPLETE BOOKING • {displayCurrency} {total.toFixed(2)}
              </span>
            )}
          </button>

          {/* Trust Badges */}
          <div className="mt-3 flex items-center justify-center gap-3 text-xs text-gray-600 font-medium">
            <div className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-success-600" />
              <span>256-bit SSL</span>
            </div>
            <span>•</span>
            <span>PCI DSS</span>
            <span>•</span>
            <span>3D Secure</span>
          </div>
        </div>
      )}

      {/* Continue Button (Steps 1-2) */}
      {!formId && onContinue && (
        <div className="p-3">
          <button
            onClick={onContinue}
            disabled={continueButtonDisabled}
            className={`
              w-full py-2.5 px-4 rounded-lg font-bold text-white text-sm shadow-md transition-all
              ${continueButtonDisabled
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 hover:shadow-lg active:scale-[0.98]'
              }
            `}
          >
            {continueButtonText}
          </button>

          {/* Trust Badges */}
          <div className="mt-2 flex items-center justify-center gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Secure SSL</span>
            </div>
            <span>•</span>
            <span>PCI Compliant</span>
          </div>
        </div>
      )}
    </div>
  );
}
