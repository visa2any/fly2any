'use client';

/**
 * Journey Context - Global State Management
 * Fly2Any Travel Operating System
 */

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import {
  Journey,
  JourneyState,
  JourneyAction,
  JourneyDay,
  JourneyExperience,
  JourneyAccommodation,
  JourneySearchParams,
} from '../types';
import { FlightOffer } from '@/lib/flights/types';

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: JourneyState = {
  journey: null,
  isBuilding: false,
  buildProgress: 0,
  selectedDayIndex: 0,
  error: null,
};

// ============================================================================
// REDUCER
// ============================================================================

function journeyReducer(state: JourneyState, action: JourneyAction): JourneyState {
  switch (action.type) {
    case 'SET_JOURNEY':
      return { ...state, journey: action.payload, error: null };

    case 'SET_BUILDING':
      return { ...state, isBuilding: action.payload };

    case 'SET_BUILD_PROGRESS':
      return { ...state, buildProgress: action.payload };

    case 'SET_SELECTED_DAY':
      return { ...state, selectedDayIndex: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isBuilding: false };

    case 'UPDATE_DAY':
      if (!state.journey) return state;
      const updatedDays = [...state.journey.days];
      updatedDays[action.payload.dayIndex] = action.payload.day;
      return {
        ...state,
        journey: { ...state.journey, days: updatedDays, updatedAt: new Date().toISOString() },
      };

    case 'ADD_EXPERIENCE':
      if (!state.journey) return state;
      const daysWithNewExp = [...state.journey.days];
      daysWithNewExp[action.payload.dayIndex] = {
        ...daysWithNewExp[action.payload.dayIndex],
        experiences: [
          ...daysWithNewExp[action.payload.dayIndex].experiences,
          action.payload.experience,
        ],
      };
      return {
        ...state,
        journey: { ...state.journey, days: daysWithNewExp, updatedAt: new Date().toISOString() },
      };

    case 'REMOVE_EXPERIENCE':
      if (!state.journey) return state;
      const daysWithRemovedExp = [...state.journey.days];
      daysWithRemovedExp[action.payload.dayIndex] = {
        ...daysWithRemovedExp[action.payload.dayIndex],
        experiences: daysWithRemovedExp[action.payload.dayIndex].experiences.filter(
          (e) => e.id !== action.payload.experienceId
        ),
      };
      return {
        ...state,
        journey: { ...state.journey, days: daysWithRemovedExp, updatedAt: new Date().toISOString() },
      };

    case 'UPDATE_EXPERIENCE':
      if (!state.journey) return state;
      const daysWithUpdatedExp = [...state.journey.days];
      const expIndex = daysWithUpdatedExp[action.payload.dayIndex].experiences.findIndex(
        (e) => e.id === action.payload.experience.id
      );
      if (expIndex !== -1) {
        daysWithUpdatedExp[action.payload.dayIndex].experiences[expIndex] = action.payload.experience;
      }
      return {
        ...state,
        journey: { ...state.journey, days: daysWithUpdatedExp, updatedAt: new Date().toISOString() },
      };

    case 'SET_FLIGHT':
      if (!state.journey) return state;
      const flightDayIndex = action.payload.direction === 'outbound' ? 0 : state.journey.days.length - 1;
      const flightSegmentType = action.payload.direction === 'outbound' ? 'outbound-flight' : 'return-flight';
      const daysWithFlight = [...state.journey.days];
      daysWithFlight[flightDayIndex] = {
        ...daysWithFlight[flightDayIndex],
        segments: daysWithFlight[flightDayIndex].segments.map((seg) => {
          if (seg.type === flightSegmentType) {
            return {
              ...seg,
              type: action.payload.direction === 'outbound'
                ? 'outbound-flight' as const
                : 'return-flight' as const,
            };
          }
          return seg;
        }),
      };
      return {
        ...state,
        journey: { ...state.journey, days: daysWithFlight, updatedAt: new Date().toISOString() },
      };

    case 'SET_HOTEL':
      if (!state.journey) return state;
      const daysWithHotel = state.journey.days.map((day, idx) => {
        // Hotel applies to all nights except last day (checkout)
        if (idx < state.journey!.days.length - 1) {
          return { ...day, accommodation: action.payload };
        }
        return day;
      });
      return {
        ...state,
        journey: { ...state.journey, days: daysWithHotel, updatedAt: new Date().toISOString() },
      };

    case 'RESET_JOURNEY':
      return initialState;

    default:
      return state;
  }
}

// ============================================================================
// CONTEXT
// ============================================================================

interface JourneyContextValue extends JourneyState {
  // Actions
  setJourney: (journey: Journey) => void;
  setBuilding: (isBuilding: boolean) => void;
  setBuildProgress: (progress: number) => void;
  setSelectedDay: (index: number) => void;
  setError: (error: string | null) => void;
  updateDay: (dayIndex: number, day: JourneyDay) => void;
  addExperience: (dayIndex: number, experience: JourneyExperience) => void;
  removeExperience: (dayIndex: number, experienceId: string) => void;
  updateExperience: (dayIndex: number, experience: JourneyExperience) => void;
  setFlight: (direction: 'outbound' | 'return', flight: FlightOffer) => void;
  setHotel: (accommodation: JourneyAccommodation) => void;
  resetJourney: () => void;
  // Computed
  selectedDay: JourneyDay | null;
  totalDays: number;
  hasOutboundFlight: boolean;
  hasReturnFlight: boolean;
  hasHotel: boolean;
}

const JourneyContext = createContext<JourneyContextValue | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

interface JourneyProviderProps {
  children: ReactNode;
}

export function JourneyProvider({ children }: JourneyProviderProps) {
  const [state, dispatch] = useReducer(journeyReducer, initialState);

  // Actions
  const setJourney = useCallback((journey: Journey) => {
    dispatch({ type: 'SET_JOURNEY', payload: journey });
  }, []);

  const setBuilding = useCallback((isBuilding: boolean) => {
    dispatch({ type: 'SET_BUILDING', payload: isBuilding });
  }, []);

  const setBuildProgress = useCallback((progress: number) => {
    dispatch({ type: 'SET_BUILD_PROGRESS', payload: progress });
  }, []);

  const setSelectedDay = useCallback((index: number) => {
    dispatch({ type: 'SET_SELECTED_DAY', payload: index });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const updateDay = useCallback((dayIndex: number, day: JourneyDay) => {
    dispatch({ type: 'UPDATE_DAY', payload: { dayIndex, day } });
  }, []);

  const addExperience = useCallback((dayIndex: number, experience: JourneyExperience) => {
    dispatch({ type: 'ADD_EXPERIENCE', payload: { dayIndex, experience } });
  }, []);

  const removeExperience = useCallback((dayIndex: number, experienceId: string) => {
    dispatch({ type: 'REMOVE_EXPERIENCE', payload: { dayIndex, experienceId } });
  }, []);

  const updateExperience = useCallback((dayIndex: number, experience: JourneyExperience) => {
    dispatch({ type: 'UPDATE_EXPERIENCE', payload: { dayIndex, experience } });
  }, []);

  const setFlight = useCallback((direction: 'outbound' | 'return', flight: FlightOffer) => {
    dispatch({ type: 'SET_FLIGHT', payload: { direction, flight } });
  }, []);

  const setHotel = useCallback((accommodation: JourneyAccommodation) => {
    dispatch({ type: 'SET_HOTEL', payload: accommodation });
  }, []);

  const resetJourney = useCallback(() => {
    dispatch({ type: 'RESET_JOURNEY' });
  }, []);

  // Computed values
  const selectedDay = state.journey?.days[state.selectedDayIndex] ?? null;
  const totalDays = state.journey?.days.length ?? 0;

  const hasOutboundFlight = state.journey?.days[0]?.segments.some(
    (s) => s.type === 'outbound-flight' && s.flight
  ) ?? false;

  const hasReturnFlight = state.journey?.days[state.journey.days.length - 1]?.segments.some(
    (s) => s.type === 'return-flight' && s.flight
  ) ?? false;

  const hasHotel = state.journey?.days.some((d) =>
    d.segments.some((s) => s.type === 'hotel' && s.hotel) || d.accommodation
  ) ?? false;

  const value: JourneyContextValue = {
    ...state,
    setJourney,
    setBuilding,
    setBuildProgress,
    setSelectedDay,
    setError,
    updateDay,
    addExperience,
    removeExperience,
    updateExperience,
    setFlight,
    setHotel,
    resetJourney,
    selectedDay,
    totalDays,
    hasOutboundFlight,
    hasReturnFlight,
    hasHotel,
  };

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

export function useJourney() {
  const context = useContext(JourneyContext);
  if (context === undefined) {
    throw new Error('useJourney must be used within a JourneyProvider');
  }
  return context;
}

export default JourneyContext;
