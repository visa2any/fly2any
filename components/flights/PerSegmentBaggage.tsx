'use client';

import { Plane, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

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

interface PerSegmentBaggageProps {
  segments: BaggageSegment[];
  itineraries: any[];
  className?: string;
}

export default function PerSegmentBaggage({
  segments,
  itineraries,
  className = ''
}: PerSegmentBaggageProps) {

  if (segments.length === 0) return null;

  // Group segments by itinerary (outbound vs return)
  const groupedSegments = segments.reduce((acc, segment) => {
    const key = segment.itineraryIndex;
    if (!acc[key]) acc[key] = [];
    acc[key].push(segment);
    return acc;
  }, {} as Record<number, BaggageSegment[]>);

  // Helper functions
  const formatWeight = (weight: number, unit: string) => {
    if (unit === 'KG') {
      const lbs = Math.round(weight * 2.20462);
      return `${weight} kg / ${lbs} lbs`;
    }
    const kg = Math.round(weight * 0.453592);
    return `${weight} lbs / ${kg} kg`;
  };

  const getItineraryLabel = (index: number) => {
    return index === 0 ? 'Outbound' : index === 1 ? 'Return' : `Leg ${index + 1}`;
  };

  const formatFareType = (brandedFare: string) => {
    if (brandedFare.includes('BASIC')) return 'Basic';
    if (brandedFare.includes('FLEX') || brandedFare.includes('PLUS')) return 'Flex';
    return 'Standard';
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🧳</span>
        <h3 className="text-base font-semibold text-gray-900">
          Baggage Allowance by Flight Leg
        </h3>
      </div>

      {/* Segments */}
      <div className="space-y-4">
        {Object.entries(groupedSegments).map(([itinIdx, itinSegments], groupIndex) => (
          <div key={itinIdx}>
            {itinSegments.map((segment, segIdx) => {
              const dt = formatDateTime(segment.departureTime);

              return (
                <div key={`${itinIdx}-${segIdx}`} className="bg-white rounded-lg p-4 shadow-sm">
                  {/* Segment Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <Plane size={18} className="text-blue-600" />
                    <span className="font-semibold text-gray-900">
                      {getItineraryLabel(parseInt(itinIdx))}: {segment.route}
                    </span>
                  </div>

                  {/* Date/Time */}
                  <div className="text-xs text-gray-600 mb-3">
                    {dt.date} • {dt.time}
                  </div>

                  <div className="h-px bg-gray-200 mb-3"></div>

                  {/* Baggage Details */}
                  <div className="space-y-2.5">
                    {/* Checked Bags */}
                    <div className="flex items-start gap-2">
                      {segment.includedCheckedBags > 0 ? (
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="text-sm">
                        {segment.includedCheckedBags > 0 ? (
                          <span className="text-gray-900">
                            <strong>{segment.includedCheckedBags}</strong> checked bag{segment.includedCheckedBags > 1 ? 's' : ''} included{' '}
                            <span className="text-gray-600">
                              ({formatWeight(segment.baggageWeight, segment.baggageWeightUnit)})
                            </span>
                          </span>
                        ) : (
                          <>
                            <span className="text-gray-900 font-medium">0 checked bags</span>
                            <span className="text-gray-600"> (Basic Economy)</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Carry-On */}
                    <div className="flex items-start gap-2">
                      {segment.carryOnAllowed ? (
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="text-sm text-gray-900">
                        {segment.carryOnAllowed ? (
                          '1 carry-on + 1 personal item'
                        ) : (
                          <>
                            <span className="font-medium">Carry-on not included</span>
                            <span className="text-gray-600"> (personal item only)</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Fare Type */}
                    <div className="flex items-start gap-2">
                      <span className="text-sm">💼</span>
                      <div className="text-sm text-gray-900">
                        Fare: <strong>{segment.cabin.replace(/_/g, ' ')}</strong>
                        <span className="text-gray-600"> ({formatFareType(segment.brandedFare)})</span>
                      </div>
                    </div>

                    {/* Add Bag Option (if no bags included) */}
                    {segment.includedCheckedBags === 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm">
                          <span>💵</span>
                          <span className="text-gray-900">
                            Add checked bag: <strong className="text-blue-600">+$35</strong>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Connector line between outbound and return */}
            {groupIndex < Object.keys(groupedSegments).length - 1 && (
              <div className="flex items-center justify-center my-3">
                <div className="h-px w-full bg-gray-300"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="mt-4 flex items-start gap-2 text-xs text-gray-600">
        <Info size={14} className="mt-0.5 flex-shrink-0" />
        <p>
          Baggage rules determined by operating carrier. Policies shown are based on fare class.
          Always confirm with airline before travel.
        </p>
      </div>
    </div>
  );
}
