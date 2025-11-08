/**
 * useBookingFlow Hook - Comprehensive Test Suite
 * Tests booking flow state management and API integration
 * @jest-environment jsdom
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useBookingFlow, PassengerInfo } from './useBookingFlow';
import { FlightOption, FareOption } from '@/types/booking-flow';

// Mock fetch globally
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useBookingFlow Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    (global.fetch as jest.Mock).mockClear();
  });

  const mockFlight: FlightOption = {
    id: 'flight-123',
    offerId: 'offer-abc',
    airline: 'United Airlines',
    flightNumber: 'UA123',
    price: 500,
    currency: 'USD',
    departure: {
      airportCode: 'JFK',
      city: 'New York',
      time: '2024-06-15T10:00:00Z',
    },
    arrival: {
      airportCode: 'LAX',
      city: 'Los Angeles',
      time: '2024-06-15T13:00:00Z',
    },
  };

  const mockSearchParams = {
    origin: 'JFK',
    destination: 'LAX',
    departureDate: '2024-06-15',
    passengers: 1,
    class: 'economy',
  };

  describe('Initial State', () => {
    test('should initialize with null active booking', () => {
      const { result } = renderHook(() => useBookingFlow());

      expect(result.current.activeBooking).toBeNull();
      expect(result.current.bookingProgress).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    test('should expose all hook methods', () => {
      const { result } = renderHook(() => useBookingFlow());

      expect(typeof result.current.createBooking).toBe('function');
      expect(typeof result.current.updateFare).toBe('function');
      expect(typeof result.current.updateSeat).toBe('function');
      expect(typeof result.current.updateBaggage).toBe('function');
      expect(typeof result.current.clearBooking).toBe('function');
      expect(typeof result.current.loadFareOptions).toBe('function');
      expect(typeof result.current.loadSeatMap).toBe('function');
      expect(typeof result.current.loadBaggageOptions).toBe('function');
      expect(typeof result.current.advanceStage).toBe('function');
      expect(typeof result.current.getProgress).toBe('function');
      expect(typeof result.current.validateBooking).toBe('function');
    });
  });

  describe('createBooking', () => {
    test('should create a new booking', () => {
      const { result } = renderHook(() => useBookingFlow());

      let bookingId: string = '';

      act(() => {
        bookingId = result.current.createBooking(mockFlight, mockSearchParams);
      });

      expect(bookingId).toBeTruthy();
      expect(bookingId).toContain('booking_');
      expect(result.current.activeBooking).not.toBeNull();
      expect(result.current.activeBooking?.id).toBe(bookingId);
    });

    test('should set correct search parameters', () => {
      const { result } = renderHook(() => useBookingFlow());

      act(() => {
        result.current.createBooking(mockFlight, mockSearchParams);
      });

      expect(result.current.activeBooking?.searchParams).toEqual({
        origin: 'JFK',
        destination: 'LAX',
        departureDate: '2024-06-15',
        passengers: 1,
        class: 'economy',
      });
    });

    test('should set selected flight details', () => {
      const { result } = renderHook(() => useBookingFlow());

      act(() => {
        result.current.createBooking(mockFlight, mockSearchParams);
      });

      expect(result.current.activeBooking?.selectedFlight).toEqual({
        id: 'flight-123',
        offerId: 'offer-abc',
        airline: 'United Airlines',
        flightNumber: 'UA123',
        price: 500,
        currency: 'USD',
      });
    });

    test('should calculate initial pricing', () => {
      const { result } = renderHook(() => useBookingFlow());

      act(() => {
        result.current.createBooking(mockFlight, mockSearchParams);
      });

      expect(result.current.activeBooking?.pricing).toEqual({
        baseFare: 425, // 85% of 500
        taxes: 75, // 15% of 500
        seatFees: 0,
        baggageFees: 0,
        extrasFees: 0,
        total: 500,
        currency: 'USD',
      });
    });

    test('should initialize progress tracking', () => {
      const { result } = renderHook(() => useBookingFlow());

      act(() => {
        result.current.createBooking(mockFlight, mockSearchParams);
      });

      expect(result.current.bookingProgress).toEqual({
        currentStage: 'flight_selection',
        completedStages: [],
        totalStages: 8,
        currentStepNumber: 2,
      });
    });

    test('should save booking to localStorage', () => {
      const { result } = renderHook(() => useBookingFlow());

      act(() => {
        result.current.createBooking(mockFlight, mockSearchParams);
      });

      const saved = localStorage.getItem('activeBooking');
      expect(saved).not.toBeNull();

      const parsed = JSON.parse(saved!);
      expect(parsed.selectedFlight.airline).toBe('United Airlines');
    });

    test('should use default values for missing search params', () => {
      const { result } = renderHook(() => useBookingFlow());

      act(() => {
        result.current.createBooking(mockFlight, {});
      });

      expect(result.current.activeBooking?.searchParams.origin).toBe('JFK');
      expect(result.current.activeBooking?.searchParams.destination).toBe('LAX');
      expect(result.current.activeBooking?.searchParams.passengers).toBe(1);
      expect(result.current.activeBooking?.searchParams.class).toBe('economy');
    });

    test('should generate unique booking IDs', () => {
      const { result } = renderHook(() => useBookingFlow());

      let id1: string, id2: string;

      act(() => {
        id1 = result.current.createBooking(mockFlight, mockSearchParams);
      });

      act(() => {
        result.current.clearBooking();
      });

      act(() => {
        id2 = result.current.createBooking(mockFlight, mockSearchParams);
      });

      expect(id1).not.toBe(id2);
    });
  });

  describe('updateFare', () => {
    const mockFare: FareOption = {
      id: 'fare-premium',
      name: 'Premium Economy',
      price: 750,
      features: ['Extra legroom', 'Priority boarding'],
    };

    test('should update booking with selected fare', () => {
      const { result } = renderHook(() => useBookingFlow());

      let bookingId: string;

      act(() => {
        bookingId = result.current.createBooking(mockFlight, mockSearchParams);
      });

      act(() => {
        result.current.updateFare(bookingId, mockFare);
      });

      expect(result.current.activeBooking?.selectedFare).toEqual({
        id: 'fare-premium',
        name: 'Premium Economy',
        price: 750,
        features: ['Extra legroom', 'Priority boarding'],
      });
    });

    test('should recalculate pricing with new fare', () => {
      const { result } = renderHook(() => useBookingFlow());

      let bookingId: string;

      act(() => {
        bookingId = result.current.createBooking(mockFlight, mockSearchParams);
      });

      act(() => {
        result.current.updateFare(bookingId, mockFare);
      });

      expect(result.current.activeBooking?.pricing.baseFare).toBe(637.5); // 85% of 750
      expect(result.current.activeBooking?.pricing.taxes).toBe(112.5); // 15% of 750
      expect(result.current.activeBooking?.pricing.total).toBe(750);
    });

    test('should update localStorage after fare update', () => {
      const { result } = renderHook(() => useBookingFlow());

      let bookingId: string;

      act(() => {
        bookingId = result.current.createBooking(mockFlight, mockSearchParams);
      });

      act(() => {
        result.current.updateFare(bookingId, mockFare);
      });

      const saved = localStorage.getItem('activeBooking');
      const parsed = JSON.parse(saved!);

      expect(parsed.selectedFare.name).toBe('Premium Economy');
    });

    test('should not update if booking ID mismatch', () => {
      const { result } = renderHook(() => useBookingFlow());

      act(() => {
        result.current.createBooking(mockFlight, mockSearchParams);
      });

      const initialBooking = result.current.activeBooking;

      act(() => {
        result.current.updateFare('wrong-id', mockFare);
      });

      expect(result.current.activeBooking).toEqual(initialBooking);
    });

    test('should not update if no active booking', () => {
      const { result } = renderHook(() => useBookingFlow());

      act(() => {
        result.current.updateFare('some-id', mockFare);
      });

      expect(result.current.activeBooking).toBeNull();
    });
  });

  describe('updateSeat', () => {
    test('should update booking with selected seat', () => {
      const { result } = renderHook(() => useBookingFlow());

      let bookingId: string;

      act(() => {
        bookingId = result.current.createBooking(mockFlight, mockSearchParams);
      });

      act(() => {
        result.current.updateSeat(bookingId, '12A', 25);
      });

      expect(result.current.activeBooking?.selectedSeats).toEqual([
        {
          passengerId: 'passenger-1',
          seatNumber: '12A',
          price: 25,
        },
      ]);
    });

    test('should add seat price to total', () => {
      const { result } = renderHook(() => useBookingFlow());

      let bookingId: string;

      act(() => {
        bookingId = result.current.createBooking(mockFlight, mockSearchParams);
      });

      const initialTotal = result.current.activeBooking?.pricing.total;

      act(() => {
        result.current.updateSeat(bookingId, '12A', 25);
      });

      expect(result.current.activeBooking?.pricing.seatFees).toBe(25);
      expect(result.current.activeBooking?.pricing.total).toBe(initialTotal! + 25);
    });

    test('should handle free seat selection', () => {
      const { result } = renderHook(() => useBookingFlow());

      let bookingId: string;

      act(() => {
        bookingId = result.current.createBooking(mockFlight, mockSearchParams);
      });

      act(() => {
        result.current.updateSeat(bookingId, '25F', 0);
      });

      expect(result.current.activeBooking?.pricing.seatFees).toBe(0);
      expect(result.current.activeBooking?.selectedSeats?.[0].seatNumber).toBe('25F');
    });
  });

  describe('updateBaggage', () => {
    test('should update booking with baggage selection', () => {
      const { result } = renderHook(() => useBookingFlow());

      let bookingId: string;

      act(() => {
        bookingId = result.current.createBooking(mockFlight, mockSearchParams);
      });

      act(() => {
        result.current.updateBaggage(bookingId, 2, 60);
      });

      expect(result.current.activeBooking?.selectedBaggage).toEqual([
        {
          passengerId: 'passenger-1',
          quantity: 2,
          price: 60,
        },
      ]);
    });

    test('should add baggage fees to total', () => {
      const { result } = renderHook(() => useBookingFlow());

      let bookingId: string;

      act(() => {
        bookingId = result.current.createBooking(mockFlight, mockSearchParams);
      });

      const initialTotal = result.current.activeBooking?.pricing.total;

      act(() => {
        result.current.updateBaggage(bookingId, 1, 30);
      });

      expect(result.current.activeBooking?.pricing.baggageFees).toBe(30);
      expect(result.current.activeBooking?.pricing.total).toBe(initialTotal! + 30);
    });

    test('should handle no baggage selection', () => {
      const { result } = renderHook(() => useBookingFlow());

      let bookingId: string;

      act(() => {
        bookingId = result.current.createBooking(mockFlight, mockSearchParams);
      });

      act(() => {
        result.current.updateBaggage(bookingId, 0, 0);
      });

      expect(result.current.activeBooking?.selectedBaggage).toBeUndefined();
      expect(result.current.activeBooking?.pricing.baggageFees).toBe(0);
    });
  });

  describe('clearBooking', () => {
    test('should clear active booking', () => {
      const { result } = renderHook(() => useBookingFlow());

      act(() => {
        result.current.createBooking(mockFlight, mockSearchParams);
      });

      expect(result.current.activeBooking).not.toBeNull();

      act(() => {
        result.current.clearBooking();
      });

      expect(result.current.activeBooking).toBeNull();
      expect(result.current.bookingProgress).toBeNull();
      expect(result.current.error).toBeNull();
    });

    test('should remove booking from localStorage', () => {
      const { result } = renderHook(() => useBookingFlow());

      act(() => {
        result.current.createBooking(mockFlight, mockSearchParams);
      });

      expect(localStorage.getItem('activeBooking')).not.toBeNull();

      act(() => {
        result.current.clearBooking();
      });

      expect(localStorage.getItem('activeBooking')).toBeNull();
    });
  });

  describe('loadFareOptions', () => {
    const mockFares: FareOption[] = [
      { id: 'basic', name: 'Basic', price: 500, features: [] },
      { id: 'premium', name: 'Premium', price: 750, features: ['Extra legroom'] },
    ];

    test('should fetch fare options successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ fares: mockFares }),
      });

      const { result } = renderHook(() => useBookingFlow());

      let fares: FareOption[] = [];

      await act(async () => {
        fares = await result.current.loadFareOptions('offer-123');
      });

      expect(fares).toEqual(mockFares);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/booking-flow/fares?offerId=offer-123'
      );
    });

    test('should set loading state during fetch', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ fares: mockFares }),
        }), 100))
      );

      const { result } = renderHook(() => useBookingFlow());

      const promise = act(async () => {
        result.current.loadFareOptions('offer-123');
      });

      expect(result.current.isLoading).toBe(true);

      await promise;

      expect(result.current.isLoading).toBe(false);
    });

    test('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useBookingFlow());

      let fares: FareOption[] = [];

      await act(async () => {
        fares = await result.current.loadFareOptions('offer-123');
      });

      expect(fares).toEqual([]);
      expect(result.current.error).toBeTruthy();
    });

    test('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useBookingFlow());

      let fares: FareOption[] = [];

      await act(async () => {
        fares = await result.current.loadFareOptions('offer-123');
      });

      expect(fares).toEqual([]);
      expect(result.current.error).toContain('Network error');
    });
  });

  describe('loadSeatMap', () => {
    test('should fetch seat map successfully', async () => {
      const mockSeats = [
        { seatNumber: '12A', price: 25, available: true },
        { seatNumber: '12B', price: 25, available: false },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ seats: mockSeats }),
      });

      const { result } = renderHook(() => useBookingFlow());

      let seats: any[] = [];

      await act(async () => {
        seats = await result.current.loadSeatMap('offer-123');
      });

      expect(seats).toEqual(mockSeats);
    });

    test('should return empty array on error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const { result } = renderHook(() => useBookingFlow());

      let seats: any[] = [];

      await act(async () => {
        seats = await result.current.loadSeatMap('offer-123');
      });

      expect(seats).toEqual([]);
    });
  });

  describe('loadBaggageOptions', () => {
    test('should fetch baggage options successfully', async () => {
      const mockBaggage = [
        { type: 'checked', price: 30, weight: '23kg' },
        { type: 'extra', price: 60, weight: '23kg' },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ baggage: mockBaggage }),
      });

      const { result } = renderHook(() => useBookingFlow());

      let baggage: any[] = [];

      await act(async () => {
        baggage = await result.current.loadBaggageOptions('offer-123');
      });

      expect(baggage).toEqual(mockBaggage);
    });
  });

  describe('advanceStage', () => {
    test('should advance to next stage', () => {
      const { result } = renderHook(() => useBookingFlow());

      act(() => {
        result.current.createBooking(mockFlight, mockSearchParams);
      });

      act(() => {
        result.current.advanceStage('fare_selection');
      });

      expect(result.current.bookingProgress?.currentStage).toBe('fare_selection');
      expect(result.current.bookingProgress?.completedStages).toContain('flight_selection');
    });

    test('should update step number', () => {
      const { result } = renderHook(() => useBookingFlow());

      act(() => {
        result.current.createBooking(mockFlight, mockSearchParams);
      });

      const initialStep = result.current.bookingProgress?.currentStepNumber;

      act(() => {
        result.current.advanceStage('review');
      });

      expect(result.current.bookingProgress?.currentStepNumber).not.toBe(initialStep);
    });

    test('should allow moving backwards', () => {
      const { result } = renderHook(() => useBookingFlow());

      act(() => {
        result.current.createBooking(mockFlight, mockSearchParams);
      });

      act(() => {
        result.current.advanceStage('review');
      });

      act(() => {
        result.current.advanceStage('fare_selection');
      });

      expect(result.current.bookingProgress?.currentStage).toBe('fare_selection');
    });
  });

  describe('validateBooking', () => {
    test('should validate required fields exist', () => {
      const { result } = renderHook(() => useBookingFlow());

      act(() => {
        result.current.createBooking(mockFlight, mockSearchParams);
      });

      const isValid = result.current.validateBooking(['selectedFlight', 'searchParams']);

      expect(isValid).toBe(true);
    });

    test('should fail validation when fields missing', () => {
      const { result } = renderHook(() => useBookingFlow());

      act(() => {
        result.current.createBooking(mockFlight, mockSearchParams);
      });

      const isValid = result.current.validateBooking(['passengers']);

      expect(isValid).toBe(false);
    });

    test('should fail validation when no active booking', () => {
      const { result } = renderHook(() => useBookingFlow());

      const isValid = result.current.validateBooking(['selectedFlight']);

      expect(isValid).toBe(false);
    });
  });

  describe('updatePassengers', () => {
    const mockPassengers: PassengerInfo[] = [
      {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        email: 'john@example.com',
        phone: '+1234567890',
        gender: 'male',
        title: 'mr',
      },
    ];

    test('should update booking with passenger info', () => {
      const { result } = renderHook(() => useBookingFlow());

      let bookingId: string;

      act(() => {
        bookingId = result.current.createBooking(mockFlight, mockSearchParams);
      });

      act(() => {
        result.current.updatePassengers(bookingId, mockPassengers);
      });

      expect(result.current.activeBooking?.passengers).toHaveLength(1);
      expect(result.current.activeBooking?.passengers?.[0].firstName).toBe('John');
    });

    test('should save passenger info to localStorage', () => {
      const { result } = renderHook(() => useBookingFlow());

      let bookingId: string;

      act(() => {
        bookingId = result.current.createBooking(mockFlight, mockSearchParams);
      });

      act(() => {
        result.current.updatePassengers(bookingId, mockPassengers);
      });

      const saved = localStorage.getItem('activeBooking');
      const parsed = JSON.parse(saved!);

      expect(parsed.passengers[0].firstName).toBe('John');
    });
  });

  describe('createPaymentIntent', () => {
    test('should create payment intent successfully', async () => {
      const mockPassengers: PassengerInfo[] = [
        {
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1990-01-01',
          email: 'john@example.com',
          phone: '+1234567890',
          gender: 'male',
          title: 'mr',
        },
      ];

      const mockPaymentIntent = {
        paymentIntentId: 'pi_123',
        clientSecret: 'secret_123',
        amount: 500,
        currency: 'USD',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ paymentIntent: mockPaymentIntent }),
      });

      const { result } = renderHook(() => useBookingFlow());

      let bookingId: string;

      act(() => {
        bookingId = result.current.createBooking(mockFlight, mockSearchParams);
      });

      act(() => {
        result.current.updatePassengers(bookingId, mockPassengers);
      });

      let paymentIntent: any;

      await act(async () => {
        paymentIntent = await result.current.createPaymentIntent(bookingId);
      });

      expect(paymentIntent).toEqual(mockPaymentIntent);
    });

    test('should throw error if no passengers', async () => {
      const { result } = renderHook(() => useBookingFlow());

      let bookingId: string;

      act(() => {
        bookingId = result.current.createBooking(mockFlight, mockSearchParams);
      });

      await expect(async () => {
        await act(async () => {
          await result.current.createPaymentIntent(bookingId);
        });
      }).rejects.toThrow('Passenger details required');
    });
  });

  describe('Integration: Complete Booking Flow', () => {
    test('should handle complete booking flow', async () => {
      const { result } = renderHook(() => useBookingFlow());

      // Step 1: Create booking
      let bookingId: string;
      act(() => {
        bookingId = result.current.createBooking(mockFlight, mockSearchParams);
      });

      expect(result.current.activeBooking).not.toBeNull();

      // Step 2: Select fare
      const fare: FareOption = {
        id: 'premium',
        name: 'Premium',
        price: 750,
        features: ['Extra legroom'],
      };

      act(() => {
        result.current.updateFare(bookingId, fare);
      });

      expect(result.current.activeBooking?.selectedFare).toBeDefined();

      // Step 3: Select seat
      act(() => {
        result.current.updateSeat(bookingId, '12A', 25);
      });

      expect(result.current.activeBooking?.selectedSeats).toBeDefined();

      // Step 4: Add baggage
      act(() => {
        result.current.updateBaggage(bookingId, 1, 30);
      });

      expect(result.current.activeBooking?.selectedBaggage).toBeDefined();

      // Verify total price
      const expectedTotal = 750 + 25 + 30; // fare + seat + baggage
      expect(result.current.activeBooking?.pricing.total).toBe(expectedTotal);

      // Step 5: Clear booking
      act(() => {
        result.current.clearBooking();
      });

      expect(result.current.activeBooking).toBeNull();
    });
  });
});
