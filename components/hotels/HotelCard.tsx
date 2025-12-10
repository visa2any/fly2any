'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Star, MapPin, ChevronLeft, ChevronRight, Heart, Share2, Check,
  Users, Wifi, Coffee, Dumbbell, Car, X, Utensils, Shield, Sparkles, Award, TrendingUp,
  Waves, ParkingCircle, UtensilsCrossed, Bed, Clock, Flame, ThumbsUp, Zap, BadgePercent, Loader2,
  ChevronDown, ChevronUp, Tv, Wind, Bath, Refrigerator, Mountain, Cigarette, CigaretteOff,
  Baby, Dog, Accessibility, CalendarCheck, CalendarX, AlertCircle, Info, Ban, CheckCircle2,
  LogIn, LogOut, Timer, BarChart2
} from 'lucide-react';
import { useHotelCompare } from '@/contexts/HotelCompareContext';
import { getBlurDataURL } from '@/lib/utils/image-optimization';
import { getHotelLocationContext } from '@/lib/data/city-locations';
import type { LiteAPIHotel, LiteAPIHotelRate } from '@/lib/hotels/types';
import { Plane, Building2 } from 'lucide-react';

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
    viewDetails: 'View Details',
    selectRoom: 'Book Now',
    seeAvailability: 'See Availability',
    freeCancellation: 'Free Cancellation',
    nonRefundable: 'Non-refundable',
    reviews: 'reviews',
    exceptional: 'Exceptional',
    excellent: 'Excellent',
    veryGood: 'Very Good',
    good: 'Good',
    showRates: 'More Options',
    hideRates: 'Less',
    noRates: 'Check Dates',
    from: 'From',
    bestPrice: 'Best Price',
    instantBook: 'Instant Confirmation',
    popularChoice: 'Popular Choice',
    limitedAvail: 'Only few left!',
    breakfastIncl: 'Breakfast Included',
    verified: 'Verified',
  },
  pt: {
    perNight: '/noite',
    total: 'total',
    nights: 'noites',
    viewDetails: 'Ver Detalhes',
    selectRoom: 'Reservar',
    seeAvailability: 'Ver Disponibilidade',
    freeCancellation: 'Cancelamento Grátis',
    nonRefundable: 'Não reembolsável',
    reviews: 'avaliações',
    exceptional: 'Excepcional',
    excellent: 'Excelente',
    veryGood: 'Muito Bom',
    good: 'Bom',
    showRates: 'Mais Opções',
    hideRates: 'Menos',
    noRates: 'Ver Datas',
    from: 'De',
    bestPrice: 'Melhor Preço',
    instantBook: 'Confirmação Instantânea',
    popularChoice: 'Escolha Popular',
    limitedAvail: 'Restam poucos!',
    breakfastIncl: 'Café da Manhã Incluído',
    verified: 'Verificado',
  },
  es: {
    perNight: '/noche',
    total: 'total',
    nights: 'noches',
    viewDetails: 'Ver Detalles',
    selectRoom: 'Reservar',
    seeAvailability: 'Ver Disponibilidad',
    freeCancellation: 'Cancelación Gratis',
    nonRefundable: 'No reembolsable',
    reviews: 'reseñas',
    exceptional: 'Excepcional',
    excellent: 'Excelente',
    veryGood: 'Muy Bueno',
    good: 'Bueno',
    showRates: 'Más Opciones',
    hideRates: 'Menos',
    noRates: 'Ver Fechas',
    from: 'Desde',
    bestPrice: 'Mejor Precio',
    instantBook: 'Confirmación Instantánea',
    popularChoice: 'Elección Popular',
    limitedAvail: '¡Quedan pocos!',
    breakfastIncl: 'Desayuno Incluido',
    verified: 'Verificado',
  },
};

export function HotelCard({
  hotel,
  checkIn,
  checkOut,
  adults,
  children = 0,
  rooms = 1,
  nights,
  onSelect,
  onViewDetails,
  lang = 'en',
  searchLat,
  searchLng,
}: HotelCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Array<{ url: string; alt: string }>>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [hasLoadedImages, setHasLoadedImages] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const t = translations[lang];

  // Hotel comparison
  const { addToCompare, removeFromCompare, isInCompare, canAddMore } = useHotelCompare();
  const isComparing = isInCompare(hotel.id);

  const handleCompare = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isComparing) {
      removeFromCompare(hotel.id);
    } else if (canAddMore) {
      addToCompare(hotel);
    }
  }, [hotel, isComparing, addToCompare, removeFromCompare, canAddMore]);

  // Fetch full image gallery when user hovers on the image
  const fetchImages = useCallback(async () => {
    if (hasLoadedImages || isLoadingImages) return;

    setIsLoadingImages(true);
    try {
      const response = await fetch(`/api/hotels/${hotel.id}/images`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.length > 0) {
          setLoadedImages(data.data);
          setCurrentImageIndex(0); // Reset to first image when gallery loads
          console.log(`📸 Loaded ${data.data.length} images for ${hotel.name}`);
        }
      }
    } catch (error) {
      console.warn('Failed to load hotel images:', error);
    } finally {
      setIsLoadingImages(false);
      setHasLoadedImages(true);
    }
  }, [hotel.id, hotel.name, hasLoadedImages, isLoadingImages]);

  if (!hotel || !hotel.id) {
    console.warn('HotelCard: Invalid hotel data', hotel);
    return null;
  }

  // Calculate distance from search point
  const distance = useMemo(() => {
    if (!searchLat || !searchLng || !hotel.location?.latitude || !hotel.location?.longitude) {
      return null;
    }
    const R = 6371; // Earth's radius in km
    const dLat = (hotel.location.latitude - searchLat) * Math.PI / 180;
    const dLon = (hotel.location.longitude - searchLng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(searchLat * Math.PI / 180) * Math.cos(hotel.location.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, [searchLat, searchLng, hotel.location?.latitude, hotel.location?.longitude]);

  // Get enhanced location context (district, city center, airport distances)
  const locationContext = useMemo(() => {
    if (!hotel.location?.latitude || !hotel.location?.longitude || !hotel.location?.city) {
      return null;
    }
    return getHotelLocationContext(
      hotel.location.latitude,
      hotel.location.longitude,
      hotel.location.city,
      hotel.location.address
    );
  }, [hotel.location?.latitude, hotel.location?.longitude, hotel.location?.city, hotel.location?.address]);

  // Use loaded images if available, otherwise fallback to initial images
  const rawImages = hotel.images?.filter((img) => img && img.url) || [];
  const initialImages = rawImages.length > 0
    ? rawImages
    : hotel.thumbnail
      ? [{ url: hotel.thumbnail, alt: hotel.name || 'Hotel' }]
      : [{ url: '/images/hotel-placeholder.jpg', alt: 'Hotel placeholder' }];

  // Use dynamically loaded images if available
  const images = loadedImages.length > 0 ? loadedImages : initialImages;

  const nextImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // Trigger image fetch if not loaded yet
    if (!hasLoadedImages && !isLoadingImages) {
      await fetchImages();
    }
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // Trigger image fetch if not loaded yet
    if (!hasLoadedImages && !isLoadingImages) {
      await fetchImages();
    }
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

  // CRITICAL: LiteAPI returns TOTAL price for ALL rooms × ALL nights
  // We MUST divide by both nights AND rooms to get per-room-per-night price
  const perNightPrice = hotel.lowestPricePerNight
    ? hotel.lowestPricePerNight / (rooms || 1) // lowestPricePerNight is per-night for all rooms, divide by rooms
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

  // Check for breakfast included (use hotel-level or rate-level info)
  const boardTypeToCheck = bestRate?.boardType || (hotel as any).boardType;
  const hasBreakfast = boardTypeToCheck &&
    ['BB', 'HB', 'FB', 'AI', 'BI', 'breakfast', 'half_board', 'full_board', 'all_inclusive'].includes(boardTypeToCheck.toLowerCase());

  // Check for free cancellation (use hotel-level or rate-level info)
  const hasFreeCancellation = bestRate?.refundable === true || (hotel as any).refundable === true;

  // Get cancellation deadline if available
  const cancellationDeadline = bestRate?.cancellationDeadline || (hotel as any).cancellationDeadline;

  // Generate a pseudo-random "rooms left" number based on hotel ID (for urgency)
  const roomsLeft = useMemo(() => {
    const hash = hotel.id.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
    return Math.abs(hash % 5) + 1; // 1-5 rooms left
  }, [hotel.id]);

  // Is this a popular choice? (high review count or score)
  const isPopular = (hotel.reviewCount && hotel.reviewCount > 200) || (hotel.reviewScore && hotel.reviewScore >= 8.5);

  const getReviewCategory = (score: number) => {
    if (score >= 9.0) return { text: t.exceptional, color: 'text-white', bg: 'bg-emerald-600', gradient: 'from-emerald-500 to-emerald-700' };
    if (score >= 8.0) return { text: t.excellent, color: 'text-white', bg: 'bg-blue-600', gradient: 'from-blue-500 to-blue-700' };
    if (score >= 7.0) return { text: t.veryGood, color: 'text-white', bg: 'bg-indigo-600', gradient: 'from-indigo-500 to-indigo-700' };
    return { text: t.good, color: 'text-white', bg: 'bg-slate-500', gradient: 'from-slate-400 to-slate-600' };
  };

  const reviewCategory = getReviewCategory(hotel.reviewScore || 0);

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

  // Comprehensive amenity icon mapping
  const amenityIconMap: Record<string, { icon: any; label: string; color: string }> = {
    // Connectivity
    'wifi': { icon: Wifi, label: 'Free WiFi', color: 'text-blue-600' },
    'internet': { icon: Wifi, label: 'Internet', color: 'text-blue-600' },
    'wi-fi': { icon: Wifi, label: 'WiFi', color: 'text-blue-600' },
    // Recreation
    'pool': { icon: Waves, label: 'Pool', color: 'text-cyan-600' },
    'swimming': { icon: Waves, label: 'Swimming Pool', color: 'text-cyan-600' },
    'spa': { icon: Sparkles, label: 'Spa', color: 'text-pink-600' },
    'wellness': { icon: Sparkles, label: 'Wellness', color: 'text-pink-600' },
    'sauna': { icon: Sparkles, label: 'Sauna', color: 'text-pink-600' },
    'gym': { icon: Dumbbell, label: 'Gym', color: 'text-orange-600' },
    'fitness': { icon: Dumbbell, label: 'Fitness Center', color: 'text-orange-600' },
    // Transport
    'parking': { icon: ParkingCircle, label: 'Parking', color: 'text-slate-600' },
    'garage': { icon: Car, label: 'Garage', color: 'text-slate-600' },
    'valet': { icon: Car, label: 'Valet Parking', color: 'text-slate-600' },
    // Food & Drink
    'restaurant': { icon: UtensilsCrossed, label: 'Restaurant', color: 'text-red-600' },
    'dining': { icon: UtensilsCrossed, label: 'Dining', color: 'text-red-600' },
    'breakfast': { icon: Coffee, label: 'Breakfast', color: 'text-amber-600' },
    'bar': { icon: Coffee, label: 'Bar/Lounge', color: 'text-amber-700' },
    'room service': { icon: Utensils, label: 'Room Service', color: 'text-red-500' },
    // Room Features
    'air condition': { icon: Wind, label: 'A/C', color: 'text-teal-600' },
    'a/c': { icon: Wind, label: 'Air Conditioning', color: 'text-teal-600' },
    'ac': { icon: Wind, label: 'A/C', color: 'text-teal-600' },
    'climate': { icon: Wind, label: 'Climate Control', color: 'text-teal-600' },
    'tv': { icon: Tv, label: 'TV', color: 'text-slate-700' },
    'television': { icon: Tv, label: 'Television', color: 'text-slate-700' },
    'minibar': { icon: Refrigerator, label: 'Minibar', color: 'text-indigo-600' },
    'refrigerator': { icon: Refrigerator, label: 'Refrigerator', color: 'text-indigo-600' },
    'bath': { icon: Bath, label: 'Bathtub', color: 'text-blue-500' },
    'jacuzzi': { icon: Bath, label: 'Jacuzzi', color: 'text-blue-500' },
    // Policies
    'pet': { icon: Dog, label: 'Pet Friendly', color: 'text-amber-600' },
    'dog': { icon: Dog, label: 'Dogs Allowed', color: 'text-amber-600' },
    'non-smoking': { icon: CigaretteOff, label: 'Non-Smoking', color: 'text-emerald-600' },
    'smoking': { icon: Cigarette, label: 'Smoking Area', color: 'text-gray-500' },
    // Family
    'kids': { icon: Baby, label: 'Kids Friendly', color: 'text-pink-500' },
    'family': { icon: Users, label: 'Family Rooms', color: 'text-purple-600' },
    'babysitting': { icon: Baby, label: 'Babysitting', color: 'text-pink-500' },
    // Accessibility
    'wheelchair': { icon: Accessibility, label: 'Wheelchair Access', color: 'text-blue-600' },
    'accessible': { icon: Accessibility, label: 'Accessible', color: 'text-blue-600' },
    'elevator': { icon: Building2, label: 'Elevator', color: 'text-slate-600' },
    'lift': { icon: Building2, label: 'Elevator', color: 'text-slate-600' },
    // Views & Location
    'sea view': { icon: Mountain, label: 'Sea View', color: 'text-blue-500' },
    'ocean': { icon: Mountain, label: 'Ocean View', color: 'text-blue-500' },
    'beach': { icon: Waves, label: 'Beach Access', color: 'text-cyan-500' },
    'balcony': { icon: Mountain, label: 'Balcony', color: 'text-green-600' },
    // Services
    'concierge': { icon: Award, label: 'Concierge', color: 'text-amber-600' },
    '24-hour': { icon: Clock, label: '24/7 Service', color: 'text-slate-600' },
    'laundry': { icon: Sparkles, label: 'Laundry', color: 'text-blue-500' },
    // Default
    'default': { icon: Check, label: '', color: 'text-slate-500' },
  };

  // Get icon for any amenity
  const getAmenityIcon = (amenity: string): { icon: any; label: string; color: string } => {
    const lower = amenity.toLowerCase();
    for (const [key, value] of Object.entries(amenityIconMap)) {
      if (lower.includes(key)) {
        return { ...value, label: value.label || amenity };
      }
    }
    return { icon: Check, label: amenity, color: 'text-slate-500' };
  };

  // All amenities with icons
  const allAmenities = useMemo(() => {
    if (!hotel.amenities || hotel.amenities.length === 0) return [];
    return hotel.amenities.map(amenity => ({
      ...getAmenityIcon(amenity),
      original: amenity
    }));
  }, [hotel.amenities]);

  // Priority amenities (first 4-5 important ones)
  const priorityAmenities = useMemo(() => {
    const priorityOrder = ['wifi', 'pool', 'spa', 'gym', 'parking', 'restaurant', 'breakfast', 'air condition', 'pet'];
    const sorted = [...allAmenities].sort((a, b) => {
      const aIndex = priorityOrder.findIndex(p => a.original.toLowerCase().includes(p));
      const bIndex = priorityOrder.findIndex(p => b.original.toLowerCase().includes(p));
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
    return sorted.slice(0, 5);
  }, [allAmenities]);

  return (
    <div
      data-hotel-card
      data-hotel-id={hotel.id}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="group relative bg-white rounded-xl overflow-hidden flex flex-row transition-all duration-300 hover:shadow-xl border border-slate-200/80 hover:border-primary-300/60 min-h-[120px] lg:min-h-[200px]"
      style={{
        boxShadow: isHovering
          ? '0 20px 40px -12px rgba(239, 65, 54, 0.2), 0 8px 16px -6px rgba(0, 0, 0, 0.08)' // Brand primary red shadow
          : '0 2px 8px -2px rgba(0, 0, 0, 0.06)'
      }}
    >
      {/* 🎨 IMAGE SECTION - HORIZONTAL: Left side on ALL screens - Wider on mobile */}
      <div
        className="relative w-[130px] min-w-[130px] sm:w-[160px] sm:min-w-[160px] lg:w-[280px] lg:min-w-[280px] flex-shrink-0 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200"
        onMouseEnter={fetchImages}
        onClick={fetchImages}
      >
        {/* Action Buttons - Vertical stack on right side, clear of navigation */}
        <div className="absolute top-1.5 sm:top-2 lg:top-2.5 right-1.5 sm:right-2 lg:right-2.5 z-20 flex flex-col gap-1 lg:gap-1.5">
          <button
            onClick={handleCompare}
            disabled={!canAddMore && !isComparing}
            className={`p-1.5 lg:p-2 rounded-full transition-all touch-manipulation shadow-sm ${
              isComparing
                ? 'bg-blue-500 text-white'
                : canAddMore
                  ? 'bg-white/90 text-slate-700 hover:bg-white'
                  : 'bg-white/50 text-slate-400 cursor-not-allowed'
            }`}
            aria-label={isComparing ? 'Remove from compare' : 'Add to compare'}
          >
            <BarChart2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
          </button>
          <button
            onClick={handleFavorite}
            className={`p-1.5 lg:p-2 rounded-full transition-all touch-manipulation shadow-sm ${
              isFavorited
                ? 'bg-rose-500 text-white'
                : 'bg-white/90 text-slate-700 hover:bg-white'
            }`}
            aria-label="Favorite"
          >
            <Heart className={`w-3.5 h-3.5 lg:w-4 lg:h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            className="p-1.5 lg:p-2 rounded-full bg-white/90 text-slate-700 hover:bg-white transition-all touch-manipulation shadow-sm"
            aria-label="Share"
          >
            <Share2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
          </button>
        </div>

        {/* Top-Left Badge - Single, compact */}
        {isPopular && (
          <div className="absolute top-1 lg:top-2.5 left-1 lg:left-2.5 z-10 flex items-center gap-0.5 px-1 lg:px-1.5 py-0.5 bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded text-[7px] lg:text-[9px] font-bold uppercase shadow">
            <Flame className="w-2 h-2 lg:w-2.5 lg:h-2.5" />
            <span className="hidden sm:inline">{t.popularChoice}</span>
            <span className="sm:hidden">Popular</span>
          </div>
        )}

        {/* Image */}
        <Image
          src={images[currentImageIndex]?.url || '/images/hotel-placeholder.jpg'}
          alt={images[currentImageIndex]?.alt || hotel.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 130px, (max-width: 1024px) 160px, 280px"
          priority={currentImageIndex === 0}
          placeholder="blur"
          blurDataURL={getBlurDataURL(images[currentImageIndex]?.url || '', 260, 200)}
          quality={80}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/hotel-placeholder.jpg';
          }}
        />

        {/* Subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/10" />

        {/* Image Navigation - Always visible on mobile, better positioning */}
        <div className="flex opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
          <button
            onClick={prevImage}
            className="absolute left-1 top-[45%] -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 flex items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white active:scale-95 transition-all touch-manipulation z-10"
            aria-label="Previous"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-slate-700" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-1 top-[45%] -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 flex items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white active:scale-95 transition-all touch-manipulation z-10"
            aria-label="Next"
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-slate-700" />
          </button>
        </div>

        {/* Image Counter - Bottom left for better visibility */}
        <div className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md z-10">
          <span className="text-white text-[9px] sm:text-[10px] font-bold">{currentImageIndex + 1}/{images.length}</span>
        </div>

        {/* Loading Indicator */}
        {isLoadingImages && (
          <div className="absolute bottom-1 right-1 z-20 p-1 bg-black/60 rounded-full">
            <Loader2 className="w-3 h-3 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* 📝 CONTENT SECTION - Enhanced mobile-first design with more info */}
      <div className="flex-1 flex flex-col p-2.5 sm:p-3 lg:p-4 min-w-0 overflow-hidden">

        {/* 🏷️ HEADER: Price (most important) + Rating */}
        <div className="flex items-start justify-between gap-2 mb-1">
          {/* Price - Primary visual hierarchy on mobile */}
          {perNightPrice > 0 && (
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900">
                {currencySymbol}{Math.round(perNightPrice)}
              </span>
              <span className="text-[9px] sm:text-[10px] lg:text-xs text-slate-500">{t.perNight}</span>
            </div>
          )}

          {/* Review Score Badge - Prominent */}
          {hotel.reviewScore > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <div className={`bg-gradient-to-r ${reviewCategory.gradient} text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-black shadow-sm`}>
                {hotel.reviewScore.toFixed(1)}
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-[9px] lg:text-[10px] font-bold text-slate-700 leading-tight">{reviewCategory.text}</span>
                {hotel.reviewCount > 0 && (
                  <span className="text-[8px] lg:text-[9px] text-slate-400">
                    {hotel.reviewCount > 999 ? `${(hotel.reviewCount/1000).toFixed(1)}k` : hotel.reviewCount} {t.reviews}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Hotel Name - Secondary but important */}
        <h3 className="text-slate-900 font-bold text-[11px] sm:text-sm lg:text-base leading-tight line-clamp-2 tracking-tight mb-1">
          {hotel.name}
        </h3>

        {/* Star Rating + Location Row */}
        <div className="flex items-center gap-1.5 lg:gap-2 mb-1.5">
          {/* Star Rating */}
          {hotel.rating > 0 && (
            <div className="flex items-center gap-0.5">
              {Array.from({ length: Math.min(hotel.rating || 0, 5) }, (_, i) => (
                <Star key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
          )}

          {/* Location with icon */}
          {(hotel.location?.city || hotel.location?.country) && (
            <div className="flex items-center gap-0.5 text-slate-500">
              <MapPin className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-primary-500 flex-shrink-0" />
              <span className="text-[9px] sm:text-[10px] lg:text-xs font-medium truncate max-w-[80px] sm:max-w-[120px] lg:max-w-none">
                {hotel.location?.city || hotel.location?.country}
              </span>
            </div>
          )}
        </div>

        {/* 🛏️ Room Type - Mobile visible now */}
        {bestRate?.roomType && (
          <div className="flex items-center gap-1 mb-1.5">
            <Bed className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-500 flex-shrink-0" />
            <span className="text-[9px] sm:text-[10px] lg:text-xs text-slate-600 font-medium line-clamp-1">
              {bestRate.roomType}
            </span>
          </div>
        )}

        {/* Key Badges - Compact horizontal row */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide -mx-2.5 px-2.5 lg:mx-0 lg:px-0">
          {hasBreakfast && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 rounded-md text-[8px] sm:text-[9px] lg:text-[10px] font-bold text-amber-700 flex-shrink-0 border border-amber-200">
              <Coffee className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span>Breakfast</span>
            </span>
          )}
          {hasFreeCancellation && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 rounded-md text-[8px] sm:text-[9px] lg:text-[10px] font-bold text-emerald-700 flex-shrink-0 border border-emerald-200">
              <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Free Cancel</span>
              <span className="sm:hidden">Cancel</span>
            </span>
          )}
          {bestRate?.boardType && bestRate.boardType !== 'RO' && !hasBreakfast && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 rounded-md text-[8px] sm:text-[9px] lg:text-[10px] font-bold text-blue-700 flex-shrink-0 border border-blue-200">
              <Utensils className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              {bestRate.boardType === 'BB' ? 'Breakfast' :
               bestRate.boardType === 'HB' ? 'Half Board' :
               bestRate.boardType === 'FB' ? 'Full Board' :
               bestRate.boardType === 'AI' ? 'All Incl' : bestRate.boardType}
            </span>
          )}
          {bestRate?.maxOccupancy && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-50 rounded-md text-[8px] sm:text-[9px] lg:text-[10px] font-medium text-slate-600 flex-shrink-0 border border-slate-200">
              <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span>{bestRate.maxOccupancy}</span>
            </span>
          )}
        </div>

        {/* 📝 Hotel Description + Room Info - Desktop only for description */}
        <div className="hidden lg:block mt-2 space-y-1.5">
          {/* Short Description - Desktop only */}
          {hotel.description && (
            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed pr-32">
              {hotel.description.length > 120 ? hotel.description.substring(0, 120) + '...' : hotel.description}
            </p>
          )}

          {/* Room Type with details */}
          {bestRate?.roomType && (
            <div className="flex items-center gap-1.5">
              <Bed className="w-3 h-3 text-indigo-500 flex-shrink-0" />
              <span className="text-slate-700 text-[11px] font-medium line-clamp-1">
                {bestRate.roomType}
              </span>
              {bestRate.maxOccupancy && (
                <span className="text-slate-400 text-[10px]">· Sleeps {bestRate.maxOccupancy}</span>
              )}
            </div>
          )}

          {/* Guest Highlights based on rating */}
          {hotel.reviewScore && hotel.reviewScore >= 7 && (
            <div className="flex items-center gap-2 text-[10px]">
              <ThumbsUp className="w-3 h-3 text-emerald-500 flex-shrink-0" />
              <span className="text-slate-600">
                {hotel.reviewScore >= 9 ? 'Guests love everything about this property' :
                 hotel.reviewScore >= 8 ? 'Highly rated for cleanliness & comfort' :
                 'Great value for money'}
              </span>
            </div>
          )}
        </div>

        {/* 🏷️ AMENITIES - Ultra-compact on mobile */}
        {priorityAmenities.length > 0 && (
          <div className="hidden sm:flex items-center gap-1 mt-1.5 lg:mt-2 overflow-x-auto scrollbar-hide -mx-2 px-2 lg:mx-0 lg:px-0">
            {priorityAmenities.slice(0, 4).map((amenity, idx) => {
              const IconComponent = amenity.icon;
              return (
                <div key={idx} className="flex items-center gap-0.5 px-1 lg:px-1.5 py-0.5 bg-slate-50/80 rounded flex-shrink-0" title={amenity.original}>
                  <IconComponent className={`w-2.5 h-2.5 lg:w-3 lg:h-3 ${amenity.color}`} />
                  <span className="text-[8px] lg:text-[9px] text-slate-600 font-medium whitespace-nowrap">{amenity.label}</span>
                </div>
              );
            })}
            {allAmenities.length > 4 && (
              <span className="text-[8px] lg:text-[9px] text-slate-400 font-medium flex-shrink-0">+{allAmenities.length - 4}</span>
            )}
          </div>
        )}

        {/* Spacer for bottom alignment */}
        <div className="flex-1" />

        {/* 📱 MOBILE CTA ROW - Bottom aligned */}
        <div className="flex items-center justify-between gap-1.5 mt-1.5 lg:mt-2 pt-1.5 border-t border-slate-100/80">
          {/* Total price info */}
          <div className="flex flex-col min-w-0">
            {perNightPrice > 0 && (
              <span className="text-[8px] lg:text-[10px] text-slate-400 truncate">
                {currencySymbol}{Math.round(totalPrice)} total · {nights}n
              </span>
            )}
          </div>

          {/* CTA Button - Compact on mobile - Using brand primary red */}
          {perNightPrice > 0 ? (
            <button
              onClick={handleBooking}
              className="px-2.5 sm:px-3 lg:px-5 py-1.5 lg:py-2 font-bold text-[10px] sm:text-xs lg:text-sm rounded-lg transition-all active:scale-95 touch-manipulation whitespace-nowrap flex-shrink-0 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-sm"
            >
              Book Now
            </button>
          ) : (
            <button
              onClick={() => onViewDetails(hotel.id)}
              className="px-2.5 sm:px-3 lg:px-5 py-1.5 lg:py-2 bg-slate-100 active:bg-slate-200 text-slate-700 font-bold text-[10px] sm:text-xs lg:text-sm rounded-lg transition-all touch-manipulation whitespace-nowrap flex-shrink-0"
            >
              View
            </button>
          )}
        </div>
      </div>

      {/* Expanded Rates Section */}
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
              // LiteAPI total is for ALL rooms × ALL nights - divide by both
              const ratePerNight = parseFloat(rate.totalPrice.amount) / nights / (rooms || 1);
              const rateTotal = parseFloat(rate.totalPrice.amount);
              return (
                <div
                  key={rate.id}
                  className="p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-orange-400 hover:shadow-xl transition-all duration-300"
                >
                  <h5 className="font-bold text-slate-900 text-sm mb-2 line-clamp-1">
                    {rate.roomType}
                  </h5>

                  <div className="flex gap-1.5 flex-wrap mb-3">
                    {rate.boardType && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-bold">
                        <Utensils className="w-3 h-3" />
                        {rate.boardType}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 text-slate-700 rounded text-[10px] font-bold">
                      <Users className="w-3 h-3" />
                      {rate.maxOccupancy} guests
                    </span>
                    {rate.refundable ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold">
                        <Shield className="w-3 h-3" />
                        Free cancel
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-rose-50 text-rose-700 rounded text-[10px] font-bold">
                        Non-refundable
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-black text-slate-900 text-xl">
                          {currencySymbol}{Math.round(ratePerNight)}
                        </span>
                        <span className="text-slate-500 text-xs">{rooms > 1 ? '/room/night' : '/night'}</span>
                      </div>
                      <div className="text-slate-500 text-[10px]">
                        {currencySymbol}{Math.round(rateTotal).toLocaleString()} total
                      </div>
                    </div>
                    <button
                      onClick={() => onSelect(hotel.id, rate.id, rate.offerId)}
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-lg hover:shadow-lg hover:scale-105 active:scale-95 transition-all text-xs"
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
