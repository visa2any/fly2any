'use client';

import { Users, Utensils, Shield, X, BedDouble, Maximize2, Coffee, Star, Sparkles, CheckCircle2 } from 'lucide-react';

export interface CompactRoomCardProps {
  room: any;
  nights: number;
  rooms?: number;  // Number of rooms for accurate per-room pricing
  currency: string;
  onSelect: () => void;
  isSelected?: boolean;
  lang?: 'en' | 'pt' | 'es';
}

const translations = {
  en: {
    perNight: 'per night',
    total: 'Total',
    guests: 'guests',
    freeCancellation: 'Free Cancellation',
    nonRefundable: 'Non-refundable',
    select: 'Select Room',
    selected: 'Selected',
  },
  pt: {
    perNight: 'por noite',
    total: 'Total',
    guests: 'hóspedes',
    freeCancellation: 'Cancelamento Grátis',
    nonRefundable: 'Não reembolsável',
    select: 'Selecionar',
    selected: 'Selecionado',
  },
  es: {
    perNight: 'por noche',
    total: 'Total',
    guests: 'huéspedes',
    freeCancellation: 'Cancelación Gratis',
    nonRefundable: 'No reembolsable',
    select: 'Seleccionar',
    selected: 'Seleccionado',
  },
};

const getBoardLabel = (boardType: string) => {
  const labels: Record<string, string> = {
    'RO': 'Room Only', 'BB': 'Breakfast', 'HB': 'Half Board', 'FB': 'Full Board',
    'AI': 'All Inclusive', 'BI': 'Breakfast', 'room_only': 'Room Only',
    'breakfast': 'Breakfast', 'half_board': 'Half Board', 'full_board': 'Full Board',
    'all_inclusive': 'All Inclusive',
  };
  return labels[boardType] || 'Room Only';
};

const getCurrencySymbol = (curr: string) => {
  const symbols: Record<string, string> = { 'USD': '$', 'EUR': '€', 'GBP': '£', 'BRL': 'R$' };
  return symbols[curr] || curr + ' ';
};

export function CompactRoomCard({
  room,
  nights,
  rooms = 1,  // Default to 1 room for backwards compatibility
  currency,
  onSelect,
  isSelected = false,
  lang = 'en',
}: CompactRoomCardProps) {
  const t = translations[lang];
  const currencySymbol = getCurrencySymbol(currency);

  // CRITICAL: LiteAPI totalPrice.amount is TOTAL for all rooms × all nights
  // Divide by BOTH nights AND rooms to get per-room-per-night price
  const totalPriceAll = parseFloat(room.totalPrice?.amount || '0');
  const perNightPrice = totalPriceAll / nights / (rooms || 1);
  const totalPrice = totalPriceAll; // Keep original for total display

  // Get bed type - now properly extracted from room name by API
  const bedType = room.bedType || 'Standard Bed';

  // Check if breakfast is included
  const hasBreakfast = room.boardType === 'BB' || room.boardType === 'breakfast' ||
                        room.boardType === 'HB' || room.boardType === 'half_board' ||
                        room.boardType === 'FB' || room.boardType === 'full_board' ||
                        room.boardType === 'AI' || room.boardType === 'all_inclusive';

  // Check if room has multiple rate options
  const hasMultipleOptions = room.rateOptions && room.rateOptions > 1;

  return (
    <div className={`group relative bg-white border rounded-lg overflow-hidden flex flex-col h-full transition-all ${
      isSelected ? 'border-[#E74035] ring-1 ring-[#E74035]/30' : 'border-gray-200 hover:border-[#E74035]/50'
    }`}>
      {/* Room Image - Ultra Compact */}
      {room.images && room.images.length > 0 ? (
        <div className="relative h-20 sm:h-28 overflow-hidden bg-gray-100">
          <img src={room.images[0].url} alt={room.roomType}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-white/90 rounded text-[9px] font-bold text-gray-700">
            <BedDouble className="w-2.5 h-2.5 inline mr-0.5 text-[#E74035]" />{bedType.substring(0, 10)}
          </div>
          {hasMultipleOptions && (
            <div className="absolute top-1 left-1 px-1 py-0.5 bg-[#E74035] rounded text-[8px] font-bold text-white">
              {room.rateOptions} opts
            </div>
          )}
        </div>
      ) : (
        <div className="relative h-20 sm:h-28 bg-gray-50 flex items-center justify-center">
          <BedDouble className="w-8 h-8 text-gray-200" />
          <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-white rounded text-[9px] font-bold text-gray-700">
            {bedType.substring(0, 10)}
          </div>
        </div>
      )}

      {/* Room Content - Ultra Compact */}
      <div className="flex flex-col flex-1 p-2">
        {/* Room Name */}
        <h3 className="font-bold text-gray-800 text-[11px] sm:text-xs mb-1 line-clamp-2 leading-tight">
          {room.roomType}
        </h3>

        {/* Features Row - Ultra Compact */}
        <div className="flex flex-wrap gap-1 mb-1.5">
          <span className="px-1 py-0.5 bg-gray-100 rounded text-[8px] font-medium text-gray-600">
            {room.maxOccupancy}👤
          </span>
          <span className={`px-1 py-0.5 rounded text-[8px] font-medium ${
            hasBreakfast ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
          }`}>
            {hasBreakfast ? '🍳' : 'RO'}
          </span>
          <span className={`px-1 py-0.5 rounded text-[8px] font-bold ${
            room.refundable ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
          }`}>
            {room.refundable ? '✓Free' : 'NR'}
          </span>
        </div>

        {/* Price + CTA */}
        <div className="mt-auto pt-1.5 border-t border-gray-100">
          <div className="flex items-center justify-between mb-1.5">
            <div>
              <span className="font-black text-gray-900 text-sm">{currencySymbol}{Math.round(perNightPrice)}</span>
              <span className="text-[9px] text-gray-400">/nt</span>
              <p className="text-[8px] text-gray-400">{currencySymbol}{Math.round(totalPrice)} total</p>
            </div>
          </div>
          <button onClick={onSelect}
            className={`w-full py-1.5 font-bold rounded text-[10px] transition-all ${
              isSelected ? 'bg-green-500 text-white' : 'bg-[#E74035] text-white active:scale-95'
            }`}>
            {isSelected ? '✓ Selected' : 'Select'}
          </button>
        </div>
      </div>
    </div>
  );
}
