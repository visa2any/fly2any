'use client';

import { useState } from 'react';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { ProgressIndicator } from '@/components/booking/ProgressIndicator';
import { InlineFareSelector } from '@/components/booking/InlineFareSelector';
import { BaggageUpsellWidget } from '@/components/booking/BaggageUpsellWidget';
import { BookingSummaryCard } from '@/components/booking/BookingSummaryCard';
import { CompactSeatMap, QuickSeatSelector } from '@/components/booking/CompactSeatMap';
import {
  BookingState,
  BookingFlowStage,
  BookingFlowProgress,
  BOOKING_FLOW_STAGES_CONFIG,
  FlightOption,
  FareOption,
  SeatOption,
  BaggageOption,
} from '@/types/booking-flow';

/**
 * E2E Conversational Commerce Booking Flow - LIVE DEMO with Real Duffel API
 *
 * This page demonstrates the complete booking flow using REAL Duffel API data
 */
export default function BookingFlowDemoLive() {
  const [currentStage, setCurrentStage] = useState<BookingFlowStage>('discovery');
  const [bookingState, setBookingState] = useState<BookingState>({
    id: `demo_live_${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    pricing: {
      baseFare: 0,
      taxes: 0,
      seatFees: 0,
      baggageFees: 0,
      extrasFees: 0,
      total: 0,
      currency: 'USD',
    },
  });

  // Data state
  const [flights, setFlights] = useState<FlightOption[]>([]);
  const [fares, setFares] = useState<FareOption[]>([]);
  const [seats, setSeats] = useState<SeatOption[]>([]);
  const [baggage, setBaggage] = useState<BaggageOption[]>([]);

  // Loading state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search params
  const [searchParams, setSearchParams] = useState({
    origin: 'JFK',
    destination: 'DXB',
    departureDate: '2024-12-15',
    passengers: 1,
    cabinClass: 'economy' as const,
  });

  // Calculate progress
  const completedStages: BookingFlowStage[] = [];
  const stageOrder: BookingFlowStage[] = [
    'discovery',
    'flight_selection',
    'fare_selection',
    'seat_selection',
    'baggage_selection',
    'review',
    'payment',
    'confirmation',
  ];

  stageOrder.forEach((stage, idx) => {
    if (stageOrder.indexOf(currentStage) > idx) {
      completedStages.push(stage);
    }
  });

  const progress: BookingFlowProgress = {
    currentStage,
    completedStages,
    totalStages: 8,
    currentStepNumber: BOOKING_FLOW_STAGES_CONFIG[currentStage]?.stepNumber || 1,
  };

  // ============================================================================
  // API CALLS
  // ============================================================================

  const searchFlights = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Searching flights with real Duffel API...');
      const response = await fetch('/api/booking-flow/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams),
      });

      if (!response.ok) {
        throw new Error('Failed to search flights');
      }

      const data = await response.json();
      setFlights(data.flights);
      setCurrentStage('flight_selection');
      console.log(`✅ Found ${data.flights.length} flights`);
    } catch (err) {
      console.error('❌ Error searching flights:', err);
      setError(err instanceof Error ? err.message : 'Failed to search flights');
    } finally {
      setLoading(false);
    }
  };

  const loadFares = async (offerId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('💰 Loading fare options...');
      const response = await fetch(`/api/booking-flow/fares?offerId=${offerId}`);

      if (!response.ok) {
        throw new Error('Failed to load fares');
      }

      const data = await response.json();
      setFares(data.fares);
      console.log(`✅ Loaded ${data.fares.length} fare options`);
    } catch (err) {
      console.error('❌ Error loading fares:', err);
      setError(err instanceof Error ? err.message : 'Failed to load fares');
    } finally {
      setLoading(false);
    }
  };

  const loadSeats = async (offerId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🪑 Loading seat map...');
      const response = await fetch(`/api/booking-flow/seats?offerId=${offerId}`);

      if (!response.ok) {
        throw new Error('Failed to load seats');
      }

      const data = await response.json();
      setSeats(data.seats);
      console.log(`✅ Loaded ${data.seats.length} seats`);
    } catch (err) {
      console.error('❌ Error loading seats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load seats');
      // Seats are optional - continue without them
      setSeats([]);
    } finally {
      setLoading(false);
    }
  };

  const loadBaggage = async (offerId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🧳 Loading baggage options...');
      const response = await fetch(`/api/booking-flow/baggage?offerId=${offerId}`);

      if (!response.ok) {
        throw new Error('Failed to load baggage');
      }

      const data = await response.json();
      setBaggage(data.baggage);
      console.log(`✅ Loaded ${data.baggage.length} baggage options`);
    } catch (err) {
      console.error('❌ Error loading baggage:', err);
      setError(err instanceof Error ? err.message : 'Failed to load baggage');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleFlightSelect = async (flightId: string) => {
    const flight = flights.find((f) => f.id === flightId);
    if (!flight) return;

    setBookingState((prev) => ({
      ...prev,
      selectedFlight: {
        id: flight.id,
        offerId: flight.offerId,
        airline: flight.airline,
        flightNumber: flight.flightNumber,
        price: flight.price,
        currency: flight.currency,
      },
      searchParams: {
        origin: flight.departure.airportCode,
        destination: flight.arrival.airportCode,
        departureDate: searchParams.departureDate,
        passengers: searchParams.passengers,
        class: searchParams.cabinClass,
      },
    }));

    // Load fares for this flight
    await loadFares(flight.offerId);
    setCurrentStage('fare_selection');
  };

  const handleFareSelect = async (fareId: string) => {
    const fare = fares.find((f) => f.id === fareId);
    if (!fare) return;

    const baseFare = fare.price * 0.85; // Estimate base fare
    const taxes = fare.price * 0.15;

    setBookingState((prev) => ({
      ...prev,
      selectedFare: {
        id: fare.id,
        name: fare.name,
        price: fare.price,
        features: fare.features,
      },
      pricing: {
        ...prev.pricing,
        baseFare,
        taxes,
        total: fare.price,
      },
    }));

    // Load seats for this offer
    if (bookingState.selectedFlight) {
      await loadSeats(bookingState.selectedFlight.offerId);
    }
    setCurrentStage('seat_selection');
  };

  const handleSeatSelect = async (seatNumber: string) => {
    const seat = seats.find((s) => s.number === seatNumber);
    if (!seat) return;

    const currentTotal = bookingState.pricing.total;

    setBookingState((prev) => ({
      ...prev,
      selectedSeats: [
        {
          passengerId: 'passenger-1',
          seatNumber: seatNumber,
          price: seat.price,
        },
      ],
      pricing: {
        ...prev.pricing,
        seatFees: seat.price,
        total: currentTotal + seat.price,
      },
    }));

    // Load baggage for this offer
    if (bookingState.selectedFlight) {
      await loadBaggage(bookingState.selectedFlight.offerId);
    }
    setCurrentStage('baggage_selection');
  };

  const handleBaggageSelect = (quantity: number) => {
    const selectedBaggage = baggage.find((b) => b.quantity === quantity);
    if (!selectedBaggage) return;

    const currentTotal = bookingState.pricing.total;

    setBookingState((prev) => ({
      ...prev,
      selectedBaggage:
        quantity > 0
          ? [
              {
                passengerId: 'passenger-1',
                quantity,
                price: selectedBaggage.price,
              },
            ]
          : undefined,
      pricing: {
        ...prev.pricing,
        baggageFees: selectedBaggage.price,
        total: currentTotal + selectedBaggage.price,
      },
    }));

    setCurrentStage('review');
  };

  const handleSkipSeats = async () => {
    // Load baggage for this offer
    if (bookingState.selectedFlight) {
      await loadBaggage(bookingState.selectedFlight.offerId);
    }
    setCurrentStage('baggage_selection');
  };

  const handleGoBack = () => {
    const currentIndex = stageOrder.indexOf(currentStage);
    if (currentIndex > 0) {
      setCurrentStage(stageOrder[currentIndex - 1]);
    }
  };

  const handleConfirmBooking = () => {
    alert(
      'Payment integration would go here!\\n\\nIn production, this would:\\n1. Create Stripe payment intent\\n2. Show Stripe payment form\\n3. Process payment\\n4. Create booking via Duffel\\n5. Send confirmation email'
    );
    setCurrentStage('confirmation');
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                E2E Booking Flow - LIVE Demo
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Using real Duffel API integration
              </p>
            </div>
            {currentStage !== 'discovery' && currentStage !== 'flight_selection' && (
              <button
                onClick={handleGoBack}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Indicator */}
        {currentStage !== 'discovery' && (
          <div className="mb-6">
            <ProgressIndicator progress={progress} />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Stage Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Discovery / Search */}
          {currentStage === 'discovery' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Search Flights</h2>
                <p className="text-sm text-gray-600">
                  Enter your travel details to search real flights via Duffel API
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From
                  </label>
                  <input
                    type="text"
                    value={searchParams.origin}
                    onChange={(e) =>
                      setSearchParams({ ...searchParams, origin: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="JFK"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To
                  </label>
                  <input
                    type="text"
                    value={searchParams.destination}
                    onChange={(e) =>
                      setSearchParams({ ...searchParams, destination: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="DXB"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    value={searchParams.departureDate}
                    onChange={(e) =>
                      setSearchParams({ ...searchParams, departureDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Passengers
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="9"
                    value={searchParams.passengers}
                    onChange={(e) =>
                      setSearchParams({
                        ...searchParams,
                        passengers: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <button
                onClick={searchFlights}
                disabled={loading}
                className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <span>Search Flights</span>
                )}
              </button>
            </div>
          )}

          {/* Flight Selection */}
          {currentStage === 'flight_selection' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Select Your Flight</h2>
                <p className="text-sm text-gray-600">
                  {flights.length} real flights found from {searchParams.origin} to{' '}
                  {searchParams.destination}
                </p>
              </div>

              {flights.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    No flights found. Try different search parameters.
                  </p>
                  <button
                    onClick={() => setCurrentStage('discovery')}
                    className="mt-4 px-4 py-2 text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    Search Again
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {flights.map((flight) => (
                    <button
                      key={flight.id}
                      onClick={() => handleFlightSelect(flight.id)}
                      className="w-full p-4 border-2 border-gray-200 hover:border-primary-500 rounded-lg text-left transition-all hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-gray-900">
                            {flight.airline} {flight.flightNumber}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {flight.departure.time} - {flight.arrival.time} •{' '}
                            {flight.duration} • {flight.stopDetails}
                          </div>
                          {flight.dealScore && flight.dealScore >= 85 && (
                            <div className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                              Great Deal
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary-600">
                            ${flight.price}
                          </div>
                          <div className="text-xs text-gray-500">
                            {flight.availableSeats} seats left
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Fare Selection */}
          {currentStage === 'fare_selection' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Choose Your Fare Class
                </h2>
                <p className="text-sm text-gray-600">
                  Flying {bookingState.selectedFlight?.airline}{' '}
                  {bookingState.selectedFlight?.flightNumber}
                </p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                </div>
              ) : (
                <InlineFareSelector fares={fares} onSelect={handleFareSelect} />
              )}
            </div>
          )}

          {/* Seat Selection */}
          {currentStage === 'seat_selection' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Select Your Seat</h2>
                <p className="text-sm text-gray-600">
                  {bookingState.selectedFare?.name} class on{' '}
                  {bookingState.selectedFlight?.airline}
                </p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                </div>
              ) : seats.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    Seat map not available for this flight
                  </p>
                  <button
                    onClick={handleSkipSeats}
                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg"
                  >
                    Continue Without Seat Selection
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex justify-center">
                    <CompactSeatMap
                      seats={seats}
                      onSelect={handleSeatSelect}
                      onSkip={handleSkipSeats}
                      passengerName="Passenger 1"
                    />
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center mb-3">
                      Or choose your preference:
                    </p>
                    <div className="flex justify-center">
                      <QuickSeatSelector
                        onSelect={(type) => {
                          const seat = seats.find((s) => s.available && s.type === type);
                          if (seat) handleSeatSelect(seat.number);
                        }}
                        onSkip={handleSkipSeats}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Baggage Selection */}
          {currentStage === 'baggage_selection' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Add Checked Baggage
                </h2>
                <p className="text-sm text-gray-600">
                  {bookingState.selectedSeats?.[0]?.seatNumber
                    ? `Seat ${bookingState.selectedSeats[0].seatNumber} selected`
                    : 'No seat selected'}
                </p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                </div>
              ) : (
                <div className="flex justify-center">
                  <BaggageUpsellWidget
                    options={baggage}
                    onSelect={handleBaggageSelect}
                    maxBags={3}
                  />
                </div>
              )}
            </div>
          )}

          {/* Review */}
          {currentStage === 'review' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Review Your Booking
                </h2>
                <p className="text-sm text-gray-600">
                  Check everything before proceeding to payment
                </p>
              </div>

              <div className="flex justify-center">
                <BookingSummaryCard
                  booking={bookingState}
                  onEdit={(section) => {
                    if (section === 'flight') setCurrentStage('flight_selection');
                    if (section === 'fare') setCurrentStage('fare_selection');
                    if (section === 'seats') setCurrentStage('seat_selection');
                    if (section === 'baggage') setCurrentStage('baggage_selection');
                  }}
                  onConfirm={handleConfirmBooking}
                  expanded
                />
              </div>
            </div>
          )}

          {/* Confirmation */}
          {currentStage === 'confirmation' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Booking Confirmed!
              </h2>
              <p className="text-gray-600 mb-6">
                Your flight is booked. Check your email for details.
              </p>

              <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto text-left">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking Reference:</span>
                    <span className="font-bold">ABC123XYZ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Flight:</span>
                    <span className="font-bold">
                      {bookingState.selectedFlight?.airline}{' '}
                      {bookingState.selectedFlight?.flightNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Paid:</span>
                    <span className="font-bold text-primary-600">
                      ${bookingState.pricing.total}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setCurrentStage('discovery');
                  setBookingState({
                    id: `demo_live_${Date.now()}`,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    pricing: {
                      baseFare: 0,
                      taxes: 0,
                      seatFees: 0,
                      baggageFees: 0,
                      extrasFees: 0,
                      total: 0,
                      currency: 'USD',
                    },
                  });
                  setFlights([]);
                  setFares([]);
                  setSeats([]);
                  setBaggage([]);
                }}
                className="mt-6 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
              >
                Start New Booking
              </button>
            </div>
          )}
        </div>

        {/* Debug Info */}
        <div className="mt-6 p-4 bg-gray-900 rounded-lg text-xs font-mono text-gray-300">
          <div className="mb-2 font-bold text-white">Debug Info:</div>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify({ currentStage, bookingState, flightsCount: flights.length }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
