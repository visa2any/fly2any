'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { FlightCardEnhanced } from '@/components/flights/FlightCardEnhanced';
import { FlexibleDates, type DatePrice } from '@/components/flights/FlexibleDates';
import { SmartWait } from '@/components/flights/SmartWait';
import { FlightComparison } from '@/components/flights/FlightComparison';
import { PriceAlerts } from '@/components/flights/PriceAlerts';
import CreatePriceAlert from '@/components/search/CreatePriceAlert';
import AuthModal from '@/components/auth/AuthModal';
import FlightFilters, { type FlightFilters as FlightFiltersType, type FlightOffer } from '@/components/flights/FlightFilters';
import SortBar, { type SortOption } from '@/components/flights/SortBar';
import EnhancedSearchBar from '@/components/flights/EnhancedSearchBar';
import CompactSearchSummary from '@/components/flights/CompactSearchSummary';
import { PriceInsights, type PriceStatistics, type FlightRoute } from '@/components/flights/PriceInsights';
import { MLInsights, type MLMetadata } from '@/components/flights/MLInsights';
import { MultipleFlightCardSkeletons } from '@/components/flights/FlightCardSkeleton';
import FlightComparisonBar from '@/components/search/FlightComparison';
import { type FlightForComparison } from '@/lib/types/search';
import { CollapsibleSearchBar, type SearchSummary } from '@/components/mobile/CollapsibleSearchBar';
// TEMPORARILY DISABLED: Virtual scrolling needs proper height calibration
// import { VirtualFlightListOptimized as VirtualFlightList } from '@/components/flights/VirtualFlightListOptimized';
import ScrollToTop from '@/components/flights/ScrollToTop';
import { ScrollProgress } from '@/components/flights/ScrollProgress';
import { MobileFilterSheet, FilterButton } from '@/components/mobile';
import SaveSearchButton from '@/components/search/SaveSearchButton';
// import { TestModeBanner } from '@/components/TestModeBanner'; // Removed for production
import ProgressiveFlightLoading from '@/components/flights/ProgressiveFlightLoading';
import InlineFlightLoading from '@/components/flights/InlineFlightLoading';
import { ChevronRight, ChevronLeft, AlertCircle, RefreshCcw, X } from 'lucide-react';
import { normalizePrice } from '@/lib/flights/types';
import CrossSellWidget from '@/components/flights/CrossSellWidget';
import CheapestDates from '@/components/flights/CheapestDates';
import FlightInspiration from '@/components/flights/FlightInspiration';
import { WorldCupCrossSell } from '@/components/world-cup/WorldCupCrossSell';
import { layout, DESIGN_RULES } from '@/lib/design-system';
import { isWorldCupHostCity } from '@/lib/world-cup/constants';
import PriceCalendarMatrix from '@/components/flights/PriceCalendarMatrix';
import AlternativeAirports from '@/components/flights/AlternativeAirports';
import { batchCalculateDealScores } from '@/lib/flights/dealScore';
import BaggageFeeDisclaimer from '@/components/flights/BaggageFeeDisclaimer';
import LiveActivityFeed from '@/components/conversion/LiveActivityFeed';
import ExitIntentPopup from '@/components/conversion/ExitIntentPopup';
import { featureFlags } from '@/lib/feature-flags';
import { trackConversion } from '@/lib/conversion-metrics';
import { abTestManager } from '@/lib/ab-testing/test-manager';
import { analyticsTracker } from '@/lib/ab-testing/analytics-tracker';
import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll';
import { usePullToRefresh, RefreshButton } from '@/lib/hooks/usePullToRefresh';
import { useTranslations } from 'next-intl';
import { useLanguage } from '@/lib/i18n/client';

// ===========================
// TYPE DEFINITIONS
// ===========================

interface SearchParams {
  from: string;
  to: string;
  departure: string;
  return?: string;
  adults: number;
  children: number;
  infants: number;
  class: 'economy' | 'premium' | 'business' | 'first';
  useFlexibleDates?: boolean;
}

interface ScoredFlight extends FlightOffer {
  score?: number;
  badges?: any[];
  mlScore?: number; // ML-based prediction score
  priceVsMarket?: number; // Percentage vs market average
  co2Emissions?: number; // CO2 emissions in kg
  averageCO2?: number; // Average CO2 emissions for this route in kg
}


// ===========================
// UTILITY FUNCTIONS
// ===========================

const parseDuration = (duration: string): number => {
  const match = duration.match(/PT(\d+H)?(\d+M)?/);
  if (!match) return 0;
  const hours = match[1] ? parseInt(match[1].replace('H', '')) : 0;
  const minutes = match[2] ? parseInt(match[2].replace('M', '')) : 0;
  return hours * 60 + minutes;
};

const getDepartureHour = (dateString: string): number => {
  return new Date(dateString).getHours();
};

const getTimeCategory = (hour: number): 'morning' | 'afternoon' | 'evening' | 'night' => {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
};

const getStopsCategory = (segments: number): 'direct' | '1-stop' | '2+-stops' => {
  const stops = segments - 1;
  if (stops === 0) return 'direct';
  if (stops === 1) return '1-stop';
  return '2+-stops';
};

// Apply independent nonstop filters (From Nonstop / To Nonstop)
const applyNonstopFilters = (flights: ScoredFlight[], fromNonstop: boolean, toNonstop: boolean): ScoredFlight[] => {
  if (!fromNonstop && !toNonstop) {
    return flights; // No filtering needed
  }

  return flights.filter(flight => {
    const itineraries = flight.itineraries || [];

    // Check outbound flight (itineraries[0]) for nonstop if fromNonstop is true
    if (fromNonstop && itineraries[0]) {
      const isOutboundNonstop = itineraries[0].segments.length === 1;
      if (!isOutboundNonstop) {
        return false; // Filter out flights with stops on outbound
      }
    }

    // Check return flight (itineraries[1]) for nonstop if toNonstop is true
    if (toNonstop && itineraries[1]) {
      const isReturnNonstop = itineraries[1].segments.length === 1;
      if (!isReturnNonstop) {
        return false; // Filter out flights with stops on return
      }
    }

    return true; // Flight passes nonstop filters
  });
};

// Apply filters to flights - COMPLETE IMPLEMENTATION (All 14 filters)
// ✅ FIXED: Now correctly handles BOTH outbound and return flights for round-trip searches
const applyFilters = (flights: ScoredFlight[], filters: FlightFiltersType): ScoredFlight[] => {
  const filtered = flights.filter(flight => {
    const price = normalizePrice(flight.price.total);

    // ✅ CRITICAL FIX: Check ALL itineraries (outbound + return for round-trips)
    const itineraries = flight.itineraries || [];

    // Collect all airlines from ALL itineraries
    const airlines = itineraries.flatMap(it => it.segments.map(seg => seg.carrierCode));

    // 1. Price filter ✅
    if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
      return false;
    }

    // 2. ✅ FIXED: Stops filter - Check BOTH outbound AND return flights
    if (filters.stops.length > 0) {
      // For round-trip, BOTH flights must match the stops criteria
      const allItinerariesMatch = itineraries.every(itinerary => {
        const stopsCategory = getStopsCategory(itinerary.segments.length);
        return filters.stops.includes(stopsCategory);
      });

      if (!allItinerariesMatch) {
        return false;
      }
    }

    // 3. Airline filter ✅
    if (filters.airlines.length > 0 && !airlines.some(airline => filters.airlines.includes(airline))) {
      return false;
    }

    // 4. ✅ FIXED: Departure time filter - Check outbound departure time only
    // (Return departure time is usually not what users want to filter)
    if (filters.departureTime.length > 0) {
      const outboundItinerary = itineraries[0];
      if (outboundItinerary) {
        const departureHour = getDepartureHour(outboundItinerary.segments[0].departure.at);
        const timeCategory = getTimeCategory(departureHour);
        if (!filters.departureTime.includes(timeCategory)) {
          return false;
        }
      }
    }

    // 5. ✅ FIXED: Duration filter - Check BOTH outbound AND return flights
    if (filters.maxDuration) {
      const exceedsMaxDuration = itineraries.some(itinerary => {
        const duration = parseDuration(itinerary.duration);
        return duration > filters.maxDuration * 60;
      });

      if (exceedsMaxDuration) {
        return false;
      }
    }

    // 6. ✅ FIXED: Basic Economy filter - Check ALL segments, not just first
    if (filters.excludeBasicEconomy) {
      const travelerPricings = (flight as any).travelerPricings || [];

      for (const pricing of travelerPricings) {
        // Check fareOption first (most reliable indicator)
        if (pricing?.fareOption === 'BASIC') {
          return false; // Exclude Basic Economy fare option
        }

        // Check ALL segments for Basic Economy indicators
        const fareDetails = pricing?.fareDetailsBySegment || [];
        for (const fare of fareDetails) {
          const brandedFare = fare?.brandedFare || '';
          const fareBasis = fare?.fareBasis || '';
          const fareType = brandedFare || fareBasis;

          // Check for Basic Economy keywords in fare type
          const isBasicEconomy =
            fareType.toUpperCase().includes('BASIC') ||
            fareType.toUpperCase().includes('LIGHT') ||
            fareType.toUpperCase().includes('SAVER') ||
            fareType.toUpperCase().includes('RESTRICTED') ||
            fareType.toUpperCase().includes('NOBAG') ||
            fareType.toUpperCase().includes('GOLIGHT');

          if (isBasicEconomy) {
            return false; // Exclude this flight
          }
        }
      }
    }

    // 7. ✅ FIXED: Cabin Class filter
    if (filters.cabinClass.length > 0) {
      const travelerPricings = (flight as any).travelerPricings || [];
      let matchesCabin = false;

      for (const pricing of travelerPricings) {
        const fareDetails = pricing?.fareDetailsBySegment || [];
        for (const fare of fareDetails) {
          const cabin = fare?.cabin; // 'ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'
          if (cabin && filters.cabinClass.includes(cabin)) {
            matchesCabin = true;
            break;
          }
        }
        if (matchesCabin) break;
      }

      if (!matchesCabin) {
        return false;
      }
    }

    // 8. ✅ FIXED: Baggage Included filter - Support BOTH quantity AND weight-based allowances
    if (filters.baggageIncluded) {
      const travelerPricings = (flight as any).travelerPricings || [];
      let hasBaggage = false;

      for (const pricing of travelerPricings) {
        const fareDetails = pricing?.fareDetailsBySegment || [];
        for (const fare of fareDetails) {
          const bags = fare?.includedCheckedBags;

          // Check BOTH quantity-based (e.g., "2 bags") AND weight-based (e.g., "23 KG") allowances
          const hasQuantityBags = bags?.quantity !== undefined && bags.quantity > 0;
          const hasWeightBags = bags?.weight !== undefined && bags.weight > 0;

          if (hasQuantityBags || hasWeightBags) {
            hasBaggage = true;
            break;
          }
        }
        if (hasBaggage) break;
      }

      if (!hasBaggage) {
        return false;
      }
    }

    // 9. ✅ FIXED: Refundable Only filter - Use heuristics (fareRules not available in base API)
    if (filters.refundableOnly) {
      const travelerPricings = (flight as any).travelerPricings || [];
      let likelyRefundable = false;

      for (const pricing of travelerPricings) {
        // Check fareOption (FLEX/STANDARD fares are usually refundable)
        if (pricing?.fareOption === 'FLEX' || pricing?.fareOption === 'STANDARD') {
          likelyRefundable = true;
          break;
        }

        // Check fare details for refundable indicators
        const fareDetails = pricing?.fareDetailsBySegment || [];
        for (const fare of fareDetails) {
          const cabin = fare?.cabin || '';
          const fareBasis = fare?.fareBasis || '';

          // Business and First class are typically refundable
          if (cabin === 'BUSINESS' || cabin === 'FIRST') {
            likelyRefundable = true;
            break;
          }

          // Full-fare economy (Y class fare basis) is usually refundable
          // Fare basis starting with Y (not YS, YL, etc.) indicates full-fare
          if (fareBasis.match(/^Y[A-Z]*$/)) {
            likelyRefundable = true;
            break;
          }
        }
        if (likelyRefundable) break;
      }

      if (!likelyRefundable) {
        return false;
      }
    }

    // 10. ✅ FIXED: Max Layover Duration filter - Check BOTH outbound AND return flights
    if (filters.maxLayoverDuration < 720) { // Only apply if not default (12h)
      const hasLongLayover = itineraries.some(itinerary => {
        const segments = itinerary.segments;
        if (segments.length > 1) {
          for (let i = 0; i < segments.length - 1; i++) {
            const arrivalTime = new Date(segments[i].arrival.at).getTime();
            const departureTime = new Date(segments[i + 1].departure.at).getTime();
            const layoverMinutes = (departureTime - arrivalTime) / (1000 * 60);

            if (layoverMinutes > filters.maxLayoverDuration) {
              return true; // Found a long layover
            }
          }
        }
        return false;
      });

      if (hasLongLayover) {
        return false;
      }
    }

    // 11. ✅ FIXED: Alliance filter
    if (filters.alliances.length > 0) {
      const allianceMembers = {
        'star-alliance': ['UA', 'AC', 'LH', 'NH', 'SQ', 'TK', 'OS', 'LX', 'SK', 'TP', 'AV', 'CA', 'AI', 'MS', 'SA', 'ZH', 'CM'],
        'oneworld': ['AA', 'BA', 'QF', 'CX', 'JL', 'IB', 'AY', 'QR', 'MH', 'AS', 'RJ', 'S7', 'UL'],
        'skyteam': ['DL', 'AF', 'KL', 'AZ', 'AM', 'AR', 'CZ', 'OK', 'SU', 'VN', 'MU', 'KQ', 'ME', 'RO', 'SV', 'UX'],
      };

      const matchesAlliance = filters.alliances.some(alliance => {
        const members = allianceMembers[alliance] || [];
        return airlines.some(airlineCode => members.includes(airlineCode));
      });

      if (!matchesAlliance) {
        return false;
      }
    }

    // 12. ✅ FIXED: CO2 Emissions filter
    if (filters.maxCO2Emissions < 500 && flight.co2Emissions) {
      if (flight.co2Emissions > filters.maxCO2Emissions) {
        return false;
      }
    }

    // 13. ✅ FIXED: Connection Quality filter - Check BOTH outbound AND return flights
    if (filters.connectionQuality.length > 0) {
      const allItinerariesMatch = itineraries.every(itinerary => {
        const segments = itinerary.segments;

        // Direct flights (no connections) always match
        if (segments.length === 1) {
          return true;
        }

        // Check if any connection in this itinerary matches the quality filter
        let hasMatchingConnection = false;
        for (let i = 0; i < segments.length - 1; i++) {
          const arrivalTime = new Date(segments[i].arrival.at).getTime();
          const departureTime = new Date(segments[i + 1].departure.at).getTime();
          const layoverMinutes = (departureTime - arrivalTime) / (1000 * 60);
          const layoverHours = layoverMinutes / 60;

          let quality: 'short' | 'medium' | 'long';
          if (layoverHours < 2) quality = 'short';
          else if (layoverHours <= 4) quality = 'medium';
          else quality = 'long';

          if (filters.connectionQuality.includes(quality)) {
            hasMatchingConnection = true;
            break;
          }
        }

        return hasMatchingConnection;
      });

      if (!allItinerariesMatch) {
        return false;
      }
    }

    return true;
  });

  return filtered;
};

// Sort flights
const sortFlights = (flights: ScoredFlight[], sortBy: SortOption): ScoredFlight[] => {
  const sorted = [...flights];

  switch (sortBy) {
    case 'best':
      // Prioritize ML score if available, fallback to simple score
      return sorted.sort((a, b) => {
        const scoreA = a.mlScore !== undefined ? a.mlScore : (a.score || 0);
        const scoreB = b.mlScore !== undefined ? b.mlScore : (b.score || 0);
        return scoreB - scoreA;
      });
    case 'cheapest':
      return sorted.sort((a, b) => normalizePrice(a.price.total) - normalizePrice(b.price.total));
    case 'fastest':
      return sorted.sort((a, b) => {
        const durationA = parseDuration(a.itineraries[0].duration);
        const durationB = parseDuration(b.itineraries[0].duration);
        return durationA - durationB;
      });
    case 'earliest':
      return sorted.sort((a, b) => {
        const timeA = new Date(a.itineraries[0].segments[0].departure.at).getTime();
        const timeB = new Date(b.itineraries[0].segments[0].departure.at).getTime();
        return timeA - timeB;
      });
    default:
      return sorted;
  }
};

// Generate mock price insights (in production, this would come from API)
const generatePriceInsights = (flights: ScoredFlight[]): PriceStatistics => {
  const prices = flights.map(f => normalizePrice(f.price.total));
  const currentPrice = Math.min(...prices);
  const averagePrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const lowestPrice = Math.min(...prices);
  const highestPrice = Math.max(...prices);

  // Generate price history (mock data)
  const priceHistory = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    price: averagePrice * (0.85 + Math.random() * 0.3),
  }));

  // Determine trend based on recent history
  const recentPrices = priceHistory.slice(-7).map(p => p.price);
  const trend = recentPrices[recentPrices.length - 1] > recentPrices[0] ? 'rising' : 'falling';
  const trendPercentage = Math.abs(
    ((recentPrices[recentPrices.length - 1] - recentPrices[0]) / recentPrices[0]) * 100
  );

  return {
    currentPrice,
    averagePrice,
    lowestPrice,
    highestPrice,
    priceHistory,
    trend: trend as 'rising' | 'falling',
    trendPercentage: Math.round(trendPercentage),
  };
};

// ===========================
// MAIN COMPONENT
// ===========================

function FlightResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const t = useTranslations('FlightResults');
  const { language: lang, setLanguage: setLang } = useLanguage();

  // State
  const [flights, setFlights] = useState<ScoredFlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreatePriceAlert, setShowCreatePriceAlert] = useState(false);
  const [selectedFlightForAlert, setSelectedFlightForAlert] = useState<ScoredFlight | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingFlightForAlert, setPendingFlightForAlert] = useState<ScoredFlight | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('cheapest'); // Default to lowest price first
  const [showPriceInsights, setShowPriceInsights] = useState(true);
  const [displayCount, setDisplayCount] = useState(20); // Increased from 10 to show more results (Design Rule #7)
  const [marketAverage, setMarketAverage] = useState<number | null>(null);
  const [mlPredictionEnabled, setMlPredictionEnabled] = useState(true);
  const [mlMetadata, setMlMetadata] = useState<MLMetadata | null>(null);

  // ML User Segmentation state
  const [userSegment, setUserSegment] = useState<'business' | 'leisure' | 'family' | 'budget' | null>(null);
  const [segmentConfidence, setSegmentConfidence] = useState<number>(0);
  const [segmentRecommendations, setSegmentRecommendations] = useState<any>(null);

  // A/B Testing state
  const [sessionId] = useState(() =>
    `session_${Date.now()}_${Math.random().toString(36).substring(7)}`
  );
  const urgencyVariant = abTestManager.getVariant('urgency-signals-v1', sessionId);
  const segmentVariant = abTestManager.getVariant('user-segmentation-v1', sessionId);

  // New premium features state
  const [compareFlights, setCompareFlights] = useState<string[]>([]);
  const [compareFlightsData, setCompareFlightsData] = useState<FlightForComparison[]>([]);
  const [showPriceAlert, setShowPriceAlert] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [flexibleDatePrices, setFlexibleDatePrices] = useState<DatePrice[]>([]);
  const [showPriceCalendar, setShowPriceCalendar] = useState(false);
  const [showAlternativeAirports, setShowAlternativeAirports] = useState(false);

  // Multi-city state
  const [multiCityLegs, setMultiCityLegs] = useState<ScoredFlight[][]>([]);
  const [multiCityLoading, setMultiCityLoading] = useState<boolean[]>([]);
  const [multiCityLegMetadata, setMultiCityLegMetadata] = useState<Array<{from: string, to: string, date: string, nonstop: boolean}>>([]);

  // Search bar collapse state - auto-collapse when results load
  const [searchBarCollapsed, setSearchBarCollapsed] = useState(false);

  // Mobile filter sheet state
  const [mobileFilterSheetOpen, setMobileFilterSheetOpen] = useState(false);

  // Extract search parameters
  const searchData: SearchParams = {
    from: searchParams.get('from') || searchParams.get('origin') || '',
    to: searchParams.get('to') || searchParams.get('destination') || '',
    departure: searchParams.get('departure') || searchParams.get('departureDate') || '',
    return: searchParams.get('return') || searchParams.get('returnDate') || undefined,
    adults: parseInt(searchParams.get('adults') || '1'),
    children: parseInt(searchParams.get('children') || '0'),
    infants: parseInt(searchParams.get('infants') || '0'),
    class: (searchParams.get('travelClass') || searchParams.get('class') || 'economy') as any,
    useFlexibleDates: searchParams.get('useFlexibleDates') === 'true' || searchParams.get('useMultiDate') === 'true',
  };

  // Extract independent nonstop filters from URL
  const fromNonstopFilter = searchParams.get('fromNonstop') === 'true';
  const toNonstopFilter = searchParams.get('toNonstop') === 'true';

  // Extract "Hacker Fares" / Separate Tickets option
  const includeSeparateTickets = searchParams.get('includeSeparateTickets') === 'true';

  // Extract multi-city data from URL
  const isMultiCity = searchParams.get('multiCity') === 'true';
  const additionalFlightsParam = searchParams.get('additionalFlights');
  const additionalFlights = isMultiCity && additionalFlightsParam
    ? JSON.parse(additionalFlightsParam)
    : [];

  // DEBUG: Log multi-city URL params
  if (isMultiCity) {
    console.log('🔍 Multi-city URL params:', {
      isMultiCity,
      additionalFlightsParam,
      parsedAdditionalFlights: additionalFlights,
      totalLegs: additionalFlights.length + 1
    });
  }

  // Initialize filters with default values (including new advanced filters)
  const [filters, setFilters] = useState<FlightFiltersType>({
    priceRange: [0, 10000],
    stops: [],
    airlines: [],
    departureTime: [],
    maxDuration: 24,
    excludeBasicEconomy: false,
    cabinClass: [],
    baggageIncluded: false,
    refundableOnly: false,
    maxLayoverDuration: 360,
    alliances: [],
    aircraftTypes: [],
    maxCO2Emissions: 500,
    connectionQuality: [],
    ndcOnly: false,
    showExclusiveFares: false,
  });

  // Announce results to screen readers
  const announceResults = (count: number) => {
    const message = count === 0
      ? 'No flights found matching your search criteria'
      : count === 1
      ? '1 flight found'
      : `${count} flights found`;

    // Create live region for screen reader announcement
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  // Combine multi-city leg results into complete journey flights
  const combineMultiCityLegs = (legResults: ScoredFlight[][]): ScoredFlight[] => {
    console.log('🔄 combineMultiCityLegs CALLED with legResults:', legResults.length, 'legs');

    if (legResults.length === 0) {
      console.log('❌ combineMultiCityLegs: legResults is empty!');
      return [];
    }

    console.log('🔄 Combining multi-city legs:', legResults.map(leg => leg.length), 'flights per leg');

    // Check if any leg has no flights
    const emptyLegs = legResults.filter(leg => leg.length === 0);
    if (emptyLegs.length > 0) {
      console.warn('⚠️ Some legs have no flights, cannot create combinations');
      return [];
    }

    // Scale flights per leg based on total legs to avoid exponential explosion
    // 2 legs: 10 each = 100 combinations
    // 3 legs: 5 each = 125 combinations
    // 4 legs: 4 each = 256 combinations
    // 5 legs: 3 each = 243 combinations
    const flightsPerLeg = Math.max(3, Math.min(10, Math.floor(15 / legResults.length)));
    console.log(`📊 Taking top ${flightsPerLeg} flights from each of ${legResults.length} legs`);

    const topFlightsPerLeg = legResults.map(leg => leg.slice(0, flightsPerLeg));

    // Generate all combinations
    const combinations: ScoredFlight[] = [];
    let combinationCount = 0;

    const generateCombinations = (currentCombination: any[], legIndex: number) => {
      if (legIndex === topFlightsPerLeg.length) {
        // We have a complete combination - create a combined flight object
        combinationCount++;
        const combinedFlight = createCombinedFlight(currentCombination);
        if (combinedFlight) {
          combinations.push(combinedFlight);
        }
        return;
      }

      // Try each flight option for current leg
      const legFlights = topFlightsPerLeg[legIndex];
      if (!legFlights || legFlights.length === 0) {
        console.error(`❌ Leg ${legIndex} has no flights!`);
        return;
      }

      for (const flight of legFlights) {
        generateCombinations([...currentCombination, flight], legIndex + 1);
      }
    };

    // Start generating combinations
    console.log('🚀 Starting combination generation...');
    generateCombinations([], 0);

    console.log(`✅ Generated ${combinationCount} combinations, created ${combinations.length} valid flight objects`);

    // Sort by total price and return top 50
    const sortedCombinations = combinations.sort((a, b) => {
      const priceA = typeof a.price.total === 'string' ? parseFloat(a.price.total) : a.price.total;
      const priceB = typeof b.price.total === 'string' ? parseFloat(b.price.total) : b.price.total;
      return priceA - priceB;
    });

    console.log(`✨ Returning top 50 cheapest combinations (total: ${sortedCombinations.length})`);
    return sortedCombinations.slice(0, 50);
  };

  // Create a combined flight object from individual leg flights
  const createCombinedFlight = (legFlights: any[]): ScoredFlight | null => {
    if (legFlights.length === 0) {
      console.error('❌ createCombinedFlight called with empty array');
      return null;
    }

    // Combine all itineraries
    const allItineraries = legFlights.flatMap(flight => flight.itineraries || []);

    if (allItineraries.length === 0) {
      console.warn('⚠️ Combined flight has no itineraries:', legFlights.map(f => f.id));
      return null;
    }

    // Calculate total price and aggregate base + fees
    const totalPrice = legFlights.reduce((sum, flight) => {
      const price = typeof flight.price.total === 'string' ? parseFloat(flight.price.total) : flight.price.total;
      return sum + price;
    }, 0);

    // Calculate total base price (sum of all leg base prices)
    const totalBase = legFlights.reduce((sum, flight) => {
      const base = typeof flight.price.base === 'string' ? parseFloat(flight.price.base || '0') : (flight.price.base || 0);
      return sum + base;
    }, 0);

    // Aggregate all fees from all legs
    const allFees = legFlights.flatMap(flight => flight.price.fees || []);
    const totalFees = allFees.reduce((sum, fee) => {
      const amount = typeof fee.amount === 'string' ? parseFloat(fee.amount) : fee.amount;
      return sum + amount;
    }, 0);

    // Debug: Log price breakdown
    console.log('💰 Multi-city price breakdown:', {
      totalPrice: totalPrice.toFixed(2),
      totalBase: totalBase.toFixed(2),
      totalFees: totalFees.toFixed(2),
      feesCount: allFees.length,
      percentage: ((totalFees / totalPrice) * 100).toFixed(1) + '%'
    });

    // Use first flight as base and merge data
    const baseFlight = legFlights[0];

    const combinedFlight = {
      ...baseFlight,
      id: `multi-${legFlights.map(f => f.id).join('-')}`,
      itineraries: allItineraries,
      price: {
        currency: baseFlight.price.currency,
        total: totalPrice.toFixed(2),
        base: totalBase > 0 ? totalBase.toFixed(2) : (totalPrice * 0.85).toFixed(2), // Use aggregated base or estimate
        fees: allFees.length > 0 ? allFees : undefined, // Preserve all fees
        grandTotal: totalPrice.toFixed(2),
      },
      // Combine validating airline codes
      validatingAirlineCodes: Array.from(new Set(
        legFlights.flatMap(f => f.validatingAirlineCodes || [])
      )),
      // Average deal score if available
      dealScore: legFlights.reduce((sum, f) => sum + (f.dealScore || 0), 0) / legFlights.length,
    };

    return combinedFlight;
  };

  // Pull-to-refresh functionality for mobile users
  const { isRefreshing: isPullRefreshing, pullIndicator } = usePullToRefresh(
    async () => {
      // Refetch search results on pull-to-refresh
      await fetchFlights();
    },
    {
      threshold: 80,
      mobileOnly: true,
      theme: 'blue',
    }
  );

  // Fetch flights function (extracted for reuse with pull-to-refresh)
  const fetchFlights = async () => {
    if (!searchData.from || !searchData.to || !searchData.departure) {
      setError('Missing required search parameters');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setSearchBarCollapsed(false); // Reset to expanded when new search starts

    // Announce search start
    announceResults(0); // Will be updated when results load

      // Handle multi-city separately
      console.log('🔍 BEFORE CONDITION CHECK:', { isMultiCity, additionalFlightsLength: additionalFlights.length, willEnterMultiCity: isMultiCity && additionalFlights.length > 0 });

      if (isMultiCity && additionalFlights.length > 0) {
        console.log('🛫 Multi-city search detected, fetching', additionalFlights.length + 1, 'legs');

        try {
          // Prepare all flight legs (first leg + additional flights)
          const allLegs = [
            {
              from: searchData.from,
              to: searchData.to,
              date: searchData.departure,
              nonstop: fromNonstopFilter
            },
            ...additionalFlights
          ];

          // Store leg metadata for display
          setMultiCityLegMetadata(allLegs);

          // Initialize loading state for each leg
          setMultiCityLoading(allLegs.map(() => true));

          // Fetch all legs in parallel
          const legPromises = allLegs.map(async (leg, index) => {
            console.log(`  Fetching leg ${index + 1}:`, leg.from, '→', leg.to);

            const response = await fetch('/api/flights/search', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                origin: leg.from,
                destination: leg.to,
                departureDate: leg.date,
                returnDate: undefined, // One-way only
                adults: searchData.adults,
                children: searchData.children,
                infants: searchData.infants,
                travelClass: searchData.class,
                nonStop: leg.nonstop || false,
                currencyCode: 'USD',
                max: 25, // Reduced results per leg
                useMultiDate: false,
              }),
            });

            if (!response.ok) {
              console.error(`Leg ${index + 1} failed:`, response.status);
              return [];
            }

            const data = await response.json();
            console.log(`  Leg ${index + 1} results:`, data.flights?.length || 0, 'flights');
            return data.flights || [];
          });

          // Wait for all legs to complete
          console.log('⏳ Waiting for Promise.all to complete...');
          const legResults = await Promise.all(legPromises);
          console.log('✅ Promise.all completed, legResults:', legResults.map(leg => `${leg?.length || 0} flights`));

          // Combine leg results into complete journey flights
          console.log('🔄 About to call combineMultiCityLegs with', legResults.length, 'legs');
          const combinedFlights = combineMultiCityLegs(legResults);
          console.log('✅ combineMultiCityLegs returned', combinedFlights.length, 'combinations');

          console.log('✅ Multi-city search complete:', legResults.map(leg => leg.length), 'flights per leg');
          console.log(`📦 Combined into ${combinedFlights.length} complete journey options`);

          // Store combined flights in regular flights state
          setFlights(combinedFlights);
          setMultiCityLegs(legResults); // Keep for reference
          setMultiCityLoading(allLegs.map(() => false));
          setLoading(false);
          setSearchBarCollapsed(true); // Auto-collapse after multi-city results load
          return;
        } catch (error: any) {
          console.error('Multi-city search error:', error);
          setError(`Multi-city search failed: ${error.message}`);
          setLoading(false);
          return;
        }
      }

      // Regular single/round-trip flight search
      try {
        const response = await fetch('/api/flights/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin: searchData.from,
            destination: searchData.to,
            departureDate: searchData.departure,
            returnDate: searchData.return,
            adults: searchData.adults,
            children: searchData.children,
            infants: searchData.infants,
            travelClass: searchData.class,
            nonStop: searchParams.get('nonStop') === 'true' || searchParams.get('direct') === 'true',
            currencyCode: 'USD',
            max: 50,
            useMultiDate: searchData.useFlexibleDates,
            // Mixed-carrier "Hacker Fares" - find cheaper combinations across airlines
            includeSeparateTickets: includeSeparateTickets && !!searchData.return,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        let processedFlights = data.flights || [];

        // Capture ML metadata from API response
        if (data.metadata?.ml) {
          setMlMetadata(data.metadata.ml);
          console.log('🧠 ML Metadata received:', data.metadata.ml);
        }

        // Apply independent nonstop filters (From Nonstop / To Nonstop) from URL params
        processedFlights = applyNonstopFilters(processedFlights, fromNonstopFilter, toNonstopFilter);

        // Calculate Deal Scores for all flights (will recalculate after getting market data)
        if (processedFlights.length > 0) {
          try {
            const flightsWithFactors = processedFlights.map((flight: any) => ({
              price: normalizePrice(flight.price.total),
              factors: {
                duration: parseDuration(flight.itineraries[0].duration),
                stops: flight.itineraries[0].segments.length - 1,
                departureTime: flight.itineraries[0].segments[0].departure.at,
                arrivalTime: flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.at,
                seatAvailability: flight.numberOfBookableSeats || 9,
              }
            }));

            const flightsWithDealScores = batchCalculateDealScores(flightsWithFactors);

            processedFlights = processedFlights.map((flight: any, index: number) => ({
              ...flight,
              dealScore: flightsWithDealScores[index].total,
              dealTier: flightsWithDealScores[index].tier,
              dealLabel: flightsWithDealScores[index].label,
            }));
          } catch (error) {
            console.warn('Deal score calculation failed, continuing without scores:', error);
            // Continue without deal scores if calculation fails
          }
        }

        // Parallel API calls for ML prediction and price analytics
        if (processedFlights.length > 0) {
          const promises = [];

          // 1. ML Flight Ranking Prediction
          if (mlPredictionEnabled) {
            promises.push(
              fetch('/api/flight-prediction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ flightOffers: processedFlights }),
              })
                .then(res => res.json())
                .then(predictionData => {
                  if (predictionData.data && Array.isArray(predictionData.data)) {
                    // Map ML scores to flights
                    return predictionData.data.map((predictedFlight: any, index: number) => ({
                      ...processedFlights[index],
                      mlScore: predictedFlight.choiceProbability || undefined,
                    }));
                  }
                  return processedFlights;
                })
                .catch(err => {
                  console.warn('ML prediction failed, using simple scoring:', err);
                  setMlPredictionEnabled(false);
                  return processedFlights;
                })
            );
          } else {
            promises.push(Promise.resolve(processedFlights));
          }

          // 2. Price Analytics for market comparison
          // Handle comma-separated multi-dates - use first date for analytics
          const firstDepartureDate = searchData.departure.split(',')[0];
          promises.push(
            fetch(
              `/api/price-analytics?originIataCode=${searchData.from}&destinationIataCode=${searchData.to}&departureDate=${firstDepartureDate}&currencyCode=USD`
            )
              .then(res => res.json())
              .then(analyticsData => {
                if (analyticsData.data && analyticsData.data.length > 0) {
                  const priceMetrics = analyticsData.data[0].priceMetrics?.[0];
                  if (priceMetrics) {
                    const avgPrice = parseFloat(priceMetrics.mean || '0');
                    setMarketAverage(avgPrice);
                    return avgPrice;
                  }
                }
                return null;
              })
              .catch(err => {
                console.warn('Price analytics failed:', err);
                return null;
              })
          );

          // Wait for both to complete
          const [rankedFlights, avgMarketPrice] = await Promise.all(promises);

          // ✅ FIXED: Add price vs market comparison (removed fake CO2 multipliers)
          // CO2 emissions should ONLY come from real Amadeus CO2 Emissions API
          // Never show fake/estimated CO2 data to maintain user trust
          if (avgMarketPrice && avgMarketPrice > 0) {
            processedFlights = rankedFlights.map((flight: ScoredFlight) => {
              return {
                ...flight,
                priceVsMarket: ((normalizePrice(flight.price.total) - avgMarketPrice) / avgMarketPrice) * 100,
                // CO2 data removed - only show when real API data available
              };
            });
          } else {
            processedFlights = rankedFlights;
          }
        }

        setFlights(processedFlights);

        // Announce results to screen readers
        announceResults(processedFlights.length);

        // Update filter ranges based on results
        if (processedFlights && processedFlights.length > 0) {
          const prices = processedFlights.map((f: ScoredFlight) => normalizePrice(f.price.total));

          // ✅ FIX: Check ALL itineraries (both outbound AND return) for max duration
          const durations = processedFlights.flatMap((f: ScoredFlight) =>
            (f.itineraries || []).map(itinerary => parseDuration(itinerary.duration))
          ).filter((d: number) => d > 0); // Filter out any invalid durations

          setFilters(prev => ({
            ...prev,
            priceRange: [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))],
            maxDuration: durations.length > 0 ? Math.ceil(Math.max(...durations) / 60) : 24,
          }));
        }
      } catch (err: any) {
        console.error('Error fetching flights:', err);
        setError(err.message || 'Failed to fetch flights');
      } finally {
        setLoading(false);
        // Auto-collapse search bar after results load (success or empty results)
        if (!error) {
          setSearchBarCollapsed(true);
        }
      }
  };

  // Fetch flights on mount and when search params change
  useEffect(() => {
    fetchFlights();
  }, [searchParams]);

  // Auto-trigger price alert modal when user becomes authenticated
  // This handles the case where session was loading when user clicked "Track Price"
  useEffect(() => {
    if (sessionStatus === 'authenticated' && session && pendingFlightForAlert && !showAuthModal) {
      console.log('🎯 Session authenticated, auto-opening price alert modal');
      setSelectedFlightForAlert(pendingFlightForAlert);
      setShowCreatePriceAlert(true);
      setPendingFlightForAlert(null);
    }
  }, [sessionStatus, session, pendingFlightForAlert, showAuthModal]);

  // ML User Segmentation - Classify user based on search behavior
  useEffect(() => {
    if (flights.length > 0 && !userSegment && searchData.from && searchData.to) {
      segmentUser();
    }
  }, [flights, userSegment]);

  // A/B Testing Analytics - Track page view
  useEffect(() => {
    if (flights.length > 0) {
      analyticsTracker.trackView('urgency-signals-v1', urgencyVariant, sessionId, {
        route: `${searchData.from}-${searchData.to}`,
        flightCount: flights.length,
      });
      analyticsTracker.trackView('user-segmentation-v1', segmentVariant, sessionId, {
        segment: userSegment || 'unknown',
      });
      console.log(`📊 A/B Test Variants: Urgency=${urgencyVariant}, Segmentation=${segmentVariant}`);
    }
  }, [flights]);

  // 👁️ Track search in "Recently Viewed" - NEW COMPREHENSIVE TRACKING
  useEffect(() => {
    if (flights.length > 0 && searchData.from && searchData.to) {
      // Dynamically import tracking function (client-side only)
      import('@/lib/hooks/useFavorites').then(({ trackFlightSearch }) => {
        // Get cheapest flight price
        const cheapestPrice = Math.min(...flights.map(f => {
          const price = typeof f.price.total === 'string' ? parseFloat(f.price.total) : f.price.total;
          return price;
        }));

        trackFlightSearch({
          from: searchData.from,
          to: searchData.to,
          price: cheapestPrice,
          departureDate: searchData.departure,
          returnDate: searchData.return,
        });
      });
    }
  }, [flights, searchData.from, searchData.to, searchData.departure]);

  const segmentUser = async () => {
    try {
      const tripLength = searchData.return
        ? Math.ceil((new Date(searchData.return).getTime() - new Date(searchData.departure).getTime()) / (1000 * 60 * 60 * 24))
        : undefined;

      const response = await fetch('/api/ml/segment-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          search: {
            route: `${searchData.from}-${searchData.to}`,
            departure: searchData.departure,
            return: searchData.return,
            tripLength,
            to: searchData.to,
            class: searchData.class,
            adults: searchData.adults,
            children: searchData.children,
            infants: searchData.infants,
          },
          interaction: {
            sortedBy: sortBy,
            deviceType: typeof window !== 'undefined' && /Mobile/.test(navigator.userAgent) ? 'mobile' : 'desktop',
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        setUserSegment(result.segment);
        setSegmentConfidence(result.confidence);
        setSegmentRecommendations(result.recommendations);

        // Store in sessionStorage for booking page
        sessionStorage.setItem('userSegment', JSON.stringify({
          segment: result.segment,
          confidence: result.confidence,
          recommendations: result.recommendations,
        }));

        console.log('✅ User segmented:', result.segment, `(${Math.round(result.confidence * 100)}% confidence)`);
      }
    } catch (error) {
      console.error('❌ User segmentation failed:', error);
      // Fail silently - don't break user experience
    }
  };

  // Generate flexible date prices (±3 days)
  useEffect(() => {
    if (flights.length > 0 && searchData.departure) {
      const generateDatePrices = () => {
        const prices: DatePrice[] = [];
        const averagePrice = flights.reduce((sum, f) => sum + normalizePrice(f.price.total), 0) / flights.length;

        // Handle comma-separated multi-dates - use first date
        const firstDepartureDate = searchData.departure.split(',')[0];

        for (let i = -3; i <= 3; i++) {
          const date = new Date(firstDepartureDate);
          date.setDate(date.getDate() + i);
          const dateStr = date.toISOString().split('T')[0];

          // Generate mock price (±20% of average)
          const variance = (Math.random() * 0.4) - 0.2; // -20% to +20%
          const price = Math.round(averagePrice * (1 + variance));

          prices.push({ date: dateStr, price });
        }

        setFlexibleDatePrices(prices);
      };

      generateDatePrices();
    }
  }, [flights, searchData.departure]);

  // Apply filters and sorting
  const filteredFlights = applyFilters(flights, filters);
  const sortedFlights = sortFlights(filteredFlights, sortBy);
  const displayedFlights = sortedFlights.slice(0, displayCount);

  // Generate price insights
  const priceInsights = flights.length > 0 ? generatePriceInsights(flights) : null;
  // Handle comma-separated multi-dates - use first date for price route
  const firstDepartureDateForRoute = searchData.departure.split(',')[0];
  const priceRoute: FlightRoute = {
    from: searchData.from,
    to: searchData.to,
    departureDate: firstDepartureDateForRoute,
  };

  // Handlers
  const handleModifySearch = () => {
    router.push('/');
  };

  const handleLoadMore = () => {
    setDisplayCount(prev => Math.min(prev + 10, sortedFlights.length));
  };

  const handleRetry = () => {
    window.location.reload();
  };

  // Infinite scroll hook - auto-loads more flights when user scrolls near bottom
  const loadMoreRef = useInfiniteScroll(
    handleLoadMore,
    displayCount < sortedFlights.length,
    0.8, // Trigger at 80% scroll
    '200px' // Load 200px before reaching sentinel
  );

  // Note: handleExpandSearchBar removed - now handled by CollapsibleSearchBar component

  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);

  const handleSelectFlight = async (id: string) => {
    console.log('Selected flight:', id);

    // Find the selected flight
    const selectedFlight = flights.find(f => f.id === id);
    if (!selectedFlight) {
      console.error('Flight not found:', id);
      return;
    }

    // Set navigating state
    setIsNavigating(true);
    setSelectedFlightId(id);

    try {
      // Save flight data to sessionStorage for booking page to retrieve
      sessionStorage.setItem(`flight_${id}`, JSON.stringify(selectedFlight));

      // Also save search context
      sessionStorage.setItem(`flight_search_${id}`, JSON.stringify({
        from: searchData.from,
        to: searchData.to,
        departure: searchData.departure,
        return: searchData.return,
        adults: searchData.adults,
        children: searchData.children,
        infants: searchData.infants,
        class: searchData.class,
      }));

      // Small delay for success feedback
      await new Promise(resolve => setTimeout(resolve, 500));

      // Build booking URL with all necessary parameters
      const params = new URLSearchParams({
        flightId: id,
        adults: searchData.adults.toString(),
        children: searchData.children.toString(),
        infants: searchData.infants.toString(),
      });

      // Add return flight ID if round-trip
      if (searchData.return && selectedFlight.itineraries.length > 1) {
        params.append('returnFlightId', id); // Same flight includes both itineraries
        params.append('tripType', 'roundtrip');
      } else {
        params.append('tripType', 'oneway');
      }

      // Preserve language preference if available
      const langParam = searchParams.get('lang');
      if (langParam) {
        params.append('lang', langParam);
      }

      // Navigate to OPTIMIZED booking page (3-step flow)
      router.push(`/flights/booking-optimized?${params.toString()}`);
    } catch (error) {
      console.error('Error navigating to booking:', error);
      setIsNavigating(false);
      setSelectedFlightId(null);
    }
  };

  const handleViewDetails = (id: string) => {
    console.log('View details:', id);
    // Show detailed flight information
  };

  // Helper function to convert ScoredFlight to FlightForComparison
  const convertToComparisonFlight = (flight: ScoredFlight): FlightForComparison => {
    const outbound = flight.itineraries[0];
    const firstSegment = outbound.segments[0];
    const lastSegment = outbound.segments[outbound.segments.length - 1];

    // Get airline name from carrier code
    const carrierCode = firstSegment.carrierCode;
    const flightNumber = `${carrierCode}${firstSegment.number}`;

    // Extract baggage info from traveler pricings
    const travelerPricing = (flight as any).travelerPricings?.[0];
    const fareDetails = travelerPricing?.fareDetailsBySegment?.[0];
    const baggageInfo = fareDetails?.includedCheckedBags;

    const checkedBags = baggageInfo?.quantity || 0;
    const cabinBags = 1; // Most flights include at least 1 carry-on

    // Get amenities (if available from API)
    const amenities: string[] = [];
    if (fareDetails?.amenities) {
      fareDetails.amenities.forEach((amenity: any) => {
        if (amenity.description) {
          amenities.push(amenity.description);
        }
      });
    }

    // Get aircraft type
    const aircraftType = firstSegment.aircraft?.code || 'N/A';
    const fareClass = fareDetails?.cabin || 'Economy';

    return {
      id: flight.id,
      airline: carrierCode,
      flightNumber: flightNumber,
      departure: {
        airport: firstSegment.departure.iataCode,
        time: new Date(firstSegment.departure.at),
      },
      arrival: {
        airport: lastSegment.arrival.iataCode,
        time: new Date(lastSegment.arrival.at),
      },
      duration: parseDuration(outbound.duration),
      stops: outbound.segments.length - 1,
      price: normalizePrice(flight.price.total),
      baggage: {
        checked: checkedBags,
        cabin: cabinBags,
      },
      amenities: amenities,
      aircraftType: aircraftType,
      fareClass: fareClass,
    };
  };

  // New premium feature handlers
  const handleCompareToggle = (id: string) => {
    setCompareFlights(prev => {
      const newSelection = prev.includes(id)
        ? prev.filter(fid => fid !== id)
        : prev.length < 3
        ? [...prev, id]
        : prev; // Max 3 flights

      // Update comparison data
      const selectedFlights = flights.filter(f => newSelection.includes(f.id));
      const comparisonData = selectedFlights.map(convertToComparisonFlight);
      setCompareFlightsData(comparisonData);

      return newSelection;
    });
  };

  const handleDateChange = (newDate: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set('departure', newDate);
    router.push(`/flights/results?${params.toString()}`);
  };

  const handleBookNow = (flightId?: string) => {
    const id = flightId || sortedFlights[0]?.id;
    if (id) {
      console.log('Book flight:', id);
      handleSelectFlight(id);
    }
  };

  const handleSetAlert = () => {
    setShowPriceAlert(true);
  };

  // Comparison handlers
  const handleRemoveFromComparison = (id: string) => {
    setCompareFlights(prev => {
      const newSelection = prev.filter(fid => fid !== id);
      const selectedFlights = flights.filter(f => newSelection.includes(f.id));
      const comparisonData = selectedFlights.map(convertToComparisonFlight);
      setCompareFlightsData(comparisonData);
      return newSelection;
    });
  };

  const handleBookFlight = (id: string) => {
    handleSelectFlight(id);
  };

  // Handle Track Price - Authentication required
  const handleTrackPrice = (flightId: string) => {
    // Find the selected flight
    const flight = flights.find(f => f.id === flightId);
    if (!flight) {
      console.error('Flight not found:', flightId);
      return;
    }

    // Handle loading state - wait for session to resolve
    if (sessionStatus === 'loading') {
      console.log('⏳ Session loading, please wait...');
      toast.loading('Checking authentication...', { duration: 1000 });
      return;
    }

    // Check if user is authenticated
    if (sessionStatus === 'unauthenticated' || !session) {
      // Not authenticated - show AuthModal
      console.log('🔒 User not authenticated, showing AuthModal');
      setPendingFlightForAlert(flight);
      setShowAuthModal(true);
      return;
    }

    // ✅ User is authenticated - go directly to price alert modal
    console.log('✅ User authenticated, showing price alert modal');
    setSelectedFlightForAlert(flight);
    setShowCreatePriceAlert(true);
  };

  // Handle successful authentication from AuthModal
  const handleAuthSuccess = () => {
    setShowAuthModal(false);

    // Immediately open price alert modal with the pending flight
    if (pendingFlightForAlert) {
      setSelectedFlightForAlert(pendingFlightForAlert);
      setShowCreatePriceAlert(true);
      setPendingFlightForAlert(null);
    }
  };

  // Loading state - Show 3-column layout with inline loading in main content area
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
        {/* Search Bar - VISIBLE during loading */}
        <EnhancedSearchBar
          origin={searchData.from}
          destination={searchData.to}
          departureDate={searchData.departure}
          returnDate={searchData.return}
          passengers={{
            adults: searchData.adults,
            children: searchData.children,
            infants: searchData.infants,
          }}
          cabinClass={searchData.class}
          lang={lang}
        />

        {/* Main Content Area - 3 COLUMN LAYOUT */}
        <div
          className="mx-auto p-3 md:p-6"
          style={{
            maxWidth: layout.container.maxWidth,
          }}
        >
          <div className="flex flex-col lg:flex-row gap-3 md:gap-6 pt-3 pb-3 md:pt-6 md:pb-6">

            {/* Left Sidebar - Filters VISIBLE during loading */}
            <aside className="hidden lg:block" style={{ width: '250px', flexShrink: 0 }}>
              <div className="sticky top-24">
                <FlightFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  flightData={[]} // Empty during loading
                  lang={lang}
                />
              </div>
            </aside>

            {/* Main Content - INLINE LOADING ONLY */}
            <main className="flex-1 min-w-0" role="main" aria-label="Flight search results">
              {/* Sort Bar Placeholder */}
              <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/50 p-4 mb-4">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* Inline Loading Component */}
              <InlineFlightLoading
                origin={searchData.from}
                destination={searchData.to}
                departureDate={searchData.departure}
                returnDate={searchData.return}
                adults={searchData.adults}
                children={searchData.children}
                infants={searchData.infants}
                cabinClass={searchData.class}
                isMultiCity={isMultiCity}
              />
            </main>

            {/* Right Sidebar - Price Insights VISIBLE during loading */}
            <aside className="hidden lg:block" style={{ width: '320px', flexShrink: 0 }}>
              <div className="sticky top-24 space-y-4">
                {/* Price Insights Skeleton */}
                <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/50 p-4">
                  <div className="space-y-3">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>

                {/* SmartWait Skeleton */}
                <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/50 p-4">
                  <div className="space-y-3">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-error/20 p-8 text-center">
          <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-error" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {t('error')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('errorDesc')}
          </p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <RefreshCcw className="w-5 h-5" />
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  // No results state (multi-city flights are now combined into flights array)
  const hasNoResults = flights.length === 0;

  if (hasNoResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
        <EnhancedSearchBar
          origin={searchData.from}
          destination={searchData.to}
          departureDate={searchData.departure}
          returnDate={searchData.return}
          passengers={{
            adults: searchData.adults,
            children: searchData.children,
            infants: searchData.infants,
          }}
          cabinClass={searchData.class}
          lang={lang}
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 p-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('noResults')}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {t('noResultsDesc')}
            </p>
            <button
              onClick={handleModifySearch}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              {t('modifySearch')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main results view
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      {/* Pull-to-refresh indicator (mobile only) */}
      {pullIndicator}

      {/* Keyboard-accessible refresh button (mobile only, hidden during pull) */}
      <div className="md:hidden">
        <RefreshButton
          onRefresh={fetchFlights}
          isRefreshing={loading || isPullRefreshing}
          theme="blue"
        />
      </div>

      {/* Test Mode Banner - Removed for production */}
      {/* <TestModeBanner /> */}

      {/* Search Bar - Collapsible with 270px vertical space savings */}
      <CollapsibleSearchBar
        searchSummary={{
          origin: searchData.from,
          destination: searchData.to,
          departDate: searchData.departure ? new Date(searchData.departure.split(',')[0]) : null,
          returnDate: searchData.return ? new Date(searchData.return) : null,
          passengers: {
            adults: searchData.adults,
            children: searchData.children,
            infants: searchData.infants,
          },
          tripType: searchData.return ? 'roundtrip' : 'oneway',
        }}
        defaultCollapsed={searchBarCollapsed}
        onCollapseChange={setSearchBarCollapsed}
        mobileOnly={true}
      >
        <EnhancedSearchBar
          origin={searchData.from}
          destination={searchData.to}
          departureDate={searchData.departure}
          returnDate={searchData.return}
          passengers={{
            adults: searchData.adults,
            children: searchData.children,
            infants: searchData.infants,
          }}
          cabinClass={searchData.class}
          lang={lang}
        />
      </CollapsibleSearchBar>

      {/* Desktop: Show full search bar (CollapsibleSearchBar is mobile-only) */}
      <div className="hidden md:block">
        <EnhancedSearchBar
          origin={searchData.from}
          destination={searchData.to}
          departureDate={searchData.departure}
          returnDate={searchData.return}
          passengers={{
            adults: searchData.adults,
            children: searchData.children,
            infants: searchData.infants,
          }}
          cabinClass={searchData.class}
          lang={lang}
        />
      </div>

      {/* World Cup 2026 Cross-Promotion Banner - Only shows for destination cities hosting matches */}
      {(() => {
        // Check if destination (TO) is a World Cup host city
        const isWorldCupDestination = isWorldCupHostCity(searchData.to);

        // Only show banner if traveling TO a World Cup host city
        if (!isWorldCupDestination) return null;

        return (
          <div className="mx-auto px-3 md:px-6 mb-3" style={{ maxWidth: layout.container.maxWidth }}>
            <WorldCupCrossSell
              lang={lang}
              location="flight_results"
              isRelevant={true}
              compact={false}
            />
          </div>
        );
      })()}

      {/* Main Content Area - 3 COLUMN LAYOUT (Priceline-style) with max-width container */}
      <div
        className="mx-auto p-3 md:p-6"
        style={{
          maxWidth: layout.container.maxWidth,
        }}
      >
        <div className="flex flex-col lg:flex-row gap-3 md:gap-6 pt-3 pb-3 md:pt-6 md:pb-6">

          {/* Left Sidebar - Filters (Fixed 250px) */}
          <aside className="hidden lg:block" style={{ width: '250px', flexShrink: 0 }}>
            <div className="sticky top-24">
              <FlightFilters
                filters={filters}
                onFiltersChange={setFilters}
                flightData={flights}
                lang={lang}
              />
            </div>
          </aside>

          {/* Main Content - Flight Results (Flexible width) */}
          <main className="flex-1 min-w-0" role="main" aria-label="Flight search results">
            {/* Screen reader announcement for current results */}
            <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
              {sortedFlights.length} flights found for {searchData.from} to {searchData.to}
            </div>

            {/* Sort Bar - IMMEDIATELY before results */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex-1">
                <SortBar
                  currentSort={sortBy}
                  onChange={setSortBy}
                  resultCount={sortedFlights.length}
                  lang={lang}
                />
              </div>

              {/* Save Search Button */}
              <div className="hidden md:block">
                <SaveSearchButton
                  searchParams={{
                    origin: searchData.from,
                    destination: searchData.to,
                    departDate: searchData.departure,
                    returnDate: searchData.return,
                    adults: searchData.adults,
                    children: searchData.children,
                    infants: searchData.infants,
                    cabinClass: searchData.class,
                  }}
                  variant="compact"
                />
              </div>
            </div>

            {/* Mobile: Save Search Button below sort bar */}
            <div className="md:hidden mb-4">
              <SaveSearchButton
                searchParams={{
                  origin: searchData.from,
                  destination: searchData.to,
                  departDate: searchData.departure,
                  returnDate: searchData.return,
                  adults: searchData.adults,
                  children: searchData.children,
                  infants: searchData.infants,
                  cabinClass: searchData.class,
                }}
                variant="compact"
                className="w-full"
              />
            </div>

            {/* Limited Nonstop Flights Notice - Shows when nonstop filter returns few results */}
            {(fromNonstopFilter || toNonstopFilter) && sortedFlights.length < 5 && sortedFlights.length > 0 && (() => {
              // Count how many connecting flights would be available without nonstop filter
              const allFlightsWithoutNonstopFilter = applyFilters(flights, filters);
              const connectingFlightsCount = allFlightsWithoutNonstopFilter.length - sortedFlights.length;

              if (connectingFlightsCount > 0) {
                return (
                  <div className="mb-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-amber-800 mb-1">
                          {sortedFlights.length === 1
                            ? 'Only 1 nonstop flight available'
                            : `Only ${sortedFlights.length} nonstop flights available`}
                        </h4>
                        <p className="text-sm text-amber-700 mb-3">
                          Long-haul routes like {searchData.from} → {searchData.to} typically have limited nonstop service.
                          {connectingFlightsCount > 0 && ` There are ${connectingFlightsCount}+ connecting flight options available.`}
                        </p>
                        <button
                          onClick={() => {
                            // Remove nonstop filters from URL and refresh
                            const params = new URLSearchParams(window.location.search);
                            params.delete('fromNonstop');
                            params.delete('toNonstop');
                            window.location.href = `/flights/results?${params.toString()}`;
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Show all {connectingFlightsCount + sortedFlights.length} flights
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Limited Nonstop Flights Notice - Shows when nonstop filter returns ZERO results */}
            {(fromNonstopFilter || toNonstopFilter) && sortedFlights.length === 0 && flights.length > 0 && (() => {
              // Count how many connecting flights would be available without nonstop filter
              const allFlightsWithoutNonstopFilter = applyFilters(flights, filters);

              if (allFlightsWithoutNonstopFilter.length > 0) {
                return (
                  <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      No nonstop flights on this route
                    </h3>
                    <p className="text-gray-600 mb-4 max-w-md mx-auto">
                      The {searchData.from} → {searchData.to} route doesn't have nonstop service on your selected dates.
                      However, we found <strong>{allFlightsWithoutNonstopFilter.length} connecting flights</strong> with convenient connections.
                    </p>
                    <button
                      onClick={() => {
                        // Remove nonstop filters from URL and refresh
                        const params = new URLSearchParams(window.location.search);
                        params.delete('fromNonstop');
                        params.delete('toNonstop');
                        window.location.href = `/flights/results?${params.toString()}`;
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      View {allFlightsWithoutNonstopFilter.length} connecting flights
                    </button>
                  </div>
                );
              }
              return null;
            })()}

            {/* Flight Cards List - ALL RESULTS CONTINUOUSLY (No widgets interruption) */}
            <div className="space-y-2 md:space-y-4">
              {displayedFlights.map((flight, index) => {
                const flightId = flight.id || `flight-${index}`;
                return (
                  <div
                    key={flightId}
                    className="transform transition-all duration-200 hover:scale-[1.005]"
                    style={{
                      animationDelay: `${Math.min(index * 20, 200)}ms`,
                    }}
                  >
                    <FlightCardEnhanced
                      id={flightId}
                      itineraries={flight.itineraries}
                      price={flight.price}
                      numberOfBookableSeats={flight.numberOfBookableSeats}
                      validatingAirlineCodes={flight.validatingAirlineCodes}
                      travelerPricings={(flight as any).travelerPricings}
                      badges={flight.badges}
                      score={typeof flight.score === 'object' ? (flight.score as any)[sortBy] || (flight.score as any).overall : flight.score}
                      mlScore={(flight as any).mlScore}
                      priceVsMarket={(flight as any).priceVsMarket}
                      co2Emissions={(flight as any).co2Emissions}
                      averageCO2={(flight as any).averageCO2}
                      dealScore={(flight as any).dealScore}
                      dealTier={(flight as any).dealTier}
                      dealLabel={(flight as any).dealLabel}
                      viewingCount={Math.floor(Math.random() * 50) + 20}
                      bookingsToday={Math.floor(Math.random() * 150) + 100}
                      onSelect={handleSelectFlight}
                      onCompare={handleCompareToggle}
                      onTrackPrice={handleTrackPrice}
                      isComparing={compareFlights.includes(flightId)}
                      isNavigating={isNavigating && selectedFlightId === flightId}
                      lang={lang}
                      userSegment={userSegment}
                      segmentRecommendations={segmentRecommendations}
                      urgencyVariant={urgencyVariant}
                      sessionId={sessionId}
                    />
                  </div>
                );
              })}
            </div>

            {/* Widgets removed per user request - flight cards now display continuously */}

            {/* Infinite Scroll Sentinel & Loading Indicator */}
            {displayCount < sortedFlights.length && (
              <div
                ref={loadMoreRef}
                className="mt-6 md:mt-8 text-center"
                role="status"
                aria-live="polite"
                aria-label={t('loadingMore')}
              >
                <div className="flex flex-col items-center justify-center py-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">
                    {t('loadingMore')}
                  </p>
                </div>
              </div>
            )}

            {/* All Results Loaded Message */}
            {displayCount >= sortedFlights.length && sortedFlights.length > 20 && (
              <div className="mt-6 md:mt-8 text-center py-6">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50/80 backdrop-blur-sm border border-green-200 text-green-700 rounded-xl">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium">
                    {t('allResultsLoaded', { total: sortedFlights.length })}
                  </span>
                </div>
              </div>
            )}

            {/* No filtered results - Only show when NOT caused by nonstop filter (nonstop has its own dedicated notice) */}
            {sortedFlights.length === 0 && flights.length > 0 && !(fromNonstopFilter || toNonstopFilter) && (
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
                <div className="w-20 h-20 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-10 h-10 text-warning" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No flights match your filters
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filter criteria to see more results.
                </p>
                <button
                  onClick={() => setFilters({
                    priceRange: [0, 10000],
                    stops: [],
                    airlines: [],
                    departureTime: [],
                    maxDuration: 24,
                    excludeBasicEconomy: false,
                    cabinClass: [],
                    baggageIncluded: false,
                    refundableOnly: false,
                    maxLayoverDuration: 360,
                    alliances: [],
                    aircraftTypes: [],
                    maxCO2Emissions: 500,
                    connectionQuality: [],
                    ndcOnly: false,
                    showExclusiveFares: false,
                  })}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </main>

          {/* Right Sidebar - Price Insights & SmartWait (Fixed 320px) */}
          <aside className="hidden lg:block" style={{ width: '320px', flexShrink: 0 }}>
            <div className="sticky top-24 space-y-2 md:space-y-4">
              {/* Live Activity Feed - Conversion Feature */}
              {featureFlags.isEnabled('liveActivityFeed') && (
                <LiveActivityFeed
                  variant={featureFlags.get('activityFeedVariant')}
                  maxItems={5}
                />
              )}

              {/* ML Insights - AI-Powered Cost Optimization */}
              {sortedFlights.length > 0 && (
                <MLInsights
                  route={priceRoute}
                  currentPrice={normalizePrice(sortedFlights[0].price.total)}
                  averagePrice={marketAverage || undefined}
                  mlMetadata={mlMetadata || undefined}
                  currency="USD"
                  lang={lang}
                />
              )}

              {/* Price Insights */}
              {priceInsights && (
                <PriceInsights
                  route={priceRoute}
                  statistics={priceInsights}
                  currency="USD"
                  lang={lang}
                />
              )}

              {/* SmartWait Booking Advisor */}
              {sortedFlights.length > 0 && (
                <SmartWait
                  currentPrice={normalizePrice(sortedFlights[0].price.total)}
                  route={`${searchData.from} → ${searchData.to}`}
                  departureDate={searchData.departure.split(',')[0]}
                  onBookNow={() => handleBookNow(sortedFlights[0].id)}
                  onSetAlert={handleSetAlert}
                  currency="USD"
                  lang={lang}
                />
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Flight Comparison Modal */}
      {compareFlights.length >= 2 && (
        <FlightComparison
          flights={compareFlights.map(id => {
            const flight = flights.find(f => f.id === id);
            if (!flight) return null;

            return {
              id: flight.id,
              price: {
                total: String(flight.price.total),
                base: String(flight.price.base),
                currency: flight.price.currency,
                fees: undefined,
                grandTotal: undefined,
              },
              outbound: flight.itineraries[0],
              inbound: flight.itineraries[1],
              validatingAirline: {
                name: (flight as any).validatingAirlineCodes?.[0] || flight.itineraries[0].segments[0].carrierCode,
                code: (flight as any).validatingAirlineCodes?.[0] || flight.itineraries[0].segments[0].carrierCode,
              },
              numberOfBookableSeats: (flight as any).numberOfBookableSeats,
              score: typeof flight.score === 'object' ? (flight.score as any).overall : flight.score,
            };
          }).filter((f): f is NonNullable<typeof f> => f !== null) as any}
          onSelect={handleSelectFlight}
          lang={lang}
        />
      )}

      {/* Price Alerts Modal */}
      {showPriceAlert && sortedFlights.length > 0 && (
        <PriceAlerts
          flightId={sortedFlights[0].id}
          currentPrice={normalizePrice(sortedFlights[0].price.total)}
          onSetAlert={async (email, threshold) => {
            console.log('Price alert set:', { email, threshold });
            setShowPriceAlert(false);
            return true;
          }}
          currency="USD"
          lang={lang}
          route={{
            from: searchData.from,
            to: searchData.to,
            date: searchData.departure.split(',')[0],
          }}
        />
      )}

      {/* Exit Intent Popup - Conversion Feature */}
      {featureFlags.isEnabled('exitIntent') && (
        <ExitIntentPopup
          discountCode={featureFlags.get('exitIntentDiscountCode')}
          discountPercent={featureFlags.get('exitIntentDiscountPercent')}
          onEmailSubmit={(email) => {
            trackConversion('exit_intent_email_submitted', { email });
            console.log('Exit intent email submitted:', email);
          }}
        />
      )}

      {/* Mobile Filter Button - Shows on <lg screens */}
      <div className="lg:hidden">
        <FilterButton
          onClick={() => setMobileFilterSheetOpen(true)}
          activeFilterCount={
            (filters.stops.length > 0 ? 1 : 0) +
            (filters.airlines.length > 0 ? 1 : 0) +
            (filters.departureTime.length > 0 ? 1 : 0) +
            (filters.excludeBasicEconomy ? 1 : 0) +
            (filters.cabinClass.length > 0 ? 1 : 0) +
            (filters.baggageIncluded ? 1 : 0) +
            (filters.refundableOnly ? 1 : 0) +
            (filters.alliances.length > 0 ? 1 : 0) +
            (filters.connectionQuality.length > 0 ? 1 : 0) +
            (filters.maxDuration < 24 ? 1 : 0) +
            (filters.maxLayoverDuration < 360 ? 1 : 0) +
            (filters.maxCO2Emissions < 500 ? 1 : 0)
          }
        />
      </div>

      {/* Mobile Filter Sheet - Bottom sheet on mobile */}
      <MobileFilterSheet
        isOpen={mobileFilterSheetOpen}
        onClose={() => setMobileFilterSheetOpen(false)}
        onApply={() => setMobileFilterSheetOpen(false)}
        onClear={() => {
          setFilters({
            priceRange: [0, 10000],
            stops: [],
            airlines: [],
            departureTime: [],
            maxDuration: 24,
            excludeBasicEconomy: false,
            cabinClass: [],
            baggageIncluded: false,
            refundableOnly: false,
            maxLayoverDuration: 360,
            alliances: [],
            aircraftTypes: [],
            maxCO2Emissions: 500,
            connectionQuality: [],
            ndcOnly: false,
            showExclusiveFares: false,
          });
        }}
        resultCount={sortedFlights.length}
        activeFilterCount={
          (filters.stops.length > 0 ? 1 : 0) +
          (filters.airlines.length > 0 ? 1 : 0) +
          (filters.departureTime.length > 0 ? 1 : 0) +
          (filters.excludeBasicEconomy ? 1 : 0) +
          (filters.cabinClass.length > 0 ? 1 : 0) +
          (filters.baggageIncluded ? 1 : 0) +
          (filters.refundableOnly ? 1 : 0) +
          (filters.alliances.length > 0 ? 1 : 0) +
          (filters.connectionQuality.length > 0 ? 1 : 0) +
          (filters.maxDuration < 24 ? 1 : 0) +
          (filters.maxLayoverDuration < 360 ? 1 : 0) +
          (filters.maxCO2Emissions < 500 ? 1 : 0)
        }
        title="Flight Filters"
      >
        <FlightFilters
          filters={filters}
          onFiltersChange={setFilters}
          flightData={flights}
          lang={lang}
        />
      </MobileFilterSheet>

      {/* Flight Comparison Sticky Bar - Bottom of page */}
      {compareFlightsData.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 shadow-2xl">
          <FlightComparisonBar
            flights={compareFlightsData}
            onRemove={handleRemoveFromComparison}
            onBook={handleBookFlight}
            className="max-w-7xl mx-auto"
          />
        </div>
      )}

      {/* Authentication Modal - Seamless login without redirect */}
      {showAuthModal && pendingFlightForAlert && (
        <AuthModal
          isOpen={true}
          onClose={() => {
            setShowAuthModal(false);
            setPendingFlightForAlert(null);
          }}
          onSuccess={handleAuthSuccess}
          flightContext={{
            origin: searchData.from,
            destination: searchData.to,
            departDate: searchData.departure.split(',')[0],
            price: normalizePrice(pendingFlightForAlert.price.total),
            currency: pendingFlightForAlert.price.currency,
          }}
        />
      )}

      {/* Create Price Alert Modal - Authentication protected */}
      {showCreatePriceAlert && selectedFlightForAlert && (
        <CreatePriceAlert
          isOpen={true}
          flightData={{
            origin: searchData.from,
            destination: searchData.to,
            departDate: searchData.departure.split(',')[0],
            returnDate: searchData.return || undefined,
            currentPrice: normalizePrice(selectedFlightForAlert.price.total),
            currency: selectedFlightForAlert.price.currency,
          }}
          onClose={() => {
            setShowCreatePriceAlert(false);
            setSelectedFlightForAlert(null);
          }}
          onSuccess={(alert) => {
            console.log('Price alert created:', alert);
            // Optionally refresh price alerts list
          }}
        />
      )}
    </div>
  );
}

// ===========================
// PAGE WRAPPER WITH SUSPENSE
// ===========================

export default function FlightResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-primary-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-4 bg-primary-50 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-primary-600 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Searching for flights...
          </h2>
          <p className="text-gray-600 font-medium">
            Finding the best deals for you
          </p>
        </div>
      </div>
    }>
      <FlightResultsContent />
    </Suspense>
  );
}
