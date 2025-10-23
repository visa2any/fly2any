/**
 * Parser for Trip Bundles data
 * Combines Hotels, Transfers, and POI into bundled offers
 */

export interface Hotel {
  name: string;
  rating: number;
  reviewScore: number | null;
  reviewCount: number;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  distance: string;
  amenities: string[];
  imageUrl: string | null;
}

export interface Transfer {
  type: 'PRIVATE' | 'SHARED' | 'TAXI';
  vehicle: string;
  price: number;
  currency: string;
  duration: string;
  distance: string;
  passengerCapacity: number;
}

export interface PointOfInterest {
  name: string;
  category: string;
  price: number | null;
  currency: string;
  rating: number | null;
  distance: string;
  tags: string[];
}

export interface TripBundle {
  hotel: Hotel | null;
  transfer: Transfer | null;
  poi: PointOfInterest | null;
  totalPrice: number;
  regularPrice: number;
  savings: number;
  savingsPercent: number;
}

export interface ParsedTripBundles {
  bundles: TripBundle[];
  hasRealData: boolean;
  bestBundle: TripBundle | null;
  destination: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
}

/**
 * Parse hotels data from Amadeus API
 */
export function parseHotels(hotelsResponse: any): Hotel[] {
  const data = hotelsResponse?.data || [];

  return data.slice(0, 3).map((hotel: any) => {
    const offer = hotel.offers?.[0];
    const pricePerNight = offer?.price?.total ? parseFloat(offer.price.total) / (offer.price.variations?.changes?.length || 1) : 0;

    return {
      name: hotel.hotel?.name || 'Hotel',
      rating: hotel.hotel?.rating ? parseInt(hotel.hotel.rating, 10) : 3,
      reviewScore: hotel.hotel?.rating ? parseFloat(hotel.hotel.rating) : null,
      reviewCount: 0,
      pricePerNight: Math.round(pricePerNight),
      totalPrice: offer?.price?.total ? Math.round(parseFloat(offer.price.total)) : 0,
      currency: offer?.price?.currency || 'USD',
      distance: hotel.hotel?.cityCode || '',
      amenities: hotel.hotel?.amenities || [],
      imageUrl: null,
    };
  });
}

/**
 * Parse transfers data from Amadeus API
 */
export function parseTransfers(transfersResponse: any): Transfer[] {
  const data = transfersResponse?.data || [];

  return data.slice(0, 3).map((transfer: any) => {
    return {
      type: transfer.transferType || 'PRIVATE',
      vehicle: transfer.vehicle?.description || 'Private Car',
      price: transfer.price?.amount ? Math.round(parseFloat(transfer.price.amount)) : 45,
      currency: transfer.price?.currency || 'USD',
      duration: transfer.duration || '30min',
      distance: transfer.distance?.value ? `${transfer.distance.value}km` : '15km',
      passengerCapacity: transfer.vehicle?.seats || 4,
    };
  });
}

/**
 * Parse POI data from Amadeus API
 */
export function parsePointsOfInterest(poiResponse: any): PointOfInterest[] {
  const data = poiResponse?.data || [];

  return data.slice(0, 5).map((poi: any) => {
    return {
      name: poi.name || 'Attraction',
      category: poi.category || 'SIGHTS',
      price: poi.price ? Math.round(parseFloat(poi.price)) : null,
      currency: 'USD',
      rating: poi.geoCode?.rating || null,
      distance: poi.geoCode?.distance ? `${poi.geoCode.distance}km` : '',
      tags: poi.tags || [],
    };
  });
}

/**
 * Create trip bundles from parsed data
 */
export function createTripBundles(
  hotels: Hotel[],
  transfers: Transfer[],
  pois: PointOfInterest[],
  destination: string,
  checkInDate: string,
  checkOutDate: string
): ParsedTripBundles {
  const hasRealData = hotels.length > 0 || transfers.length > 0;

  if (!hasRealData) {
    return {
      bundles: [],
      hasRealData: false,
      bestBundle: null,
      destination,
      checkInDate,
      checkOutDate,
      nights: 0,
    };
  }

  // Calculate nights
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  // Create bundle with best hotel + transfer + poi
  const hotel = hotels[0] || null;
  const transfer = transfers[0] || null;
  const poi = pois[0] || null;

  const totalPrice = (hotel?.totalPrice || 0) + (transfer?.price || 0) + (poi?.price || 0);
  const regularPrice = Math.round(totalPrice * 1.08); // Assume 8% markup if bought separately
  const savings = regularPrice - totalPrice;
  const savingsPercent = Math.round((savings / regularPrice) * 100);

  const bundle: TripBundle = {
    hotel,
    transfer,
    poi,
    totalPrice,
    regularPrice,
    savings,
    savingsPercent,
  };

  return {
    bundles: [bundle],
    hasRealData: true,
    bestBundle: bundle,
    destination,
    checkInDate,
    checkOutDate,
    nights,
  };
}

/**
 * Format trip bundles for display in compact single-line view
 */
export function formatTripBundlesCompact(parsedBundles: ParsedTripBundles): {
  displayText: string;
  hasData: boolean;
} {
  if (!parsedBundles.hasRealData || !parsedBundles.bestBundle) {
    return {
      displayText: 'No bundles available',
      hasData: false,
    };
  }

  const { bestBundle } = parsedBundles;
  const hotelText = bestBundle.hotel ? `+Hotel $${bestBundle.hotel.pricePerNight}/nt` : '';
  const transferText = bestBundle.transfer ? `+Transfer $${bestBundle.transfer.price}` : '';
  const savingsText = bestBundle.savingsPercent > 0 ? `Save ${bestBundle.savingsPercent}%` : '';

  return {
    displayText: [hotelText, transferText, savingsText].filter(Boolean).join(' • '),
    hasData: true,
  };
}
