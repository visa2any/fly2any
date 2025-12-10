'use client';

import { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import {
  Star, MapPin, ChevronLeft, ChevronRight, Heart, Share2,
  Coffee, Shield, Loader2, Wifi, Waves, Dumbbell, Car, ChevronRight as ArrowRight,
  Sparkles, UtensilsCrossed, Wind, PawPrint, BarChart2
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
  en: { perNight: '/nt', nights: 'n', bookNow: 'Book', view: 'View', freeCancel: 'Free', exceptional: 'Exceptional', excellent: 'Excellent', veryGood: 'Very Good', good: 'Good', breakfast: 'Bkfst' },
  pt: { perNight: '/nt', nights: 'n', bookNow: 'Reservar', view: 'Ver', freeCancel: 'Grátis', exceptional: 'Excepcional', excellent: 'Excelente', veryGood: 'Muito Bom', good: 'Bom', breakfast: 'Café' },
  es: { perNight: '/nt', nights: 'n', bookNow: 'Reservar', view: 'Ver', freeCancel: 'Gratis', exceptional: 'Excepcional', excellent: 'Excelente', veryGood: 'Muy Bueno', good: 'Bueno', breakfast: 'Desay' },
};

// Extended amenity detection
const detectAmenities = (amenities: string[] | undefined) => {
  if (!amenities?.length) return { wifi: false, pool: false, gym: false, parking: false, spa: false, restaurant: false, ac: false, pet: false };
  const lower = amenities.map(a => a.toLowerCase());
  return {
    wifi: lower.some(a => a.includes('wifi') || a.includes('internet') || a.includes('wi-fi')),
    pool: lower.some(a => a.includes('pool') || a.includes('swimming')),
    gym: lower.some(a => a.includes('gym') || a.includes('fitness') || a.includes('exercise')),
    parking: lower.some(a => a.includes('parking') || a.includes('garage')),
    spa: lower.some(a => a.includes('spa') || a.includes('massage') || a.includes('sauna')),
    restaurant: lower.some(a => a.includes('restaurant') || a.includes('dining') || a.includes('bar')),
    ac: lower.some(a => a.includes('air condition') || a.includes('a/c') || a.includes('climate')),
    pet: lower.some(a => a.includes('pet') || a.includes('dog') || a.includes('animal')),
  };
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
  const [showArrows, setShowArrows] = useState(false);
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
  const initialImages = rawImages.length > 0 ? rawImages : hotel.thumbnail ? [{ url: hotel.thumbnail, alt: hotel.name || 'Hotel' }] : [{ url: '/images/hotel-placeholder.jpg', alt: 'Hotel placeholder' }];
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

  const handleFavorite = (e: React.MouseEvent) => { e.stopPropagation(); setIsFavorited(!isFavorited); };
  const handleShare = (e: React.MouseEvent) => { e.stopPropagation(); if (navigator.share) navigator.share({ title: hotel.name, url: window.location.href }); };

  const rates = (hotel.rates || []).filter((rate) => rate?.totalPrice?.amount);
  const bestRate = rates.length > 0 ? rates.reduce((prev, curr) => parseFloat(curr.totalPrice?.amount || '999999') < parseFloat(prev.totalPrice?.amount || '999999') ? curr : prev) : null;

  const perNightPrice = hotel.lowestPricePerNight ? hotel.lowestPricePerNight / (rooms || 1) : hotel.lowestPrice?.amount ? parseFloat(hotel.lowestPrice.amount) / nights / (rooms || 1) : bestRate?.totalPrice?.amount ? parseFloat(bestRate.totalPrice.amount) / nights / (rooms || 1) : 0;
  const totalPrice = hotel.lowestPrice?.amount ? parseFloat(hotel.lowestPrice.amount) : bestRate?.totalPrice?.amount ? parseFloat(bestRate.totalPrice.amount) : perNightPrice * nights;
  const currency = hotel.lowestPrice?.currency || bestRate?.totalPrice?.currency || 'USD';

  const boardType = bestRate?.boardType || (hotel as any).boardType;
  const hasBreakfast = boardType && ['BB', 'HB', 'FB', 'AI', 'BI', 'breakfast', 'half_board', 'full_board', 'all_inclusive'].includes(boardType.toLowerCase?.() || boardType);
  const hasFreeCancellation = bestRate?.refundable === true || (hotel as any).refundable === true;

  const getReviewCategory = (score: number) => {
    if (score >= 9.0) return { text: t.exceptional, bg: 'bg-emerald-500' };
    if (score >= 8.0) return { text: t.excellent, bg: 'bg-blue-500' };
    if (score >= 7.0) return { text: t.veryGood, bg: 'bg-indigo-500' };
    return { text: t.good, bg: 'bg-slate-500' };
  };
  const reviewCategory = getReviewCategory(hotel.reviewScore || 0);

  // Memoize amenities detection
  const amenities = useMemo(() => detectAmenities(hotel.amenities), [hotel.amenities]);

  const currencySymbol = { 'USD': '$', 'EUR': '€', 'GBP': '£', 'BRL': 'R$' }[currency] || currency + ' ';
  const handleBooking = () => { if (bestRate) onSelect(hotel.id, bestRate.id, bestRate.offerId); else onViewDetails(hotel.id); };

  // Brief arrow flash on mobile tap
  const flashArrows = useCallback(() => {
    if (images.length > 1) {
      setShowArrows(true);
      setTimeout(() => setShowArrows(false), 800);
    }
  }, [images.length]);

  return (
    <article
      data-hotel-card
      data-hotel-id={hotel.id}
      className="group bg-white rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer active:scale-[0.98]"
      style={{ boxShadow: '0 2px 12px -4px rgba(0,0,0,0.15)' }}
    >
      {/* MOBILE: Clean Photo-First Card - No overlay on photo */}
      <div className="sm:hidden flex flex-col" onMouseEnter={fetchImages}>
        {/* Photo Section - 100% clean, no gradients */}
        <div className="relative w-full aspect-[16/10] overflow-hidden rounded-t-xl">
          <Image
            src={images[currentImageIndex]?.url || '/images/hotel-placeholder.jpg'}
            alt={images[currentImageIndex]?.alt || hotel.name}
            fill
            className="object-cover"
            style={{ filter: 'contrast(1.02) saturate(1.05)' }}
            sizes="100vw"
            priority={currentImageIndex === 0}
            placeholder="blur"
            blurDataURL={getBlurDataURL(images[currentImageIndex]?.url || '', 400, 300)}
            quality={85}
            onError={(e) => { (e.target as HTMLImageElement).src = '/images/hotel-placeholder.jpg'; }}
          />

          {/* Minimal top gradient for icon visibility only */}
          <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/25 to-transparent pointer-events-none" />

          {/* Top-left: Glass rating badge */}
          {hotel.reviewScore > 0 && (
            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm">
              <span className="text-[#1d1d1f] text-xs font-bold">{hotel.reviewScore.toFixed(1)}</span>
              {hotel.rating > 0 && (
                <div className="flex">
                  {Array.from({ length: Math.min(hotel.rating, 5) }, (_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Top-right: Action icons */}
          <div className="absolute top-2 right-2 flex gap-1 z-10">
            <button onClick={handleFavorite}
              className={`p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-all active:scale-90 ${isFavorited ? 'text-rose-500' : 'text-[#1d1d1f]'}`}>
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
            <button onClick={handleShare} className="p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm text-[#1d1d1f] transition-all active:scale-90">
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Swipe indicator dots - shows there are more photos */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {images.slice(0, Math.min(images.length, 5)).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentImageIndex ? 'bg-white w-3' : 'bg-white/50'
                  }`}
                />
              ))}
              {images.length > 5 && <span className="text-white/70 text-[8px] ml-0.5">+{images.length - 5}</span>}
            </div>
          )}

          {/* Invisible touch zones for nav */}
          {images.length > 1 && (
            <>
              <div onClick={(e) => { e.stopPropagation(); prevImage(e); flashArrows(); }}
                className="absolute left-0 top-0 w-1/3 h-full z-10" />
              <div onClick={(e) => { e.stopPropagation(); nextImage(e); flashArrows(); }}
                className="absolute right-0 top-0 w-1/3 h-full z-10" />
              {/* Arrows - flash on tap */}
              <div className={`absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-white/90 shadow-sm text-[#1d1d1f] transition-opacity duration-300 ${showArrows ? 'opacity-100' : 'opacity-0'}`}>
                <ChevronLeft className="w-4 h-4" />
              </div>
              <div className={`absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-white/90 shadow-sm text-[#1d1d1f] transition-opacity duration-300 ${showArrows ? 'opacity-100' : 'opacity-0'}`}>
                <ChevronRight className="w-4 h-4" />
              </div>
            </>
          )}

          {/* Center tap = view details */}
          <div onClick={() => onViewDetails(hotel.id)} className="absolute left-1/3 right-1/3 top-0 bottom-0 z-5" />

          {isLoadingImages && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-20">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Info Section - Clean card below photo */}
        <div onClick={() => onViewDetails(hotel.id)} className="bg-white px-3 py-2.5 rounded-b-xl border-t border-slate-100">
          {/* Row 1: Name + Price */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-[14px] text-[#1d1d1f] leading-tight line-clamp-1 tracking-tight flex-1">
              {hotel.name}
            </h3>
            {perNightPrice > 0 && (
              <div className="flex items-baseline gap-0.5 flex-shrink-0">
                <span className="font-bold text-[15px] text-[#1d1d1f]">{currencySymbol}{Math.round(perNightPrice)}</span>
                <span className="text-[10px] text-[#86868b]">{t.perNight}</span>
              </div>
            )}
          </div>

          {/* Row 2: Location + Amenities + Badges + CTA */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto scrollbar-hide">
              {/* Location */}
              {hotel.location?.city && (
                <span className="text-[10px] text-[#86868b] font-medium flex items-center gap-0.5 flex-shrink-0">
                  <MapPin className="w-2.5 h-2.5" />
                  <span className="truncate max-w-[45px]">{hotel.location.city}</span>
                </span>
              )}
              {/* Divider */}
              <span className="text-[#e5e5e5]">·</span>
              {/* Amenity icons - expanded */}
              <div className="flex items-center gap-0.5 text-[#86868b] flex-shrink-0">
                {amenities.wifi && <Wifi className="w-3 h-3" />}
                {amenities.pool && <Waves className="w-3 h-3" />}
                {amenities.gym && <Dumbbell className="w-3 h-3" />}
                {amenities.spa && <Sparkles className="w-3 h-3" />}
                {amenities.restaurant && <UtensilsCrossed className="w-3 h-3" />}
                {amenities.parking && <Car className="w-3 h-3" />}
                {amenities.ac && <Wind className="w-3 h-3" />}
                {amenities.pet && <PawPrint className="w-3 h-3" />}
              </div>
              {/* Badges */}
              {hasFreeCancellation && (
                <span className="px-1 py-0.5 bg-emerald-50 rounded text-[8px] font-semibold text-emerald-600 flex-shrink-0">
                  ✓Free
                </span>
              )}
              {hasBreakfast && (
                <span className="px-1 py-0.5 bg-amber-50 rounded text-[8px] font-semibold text-amber-600 flex-shrink-0">
                  🍳
                </span>
              )}
            </div>
            {/* CTA */}
            <button onClick={(e) => { e.stopPropagation(); handleBooking(); }}
              className="px-3 py-1.5 rounded-lg bg-[#0071e3] text-white text-[11px] font-semibold shadow-sm active:scale-95 transition-transform flex-shrink-0">
              {t.bookNow}
            </button>
          </div>
        </div>
      </div>

      {/* TABLET/DESKTOP: Horizontal layout (unchanged logic, optimized) */}
      <div className="hidden sm:flex flex-row" onClick={() => onViewDetails(hotel.id)}>
        <div className="relative w-[220px] min-w-[220px] lg:w-[320px] lg:min-w-[320px] h-[160px] lg:h-[190px] flex-shrink-0 overflow-hidden bg-slate-100" onMouseEnter={fetchImages}>
          <Image
            src={images[currentImageIndex]?.url || '/images/hotel-placeholder.jpg'}
            alt={images[currentImageIndex]?.alt || hotel.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 1024px) 220px, 320px"
            priority={currentImageIndex === 0}
            placeholder="blur"
            blurDataURL={getBlurDataURL(images[currentImageIndex]?.url || '', 320, 240)}
            quality={85}
            onError={(e) => { (e.target as HTMLImageElement).src = '/images/hotel-placeholder.jpg'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Action icons */}
          <div className="absolute top-2 right-2 flex gap-1.5 z-10">
            <button onClick={handleCompare} disabled={!canAddMore && !isComparing}
              className={`p-1.5 rounded-full bg-black/30 backdrop-blur-sm transition-all ${isComparing ? 'text-primary-400' : 'text-white'}`}>
              <BarChart2 className="w-4 h-4" />
            </button>
            <button onClick={handleFavorite} className={`p-1.5 rounded-full bg-black/30 backdrop-blur-sm ${isFavorited ? 'text-rose-500' : 'text-white'}`}>
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
            <button onClick={handleShare} className="p-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white">
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Nav arrows - desktop hover */}
          {images.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded-md">
                <span className="text-white text-[10px]">{currentImageIndex + 1}/{images.length}</span>
              </div>
            </>
          )}

          {/* Rating */}
          {hotel.reviewScore > 0 && (
            <div className={`absolute bottom-2 right-2 ${reviewCategory.bg} text-white px-2 py-1 rounded-lg text-sm font-bold`}>
              {hotel.reviewScore.toFixed(1)}
            </div>
          )}

          {isLoadingImages && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-3 lg:p-4 flex flex-col min-w-0 bg-[#FAFBFC]">
          <div className="mb-1.5">
            <h3 className="font-semibold text-[#1d1d1f] text-sm lg:text-base leading-tight line-clamp-2 mb-1 tracking-tight">{hotel.name}</h3>
            <div className="flex items-center gap-2">
              {hotel.rating > 0 && (
                <div className="flex">{Array.from({ length: Math.min(hotel.rating, 5) }, (_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}</div>
              )}
              {hotel.location?.city && (
                <span className="text-[#86868b] text-xs flex items-center gap-0.5">
                  <MapPin className="w-3 h-3" />{hotel.location.city}
                </span>
              )}
            </div>
          </div>

          {/* Amenities + Badges row */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {/* Amenity icons - expanded */}
            <div className="flex items-center gap-1.5 text-[#86868b]">
              {amenities.wifi && <Wifi className="w-3.5 h-3.5" />}
              {amenities.pool && <Waves className="w-3.5 h-3.5" />}
              {amenities.gym && <Dumbbell className="w-3.5 h-3.5" />}
              {amenities.spa && <Sparkles className="w-3.5 h-3.5" />}
              {amenities.restaurant && <UtensilsCrossed className="w-3.5 h-3.5" />}
              {amenities.parking && <Car className="w-3.5 h-3.5" />}
              {amenities.ac && <Wind className="w-3.5 h-3.5" />}
              {amenities.pet && <PawPrint className="w-3.5 h-3.5" />}
            </div>
            {hasFreeCancellation && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-emerald-100 rounded-md text-[10px] font-semibold text-emerald-700">
                <Shield className="w-3 h-3" />{t.freeCancel}
              </span>
            )}
            {hasBreakfast && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-amber-100 rounded-md text-[10px] font-semibold text-amber-700">
                <Coffee className="w-3 h-3" />{t.breakfast}
              </span>
            )}
          </div>

          <div className="flex-1" />

          <div className="flex items-end justify-between gap-2">
            <div>
              {perNightPrice > 0 ? (
                <>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-xl lg:text-2xl font-bold text-[#1d1d1f]">{currencySymbol}{Math.round(perNightPrice)}</span>
                    <span className="text-[10px] text-[#86868b]">{t.perNight}</span>
                  </div>
                  <div className="text-[10px] text-[#86868b]">{currencySymbol}{Math.round(totalPrice).toLocaleString()} · {nights}{t.nights}</div>
                </>
              ) : <span className="text-xs text-[#86868b]">Check availability</span>}
            </div>
            <button onClick={(e) => { e.stopPropagation(); handleBooking(); }}
              className="px-4 py-2 font-semibold text-xs rounded-xl bg-[#0071e3] text-white shadow-[0_2px_8px_-2px_rgba(0,113,227,0.4)] active:scale-95 transition-transform">
              {perNightPrice > 0 ? t.bookNow : t.view}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
