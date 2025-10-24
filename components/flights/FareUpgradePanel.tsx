'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Loader2, Check, X, Sparkles } from 'lucide-react';

interface FareOption {
  id: string;
  price: {
    total: string;
    currency: string;
  };
  travelerPricings: Array<{
    fareOption: string;
    fareDetailsBySegment: Array<{
      cabin: string;
      brandedFare?: string;
      fareBasis: string;
      includedCheckedBags?: {
        quantity: number;
      };
      amenities?: Array<{
        description: string;
        isChargeable: boolean;
      }>;
    }>;
  }>;
}

interface FareUpgradePanelProps {
  flightOffer: any;
  onSelectFare?: (fareOption: FareOption) => void;
}

// Helper to get fare family display name
function getFareFamilyName(brandedFare: string | undefined, cabin: string): string {
  if (!brandedFare) return cabin;

  // Map branded fare codes to user-friendly names
  const fareNames: Record<string, string> = {
    'DN': 'Basic',
    'AN': 'Standard',
    'GN': 'Plus',
    'EN': 'Extra',
    'AR': 'Flexible',
    'MN': 'Business',
    'MR': 'Business Flexible',
    'BASIC': 'Basic Economy',
    'STANDARD': 'Standard',
    'FLEX': 'Flexible',
    'PREMIUM': 'Premium',
  };

  return fareNames[brandedFare] || brandedFare;
}

// Helper to parse amenities into categories
function parseAmenities(amenities: Array<{description: string}> | undefined) {
  if (!amenities || amenities.length === 0) {
    return {
      bags: [],
      seat: [],
      flexibility: [],
      comfort: [],
      other: []
    };
  }

  const categories = {
    bags: [] as string[],
    seat: [] as string[],
    flexibility: [] as string[],
    comfort: [] as string[],
    other: [] as string[]
  };

  amenities.forEach(({ description }) => {
    const desc = description.toLowerCase();

    if (desc.includes('bag') || desc.includes('luggage')) {
      categories.bags.push(description);
    } else if (desc.includes('seat') || desc.includes('boarding') || desc.includes('selection')) {
      categories.seat.push(description);
    } else if (desc.includes('refund') || desc.includes('change') || desc.includes('cancel')) {
      categories.flexibility.push(description);
    } else if (desc.includes('legroom') || desc.includes('meal') || desc.includes('drink') || desc.includes('wifi') || desc.includes('tv') || desc.includes('bed')) {
      categories.comfort.push(description);
    } else {
      categories.other.push(description);
    }
  });

  return categories;
}

export default function FareUpgradePanel({ flightOffer, onSelectFare }: FareUpgradePanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fareOptions, setFareOptions] = useState<FareOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedFareId, setSelectedFareId] = useState<string | null>(null);

  const handleToggle = async () => {
    if (!isExpanded && fareOptions.length === 0) {
      // First time expanding - fetch fare families
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/flights/upselling', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ flightOffer }),
        });

        const data = await response.json();

        if (data.success && data.fareOptions && data.fareOptions.length > 0) {
          setFareOptions(data.fareOptions);
        } else {
          setError('No fare upgrades available for this flight');
        }
      } catch (err) {
        console.error('Error fetching fare families:', err);
        setError('Failed to load fare options. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    setIsExpanded(!isExpanded);
  };

  const handleSelectFare = (fare: FareOption) => {
    setSelectedFareId(fare.id);
    if (onSelectFare) {
      onSelectFare(fare);
    }
  };

  // Get current (cheapest) fare details
  const currentFare = flightOffer.travelerPricings?.[0]?.fareDetailsBySegment?.[0];
  const currentPrice = parseFloat(flightOffer.price?.total || '0');

  return (
    <div className="border-t border-gray-200 mt-4 pt-4">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 rounded-lg transition-colors group"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <div className="text-left">
            <div className="font-semibold text-gray-900">Upgrade to Premium Fares</div>
            <div className="text-xs text-gray-600">
              Compare fare options & benefits • From ${currentPrice.toFixed(2)}
            </div>
          </div>
        </div>

        {isLoading ? (
          <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
        ) : isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-3">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="ml-3 text-gray-600">Loading fare options...</span>
            </div>
          )}

          {!isLoading && !error && fareOptions.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wide px-3">
                {fareOptions.length} fare {fareOptions.length === 1 ? 'option' : 'options'} available
              </div>

              {fareOptions.map((fare, index) => {
                const tp = fare.travelerPricings?.[0];
                const segment = tp?.fareDetailsBySegment?.[0];
                const price = parseFloat(fare.price?.total || '0');
                const priceDiff = price - currentPrice;
                const isCurrentFare = index === 0; // First one is cheapest (current)
                const amenityCategories = parseAmenities(segment?.amenities);

                return (
                  <div
                    key={fare.id}
                    className={`border-2 rounded-lg p-4 transition-all ${
                      selectedFareId === fare.id
                        ? 'border-blue-500 bg-blue-50'
                        : isCurrentFare
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-lg text-gray-900">
                            {getFareFamilyName(segment?.brandedFare, segment?.cabin || 'ECONOMY')}
                          </h4>
                          {isCurrentFare && (
                            <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-semibold rounded">
                              Current Selection
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5">
                          {segment?.cabin} • Fare Code: {segment?.brandedFare || 'Standard'}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          ${price.toFixed(2)}
                        </div>
                        {!isCurrentFare && priceDiff > 0 && (
                          <div className="text-xs text-amber-600 font-semibold">
                            +${priceDiff.toFixed(2)} upgrade
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Key Features */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {/* Bags */}
                      <div className="flex items-start gap-2">
                        {segment?.includedCheckedBags?.quantity && segment.includedCheckedBags.quantity > 0 ? (
                          <>
                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">
                              {segment.includedCheckedBags.quantity} checked bag{segment.includedCheckedBags.quantity > 1 ? 's' : ''}
                            </span>
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-500">No checked bags</span>
                          </>
                        )}
                      </div>

                      {/* Refundability */}
                      <div className="flex items-start gap-2">
                        {amenityCategories.flexibility.some(a => a.toLowerCase().includes('refund')) ? (
                          <>
                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">Refundable</span>
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-500">Non-refundable</span>
                          </>
                        )}
                      </div>

                      {/* Changes */}
                      <div className="flex items-start gap-2">
                        {amenityCategories.flexibility.some(a => a.toLowerCase().includes('change')) ? (
                          <>
                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">Changes allowed</span>
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-500">No changes</span>
                          </>
                        )}
                      </div>

                      {/* Seat Selection */}
                      <div className="flex items-start gap-2">
                        {amenityCategories.seat.length > 0 ? (
                          <>
                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">Seat selection</span>
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-500">No seat selection</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* All Amenities - Collapsible */}
                    {segment?.amenities && segment.amenities.length > 0 && (
                      <details className="mt-3 text-xs">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium">
                          View all {segment.amenities.length} amenities
                        </summary>
                        <div className="mt-2 space-y-2 pl-4">
                          {amenityCategories.comfort.length > 0 && (
                            <div>
                              <div className="font-semibold text-gray-700 mb-1">Comfort & Entertainment:</div>
                              <ul className="list-disc list-inside space-y-0.5 text-gray-600">
                                {amenityCategories.comfort.map((a, i) => (
                                  <li key={i}>{a}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {amenityCategories.other.length > 0 && (
                            <div>
                              <div className="font-semibold text-gray-700 mb-1">Additional:</div>
                              <ul className="list-disc list-inside space-y-0.5 text-gray-600">
                                {amenityCategories.other.map((a, i) => (
                                  <li key={i}>{a}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </details>
                    )}

                    {/* Select Button */}
                    {!isCurrentFare && (
                      <button
                        onClick={() => handleSelectFare(fare)}
                        className={`mt-3 w-full py-2 rounded-lg font-semibold transition-colors ${
                          selectedFareId === fare.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        {selectedFareId === fare.id ? 'Selected' : `Upgrade for +$${priceDiff.toFixed(2)}`}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!isLoading && !error && fareOptions.length === 0 && !isLoading && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 text-center">
              No additional fare options available for this flight
            </div>
          )}
        </div>
      )}
    </div>
  );
}
