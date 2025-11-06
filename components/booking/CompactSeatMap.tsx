'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { SeatOption } from '@/types/booking-flow';

interface CompactSeatMapProps {
  seats: SeatOption[];
  onSelect: (seatNumber: string) => void;
  onSkip?: () => void;
  passengerName?: string;
}

/**
 * Compact Seat Map - Inline Chat Version
 *
 * Simplified seat selection optimized for chat interface
 * Shows key rows with clear visual indicators
 */
export function CompactSeatMap({
  seats,
  onSelect,
  onSkip,
  passengerName = 'Passenger',
}: CompactSeatMapProps) {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

  // Group seats by row
  const seatsByRow: Record<number, SeatOption[]> = {};
  seats.forEach(seat => {
    if (!seatsByRow[seat.row]) {
      seatsByRow[seat.row] = [];
    }
    seatsByRow[seat.row].push(seat);
  });

  // Get rows to display (show first 6-8 rows for compact view)
  const rowNumbers = Object.keys(seatsByRow).map(Number).sort((a, b) => a - b);
  const displayRows = rowNumbers.slice(0, 8);

  const handleSeatClick = (seat: SeatOption) => {
    if (!seat.available) return;
    setSelectedSeat(seat.number);
    onSelect(seat.number);
  };

  const getSeatButtonClass = (seat: SeatOption) => {
    const base = 'w-7 h-7 rounded text-[9px] font-bold flex items-center justify-center transition-all border';

    if (!seat.available) {
      return `${base} bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed`;
    }

    if (selectedSeat === seat.number) {
      return `${base} bg-primary-600 text-white border-primary-600 ring-2 ring-primary-300`;
    }

    // Color by type
    if (seat.type === 'window') {
      return `${base} bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100 cursor-pointer`;
    }

    if (seat.type === 'aisle') {
      return `${base} bg-green-50 text-green-700 border-green-300 hover:bg-green-100 cursor-pointer`;
    }

    return `${base} bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer`;
  };

  // Find recommended seat (window, available, good price)
  const recommendedSeat = seats.find(s =>
    s.available && s.type === 'window' && s.price <= 30
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-xs">
      {/* Header */}
      <div className="mb-2">
        <h4 className="text-xs font-bold text-gray-900">Select Seat for {passengerName}</h4>
        {recommendedSeat && (
          <p className="text-[10px] text-primary-600 mt-0.5">
            💡 We recommend {recommendedSeat.number} (Window, ${recommendedSeat.price})
          </p>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mb-2 text-[9px] text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-50 border border-blue-300" />
          <span>Window</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-50 border border-green-300" />
          <span>Aisle</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gray-200 border border-gray-300" />
          <span>Taken</span>
        </div>
      </div>

      {/* Seat Map */}
      <div className="bg-gray-50 rounded-lg p-2 mb-2">
        <div className="space-y-1.5">
          {displayRows.map(rowNum => {
            const rowSeats = seatsByRow[rowNum].sort((a, b) =>
              a.column.localeCompare(b.column)
            );

            return (
              <div key={rowNum} className="flex items-center gap-1">
                {/* Row Number */}
                <div className="w-5 text-[9px] font-bold text-gray-600 text-center">
                  {rowNum}
                </div>

                {/* Seats (ABC-DEF pattern with aisle) */}
                <div className="flex gap-1 flex-1 justify-center">
                  {rowSeats.slice(0, 3).map(seat => (
                    <button
                      key={seat.number}
                      onClick={() => handleSeatClick(seat)}
                      disabled={!seat.available}
                      className={getSeatButtonClass(seat)}
                      title={`Seat ${seat.number} - ${seat.type} - $${seat.price}`}
                    >
                      {selectedSeat === seat.number ? '✓' : seat.column}
                    </button>
                  ))}

                  {/* Aisle */}
                  <div className="w-2" />

                  {rowSeats.slice(3, 6).map(seat => (
                    <button
                      key={seat.number}
                      onClick={() => handleSeatClick(seat)}
                      disabled={!seat.available}
                      className={getSeatButtonClass(seat)}
                      title={`Seat ${seat.number} - ${seat.type} - $${seat.price}`}
                    >
                      {selectedSeat === seat.number ? '✓' : seat.column}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Show more indicator */}
        {rowNumbers.length > displayRows.length && (
          <div className="text-center mt-2">
            <p className="text-[9px] text-gray-500">
              + {rowNumbers.length - displayRows.length} more rows available
            </p>
          </div>
        )}
      </div>

      {/* Selected Seat Info */}
      {selectedSeat && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-2 mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-3 h-3 text-primary-600" />
              <div>
                <p className="text-[10px] font-bold text-gray-900">Seat {selectedSeat}</p>
                <p className="text-[9px] text-gray-600">
                  {seats.find(s => s.number === selectedSeat)?.type} seat
                </p>
              </div>
            </div>
            <div className="text-xs font-bold text-primary-600">
              +${seats.find(s => s.number === selectedSeat)?.price || 0}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {onSkip && (
          <button
            onClick={onSkip}
            className="flex-1 py-1.5 px-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Skip for now
          </button>
        )}
        <button
          onClick={() => selectedSeat && onSelect(selectedSeat)}
          disabled={!selectedSeat}
          className="flex-1 py-1.5 px-2 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirm Seat
        </button>
      </div>

      {/* Price Note */}
      <p className="text-[9px] text-gray-500 text-center mt-2">
        Seat prices include all fees. Free to change later.
      </p>
    </div>
  );
}

/**
 * Quick Seat Selector - Ultra compact, just window/middle/aisle choice
 */
export function QuickSeatSelector({
  onSelect,
  onSkip,
}: {
  onSelect: (type: 'window' | 'middle' | 'aisle') => void;
  onSkip?: () => void;
}) {
  const [selected, setSelected] = useState<'window' | 'middle' | 'aisle' | null>(null);

  const handleSelect = (type: 'window' | 'middle' | 'aisle') => {
    setSelected(type);
    onSelect(type);
  };

  return (
    <div className="space-y-2 max-w-xs">
      <p className="text-xs font-semibold text-gray-900">What's your seat preference?</p>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => handleSelect('window')}
          className={`p-2 rounded-lg border-2 text-center transition-all ${
            selected === 'window'
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 bg-white hover:border-primary-300'
          }`}
        >
          <div className="text-lg mb-1">🪟</div>
          <div className="text-[10px] font-semibold text-gray-900">Window</div>
          <div className="text-[9px] text-gray-600">+$20</div>
        </button>

        <button
          onClick={() => handleSelect('middle')}
          className={`p-2 rounded-lg border-2 text-center transition-all ${
            selected === 'middle'
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 bg-white hover:border-primary-300'
          }`}
        >
          <div className="text-lg mb-1">💺</div>
          <div className="text-[10px] font-semibold text-gray-900">Middle</div>
          <div className="text-[9px] text-gray-600">Free</div>
        </button>

        <button
          onClick={() => handleSelect('aisle')}
          className={`p-2 rounded-lg border-2 text-center transition-all ${
            selected === 'aisle'
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 bg-white hover:border-primary-300'
          }`}
        >
          <div className="text-lg mb-1">🚶</div>
          <div className="text-[10px] font-semibold text-gray-900">Aisle</div>
          <div className="text-[9px] text-gray-600">+$15</div>
        </button>
      </div>

      {onSkip && (
        <button
          onClick={onSkip}
          className="w-full py-1.5 text-xs text-gray-600 hover:text-gray-900 font-semibold transition-colors"
        >
          I'll choose at check-in
        </button>
      )}
    </div>
  );
}
