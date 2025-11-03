'use client';

import { useState } from 'react';
import { Star, MapPin, ChevronLeft, ChevronRight, Heart, Share2, Check, ChevronDown, ChevronUp, Users, Clock, Info, Sparkles, Wifi, Coffee, Dumbbell, Car, Shield } from 'lucide-react';
import { dimensions, spacing, typography, colors } from '@/lib/design-system';
import type { MockHotel } from '@/lib/mock-data/hotels';

export interface HotelCardProps {
  hotel: MockHotel;
  checkIn: string;
  checkOut: string;
  adults: number;
  children?: number;
  nights: number;
  onSelect: (hotelId: string, rateId: string) => void;
  onViewDetails: (hotelId: string) => void;
  lang?: 'en' | 'pt' | 'es';
}

const translations = {
  en: {
    perNight: 'per night',
    total: 'Total',
    nights: 'nights',
    viewDetails: 'View Details',
    selectRoom: 'Select Room',
    freeCancellation: 'Free Cancellation',
    nonRefundable: 'Non-refundable',
    breakfast: 'Breakfast Included',
    reviews: 'reviews',
    excellent: 'Excellent',
    veryGood: 'Very Good',
    good: 'Good',
    save: 'SAVE',
    bookedToday: 'booked today',
    viewing: 'viewing now',
    lastBooked: 'Last booked',
    popularChoice: 'Popular Choice',
    limitedAvailability: 'Only',
    left: 'left!',
    showRates: 'Show Rates',
    hideRates: 'Hide Rates',
  },
  pt: {
    perNight: 'por noite',
    total: 'Total',
    nights: 'noites',
    viewDetails: 'Ver Detalhes',
    selectRoom: 'Selecionar Quarto',
    freeCancellation: 'Cancelamento Grátis',
    nonRefundable: 'Não reembolsável',
    breakfast: 'Café da Manhã Incluído',
    reviews: 'avaliações',
    excellent: 'Excelente',
    veryGood: 'Muito Bom',
    good: 'Bom',
    save: 'ECONOMIZE',
    bookedToday: 'reservas hoje',
    viewing: 'visualizando agora',
    lastBooked: 'Última reserva',
    popularChoice: 'Escolha Popular',
    limitedAvailability: 'Apenas',
    left: 'restantes!',
    showRates: 'Mostrar Tarifas',
    hideRates: 'Ocultar Tarifas',
  },
  es: {
    perNight: 'por noche',
    total: 'Total',
    nights: 'noches',
    viewDetails: 'Ver Detalles',
    selectRoom: 'Seleccionar Habitación',
    freeCancellation: 'Cancelación Gratis',
    nonRefundable: 'No reembolsable',
    breakfast: 'Desayuno Incluido',
    reviews: 'reseñas',
    excellent: 'Excelente',
    veryGood: 'Muy Bueno',
    good: 'Bueno',
    save: 'AHORRA',
    bookedToday: 'reservas hoy',
    viewing: 'viendo ahora',
    lastBooked: 'Última reserva',
    popularChoice: 'Elección Popular',
    limitedAvailability: 'Solo',
    left: 'disponibles!',
    showRates: 'Mostrar Tarifas',
    hideRates: 'Ocultar Tarifas',
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

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % hotel.photos.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + hotel.photos.length) % hotel.photos.length);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Implement share functionality
  };

  // Get best rate (lowest price)
  const bestRate = hotel.rates.reduce((prev, curr) =>
    parseFloat(curr.total_amount) < parseFloat(prev.total_amount) ? curr : prev
  );

  const totalPrice = parseFloat(bestRate.total_amount) * nights;
  const pricePerNight = parseFloat(bestRate.total_amount);

  // Calculate savings if public rate comparison exists
  const savings = bestRate.public_rate_comparison
    ? parseFloat(bestRate.public_rate_comparison) - pricePerNight
    : 0;
  const savingsPercentage = savings > 0
    ? Math.round((savings / parseFloat(bestRate.public_rate_comparison!)) * 100)
    : 0;

  // Get review category
  const getReviewCategory = (score: number) => {
    if (score >= 9.0) return { text: t.excellent, color: 'text-green-700', bg: 'bg-green-600' };
    if (score >= 8.0) return { text: t.veryGood, color: 'text-blue-700', bg: 'bg-blue-600' };
    return { text: t.good, color: 'text-gray-700', bg: 'bg-gray-600' };
  };

  const reviewCategory = getReviewCategory(hotel.reviews.score);

  // Count limited availability rooms
  const limitedRooms = hotel.rates.filter(r => r.available_quantity <= 2).length;

  return (
    <div
      data-hotel-card
      data-hotel-id={hotel.id}
      className="group relative bg-white rounded-xl border-2 border-slate-200/80 hover:border-primary-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      {/* MAIN CONTENT - Photo Left | All Info Right (ULTRA COMPACT HORIZONTAL LAYOUT) */}
      <div className="flex flex-col md:flex-row">
        {/* Image Carousel - Left Side (LARGER - Full height) */}
        <div className="relative w-full md:w-80 h-48 md:h-auto flex-shrink-0 overflow-hidden">
          {/* Deal Badge */}
          {bestRate.deal_type && (
            <div className="absolute top-2 left-2 z-10">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold shadow-lg ${
                bestRate.deal_type === 'loyalty' ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' :
                bestRate.deal_type === 'corporate' ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white' :
                bestRate.deal_type === 'mobile' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' :
                bestRate.deal_type === 'seasonal' ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white' :
                'bg-gradient-to-r from-red-500 to-pink-600 text-white'
              }`}>
                {bestRate.deal_type === 'loyalty' && '⭐ Loyalty'}
                {bestRate.deal_type === 'corporate' && '💼 Corporate'}
                {bestRate.deal_type === 'mobile' && '📱 Mobile'}
                {bestRate.deal_type === 'seasonal' && '🎉 Seasonal'}
                {bestRate.deal_type === 'promotion' && '🔥 Promo'}
              </span>
            </div>
          )}

          {/* Quick Actions - Top Right of Photo */}
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
            <button
              onClick={handleFavorite}
              className={`p-2.5 md:p-2 min-w-[44px] min-h-[44px] rounded-full backdrop-blur-md transition-all ${
                isFavorited
                  ? 'bg-red-500 text-white'
                  : 'bg-white/90 text-slate-600 hover:bg-red-50 hover:text-red-500'
              }`}
              title="Save to favorites"
            >
              <Heart className={`w-5 h-5 md:w-4 md:h-4 ${isFavorited ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 md:p-2 min-w-[44px] min-h-[44px] rounded-full backdrop-blur-md transition-all bg-white/90 text-slate-600 hover:bg-blue-50 hover:text-blue-600"
              title="Share this hotel"
            >
              <Share2 className="w-5 h-5 md:w-4 md:h-4" />
            </button>
          </div>

          {/* Image */}
          <img
            src={hotel.photos[currentImageIndex]}
            alt={hotel.name}
            className="w-full h-full object-cover"
          />

          {/* Image Navigation */}
          {hotel.photos.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 p-2.5 md:p-2 min-w-[44px] min-h-[44px] rounded-full bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-5 h-5 md:w-4 md:h-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2.5 md:p-2 min-w-[44px] min-h-[44px] rounded-full bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-5 h-5 md:w-4 md:h-4" />
              </button>

              {/* Image Indicators */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {hotel.photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      index === currentImageIndex
                        ? 'bg-white w-4'
                        : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* ALL INFO - Right Side (ENHANCED HIERARCHY & READABILITY) */}
        <div className="flex-1 p-3 flex flex-col">
          {/* HEADER - Hotel Name, Stars, Rating, Badges */}
          <div className="mb-2">
            {/* Row 1: Hotel Name + Star Rating */}
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="font-extrabold text-slate-900 leading-tight flex-1" style={{ fontSize: '18px' }}>
                {hotel.name}
              </h3>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                {Array.from({ length: hotel.star_rating }, (_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>

            {/* Row 2: Review Score + Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className={`${reviewCategory.bg} text-white px-2 py-0.5 rounded font-bold text-sm`}>
                  {hotel.reviews.score}
                </div>
                <span className={`font-semibold ${reviewCategory.color} text-sm`}>
                  {reviewCategory.text}
                </span>
              </div>

              {/* Popular Choice Badge */}
              {hotel.booking_stats.popular_choice && (
                <span className="font-bold text-orange-600 px-2 py-0.5 bg-orange-50 rounded text-xs">
                  🔥 {t.popularChoice}
                </span>
              )}

              {/* Limited Availability Badge */}
              {limitedRooms > 0 && (
                <span className="font-bold text-red-600 px-2 py-0.5 bg-red-50 rounded text-xs">
                  ⚠️ {limitedRooms} {t.left}
                </span>
              )}
            </div>
          </div>

          {/* DETAILS - Location + Reviews */}
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="flex items-start gap-1.5 flex-1 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-slate-800 text-sm font-medium leading-snug truncate">{hotel.address}</p>
                {hotel.distance_to_center && (
                  <p className="text-slate-500 text-xs leading-relaxed">{hotel.distance_to_center}</p>
                )}
              </div>
            </div>

            {/* Reviews Count */}
            <div className="flex items-center gap-1 text-sm text-slate-700 leading-snug flex-shrink-0">
              <Users className="w-3.5 h-3.5" />
              <span className="font-semibold">{hotel.reviews.count.toLocaleString()}</span>
            </div>
          </div>

          {/* AMENITIES + CANCELLATION */}
          <div className="flex items-center justify-between gap-2 mb-1.5 pb-1.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5 flex-wrap">
              {hotel.amenities.includes('wifi') && (
                <span className="inline-flex items-center gap-1 text-sm text-green-700 font-semibold">
                  <Wifi className="w-3.5 h-3.5" />WiFi
                </span>
              )}
              {hotel.amenities.includes('breakfast') && (
                <span className="inline-flex items-center gap-1 text-sm text-slate-700 font-semibold">
                  <Coffee className="w-3.5 h-3.5" />Breakfast
                </span>
              )}
              {hotel.amenities.includes('gym') && (
                <span className="inline-flex items-center gap-1 text-sm text-slate-700 font-semibold">
                  <Dumbbell className="w-3.5 h-3.5" />Gym
                </span>
              )}
              {hotel.amenities.includes('parking') && (
                <span className="inline-flex items-center gap-1 text-sm text-slate-700 font-semibold">
                  <Car className="w-3.5 h-3.5" />Parking
                </span>
              )}
            </div>

            {bestRate.refundable && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold flex-shrink-0">
                <Check className="w-3.5 h-3.5" />
                {t.freeCancellation}
              </span>
            )}
          </div>

          {/* URGENCY SIGNALS - Social Proof */}
          <div className="flex flex-col gap-1.5 mb-2">
            <div className="flex items-center gap-3 text-sm flex-wrap">
              {hotel.booking_stats.booked_today > 0 && (
                <span className="inline-flex items-center gap-1 font-medium text-blue-700">
                  <Check className="w-3.5 h-3.5" />
                  <span className="font-bold">{hotel.booking_stats.booked_today}</span> {t.bookedToday}
                </span>
              )}

              {hotel.booking_stats.viewing_now > 0 && (
                <span className="inline-flex items-center gap-1 font-medium text-orange-700">
                  <Users className="w-3.5 h-3.5" />
                  <span className="font-bold">{hotel.booking_stats.viewing_now}</span> {t.viewing}
                </span>
              )}

              {hotel.booking_stats.last_booked && (
                <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                  <Clock className="w-3.5 h-3.5" />
                  {t.lastBooked} {hotel.booking_stats.last_booked}
                </span>
              )}
            </div>

            {hotel.reviews.recent_comments && hotel.reviews.recent_comments.length > 0 && (
              <div className="text-sm text-slate-600 italic leading-relaxed">
                "{hotel.reviews.recent_comments[0]}"
              </div>
            )}
          </div>

          {/* PRICE + ACTIONS - Bottom of right column */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200 mt-auto">
        {/* Left: Price */}
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            {/* Savings Display */}
            {savings > 0 && bestRate.public_rate_comparison && (
              <span className="text-slate-400 line-through text-sm leading-none">
                ${Math.round(parseFloat(bestRate.public_rate_comparison))}
              </span>
            )}
            <span className="font-extrabold text-slate-900" style={{ fontSize: '22px', lineHeight: '1' }}>
              ${Math.round(pricePerNight)}
            </span>
            <span className="text-slate-600 text-sm leading-none font-medium">
              {t.perNight}
            </span>
            {/* Savings Badge */}
            {savingsPercentage > 0 && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 font-bold rounded text-sm leading-none">
                {t.save} {savingsPercentage}%
              </span>
            )}
          </div>
          <div className="text-slate-700 text-sm leading-relaxed">
            {t.total}: <span className="font-bold text-slate-900">${Math.round(totalPrice)}</span> <span className="text-slate-500">({nights} {t.nights})</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2.5 py-1.5 bg-white border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:border-primary-500 hover:text-primary-600 transition-all flex items-center gap-1 text-sm"
          >
            {isExpanded ? t.hideRates : t.showRates} {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => onSelect(hotel.id, bestRate.id)}
            className="px-4 py-2 font-bold rounded-lg transition-all whitespace-nowrap bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-700 hover:to-secondary-700 hover:shadow-lg active:scale-95 text-sm"
          >
            {t.selectRoom} →
          </button>
        </div>
      </div>
        </div>
      </div>

      {/* EXPANDED RATES - All available rates */}
      {isExpanded && (
        <div className="px-3 py-2 border-t border-gray-200 space-y-2 bg-gray-50 animate-slideDown">
          <h4 className="text-sm font-bold text-gray-900 mb-2">All Available Rates</h4>
          {hotel.rates.map((rate) => {
            const rateTotal = parseFloat(rate.total_amount) * nights;
            const ratePerNight = parseFloat(rate.total_amount);
            const rateSavings = rate.public_rate_comparison
              ? parseFloat(rate.public_rate_comparison) - ratePerNight
              : 0;

            return (
              <div key={rate.id} className="p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-primary-300 transition-all">
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Rate Details */}
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 text-sm mb-1">{rate.name}</h5>

                    {/* Rate Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {/* Board Type */}
                      {rate.board_type !== 'room_only' && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                          {rate.board_type === 'breakfast' && '☕ Breakfast'}
                          {rate.board_type === 'half_board' && '🍽️ Half Board'}
                          {rate.board_type === 'full_board' && '🍽️ Full Board'}
                          {rate.board_type === 'all_inclusive' && '🌟 All Inclusive'}
                        </span>
                      )}

                      {/* Refundable */}
                      {rate.refundable ? (
                        <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                          ✅ {t.freeCancellation}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded-full text-xs font-medium">
                          ❌ {t.nonRefundable}
                        </span>
                      )}

                      {/* Payment Type */}
                      {rate.payment_type === 'pay_later' && (
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                          💳 Pay Later
                        </span>
                      )}

                      {/* Deal Type */}
                      {rate.deal_type && (
                        <span className="px-2 py-0.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-full text-xs font-bold">
                          {rate.deal_type === 'loyalty' && '⭐ Loyalty'}
                          {rate.deal_type === 'corporate' && '💼 Corporate'}
                          {rate.deal_type === 'mobile' && '📱 Mobile'}
                          {rate.deal_type === 'seasonal' && '🎉 Seasonal'}
                        </span>
                      )}

                      {/* Limited Availability */}
                      {rate.available_quantity <= 2 && (
                        <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded-full text-xs font-bold">
                          ⚠️ Only {rate.available_quantity} left!
                        </span>
                      )}
                    </div>

                    {/* Benefits */}
                    {rate.benefits && rate.benefits.length > 0 && (
                      <ul className="text-xs text-gray-600 space-y-0.5 mb-2">
                        {rate.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center gap-1">
                            <Check className="w-3 h-3 text-green-600" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Loyalty Points */}
                    {rate.loyalty_points_earned && (
                      <div className="text-xs text-purple-700 font-medium">
                        ⭐ Earn {rate.loyalty_points_earned.toLocaleString()} {rate.loyalty_program} points
                      </div>
                    )}
                  </div>

                  {/* Right: Price + Select */}
                  <div className="text-right flex flex-col items-end gap-2">
                    <div>
                      {rateSavings > 0 && rate.public_rate_comparison && (
                        <div className="text-xs text-gray-400 line-through mb-0.5">
                          ${Math.round(parseFloat(rate.public_rate_comparison))} {t.perNight}
                        </div>
                      )}
                      <div className="font-bold text-gray-900 text-lg">
                        ${Math.round(ratePerNight)}
                      </div>
                      <div className="text-xs text-gray-600">{t.perNight}</div>
                      <div className="text-xs text-gray-700 font-semibold mt-1">
                        {t.total}: ${Math.round(rateTotal)}
                      </div>
                    </div>
                    <button
                      onClick={() => onSelect(hotel.id, rate.id)}
                      className="px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold rounded-lg hover:shadow-lg transition-all text-sm"
                    >
                      Select →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* View Full Details Button */}
          <button
            onClick={() => onViewDetails(hotel.id)}
            className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-primary-500 hover:text-primary-600 transition-all text-sm"
          >
            {t.viewDetails}
          </button>
        </div>
      )}
    </div>
  );
}
