'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { LiteAPIHotel } from '@/lib/hotels/types';

interface CompareContextType {
  compareList: LiteAPIHotel[];
  addToCompare: (hotel: LiteAPIHotel) => void;
  removeFromCompare: (hotelId: string) => void;
  clearCompare: () => void;
  isInCompare: (hotelId: string) => boolean;
  canAddMore: boolean;
  maxCompare: number;
  isCompareOpen: boolean;
  setCompareOpen: (open: boolean) => void;
}

const HotelCompareContext = createContext<CompareContextType | undefined>(undefined);

const MAX_COMPARE_HOTELS = 4; // Maximum hotels to compare at once

export function HotelCompareProvider({ children }: { children: ReactNode }) {
  const [compareList, setCompareList] = useState<LiteAPIHotel[]>([]);
  const [isCompareOpen, setCompareOpen] = useState(false);

  const addToCompare = useCallback((hotel: LiteAPIHotel) => {
    setCompareList(prev => {
      if (prev.length >= MAX_COMPARE_HOTELS) return prev;
      if (prev.some(h => h.id === hotel.id)) return prev;
      return [...prev, hotel];
    });
  }, []);

  const removeFromCompare = useCallback((hotelId: string) => {
    setCompareList(prev => prev.filter(h => h.id !== hotelId));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareList([]);
    setCompareOpen(false);
  }, []);

  const isInCompare = useCallback((hotelId: string) => {
    return compareList.some(h => h.id === hotelId);
  }, [compareList]);

  const canAddMore = compareList.length < MAX_COMPARE_HOTELS;

  return (
    <HotelCompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        canAddMore,
        maxCompare: MAX_COMPARE_HOTELS,
        isCompareOpen,
        setCompareOpen,
      }}
    >
      {children}
    </HotelCompareContext.Provider>
  );
}

export function useHotelCompare() {
  const context = useContext(HotelCompareContext);
  if (context === undefined) {
    throw new Error('useHotelCompare must be used within a HotelCompareProvider');
  }
  return context;
}
