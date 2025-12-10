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
    <div className="group relative bg-white border border-slate-200 sm:border-2 rounded-xl sm:rounded-2xl overflow-hidden hover:border-primary-400 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Room Image with Premium Overlay - Compact on mobile */}
      {room.images && room.images.length > 0 ? (
        <div className="relative h-28 sm:h-40 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
          <img
            src={room.images[0].url}
            alt={room.roomType}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Bed Type Badge on Image - Smaller on mobile */}
          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-white/95 backdrop-blur-sm rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold text-slate-800 shadow-lg">
            <BedDouble className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-primary-500" />
            <span className="line-clamp-1">{bedType}</span>
          </div>

          {/* Multiple Options Badge */}
          {hasMultipleOptions && (
            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold text-white shadow-lg">
              <Sparkles className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
              {room.rateOptions}
            </div>
          )}

          <button className="absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2 bg-white/90 rounded-md sm:rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-lg">
            <Maximize2 className="w-3 sm:w-4 h-3 sm:h-4 text-slate-700" />
          </button>
        </div>
      ) : (
        <div className="relative h-28 sm:h-40 bg-gradient-to-br from-slate-100 to-primary-50 flex items-center justify-center">
          <BedDouble className="w-10 sm:w-12 h-10 sm:h-12 text-slate-300" />
          {/* Bed Type Badge even without image - Smaller on mobile */}
          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-white/95 backdrop-blur-sm rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold text-slate-800 shadow-lg">
            <BedDouble className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-primary-500" />
            <span className="line-clamp-1">{bedType}</span>
          </div>
        </div>
      )}

      {/* Room Content - Compact on mobile */}
      <div className="flex flex-col flex-1 p-2.5 sm:p-4">
        {/* Room Name */}
        <h3 className="font-bold text-slate-800 text-xs sm:text-sm mb-1.5 sm:mb-2 line-clamp-2 leading-tight">
          {room.roomType}
        </h3>

        {/* Key Features - Compact Grid - Very compact on mobile */}
        <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2 sm:mb-3">
          {/* Guests */}
          <div className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-slate-100 text-slate-700 rounded text-[10px] sm:text-xs font-semibold">
            <Users className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
            {room.maxOccupancy}
          </div>

          {/* Meal Plan with Color Coding */}
          <div className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-semibold ${
            hasBreakfast
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-slate-50 text-slate-600 border border-slate-200'
          }`}>
            {hasBreakfast ? <Coffee className="w-2.5 sm:w-3 h-2.5 sm:h-3" /> : <Utensils className="w-2.5 sm:w-3 h-2.5 sm:h-3" />}
            <span className="hidden sm:inline">{getBoardLabel(room.boardType)}</span>
            <span className="sm:hidden">{hasBreakfast ? 'BF' : 'RO'}</span>
          </div>

          {/* Refundable Status */}
          {room.refundable ? (
            <div className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-emerald-50 text-emerald-700 rounded text-[10px] sm:text-xs font-bold border border-emerald-200">
              <Shield className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
              <span className="hidden sm:inline">Free</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-50 text-red-600 rounded text-[10px] sm:text-xs font-semibold border border-red-200">
              <X className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
              <span className="hidden sm:inline">NR</span>
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price & CTA - Premium Styled - Compact on mobile */}
        <div className="mt-auto pt-2 sm:pt-3 border-t border-slate-100">
          <div className="flex items-end justify-between mb-2 sm:mb-3">
            <div>
              <div className="text-slate-500 text-[10px] sm:text-xs mb-0.5">From</div>
              <div className="flex items-baseline gap-0.5 sm:gap-1">
                <span className="font-black text-slate-900 text-base sm:text-xl leading-none">
                  {currencySymbol}{Math.round(perNightPrice)}
                </span>
                <span className="text-slate-500 text-[9px] sm:text-xs">/nt</span>
              </div>
              <div className="text-slate-500 text-[9px] sm:text-xs mt-0.5">
                <span className="font-bold text-slate-800">{currencySymbol}{Math.round(totalPrice).toLocaleString()}</span> total
              </div>
            </div>
          </div>

          <button
            onClick={onSelect}
            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 font-bold rounded-lg sm:rounded-xl transition-all text-xs sm:text-sm shadow-md flex items-center justify-center gap-1.5 sm:gap-2 ${
              isSelected
                ? 'bg-green-500 text-white ring-2 ring-green-600 ring-offset-1'
                : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 hover:shadow-lg hover:scale-[1.02] active:scale-95'
            }`}
          >
            {isSelected && <CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />}
            {isSelected ? t.selected : t.select}
          </button>
        </div>
      </div>
    </div>
  );
}
