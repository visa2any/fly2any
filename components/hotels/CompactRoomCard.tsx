'use client';

import { Users, Utensils, Shield, X, BedDouble, Maximize2 } from 'lucide-react';

export interface CompactRoomCardProps {
  room: any;
  nights: number;
  currency: string;
  onSelect: () => void;
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
  },
  pt: {
    perNight: 'por noite',
    total: 'Total',
    guests: 'hóspedes',
    freeCancellation: 'Cancelamento Grátis',
    nonRefundable: 'Não reembolsável',
    select: 'Selecionar',
  },
  es: {
    perNight: 'por noche',
    total: 'Total',
    guests: 'huéspedes',
    freeCancellation: 'Cancelación Gratis',
    nonRefundable: 'No reembolsable',
    select: 'Seleccionar',
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
  lang = 'en',
}: CompactRoomCardProps) {
  const t = translations[lang];
  const currencySymbol = getCurrencySymbol(currency);

  const perNightPrice = parseFloat(room.totalPrice?.amount || '0') / nights;
  const totalPrice = parseFloat(room.totalPrice?.amount || '0');

  return (
    <div className="group relative bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-orange-400 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Room Image */}
      {room.images && room.images.length > 0 ? (
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
          <img
            src={room.images[0].url}
            alt={room.roomType}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white">
            <Maximize2 className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      ) : (
        <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <BedDouble className="w-12 h-12 text-gray-400" />
        </div>
      )}

      {/* Room Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Room Name */}
        <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2">
          {room.roomType}
        </h3>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-semibold border border-blue-200">
            <Users className="w-3 h-3" />
            {room.maxOccupancy} {t.guests}
          </div>
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded-md text-xs font-semibold border border-orange-200">
            <Utensils className="w-3 h-3" />
            {getBoardLabel(room.boardType)}
          </div>
          {room.refundable ? (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-semibold border border-green-200">
              <Shield className="w-3 h-3" />
              <span className="hidden sm:inline">{t.freeCancellation}</span>
              <span className="sm:hidden">Free</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-md text-xs font-semibold border border-red-200">
              <X className="w-3 h-3" />
              <span className="hidden sm:inline">{t.nonRefundable}</span>
              <span className="sm:hidden">Non-ref</span>
            </div>
          )}
        </div>

        {/* Description */}
        {room.description && (
          <p className="text-gray-600 text-xs leading-relaxed mb-3 line-clamp-2">
            {room.description}
          </p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price & CTA */}
        <div className="mt-auto pt-3 border-t border-gray-100">
          <div className="flex items-end justify-between mb-3">
            <div>
              <div className="text-gray-500 text-xs mb-0.5">From</div>
              <div className="flex items-baseline gap-1">
                <span className="font-black text-gray-900 text-2xl leading-none">
                  {currencySymbol}{Math.round(perNightPrice)}
                </span>
                <span className="text-gray-600 text-xs">/night</span>
              </div>
              <div className="text-gray-500 text-xs mt-0.5">
                {t.total}: <span className="font-bold text-gray-900">{currencySymbol}{Math.round(totalPrice).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onSelect}
            className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-lg hover:from-orange-600 hover:to-red-700 hover:shadow-lg hover:scale-105 active:scale-95 transition-all text-sm"
          >
            {t.select}
          </button>
        </div>
      </div>
    </div>
  );
}
