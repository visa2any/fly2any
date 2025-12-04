'use client';

import { useState, useEffect } from 'react';
import { Award, ChevronDown, Check, Loader2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FrequentFlyerInputProps {
  offerId?: string;
  passengerId?: string;
  passengerIndex?: number;
  airlineCode?: string; // Primary airline on the itinerary
  onLoyaltyUpdated?: (data: {
    passengerId: string;
    loyaltyAccounts: Array<{ airline_iata_code: string; account_number: string }>;
    priceChanged: boolean;
    discount?: number;
  }) => void;
  className?: string;
}

interface LoyaltyProgram {
  airlineCode: string;
  programmeName: string;
}

// Common loyalty programs with their names
const COMMON_PROGRAMS: Record<string, string> = {
  'AA': 'AAdvantage',
  'UA': 'MileagePlus',
  'DL': 'SkyMiles',
  'WN': 'Rapid Rewards',
  'B6': 'TrueBlue',
  'AS': 'Mileage Plan',
  'NK': 'Free Spirit',
  'F9': 'FRONTIER Miles',
  'BA': 'Executive Club',
  'LH': 'Miles & More',
  'AF': 'Flying Blue',
  'EK': 'Skywards',
  'QF': 'Frequent Flyer',
  'SQ': 'KrisFlyer',
  'NH': 'Mileage Club',
  'AC': 'Aeroplan',
  'VS': 'Flying Club',
};

/**
 * Frequent Flyer Input Component
 *
 * Allows passengers to link their airline loyalty accounts.
 * Benefits:
 * - Earn miles on the flight
 * - Potential discounts (10-20% on some airlines)
 * - Additional benefits (extra bags, priority boarding)
 */
export function FrequentFlyerInput({
  offerId,
  passengerId,
  passengerIndex = 0,
  airlineCode,
  onLoyaltyUpdated,
  className,
}: FrequentFlyerInputProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedAirline, setSelectedAirline] = useState(airlineCode || '');
  const [accountNumber, setAccountNumber] = useState('');
  const [supportedPrograms, setSupportedPrograms] = useState<LoyaltyProgram[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discount, setDiscount] = useState<number | null>(null);

  // Fetch supported loyalty programs if offerId is provided
  useEffect(() => {
    const fetchSupportedPrograms = async () => {
      if (!offerId) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/flights/loyalty?offerId=${offerId}`);
        const data = await response.json();

        if (data.success && data.data) {
          setSupportedPrograms(data.data);

          // Auto-select primary airline if supported
          if (airlineCode && data.data.some((p: LoyaltyProgram) => p.airlineCode === airlineCode)) {
            setSelectedAirline(airlineCode);
          }
        }
      } catch (err) {
        console.error('Failed to fetch loyalty programs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSupportedPrograms();
  }, [offerId, airlineCode]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAirline || !accountNumber.trim()) {
      setError('Please select an airline and enter your account number');
      return;
    }

    if (!offerId || !passengerId) {
      setError('Missing offer or passenger information');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch('/api/flights/loyalty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId,
          passengerId,
          loyaltyAccounts: [{
            airline_iata_code: selectedAirline,
            account_number: accountNumber.trim(),
          }],
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to add loyalty account');
        return;
      }

      setSuccess(true);

      if (data.data?.pricing?.discount > 0) {
        setDiscount(data.data.pricing.discount);
      }

      if (onLoyaltyUpdated) {
        onLoyaltyUpdated({
          passengerId,
          loyaltyAccounts: [{
            airline_iata_code: selectedAirline,
            account_number: accountNumber.trim(),
          }],
          priceChanged: data.data?.priceChanged || false,
          discount: data.data?.pricing?.discount,
        });
      }

    } catch (err: any) {
      setError(err.message || 'Failed to add loyalty account');
    } finally {
      setSubmitting(false);
    }
  };

  // All available airlines (use supported if available, otherwise common)
  const availableAirlines = supportedPrograms.length > 0
    ? supportedPrograms.map(p => ({ code: p.airlineCode, name: p.programmeName }))
    : Object.entries(COMMON_PROGRAMS).map(([code, name]) => ({ code, name }));

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      {/* Header - Click to expand */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'w-full flex items-center justify-between p-4 text-left transition-colors',
          expanded ? 'bg-primary-50 border-b' : 'bg-gray-50 hover:bg-gray-100'
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded-lg',
            success ? 'bg-green-500' : 'bg-primary-500'
          )}>
            {success ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <Award className="w-4 h-4 text-white" />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {success ? 'Frequent Flyer Linked' : 'Add Frequent Flyer Number'}
            </p>
            <p className="text-sm text-gray-500">
              {success
                ? `${COMMON_PROGRAMS[selectedAirline] || selectedAirline} • ${accountNumber}`
                : 'Earn miles and unlock potential discounts'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {discount && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
              -${discount.toFixed(2)} SAVED
            </span>
          )}
          <ChevronDown
            className={cn(
              'w-5 h-5 text-gray-400 transition-transform',
              expanded && 'rotate-180'
            )}
          />
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-4 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading loyalty programs...</span>
            </div>
          ) : success ? (
            <div className="text-center py-2">
              <p className="text-sm text-gray-600">
                Your frequent flyer account has been linked.
                {discount ? ` You saved $${discount.toFixed(2)}!` : ' Miles will be credited after travel.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSuccess(false);
                  setAccountNumber('');
                  setDiscount(null);
                }}
                className="mt-2 text-sm text-primary-600 hover:text-primary-700"
              >
                Add another program
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Info banner */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  Add your frequent flyer number to earn miles. Some airlines offer
                  discounts for loyalty members - you'll see any savings applied immediately.
                </p>
              </div>

              {/* Airline selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Airline Loyalty Program
                </label>
                <select
                  value={selectedAirline}
                  onChange={(e) => setSelectedAirline(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select airline...</option>
                  {availableAirlines.map(({ code, name }) => (
                    <option key={code} value={code}>
                      {name} ({code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Account number input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Membership Number
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g., 1234567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Error message */}
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={submitting || !selectedAirline || !accountNumber.trim()}
                className={cn(
                  'w-full py-2.5 px-4 rounded-lg font-medium transition-colors',
                  submitting || !selectedAirline || !accountNumber.trim()
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-primary-500 text-white hover:bg-primary-600'
                )}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </span>
                ) : (
                  'Add Frequent Flyer Number'
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default FrequentFlyerInput;
