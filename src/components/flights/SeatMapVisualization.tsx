'use client';

/**
 * 💺 SEAT MAP VISUALIZATION COMPONENT
 * Interactive seat map with realistic aircraft layouts
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SeatInfo {
  seatNumber: string;
  type: 'economy' | 'premium-economy' | 'business' | 'first' | 'exit-row' | 'extra-legroom';
  price: number;
  available: boolean;
  features: string[];
  position: 'window' | 'middle' | 'aisle';
  row: number;
  column: string;
}

interface SeatMapVisualizationProps {
  flightId: string;
  selectedSeats: SeatInfo[];
  onSeatSelect: (seat: SeatInfo) => void;
  maxSelections: number;
  aircraftType?: string;
  className?: string;
}

interface AircraftConfig {
  name: string;
  rows: number;
  seatsPerRow: number;
  aislePositions: number[];
  exitRows: number[];
  premiumRows: number[];
  businessRows: number[];
  firstRows: number[];
}

const AIRCRAFT_CONFIGS: Record<string, AircraftConfig> = {
  'Boeing 737': {
    name: 'Boeing 737-800',
    rows: 32,
    seatsPerRow: 6,
    aislePositions: [3],
    exitRows: [6, 7, 12, 13],
    premiumRows: [1, 2, 3],
    businessRows: [],
    firstRows: []
  },
  'Airbus A320': {
    name: 'Airbus A320',
    rows: 30,
    seatsPerRow: 6,
    aislePositions: [3],
    exitRows: [6, 12],
    premiumRows: [1, 2],
    businessRows: [],
    firstRows: []
  },
  'Boeing 777': {
    name: 'Boeing 777-300ER',
    rows: 42,
    seatsPerRow: 10,
    aislePositions: [3, 7],
    exitRows: [18, 19],
    premiumRows: [6, 7, 8, 9, 10],
    businessRows: [1, 2, 3, 4, 5],
    firstRows: []
  },
  'Airbus A380': {
    name: 'Airbus A380',
    rows: 50,
    seatsPerRow: 10,
    aislePositions: [3, 7],
    exitRows: [25, 26],
    premiumRows: [15, 16, 17, 18, 19, 20],
    businessRows: [6, 7, 8, 9, 10, 11, 12, 13, 14],
    firstRows: [1, 2, 3, 4, 5]
  }
};

export default function SeatMapVisualization({
  flightId,
  selectedSeats,
  onSeatSelect,
  maxSelections,
  aircraftType = 'Boeing 737',
  className = ''
}: SeatMapVisualizationProps) {
  const [seatMap, setSeatMap] = useState<SeatInfo[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredSeat, setHoveredSeat] = useState<SeatInfo | null>(null);

  const config = AIRCRAFT_CONFIGS[aircraftType] || AIRCRAFT_CONFIGS['Boeing 737'];

  // Generate seat map
  useEffect(() => {
    const generateSeatMap = () => {
      const map: SeatInfo[][] = [];
      const columnLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];

      for (let row = 1; row <= config.rows; row++) {
        const rowSeats: SeatInfo[] = [];

        for (let col = 0; col < config.seatsPerRow; col++) {
          const columnLabel = columnLabels[col];
          const seatNumber = `${row}${columnLabel}`;
          
          // Determine seat type
          let seatType: SeatInfo['type'] = 'economy';
          if (config.firstRows.includes(row)) {
            seatType = 'first';
          } else if (config.businessRows.includes(row)) {
            seatType = 'business';
          } else if (config.premiumRows.includes(row)) {
            seatType = 'premium-economy';
          } else if (config.exitRows.includes(row)) {
            seatType = 'exit-row';
          } else if (row <= 5 || (col === 0 || col === config.seatsPerRow - 1)) {
            // First few rows or window seats might be extra legroom
            if (Math.random() > 0.7) {
              seatType = 'extra-legroom';
            }
          }

          // Determine position
          let position: SeatInfo['position'] = 'middle';
          if (col === 0 || col === config.seatsPerRow - 1) {
            position = 'window';
          } else if (config.aislePositions.some(pos => col === pos - 1 || col === pos)) {
            position = 'aisle';
          }

          // Calculate price based on seat type
          let price = 0;
          switch (seatType) {
            case 'first':
              price = 200;
              break;
            case 'business':
              price = 150;
              break;
            case 'premium-economy':
              price = 75;
              break;
            case 'exit-row':
            case 'extra-legroom':
              price = 45;
              break;
            case 'economy':
              price = position === 'window' || position === 'aisle' ? 25 : 15;
              break;
          }

          // Generate features
          const features: string[] = [];
          if (seatType === 'exit-row' || seatType === 'extra-legroom') {
            features.push('Extra Legroom');
          }
          if (position === 'window') {
            features.push('Window View');
          }
          if (position === 'aisle') {
            features.push('Easy Access');
          }
          if (seatType === 'premium-economy') {
            features.push('Premium Service', 'Extra Recline');
          }
          if (seatType === 'business') {
            features.push('Lie-Flat Bed', 'Premium Dining', 'Lounge Access');
          }
          if (seatType === 'first') {
            features.push('Private Suite', 'Concierge Service', 'Premium Amenities');
          }

          // Simulate availability (85% available)
          const available = Math.random() > 0.15;

          const seat: SeatInfo = {
            seatNumber,
            type: seatType,
            price,
            available,
            features,
            position,
            row,
            column: columnLabel
          };

          rowSeats.push(seat);
        }

        map.push(rowSeats);
      }

      setSeatMap(map);
      setIsLoading(false);
    };

    generateSeatMap();
  }, [flightId, config]);

  const getSeatColor = (seat: SeatInfo) => {
    if (selectedSeats.some(s => s.seatNumber === seat.seatNumber)) {
      return 'bg-blue-500 border-blue-600 text-white';
    }
    if (!seat.available) {
      return 'bg-red-500 border-red-600 text-white cursor-not-allowed';
    }
    
    switch (seat.type) {
      case 'first':
        return 'bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200';
      case 'business':
        return 'bg-indigo-100 border-indigo-300 text-indigo-800 hover:bg-indigo-200';
      case 'premium-economy':
        return 'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200';
      case 'exit-row':
      case 'extra-legroom':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200';
      default:
        return 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200';
    }
  };

  const getSeatIcon = (seat: SeatInfo) => {
    if (seat.type === 'first') return '👑';
    if (seat.type === 'business') return '💼';
    if (seat.type === 'premium-economy') return '⭐';
    if (seat.type === 'exit-row') return '🚪';
    if (seat.type === 'extra-legroom') return '📏';
    if (seat.position === 'window') return '🪟';
    if (seat.position === 'aisle') return '🚶';
    return '💺';
  };

  const handleSeatClick = (seat: SeatInfo) => {
    if (!seat.available) return;
    onSeatSelect(seat);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-16 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading seat map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Aircraft Header */}
      <div className="text-center mb-6">
        <div className="bg-gray-100 rounded-lg p-4 mx-auto max-w-md">
          <div className="text-2xl mb-2">✈️</div>
          <div className="font-bold text-gray-900">{config.name}</div>
          <div className="text-sm text-gray-600">
            {config.rows} rows • {config.seatsPerRow} seats per row
          </div>
        </div>
      </div>

      {/* Seat Map Container */}
      <div className="bg-gray-50 rounded-2xl p-6 overflow-x-auto">
        <div className="min-w-fit mx-auto">
          {/* Aircraft Front */}
          <div className="text-center mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-white font-bold">
              ↑
            </div>
            <div className="text-xs text-gray-500 mt-1">Front of Aircraft</div>
          </div>

          {/* Seat Rows */}
          <div className="space-y-2">
            {seatMap.map((row: SeatInfo[], rowIndex: number) => (
              <div key={rowIndex} className="flex items-center justify-center gap-1">
                {/* Row Number */}
                <div className="w-8 text-center text-sm font-medium text-gray-600">
                  {rowIndex + 1}
                </div>

                {/* Seats */}
                <div className="flex gap-1">
                  {row.map((seat: SeatInfo, seatIndex: number) => (
                    <React.Fragment key={seat.seatNumber}>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleSeatClick(seat)}
                        onMouseEnter={() => setHoveredSeat(seat)}
                        onMouseLeave={() => setHoveredSeat(null)}
                        disabled={!seat.available}
                        className={`
                          w-8 h-8 rounded border-2 text-xs font-medium transition-all duration-200
                          flex items-center justify-center relative
                          ${getSeatColor(seat)}
                          ${selectedSeats.some(s => s.seatNumber === seat.seatNumber) ? 'ring-2 ring-blue-400' : ''}
                        `}
                        title={`${seat.seatNumber} - ${seat.type.replace('-', ' ')} - $${seat.price}`}
                      >
                        <span className="sr-only">{seat.seatNumber}</span>
                        <span className="text-xs">{getSeatIcon(seat)}</span>
                        
                        {/* Seat number overlay for selected seats */}
                        {selectedSeats.some(s => s.seatNumber === seat.seatNumber) && (
                          <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
                            {selectedSeats.findIndex(s => s.seatNumber === seat.seatNumber) + 1}
                          </div>
                        )}
                      </motion.button>

                      {/* Add aisle spacing */}
                      {config.aislePositions.includes(seatIndex + 1) && (
                        <div className="w-6"></div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Aircraft Rear */}
          <div className="text-center mt-4">
            <div className="text-xs text-gray-500 mb-1">Rear of Aircraft</div>
            <div className="w-8 h-8 bg-gray-400 rounded-full mx-auto flex items-center justify-center text-white font-bold">
              ↓
            </div>
          </div>
        </div>
      </div>

      {/* Hovered Seat Tooltip */}
      {hoveredSeat && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 border z-10 max-w-xs"
        >
          <div className="font-bold text-gray-900 mb-2">
            Seat {hoveredSeat.seatNumber}
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="capitalize font-medium">
                {hoveredSeat.type.replace('-', ' ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Position:</span>
              <span className="capitalize font-medium">{hoveredSeat.position}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Price:</span>
              <span className="font-bold text-blue-600">${hoveredSeat.price}</span>
            </div>
            {hoveredSeat.features.length > 0 && (
              <div>
                <div className="text-gray-600 mb-1">Features:</div>
                <div className="flex flex-wrap gap-1">
                  {hoveredSeat.features.map((feature: string, i: number) => (
                    <span
                      key={i}
                      className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Selection Status */}
      <div className="mt-6 text-center">
        <div className="text-sm text-gray-600">
          Selected {selectedSeats.length} of {maxSelections} seats
        </div>
        {selectedSeats.length < maxSelections && (
          <div className="text-xs text-blue-600 mt-1">
            Click on available seats to select
          </div>
        )}
      </div>
    </div>
  );
}