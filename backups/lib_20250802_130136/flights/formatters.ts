/**
 * Flight data formatters and utilities
 * Converts raw Amadeus API responses to UI-friendly format
 */

import { 
  FlightOffer, 
  ProcessedFlightOffer, 
  ProcessedJourney, 
  ProcessedSegment, 
  ProcessedFlightEndpoint,
  Layover,
  AirlineInfo,
  AircraftInfo,
  Dictionaries 
} from '@/types/flights';

/**
 * Convert raw flight offer to processed format for UI
 */
export function formatFlightOffer(
  offer: FlightOffer, 
  dictionaries?: Dictionaries
): ProcessedFlightOffer {
  const priceAmount = offer.price?.grandTotal || offer.price?.total || offer.price?.base || '0';
  const priceCurrency = offer.price?.currency || 'USD';
  
  console.log('🔍 formatFlightOffer - Raw price data:', {
    offerId: offer.id,
    priceObject: offer.price,
    grandTotal: offer.price?.grandTotal,
    total: offer.price?.total,
    base: offer.price?.base,
    currency: offer.price?.currency,
    selectedAmount: priceAmount,
    selectedCurrency: priceCurrency
  });

  return {
    id: offer.id,
    totalPrice: formatPrice(priceAmount, priceCurrency),
    currency: offer.price?.currency === 'BRL' ? 'USD' : (offer.price?.currency || 'USD'),
    
    outbound: formatJourney(offer.itineraries[0], dictionaries),
    inbound: offer.itineraries[1] ? formatJourney(offer.itineraries[1], dictionaries) : undefined,
    
    numberOfBookableSeats: offer.numberOfBookableSeats,
    validatingAirlines: offer.validatingAirlineCodes.map(code => 
      dictionaries?.carriers?.[code] || code
    ),
    lastTicketingDate: offer.lastTicketingDate,
    instantTicketingRequired: offer.instantTicketingRequired,
    
    // Required properties from ProcessedFlightOffer interface
    cabinAnalysis: {
      detectedClass: (offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin as any) || 'ECONOMY',
      confidence: 0.8,
      definition: null,
      sources: ['travelerPricings']
    },
    baggageAnalysis: {
      carryOn: {
        included: true,
        quantity: 1,
        weight: '8kg',
        hasRealData: false
      },
      checked: {
        included: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags?.quantity > 0 || false,
        quantity: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags?.quantity || 0,
        weight: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags?.weight ? `${offer.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags.weight}kg` : null,
        hasRealData: true
      }
    },
    
    rawOffer: offer
  };
}

/**
 * Format journey (outbound or inbound)
 */
export function formatJourney(
  itinerary: any, 
  dictionaries?: Dictionaries
): ProcessedJourney {
  const segments = itinerary.segments.map((segment: any) => 
    formatSegment(segment, dictionaries)
  );
  
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];
  
  return {
    departure: firstSegment.departure,
    arrival: lastSegment.arrival,
    duration: itinerary.duration || 'PT0M',
    durationMinutes: parseDuration(itinerary.duration),
    stops: segments.length - 1,
    segments,
    layovers: calculateLayovers(segments)
  };
}

/**
 * Format flight segment
 */
export function formatSegment(
  segment: any, 
  dictionaries?: Dictionaries
): ProcessedSegment {
  return {
    id: segment.id,
    departure: formatFlightEndpoint(segment.departure, dictionaries),
    arrival: formatFlightEndpoint(segment.arrival, dictionaries),
    duration: segment.duration || 'PT0M',
    durationMinutes: parseDuration(segment.duration),
    airline: formatAirlineInfo(segment.carrierCode, dictionaries),
    flightNumber: `${segment.carrierCode}${segment.number}`,
    aircraft: formatAircraftInfo(segment.aircraft.code, dictionaries),
    cabin: 'ECONOMY' // Will be refined based on traveler pricing
  };
}

/**
 * Format flight endpoint (departure/arrival)
 */
export function formatFlightEndpoint(
  endpoint: any, 
  dictionaries?: Dictionaries
): ProcessedFlightEndpoint {
  const location = dictionaries?.locations?.[endpoint.iataCode];
  const dateTime = new Date(endpoint.at);
  
  return {
    iataCode: endpoint.iataCode,
    airportName: getAirportName(endpoint.iataCode),
    cityName: location?.cityCode ? getCityName(location.cityCode) : undefined,
    countryName: location?.countryCode ? getCountryName(location.countryCode) : undefined,
    terminal: endpoint.terminal,
    dateTime: endpoint.at,
    date: dateTime.toLocaleDateString('pt-BR'),
    time: dateTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    timeZone: location?.timeZone
  };
}

/**
 * Format airline information
 */
export function formatAirlineInfo(
  carrierCode: string, 
  dictionaries?: Dictionaries
): AirlineInfo {
  return {
    code: carrierCode,
    name: dictionaries?.carriers?.[carrierCode] || getAirlineName(carrierCode),
    logo: getAirlineLogo(carrierCode)
  };
}

/**
 * Format aircraft information
 */
export function formatAircraftInfo(
  aircraftCode: string, 
  dictionaries?: Dictionaries
): AircraftInfo {
  return {
    code: aircraftCode,
    name: dictionaries?.aircraft?.[aircraftCode] || getAircraftName(aircraftCode)
  };
}

/**
 * Calculate layovers between segments
 */
export function calculateLayovers(segments: ProcessedSegment[]): Layover[] {
  const layovers: Layover[] = [];
  
  for (let i = 0; i < segments.length - 1; i++) {
    const currentSegment = segments[i];
    const nextSegment = segments[i + 1];
    
    const arrivalTime = new Date(currentSegment.arrival.dateTime);
    const departureTime = new Date(nextSegment.departure.dateTime);
    
    const layoverMinutes = Math.floor((departureTime.getTime() - arrivalTime.getTime()) / (1000 * 60));
    
    layovers.push({
      airport: currentSegment.arrival.iataCode,
      duration: formatDurationFromMinutes(layoverMinutes),
      durationMinutes: layoverMinutes
    });
  }
  
  return layovers;
}

/**
 * Parse ISO 8601 duration to minutes
 */
export function parseDuration(duration: string): number {
  // Handle null/undefined/empty duration
  if (!duration || typeof duration !== 'string') {
    console.warn('⚠️ Invalid duration provided to parseDuration:', duration);
    return 0;
  }
  
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?/;
  const matches = duration.match(regex);
  
  if (!matches) {
    console.warn('⚠️ Could not parse duration format:', duration);
    return 0;
  }
  
  const hours = parseInt(matches[1] || '0', 10);
  const minutes = parseInt(matches[2] || '0', 10);
  
  return hours * 60 + minutes;
}

/**
 * Format minutes to human-readable duration (LEGACY VERSION - kept for compatibility)
 */
export function formatDurationFromMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes}min`;
  }
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
}

/**
 * Convert BRL to USD (approximate conversion rate)
 */
function convertBRLToUSD(brlAmount: number): number {
  // Approximate BRL to USD conversion rate (1 BRL ≈ 0.20 USD)
  // In production, you would fetch real-time rates from an API
  const BRL_TO_USD_RATE = 0.20;
  return brlAmount * BRL_TO_USD_RATE;
}

/**
 * Format price with currency (auto-convert BRL to USD)
 */
export function formatPrice(amount: string | number, currency: string): string {
  console.log('🔍 formatPrice called with:', { amount, currency, type: typeof amount });
  
  // Handle different input types
  let numericAmount: number;
  
  if (typeof amount === 'number') {
    numericAmount = amount;
  } else if (typeof amount === 'string') {
    // Handle invalid or empty amounts
    if (!amount || amount === 'undefined' || amount === 'null' || amount.trim() === '') {
      console.warn('⚠️ Invalid amount provided to formatPrice:', amount);
      return '$0.00';
    }
    
    // Clean the string: remove currency symbols, spaces, and use dot as decimal separator
    const cleanAmount = amount.toString()
      .replace(/[^0-9.,]/g, '') // Remove everything except numbers, commas, and dots
      .replace(',', '.'); // Convert comma to dot for parsing
    
    numericAmount = parseFloat(cleanAmount);
  } else {
    console.warn('⚠️ Invalid amount type:', typeof amount, amount);
    return '$0.00';
  }
  
  // Handle NaN cases
  if (isNaN(numericAmount) || numericAmount < 0) {
    console.warn('⚠️ Could not parse amount to valid number:', amount, 'result:', numericAmount);
    return '$0.00';
  }
  
  console.log('✅ Successfully parsed amount:', numericAmount);
  
  let finalCurrency = currency;
  
  // Auto-convert BRL to USD
  if (currency === 'BRL') {
    numericAmount = convertBRLToUSD(numericAmount);
    finalCurrency = 'USD';
  }
  
  switch (finalCurrency) {
    case 'USD':
      return `$${numericAmount.toLocaleString('en-US', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      })}`;
    case 'EUR':
      return `€${numericAmount.toLocaleString('de-DE', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      })}`;
    case 'GBP':
      return `£${numericAmount.toLocaleString('en-GB', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      })}`;
    case 'BRL':
      return `R$${numericAmount.toLocaleString('pt-BR', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      })}`;
    default:
      return `$${numericAmount.toLocaleString('en-US', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      })}`;
  }
}

/**
 * Get stops description
 */
export function formatStops(stops: number): string {
  switch (stops) {
    case 0:
      return 'Direct';
    case 1:
      return '1 stop';
    default:
      return `${stops} stops`;
  }
}

/**
 * Get travel class display name
 */
export function formatTravelClass(travelClass: string): string {
  switch (travelClass) {
    case 'ECONOMY':
      return 'Econômica';
    case 'PREMIUM_ECONOMY':
      return 'Econômica Premium';
    case 'BUSINESS':
      return 'Executiva';
    case 'FIRST':
      return 'Primeira Classe';
    default:
      return travelClass;
  }
}

/**
 * Get time of day category
 */
export function getTimeOfDay(time: string): 'early-morning' | 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = parseInt(time.split(':')[0], 10);
  
  if (hour >= 5 && hour < 8) return 'early-morning';
  if (hour >= 8 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

/**
 * Get time of day display name
 */
export function formatTimeOfDay(timeOfDay: string): string {
  switch (timeOfDay) {
    case 'early-morning':
      return 'Early Morning (05:00 - 08:00)';
    case 'morning':
      return 'Morning (08:00 - 12:00)';
    case 'afternoon':
      return 'Afternoon (12:00 - 18:00)';
    case 'evening':
      return 'Evening (18:00 - 22:00)';
    case 'night':
      return 'Night (22:00 - 05:00)';
    default:
      return timeOfDay;
  }
}

// =============================================================================
// UTILITY FUNCTIONS FOR STATIC DATA
// =============================================================================

/**
 * Get airport name by IATA code
 */
export function getAirportName(iataCode: string): string {
  const airports: Record<string, string> = {
    // Brazil
    'GRU': 'Aeroporto Internacional de São Paulo/Guarulhos',
    'CGH': 'Aeroporto de São Paulo/Congonhas',
    'VCP': 'Aeroporto Internacional de Viracopos',
    'GIG': 'Aeroporto Internacional do Rio de Janeiro/Galeão',
    'SDU': 'Aeroporto Santos Dumont',
    'BSB': 'Aeroporto Internacional de Brasília',
    'SSA': 'Aeroporto Internacional de Salvador',
    'REC': 'Aeroporto Internacional do Recife',
    'FOR': 'Aeroporto Internacional de Fortaleza',
    'BEL': 'Aeroporto Internacional de Belém',
    'MAO': 'Aeroporto Internacional de Manaus',
    'CWB': 'Aeroporto Internacional de Curitiba',
    'POA': 'Aeroporto Internacional de Porto Alegre',
    'FLN': 'Aeroporto Internacional de Florianópolis',
    'VIX': 'Aeroporto de Vitória',
    'CNF': 'Aeroporto Internacional de Belo Horizonte',
    
    // USA
    'JFK': 'John F. Kennedy International Airport',
    'LAX': 'Los Angeles International Airport',
    'MIA': 'Miami International Airport',
    'ORD': 'O\'Hare International Airport',
    'ATL': 'Hartsfield-Jackson Atlanta International Airport',
    'DFW': 'Dallas/Fort Worth International Airport',
    'DEN': 'Denver International Airport',
    'PHX': 'Phoenix Sky Harbor International Airport',
    'LAS': 'McCarran International Airport',
    'SEA': 'Seattle-Tacoma International Airport',
    'SFO': 'San Francisco International Airport',
    'LGA': 'LaGuardia Airport',
    'EWR': 'Newark Liberty International Airport',
    'IAH': 'George Bush Intercontinental Airport',
    'MCO': 'Orlando International Airport',
    'BOS': 'Logan International Airport',
    'CLT': 'Charlotte Douglas International Airport',
    'MSP': 'Minneapolis-Saint Paul International Airport',
    'DTW': 'Detroit Metropolitan Wayne County Airport',
    'PHL': 'Philadelphia International Airport',
    
    // Europe
    'LHR': 'London Heathrow Airport',
    'CDG': 'Paris Charles de Gaulle Airport',
    'FRA': 'Frankfurt Airport',
    'AMS': 'Amsterdam Airport Schiphol',
    'MAD': 'Madrid-Barajas Airport',
    'FCO': 'Rome Fiumicino Airport',
    'MUC': 'Munich Airport',
    'ZUR': 'Zurich Airport',
    'VIE': 'Vienna International Airport',
    'CPH': 'Copenhagen Airport',
    'ARN': 'Stockholm Arlanda Airport',
    'OSL': 'Oslo Airport',
    'HEL': 'Helsinki Airport',
    'LIS': 'Lisbon Airport',
    'BCN': 'Barcelona Airport',
    
    // Other
    'YYZ': 'Toronto Pearson International Airport',
    'YVR': 'Vancouver International Airport',
    'MEX': 'Mexico City International Airport',
    'CUN': 'Cancún International Airport',
    'NRT': 'Narita International Airport',
    'ICN': 'Incheon International Airport',
    'SIN': 'Singapore Changi Airport',
    'HKG': 'Hong Kong International Airport',
    'DXB': 'Dubai International Airport',
    'DOH': 'Hamad International Airport',
    'IST': 'Istanbul Airport',
    'CAI': 'Cairo International Airport',
    'JNB': 'O.R. Tambo International Airport',
    'SYD': 'Sydney Kingsford Smith Airport',
    'MEL': 'Melbourne Airport'
  };
  
  return airports[iataCode] || `Aeroporto ${iataCode}`;
}

/**
 * Get city name by city code
 */
export function getCityName(cityCode: string): string {
  const cities: Record<string, string> = {
    'SAO': 'São Paulo',
    'RIO': 'Rio de Janeiro',
    'BSB': 'Brasília',
    'SSA': 'Salvador',
    'REC': 'Recife',
    'FOR': 'Fortaleza',
    'BEL': 'Belém',
    'MAO': 'Manaus',
    'CWB': 'Curitiba',
    'POA': 'Porto Alegre',
    'FLN': 'Florianópolis',
    'VIX': 'Vitória',
    'CNF': 'Belo Horizonte',
    'NYC': 'Nova York',
    'LAX': 'Los Angeles',
    'MIA': 'Miami',
    'CHI': 'Chicago',
    'ATL': 'Atlanta',
    'DFW': 'Dallas',
    'DEN': 'Denver',
    'PHX': 'Phoenix',
    'LAS': 'Las Vegas',
    'SEA': 'Seattle',
    'SFO': 'São Francisco',
    'LON': 'Londres',
    'PAR': 'Paris',
    'FRA': 'Frankfurt',
    'AMS': 'Amsterdam',
    'MAD': 'Madrid',
    'ROM': 'Roma',
    'MUC': 'Munique',
    'ZUR': 'Zurique',
    'VIE': 'Viena',
    'CPH': 'Copenhagen',
    'ARN': 'Estocolmo',
    'OSL': 'Oslo',
    'HEL': 'Helsinki',
    'LIS': 'Lisboa',
    'BCN': 'Barcelona'
  };
  
  return cities[cityCode] || cityCode;
}

/**
 * Get country name by country code
 */
export function getCountryName(countryCode: string): string {
  const countries: Record<string, string> = {
    'BR': 'Brasil',
    'US': 'Estados Unidos',
    'GB': 'Reino Unido',
    'FR': 'França',
    'DE': 'Alemanha',
    'NL': 'Holanda',
    'ES': 'Espanha',
    'IT': 'Itália',
    'CH': 'Suíça',
    'AT': 'Áustria',
    'DK': 'Dinamarca',
    'SE': 'Suécia',
    'NO': 'Noruega',
    'FI': 'Finlândia',
    'PT': 'Portugal',
    'CA': 'Canadá',
    'MX': 'México',
    'JP': 'Japão',
    'KR': 'Coreia do Sul',
    'SG': 'Singapura',
    'HK': 'Hong Kong',
    'AE': 'Emirados Árabes Unidos',
    'QA': 'Catar',
    'TR': 'Turquia',
    'EG': 'Egito',
    'ZA': 'África do Sul',
    'AU': 'Austrália'
  };
  
  return countries[countryCode] || countryCode;
}

/**
 * Get airline name by carrier code
 */
export function getAirlineName(carrierCode: string): string {
  const airlines: Record<string, string> = {
    'LA': 'LATAM Airlines',
    'G3': 'GOL Linhas Aéreas',
    'AD': 'Azul Linhas Aéreas',
    'AA': 'American Airlines',
    'DL': 'Delta Air Lines',
    'UA': 'United Airlines',
    'BA': 'British Airways',
    'AF': 'Air France',
    'LH': 'Lufthansa',
    'KL': 'KLM',
    'IB': 'Iberia',
    'AZ': 'Alitalia',
    'LX': 'Swiss International Air Lines',
    'OS': 'Austrian Airlines',
    'SK': 'SAS',
    'AY': 'Finnair',
    'TP': 'TAP Air Portugal',
    'AC': 'Air Canada',
    'AM': 'Aeroméxico',
    'JL': 'Japan Airlines',
    'NH': 'ANA',
    'KE': 'Korean Air',
    'SQ': 'Singapore Airlines',
    'CX': 'Cathay Pacific',
    'EK': 'Emirates',
    'QR': 'Qatar Airways',
    'TK': 'Turkish Airlines',
    'MS': 'EgyptAir',
    'SA': 'South African Airways',
    'QF': 'Qantas'
  };
  
  return airlines[carrierCode] || carrierCode;
}

/**
 * Get airline logo URL by carrier code
 */
export function getAirlineLogo(carrierCode: string): string {
  // Using a free airline logo service or local assets
  return `https://images.kiwi.com/airlines/64/${carrierCode}.png`;
}

/**
 * Get aircraft name by aircraft code
 */
export function getAircraftName(aircraftCode: string): string {
  const aircraft: Record<string, string> = {
    '320': 'Airbus A320',
    '321': 'Airbus A321',
    '319': 'Airbus A319',
    '318': 'Airbus A318',
    '330': 'Airbus A330',
    '340': 'Airbus A340',
    '350': 'Airbus A350',
    '380': 'Airbus A380',
    '737': 'Boeing 737',
    '738': 'Boeing 737-800',
    '739': 'Boeing 737-900',
    '747': 'Boeing 747',
    '757': 'Boeing 757',
    '767': 'Boeing 767',
    '777': 'Boeing 777',
    '787': 'Boeing 787 Dreamliner',
    'E90': 'Embraer E190',
    'E95': 'Embraer E195',
    'ATR': 'ATR 72',
    'DH4': 'De Havilland Dash 8'
  };
  
  return aircraft[aircraftCode] || `Aircraft ${aircraftCode}`;
}

// =============================================================================
// 🚀 ULTRA-ADVANCED FORMATTERS FOR 11:00 AM STATE RECOVERY
// =============================================================================

/**
 * Format duration with enhanced display - UNIFIED VERSION
 */
export function formatDuration(durationInput: string | number): string {
  if (typeof durationInput === 'number') {
    // Handle minutes input
    const hours = Math.floor(durationInput / 60);
    const remainingMinutes = durationInput % 60;
    
    if (hours === 0) {
      return `${remainingMinutes}min`;
    }
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${remainingMinutes}min`;
  } else {
    // Handle ISO 8601 duration string input
    if (!durationInput) return 'N/A';
    
    // Parse ISO 8601 duration format (PT4H30M)
    const match = durationInput.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return durationInput;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    
    if (hours === 0) {
      return `${minutes}min`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}min`;
    }
  }
}

/**
 * Format airline name with enhanced display
 */
export function formatAirlineName(airline: string): string {
  // If already formatted, return as is
  if (airline.includes(' ')) return airline;
  
  // Otherwise, get from dictionary
  return getAirlineName(airline);
}

/**
 * Get duration score for gamification (0-100)
 */
export function getDurationScore(journey: any): number {
  if (!journey?.duration) return 50;
  
  const durationMs = parseDurationToMs(journey.duration);
  const hours = durationMs / (1000 * 60 * 60);
  
  // Shorter flights score higher
  if (hours <= 2) return 100;
  if (hours <= 4) return 90;
  if (hours <= 6) return 80;
  if (hours <= 8) return 70;
  if (hours <= 12) return 60;
  return 50;
}

/**
 * Parse ISO 8601 duration to milliseconds (for internal use)
 */
function parseDurationToMs(duration: string): number {
  // Handle null/undefined/empty duration
  if (!duration || typeof duration !== 'string') {
    console.warn('⚠️ Invalid duration provided to parseDurationToMs:', duration);
    return 0;
  }
  
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) {
    console.warn('⚠️ Could not parse duration format in parseDurationToMs:', duration);
    return 0;
  }
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  
  return (hours * 60 + minutes) * 60 * 1000;
}

/**
 * Enhanced price formatting with currency symbols
 */
export function formatPriceEnhanced(amount: string | number, currency: string = 'BRL'): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  const symbols: Record<string, string> = {
    'BRL': 'R$',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥'
  };
  
  const symbol = symbols[currency] || currency;
  
  return `${symbol} ${numericAmount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Format percentage with proper display
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Format large numbers (views, bookings, etc)
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMinutes < 1) return 'agora mesmo';
  if (diffMinutes < 60) return `${diffMinutes} min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays === 1) return 'ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  
  return date.toLocaleDateString('pt-BR');
}

/**
 * Format confidence score for AI insights
 */
export function formatConfidence(confidence: number): string {
  const percentage = Math.round(confidence * 100);
  
  if (percentage >= 90) return `${percentage}% (Muito Alta)`;
  if (percentage >= 75) return `${percentage}% (Alta)`;
  if (percentage >= 60) return `${percentage}% (Média)`;
  return `${percentage}% (Baixa)`;
}

/**
 * Format urgency level with emoji
 */
export function formatUrgency(urgency: string): string {
  const urgencyMap: Record<string, string> = {
    'CRITICAL': '🔴 Crítico',
    'HIGH': '🟠 Alto',
    'MEDIUM': '🟡 Médio',
    'LOW': '🟢 Baixo'
  };
  
  return urgencyMap[urgency] || urgency;
}

/**
 * Get time of day emoji for display
 */
export function getTimeOfDayEmoji(timeCategory: string): string {
  switch (timeCategory) {
    case 'early-morning': return '🌅';
    case 'morning': return '🌄';
    case 'afternoon': return '☀️';
    case 'evening': return '🌆';
    case 'night': return '🌙';
    default: return '✈️';
  }
}

/**
 * Get stops emoji for display
 */
export function getStopsEmoji(stops: number): string {
  switch (stops) {
    case 0: return '🎯'; // Direct
    case 1: return '↗️'; // 1 stop
    default: return '🔀'; // Multiple stops
  }
}

// =============================================================================
// DETAILED FARE RULES PARSING FUNCTIONS
// =============================================================================

/**
 * Parse detailed fare rules from raw Amadeus API response
 */
export function parseDetailedFareRules(detailedFareRules: any): {
  refundPolicy: {
    allowed: boolean;
    fee?: string;
    conditions?: string[];
  };
  changePolicy: {
    allowed: boolean;
    fee?: string;
    conditions?: string[];
  };
  baggage: {
    carryOn?: {
      included: boolean;
      weight?: string;
      dimensions?: string;
    };
    checked?: {
      included: boolean;
      quantity?: number;
      weight?: string;
      fee?: string;
    };
  };
  seatSelection: {
    allowed: boolean;
    cost?: string;
  };
  additionalServices: {
    meal?: boolean;
    wifi?: boolean;
    entertainment?: boolean;
  };
} {
  // Initialize default values
  const result = {
    refundPolicy: {
      allowed: false,
      fee: undefined,
      conditions: []
    },
    changePolicy: {
      allowed: false,
      fee: undefined,
      conditions: []
    },
    baggage: {
      carryOn: {
        included: true,
        weight: undefined,
        dimensions: undefined
      },
      checked: {
        included: false,
        quantity: 0,
        weight: undefined,
        fee: undefined
      }
    },
    seatSelection: {
      allowed: true,
      cost: undefined
    },
    additionalServices: {
      meal: false,
      wifi: false,
      entertainment: false
    }
  };

  if (!detailedFareRules) {
    return result;
  }

  try {
    // Parse raw fare rules data (this would be specific to Amadeus format)
    // The detailed-fare-rules returns unstructured text data that needs parsing
    
    if (Array.isArray(detailedFareRules)) {
      for (const rule of detailedFareRules) {
        if (rule.category && rule.text) {
          parseRuleCategory(rule, result);
        }
      }
    } else if (typeof detailedFareRules === 'string') {
      // Parse raw text fare rules
      parseRawFareRulesText(detailedFareRules, result);
    }

    return result;
  } catch (error) {
    console.error('Error parsing detailed fare rules:', error);
    return result;
  }
}

/**
 * Parse individual rule category
 */
function parseRuleCategory(rule: any, result: any): void {
  const category = rule.category?.toLowerCase();
  const text = rule.text?.toLowerCase();

  if (!category || !text) return;

  switch (category) {
    case 'refunds':
    case 'cancellation':
      parseRefundRules(text, result.refundPolicy);
      break;
    
    case 'changes':
    case 'reissue':
      parseChangeRules(text, result.changePolicy);
      break;
    
    case 'baggage':
      parseBaggageRules(text, result.baggage);
      break;
    
    case 'seat':
    case 'advance seat assignment':
      parseSeatRules(text, result.seatSelection);
      break;
    
    case 'meals':
    case 'services':
      parseServiceRules(text, result.additionalServices);
      break;
  }
}

/**
 * Parse refund rules from text
 */
function parseRefundRules(text: string, refundPolicy: any): void {
  // Look for common refund keywords
  if (text.includes('non-refundable') || text.includes('no refund')) {
    refundPolicy.allowed = false;
  } else if (text.includes('refundable') || text.includes('refund permitted')) {
    refundPolicy.allowed = true;
  }

  // Extract fee information
  const feeMatch = text.match(/(?:refund (?:fee|charge|penalty)[:\s]*)?(?:usd?\s*)?\$?(\d+(?:\.\d{2})?)/i);
  if (feeMatch) {
    refundPolicy.fee = `$${feeMatch[1]}`;
  }

  // Extract conditions
  if (text.includes('24 hours')) {
    refundPolicy.conditions?.push('Must cancel within 24 hours');
  }
  if (text.includes('before departure')) {
    refundPolicy.conditions?.push('Must cancel before departure');
  }
}

/**
 * Parse change rules from text
 */
function parseChangeRules(text: string, changePolicy: any): void {
  // Look for change keywords
  if (text.includes('changes not permitted') || text.includes('no changes')) {
    changePolicy.allowed = false;
  } else if (text.includes('changes permitted') || text.includes('changeable')) {
    changePolicy.allowed = true;
  }

  // Extract change fee
  const feeMatch = text.match(/(?:change (?:fee|charge|penalty)[:\s]*)?(?:usd?\s*)?\$?(\d+(?:\.\d{2})?)/i);
  if (feeMatch) {
    changePolicy.fee = `$${feeMatch[1]}`;
  }

  // Extract conditions
  if (text.includes('same day')) {
    changePolicy.conditions?.push('Same day changes only');
  }
  if (text.includes('subject to availability')) {
    changePolicy.conditions?.push('Subject to availability');
  }
}

/**
 * Parse baggage rules from text
 */
function parseBaggageRules(text: string, baggage: any): void {
  // Carry-on parsing
  const carryOnMatch = text.match(/carry.?on[:\s]*(\d+)?\s*(kg|lb|kilos?|pounds?)?/i);
  if (carryOnMatch) {
    baggage.carryOn.weight = carryOnMatch[1] ? `${carryOnMatch[1]}${carryOnMatch[2] || 'kg'}` : undefined;
  }

  // Checked baggage parsing
  const checkedMatch = text.match(/checked[:\s]*(\d+)?\s*(?:x\s*)?(\d+)?\s*(kg|lb|kilos?|pounds?)?/i);
  if (checkedMatch) {
    baggage.checked.quantity = checkedMatch[1] ? parseInt(checkedMatch[1]) : 0;
    baggage.checked.weight = checkedMatch[2] ? `${checkedMatch[2]}${checkedMatch[3] || 'kg'}` : undefined;
    baggage.checked.included = baggage.checked.quantity > 0;
  }

  // Baggage fee parsing
  const feeMatch = text.match(/(?:baggage (?:fee|charge)[:\s]*)?(?:usd?\s*)?\$?(\d+(?:\.\d{2})?)/i);
  if (feeMatch) {
    baggage.checked.fee = `$${feeMatch[1]}`;
  }
}

/**
 * Parse seat selection rules from text
 */
function parseSeatRules(text: string, seatSelection: any): void {
  if (text.includes('seat assignment') && text.includes('not permitted')) {
    seatSelection.allowed = false;
  }

  const costMatch = text.match(/(?:seat (?:fee|cost|charge)[:\s]*)?(?:usd?\s*)?\$?(\d+(?:\.\d{2})?)/i);
  if (costMatch) {
    seatSelection.cost = `$${costMatch[1]}`;
  }
}

/**
 * Parse additional services from text
 */
function parseServiceRules(text: string, services: any): void {
  if (text.includes('meal') && !text.includes('no meal')) {
    services.meal = true;
  }
  if (text.includes('wifi') || text.includes('internet')) {
    services.wifi = true;
  }
  if (text.includes('entertainment')) {
    services.entertainment = true;
  }
}

/**
 * Parse raw fare rules text (fallback for unstructured data)
 */
function parseRawFareRulesText(rawText: string, result: any): void {
  const text = rawText.toLowerCase();
  
  // Basic parsing of common fare rule patterns
  if (text.includes('non-refundable')) {
    result.refundPolicy.allowed = false;
  }
  if (text.includes('changes not permitted')) {
    result.changePolicy.allowed = false;
  }
  
  // Extract any dollar amounts that might be fees
  const amounts = text.match(/\$(\d+(?:\.\d{2})?)/g);
  if (amounts && amounts.length > 0) {
    result.changePolicy.fee = amounts[0];
  }
}