'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plane, Check, Eye, DoorOpen, Footprints, ChevronDown, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import type { ParsedSeatMap, Seat, SeatRow } from '@/lib/flights/seat-map-parser';

// ============================================
// FLY2ANY BRAND COLORS
// ============================================
const BRAND = {
  primary: '#E63946',
  primaryLight: '#FEE2E5',
  primaryHover: '#D62839',
  accent: '#FFB703',
  accentLight: '#FFF3CD',
  success: '#10B981',
  successLight: '#D1FAE5',
};

// ============================================
// TYPES
// ============================================

interface FlightSegment {
  id: string;
  origin: string;
  destination: string;
  flightNumber?: string;
  seatMap: ParsedSeatMap;
}

interface SeatMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  seatMap: ParsedSeatMap;
  onSelectSeat?: (seat: Seat | SeatPreference, flightIndex?: number) => void;
  onConfirmAll?: (selections: Map<number, Seat | SeatPreference>) => void;
  passengerCount?: number;
  currentPassengerIndex?: number;
  passengerNames?: string[];
  // Multi-flight support
  flights?: FlightSegment[];
  totalFlights?: number;
  currentFlightIndex?: number;
  flightInfo?: { origin: string; destination: string; flightNumber?: string };
  errorMessage?: string;
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
  { id: 'window', icon: Eye, label: 'Window', desc: 'Great views', position: 'window' as const, color: BRAND.primary, bgColor: BRAND.primaryLight },
  { id: 'aisle', icon: DoorOpen, label: 'Aisle', desc: 'Easy access', position: 'aisle' as const, color: BRAND.primary, bgColor: BRAND.primaryLight },
  { id: 'legroom', icon: Footprints, label: 'Extra Legroom', desc: '+$25', extraLegroom: true, price: 25, color: BRAND.accent, bgColor: BRAND.accentLight },
];

// ============================================
// COMPONENT
// ============================================

export default function SeatMapModal({
  isOpen,
  onClose,
  seatMap,
  onSelectSeat,
  onConfirmAll,
  currentPassengerIndex = 0,
  passengerNames = [],
  flights = [],
  totalFlights = 1,
  currentFlightIndex = 0,
  flightInfo,
  errorMessage,
}: SeatMapModalProps) {
  const [selectedPref, setSelectedPref] = useState<string | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [showSeatGrid, setShowSeatGrid] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [activeFlightIdx, setActiveFlightIdx] = useState(currentFlightIndex);
  const [flightSelections, setFlightSelections] = useState<Map<number, Seat | SeatPreference>>(new Map());

  const passengerName = passengerNames[currentPassengerIndex] || `Passenger ${currentPassengerIndex + 1}`;
  const hasMultipleFlights = totalFlights > 1 || flights.length > 1;
  const effectiveTotalFlights = flights.length > 0 ? flights.length : totalFlights;
  const isLastFlight = activeFlightIdx >= effectiveTotalFlights - 1;
  const isFirstFlight = activeFlightIdx === 0;

  // Get current flight's seat map
  const currentSeatMap = flights.length > 0 ? flights[activeFlightIdx]?.seatMap : seatMap;
  const currentFlightInfo = flights.length > 0
    ? { origin: flights[activeFlightIdx]?.origin, destination: flights[activeFlightIdx]?.destination, flightNumber: flights[activeFlightIdx]?.flightNumber }
    : flightInfo;

  const displayRows = useMemo(() => currentSeatMap?.decks?.[0]?.rows || [], [currentSeatMap]);
  const hasRealSeatMap = displayRows.length > 0 && currentSeatMap?.hasRealData;
  const hasSelection = selectedPref || selectedSeat;

  // Reset on open or flight change
  useEffect(() => {
    if (isOpen) {
      setActiveFlightIdx(currentFlightIndex);
      setFlightSelections(new Map());
    }
  }, [isOpen, currentFlightIndex]);

  useEffect(() => {
    // Load saved selection for this flight
    const saved = flightSelections.get(activeFlightIdx);
    if (saved) {
      if ('type' in saved && saved.type === 'preference') {
        const pref = QUICK_PREFS.find(p => p.position === saved.position || p.extraLegroom === saved.extraLegroom);
        setSelectedPref(pref?.id || null);
        setSelectedSeat(null);
      } else {
        setSelectedSeat(saved as Seat);
        setSelectedPref(null);
      }
    } else {
      setSelectedPref(null);
      setSelectedSeat(null);
    }
    setShowSeatGrid(false);
  }, [activeFlightIdx, flightSelections]);

  const handlePrefSelect = useCallback((prefId: string) => {
    setSelectedPref(prev => prev === prefId ? null : prefId);
    setSelectedSeat(null);
  }, []);

  const handleSeatSelect = useCallback((seat: Seat) => {
    if (!seat.available) return;
    setSelectedSeat(prev => prev?.number === seat.number ? null : seat);
    setSelectedPref(null);
    navigator.vibrate?.(10);
  }, []);

  const saveCurrentSelection = useCallback(() => {
    if (selectedSeat) {
      setFlightSelections(prev => new Map(prev).set(activeFlightIdx, selectedSeat));
      return selectedSeat;
    } else if (selectedPref) {
      const pref = QUICK_PREFS.find(p => p.id === selectedPref);
      const selection: SeatPreference = {
        type: 'preference',
        position: pref?.position || 'no_preference',
        location: 'no_preference',
        extraLegroom: pref?.extraLegroom || false,
        quiet: false,
        price: pref?.price || 0,
      };
      setFlightSelections(prev => new Map(prev).set(activeFlightIdx, selection));
      return selection;
    }
    return null;
  }, [selectedSeat, selectedPref, activeFlightIdx]);

  const handleNextFlight = useCallback(() => {
    saveCurrentSelection();
    if (!isLastFlight) setActiveFlightIdx(prev => prev + 1);
  }, [saveCurrentSelection, isLastFlight]);

  const handlePrevFlight = useCallback(() => {
    saveCurrentSelection();
    if (!isFirstFlight) setActiveFlightIdx(prev => prev - 1);
  }, [saveCurrentSelection, isFirstFlight]);

  const handleConfirm = useCallback(() => {
    const selection = saveCurrentSelection();

    if (hasMultipleFlights && onConfirmAll) {
      const finalSelections = new Map(flightSelections);
      if (selection) finalSelections.set(activeFlightIdx, selection);
      onConfirmAll(finalSelections);
    } else if (onSelectSeat && selection) {
      onSelectSeat(selection, activeFlightIdx);
    }

    setConfirmed(true);
    setTimeout(() => {
      setConfirmed(false);
      onClose();
    }, 500);
  }, [saveCurrentSelection, hasMultipleFlights, onConfirmAll, onSelectSeat, activeFlightIdx, flightSelections, onClose]);

  const handleSkip = useCallback(() => {
    if (hasMultipleFlights && !isLastFlight) {
      setActiveFlightIdx(prev => prev + 1);
    } else {
      onClose();
    }
  }, [hasMultipleFlights, isLastFlight, onClose]);

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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Bottom Sheet - 10% taller */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="fixed inset-x-0 bottom-16 z-50 bg-white rounded-t-3xl flex flex-col shadow-[0_-8px_30px_rgba(0,0,0,0.12)]"
            style={{ maxHeight: 'calc(93vh - 64px)', minHeight: '55vh' }}
            data-testid="seat-map-modal"
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: BRAND.primaryLight }}>
                  <Plane className="w-4 h-4" style={{ color: BRAND.primary }} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Seat Selection</h2>
                  <p className="text-[10px] text-gray-500">
                    {passengerName}{currentFlightInfo && ` • ${currentFlightInfo.origin}→${currentFlightInfo.destination}`}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200" data-testid="close-seat-map">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Flight Navigation Pills */}
            {hasMultipleFlights && (
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="flex items-center justify-center gap-1.5">
                  {Array.from({ length: effectiveTotalFlights }, (_, i) => {
                    const flight = flights[i];
                    const hasSelectionForFlight = flightSelections.has(i);
                    const isActive = i === activeFlightIdx;
                    return (
                      <button
                        key={i}
                        onClick={() => { saveCurrentSelection(); setActiveFlightIdx(i); }}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
                          isActive ? 'text-white shadow' : hasSelectionForFlight ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}
                        style={isActive ? { backgroundColor: BRAND.primary } : undefined}
                      >
                        {flight ? `${flight.origin}→${flight.destination}` : `Flight ${i + 1}`}
                        {hasSelectionForFlight && !isActive && <Check className="w-2.5 h-2.5 inline ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-2" data-testid="seat-map">
              {errorMessage && (
                <div className="flex items-center gap-2 p-2 rounded-xl mb-2" style={{ backgroundColor: BRAND.accentLight }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: BRAND.accent }} />
                  <p className="text-xs text-gray-700">{errorMessage}</p>
                </div>
              )}

              {/* Quick Preferences - Horizontal compact */}
              <div className="mb-3">
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1.5">Seat Preference</p>
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_PREFS.map((pref) => {
                    const Icon = pref.icon;
                    const isActive = selectedPref === pref.id;
                    return (
                      <button
                        key={pref.id}
                        onClick={() => handlePrefSelect(pref.id)}
                        className={`flex items-center gap-2 px-2 py-2 rounded-xl border-2 transition-all ${
                          isActive ? 'shadow-md' : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                        style={isActive ? { backgroundColor: pref.bgColor, borderColor: pref.color } : undefined}
                        data-testid={`seat-preference-${pref.id}`}
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: isActive ? pref.color : '#F3F4F6' }}
                        >
                          <Icon className="w-3.5 h-3.5" style={{ color: isActive ? 'white' : '#6B7280' }} />
                        </div>
                        <div className="text-left min-w-0">
                          <p className="text-[11px] font-semibold truncate" style={{ color: isActive ? pref.color : '#111827' }}>{pref.label}</p>
                          <p className="text-[9px] text-gray-500">{pref.desc}</p>
                        </div>
                        {isActive && (
                          <Check className="w-3.5 h-3.5 flex-shrink-0 ml-auto" style={{ color: BRAND.success }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Seat Grid */}
              {hasRealSeatMap && (
                <div className="border-t border-gray-100 pt-2">
                  <button onClick={() => setShowSeatGrid(!showSeatGrid)} className="w-full flex items-center justify-between py-1.5 text-xs font-medium text-gray-700">
                    <span>Choose specific seat</span>
                    <motion.div animate={{ rotate: showSeatGrid ? 180 : 0 }}><ChevronDown className="w-5 h-5 text-gray-400" /></motion.div>
                  </button>

                  <AnimatePresence>
                    {showSeatGrid && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden" data-testid="seat-grid">
                        <div className="flex justify-center gap-4 py-2 mb-2 rounded-xl text-[10px]" style={{ backgroundColor: '#F9FAFB' }} data-testid="seat-legend">
                          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: BRAND.primaryLight, border: `1px solid ${BRAND.primary}` }} />Available</span>
                          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-200" />Taken</span>
                          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: BRAND.primary }} />Selected</span>
                        </div>

                        <div className="space-y-1 py-2 px-1 rounded-2xl" style={{ backgroundColor: '#FAFAFA' }}>
                          {displayRows.map((row: SeatRow) => (
                            <div key={row.rowNumber} className="flex items-center justify-center gap-0.5">
                              <span className="w-5 text-[9px] text-gray-400 text-right">{row.rowNumber}</span>
                              <div className="flex gap-0.5">{row.seats.slice(0, 3).map(seat => <SeatButton key={seat.number} seat={seat} isSelected={selectedSeat?.number === seat.number} onClick={() => handleSeatSelect(seat)} />)}</div>
                              <div className="w-4" />
                              <div className="flex gap-0.5">{row.seats.slice(3, 6).map(seat => <SeatButton key={seat.number} seat={seat} isSelected={selectedSeat?.number === seat.number} onClick={() => handleSeatSelect(seat)} />)}</div>
                              <span className="w-5 text-[9px] text-gray-400 text-left">{row.rowNumber}</span>
                            </div>
                          ))}
                        </div>

                        {selectedSeat && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between p-3 rounded-2xl mt-3" style={{ backgroundColor: BRAND.primaryLight }}>
                            <div>
                              <p className="text-sm font-semibold" style={{ color: BRAND.primary }}>Seat {selectedSeat.number}</p>
                              <p className="text-xs text-gray-600">{selectedSeat.type === 'window' ? 'Window' : selectedSeat.type === 'aisle' ? 'Aisle' : 'Middle'}{selectedSeat.hasExtraLegroom && ' • Legroom'}</p>
                            </div>
                            {selectedSeat.price && selectedSeat.price > 0 && <span className="text-lg font-bold" style={{ color: BRAND.primary }}>${selectedSeat.price}</span>}
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer - Multi-flight navigation */}
            <div className="border-t border-gray-100 px-4 py-2 bg-white" style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}>
              {hasMultipleFlights ? (
                <div className="flex items-center gap-1.5">
                  <button onClick={handlePrevFlight} disabled={isFirstFlight} className={`p-2 rounded-xl ${isFirstFlight ? 'bg-gray-100 text-gray-300' : 'bg-gray-100 text-gray-700'}`} data-testid="prev-flight-button">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={handleSkip} className="flex-1 py-2.5 text-xs font-semibold text-gray-700 bg-gray-100 rounded-xl" data-testid="skip-seats-button">
                    {isLastFlight ? 'Skip All' : 'Skip'}
                  </button>
                  <button
                    onClick={isLastFlight ? handleConfirm : handleNextFlight}
                    disabled={!hasSelection && isLastFlight}
                    className="flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all"
                    style={{ backgroundColor: (hasSelection || !isLastFlight) ? BRAND.primary : '#E5E7EB', color: (hasSelection || !isLastFlight) ? 'white' : '#9CA3AF', boxShadow: (hasSelection || !isLastFlight) ? `0 4px 12px ${BRAND.primary}40` : 'none' }}
                    data-testid="confirm-seats-button"
                  >
                    {isLastFlight ? (selectedSeat ? `Confirm ${selectedSeat.number}` : 'Confirm All') : 'Next →'}
                  </button>
                  <button onClick={handleNextFlight} disabled={isLastFlight} className={`p-2 rounded-xl ${isLastFlight ? 'bg-gray-100 text-gray-300' : 'bg-gray-100 text-gray-700'}`} data-testid="next-flight-button">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={onClose} className="flex-1 py-2.5 text-xs font-semibold text-gray-700 bg-gray-100 rounded-xl" data-testid="skip-seats-button">Skip</button>
                  <button
                    onClick={handleConfirm}
                    disabled={!hasSelection}
                    className="flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all"
                    style={{ backgroundColor: hasSelection ? BRAND.primary : '#E5E7EB', color: hasSelection ? 'white' : '#9CA3AF', boxShadow: hasSelection ? `0 4px 12px ${BRAND.primary}40` : 'none' }}
                    data-testid="confirm-seats-button"
                  >
                    {selectedSeat ? `Confirm ${selectedSeat.number}` : 'Confirm'}
                  </button>
                </div>
              )}
            </div>

            {/* Success Overlay */}
            <AnimatePresence>
              {confirmed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/95 flex items-center justify-center rounded-t-3xl">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }} className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: BRAND.success }}>
                    <Check className="w-8 h-8 text-white" />
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

// Seat Button Component
function SeatButton({ seat, isSelected, onClick }: { seat: Seat; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={!seat.available}
      className="w-7 h-7 rounded text-[8px] font-bold transition-all"
      style={{
        backgroundColor: isSelected ? BRAND.primary : seat.available ? BRAND.primaryLight : '#E5E7EB',
        border: isSelected ? 'none' : seat.available ? `1px solid ${BRAND.primary}50` : 'none',
        color: isSelected ? 'white' : seat.available ? BRAND.primary : '#9CA3AF',
        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
        boxShadow: isSelected ? `0 3px 8px ${BRAND.primary}40` : 'none',
        cursor: seat.available ? 'pointer' : 'not-allowed',
      }}
      data-testid={`seat-${seat.number}`}
      data-available={seat.available}
      data-selected={isSelected}
    >
      {isSelected ? <Check className="w-3 h-3 mx-auto" /> : seat.column}
    </button>
  );
}
