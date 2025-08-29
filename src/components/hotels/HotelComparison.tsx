'use client';
import React from 'react';

/**
 * Hotel Comparison Component
 * Permite comparar até 3 hotéis lado a lado
 */

import { X, Star, MapPin, Wifi, Car, Utensils, Waves, Coffee, Dumbbell, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import type { Hotel } from '@/types/hotels';

interface HotelComparisonProps {
  hotels: Hotel[];
  onRemove: (hotelId: string) => void;
  onClose: () => void;
  onSelectHotel: (hotel: Hotel) => void;
}

const AMENITY_ICONS: Record<string, any> = {
  'wifi': Wifi,
  'parking': Car,
  'restaurant': Utensils,
  'pool': Waves,
  'breakfast': Coffee,
  'gym': Dumbbell,
};

export default function HotelComparison({ hotels, onRemove, onClose, onSelectHotel }: HotelComparisonProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star 
        key={index} 
        size={16} 
        className={index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} 
      />
    ));
  };

  const renderAmenityIcon = (amenityId: string) => {
    const IconComponent = AMENITY_ICONS[amenityId] || Wifi;
    return <IconComponent size={16} className="text-blue-600" />;
  };

  if (hotels.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            🆚 Comparação de Hotéis ({hotels.length}/3)
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Comparison Table */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <div key={hotel.id} className="bg-gray-50 rounded-xl p-6 relative">
                {/* Remove button */}
                <button
                  onClick={() => onRemove(hotel.id)}
                  className="absolute top-4 right-4 p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>

                {/* Hotel Image */}
                {hotel.images && hotel.images[0] && (
                  <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                    <Image
                      src={hotel.images[0].url}
                      alt={hotel.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Hotel Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{hotel.name}</h3>
                    <div className="flex gap-1 mb-2">
                      {renderStars(hotel.starRating || 0)}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                      <MapPin size={14} />
                      <span>{hotel.location.address.city}, {hotel.location.address.country}</span>
                    </div>
                  </div>

                  {/* Rating */}
                  {hotel.guestRating && (
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-blue-600">{hotel.guestRating.toFixed(1)}</div>
                      <div>
                        <span className="block font-semibold text-gray-900">Muito Bom</span>
                        {hotel.reviewCount && (
                          <span className="block text-sm text-gray-600">({hotel.reviewCount} avaliações)</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Price */}
                  {hotel.lowestRate && (
                    <div className="bg-white p-4 rounded-lg">
                      <span className="block text-sm text-gray-600 mb-1">A partir de</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm text-gray-600">{hotel.lowestRate.currency}</span>
                        <span className="text-2xl font-bold text-blue-600">{hotel.lowestRate.amount}</span>
                        <span className="text-sm text-gray-600">por noite</span>
                      </div>
                    </div>
                  )}

                  {/* Amenities */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Comodidades</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {hotel.amenities.slice(0, 6).map((amenity, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                          {renderAmenityIcon(amenity.id)}
                          <span>{amenity.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Room Count */}
                  {hotel.rates && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Quartos Disponíveis</h4>
                      <span className="text-lg font-bold text-green-600">{hotel.rates.length} tipos</span>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => onSelectHotel(hotel)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Ver Detalhes
                    <ExternalLink size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add more hotels hint */}
          {hotels.length < 3 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-blue-700">
                💡 Você pode comparar até {3 - hotels.length} hotéis adicionais. 
                Clique em "Comparar" nos resultados da busca para adicionar mais hotéis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}