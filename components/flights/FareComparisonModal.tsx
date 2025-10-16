'use client';

import { useState, useEffect } from 'react';
import { X, Check, AlertTriangle, Info } from 'lucide-react';
import { ParsedFareRules } from '@/lib/utils/fareRuleParsers';

/**
 * FareComparisonModal - Side-by-side comparison of fare classes
 *
 * Purpose: Help users understand EXACTLY what they're buying before booking
 * Critical for DOT compliance - must show all restrictions upfront
 *
 * Shows:
 * - Basic vs Standard vs Premium fare options
 * - What's included/excluded in each fare class
 * - Refund & change policies clearly
 * - Price differences with "BEST VALUE" recommendations
 */

export interface FareOption {
  fareClass: 'BASIC' | 'STANDARD' | 'PREMIUM' | 'BUSINESS';
  price: number;
  currency: string;

  // Baggage allowance
  carryOnIncluded: boolean;
  checkedBagsIncluded: number;

  // Seat selection
  seatSelectionIncluded: boolean;
  seatSelectionFee?: number;

  // Fare rules (from API)
  fareRules?: ParsedFareRules;

  // Amenities
  priorityBoarding?: boolean;
  loungeAccess?: boolean;
  mealIncluded?: boolean;
  wifiIncluded?: boolean;

  // Savings/recommendations
  recommended?: boolean;
  savingsVsNext?: number;
}

interface FareComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFare: FareOption;
  availableFares: FareOption[];
  onSelectFare: (fare: FareOption) => void;
  flightRoute: string; // e.g., "JFK → LAX"
  flightDate: string;
}

export default function FareComparisonModal({
  isOpen,
  onClose,
  currentFare,
  availableFares,
  onSelectFare,
  flightRoute,
  flightDate,
}: FareComparisonModalProps) {
  const [selectedFare, setSelectedFare] = useState<FareOption>(currentFare);
  const [loadingFareRules, setLoadingFareRules] = useState(false);

  // Reset selected fare when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedFare(currentFare);
    }
  }, [isOpen, currentFare]);

  if (!isOpen) return null;

  const handleSelectFare = (fare: FareOption) => {
    setSelectedFare(fare);
  };

  const handleConfirmSelection = () => {
    onSelectFare(selectedFare);
    onClose();
  };

  // Calculate price difference from current fare
  const getPriceDifference = (fare: FareOption) => {
    const diff = fare.price - currentFare.price;
    if (diff === 0) return null;
    return diff > 0 ? `+$${diff}` : `-$${Math.abs(diff)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-1">Compare Fare Options</h2>
            <p className="text-blue-100 text-sm">
              {flightRoute} • {flightDate}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Comparison Table */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availableFares.map((fare, index) => {
              const isCurrentFare = fare.fareClass === currentFare.fareClass;
              const isSelectedFare = fare.fareClass === selectedFare.fareClass;
              const priceDiff = getPriceDifference(fare);

              return (
                <div
                  key={index}
                  onClick={() => handleSelectFare(fare)}
                  className={`
                    relative border-2 rounded-xl p-6 cursor-pointer transition-all
                    ${isSelectedFare
                      ? 'border-blue-600 bg-blue-50 shadow-lg scale-[1.02]'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }
                    ${fare.recommended ? 'ring-2 ring-green-500' : ''}
                  `}
                >
                  {/* Recommended badge */}
                  {fare.recommended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      BEST VALUE
                    </div>
                  )}

                  {/* Current fare badge */}
                  {isCurrentFare && (
                    <div className="absolute top-4 right-4 bg-gray-600 text-white text-xs font-semibold px-2 py-1 rounded">
                      Current
                    </div>
                  )}

                  {/* Fare class name */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {fare.fareClass === 'BASIC' && 'Basic Economy'}
                    {fare.fareClass === 'STANDARD' && 'Economy Plus'}
                    {fare.fareClass === 'PREMIUM' && 'Premium Economy'}
                    {fare.fareClass === 'BUSINESS' && 'Business Class'}
                  </h3>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-gray-900">
                      ${fare.price}
                    </div>
                    {priceDiff && (
                      <div className={`text-sm font-semibold ${priceDiff.startsWith('+') ? 'text-orange-600' : 'text-green-600'}`}>
                        {priceDiff} vs current fare
                      </div>
                    )}
                    {fare.savingsVsNext && (
                      <div className="text-xs text-green-600 mt-1">
                        Save ${fare.savingsVsNext} vs next tier
                      </div>
                    )}
                  </div>

                  {/* Features list */}
                  <div className="space-y-3 mb-4">

                    {/* Baggage */}
                    <FeatureRow
                      included={fare.carryOnIncluded}
                      label="Carry-on bag"
                    />
                    <FeatureRow
                      included={fare.checkedBagsIncluded > 0}
                      label={fare.checkedBagsIncluded > 1
                        ? `${fare.checkedBagsIncluded} checked bags`
                        : fare.checkedBagsIncluded === 1
                        ? '1 checked bag'
                        : 'Checked bag'
                      }
                    />

                    {/* Seat selection */}
                    <FeatureRow
                      included={fare.seatSelectionIncluded}
                      label="Seat selection"
                      additionalInfo={!fare.seatSelectionIncluded && fare.seatSelectionFee
                        ? `$${fare.seatSelectionFee} fee`
                        : undefined
                      }
                    />

                    {/* Refund policy */}
                    <FeatureRow
                      included={fare.fareRules?.refundable ?? false}
                      label="Refundable"
                      additionalInfo={fare.fareRules?.refundable && fare.fareRules.refundFee
                        ? `$${fare.fareRules.refundFee} fee`
                        : !fare.fareRules?.refundable
                        ? '24h grace only'
                        : undefined
                      }
                    />

                    {/* Change policy */}
                    <FeatureRow
                      included={fare.fareRules?.changeable ?? false}
                      label="Changes allowed"
                      additionalInfo={fare.fareRules?.changeable && fare.fareRules.changeFee
                        ? `$${fare.fareRules.changeFee} fee`
                        : undefined
                      }
                    />

                    {/* Premium amenities (if applicable) */}
                    {fare.priorityBoarding && (
                      <FeatureRow
                        included={true}
                        label="Priority boarding"
                      />
                    )}
                    {fare.loungeAccess && (
                      <FeatureRow
                        included={true}
                        label="Lounge access"
                      />
                    )}
                    {fare.mealIncluded && (
                      <FeatureRow
                        included={true}
                        label="Meal included"
                      />
                    )}
                    {fare.wifiIncluded && (
                      <FeatureRow
                        included={true}
                        label="Free Wi-Fi"
                      />
                    )}
                  </div>

                  {/* Select button */}
                  <button
                    onClick={() => handleSelectFare(fare)}
                    className={`
                      w-full py-3 rounded-lg font-semibold transition
                      ${isSelectedFare
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {isSelectedFare ? 'Selected' : 'Select This Fare'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Important notice */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
            <AlertTriangle className="text-yellow-600 flex-shrink-0" size={20} />
            <div className="text-sm text-gray-700">
              <strong className="font-semibold text-gray-900">Important:</strong> All fares include free cancellation within 24 hours of booking (DOT requirement). Restrictions apply after 24 hours based on fare class selected.
            </div>
          </div>
        </div>

        {/* Footer with action buttons */}
        <div className="border-t bg-gray-50 p-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Selected: <strong className="text-gray-900">{selectedFare.fareClass}</strong> • ${selectedFare.price}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSelection}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Confirm & Continue
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

/**
 * FeatureRow - Single feature with checkmark or X
 */
function FeatureRow({
  included,
  label,
  additionalInfo,
}: {
  included: boolean;
  label: string;
  additionalInfo?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      {included ? (
        <Check className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
      ) : (
        <X className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
      )}
      <div className="flex-1">
        <span className={`text-sm ${included ? 'text-gray-700' : 'text-gray-500'}`}>
          {label}
        </span>
        {additionalInfo && (
          <span className="text-xs text-gray-500 ml-1">
            ({additionalInfo})
          </span>
        )}
      </div>
    </div>
  );
}
