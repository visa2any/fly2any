'use client';

import { useState } from 'react';
import { Star, MapPin, Wifi, Coffee, Utensils, Dumbbell, ParkingCircle, Heart, Share2, ChevronLeft, ChevronRight, Check } from 'lucide-react';

export interface HotelCardProps {
  id: string;
  name: string;
  address: string;
  city: string;
  rating: number;
  reviewCount: number;
  reviewScore?: number; // e.g., 8.5/10
  pricePerNight: number;
  currency: string;
  images: string[];
  amenities: {
    wifi: boolean;
    parking: boolean;
    breakfast: boolean;
    gym: boolean;
    pool: boolean;
    restaurant: boolean;
    spa?: boolean;
    airportShuttle?: boolean;
  };
  distanceFromCenter?: number; // in km
  cancellationPolicy?: 'free' | 'partial' | 'non-refundable';
  dealBadge?: 'best-value' | 'popular' | 'limited-deal';
  onSelect: (id: string) => void;
  onViewDetails: (id: string) => void;
  lang?: 'en' | 'pt' | 'es';
}

const translations = {
  en: {
    perNight: 'per night',
    viewDetails: 'View Details',
    bookNow: 'Book Now',
    reviews: 'reviews',
    kmFromCenter: 'km from center',
    freeCancellation: 'Free Cancellation',
    partialRefund: 'Partial Refund',
    nonRefundable: 'Non-refundable',
    bestValue: 'Best Value',
    popular: 'Most Popular',
    limitedDeal: 'Limited Deal',
  },
  pt: {
    perNight: 'por noite',
    viewDetails: 'Ver Detalhes',
    bookNow: 'Reservar',
    reviews: 'avaliações',
    kmFromCenter: 'km do centro',
    freeCancellation: 'Cancelamento Grátis',
    partialRefund: 'Reembolso Parcial',
    nonRefundable: 'Não reembolsável',
    bestValue: 'Melhor Valor',
    popular: 'Mais Popular',
    limitedDeal: 'Oferta Limitada',
  },
  es: {
    perNight: 'por noche',
    viewDetails: 'Ver Detalles',
    bookNow: 'Reservar',
    reviews: 'reseñas',
    kmFromCenter: 'km del centro',
    freeCancellation: 'Cancelación Gratis',
    partialRefund: 'Reembolso Parcial',
    nonRefundable: 'No reembolsable',
    bestValue: 'Mejor Valor',
    popular: 'Más Popular',
    limitedDeal: 'Oferta Limitada',
  },
};

export function HotelCard({
  id,
  name,
  address,
  city,
  rating,
  reviewCount,
  reviewScore,
  pricePerNight,
  currency,
  images,
  amenities,
  distanceFromCenter,
  cancellationPolicy,
  dealBadge,
  onSelect,
  onViewDetails,
  lang = 'en',
}: HotelCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const t = translations[lang];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Implement share functionality
  };

  const dealBadgeStyles = {
    'best-value': 'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
    'popular': 'bg-gradient-to-r from-orange-500 to-amber-600 text-white',
    'limited-deal': 'bg-gradient-to-r from-red-500 to-pink-600 text-white',
  };

  const dealBadgeText = {
    'best-value': t.bestValue,
    'popular': t.popular,
    'limited-deal': t.limitedDeal,
  };

  return (
    <div
      className="group relative bg-white rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
      data-hotel-id={id}
    >
      <div className="flex flex-col md:flex-row">
        {/* Image Carousel */}
        <div className="relative w-full md:w-80 h-64 md:h-auto flex-shrink-0 overflow-hidden">
          {/* Deal Badge */}
          {dealBadge && (
            <div className="absolute top-3 left-3 z-10">
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${dealBadgeStyles[dealBadge]}`}>
                {dealBadgeText[dealBadge]}
              </span>
            </div>
          )}

          {/* Favorite & Share Buttons */}
          <div className="absolute top-3 right-3 z-10 flex gap-2">
            <button
              onClick={handleFavorite}
              className={`p-2 rounded-full backdrop-blur-md transition-all ${
                isFavorited
                  ? 'bg-red-500 text-white'
                  : 'bg-white/80 text-gray-700 hover:bg-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white/80 backdrop-blur-md text-gray-700 hover:bg-white transition-all"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Image */}
          <img
            src={images[currentImageIndex]}
            alt={name}
            className="w-full h-full object-cover"
          />

          {/* Image Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-md text-gray-700 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-md text-gray-700 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Image Indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex
                        ? 'bg-white w-6'
                        : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Hotel Details */}
        <div className="flex-1 p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <MapPin className="w-4 h-4" />
                <span>{address}, {city}</span>
                {distanceFromCenter && (
                  <span className="text-gray-500">• {distanceFromCenter} {t.kmFromCenter}</span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="text-right ml-4">
              <div className="text-3xl font-bold text-primary-600">
                {currency} {pricePerNight}
              </div>
              <div className="text-sm text-gray-600">{t.perNight}</div>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
            </div>
            {reviewScore && (
              <div className="flex items-center gap-2">
                <div className="bg-primary-600 text-white px-2 py-1 rounded-lg font-bold text-sm">
                  {reviewScore}
                </div>
                <span className="text-sm text-gray-600">
                  {reviewCount} {t.reviews}
                </span>
              </div>
            )}
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-3 mb-4">
            {amenities.wifi && (
              <div className="flex items-center gap-1 text-sm text-gray-700">
                <Wifi className="w-4 h-4 text-primary-500" />
                <span>WiFi</span>
              </div>
            )}
            {amenities.parking && (
              <div className="flex items-center gap-1 text-sm text-gray-700">
                <ParkingCircle className="w-4 h-4 text-primary-500" />
                <span>Parking</span>
              </div>
            )}
            {amenities.breakfast && (
              <div className="flex items-center gap-1 text-sm text-gray-700">
                <Coffee className="w-4 h-4 text-primary-500" />
                <span>Breakfast</span>
              </div>
            )}
            {amenities.restaurant && (
              <div className="flex items-center gap-1 text-sm text-gray-700">
                <Utensils className="w-4 h-4 text-primary-500" />
                <span>Restaurant</span>
              </div>
            )}
            {amenities.gym && (
              <div className="flex items-center gap-1 text-sm text-gray-700">
                <Dumbbell className="w-4 h-4 text-primary-500" />
                <span>Gym</span>
              </div>
            )}
          </div>

          {/* Cancellation Policy */}
          {cancellationPolicy && (
            <div className="mb-4">
              {cancellationPolicy === 'free' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-semibold">
                  <Check className="w-4 h-4" />
                  {t.freeCancellation}
                </div>
              )}
              {cancellationPolicy === 'partial' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-sm font-semibold">
                  {t.partialRefund}
                </div>
              )}
              {cancellationPolicy === 'non-refundable' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                  {t.nonRefundable}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => onViewDetails(id)}
              className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-primary-500 hover:text-primary-600 transition-all"
            >
              {t.viewDetails}
            </button>
            <button
              onClick={() => onSelect(id)}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
            >
              {t.bookNow}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
