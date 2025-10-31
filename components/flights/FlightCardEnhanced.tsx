'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Star, Clock, Users, Plane, Wifi, Coffee, Zap, Heart, Share2, Info, Check, X, Shield, AlertTriangle, Award, Sparkles, Image as ImageIcon } from 'lucide-react';
import ShareFlightModal from './ShareFlightModal';
import { FlightRichContent } from './FlightRichContent';
import { NDCBenefitsModal } from './NDCBenefitsModal';
import { getAirlineData, getAllianceBadgeColor, getRatingColor, getOnTimePerformanceBadge } from '@/lib/flights/airline-data';
import { getEstimatedAmenities } from '@/lib/flights/aircraft-amenities';
import { formatCityCode, getAirportCity } from '@/lib/data/airports';
import { getAircraftName } from '@/lib/flights/aircraft-names';
import { formatBaggageWeight, extractWeight } from '@/lib/flights/weight-utils';
import AirlineLogo from './AirlineLogo';
import UrgencyIndicators from './UrgencyIndicators';
import SocialProof from './SocialProof';
import { UrgencySignals } from './UrgencySignals';
import { LoyaltyBadge, calculateLoyaltyMiles, estimateDistance } from './LoyaltyBadge';
import PriceAnchoringBadge from './PriceAnchoringBadge';
import CO2Badge from './CO2Badge';
import BaggageTooltip from './BaggageTooltip';
import FareComparisonModal, { FareOption } from './FareComparisonModal';
import FareRulesAccordion from './FareRulesAccordion';
import { DealScoreBadgeCompact } from './DealScoreBadge';
import type { DealScoreBreakdown } from '@/lib/flights/dealScore';
import { dimensions, spacing, typography, colors } from '@/lib/design-system';
import FareUpgradePanel from './FareUpgradePanel';
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
  fees?: Array<{ amount: string | number; type: string }>; // Optional fees array with type
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
  // Amadeus API fields needed for upselling
  type?: string;
  source?: string;
  instantTicketingRequired?: boolean;
  nonHomogeneous?: boolean;
  oneWay?: boolean;
  lastTicketingDate?: string;
  lastTicketingDateTime?: string;
  pricingOptions?: any;
  // NDC and Rich Content fields
  isNDC?: boolean; // Whether this is an NDC offer
  ndcSavings?: number; // Savings compared to GDS price
  richContent?: {
    cabinPhotos?: string[];
    seatPhotos?: string[];
    amenityDetails?: string[];
    videos?: string[];
  };
  // ML User Segmentation
  userSegment?: 'business' | 'leisure' | 'family' | 'budget' | null;
  segmentRecommendations?: any;
  // A/B Testing
  urgencyVariant?: 'control' | 'variant_a' | 'variant_b';
  sessionId?: string;
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
  // Amadeus API fields
  type = 'flight-offer',
  source = 'GDS',
  instantTicketingRequired = false,
  nonHomogeneous = false,
  oneWay,
  lastTicketingDate,
  lastTicketingDateTime,
  pricingOptions,
  // NDC and Rich Content fields
  isNDC = false,
  ndcSavings,
  richContent,
  // ML User Segmentation
  userSegment,
  segmentRecommendations,
  // A/B Testing
  urgencyVariant = 'variant_a',
  sessionId,
}: EnhancedFlightCardProps) {
  // Early return if itineraries is missing or empty
  if (!itineraries || !Array.isArray(itineraries) || itineraries.length === 0) {
    console.error('FlightCardEnhanced: Invalid flight data - missing itineraries', { id, itineraries });
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center text-gray-500">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <p>Invalid flight data - missing itinerary information</p>
        </div>
      </div>
    );
  }

  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showFareModal, setShowFareModal] = useState(false);
  const [showFareRules, setShowFareRules] = useState(false);
  const [fareRules, setFareRules] = useState<ParsedFareRules | null>(null);
  const [loadingFareRules, setLoadingFareRules] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRichContent, setShowRichContent] = useState(false);
  const [showNDCBenefits, setShowNDCBenefits] = useState(false);

  // DEBUG: Log component render and conversion feature props
  useEffect(() => {
    console.log('🔍 FlightCardEnhanced DEBUG:', {
      id,
      itinerariesCount: itineraries?.length || 0,
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

  // Determine journey type FIRST (needed for other calculations)
  const isMultiCity = itineraries.length > 2;
  const isRoundtrip = itineraries.length === 2;

  // Get airline info - handle multi-city with multiple airlines
  const primaryAirline = validatingAirlineCodes[0] || itineraries[0]?.segments[0]?.carrierCode || 'XX';
  const airlineData = getAirlineData(primaryAirline);

  // For multi-city, collect all unique airlines
  const allAirlines = isMultiCity
    ? Array.from(new Set(
        itineraries.flatMap(itinerary =>
          itinerary.segments.map(seg => seg.carrierCode)
        )
      ))
    : [primaryAirline];

  const hasMultipleAirlines = allAirlines.length > 1;

  // Get primary flight number (first segment) and strip airline code prefix
  const rawFlightNumber = itineraries[0]?.segments[0]?.number || '';
  const primaryFlightNumber = rawFlightNumber.replace(/^[A-Z]{2}\s*/, ''); // Remove 2-letter airline code prefix

  // Calculate totals with type-safe parsing
  const parsePrice = (value: string | number | undefined): number => {
    if (value === undefined) return 0;
    return typeof value === 'number' ? value : parseFloat(value);
  };

  const totalPrice = parsePrice(price.total);

  // Calculate fees and base price correctly
  let fees = 0;
  let basePrice = parsePrice(price.base);

  // If fees array exists, use it to calculate fees
  if (price.fees && Array.isArray(price.fees) && price.fees.length > 0) {
    fees = price.fees.reduce((sum, fee) => sum + parsePrice(fee.amount), 0);

    // If base price is missing or equals total, recalculate it from fees
    if ((basePrice === 0 || basePrice === totalPrice) && fees > 0) {
      basePrice = totalPrice - fees;
    }
  } else if (basePrice > 0 && basePrice < totalPrice) {
    // Have valid base price, calculate fees
    fees = Math.max(0, totalPrice - basePrice);
  } else if (basePrice === 0 || price.base === undefined) {
    // Missing base price - estimate typical breakdown (85% base, 15% fees)
    fees = totalPrice * 0.15;
    basePrice = totalPrice * 0.85;
  } else {
    // Base equals total (no fees)
    fees = 0;
    basePrice = totalPrice;
  }

  const feesPercentage = totalPrice > 0 ? ((fees / totalPrice) * 100).toFixed(0) : '0';

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
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
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

  // Calculate stops for each leg
  const legsStopsInfo = itineraries.map(itinerary => getStopsInfo(itinerary.segments));
  const onTimeBadge = getOnTimePerformanceBadge(airlineData.onTimePerformance);

  // Format fare type for display
  const formatFareType = (fareType: string): string => {
    if (!fareType) return '';
    // Handle common fare type patterns
    if (fareType.includes('BASIC') || fareType.includes('LIGHT') || fareType.includes('SAVER')) return 'Basic';
    if (fareType.includes('FLEX') || fareType.includes('FLEXIBLE')) return 'Flex';
    if (fareType.includes('STANDARD') || fareType.includes('MAIN') || fareType.includes('CLASSIC')) return 'Standard';
    if (fareType.includes('PREMIUM') || fareType.includes('PLUS')) return 'Premium';
    // Default: capitalize first letter
    return fareType.charAt(0).toUpperCase() + fareType.slice(1).toLowerCase();
  };

  // Calculate savings
  const averagePrice = totalPrice * 1.25;
  const savings = averagePrice - totalPrice;
  const savingsPercentage = ((savings / averagePrice) * 100).toFixed(0);

  // NEW: Parse amenities from Amadeus API with cabin-based fallback and minimum standards
  const getMealType = (amenities: any[], cabin: string): string => {
    const mealAmenity = amenities.find((a: any) => a.amenityType === 'MEAL');

    // Define cabin-based minimums
    const cabinMinimums: { [key: string]: string } = {
      'FIRST': 'Multi-course meal',
      'BUSINESS': 'Hot meal',
      'PREMIUM_ECONOMY': 'Meal',
      'ECONOMY': 'Snack or meal'
    };

    const cabinMinimum = cabinMinimums[cabin] || 'Snack or meal';

    if (mealAmenity) {
      // Parse real MEAL data from API
      const desc = mealAmenity.description.toLowerCase();
      let apiMeal = 'Refreshments';

      if (desc.includes('multi-course') || desc.includes('gourmet')) apiMeal = 'Multi-course meal';
      else if (desc.includes('hot meal')) apiMeal = 'Hot meal';
      else if (desc.includes('meal')) apiMeal = 'Meal';
      else if (desc.includes('snack')) apiMeal = 'Snack';

      // For premium cabins, use cabin minimum if API data is lower quality
      if (cabin === 'FIRST' || cabin === 'BUSINESS') {
        // First class should never show less than "Multi-course meal" or "Hot meal"
        // Business class should never show less than "Hot meal"
        if (apiMeal === 'Snack' || apiMeal === 'Refreshments') {
          return cabinMinimum;
        }
      }

      return apiMeal;
    }

    // Fall back to cabin-based estimate when no MEAL amenity
    return cabinMinimum;
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

      // Use hybrid approach: combine API data with cabin-based minimums
      const estimatedAmenities = getEstimatedAmenities(aircraftCode, cabin);

      const amenities = amenitiesArray.length > 0
        ? {
            // Hybrid: use API data OR cabin-based minimum (whichever is better)
            wifi: amenitiesArray.some((a: any) =>
              a.description.toLowerCase().includes('wifi') ||
              a.description.toLowerCase().includes('wi-fi') ||
              a.description.toLowerCase().includes('internet')
            ) || (cabin === 'FIRST' || cabin === 'BUSINESS' ? estimatedAmenities.wifi : false),

            power: amenitiesArray.some((a: any) =>
              a.description.toLowerCase().includes('power') ||
              a.description.toLowerCase().includes('outlet') ||
              a.description.toLowerCase().includes('usb')
            ) || (cabin === 'FIRST' || cabin === 'BUSINESS' ? estimatedAmenities.power : false),

            meal: getMealType(amenitiesArray, cabin),

            entertainment: amenitiesArray.some((a: any) => a.amenityType === 'ENTERTAINMENT')
              || (cabin === 'FIRST' || cabin === 'BUSINESS' ? estimatedAmenities.entertainment : false),

            isEstimated: false
          }
        : {
            // Estimated data based on aircraft type and cabin class
            ...estimatedAmenities
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

  // Get baggage info for ALL legs (multi-city support)
  const legsBaggage = itineraries.map((_, index) => getBaggageByItinerary(index));

  // Check if ANY legs differ in baggage
  const baggageDiffers = legsBaggage.length > 1 && legsBaggage.some((baggage, index) => {
    if (index === 0) return false;
    const firstLeg = legsBaggage[0];
    return (
      baggage.checked !== firstLeg.checked ||
      baggage.fareType !== firstLeg.fareType ||
      baggage.amenities.wifi !== firstLeg.amenities.wifi ||
      baggage.carryOn !== firstLeg.carryOn
    );
  });

  // Legacy support: Keep baggageInfo for existing code (use first leg)
  const baggageInfo = legsBaggage[0];

  // TruePrice calculation - based on actual baggage allowance
  const getBaggageFees = () => {
    // If baggage is already included, no extra fee
    if (baggageInfo.checked > 0) {
      return 0;
    }

    // If no checked baggage included, estimate the cost
    // Domestic: ~$35 first bag, International: ~$60 first bag
    const isInternational = itineraries[0].segments.some(seg =>
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
    // IMPORTANT: Include all Amadeus API fields for upselling and seat map APIs
    const flightData = {
      id,
      type,
      source,
      instantTicketingRequired,
      nonHomogeneous,
      oneWay,
      lastTicketingDate,
      lastTicketingDateTime,
      itineraries,
      price,
      pricingOptions,
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

  // Calculate loyalty miles earning
  const flightDurationMins = durationToMinutes(itineraries[0].duration);
  const estimatedFlightDistance = estimateDistance(flightDurationMins);
  const loyaltyMilesEarned = calculateLoyaltyMiles(estimatedFlightDistance, baggageInfo.cabin as any);
  const loyaltyProgram = airlineData.frequentFlyerProgram;

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

          {/* Airline Name + Flight Number (or "Multi-City" for multiple airlines) */}
          <div className="flex items-baseline gap-1.5 truncate">
            <span className="font-semibold text-gray-900 truncate" style={{ fontSize: typography.card.title.size }}>
              {hasMultipleAirlines ? 'Multi-City Journey' : airlineData.name}
            </span>
            {!hasMultipleAirlines && primaryFlightNumber && (
              <span className="font-medium text-gray-500 truncate flex items-baseline gap-1" style={{ fontSize: '11px' }}>
                <span className="text-gray-400">Flight</span>
                <span className="text-gray-600 font-semibold">{primaryFlightNumber}</span>
              </span>
            )}
            {hasMultipleAirlines && (
              <span className="font-medium text-gray-500 truncate" style={{ fontSize: '11px' }}>
                {allAirlines.length} Airlines • {itineraries.length} Legs
              </span>
            )}
          </div>

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

          {/* Badge 2: Direct flight badge (only if ALL legs are direct for multi-city) */}
          {legsStopsInfo.every(stops => stops.text === 'Direct') && (
            <span className="font-semibold px-1.5 py-0.5 bg-green-50 text-green-700 rounded flex-shrink-0" style={{ fontSize: typography.card.meta.size }}>
              ✈️ All Direct
            </span>
          )}

          {/* NDC Exclusive Badge */}
          {isNDC && (
            <span className="font-bold px-2 py-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex-shrink-0 flex items-center gap-1 shadow-md" style={{ fontSize: typography.card.meta.size }}>
              <Sparkles className="w-3 h-3" />
              NDC Exclusive
            </span>
          )}

          {/* Fare Type + Cabin Class Badge - Combined */}
          <span className="font-semibold px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded flex-shrink-0" style={{ fontSize: typography.card.meta.size }}>
            {formatFareType(baggageInfo.fareType)} {baggageInfo.cabin === 'PREMIUM_ECONOMY' ? 'Premium' :
             baggageInfo.cabin === 'BUSINESS' ? 'Business' :
             baggageInfo.cabin === 'FIRST' ? 'First' : 'Economy'}
          </span>

          {/* Loyalty Miles Badge - Moved to header (after fare class) */}
          {loyaltyProgram && loyaltyMilesEarned > 0 && (
            <LoyaltyBadge
              program={loyaltyProgram}
              estimatedMiles={loyaltyMilesEarned}
              airline={airlineData.name}
            />
          )}
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* ML Score - Removed */}
          {/* {(mlScore !== undefined || score !== undefined) && (
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
          )} */}

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

          {/* Compare button - Removed */}
          {/* {onCompare && (
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
          )} */}
        </div>
      </div>

      {/* ULTRA-COMPACT FLIGHT ROUTE - Dynamic for multi-city (3+ legs) */}
      <div className="px-3 py-2" style={{ minHeight: dimensions.card.route }}>
        {/* RENDER ALL ITINERARIES DYNAMICALLY */}
        {itineraries.map((itinerary, legIndex) => {
          const legStops = legsStopsInfo[legIndex];
          const legBaggage = legsBaggage[legIndex];

          // Color scheme for different legs
          const legColors = [
            { border: 'border-blue-400', plane: 'text-primary-600', gradient: 'from-gray-300 via-primary-400 to-gray-300', planeRotate: '' },
            { border: 'border-purple-400', plane: 'text-secondary-600', gradient: 'from-gray-300 via-secondary-400 to-gray-300', planeRotate: 'rotate-180' },
            { border: 'border-green-400', plane: 'text-green-600', gradient: 'from-gray-300 via-green-400 to-gray-300', planeRotate: '' },
            { border: 'border-orange-400', plane: 'text-orange-600', gradient: 'from-gray-300 via-orange-400 to-gray-300', planeRotate: '' },
            { border: 'border-pink-400', plane: 'text-pink-600', gradient: 'from-gray-300 via-pink-400 to-gray-300', planeRotate: '' },
          ];
          const legColor = legColors[legIndex % legColors.length];

          return (
            <div key={`leg-${legIndex}`} className={legIndex > 0 ? 'mt-1.5 pt-1.5 border-t border-gray-100' : ''}>
              {/* Leg Label for multi-city */}
              {isMultiCity && (
                <div className="text-xs font-semibold text-gray-500 mb-1">
                  Leg {legIndex + 1} of {itineraries.length}
                </div>
              )}

              <div className="flex items-center gap-2">
                {/* Departure */}
                <div className="flex-shrink-0">
                  <div className="flex items-baseline gap-1 leading-none">
                    <span className="font-bold text-gray-900" style={{ fontSize: legIndex === 0 ? '16px' : '14px' }}>{formatDate(itinerary.segments[0].departure.at)}</span>
                    <span className="text-sm font-semibold text-gray-600">{formatTime(itinerary.segments[0].departure.at)}</span>
                  </div>
                  <div className="font-semibold text-gray-600 mt-0.5" style={{ fontSize: typography.card.meta.size }}>
                    {formatCityCode(itinerary.segments[0].departure.iataCode)}
                  </div>
                </div>

                {/* Flight Path - Inline */}
                <div className="flex-1 px-2">
                  <div className="relative">
                    <div className={`h-px bg-gradient-to-r ${legColor.gradient}`}></div>
                    <Plane className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 ${legColor.plane} bg-white ${legColor.planeRotate}`} />
                  </div>
                  <div className="text-center mt-0.5 flex items-center justify-center gap-1.5">
                    <span className="font-medium text-gray-600" style={{ fontSize: typography.card.meta.size }}>
                      {parseDuration(itinerary.duration)}
                    </span>
                    <span className={`font-semibold px-1 py-0.5 rounded ${legStops.badge}`} style={{ fontSize: typography.card.meta.size }}>
                      {legStops.text}
                    </span>
                  </div>
                </div>

                {/* Arrival */}
                <div className="flex-shrink-0 text-right">
                  <div className="flex items-baseline gap-1 justify-end leading-none">
                    <span className="font-bold text-gray-900" style={{ fontSize: legIndex === 0 ? '16px' : '14px' }}>{formatDate(itinerary.segments[itinerary.segments.length - 1].arrival.at)}</span>
                    <span className="text-sm font-semibold text-gray-600">{formatTime(itinerary.segments[itinerary.segments.length - 1].arrival.at)}</span>
                  </div>
                  <div className="font-semibold text-gray-600 mt-0.5" style={{ fontSize: typography.card.meta.size }}>
                    {formatCityCode(itinerary.segments[itinerary.segments.length - 1].arrival.iataCode)}
                  </div>
                </div>
              </div>

          {/* EXPANDED: Segment Details */}
          {isExpanded && (
            <div className={`mt-2 pl-3 space-y-1.5 border-l-2 ${legColor.border}`}>
              {itinerary.segments.map((segment, idx) => (
                <div key={`leg-${legIndex}-seg-${idx}`} className="space-y-1.5 pb-2">
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
                          <span className="text-sm font-semibold text-gray-900">
                            {getAirlineData(segment.carrierCode).name}
                          </span>
                          <span className="text-[11px] font-medium text-gray-500 flex items-baseline gap-0.5">
                            <span className="text-gray-400">Flight</span>
                            <span className="text-gray-600 font-semibold">{segment.number?.replace(/^[A-Z]{2}\s*/, '') || segment.number}</span>
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-600 font-medium">
                          {getAircraftName(segment.aircraft?.code)} • {segment.aircraft?.code || 'N/A'}
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
                            legBaggage.cabin === 'FIRST' ? 'bg-amber-100 text-amber-900' :
                            legBaggage.cabin === 'BUSINESS' ? 'bg-blue-100 text-blue-900' :
                            legBaggage.cabin === 'PREMIUM_ECONOMY' ? 'bg-indigo-100 text-indigo-900' :
                            'bg-gray-100 text-gray-900'
                          }`}>
                            {formatFareType(legBaggage.fareType)} {legBaggage.cabin === 'PREMIUM_ECONOMY' ? 'Premium Economy' :
                             legBaggage.cabin === 'BUSINESS' ? 'Business' :
                             legBaggage.cabin === 'FIRST' ? 'First' : 'Economy'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: Flight Route & Times */}
                    <div className="flex items-center gap-3 text-xs">
                      <div className="text-right">
                        <div className="flex flex-col items-center leading-none">
                          <span className="font-bold text-gray-900 text-sm">{formatDate(segment.departure.at)}</span>
                          <span className="text-[11px] font-semibold text-gray-600 mt-0.5">{formatTime(segment.departure.at)}</span>
                        </div>
                        <div className="text-gray-600 text-[11px] font-medium mt-0.5">{formatCityCode(segment.departure.iataCode)}</div>
                        {segment.departure.terminal && (
                          <div className="text-[10px] text-gray-500 font-medium">Terminal <span className="font-semibold text-gray-700">{segment.departure.terminal}</span></div>
                        )}
                      </div>

                      <div className="flex flex-col items-center px-2">
                        <div className="text-[10px] text-gray-500 mb-0.5">{parseDuration(segment.duration || itinerary.duration)}</div>
                        <div className="w-12 h-px bg-gray-300 relative">
                          <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-blue-600 bg-white" />
                        </div>
                      </div>

                      <div className="text-left">
                        <div className="flex flex-col items-center leading-none">
                          <span className="font-bold text-gray-900 text-sm">{formatDate(segment.arrival.at)}</span>
                          <span className="text-[11px] font-semibold text-gray-600 mt-0.5">{formatTime(segment.arrival.at)}</span>
                        </div>
                        <div className="text-gray-600 text-[11px] font-medium mt-0.5">{formatCityCode(segment.arrival.iataCode)}</div>
                        {segment.arrival.terminal && (
                          <div className="text-[10px] text-gray-500 font-medium">Terminal <span className="font-semibold text-gray-700">{segment.arrival.terminal}</span></div>
                        )}
                      </div>
                    </div>
                  </div>
                  {idx < itinerary.segments.length - 1 && (
                    <div className="mt-1 px-2 py-0.5 bg-yellow-100 border-l-2 border-yellow-500 text-yellow-900 text-[10px] font-medium rounded">
                      ⏱️ Layover in {getAirportCity(segment.arrival.iataCode)} • {parseDuration(segment.duration || itinerary.duration)}
                    </div>
                  )}
                </div>
              ))}

              {/* ULTRA-COMPACT SINGLE LINE - Full width with better readability */}
              <div className="mt-1.5 py-1 px-2 bg-gray-50/50 rounded-sm border-t border-gray-100">
                <div className="flex items-center justify-between flex-wrap gap-x-2.5 gap-y-1 text-[11px] font-medium min-h-[20px]">
                  {/* Baggage - Same height alignment */}
                  <BaggageTooltip
                    type={legBaggage.carryOnQuantity === 2 ? 'carry-on' : 'personal'}
                    weight={formatBaggageWeight(extractWeight(legBaggage.carryOnWeight))}
                    airline={primaryAirline}
                    fareClass={legBaggage.fareType}
                  >
                    <span className="inline-flex items-center gap-0.5 h-full cursor-help">
                      <span className="leading-none">🎒</span>
                      <span className={legBaggage.carryOn ? 'font-semibold text-green-700 leading-none' : 'font-medium text-gray-700 leading-none'}>
                        {legBaggage.carryOn
                          ? legBaggage.carryOnQuantity === 2 ? '1 bag+personal' : 'Personal only'
                          : 'Personal only'
                        }
                        <span className="text-gray-600 font-normal">({formatBaggageWeight(extractWeight(legBaggage.carryOnWeight))})</span>
                      </span>
                    </span>
                  </BaggageTooltip>

                  <span className="text-gray-400 leading-none">•</span>

                  <BaggageTooltip
                    type="checked"
                    weight={legBaggage.checked > 0 ? formatBaggageWeight(extractWeight(legBaggage.checkedWeight)) : undefined}
                    airline={primaryAirline}
                    fareClass={legBaggage.fareType}
                  >
                    <span className="inline-flex items-center gap-0.5 h-full cursor-help">
                      <span className="leading-none">💼</span>
                      <span className={legBaggage.checked > 0 ? 'font-semibold text-green-700 leading-none' : 'font-medium text-gray-700 leading-none'}>
                        {legBaggage.checked > 0
                          ? `${legBaggage.checked} bag${legBaggage.checked > 1 ? 's' : ''}`
                          : 'Not included'
                        }
                        {legBaggage.checked > 0 && (
                          <span className="text-gray-600 font-normal">({formatBaggageWeight(extractWeight(legBaggage.checkedWeight))})</span>
                        )}
                      </span>
                    </span>
                  </BaggageTooltip>

                  <span className="text-gray-400 leading-none">•</span>

                  {/* Amenities - Same height inline */}
                  <span
                    className={`inline-flex items-center gap-0.5 h-full leading-none font-medium ${legBaggage.amenities.wifi ? 'text-green-700' : 'text-gray-700'}`}
                    title={legBaggage.amenities.isEstimated ? 'Estimated based on aircraft type' : 'Confirmed by airline'}>
                    📶WiFi {legBaggage.amenities.wifi ? '✓' : '✗'}
                    {legBaggage.amenities.isEstimated && <span className="text-[9px] opacity-60 ml-0.5">~</span>}
                  </span>

                  <span className="text-gray-400 leading-none">•</span>

                  <span
                    className={`inline-flex items-center gap-0.5 h-full leading-none font-medium ${legBaggage.amenities.power ? 'text-green-700' : 'text-gray-700'}`}
                    title={legBaggage.amenities.isEstimated ? 'Estimated based on aircraft type' : 'Confirmed by airline'}>
                    🔌Power {legBaggage.amenities.power ? '✓' : '✗'}
                    {legBaggage.amenities.isEstimated && <span className="text-[9px] opacity-60 ml-0.5">~</span>}
                  </span>

                  <span className="text-gray-400 leading-none">•</span>

                  <span
                    className={`inline-flex items-center gap-0.5 h-full leading-none font-medium ${legBaggage.amenities.meal !== 'None' ? 'text-gray-800' : 'text-gray-700'}`}
                    title={legBaggage.amenities.isEstimated ? 'Estimated based on aircraft type' : 'Confirmed by airline'}>
                    🍽️{legBaggage.amenities.meal}
                    {legBaggage.amenities.isEstimated && <span className="text-[9px] opacity-60 ml-0.5">~</span>}
                  </span>

                  <span className="text-gray-400 leading-none">•</span>

                  <span
                    className={`inline-flex items-center gap-0.5 h-full leading-none font-medium ${legBaggage.amenities.entertainment ? 'text-green-700' : 'text-gray-700'}`}
                    title={legBaggage.amenities.isEstimated ? 'Estimated based on aircraft type' : 'Confirmed by airline'}>
                    📺Entertainment {legBaggage.amenities.entertainment ? '✓' : '✗'}
                    {legBaggage.amenities.isEstimated && <span className="text-[9px] opacity-60 ml-0.5">~</span>}
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

                      <span className={`inline-flex items-center h-full leading-none ${!legBaggage.fareType.includes('BASIC') && !legBaggage.fareType.includes('LIGHT') ? 'text-green-700 font-medium' : 'text-orange-700 font-medium'}`}>
                        💺{!legBaggage.fareType.includes('BASIC') && !legBaggage.fareType.includes('LIGHT') ? 'Incl' : 'Fee'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
            </div>
          );
        })}

        {/* NEW: Per-Leg Comparison Alert - Show if ANY legs differ */}
        {isExpanded && baggageDiffers && (
          <div className="mt-2 p-2 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
            <div className="flex items-center gap-2 text-xs">
              <Info className="w-4 h-4 text-yellow-700 flex-shrink-0" />
              <span className="font-bold text-yellow-900">Different amenities across legs</span>
            </div>
            <div className="mt-1.5 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
              {legsBaggage.map((baggage, index) => (
                <div key={`baggage-compare-${index}`} className="flex items-start gap-1">
                  <span className="font-semibold text-blue-700">Leg {index + 1}:</span>
                  <span className="text-gray-700">
                    {formatFareType(baggage.fareType)}, {baggage.checked} bag(s)
                    {baggage.amenities.wifi && ', WiFi'}
                    {baggage.amenities.power && ', Power'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SINGLE-LINE BADGES ROW - Full width distribution (compact height) */}
      <div className={`px-3 py-1.5 border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-transparent ${isDebugMode ? 'bg-yellow-100 border-4 border-red-500' : ''}`} data-testid="conversion-features">
        {isDebugMode && (
          <div className="text-xs font-bold text-red-600 mb-1">
            DEBUG MODE: Full-Width Badge Distribution
          </div>
        )}
        {/* Full width distribution with balanced spacing */}
        <div className="flex items-center gap-4">
          {/* Left Group: Deal Score (PRIMARY) */}
          {dealScore !== undefined && dealTier && dealLabel && (
            <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs shadow-sm border-2 transition-all hover:shadow-md flex-shrink-0 ${
              dealTier === 'excellent' ? 'bg-gradient-to-r from-amber-500 to-yellow-500 border-amber-600 text-white' :
              dealTier === 'great' ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-600 text-white' :
              dealTier === 'good' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 border-blue-600 text-white' :
              'bg-gradient-to-r from-gray-400 to-slate-400 border-gray-500 text-white'
            }`}>
              <span className="font-bold leading-none">{dealScore}</span>
              <span className="font-semibold leading-none">
                {dealTier === 'excellent' ? 'Excellent' : dealTier === 'great' ? 'Great' : dealTier === 'good' ? 'Good' : 'Fair'}
              </span>
              <span className="text-xs leading-none">{
                dealTier === 'excellent' ? '🏆' :
                dealTier === 'great' ? '✨' :
                dealTier === 'good' ? '👍' :
                '💼'
              }</span>
            </div>
          )}

          {/* Center Group: CO2 Badge (INFORMATIONAL) */}
          <div className={`flex-shrink-0 ${isDebugMode ? 'ring-2 ring-blue-500' : ''}`}>
            <CO2Badge
              emissions={co2Emissions ?? Math.round(durationToMinutes(itineraries[0].duration) * 0.15)}
              averageEmissions={averageCO2 ?? Math.round(durationToMinutes(itineraries[0].duration) * 0.18)}
              compact={true}
            />
          </div>

          {/* Flex spacer to push urgency signals to the right */}
          <div className="flex-1"></div>

          {/* Right Group: Urgency Signals + Social Proof */}
          {urgencyVariant === 'variant_a' && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <UrgencySignals
                flightId={id}
                route={`${itineraries[0].segments[0].departure.iataCode}-${itineraries[0].segments[itineraries[0].segments.length - 1].arrival.iataCode}`}
                price={totalPrice}
                departureDate={itineraries[0].segments[0].departure.at}
                airline={validatingAirlineCodes?.[0] || itineraries[0].segments[0].carrierCode}
                seatsAvailable={numberOfBookableSeats}
              />
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
          {/* NDC Savings Badge */}
          {isNDC && ndcSavings && ndcSavings > 0 && (
            <span className="px-2 py-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-full flex items-center gap-1" style={{ fontSize: typography.card.meta.size }}>
              <Sparkles className="w-3 h-3" />
              Save ${Math.round(ndcSavings)}
            </span>
          )}
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
          {!priceVsMarket && savings > 0 && !isNDC && (
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

          {/* COMPACT FARE POLICIES - Inline Badges (Emirates Style) */}
          <div>
            {fareRules ? (
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-700">📋 Policies:</span>
                  {fareRules.refundable ? (
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
                      ✅ Refundable
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-200">
                      ❌ Non-refundable
                    </span>
                  )}
                  {fareRules.changeable ? (
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
                      ✅ Changes OK
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-200">
                      ❌ No changes
                    </span>
                  )}
                  {!baggageInfo.fareType.includes('BASIC') && !baggageInfo.fareType.includes('LIGHT') && (
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
                      ✅ Seat selection
                    </span>
                  )}
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                    ✅ 24hr protection
                  </span>
                  <button
                    onClick={() => setShowFareRules(!showFareRules)}
                    className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-300 hover:bg-gray-200 transition-colors"
                  >
                    {showFareRules ? 'Hide details ▲' : 'Full details ▼'}
                  </button>
                </div>
                {/* Expanded Fare Rules Details */}
                {showFareRules && (
                  <div className="mt-1.5">
                    <FareRulesAccordion
                      fareRules={fareRules}
                      fareClass={baggageInfo.fareType}
                      ticketPrice={totalPrice}
                    />
                  </div>
                )}
              </div>
            ) : (
              <button
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg text-xs font-semibold text-yellow-900 hover:bg-yellow-100 transition-colors"
                onClick={loadFareRules}
                disabled={loadingFareRules}
              >
                <span>📋</span>
                {loadingFareRules ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-700"></div>
                    Loading fare policies...
                  </span>
                ) : (
                  'Load fare policies'
                )}
              </button>
            )}
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

          {/* FARE UPGRADE PANEL - Real Amadeus API fare families */}
          <FareUpgradePanel
            flightOffer={{
              type,
              id,
              source,
              instantTicketingRequired,
              nonHomogeneous,
              oneWay: oneWay ?? !itineraries[1],
              lastTicketingDate: lastTicketingDate || itineraries[0].segments[0].departure.at.split('T')[0],
              lastTicketingDateTime,
              numberOfBookableSeats,
              itineraries,
              price,
              pricingOptions: pricingOptions || {
                fareType: ['PUBLISHED'],
                includedCheckedBagsOnly: true,
              },
              validatingAirlineCodes,
              travelerPricings,
            }}
            onSelectFare={(fare) => {
              console.log('Selected fare:', fare);
              // TODO: Update booking flow with selected fare
            }}
          />

          {/* NDC EXCLUSIVE CONTENT - Rich media and benefits */}
          {isNDC && (
            <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-bold text-blue-900 mb-1 text-sm flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    NDC Exclusive Benefits
                  </h4>
                  <p className="text-xs text-blue-800 mb-2">
                    This flight includes exclusive benefits only available through direct airline connections.
                  </p>
                  <ul className="text-xs text-blue-700 space-y-1 mb-3">
                    <li className="flex items-center gap-1">✓ Better pricing directly from the airline</li>
                    <li className="flex items-center gap-1">✓ Access to exclusive fare types</li>
                    <li className="flex items-center gap-1">✓ More flexibility with changes</li>
                    {richContent && (richContent.cabinPhotos?.length || richContent.seatPhotos?.length) && (
                      <li className="flex items-center gap-1">✓ View cabin and seat photos</li>
                    )}
                  </ul>
                  <div className="flex items-center gap-2">
                    {richContent && (richContent.cabinPhotos?.length || richContent.seatPhotos?.length || richContent.videos?.length) && (
                      <button
                        onClick={() => setShowRichContent(true)}
                        className="px-3 py-1.5 bg-white border border-blue-300 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-50 transition-colors flex items-center gap-1"
                      >
                        <ImageIcon className="w-4 h-4" />
                        View Photos & Details
                      </button>
                    )}
                    <button
                      onClick={() => setShowNDCBenefits(true)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      <Info className="w-4 h-4" />
                      Learn More About NDC
                    </button>
                  </div>
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
          flightRoute={`${itineraries[0].segments[0].departure.iataCode} → ${itineraries[0].segments[itineraries[0].segments.length - 1].arrival.iataCode}`}
          flightDate={formatDate(itineraries[0].segments[0].departure.at)}
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

      {/* Rich Content Modal */}
      {showRichContent && richContent && (
        <FlightRichContent
          isOpen={showRichContent}
          onClose={() => setShowRichContent(false)}
          richContent={richContent}
          airlineName={airlineData.name}
          aircraftType={itineraries[0]?.segments[0]?.aircraft?.code || 'Aircraft'}
          cabinClass={baggageInfo.cabin === 'PREMIUM_ECONOMY' ? 'Premium Economy' :
                      baggageInfo.cabin === 'BUSINESS' ? 'Business' :
                      baggageInfo.cabin === 'FIRST' ? 'First' : 'Economy'}
        />
      )}

      {/* NDC Benefits Modal */}
      {showNDCBenefits && (
        <NDCBenefitsModal
          isOpen={showNDCBenefits}
          onClose={() => setShowNDCBenefits(false)}
        />
      )}
    </div>
  );
}
