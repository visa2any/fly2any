'use client';

import { useState, useEffect } from 'react';

export interface FavoriteDestination {
  id: string;
  city: string;
  country: string;
  price: number;
  from: string;
  to: string;
  savedAt: number;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteDestination[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('favorites');
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading favorites:', e);
      }
    }
  }, []);

  const addFavorite = (destination: Omit<FavoriteDestination, 'savedAt'>) => {
    const newFavorite = { ...destination, savedAt: Date.now() };
    const updated = [...favorites, newFavorite];
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  const removeFavorite = (id: string) => {
    const updated = favorites.filter(fav => fav.id !== id);
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  const isFavorite = (id: string) => {
    return favorites.some(fav => fav.id === id);
  };

  const toggleFavorite = (destination: Omit<FavoriteDestination, 'savedAt'>) => {
    if (isFavorite(destination.id)) {
      removeFavorite(destination.id);
    } else {
      addFavorite(destination);
    }
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
  };
}

// Save to recently viewed
export function saveToRecentlyViewed(destination: {
  id: string;
  city: string;
  country: string;
  price: number;
  imageUrl: string;
  from?: string;  // Origin airport code
  to: string;     // Destination airport code
}) {
  const stored = localStorage.getItem('recentlyViewed');
  let recentlyViewed = [];

  if (stored) {
    try {
      recentlyViewed = JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing recently viewed:', e);
    }
  }

  // Remove if already exists (to update timestamp)
  recentlyViewed = recentlyViewed.filter((item: any) => item.id !== destination.id);

  // Add to beginning
  recentlyViewed.unshift({
    ...destination,
    viewedAt: Date.now(),
  });

  // Keep only last 10
  recentlyViewed = recentlyViewed.slice(0, 10);

  localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
}
