/**
 * useBookingFlow Hook
 *
 * Centralized booking flow state management and API integration
 * Used by AITravelAssistant for E2E conversational commerce
 */

import { useState, useCallback } from 'react';
import {
  BookingState,
  BookingFlowStage,
  BookingFlowProgress,
  FlightOption,
  FareOption,
  SeatOption,
  BaggageOption,
  BOOKING_FLOW_STAGES_CONFIG,
} from '@/types/booking-flow';

interface BookingFlowHook {
  // State
  activeBooking: BookingState | null;
  bookingProgress: BookingFlowProgress | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  createBooking: (flight: FlightOption, searchParams: any) => string; // Returns booking ID
  updateFare: (bookingId: string, fare: FareOption) => void;
  updateSeat: (bookingId: string, seatNumber: string, price: number) => void;
  updateBaggage: (bookingId: string, quantity: number, price: number) => void;
  clearBooking: () => void;

  // API Calls
  loadFareOptions: (offerId: string) => Promise<FareOption[]>;
  loadSeatMap: (offerId: string) => Promise<SeatOption[]>;
  loadBaggageOptions: (offerId: string) => Promise<BaggageOption[]>;

  // Progress Management
  advanceStage: (stage: BookingFlowStage) => void;
  getProgress: () => BookingFlowProgress | null;

  // Validation
  validateBooking: (requiredFields: string[]) => boolean;
}

export function useBookingFlow(): BookingFlowHook {
  const [activeBooking, setActiveBooking] = useState<BookingState | null>(null);
  const [bookingProgress, setBookingProgress] = useState<BookingFlowProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * CREATE BOOKING
   * Initialize a new booking session when user selects a flight
   */
  const createBooking = useCallback((flight: FlightOption, searchParams: any): string => {
    const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newBooking: BookingState = {
      id: bookingId,
      searchParams: {
        origin: searchParams.origin || flight.departure.airportCode,
        destination: searchParams.destination || flight.arrival.airportCode,
        departureDate: searchParams.departureDate || new Date().toISOString().split('T')[0],
        passengers: searchParams.passengers || 1,
        class: searchParams.class || 'economy',
      },
      selectedFlight: {
        id: flight.id,
        offerId: flight.offerId,
        airline: flight.airline,
        flightNumber: flight.flightNumber,
        price: flight.price,
        currency: flight.currency,
      },
      pricing: {
        baseFare: flight.price * 0.85,
        taxes: flight.price * 0.15,
        seatFees: 0,
        baggageFees: 0,
        extrasFees: 0,
        total: flight.price,
        currency: flight.currency,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setActiveBooking(newBooking);

    // Initialize progress
    setBookingProgress({
      currentStage: 'flight_selection',
      completedStages: [],
      totalStages: 8,
      currentStepNumber: 2,
    });

    // Save to localStorage for recovery
    try {
      localStorage.setItem('activeBooking', JSON.stringify(newBooking));
    } catch (err) {
      console.warn('Failed to save booking to localStorage:', err);
    }

    console.log('✅ Booking created:', bookingId);
    return bookingId;
  }, []);

  /**
   * UPDATE FARE
   * Update booking with selected fare class
   */
  const updateFare = useCallback((bookingId: string, fare: FareOption) => {
    setActiveBooking(prev => {
      if (!prev || prev.id !== bookingId) {
        console.error('Booking not found or ID mismatch');
        return prev;
      }

      const updated: BookingState = {
        ...prev,
        selectedFare: {
          id: fare.id,
          name: fare.name,
          price: fare.price,
          features: fare.features,
        },
        pricing: {
          ...prev.pricing,
          baseFare: fare.price * 0.85,
          taxes: fare.price * 0.15,
          total: fare.price + prev.pricing.seatFees + prev.pricing.baggageFees,
        },
        updatedAt: new Date(),
      };

      // Save to localStorage
      try {
        localStorage.setItem('activeBooking', JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to update booking in localStorage:', err);
      }

      return updated;
    });

    console.log('✅ Fare updated:', fare.name);
  }, []);

  /**
   * UPDATE SEAT
   * Update booking with selected seat
   */
  const updateSeat = useCallback((bookingId: string, seatNumber: string, price: number) => {
    setActiveBooking(prev => {
      if (!prev || prev.id !== bookingId) return prev;

      const updated: BookingState = {
        ...prev,
        selectedSeats: [
          {
            passengerId: 'passenger-1',
            seatNumber,
            price,
          },
        ],
        pricing: {
          ...prev.pricing,
          seatFees: price,
          total: prev.pricing.baseFare + prev.pricing.taxes + price + prev.pricing.baggageFees,
        },
        updatedAt: new Date(),
      };

      try {
        localStorage.setItem('activeBooking', JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to update booking in localStorage:', err);
      }

      return updated;
    });

    console.log('✅ Seat updated:', seatNumber);
  }, []);

  /**
   * UPDATE BAGGAGE
   * Update booking with selected baggage
   */
  const updateBaggage = useCallback((bookingId: string, quantity: number, price: number) => {
    setActiveBooking(prev => {
      if (!prev || prev.id !== bookingId) return prev;

      const updated: BookingState = {
        ...prev,
        selectedBaggage:
          quantity > 0
            ? [
                {
                  passengerId: 'passenger-1',
                  quantity,
                  price,
                },
              ]
            : undefined,
        pricing: {
          ...prev.pricing,
          baggageFees: price,
          total: prev.pricing.baseFare + prev.pricing.taxes + prev.pricing.seatFees + price,
        },
        updatedAt: new Date(),
      };

      try {
        localStorage.setItem('activeBooking', JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to update booking in localStorage:', err);
      }

      return updated;
    });

    console.log('✅ Baggage updated:', quantity);
  }, []);

  /**
   * CLEAR BOOKING
   * Clear active booking (after completion or cancellation)
   */
  const clearBooking = useCallback(() => {
    setActiveBooking(null);
    setBookingProgress(null);
    setError(null);

    try {
      localStorage.removeItem('activeBooking');
    } catch (err) {
      console.warn('Failed to clear booking from localStorage:', err);
    }

    console.log('✅ Booking cleared');
  }, []);

  /**
   * LOAD FARE OPTIONS
   * Fetch fare options from API for selected flight
   */
  const loadFareOptions = useCallback(async (offerId: string): Promise<FareOption[]> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('💰 Loading fare options for offer:', offerId);

      const response = await fetch(`/api/booking-flow/fares?offerId=${offerId}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const { fares } = await response.json();

      console.log(`✅ Loaded ${fares.length} fare options`);
      return fares;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load fare options';
      console.error('❌ Error loading fares:', errorMsg);
      setError(errorMsg);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * LOAD SEAT MAP
   * Fetch seat map from API for selected flight
   */
  const loadSeatMap = useCallback(async (offerId: string): Promise<SeatOption[]> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🪑 Loading seat map for offer:', offerId);

      const response = await fetch(`/api/booking-flow/seats?offerId=${offerId}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const { seats } = await response.json();

      console.log(`✅ Loaded ${seats.length} seats`);
      return seats;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load seat map';
      console.error('❌ Error loading seats:', errorMsg);
      setError(errorMsg);
      return []; // Return empty array - seats are optional
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * LOAD BAGGAGE OPTIONS
   * Fetch baggage options from API for selected flight
   */
  const loadBaggageOptions = useCallback(async (offerId: string): Promise<BaggageOption[]> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🧳 Loading baggage options for offer:', offerId);

      const response = await fetch(`/api/booking-flow/baggage?offerId=${offerId}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const { baggage } = await response.json();

      console.log(`✅ Loaded ${baggage.length} baggage options`);
      return baggage;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load baggage options';
      console.error('❌ Error loading baggage:', errorMsg);
      setError(errorMsg);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * ADVANCE STAGE
   * Move to next stage in booking flow
   */
  const advanceStage = useCallback((stage: BookingFlowStage) => {
    setBookingProgress(prev => {
      if (!prev) return null;

      const stageOrder: BookingFlowStage[] = [
        'discovery',
        'flight_selection',
        'fare_selection',
        'seat_selection',
        'baggage_selection',
        'extras_selection',
        'review',
        'payment',
        'confirmation',
      ];

      const currentIndex = stageOrder.indexOf(prev.currentStage);
      const newIndex = stageOrder.indexOf(stage);

      // Add previous stage to completed if moving forward
      const completedStages =
        newIndex > currentIndex
          ? [...prev.completedStages, prev.currentStage]
          : prev.completedStages;

      return {
        ...prev,
        currentStage: stage,
        completedStages,
        currentStepNumber: BOOKING_FLOW_STAGES_CONFIG[stage]?.stepNumber || prev.currentStepNumber,
      };
    });

    console.log('✅ Advanced to stage:', stage);
  }, []);

  /**
   * GET PROGRESS
   * Return current progress state
   */
  const getProgress = useCallback(() => {
    return bookingProgress;
  }, [bookingProgress]);

  /**
   * VALIDATE BOOKING
   * Check if booking has required fields
   */
  const validateBooking = useCallback(
    (requiredFields: string[]): boolean => {
      if (!activeBooking) {
        console.error('No active booking');
        return false;
      }

      for (const field of requiredFields) {
        const value = (activeBooking as any)[field];
        if (!value) {
          console.error(`Missing required field: ${field}`);
          return false;
        }
      }

      return true;
    },
    [activeBooking]
  );

  return {
    // State
    activeBooking,
    bookingProgress,
    isLoading,
    error,

    // Actions
    createBooking,
    updateFare,
    updateSeat,
    updateBaggage,
    clearBooking,

    // API Calls
    loadFareOptions,
    loadSeatMap,
    loadBaggageOptions,

    // Progress
    advanceStage,
    getProgress,

    // Validation
    validateBooking,
  };
}
