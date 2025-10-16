'use client';

/**
 * Example Flight Card with Integrated Deal Score
 *
 * This component demonstrates best practices for integrating the Deal Score
 * algorithm into flight search results.
 *
 * @module components/flights/FlightCardWithDealScore
 */

import React, { useState } from 'react';
import { DealScoreBreakdown } from '@/lib/flights/dealScore';
import { DealScoreBadgeCompact } from './DealScoreBadge';
import { Plane, Clock, Calendar, Users, Info } from 'lucide-react';

interface Airport {
  code: string;
  city: string;
  name: string;
}

interface Flight {
  id: string;
  airline: string;
  airlineLogo?: string;
  flightNumber: string;
  price: number;
  currency: string;
  departure: {
    airport: Airport;
    time: string; // ISO 8601
    terminal?: string;
  };
  arrival: {
    airport: Airport;
    time: string; // ISO 8601
    terminal?: string;
  };
  duration: number; // minutes
  stops: number;
  layovers?: Array<{
    airport: Airport;
    duration: number; // minutes
  }>;
  seatsRemaining: number;
  aircraftType?: string;
  dealScore: DealScoreBreakdown;
}

interface FlightCardWithDealScoreProps {
  flight: Flight;
  onSelect?: (flight: Flight) => void;
  selected?: boolean;
}

/**
 * Format duration from minutes to readable string
 */
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

/**
 * Format time from ISO string
 */
function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format date from ISO string
 */
function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Calculate if arrival is next day
 */
function isNextDay(departure: string, arrival: string): boolean {
  const depDate = new Date(departure);
  const arrDate = new Date(arrival);
  return arrDate.getDate() !== depDate.getDate();
}

/**
 * Example Flight Card Component with Deal Score Integration
 */
export function FlightCardWithDealScore({
  flight,
  onSelect,
  selected = false,
}: FlightCardWithDealScoreProps) {
  const [showDetails, setShowDetails] = useState(false);
  const nextDay = isNextDay(flight.departure.time, flight.arrival.time);

  return (
    <div
      className={`
        bg-white rounded-xl border-2 transition-all duration-200 hover:shadow-lg
        ${selected ? 'border-blue-500 shadow-md' : 'border-gray-200'}
      `}
    >
      {/* Main Card Content */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Left Section: Flight Info */}
          <div className="flex-1 space-y-4">
            {/* Airline */}
            <div className="flex items-center gap-3">
              {flight.airlineLogo ? (
                <img
                  src={flight.airlineLogo}
                  alt={flight.airline}
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                  <Plane className="w-4 h-4 text-gray-600" />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">{flight.airline}</p>
                <p className="text-sm text-gray-600">{flight.flightNumber}</p>
              </div>
            </div>

            {/* Flight Timeline */}
            <div className="flex items-center gap-4">
              {/* Departure */}
              <div className="flex-1">
                <p className="text-2xl font-bold text-gray-900">
                  {formatTime(flight.departure.time)}
                </p>
                <p className="text-sm text-gray-600">{flight.departure.airport.code}</p>
                <p className="text-xs text-gray-500">{formatDate(flight.departure.time)}</p>
                {flight.departure.terminal && (
                  <p className="text-xs text-gray-500">Terminal {flight.departure.terminal}</p>
                )}
              </div>

              {/* Duration & Stops */}
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full relative">
                  <div className="h-0.5 bg-gray-300 w-full" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                    <Plane className="w-4 h-4 text-gray-600 transform rotate-90" />
                  </div>
                  {flight.stops > 0 && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(flight.duration)}
                </p>
                <p className="text-xs text-gray-600">
                  {flight.stops === 0
                    ? 'Non-stop'
                    : flight.stops === 1
                    ? '1 stop'
                    : `${flight.stops} stops`}
                </p>
              </div>

              {/* Arrival */}
              <div className="flex-1 text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {formatTime(flight.arrival.time)}
                  {nextDay && <span className="text-sm text-red-600 ml-1">+1</span>}
                </p>
                <p className="text-sm text-gray-600">{flight.arrival.airport.code}</p>
                <p className="text-xs text-gray-500">{formatDate(flight.arrival.time)}</p>
                {flight.arrival.terminal && (
                  <p className="text-xs text-gray-500">Terminal {flight.arrival.terminal}</p>
                )}
              </div>
            </div>

            {/* Additional Info */}
            {(flight.aircraftType || flight.seatsRemaining < 10) && (
              <div className="flex items-center gap-4 text-xs text-gray-600">
                {flight.aircraftType && (
                  <span className="flex items-center gap-1">
                    <Plane className="w-3 h-3" />
                    {flight.aircraftType}
                  </span>
                )}
                {flight.seatsRemaining < 10 && (
                  <span className="flex items-center gap-1 text-orange-600 font-medium">
                    <Users className="w-3 h-3" />
                    Only {flight.seatsRemaining} seat{flight.seatsRemaining !== 1 ? 's' : ''} left
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right Section: Price & Deal Score */}
          <div className="flex flex-col items-end gap-4 min-w-[180px]">
            {/* Deal Score Badge */}
            <DealScoreBadgeCompact score={flight.dealScore} />

            {/* Price */}
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">
                {flight.currency}
                {flight.price.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600">per person</p>
            </div>

            {/* Select Button */}
            <button
              onClick={() => onSelect?.(flight)}
              className={`
                w-full px-6 py-3 rounded-lg font-semibold transition-all duration-200
                ${
                  selected
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }
              `}
            >
              {selected ? 'Selected' : 'Select Flight'}
            </button>

            {/* Details Toggle */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1"
            >
              <Info className="w-4 h-4" />
              {showDetails ? 'Hide Details' : 'Flight Details'}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Details Section */}
      {showDetails && (
        <div className="border-t border-gray-200 bg-gray-50 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Deal Score Breakdown */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Deal Score Breakdown</h4>
              <div className="space-y-2">
                <ScoreComponent
                  label="Price"
                  score={flight.dealScore.components.price}
                  max={40}
                  explanation={flight.dealScore.explanations.price}
                />
                <ScoreComponent
                  label="Duration"
                  score={flight.dealScore.components.duration}
                  max={15}
                  explanation={flight.dealScore.explanations.duration}
                />
                <ScoreComponent
                  label="Stops"
                  score={flight.dealScore.components.stops}
                  max={15}
                  explanation={flight.dealScore.explanations.stops}
                />
                <ScoreComponent
                  label="Time of Day"
                  score={flight.dealScore.components.timeOfDay}
                  max={10}
                  explanation={flight.dealScore.explanations.timeOfDay}
                />
                <ScoreComponent
                  label="Reliability"
                  score={flight.dealScore.components.reliability}
                  max={10}
                  explanation={flight.dealScore.explanations.reliability}
                />
                <ScoreComponent
                  label="Comfort"
                  score={flight.dealScore.components.comfort}
                  max={5}
                  explanation={flight.dealScore.explanations.comfort}
                />
                <ScoreComponent
                  label="Availability"
                  score={flight.dealScore.components.availability}
                  max={5}
                  explanation={flight.dealScore.explanations.availability}
                />
              </div>
            </div>

            {/* Layover Details */}
            {flight.layovers && flight.layovers.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Layover Information</h4>
                <div className="space-y-3">
                  {flight.layovers.map((layover, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="font-medium text-gray-900">{layover.airport.name}</p>
                      <p className="text-sm text-gray-600">{layover.airport.code}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Layover: {formatDuration(layover.duration)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Score Component for Breakdown Display
 */
function ScoreComponent({
  label,
  score,
  max,
  explanation,
}: {
  label: string;
  score: number;
  max: number;
  explanation: string;
}) {
  const percentage = (score / max) * 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className="text-gray-900 font-semibold">
          {score}/{max}
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-600">{explanation}</p>
    </div>
  );
}

export default FlightCardWithDealScore;
