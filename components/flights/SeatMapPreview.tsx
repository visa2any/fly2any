'use client';

/**
 * Seat Map Preview Component
 *
 * Displays an interactive seat map with:
 * - Color-coded seat availability
 * - Legroom ratings
 * - Seat quality indicators
 * - Interactive seat selection
 *
 * @module components/flights/SeatMapPreview
 */

import React, { useState } from 'react';
import { Check, X, Info, User, Plane } from 'lucide-react';

export interface SeatMapPreviewProps {
  flightId: string;
  aircraftType?: string;
  cabinClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  onSeatSelect?: (seatNumber: string) => void;
  lang?: 'en' | 'pt' | 'es';
}

interface Seat {
  number: string;
  row: number;
  column: string;
  status: 'available' | 'occupied' | 'selected' | 'premium' | 'exit';
  price?: number;
  legroom?: 'standard' | 'extra' | 'limited';
  features?: string[];
}

const TRANSLATIONS = {
  en: {
    title: 'Seat Map Preview',
    subtitle: 'Select your preferred seat',
    available: 'Available',
    occupied: 'Occupied',
    selected: 'Selected',
    premium: 'Premium',
    exitRow: 'Exit Row',
    standardLegroom: 'Standard Legroom',
    extraLegroom: 'Extra Legroom',
    limitedLegroom: 'Limited Legroom',
    selectSeat: 'Select Seat',
    removeSeat: 'Remove',
    seatNumber: 'Seat #',
    free: 'Included',
    priceLabel: 'Seat Selection',
    front: 'Front',
    back: 'Back',
    wing: 'Wing',
    legend: 'Legend',
    close: 'Close',
  },
  pt: {
    title: 'Mapa de Assentos',
    subtitle: 'Selecione seu assento preferido',
    available: 'Disponível',
    occupied: 'Ocupado',
    selected: 'Selecionado',
    premium: 'Premium',
    exitRow: 'Saída de Emergência',
    standardLegroom: 'Espaço Padrão',
    extraLegroom: 'Espaço Extra',
    limitedLegroom: 'Espaço Limitado',
    selectSeat: 'Selecionar Assento',
    removeSeat: 'Remover',
    seatNumber: 'Assento #',
    free: 'Incluído',
    priceLabel: 'Seleção de Assento',
    front: 'Frente',
    back: 'Traseiro',
    wing: 'Asa',
    legend: 'Legenda',
    close: 'Fechar',
  },
  es: {
    title: 'Mapa de Asientos',
    subtitle: 'Seleccione su asiento preferido',
    available: 'Disponible',
    occupied: 'Ocupado',
    selected: 'Seleccionado',
    premium: 'Premium',
    exitRow: 'Fila de Salida',
    standardLegroom: 'Espacio Estándar',
    extraLegroom: 'Espacio Extra',
    limitedLegroom: 'Espacio Limitado',
    selectSeat: 'Seleccionar Asiento',
    removeSeat: 'Quitar',
    seatNumber: 'Asiento #',
    free: 'Incluido',
    priceLabel: 'Selección de Asiento',
    front: 'Adelante',
    back: 'Atrás',
    wing: 'Ala',
    legend: 'Leyenda',
    close: 'Cerrar',
  },
};

// Generate mock seat map data
const generateMockSeatMap = (cabinClass: string = 'ECONOMY'): Seat[] => {
  const seats: Seat[] = [];
  const rows = cabinClass === 'BUSINESS' || cabinClass === 'FIRST' ? 8 : 30;
  const columns = cabinClass === 'BUSINESS' || cabinClass === 'FIRST' ? ['A', 'C', 'D', 'F'] : ['A', 'B', 'C', 'D', 'E', 'F'];

  for (let row = 1; row <= rows; row++) {
    for (const column of columns) {
      const seatNumber = `${row}${column}`;
      const isOccupied = Math.random() > 0.6; // 40% occupied
      const isPremium = row <= 3 || (row >= 12 && row <= 14); // First 3 rows or exit rows
      const isExitRow = row === 12 || row === 13;

      let price = 0;
      if (!isOccupied) {
        if (isPremium || isExitRow) price = Math.round(15 + Math.random() * 35); // $15-$50
        else price = 0; // Free standard seats
      }

      let legroom: 'standard' | 'extra' | 'limited' = 'standard';
      if (isExitRow) legroom = 'extra';
      else if (row === rows) legroom = 'limited'; // Last row

      seats.push({
        number: seatNumber,
        row,
        column,
        status: isOccupied ? 'occupied' : (isPremium && !isExitRow ? 'premium' : (isExitRow ? 'exit' : 'available')),
        price,
        legroom,
        features: isExitRow ? ['Extra Legroom', 'Must assist in emergency'] : isPremium ? ['Priority Boarding', 'Extra Recline'] : [],
      });
    }
  }

  return seats;
};

export default function SeatMapPreview({
  flightId,
  aircraftType = 'Boeing 737',
  cabinClass = 'ECONOMY',
  onSeatSelect,
  lang = 'en',
}: SeatMapPreviewProps) {
  const t = TRANSLATIONS[lang];
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [seats] = useState<Seat[]>(generateMockSeatMap(cabinClass));
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'occupied') return;

    const newSelection = selectedSeat === seat.number ? null : seat.number;
    setSelectedSeat(newSelection);

    if (onSeatSelect && newSelection) {
      onSeatSelect(newSelection);
    }
  };

  const getSeatColor = (seat: Seat): string => {
    if (selectedSeat === seat.number) return 'bg-blue-600 text-white border-blue-700';

    switch (seat.status) {
      case 'available':
        return 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200 cursor-pointer';
      case 'occupied':
        return 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed';
      case 'premium':
        return 'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200 cursor-pointer';
      case 'exit':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200 cursor-pointer';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const getLegrooomIcon = (legroom: string): string => {
    switch (legroom) {
      case 'extra': return '✨';
      case 'limited': return '⚠️';
      default: return '';
    }
  };

  const selectedSeatDetails = selectedSeat ? seats.find(s => s.number === selectedSeat) : null;

  // Group seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<number, Seat[]>);

  const rows = Object.keys(seatsByRow).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div className="w-full">
      {/* Collapsed Preview */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl hover:from-indigo-100 hover:to-purple-100 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 rounded-lg p-2">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-indigo-900 text-sm">{t.title}</h4>
                <p className="text-xs text-indigo-700">{aircraftType} • {t.selectSeat}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-indigo-600 font-semibold">Preview Seats →</span>
            </div>
          </div>
        </button>
      )}

      {/* Expanded Seat Map */}
      {isExpanded && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <div>
              <h3 className="font-bold text-gray-900">{t.title}</h3>
              <p className="text-sm text-gray-600">{aircraftType}</p>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {t.close} ✕
            </button>
          </div>

          {/* Seat Map */}
          <div className="relative bg-gradient-to-b from-blue-50 to-white rounded-lg p-4 overflow-x-auto">
            {/* Front of Plane Indicator */}
            <div className="flex justify-center mb-3">
              <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-semibold">
                ✈️ {t.front}
              </div>
            </div>

            {/* Seat Grid */}
            <div className="space-y-1.5">
              {rows.map((row) => {
                const rowSeats = seatsByRow[parseInt(row)];
                const isExitRow = rowSeats.some(s => s.status === 'exit');

                return (
                  <div key={row} className="flex items-center gap-2">
                    {/* Row Number */}
                    <div className="w-8 text-center font-semibold text-gray-600 text-sm">
                      {row}
                    </div>

                    {/* Seats */}
                    <div className="flex gap-1.5 flex-1 justify-center">
                      {rowSeats.map((seat, idx) => (
                        <React.Fragment key={seat.number}>
                          {/* Aisle gap */}
                          {(cabinClass === 'ECONOMY' && seat.column === 'D') && (
                            <div className="w-8"></div>
                          )}
                          {(cabinClass !== 'ECONOMY' && seat.column === 'D') && (
                            <div className="w-6"></div>
                          )}

                          {/* Seat */}
                          <button
                            onClick={() => handleSeatClick(seat)}
                            disabled={seat.status === 'occupied'}
                            className={`
                              w-9 h-9 rounded border-2 text-xs font-semibold transition-all flex items-center justify-center
                              ${getSeatColor(seat)}
                            `}
                            title={`${seat.number} - ${seat.status} ${seat.price ? `($${seat.price})` : ''}`}
                          >
                            {seat.status === 'occupied' ? (
                              <User className="w-3.5 h-3.5" />
                            ) : selectedSeat === seat.number ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <span className="opacity-70">{getLegrooomIcon(seat.legroom || '')}</span>
                            )}
                          </button>
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Exit Row Indicator */}
                    {isExitRow && (
                      <div className="ml-2 text-xs font-semibold text-yellow-700 bg-yellow-50 px-2 py-1 rounded">
                        EXIT
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Back of Plane Indicator */}
            <div className="flex justify-center mt-3">
              <div className="bg-gray-400 text-white px-4 py-1 rounded-full text-xs font-semibold">
                {t.back}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 text-sm mb-2">{t.legend}</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-100 border-2 border-green-300 rounded"></div>
                <span>{t.available}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gray-200 border-2 border-gray-300 rounded flex items-center justify-center">
                  <User className="w-3 h-3 text-gray-400" />
                </div>
                <span>{t.occupied}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-600 border-2 border-blue-700 rounded flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span>{t.selected}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-purple-100 border-2 border-purple-300 rounded"></div>
                <span>{t.premium}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-yellow-100 border-2 border-yellow-300 rounded flex items-center justify-center">
                  <span>✨</span>
                </div>
                <span>{t.exitRow}</span>
              </div>
            </div>
          </div>

          {/* Selected Seat Details */}
          {selectedSeatDetails && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-bold text-blue-900 mb-2">
                    {t.seatNumber}{selectedSeatDetails.number}
                  </h4>
                  <div className="space-y-1 text-sm text-blue-800">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>
                        {selectedSeatDetails.legroom === 'extra' ? t.extraLegroom :
                         selectedSeatDetails.legroom === 'limited' ? t.limitedLegroom :
                         t.standardLegroom}
                      </span>
                    </div>
                    {selectedSeatDetails.features && selectedSeatDetails.features.length > 0 && (
                      selectedSeatDetails.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Info className="w-4 h-4" />
                          <span>{feature}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-900">
                    {selectedSeatDetails.price ? `$${selectedSeatDetails.price}` : t.free}
                  </div>
                  <button
                    onClick={() => setSelectedSeat(null)}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    {t.removeSeat}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
