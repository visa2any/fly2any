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
      className="group relative bg-white rounded-2xl overflow-hidden flex flex-row transition-all duration-300 hover:shadow-2xl border border-slate-200 hover:border-orange-300 min-h-[220px]"
      style={{
        boxShadow: isHovering
          ? '0 25px 50px -12px rgba(249, 115, 22, 0.25), 0 12px 24px -8px rgba(0, 0, 0, 0.1)'
          : '0 4px 12px -2px rgba(0, 0, 0, 0.08)'
      }}
    >
      {/* 🎨 IMAGE SECTION (LEFT SIDE) - Hover to load full gallery */}
      <div
        className="relative w-[280px] min-w-[280px] h-auto flex-shrink-0 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200"
        onMouseEnter={fetchImages}
      >
        {/* Favorite, Compare & Share Buttons */}
        <div className="absolute top-3 right-3 z-20 flex gap-2">
          {/* Compare Button */}
          <button
            onClick={handleCompare}
            disabled={!canAddMore && !isComparing}
            className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg ${
              isComparing
                ? 'bg-blue-500 text-white scale-110'
                : canAddMore
                  ? 'bg-white/90 text-slate-600 hover:bg-white hover:scale-110 hover:text-blue-500'
                  : 'bg-gray-100/80 text-gray-400 cursor-not-allowed'
            }`}
            aria-label={isComparing ? 'Remove from compare' : 'Add to compare'}
            title={isComparing ? 'Remove from compare' : canAddMore ? 'Add to compare' : 'Compare list full (max 4)'}
          >
            <BarChart2 className={`w-4 h-4 ${isComparing ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleFavorite}
            className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg ${
              isFavorited
                ? 'bg-rose-500 text-white scale-110'
                : 'bg-white/90 text-slate-600 hover:bg-white hover:scale-110 hover:text-rose-500'
            }`}
            aria-label="Favorite"
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-full backdrop-blur-md bg-white/90 text-slate-600 hover:bg-white hover:scale-110 transition-all duration-300 shadow-lg"
            aria-label="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Top-Left Badges Stack */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {/* Popular Choice Badge */}
          {isPopular && (
            <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-md shadow-lg">
              <Flame className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase tracking-wide">{t.popularChoice}</span>
            </div>
          )}

          {/* Limited Availability Urgency */}
          {roomsLeft <= 3 && perNightPrice > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded-md shadow-lg animate-pulse">
              <Clock className="w-3 h-3" />
              <span className="text-[10px] font-bold">{roomsLeft} left at this price!</span>
            </div>
          )}
        </div>

        {/* Image */}
        <Image
          src={images[currentImageIndex]?.url || '/images/hotel-placeholder.jpg'}
          alt={images[currentImageIndex]?.alt || hotel.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="280px"
          priority={currentImageIndex === 0}
          placeholder="blur"
          blurDataURL={getBlurDataURL(images[currentImageIndex]?.url || '', 280, 220)}
          quality={85}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/hotel-placeholder.jpg';
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Loading Indicator for Images */}
        {isLoadingImages && (
          <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full">
            <Loader2 className="w-3 h-3 text-white animate-spin" />
            <span className="text-white text-[10px] font-medium">Loading photos...</span>
          </div>
        )}

        {/* Image Navigation - Always Visible to allow browsing */}
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-white hover:scale-110 transition-all duration-200 border border-slate-200"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5 text-slate-700" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-white hover:scale-110 transition-all duration-200 border border-slate-200"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5 text-slate-700" />
          </button>

          {/* Image Dots - Show count indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
            {images.length > 1 ? (
              <>
                {images.slice(0, 5).map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentImageIndex
                        ? 'bg-white w-4 h-1.5'
                        : 'bg-white/50 hover:bg-white/80 w-1.5 h-1.5'
                    }`}
                    aria-label={`Image ${index + 1}`}
                  />
                ))}
                {images.length > 5 && (
                  <span className="text-white text-[10px] font-bold ml-1">+{images.length - 5}</span>
                )}
              </>
            ) : (
              <span className="text-white text-[10px] font-medium">Click arrows to view more</span>
            )}
          </div>
        </>
      </div>

      {/* 📝 CONTENT SECTION (RIGHT SIDE) */}
      <div className="flex-1 flex flex-col p-4 relative">

        {/* 💰 PRICE - TOP RIGHT (Most Prominent) */}
        {perNightPrice > 0 && (
          <div className="absolute top-3 right-4 text-right">
            <div className="flex flex-col items-end">
              {/* Per Night Price - BIG */}
              <div className="flex items-baseline gap-0.5">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {currencySymbol}{Math.round(perNightPrice).toLocaleString()}
                </span>
                <span className="text-sm font-medium text-slate-500">{t.perNight}</span>
              </div>

              {/* Total Price with Guest Info - Now includes taxes notice */}
              <div className="text-xs text-slate-500 mt-0.5">
                {currencySymbol}{Math.round(totalPrice).toLocaleString()} {t.total} · {nights} {t.nights}
              </div>
              {/* Transparent pricing indicator */}
              <div className="text-[10px] text-slate-400 mt-0.5">
                + taxes &amp; fees
              </div>

              {/* Guest Count Badge */}
              <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-600">
                <Users className="w-3 h-3" />
                <span>
                  {adults} {adults === 1 ? 'adult' : 'adults'}
                  {children > 0 && `, ${children} ${children === 1 ? 'child' : 'children'}`}
                  {rooms > 1 && <span className="text-slate-500 ml-1">({rooms} rooms)</span>}
                </span>
              </div>

              {/* Best Price Indicator */}
              <div className="flex items-center gap-1 mt-1 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-200">
                <BadgePercent className="w-3 h-3 text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-700">{t.bestPrice}</span>
              </div>
            </div>
          </div>
        )}

        {/* Hotel Name */}
        <h3 className="text-slate-900 font-bold text-lg leading-tight pr-36 line-clamp-1 tracking-tight">
          {hotel.name}
        </h3>

        {/* Rating & Location Row */}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {/* Star Rating */}
          {hotel.rating > 0 && (
            <div className="flex items-center">
              {Array.from({ length: Math.min(hotel.rating || 0, 5) }, (_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
          )}

          {/* Review Score Badge */}
          {hotel.reviewScore > 0 && (
            <div className="flex items-center gap-1.5">
              <div className={`bg-gradient-to-r ${reviewCategory.gradient} text-white px-2 py-0.5 rounded-md text-xs font-black shadow-sm`}>
                {hotel.reviewScore.toFixed(1)}
              </div>
              <span className="text-slate-700 text-xs font-semibold">
                {reviewCategory.text}
              </span>
              {hotel.reviewCount > 0 && (
                <span className="text-slate-500 text-xs">
                  ({hotel.reviewCount.toLocaleString()})
                </span>
              )}
            </div>
          )}

          {/* Enhanced Location Info - Single Row */}
          {(hotel.location?.city || hotel.location?.country) && (
            <div className="flex items-center gap-1.5 text-slate-600 flex-wrap">
              <MapPin className="w-3 h-3 text-orange-500 flex-shrink-0" />
              {/* City */}
              <span className="text-xs font-medium">
                {hotel.location?.city || hotel.location?.country}
              </span>
              {/* Popular Area Badge */}
              {locationContext?.district && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded border border-blue-200/60 text-[10px] font-semibold text-blue-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  {locationContext.district}
                </span>
              )}
              {/* Address - truncated inline */}
              {hotel.location?.address && (
                <span className="text-[10px] text-slate-400 max-w-[180px] truncate" title={hotel.location.address}>
                  · {hotel.location.address}
                </span>
              )}
              {/* Distance indicators */}
              {locationContext && (
                <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <span className="flex items-center gap-0.5" title="Distance to city center">
                    <Building2 className="w-3 h-3" />
                    {locationContext.distanceToCenter}
                  </span>
                  <span className="flex items-center gap-0.5" title={`To ${locationContext.airportCode} Airport`}>
                    <Plane className="w-3 h-3" />
                    {locationContext.driveTimeToAirport}
                  </span>
                </span>
              )}
              {!locationContext && distance !== null && distance < 50 && (
                <span className="text-[10px] text-slate-400">
                  · {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
                </span>
              )}
            </div>
          )}
        </div>

        {/* 🎯 KEY VALUE PROPOSITIONS - Decision Drivers */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {/* Breakfast Included */}
          {hasBreakfast && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 rounded border border-amber-200">
              <Coffee className="w-3 h-3 text-amber-600" />
              <span className="text-[10px] font-bold text-amber-700">{t.breakfastIncl}</span>
            </div>
          )}

          {/* Instant Confirmation */}
          {bestRate && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 rounded border border-blue-200">
              <Zap className="w-3 h-3 text-blue-600" />
              <span className="text-[10px] font-bold text-blue-700">{t.instantBook}</span>
            </div>
          )}

          {/* Board/Meal Type */}
          {bestRate?.boardType && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-50 rounded border border-slate-200">
              <Utensils className="w-3 h-3 text-slate-500" />
              <span className="text-[10px] font-bold text-slate-600">
                {bestRate.boardType === 'RO' ? 'Room Only' :
                 bestRate.boardType === 'BB' ? 'Breakfast' :
                 bestRate.boardType === 'HB' ? 'Half Board' :
                 bestRate.boardType === 'FB' ? 'Full Board' :
                 bestRate.boardType === 'AI' ? 'All Inclusive' : bestRate.boardType}
              </span>
            </div>
          )}
        </div>

        {/* 📝 Hotel Description + Room Info */}
        <div className="mt-2 space-y-1.5">
          {/* Short Description */}
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

        {/* 🏷️ AMENITIES & POLICIES SECTION */}
        <div className="mt-auto pt-3 border-t border-slate-100 space-y-2">
          {/* Priority Amenities Row */}
          {priorityAmenities.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {priorityAmenities.map((amenity, idx) => {
                const IconComponent = amenity.icon;
                return (
                  <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-md" title={amenity.original}>
                    <IconComponent className={`w-3.5 h-3.5 ${amenity.color}`} />
                    <span className="text-[10px] text-slate-600 font-medium">{amenity.label}</span>
                  </div>
                );
              })}
              {allAmenities.length > 5 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowAllAmenities(!showAllAmenities); }}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded-md text-blue-600 transition-colors"
                >
                  <span className="text-[10px] font-semibold">
                    {showAllAmenities ? 'Less' : `+${allAmenities.length - 5} more`}
                  </span>
                  {showAllAmenities ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
            </div>
          )}

          {/* Expanded All Amenities */}
          {showAllAmenities && allAmenities.length > 5 && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-2">All Amenities</div>
              <div className="flex flex-wrap gap-1.5">
                {allAmenities.map((amenity, idx) => {
                  const IconComponent = amenity.icon;
                  return (
                    <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-white rounded-md border border-slate-200" title={amenity.original}>
                      <IconComponent className={`w-3 h-3 ${amenity.color}`} />
                      <span className="text-[9px] text-slate-600">{amenity.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 📅 CHECK-IN/OUT & CANCELLATION SECTION */}
          <div className="flex items-center gap-3 flex-wrap text-[10px]">
            {/* Check-in Time (if available) */}
            {hotel.checkInTime && (
              <div className="flex items-center gap-1 text-slate-600">
                <LogIn className="w-3 h-3 text-emerald-500" />
                <span>Check-in: <span className="font-semibold">{hotel.checkInTime}</span></span>
              </div>
            )}

            {/* Check-out Time (if available) */}
            {hotel.checkOutTime && (
              <div className="flex items-center gap-1 text-slate-600">
                <LogOut className="w-3 h-3 text-red-500" />
                <span>Check-out: <span className="font-semibold">{hotel.checkOutTime}</span></span>
              </div>
            )}

            {/* Default times if not provided */}
            {!hotel.checkInTime && !hotel.checkOutTime && (
              <>
                <div className="flex items-center gap-1 text-slate-500">
                  <LogIn className="w-3 h-3 text-emerald-500" />
                  <span>Check-in: <span className="font-medium">3:00 PM</span></span>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <LogOut className="w-3 h-3 text-red-500" />
                  <span>Check-out: <span className="font-medium">11:00 AM</span></span>
                </div>
              </>
            )}
          </div>

          {/* 🛡️ CANCELLATION POLICY - Subtle & Informative */}
          {perNightPrice > 0 && (
            <div className="flex items-center gap-3 text-[10px]">
              {hasFreeCancellation ? (
                // Free cancellation - prominent positive indicator
                <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded border border-emerald-200">
                  <Shield className="w-3 h-3 text-emerald-600" />
                  <span className="font-semibold text-emerald-700">{t.freeCancellation}</span>
                  {cancellationDeadline && (
                    <span className="text-emerald-600 font-normal">
                      until {new Date(cancellationDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              ) : (
                // Non-refundable - subtle, not alarming, emphasizes value
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-slate-600">
                    <Info className="w-3 h-3" />
                    <span className="font-medium">{t.nonRefundable}</span>
                  </span>
                  <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded border border-amber-200 text-amber-700 font-semibold">
                    <BadgePercent className="w-3 h-3" />
                    Lower price
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 🔘 CTA BUTTON - Bottom Right */}
        <div className="absolute bottom-4 right-4">
          {perNightPrice > 0 ? (
            <button
              onClick={handleBooking}
              className="px-6 py-2.5 font-bold text-sm rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 whitespace-nowrap group/btn"
              style={{
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)',
                color: 'white',
              }}
            >
              <span className="flex items-center gap-1.5">
                Book Now
                <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </span>
            </button>
          ) : (
            <button
              onClick={() => onViewDetails(hotel.id)}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all shadow-md whitespace-nowrap"
            >
              View Details
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
              const ratePerNight = parseFloat(rate.totalPrice.amount) / nights;
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
                        <span className="text-slate-500 text-xs">/night</span>
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
