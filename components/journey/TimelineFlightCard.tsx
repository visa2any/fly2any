'use client';

/**
 * Timeline Flight Card
 * Fly2Any Travel Operating System
 * Level 6 Ultra-Premium / Apple-Class
 */

import React from 'react';
import { Plane, Clock, CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { JourneyDaySegment, JourneyFlight } from '@/lib/journey/types';

interface TimelineFlightCardProps {
  segment: JourneyDaySegment;
  onClick?: () => void;
}

export function TimelineFlightCard({ segment, onClick }: TimelineFlightCardProps) {
  const flight = segment.flight;
  const isOutbound = segment.type === 'outbound-flight';

  // Format time
  const formatTime = (dateStr?: string): string => {
    if (!dateStr) return '--:--';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  // Format duration
  const formatDuration = (minutes?: number): string => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-xl border transition-all duration-200 cursor-pointer group ${
        flight?.status === 'booked'
          ? 'border-green-200/60 bg-green-50/50'
          : flight
          ? 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
          : 'border-dashed border-gray-200 bg-gray-50/50 hover:border-[#D63A35]/40 hover:bg-[#D63A35]/5'
      }`}
    >
      {/* Status Badge */}
      <div className="absolute top-3 right-3">
        {flight?.status === 'booked' ? (
          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Booked
          </span>
        ) : flight?.status === 'selected' ? (
          <span className="flex items-center gap-1 text-xs text-[#D63A35] font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Selected
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-gray-500 group-hover:text-[#D63A35]">
            <Circle className="w-3.5 h-3.5" />
            {flight ? 'Pending' : 'Select'}
          </span>
        )}
      </div>

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          isOutbound ? 'bg-[#D63A35]/10' : 'bg-blue-100'
        }`}>
          <Plane className={`w-5 h-5 ${
            isOutbound ? 'text-[#D63A35]' : 'text-blue-600'
          } ${!isOutbound ? 'rotate-180' : ''}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">
              {isOutbound ? 'Outbound' : 'Return'} Flight
            </span>
            {flight?.airline && (
              <span className="text-xs text-gray-500">• {flight.airline.name || flight.airline.code}</span>
            )}
          </div>

          {flight ? (
            <>
              {/* Route */}
              <div className="flex items-center gap-3 mt-2">
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900">
                    {formatTime(flight.departure.time)}
                  </p>
                  <p className="text-xs text-gray-500">{flight.departure.airport}</p>
                </div>

                <div className="flex-1 flex flex-col items-center">
                  <p className="text-xs text-gray-500 mb-1">{formatDuration(flight.duration)}</p>
                  <div className="w-full h-px bg-gray-300 relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gray-400" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gray-400" />
                    <ArrowRight className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900">
                    {formatTime(flight.arrival.time)}
                  </p>
                  <p className="text-xs text-gray-500">{flight.arrival.airport}</p>
                </div>
              </div>

              {/* Price */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {flight.flightNumber && <span>{flight.flightNumber}</span>}
                  {flight.cabinClass && <span>• {flight.cabinClass}</span>}
                </div>
                <span className="font-semibold text-gray-900">
                  {flight.price.currency} {flight.price.amount.toLocaleString()}
                </span>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="mt-2 text-center py-4">
              <p className="text-sm text-gray-500 group-hover:text-[#D63A35]">
                Click to select {isOutbound ? 'outbound' : 'return'} flight
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TimelineFlightCard;
