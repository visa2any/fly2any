'use client';

/**
 * Hotel Map Component
 * Exibe mapa interativo com localização do hotel e pontos de interesse
 */

import { useState } from 'react';
import { MapPin, Navigation, Clock, Star, ExternalLink } from 'lucide-react';
import type { Hotel } from '@/types/hotels';

interface HotelMapProps {
  hotel: Hotel;
  className?: string;
}

// Pontos de interesse mockados baseados na localização
const generateNearbyPlaces = (hotel: Hotel) => {
  const baseCoords = hotel.location.coordinates;
  
  const places = [
    {
      id: '1',
      name: 'Restaurante Gourmet',
      category: 'restaurant',
      distance: '200m',
      rating: 4.5,
      description: 'Culinária internacional',
      coordinates: { lat: baseCoords.latitude + 0.002, lng: baseCoords.longitude + 0.001 }
    },
    {
      id: '2', 
      name: 'Shopping Center',
      category: 'shopping',
      distance: '500m',
      rating: 4.2,
      description: 'Centro comercial',
      coordinates: { lat: baseCoords.latitude - 0.003, lng: baseCoords.longitude + 0.002 }
    },
    {
      id: '3',
      name: 'Praia Principal',
      category: 'beach',
      distance: '300m',
      rating: 4.8,
      description: 'Praia urbana',
      coordinates: { lat: baseCoords.latitude + 0.001, lng: baseCoords.longitude - 0.002 }
    },
    {
      id: '4',
      name: 'Estação Metrô',
      category: 'transport',
      distance: '150m',
      rating: 4.0,
      description: 'Transporte público',
      coordinates: { lat: baseCoords.latitude - 0.001, lng: baseCoords.longitude - 0.001 }
    }
  ];
  
  return places;
};

const CATEGORY_ICONS: Record<string, string> = {
  restaurant: '🍽️',
  shopping: '🛍️',
  beach: '🏖️',
  transport: '🚇',
  attraction: '🎯',
  hospital: '🏥',
  bank: '🏦'
};

export default function HotelMap({ hotel, className = '' }: HotelMapProps) {
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const nearbyPlaces = generateNearbyPlaces(hotel);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star 
        key={index} 
        size={12} 
        className={index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} 
      />
    ));
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-2xl p-4 lg:p-6 shadow-sm w-full overflow-hidden ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Localização & Arredores</h3>
        
        {/* Endereço principal */}
        <div className="flex items-start gap-3 mb-6 p-3 lg:p-4 bg-blue-50 rounded-xl">
          <MapPin size={20} className="text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-gray-900 mb-1 text-sm lg:text-base break-words">{hotel.name}</h4>
            <p className="text-gray-700 text-sm break-words">
              {hotel.location.address.street && `${hotel.location.address.street}, `}
              {hotel.location.address.city}, {hotel.location.address.country}
            </p>
            {hotel.location.address.postal_code && (
              <p className="text-sm text-gray-600">CEP: {hotel.location.address.postal_code}</p>
            )}
          </div>
        </div>
      </div>

      {/* Mapa simulado */}
      <div className="relative bg-gray-100 rounded-xl overflow-hidden mb-6" style={{ height: '300px' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100">
          {/* Simulação visual de mapa */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" viewBox="0 0 400 300">
              {/* Ruas simuladas */}
              <line x1="0" y1="100" x2="400" y2="100" stroke="#666" strokeWidth="2" />
              <line x1="0" y1="200" x2="400" y2="200" stroke="#666" strokeWidth="2" />
              <line x1="100" y1="0" x2="100" y2="300" stroke="#666" strokeWidth="2" />
              <line x1="250" y1="0" x2="250" y2="300" stroke="#666" strokeWidth="2" />
              
              {/* Quadras simuladas */}
              <rect x="20" y="20" width="60" height="60" fill="#e5e7eb" stroke="#9ca3af" />
              <rect x="120" y="120" width="100" height="60" fill="#e5e7eb" stroke="#9ca3af" />
              <rect x="280" y="40" width="80" height="80" fill="#ddd6fe" stroke="#8b5cf6" />
            </svg>
          </div>
          
          {/* Pin do hotel */}
          <div 
            className="absolute bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-full animate-bounce"
            style={{ left: '50%', top: '50%' }}
          >
            🏨
          </div>
          
          {/* Pins dos pontos de interesse */}
          {nearbyPlaces.map((place, index) => (
            <div
              key={place.id}
              className="absolute bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md cursor-pointer hover:scale-110 transition-transform"
              style={{ 
                left: `${30 + (index * 15)}%`, 
                top: `${40 + (index % 2 * 20)}%` 
              }}
              onClick={() => setSelectedPlace(selectedPlace === place.id ? null : place.id)}
            >
              {index + 1}
            </div>
          ))}
        </div>
        
        {/* Controles do mapa */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors">
            <Navigation size={16} className="text-gray-600" />
          </button>
          <button className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors">
            <ExternalLink size={16} className="text-gray-600" />
          </button>
        </div>
        
        {/* Indicador de escala */}
        <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-lg shadow-md">
          <span className="text-xs text-gray-600">500m</span>
        </div>
      </div>

      {/* Lista de pontos de interesse */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 mb-4">Pontos de Interesse Próximos</h4>
        
        {nearbyPlaces.map((place, index) => (
          <div 
            key={place.id}
            className={`p-4 border rounded-xl cursor-pointer transition-all ${
              selectedPlace === place.id 
                ? 'border-blue-600 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedPlace(selectedPlace === place.id ? null : place.id)}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">{index + 1}</span>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span>{CATEGORY_ICONS[place.category] || '📍'}</span>
                  <h5 className="font-semibold text-gray-900">{place.name}</h5>
                  <div className="flex gap-1">
                    {renderStars(Math.floor(place.rating))}
                  </div>
                  <span className="text-sm text-gray-600">({place.rating})</span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Navigation size={12} />
                    <span>{place.distance}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{Math.ceil(parseInt(place.distance) / 80)} min a pé</span>
                  </div>
                  <span>{place.description}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Botão para abrir em app de mapas */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <ExternalLink size={16} />
          Abrir no Google Maps
        </button>
      </div>
    </div>
  );
}