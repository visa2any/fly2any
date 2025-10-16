'use client';

import { useState } from 'react';
import { Check, X, Loader2, ChevronRight, Leaf, AlertCircle } from 'lucide-react';

interface BrandedFare {
  segmentId: string;
  brandedFare: string;
  price: {
    total: string;
    base: string;
  };
  amenities: Array<{
    description: string;
    isChargeable: boolean;
  }>;
  co2Emissions?: {
    weight: number;
    weightUnit: string;
    cabin: string;
  };
}

interface BrandedFaresProps {
  flightOfferId: string;
  currentPrice: number;
  onSelectFare?: (fare: BrandedFare) => void;
}

export default function BrandedFares({ flightOfferId, currentPrice, onSelectFare }: BrandedFaresProps) {
  const [fares, setFares] = useState<BrandedFare[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showError, setShowError] = useState(false);

  const loadBrandedFares = async () => {
    if (fares.length > 0) {
      setIsExpanded(!isExpanded);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setShowError(false);

      const response = await fetch(`/api/branded-fares?flightOfferId=${flightOfferId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch branded fares');
      }

      const data = await response.json();
      const brandedFares = data.data || [];

      // Optionally fetch CO2 emissions for each fare class
      // Note: This would require multiple API calls, so we skip for now
      // In production, consider batching or getting emissions from flight offers

      setFares(brandedFares);
      setIsExpanded(true);
    } catch (err: any) {
      setError(err.message);
      setShowError(true);
      console.error('Error fetching branded fares:', err);

      // Auto-hide error after 5 seconds
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      {showError && error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>Unable to load branded fares. Please try again.</span>
        </div>
      )}

      <button
        onClick={loadBrandedFares}
        disabled={loading}
        className="w-full flex items-center justify-between p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-blue-700">Upgrade Your Fare</span>
          <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
            Save up to $50
          </span>
        </div>
        <div className="flex items-center gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          ) : (
            <ChevronRight className={`h-5 w-5 text-blue-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          )}
        </div>
      </button>

      {isExpanded && fares.length > 0 && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {fares.map((fare, index) => {
            const price = parseFloat(fare.price.total);
            const savings = currentPrice - price;
            const isRecommended = index === 1; // Middle option usually best value

            return (
              <div
                key={index}
                className={`relative border-2 rounded-lg p-4 hover:shadow-lg transition-all ${
                  isRecommended ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                }`}
              >
                {isRecommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    BEST VALUE
                  </div>
                )}

                <div className="text-center mb-4">
                  <h4 className="font-bold text-lg mb-1">{fare.brandedFare}</h4>
                  <div className="text-2xl font-bold text-blue-600">${price.toFixed(0)}</div>
                  {savings > 0 && (
                    <div className="text-xs text-green-600 font-semibold">
                      Save ${savings.toFixed(0)}
                    </div>
                  )}
                </div>

                <ul className="space-y-2 mb-4">
                  {fare.amenities?.slice(0, 5).map((amenity, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      {amenity.isChargeable ? (
                        <X className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={amenity.isChargeable ? 'text-gray-500' : 'text-gray-700'}>
                        {amenity.description}
                      </span>
                    </li>
                  ))}
                </ul>

                {fare.co2Emissions && (
                  <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm">
                    <Leaf className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-green-700">
                      {fare.co2Emissions.weight} {fare.co2Emissions.weightUnit} CO2
                    </span>
                  </div>
                )}

                <button
                  onClick={() => onSelectFare?.(fare)}
                  className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                    isRecommended
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Select
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
