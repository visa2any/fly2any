'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Star, MapPin, ChevronLeft, ChevronRight, Heart, Share2, Check,
  Users, Wifi, Coffee, Dumbbell, Car, X, Utensils, Shield, Sparkles, Award, TrendingUp,
  Waves, ParkingCircle, UtensilsCrossed, Bed
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
    excellent: 'Exceptional',
    veryGood: 'Excellent',
    good: 'Very Good',
    fair: 'Good',
    showRates: 'More Options',
    hideRates: 'Less',
    noRates: 'Check Dates',
    from: 'From',
    bestPrice: 'Best Price',
    instantBook: 'Instant Confirmation',
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
    excellent: 'Excepcional',
    veryGood: 'Excelente',
    good: 'Muito Bom',
    fair: 'Bom',
    showRates: 'Mais Opções',
    hideRates: 'Menos',
    noRates: 'Ver Datas',
    from: 'De',
    bestPrice: 'Melhor Preço',
    instantBook: 'Confirmação Instantânea',
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
    excellent: 'Excepcional',
    veryGood: 'Excelente',
    good: 'Muy Bueno',
    fair: 'Bueno',
    showRates: 'Más Opciones',
    hideRates: 'Menos',
    noRates: 'Ver Fechas',
    from: 'Desde',
    bestPrice: 'Mejor Precio',
    instantBook: 'Confirmación Instantánea',
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
  const [isHovering, setIsHovering] = useState(false);
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
    if (score >= 9.0) return { text: t.excellent, color: 'text-emerald-900', bg: 'bg-emerald-600', border: 'border-emerald-200' };
    if (score >= 8.0) return { text: t.veryGood, color: 'text-blue-900', bg: 'bg-blue-600', border: 'border-blue-200' };
    if (score >= 7.0) return { text: t.good, color: 'text-indigo-900', bg: 'bg-indigo-600', border: 'border-indigo-200' };
    return { text: t.fair, color: 'text-slate-700', bg: 'bg-slate-500', border: 'border-slate-200' };
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

  // Amenity icons mapping
  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) return { icon: Wifi, color: 'text-emerald-600' };
    if (amenityLower.includes('breakfast') || amenityLower.includes('coffee')) return { icon: Coffee, color: 'text-amber-600' };
    if (amenityLower.includes('gym') || amenityLower.includes('fitness')) return { icon: Dumbbell, color: 'text-blue-600' };
    if (amenityLower.includes('parking') || amenityLower.includes('car')) return { icon: Car, color: 'text-slate-600' };
    if (amenityLower.includes('restaurant') || amenityLower.includes('dining')) return { icon: Utensils, color: 'text-orange-600' };
    return { icon: Check, color: 'text-slate-500' };
  };

  return (
    <div
      data-hotel-card
      data-hotel-id={hotel.id}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="group relative bg-white rounded-2xl overflow-hidden flex flex-row transition-all duration-500 hover:shadow-2xl hover:scale-[1.01] border border-slate-200/50 hover:border-slate-300 h-[200px]"
      style={{
        boxShadow: isHovering
          ? '0 20px 60px -15px rgba(0, 0, 0, 0.15), 0 10px 30px -10px rgba(0, 0, 0, 0.1)'
          : '0 4px 12px -2px rgba(0, 0, 0, 0.08)'
      }}
    >
      {/* 🎨 HERO IMAGE SECTION - Horizontal Compact (LEFT SIDE) */}
      <div className="relative w-72 h-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100">
        {/* Action Buttons - Top Right */}
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <button
            onClick={handleFavorite}
            className={`p-2.5 rounded-full backdrop-blur-xl transition-all duration-300 shadow-lg border border-white/20 ${
              isFavorited
                ? 'bg-rose-500 text-white scale-110'
                : 'bg-white/95 text-slate-700 hover:bg-white hover:scale-110'
            }`}
            aria-label="Favorite"
          >
            <Heart className={`w-4.5 h-4.5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            className="p-2.5 rounded-full backdrop-blur-xl bg-white/95 text-slate-700 hover:bg-white hover:scale-110 transition-all duration-300 shadow-lg border border-white/20"
            aria-label="Share"
          >
            <Share2 className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Best Price Badge - Top Right Corner */}
        {bestRate && bestRate.refundable && (
          <div className="absolute top-4 right-4 mr-24 z-10 backdrop-blur-xl bg-emerald-500/95 text-white rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5 border border-emerald-400/30">
            <Award className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">{t.bestPrice}</span>
          </div>
        )}

        {/* Image */}
        <Image
          src={images[currentImageIndex]?.url || '/images/hotel-placeholder.jpg'}
          alt={images[currentImageIndex]?.alt || hotel.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={currentImageIndex === 0}
          placeholder="blur"
          blurDataURL={getBlurDataURL(images[currentImageIndex]?.url || '', 400, 225)}
          quality={90}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/hotel-placeholder.jpg';
          }}
        />

        {/* Gradient Overlay - Bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Image Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/95 text-slate-900 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl hover:bg-white hover:scale-110"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/95 text-slate-900 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl hover:bg-white hover:scale-110"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Image Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/30 backdrop-blur-md px-3 py-2 rounded-full">
              {images.slice(0, 5).map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentImageIndex
                      ? 'bg-white w-6 h-2'
                      : 'bg-white/50 hover:bg-white/80 w-2 h-2'
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

      {/* 📝 CONTENT SECTION - Premium Horizontal Compact (RIGHT SIDE) */}
      <div className="flex-1 flex flex-col p-4">
        {/* Top: Hotel Name, Rating & Location */}
        <div className="mb-2">
          <h3 className="text-slate-900 font-bold text-base leading-tight mb-1.5 line-clamp-1 tracking-tight">
            {hotel.name}
          </h3>

          {/* Rating & Location Row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Stars */}
            {hotel.rating > 0 && (
              <div className="flex items-center gap-0.5">
                {Array.from({ length: Math.min(hotel.rating || 0, 5) }, (_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            )}

            {/* Review Score */}
            {hotel.reviewScore > 0 && (
              <div className="flex items-center gap-1.5">
                <div className={`${reviewCategory.bg} text-white px-2 py-0.5 rounded text-xs font-black`}>
                  {hotel.reviewScore.toFixed(1)}
                </div>
                <div className={`${reviewCategory.color} text-xs font-bold`}>
                  {reviewCategory.text}
                </div>
                {hotel.reviewCount > 0 && (
                  <span className="text-slate-500 text-xs">
                    ({hotel.reviewCount.toLocaleString()})
                  </span>
                )}
              </div>
            )}

            {/* Location */}
            {(hotel.location?.city || hotel.location?.country) && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span className="text-slate-600 text-xs line-clamp-1">
                  {hotel.location?.city || hotel.location?.country}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Middle: Enhanced Hotel & Room Information */}
        <div className="flex flex-col gap-2 mb-auto">
          {/* Room Type - Only show if rate data available */}
          {bestRate?.roomType && (
            <div className="flex items-center gap-1.5">
              <Bed className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span className="text-slate-700 text-xs font-medium line-clamp-1">
                {bestRate.roomType}
              </span>
            </div>
          )}

          {/* Feature Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Free Cancellation Badge */}
            {bestRate?.refundable && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-md border border-emerald-200/50">
                <Shield className="w-3 h-3 text-emerald-600" />
                <span className="text-[10px] font-semibold text-emerald-700">Free Cancel</span>
              </div>
            )}

            {/* Meal Plan Badge */}
            {bestRate?.boardType && ['breakfast', 'half_board', 'full_board', 'all_inclusive'].includes(bestRate.boardType.toLowerCase()) && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-md border border-amber-200/50">
                <Coffee className="w-3 h-3 text-amber-600" />
                <span className="text-[10px] font-semibold text-amber-700">
                  {bestRate.boardType === 'all_inclusive' ? 'All-Inclusive' : bestRate.boardType === 'full_board' ? 'Full Board' : bestRate.boardType === 'half_board' ? 'Half Board' : 'Breakfast'}
                </span>
              </div>
            )}

            {/* Max Occupancy Badge */}
            {bestRate?.maxOccupancy && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-md border border-slate-200/50">
                <Users className="w-3 h-3 text-slate-600" />
                <span className="text-[10px] font-semibold text-slate-700">{bestRate.maxOccupancy} guests</span>
              </div>
            )}

            {/* Popular/Best Price badge when no rate-specific badges */}
            {!bestRate && perNightPrice > 0 && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 rounded-md border border-orange-200/50">
                <TrendingUp className="w-3 h-3 text-orange-600" />
                <span className="text-[10px] font-semibold text-orange-700">Best Price</span>
              </div>
            )}
          </div>

          {/* Top Amenities - ALWAYS show if available */}
          {hotel.amenities && hotel.amenities.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {hotel.amenities.slice(0, 5).map((amenity, idx) => {
                const amenityLower = amenity.toLowerCase();
                let icon = null;
                let label = amenity;

                // Map amenities to icons
                if (amenityLower.includes('wifi') || amenityLower.includes('internet')) {
                  icon = <Wifi className="w-3 h-3 text-blue-600" />;
                  label = 'WiFi';
                } else if (amenityLower.includes('pool') || amenityLower.includes('swimming')) {
                  icon = <Waves className="w-3 h-3 text-cyan-600" />;
                  label = 'Pool';
                } else if (amenityLower.includes('gym') || amenityLower.includes('fitness')) {
                  icon = <Dumbbell className="w-3 h-3 text-orange-600" />;
                  label = 'Gym';
                } else if (amenityLower.includes('parking') || amenityLower.includes('garage')) {
                  icon = <ParkingCircle className="w-3 h-3 text-slate-600" />;
                  label = 'Parking';
                } else if (amenityLower.includes('restaurant') || amenityLower.includes('dining')) {
                  icon = <UtensilsCrossed className="w-3 h-3 text-red-600" />;
                  label = 'Restaurant';
                } else if (amenityLower.includes('bar') || amenityLower.includes('lounge')) {
                  icon = <Utensils className="w-3 h-3 text-purple-600" />;
                  label = 'Bar';
                } else if (amenityLower.includes('spa') || amenityLower.includes('wellness')) {
                  icon = <Sparkles className="w-3 h-3 text-pink-600" />;
                  label = 'Spa';
                } else if (amenityLower.includes('air') && amenityLower.includes('condition')) {
                  icon = <Award className="w-3 h-3 text-teal-600" />;
                  label = 'A/C';
                } else {
                  icon = <Check className="w-3 h-3 text-slate-500" />;
                  label = amenity.length > 15 ? amenity.substring(0, 15) + '...' : amenity;
                }

                return (
                  <div key={idx} className="inline-flex items-center gap-1">
                    {icon}
                    <span className="text-[10px] text-slate-600 font-medium">{label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom: Price & CTA */}
        <div className="flex items-center justify-between gap-3 mt-2">
          {/* Price */}
          {perNightPrice > 0 && (
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-slate-900 font-black text-xl">
                  ${Math.round(perNightPrice)}
                </span>
                <span className="text-slate-600 text-xs font-medium">/night</span>
              </div>
              {totalPrice > perNightPrice && (
                <span className="text-slate-500 text-[10px]">
                  ${Math.round(totalPrice).toLocaleString()} total
                </span>
              )}
            </div>
          )}

          {/* CTA Button */}
          {perNightPrice > 0 ? (
            <button
              onClick={handleBooking}
              className="px-5 py-2.5 font-bold text-sm rounded-xl transition-all duration-300 shadow-md hover:shadow-xl active:scale-95 whitespace-nowrap"
              style={{
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)',
                color: 'white',
              }}
            >
              Book Now
            </button>
          ) : (
            <button
              onClick={() => onViewDetails(hotel.id)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all whitespace-nowrap"
            >
              View Details
            </button>
          )}
        </div>
      </div>

      {/* Expanded Rates Section - Premium Design */}
      {isExpanded && rates.length > 0 && (
        <div className="px-6 py-6 border-t-2 border-slate-100 bg-gradient-to-br from-slate-50 via-white to-slate-50">
          <div className="flex items-center justify-between mb-5">
            <h4 className="text-lg font-black text-slate-900">
              All Room Options ({rates.length})
            </h4>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 hover:bg-slate-100 rounded-xl transition-all"
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
                  className="p-5 bg-white border-2 border-slate-200/50 rounded-2xl hover:border-orange-400 hover:shadow-xl transition-all duration-300"
                >
                  <div className="mb-4">
                    <h5 className="font-bold text-slate-900 text-base mb-3 line-clamp-1">
                      {rate.roomType}
                    </h5>

                    <div className="flex gap-2 flex-wrap mb-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-200/50">
                        <Utensils className="w-3.5 h-3.5" />
                        {getBoardLabel(rate.boardType)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-700 rounded-lg text-xs font-bold border border-slate-200/50">
                        <Users className="w-3.5 h-3.5" />
                        {rate.maxOccupancy} guests
                      </span>
                      {rate.refundable ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200/50">
                          <Shield className="w-3.5 h-3.5" />
                          Free cancel
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold border border-rose-200/50">
                          Non-refundable
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
                    <div>
                      <div className="text-slate-500 text-xs mb-1">From</div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-black text-slate-900 text-2xl leading-none tracking-tight">
                          {currencySymbol}{Math.round(ratePerNight)}
                        </span>
                        <span className="text-slate-500 text-sm">/night</span>
                      </div>
                      <div className="text-slate-500 text-xs mt-1.5">
                        Total: <span className="font-bold text-slate-900">{currencySymbol}{Math.round(rateTotal).toLocaleString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onSelect(hotel.id, rate.id, rate.offerId)}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 active:scale-95 transition-all text-sm whitespace-nowrap"
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
