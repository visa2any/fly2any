'use client';

/**
 * Mobile Pricing Footer
 * Sticky bottom bar for mobile Journey view
 * Level 6 Ultra-Premium / Apple-Class
 */

import React from 'react';
import { ChevronUp, Sparkles } from 'lucide-react';
import { JourneyPricing } from '@/lib/journey/types';
import { PricingAggregator } from '@/lib/journey/services/PricingAggregator';

interface MobilePricingFooterProps {
  pricing: JourneyPricing;
  onExpand: () => void;
  onCheckout: () => void;
  isCheckoutDisabled?: boolean;
}

export function MobilePricingFooter({
  pricing,
  onExpand,
  onCheckout,
  isCheckoutDisabled = false,
}: MobilePricingFooterProps) {
  const hasContent = pricing.flights.subtotal > 0 || pricing.hotels.subtotal > 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] safe-area-bottom">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Price Summary */}
          <button
            onClick={onExpand}
            className="flex-1 flex items-center justify-between"
          >
            <div>
              <p className="text-xs text-gray-500">Total Journey</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900">
                  {PricingAggregator.formatPrice(pricing.total, pricing.currency)}
                </span>
                {pricing.savings && pricing.savings.amount > 0 && (
                  <span className="text-xs text-green-600 font-medium">
                    Save {PricingAggregator.formatPrice(pricing.savings.amount, pricing.currency)}
                  </span>
                )}
              </div>
            </div>
            <ChevronUp className="w-5 h-5 text-gray-400" />
          </button>

          {/* Checkout Button */}
          <button
            onClick={onCheckout}
            disabled={isCheckoutDisabled || !hasContent}
            className="h-12 px-6 bg-gradient-to-r from-[#D63A35] to-[#C7342F] hover:from-[#C7342F] hover:to-[#B12F2B] text-white font-semibold rounded-xl shadow-lg shadow-red-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Book</span>
          </button>
        </div>

        {/* Quick breakdown */}
        {hasContent && (
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 overflow-x-auto pb-1">
            {pricing.flights.subtotal > 0 && (
              <span>Flights: {PricingAggregator.formatPrice(pricing.flights.subtotal, pricing.currency)}</span>
            )}
            {pricing.hotels.subtotal > 0 && (
              <span>Hotels: {PricingAggregator.formatPrice(pricing.hotels.subtotal, pricing.currency)}</span>
            )}
            {pricing.experiences.subtotal > 0 && (
              <span>Activities: {PricingAggregator.formatPrice(pricing.experiences.subtotal, pricing.currency)} (est.)</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MobilePricingFooter;
