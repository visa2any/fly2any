'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plane, Check, Eye, DoorOpen, Footprints, ChevronDown, AlertCircle } from 'lucide-react';
import type { ParsedSeatMap, Seat, SeatRow } from '@/lib/flights/seat-map-parser';

// ============================================
// FLY2ANY BRAND COLORS
// ============================================
const BRAND = {
  primary: '#E63946',      // Red
  primaryLight: '#FEE2E5', // Light red background
  primaryHover: '#D62839', // Darker red hover
  accent: '#FFB703',       // Yellow
  accentLight: '#FFF3CD',  // Light yellow background
  success: '#10B981',      // Green for success
  successLight: '#D1FAE5', // Light green
};

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
// QUICK PREFERENCES - Fly2Any styled
// ============================================

const QUICK_PREFS = [
  {
    id: 'window',
    icon: Eye,
    label: 'Window',
    desc: 'Great views',
    position: 'window' as const,
    color: BRAND.primary,
    bgColor: BRAND.primaryLight,
  },
  {
    id: 'aisle',
    icon: DoorOpen,
    label: 'Aisle',
    desc: 'Easy access',
    position: 'aisle' as const,
    color: BRAND.primary,
    bgColor: BRAND.primaryLight,
  },
  {
    id: 'legroom',
    icon: Footprints,
    label: 'Extra Legroom',
    desc: '+$25',
    extraLegroom: true,
    price: 25,
    color: BRAND.accent,
    bgColor: BRAND.accentLight,
  },
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
  errorMessage,
}: SeatMapModalProps) {
  const [selectedPref, setSelectedPref] = useState<string | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [showSeatGrid, setShowSeatGrid] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const passengerName = passengerNames[currentPassengerIndex] || `Passenger ${currentPassengerIndex + 1}`;

  // Get ALL rows for full seat map display
  const displayRows = useMemo(() => {
    const rows = seatMap?.decks?.[0]?.rows || [];
    return rows; // Show ALL rows, not sliced
  }, [seatMap]);

  const hasRealSeatMap = displayRows.length > 0 && seatMap?.hasRealData;
  const hasSelection = selectedPref || selectedSeat;

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPref(null);
      setSelectedSeat(null);
      setShowSeatGrid(false);
      setConfirmed(false);
    }
  }, [isOpen]);

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
    }, 500);
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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Bottom Sheet - Apple-class design */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="fixed inset-x-0 bottom-16 z-50 bg-white rounded-t-3xl flex flex-col shadow-[0_-8px_30px_rgba(0,0,0,0.12)]"
            style={{
              maxHeight: 'calc(85vh - 64px)',
              minHeight: '50vh',
            }}
            data-testid="seat-map-modal"
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: BRAND.primaryLight }}
                >
                  <Plane className="w-5 h-5" style={{ color: BRAND.primary }} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Seat Selection</h2>
                  <p className="text-xs text-gray-500">{passengerName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                data-testid="close-seat-map"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4" data-testid="seat-map">
              {/* Error/Info Message */}
              {errorMessage && (
                <div
                  className="flex items-start gap-3 p-4 rounded-2xl mb-4"
                  style={{ backgroundColor: BRAND.accentLight }}
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: BRAND.accent }} />
                  <p className="text-sm text-gray-700">{errorMessage}</p>
                </div>
              )}

              {/* Quick Preferences - Horizontal Row */}
              <div className="mb-5">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Seat Preference
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_PREFS.map((pref) => {
                    const Icon = pref.icon;
                    const isActive = selectedPref === pref.id;
                    return (
                      <button
                        key={pref.id}
                        onClick={() => handlePrefSelect(pref.id)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 ${
                          isActive
                            ? 'shadow-lg scale-[1.02]'
                            : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                        style={isActive ? {
                          backgroundColor: pref.bgColor,
                          borderColor: pref.color,
                        } : undefined}
                        data-testid={`seat-preference-${pref.id}`}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors relative"
                          style={{
                            backgroundColor: isActive ? pref.color : '#F3F4F6',
                          }}
                        >
                          <Icon
                            className="w-5 h-5 transition-colors"
                            style={{ color: isActive ? 'white' : '#6B7280' }}
                          />
                          {isActive && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: BRAND.success }}
                            >
                              <Check className="w-2.5 h-2.5 text-white" />
                            </motion.div>
                          )}
                        </div>
                        <div className="text-center">
                          <p
                            className="text-xs font-semibold leading-tight"
                            style={{ color: isActive ? pref.color : '#111827' }}
                          >
                            {pref.label}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{pref.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Expandable Seat Grid */}
              {hasRealSeatMap && (
                <div className="border-t border-gray-100 pt-4">
                  <button
                    onClick={() => setShowSeatGrid(!showSeatGrid)}
                    className="w-full flex items-center justify-between py-3 text-sm font-medium text-gray-700"
                  >
                    <span>Choose specific seat</span>
                    <motion.div
                      animate={{ rotate: showSeatGrid ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {showSeatGrid && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                        data-testid="seat-grid"
                      >
                        {/* Legend */}
                        <div
                          className="flex justify-center gap-6 py-3 mb-3 rounded-xl"
                          style={{ backgroundColor: '#F9FAFB' }}
                          data-testid="seat-legend"
                        >
                          <span className="flex items-center gap-2 text-xs text-gray-600">
                            <span
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: BRAND.primaryLight, border: `1px solid ${BRAND.primary}` }}
                            />
                            Available
                          </span>
                          <span className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="w-4 h-4 rounded bg-gray-200" />
                            Taken
                          </span>
                          <span className="flex items-center gap-2 text-xs text-gray-600">
                            <span
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: BRAND.primary }}
                            />
                            Selected
                          </span>
                        </div>

                        {/* Airplane Nose */}
                        <div className="flex justify-center mb-2">
                          <div
                            className="w-16 h-6 rounded-t-full"
                            style={{
                              background: `linear-gradient(180deg, ${BRAND.primaryLight} 0%, white 100%)`,
                            }}
                          />
                        </div>

                        {/* Seats Grid */}
                        <div
                          className="space-y-1.5 py-3 px-2 rounded-2xl mb-4"
                          style={{ backgroundColor: '#FAFAFA' }}
                        >
                          {displayRows.map((row: SeatRow) => (
                            <div key={row.rowNumber} className="flex items-center justify-center gap-1">
                              <span className="w-6 text-[10px] text-gray-400 text-right font-medium">
                                {row.rowNumber}
                              </span>

                              {/* Left seats (A, B, C) */}
                              <div className="flex gap-1">
                                {row.seats.slice(0, 3).map((seat) => (
                                  <SeatButton
                                    key={seat.number}
                                    seat={seat}
                                    isSelected={selectedSeat?.number === seat.number}
                                    onClick={() => handleSeatSelect(seat)}
                                  />
                                ))}
                              </div>

                              {/* Aisle */}
                              <div className="w-6" />

                              {/* Right seats (D, E, F) */}
                              <div className="flex gap-1">
                                {row.seats.slice(3, 6).map((seat) => (
                                  <SeatButton
                                    key={seat.number}
                                    seat={seat}
                                    isSelected={selectedSeat?.number === seat.number}
                                    onClick={() => handleSeatSelect(seat)}
                                  />
                                ))}
                              </div>

                              <span className="w-6 text-[10px] text-gray-400 text-left font-medium">
                                {row.rowNumber}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Seat Info */}
                        {selectedSeat && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between p-4 rounded-2xl mb-4"
                            style={{ backgroundColor: BRAND.primaryLight }}
                          >
                            <div>
                              <p className="text-sm font-semibold" style={{ color: BRAND.primary }}>
                                Seat {selectedSeat.number}
                              </p>
                              <p className="text-xs text-gray-600">
                                {selectedSeat.type === 'window' ? 'Window seat' :
                                 selectedSeat.type === 'aisle' ? 'Aisle seat' : 'Middle seat'}
                                {selectedSeat.hasExtraLegroom && ' • Extra legroom'}
                              </p>
                            </div>
                            {selectedSeat.price && selectedSeat.price > 0 && (
                              <span
                                className="text-lg font-bold"
                                style={{ color: BRAND.primary }}
                              >
                                ${selectedSeat.price}
                              </span>
                            )}
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer - Fixed */}
            <div
              className="border-t border-gray-100 px-5 py-4 bg-white"
              style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
            >
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors"
                  data-testid="skip-seats-button"
                >
                  Skip
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!hasSelection}
                  className="flex-1 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-200"
                  style={{
                    backgroundColor: hasSelection ? BRAND.primary : '#E5E7EB',
                    color: hasSelection ? 'white' : '#9CA3AF',
                    boxShadow: hasSelection ? `0 8px 20px ${BRAND.primary}40` : 'none',
                  }}
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
                  className="absolute inset-0 bg-white/95 flex items-center justify-center rounded-t-3xl"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: BRAND.success }}
                  >
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

// ============================================
// SEAT BUTTON COMPONENT
// ============================================

function SeatButton({
  seat,
  isSelected,
  onClick
}: {
  seat: Seat;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!seat.available}
      className="w-8 h-8 rounded-lg text-[9px] font-bold transition-all duration-150"
      style={{
        backgroundColor: isSelected
          ? BRAND.primary
          : seat.available
            ? BRAND.primaryLight
            : '#E5E7EB',
        border: isSelected
          ? 'none'
          : seat.available
            ? `1px solid ${BRAND.primary}50`
            : 'none',
        color: isSelected
          ? 'white'
          : seat.available
            ? BRAND.primary
            : '#9CA3AF',
        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
        boxShadow: isSelected ? `0 4px 12px ${BRAND.primary}40` : 'none',
        cursor: seat.available ? 'pointer' : 'not-allowed',
      }}
      data-testid={`seat-${seat.number}`}
      data-available={seat.available}
      data-selected={isSelected}
    >
      {isSelected ? <Check className="w-4 h-4 mx-auto" /> : seat.column}
    </button>
  );
}
