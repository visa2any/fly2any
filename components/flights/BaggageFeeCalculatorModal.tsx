'use client';

import { X, Plus, Minus, Info, Calculator, Luggage } from 'lucide-react';
import { useState } from 'react';
import { getBaggageFees, getAirlinePolicy, type CabinClass, type RouteType } from '@/lib/airlines/baggageFees';

interface BaggageSegment {
  itineraryIndex: number;
  segmentIndex: number;
  route: string;
  departureTime: string;
  cabin: string;
  brandedFare: string;
  includedCheckedBags: number;
  baggageWeight: number;
  baggageWeightUnit: string;
  carryOnAllowed: boolean;
}

interface BaggageFeeCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  segments: BaggageSegment[];
  airlineCode: string;
  currency: string;
}

interface BagSelection {
  carryOn: number;
  checked1: number;
  checked2: number;
  checked3: number;
  oversized: number;
  overweight: number;
  sportEquipment: number;
}

export default function BaggageFeeCalculatorModal({
  isOpen,
  onClose,
  segments,
  airlineCode,
  currency,
}: BaggageFeeCalculatorModalProps) {
  const [passengers, setPassengers] = useState({ adults: 1, children: 0, infants: 0 });
  const [bagSelection, setBagSelection] = useState<BagSelection>({
    carryOn: 0,
    checked1: 0,
    checked2: 0,
    checked3: 0,
    oversized: 0,
    overweight: 0,
    sportEquipment: 0,
  });

  if (!isOpen || segments.length === 0) return null;

  // Get airline policy
  const airlinePolicy = getAirlinePolicy(airlineCode);

  // Determine route type (domestic vs international)
  const isInternational = segments.some((seg) => {
    const [origin, destination] = seg.route.split(' → ');
    return origin.substring(0, 2) !== destination.substring(0, 2);
  });
  const routeType: RouteType = isInternational ? 'INTERNATIONAL' : 'DOMESTIC';

  // Calculate fees per segment
  const segmentFees = segments.map((segment) => {
    const cabin = segment.cabin as CabinClass;
    const fees = getBaggageFees(airlineCode, cabin, routeType);

    if (!fees) return null;

    const totalPassengers = passengers.adults + passengers.children;

    let total = 0;
    total += bagSelection.carryOn * fees.carryOn * totalPassengers;
    total += bagSelection.checked1 * fees.checked1 * totalPassengers;
    total += bagSelection.checked2 * fees.checked2 * totalPassengers;
    total += bagSelection.checked3 * fees.checked3 * totalPassengers;
    total += bagSelection.oversized * fees.oversized;
    total += bagSelection.overweight * fees.overweight;
    total += bagSelection.sportEquipment * fees.sportEquipment;

    return {
      segment,
      fees,
      total,
    };
  });

  // Total across all segments
  const grandTotal = segmentFees.reduce((sum, sf) => sum + (sf?.total || 0), 0);

  // Helper to increment/decrement bag count
  const updateBags = (type: keyof BagSelection, delta: number) => {
    setBagSelection((prev) => ({
      ...prev,
      [type]: Math.max(0, prev[type] + delta),
    }));
  };

  // Helper to format route label
  const formatRouteLabel = (index: number) => {
    return index === 0 ? 'Outbound' : index === 1 ? 'Return' : `Leg ${index + 1}`;
  };

  // Helper to format date/time
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Calculator className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Baggage Fee Calculator</h2>
              <p className="text-sm text-gray-600 mt-0.5">
                {airlinePolicy?.name || 'Airline'} • {routeType}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Passenger Selection */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">Number of Passengers</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-600 block mb-1">Adults</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPassengers((p) => ({ ...p, adults: Math.max(1, p.adults - 1) }))}
                    className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-semibold">{passengers.adults}</span>
                  <button
                    onClick={() => setPassengers((p) => ({ ...p, adults: Math.min(9, p.adults + 1) }))}
                    className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Children (2-11)</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPassengers((p) => ({ ...p, children: Math.max(0, p.children - 1) }))}
                    className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-semibold">{passengers.children}</span>
                  <button
                    onClick={() => setPassengers((p) => ({ ...p, children: Math.min(9, p.children + 1) }))}
                    className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Infants (0-2)</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPassengers((p) => ({ ...p, infants: Math.max(0, p.infants - 1) }))}
                    className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-semibold">{passengers.infants}</span>
                  <button
                    onClick={() => setPassengers((p) => ({ ...p, infants: Math.min(9, p.infants + 1) }))}
                    className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Baggage Selection */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Additional Bags</h3>
            <div className="space-y-3">
              {/* Carry-on */}
              {!airlinePolicy?.carryOnIncluded && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Luggage className="w-4 h-4 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Carry-on Bag</p>
                      <p className="text-xs text-gray-600">
                        {airlinePolicy?.sizeLimit.carryOn} • {airlinePolicy?.weightLimit.carryOn}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900">
                      ${segmentFees[0]?.fees?.carryOn || 0}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateBags('carryOn', -1)}
                        className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-semibold">{bagSelection.carryOn}</span>
                      <button
                        onClick={() => updateBags('carryOn', 1)}
                        className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 1st Checked Bag */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🧳</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">1st Checked Bag</p>
                    <p className="text-xs text-gray-600">
                      {airlinePolicy?.sizeLimit.checked} • {airlinePolicy?.weightLimit.checked}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">
                    ${segmentFees[0]?.fees?.checked1 || 0}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateBags('checked1', -1)}
                      className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-semibold">{bagSelection.checked1}</span>
                    <button
                      onClick={() => updateBags('checked1', 1)}
                      className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 2nd Checked Bag */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🧳</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">2nd Checked Bag</p>
                    <p className="text-xs text-gray-600">Additional fee applies</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">
                    ${segmentFees[0]?.fees?.checked2 || 0}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateBags('checked2', -1)}
                      className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-semibold">{bagSelection.checked2}</span>
                    <button
                      onClick={() => updateBags('checked2', 1)}
                      className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 3rd+ Checked Bag */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🧳</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">3rd+ Checked Bag</p>
                    <p className="text-xs text-gray-600">Higher fees apply</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">
                    ${segmentFees[0]?.fees?.checked3 || 0}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateBags('checked3', -1)}
                      className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-semibold">{bagSelection.checked3}</span>
                    <button
                      onClick={() => updateBags('checked3', 1)}
                      className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Special Items */}
              <div className="pt-3 border-t border-gray-200">
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Special Items</h4>
                <div className="space-y-2">
                  {/* Oversized */}
                  <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-base">📦</span>
                      <p className="text-xs font-medium text-gray-900">Oversized Bag</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-900">
                        ${segmentFees[0]?.fees?.oversized || 0}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateBags('oversized', -1)}
                          className="p-0.5 bg-white border border-gray-300 rounded hover:bg-gray-50"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-semibold">{bagSelection.oversized}</span>
                        <button
                          onClick={() => updateBags('oversized', 1)}
                          className="p-0.5 bg-white border border-gray-300 rounded hover:bg-gray-50"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Overweight */}
                  <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-base">⚖️</span>
                      <p className="text-xs font-medium text-gray-900">Overweight Bag</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-900">
                        ${segmentFees[0]?.fees?.overweight || 0}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateBags('overweight', -1)}
                          className="p-0.5 bg-white border border-gray-300 rounded hover:bg-gray-50"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-semibold">{bagSelection.overweight}</span>
                        <button
                          onClick={() => updateBags('overweight', 1)}
                          className="p-0.5 bg-white border border-gray-300 rounded hover:bg-gray-50"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sport Equipment */}
                  <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🎿</span>
                      <p className="text-xs font-medium text-gray-900">Sport Equipment</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-900">
                        ${segmentFees[0]?.fees?.sportEquipment || 0}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateBags('sportEquipment', -1)}
                          className="p-0.5 bg-white border border-gray-300 rounded hover:bg-gray-50"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-semibold">{bagSelection.sportEquipment}</span>
                        <button
                          onClick={() => updateBags('sportEquipment', 1)}
                          className="p-0.5 bg-white border border-gray-300 rounded hover:bg-gray-50"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Per-Segment Breakdown */}
          {segmentFees.length > 1 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Fee Breakdown by Segment</h3>
              <div className="space-y-2">
                {segmentFees.map((sf, idx) => {
                  if (!sf) return null;
                  const dt = formatDateTime(sf.segment.departureTime);
                  return (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatRouteLabel(sf.segment.itineraryIndex)}: {sf.segment.route}
                          </p>
                          <p className="text-xs text-gray-600">
                            {dt.date} • {sf.segment.cabin.replace(/_/g, ' ')}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-amber-600">
                          ${sf.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* What's Included Note */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-green-900">
                <p className="font-semibold mb-1">Already Included:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {airlinePolicy?.personalItemIncluded && (
                    <li>Personal item ({airlinePolicy.sizeLimit.personalItem})</li>
                  )}
                  {airlinePolicy?.carryOnIncluded && (
                    <li>Carry-on bag ({airlinePolicy.sizeLimit.carryOn})</li>
                  )}
                  {segments[0] && segments[0].includedCheckedBags > 0 && (
                    <li>{segments[0].includedCheckedBags} checked bag(s) ({airlinePolicy?.weightLimit.checked})</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Total */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <div>
            <p className="text-xs text-gray-600">Estimated Total Baggage Fees</p>
            <p className="text-sm text-gray-700">
              {passengers.adults + passengers.children} passenger{passengers.adults + passengers.children > 1 ? 's' : ''} • {segmentFees.length} segment{segmentFees.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-amber-600">
              {currency} {grandTotal.toFixed(2)}
            </p>
            {grandTotal > 0 && (
              <p className="text-xs text-gray-600 mt-0.5">
                ${(grandTotal / (passengers.adults + passengers.children)).toFixed(2)} per person
              </p>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-[10px] text-gray-600 flex items-start gap-1">
            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>
              Fees are estimates based on {airlinePolicy?.name || 'airline'} published rates for {routeType.toLowerCase()} flights.
              Actual fees may vary. Always verify with the airline before travel.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
