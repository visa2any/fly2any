'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Star, MapPin, ChevronLeft, ChevronRight, Heart, Share2, Check, ChevronDown, ChevronUp,
  Users, Wifi, Coffee, Dumbbell, Car, X, Utensils, Shield
} from 'lucide-react';
import { getBlurDataURL } from '@/lib/utils/image-optimization';
import type { LiteAPIHotel, LiteAPIHotelRate } from '@/lib/hotels/types';

export interface HotelCardProps {
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
    showRates: 'Show Rates',
    hideRates: 'Hide',
    noRates: 'Check availability',
    from: 'From',
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
    showRates: 'Mostrar',
    hideRates: 'Ocultar',
    noRates: 'Ver disponibilidade',
    from: 'De',
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
    showRates: 'Mostrar',
    hideRates: 'Ocultar',
    noRates: 'Ver disponibilidad',
    from: 'Desde',
  },
};

export function HotelCard({
  hotel,
  checkIn,
  checkOut,
  adults,
  children = 0,
  nights,
  onSelect,
  onViewDetails,
  lang = 'en',
}: HotelCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const t = translations[lang];

  if (!hotel || !hotel.id) {
    console.warn('HotelCard: Invalid hotel data', hotel);
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

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: hotel.name,
        text: `Check out ${hotel.name}`,
        url: window.location.href,
      });
    }
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
    if (score >= 9.0) return { text: t.excellent, color: 'text-green-700', bg: 'bg-green-600' };
    if (score >= 8.0) return { text: t.veryGood, color: 'text-blue-700', bg: 'bg-blue-600' };
    if (score >= 7.0) return { text: t.good, color: 'text-slate-700', bg: 'bg-slate-600' };
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

  return (
    <div
      data-hotel-card
      data-hotel-id={hotel.id}
      className="group relative h-full bg-white rounded-xl border-2 border-slate-200/80 hover:border-orange-400 hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* COMPACT Grid: Image | Hotel Info + Amenities | Price & CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_240px] gap-0 flex-1 min-h-0">

        {/* Column 1: Enhanced Larger Image */}
        <div className="relative w-full h-56 lg:h-56 flex-shrink-0 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
          {/* Action Buttons */}
          <div className="absolute top-2 right-2 z-10 flex gap-1.5">
            <button
              onClick={handleFavorite}
              className={`p-2 rounded-full backdrop-blur-md transition-all shadow-lg ${
                isFavorited ? 'bg-red-500 text-white' : 'bg-white/95 text-slate-600 hover:bg-red-50'
              }`}
              aria-label="Favorite"
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-full backdrop-blur-md bg-white/95 text-slate-600 hover:bg-blue-50 transition-all shadow-lg"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          <Image
            src={images[currentImageIndex]?.url || '/images/hotel-placeholder.jpg'}
            alt={images[currentImageIndex]?.alt || hotel.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 220px"
            priority={currentImageIndex === 0}
            placeholder="blur"
            blurDataURL={getBlurDataURL(images[currentImageIndex]?.url || '', 220, 160)}
            quality={85}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/hotel-placeholder.jpg';
            }}
          />

          {/* Image Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/95 text-gray-800 opacity-0 group-hover:opacity-100 transition-all shadow-md"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/95 text-gray-800 opacity-0 group-hover:opacity-100 transition-all shadow-md"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Image Indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                {images.slice(0, 5).map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                    className={`transition-all ${index === currentImageIndex ? 'bg-white w-4 h-1.5' : 'bg-white/60 w-1.5 h-1.5'} rounded-full`}
                    aria-label={`Image ${index + 1}`}
                  />
                ))}
                {images.length > 5 && <span className="text-white text-[10px] font-bold ml-1">+{images.length - 5}</span>}
              </div>
            </>
          )}
        </div>

        {/* Column 2: ALL INFO - NO VERTICAL WASTE */}
        <div className="p-2 border-r border-slate-100 flex flex-col h-full min-h-0">
          {/* Row 1: Name + Stars + Review */}
          <div className="mb-1">
            <h3 className="font-black text-slate-900 text-base leading-tight mb-0.5 truncate">
              {hotel.name}
            </h3>
            {/* Stars + Review Inline */}
            <div className="flex items-center gap-2">
              {hotel.rating > 0 && (
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: Math.min(hotel.rating || 0, 5) }, (_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              )}
              {hotel.reviewScore > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className={`${reviewCategory.bg} text-white px-2 py-0.5 rounded text-xs font-bold`}>
                    {hotel.reviewScore.toFixed(1)}
                  </div>
                  <span className={`${reviewCategory.color} text-xs font-semibold`}>{reviewCategory.text}</span>
                  {hotel.reviewCount > 0 && (
                    <span className="text-slate-500 text-[10px]">({hotel.reviewCount.toLocaleString()})</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Location */}
          <div className="flex items-start gap-1.5 mb-1">
            <MapPin className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
            <p className="text-slate-700 text-xs font-medium leading-tight line-clamp-2">
              {hotel.location?.address || `${hotel.location?.city}, ${hotel.location?.country}`}
            </p>
          </div>

          {/* Row 2.5: Description Preview - NEW! */}
          {hotel.description && (
            <p className="text-slate-600 text-[11px] leading-tight mb-1 line-clamp-2">
              {hotel.description}
            </p>
          )}

          {/* Row 3: Key Features - ALWAYS VISIBLE */}
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            {/* Room Type + Guests - ALWAYS SHOW */}
            {bestRate ? (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 rounded border border-blue-100">
                <Users className="w-3 h-3 text-blue-600" />
                <span className="text-[10px] font-bold text-blue-900">{bestRate.roomType} · {bestRate.maxOccupancy} guests</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                <Users className="w-3 h-3 text-slate-600" />
                <span className="text-[10px] font-bold text-slate-700">Standard Room · 2 guests</span>
              </div>
            )}

            {/* Cancellation - ALWAYS SHOW */}
            {bestRate ? (
              bestRate.refundable ? (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 rounded border border-green-200">
                  <Shield className="w-3 h-3 text-green-600" />
                  <span className="text-[10px] font-bold text-green-700">Free Cancellation</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 rounded border border-red-200">
                  <X className="w-3 h-3 text-red-600" />
                  <span className="text-[10px] font-bold text-red-700">Non-refundable</span>
                </div>
              )
            ) : (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 rounded border border-blue-200">
                <Shield className="w-3 h-3 text-blue-600" />
                <span className="text-[10px] font-bold text-blue-700">Check availability</span>
              </div>
            )}

            {/* Meal Plan - ALWAYS SHOW */}
            {bestRate ? (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 rounded border border-orange-200">
                <Utensils className="w-3 h-3 text-orange-600" />
                <span className="text-[10px] font-bold text-orange-700">{getBoardLabel(bestRate.boardType)}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 rounded border border-orange-200">
                <Utensils className="w-3 h-3 text-orange-600" />
                <span className="text-[10px] font-bold text-orange-700">Room Only</span>
              </div>
            )}
          </div>

          {/* Row 4: AMENITIES - ALWAYS VISIBLE */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {hotel.amenities && hotel.amenities.length > 0 ? (
              <>
                {hotel.amenities.slice(0, 6).map((amenity, idx) => {
                  const amenityIcons: Record<string, { icon: any; color: string; label: string }> = {
                    'wifi': { icon: Wifi, color: 'text-green-600', label: 'WiFi' },
                    'breakfast': { icon: Coffee, color: 'text-orange-600', label: 'Breakfast' },
                    'gym': { icon: Dumbbell, color: 'text-blue-600', label: 'Gym' },
                    'parking': { icon: Car, color: 'text-slate-600', label: 'Parking' },
                  };
                  const amenityLower = amenity.toLowerCase();
                  const config = Object.entries(amenityIcons).find(([key]) => amenityLower.includes(key))?.[1];
                  const Icon = config?.icon || Check;
                  const color = config?.color || 'text-slate-600';
                  const label = config?.label || amenity.substring(0, 10);

                  return (
                    <div key={idx} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-50 rounded">
                      <Icon className={`w-3 h-3 ${color}`} />
                      <span className="text-[10px] font-semibold text-slate-700">{label}</span>
                    </div>
                  );
                })}
                {hotel.amenities.length > 6 && (
                  <span className="text-primary-600 text-[10px] font-bold">+{hotel.amenities.length - 6}</span>
                )}
              </>
            ) : (
              <>
                {/* Placeholder amenities if none available */}
                <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-50 rounded">
                  <Wifi className="w-3 h-3 text-green-600" />
                  <span className="text-[10px] font-semibold text-slate-700">WiFi</span>
                </div>
                <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-50 rounded">
                  <Check className="w-3 h-3 text-slate-600" />
                  <span className="text-[10px] font-semibold text-slate-700">Standard amenities</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Column 3: PRICING & CTA - NO VERTICAL WASTE */}
        <div className="p-2 bg-gradient-to-br from-orange-50 via-white to-red-50 flex flex-col justify-between h-full min-h-0">
          {perNightPrice > 0 ? (
            <div>
              {/* PRICE - COMPACT */}
              <div className="text-center mb-1.5">
                <div className="text-slate-600 text-[10px] font-semibold">{t.from}</div>
                <div className="text-slate-900 font-black text-3xl leading-none my-0.5">
                  {currencySymbol}{Math.round(perNightPrice)}
                </div>
                <div className="text-slate-700 text-xs font-semibold mb-1">{t.perNight}</div>

                {/* Total */}
                <div className="px-2 py-0.5 bg-white rounded shadow-sm border border-slate-200">
                  <div className="text-slate-600 text-[10px]">Total {nights}n:</div>
                  <div className="text-slate-900 font-black text-base">
                    {currencySymbol}{Math.round(totalPrice).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Multiple Rates */}
              {rates.length > 1 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full mb-1.5 px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded transition-all border border-blue-200"
                >
                  {rates.length} {isExpanded ? '−' : '+'}
                </button>
              )}

              {/* BOOK BUTTON */}
              <button
                onClick={handleBooking}
                className="w-full px-4 py-2 font-black text-sm rounded-lg transition-all bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 mb-1.5"
              >
                {bestRate ? t.selectRoom : t.seeAvailability}
              </button>

              {/* Trust Badges */}
              <div className="space-y-0.5">
                <div className="flex items-center gap-1 text-[10px] text-slate-600">
                  <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                  <span className="font-medium">Instant</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-600">
                  <Shield className="w-3 h-3 text-green-600 flex-shrink-0" />
                  <span className="font-medium">Best price</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-slate-500 text-xs mb-1.5">{t.noRates}</div>
              <button
                onClick={() => onViewDetails(hotel.id)}
                className="w-full px-4 py-2 font-bold text-sm rounded-lg transition-all bg-slate-200 text-slate-700 hover:bg-slate-300"
              >
                {t.viewDetails}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Rates Section */}
      {isExpanded && rates.length > 0 && (
        <div className="px-6 py-4 border-t-2 border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-black text-slate-900">
              All Room Options ({rates.length})
            </h4>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 hover:bg-slate-200 rounded-lg transition-all"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rates.map((rate) => {
              const ratePerNight = parseFloat(rate.totalPrice.amount) / nights;
              const rateTotal = parseFloat(rate.totalPrice.amount);
              return (
                <div
                  key={rate.id}
                  className="p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-orange-400 hover:shadow-lg transition-all"
                >
                  <div className="mb-3">
                    <h5 className="font-bold text-slate-900 text-base mb-2">{rate.roomType}</h5>

                    <div className="flex gap-2 flex-wrap mb-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold border border-blue-200">
                        <Utensils className="w-3 h-3" />
                        {getBoardLabel(rate.boardType)}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 text-slate-700 rounded-md text-xs font-bold border border-slate-200">
                        <Users className="w-3 h-3" />
                        {rate.maxOccupancy} guests
                      </span>
                      {rate.refundable ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-xs font-bold border border-green-200">
                          <Shield className="w-3 h-3" />
                          Free cancellation
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-md text-xs font-bold border border-red-200">
                          Non-refundable
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <div>
                      <div className="text-slate-600 text-xs mb-0.5">From</div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-black text-slate-900 text-2xl leading-none">
                          {currencySymbol}{Math.round(ratePerNight)}
                        </span>
                        <span className="text-slate-600 text-xs">/night</span>
                      </div>
                      <div className="text-slate-500 text-xs mt-1">
                        Total: <span className="font-bold text-slate-900">{currencySymbol}{Math.round(rateTotal).toLocaleString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onSelect(hotel.id, rate.id, rate.offerId)}
                      className="px-5 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-lg hover:shadow-lg hover:scale-105 transition-all text-sm"
                    >
                      Select
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
