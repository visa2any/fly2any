'use client';

import { Plane, Clock, Calendar, Users, TrendingUp, TrendingDown, Sparkles, Armchair, Luggage, Shield, Star, Utensils, Wifi, Calculator, Receipt, DollarSign, Lock } from 'lucide-react';
import { getAirportDisplay } from '@/lib/data/airports';

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
}: StickySummaryProps) {
  const subtotal = farePrice + addOns.reduce((sum, item) => sum + item.amount, 0);
  const total = subtotal + taxesAndFees;

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
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-3 text-white">
        <h3 className="text-base font-bold flex items-center gap-2">
          <Plane className="w-5 h-5" />
          Your Booking
        </h3>
      </div>

      {/* Flight Summary */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xl font-bold text-gray-900">
            {getAirportDisplay(flight.from)} → {getAirportDisplay(flight.to)}
          </span>
        </div>

        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{new Date(flight.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span>
              {passengerCount} {passengerCount === 1 ? 'Passenger' : 'Passengers'}
              {' • '}
              {flight.class.charAt(0).toUpperCase() + flight.class.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="p-3 border-b border-gray-200">
        {/* Base Fare */}
        <div className="flex justify-between items-center mb-1.5">
          <div className="flex items-center gap-2">
            <Plane className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
            <span className="text-xs text-gray-700">Flight Fare</span>
          </div>
          <span className="text-xs font-semibold text-gray-900">
            {currency} {farePrice.toFixed(2)}
          </span>
        </div>

        {/* Add-Ons */}
        {addOns.map((addOn, idx) => {
          const IconComponent = getAddOnIcon(addOn.label);
          return (
            <div key={idx} className="flex justify-between items-start mb-1.5">
              <div className="flex items-start gap-2 flex-1">
                <IconComponent className="w-3.5 h-3.5 text-primary-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-xs text-gray-700">{addOn.label}</span>
                  {addOn.subtext && (
                    <p className="text-xs text-gray-500">{addOn.subtext}</p>
                  )}
                </div>
              </div>
              <span className="text-xs font-semibold text-gray-900">
                {currency} {addOn.amount.toFixed(2)}
              </span>
            </div>
          );
        })}

        {/* Subtotal */}
        <div className="flex justify-between items-center pt-1.5 border-t border-gray-200 mb-1.5">
          <div className="flex items-center gap-2">
            <Calculator className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
            <span className="text-xs font-semibold text-gray-700">Subtotal</span>
          </div>
          <span className="text-xs font-semibold text-gray-900">
            {currency} {subtotal.toFixed(2)}
          </span>
        </div>

        {/* Taxes & Fees */}
        <div className="flex justify-between items-center mb-1.5">
          <div className="flex items-center gap-2">
            <Receipt className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
            <span className="text-xs text-gray-700">Taxes & Fees</span>
          </div>
          <span className="text-xs font-semibold text-gray-900">
            {currency} {taxesAndFees.toFixed(2)}
          </span>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center pt-2 border-t-2 border-gray-300">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary-600 flex-shrink-0" />
            <span className="text-sm font-bold text-gray-900">TOTAL</span>
          </div>
          <span className="text-xl font-bold text-primary-600">
            {currency} {total.toFixed(2)}
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
                COMPLETE BOOKING • {currency} {total.toFixed(2)}
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
