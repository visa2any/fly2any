'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Plane, ChevronLeft, ChevronRight, Loader2, User } from 'lucide-react';
import { FareSelector } from '@/components/booking/FareSelector';
import { AddOnsTabs } from '@/components/booking/AddOnsTabs';
import { getAirlineData } from '@/lib/flights/airline-data';
import AirlineLogo from '@/components/flights/AirlineLogo';
import { StickySummary } from '@/components/booking/StickySummary';
import { CompactPassengerForm } from '@/components/booking/CompactPassengerForm';
import { ReviewAndPay } from '@/components/booking/ReviewAndPay';
import SeatMapModal from '@/components/flights/SeatMapModal';
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
  recommended?: boolean;
  popularityPercent?: number;
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
  const [isReturningCustomer, setIsReturningCustomer] = useState(false);

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
        // FETCH REAL BRANDED FARES FROM AMADEUS API
        // ===========================
        console.log('🎫 Fetching branded fares from Amadeus API...');

        let realFares: FareOption[] = [];

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

                // Determine fare name from branded fare or cabin
                let fareName = brandedFare || cabin;
                if (fareName.includes('BASIC')) fareName = 'BASIC';
                else if (fareName.includes('ECONOMY') && index === 0) fareName = 'BASIC';
                else if (fareName.includes('FLEX') || fareName.includes('FLEXI')) fareName = 'FLEX';
                else if (fareName.includes('BUSINESS')) fareName = 'BUSINESS';
                else if (fareName.includes('FIRST')) fareName = 'FIRST CLASS';
                else if (index === 0) fareName = 'BASIC';
                else if (index === upsellingData.fareOptions.length - 1) fareName = 'PREMIUM';
                else fareName = 'STANDARD';

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

                // Add generic benefits based on fare type
                if (fareName === 'FLEX' || fareName === 'PREMIUM') {
                  features.push('Free changes');
                  features.push('Refundable (-25% fee)');
                } else if (fareName === 'STANDARD') {
                  features.push('Changes allowed (+fee)');
                } else if (fareName === 'BASIC') {
                  features.push('Seat assignment fee');
                  features.push('No changes');
                  features.push('No refunds');
                }

                return {
                  id: fareOffer.id || `fare-${index}`,
                  name: fareName,
                  price: parseFloat(fareOffer.price.total),
                  currency: fareOffer.price.currency,
                  features: features.slice(0, 5), // Limit to 5 features for UI
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

              // BAGGAGE - Real from Duffel/Amadeus
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
                    description: bag.weight ? `${bag.description} (${bag.weight}kg)` : bag.description,
                    price: bag.price,
                    currency: bag.currency,
                    selected: false,
                  })),
                });
              }

              // SEATS - Real from Duffel seat map
              if (data.seats?.hasRealData && data.seats?.options?.length > 0) {
                ancillaryCategories.push({
                  id: 'seats',
                  name: 'SEAT SELECTION',
                  icon: 'seat' as const,
                  subtitle: 'Choose your seat',
                  proTip: '✅ Real seat availability • Interactive seat map available',
                  items: data.seats.options.map((seat: any) => ({
                    id: seat.id,
                    name: seat.name,
                    description: seat.description,
                    price: seat.price,
                    currency: seat.currency,
                    selected: false,
                  })),
                });
              }

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
      if (isInternationalRoute(flightData?.search?.from || '', flightData?.search?.to || '')) {
        required.push('passportNumber', 'passportExpiry');
      }
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

  const handlePassengersUpdate = async (updatedPassengers: PassengerData[]) => {
    setPassengers(updatedPassengers);

    // Check if first passenger has email and check returning customer status
    const firstPassengerEmail = updatedPassengers[0]?.email;
    if (firstPassengerEmail && firstPassengerEmail.includes('@')) {
      try {
        const response = await fetch(`/api/customer/returning-status?email=${encodeURIComponent(firstPassengerEmail)}`);
        if (response.ok) {
          const data = await response.json();
          setIsReturningCustomer(data.isReturning || false);
        }
      } catch (error) {
        // Silently fail - assume not returning customer
        setIsReturningCustomer(false);
      }
    }
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

  const handleSelectSeat = (seat: Seat) => {
    setSelectedSeat(seat);

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
    console.log('✅ Seat selected:', seat.number, 'Price:', seat.price);
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
      const bookingRequest = {
        flightOffer: flightData,
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
  // MOCK DATA (will be moved to API)
  // ===========================

  const mockFares: FareOption[] = [
    {
      id: 'basic',
      name: 'BASIC',
      price: flightData ? parseFloat(flightData.price.total) * 0.85 : 239,
      currency: flightData?.price.currency || 'USD',
      features: ['Carry-on only', 'Seat assignment fee', 'No refunds', 'No changes'],
      restrictions: ['No carry-on bag', 'Basic seat'],
      popularityPercent: 26,
    },
    {
      id: 'standard',
      name: 'STANDARD',
      price: flightData ? parseFloat(flightData.price.total) : 289,
      currency: flightData?.price.currency || 'USD',
      features: ['Carry-on + 1 bag', 'Standard seat', 'Changes allowed (+fee)', 'Priority boarding'],
      recommended: true,
      popularityPercent: 74,
    },
    {
      id: 'flex',
      name: 'FLEX',
      price: flightData ? parseFloat(flightData.price.total) * 1.35 : 389,
      currency: flightData?.price.currency || 'USD',
      features: ['Carry-on + 2 bags', 'Seat choice', 'Refundable (-25%)', 'Free changes', 'Priority boarding'],
      popularityPercent: 18,
    },
    {
      id: 'business',
      name: 'BUSINESS',
      price: flightData ? parseFloat(flightData.price.total) * 2.5 : 589,
      currency: flightData?.price.currency || 'USD',
      features: ['Premium cabin', '2 bags + carry-on', 'Lounge access', 'Fully refundable', 'Extra legroom'],
      popularityPercent: 4,
    },
  ];

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
    <div className="min-h-screen bg-gray-50">
      {/* Header - Auto-hides on scroll down (Phase 8 Track 2B.1) */}
      <div
        className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm"
        style={{
          transform: scrollDirection === 'down' && !isAtTop ? 'translateY(-100%)' : 'translateY(0)',
          transition: 'transform 300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
          willChange: 'transform',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Plane className="w-6 h-6 text-primary-500" />
              <h1 className="text-xl font-bold text-gray-900">Complete Your Booking</h1>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center gap-2">
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                      ${currentStep >= step
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                      }
                    `}
                  >
                    {step}
                  </div>
                  {step < 3 && <div className={`w-12 h-1 ${currentStep > step ? 'bg-primary-500' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>
          </div>

          {/* Step Labels */}
          <div className="flex justify-between mt-2 text-xs font-medium">
            <span className={currentStep === 1 ? 'text-primary-600' : 'text-gray-500'}>Customize Flight</span>
            <span className={currentStep === 2 ? 'text-primary-600' : 'text-gray-500'}>Traveler Details</span>
            <span className={currentStep === 3 ? 'text-primary-600' : 'text-gray-500'}>Review & Pay</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column: Steps */}
          <div className="lg:col-span-2 space-y-4">
            {/* STEP 1: Customize Flight */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                {/* Minimal Flight Confirmation Header */}
                {flightData && (() => {
                  const airline = flightData.validatingAirlineCodes?.[0] || flightData.itineraries?.[0]?.segments?.[0]?.carrierCode || 'XX';
                  const airlineData = getAirlineData(airline);
                  const outbound = flightData.itineraries?.[0];
                  const inbound = flightData.itineraries?.[1];
                  const flightNum = outbound?.segments?.[0]?.number?.replace(/^[A-Z]{2}\s*/, '') || '';

                  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  const getStops = (segments: any[]) => segments?.length === 1 ? 'Direct' : `${segments.length - 1} stop${segments.length > 2 ? 's' : ''}`;

                  return (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <AirlineLogo code={airline} size="md" />
                        <div>
                          <div className="font-bold text-gray-900">{airlineData.name}</div>
                          <div className="text-xs text-gray-500">Flight {airline} {flightNum}</div>
                        </div>
                        <div className="ml-auto text-right">
                          <div className="text-xs text-green-600 font-semibold">✓ Selected</div>
                        </div>
                      </div>

                      {/* Outbound */}
                      <div className="flex items-center gap-3 py-2 border-t border-gray-100">
                        <span className="text-[10px] font-bold text-blue-600 uppercase w-16">→ Outbound</span>
                        <div className="flex-1 flex items-center gap-2 text-sm">
                          <span className="font-semibold">{formatDate(outbound?.segments?.[0]?.departure?.at)}</span>
                          <span className="text-gray-500">{formatTime(outbound?.segments?.[0]?.departure?.at)}</span>
                          <span className="text-gray-400">→</span>
                          <span className="text-gray-500">{formatTime(outbound?.segments?.[outbound?.segments?.length - 1]?.arrival?.at)}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${outbound?.segments?.length === 1 ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                            {getStops(outbound?.segments)}
                          </span>
                        </div>
                      </div>

                      {/* Return (if round trip) */}
                      {inbound && (
                        <div className="flex items-center gap-3 py-2 border-t border-gray-100">
                          <span className="text-[10px] font-bold text-gray-500 uppercase w-16">← Return</span>
                          <div className="flex-1 flex items-center gap-2 text-sm">
                            <span className="font-semibold">{formatDate(inbound?.segments?.[0]?.departure?.at)}</span>
                            <span className="text-gray-500">{formatTime(inbound?.segments?.[0]?.departure?.at)}</span>
                            <span className="text-gray-400">→</span>
                            <span className="text-gray-500">{formatTime(inbound?.segments?.[inbound?.segments?.length - 1]?.arrival?.at)}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${inbound?.segments?.length === 1 ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                              {getStops(inbound?.segments)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Fare Selection */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-3 text-white">
                    <h2 className="text-base font-bold flex items-center gap-2">
                      ✈️ Choose Your Fare
                    </h2>
                  </div>
                  <div className="p-4">
                    <FareSelector
                      fares={fareOptions}
                      selectedFareId={selectedFareId}
                      onSelect={handleFareSelect}
                      mlRecommendation="standard"
                    />
                  </div>
                </div>

                {/* Individual Add-Ons - Real airline services only */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-3 text-white">
                    <h3 className="text-base font-bold flex items-center gap-2">
                      🎯 Individual Add-Ons
                    </h3>
                  </div>
                  <div className="p-4">
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
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-3 text-white">
                    <h2 className="text-base font-bold flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Traveler Information
                    </h2>
                  </div>
                  <div className="p-4">
                    <CompactPassengerForm
                      passengers={passengers}
                      isInternational={isInternationalRoute(flightData.search.from, flightData.search.to)}
                      onUpdate={handlePassengersUpdate}
                    />
                  </div>
                </div>

                {/* Validation Helper Message */}
                {!arePassengersComplete() && (
                  <div className="bg-warning-50 border border-warning-300 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-warning-600 text-lg">⚠️</span>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-warning-900 mb-1">
                          Complete Required Information
                        </h4>
                        <p className="text-xs text-warning-800">
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
                  isReturningCustomer={isReturningCustomer}
                  customerEmail={passengers[0]?.email}
                />
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all text-sm
                  ${currentStep === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }
                `}
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              {currentStep < 3 && (
                <button
                  onClick={handleContinue}
                  disabled={currentStep === 2 && !arePassengersComplete()}
                  className={`
                    flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm shadow-md transition-all
                    ${currentStep === 2 && !arePassengersComplete()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 hover:shadow-lg'
                    }
                  `}
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
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
