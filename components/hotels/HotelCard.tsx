'use client';

import { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import {
  Star, MapPin, ChevronLeft, ChevronRight, Heart, Share2,
  Users, Coffee, Shield, Wifi, Waves, Dumbbell, Car, Loader2, BarChart2
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
  en: { perNight: '/night', nights: 'n', bookNow: 'Book Now', view: 'View', freeCancel: 'Free Cancel', reviews: 'reviews', exceptional: 'Exceptional', excellent: 'Excellent', veryGood: 'Very Good', good: 'Good', breakfast: 'Breakfast', total: 'total' },
  pt: { perNight: '/noite', nights: 'n', bookNow: 'Reservar', view: 'Ver', freeCancel: 'Cancela Grátis', reviews: 'avaliações', exceptional: 'Excepcional', excellent: 'Excelente', veryGood: 'Muito Bom', good: 'Bom', breakfast: 'Café', total: 'total' },
  es: { perNight: '/noche', nights: 'n', bookNow: 'Reservar', view: 'Ver', freeCancel: 'Cancela Gratis', reviews: 'reseñas', exceptional: 'Excepcional', excellent: 'Excelente', veryGood: 'Muy Bueno', good: 'Bueno', breakfast: 'Desayuno', total: 'total' },
};

// Amenity icon mapping
const amenityIcons: Record<string, { icon: any; label: string }> = {
  wifi: { icon: Wifi, label: 'WiFi' },
  pool: { icon: Waves, label: 'Pool' },
  gym: { icon: Dumbbell, label: 'Gym' },
  parking: { icon: Car, label: 'Parking' },
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

  // Extract top amenities from hotel data
  const topAmenities = useMemo(() => {
    if (!hotel.amenities?.length) return [];
    const found: { icon: any; label: string }[] = [];
    const lower = hotel.amenities.map(a => a.toLowerCase());
    if (lower.some(a => a.includes('wifi') || a.includes('internet'))) found.push(amenityIcons.wifi);
    if (lower.some(a => a.includes('pool') || a.includes('swimming'))) found.push(amenityIcons.pool);
    if (lower.some(a => a.includes('gym') || a.includes('fitness'))) found.push(amenityIcons.gym);
    if (lower.some(a => a.includes('parking'))) found.push(amenityIcons.parking);
    return found.slice(0, 4);
  }, [hotel.amenities]);

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

  return (
    <article
      data-hotel-card
      data-hotel-id={hotel.id}
      onClick={() => onViewDetails(hotel.id)}
      className="group bg-white rounded-none sm:rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer active:scale-[0.995] hover:shadow-xl"
      style={{ boxShadow: '0 4px 20px -6px rgba(0,0,0,0.12)' }}
    >
      {/* HORIZONTAL LAYOUT */}
      <div className="flex flex-row">

        {/* IMAGE SECTION - 20% wider, immersive */}
        <div
          className="relative w-[165px] min-w-[165px] sm:w-[200px] sm:min-w-[200px] lg:w-[320px] lg:min-w-[320px] aspect-[4/5] sm:aspect-[4/4] lg:aspect-[4/3] flex-shrink-0 overflow-hidden bg-slate-100"
          onMouseEnter={fetchImages}
        >
          <Image
            src={images[currentImageIndex]?.url || '/images/hotel-placeholder.jpg'}
            alt={images[currentImageIndex]?.alt || hotel.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 165px, (max-width: 1024px) 200px, 320px"
            priority={currentImageIndex === 0}
            placeholder="blur"
            blurDataURL={getBlurDataURL(images[currentImageIndex]?.url || '', 320, 240)}
            quality={85}
            onError={(e) => { (e.target as HTMLImageElement).src = '/images/hotel-placeholder.jpg'; }}
          />

          {/* Bottom gradient for legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

          {/* Subtle floating action icons - NO white circles */}
          <div className="absolute top-2 right-2 flex gap-1.5 z-10">
            <button
              onClick={handleCompare}
              disabled={!canAddMore && !isComparing}
              className={`p-2 rounded-xl backdrop-blur-md transition-all duration-200 shadow-lg ${
                isComparing
                  ? 'bg-primary-500/90 text-white'
                  : 'bg-black/20 text-white hover:bg-black/40'
              } ${!canAddMore && !isComparing ? 'opacity-40' : ''}`}
            >
              <BarChart2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleFavorite}
              className={`p-2 rounded-xl backdrop-blur-md transition-all duration-200 shadow-lg ${
                isFavorited
                  ? 'bg-rose-500/90 text-white scale-110'
                  : 'bg-black/20 text-white hover:bg-black/40'
              }`}
            >
              <Heart className={`w-4 h-4 transition-transform ${isFavorited ? 'fill-current scale-110' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-all duration-200 shadow-lg"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Image navigation - subtle, modern */}
          {images.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-xl bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 active:scale-90 transition-all z-10 shadow-lg">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-xl bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 active:scale-90 transition-all z-10 shadow-lg">
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Image counter - bottom left, subtle */}
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-lg z-10">
            <span className="text-white text-[10px] font-medium">{currentImageIndex + 1}/{images.length}</span>
          </div>

          {/* Rating badge - bottom right, prominent */}
          {hotel.reviewScore > 0 && (
            <div className="absolute bottom-2 right-2 z-10">
              <div className={`${reviewCategory.bg} text-white px-2.5 py-1.5 rounded-xl text-sm font-black shadow-lg backdrop-blur-sm`}>
                {hotel.reviewScore.toFixed(1)}
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isLoadingImages && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* CONTENT SECTION - Clean hierarchy */}
        <div className="flex-1 p-3 sm:p-4 flex flex-col min-w-0 overflow-hidden bg-[#FAFBFC]">

          {/* Row 1: Hotel Name + Stars */}
          <div className="mb-1.5">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base lg:text-lg leading-snug line-clamp-2 mb-1">
              {hotel.name}
            </h3>
            <div className="flex items-center gap-2">
              {hotel.rating > 0 && (
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: Math.min(hotel.rating || 0, 5) }, (_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              )}
              {hotel.location?.city && (
                <div className="flex items-center gap-1 text-slate-500">
                  <MapPin className="w-3 h-3 text-primary-500" />
                  <span className="text-[11px] sm:text-xs truncate max-w-[100px] sm:max-w-[150px]">{hotel.location.city}</span>
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Key badges - horizontal */}
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            {hasFreeCancellation && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 rounded-lg text-[10px] sm:text-[11px] font-semibold text-emerald-700">
                <Shield className="w-3 h-3" />
                {t.freeCancel}
              </span>
            )}
            {hasBreakfast && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 rounded-lg text-[10px] sm:text-[11px] font-semibold text-amber-700">
                <Coffee className="w-3 h-3" />
                {t.breakfast}
              </span>
            )}
            {bestRate?.maxOccupancy && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-lg text-[10px] sm:text-[11px] font-medium text-slate-600">
                <Users className="w-3 h-3" />
                {bestRate.maxOccupancy}
              </span>
            )}
          </div>

          {/* Row 3: Amenities strip */}
          {topAmenities.length > 0 && (
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
              {topAmenities.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-1 text-slate-500" title={amenity.label}>
                  <amenity.icon className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-medium hidden sm:inline">{amenity.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Row 4: Price block + CTA */}
          <div className="flex items-end justify-between gap-2">
            <div>
              {perNightPrice > 0 ? (
                <>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">{currencySymbol}{Math.round(perNightPrice)}</span>
                    <span className="text-[10px] sm:text-xs text-slate-500 font-medium">{t.perNight}</span>
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-400">
                    {currencySymbol}{Math.round(totalPrice).toLocaleString()} {t.total} · {nights}{t.nights}
                  </div>
                </>
              ) : (
                <span className="text-sm text-slate-500">Check availability</span>
              )}
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); handleBooking(); }}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 font-bold text-[11px] sm:text-xs rounded-lg transition-all duration-200 active:scale-95 shadow-md flex-shrink-0 ${
                perNightPrice > 0
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {perNightPrice > 0 ? t.bookNow : t.view}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
