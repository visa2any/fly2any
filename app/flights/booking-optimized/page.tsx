'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Plane, ChevronLeft, ChevronRight, ArrowLeft, Loader2, User, Clock, CheckCircle2, Star, Home, X, Armchair, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCityCode } from '@/lib/data/airports';
import { FareSelector } from '@/components/booking/FareSelector';
import { AddOnsTabs } from '@/components/booking/AddOnsTabs';
import { getAirlineData } from '@/lib/flights/airline-data';
import AirlineLogo from '@/components/flights/AirlineLogo';
import { StickySummary } from '@/components/booking/StickySummary';
import { CompactPassengerForm } from '@/components/booking/CompactPassengerForm';
import { ReviewAndPay } from '@/components/booking/ReviewAndPay';
import { PromoCodeSection } from '@/components/booking/PromoCodeSection';
import SeatMapModal, { type SeatPreference } from '@/components/flights/SeatMapModal';
import { parseSeatMap, type ParsedSeatMap, type Seat } from '@/lib/flights/seat-map-parser';
import { AIRPORTS } from '@/lib/data/airports';
import { useScrollDirection } from '@/lib/hooks/useScrollDirection';
import { OfferCountdown } from '@/components/booking/OfferCountdown';
import { OfferExpiredModal } from '@/components/booking/OfferExpiredModal';
import { useCurrency } from '@/lib/context/CurrencyContext';

// ===========================
// TYPE DEFINITIONS
// ===========================

type BookingStep = 1 | 2 | 3;

interface FareOption {
  id: string;
  name: string;
  price: number;
  currency: string;
  priceDetails?: { // Complete price breakdown for checkout
    total?: any;
    base?: any;
    fees?: any;
    grandTotal?: any;
  };
  features: string[];
  restrictions?: string[];
  positives?: string[]; // Positive policies like "Free changes", "Fully refundable"
  recommended?: boolean;
  popularityPercent?: number;
  originalOffer?: any; // For Duffel fare variants - contains the full offer for booking
}

interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  selected: boolean;
}

interface AddOnCategory {
  id: string;
  name: string;
  icon: 'seat' | 'baggage' | 'insurance' | 'wifi' | 'priority';
  subtitle: string;
  items: AddOn[];
  proTip?: string;
}

interface PassengerData {
  id: string;
  type: 'adult' | 'child' | 'infant';
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber?: string;
  passportExpiry?: string;
  email?: string;
  phone?: string;
}

// ===========================
// HELPER FUNCTIONS
// ===========================

/**
 * Detect if a route is international based on airport codes
 */
function isInternationalRoute(from: string, to: string): boolean {
  const fromAirport = AIRPORTS.find(a => a.code === from);
  const toAirport = AIRPORTS.find(a => a.code === to);

  // If we can't find the airports, assume international for safety
  if (!fromAirport || !toAirport) return true;

  // Compare countries
  return fromAirport.country !== toAirport.country;
}

// ===========================
// MAIN COMPONENT
// ===========================

function BookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // CRITICAL: Use global currency context for E2E consistency (PT-BR = BRL)
  const { currency: userCurrency, format: formatCurrency, convert: convertPrice } = useCurrency();

  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Flight data
  const [flightData, setFlightData] = useState<any>(null);

  // Step 1: Customize Flight
  const [fareOptions, setFareOptions] = useState<FareOption[]>([]);
  const [selectedFareId, setSelectedFareId] = useState<string>('');
  const [addOnCategories, setAddOnCategories] = useState<AddOnCategory[]>([]);

  // Step 2: Passenger Details
  const [passengers, setPassengers] = useState<PassengerData[]>([]);

  // Step 3: Review & Pay
  const [paymentData, setPaymentData] = useState<any>(null);

  // Seat map modal
  const [seatMapOpen, setSeatMapOpen] = useState(false);
  const [seatMapData, setSeatMapData] = useState<ParsedSeatMap | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [loadingSeatMap, setLoadingSeatMap] = useState(false);
  const [seatMapUnavailable, setSeatMapUnavailable] = useState(false);

  // Price tracking
  const [priceLockTimer, setPriceLockTimer] = useState({ minutes: 10, seconds: 0 });

  // Offer expiration handling (Duffel offers valid for 30 min)
  const [offerCreatedAt, setOfferCreatedAt] = useState<number>(Date.now());
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  // Promo code state
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    discountAmount: number;
    description?: string;
  } | null>(null);

  // Scroll direction detection for auto-hide header (Phase 8 Track 2B.1)
  const { scrollDirection, isAtTop } = useScrollDirection({
    threshold: 50,
    debounceDelay: 100,
    mobileOnly: true,
  });

  // ===========================
  // LOAD FLIGHT DATA
  // ===========================

  useEffect(() => {
    const loadFlightData = async () => {
      try {
        const flightId = searchParams.get('flightId');
        if (!flightId) {
          router.push('/flights/results');
          return;
        }

        // Load flight from sessionStorage
        const flightJson = sessionStorage.getItem(`flight_${flightId}`);
        const searchJson = sessionStorage.getItem(`flight_search_${flightId}`);

        if (!flightJson || !searchJson) {
          router.push('/flights/results');
          return;
        }

        const flight = JSON.parse(flightJson);
        const search = JSON.parse(searchJson);

        // DEBUG: Log what we received from sessionStorage
        console.log('📦 Flight object from sessionStorage:', {
          id: flight.id,
          hasFareVariants: !!flight.fareVariants,
          fareVariantCount: flight.fareVariants?.length || 0,
          fareVariantNames: flight.fareVariants?.map((v: any) => v.name) || [],
          price: flight.price?.total,
          keys: Object.keys(flight).slice(0, 10),
          _storedAt: flight._storedAt,
          _offerExpiresAt: flight._offerExpiresAt,
        });

        // ===========================
        // CRITICAL: OFFER FRESHNESS VALIDATION
        // Duffel offers expire after 30 min - check EARLY to avoid wasted user effort
        // ===========================
        const OFFER_VALIDITY_MS = 25 * 60 * 1000; // 25 minutes (5 min safety buffer)
        const storedAt = flight._storedAt || 0;
        const expiresAt = flight._offerExpiresAt || (storedAt + OFFER_VALIDITY_MS);
        const now = Date.now();
        const offerAgeMs = now - storedAt;
        const remainingMs = expiresAt - now;

        // Log offer freshness status
        console.log('⏱️ Offer freshness check:', {
          storedAt: storedAt ? new Date(storedAt).toISOString() : 'unknown',
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : 'unknown',
          ageMinutes: Math.round(offerAgeMs / 60000),
          remainingMinutes: Math.round(remainingMs / 60000),
          isExpired: remainingMs <= 0,
          isStale: storedAt === 0, // No timestamp = old cached data
        });

        // If offer is expired or has no timestamp (stale cached data), show modal immediately
        if (remainingMs <= 0 || storedAt === 0) {
          console.warn('⚠️ Offer expired or stale - showing refresh modal');

          // Clear the expired offer from sessionStorage
          sessionStorage.removeItem(`flight_${flightId}`);
          sessionStorage.removeItem(`flight_search_${flightId}`);

          // Set flight data for modal display (route info)
          setFlightData({ ...flight, search });
          setOfferCreatedAt(storedAt || (now - OFFER_VALIDITY_MS - 60000)); // Make it show as expired
          setShowExpiredModal(true);
          setLoading(false);
          return; // Stop here - don't proceed with booking flow
        }

        // Update offer creation time for countdown display
        if (storedAt > 0) {
          setOfferCreatedAt(storedAt);
        }

        setFlightData({ ...flight, search });

        // ===========================
        // GET FARE OPTIONS: DUFFEL VARIANTS OR AMADEUS UPSELLING
        // ===========================
        let realFares: FareOption[] = [];

        // Check if flight already has fare variants from search (Duffel flights)
        // Duffel returns multiple offers for the same physical flight with different fare classes
        // These are grouped during search and stored as fareVariants
        if (flight.fareVariants && flight.fareVariants.length > 0) {
          console.log(`🎫 Using ${flight.fareVariants.length} fare variants from Duffel search`);
          console.log(`🔍 First variant priceDetails:`, flight.fareVariants[0]?.priceDetails);

          realFares = flight.fareVariants.map((variant: any, index: number) => ({
            id: variant.id,
            name: variant.name || 'Economy Standard',
            price: variant.price,
            priceDetails: variant.priceDetails || { // Use complete price breakdown from search
              total: variant.price,
              base: undefined,
              fees: undefined,
            },
            currency: variant.currency || 'USD',
            features: variant.features || ['Economy seat', 'Carry-on included'],
            restrictions: variant.restrictions || undefined,
            positives: variant.positives || undefined,
            recommended: variant.recommended || false,
            popularityPercent: variant.popularityPercent || (index === 0 ? 26 : index === 1 ? 74 : 18),
            originalOffer: variant.originalOffer, // Keep original offer for booking
          }));

          console.log(`✅ Fare variants loaded:`, realFares.map(f => `${f.name}: $${f.price}`).join(', '));

          // Set default to recommended (index 1) or cheapest (index 0)
          setSelectedFareId(realFares[1]?.id || realFares[0]?.id);
        } else {
          // Amadeus flights: Fetch branded fares from upselling API
          console.log('🎫 Fetching branded fares from Amadeus API...');

          try {
            const upsellingResponse = await fetch('/api/flights/upselling', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ flightOffer: flight }),
            });

            if (upsellingResponse.ok) {
              const upsellingData = await upsellingResponse.json();

              if (upsellingData.success && upsellingData.fareOptions?.length > 0) {
                console.log(`✅ Found ${upsellingData.fareOptions.length} real fare families from Amadeus`);

                // Cabin class priority for sorting (lower = show first)
                const cabinPriority: Record<string, number> = {
                  'ECONOMY': 1,
                  'PREMIUM_ECONOMY': 2,
                  'BUSINESS': 3,
                  'FIRST': 4,
                };

                // Transform and sort Amadeus fare families
                const transformedFares = upsellingData.fareOptions.map((fareOffer: any) => {
                  const fareDetails = fareOffer.travelerPricings?.[0]?.fareDetailsBySegment?.[0];
                  const brandedFare = fareDetails?.brandedFare || '';
                  const cabin = fareDetails?.cabin || 'ECONOMY';
                  const price = parseFloat(fareOffer.price?.total || '0');
                  const baggage = fareDetails?.includedCheckedBags?.quantity || 0;

                  return {
                    id: fareOffer.id,
                    brandedFare,
                    cabin,
                    price,
                    baggage,
                    currency: fareOffer.price?.currency || 'USD',
                    originalOffer: fareOffer,
                  };
                });

                // Sort by cabin priority first, then by price within each cabin
                transformedFares.sort((a: any, b: any) => {
                  const cabinDiff = (cabinPriority[a.cabin] || 5) - (cabinPriority[b.cabin] || 5);
                  if (cabinDiff !== 0) return cabinDiff;
                  return a.price - b.price;
                });

                // Deduplicate fares with same cabin + similar price (within $50)
                const seenFares = new Set<string>();
                const deduplicatedFares = transformedFares.filter((fare: any) => {
                  const priceRounded = Math.round(fare.price / 50) * 50; // Round to nearest $50
                  const key = `${fare.cabin}-${priceRounded}`;
                  if (seenFares.has(key)) {
                    console.warn(`⚠️ Filtering duplicate fare: ${fare.cabin} at $${fare.price}`);
                    return false;
                  }
                  seenFares.add(key);
                  return true;
                });

                // Filter out illogical prices (economy > business within same response)
                const lowestBusinessPrice = deduplicatedFares
                  .filter((f: any) => f.cabin === 'BUSINESS')
                  .reduce((min: number, f: any) => Math.min(min, f.price), Infinity);

                const validFares = deduplicatedFares.filter((f: any) => {
                  // Economy/Premium Economy shouldn't cost more than Business
                  if ((f.cabin === 'ECONOMY' || f.cabin === 'PREMIUM_ECONOMY') && lowestBusinessPrice < Infinity) {
                    if (f.price > lowestBusinessPrice * 1.5) {
                      console.warn(`⚠️ Filtering out illogical fare: ${f.cabin} at $${f.price} > Business at $${lowestBusinessPrice}`);
                      return false;
                    }
                  }
                  return true;
                });

                // Track used names to avoid duplicates
                const usedNames: Record<string, number> = {};

                // Map cabin class to display name
                const cabinDisplayName: Record<string, string> = {
                  'ECONOMY': 'Economy',
                  'PREMIUM_ECONOMY': 'Premium Economy',
                  'BUSINESS': 'Business',
                  'FIRST': 'First Class',
                };

                // Transform to FareOption interface with unique names
                realFares = validFares.map((fare: any, index: number) => {
                  const cabin = fare.cabin;
                  const cabinPrefix = cabinDisplayName[cabin] || 'Economy';
                  const brandedFareUpper = (fare.brandedFare || '').toUpperCase();

                  // Determine fare type from branded fare name
                  let fareType = 'Standard';
                  if (brandedFareUpper.includes('BASIC') || brandedFareUpper.includes('LIGHT') || brandedFareUpper.includes('SAVER') || brandedFareUpper.includes('VALUE')) {
                    fareType = 'Basic';
                  } else if (brandedFareUpper.includes('FLEX') || brandedFareUpper.includes('FLEXI') || brandedFareUpper.includes('FULL') || brandedFareUpper.includes('REFUND')) {
                    fareType = 'Flex';
                  } else if (brandedFareUpper.includes('PLUS') || brandedFareUpper.includes('CLASSIC') || brandedFareUpper.includes('MAIN')) {
                    fareType = 'Plus';
                  } else if (brandedFareUpper.includes('PREMIUM') || brandedFareUpper.includes('COMFORT')) {
                    fareType = 'Comfort';
                  }

                  // Create base name and ensure uniqueness
                  let baseName = cabin === 'FIRST' ? 'First Class' : `${cabinPrefix} ${fareType}`;
                  usedNames[baseName] = (usedNames[baseName] || 0) + 1;

                  // If duplicate, append branded fare or number for uniqueness
                  if (usedNames[baseName] > 1) {
                    if (fare.brandedFare && fare.brandedFare.length <= 12) {
                      baseName = `${cabinPrefix} ${fare.brandedFare}`;
                    } else {
                      baseName = `${baseName} ${usedNames[baseName]}`;
                    }
                  }

                  // Build features based on cabin class
                  const features: string[] = [];
                  if (fare.baggage === 0) features.push('Carry-on only');
                  else if (fare.baggage === 1) features.push('Carry-on + 1 checked bag');
                  else features.push(`Carry-on + ${fare.baggage} checked bags`);

                  if (cabin === 'BUSINESS') {
                    features.push('Business class seat', 'Priority boarding', 'Lounge access', 'Premium meals & drinks');
                  } else if (cabin === 'FIRST') {
                    features.push('First class suite', 'Priority everything', 'Lounge access', 'Gourmet dining');
                  } else if (cabin === 'PREMIUM_ECONOMY') {
                    features.push('Premium economy seat', 'Extra legroom', 'Priority boarding');
                  } else {
                    features.push('Economy seat');
                  }

                  // Restrictions and positives based on fare type
                  const restrictions: string[] = [];
                  const positives: string[] = [];

                  if (fareType === 'Flex') {
                    positives.push('Free changes', 'Fully refundable');
                  } else if (fareType === 'Plus' || fareType === 'Comfort') {
                    positives.push('Changes allowed (+fee)');
                    restrictions.push('Non-refundable');
                  } else if (fareType === 'Basic') {
                    features.push('Seat assignment fee');
                    restrictions.push('No changes allowed', 'Non-refundable');
                  } else {
                    positives.push('Changes allowed (+fee)');
                    restrictions.push('Non-refundable');
                  }

                  // Find cheapest economy fare for "best value" recommendation
                  const cheapestEconomy = validFares.find((f: any) => f.cabin === 'ECONOMY');
                  const isSecondCheapest = index === 1 && cabin === 'ECONOMY';

                  // Calculate popularity based on price position
                  const economyFares = validFares.filter((f: any) => f.cabin === 'ECONOMY');
                  const priceRank = economyFares.findIndex((f: any) => f.id === fare.id);
                  const popularity = priceRank === 0 ? 26 : priceRank === 1 ? 74 : priceRank === 2 ? 18 : 4;

                  return {
                    id: fare.id || `fare-${index}`,
                    name: baseName,
                    price: fare.price,
                    currency: fare.currency,
                    features: features.slice(0, 5),
                    restrictions: restrictions.length > 0 ? restrictions : undefined,
                    positives: positives.length > 0 ? positives : undefined,
                    recommended: isSecondCheapest,
                    popularityPercent: popularity,
                    originalOffer: fare.originalOffer,
                  };
                });

                const dupsFiltered = transformedFares.length - deduplicatedFares.length;
                const illogicalFiltered = deduplicatedFares.length - validFares.length;
                console.log(`✅ Processed ${realFares.length} valid fare options (removed ${dupsFiltered} duplicates, ${illogicalFiltered} illogical prices)`);
                setSelectedFareId(realFares[1]?.id || realFares[0]?.id);
              }
            }
          } catch (error) {
            console.error('⚠️  Failed to fetch branded fares:', error);
          }
        } // End of Amadeus upselling else block

        // FALLBACK: If no real fares found, use original offer as single option
        if (realFares.length === 0) {
          console.log('⚠️  Using original flight offer as single fare option');
          console.log('   Flight price:', flight.price.total, flight.price.currency);

          realFares = [{
            id: flight.id || 'standard',
            name: 'STANDARD',
            price: parseFloat(flight.price.total),
            currency: flight.price.currency,
            features: [
              'Carry-on + checked bag',
              'Standard seat selection',
              'Changes allowed (+fee)',
              'Refund policy varies'
            ],
            recommended: true,
            popularityPercent: 100,
          }];
          setSelectedFareId(realFares[0].id);
        } else {
          console.log(`✅ Successfully loaded ${realFares.length} fare options`);
        }

        // CRITICAL: Set fare options in state (must happen before loading completes)
        setFareOptions(realFares);
        console.log('📊 Fare options set in state:', realFares.length, 'options');

        // Fetch real ancillary data from API first
        let ancillaryCategories: AddOnCategory[] = [];
        let realAncillaryData: any = null;

        try {
          const ancillariesResponse = await fetch('/api/flights/ancillaries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              flightOffer: flight,
              passengerCount: parseInt(searchParams.get('adults') || '1'),
            }),
          });

          if (ancillariesResponse.ok) {
            const ancillariesData = await ancillariesResponse.json();

            if (ancillariesData.success && ancillariesData.data) {
              console.log(`✅ Loaded ancillaries: ${ancillariesData.meta?.totalServices || 0} services`);

              const data = ancillariesData.data;
              realAncillaryData = data; // Save for bundle generation

              // Build categories from API response - ONLY REAL DATA
              // CFAR (Cancel For Any Reason) - Real from Duffel
              if (data.cfar?.hasRealData && data.cfar?.options?.length > 0) {
                ancillaryCategories.push({
                  id: 'cfar',
                  name: 'CANCEL FOR ANY REASON',
                  icon: 'insurance' as const,
                  subtitle: 'Full flexibility to cancel',
                  proTip: '✅ Real airline protection • Cancel anytime for refund',
                  items: data.cfar.options.map((cfar: any) => ({
                    id: cfar.id,
                    name: cfar.name,
                    description: `${cfar.description} • ${cfar.refundPercentage || 80}% refund`,
                    price: cfar.price,
                    currency: cfar.currency,
                    selected: false,
                  })),
                });
              }

              // BAGGAGE - Real from Duffel/Amadeus with full data mapping
              if (data.baggage?.hasRealData && data.baggage?.options?.length > 0) {
                ancillaryCategories.push({
                  id: 'baggage',
                  name: 'EXTRA BAGGAGE',
                  icon: 'baggage' as const,
                  subtitle: 'Add checked bags',
                  proTip: '✅ Real airline prices • Cheaper than airport',
                  items: data.baggage.options.map((bag: any) => ({
                    id: bag.id,
                    name: bag.name,
                    description: bag.description,
                    price: bag.price,
                    currency: bag.currency,
                    selected: false,
                    // Full data mapping for AddOnsTabs UI features
                    weight: bag.weight, // {value: number, unit: string} for weight display
                    quantity: bag.quantity, // {min, max} for quantity selector
                    metadata: {
                      type: bag.metadata?.type || 'checked',
                      isReal: bag.metadata?.isReal || bag.isReal || true,
                      isMock: false,
                      perPassenger: bag.metadata?.perPassenger || true,
                      perSegment: bag.metadata?.perSegment || false,
                    },
                  })),
                });
              }

              // SEATS - Always show seat selection tab with interactive seat map button
              // Seat selection is done via the seat map modal, not individual seat options
              ancillaryCategories.push({
                id: 'seats',
                name: 'SEAT SELECTION',
                icon: 'seat' as const,
                subtitle: 'Choose your preferred seat',
                proTip: '✅ Interactive seat map • Select exact seat for each passenger',
                items: data.seats?.options?.length > 0
                  ? data.seats.options.map((seat: any) => ({
                      id: seat.id,
                      name: seat.name,
                      description: seat.description,
                      price: seat.price,
                      currency: seat.currency,
                      selected: false,
                    }))
                  : [], // Empty items - seats selected via seat map modal
              });

              // NOTE: Insurance, WiFi, Meals, Lounge, Priority are NOT available via airline APIs
              // These require third-party integrations which are not yet implemented
            }
          }
        } catch (error) {
          console.error('⚠️  Failed to fetch ancillaries, using fallback:', error);
        }

        // NO FALLBACK - Only show real data from API
        if (ancillaryCategories.length === 0) {
          console.log('ℹ️  No ancillary services available from airline API');
        } else {
          console.log(`✅ Successfully loaded ${ancillaryCategories.length} real ancillary categories`);
        }

        setAddOnCategories(ancillaryCategories);
        console.log('🎁 Ancillary categories set in state:', ancillaryCategories.length, 'categories');

        // Initialize passengers
        const passengerCount = parseInt(searchParams.get('adults') || '1');
        const initialPassengers: PassengerData[] = Array.from({ length: passengerCount }, (_, i) => ({
          id: `passenger-${i + 1}`,
          type: 'adult',
          title: '',
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          nationality: '',
        }));

        setPassengers(initialPassengers);
        console.log('👥 Initialized', passengerCount, 'passenger(s)');

        console.log('✅ ========================================');
        console.log('✅ BOOKING DATA LOADED SUCCESSFULLY');
        console.log('✅ - Fare Options:', realFares.length);
        console.log('✅ - Ancillary Categories:', ancillaryCategories.length);
        console.log('✅ - Passengers:', passengerCount);
        console.log('✅ ========================================');

        setLoading(false);
      } catch (error) {
        console.error('Error loading flight data:', error);
        router.push('/flights/results');
      }
    };

    loadFlightData();
  }, [searchParams, router]);

  // Price lock timer
  useEffect(() => {
    const interval = setInterval(() => {
      setPriceLockTimer(prev => {
        if (prev.minutes === 0 && prev.seconds === 0) {
          return prev;
        }

        if (prev.seconds === 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        }

        return { ...prev, seconds: prev.seconds - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ===========================
  // VALIDATION HELPERS
  // ===========================

  const arePassengersComplete = () => {
    return passengers.every((passenger, index) => {
      const required = ['title', 'firstName', 'lastName', 'dateOfBirth', 'nationality'];
      // PASSPORT IS OPTIONAL - Passengers can add it later even for international flights
      // This allows booking to proceed without blocking on passport details

      // First passenger must have email and phone
      if (index === 0) {
        required.push('email', 'phone');
      }
      return required.every(field => {
        const value = passenger[field as keyof PassengerData];
        return value && value.toString().trim() !== '';
      });
    });
  };

  // ===========================
  // HANDLERS
  // ===========================

  const handleFareSelect = (fareId: string) => {
    setSelectedFareId(fareId);
  };

  const handleAddOnToggle = (categoryId: string, addOnId: string, selected: boolean) => {
    setAddOnCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map(item =>
                item.id === addOnId ? { ...item, selected } : item
              ),
            }
          : cat
      )
    );
  };

  const handlePassengersUpdate = (updatedPassengers: PassengerData[]) => {
    setPassengers(updatedPassengers);
  };

  const handleViewSeatMap = async () => {
    if (!flightData) return;

    setLoadingSeatMap(true);
    try {
      console.log('📍 Fetching seat map for flight:', flightData.id);

      const response = await fetch('/api/flights/seat-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightOffer: flightData }),
      });

      const data = await response.json();

      if (data.success && data.seatMap) {
        const parsed = parseSeatMap(data.seatMap);
        if (parsed.hasRealData) {
          setSeatMapData(parsed);
          setSeatMapOpen(true);
          console.log('✅ Seat map loaded successfully');
        } else {
          console.warn('⚠️  Seat map data is not available');
          setSeatMapUnavailable(true);
        }
      } else {
        console.warn('⚠️  Seat map not available:', data.error || 'Unknown error');
        setSeatMapUnavailable(true);
      }
    } catch (error) {
      console.error('❌ Error fetching seat map:', error);
      setSeatMapUnavailable(true);
    } finally {
      setLoadingSeatMap(false);
    }
  };

  const handleSelectSeat = (selection: Seat | SeatPreference) => {
    // Handle both specific seat selection and seat preferences
    if ('type' in selection && selection.type === 'preference') {
      // User selected a seat preference (window, aisle, etc.)
      console.log('✅ Seat preference selected:', selection.position, 'Extra legroom:', selection.extraLegroom);
      // We could store preference separately, but for now just acknowledge it
      setSelectedSeat(null);
    } else {
      // User selected a specific seat
      setSelectedSeat(selection as Seat);
      console.log('✅ Seat selected:', (selection as Seat).number, 'Price:', (selection as Seat).price);
    }

    // Update add-on categories to reflect seat selection
    setAddOnCategories(prev =>
      prev.map(cat => {
        if (cat.id === 'seats') {
          return {
            ...cat,
            items: cat.items.map(item => ({
              ...item,
              selected: false, // Deselect all quick seat options when using seat map
            })),
          };
        }
        return cat;
      })
    );

    setSeatMapOpen(false);
  };

  const handleContinue = () => {
    // Validate before advancing to next step
    if (currentStep === 2 && !arePassengersComplete()) {
      toast.error('Please complete all required passenger information before continuing.', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#FEF2F2',
          color: '#991B1B',
          border: '1px solid #FCA5A5',
          padding: '16px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
      return;
    }

    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as BookingStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as BookingStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Promo code handlers
  const handlePromoApply = (code: string, discount: typeof appliedPromo) => {
    setAppliedPromo(discount);
  };

  const handlePromoRemove = () => {
    setAppliedPromo(null);
  };

  const handlePaymentSubmit = async (paymentData: any) => {
    setIsProcessing(true);

    try {
      if (!flightData) {
        throw new Error('Flight data is missing');
      }

      // Get selected fare upgrade
      const selectedFare = fareOptions.find(f => f.id === selectedFareId);
      const fareUpgrade = selectedFare ? {
        fareId: selectedFare.id,
        fareName: selectedFare.name,
        basePrice: parseFloat(flightData.price.total),
        upgradePrice: selectedFare.price - parseFloat(flightData.price.total),
        benefits: selectedFare.features, // FareOption uses 'features' property
      } : undefined;

      // For Duffel fare variants, use the originalOffer from the selected fare
      // This ensures we book the correct fare class (Basic vs Economy, etc.)
      // CRITICAL: Preserve separateTicketDetails for mixed carrier flights
      let offerToBook = selectedFare?.originalOffer || flightData;
      if (flightData?.isSeparateTickets && flightData?.separateTicketDetails) {
        offerToBook = {
          ...offerToBook,
          isSeparateTickets: true,
          separateTicketDetails: flightData.separateTicketDetails,
        };
      }

      // Get selected add-ons
      const selectedAddOns: any[] = [];
      addOnCategories.forEach(category => {
        category.items.filter(item => item.selected).forEach(item => {
          selectedAddOns.push({
            addOnId: item.id,
            category: category.name, // AddOnCategory uses 'name' property
            name: item.name,
            price: item.price,
            quantity: 1,
            details: item.description,
          });
        });
      });

      // Prepare booking request with ALL data
      // For Duffel fare variants, offerToBook contains the selected fare's original offer
      const bookingRequest = {
        flightOffer: offerToBook,
        passengers: passengers.map(p => ({
          type: p.type,
          title: p.title,
          firstName: p.firstName,
          lastName: p.lastName,
          dateOfBirth: p.dateOfBirth,
          nationality: p.nationality,
          passportNumber: p.passportNumber,
          passportExpiryDate: p.passportExpiry,
          email: p.email,
          phone: p.phone,
        })),
        payment: paymentData,
        contactInfo: {
          email: passengers[0]?.email || '',
          phone: passengers[0]?.phone || '', // FIX: Was using email instead of phone
        },
        fareUpgrade, // Include fare upgrade if selected
        addOns: selectedAddOns, // Include all add-ons
        seats: [], // Seat selection will be added later
        // Promo code discount
        promoCode: appliedPromo ? {
          code: appliedPromo.code,
          type: appliedPromo.type,
          value: appliedPromo.value,
          discountAmount: appliedPromo.discountAmount,
        } : undefined,
      };

      // Call the booking API
      const response = await fetch('/api/flights/booking/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingRequest),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Booking API error response:', errorData);

        // CRITICAL: Handle OFFER_EXPIRED with smart recovery modal
        if (errorData.error === 'OFFER_EXPIRED' || errorData.message?.includes('expired')) {
          setShowExpiredModal(true);
          setIsProcessing(false);
          return; // Don't throw - modal will handle recovery
        }

        // Show detailed error info for debugging
        const debugInfo = errorData.debugMessage ? ` (Debug: ${errorData.debugMessage})` : '';
        const message = errorData.message || errorData.error || 'Booking failed. Please try again or contact support.';
        throw new Error(message + debugInfo);
      }

      const result = await response.json();

      // Redirect to confirmation with booking ID
      router.push(`/flights/booking/confirmation?bookingId=${result.booking.id}&ref=${result.booking.bookingReference}`);
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(error.message || 'There was an error processing your booking. Please try again.', {
        duration: 8000,
        position: 'top-center',
        style: {
          background: '#FEF2F2',
          color: '#991B1B',
          border: '1px solid #FCA5A5',
          padding: '16px 20px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500',
          maxWidth: '90vw',
          textAlign: 'center',
        },
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // ===========================
  // PRICE CALCULATION
  // ===========================

  const calculateTotalPrice = () => {
    if (!flightData) return 0;

    const selectedFare = fareOptions.find(f => f.id === selectedFareId);
    const farePrice = selectedFare?.price || parseFloat(flightData.price.total);

    const addOnsPrice = addOnCategories.reduce((total, category) => {
      return total + category.items.filter(item => item.selected).reduce((sum, item) => sum + item.price, 0);
    }, 0);

    return farePrice + addOnsPrice;
  };

  const getPriceBreakdown = () => {
    if (!flightData) return { farePrice: 0, addOns: [], taxesAndFees: 0 };

    const selectedFare = fareOptions.find(f => f.id === selectedFareId);

    // CRITICAL FIX: When a fare is selected, use its priceDetails for accurate breakdown
    // selectedFare.price is the TOTAL (includes taxes/fees already)
    // priceDetails has: total, base, fees - use these for proper breakdown
    const priceDetails = selectedFare?.priceDetails;

    let basePrice = 0;
    let taxesAndFeesAmount = 0;
    let totalPrice = 0;

    if (priceDetails) {
      // Fare has price breakdown - use it directly
      totalPrice = parseFloat(String(priceDetails.total || priceDetails.grandTotal || 0));
      basePrice = parseFloat(String(priceDetails.base || 0));

      // Method 1: Use fees array if available
      if (priceDetails.fees && Array.isArray(priceDetails.fees) && priceDetails.fees.length > 0) {
        taxesAndFeesAmount = priceDetails.fees.reduce((sum: number, fee: any) => sum + parseFloat(String(fee.amount || 0)), 0);
      }
      // Method 2: Calculate from base if fees not available
      else if (basePrice > 0) {
        taxesAndFeesAmount = Math.max(0, totalPrice - basePrice);
      }
    } else if (selectedFare) {
      // Fare selected but no priceDetails - use price as total with 0 taxes
      // (already broken down at display level)
      totalPrice = selectedFare.price;
      basePrice = selectedFare.price;
      taxesAndFeesAmount = 0;
      console.warn(`⚠️ Selected fare #${selectedFare.id} missing price breakdown`);
    } else {
      // No fare selected - use flight data
      const flightPrice = flightData.price;
      totalPrice = parseFloat(String(flightPrice.total || 0));
      basePrice = parseFloat(String(flightPrice.base || 0));

      if (flightPrice.fees && Array.isArray(flightPrice.fees) && flightPrice.fees.length > 0) {
        taxesAndFeesAmount = flightPrice.fees.reduce((sum: number, fee: any) => sum + parseFloat(String(fee.amount || 0)), 0);
      } else if (basePrice > 0) {
        taxesAndFeesAmount = Math.max(0, totalPrice - basePrice);
      }
    }

    const farePrice = basePrice;
    const taxesAndFees = taxesAndFeesAmount;

    const addOns: { label: string; amount: number; subtext?: string }[] = [];

    // Add individual add-ons
    addOnCategories.forEach(category => {
      category.items.filter(item => item.selected).forEach(item => {
        addOns.push({
          label: item.name,
          amount: item.price,
        });
      });
    });

    return { farePrice, addOns, taxesAndFees };
  };

  // ===========================
  // RENDER
  // ===========================

  if (loading || !flightData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your flight...</p>
        </div>
      </div>
    );
  }

  const { farePrice, addOns, taxesAndFees } = getPriceBreakdown();
  const totalPrice = farePrice + addOns.reduce((sum, item) => sum + item.amount, 0) + taxesAndFees;

  return (
    <div className="min-h-screen bg-gray-50 pb-16 sm:pb-0">
      {/* Header - Auto-hides on scroll down (Phase 8 Track 2B.1) */}
      <div
        className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm"
        style={{
          transform: scrollDirection === 'down' && !isAtTop ? 'translateY(-100%)' : 'translateY(0)',
          transition: 'transform 300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
          willChange: 'transform',
        }}
      >
        <div className="max-w-7xl mx-auto px-0 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-3 px-2 sm:px-0">
              {/* Back to Search Results Button */}
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                aria-label="Go back to search results"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Results</span>
              </button>
              <div className="h-6 w-px bg-gray-200 hidden sm:block" />
              <Plane className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500" />
              <h1 className="text-sm sm:text-xl font-bold text-gray-900">Complete Booking</h1>
            </div>

            {/* Progress Steps - Compact on mobile */}
            <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-0">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center gap-1 sm:gap-2">
                  <div
                    className={`
                      w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all
                      ${currentStep >= step
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                      }
                    `}
                  >
                    {step}
                  </div>
                  {step < 3 && <div className={`w-4 sm:w-12 h-1 ${currentStep > step ? 'bg-primary-500' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>
          </div>

          {/* Step Labels - Hidden on mobile */}
          <div className="hidden sm:flex justify-between mt-2 text-xs font-medium">
            <span className={currentStep === 1 ? 'text-primary-600' : 'text-gray-500'}>Customize Flight</span>
            <span className={currentStep === 2 ? 'text-primary-600' : 'text-gray-500'}>Traveler Details</span>
            <span className={currentStep === 3 ? 'text-primary-600' : 'text-gray-500'}>Review & Pay</span>
          </div>

          {/* Offer Countdown Timer - Shows warning when close to expiration */}
          {flightData?.source === 'Duffel' && (
            <div className="mt-2 px-2 sm:px-0">
              <OfferCountdown
                offerId={flightData?.id || ''}
                createdAt={offerCreatedAt}
                onExpired={() => setShowExpiredModal(true)}
                onRefresh={async () => {
                  // Trigger refresh via modal
                  setShowExpiredModal(true);
                }}
                className="always"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-1 sm:px-4 py-2 sm:py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-1 sm:gap-4">
          {/* Left Column: Steps */}
          <div className="lg:col-span-2 space-y-1 sm:space-y-4">
            {/* STEP 1: Customize Flight */}
            {currentStep === 1 && (
              <div className="space-y-0 sm:space-y-4 animate-fadeIn">
                {/* Premium Flight Confirmation Card */}
                {flightData && (() => {
                  const airline = flightData.validatingAirlineCodes?.[0] || flightData.itineraries?.[0]?.segments?.[0]?.carrierCode || 'XX';
                  const airlineData = getAirlineData(airline);
                  const outbound = flightData.itineraries?.[0];
                  const inbound = flightData.itineraries?.[1];
                  const flightNum = outbound?.segments?.[0]?.number?.replace(/^[A-Z]{2}\s*/, '') || '';

                  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                  const parseDuration = (duration: string) => {
                    const match = duration?.match(/PT(\d+H)?(\d+M)?/);
                    if (!match) return '';
                    const hours = match[1] ? match[1].replace('H', 'h ') : '';
                    const minutes = match[2] ? match[2].replace('M', 'm') : '';
                    return `${hours}${minutes}`.trim();
                  };
                  const getStopsInfo = (segments: any[]) => {
                    const stops = segments?.length - 1 || 0;
                    return { count: stops, text: stops === 0 ? 'Direct' : `${stops} stop${stops > 1 ? 's' : ''}` };
                  };

                  return (
                    <div className="bg-white rounded-none sm:rounded-xl border-0 sm:border border-gray-200 shadow-none sm:shadow-lg overflow-hidden">
                      {/* Premium Header with Gradient - Compact on mobile */}
                      <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 px-3 sm:px-4 py-2 sm:py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="bg-white/20 backdrop-blur-sm rounded p-1 sm:rounded-lg sm:p-1.5">
                              <AirlineLogo code={airline} size="sm" className="sm:w-8 sm:h-8 shadow-md" />
                            </div>
                            <div className="text-white">
                              <div className="font-bold text-sm sm:text-lg truncate max-w-[120px] sm:max-w-none">{airlineData.name}</div>
                              <div className="text-white/80 text-[10px] sm:text-xs flex items-center gap-1 sm:gap-2">
                                <span className="truncate">{airline} {flightNum}</span>
                                <span className="hidden sm:flex items-center gap-0.5">
                                  <Star className="w-3 h-3 fill-yellow-300 text-yellow-300" />
                                  <span>{airlineData.rating}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-1.5 bg-green-500 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold shadow-md">
                            <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Selected</span>
                            <span className="sm:hidden">✓</span>
                          </div>
                        </div>
                      </div>

                      {/* Flight Details - Compact on mobile */}
                      <div className="p-3 sm:p-4 space-y-2 sm:space-y-4">
                        {/* Outbound Flight */}
                        <div className="relative">
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 sm:w-1 bg-gradient-to-b from-primary-500 to-primary-300 rounded-full" />
                          <div className="pl-2 sm:pl-4">
                            <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                              <span className="text-[8px] sm:text-[10px] font-bold text-primary-600 uppercase tracking-wider bg-primary-50 px-1.5 sm:px-2 py-0.5 rounded">
                                Outbound
                              </span>
                              <span className="text-[10px] sm:text-xs text-gray-500">{formatDate(outbound?.segments?.[0]?.departure?.at)}</span>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3">
                              {/* Departure */}
                              <div className="text-center min-w-[50px] sm:min-w-[70px]">
                                <div className="text-base sm:text-xl font-bold text-gray-900">{formatTime(outbound?.segments?.[0]?.departure?.at)}</div>
                                <div className="text-[10px] sm:text-xs font-semibold text-gray-600">{outbound?.segments?.[0]?.departure?.iataCode}</div>
                                <div className="hidden sm:block text-[10px] text-gray-400 truncate max-w-[80px]">{formatCityCode(outbound?.segments?.[0]?.departure?.iataCode)}</div>
                              </div>

                              {/* Flight Path Visualization */}
                              <div className="flex-1 px-1 sm:px-2">
                                <div className="relative">
                                  <div className="h-[2px] bg-gradient-to-r from-primary-400 via-primary-500 to-primary-400 rounded-full" />
                                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <div className="bg-white border-2 border-primary-500 rounded-full p-0.5 sm:p-1 shadow-md">
                                      <Plane className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-600 rotate-90" />
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-center gap-1 sm:gap-2 mt-1 sm:mt-1.5">
                                  <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400" />
                                  <span className="text-[10px] sm:text-xs text-gray-500">{parseDuration(outbound?.duration)}</span>
                                  <span className={`text-[8px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded-full ${
                                    getStopsInfo(outbound?.segments).count === 0
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-orange-100 text-orange-700'
                                  }`}>
                                    {getStopsInfo(outbound?.segments).text}
                                  </span>
                                </div>
                              </div>

                              {/* Arrival */}
                              <div className="text-center min-w-[50px] sm:min-w-[70px]">
                                <div className="text-base sm:text-xl font-bold text-gray-900">{formatTime(outbound?.segments?.[outbound?.segments?.length - 1]?.arrival?.at)}</div>
                                <div className="text-[10px] sm:text-xs font-semibold text-gray-600">{outbound?.segments?.[outbound?.segments?.length - 1]?.arrival?.iataCode}</div>
                                <div className="hidden sm:block text-[10px] text-gray-400 truncate max-w-[80px]">{formatCityCode(outbound?.segments?.[outbound?.segments?.length - 1]?.arrival?.iataCode)}</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Return Flight (if round trip) */}
                        {inbound && (
                          <div className="relative">
                            <div className="absolute left-0 top-0 bottom-0 w-0.5 sm:w-1 bg-gradient-to-b from-secondary-500 to-secondary-300 rounded-full" />
                            <div className="pl-2 sm:pl-4">
                              <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                                <span className="text-[8px] sm:text-[10px] font-bold text-secondary-600 uppercase tracking-wider bg-secondary-50 px-1.5 sm:px-2 py-0.5 rounded">
                                  Return
                                </span>
                                <span className="text-[10px] sm:text-xs text-gray-500">{formatDate(inbound?.segments?.[0]?.departure?.at)}</span>
                              </div>

                              <div className="flex items-center gap-2 sm:gap-3">
                                {/* Departure */}
                                <div className="text-center min-w-[50px] sm:min-w-[70px]">
                                  <div className="text-base sm:text-xl font-bold text-gray-900">{formatTime(inbound?.segments?.[0]?.departure?.at)}</div>
                                  <div className="text-[10px] sm:text-xs font-semibold text-gray-600">{inbound?.segments?.[0]?.departure?.iataCode}</div>
                                  <div className="hidden sm:block text-[10px] text-gray-400 truncate max-w-[80px]">{formatCityCode(inbound?.segments?.[0]?.departure?.iataCode)}</div>
                                </div>

                                {/* Flight Path Visualization */}
                                <div className="flex-1 px-1 sm:px-2">
                                  <div className="relative">
                                    <div className="h-[2px] bg-gradient-to-r from-secondary-400 via-secondary-500 to-secondary-400 rounded-full" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                      <div className="bg-white border-2 border-secondary-500 rounded-full p-0.5 sm:p-1 shadow-md">
                                        <Plane className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-secondary-600 -rotate-90" />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-center gap-1 sm:gap-2 mt-1 sm:mt-1.5">
                                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400" />
                                    <span className="text-[10px] sm:text-xs text-gray-500">{parseDuration(inbound?.duration)}</span>
                                    <span className={`text-[8px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded-full ${
                                      getStopsInfo(inbound?.segments).count === 0
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-orange-100 text-orange-700'
                                    }`}>
                                      {getStopsInfo(inbound?.segments).text}
                                    </span>
                                  </div>
                                </div>

                                {/* Arrival */}
                                <div className="text-center min-w-[50px] sm:min-w-[70px]">
                                  <div className="text-base sm:text-xl font-bold text-gray-900">{formatTime(inbound?.segments?.[inbound?.segments?.length - 1]?.arrival?.at)}</div>
                                  <div className="text-[10px] sm:text-xs font-semibold text-gray-600">{inbound?.segments?.[inbound?.segments?.length - 1]?.arrival?.iataCode}</div>
                                  <div className="hidden sm:block text-[10px] text-gray-400 truncate max-w-[80px]">{formatCityCode(inbound?.segments?.[inbound?.segments?.length - 1]?.arrival?.iataCode)}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Fare Selection */}
                <div className="bg-white rounded-none sm:rounded-lg border-0 sm:border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-3 sm:px-3 py-2 sm:py-3 text-white">
                    <h2 className="text-sm sm:text-base font-bold flex items-center gap-1.5 sm:gap-2">
                      ✈️ Choose Your Fare
                    </h2>
                  </div>
                  <div className="p-3 sm:p-4">
                    <FareSelector
                      fares={fareOptions}
                      selectedFareId={selectedFareId}
                      onSelect={handleFareSelect}
                      mlRecommendation="standard"
                    />
                  </div>
                </div>

                {/* Individual Add-Ons - Real airline services only */}
                <div className="bg-white rounded-none sm:rounded-lg border-0 sm:border border-gray-200 overflow-hidden shadow-none sm:shadow-sm">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-3 sm:px-3 py-2 sm:py-3 text-white">
                    <h3 className="text-sm sm:text-base font-bold flex items-center gap-1.5 sm:gap-2">
                      🎯 Add-Ons
                    </h3>
                  </div>
                  <div className="p-3 sm:p-4">
                    <AddOnsTabs
                      categories={addOnCategories}
                      onAddOnToggle={handleAddOnToggle}
                      onViewSeatMap={handleViewSeatMap}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Passenger Details */}
            {currentStep === 2 && (
              <div className="space-y-1 sm:space-y-4 animate-fadeIn">
                <div className="bg-white rounded-lg sm:rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-3 sm:px-3 py-2 sm:py-3 text-white">
                    <h2 className="text-sm sm:text-base font-bold flex items-center gap-1.5 sm:gap-2">
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                      Traveler Information
                    </h2>
                  </div>
                  <div className="p-0 sm:p-4">
                    <CompactPassengerForm
                      passengers={passengers}
                      isInternational={isInternationalRoute(flightData.search.from, flightData.search.to)}
                      onUpdate={handlePassengersUpdate}
                    />
                  </div>
                </div>

                {/* Validation Helper Message */}
                {!arePassengersComplete() && (
                  <div className="bg-warning-50 border-0 sm:border border-warning-300 rounded-none sm:rounded-lg p-3 sm:p-3 mx-3 sm:mx-0">
                    <div className="flex items-start gap-1.5 sm:gap-2">
                      <span className="text-warning-600 text-base sm:text-lg">⚠️</span>
                      <div className="flex-1">
                        <h4 className="text-xs sm:text-sm font-bold text-warning-900 mb-0.5 sm:mb-1">
                          Complete Required Information
                        </h4>
                        <p className="text-[10px] sm:text-xs text-warning-800">
                          Please fill in all required fields (marked with *) for each passenger before continuing to payment.
                          The first passenger must include contact email and phone number.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: Review & Pay */}
            {currentStep === 3 && (
              <div className="animate-fadeIn space-y-4">
                {/* Promo Code Section */}
                <PromoCodeSection
                  totalPrice={totalPrice}
                  currency={userCurrency}
                  productType="flight"
                  onApply={handlePromoApply}
                  onRemove={handlePromoRemove}
                  appliedDiscount={appliedPromo}
                />

                <ReviewAndPay
                  flightSummary={{
                    route: `${flightData.search.from} → ${flightData.search.to}`,
                    date: new Date(flightData.search.departure).toLocaleDateString(),
                    airline: flightData.validatingAirlineCodes?.[0] || 'Airline',
                    fareClass: fareOptions.find(f => f.id === selectedFareId)?.name || 'Standard',
                    passengers: passengers.length,
                  }}
                  totalPrice={appliedPromo ? totalPrice - appliedPromo.discountAmount : totalPrice}
                  currency={userCurrency}
                  onSubmit={handlePaymentSubmit}
                  isProcessing={isProcessing}
                  requiresDOTCompliance={selectedFareId === 'basic'}
                  formId="payment-form"
                />
              </div>
            )}

            {/* Navigation Buttons - Compact on mobile */}
            <div className="flex items-center justify-between gap-2 px-3 sm:px-0 py-3 sm:py-0">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`
                  flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg font-semibold transition-all text-xs sm:text-sm
                  ${currentStep === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-95'
                  }
                `}
              >
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>

              {currentStep < 3 && (
                <button
                  onClick={handleContinue}
                  disabled={currentStep === 2 && !arePassengersComplete()}
                  className={`
                    flex items-center gap-1 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm shadow-md transition-all
                    ${currentStep === 2 && !arePassengersComplete()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 hover:shadow-lg active:scale-95'
                    }
                  `}
                >
                  Continue
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Summary */}
          <div className="lg:col-span-1">
            <StickySummary
              flight={{
                from: flightData.search.from,
                to: flightData.search.to,
                date: flightData.search.departure,
                passengers: {
                  adults: passengers.length,
                  children: 0,
                  infants: 0,
                },
                class: flightData.search.class || 'economy',
              }}
              currency={userCurrency}
              farePrice={farePrice}
              addOns={addOns}
              taxesAndFees={taxesAndFees}
              onContinue={currentStep < 3 ? handleContinue : undefined}
              pricelock={priceLockTimer}
              urgency={{
                viewingCount: 47,
                mlPriceTrend: 'rising',
                mlPrediction: 9,
              }}
              continueButtonText={
                currentStep === 1 ? 'Continue to Details →' :
                currentStep === 2 ? 'Continue to Payment →' :
                'Review & Pay'
              }
              continueButtonDisabled={currentStep === 2 ? !arePassengersComplete() : currentStep === 3}
              formId={currentStep === 3 ? 'payment-form' : undefined}
              isProcessing={isProcessing}
              // Promo code - available at all steps
              appliedPromo={appliedPromo}
              onApplyPromo={handlePromoApply}
              onRemovePromo={handlePromoRemove}
            />
          </div>
        </div>
      </div>

      {/* Seat Map Modal */}
      {seatMapData && (
        <SeatMapModal
          isOpen={seatMapOpen}
          onClose={() => setSeatMapOpen(false)}
          seatMap={seatMapData}
          onSelectSeat={handleSelectSeat}
        />
      )}

      {/* Premium Seat Map Unavailable Modal - Apple-Class Design */}
      {seatMapUnavailable && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          {/* Backdrop with blur */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSeatMapUnavailable(false)}
          />

          {/* Modal Card - Glass morphism */}
          <div className="relative w-full sm:w-[420px] mx-4 mb-4 sm:mb-0 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            {/* Gradient accent bar */}
            <div className="h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" />

            {/* Content */}
            <div className="p-6 sm:p-8">
              {/* Icon with gradient background */}
              <div className="flex justify-center mb-5">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center shadow-inner">
                    <Armchair className="w-10 h-10 text-amber-500" strokeWidth={1.5} />
                  </div>
                  {/* Info badge */}
                  <div className="absolute -top-1 -right-1 w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                    <Info className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-2">
                Seat Map Unavailable
              </h3>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-gray-500 text-center mb-6 leading-relaxed">
                This airline doesn't provide interactive seat maps through our booking system.
              </p>

              {/* Feature card */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 mb-6 border border-emerald-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-900 text-sm sm:text-base">Good News!</p>
                    <p className="text-emerald-700 text-xs sm:text-sm mt-0.5">
                      You can still select your preferred seat type — window, aisle, or extra legroom — from the options above.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action button */}
              <button
                onClick={() => setSeatMapUnavailable(false)}
                className="w-full py-4 bg-gradient-to-r from-[#E63946] to-[#D62839] text-white font-semibold rounded-2xl shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 active:scale-[0.98] transition-all duration-200"
              >
                Got It
              </button>

              {/* Subtle close hint */}
              <p className="text-xs text-gray-400 text-center mt-4">
                Tap outside to dismiss
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={() => setSeatMapUnavailable(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      )}

      {/* Offer Expired Modal - Smart Recovery */}
      <OfferExpiredModal
        isOpen={showExpiredModal}
        onClose={() => setShowExpiredModal(false)}
        searchParams={{
          origin: flightData?.search?.from || '',
          destination: flightData?.search?.to || '',
          departureDate: flightData?.search?.departure || '',
          returnDate: flightData?.search?.return,
          // Use URL params for passenger counts (passengers array may be empty if modal shows early)
          adults: parseInt(searchParams.get('adults') || '1', 10),
          children: parseInt(searchParams.get('children') || '0', 10),
          infants: parseInt(searchParams.get('infants') || '0', 10),
        }}
        originalOffer={{
          id: flightData?.id || '',
          price: parseFloat(flightData?.price?.total || '0'),
          airline: flightData?.validatingAirlineCodes?.[0],
          departureTime: flightData?.itineraries?.[0]?.segments?.[0]?.departure?.at,
        }}
        onRefreshed={(newOffer) => {
          // Update flight data with fresh offer and reset timestamp
          // CRITICAL: Use ACTUAL expires_at from Duffel, NOT a calculated value!
          const duffelExpiresAt = newOffer.expires_at
            ? new Date(newOffer.expires_at).getTime()
            : newOffer.lastTicketingDateTime
              ? new Date(newOffer.lastTicketingDateTime).getTime()
              : Date.now() + (25 * 60 * 1000); // Fallback only if no Duffel timestamp

          const updatedFlight = {
            ...flightData,
            ...newOffer,
            id: newOffer.id,
            price: newOffer.price,
            _storedAt: Date.now(),
            _offerExpiresAt: duffelExpiresAt,
          };
          setFlightData(updatedFlight);
          setOfferCreatedAt(Date.now());

          // Save updated flight to sessionStorage
          const flightId = searchParams.get('flightId');
          if (flightId) {
            sessionStorage.setItem(`flight_${flightId}`, JSON.stringify(updatedFlight));
          }

          toast.success('Price updated! You can continue booking.');
        }}
      />

    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    }>
      <BookingPageContent />
    </Suspense>
  );
}
