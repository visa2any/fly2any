'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Star, Clock, Users, Plane, Wifi, Coffee, Zap, Heart, Share2, Info, Check, X, Shield, AlertTriangle, Award } from 'lucide-react';
import ShareFlightModal from './ShareFlightModal';
import { getAirlineData, getAllianceBadgeColor, getRatingColor, getOnTimePerformanceBadge } from '@/lib/flights/airline-data';
import { getEstimatedAmenities } from '@/lib/flights/aircraft-amenities';
import AirlineLogo from './AirlineLogo';
import UrgencyIndicators from './UrgencyIndicators';
import SocialProof from './SocialProof';
import PriceAnchoringBadge from './PriceAnchoringBadge';
import CO2Badge from './CO2Badge';
import FareComparisonModal, { FareOption } from './FareComparisonModal';
import FareRulesAccordion from './FareRulesAccordion';
import { DealScoreBadgeCompact } from './DealScoreBadge';
import type { DealScoreBreakdown } from '@/lib/flights/dealScore';
import { dimensions, spacing, typography, colors } from '@/lib/design-system';
import { ParsedFareRules } from '@/lib/utils/fareRuleParsers';

interface Segment {
  departure: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  arrival: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  carrierCode: string;
  number: string;
  aircraft?: { code: string };
  duration?: string; // Made optional to match FlightSegment
  numberOfStops?: number; // Made optional to match FlightSegment
}

interface Itinerary {
  duration: string;
  segments: Segment[];
}

interface Price {
  total: string | number; // Accept both to match FlightPrice
  base?: string | number; // Made optional and flexible
  currency: string;
  grandTotal?: string | number; // Made flexible
}

export interface EnhancedFlightCardProps {
  id: string;
  itineraries: Itinerary[];
  price: Price;
  numberOfBookableSeats?: number;
  validatingAirlineCodes?: string[];
  travelerPricings?: any[];
  badges?: Array<{
    type: string;
    text: string;
    color: string;
    icon?: string;
  }>;
  score?: number;
  mlScore?: number; // ML prediction score
  priceVsMarket?: number; // Percentage vs market average
  co2Emissions?: number; // CO2 emissions for this flight
  averageCO2?: number; // Average CO2 emissions for this route
  viewingCount?: number; // Number of people viewing this flight
  bookingsToday?: number; // Number of bookings made today
  dealScore?: number; // Deal score (0-100)
  dealScoreBreakdown?: DealScoreBreakdown; // Deal score component breakdown
  dealTier?: 'excellent' | 'great' | 'good' | 'fair'; // Deal tier
  dealLabel?: string; // Deal label
  onSelect?: (id: string) => void;
  onCompare?: (id: string) => void;
  isComparing?: boolean;
  isNavigating?: boolean;
  lang?: 'en' | 'pt' | 'es';
}

export function FlightCardEnhanced({
  id,
  itineraries,
  price,
  numberOfBookableSeats = 9,
  validatingAirlineCodes = [],
  travelerPricings = [],
  badges = [],
  score,
  mlScore,
  priceVsMarket,
  co2Emissions,
  averageCO2,
  viewingCount,
  bookingsToday,
  dealScore,
  dealScoreBreakdown,
  dealTier,
  dealLabel,
  onSelect,
  onCompare,
  isComparing = false,
  isNavigating = false,
  lang = 'en',
}: EnhancedFlightCardProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showFareModal, setShowFareModal] = useState(false);
  const [showFareRules, setShowFareRules] = useState(false);
  const [fareRules, setFareRules] = useState<ParsedFareRules | null>(null);
  const [loadingFareRules, setLoadingFareRules] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // DEBUG: Log component render and conversion feature props
  useEffect(() => {
    console.log('🔍 FlightCardEnhanced DEBUG:', {
      id,
      co2Emissions,
      averageCO2,
      viewingCount,
      bookingsToday,
      mlScore,
      priceVsMarket,
      numberOfBookableSeats,
      conversionFeaturesPresent: !!(co2Emissions || viewingCount || bookingsToday),
    });
  }, [id, co2Emissions, averageCO2, viewingCount, bookingsToday, mlScore, priceVsMarket, numberOfBookableSeats]);

  // Get primary airline data
  const primaryAirline = validatingAirlineCodes[0] || itineraries[0]?.segments[0]?.carrierCode || 'XX';
  const airlineData = getAirlineData(primaryAirline);

  // Calculate totals with type-safe parsing
  const parsePrice = (value: string | number | undefined): number => {
    if (value === undefined) return 0;
    return typeof value === 'number' ? value : parseFloat(value);
  };

  const basePrice = parsePrice(price.base);
  const totalPrice = parsePrice(price.total);
  const fees = totalPrice - basePrice;
  const feesPercentage = ((fees / totalPrice) * 100).toFixed(0);

  // Get flight details
  const outbound = itineraries[0];
  const inbound = itineraries[1];
  const isRoundtrip = !!inbound;

  // Parse durations
  const parseDuration = (duration: string) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?/);
    if (!match) return '0h 0m';
    const hours = match[1] ? match[1] : '0H';
    const minutes = match[2] ? match[2] : '0M';
    return `${hours.replace('H', 'h')} ${minutes.replace('M', 'm')}`;
  };

  // Convert ISO duration to minutes
  const durationToMinutes = (duration: string): number => {
    const match = duration.match(/PT(\d+H)?(\d+M)?/);
    if (!match) return 0;
    const hours = match[1] ? parseInt(match[1].replace('H', '')) : 0;
    const minutes = match[2] ? parseInt(match[2].replace('M', '')) : 0;
    return hours * 60 + minutes;
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Get stops info
  const getStopsInfo = (segments: Segment[]) => {
    // Calculate stops from segments length (more reliable than numberOfStops property)
    const stops = segments.length - 1;
    if (stops === 0) return { text: 'Direct', color: 'text-green-600', badge: 'bg-green-100 text-green-700' };
    if (stops === 1) return { text: '1 stop', color: 'text-orange-600', badge: 'bg-orange-100 text-orange-700' };
    return { text: `${stops} stops`, color: 'text-red-600', badge: 'bg-red-100 text-red-700' };
  };

  const outboundStops = getStopsInfo(outbound.segments);
  const inboundStops = inbound ? getStopsInfo(inbound.segments) : null;
  const onTimeBadge = getOnTimePerformanceBadge(airlineData.onTimePerformance);

  // Calculate savings
  const averagePrice = totalPrice * 1.25;
  const savings = averagePrice - totalPrice;
  const savingsPercentage = ((savings / averagePrice) * 100).toFixed(0);

  // NEW: Parse amenities from Amadeus API
  const getMealType = (amenities: any[]): string => {
    const mealAmenity = amenities.find((a: any) => a.amenityType === 'MEAL');
    if (!mealAmenity) return 'None';

    const desc = mealAmenity.description.toLowerCase();
    if (desc.includes('hot meal')) return 'Hot meal';
    if (desc.includes('meal')) return 'Meal';
    if (desc.includes('snack')) return 'Snack';
    return 'Refreshments';
  };

  // NEW: Get baggage and amenities BY ITINERARY (not just first segment!)
  const getBaggageByItinerary = (itineraryIndex: number) => {
    // Default fallback
    const defaultBaggage = {
      carryOn: true,
      carryOnWeight: '10kg',
      carryOnQuantity: 2,
      checked: 1,
      checkedWeight: '23kg',
      fareType: 'STANDARD',
      brandedFareLabel: undefined as string | undefined,
      cabin: 'ECONOMY',
      amenities: {
        wifi: false,
        power: false,
        meal: 'None',
        entertainment: false,
        isEstimated: true,
      },
    };

    try {
      if (!travelerPricings || travelerPricings.length === 0) {
        return defaultBaggage;
      }

      const firstTraveler = travelerPricings[0];
      // CRITICAL FIX: Use itineraryIndex, not [0]!
      const fareDetails = firstTraveler.fareDetailsBySegment?.[itineraryIndex];

      if (!fareDetails) {
        return defaultBaggage;
      }

      // Checked baggage from API
      const checkedBags = fareDetails.includedCheckedBags?.quantity || 0;
      const checkedWeight = fareDetails.includedCheckedBags?.weight
        ? `${fareDetails.includedCheckedBags.weight}${fareDetails.includedCheckedBags.weightUnit || 'kg'}`
        : '23kg';

      // Cabin baggage from API (NEW - we weren't using this!)
      const cabinBagsData = fareDetails.includedCabinBags;
      const cabinQuantity = cabinBagsData?.quantity || 0;

      // Get fare details
      const cabin = fareDetails.cabin || 'ECONOMY';
      const fareOption = fareDetails.fareOption || fareDetails.brandedFare || fareDetails.fareBasis || 'STANDARD';
      const brandedLabel = fareDetails.brandedFareLabel; // e.g., "Blue Basic"

      // Determine baggage rules
      const isBasicEconomy = fareOption.includes('BASIC') || fareOption.includes('LIGHT') || fareOption.includes('SAVER');
      const isPremium = cabin === 'PREMIUM_ECONOMY' || cabin === 'BUSINESS' || cabin === 'FIRST';

      // Determine carry-on rules
      const hasCarryOn = cabinQuantity >= 2 || !isBasicEconomy; // 2 = carry-on + personal item
      const carryOnWeight = isPremium ? '18kg' : '10kg';

      // Parse amenities array (with aircraft-based fallback)
      const amenitiesArray = fareDetails.amenities || [];

      // Get aircraft code from the first segment of this itinerary
      const itinerarySegments = itineraries?.[itineraryIndex]?.segments || [];
      const aircraftCode = itinerarySegments[0]?.aircraft?.code;

      // Use real amenities data if available, otherwise estimate from aircraft type
      const amenities = amenitiesArray.length > 0
        ? {
            // Real data from Amadeus Branded Fares API
            wifi: amenitiesArray.some((a: any) =>
              a.description.toLowerCase().includes('wifi') ||
              a.description.toLowerCase().includes('wi-fi') ||
              a.description.toLowerCase().includes('internet')
            ),
            power: amenitiesArray.some((a: any) =>
              a.description.toLowerCase().includes('power') ||
              a.description.toLowerCase().includes('outlet') ||
              a.description.toLowerCase().includes('usb')
            ),
            meal: getMealType(amenitiesArray),
            entertainment: amenitiesArray.some((a: any) => a.amenityType === 'ENTERTAINMENT'),
            isEstimated: false
          }
        : {
            // Estimated data based on aircraft type and cabin class
            ...getEstimatedAmenities(aircraftCode, cabin)
          };

      return {
        carryOn: hasCarryOn,
        carryOnWeight,
        carryOnQuantity: Math.max(cabinQuantity, hasCarryOn ? 2 : 1),
        checked: checkedBags,
        checkedWeight,
        fareType: fareOption,
        brandedFareLabel: brandedLabel,
        cabin,
        amenities,
      };
    } catch (error) {
      console.warn(`Error parsing baggage for itinerary ${itineraryIndex}:`, error);
      return defaultBaggage;
    }
  };

  // Get baggage info for each leg
  const outboundBaggage = getBaggageByItinerary(0);
  const returnBaggage = isRoundtrip ? getBaggageByItinerary(1) : null;

  // Check if outbound and return differ
  const baggageDiffers = returnBaggage && (
    outboundBaggage.checked !== returnBaggage.checked ||
    outboundBaggage.fareType !== returnBaggage.fareType ||
    outboundBaggage.amenities.wifi !== returnBaggage.amenities.wifi ||
    outboundBaggage.carryOn !== returnBaggage.carryOn
  );

  // Legacy support: Keep baggageInfo for existing code
  const baggageInfo = outboundBaggage;

  // TruePrice calculation - based on actual baggage allowance
  const getBaggageFees = () => {
    // If baggage is already included, no extra fee
    if (baggageInfo.checked > 0) {
      return 0;
    }

    // If no checked baggage included, estimate the cost
    // Domestic: ~$35 first bag, International: ~$60 first bag
    const isInternational = outbound.segments.some(seg =>
      seg.departure.iataCode.substring(0, 2) !== seg.arrival.iataCode.substring(0, 2)
    );

    return isInternational ? 60 : 35;
  };

  const estimatedBaggage = getBaggageFees();
  const estimatedSeat = baggageInfo.fareType.includes('BASIC') ? 30 : 0; // Basic fares charge for seat selection
  const truePrice = totalPrice + estimatedBaggage + estimatedSeat;

  // Handle select - Navigate to booking page
  const handleSelectClick = () => {
    if (isNavigating) return;

    // Save flight data to sessionStorage for booking page
    const flightData = {
      id,
      itineraries,
      price,
      numberOfBookableSeats,
      validatingAirlineCodes,
      travelerPricings,
      badges,
      score,
      mlScore,
      priceVsMarket,
      co2Emissions,
      averageCO2,
      viewingCount,
      bookingsToday,
      dealScore,
      dealScoreBreakdown,
      dealTier,
      dealLabel,
    };

    sessionStorage.setItem(`flight_${id}`, JSON.stringify(flightData));

    // Show toast briefly before navigation
    setShowSuccessToast(true);

    // Navigate to booking page with 7-step flow
    setTimeout(() => {
      router.push(`/flights/booking?flightId=${id}&step=summary`);
    }, 500);

    // Call onSelect if provided (for parent component state management)
    if (onSelect) {
      onSelect(id);
    }
  };

  // Use provided viewing count or generate mock
  const currentViewingCount = viewingCount ?? Math.floor(Math.random() * 50) + 20;

  // Fetch fare rules from API
  const loadFareRules = async () => {
    if (fareRules) {
      // Already loaded, just show the accordion
      setShowFareRules(!showFareRules);
      return;
    }

    try {
      setLoadingFareRules(true);
      const response = await fetch(`/api/fare-rules?flightOfferId=${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch fare rules');
      }

      const data = await response.json();
      setFareRules(data.data);
      setShowFareRules(true);
    } catch (error) {
      console.error('Error fetching fare rules:', error);
      // Optionally show error to user
    } finally {
      setLoadingFareRules(false);
    }
  };

  // Handle fare selection from modal
  const handleFareSelect = (fare: FareOption) => {
    console.log('Selected fare:', fare);
    // In production, this would update the booking state
    setShowFareModal(false);
  };

  // DEBUG MODE: Detect from URL query parameter ?debug=true
  const [isDebugMode, setIsDebugMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      setIsDebugMode(searchParams.get('debug') === 'true');
    }
  }, []);

  return (
    <div
      data-flight-card
      data-flight-id={id}
      className={`group relative bg-white rounded-xl border-2 transition-all duration-300 overflow-visible ${
      isComparing ? 'border-primary-500 ring-2 ring-primary-100' : 'border-gray-200 hover:border-primary-300'
    } hover:shadow-lg ${isExpanded ? 'flight-card-expanded' : ''}`}>

      {/* DEBUG MODE INDICATOR */}
      {isDebugMode && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-yellow-400 text-black px-2 py-1 text-xs font-bold text-center border-b-4 border-red-600">
          DEBUG MODE ACTIVE | ID={id} | CO2={co2Emissions || 'N/A'} | Viewing={currentViewingCount} | Bookings={bookingsToday || 'N/A'} | ML={mlScore ? (mlScore * 100).toFixed(0) : 'N/A'}
        </div>
      )}

      {/* ULTRA-COMPACT HEADER - 24px height */}
      <div className="flex items-center justify-between gap-2 px-3 py-1 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100" style={{ height: dimensions.card.header }}>
        {/* Left: Airline Info (compact) */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Airline Logo - Real Logo with Fallback */}
          <AirlineLogo
            code={primaryAirline}
            size="md"
            className="shadow-sm flex-shrink-0"
          />

          {/* Airline Name */}
          <span className="font-semibold text-gray-900 truncate" style={{ fontSize: typography.card.title.size }}>
            {airlineData.name}
          </span>

          {/* Rating - Compact */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <Star className={`w-3 h-3 fill-current ${getRatingColor(airlineData.rating)}`} />
            <span className="font-semibold text-gray-700" style={{ fontSize: typography.card.meta.size }}>
              {airlineData.rating.toFixed(1)}
            </span>
          </div>

          {/* ONLY 2 BADGES MAX (Design Rule #3) */}
          {/* Badge 1: Seats left - URGENCY (only if critical) */}
          {numberOfBookableSeats <= 3 && (
            <span className="font-bold text-orange-600 px-1.5 py-0.5 bg-orange-50 rounded flex-shrink-0" style={{ fontSize: typography.card.meta.size }}>
              ⚠️ {numberOfBookableSeats} left
            </span>
          )}

          {/* Badge 2: Direct flight badge (only if direct) */}
          {outboundStops.text === 'Direct' && (
            <span className="font-semibold px-1.5 py-0.5 bg-green-50 text-green-700 rounded flex-shrink-0" style={{ fontSize: typography.card.meta.size }}>
              ✈️ Direct
            </span>
          )}

          {/* Cabin Class Badge - Simple & Clear */}
          <span className="font-semibold px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded flex-shrink-0" style={{ fontSize: typography.card.meta.size }}>
            {outboundBaggage.cabin === 'PREMIUM_ECONOMY' ? 'Premium' :
             outboundBaggage.cabin === 'BUSINESS' ? 'Business' :
             outboundBaggage.cabin === 'FIRST' ? 'First' : 'Economy'}
          </span>
        </div>

        {/* Right: FlightIQ Score + Quick Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {(mlScore !== undefined || score !== undefined) && (
            <div className="text-center px-1.5">
              <div className={`font-bold leading-none ${
                (mlScore !== undefined ? mlScore * 100 : score || 0) >= 90 ? 'text-green-600' :
                (mlScore !== undefined ? mlScore * 100 : score || 0) >= 80 ? 'text-blue-600' :
                (mlScore !== undefined ? mlScore * 100 : score || 0) >= 70 ? 'text-yellow-600' :
                'text-gray-600'
              }`} style={{ fontSize: '16px' }}>
                {mlScore !== undefined ? Math.round(mlScore * 100) : score}
              </div>
              <div className="text-gray-500 font-medium" style={{ fontSize: '8px' }}>
                {mlScore !== undefined ? 'ML' : 'IQ'}
              </div>
            </div>
          )}

          {/* Quick Actions - Smaller */}
          <button
            onClick={() => setIsFavorited(!isFavorited)}
            className={`p-1 rounded transition-all ${
              isFavorited
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
            }`}
            title="Save to favorites"
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="p-1 rounded transition-all bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
            title="Share this flight"
            aria-label="Share flight deal"
            data-testid="share-button"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          {onCompare && (
            <button
              onClick={() => onCompare(id)}
              className={`p-1 rounded transition-all ${
                isComparing
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-500'
              }`}
              title="Compare flights"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ULTRA-COMPACT FLIGHT ROUTE - 50px height (one-way) or 70px (roundtrip) */}
      <div className="px-3 py-2" style={{ minHeight: dimensions.card.route }}>
        {/* Outbound Flight - Ultra-compact inline */}
        <div>
          <div className="flex items-center gap-2">
            {/* Departure */}
            <div className="flex-shrink-0">
              <div className="font-bold text-gray-900" style={{ fontSize: '16px', lineHeight: '1.2' }}>
                {formatTime(outbound.segments[0].departure.at)}
              </div>
              <div className="font-semibold text-gray-600" style={{ fontSize: typography.card.meta.size }}>
                {outbound.segments[0].departure.iataCode}
              </div>
            </div>

            {/* Flight Path - Inline */}
            <div className="flex-1 px-2">
              <div className="relative">
                <div className="h-px bg-gradient-to-r from-gray-300 via-primary-400 to-gray-300"></div>
                <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary-600 bg-white" />
              </div>
              <div className="text-center mt-0.5 flex items-center justify-center gap-1.5">
                <span className="font-medium text-gray-600" style={{ fontSize: typography.card.meta.size }}>
                  {parseDuration(outbound.duration)}
                </span>
                <span className={`font-semibold px-1 py-0.5 rounded ${outboundStops.badge}`} style={{ fontSize: typography.card.meta.size }}>
                  {outboundStops.text}
                </span>
              </div>
            </div>

            {/* Arrival */}
            <div className="flex-shrink-0 text-right">
              <div className="font-bold text-gray-900" style={{ fontSize: '16px', lineHeight: '1.2' }}>
                {formatTime(outbound.segments[outbound.segments.length - 1].arrival.at)}
              </div>
              <div className="font-semibold text-gray-600" style={{ fontSize: typography.card.meta.size }}>
                {outbound.segments[outbound.segments.length - 1].arrival.iataCode}
              </div>
            </div>
          </div>

          {/* EXPANDED: Segment Details */}
          {isExpanded && (
            <div className="mt-2 pl-3 space-y-1.5 border-l-2 border-blue-400">
              {outbound.segments.map((segment, idx) => (
                <div key={`out-seg-${idx}`} className="space-y-1.5 pb-2">
                  {/* ENHANCED SEGMENT HEADER - Full width layout */}
                  <div className="flex items-start justify-between gap-4">
                    {/* LEFT: Airline & Flight Details */}
                    <div className="flex items-center gap-2">
                      <AirlineLogo
                        code={segment.carrierCode}
                        size="sm"
                        className="flex-shrink-0"
                      />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">
                            {getAirlineData(segment.carrierCode).name} {segment.number}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-xs text-gray-600">{segment.aircraft?.code || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="font-semibold">{airlineData.rating.toFixed(1)}</span>
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className={airlineData.onTimePerformance >= 80 ? 'text-green-700 font-semibold' : airlineData.onTimePerformance >= 70 ? 'text-yellow-700 font-semibold' : 'text-red-700 font-semibold'}>
                            On-time {airlineData.onTimePerformance}%
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className={`px-1.5 py-0.5 font-bold text-[10px] rounded ${
                            outboundBaggage.cabin === 'FIRST' ? 'bg-amber-100 text-amber-900' :
                            outboundBaggage.cabin === 'BUSINESS' ? 'bg-blue-100 text-blue-900' :
                            outboundBaggage.cabin === 'PREMIUM_ECONOMY' ? 'bg-indigo-100 text-indigo-900' :
                            'bg-gray-100 text-gray-900'
                          }`}>
                            {outboundBaggage.cabin === 'PREMIUM_ECONOMY' ? 'Premium Economy' :
                             outboundBaggage.cabin === 'BUSINESS' ? 'Business Class' :
                             outboundBaggage.cabin === 'FIRST' ? 'First Class' : 'Economy Class'}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 font-bold text-[10px] rounded">
                            {outboundBaggage.brandedFareLabel || outboundBaggage.fareType}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: Flight Route & Times */}
                    <div className="flex items-center gap-3 text-xs">
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{formatTime(segment.departure.at)}</div>
                        <div className="text-gray-600">{segment.departure.iataCode}</div>
                        {segment.departure.terminal && (
                          <div className="text-[10px] text-gray-500">T{segment.departure.terminal}</div>
                        )}
                      </div>

                      <div className="flex flex-col items-center px-2">
                        <div className="text-[10px] text-gray-500 mb-0.5">{parseDuration(segment.duration || outbound.duration)}</div>
                        <div className="w-12 h-px bg-gray-300 relative">
                          <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-blue-600 bg-white" />
                        </div>
                      </div>

                      <div className="text-left">
                        <div className="font-bold text-gray-900">{formatTime(segment.arrival.at)}</div>
                        <div className="text-gray-600">{segment.arrival.iataCode}</div>
                        {segment.arrival.terminal && (
                          <div className="text-[10px] text-gray-500">T{segment.arrival.terminal}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  {idx < outbound.segments.length - 1 && (
                    <div className="mt-1 px-2 py-0.5 bg-yellow-100 border-l-2 border-yellow-500 text-yellow-900 text-[10px] font-medium rounded">
                      ⏱️ Layover in {segment.arrival.iataCode} • {parseDuration(segment.duration || outbound.duration)}
                    </div>
                  )}
                </div>
              ))}

              {/* ULTRA-COMPACT SINGLE LINE - Full width with better readability */}
              <div className="mt-1.5 py-1 px-2 bg-gray-50/50 rounded-sm border-t border-gray-100">
                <div className="flex items-center justify-between flex-wrap gap-x-2.5 gap-y-1 text-[11px] font-medium min-h-[20px]">
                  {/* Baggage - Same height alignment */}
                  <span className="inline-flex items-center gap-0.5 h-full">
                    <span className="leading-none">🎒</span>
                    <span className={outboundBaggage.carryOn ? 'font-semibold text-green-700 leading-none' : 'font-medium text-gray-700 leading-none'}>
                      {outboundBaggage.carryOn
                        ? outboundBaggage.carryOnQuantity === 2 ? '1 bag+personal' : 'Personal only'
                        : 'Personal only'
                      }
                      <span className="text-gray-600 font-normal">({outboundBaggage.carryOnWeight})</span>
                    </span>
                  </span>

                  <span className="text-gray-400 leading-none">•</span>

                  <span className="inline-flex items-center gap-0.5 h-full">
                    <span className="leading-none">💼</span>
                    <span className={outboundBaggage.checked > 0 ? 'font-semibold text-green-700 leading-none' : 'font-medium text-gray-700 leading-none'}>
                      {outboundBaggage.checked > 0
                        ? `${outboundBaggage.checked} bag${outboundBaggage.checked > 1 ? 's' : ''}`
                        : 'Not included'
                      }
                      {outboundBaggage.checked > 0 && (
                        <span className="text-gray-600 font-normal">({outboundBaggage.checkedWeight})</span>
                      )}
                    </span>
                  </span>

                  <span className="text-gray-400 leading-none">•</span>

                  {/* Amenities - Same height inline */}
                  <span
                    className={`inline-flex items-center gap-0.5 h-full leading-none font-medium ${outboundBaggage.amenities.wifi ? 'text-green-700' : 'text-gray-700'}`}
                    title={outboundBaggage.amenities.isEstimated ? 'Estimated based on aircraft type' : 'Confirmed by airline'}>
                    📶WiFi {outboundBaggage.amenities.wifi ? '✓' : '✗'}
                    {outboundBaggage.amenities.isEstimated && <span className="text-[9px] opacity-60 ml-0.5">~</span>}
                  </span>

                  <span className="text-gray-400 leading-none">•</span>

                  <span
                    className={`inline-flex items-center gap-0.5 h-full leading-none font-medium ${outboundBaggage.amenities.power ? 'text-green-700' : 'text-gray-700'}`}
                    title={outboundBaggage.amenities.isEstimated ? 'Estimated based on aircraft type' : 'Confirmed by airline'}>
                    🔌Power {outboundBaggage.amenities.power ? '✓' : '✗'}
                    {outboundBaggage.amenities.isEstimated && <span className="text-[9px] opacity-60 ml-0.5">~</span>}
                  </span>

                  <span className="text-gray-400 leading-none">•</span>

                  <span
                    className={`inline-flex items-center gap-0.5 h-full leading-none font-medium ${outboundBaggage.amenities.meal !== 'None' ? 'text-gray-800' : 'text-gray-700'}`}
                    title={outboundBaggage.amenities.isEstimated ? 'Estimated based on aircraft type' : 'Confirmed by airline'}>
                    🍽️{outboundBaggage.amenities.meal}
                    {outboundBaggage.amenities.isEstimated && <span className="text-[9px] opacity-60 ml-0.5">~</span>}
                  </span>

                  {/* Fare badges - Same height inline */}
                  {fareRules && (
                    <>
                      <span className="text-gray-400 mx-1 leading-none">|</span>

                      {fareRules.refundable ? (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-green-50 text-green-800 rounded text-[10px] font-medium h-5 leading-none">
                          <Check className="w-2.5 h-2.5" />Refundable
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-red-50 text-red-800 rounded text-[10px] font-medium h-5 leading-none">
                          <X className="w-2.5 h-2.5" />Non-refund
                        </span>
                      )}

                      {fareRules.changeable ? (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-green-50 text-green-800 rounded text-[10px] font-medium h-5 leading-none">
                          <Check className="w-2.5 h-2.5" />Changes OK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-red-50 text-red-800 rounded text-[10px] font-medium h-5 leading-none">
                          <X className="w-2.5 h-2.5" />No changes
                        </span>
                      )}

                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-800 rounded text-[10px] font-medium h-5 leading-none">
                        <Shield className="w-2.5 h-2.5" />24hr
                      </span>

                      <span className={`inline-flex items-center h-full leading-none ${!outboundBaggage.fareType.includes('BASIC') && !outboundBaggage.fareType.includes('LIGHT') ? 'text-green-700 font-medium' : 'text-orange-700 font-medium'}`}>
                        💺{!outboundBaggage.fareType.includes('BASIC') && !outboundBaggage.fareType.includes('LIGHT') ? 'Incl' : 'Fee'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Return Flight - Ultra-compact inline */}
        {isRoundtrip && (
          <div className="mt-1.5 pt-1.5 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0">
                <div className="font-bold text-gray-900" style={{ fontSize: '14px', lineHeight: '1.2' }}>
                  {formatTime(inbound.segments[0].departure.at)}
                </div>
                <div className="font-medium text-gray-600" style={{ fontSize: typography.card.meta.size }}>
                  {inbound.segments[0].departure.iataCode}
                </div>
              </div>

              <div className="flex-1 px-2">
                <div className="relative">
                  <div className="h-px bg-gradient-to-r from-gray-300 via-secondary-400 to-gray-300"></div>
                  <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-secondary-600 bg-white rotate-180" />
                </div>
                <div className="text-center mt-0.5 flex items-center justify-center gap-1.5">
                  <span className="font-medium text-gray-600" style={{ fontSize: typography.card.meta.size }}>
                    {parseDuration(inbound.duration)}
                  </span>
                  {inboundStops && (
                    <span className={`font-semibold px-1 py-0.5 rounded ${inboundStops.badge}`} style={{ fontSize: typography.card.meta.size }}>
                      {inboundStops.text}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-shrink-0 text-right">
                <div className="font-bold text-gray-900" style={{ fontSize: '14px', lineHeight: '1.2' }}>
                  {formatTime(inbound.segments[inbound.segments.length - 1].arrival.at)}
                </div>
                <div className="font-medium text-gray-600" style={{ fontSize: typography.card.meta.size }}>
                  {inbound.segments[inbound.segments.length - 1].arrival.iataCode}
                </div>
              </div>
            </div>

            {/* EXPANDED: Segment Details */}
            {isExpanded && (
              <div className="mt-2 pl-3 space-y-1.5 border-l-2 border-purple-400">
                {inbound.segments.map((segment, idx) => (
                  <div key={`ret-seg-${idx}`} className="space-y-1.5 pb-2">
                    {/* ENHANCED SEGMENT HEADER - Full width layout */}
                    <div className="flex items-start justify-between gap-4">
                      {/* LEFT: Airline & Flight Details */}
                      <div className="flex items-center gap-2">
                        <AirlineLogo
                          code={segment.carrierCode}
                          size="sm"
                          className="flex-shrink-0"
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">
                              {getAirlineData(segment.carrierCode).name} {segment.number}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-xs text-gray-600">{segment.aircraft?.code || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              <span className="font-semibold">{airlineData.rating.toFixed(1)}</span>
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className={airlineData.onTimePerformance >= 80 ? 'text-green-700 font-semibold' : airlineData.onTimePerformance >= 70 ? 'text-yellow-700 font-semibold' : 'text-red-700 font-semibold'}>
                              On-time {airlineData.onTimePerformance}%
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className={`px-1.5 py-0.5 font-bold text-[10px] rounded ${
                              returnBaggage?.cabin === 'FIRST' ? 'bg-amber-100 text-amber-900' :
                              returnBaggage?.cabin === 'BUSINESS' ? 'bg-blue-100 text-blue-900' :
                              returnBaggage?.cabin === 'PREMIUM_ECONOMY' ? 'bg-indigo-100 text-indigo-900' :
                              'bg-gray-100 text-gray-900'
                            }`}>
                              {returnBaggage?.cabin === 'PREMIUM_ECONOMY' ? 'Premium Economy' :
                               returnBaggage?.cabin === 'BUSINESS' ? 'Business Class' :
                               returnBaggage?.cabin === 'FIRST' ? 'First Class' : 'Economy Class'}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 font-bold text-[10px] rounded">
                              {returnBaggage?.brandedFareLabel || returnBaggage?.fareType}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* RIGHT: Flight Route & Times */}
                      <div className="flex items-center gap-3 text-xs">
                        <div className="text-right">
                          <div className="font-bold text-gray-900">{formatTime(segment.departure.at)}</div>
                          <div className="text-gray-600">{segment.departure.iataCode}</div>
                          {segment.departure.terminal && (
                            <div className="text-[10px] text-gray-500">T{segment.departure.terminal}</div>
                          )}
                        </div>

                        <div className="flex flex-col items-center px-2">
                          <div className="text-[10px] text-gray-500 mb-0.5">{parseDuration(segment.duration || inbound.duration)}</div>
                          <div className="w-12 h-px bg-gray-300 relative">
                            <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-purple-600 bg-white rotate-180" />
                          </div>
                        </div>

                        <div className="text-left">
                          <div className="font-bold text-gray-900">{formatTime(segment.arrival.at)}</div>
                          <div className="text-gray-600">{segment.arrival.iataCode}</div>
                          {segment.arrival.terminal && (
                            <div className="text-[10px] text-gray-500">T{segment.arrival.terminal}</div>
                          )}
                        </div>
                      </div>
                    </div>
                    {idx < inbound.segments.length - 1 && (
                      <div className="mt-1 px-2 py-0.5 bg-yellow-100 border-l-2 border-yellow-500 text-yellow-900 text-[10px] font-medium rounded">
                        ⏱️ Layover in {segment.arrival.iataCode} • {parseDuration(segment.duration || inbound.duration)}
                      </div>
                    )}
                  </div>
                ))}

                {/* ULTRA-COMPACT SINGLE LINE - RETURN FLIGHT - Full width with better readability */}
                {returnBaggage && (
                  <div className="mt-1.5 py-1 px-2 bg-gray-50/50 rounded-sm border-t border-gray-100">
                    <div className="flex items-center justify-between flex-wrap gap-x-2.5 gap-y-1 text-[11px] font-medium min-h-[20px]">
                      {/* Baggage - Same height alignment */}
                      <span className="inline-flex items-center gap-0.5 h-full">
                        <span className="leading-none">🎒</span>
                        <span className={returnBaggage.carryOn ? 'font-semibold text-green-700 leading-none' : 'font-medium text-gray-700 leading-none'}>
                          {returnBaggage.carryOn
                            ? returnBaggage.carryOnQuantity === 2 ? '1 bag+personal' : 'Personal only'
                            : 'Personal only'
                          }
                          <span className="text-gray-600 font-normal">({returnBaggage.carryOnWeight})</span>
                        </span>
                      </span>

                      <span className="text-gray-400 leading-none">•</span>

                      <span className="inline-flex items-center gap-0.5 h-full">
                        <span className="leading-none">💼</span>
                        <span className={returnBaggage.checked > 0 ? 'font-semibold text-green-700 leading-none' : 'font-medium text-gray-700 leading-none'}>
                          {returnBaggage.checked > 0
                            ? `${returnBaggage.checked} bag${returnBaggage.checked > 1 ? 's' : ''}`
                            : 'Not included'
                          }
                          {returnBaggage.checked > 0 && (
                            <span className="text-gray-600 font-normal">({returnBaggage.checkedWeight})</span>
                          )}
                        </span>
                      </span>

                      <span className="text-gray-400 leading-none">•</span>

                      {/* Amenities - Same height inline */}
                      <span
                        className={`inline-flex items-center gap-0.5 h-full leading-none font-medium ${returnBaggage.amenities.wifi ? 'text-green-700' : 'text-gray-700'}`}
                        title={returnBaggage.amenities.isEstimated ? 'Estimated based on aircraft type' : 'Confirmed by airline'}>
                        📶WiFi {returnBaggage.amenities.wifi ? '✓' : '✗'}
                        {returnBaggage.amenities.isEstimated && <span className="text-[9px] opacity-60 ml-0.5">~</span>}
                      </span>

                      <span className="text-gray-400 leading-none">•</span>

                      <span
                        className={`inline-flex items-center gap-0.5 h-full leading-none font-medium ${returnBaggage.amenities.power ? 'text-green-700' : 'text-gray-700'}`}
                        title={returnBaggage.amenities.isEstimated ? 'Estimated based on aircraft type' : 'Confirmed by airline'}>
                        🔌Power {returnBaggage.amenities.power ? '✓' : '✗'}
                        {returnBaggage.amenities.isEstimated && <span className="text-[9px] opacity-60 ml-0.5">~</span>}
                      </span>

                      <span className="text-gray-400 leading-none">•</span>

                      <span
                        className={`inline-flex items-center gap-0.5 h-full leading-none font-medium ${returnBaggage.amenities.meal !== 'None' ? 'text-gray-800' : 'text-gray-700'}`}
                        title={returnBaggage.amenities.isEstimated ? 'Estimated based on aircraft type' : 'Confirmed by airline'}>
                        🍽️{returnBaggage.amenities.meal}
                        {returnBaggage.amenities.isEstimated && <span className="text-[9px] opacity-60 ml-0.5">~</span>}
                      </span>

                      {/* Fare badges - Same height inline */}
                      {fareRules && (
                        <>
                          <span className="text-gray-400 mx-1 leading-none">|</span>

                          {fareRules.refundable ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-green-50 text-green-800 rounded text-[10px] font-medium h-5 leading-none">
                              <Check className="w-2.5 h-2.5" />Refundable
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-red-50 text-red-800 rounded text-[10px] font-medium h-5 leading-none">
                              <X className="w-2.5 h-2.5" />Non-refund
                            </span>
                          )}

                          {fareRules.changeable ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-green-50 text-green-800 rounded text-[10px] font-medium h-5 leading-none">
                              <Check className="w-2.5 h-2.5" />Changes OK
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-red-50 text-red-800 rounded text-[10px] font-medium h-5 leading-none">
                              <X className="w-2.5 h-2.5" />No changes
                            </span>
                          )}

                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-800 rounded text-[10px] font-medium h-5 leading-none">
                            <Shield className="w-2.5 h-2.5" />24hr
                          </span>

                          <span className={`inline-flex items-center h-full leading-none ${!returnBaggage.fareType.includes('BASIC') && !returnBaggage.fareType.includes('LIGHT') ? 'text-green-700 font-medium' : 'text-orange-700 font-medium'}`}>
                            💺{!returnBaggage.fareType.includes('BASIC') && !returnBaggage.fareType.includes('LIGHT') ? 'Incl' : 'Fee'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* NEW: Per-Leg Comparison Alert */}
        {isExpanded && baggageDiffers && returnBaggage && (
          <div className="mt-2 p-2 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
            <div className="flex items-center gap-2 text-xs">
              <Info className="w-4 h-4 text-yellow-700 flex-shrink-0" />
              <span className="font-bold text-yellow-900">Different amenities for outbound vs. return</span>
            </div>
            <div className="mt-1.5 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-start gap-1">
                <span className="font-semibold text-blue-700">Outbound:</span>
                <span className="text-gray-700">
                  {outboundBaggage.fareType}, {outboundBaggage.checked} bag(s)
                  {outboundBaggage.amenities.wifi && ', WiFi'}
                  {outboundBaggage.amenities.power && ', Power'}
                </span>
              </div>
              <div className="flex items-start gap-1">
                <span className="font-semibold text-purple-700">Return:</span>
                <span className="text-gray-700">
                  {returnBaggage.fareType}, {returnBaggage.checked} bag(s)
                  {returnBaggage.amenities.wifi && ', WiFi'}
                  {returnBaggage.amenities.power && ', Power'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CONVERSION FEATURES ROW - Always Visible */}
      <div className={`px-3 py-2 border-t border-gray-100 ${isDebugMode ? 'bg-yellow-100 border-4 border-red-500' : ''}`} data-testid="conversion-features">
        {isDebugMode && (
          <div className="text-xs font-bold text-red-600 mb-1">
            DEBUG MODE: Conversion Features Section
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {/* Deal Score Badge - Uniform h-5 height */}
          {dealScore !== undefined && dealTier && dealLabel && (
            <div className={`inline-flex items-center gap-1.5 px-2 rounded-full border h-5 ${isDebugMode ? 'ring-2 ring-yellow-500' : ''} ${
              dealTier === 'excellent' ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-400' :
              dealTier === 'great' ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-500' :
              dealTier === 'good' ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-400' :
              'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-400'
            }`}>
              <span className={`text-sm font-bold leading-none ${
                dealTier === 'excellent' ? 'text-amber-900' :
                dealTier === 'great' ? 'text-green-900' :
                dealTier === 'good' ? 'text-blue-900' :
                'text-gray-900'
              }`}>{dealScore}</span>
              <span className={`text-xs font-semibold leading-none ${
                dealTier === 'excellent' ? 'text-amber-900' :
                dealTier === 'great' ? 'text-green-900' :
                dealTier === 'good' ? 'text-blue-900' :
                'text-gray-900'
              }`}>
                {dealTier === 'excellent' ? 'Excellent' : dealTier === 'great' ? 'Great' : dealTier === 'good' ? 'Good' : 'Fair'}
              </span>
              <span className="text-[10px] text-gray-600 leading-none">Deal Score</span>
              <span className="text-sm leading-none">{
                dealTier === 'excellent' ? '🏆' :
                dealTier === 'great' ? '✨' :
                dealTier === 'good' ? '👍' :
                '💼'
              }</span>
            </div>
          )}

          {/* CO2 Badge - Now h-5 from component */}
          <div className={isDebugMode ? 'ring-2 ring-blue-500' : ''}>
            <CO2Badge
              emissions={co2Emissions ?? Math.round(durationToMinutes(outbound.duration) * 0.15)}
              averageEmissions={averageCO2 ?? Math.round(durationToMinutes(outbound.duration) * 0.18)}
              compact={true}
            />
          </div>

          {/* Viewers Count - Uniform h-5 height */}
          <div className={`inline-flex items-center gap-1.5 px-2 bg-orange-50 text-orange-700 rounded-full text-xs font-semibold border border-orange-200 h-5 leading-none ${isDebugMode ? 'ring-2 ring-green-500' : ''}`}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
            </svg>
            <span className="leading-none">{currentViewingCount} viewing</span>
          </div>

          {/* Bookings Today - Uniform h-5 height */}
          {numberOfBookableSeats < 7 && (
            <div className={`inline-flex items-center gap-1.5 px-2 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-200 h-5 leading-none ${isDebugMode ? 'ring-2 ring-purple-500' : ''}`}>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span className="leading-none">{bookingsToday ?? Math.floor(Math.random() * 150) + 100} booked today</span>
            </div>
          )}
        </div>
      </div>

      {/* ULTRA-COMPACT FOOTER - 32px height */}
      <div className="flex items-center justify-between gap-3 px-3 py-1.5 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100" style={{ minHeight: dimensions.card.footer }}>
        {/* Left: Price + Market Comparison (inline) */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="font-bold text-gray-900" style={{ fontSize: typography.card.price.size, lineHeight: '1' }}>
            {price.currency} {Math.round(totalPrice)}
          </span>
          {priceVsMarket !== undefined && priceVsMarket !== null && (
            <span className={`px-1.5 py-0.5 font-bold rounded ${
              priceVsMarket <= -10 ? 'bg-green-100 text-green-700' :
              priceVsMarket <= 0 ? 'bg-blue-100 text-blue-700' :
              priceVsMarket <= 10 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`} style={{ fontSize: typography.card.meta.size }}>
              {priceVsMarket > 0 ? '+' : ''}{Math.round(priceVsMarket)}% vs market
            </span>
          )}
          {!priceVsMarket && savings > 0 && (
            <>
              <span className="text-gray-400 line-through" style={{ fontSize: typography.card.meta.size }}>
                ${Math.round(averagePrice)}
              </span>
              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 font-bold rounded" style={{ fontSize: typography.card.meta.size }}>
                {savingsPercentage}% OFF
              </span>
            </>
          )}
        </div>

        {/* Center: Baggage Icons (Google Flights 2025 Standard) */}
        <div className="flex items-center gap-1.5 flex-shrink-0 px-2 py-1 bg-gray-100 rounded-md">
          <div className="flex items-center gap-0.5" title={`${baggageInfo.carryOn ? 'Carry-on included' : 'No carry-on'}`}>
            <span style={{ fontSize: '14px' }}>🎒</span>
            {baggageInfo.carryOn ? (
              <span className="text-green-600 font-bold" style={{ fontSize: '10px' }}>✓</span>
            ) : (
              <span className="text-red-600 font-bold" style={{ fontSize: '10px' }}>✗</span>
            )}
          </div>
          <div className="flex items-center gap-0.5" title={`${baggageInfo.checked} checked bag(s)`}>
            <span style={{ fontSize: '14px' }}>💼</span>
            <span className={`font-semibold text-[10px] ${baggageInfo.checked > 0 ? 'text-green-700' : 'text-red-600'}`}>
              {baggageInfo.checked}
            </span>
          </div>
        </div>

        {/* Right: Action Buttons - Inline */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            disabled={isNavigating}
            className="px-3 py-1 bg-white border border-gray-300 text-gray-700 font-medium rounded hover:border-primary-500 hover:text-primary-600 transition-all flex items-center gap-1"
            style={{ fontSize: typography.card.meta.size }}
            aria-label={isExpanded ? "Hide flight details" : "Show flight details"}
            data-testid="expand-details-button"
          >
            Details {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            onClick={handleSelectClick}
            disabled={isNavigating}
            className={`
              px-4 py-1.5 font-bold rounded transition-all whitespace-nowrap
              ${isNavigating
                ? 'bg-gradient-to-r from-success to-success/90 text-white cursor-wait'
                : 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-700 hover:to-secondary-700 hover:shadow-md active:scale-95'
              }
            `}
            style={{ fontSize: typography.card.body.size }}
          >
            {isNavigating ? (
              <span className="flex items-center gap-1">
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading
              </span>
            ) : (
              'Select →'
            )}
          </button>
        </div>
      </div>

      {/* EXPANDED DETAILS - Collapsible (Ultra-Compact) */}
      {isExpanded && (
        <div className="px-3 py-1.5 border-t border-gray-200 space-y-1.5 bg-gray-50 animate-slideDown">
          {/* PRICE BREAKDOWN - Clearer Separation of Required vs Optional */}
          <div className="grid grid-cols-1 gap-2">
            {/* TruePrice Breakdown - Full Width */}
            <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-xs text-blue-900 mb-1.5">Price Breakdown</h4>
              <div className="space-y-0.5 text-xs">
                {/* REQUIRED FEES */}
                <div className="flex justify-between">
                  <span className="text-gray-700">Base fare</span>
                  <span className="font-semibold text-gray-900">{price.currency} {Math.round(basePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Taxes & fees ({feesPercentage}%)</span>
                  <span className="font-semibold text-gray-900">{price.currency} {Math.round(fees)}</span>
                </div>

                {/* TOTAL - Required fees only */}
                <div className="pt-1.5 mt-1 border-t-2 border-blue-300 flex justify-between font-bold text-sm">
                  <span className="text-blue-900">TOTAL</span>
                  <span className="text-blue-900">{price.currency} {Math.round(totalPrice)}</span>
                </div>

                {/* OPTIONAL ADD-ONS - Clearly separated */}
                {(estimatedBaggage > 0 || estimatedSeat > 0) && (
                  <div className="pt-2 mt-2 border-t border-blue-200">
                    <div className="text-[10px] font-semibold text-gray-600 mb-1">Optional Add-ons (not included):</div>
                    {estimatedBaggage > 0 && (
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-gray-600">+ Checked baggage</span>
                        <span className="font-semibold text-gray-700">{price.currency} {estimatedBaggage}</span>
                      </div>
                    )}
                    {estimatedSeat > 0 && (
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-gray-600">+ Seat selection</span>
                        <span className="font-semibold text-gray-700">{price.currency} {estimatedSeat}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* FARE RULES & POLICIES - Controlled Accordion */}
          <div className="space-y-1.5">
            {/* Fare Rules & Policies */}
            <div>
              <button
                className="w-full flex items-center justify-between p-2 bg-yellow-50 border border-yellow-200 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
                onClick={() => {
                  if (!fareRules && !loadingFareRules) {
                    // Load fare rules from API
                    loadFareRules();
                  } else if (fareRules) {
                    // Toggle visibility if already loaded
                    setShowFareRules(!showFareRules);
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">📋</span>
                  <div className="text-left">
                    <div className="font-semibold text-sm text-yellow-900">Refund & Change Policies</div>
                    <div className="text-xs text-yellow-700">
                      {fareRules ? 'Click to view detailed policies' : 'Load from API'}
                    </div>
                  </div>
                </div>
                {loadingFareRules ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-700"></div>
                ) : (
                  <ChevronDown className={`w-4 h-4 text-yellow-700 transition-transform ${showFareRules ? 'rotate-180' : ''}`} />
                )}
              </button>
              {fareRules && showFareRules && (
                <div className="mt-1.5">
                  <FareRulesAccordion
                    fareRules={fareRules}
                    fareClass={baggageInfo.fareType}
                    ticketPrice={totalPrice}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Important Notice for Basic Economy - Always visible when applicable */}
          {baggageInfo.fareType.includes('BASIC') && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-orange-900 mb-1 text-sm">⚠️ Basic Economy Restrictions</h4>
                  <ul className="text-xs text-orange-800 space-y-0.5 list-disc list-inside">
                    {!baggageInfo.carryOn && <li>NO carry-on bag (personal item only)</li>}
                    {baggageInfo.checked === 0 && <li>NO checked bags (fees apply)</li>}
                    <li>NO seat selection (assigned at check-in)</li>
                    <li>NO changes/refunds (24hr grace only)</li>
                  </ul>
                  <button
                    onClick={() => setShowFareModal(true)}
                    className="mt-2 text-xs font-semibold text-orange-700 hover:text-orange-900 underline"
                  >
                    Compare higher fare classes →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fare Comparison Modal */}
      {showFareModal && (
        <FareComparisonModal
          isOpen={showFareModal}
          onClose={() => setShowFareModal(false)}
          currentFare={{
            fareClass: baggageInfo.fareType.includes('BASIC') ? 'BASIC' : 'STANDARD',
            price: totalPrice,
            currency: price.currency,
            carryOnIncluded: baggageInfo.carryOn,
            checkedBagsIncluded: baggageInfo.checked,
            seatSelectionIncluded: !baggageInfo.fareType.includes('BASIC'),
            fareRules: fareRules || undefined,
          }}
          availableFares={[
            // Mock fare options - in production, fetch from API
            {
              fareClass: 'BASIC',
              price: totalPrice,
              currency: price.currency,
              carryOnIncluded: false,
              checkedBagsIncluded: 0,
              seatSelectionIncluded: false,
              seatSelectionFee: 30,
              fareRules: fareRules || undefined,
            },
            {
              fareClass: 'STANDARD',
              price: totalPrice + 80,
              currency: price.currency,
              carryOnIncluded: true,
              checkedBagsIncluded: 1,
              seatSelectionIncluded: true,
              recommended: true,
              savingsVsNext: 120,
            },
            {
              fareClass: 'PREMIUM',
              price: totalPrice + 200,
              currency: price.currency,
              carryOnIncluded: true,
              checkedBagsIncluded: 2,
              seatSelectionIncluded: true,
              priorityBoarding: true,
              loungeAccess: false,
              mealIncluded: true,
              wifiIncluded: true,
            },
          ]}
          onSelectFare={handleFareSelect}
          flightRoute={`${outbound.segments[0].departure.iataCode} → ${outbound.segments[outbound.segments.length - 1].arrival.iataCode}`}
          flightDate={formatDate(outbound.segments[0].departure.at)}
        />
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="absolute top-3 right-3 z-50 animate-slideDown">
          <div className="bg-success text-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 text-sm">
            <Check className="w-4 h-4" />
            <span className="font-semibold">Flight Selected!</span>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareFlightModal
          flight={{
            id,
            itineraries,
            price,
            numberOfBookableSeats,
            validatingAirlineCodes,
            travelerPricings,
            badges,
            score,
            ...(mlScore !== undefined && { mlScore }),
            ...(priceVsMarket !== undefined && { priceVsMarket }),
            ...(co2Emissions !== undefined && { co2Emissions }),
            ...(averageCO2 !== undefined && { averageCO2 }),
            ...(viewingCount !== undefined && { viewingCount }),
            ...(bookingsToday !== undefined && { bookingsToday }),
            ...(dealScore !== undefined && { dealScore }),
            ...(dealScoreBreakdown !== undefined && { dealScoreBreakdown }),
            ...(dealTier !== undefined && { dealTier }),
            ...(dealLabel !== undefined && { dealLabel }),
          }}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
