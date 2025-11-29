'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Star, MapPin, ChevronLeft, ChevronRight, Heart, Share2, Check,
  Users, Wifi, Coffee, Dumbbell, Car, Utensils, Shield, X, Award,
  TrendingUp, Clock, CheckCircle
} from 'lucide-react';
import { getBlurDataURL } from '@/lib/utils/image-optimization';
import type { LiteAPIHotel } from '@/lib/hotels/types';

export interface HotelCardEnhancedProps {
  hotel: LiteAPIHotel;
  checkIn: string;
  checkOut: string;
  adults: number;
  children?: number;
  nights: number;
  onSelect: (hotelId: string, rateId: string, offerId: string) => void;
  onViewDetails: (hotelId: string) => void;
  lang?: 'en' | 'pt' | 'es';
}

const translations = {
  en: {
    perNight: 'per night',
    total: 'Total',
    nights: 'nights',
    viewDetails: 'View Details',
    selectRoom: 'Book Now',
    seeAvailability: 'See Availability',
    freeCancellation: 'Free Cancellation',
    nonRefundable: 'Non-refundable',
    reviews: 'reviews',
    excellent: 'Excellent',
    veryGood: 'Very Good',
    good: 'Good',
    fair: 'Fair',
    from: 'From',
    topRated: 'Top Rated',
    dealOfTheDay: 'Deal of the Day',
  },
  pt: {
    perNight: 'por noite',
    total: 'Total',
    nights: 'noites',
    viewDetails: 'Ver Detalhes',
    selectRoom: 'Reservar',
    seeAvailability: 'Ver Disponibilidade',
    freeCancellation: 'Cancelamento Grátis',
    nonRefundable: 'Não reembolsável',
    reviews: 'avaliações',
    excellent: 'Excelente',
    veryGood: 'Muito Bom',
    good: 'Bom',
    fair: 'Regular',
    from: 'De',
    topRated: 'Bem Avaliado',
    dealOfTheDay: 'Oferta do Dia',
  },
  es: {
    perNight: 'por noche',
    total: 'Total',
    nights: 'noches',
    viewDetails: 'Ver Detalles',
    selectRoom: 'Reservar',
    seeAvailability: 'Ver Disponibilidad',
    freeCancellation: 'Cancelación Gratis',
    nonRefundable: 'No reembolsable',
    reviews: 'reseñas',
    excellent: 'Excelente',
    veryGood: 'Muy Bueno',
    good: 'Bueno',
    fair: 'Regular',
    from: 'Desde',
    topRated: 'Muy Valorado',
    dealOfTheDay: 'Oferta del Día',
  },
};

export function HotelCardEnhanced({
  hotel,
  checkIn,
  checkOut,
  adults,
  children = 0,
  nights,
  onSelect,
  onViewDetails,
  lang = 'en',
}: HotelCardEnhancedProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const t = translations[lang];

  if (!hotel || !hotel.id) {
    return null;
  }

  const rawImages = hotel.images?.filter((img) => img && img.url) || [];
  const images = rawImages.length > 0
    ? rawImages
    : hotel.thumbnail
      ? [{ url: hotel.thumbnail, alt: hotel.name || 'Hotel' }]
      : [{ url: '/images/hotel-placeholder.jpg', alt: 'Hotel placeholder' }];

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

  const rates = (hotel.rates || []).filter(
    (rate) => rate && rate.totalPrice && rate.totalPrice.amount
  );

  const bestRate = rates.length > 0
    ? rates.reduce((prev, curr) => {
        const prevPrice = parseFloat(prev.totalPrice?.amount || '999999');
        const currPrice = parseFloat(curr.totalPrice?.amount || '999999');
        return currPrice < prevPrice ? curr : prev;
      })
    : null;

  const perNightPrice = hotel.lowestPricePerNight
    ? hotel.lowestPricePerNight
    : hotel.lowestPrice?.amount
      ? parseFloat(hotel.lowestPrice.amount) / nights
      : bestRate?.totalPrice?.amount
        ? parseFloat(bestRate.totalPrice.amount) / nights
        : 0;

  const totalPrice = hotel.lowestPrice?.amount
    ? parseFloat(hotel.lowestPrice.amount)
    : bestRate?.totalPrice?.amount
      ? parseFloat(bestRate.totalPrice.amount)
      : perNightPrice * nights;

  const currency = hotel.lowestPrice?.currency || bestRate?.totalPrice?.currency || 'USD';

  const getReviewCategory = (score: number) => {
    if (score >= 9.0) return { text: t.excellent, color: 'text-emerald-700', bg: 'bg-emerald-600' };
    if (score >= 8.0) return { text: t.veryGood, color: 'text-blue-700', bg: 'bg-blue-600' };
    if (score >= 7.0) return { text: t.good, color: 'text-cyan-700', bg: 'bg-cyan-600' };
    return { text: t.fair, color: 'text-gray-600', bg: 'bg-gray-500' };
  };

  const reviewCategory = getReviewCategory(hotel.reviewScore || 0);

  const getBoardLabel = (boardType: string) => {
    const labels: Record<string, string> = {
      'RO': 'Room Only', 'BB': 'Breakfast', 'HB': 'Half Board', 'FB': 'Full Board',
      'AI': 'All Inclusive', 'BI': 'Breakfast', 'room_only': 'Room Only',
      'breakfast': 'Breakfast', 'half_board': 'Half Board', 'full_board': 'Full Board',
      'all_inclusive': 'All Inclusive',
    };
    return labels[boardType] || boardType || 'Room Only';
  };

  const getCurrencySymbol = (curr: string) => {
    const symbols: Record<string, string> = { 'USD': '$', 'EUR': '€', 'GBP': '£', 'BRL': 'R$' };
    return symbols[curr] || curr + ' ';
  };

  const currencySymbol = getCurrencySymbol(currency);

  const handleBooking = () => {
    if (bestRate) {
      onSelect(hotel.id, bestRate.id, bestRate.offerId);
    } else {
      onViewDetails(hotel.id);
    }
  };

  // Check if this is a top-rated hotel
  const isTopRated = (hotel.reviewScore || 0) >= 8.5;
  const isGreatDeal = bestRate && parseFloat(bestRate.totalPrice?.amount || '0') < 150;

  return (
    <div
      data-hotel-card
      data-hotel-id={hotel.id}
      onClick={() => onViewDetails(hotel.id)}
      className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-100 hover:border-orange-300 h-full flex flex-col"
    >
      {/* Top Badges */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
        {isTopRated && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-lg shadow-lg text-xs font-bold">
            <Award className="w-3.5 h-3.5" />
            {t.topRated}
          </div>
        )}
        {isGreatDeal && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg shadow-lg text-xs font-bold animate-pulse">
            <TrendingUp className="w-3.5 h-3.5" />
            {t.dealOfTheDay}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="absolute top-3 right-3 z-20 flex gap-2">
        <button
          onClick={handleFavorite}
          className={`p-2.5 rounded-full backdrop-blur-xl transition-all shadow-lg hover:scale-110 active:scale-95 ${
            isFavorited ? 'bg-red-500 text-white' : 'bg-white/95 text-slate-600 hover:bg-red-50'
          }`}
          aria-label="Favorite"
        >
          <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Enhanced Image Section - LARGER & MORE PROMINENT */}
      <div className="relative w-full h-72 flex-shrink-0 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
        <Image
          src={images[currentImageIndex]?.url || '/images/hotel-placeholder.jpg'}
          alt={images[currentImageIndex]?.alt || hotel.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={currentImageIndex === 0}
          placeholder="blur"
          blurDataURL={getBlurDataURL(images[currentImageIndex]?.url || '', 400, 300)}
          quality={90}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/hotel-placeholder.jpg';
          }}
        />

        {/* Image Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/95 text-gray-800 opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-110 transition-all shadow-xl"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/95 text-gray-800 opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-110 transition-all shadow-xl"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Enhanced Image Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/60 backdrop-blur-md px-3 py-2 rounded-full shadow-xl">
              {images.slice(0, 5).map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                  className={`transition-all rounded-full ${
                    index === currentImageIndex
                      ? 'bg-white w-6 h-2'
                      : 'bg-white/60 w-2 h-2 hover:bg-white/80'
                  }`}
                  aria-label={`Image ${index + 1}`}
                />
              ))}
              {images.length > 5 && (
                <span className="text-white text-xs font-bold ml-1">+{images.length - 5}</span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Content Section - Enhanced Layout */}
      <div className="flex flex-col flex-1 p-5">
        {/* Hotel Name & Rating Row */}
        <div className="mb-3">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-bold text-gray-900 text-lg leading-tight flex-1 line-clamp-2 group-hover:text-orange-600 transition-colors">
              {hotel.name}
            </h3>
            {hotel.reviewScore > 0 && (
              <div className="flex-shrink-0">
                <div className={`${reviewCategory.bg} text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-md`}>
                  {hotel.reviewScore.toFixed(1)}
                </div>
              </div>
            )}
          </div>

          {/* Stars & Review Text */}
          <div className="flex items-center gap-3 flex-wrap">
            {hotel.rating > 0 && (
              <div className="flex items-center gap-0.5">
                {Array.from({ length: Math.min(hotel.rating || 0, 5) }, (_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            )}
            {hotel.reviewScore > 0 && (
              <div className="flex items-center gap-2">
                <span className={`${reviewCategory.color} text-sm font-semibold`}>
                  {reviewCategory.text}
                </span>
                {hotel.reviewCount > 0 && (
                  <span className="text-gray-500 text-xs">
                    ({hotel.reviewCount.toLocaleString()} {t.reviews})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 mb-3">
          <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
          <p className="text-gray-700 text-sm font-medium leading-snug line-clamp-2">
            {hotel.location?.address || `${hotel.location?.city}, ${hotel.location?.country}`}
          </p>
        </div>

        {/* Description Preview - NEW! */}
        {hotel.description && (
          <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2">
            {hotel.description}
          </p>
        )}

        {/* Key Features - Compact Pills */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {bestRate && (
            <>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 rounded-lg border border-blue-100">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-semibold text-blue-900">{bestRate.maxOccupancy}人</span>
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 rounded-lg border border-orange-100">
                <Utensils className="w-3.5 h-3.5 text-orange-600" />
                <span className="text-xs font-semibold text-orange-900">{getBoardLabel(bestRate.boardType)}</span>
              </div>
              {bestRate.refundable && (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 rounded-lg border border-green-100">
                  <Shield className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs font-semibold text-green-900">{t.freeCancellation}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Top Amenities - Icons Only */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
          {hotel.amenities && hotel.amenities.length > 0 ? (
            <>
              {hotel.amenities.slice(0, 4).map((amenity, idx) => {
                const amenityIcons: Record<string, { icon: any; color: string }> = {
                  'wifi': { icon: Wifi, color: 'text-green-600' },
                  'breakfast': { icon: Coffee, color: 'text-orange-600' },
                  'gym': { icon: Dumbbell, color: 'text-blue-600' },
                  'parking': { icon: Car, color: 'text-slate-600' },
                };
                const amenityLower = amenity.toLowerCase();
                const config = Object.entries(amenityIcons).find(([key]) => amenityLower.includes(key))?.[1];
                const Icon = config?.icon || Check;
                const color = config?.color || 'text-slate-600';

                return (
                  <div key={idx} className={`${color} flex items-center justify-center`} title={amenity}>
                    <Icon className="w-5 h-5" />
                  </div>
                );
              })}
              {hotel.amenities.length > 4 && (
                <span className="text-gray-500 text-xs font-medium">
                  +{hotel.amenities.length - 4} more
                </span>
              )}
            </>
          ) : (
            <div className="flex gap-3">
              <Wifi className="w-5 h-5 text-green-600" />
              <Coffee className="w-5 h-5 text-orange-600" />
              <Check className="w-5 h-5 text-slate-600" />
            </div>
          )}
        </div>

        {/* Pricing & CTA - Enhanced */}
        <div className="mt-auto">
          {perNightPrice > 0 ? (
            <div className="flex items-end justify-between gap-4">
              <div className="flex-1">
                <div className="text-gray-600 text-xs mb-1">{t.from}</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-gray-900 font-black text-3xl leading-none">
                    {currencySymbol}{Math.round(perNightPrice)}
                  </span>
                  <span className="text-gray-600 text-sm font-medium">/ night</span>
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  Total: {currencySymbol}{Math.round(totalPrice).toLocaleString()} ({nights}n)
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleBooking(); }}
                className="px-6 py-3 font-bold text-sm rounded-xl transition-all bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              >
                {bestRate ? t.selectRoom : t.seeAvailability}
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onViewDetails(hotel.id); }}
              className="w-full px-6 py-3 font-bold text-sm rounded-xl transition-all bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              {t.viewDetails}
            </button>
          )}
        </div>

        {/* Trust Badge */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span className="text-xs text-gray-600 font-medium">Instant confirmation · Best price guarantee</span>
        </div>
      </div>
    </div>
  );
}
