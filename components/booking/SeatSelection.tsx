'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Zap,
  Wifi,
  Wind,
  DoorOpen,
  AlertTriangle,
  Check,
  X,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Types
type SeatType = 'window' | 'aisle' | 'middle';
type SeatStatus = 'available' | 'selected' | 'occupied' | 'premium';
type SeatClass = 'economy' | 'premium-economy' | 'business' | 'first';

interface SeatFeatures {
  hasWifi: boolean;
  hasPower: boolean;
  extraLegroom: boolean;
  limitedRecline: boolean;
  exitRow: boolean;
}

interface Seat {
  id: string;
  row: number;
  column: string;
  type: SeatType;
  status: SeatStatus;
  class: SeatClass;
  price: number;
  features: SeatFeatures;
  assignedTo?: number; // passenger index
}

interface Passenger {
  id: number;
  name: string;
  type: 'adult' | 'child' | 'infant';
}

interface SeatSelectionProps {
  flightNumber?: string;
  aircraftType?: string;
  passengers?: Passenger[];
  onSeatSelectionComplete?: (selections: Map<number, Seat>) => void;
}

// Aircraft layouts
const AIRCRAFT_LAYOUTS = {
  'Boeing 737': {
    rows: 30,
    columns: ['A', 'B', 'C', '', 'D', 'E', 'F'],
    exitRows: [12, 13],
    wingRows: [10, 11, 12, 13, 14, 15],
    bathroomRows: [0, 30],
    premiumRows: [1, 2, 3, 4, 5],
  },
  'Airbus A320': {
    rows: 28,
    columns: ['A', 'B', 'C', '', 'D', 'E', 'F'],
    exitRows: [11, 12],
    wingRows: [9, 10, 11, 12, 13, 14],
    bathroomRows: [0, 28],
    premiumRows: [1, 2, 3, 4],
  },
  'Boeing 777': {
    rows: 40,
    columns: ['A', 'B', 'C', '', 'D', 'E', 'F', 'G', '', 'H', 'J', 'K'],
    exitRows: [15, 16, 30],
    wingRows: [12, 13, 14, 15, 16, 17, 18],
    bathroomRows: [0, 20, 40],
    premiumRows: [1, 2, 3, 4, 5, 6, 7, 8],
  },
};

const SeatSelection: React.FC<SeatSelectionProps> = ({
  flightNumber = 'F2A 123',
  aircraftType = 'Boeing 737',
  passengers = [
    { id: 1, name: 'John Doe', type: 'adult' },
    { id: 2, name: 'Jane Doe', type: 'adult' },
  ],
  onSeatSelectionComplete,
}) => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Map<number, Seat>>(new Map());
  const [currentPassengerIndex, setCurrentPassengerIndex] = useState(0);
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [filter, setFilter] = useState<'all' | 'available' | 'premium'>('all');

  const layout = AIRCRAFT_LAYOUTS[aircraftType as keyof typeof AIRCRAFT_LAYOUTS] || AIRCRAFT_LAYOUTS['Boeing 737'];

  // Initialize seats
  useEffect(() => {
    const initializeSeats = () => {
      const newSeats: Seat[] = [];

      for (let row = 1; row <= layout.rows; row++) {
        layout.columns.forEach((col, colIndex) => {
          if (col === '') return; // Skip aisle space

          const isExitRow = layout.exitRows.includes(row);
          const isPremiumRow = layout.premiumRows.includes(row);
          const isOccupied = Math.random() > 0.6; // 40% occupied

          let seatType: SeatType = 'middle';
          if (colIndex === 0 || colIndex === layout.columns.length - 1) {
            seatType = 'window';
          } else if (
            layout.columns[colIndex - 1] === '' ||
            layout.columns[colIndex + 1] === ''
          ) {
            seatType = 'aisle';
          }

          const seat: Seat = {
            id: `${row}${col}`,
            row,
            column: col,
            type: seatType,
            status: isOccupied ? 'occupied' : (isPremiumRow ? 'premium' : 'available'),
            class: isPremiumRow ? 'premium-economy' : 'economy',
            price: isPremiumRow ? 35 : (isExitRow ? 25 : 0),
            features: {
              hasWifi: row < 20,
              hasPower: isPremiumRow || isExitRow,
              extraLegroom: isExitRow || isPremiumRow,
              limitedRecline: layout.exitRows.includes(row - 1),
              exitRow: isExitRow,
            },
          };

          newSeats.push(seat);
        });
      }

      setSeats(newSeats);
      setIsLoading(false);
    };

    setTimeout(initializeSeats, 800); // Simulate loading
  }, [aircraftType]);

  // Handle seat selection
  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'occupied') return;

    const newSelectedSeats = new Map(selectedSeats);
    const currentPassenger = passengers[currentPassengerIndex];

    // Check if this seat is already selected by current passenger
    if (seat.assignedTo === currentPassenger.id) {
      // Deselect
      const updatedSeats = seats.map(s =>
        s.id === seat.id ? { ...s, status: seat.price > 0 ? 'premium' as SeatStatus : 'available' as SeatStatus, assignedTo: undefined } : s
      );
      setSeats(updatedSeats);
      newSelectedSeats.delete(currentPassenger.id);
      setSelectedSeats(newSelectedSeats);
      return;
    }

    // Check if current passenger already has a seat
    const existingSeat = Array.from(newSelectedSeats.entries()).find(
      ([passengerId]) => passengerId === currentPassenger.id
    );

    if (existingSeat) {
      // Free up the old seat
      const updatedSeats = seats.map(s => {
        if (s.id === existingSeat[1].id) {
          return { ...s, status: s.price > 0 ? 'premium' as SeatStatus : 'available' as SeatStatus, assignedTo: undefined };
        }
        if (s.id === seat.id) {
          return { ...s, status: 'selected' as SeatStatus, assignedTo: currentPassenger.id };
        }
        return s;
      });
      setSeats(updatedSeats);
    } else {
      // Just select the new seat
      const updatedSeats = seats.map(s =>
        s.id === seat.id ? { ...s, status: 'selected' as SeatStatus, assignedTo: currentPassenger.id } : s
      );
      setSeats(updatedSeats);
    }

    newSelectedSeats.set(currentPassenger.id, { ...seat, assignedTo: currentPassenger.id });
    setSelectedSeats(newSelectedSeats);

    // Auto-advance to next passenger
    if (currentPassengerIndex < passengers.length - 1) {
      setTimeout(() => setCurrentPassengerIndex(currentPassengerIndex + 1), 300);
    }

    // Notify parent
    onSeatSelectionComplete?.(newSelectedSeats);
  };

  // Auto-assign best available seats
  const autoAssignSeats = () => {
    const newSelectedSeats = new Map(selectedSeats);
    let updatedSeats = [...seats];

    passengers.forEach((passenger, index) => {
      // Skip if already has seat
      if (newSelectedSeats.has(passenger.id)) return;

      // Find best available seat (aisle or window, with features)
      const availableSeats = updatedSeats.filter(
        s => (s.status === 'available' || s.status === 'premium') && !s.assignedTo
      );

      const bestSeat = availableSeats
        .sort((a, b) => {
          // Prefer aisle/window over middle
          const typeScore = (seat: Seat) => seat.type === 'window' ? 3 : seat.type === 'aisle' ? 2 : 1;
          const featureScore = (seat: Seat) =>
            (seat.features.extraLegroom ? 2 : 0) +
            (seat.features.hasPower ? 1 : 0) +
            (seat.features.hasWifi ? 1 : 0);

          return (typeScore(b) + featureScore(b)) - (typeScore(a) + featureScore(a));
        })[0];

      if (bestSeat) {
        updatedSeats = updatedSeats.map(s =>
          s.id === bestSeat.id ? { ...s, status: 'selected' as SeatStatus, assignedTo: passenger.id } : s
        );
        newSelectedSeats.set(passenger.id, { ...bestSeat, assignedTo: passenger.id });
      }
    });

    setSeats(updatedSeats);
    setSelectedSeats(newSelectedSeats);
    onSeatSelectionComplete?.(newSelectedSeats);
  };

  // Get seat color
  const getSeatColor = (seat: Seat) => {
    if (seat.status === 'occupied') return 'bg-gray-300 cursor-not-allowed';
    if (seat.status === 'selected') {
      const passengerIndex = passengers.findIndex(p => p.id === seat.assignedTo);
      const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500', 'bg-orange-500'];
      return colors[passengerIndex % colors.length];
    }
    if (seat.status === 'premium') return 'bg-gradient-to-br from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600';
    return 'bg-emerald-500 hover:bg-emerald-600';
  };

  // Calculate warnings
  const getWarnings = () => {
    const warnings: string[] = [];
    const selectedSeatsList = Array.from(selectedSeats.values());

    if (selectedSeatsList.length > 1) {
      // Check if passengers are separated
      const rows = selectedSeatsList.map(s => s.row);
      const uniqueRows = new Set(rows);
      if (uniqueRows.size > 1) {
        warnings.push('Passengers are seated in different rows');
      }

      // Check for middle seats
      const middleSeats = selectedSeatsList.filter(s => s.type === 'middle');
      if (middleSeats.length > 0) {
        warnings.push(`${middleSeats.length} middle seat(s) selected`);
      }
    }

    return warnings;
  };

  // Calculate total cost
  const getTotalCost = () => {
    return Array.from(selectedSeats.values()).reduce((sum, seat) => sum + seat.price, 0);
  };

  const filteredSeats = seats.filter(seat => {
    if (filter === 'available') return seat.status === 'available';
    if (filter === 'premium') return seat.status === 'premium' || seat.class === 'premium-economy';
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <motion.div
              className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
          <p className="text-lg font-medium text-gray-700">Loading seat map...</p>
          <p className="text-sm text-gray-500 mt-2">{aircraftType}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Select Your Seats</h2>
            <p className="text-gray-600 mt-1">Flight {flightNumber} • {aircraftType}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
              className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <ZoomOut className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={() => setZoomLevel(Math.min(1.5, zoomLevel + 0.1))}
              className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <ZoomIn className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Passenger Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {passengers.map((passenger, index) => {
            const assignedSeat = selectedSeats.get(passenger.id);
            const isActive = currentPassengerIndex === index;

            return (
              <motion.button
                key={passenger.id}
                onClick={() => setCurrentPassengerIndex(index)}
                className={`p-4 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:shadow-md'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className={`w-5 h-5 ${isActive ? 'text-white' : 'text-blue-600'}`} />
                    <div className="text-left">
                      <p className="font-semibold">{passenger.name}</p>
                      <p className={`text-sm ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                        {assignedSeat ? `Seat ${assignedSeat.id}` : 'No seat selected'}
                      </p>
                    </div>
                  </div>
                  {assignedSeat && (
                    <Check className={`w-5 h-5 ${isActive ? 'text-white' : 'text-green-500'}`} />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Auto-assign button */}
        <button
          onClick={autoAssignSeats}
          className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Auto-Assign Best Seats
        </button>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Seat Legend</h3>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Info className="w-4 h-4" />
            {showInfo ? 'Hide' : 'Show'} Details
            {showInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-500 rounded"></div>
            <span className="text-sm text-gray-700">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded"></div>
            <span className="text-sm text-gray-700">Premium (+$)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
            <span className="text-sm text-gray-700">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-700">Selected</span>
          </div>
        </div>

        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-gray-600">WiFi</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-600" />
                <span className="text-xs text-gray-600">Power</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-600">Extra Legroom</span>
              </div>
              <div className="flex items-center gap-2">
                <DoorOpen className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-gray-600">Exit Row</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'available', 'premium'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as typeof filter)}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              filter === f
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Seat Map */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg overflow-x-auto">
        <div
          className="inline-block min-w-full"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
        >
          {/* Cockpit */}
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-b from-gray-800 to-gray-600 text-white px-12 py-3 rounded-t-full text-sm font-semibold">
              COCKPIT
            </div>
          </div>

          {/* Seat Grid */}
          <div className="space-y-2">
            {Array.from({ length: layout.rows }, (_, rowIndex) => {
              const row = rowIndex + 1;
              const isExitRow = layout.exitRows.includes(row);
              const isWingRow = layout.wingRows.includes(row);
              const isBathroomRow = layout.bathroomRows.includes(row);

              return (
                <div key={row}>
                  <div className="flex items-center gap-2 justify-center">
                    {/* Row number */}
                    <div className="w-8 text-center text-sm font-semibold text-gray-600">
                      {row}
                    </div>

                    {/* Seats */}
                    <div className="flex gap-1 items-center">
                      {layout.columns.map((col, colIndex) => {
                        if (col === '') {
                          return <div key={`aisle-${colIndex}`} className="w-8"></div>;
                        }

                        const seat = seats.find(s => s.row === row && s.column === col);
                        if (!seat || (filter !== 'all' && !filteredSeats.includes(seat))) {
                          return <div key={`${row}${col}`} className="w-10 h-10"></div>;
                        }

                        return (
                          <motion.button
                            key={seat.id}
                            onClick={() => handleSeatClick(seat)}
                            onMouseEnter={() => setHoveredSeat(seat)}
                            onMouseLeave={() => setHoveredSeat(null)}
                            className={`relative w-10 h-10 rounded-lg transition-all ${getSeatColor(seat)} ${
                              seat.status === 'occupied' ? '' : 'hover:scale-110 hover:shadow-lg'
                            }`}
                            whileHover={seat.status !== 'occupied' ? { scale: 1.1 } : {}}
                            whileTap={seat.status !== 'occupied' ? { scale: 0.95 } : {}}
                          >
                            {/* Seat icon */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              {seat.status === 'selected' ? (
                                <Check className="w-5 h-5 text-white" />
                              ) : seat.status === 'occupied' ? (
                                <X className="w-4 h-4 text-gray-600" />
                              ) : (
                                <span className="text-xs font-semibold text-white">{col}</span>
                              )}
                            </div>

                            {/* Price badge */}
                            {seat.price > 0 && seat.status !== 'occupied' && seat.status !== 'selected' && (
                              <div className="absolute -top-1 -right-1 bg-white text-xs font-bold text-orange-600 rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                                ${seat.price}
                              </div>
                            )}

                            {/* Features indicators */}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                              {seat.features.hasWifi && (
                                <Wifi className="w-2.5 h-2.5 text-white drop-shadow" />
                              )}
                              {seat.features.hasPower && (
                                <Zap className="w-2.5 h-2.5 text-white drop-shadow" />
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Row number (right) */}
                    <div className="w-8 text-center text-sm font-semibold text-gray-600">
                      {row}
                    </div>

                    {/* Row indicators */}
                    <div className="w-24 text-xs text-gray-600 flex items-center gap-1">
                      {isExitRow && (
                        <span className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                          <DoorOpen className="w-3 h-3" /> Exit
                        </span>
                      )}
                      {isWingRow && !isExitRow && (
                        <span className="text-gray-500">Wing</span>
                      )}
                    </div>
                  </div>

                  {isBathroomRow && row === layout.bathroomRows[layout.bathroomRows.length - 1] && (
                    <div className="flex justify-center mt-3 mb-2">
                      <div className="bg-blue-100 text-blue-700 px-6 py-2 rounded-lg text-sm font-medium">
                        Lavatories
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hovered Seat Info Tooltip */}
      <AnimatePresence>
        {hoveredSeat && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white p-4 rounded-xl shadow-2xl z-50 max-w-sm"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-bold text-lg">Seat {hoveredSeat.id}</h4>
                <p className="text-sm text-gray-300 capitalize">{hoveredSeat.type} • {hoveredSeat.class.replace('-', ' ')}</p>
              </div>
              {hoveredSeat.price > 0 && (
                <div className="bg-orange-500 px-3 py-1 rounded-full text-sm font-bold">
                  +${hoveredSeat.price}
                </div>
              )}
            </div>

            <div className="space-y-1 text-sm">
              {hoveredSeat.features.extraLegroom && (
                <div className="flex items-center gap-2 text-green-400">
                  <Wind className="w-4 h-4" />
                  <span>Extra legroom</span>
                </div>
              )}
              {hoveredSeat.features.hasPower && (
                <div className="flex items-center gap-2 text-yellow-400">
                  <Zap className="w-4 h-4" />
                  <span>Power outlet</span>
                </div>
              )}
              {hoveredSeat.features.hasWifi && (
                <div className="flex items-center gap-2 text-blue-400">
                  <Wifi className="w-4 h-4" />
                  <span>WiFi available</span>
                </div>
              )}
              {hoveredSeat.features.limitedRecline && (
                <div className="flex items-center gap-2 text-orange-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Limited recline</span>
                </div>
              )}
              {hoveredSeat.features.exitRow && (
                <div className="flex items-center gap-2 text-orange-400">
                  <DoorOpen className="w-4 h-4" />
                  <span>Exit row responsibilities</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selection Summary */}
      <div className="mt-6 bg-white rounded-xl p-6 shadow-lg">
        <h3 className="font-bold text-xl mb-4 text-gray-900">Selection Summary</h3>

        {/* Passenger Assignments */}
        <div className="space-y-3 mb-4">
          {passengers.map((passenger, index) => {
            const seat = selectedSeats.get(passenger.id);
            const colors = ['blue', 'purple', 'pink', 'green', 'orange'];
            const color = colors[index % colors.length];

            return (
              <div
                key={passenger.id}
                className={`flex items-center justify-between p-3 rounded-lg bg-${color}-50 border border-${color}-200`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-${color}-500 text-white flex items-center justify-center font-semibold`}>
                    {passenger.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{passenger.name}</p>
                    <p className="text-sm text-gray-600">
                      {seat ? (
                        <span className="flex items-center gap-2">
                          Seat {seat.id} • {seat.type} • {seat.class.replace('-', ' ')}
                          {seat.price > 0 && <span className="text-orange-600 font-semibold">+${seat.price}</span>}
                        </span>
                      ) : (
                        <span className="text-gray-500">No seat selected</span>
                      )}
                    </p>
                  </div>
                </div>
                {seat && (
                  <Check className={`w-5 h-5 text-${color}-600`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Warnings */}
        {getWarnings().length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-yellow-900 mb-1">Seat Selection Warnings</p>
                <ul className="space-y-1">
                  {getWarnings().map((warning, index) => (
                    <li key={index} className="text-sm text-yellow-800">• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Total Cost */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div>
            <p className="text-gray-600">Additional Seat Fees</p>
            <p className="text-xs text-gray-500 mt-1">
              {selectedSeats.size} of {passengers.length} passengers assigned
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">
              ${getTotalCost()}
            </p>
            {getTotalCost() === 0 && (
              <p className="text-sm text-green-600 font-medium">Free seat selection!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;