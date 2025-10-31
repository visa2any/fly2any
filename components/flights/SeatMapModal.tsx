'use client';

import { useEffect, useRef, useState } from 'react';
import FocusTrap from 'focus-trap-react';
import { X, Plane, Wifi, Zap, ArrowUp } from 'lucide-react';
import type { ParsedSeatMap, Seat, SeatRow } from '@/lib/flights/seat-map-parser';

interface SeatMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  seatMap: ParsedSeatMap;
  onSelectSeat?: (seat: Seat) => void;
}

export default function SeatMapModal({
  isOpen,
  onClose,
  seatMap,
  onSelectSeat,
}: SeatMapModalProps) {
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(seatMap.recommendedSeat);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !seatMap.hasRealData) return null;

  const handleSeatClick = (seat: Seat) => {
    if (seat.available) {
      setSelectedSeat(seat);
    }
  };

  const getSeatClassName = (seat: Seat) => {
    const baseClasses = 'w-8 h-8 rounded text-[9px] font-bold flex items-center justify-center cursor-pointer transition-all border';

    if (!seat.available) {
      return `${baseClasses} bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed`;
    }

    if (selectedSeat?.number === seat.number) {
      return `${baseClasses} bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300`;
    }

    if (seat.number === seatMap.recommendedSeat?.number) {
      return `${baseClasses} bg-green-100 text-green-700 border-green-400 hover:bg-green-200`;
    }

    if (seat.hasWindow) {
      return `${baseClasses} bg-indigo-50 text-indigo-700 border-indigo-300 hover:bg-indigo-100`;
    }

    return `${baseClasses} bg-white text-gray-700 border-gray-300 hover:bg-gray-50`;
  };

  const getSeatSymbol = (seat: Seat) => {
    if (!seat.available) return '●';
    if (selectedSeat?.number === seat.number) return '✓';
    if (seat.hasWindow) return '○';
    if (seat.hasAisle) return '○';
    return '○';
  };

  // Get the main deck (usually the only deck for economy)
  const mainDeck = seatMap.decks[0];
  if (!mainDeck) return null;

  // Group rows (show every row for small aircraft, or sample for large)
  const displayRows = mainDeck.rows.length > 30
    ? mainDeck.rows.filter(row => row.rowNumber >= 10 && row.rowNumber <= 25)
    : mainDeck.rows;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="seat-map-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <FocusTrap
        focusTrapOptions={{
          initialFocus: false,
          allowOutsideClick: true,
          escapeDeactivates: false,
        }}
      >
        <div ref={modalRef} className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Plane className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 id="seat-map-title" className="text-xl font-bold text-gray-900">Select Your Seat</h2>
              <p className="text-sm text-gray-600 mt-0.5">
                {seatMap.aircraftCode} • {seatMap.cabinClass} Class
                {(seatMap as any).source && (
                  <span className="ml-2 px-2 py-0.5 bg-white/30 rounded text-xs">
                    {(seatMap as any).source === 'duffel' ? 'Duffel' : 'Amadeus'}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-3 hover:bg-white rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Price Info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">💡 Recommended Seat</p>
                <p className="text-xs text-blue-700 mt-1">
                  Seat {seatMap.recommendedSeat?.number} - Window, ${seatMap.recommendedSeat?.price}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-700">Average price</p>
                <p className="text-lg font-bold text-blue-900">
                  ${seatMap.priceRange?.min}-${seatMap.priceRange?.max}
                </p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mb-6 flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-white border-2 border-gray-300 flex items-center justify-center">
                <span className="text-gray-700">○</span>
              </div>
              <span className="text-gray-600">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gray-200 border-2 border-gray-300 flex items-center justify-center">
                <span className="text-gray-400">●</span>
              </div>
              <span className="text-gray-600">Taken</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-green-100 border-2 border-green-400 flex items-center justify-center">
                <span className="text-green-700">○</span>
              </div>
              <span className="text-gray-600">Best Value</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-600 border-2 border-blue-600 flex items-center justify-center">
                <span className="text-white">✓</span>
              </div>
              <span className="text-gray-600">Selected</span>
            </div>
          </div>

          {/* Front of plane indicator */}
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
              <ArrowUp className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-semibold text-gray-700">FRONT</span>
            </div>
          </div>

          {/* Seat Map */}
          <div className="space-y-2">
            {displayRows.map((row: SeatRow) => (
              <div key={row.rowNumber} className="flex items-center gap-1">
                {/* Row number */}
                <div className="w-8 text-center text-xs font-semibold text-gray-600">
                  {row.rowNumber}
                </div>

                {/* Left side seats */}
                <div className="flex gap-1">
                  {row.seats.slice(0, 3).map((seat) => (
                    <button
                      key={seat.number}
                      onClick={() => handleSeatClick(seat)}
                      className={getSeatClassName(seat)}
                      disabled={!seat.available}
                      title={`${seat.number} - ${seat.type} - $${seat.price || 'N/A'}`}
                    >
                      {getSeatSymbol(seat)}
                    </button>
                  ))}
                </div>

                {/* Aisle */}
                <div className="w-8 flex items-center justify-center text-gray-300">
                  |
                </div>

                {/* Right side seats */}
                <div className="flex gap-1">
                  {row.seats.slice(3).map((seat) => (
                    <button
                      key={seat.number}
                      onClick={() => handleSeatClick(seat)}
                      className={getSeatClassName(seat)}
                      disabled={!seat.available}
                      title={`${seat.number} - ${seat.type} - $${seat.price || 'N/A'}`}
                    >
                      {getSeatSymbol(seat)}
                    </button>
                  ))}
                </div>

                {/* Price */}
                {row.seats.some(s => s.available && s.price) && (
                  <div className="ml-2 text-[10px] text-gray-500 min-w-[40px]">
                    ${row.seats.find(s => s.available && s.price)?.price}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">🪟</span>
              <div>
                <p className="text-xs font-semibold text-gray-700">Window View</p>
                <p className="text-[10px] text-gray-500">Best for sleeping</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">🚪</span>
              <div>
                <p className="text-xs font-semibold text-gray-700">Aisle Access</p>
                <p className="text-[10px] text-gray-500">Easy to move</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Zap className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-xs font-semibold text-gray-700">Power Outlet</p>
                <p className="text-[10px] text-gray-500">Most seats</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">🦵</span>
              <div>
                <p className="text-xs font-semibold text-gray-700">Extra Legroom</p>
                <p className="text-[10px] text-gray-500">Exit rows</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div>
            {selectedSeat ? (
              <div>
                <p className="text-xs text-gray-600">Selected:</p>
                <p className="text-sm font-bold text-gray-900">
                  Seat {selectedSeat.number} ({selectedSeat.type}) - ${selectedSeat.price}
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-600">No seat selected</p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Skip for now
            </button>
            {selectedSeat && onSelectSeat && (
              <button
                onClick={() => {
                  onSelectSeat(selectedSeat);
                  onClose();
                }}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Confirm Seat
              </button>
            )}
          </div>
        </div>
      </div>
      </FocusTrap>
    </div>
  );
}
