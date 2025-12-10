'use client';

import { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import {
  Star, MapPin, ChevronLeft, ChevronRight, Heart, Share2, Check,
  Users, Coffee, Shield, Sparkles, Utensils, Bed, Loader2, BarChart2
} from 'lucide-react';
import { useHotelCompare } from '@/contexts/HotelCompareContext';
import { getBlurDataURL } from '@/lib/utils/image-optimization';
import type { LiteAPIHotel } from '@/lib/hotels/types';

export interface HotelCardProps {
  hotel: LiteAPIHotel;
  checkIn: string;
  checkOut: string;
  adults: number;
  children?: number;
  rooms?: number;
  nights: number;
  onSelect: (hotelId: string, rateId: string, offerId: string) => void;
  onViewDetails: (hotelId: string) => void;
  lang?: 'en' | 'pt' | 'es';
  searchLat?: number;
  searchLng?: number;
}

const translations = {
  en: {
    perNight: '/night',
    total: 'total',
    nights: 'nights',
    bookNow: 'Book Now',
    viewDetails: 'View',
    freeCancellation: 'Free Cancel',
    nonRefundable: 'Non-refund',
    reviews: 'reviews',
    exceptional: 'Exceptional',
    excellent: 'Excellent',
    veryGood: 'Very Good',
    good: 'Good',
    breakfast: 'Breakfast',
  },
  pt: {
    perNight: '/noite',
    total: 'total',
    nights: 'noites',
    bookNow: 'Reservar',
    viewDetails: 'Ver',
    freeCancellation: 'Cancela Grátis',
    nonRefundable: 'Não reemb.',
    reviews: 'avaliações',
    exceptional: 'Excepcional',
    excellent: 'Excelente',
    veryGood: 'Muito Bom',
    good: 'Bom',
    breakfast: 'Café',
  },
  es: {
    perNight: '/noche',
    total: 'total',
    nights: 'noches',
    bookNow: 'Reservar',
    viewDetails: 'Ver',
    freeCancellation: 'Cancela Gratis',
    nonRefundable: 'No reemb.',
    reviews: 'reseñas',
    exceptional: 'Excepcional',
    excellent: 'Excelente',
    veryGood: 'Muy Bueno',
    good: 'Bueno',
    breakfast: 'Desayuno',
  },
};

export function HotelCard({
  hotel,
  rooms = 1,
  nights,
  onSelect,
  onViewDetails,
  lang = 'en',
}: HotelCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Array<{ url: string; alt: string }>>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [hasLoadedImages, setHasLoadedImages] = useState(false);
  const t = translations[lang];

  const { addToCompare, removeFromCompare, isInCompare, canAddMore } = useHotelCompare();
  const isComparing = isInCompare(hotel.id);

  const handleCompare = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isComparing) removeFromCompare(hotel.id);
    else if (canAddMore) addToCompare(hotel);
  }, [hotel, isComparing, addToCompare, removeFromCompare, canAddMore]);

  const fetchImages = useCallback(async () => {
    if (hasLoadedImages || isLoadingImages) return;
    setIsLoadingImages(true);
    try {
      const response = await fetch(`/api/hotels/${hotel.id}/images`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.length > 0) {
          setLoadedImages(data.data);
          setCurrentImageIndex(0);
        }
      }
    } catch (error) {
      console.warn('Failed to load hotel images:', error);
    } finally {
      setIsLoadingImages(false);
      setHasLoadedImages(true);
    }
  }, [hotel.id, hasLoadedImages, isLoadingImages]);

  if (!hotel?.id) return null;

  const rawImages = hotel.images?.filter((img) => img?.url) || [];
  const initialImages = rawImages.length > 0
    ? rawImages
    : hotel.thumbnail
      ? [{ url: hotel.thumbnail, alt: hotel.name || 'Hotel' }]
      : [{ url: '/images/hotel-placeholder.jpg', alt: 'Hotel placeholder' }];
  const images = loadedImages.length > 0 ? loadedImages : initialImages;

  const nextImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasLoadedImages && !isLoadingImages) await fetchImages();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasLoadedImages && !isLoadingImages) await fetchImages();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: hotel.name, text: `Check out ${hotel.name}`, url: window.location.href });
    }
  };

  const rates = (hotel.rates || []).filter((rate) => rate?.totalPrice?.amount);
  const bestRate = rates.length > 0
    ? rates.reduce((prev, curr) => {
        const prevPrice = parseFloat(prev.totalPrice?.amount || '999999');
        const currPrice = parseFloat(curr.totalPrice?.amount || '999999');
        return currPrice < prevPrice ? curr : prev;
      })
    : null;

  const perNightPrice = hotel.lowestPricePerNight
    ? hotel.lowestPricePerNight / (rooms || 1)
    : hotel.lowestPrice?.amount
      ? parseFloat(hotel.lowestPrice.amount) / nights / (rooms || 1)
      : bestRate?.totalPrice?.amount
        ? parseFloat(bestRate.totalPrice.amount) / nights / (rooms || 1)
        : 0;

  const totalPrice = hotel.lowestPrice?.amount
    ? parseFloat(hotel.lowestPrice.amount)
    : bestRate?.totalPrice?.amount
      ? parseFloat(bestRate.totalPrice.amount)
      : perNightPrice * nights;

  const currency = hotel.lowestPrice?.currency || bestRate?.totalPrice?.currency || 'USD';
  const boardTypeToCheck = bestRate?.boardType || (hotel as any).boardType;
  const hasBreakfast = boardTypeToCheck && ['BB', 'HB', 'FB', 'AI', 'BI', 'breakfast', 'half_board', 'full_board', 'all_inclusive'].includes(boardTypeToCheck.toLowerCase?.() || boardTypeToCheck);
  const hasFreeCancellation = bestRate?.refundable === true || (hotel as any).refundable === true;

  const getReviewCategory = (score: number) => {
    if (score >= 9.0) return { text: t.exceptional, bg: 'bg-emerald-500' };
    if (score >= 8.0) return { text: t.excellent, bg: 'bg-blue-500' };
    if (score >= 7.0) return { text: t.veryGood, bg: 'bg-indigo-500' };
    return { text: t.good, bg: 'bg-slate-500' };
  };
  const reviewCategory = getReviewCategory(hotel.reviewScore || 0);

  const getCurrencySymbol = (curr: string) => {
    const symbols: Record<string, string> = { 'USD': '$', 'EUR': '€', 'GBP': '£', 'BRL': 'R$' };
    return symbols[curr] || curr + ' ';
  };
  const currencySymbol = getCurrencySymbol(currency);

  const handleBooking = () => {
    if (bestRate) onSelect(hotel.id, bestRate.id, bestRate.offerId);
    else onViewDetails(hotel.id);
  };

  return (
    <article
      data-hotel-card
      data-hotel-id={hotel.id}
      onClick={() => onViewDetails(hotel.id)}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-200/60 hover:border-primary-300 transition-all duration-300 cursor-pointer active:scale-[0.99]"
      style={{ boxShadow: '0 2px 12px -4px rgba(0,0,0,0.08)' }}
    >
      {/* MOBILE: Vertical Layout | DESKTOP: Horizontal */}
      <div className="flex flex-col lg:flex-row">

        {/* IMAGE SECTION - Full width on mobile, fixed width on desktop */}
        <div
          className="relative w-full h-44 sm:h-48 lg:w-72 lg:h-auto lg:min-h-[180px] flex-shrink-0 overflow-hidden bg-slate-100"
          onMouseEnter={fetchImages}
        >
          <Image
            src={images[currentImageIndex]?.url || '/images/hotel-placeholder.jpg'}
            alt={images[currentImageIndex]?.alt || hotel.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 288px"
            priority={currentImageIndex === 0}
            placeholder="blur"
            blurDataURL={getBlurDataURL(images[currentImageIndex]?.url || '', 400, 200)}
            quality={80}
            onError={(e) => { (e.target as HTMLImageElement).src = '/images/hotel-placeholder.jpg'; }}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Top-right action buttons - compact chips */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
            <button
              onClick={handleCompare}
              disabled={!canAddMore && !isComparing}
              className={`p-1.5 rounded-full backdrop-blur-sm transition-all shadow-sm ${
                isComparing ? 'bg-primary-500 text-white' : 'bg-white/80 text-slate-600 hover:bg-white'
              } ${!canAddMore && !isComparing ? 'opacity-40' : ''}`}
              aria-label="Compare"
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFavorite}
              className={`p-1.5 rounded-full backdrop-blur-sm transition-all shadow-sm ${
                isFavorited ? 'bg-rose-500 text-white' : 'bg-white/80 text-slate-600 hover:bg-white'
              }`}
              aria-label="Favorite"
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-1.5 rounded-full bg-white/80 backdrop-blur-sm text-slate-600 hover:bg-white transition-all shadow-sm"
              aria-label="Share"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Image navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-white/90 shadow-md active:scale-95 transition-all z-10"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4 text-slate-700" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-white/90 shadow-md active:scale-95 transition-all z-10"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4 text-slate-700" />
              </button>
            </>
          )}

          {/* Image counter - bottom left */}
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md z-10">
            <span className="text-white text-[10px] font-semibold">{currentImageIndex + 1}/{images.length}</span>
          </div>

          {/* Loading indicator */}
          {isLoadingImages && (
            <div className="absolute bottom-2 right-2 p-1 bg-black/60 rounded-full z-10">
              <Loader2 className="w-3 h-3 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* CONTENT SECTION */}
        <div className="flex-1 p-3 sm:p-4 flex flex-col min-w-0">

          {/* Row 1: Name + Rating Badge */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 flex-1">
              {hotel.name}
            </h3>
            {hotel.reviewScore > 0 && (
              <div className="flex-shrink-0 flex items-center gap-1.5">
                <div className={`${reviewCategory.bg} text-white px-2 py-1 rounded-lg text-xs font-black shadow-sm`}>
                  {hotel.reviewScore.toFixed(1)}
                </div>
                <div className="hidden sm:block">
                  <div className="text-[10px] font-bold text-slate-700 leading-tight">{reviewCategory.text}</div>
                  {hotel.reviewCount > 0 && (
                    <div className="text-[9px] text-slate-400">
                      {hotel.reviewCount > 999 ? `${(hotel.reviewCount/1000).toFixed(1)}k` : hotel.reviewCount} {t.reviews}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Row 2: Stars + Location */}
          <div className="flex items-center gap-2 mb-2">
            {hotel.rating > 0 && (
              <div className="flex items-center">
                {Array.from({ length: Math.min(hotel.rating || 0, 5) }, (_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
            )}
            {hotel.location?.city && (
              <div className="flex items-center gap-0.5 text-slate-500 text-xs">
                <MapPin className="w-3 h-3 text-primary-500 flex-shrink-0" />
                <span className="truncate max-w-[140px]">{hotel.location.city}</span>
              </div>
            )}
          </div>

          {/* Row 3: Badges - horizontal scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0 mb-3">
            {hasFreeCancellation && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-[10px] font-bold text-emerald-700 flex-shrink-0">
                <Shield className="w-3 h-3" />
                {t.freeCancellation}
              </span>
            )}
            {hasBreakfast && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded-lg text-[10px] font-bold text-amber-700 flex-shrink-0">
                <Coffee className="w-3 h-3" />
                {t.breakfast}
              </span>
            )}
            {bestRate?.maxOccupancy && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-medium text-slate-600 flex-shrink-0">
                <Users className="w-3 h-3" />
                {bestRate.maxOccupancy}
              </span>
            )}
            {bestRate?.roomType && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 border border-indigo-200 rounded-lg text-[10px] font-medium text-indigo-700 flex-shrink-0 max-w-[160px] truncate">
                <Bed className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{bestRate.roomType}</span>
              </span>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Row 4: Price + CTA */}
          <div className="flex items-end justify-between gap-3 pt-2 border-t border-slate-100">
            <div>
              {perNightPrice > 0 ? (
                <>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-black text-slate-900">
                      {currencySymbol}{Math.round(perNightPrice)}
                    </span>
                    <span className="text-xs text-slate-500">{t.perNight}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {currencySymbol}{Math.round(totalPrice).toLocaleString()} · {nights} {t.nights}
                  </div>
                </>
              ) : (
                <span className="text-sm text-slate-500">Check availability</span>
              )}
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); handleBooking(); }}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 font-bold text-xs sm:text-sm rounded-xl transition-all active:scale-95 shadow-md flex-shrink-0 ${
                perNightPrice > 0
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {perNightPrice > 0 ? t.bookNow : t.viewDetails}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
