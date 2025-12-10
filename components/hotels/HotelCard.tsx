'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
  Star, MapPin, ChevronLeft, ChevronRight, Heart, Share2,
  Coffee, Shield, Loader2, Wifi, Waves, Dumbbell, Car, ChevronRight as ArrowRight,
  Sparkles, UtensilsCrossed, Wind, PawPrint, BarChart2, Users, Receipt, ChevronUp
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
  en: { perNight: '/nt', nights: 'n', bookNow: 'Book', view: 'View', freeCancel: 'Free', exceptional: 'Exceptional', excellent: 'Excellent', veryGood: 'Very Good', good: 'Good', breakfast: 'Bkfst', guests: 'guests', inclTax: 'incl. tax', exclTax: 'excl. tax', adult: 'adult', child: 'child' },
  pt: { perNight: '/nt', nights: 'n', bookNow: 'Reservar', view: 'Ver', freeCancel: 'Grátis', exceptional: 'Excepcional', excellent: 'Excelente', veryGood: 'Muito Bom', good: 'Bom', breakfast: 'Café', guests: 'hóspedes', inclTax: 'c/ taxas', exclTax: 's/ taxas', adult: 'adulto', child: 'criança' },
  es: { perNight: '/nt', nights: 'n', bookNow: 'Reservar', view: 'Ver', freeCancel: 'Gratis', exceptional: 'Excepcional', excellent: 'Excelente', veryGood: 'Muy Bueno', good: 'Bueno', breakfast: 'Desay', guests: 'huéspedes', inclTax: 'c/ imp.', exclTax: 's/ imp.', adult: 'adulto', child: 'niño' },
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
  adults,
  children = 0,
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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  // Collapsible overlay state
  const [overlayCollapsed, setOverlayCollapsed] = useState(false);
  const autoExpandTimerRef = useRef<NodeJS.Timeout | null>(null);
  const t = translations[lang];

  // Auto-expand overlay after 6 seconds
  const scheduleAutoExpand = useCallback(() => {
    if (autoExpandTimerRef.current) {
      clearTimeout(autoExpandTimerRef.current);
    }
    autoExpandTimerRef.current = setTimeout(() => {
      setOverlayCollapsed(false);
    }, 6000);
  }, []);

  // Collapse overlay when swiping photos
  const collapseOverlay = useCallback(() => {
    setOverlayCollapsed(true);
    scheduleAutoExpand();
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(10);
  }, [scheduleAutoExpand]);

  // Expand overlay immediately (user interaction)
  const expandOverlay = useCallback(() => {
    if (autoExpandTimerRef.current) {
      clearTimeout(autoExpandTimerRef.current);
    }
    setOverlayCollapsed(false);
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(20);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoExpandTimerRef.current) {
        clearTimeout(autoExpandTimerRef.current);
      }
    };
  }, []);

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

  // Show swipe hint for first-time users
  useEffect(() => {
    if (images.length > 1 && typeof window !== 'undefined') {
      const hasSeenHint = localStorage.getItem('fly2any_swipe_hint_shown');
      if (!hasSeenHint) {
        setShowSwipeHint(true);
        const timer = setTimeout(() => {
          setShowSwipeHint(false);
          localStorage.setItem('fly2any_swipe_hint_shown', 'true');
        }, 4000);
        return () => clearTimeout(timer);
      }
    }
  }, [images.length]);

  // Image navigation with crossfade transition
  const changeImage = useCallback((direction: 'next' | 'prev') => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex((prev) =>
        direction === 'next'
          ? (prev + 1) % images.length
          : (prev - 1 + images.length) % images.length
      );
      setTimeout(() => setIsTransitioning(false), 50);
    }, 150);
  }, [images.length, isTransitioning]);

  const nextImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasLoadedImages && !isLoadingImages) await fetchImages();
    changeImage('next');
  };

  const prevImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasLoadedImages && !isLoadingImages) await fetchImages();
    changeImage('prev');
  };

  const handleFavorite = (e: React.MouseEvent) => { e.stopPropagation(); setIsFavorited(!isFavorited); };

  // Double-tap to favorite handler with single-tap fallback to view details
  const singleTapTimeoutRef = useCallback(() => {
    // This will be called if only single tap (view details)
    onViewDetails(hotel.id);
  }, [hotel.id, onViewDetails]);

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap < 300) {
      // Double tap detected - toggle favorite with haptic feedback
      setIsFavorited(prev => !prev);
      if (navigator.vibrate) navigator.vibrate(50);
      setLastTap(0); // Reset to prevent triple-tap issues
    } else {
      // First tap - wait to see if double tap follows
      setLastTap(now);
      setTimeout(() => {
        // If lastTap hasn't been reset (no double tap), navigate to details
        if (Date.now() - now >= 280) {
          singleTapTimeoutRef();
        }
      }, 300);
    }
  }, [lastTap, singleTapTimeoutRef]);
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

  // Swipe handlers for touch devices with crossfade
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = async (e: React.TouchEvent) => {
    if (touchStart === null || images.length <= 1) {
      setTouchStart(null);
      setTouchStartY(null);
      return;
    }
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStart - touchEndX;
    const diffY = touchStartY !== null ? touchStartY - touchEndY : 0;
    const threshold = 50; // minimum swipe distance

    // Horizontal swipe - change image and collapse overlay
    if (Math.abs(diffX) > threshold && Math.abs(diffX) > Math.abs(diffY)) {
      if (!hasLoadedImages && !isLoadingImages) await fetchImages();
      // Use crossfade transition
      changeImage(diffX > 0 ? 'next' : 'prev');
      flashArrows();
      // Collapse overlay when swiping photos
      collapseOverlay();
      // Hide swipe hint after first successful swipe
      if (showSwipeHint) {
        setShowSwipeHint(false);
        localStorage.setItem('fly2any_swipe_hint_shown', 'true');
      }
    }
    setTouchStart(null);
    setTouchStartY(null);
  };

  // Handle swipe up on collapsed bar to expand
  const handleOverlayDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // If user drags up more than 30px, expand the overlay
    if (info.offset.y < -30) {
      expandOverlay();
    }
  };

  return (
    <article
      data-hotel-card
      data-hotel-id={hotel.id}
      className="group bg-white rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer active:scale-[0.98]"
      style={{ boxShadow: '0 2px 12px -4px rgba(0,0,0,0.15)' }}
    >
      {/* MOBILE: Full-bleed photo with shadow-based overlay (no gradients) */}
      <div
        className="sm:hidden relative w-full aspect-[16/11] overflow-hidden"
        onMouseEnter={fetchImages}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Image with crossfade transition */}
        <Image
          src={images[currentImageIndex]?.url || '/images/hotel-placeholder.jpg'}
          alt={images[currentImageIndex]?.alt || hotel.name}
          fill
          className={`object-cover transition-opacity duration-200 ease-out ${isTransitioning ? 'opacity-70' : 'opacity-100'}`}
          style={{ filter: 'contrast(1.02) saturate(1.05)' }}
          sizes="100vw"
          priority={currentImageIndex === 0}
          placeholder="blur"
          blurDataURL={getBlurDataURL(images[currentImageIndex]?.url || '', 400, 300)}
          quality={85}
          onError={(e) => { (e.target as HTMLImageElement).src = '/images/hotel-placeholder.jpg'; }}
        />

        {/* Top row: Rating (left) + Actions (right) - very top */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
          {/* Rating pill */}
          {hotel.reviewScore > 0 ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm">
              <span className="text-white text-[11px] font-bold">{hotel.reviewScore.toFixed(1)}</span>
              {hotel.rating > 0 && (
                <div className="flex">
                  {Array.from({ length: Math.min(hotel.rating, 5) }, (_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 fill-secondary-400 text-secondary-400" />
                  ))}
                </div>
              )}
            </div>
          ) : <div />}
          {/* Action icons */}
          <div className="flex gap-1" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))' }}>
            <button onClick={handleFavorite} className={`p-1.5 transition-all active:scale-90 ${isFavorited ? 'text-primary-500' : 'text-white'}`}>
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
            <button onClick={handleShare} className="p-1.5 text-white transition-all active:scale-90">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dot indicators - minimal at very bottom */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
            {images.slice(0, Math.min(images.length, 5)).map((_, idx) => (
              <div key={idx} className={`h-1 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-3' : 'bg-white/40 w-1'}`} />
            ))}
          </div>
        )}

        {/* Touch zones + always-visible arrows */}
        {images.length > 1 && (
          <>
            <div onClick={(e) => { e.stopPropagation(); prevImage(e); }} className="absolute left-0 top-0 w-1/4 h-full z-10" />
            <div onClick={(e) => { e.stopPropagation(); nextImage(e); }} className="absolute right-0 top-0 w-1/4 h-full z-10" />
            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-white/70" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))' }}>
              <ChevronLeft className="w-5 h-5" />
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))' }}>
              <ChevronRight className="w-5 h-5" />
            </div>
          </>
        )}

        {/* Center tap - single tap for details, double tap for favorite */}
        <div
          onClick={(e) => { e.stopPropagation(); handleDoubleTap(); }}
          onDoubleClick={(e) => { e.stopPropagation(); }}
          className="absolute left-1/4 right-1/4 top-0 bottom-0 z-5"
        />

        {/* Swipe hint overlay for first-time users */}
        {showSwipeHint && images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div
              className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2.5 flex items-center gap-3"
              style={{ animation: 'pulse 2s ease-in-out infinite' }}
            >
              <ChevronLeft className="w-5 h-5 text-white/80" />
              <span className="text-white text-sm font-medium">Swipe for more photos</span>
              <ChevronRight className="w-5 h-5 text-white/80" />
            </div>
          </div>
        )}

        {/* Double-tap heart animation */}
        {isFavorited && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <Heart
              className="w-16 h-16 text-rose-500 fill-current animate-ping opacity-0"
              style={{ animationDuration: '0.5s', animationIterationCount: '1' }}
            />
          </div>
        )}

        {/* Bottom info - Apple-class collapsible frosted bar */}
        <AnimatePresence mode="wait">
          {overlayCollapsed ? (
            /* Collapsed State - Minimal bar with expand hint */
            <motion.div
              key="collapsed"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              drag="y"
              dragConstraints={{ top: -40, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={handleOverlayDragEnd}
              onClick={(e) => { e.stopPropagation(); expandOverlay(); }}
              className="absolute bottom-0 left-0 right-0 z-10 cursor-pointer touch-manipulation"
            >
              <div className="bg-black/50 backdrop-blur-md rounded-t-xl" style={{ boxShadow: '0 -1px 8px rgba(0,0,0,0.15)' }}>
                {/* Compact handle + hint */}
                <div className="flex items-center justify-center gap-1.5 pt-1.5 pb-0.5">
                  <div className="w-6 h-0.5 bg-white/30 rounded-full" />
                  <ChevronUp className="w-3 h-3 text-white/50" />
                </div>
                {/* Minimal info row */}
                <div className="px-2.5 pb-1.5 flex items-center justify-between">
                  <span className="text-white font-semibold text-[11px] truncate flex-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>{hotel.name}</span>
                  {perNightPrice > 0 && (
                    <span className="font-bold text-[12px] text-secondary-200 flex-shrink-0 ml-2">{currencySymbol}{Math.round(perNightPrice)}<span className="text-[8px] text-white/50">/n</span></span>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            /* Expanded State - Full info */
            <motion.div
              key="expanded"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="absolute bottom-0 left-0 right-0 z-10 bg-black/45 backdrop-blur-md rounded-t-xl"
              style={{ boxShadow: '0 -2px 12px rgba(0,0,0,0.2)' }}
            >
              <div className="px-2.5 pt-1.5 pb-2">
                {/* Drag indicator */}
                <div className="flex justify-center mb-1">
                  <div className="w-6 h-0.5 bg-white/25 rounded-full" />
                </div>

                {/* Row 1: Name + Price */}
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <h3 className="font-semibold text-[12px] text-white truncate flex-1 flex items-center gap-1.5" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    <span className="text-secondary-300 text-[11px]">🏨</span>
                    {hotel.name}
                  </h3>
                  {perNightPrice > 0 && (
                    <span className="font-bold text-[14px] text-secondary-200 flex-shrink-0">{currencySymbol}{Math.round(perNightPrice)}<span className="text-[8px] text-white/50 font-normal">/n</span></span>
                  )}
                </div>

                {/* Row 2: Location + Total */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-white/70 text-[9px]">
                    {hotel.location?.city && (
                      <span className="flex items-center gap-0.5 truncate max-w-[100px]">
                        <MapPin className="w-2.5 h-2.5" />
                        {hotel.location.city}
                      </span>
                    )}
                    <span className="flex items-center gap-0.5">
                      <Users className="w-2.5 h-2.5" />
                      {adults + children}
                    </span>
                  </div>
                  {perNightPrice > 0 && (
                    <span className="text-[9px] text-white/60">{currencySymbol}{Math.round(totalPrice)} · {nights}n <span className="text-emerald-400">✓</span></span>
                  )}
                </div>

                {/* Row 3: Amenities + CTA */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 overflow-hidden">
                    {amenities.wifi && (
                      <div className="flex flex-col items-center flex-shrink-0">
                        <Wifi className="w-3 h-3 text-white/70" strokeWidth={2} />
                        <span className="text-[6px] text-white/40 mt-0.5">WiFi</span>
                      </div>
                    )}
                    {amenities.pool && (
                      <div className="flex flex-col items-center flex-shrink-0">
                        <Waves className="w-3 h-3 text-white/70" strokeWidth={2} />
                        <span className="text-[6px] text-white/40 mt-0.5">Pool</span>
                      </div>
                    )}
                    {amenities.gym && (
                      <div className="flex flex-col items-center flex-shrink-0">
                        <Dumbbell className="w-3 h-3 text-white/70" strokeWidth={2} />
                        <span className="text-[6px] text-white/40 mt-0.5">Gym</span>
                      </div>
                    )}
                    {amenities.parking && (
                      <div className="flex flex-col items-center flex-shrink-0">
                        <Car className="w-3 h-3 text-white/70" strokeWidth={2} />
                        <span className="text-[6px] text-white/40 mt-0.5">Park</span>
                      </div>
                    )}
                    {amenities.restaurant && (
                      <div className="flex flex-col items-center flex-shrink-0">
                        <UtensilsCrossed className="w-3 h-3 text-white/70" strokeWidth={2} />
                        <span className="text-[6px] text-white/40 mt-0.5">Food</span>
                      </div>
                    )}
                    {amenities.spa && (
                      <div className="flex flex-col items-center flex-shrink-0">
                        <Sparkles className="w-3 h-3 text-white/70" strokeWidth={2} />
                        <span className="text-[6px] text-white/40 mt-0.5">Spa</span>
                      </div>
                    )}
                    {amenities.ac && (
                      <div className="flex flex-col items-center flex-shrink-0">
                        <Wind className="w-3 h-3 text-white/70" strokeWidth={2} />
                        <span className="text-[6px] text-white/40 mt-0.5">A/C</span>
                      </div>
                    )}
                    {amenities.pet && (
                      <div className="flex flex-col items-center flex-shrink-0">
                        <PawPrint className="w-3 h-3 text-white/70" strokeWidth={2} />
                        <span className="text-[6px] text-white/40 mt-0.5">Pets</span>
                      </div>
                    )}
                    {hasFreeCancellation && (
                      <div className="flex flex-col items-center flex-shrink-0">
                        <Shield className="w-3 h-3 text-emerald-400" strokeWidth={2} />
                        <span className="text-[6px] text-emerald-400/60 mt-0.5">Free</span>
                      </div>
                    )}
                    {hasBreakfast && (
                      <div className="flex flex-col items-center flex-shrink-0">
                        <Coffee className="w-3 h-3 text-amber-400" strokeWidth={2} />
                        <span className="text-[6px] text-amber-400/60 mt-0.5">Bkfst</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleBooking(); }}
                    className="px-5 py-0.5 rounded-lg bg-primary-500 text-white text-[9px] font-bold active:scale-95 transition-transform flex-shrink-0"
                  >
                    {t.bookNow}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoadingImages && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-20">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
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
                  <div className="flex items-center gap-2 text-[10px] text-[#86868b]">
                    <span>{currencySymbol}{Math.round(totalPrice).toLocaleString()} · {nights}{t.nights}</span>
                    <span className="flex items-center gap-0.5 text-emerald-600 font-medium">
                      <Receipt className="w-3 h-3" />
                      {t.inclTax}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[#86868b] mt-0.5">
                    <Users className="w-3 h-3" />
                    <span>{adults} {adults === 1 ? t.adult : `${t.adult}s`}{children > 0 ? `, ${children} ${children === 1 ? t.child : `${t.child}s`}` : ''}</span>
                    {rooms > 1 && <span>· {rooms} rooms</span>}
                  </div>
                </>
              ) : <span className="text-xs text-[#86868b]">Check availability</span>}
            </div>
            <button onClick={(e) => { e.stopPropagation(); handleBooking(); }}
              className="px-4 py-2 font-semibold text-xs rounded-xl bg-primary-500 text-white shadow-md active:scale-95 transition-transform">
              {perNightPrice > 0 ? t.bookNow : t.view}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
