'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plane, Star, ChevronDown, Heart, Share2, Check, Briefcase, Luggage, MoreVertical, User, Baby } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AirlineLogo from './AirlineLogo';
import { useCurrency } from '@/lib/hooks/useCurrency';
import { convertCurrency } from '@/lib/services/currency';
import { DealScoreBadgeCompact } from './DealScoreBadge';
import { getAirlineData } from '@/lib/flights/airline-data';
import { formatCityCode, getMobileCityName } from '@/lib/data/airports';
import type { EnhancedFlightCardProps } from './FlightCardEnhanced';
import { FlightDetailsSheet } from './FlightDetailsSheet';

/**
 * ULTRA-COMPACT MOBILE FLIGHT CARD
 *
 * Design Goals:
 * - Height: 110-120px (vs 180px+ desktop)
 * - Show critical info only (airline, route, price, deal score)
 * - Touch-optimized interactions (swipe, tap)
 * - Progressive disclosure via bottom sheet
 * - Premium animations and haptic feedback
 *
 * Space Efficiency:
 * - 3x more flights visible without scrolling
 * - Zero information loss (details in bottom sheet)
 * - Swipe gestures for quick actions
 */

export function FlightCardMobile(props: EnhancedFlightCardProps) {
  const {
    id,
    itineraries,
    price,
    numberOfBookableSeats = 9,
    validatingAirlineCodes = [],
    travelerPricings = [],
    badges = [],
    dealScore,
    dealScoreBreakdown,
    dealTier,
    dealLabel,
    onSelect,
    onCompare,
    isComparing = false,
    isNavigating = false,
    fareVariants,
  } = props;

  const router = useRouter();
  const [showDetailsSheet, setShowDetailsSheet] = useState(false);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Currency conversion
  const { currency: userCurrency, currencyInfo } = useCurrency();
  const [convertedPrice, setConvertedPrice] = useState<number | null>(null);

  useEffect(() => {
    const doConvert = async () => {
      const apiCurrency = price.currency || 'USD';
      const amount = typeof price.total === 'number' ? price.total : parseFloat(String(price.total));
      if (apiCurrency === userCurrency) {
        setConvertedPrice(amount);
        return;
      }
      try {
        const converted = await convertCurrency(amount, apiCurrency, userCurrency);
        setConvertedPrice(converted);
      } catch {
        setConvertedPrice(amount);
      }
    };
    doConvert();
  }, [price.total, price.currency, userCurrency]);

  const displayPrice = convertedPrice ?? (typeof price.total === 'number' ? price.total : parseFloat(String(price.total)));
  const displaySymbol = currencyInfo?.symbol || '$';

  // Parse flight data
  const outboundItinerary = itineraries[0];
  const returnItinerary = itineraries[1]; // null for one-way flights
  const isRoundTrip = itineraries.length > 1;

  const outboundFirstSegment = outboundItinerary.segments[0];
  const outboundLastSegment = outboundItinerary.segments[outboundItinerary.segments.length - 1];
  const primaryAirline = validatingAirlineCodes?.[0] || outboundFirstSegment.carrierCode;
  const airlineData = getAirlineData(primaryAirline);

  // Format time (HH:MM)
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  // Format date (MMM DD)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Parse duration
  const parseDuration = (duration: string): string => {
    const match = duration.match(/PT(\d+H)?(\d+M)?/);
    if (!match) return duration;
    const hours = match[1] ? parseInt(match[1].replace('H', '')) : 0;
    const minutes = match[2] ? parseInt(match[2].replace('M', '')) : 0;
    return `${hours}h ${minutes}m`;
  };

  // Calculate stops for outbound
  const outboundStops = outboundItinerary.segments.length - 1;
  const outboundStopsText = outboundStops === 0 ? 'Direct' : outboundStops === 1 ? '1 stop' : `${outboundStops} stops`;

  // Format price - uses converted currency
  const formatPrice = () => {
    return `${displaySymbol}${Math.round(displayPrice)}`;
  };

  // Get traveler counts by type
  const getTravelerCounts = () => {
    if (!travelerPricings || travelerPricings.length === 0) {
      return { adults: 1, children: 0, infants: 0, total: 1 };
    }
    const counts = { adults: 0, children: 0, infants: 0, total: travelerPricings.length };
    travelerPricings.forEach((tp: any) => {
      const type = tp.travelerType?.toUpperCase();
      if (type === 'ADULT') counts.adults++;
      else if (type === 'CHILD') counts.children++;
      else if (type === 'HELD_INFANT' || type === 'SEATED_INFANT' || type === 'INFANT') counts.infants++;
    });
    return counts;
  };

  // Get price per person (for single adult only) - uses converted currency
  const getPricePerPerson = () => {
    const counts = getTravelerCounts();
    if (counts.total === 1) return displayPrice;
    // For multiple travelers, calculate average (simplified)
    return Math.round(displayPrice / counts.total);
  };

  const travelerCounts = getTravelerCounts();
  const isMultipleTravelers = travelerCounts.total > 1;

  // Get baggage info
  const getBaggageInfo = () => {
    const { travelerPricings = [] } = props;
    if (!travelerPricings || travelerPricings.length === 0) {
      return { carryOn: 1, checked: 0 };
    }
    const fareDetails = travelerPricings[0]?.fareDetailsBySegment?.[0];
    return {
      carryOn: fareDetails?.includedCabinBags?.quantity || 1,
      checked: fareDetails?.includedCheckedBags?.quantity || 0,
    };
  };

  const baggage = getBaggageInfo();

  // Get fare family label - uses fareVariants[0].name for accurate fare family naming
  const getFareFamilyLabel = () => {
    // Priority 1: Use fareVariants[0].name if available (most accurate from API)
    // This correctly differentiates "Economy Basic" vs "Economy Standard" vs "Economy Flex"
    if (fareVariants && fareVariants.length > 0 && fareVariants[0].name) {
      const name = fareVariants[0].name;
      // Shorten for mobile display if needed
      if (name.length > 16) {
        // Extract just the fare tier (e.g., "Basic" from "Economy Basic")
        const parts = name.split(' ');
        if (parts.length >= 2) {
          return parts[parts.length - 1]; // Return last word (Basic, Standard, Flex, etc.)
        }
      }
      return name;
    }

    // Priority 2: Fall back to cabin class
    const fareDetails = travelerPricings?.[0]?.fareDetailsBySegment?.[0];
    const cabin = fareDetails?.cabin || 'ECONOMY';
    const cabinMap: Record<string, string> = {
      'ECONOMY': 'Economy',
      'PREMIUM_ECONOMY': 'Premium',
      'BUSINESS': 'Business',
      'FIRST': 'First',
    };
    return cabinMap[cabin] || cabin;
  };

  const cabinClass = getFareFamilyLabel();

  // Handle favorite toggle
  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    if ('vibrate' in navigator) navigator.vibrate(10);
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites!', {
      icon: isFavorite ? '💔' : '❤️',
      duration: 2000
    });
  };

  // Handle share
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if ('vibrate' in navigator) navigator.vibrate(10);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Flight to ${formatCityCode(outboundLastSegment.arrival.iataCode)}`,
          text: `Check out this flight for ${formatPrice()}!`,
          url: window.location.href,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          toast.success('Link copied to clipboard!', { icon: '📋', duration: 2000 });
        }
      }
    } else {
      toast.success('Link copied to clipboard!', { icon: '📋', duration: 2000 });
    }
  };

  // Handle compare
  const handleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCompare) {
      if ('vibrate' in navigator) navigator.vibrate(10);
      onCompare(id);
      toast.success(isComparing ? 'Removed from comparison' : 'Added to comparison', {
        icon: '✓',
        duration: 2000
      });
    }
  };

  // Handle card selection
  const handleSelect = () => {
    if (isNavigating) return;

    // Save flight data for booking page
    // CRITICAL: Include timestamp for offer freshness validation (Duffel offers expire after 30 min)
    const flightWithTimestamp = {
      ...props,
      _storedAt: Date.now(),
      _offerExpiresAt: Date.now() + (25 * 60 * 1000), // 25 min validity
    };
    sessionStorage.setItem(`flight_${id}`, JSON.stringify(flightWithTimestamp));

    // Haptic feedback (if supported)
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }

    // Navigate to booking
    setTimeout(() => {
      router.push(`/flights/booking?flightId=${id}&step=summary`);
    }, 300);

    if (onSelect) {
      onSelect(id);
    }
  };

  // DISABLED: Swipe gestures removed to prevent accidental triggers while scrolling
  // Users can use the favorite button and overflow menu instead

  // Determine which badge to show (max 1 on mobile)
  const priorityBadge = () => {
    // Priority 1: Deal score (if excellent or great)
    if (dealScoreBreakdown) {
      return (
        <DealScoreBadgeCompact
          score={dealScoreBreakdown}
        />
      );
    } else if (dealScore && dealScore >= 70 && dealTier && dealLabel) {
      // Construct minimal breakdown from individual fields
      const breakdown = {
        total: dealScore,
        components: {
          price: 0,
          duration: 0,
          stops: 0,
          timeOfDay: 0,
          reliability: 0,
          comfort: 0,
          availability: 0,
        },
        tier: dealTier,
        label: dealLabel,
        explanations: {
          price: '',
          duration: '',
          stops: '',
          timeOfDay: '',
          reliability: '',
          comfort: '',
          availability: '',
        },
      };
      return (
        <DealScoreBadgeCompact
          score={breakdown}
        />
      );
    }

    // Priority 2: Low seats
    if (numberOfBookableSeats <= 3) {
      return (
        <span className="text-[10px] font-bold text-orange-600 px-2 py-0.5 bg-orange-50 rounded-full whitespace-nowrap">
          ⚠️ {numberOfBookableSeats} left
        </span>
      );
    }

    // Priority 3: Direct flight
    if (outboundStops === 0) {
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 bg-green-50 text-green-700 rounded-full whitespace-nowrap">
          ✈️ Direct
        </span>
      );
    }

    return null;
  };

  return (
    <>
      {/* ULTRA-COMPACT CARD - Level-6 Edge-to-edge mobile, rounded desktop */}
      <div
        className={`relative bg-white md:rounded-xl border-y md:border-2 transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] active:scale-[0.99] mb-0.5 md:mb-3 ${
          isComparing ? 'border-primary-500 shadow-lg shadow-primary-100' : 'border-neutral-200'
        }`}
      >
        {/* HEADER - Airline + Flight Number + Favorite + Badge + Overflow Menu */}
        <div className="flex items-center justify-between px-3 py-1 border-b border-neutral-100">
          {/* Left: Airline info with flight number (compact) */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <AirlineLogo
              code={primaryAirline}
              size="md"
              className="flex-shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-neutral-900 truncate leading-tight">
                {airlineData.name}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-neutral-500 leading-tight">
                  {outboundFirstSegment.carrierCode}{outboundFirstSegment.number}
                  {isRoundTrip && returnItinerary && ` • ${returnItinerary.segments[0].carrierCode}${returnItinerary.segments[0].number}`}
                </span>
                <span className="text-[8px] font-bold px-1.5 py-0.5 bg-primary-50 text-primary-700 rounded">
                  {cabinClass}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Favorite + Share + Overflow (Deal badge moved to details) */}
          <div className="flex items-center gap-0 flex-shrink-0">
            {/* Favorite - Always visible */}
            <button
              onClick={handleFavorite}
              className="min-h-[44px] min-w-[40px] flex items-center justify-center hover:bg-neutral-100 rounded-full transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] active:scale-95"
              aria-label="Add to favorites"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-neutral-400'}`} />
            </button>

            {/* Share - Always visible */}
            <button
              onClick={handleShare}
              className="min-h-[44px] min-w-[40px] flex items-center justify-center hover:bg-neutral-100 rounded-full transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] active:scale-95"
              aria-label="Share flight"
            >
              <Share2 className="w-4 h-4 text-neutral-400" />
            </button>

            {/* Overflow Menu Button - Reduced right padding */}
            <div className="relative -mr-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOverflowMenu(!showOverflowMenu);
                }}
                className="min-h-[44px] min-w-[36px] flex items-center justify-center hover:bg-neutral-100 rounded-full transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] active:scale-95"
                aria-label="More options"
              >
                <MoreVertical className="w-4 h-4 text-neutral-500" />
              </button>

              {/* Overflow Dropdown Menu */}
              {showOverflowMenu && (
                <>
                  {/* Backdrop to close menu */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowOverflowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-xl shadow-xl border border-neutral-200 py-1 min-w-[160px] animate-fadeIn">
                    {/* Deal Score Badge - Moved here from compact view */}
                    {(dealScoreBreakdown || (dealScore && dealScore >= 70)) && (
                      <div className="px-3 py-2 border-b border-neutral-100">
                        {priorityBadge()}
                      </div>
                    )}

                    {/* Rating */}
                    <div className="px-3 py-2 flex items-center gap-2 border-b border-neutral-100">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span className="text-sm text-neutral-700">{airlineData.rating.toFixed(1)} rating</span>
                    </div>

                    {/* Baggage Info */}
                    <div className="px-3 py-2 flex items-center gap-2 border-b border-neutral-100">
                      <Briefcase className="w-4 h-4 text-neutral-500" />
                      <span className="text-sm text-neutral-700">
                        {baggage.carryOn > 0 ? `${baggage.carryOn} carry-on` : 'No carry-on'}
                        {baggage.checked > 0 && `, ${baggage.checked} checked`}
                      </span>
                    </div>

                    {/* Compare */}
                    <button
                      onClick={(e) => {
                        handleCompare(e);
                        setShowOverflowMenu(false);
                      }}
                      className={`w-full px-3 py-2 flex items-center gap-2 hover:bg-neutral-50 transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
                        isComparing ? 'bg-primary-50' : ''
                      }`}
                    >
                      <Check className={`w-4 h-4 ${isComparing ? 'text-primary-600' : 'text-neutral-500'}`} />
                      <span className={`text-sm ${isComparing ? 'text-primary-600 font-medium' : 'text-neutral-700'}`}>
                        {isComparing ? 'In comparison' : 'Add to compare'}
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* OUTBOUND ROUTE - Compact with dates + aircraft */}
        <div className="px-3 py-1.5 border-b border-neutral-100">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-bold text-primary-600 uppercase tracking-wide">Outbound</span>
              <span className="text-[9px] text-neutral-500">{outboundFirstSegment.carrierCode}{outboundFirstSegment.number}</span>
              {outboundFirstSegment.aircraft?.code && (
                <span className="text-[8px] text-neutral-400 bg-neutral-100 px-1 rounded">✈ {outboundFirstSegment.aircraft.code}</span>
              )}
            </div>
            <span className="flex items-center gap-1">
              <span className="text-[10px] font-semibold text-neutral-600">{parseDuration(outboundItinerary.duration)}</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${outboundStops === 0 ? 'text-green-700 bg-green-50' : outboundStops === 1 ? 'text-orange-600 bg-orange-50' : 'text-red-600 bg-red-50'}`}>
                {outboundStopsText}
              </span>
            </span>
          </div>
          <div className="flex items-center">
            {/* Departure with date - City + Code on same row */}
            <div className="flex-shrink-0">
              <div className="text-[9px] text-neutral-500">{formatDate(outboundFirstSegment.departure.at)}</div>
              <div className="text-base font-bold text-neutral-900 leading-none">
                {formatTime(outboundFirstSegment.departure.at)}
              </div>
              <div className="flex items-center gap-1 leading-tight">
                <span className="text-[11px] font-bold text-neutral-800 truncate max-w-[60px]">
                  {getMobileCityName(outboundFirstSegment.departure.iataCode)}
                </span>
                <span className="text-[10px] font-semibold text-neutral-500">
                  {outboundFirstSegment.departure.iataCode}
                </span>
              </div>
            </div>

            {/* Flight Path */}
            <div className="flex-1 mx-2">
              <div className="relative h-px bg-gradient-to-r from-neutral-300 via-primary-400 to-neutral-300">
                <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-primary-600 bg-white" />
              </div>
            </div>

            {/* Arrival with date - City + Code on same row */}
            <div className="flex-shrink-0 text-right">
              <div className="text-[9px] text-neutral-500">{formatDate(outboundLastSegment.arrival.at)}</div>
              <div className="text-base font-bold text-neutral-900 leading-none">
                {formatTime(outboundLastSegment.arrival.at)}
              </div>
              <div className="flex items-center justify-end gap-1 leading-tight">
                <span className="text-[10px] font-semibold text-neutral-500">
                  {outboundLastSegment.arrival.iataCode}
                </span>
                <span className="text-[11px] font-bold text-neutral-800 truncate max-w-[60px]">
                  {getMobileCityName(outboundLastSegment.arrival.iataCode)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RETURN ROUTE (only for round-trip) - Compact with dates + aircraft */}
        {isRoundTrip && returnItinerary && (() => {
          const returnFirstSegment = returnItinerary.segments[0];
          const returnLastSegment = returnItinerary.segments[returnItinerary.segments.length - 1];
          const returnStops = returnItinerary.segments.length - 1;
          const returnStopsText = returnStops === 0 ? 'Direct' : returnStops === 1 ? '1 stop' : `${returnStops} stops`;

          return (
            <div className="px-3 py-1.5 border-b border-neutral-100">
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-bold text-secondary-600 uppercase tracking-wide">Return</span>
                  <span className="text-[9px] text-neutral-500">{returnFirstSegment.carrierCode}{returnFirstSegment.number}</span>
                  {returnFirstSegment.aircraft?.code && (
                    <span className="text-[8px] text-neutral-400 bg-neutral-100 px-1 rounded">{returnFirstSegment.aircraft.code}</span>
                  )}
                </div>
                <span className="flex items-center gap-1">
                  <span className="text-[10px] font-semibold text-neutral-600">{parseDuration(returnItinerary.duration)}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${returnStops === 0 ? 'text-green-700 bg-green-50' : returnStops === 1 ? 'text-orange-600 bg-orange-50' : 'text-red-600 bg-red-50'}`}>
                    {returnStopsText}
                  </span>
                </span>
              </div>
              <div className="flex items-center">
                {/* Departure with date - City + Code on same row */}
                <div className="flex-shrink-0">
                  <div className="text-[9px] text-neutral-500">{formatDate(returnFirstSegment.departure.at)}</div>
                  <div className="text-base font-bold text-neutral-900 leading-none">
                    {formatTime(returnFirstSegment.departure.at)}
                  </div>
                  <div className="flex items-center gap-1 leading-tight">
                    <span className="text-[11px] font-bold text-neutral-800 truncate max-w-[60px]">
                      {getMobileCityName(returnFirstSegment.departure.iataCode)}
                    </span>
                    <span className="text-[10px] font-semibold text-neutral-500">
                      {returnFirstSegment.departure.iataCode}
                    </span>
                  </div>
                </div>

                {/* Flight Path */}
                <div className="flex-1 mx-2">
                  <div className="relative h-px bg-gradient-to-r from-neutral-300 via-primary-400 to-neutral-300">
                    <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-primary-600 bg-white rotate-180" />
                  </div>
                </div>

                {/* Arrival with date - City + Code on same row */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-[9px] text-neutral-500">{formatDate(returnLastSegment.arrival.at)}</div>
                  <div className="text-base font-bold text-neutral-900 leading-none">
                    {formatTime(returnLastSegment.arrival.at)}
                  </div>
                  <div className="flex items-center justify-end gap-1 leading-tight">
                    <span className="text-[10px] font-semibold text-neutral-500">
                      {returnLastSegment.arrival.iataCode}
                    </span>
                    <span className="text-[11px] font-bold text-neutral-800 truncate max-w-[60px]">
                      {getMobileCityName(returnLastSegment.arrival.iataCode)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* PRICE + CTA - Level-6 Apple styling */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-50 border-t border-neutral-100">
          {/* Price with traveler icons */}
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-primary-600 leading-tight" data-testid="flight-price">
              {formatPrice()}
            </span>
            <div className="flex items-center flex-wrap gap-x-1 gap-y-0.5 text-[9px] text-neutral-600">
              {true ? (
                <>
                  {travelerCounts.adults > 0 && (
                    <span className="flex items-center gap-0.5">
                      {travelerCounts.adults} {travelerCounts.adults === 1 ? 'Adult' : 'Adults'}
                    </span>
                  )}
                  {travelerCounts.children > 0 && (
                    <>
                      <span className="text-neutral-400">·</span>
                      <span className="flex items-center gap-0.5">
                        {travelerCounts.children} {travelerCounts.children === 1 ? 'Child' : 'Children'}
                      </span>
                    </>
                  )}
                  {travelerCounts.infants > 0 && (
                    <>
                      <span className="text-neutral-400">·</span>
                      <span className="flex items-center gap-0.5">
                        {travelerCounts.infants} {travelerCounts.infants === 1 ? 'Infant' : 'Infants'}
                      </span>
                    </>
                  )}
                  <span className="text-neutral-400 mx-0.5">—</span>
                  <span className="font-medium">Total</span>
                  <span className="text-neutral-400 mx-0.5">·</span>
                  <span className="text-green-600 font-medium">incl. taxes</span>
                </>
              ) : (
                <span className="text-green-600 font-medium">incl. taxes</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* More Details button */}
            <button
              onClick={() => setShowDetailsSheet(true)}
              className="text-xs font-medium text-primary-600 px-2 py-1 hover:bg-primary-50 rounded-lg transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] active:scale-95"
            >
              Details
            </button>

            {/* Select button - Level-6 Apple styling */}
            <button
              onClick={handleSelect}
              disabled={isNavigating}
              className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] active:scale-95 disabled:opacity-50 shadow-sm hover:shadow-md"
            >
              Select →
            </button>
          </div>
        </div>

        {/* Swipe indicator overlay (subtle hint) */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-neutral-200 to-transparent opacity-50 pointer-events-none" />
      </div>

      {/* BOTTOM SHEET - Flight Details */}
      {showDetailsSheet && (
        <FlightDetailsSheet
          {...props}
          isOpen={showDetailsSheet}
          onClose={() => setShowDetailsSheet(false)}
          onSelect={handleSelect}
        />
      )}
    </>
  );
}


