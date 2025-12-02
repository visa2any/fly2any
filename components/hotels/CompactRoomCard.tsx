'use client';

import { Users, Utensils, Shield, X, BedDouble, Maximize2, Coffee, Star, Sparkles, CheckCircle2 } from 'lucide-react';

export interface CompactRoomCardProps {
  room: any;
  nights: number;
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
  currency,
  onSelect,
  isSelected = false,
  lang = 'en',
}: CompactRoomCardProps) {
  const t = translations[lang];
  const currencySymbol = getCurrencySymbol(currency);

  const perNightPrice = parseFloat(room.totalPrice?.amount || '0') / nights;
  const totalPrice = parseFloat(room.totalPrice?.amount || '0');

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
    <div className="group relative bg-white border-2 border-slate-200 rounded-2xl overflow-hidden hover:border-orange-400 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Room Image with Premium Overlay */}
      {room.images && room.images.length > 0 ? (
        <div className="relative h-40 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
          <img
            src={room.images[0].url}
            alt={room.roomType}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Bed Type Badge on Image */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-lg text-xs font-bold text-slate-800 shadow-lg">
            <BedDouble className="w-3.5 h-3.5 text-orange-500" />
            {bedType}
          </div>

          {/* Multiple Options Badge */}
          {hasMultipleOptions && (
            <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg text-xs font-bold text-white shadow-lg">
              <Sparkles className="w-3 h-3" />
              {room.rateOptions} options
            </div>
          )}

          <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-lg">
            <Maximize2 className="w-4 h-4 text-slate-700" />
          </button>
        </div>
      ) : (
        <div className="relative h-40 bg-gradient-to-br from-slate-100 to-orange-50 flex items-center justify-center">
          <BedDouble className="w-12 h-12 text-slate-300" />
          {/* Bed Type Badge even without image */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-lg text-xs font-bold text-slate-800 shadow-lg">
            <BedDouble className="w-3.5 h-3.5 text-orange-500" />
            {bedType}
          </div>
        </div>
      )}

      {/* Room Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Room Name */}
        <h3 className="font-bold text-slate-800 text-sm mb-2 line-clamp-2 leading-tight">
          {room.roomType}
        </h3>

        {/* Key Features - Compact Grid */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {/* Guests */}
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold">
            <Users className="w-3 h-3" />
            {room.maxOccupancy}
          </div>

          {/* Meal Plan with Color Coding */}
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${
            hasBreakfast
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-slate-50 text-slate-600 border border-slate-200'
          }`}>
            {hasBreakfast ? <Coffee className="w-3 h-3" /> : <Utensils className="w-3 h-3" />}
            <span className="hidden sm:inline">{getBoardLabel(room.boardType)}</span>
            <span className="sm:hidden">{hasBreakfast ? 'Breakfast' : 'Room'}</span>
          </div>

          {/* Refundable Status */}
          {room.refundable ? (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-bold border border-emerald-200">
              <Shield className="w-3 h-3" />
              <span className="hidden lg:inline">Free Cancel</span>
              <span className="lg:hidden">Free</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-md text-xs font-semibold border border-red-200">
              <X className="w-3 h-3" />
              <span className="hidden lg:inline">Non-refund</span>
              <span className="lg:hidden">NR</span>
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price & CTA - Premium Styled */}
        <div className="mt-auto pt-3 border-t border-slate-100">
          <div className="flex items-end justify-between mb-3">
            <div>
              <div className="text-slate-500 text-xs mb-0.5">From</div>
              <div className="flex items-baseline gap-1">
                <span className="font-black text-slate-900 text-xl leading-none">
                  {currencySymbol}{Math.round(perNightPrice)}
                </span>
                <span className="text-slate-500 text-xs">/night</span>
              </div>
              <div className="text-slate-500 text-xs mt-0.5">
                {nights} nights: <span className="font-bold text-slate-800">{currencySymbol}{Math.round(totalPrice).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onSelect}
            className={`w-full px-4 py-2.5 font-bold rounded-xl transition-all text-sm shadow-md flex items-center justify-center gap-2 ${
              isSelected
                ? 'bg-green-500 text-white ring-2 ring-green-600 ring-offset-1'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 hover:shadow-lg hover:scale-[1.02] active:scale-95'
            }`}
          >
            {isSelected && <CheckCircle2 className="w-4 h-4" />}
            {isSelected ? t.selected : t.select}
          </button>
        </div>
      </div>
    </div>
  );
}
