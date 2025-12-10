'use client';

import { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import {
  Star, MapPin, ChevronLeft, ChevronRight, Heart, Share2,
  Coffee, Shield, Loader2, BarChart2
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
  en: { perNight: '/nt', nights: 'n', bookNow: 'Book', view: 'View', freeCancel: 'Free Cancel', exceptional: 'Exceptional', excellent: 'Excellent', veryGood: 'Very Good', good: 'Good', breakfast: 'Bkfst' },
  pt: { perNight: '/nt', nights: 'n', bookNow: 'Reservar', view: 'Ver', freeCancel: 'Cancela Grátis', exceptional: 'Excepcional', excellent: 'Excelente', veryGood: 'Muito Bom', good: 'Bom', breakfast: 'Café' },
  es: { perNight: '/nt', nights: 'n', bookNow: 'Reservar', view: 'Ver', freeCancel: 'Cancela Gratis', exceptional: 'Excepcional', excellent: 'Excelente', veryGood: 'Muy Bueno', good: 'Bueno', breakfast: 'Desay' },
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
    if (score >= 9.0) return { text: t.exceptional, color: 'text-emerald-600', bg: 'bg-emerald-500' };
    if (score >= 8.0) return { text: t.excellent, color: 'text-blue-600', bg: 'bg-blue-500' };
    if (score >= 7.0) return { text: t.veryGood, color: 'text-indigo-600', bg: 'bg-indigo-500' };
    return { text: t.good, color: 'text-slate-600', bg: 'bg-slate-500' };
  };
  const reviewCategory = getReviewCategory(hotel.reviewScore || 0);

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
      {/* MOBILE: Full-bleed vertical card - 10% taller */}
      <div className="sm:hidden relative w-full aspect-[4/3.3] overflow-hidden" onMouseEnter={fetchImages}>
        <Image
          src={images[currentImageIndex]?.url || '/images/hotel-placeholder.jpg'}
          alt={images[currentImageIndex]?.alt || hotel.name}
          fill
          className="object-cover"
          sizes="100vw"
          priority={currentImageIndex === 0}
          placeholder="blur"
          blurDataURL={getBlurDataURL(images[currentImageIndex]?.url || '', 400, 300)}
          quality={80}
          onError={(e) => { (e.target as HTMLImageElement).src = '/images/hotel-placeholder.jpg'; }}
        />

        {/* Minimal top gradient for icons */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent" />

        {/* Bottom gradient for info - thin */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />

        {/* Top-left: Rating badge */}
        {hotel.reviewScore > 0 && (
          <div className={`absolute top-2.5 left-2.5 ${reviewCategory.bg} text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg`}>
            {hotel.reviewScore.toFixed(1)}
          </div>
        )}

        {/* Top-right: Action icons */}
        <div className="absolute top-2.5 right-2.5 flex gap-1.5 z-10">
          <button onClick={handleCompare} disabled={!canAddMore && !isComparing}
            className={`p-1.5 rounded-full bg-black/30 backdrop-blur-sm ${isComparing ? 'text-primary-400' : 'text-white'} ${!canAddMore && !isComparing ? 'opacity-40' : ''}`}>
            <BarChart2 className="w-4 h-4" />
          </button>
          <button onClick={handleFavorite}
            className={`p-1.5 rounded-full bg-black/30 backdrop-blur-sm ${isFavorited ? 'text-rose-500' : 'text-white'}`}>
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
          <button onClick={handleShare} className="p-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white">
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Invisible touch zones for image nav */}
        {images.length > 1 && (
          <>
            <div onClick={(e) => { e.stopPropagation(); prevImage(e); flashArrows(); }}
              className="absolute left-0 top-0 w-1/4 h-full z-10 cursor-pointer" />
            <div onClick={(e) => { e.stopPropagation(); nextImage(e); flashArrows(); }}
              className="absolute right-0 top-0 w-1/4 h-full z-10 cursor-pointer" />
            {/* Arrows - show on hover/flash */}
            <div className={`absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-black/40 text-white transition-opacity duration-300 ${showArrows ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              <ChevronLeft className="w-4 h-4" />
            </div>
            <div className={`absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-black/40 text-white transition-opacity duration-300 ${showArrows ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              <ChevronRight className="w-4 h-4" />
            </div>
          </>
        )}

        {/* Center tap area - opens details */}
        <div onClick={() => onViewDetails(hotel.id)} className="absolute left-1/4 right-1/4 top-0 bottom-0 z-5" />

        {/* Bottom info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
          {/* Row 1: Name + Stars */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-white text-sm leading-tight line-clamp-1 flex-1" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
              {hotel.name}
            </h3>
            {hotel.rating > 0 && (
              <div className="flex items-center flex-shrink-0">
                {Array.from({ length: Math.min(hotel.rating, 5) }, (_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
            )}
          </div>

          {/* Row 2: Location + Badges + Price + CTA */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              {hotel.location?.city && (
                <span className="text-white/90 text-[11px] flex items-center gap-0.5 truncate">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate max-w-[60px]">{hotel.location.city}</span>
                </span>
              )}
              {hasFreeCancellation && (
                <span className="px-1.5 py-0.5 bg-emerald-500/90 rounded text-[9px] font-semibold text-white flex items-center gap-0.5">
                  <Shield className="w-2.5 h-2.5" />
                  Free
                </span>
              )}
              {hasBreakfast && (
                <span className="px-1.5 py-0.5 bg-amber-500/90 rounded text-[9px] font-semibold text-white flex items-center gap-0.5">
                  <Coffee className="w-2.5 h-2.5" />
                </span>
              )}
              {/* Image counter */}
              {images.length > 1 && (
                <span className="text-white/70 text-[10px] ml-auto">{currentImageIndex + 1}/{images.length}</span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {perNightPrice > 0 && (
                <span className="text-white font-bold text-base" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                  {currencySymbol}{Math.round(perNightPrice)}<span className="text-[10px] font-normal text-white/80">{t.perNight}</span>
                </span>
              )}
              <button onClick={(e) => { e.stopPropagation(); handleBooking(); }}
                className="px-3 py-1.5 bg-primary-500 text-white text-xs font-bold rounded-lg shadow-lg active:scale-95 transition-transform">
                {perNightPrice > 0 ? t.bookNow : t.view}
              </button>
            </div>
          </div>
        </div>

        {isLoadingImages && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
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
            <h3 className="font-bold text-slate-900 text-sm lg:text-base leading-tight line-clamp-2 mb-1">{hotel.name}</h3>
            <div className="flex items-center gap-2">
              {hotel.rating > 0 && (
                <div className="flex">{Array.from({ length: Math.min(hotel.rating, 5) }, (_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}</div>
              )}
              {hotel.location?.city && (
                <span className="text-slate-500 text-xs flex items-center gap-0.5">
                  <MapPin className="w-3 h-3 text-primary-500" />{hotel.location.city}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            {hasFreeCancellation && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-emerald-100 rounded text-[10px] font-semibold text-emerald-700">
                <Shield className="w-3 h-3" />{t.freeCancel}
              </span>
            )}
            {hasBreakfast && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-amber-100 rounded text-[10px] font-semibold text-amber-700">
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
                    <span className="text-xl lg:text-2xl font-black text-slate-900">{currencySymbol}{Math.round(perNightPrice)}</span>
                    <span className="text-[10px] text-slate-500">{t.perNight}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">{currencySymbol}{Math.round(totalPrice).toLocaleString()} · {nights}{t.nights}</div>
                </>
              ) : <span className="text-xs text-slate-500">Check availability</span>}
            </div>
            <button onClick={(e) => { e.stopPropagation(); handleBooking(); }}
              className={`px-4 py-1.5 font-bold text-xs rounded-lg transition-all active:scale-95 shadow-sm ${
                perNightPrice > 0 ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
              {perNightPrice > 0 ? t.bookNow : t.view}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
