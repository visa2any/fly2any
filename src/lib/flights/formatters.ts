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
  return {
    id: offer.id,
    totalPrice: formatPrice(offer.price.grandTotal, offer.price.currency),
    currency: offer.price.currency,
    
    outbound: formatJourney(offer.itineraries[0], dictionaries),
    inbound: offer.itineraries[1] ? formatJourney(offer.itineraries[1], dictionaries) : undefined,
    
    numberOfBookableSeats: offer.numberOfBookableSeats,
    validatingAirlines: offer.validatingAirlineCodes.map(code => 
      dictionaries?.carriers?.[code] || code
    ),
    lastTicketingDate: offer.lastTicketingDate,
    instantTicketingRequired: offer.instantTicketingRequired,
    
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
    duration: itinerary.duration,
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
    duration: segment.duration,
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
      duration: formatDuration(layoverMinutes),
      durationMinutes: layoverMinutes
    });
  }
  
  return layovers;
}

/**
 * Parse ISO 8601 duration to minutes
 */
export function parseDuration(duration: string): number {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?/;
  const matches = duration.match(regex);
  
  if (!matches) return 0;
  
  const hours = parseInt(matches[1] || '0', 10);
  const minutes = parseInt(matches[2] || '0', 10);
  
  return hours * 60 + minutes;
}

/**
 * Format minutes to human-readable duration
 */
export function formatDuration(minutes: number): string {
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
 * Format price with currency
 */
export function formatPrice(amount: string, currency: string): string {
  const numericAmount = parseFloat(amount);
  
  switch (currency) {
    case 'BRL':
      return `R$ ${numericAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    case 'USD':
      return `US$ ${numericAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    case 'EUR':
      return `€ ${numericAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`;
    default:
      return `${currency} ${numericAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }
}

/**
 * Get stops description
 */
export function formatStops(stops: number): string {
  switch (stops) {
    case 0:
      return 'Direto';
    case 1:
      return '1 parada';
    default:
      return `${stops} paradas`;
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
      return 'Madrugada (05:00 - 08:00)';
    case 'morning':
      return 'Manhã (08:00 - 12:00)';
    case 'afternoon':
      return 'Tarde (12:00 - 18:00)';
    case 'evening':
      return 'Noite (18:00 - 22:00)';
    case 'night':
      return 'Madrugada (22:00 - 05:00)';
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