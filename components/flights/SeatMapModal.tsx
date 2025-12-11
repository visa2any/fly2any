'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plane, Check, Eye, DoorOpen, Footprints, ChevronDown } from 'lucide-react';
import type { ParsedSeatMap, Seat, SeatRow } from '@/lib/flights/seat-map-parser';

// ============================================
// TYPES
// ============================================

interface SeatMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  seatMap: ParsedSeatMap;
  onSelectSeat?: (seat: Seat | SeatPreference) => void;
  passengerCount?: number;
  currentPassengerIndex?: number;
  passengerNames?: string[];
  isLastFlight?: boolean;
}

export interface SeatPreference {
  type: 'preference';
  position: 'window' | 'aisle' | 'middle' | 'no_preference';
  location: 'front' | 'middle' | 'back' | 'no_preference';
  extraLegroom: boolean;
  quiet: boolean;
  price?: number;
}

// ============================================
// QUICK PREFERENCES
// ============================================

const QUICK_PREFS = [
  { id: 'window', icon: Eye, label: 'Window', desc: 'Great views', position: 'window' as const },
  { id: 'aisle', icon: DoorOpen, label: 'Aisle', desc: 'Easy access', position: 'aisle' as const },
  { id: 'legroom', icon: Footprints, label: 'Extra Legroom', desc: '+$25', extraLegroom: true, price: 25 },
];

// ============================================
// COMPONENT
// ============================================

export default function SeatMapModal({
  isOpen,
  onClose,
  seatMap,
  onSelectSeat,
  currentPassengerIndex = 0,
  passengerNames = [],
  isLastFlight = true,
}: SeatMapModalProps) {
  const [selectedPref, setSelectedPref] = useState<string | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [showSeatGrid, setShowSeatGrid] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const passengerName = passengerNames[currentPassengerIndex] || `Passenger ${currentPassengerIndex + 1}`;

  // Get first 8 rows for compact view
  const displayRows = useMemo(() => {
    const rows = seatMap?.decks?.[0]?.rows || [];
    return rows.slice(0, 8);
  }, [seatMap]);

  const hasSelection = selectedPref || selectedSeat;

  const handlePrefSelect = useCallback((prefId: string) => {
    setSelectedPref(prefId);
    setSelectedSeat(null);
  }, []);

  const handleSeatSelect = useCallback((seat: Seat) => {
    if (!seat.available) return;
    setSelectedSeat(seat);
    setSelectedPref(null);
    navigator.vibrate?.(10);
  }, []);

  const handleConfirm = useCallback(() => {
    if (onSelectSeat) {
      if (selectedSeat) {
        onSelectSeat(selectedSeat);
      } else if (selectedPref) {
        const pref = QUICK_PREFS.find(p => p.id === selectedPref);
        onSelectSeat({
          type: 'preference',
          position: pref?.position || 'no_preference',
          location: 'no_preference',
          extraLegroom: pref?.extraLegroom || false,
          quiet: false,
          price: pref?.price || 0,
        });
      }
    }
    setConfirmed(true);
    setTimeout(() => {
      setConfirmed(false);
      onClose();
    }, 600);
  }, [selectedSeat, selectedPref, onSelectSeat, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="fixed inset-x-0 bottom-16 z-50 bg-white rounded-t-2xl max-h-[55vh] flex flex-col shadow-2xl"
            data-testid="seat-map-modal"
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-8 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header - Compact */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Plane className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Seat Selection</h2>
                  <p className="text-[10px] text-gray-500">{passengerName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100"
                data-testid="close-seat-map"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-4 py-3" data-testid="seat-map">
              {/* Quick Preferences */}
              <div className="space-y-2 mb-4">
                {QUICK_PREFS.map((pref) => {
                  const Icon = pref.icon;
                  const isActive = selectedPref === pref.id;
                  return (
                    <button
                      key={pref.id}
                      onClick={() => handlePrefSelect(pref.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        isActive
                          ? 'bg-blue-50 border-blue-500'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                      data-testid={`seat-preference-${pref.id}`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isActive ? 'bg-blue-500' : 'bg-gray-100'}`}>
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`text-sm font-medium ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>{pref.label}</p>
                        <p className="text-xs text-gray-500">{pref.desc}</p>
                      </div>
                      {isActive && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Expandable Seat Grid */}
              {displayRows.length > 0 && (
                <div className="border-t border-gray-100 pt-3">
                  <button
                    onClick={() => setShowSeatGrid(!showSeatGrid)}
                    className="w-full flex items-center justify-between py-2 text-sm text-gray-600"
                  >
                    <span>Choose specific seat</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showSeatGrid ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showSeatGrid && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                        data-testid="seat-grid"
                      >
                        {/* Legend */}
                        <div className="flex justify-center gap-4 py-2 text-[10px] text-gray-500" data-testid="seat-legend">
                          <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded bg-blue-100 border border-blue-300" /> Available
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded bg-gray-200" /> Taken
                          </span>
                        </div>

                        {/* Seats */}
                        <div className="space-y-1 py-2">
                          {displayRows.map((row: SeatRow) => (
                            <div key={row.rowNumber} className="flex items-center justify-center gap-0.5">
                              <span className="w-4 text-[9px] text-gray-400 text-center">{row.rowNumber}</span>
                              {row.seats.slice(0, 3).map((seat) => (
                                <SeatButton
                                  key={seat.number}
                                  seat={seat}
                                  isSelected={selectedSeat?.number === seat.number}
                                  onClick={() => handleSeatSelect(seat)}
                                />
                              ))}
                              <div className="w-4" /> {/* Aisle */}
                              {row.seats.slice(3, 6).map((seat) => (
                                <SeatButton
                                  key={seat.number}
                                  seat={seat}
                                  isSelected={selectedSeat?.number === seat.number}
                                  onClick={() => handleSeatSelect(seat)}
                                />
                              ))}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer - Always Visible */}
            <div className="border-t border-gray-100 px-4 py-3 bg-white">
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl"
                  data-testid="skip-seats-button"
                >
                  Skip
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!hasSelection}
                  className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all ${
                    hasSelection
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                  data-testid="confirm-seats-button"
                >
                  {selectedSeat ? `Confirm ${selectedSeat.number}` : 'Confirm'}
                </button>
              </div>
            </div>

            {/* Success Overlay */}
            <AnimatePresence>
              {confirmed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/95 flex items-center justify-center rounded-t-2xl"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-7 h-7 text-white" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Compact Seat Button
function SeatButton({ seat, isSelected, onClick }: { seat: Seat; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={!seat.available}
      className={`w-7 h-7 rounded text-[8px] font-bold transition-all ${
        isSelected
          ? 'bg-blue-500 text-white scale-110'
          : seat.available
          ? 'bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100'
          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
      }`}
      data-testid={`seat-${seat.number}`}
      data-available={seat.available}
      data-selected={isSelected}
    >
      {isSelected ? <Check className="w-3 h-3 mx-auto" /> : seat.column}
    </button>
  );
}
