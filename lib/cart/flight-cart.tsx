'use client';

/**
 * Flight Cart System
 * Single flight booking cart with passenger management
 * Persisted in localStorage for cross-session support
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Types
export interface FlightItem {
  id: string;
  offerId: string;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  departureDate: string;
  arrivalDate: string;
  duration: string;
  stops: string;
  cabinClass: string;
  basePrice: number;
  taxes: number;
  totalPrice: number;
  currency: string;
  passengerCount: number;
  baggageAllowance: string;
  createdAt: string;
}

export interface PassengerInfo {
  id: number;
  type: 'Adult' | 'Child' | 'Infant';
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  passportNumber: string;
  expiryDate: string;
  nationality: string;
  email: string;
  phone: string;
}

interface CartState {
  flight: FlightItem | null;
  passengers: PassengerInfo[];
  total: number;
  currency: string;
}

interface FlightCartContextType {
  flight: FlightItem | null;
  passengers: PassengerInfo[];
  total: number;
  currency: string;
  itemCount: number;
  setFlight: (flight: Omit<FlightItem, 'id' | 'createdAt'>) => void;
  updatePassengerInfo: (passengers: PassengerInfo[]) => void;
  clearCart: () => void;
  removeFlight: () => void;
}

const FLIGHT_CART_STORAGE_KEY = 'fly2any_flight_cart';
const DEFAULT_CURRENCY = 'USD';

const FlightCartContext = createContext<FlightCartContextType | null>(null);

// Generate unique ID
const generateId = () => `flight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Load cart from localStorage
const loadCart = (): CartState => {
  if (typeof window === 'undefined') {
    return { flight: null, passengers: [], total: 0, currency: DEFAULT_CURRENCY };
  }
  try {
    const stored = localStorage.getItem(FLIGHT_CART_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        flight: parsed.flight || null,
        passengers: parsed.passengers || [],
        total: parsed.total || 0,
        currency: parsed.currency || DEFAULT_CURRENCY,
      };
    }
  } catch (e) {
    console.error('Failed to load flight cart:', e);
  }
  return { flight: null, passengers: [], total: 0, currency: DEFAULT_CURRENCY };
};

// Save cart to localStorage
const saveCart = (state: CartState) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FLIGHT_CART_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save flight cart:', e);
  }
};

export function FlightCartProvider({ children }: { children: ReactNode }) {
  const [flight, setFlightState] = useState<FlightItem | null>(null);
  const [passengers, setPassengers] = useState<PassengerInfo[]>([]);
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart on mount
  useEffect(() => {
    const cart = loadCart();
    setFlightState(cart.flight);
    setPassengers(cart.passengers);
    setCurrency(cart.currency);
    setIsLoaded(true);
  }, []);

  // Save cart on changes
  useEffect(() => {
    if (isLoaded) {
      const total = flight?.totalPrice || 0;
      saveCart({ flight, passengers, total, currency });
    }
  }, [flight, passengers, currency, isLoaded]);

  const setFlight = useCallback((flightData: Omit<FlightItem, 'id' | 'createdAt'>) => {
    const newFlight: FlightItem = {
      ...flightData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setFlightState(newFlight);
    
    // Initialize default passenger if none exist
    if (passengers.length === 0) {
      setPassengers([
        { 
          id: 1, 
          type: 'Adult', 
          firstName: '', 
          lastName: '', 
          dateOfBirth: '', 
          gender: '', 
          passportNumber: '', 
          expiryDate: '', 
          nationality: '', 
          email: '', 
          phone: '' 
        }
      ]);
    }
  }, [passengers.length]);

  const updatePassengerInfo = useCallback((updatedPassengers: PassengerInfo[]) => {
    setPassengers(updatedPassengers);
  }, []);

  const clearCart = useCallback(() => {
    setFlightState(null);
    setPassengers([]);
    setCurrency(DEFAULT_CURRENCY);
  }, []);

  const removeFlight = useCallback(() => {
    setFlightState(null);
  }, []);

  const value: FlightCartContextType = {
    flight,
    passengers,
    total: flight?.totalPrice || 0,
    currency,
    itemCount: flight ? 1 : 0,
    setFlight,
    updatePassengerInfo,
    clearCart,
    removeFlight,
  };

  return (
    <FlightCartContext.Provider value={value}>
      {children}
    </FlightCartContext.Provider>
  );
}

export function useFlightCart() {
  const context = useContext(FlightCartContext);
  if (!context) {
    throw new Error('useFlightCart must be used within FlightCartProvider');
  }
  return context;
}