'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Plane, ChevronLeft, ChevronRight, ArrowLeft, Loader2, User, Clock, CheckCircle2, Star, Home } from 'lucide-react';
import { formatCityCode } from '@/lib/data/airports';
import { FareSelector } from '@/components/booking/FareSelector';
import { AddOnsTabs } from '@/components/booking/AddOnsTabs';
import { getAirlineData } from '@/lib/flights/airline-data';
import AirlineLogo from '@/components/flights/AirlineLogo';
import { StickySummary } from '@/components/booking/StickySummary';
import { CompactPassengerForm } from '@/components/booking/CompactPassengerForm';
import { ReviewAndPay } from '@/components/booking/ReviewAndPay';
import SeatMapModal, { type SeatPreference } from '@/components/flights/SeatMapModal';
import { parseSeatMap, type ParsedSeatMap, type Seat } from '@/lib/flights/seat-map-parser';
import { AIRPORTS } from '@/lib/data/airports';
import { useScrollDirection } from '@/lib/hooks/useScrollDirection';

// ===========================
// TYPE DEFINITIONS
// ===========================

type BookingStep = 1 | 2 | 3;

interface FareOption {
  id: string;
  name: string;
  price: number;
  currency: string;
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

  // Price tracking
  const [priceLockTimer, setPriceLockTimer] = useState({ minutes: 10, seconds: 0 });

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

          realFares = flight.fareVariants.map((variant: any, index: number) => ({
            id: variant.id,
            name: variant.name || 'Economy Standard',
            price: variant.price,
            currency: variant.currency || 'USD',
            features: variant.features || ['Economy seat', 'Carry-on included'],
            restrictions: variant.restrictions || undefined, // Include restrictions from search API
            positives: variant.positives || undefined, // Include positive policies (Free changes, Refundable)
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

                // Transform Amadeus fare families to our FareOption interface
                realFares = upsellingData.fareOptions.map((fareOffer: any, index: number) => {
                  const fareDetails = fareOffer.travelerPricings?.[0]?.fareDetailsBySegment?.[0];
                  const fareBasis = fareDetails?.fareBasis || '';
                  const brandedFare = fareDetails?.brandedFare || '';
                  const cabin = fareDetails?.cabin || 'ECONOMY';

                  // Extract baggage info
                  const baggage = fareDetails?.includedCheckedBags?.quantity || 0;

                  // Map cabin class to display-friendly name
                  const cabinDisplayName: Record<string, string> = {
                    'ECONOMY': 'Economy',
                    'PREMIUM_ECONOMY': 'Premium Economy',
                    'BUSINESS': 'Business',
                    'FIRST': 'First Class',
                  };
                  const cabinPrefix = cabinDisplayName[cabin] || 'Economy';

                  // Determine fare type from branded fare
                  let fareType = '';
                  const brandedFareUpper = (brandedFare || '').toUpperCase();
                  if (brandedFareUpper.includes('BASIC') || brandedFareUpper.includes('LIGHT') || brandedFareUpper.includes('SAVER')) {
                    fareType = 'Basic';
                  } else if (brandedFareUpper.includes('FLEX') || brandedFareUpper.includes('FLEXI') || brandedFareUpper.includes('FULL')) {
                    fareType = 'Flex';
                  } else if (brandedFareUpper.includes('PREMIUM') || brandedFareUpper.includes('PLUS')) {
                    fareType = 'Plus';
                  } else if (index === 0) {
                    fareType = 'Basic';
                  } else if (index === upsellingData.fareOptions.length - 1 && cabin === 'ECONOMY') {
                    fareType = 'Flex';
                  } else {
                    fareType = 'Standard';
                  }

                  // Combine cabin class + fare type for clear display
                  // e.g., "Economy Basic", "Premium Economy Standard", "Business Flex"
                  const fareName = cabin === 'FIRST' ? 'First Class' : `${cabinPrefix} ${fareType}`;

                  // Build features list from fare details
                  const features: string[] = [];

                  // Baggage
                  if (baggage === 0) features.push('Carry-on only');
                  else if (baggage === 1) features.push('Carry-on + 1 checked bag');
                  else if (baggage >= 2) features.push(`Carry-on + ${baggage} checked bags`);

                  // Cabin class
                  if (cabin === 'BUSINESS') {
                    features.push('Business class seat');
                    features.push('Priority boarding');
                    features.push('Lounge access');
                    features.push('Premium meals & drinks');
                  } else if (cabin === 'FIRST') {
                    features.push('First class suite');
                    features.push('Priority everything');
                    features.push('Lounge access');
                    features.push('Gourmet meals & champagne');
                  } else if (cabin === 'PREMIUM_ECONOMY') {
                    features.push('Premium economy seat');
                    features.push('Extra legroom');
                    features.push('Priority boarding');
                  } else {
                    features.push('Economy seat');
                  }

                  // Build restrictions and positives lists based on fare type
                  const restrictions: string[] = [];
                  const positives: string[] = [];

                  // Add policies based on fare type - positives in green, restrictions in red
                  if (fareType === 'Flex' || fareType === 'Plus') {
                    positives.push('Free changes');
                    positives.push('Fully refundable');
                  } else if (fareType === 'Standard') {
                    positives.push('Changes allowed (+fee)');
                    restrictions.push('Non-refundable');
                  } else if (fareType === 'Basic') {
                    features.push('Seat assignment fee');
                    restrictions.push('No changes allowed');
                    restrictions.push('Non-refundable');
                  }

                  return {
                    id: fareOffer.id || `fare-${index}`,
                    name: fareName,
                    price: parseFloat(fareOffer.price.total),
                    currency: fareOffer.price.currency,
                    features: features.slice(0, 5), // Limit to 5 features for UI
                    restrictions: restrictions.length > 0 ? restrictions : undefined,
                    positives: positives.length > 0 ? positives : undefined, // Positive policies in green
                    recommended: index === 1, // Second option usually best value
                    popularityPercent: index === 0 ? 26 : index === 1 ? 74 : index === 2 ? 18 : 4,
                  };
                });

                setSelectedFareId(realFares[1]?.id || realFares[0]?.id); // Default to second option (best value)
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
          alert('Interactive seat map is not available for this airline.\n\nYou can still select your preferred seat type (aisle, window, extra legroom) from the options above.');
        }
      } else {
        console.warn('⚠️  Seat map not available:', data.error || 'Unknown error');
        alert('Interactive seat map is not available for this airline.\n\nYou can still select your preferred seat type (aisle, window, extra legroom) from the options above.');
      }
    } catch (error) {
      console.error('❌ Error fetching seat map:', error);
      alert('Interactive seat map is not available for this airline.\n\nYou can still select your preferred seat type (aisle, window, extra legroom) from the options above.');
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
      alert('Please complete all required passenger information before continuing.');
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
      const offerToBook = selectedFare?.originalOffer || flightData;

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
          phone: passengers[0]?.email || '',
        },
        fareUpgrade, // Include fare upgrade if selected
        addOns: selectedAddOns, // Include all add-ons
        seats: [], // Seat selection will be added later
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Booking failed');
      }

      const result = await response.json();

      // Redirect to confirmation with booking ID
      router.push(`/flights/booking/confirmation?bookingId=${result.booking.id}&ref=${result.booking.bookingReference}`);
    } catch (error: any) {
      console.error('Booking error:', error);
      alert(error.message || 'There was an error processing your booking. Please try again.');
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
    // IMPORTANT: farePrice from API ALREADY includes all taxes and fees (DOT-compliant all-in pricing)
    const farePrice = selectedFare?.price || parseFloat(flightData.price.total);

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

    // CRITICAL FIX: DO NOT add additional taxes on top of fare price!
    // The farePrice from Duffel/Amadeus API already includes all taxes and fees.
    // Adding 14% was causing DOUBLE-TAXATION (showing $1000 flight as $1140).
    // Only add-ons need tax calculation (if applicable)
    const addOnsSubtotal = addOns.reduce((sum, item) => sum + item.amount, 0);
    const taxesAndFees = 0; // Taxes already included in farePrice

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
              <div className="animate-fadeIn">
                <ReviewAndPay
                  flightSummary={{
                    route: `${flightData.search.from} → ${flightData.search.to}`,
                    date: new Date(flightData.search.departure).toLocaleDateString(),
                    airline: flightData.validatingAirlineCodes?.[0] || 'Airline',
                    fareClass: fareOptions.find(f => f.id === selectedFareId)?.name || 'Standard',
                    passengers: passengers.length,
                  }}
                  totalPrice={totalPrice}
                  currency={flightData.price.currency}
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
              currency={flightData.price.currency}
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
