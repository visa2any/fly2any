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

// Comprehensive airport code to city/country mapping for popular destinations
const AIRPORT_TO_CITY: Record<string, { city: string; country: string; imageUrl: string }> = {
  // North America
  'LAX': { city: 'Los Angeles', country: 'United States', imageUrl: 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800&h=600&fit=crop' },
  'MIA': { city: 'Miami', country: 'United States', imageUrl: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800&h=600&fit=crop' },
  'JFK': { city: 'New York', country: 'United States', imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop' },
  'LGA': { city: 'New York', country: 'United States', imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop' },
  'EWR': { city: 'Newark', country: 'United States', imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop' },
  'ORD': { city: 'Chicago', country: 'United States', imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=600&fit=crop' },
  'SFO': { city: 'San Francisco', country: 'United States', imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop' },
  'SEA': { city: 'Seattle', country: 'United States', imageUrl: 'https://images.unsplash.com/photo-1541878669-4cddc5b72e4d?w=800&h=600&fit=crop' },
  'DEN': { city: 'Denver', country: 'United States', imageUrl: 'https://images.unsplash.com/photo-1619856699906-09e1f58c98b1?w=800&h=600&fit=crop' },
  'ATL': { city: 'Atlanta', country: 'United States', imageUrl: 'https://images.unsplash.com/photo-1565084888279-aca607ecce28?w=800&h=600&fit=crop' },
  'DFW': { city: 'Dallas', country: 'United States', imageUrl: 'https://images.unsplash.com/photo-1552485096-d67f40ffee66?w=800&h=600&fit=crop' },
  'BOS': { city: 'Boston', country: 'United States', imageUrl: 'https://images.unsplash.com/photo-1554222504-9f4459e8aa40?w=800&h=600&fit=crop' },
  'YYZ': { city: 'Toronto', country: 'Canada', imageUrl: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800&h=600&fit=crop' },
  'YVR': { city: 'Vancouver', country: 'Canada', imageUrl: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&h=600&fit=crop' },
  'MEX': { city: 'Mexico City', country: 'Mexico', imageUrl: 'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?w=800&h=600&fit=crop' },

  // Europe
  'LHR': { city: 'London', country: 'United Kingdom', imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop' },
  'CDG': { city: 'Paris', country: 'France', imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&h=600&fit=crop' },
  'FCO': { city: 'Rome', country: 'Italy', imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop' },
  'BCN': { city: 'Barcelona', country: 'Spain', imageUrl: 'https://images.unsplash.com/photo-1562883676-8c7feb83f09b?w=800&h=600&fit=crop' },
  'MAD': { city: 'Madrid', country: 'Spain', imageUrl: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&h=600&fit=crop' },
  'AMS': { city: 'Amsterdam', country: 'Netherlands', imageUrl: 'https://images.unsplash.com/photo-1459679749680-18eb1eb37418?w=800&h=600&fit=crop' },
  'FRA': { city: 'Frankfurt', country: 'Germany', imageUrl: 'https://images.unsplash.com/photo-1574856344991-aaa31e5f4e0d?w=800&h=600&fit=crop' },
  'MUC': { city: 'Munich', country: 'Germany', imageUrl: 'https://images.unsplash.com/photo-1595867818082-083862f3d630?w=800&h=600&fit=crop' },
  'IST': { city: 'Istanbul', country: 'Turkey', imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&h=600&fit=crop' },

  // South America
  'GRU': { city: 'São Paulo', country: 'Brazil', imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=600&fit=crop' },
  'GIG': { city: 'Rio de Janeiro', country: 'Brazil', imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=600&fit=crop' },
  'EZE': { city: 'Buenos Aires', country: 'Argentina', imageUrl: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&h=600&fit=crop' },
  'LIM': { city: 'Lima', country: 'Peru', imageUrl: 'https://images.unsplash.com/photo-1531968455429-749562d22f32?w=800&h=600&fit=crop' },
  'BOG': { city: 'Bogotá', country: 'Colombia', imageUrl: 'https://images.unsplash.com/photo-1568632234857-c9bc58428001?w=800&h=600&fit=crop' },

  // Asia-Pacific
  'NRT': { city: 'Tokyo', country: 'Japan', imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop' },
  'HND': { city: 'Tokyo', country: 'Japan', imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop' },
  'SIN': { city: 'Singapore', country: 'Singapore', imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop' },
  'HKG': { city: 'Hong Kong', country: 'China', imageUrl: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=800&h=600&fit=crop' },
  'SYD': { city: 'Sydney', country: 'Australia', imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&h=600&fit=crop' },
  'MEL': { city: 'Melbourne', country: 'Australia', imageUrl: 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=800&h=600&fit=crop' },
  'DPS': { city: 'Bali', country: 'Indonesia', imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop' },
  'BKK': { city: 'Bangkok', country: 'Thailand', imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&h=600&fit=crop' },
  'DEL': { city: 'Delhi', country: 'India', imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=600&fit=crop' },

  // Caribbean & Beach
  'CUN': { city: 'Cancún', country: 'Mexico', imageUrl: 'https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=800&h=600&fit=crop' },
  'PUJ': { city: 'Punta Cana', country: 'Dominican Republic', imageUrl: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800&h=600&fit=crop' },
  'MBJ': { city: 'Montego Bay', country: 'Jamaica', imageUrl: 'https://images.unsplash.com/photo-1568214379698-cca9cd2c6e16?w=800&h=600&fit=crop' },
  'NAS': { city: 'Nassau', country: 'Bahamas', imageUrl: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800&h=600&fit=crop' },
  'AUA': { city: 'Aruba', country: 'Aruba', imageUrl: 'https://images.unsplash.com/photo-1595776613215-fe04b78de7d0?w=800&h=600&fit=crop' },
  'HNL': { city: 'Honolulu', country: 'United States', imageUrl: 'https://images.unsplash.com/photo-1542259009477-d625272157b7?w=800&h=600&fit=crop' },

  // Middle East & Africa
  'DXB': { city: 'Dubai', country: 'United Arab Emirates', imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop' },
  'DOH': { city: 'Doha', country: 'Qatar', imageUrl: 'https://images.unsplash.com/photo-1601281863990-ecc05af5b02e?w=800&h=600&fit=crop' },
  'CAI': { city: 'Cairo', country: 'Egypt', imageUrl: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&h=600&fit=crop' },
  'CPT': { city: 'Cape Town', country: 'South Africa', imageUrl: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&h=600&fit=crop' },
};

// Helper function to get city/country from airport code
export function getCityFromAirport(airportCode: string): { city: string; country: string; imageUrl: string } {
  return AIRPORT_TO_CITY[airportCode] || {
    city: airportCode,
    country: 'Unknown',
    imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop'
  };
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

// Save to recently viewed - enhanced to auto-resolve airport codes
export function saveToRecentlyViewed(destination: {
  id: string;
  city?: string;
  country?: string;
  price: number;
  imageUrl?: string;
  from?: string;  // Origin airport code
  to: string;     // Destination airport code
}) {
  // Auto-resolve city/country/image from airport code if not provided
  const destinationInfo = getCityFromAirport(destination.to);

  const fullDestination = {
    id: destination.id,
    city: destination.city || destinationInfo.city,
    country: destination.country || destinationInfo.country,
    price: destination.price,
    imageUrl: destination.imageUrl || destinationInfo.imageUrl,
    from: destination.from,
    to: destination.to,
    viewedAt: Date.now(),
  };

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
  recentlyViewed = recentlyViewed.filter((item: any) => item.id !== fullDestination.id);

  // Add to beginning
  recentlyViewed.unshift(fullDestination);

  // Keep only last 20 (increased from 10 for better history)
  recentlyViewed = recentlyViewed.slice(0, 20);

  localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));

  console.log('✅ Saved to recently viewed:', fullDestination.city, fullDestination.country);
}

// Track flight search from results page
export function trackFlightSearch(params: {
  from: string;
  to: string;
  price?: number;
  departureDate?: string;
  returnDate?: string;
}) {
  try {
    const destinationInfo = getCityFromAirport(params.to);

    // Generate unique ID based on search params
    const searchId = `${params.from}-${params.to}-${params.departureDate || 'anytime'}`;

    saveToRecentlyViewed({
      id: searchId,
      city: destinationInfo.city,
      country: destinationInfo.country,
      price: params.price || 0,
      imageUrl: destinationInfo.imageUrl,
      from: params.from,
      to: params.to,
    });
  } catch (error) {
    console.error('Error tracking flight search:', error);
  }
}
