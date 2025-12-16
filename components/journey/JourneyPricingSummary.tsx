'use client';

/**
 * Journey Pricing Summary
 * Fly2Any Travel Operating System
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plane, Building2, Sparkles, Tag, Info } from 'lucide-react';
import { JourneyPricing } from '@/lib/journey/types';
import { PricingAggregator } from '@/lib/journey/services/PricingAggregator';

interface JourneyPricingSummaryProps {
  pricing: JourneyPricing;
  travelers: { adults: number; children: number };
  onCheckout?: () => void;
  isCheckoutDisabled?: boolean;
}

export function JourneyPricingSummary({
  pricing,
  travelers,
  onCheckout,
  isCheckoutDisabled = false,
}: JourneyPricingSummaryProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const totalTravelers = travelers.adults + travelers.children;
  const hasContent = pricing.flights.subtotal > 0 || pricing.hotels.subtotal > 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Journey Price</h3>
      </div>

      {/* Price Breakdown */}
      <div className="p-5 space-y-4">
        {/* Flights */}
        {pricing.flights.subtotal > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <Plane className="w-4 h-4" />
              <span className="text-sm">Flights</span>
            </div>
            <span className="font-medium text-gray-900">
              {PricingAggregator.formatPrice(pricing.flights.subtotal, pricing.currency)}
            </span>
          </div>
        )}

        {/* Hotels */}
        {pricing.hotels.subtotal > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <Building2 className="w-4 h-4" />
              <span className="text-sm">Hotels</span>
            </div>
            <span className="font-medium text-gray-900">
              {PricingAggregator.formatPrice(pricing.hotels.subtotal, pricing.currency)}
            </span>
          </div>
        )}

        {/* Experiences */}
        {pricing.experiences.subtotal > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">
                Experiences
                {pricing.experiences.isEstimate && (
                  <span className="text-xs text-gray-400 ml-1">(est.)</span>
                )}
              </span>
            </div>
            <span className="font-medium text-gray-900">
              {PricingAggregator.formatPrice(pricing.experiences.subtotal, pricing.currency)}
            </span>
          </div>
        )}

        {/* Expanded Breakdown */}
        {showBreakdown && (
          <div className="pt-3 border-t border-gray-100 space-y-3">
            {/* Flight items */}
            {pricing.flights.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm pl-6">
                <span className="text-gray-500">{item.name}</span>
                <span className="text-gray-700">
                  {PricingAggregator.formatPrice(item.totalPrice, item.currency)}
                </span>
              </div>
            ))}

            {/* Hotel items */}
            {pricing.hotels.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm pl-6">
                <span className="text-gray-500">
                  {item.name}
                  <span className="text-xs ml-1">({item.quantity} nights)</span>
                </span>
                <span className="text-gray-700">
                  {PricingAggregator.formatPrice(item.totalPrice, item.currency)}
                </span>
              </div>
            ))}

            {/* Experience items */}
            {pricing.experiences.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm pl-6">
                <span className="text-gray-500">{item.name}</span>
                <span className="text-gray-700">
                  {PricingAggregator.formatPrice(item.totalPrice, item.currency)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Toggle breakdown */}
        {hasContent && (
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="flex items-center gap-1 text-sm text-[#D63A35] hover:text-[#B12F2B] transition-colors"
          >
            {showBreakdown ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Hide details
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                View details
              </>
            )}
          </button>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200 pt-4">
          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-gray-900">
              {PricingAggregator.formatPrice(pricing.total, pricing.currency)}
            </span>
          </div>

          {/* Per person */}
          {pricing.perPerson && totalTravelers > 1 && (
            <p className="text-sm text-gray-500 text-right mt-1">
              {PricingAggregator.formatPrice(pricing.perPerson, pricing.currency)} per person
            </p>
          )}

          {/* Savings */}
          {pricing.savings && pricing.savings.amount > 0 && (
            <div className="flex items-center gap-2 mt-3 p-2 bg-green-50 rounded-lg">
              <Tag className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">
                Save {PricingAggregator.formatPrice(pricing.savings.amount, pricing.currency)} vs booking separately
              </span>
            </div>
          )}
        </div>

        {/* Empty state */}
        {!hasContent && (
          <div className="text-center py-6">
            <Info className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              Select flights and hotels to see pricing
            </p>
          </div>
        )}
      </div>

      {/* Checkout Button */}
      <div className="p-5 pt-0">
        <button
          onClick={onCheckout}
          disabled={isCheckoutDisabled || !hasContent}
          className="w-full h-12 bg-gradient-to-r from-[#D63A35] to-[#C7342F] hover:from-[#C7342F] hover:to-[#B12F2B] text-white font-semibold rounded-xl shadow-lg shadow-red-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          Continue to Checkout
        </button>
        <p className="text-xs text-gray-500 text-center mt-2">
          Best price guarantee • Free cancellation on select items
        </p>
      </div>
    </div>
  );
}

export default JourneyPricingSummary;
