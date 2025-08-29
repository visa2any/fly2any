/**
 * Componente de card de hotel para exibir resultados de busca
 * Suporta diferentes variantes: default, compact, detailed
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { 
  Star, 
  MapPin, 
  Wifi, 
  Car, 
  Coffee, 
  Heart,
  Shield,
  Clock,
  Users,
  Bed
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import type { HotelCardProps } from '../../types/hotels';

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'wifi': Wifi,
  'parking': Car,
  'breakfast': Coffee,
  'gym': Users,
  'pool': Users, // Placeholder
};

export default function HotelCard({
  hotel,
  onSelect,
  variant = 'default'
}: HotelCardProps) {
  const [isLiked, setIsLiked] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  const handleSelect = () => {
    onSelect?.(hotel);
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  // Renderizar estrelas de rating
  const renderStars = (rating: number, className = '') => {
    return (
      <div className={`flex items-center ${className}`}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < Math.floor(rating)
                ? 'text-yellow-400 fill-current'
                : i < rating
                ? 'text-yellow-400 fill-current opacity-50'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // Renderizar facilidades principais
  const renderAmenities = (amenities: any[], limit = 3) => {
    const mainAmenities = amenities.slice(0, limit);
    
    return (
      <div className="flex flex-wrap gap-1">
        {mainAmenities.map((amenity, index) => {
          const amenityName = typeof amenity === 'string' ? amenity : amenity.name || amenity.id || '';
          const IconComponent = amenityIcons[amenityName.toLowerCase()] || Wifi;
          return (
            <div key={index} className="flex items-center gap-1 text-xs text-gray-600">
              <IconComponent className="w-3 h-3" />
              <span className="hidden sm:inline">{amenityName}</span>
            </div>
          );
        })}
        {amenities.length > limit && (
          <span className="text-xs text-gray-500">
            +{amenities.length - limit} mais
          </span>
        )}
      </div>
    );
  };

  // Variante compacta
  if (variant === 'compact') {
    return (
      <div className="cursor-pointer" onClick={handleSelect}>
        <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex gap-3">
          {/* Imagem */}
          <div className="relative w-20 h-20 flex-shrink-0">
            <Image
              src={imageError ? '/images/hotel-placeholder.jpg' : (hotel.image || hotel.images?.[0]?.url || '/images/hotel-placeholder.jpg')}
              alt={hotel.name}
              fill
              className="object-cover rounded"
              onError={() => setImageError(true)}
            />
          </div>

          {/* Informações */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">{hotel.name}</h3>
                <div className="flex items-center gap-1 mt-1">
                  {hotel.starRating && renderStars(hotel.starRating, 'text-xs')}
                  {hotel.rating?.average && (
                    <span className="text-xs text-gray-600 ml-1">
                      {hotel.rating.average.toFixed(1)} ({hotel.rating.count || hotel.reviewCount || 0})
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate mt-1">{hotel.location?.address?.city || ''}</p>
              </div>

              <div className="text-right ml-2">
                <div className="text-lg font-bold text-blue-600">
                  {(hotel.price?.amount || hotel.min_rate?.amount || 0).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: hotel.price?.currency || hotel.min_rate?.currency || 'BRL'
                  })}
                </div>
                <div className="text-xs text-gray-500">{hotel.price?.period || 'por noite'}</div>
              </div>
            </div>
          </div>
        </div>
        </Card>
      </div>
    );
  }

  // Variante detalhada
  if (variant === 'detailed') {
    return (
      <div className="cursor-pointer" onClick={handleSelect}>
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* Imagem */}
        <div className="relative h-64">
          <Image
            src={imageError ? '/images/hotel-placeholder.jpg' : (hotel.image || hotel.images?.[0]?.url || '/images/hotel-placeholder.jpg')}
            alt={hotel.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
          
          {/* Overlay com badges */}
          <div className="absolute top-3 left-3">
            {hotel.freeCancellation && (
              <Badge variant="secondary" className="bg-green-500 text-white">
                <Shield className="w-3 h-3 mr-1" />
                Cancelamento gratuito
              </Badge>
            )}
          </div>

          {/* Botão de like */}
          <button
            onClick={toggleLike}
            className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
              isLiked ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>

          {/* Distância (se disponível) */}
          {hotel.distance && (
            <div className="absolute bottom-3 left-3">
              <Badge variant="secondary" className="bg-black bg-opacity-60 text-white">
                <MapPin className="w-3 h-3 mr-1" />
                {hotel.distance}
              </Badge>
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{hotel.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                {hotel.starRating && (
                  <div className="flex items-center">
                    {renderStars(hotel.starRating)}
                  </div>
                )}
                {hotel.rating?.average && (
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      {hotel.rating.average.toFixed(1)}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      ({hotel.rating.count || hotel.reviewCount || 0} avaliações)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Localização */}
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{hotel.location?.address?.city || ''}</span>
          </div>

          {/* Facilidades */}
          <div className="mb-4">
            {renderAmenities(hotel.amenities || [], 4)}
          </div>

          {/* Preço e ação */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {(hotel.price?.amount || hotel.min_rate?.amount || 0).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: hotel.price?.currency || hotel.min_rate?.currency || 'BRL'
                })}
              </div>
              <div className="text-sm text-gray-500">{hotel.price?.period || 'por noite'}</div>
            </div>

            <Button className="ml-4">
              Ver detalhes
            </Button>
          </div>

          {/* Informações extras */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t text-xs text-gray-500">
            {hotel.freeCancellation && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Cancelamento gratuito</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Bed className="w-3 h-3" />
              <span>Disponibilidade limitada</span>
            </div>
          </div>
        </div>
        </Card>
      </div>
    );
  }

  // Variante padrão
  return (
    <div className="cursor-pointer" onClick={handleSelect}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex">
        {/* Imagem */}
        <div className="relative w-48 h-32 flex-shrink-0">
          <Image
            src={imageError ? '/images/hotel-placeholder.jpg' : (hotel.image || hotel.images?.[0]?.url || '/images/hotel-placeholder.jpg')}
            alt={hotel.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
          
          {/* Badges sobre a imagem */}
          <div className="absolute top-2 left-2">
            {hotel.freeCancellation && (
              <Badge variant="secondary" className="bg-green-500 text-white text-xs">
                Cancelamento gratuito
              </Badge>
            )}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{hotel.name}</h3>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mt-1">
                {hotel.starRating && renderStars(hotel.starRating)}
                {hotel.rating?.average && (
                  <span className="text-sm text-gray-600">
                    {hotel.rating.average.toFixed(1)} ({hotel.rating.count || hotel.reviewCount || 0} avaliações)
                  </span>
                )}
              </div>
            </div>

            {/* Botão de like */}
            <button
              onClick={toggleLike}
              className={`p-1 rounded transition-colors ${
                isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Localização */}
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{hotel.location?.address?.city || ''}</span>
            {hotel.distance && (
              <span className="text-gray-500">• {hotel.distance}</span>
            )}
          </div>

          {/* Facilidades */}
          <div className="mb-3">
            {renderAmenities(hotel.amenities)}
          </div>

          {/* Preço e ação */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-blue-600">
                {(hotel.price?.amount || hotel.min_rate?.amount || 0).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: hotel.price?.currency || hotel.min_rate?.currency || 'BRL'
                })}
              </div>
              <div className="text-sm text-gray-500">{hotel.price?.period || 'por noite'}</div>
            </div>

            <Button variant="outline" size="sm">
              Ver mais
            </Button>
          </div>
        </div>
      </div>
      </Card>
    </div>
  );
}