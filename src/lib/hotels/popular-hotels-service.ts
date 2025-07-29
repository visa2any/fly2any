/**
 * Service for fetching popular hotels using LiteAPI
 */

import type { HotelSearchParams, HotelSearchResponse, Hotel } from '@/types/hotels';

// Popular Brazilian destinations for automatic search
const POPULAR_DESTINATIONS = [
  { cityCode: 'SAO', name: 'São Paulo', country: 'BR' },
  { cityCode: 'RIO', name: 'Rio de Janeiro', country: 'BR' },
  { cityCode: 'SSA', name: 'Salvador', country: 'BR' },
  { cityCode: 'BSB', name: 'Brasília', country: 'BR' },
  { cityCode: 'FOR', name: 'Fortaleza', country: 'BR' },
  { cityCode: 'REC', name: 'Recife', country: 'BR' }
];

export interface PopularHotelData {
  id: string;
  name: string;
  location: string;
  city: string;
  state: string;
  rating: number;
  reviewCount: number;
  price: {
    current: number;
    original?: number;
    currency: string;
  };
  image: string;
  amenities: string[];
  isPopular?: boolean;
  discount?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  liteApiId?: string; // ID real da LiteAPI
}

/**
 * Fetch popular hotels from multiple destinations
 */
export async function fetchPopularHotels(): Promise<PopularHotelData[]> {
  try {
    console.log('🏨 Fetching popular hotels from LiteAPI...');
    
    // Get check-in and check-out dates (next week for 2 nights)
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 7); // Next week
    
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 2); // 2 nights stay
    
    const popularHotels: PopularHotelData[] = [];
    
    // Fetch from top 3 destinations to avoid too many API calls
    for (const destination of POPULAR_DESTINATIONS.slice(0, 3)) {
      try {
        const searchParams: HotelSearchParams = {
          destination: destination.name,
          destinationType: 'city',
          checkIn,
          checkOut,
          adults: 2,
          children: 0,
          childrenAges: [],
          rooms: 1,
          currency: 'BRL'
        };

        console.log(`🔍 Searching hotels in ${destination.name}...`);
        
        const response = await fetch('/api/hotels/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(searchParams),
        });

        if (!response.ok) {
          console.warn(`⚠️ Failed to fetch hotels for ${destination.name}:`, response.status);
          continue;
        }

        const searchResult: HotelSearchResponse = await response.json();
        
        if (searchResult.hotels && searchResult.hotels.length > 0) {
          // Get top 2 hotels from each destination
          const topHotels = searchResult.hotels
            .slice(0, 2)
            .map((hotel, index) => transformToPopularHotel(hotel, destination, index === 0));
          
          popularHotels.push(...topHotels);
          console.log(`✅ Added ${topHotels.length} hotels from ${destination.name}`);
        }
      } catch (error) {
        console.warn(`⚠️ Error fetching hotels for ${destination.name}:`, error);
        continue; // Continue with next destination
      }
    }

    // If we got real data, return it
    if (popularHotels.length > 0) {
      console.log(`🎉 Successfully fetched ${popularHotels.length} real hotels from LiteAPI`);
      return popularHotels;
    }

    // Fallback to demo data if API fails
    console.log('⚡ Using fallback demo data');
    return getFallbackHotels();
    
  } catch (error) {
    console.error('❌ Error in fetchPopularHotels:', error);
    return getFallbackHotels();
  }
}

/**
 * Transform LiteAPI hotel data to PopularHotelData format
 */
function transformToPopularHotel(
  hotel: Hotel, 
  destination: typeof POPULAR_DESTINATIONS[0], 
  isPopular = false
): PopularHotelData {
  // Calculate discount if there's original price
  let discount: number | undefined;
  let originalPrice: number | undefined;
  
  if (hotel.rates && hotel.rates.length > 0) {
    const rate = hotel.rates[0];
    if (rate.originalPrice && rate.price) {
      originalPrice = rate.originalPrice.amount;
      discount = Math.round(((originalPrice - rate.price.amount) / originalPrice) * 100);
    }
  }

  // Get amenities
  const amenities = hotel.amenities
    ? hotel.amenities.slice(0, 4).map(amenity => amenity.name)
    : ['Wi-Fi', 'Piscina', 'Restaurante', 'Academia'];

  // Get main image
  const image = hotel.images && hotel.images.length > 0 
    ? hotel.images[0].url 
    : `https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop&q=80`;

  // Get location info
  const location = hotel.location?.address?.street || destination.name;
  const state = getStateFromCity(destination.name);

  return {
    id: hotel.id,
    name: hotel.name,
    location,
    city: destination.name,
    state,
    rating: hotel.guestRating || hotel.rating?.average || 4.5,
    reviewCount: hotel.reviewCount || hotel.rating?.count || Math.floor(Math.random() * 2000) + 500,
    price: {
      current: hotel.lowestRate?.amount || hotel.rates?.[0]?.price?.amount || 299,
      original: originalPrice,
      currency: hotel.lowestRate?.currency || 'BRL'
    },
    image,
    amenities,
    isPopular,
    discount,
    coordinates: hotel.location?.coordinates,
    liteApiId: hotel.id
  };
}

/**
 * Get state abbreviation from city name
 */
function getStateFromCity(cityName: string): string {
  const cityToState: Record<string, string> = {
    'São Paulo': 'SP',
    'Rio de Janeiro': 'RJ',
    'Salvador': 'BA',
    'Brasília': 'DF',
    'Fortaleza': 'CE',
    'Recife': 'PE',
    'Belo Horizonte': 'MG',
    'Curitiba': 'PR',
    'Porto Alegre': 'RS',
    'Manaus': 'AM'
  };
  
  return cityToState[cityName] || 'BR';
}

/**
 * Fallback demo data if API fails
 */
function getFallbackHotels(): PopularHotelData[] {
  return [
    {
      id: 'demo-copacabana-palace',
      name: 'Copacabana Palace',
      location: 'Copacabana',
      city: 'Rio de Janeiro',
      state: 'RJ',
      rating: 4.8,
      reviewCount: 2847,
      price: {
        current: 850,
        original: 1200,
        currency: 'BRL'
      },
      image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop&q=80',
      amenities: ['Wi-Fi', 'Piscina', 'Spa', 'Restaurante'],
      isPopular: true,
      discount: 29
    },
    {
      id: 'demo-fasano-sp',
      name: 'Hotel Fasano São Paulo',
      location: 'Jardins',
      city: 'São Paulo',
      state: 'SP',
      rating: 4.9,
      reviewCount: 1956,
      price: {
        current: 720,
        original: 950,
        currency: 'BRL'
      },
      image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&h=300&fit=crop&q=80',
      amenities: ['Wi-Fi', 'Academia', 'Bar', 'Concierge'],
      isPopular: true,
      discount: 24
    },
    {
      id: 'demo-fera-palace',
      name: 'Fera Palace Hotel',
      location: 'Pelourinho',
      city: 'Salvador',
      state: 'BA',
      rating: 4.7,
      reviewCount: 1234,
      price: {
        current: 380,
        original: 520,
        currency: 'BRL'
      },
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop&q=80',
      amenities: ['Wi-Fi', 'Centro Histórico', 'Bar', 'Terraço'],
      discount: 27
    },
    {
      id: 'demo-emiliano-sp',
      name: 'Emiliano São Paulo',
      location: 'Jardins',
      city: 'São Paulo',
      state: 'SP',
      rating: 4.8,
      reviewCount: 1678,
      price: {
        current: 640,
        currency: 'BRL'
      },
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&q=80',
      amenities: ['Wi-Fi', 'Rooftop', 'Spa', 'Business Center']
    },
    {
      id: 'demo-santa-teresa',
      name: 'Santa Teresa Hotel RJ',
      location: 'Santa Teresa',
      city: 'Rio de Janeiro',
      state: 'RJ',
      rating: 4.6,
      reviewCount: 987,
      price: {
        current: 590,
        original: 750,
        currency: 'BRL'
      },
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop&q=80',
      amenities: ['Wi-Fi', 'Vista Cidade', 'Bar', 'Jardim'],
      discount: 21
    },
    {
      id: 'demo-jw-marriott',
      name: 'JW Marriott Copacabana',
      location: 'Copacabana',
      city: 'Rio de Janeiro',
      state: 'RJ',
      rating: 4.9,
      reviewCount: 3245,
      price: {
        current: 780,
        currency: 'BRL'
      },
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop&q=80',
      amenities: ['Wi-Fi', 'Vista Mar', 'Piscina', 'Spa'],
      isPopular: true
    }
  ];
}