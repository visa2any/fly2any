'use client';

import { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { ProgressIndicator } from '@/components/booking/ProgressIndicator';
import { InlineFareSelector } from '@/components/booking/InlineFareSelector';
import { BaggageUpsellWidget } from '@/components/booking/BaggageUpsellWidget';
import { BookingSummaryCard } from '@/components/booking/BookingSummaryCard';
import { CompactSeatMap, QuickSeatSelector } from '@/components/booking/CompactSeatMap';
import { MOCK_FLIGHTS, MOCK_FARES, MOCK_BAGGAGE, MOCK_SEATS, getMockFlight, getMockFare, getMockSeat, getMockBaggage, calculateTotalPrice } from '@/lib/mock/booking-flow-data';
import { BookingState, BookingFlowStage, BookingFlowProgress, BOOKING_FLOW_STAGES_CONFIG } from '@/types/booking-flow';

/**
 * E2E Conversational Commerce Booking Flow Demo
 *
 * This page demonstrates the complete booking flow with all widgets
 * Use this to test the experience before integrating into chat
 */
export default function BookingFlowDemo() {
  const [currentStage, setCurrentStage] = useState<BookingFlowStage>('flight_selection');
  const [bookingState, setBookingState] = useState<BookingState>({
    id: `demo_${Date.now()}`,
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

  // Calculate progress
  const completedStages: BookingFlowStage[] = [];
  const stageOrder: BookingFlowStage[] = ['discovery', 'flight_selection', 'fare_selection', 'seat_selection', 'baggage_selection', 'review', 'payment', 'confirmation'];

  stageOrder.forEach((stage, idx) => {
    if (stageOrder.indexOf(currentStage) > idx) {
      completedStages.push(stage);
    }
  });

  const progress: BookingFlowProgress = {
    currentStage,
    completedStages,
    totalStages: 9,
    currentStepNumber: BOOKING_FLOW_STAGES_CONFIG[currentStage]?.stepNumber || 1,
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleFlightSelect = (flightId: string) => {
    const flight = getMockFlight(flightId);
    if (!flight) return;

    setBookingState(prev => ({
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
        departureDate: 'Nov 15, 2024',
        passengers: 1,
        class: 'economy',
      },
    }));

    setCurrentStage('fare_selection');
  };

  const handleFareSelect = (fareId: string) => {
    const fare = getMockFare(fareId);
    if (!fare) return;

    const pricing = calculateTotalPrice({ farePrice: fare.price });

    setBookingState(prev => ({
      ...prev,
      selectedFare: {
        id: fare.id,
        name: fare.name,
        price: fare.price,
        features: fare.features,
      },
      pricing: {
        ...prev.pricing,
        baseFare: pricing.baseFare,
        taxes: pricing.taxes,
        total: pricing.total,
      },
    }));

    setCurrentStage('seat_selection');
  };

  const handleSeatSelect = (seatNumber: string) => {
    const seat = getMockSeat(seatNumber);
    if (!seat) return;

    const pricing = calculateTotalPrice({
      farePrice: bookingState.selectedFare?.price || 0,
      seatPrice: seat.price,
    });

    setBookingState(prev => ({
      ...prev,
      selectedSeats: [{
        passengerId: 'passenger-1',
        seatNumber: seatNumber,
        price: seat.price,
      }],
      pricing: {
        ...prev.pricing,
        seatFees: seat.price,
        total: pricing.total,
      },
    }));

    setCurrentStage('baggage_selection');
  };

  const handleBaggageSelect = (quantity: number) => {
    const baggage = getMockBaggage(quantity);
    if (!baggage) return;

    const pricing = calculateTotalPrice({
      farePrice: bookingState.selectedFare?.price || 0,
      seatPrice: bookingState.selectedSeats?.[0]?.price || 0,
      baggagePrice: baggage.price,
    });

    setBookingState(prev => ({
      ...prev,
      selectedBaggage: quantity > 0 ? [{
        passengerId: 'passenger-1',
        quantity,
        price: baggage.price,
      }] : undefined,
      pricing: {
        ...prev.pricing,
        baggageFees: baggage.price,
        total: pricing.total,
      },
    }));

    setCurrentStage('review');
  };

  const handleSkipSeats = () => {
    setCurrentStage('baggage_selection');
  };

  const handleGoBack = () => {
    const currentIndex = stageOrder.indexOf(currentStage);
    if (currentIndex > 0) {
      setCurrentStage(stageOrder[currentIndex - 1]);
    }
  };

  const handleConfirmBooking = () => {
    alert('Payment integration would go here!\n\nIn production, this would:\n1. Create Stripe payment intent\n2. Show Stripe payment form\n3. Process payment\n4. Create booking\n5. Send confirmation email');
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
              <h1 className="text-2xl font-bold text-gray-900">E2E Booking Flow Demo</h1>
              <p className="text-sm text-gray-600 mt-1">Test the conversational commerce widgets</p>
            </div>
            {currentStage !== 'flight_selection' && (
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
        <div className="mb-6">
          <ProgressIndicator progress={progress} />
        </div>

        {/* Stage Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Flight Selection */}
          {currentStage === 'flight_selection' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Select Your Flight</h2>
                <p className="text-sm text-gray-600">Choose from available flights from New York (JFK) to Dubai (DXB)</p>
              </div>

              <div className="space-y-3">
                {MOCK_FLIGHTS.map(flight => (
                  <button
                    key={flight.id}
                    onClick={() => handleFlightSelect(flight.id)}
                    className="w-full p-4 border-2 border-gray-200 hover:border-primary-500 rounded-lg text-left transition-all hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-gray-900">{flight.airline} {flight.flightNumber}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {flight.departure.time} - {flight.arrival.time} • {flight.duration} • {flight.stopDetails}
                        </div>
                        {flight.dealScore && flight.dealScore >= 90 && (
                          <div className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                            Great Deal
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary-600">${flight.price}</div>
                        <div className="text-xs text-gray-500">{flight.availableSeats} seats left</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fare Selection */}
          {currentStage === 'fare_selection' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Choose Your Fare Class</h2>
                <p className="text-sm text-gray-600">
                  Flying {bookingState.selectedFlight?.airline} {bookingState.selectedFlight?.flightNumber}
                </p>
              </div>

              <InlineFareSelector
                fares={MOCK_FARES}
                onSelect={handleFareSelect}
              />
            </div>
          )}

          {/* Seat Selection */}
          {currentStage === 'seat_selection' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Select Your Seat</h2>
                <p className="text-sm text-gray-600">
                  {bookingState.selectedFare?.name} class on {bookingState.selectedFlight?.airline}
                </p>
              </div>

              <div className="flex justify-center">
                <CompactSeatMap
                  seats={MOCK_SEATS}
                  onSelect={handleSeatSelect}
                  onSkip={handleSkipSeats}
                  passengerName="Passenger 1"
                />
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center mb-3">Or choose your preference:</p>
                <div className="flex justify-center">
                  <QuickSeatSelector
                    onSelect={(type) => {
                      // Find first available seat of this type
                      const seat = MOCK_SEATS.find(s => s.available && s.type === type);
                      if (seat) handleSeatSelect(seat.number);
                    }}
                    onSkip={handleSkipSeats}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Baggage Selection */}
          {currentStage === 'baggage_selection' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Add Checked Baggage</h2>
                <p className="text-sm text-gray-600">
                  Seat {bookingState.selectedSeats?.[0]?.seatNumber} selected
                </p>
              </div>

              <div className="flex justify-center">
                <BaggageUpsellWidget
                  options={MOCK_BAGGAGE}
                  onSelect={handleBaggageSelect}
                  maxBags={3}
                />
              </div>
            </div>
          )}

          {/* Review */}
          {currentStage === 'review' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Review Your Booking</h2>
                <p className="text-sm text-gray-600">Check everything before proceeding to payment</p>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
              <p className="text-gray-600 mb-6">Your flight is booked. Check your email for details.</p>

              <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto text-left">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking Reference:</span>
                    <span className="font-bold">ABC123XYZ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Flight:</span>
                    <span className="font-bold">{bookingState.selectedFlight?.airline} {bookingState.selectedFlight?.flightNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Paid:</span>
                    <span className="font-bold text-primary-600">${bookingState.pricing.total}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setCurrentStage('flight_selection');
                  setBookingState({
                    id: `demo_${Date.now()}`,
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
          <pre className="whitespace-pre-wrap">{JSON.stringify({ currentStage, bookingState }, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
