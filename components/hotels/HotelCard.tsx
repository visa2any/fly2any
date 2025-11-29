'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Star, MapPin, ChevronLeft, ChevronRight, Heart, Share2, Check,
  Users, Wifi, Coffee, Dumbbell, Car, X, Utensils, Shield, Sparkles, Award, TrendingUp
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
      className="group relative h-full bg-white rounded-2xl overflow-hidden flex flex-col transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] border border-slate-200/50 hover:border-slate-300"
      style={{
        boxShadow: isHovering
          ? '0 20px 60px -15px rgba(0, 0, 0, 0.15), 0 10px 30px -10px rgba(0, 0, 0, 0.1)'
          : '0 4px 12px -2px rgba(0, 0, 0, 0.08)'
      }}
    >
      {/* 🎨 HERO IMAGE SECTION - Compact Height */}
      <div className="relative w-full h-40 flex-shrink-0 overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100">
        {/* Floating Price Badge - Airbnb Style */}
        {perNightPrice > 0 && (
          <div className="absolute top-4 left-4 z-20 backdrop-blur-xl bg-white/95 rounded-2xl shadow-2xl px-4 py-2.5 border border-white/20">
            <div className="flex items-baseline gap-1.5">
              <span className="text-slate-900 font-black text-2xl tracking-tight">
                {currencySymbol}{Math.round(perNightPrice)}
              </span>
              <span className="text-slate-600 text-sm font-semibold">/{t.perNight.split(' ')[1] || 'night'}</span>
            </div>
            {totalPrice > perNightPrice && (
              <div className="text-slate-500 text-xs font-medium mt-0.5">
                {currencySymbol}{Math.round(totalPrice).toLocaleString()} total
              </div>
            )}
          </div>
        )}

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

      {/* 📝 CONTENT SECTION - Premium Typography & Compact Spacing */}
      <div className="flex-1 flex flex-col p-3">
        {/* Hotel Name - Large & Bold */}
        <h3 className="text-slate-900 font-black text-lg leading-tight mb-2 line-clamp-2 tracking-tight">
          {hotel.name}
        </h3>

        {/* Rating & Reviews - Single Line */}
        <div className="flex items-center gap-3 mb-2">
          {/* Stars */}
          {hotel.rating > 0 && (
            <div className="flex items-center gap-0.5">
              {Array.from({ length: Math.min(hotel.rating || 0, 5) }, (_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
          )}

          {/* Review Score */}
          {hotel.reviewScore > 0 && (
            <div className="flex items-center gap-2">
              <div className={`${reviewCategory.bg} text-white px-3 py-1 rounded-lg text-sm font-black shadow-sm`}>
                {hotel.reviewScore.toFixed(1)}
              </div>
              <div>
                <div className={`${reviewCategory.color} text-sm font-bold leading-none`}>
                  {reviewCategory.text}
                </div>
                {hotel.reviewCount > 0 && (
                  <div className="text-slate-500 text-xs mt-0.5">
                    {hotel.reviewCount.toLocaleString()} {t.reviews}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 mb-2">
          <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="text-slate-600 text-sm font-medium leading-snug line-clamp-1">
            {hotel.location?.address || `${hotel.location?.city}, ${hotel.location?.country}`}
          </p>
        </div>

        {/* Description - Subtle */}
        {hotel.description && (
          <p className="text-slate-500 text-sm leading-relaxed mb-2 line-clamp-2">
            {hotel.description}
          </p>
        )}

        {/* Key Features - Icons Only (Clean & Minimal) */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {/* Room Type */}
          {bestRate && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200/50 transition-colors">
              <Users className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-semibold text-slate-700">
                {bestRate.maxOccupancy} Guests
              </span>
            </div>
          )}

          {/* Cancellation */}
          {bestRate && (
            bestRate.refundable ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200/50 transition-colors">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700">Free Cancel</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 rounded-lg border border-rose-200/50">
                <X className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-semibold text-rose-700">Non-refundable</span>
              </div>
            )
          )}

          {/* Meal Plan */}
          {bestRate && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200/50 transition-colors">
              <Utensils className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-semibold text-amber-700">
                {getBoardLabel(bestRate.boardType)}
              </span>
            </div>
          )}
        </div>

        {/* Amenities - Icon Only (Premium & Clean) */}
        <div className="flex items-center gap-2 mb-3">
          {hotel.amenities && hotel.amenities.length > 0 ? (
            <>
              {hotel.amenities.slice(0, 4).map((amenity, idx) => {
                const { icon: Icon, color } = getAmenityIcon(amenity);
                return (
                  <div
                    key={idx}
                    className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200/30"
                    title={amenity}
                  >
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                );
              })}
              {hotel.amenities.length > 4 && (
                <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200/30">
                  <span className="text-xs font-bold text-slate-600">+{hotel.amenities.length - 4}</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/30">
                <Wifi className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/30">
                <Coffee className="w-4 h-4 text-amber-600" />
              </div>
            </>
          )}
        </div>

        {/* CTA Section - Bottom */}
        <div className="mt-auto space-y-2">
          {/* Multiple Rates Indicator */}
          {rates.length > 1 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-xl transition-all border border-slate-200/50 flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              {rates.length} {t.showRates} Available
            </button>
          )}

          {/* Primary CTA - Irresistible */}
          {perNightPrice > 0 ? (
            <button
              onClick={handleBooking}
              className="w-full px-6 py-3 font-black text-base rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl active:scale-95 relative overflow-hidden group/btn"
              style={{
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)',
                color: 'white',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
              <div className="relative flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span>{bestRate ? t.selectRoom : t.seeAvailability}</span>
              </div>
            </button>
          ) : (
            <button
              onClick={() => onViewDetails(hotel.id)}
              className="w-full px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base rounded-xl transition-all"
            >
              {t.viewDetails}
            </button>
          )}

          {/* Trust Signals - Subtle */}
          <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-medium">{t.instantBook}</span>
            </div>
            <div className="w-px h-3 bg-slate-300" />
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-medium">Secure Booking</span>
            </div>
          </div>
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
