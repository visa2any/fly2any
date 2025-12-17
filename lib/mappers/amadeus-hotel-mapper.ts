/**
 * Amadeus Hotels API Data Mapper
 *
 * Converts Amadeus hotel offer responses to our standardized Hotel interface.
 * This allows HotelCard and other components to work seamlessly with Amadeus data.
 */

import type { Hotel, HotelRate, HotelImage } from '@/lib/hotels/types';

/**
 * Amadeus Hotel Offer Response Structure (from API docs)
 */
interface AmadeusHotelOffer {
  type: 'hotel-offers';
  hotel: {
    hotelId: string;
    name: string;
    rating?: number; // Star rating (1-5)
    cityCode?: string;
    latitude?: number;
    longitude?: number;
    hotelDistance?: {
      distance: number;
      distanceUnit: 'KM' | 'MILE';
    };
    address?: {
      countryCode?: string;
      cityName?: string;
      lines?: string[];
    };
    contact?: {
      phone?: string;
      email?: string;
    };
    amenities?: string[]; // e.g., ["WIFI", "POOL", "GYM"]
    media?: Array<{
      uri: string;
      category?: string; // e.g., "EXTERIOR", "ROOM", "LOBBY"
    }>;
    description?: {
      text?: string;
    };
  };
  offers: Array<{
    id: string;
    checkInDate: string;
    checkOutDate: string;
    roomQuantity?: number;
    rateCode?: string;
    room?: {
      type?: string;
      typeEstimated?: {
        category?: string;
        beds?: number;
        bedType?: string;
      };
      description?: {
        text?: string;
      };
    };
    guests?: {
      adults: number;
    };
    price: {
      currency: string;
      base?: string;
      total: string;
      variations?: {
        average?: {
          base?: string;
        };
      };
    };
    policies?: {
      cancellation?: {
        type?: string;
        description?: string;
        deadline?: string;
      };
      guarantee?: {
        acceptedPayments?: {
          methods?: string[];
        };
      };
    };
    boardType?: string; // e.g., "ROOM_ONLY", "BREAKFAST"
  }>;
}

/**
 * Map Amadeus amenity codes to user-friendly names
 */
const amenityMapping: Record<string, string> = {
  WIFI: 'WiFi',
  POOL: 'Pool',
  GYM: 'Gym',
  SPA: 'Spa',
  RESTAURANT: 'Restaurant',
  BAR: 'Bar',
  PARKING: 'Parking',
  AIRPORT_SHUTTLE: 'Airport Shuttle',
  ROOM_SERVICE: 'Room Service',
  AIR_CONDITIONING: 'Air Conditioning',
  PETS_ALLOWED: 'Pet Friendly',
  KITCHEN: 'Kitchen',
  LAUNDRY: 'Laundry',
  BUSINESS_CENTER: 'Business Center',
  MEETING_ROOMS: 'Meeting Rooms',
};

/**
 * Convert Amadeus cancellation type to our format
 */
function mapCancellationPolicy(policy: any) {
  if (!policy) {
    return {
      type: 'non_refundable' as const,
      description: 'Non-refundable rate',
    };
  }

  const type = policy.type || '';
  const isFree = type.includes('FULL') || type.includes('FREE');

  return {
    type: isFree ? ('free_cancellation' as const) : ('partial_refund' as const),
    description: policy.description || (isFree ? 'Free cancellation available' : 'Partial refund available'),
    deadlineDate: policy.deadline ? policy.deadline.split('T')[0] : undefined,
  };
}

/**
 * Map single Amadeus hotel offer to our Hotel interface
 */
export function mapAmadeusHotelToHotel(amadeusOffer: AmadeusHotelOffer): Hotel {
  const hotel = amadeusOffer.hotel;
  const offers = amadeusOffer.offers || [];

  // Map images
  const images: HotelImage[] = (hotel.media || []).map((media) => ({
    url: media.uri,
    type: media.category?.toLowerCase() as any,
  }));

  // Add placeholder image if no images available
  if (images.length === 0) {
    images.push({
      url: `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop`,
      type: 'exterior',
    });
  }

  // Map amenities
  const amenities = (hotel.amenities || [])
    .map((code) => amenityMapping[code] || code)
    .slice(0, 10); // Limit to 10 amenities

  // Map offers to rates
  const rates: HotelRate[] = offers.map((offer) => {
    const room = offer.room || {};
    const roomType = room.typeEstimated?.category || room.type || 'Standard Room';
    const bedType = room.typeEstimated?.bedType || undefined;
    const bedCount = room.typeEstimated?.beds || 1;

    return {
      id: offer.id,
      hotelId: hotel.hotelId,
      roomType: roomType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase()),
      roomDescription: room.description?.text,
      bedType: bedType?.toLowerCase().replace(/_/g, ' '),
      bedCount,
      maxOccupancy: offer.guests?.adults || 2,
      price: {
        amount: offer.price.base || offer.price.total,
        currency: offer.price.currency,
        base: offer.price.base,
        taxes: offer.price.base
          ? (parseFloat(offer.price.total) - parseFloat(offer.price.base)).toFixed(2)
          : undefined,
      },
      totalPrice: {
        amount: offer.price.total,
        currency: offer.price.currency,
      },
      cancellationPolicy: mapCancellationPolicy(offer.policies?.cancellation),
      paymentType: 'prepaid' as const,
      refundable: offer.policies?.cancellation?.type?.includes('FULL') || false,
      mealsIncluded: (offer.boardType?.toLowerCase().includes('breakfast') ? 'breakfast' : 'none') as any,
      amenities: [],
      available: true,
      rateType: 'standard' as const,
    };
  });

  // Sort rates by price (lowest first)
  rates.sort((a, b) => parseFloat(a.totalPrice.amount) - parseFloat(b.totalPrice.amount));

  // Build address
  const address = {
    street: hotel.address?.lines?.[0],
    city: hotel.address?.cityName || hotel.cityCode || 'Unknown',
    state: undefined,
    country: hotel.address?.countryCode || 'Unknown',
    postalCode: undefined,
  };

  // Build location
  const location = {
    lat: hotel.latitude || 0,
    lng: hotel.longitude || 0,
  };

  // Calculate distance if available
  const distanceKm = hotel.hotelDistance
    ? hotel.hotelDistance.distanceUnit === 'MILE'
      ? hotel.hotelDistance.distance * 1.60934
      : hotel.hotelDistance.distance
    : undefined;

  return {
    id: hotel.hotelId,
    name: hotel.name,
    description: hotel.description?.text,
    address,
    location,
    starRating: hotel.rating,
    propertyType: 'hotel', // Amadeus doesn't provide this, default to hotel
    images,
    amenities,
    facilities: [], // Not provided by Amadeus
    phone: hotel.contact?.phone,
    email: hotel.contact?.email,
    distanceKm,
    rates,
    source: 'Amadeus',
  };
}

/**
 * Map array of Amadeus hotel offers to Hotel array
 */
export function mapAmadeusHotelsToHotels(amadeusOffers: AmadeusHotelOffer[]): Hotel[] {
  return amadeusOffers.map(mapAmadeusHotelToHotel);
}

/**
 * Extract city code from location query
 * Common patterns:
 * - "New York" -> "NYC"
 * - "Paris" -> "PAR"
 * - "London" -> "LON"
 *
 * For now, we'll use a simple mapping. In production, you'd want to use
 * Amadeus Airport & City Search API to get the correct code.
 */
export function extractCityCode(locationQuery: string): string {
  const cityCodeMap: Record<string, string> = {
    // North America - USA
    'new york': 'NYC',
    'los angeles': 'LAX',
    'chicago': 'CHI',
    'miami': 'MIA',
    'las vegas': 'LAS',
    'san francisco': 'SFO',
    'boston': 'BOS',
    'washington': 'WAS',
    'seattle': 'SEA',
    'orlando': 'ORL',
    'denver': 'DEN',
    'atlanta': 'ATL',
    'houston': 'HOU',
    'dallas': 'DFW',
    'phoenix': 'PHX',
    'philadelphia': 'PHL',
    'san diego': 'SAN',
    'austin': 'AUS',
    'nashville': 'BNA',
    'portland': 'PDX',
    'new orleans': 'MSY',
    'honolulu': 'HNL',
    'anchorage': 'ANC',

    // North America - Canada
    'toronto': 'YTO',
    'vancouver': 'YVR',
    'montreal': 'YMQ',
    'calgary': 'YYC',
    'ottawa': 'YOW',
    'edmonton': 'YEA',
    'quebec': 'YQB',

    // North America - Mexico & Central America
    'mexico city': 'MEX',
    'cancun': 'CUN',
    'guadalajara': 'GDL',
    'monterrey': 'MTY',
    'tijuana': 'TIJ',
    'cabo san lucas': 'SJD',
    'puerto vallarta': 'PVR',
    'playa del carmen': 'PCM',

    // Caribbean
    'san juan': 'SJU',
    'nassau': 'NAS',
    'havana': 'HAV',
    'kingston': 'KIN',
    'santo domingo': 'SDQ',
    'montego bay': 'MBJ',
    'punta cana': 'PUJ',
    'bridgetown': 'BGI',

    // Europe - Western Europe
    'london': 'LON',
    'paris': 'PAR',
    'amsterdam': 'AMS',
    'brussels': 'BRU',
    'dublin': 'DUB',
    'edinburgh': 'EDI',
    'manchester': 'MAN',
    'glasgow': 'GLA',
    'birmingham': 'BHX',
    'copenhagen': 'CPH',
    'oslo': 'OSL',
    'stockholm': 'STO',
    'helsinki': 'HEL',
    'reykjavik': 'REK',

    // Europe - Southern Europe
    'rome': 'ROM',
    'barcelona': 'BCN',
    'madrid': 'MAD',
    'lisbon': 'LIS',
    'athens': 'ATH',
    'milan': 'MIL',
    'venice': 'VCE',
    'florence': 'FLR',
    'naples': 'NAP',
    'seville': 'SVQ',
    'valencia': 'VLC',
    'porto': 'OPO',
    'nice': 'NCE',
    'marseille': 'MRS',
    'lyon': 'LYS',

    // Europe - Central & Eastern Europe
    'berlin': 'BER',
    'munich': 'MUC',
    'frankfurt': 'FRA',
    'hamburg': 'HAM',
    'cologne': 'CGN',
    'vienna': 'VIE',
    'prague': 'PRG',
    'budapest': 'BUD',
    'warsaw': 'WAW',
    'krakow': 'KRK',
    'bucharest': 'BUH',
    'sofia': 'SOF',
    'belgrade': 'BEG',
    'zagreb': 'ZAG',
    'ljubljana': 'LJU',
    'tallinn': 'TLL',
    'riga': 'RIX',
    'vilnius': 'VNO',
    'moscow': 'MOW',
    'st petersburg': 'LED',
    'kiev': 'IEV',
    'istanbul': 'IST',
    'ankara': 'ANK',

    // Middle East
    'dubai': 'DXB',
    'abu dhabi': 'AUH',
    'doha': 'DOH',
    'riyadh': 'RUH',
    'jeddah': 'JED',
    'muscat': 'MCT',
    'kuwait': 'KWI',
    'bahrain': 'BAH',
    'amman': 'AMM',
    'beirut': 'BEY',
    'tel aviv': 'TLV',
    'jerusalem': 'JRS',
    'cairo': 'CAI',

    // Africa
    'johannesburg': 'JNB',
    'cape town': 'CPT',
    'durban': 'DUR',
    'nairobi': 'NBO',
    'lagos': 'LOS',
    'casablanca': 'CAS',
    'marrakech': 'RAK',
    'tunis': 'TUN',
    'algiers': 'ALG',
    'addis ababa': 'ADD',
    'dar es salaam': 'DAR',
    'accra': 'ACC',
    'dakar': 'DKR',
    'kigali': 'KGL',

    // Asia - East Asia
    'tokyo': 'TYO',
    'osaka': 'OSA',
    'kyoto': 'UKY',
    'seoul': 'SEL',
    'busan': 'PUS',
    'beijing': 'BJS',
    'shanghai': 'SHA',
    'guangzhou': 'CAN',
    'shenzhen': 'SZX',
    'hong kong': 'HKG',
    'taipei': 'TPE',
    'macau': 'MFM',

    // Asia - Southeast Asia
    'singapore': 'SIN',
    'bangkok': 'BKK',
    'kuala lumpur': 'KUL',
    'manila': 'MNL',
    'jakarta': 'JKT',
    'bali': 'DPS',
    'ho chi minh': 'SGN',
    'hanoi': 'HAN',
    'phnom penh': 'PNH',
    'yangon': 'RGN',
    'vientiane': 'VTE',
    'phuket': 'HKT',
    'chiang mai': 'CNX',
    'siem reap': 'REP',

    // Asia - South Asia
    'mumbai': 'BOM',
    'delhi': 'DEL',
    'bangalore': 'BLR',
    'chennai': 'MAA',
    'kolkata': 'CCU',
    'hyderabad': 'HYD',
    'ahmedabad': 'AMD',
    'pune': 'PNQ',
    'jaipur': 'JAI',
    'goa': 'GOI',
    'kathmandu': 'KTM',
    'colombo': 'CMB',
    'dhaka': 'DAC',
    'karachi': 'KHI',
    'islamabad': 'ISB',
    'lahore': 'LHE',

    // South America
    'sao paulo': 'SAO',
    'rio de janeiro': 'RIO',
    'brasilia': 'BSB',
    'salvador': 'SSA',
    'fortaleza': 'FOR',
    'buenos aires': 'BUE',
    'cordoba': 'COR',
    'mendoza': 'MDZ',
    'lima': 'LIM',
    'cusco': 'CUZ',
    'bogota': 'BOG',
    'medellin': 'MDE',
    'cartagena': 'CTG',
    'santiago': 'SCL',
    'valparaiso': 'VAP',
    'quito': 'UIO',
    'guayaquil': 'GYE',
    'montevideo': 'MVD',
    'asuncion': 'ASU',
    'la paz': 'LPB',
    'caracas': 'CCS',

    // Oceania
    'sydney': 'SYD',
    'melbourne': 'MEL',
    'brisbane': 'BNE',
    'perth': 'PER',
    'adelaide': 'ADL',
    'gold coast': 'OOL',
    'canberra': 'CBR',
    'auckland': 'AKL',
    'wellington': 'WLG',
    'christchurch': 'CHC',
    'queenstown': 'ZQN',
    'fiji': 'NAN',
    'tahiti': 'PPT',
  };

  const normalized = locationQuery.toLowerCase().trim();

  // Direct match
  if (cityCodeMap[normalized]) {
    return cityCodeMap[normalized];
  }

  // Partial match (e.g., "brasilia, brazil" should match "brasilia")
  for (const [city, code] of Object.entries(cityCodeMap)) {
    if (normalized.includes(city) || city.includes(normalized)) {
      return code;
    }
  }

  // No match - return null instead of dangerous NYC default
  console.warn(`⚠️ No Amadeus city code found for: "${locationQuery}"`);
  return null;
}
