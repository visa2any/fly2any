'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Plane, User, Briefcase, CreditCard, Edit2, Check } from 'lucide-react';
import { BookingState } from '@/types/booking-flow';

interface BookingSummaryCardProps {
  booking: BookingState;
  onEdit?: (section: 'flight' | 'fare' | 'seats' | 'baggage') => void;
  onConfirm?: () => void;
  expanded?: boolean;
}

/**
 * Booking Summary Card - Review Before Payment
 *
 * Collapsible, comprehensive summary of entire booking
 * Shows all selections with ability to edit
 */
export function BookingSummaryCard({
  booking,
  onEdit,
  onConfirm,
  expanded = true,
}: BookingSummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);

  const {
    selectedFlight,
    selectedFare,
    selectedSeats,
    selectedBaggage,
    searchParams,
    pricing,
  } = booking;

  return (
    <div className="bg-white border-2 border-primary-200 rounded-lg shadow-md overflow-hidden max-w-md">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-primary-50 to-primary-100 hover:from-primary-100 hover:to-primary-150 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-gray-900">Booking Summary</h3>
            <p className="text-[10px] text-gray-600">Review your trip details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary-600">
            ${pricing.total}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          )}
        </div>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="p-3 space-y-3">
          {/* Flight Details */}
          {selectedFlight && (
            <div className="bg-gray-50 rounded-lg p-2.5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Plane className="w-3.5 h-3.5 text-primary-600" />
                  <span className="text-xs font-bold text-gray-900">Flight</span>
                </div>
                {onEdit && (
                  <button
                    onClick={() => onEdit('flight')}
                    className="text-[10px] text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-0.5"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-gray-900">
                  {searchParams?.origin} → {searchParams?.destination}
                </div>
                <div className="text-[10px] text-gray-600">
                  {selectedFlight.airline} {selectedFlight.flightNumber}
                </div>
                <div className="text-[10px] text-gray-600">
                  {searchParams?.departureDate}
                </div>
              </div>
            </div>
          )}

          {/* Fare Class */}
          {selectedFare && (
            <div className="bg-gray-50 rounded-lg p-2.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-900">Fare Class</span>
                {onEdit && (
                  <button
                    onClick={() => onEdit('fare')}
                    className="text-[10px] text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-0.5"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-700">{selectedFare.name}</span>
                <span className="text-xs font-semibold text-gray-900">${selectedFare.price}</span>
              </div>
              <div className="mt-1 space-y-0.5">
                {selectedFare.features.slice(0, 3).map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <Check className="w-2 h-2 text-green-600 flex-shrink-0" />
                    <span className="text-[9px] text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Passengers & Seats */}
          {selectedSeats && selectedSeats.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-2.5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary-600" />
                  <span className="text-xs font-bold text-gray-900">Seats</span>
                </div>
                {onEdit && (
                  <button
                    onClick={() => onEdit('seats')}
                    className="text-[10px] text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-0.5"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {selectedSeats.map((seat, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-700">Seat {seat.seatNumber}</span>
                    <span className="text-gray-900 font-semibold">
                      {seat.price > 0 ? `+$${seat.price}` : 'Included'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Baggage */}
          {selectedBaggage && selectedBaggage.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-2.5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-primary-600" />
                  <span className="text-xs font-bold text-gray-900">Baggage</span>
                </div>
                {onEdit && (
                  <button
                    onClick={() => onEdit('baggage')}
                    className="text-[10px] text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-0.5"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {selectedBaggage.map((bag, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-700">{bag.quantity} checked bag(s)</span>
                    <span className="text-gray-900 font-semibold">+${bag.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="border-t border-gray-200 pt-3">
            <div className="space-y-1.5 mb-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-600">Base Fare</span>
                <span className="text-gray-900">${pricing.baseFare}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-600">Taxes & Fees</span>
                <span className="text-gray-900">${pricing.taxes}</span>
              </div>
              {pricing.seatFees > 0 && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-600">Seat Selection</span>
                  <span className="text-gray-900">${pricing.seatFees}</span>
                </div>
              )}
              {pricing.baggageFees > 0 && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-600">Baggage</span>
                  <span className="text-gray-900">${pricing.baggageFees}</span>
                </div>
              )}
              {pricing.extrasFees > 0 && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-600">Extras</span>
                  <span className="text-gray-900">${pricing.extrasFees}</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between pt-2 border-t-2 border-gray-300">
              <span className="text-sm font-bold text-gray-900">Total</span>
              <span className="text-xl font-bold text-primary-600">${pricing.total}</span>
            </div>
            <p className="text-[9px] text-gray-500 text-center mt-1">
              {pricing.currency} • Final price in {pricing.currency}
            </p>
          </div>

          {/* Action Button */}
          {onConfirm && (
            <button
              onClick={onConfirm}
              className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <CreditCard className="w-4 h-4" />
              <span>Continue to Payment</span>
            </button>
          )}

          {/* Trust Signals */}
          <div className="flex items-center justify-center gap-3 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3 text-green-600" />
              <span className="text-[9px] text-gray-600">Secure payment</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3 text-green-600" />
              <span className="text-[9px] text-gray-600">Free cancellation</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact Summary - Minimal version for quick review
 */
export function CompactBookingSummary({
  booking,
  onClick,
}: {
  booking: BookingState;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-primary-50 border border-primary-200 rounded-lg p-2.5 hover:bg-primary-100 transition-colors text-left"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-gray-900">
            {booking.searchParams?.origin} → {booking.searchParams?.destination}
          </div>
          <div className="text-[10px] text-gray-600 mt-0.5">
            {booking.selectedFare?.name} • {booking.searchParams?.passengers} passenger(s)
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-primary-600">${booking.pricing.total}</div>
          <div className="text-[9px] text-gray-600">Tap to review</div>
        </div>
      </div>
    </button>
  );
}
