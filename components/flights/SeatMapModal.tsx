'use client';

import { useEffect, useRef, useState } from 'react';
import FocusTrap from 'focus-trap-react';
import { X, Plane, ArrowUp, Check, Sparkles, Crown, Eye, DoorOpen, Footprints, Zap, Baby, Volume2, Users } from 'lucide-react';
import type { ParsedSeatMap, Seat, SeatRow } from '@/lib/flights/seat-map-parser';

interface SeatMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  seatMap: ParsedSeatMap;
  onSelectSeat?: (seat: Seat | SeatPreference) => void;
  passengerCount?: number;
}

// For when we don't have real seat data, allow preference selection
export interface SeatPreference {
  type: 'preference';
  position: 'window' | 'aisle' | 'middle' | 'no_preference';
  location: 'front' | 'middle' | 'back' | 'no_preference';
  extraLegroom: boolean;
  quiet: boolean;
  price?: number;
}

// Quick seat preference cards for easy selection
const SEAT_PREFERENCES = [
  {
    id: 'window',
    icon: Eye,
    title: 'Window Seat',
    description: 'Enjoy the view & lean against the wall',
    position: 'window' as const,
    color: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400',
    iconColor: 'text-indigo-600',
    selectedColor: 'bg-indigo-100 border-indigo-500 ring-2 ring-indigo-200',
  },
  {
    id: 'aisle',
    icon: DoorOpen,
    title: 'Aisle Seat',
    description: 'Easy access & more legroom',
    position: 'aisle' as const,
    color: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400',
    iconColor: 'text-emerald-600',
    selectedColor: 'bg-emerald-100 border-emerald-500 ring-2 ring-emerald-200',
  },
  {
    id: 'extra_legroom',
    icon: Footprints,
    title: 'Extra Legroom',
    description: 'Exit row or premium economy',
    position: 'window' as const, // Default to window
    color: 'bg-amber-50 border-amber-200 hover:border-amber-400',
    iconColor: 'text-amber-600',
    selectedColor: 'bg-amber-100 border-amber-500 ring-2 ring-amber-200',
    extraLegroom: true,
  },
  {
    id: 'front',
    icon: ArrowUp,
    title: 'Front of Plane',
    description: 'First to deplane',
    location: 'front' as const,
    color: 'bg-purple-50 border-purple-200 hover:border-purple-400',
    iconColor: 'text-purple-600',
    selectedColor: 'bg-purple-100 border-purple-500 ring-2 ring-purple-200',
  },
];

export default function SeatMapModal({
  isOpen,
  onClose,
  seatMap,
  onSelectSeat,
  passengerCount = 1,
}: SeatMapModalProps) {
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(seatMap?.recommendedSeat || null);
  const [selectedPreference, setSelectedPreference] = useState<string | null>(null);
  const [preferenceDetails, setPreferenceDetails] = useState<SeatPreference>({
    type: 'preference',
    position: 'no_preference',
    location: 'no_preference',
    extraLegroom: false,
    quiet: false,
  });
  const modalRef = useRef<HTMLDivElement>(null);

  // Check if we have actual seat map data to display
  const hasDetailedSeatMap = seatMap?.decks?.[0]?.rows?.length > 0;
  const mainDeck = seatMap?.decks?.[0];

  // Get all rows, limiting to reasonable display count
  const allRows = hasDetailedSeatMap ? mainDeck.rows : [];
  const displayRows = allRows.length > 40
    ? allRows.slice(0, 35) // Show first 35 rows for very long aircraft
    : allRows;

  // Determine seat layout dynamically from actual data
  const sampleRow = displayRows[0];
  const seatsPerRow = sampleRow?.seats?.length || 6;

  // Calculate layout splits for aisle(s)
  // Common layouts: 3-3 (single aisle), 2-4-2 or 3-3-3 (dual aisle), 2-2 (regional)
  const getLayoutSections = (seats: Seat[]) => {
    const count = seats.length;
    if (count <= 4) {
      // 2-2 layout (regional jets)
      const mid = Math.ceil(count / 2);
      return [seats.slice(0, mid), seats.slice(mid)];
    } else if (count === 6) {
      // 3-3 layout (single aisle)
      return [seats.slice(0, 3), seats.slice(3)];
    } else if (count === 8) {
      // 2-4-2 layout (wide body)
      return [seats.slice(0, 2), seats.slice(2, 6), seats.slice(6)];
    } else if (count === 9) {
      // 3-3-3 layout (wide body)
      return [seats.slice(0, 3), seats.slice(3, 6), seats.slice(6)];
    } else if (count === 10) {
      // 3-4-3 layout (wide body)
      return [seats.slice(0, 3), seats.slice(3, 7), seats.slice(7)];
    } else {
      // Fallback: split in half
      const mid = Math.ceil(count / 2);
      return [seats.slice(0, mid), seats.slice(mid)];
    }
  };

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

  if (!isOpen) return null;

  const handleSeatClick = (seat: Seat) => {
    if (seat.available) {
      setSelectedSeat(seat);
      setSelectedPreference(null); // Clear preference when selecting actual seat
    }
  };

  const handlePreferenceSelect = (prefId: string) => {
    setSelectedPreference(prefId);
    setSelectedSeat(null); // Clear seat when selecting preference

    const pref = SEAT_PREFERENCES.find(p => p.id === prefId);
    if (pref) {
      setPreferenceDetails({
        type: 'preference',
        position: pref.position || 'no_preference',
        location: pref.location || 'no_preference',
        extraLegroom: pref.extraLegroom || false,
        quiet: false,
        price: pref.extraLegroom ? 25 : 0,
      });
    }
  };

  const getSeatClassName = (seat: Seat) => {
    const baseClasses = 'w-9 h-9 rounded-lg text-[10px] font-bold flex items-center justify-center transition-all border-2 shadow-sm';

    if (!seat.available) {
      return `${baseClasses} bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed`;
    }

    if (selectedSeat?.number === seat.number) {
      return `${baseClasses} bg-gradient-to-br from-primary-500 to-primary-600 text-white border-primary-400 ring-2 ring-primary-200 scale-110`;
    }

    if (seat.number === seatMap?.recommendedSeat?.number) {
      return `${baseClasses} bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-700 border-emerald-300 hover:border-emerald-400 cursor-pointer`;
    }

    if (seat.hasWindow) {
      return `${baseClasses} bg-gradient-to-br from-indigo-50 to-white text-indigo-600 border-indigo-200 hover:border-indigo-400 hover:shadow-md cursor-pointer`;
    }

    if (seat.hasAisle) {
      return `${baseClasses} bg-gradient-to-br from-blue-50 to-white text-blue-600 border-blue-200 hover:border-blue-400 hover:shadow-md cursor-pointer`;
    }

    return `${baseClasses} bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:shadow-md cursor-pointer`;
  };

  const handleConfirm = () => {
    if (onSelectSeat) {
      if (selectedSeat) {
        onSelectSeat(selectedSeat);
      } else if (selectedPreference) {
        onSelectSeat(preferenceDetails);
      }
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
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
        <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-slideUp">
          {/* Premium Header */}
          <div className="relative px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <Plane className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 id="seat-map-title" className="text-xl font-bold">Choose Your Perfect Seat</h2>
                  <p className="text-sm text-white/70 mt-1 flex items-center gap-2">
                    {seatMap?.aircraftCode && <span>{seatMap.aircraftCode}</span>}
                    {seatMap?.cabinClass && <span>• {seatMap.cabinClass}</span>}
                    {passengerCount > 1 && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {passengerCount} travelers
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-220px)]">

            {/* Quick Selection Cards - Always shown */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary-500" />
                Quick Select Your Preference
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {SEAT_PREFERENCES.map((pref) => {
                  const Icon = pref.icon;
                  const isSelected = selectedPreference === pref.id;

                  return (
                    <button
                      key={pref.id}
                      onClick={() => handlePreferenceSelect(pref.id)}
                      className={`
                        p-4 rounded-xl border-2 text-left transition-all
                        ${isSelected ? pref.selectedColor : pref.color}
                      `}
                    >
                      <Icon className={`w-6 h-6 mb-2 ${pref.iconColor}`} />
                      <p className="text-sm font-semibold text-gray-900">{pref.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{pref.description}</p>
                      {isSelected && (
                        <div className="mt-2 flex items-center gap-1 text-xs font-medium text-primary-600">
                          <Check className="w-3.5 h-3.5" />
                          Selected
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            {hasDetailedSeatMap && (
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-gray-500 font-medium">Or choose from the seat map</span>
                </div>
              </div>
            )}

            {/* Detailed Seat Map - Only if we have real data */}
            {hasDetailedSeatMap && (
              <>
                {/* Price & Recommendation Banner */}
                {seatMap?.recommendedSeat && (
                  <div className="mb-5 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <Crown className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-emerald-900">Recommended for You</p>
                          <p className="text-xs text-emerald-700 mt-0.5">
                            Seat {seatMap.recommendedSeat.number} • {seatMap.recommendedSeat.type} • Great value
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-900">
                          ${seatMap.recommendedSeat.price || 0}
                        </p>
                        {seatMap.priceRange && (
                          <p className="text-[10px] text-emerald-600">
                            Range: ${seatMap.priceRange.min}-${seatMap.priceRange.max}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Legend */}
                <div className="mb-5 flex flex-wrap items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-white border-2 border-gray-200 flex items-center justify-center text-gray-500">○</div>
                    <span className="text-gray-600">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-gray-300">×</div>
                    <span className="text-gray-600">Taken</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-50 border-2 border-emerald-300 flex items-center justify-center text-emerald-600">★</div>
                    <span className="text-gray-600">Best Value</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 border-2 border-primary-400 flex items-center justify-center text-white">✓</div>
                    <span className="text-gray-600">Your Selection</span>
                  </div>
                </div>

                {/* Aircraft Visualization */}
                <div className="relative bg-gradient-to-b from-gray-50 to-white rounded-xl p-4 border border-gray-100">
                  {/* Front indicator */}
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-800 text-white rounded-full text-xs font-medium">
                      <ArrowUp className="w-3.5 h-3.5" />
                      FRONT OF AIRCRAFT
                    </div>
                  </div>

                  {/* Seat Grid */}
                  <div className="space-y-1.5 overflow-x-auto">
                    {displayRows.map((row: SeatRow) => {
                      const sections = getLayoutSections(row.seats);
                      const isExitRow = row.hasExitRow;

                      return (
                        <div
                          key={row.rowNumber}
                          className={`flex items-center justify-center gap-2 ${isExitRow ? 'py-1 bg-amber-50/50 rounded' : ''}`}
                        >
                          {/* Row number */}
                          <div className="w-8 text-center text-xs font-bold text-gray-400 flex-shrink-0">
                            {row.rowNumber}
                            {isExitRow && <span className="text-amber-500 ml-0.5">*</span>}
                          </div>

                          {/* Dynamic seat sections with aisles */}
                          {sections.map((sectionSeats, sectionIndex) => (
                            <div key={sectionIndex} className="contents">
                              {/* Aisle before section (except first) */}
                              {sectionIndex > 0 && (
                                <div className="w-6 flex items-center justify-center flex-shrink-0">
                                  <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                                </div>
                              )}

                              {/* Seat section */}
                              <div className="flex gap-1">
                                {sectionSeats.map((seat) => (
                                  <button
                                    key={seat.number}
                                    onClick={() => handleSeatClick(seat)}
                                    className={getSeatClassName(seat)}
                                    disabled={!seat.available}
                                    title={`${seat.number} - ${seat.type}${seat.price ? ` - $${seat.price}` : ''}${isExitRow ? ' (Exit Row)' : ''}`}
                                  >
                                    {!seat.available ? '×' :
                                     selectedSeat?.number === seat.number ? '✓' :
                                     seat.number === seatMap?.recommendedSeat?.number ? '★' :
                                     seat.column}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}

                          {/* Price indicator */}
                          <div className="w-14 text-right flex-shrink-0">
                            {row.seats.some(s => s.available && s.price) && (
                              <span className="text-[10px] font-medium text-gray-400">
                                ${Math.round(row.seats.find(s => s.available && s.price)?.price || 0)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Exit row legend */}
                  {displayRows.some(r => r.hasExitRow) && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-amber-600">
                      <span className="font-bold">*</span>
                      <span>Exit row seats - extra legroom, restrictions may apply</span>
                    </div>
                  )}

                  {/* Back indicator */}
                  <div className="flex items-center justify-center mt-4">
                    <div className="px-4 py-1.5 bg-gray-200 rounded-full text-xs font-medium text-gray-600">
                      BACK OF AIRCRAFT
                    </div>
                  </div>
                </div>

                {/* Seat Features Grid */}
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg">
                    <Eye className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-medium text-indigo-900">Window View</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg">
                    <DoorOpen className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-900">Aisle Access</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-medium text-amber-900">Power Outlets</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                    <Footprints className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-medium text-purple-900">Extra Legroom</span>
                  </div>
                </div>
              </>
            )}

            {/* No Seat Map Message - Show preference selection prominently */}
            {!hasDetailedSeatMap && (
              <div className="text-center py-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Plane className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Detailed Seat Map Not Available
                </h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  Select your preference above and we'll assign the best available seat matching your choice at check-in.
                </p>
              </div>
            )}
          </div>

          {/* Premium Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                {selectedSeat ? (
                  <div>
                    <p className="text-xs text-gray-500">Your Selection</p>
                    <p className="text-base font-bold text-gray-900 flex items-center gap-2">
                      Seat {selectedSeat.number}
                      <span className="text-xs font-normal text-gray-500">({selectedSeat.type})</span>
                      {selectedSeat.price && (
                        <span className="text-primary-600">+${selectedSeat.price}</span>
                      )}
                    </p>
                  </div>
                ) : selectedPreference ? (
                  <div>
                    <p className="text-xs text-gray-500">Your Preference</p>
                    <p className="text-base font-bold text-gray-900">
                      {SEAT_PREFERENCES.find(p => p.id === selectedPreference)?.title}
                      {preferenceDetails.price ? (
                        <span className="ml-2 text-primary-600">+${preferenceDetails.price}</span>
                      ) : (
                        <span className="ml-2 text-emerald-600">Free</span>
                      )}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No seat selected</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Skip for now
                </button>
                {(selectedSeat || selectedPreference) && onSelectSeat && (
                  <button
                    onClick={handleConfirm}
                    className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-sm font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/20"
                  >
                    Confirm Selection
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </FocusTrap>
    </div>
  );
}
