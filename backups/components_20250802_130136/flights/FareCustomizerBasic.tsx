'use client';

/**
 * 🎯 Fare Customizer Basic - Ultra Simple Version
 */

import React from 'react';
import { ProcessedFlightOffer } from '@/types/flights';
import { SparklesIcon, ArrowRightIcon } from '@/components/Icons';

interface FareCustomizerBasicProps {
  offer: ProcessedFlightOffer;
  onCustomizationChange?: (customization: any) => void;
  onViewAllOptions?: () => void;
  onSelectFlight?: (customizedOffer: ProcessedFlightOffer, customization: any) => void;
  compact?: boolean;
}

export default function FareCustomizerBasic({ 
  offer, 
  onViewAllOptions,
  onSelectFlight
}: FareCustomizerBasicProps) {
  const basePrice = parseFloat(offer.totalPrice.replace(/[^0-9.]/g, ''));
  
  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Customize This Flight</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onViewAllOptions}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            View All Options
            <ArrowRightIcon className="w-3 h-3" />
          </button>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">
              ${basePrice.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Simple Options Preview */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm font-medium text-blue-900">Free Changes</div>
          <div className="text-xs text-blue-700">+$45</div>
        </div>
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="text-sm font-medium text-green-900">Extra Bag</div>
          <div className="text-xs text-green-700">+$35</div>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="text-sm font-medium text-purple-900">Business</div>
          <div className="text-xs text-purple-700">+$250</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex gap-2">
          <button
            onClick={() => onSelectFlight?.(offer, {})}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Select Flight
          </button>
          <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Compare
          </button>
        </div>
        
        <div className="text-sm text-gray-600">
          Click options above to customize
        </div>
      </div>
    </div>
  );
}