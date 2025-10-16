/**
 * Flight Utility Functions
 * Helper functions for formatting and processing flight data
 */

import { FlightSegment, LayoverInfo } from './types';

/**
 * Convert ISO 8601 duration to human-readable format
 * @param duration - ISO 8601 duration string (e.g., 'PT8H30M', 'PT2H', 'PT45M')
 * @returns Formatted duration string (e.g., '8h 30m', '2h', '45m')
 *
 * @example
 * formatDuration('PT8H30M') // Returns '8h 30m'
 * formatDuration('PT2H') // Returns '2h'
 * formatDuration('PT45M') // Returns '45m'
 */
export function formatDuration(duration: string): string {
  if (!duration) return 'N/A';

  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?/;
  const matches = duration.match(regex);

  if (!matches) return duration;

  const hours = parseInt(matches[1] || '0', 10);
  const minutes = parseInt(matches[2] || '0', 10);

  if (hours && minutes) {
    return `${hours}h ${minutes}m`;
  } else if (hours) {
    return `${hours}h`;
  } else if (minutes) {
    return `${minutes}m`;
  }

  return 'N/A';
}

/**
 * Parse ISO 8601 duration to total minutes
 * @param duration - ISO 8601 duration string
 * @returns Total duration in minutes
 *
 * @example
 * parseDurationToMinutes('PT8H30M') // Returns 510
 * parseDurationToMinutes('PT2H') // Returns 120
 */
export function parseDurationToMinutes(duration: string): number {
  if (!duration) return 0;

  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?/;
  const matches = duration.match(regex);

  if (!matches) return 0;

  const hours = parseInt(matches[1] || '0', 10);
  const minutes = parseInt(matches[2] || '0', 10);

  return hours * 60 + minutes;
}

/**
 * Extract and format time from ISO 8601 datetime
 * @param isoDate - ISO 8601 datetime string
 * @param includeSeconds - Whether to include seconds in output
 * @returns Formatted time string (e.g., '14:30', '2:30 PM')
 *
 * @example
 * formatTime('2024-03-15T14:30:00') // Returns '14:30'
 * formatTime('2024-03-15T14:30:00', true) // Returns '14:30:00'
 */
export function formatTime(isoDate: string, includeSeconds: boolean = false): string {
  if (!isoDate) return 'N/A';

  try {
    const date = new Date(isoDate);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    if (includeSeconds) {
      const seconds = date.getSeconds().toString().padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    }

    return `${hours}:${minutes}`;
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Format time in 12-hour format with AM/PM
 * @param isoDate - ISO 8601 datetime string
 * @returns Formatted time string (e.g., '2:30 PM')
 *
 * @example
 * formatTime12Hour('2024-03-15T14:30:00') // Returns '2:30 PM'
 * formatTime12Hour('2024-03-15T09:15:00') // Returns '9:15 AM'
 */
export function formatTime12Hour(isoDate: string): string {
  if (!isoDate) return 'N/A';

  try {
    const date = new Date(isoDate);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12

    return `${hours}:${minutes} ${ampm}`;
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Format date from ISO 8601 datetime
 * @param isoDate - ISO 8601 datetime string
 * @param format - Date format style ('short', 'medium', 'long')
 * @returns Formatted date string
 *
 * @example
 * formatDate('2024-03-15T14:30:00') // Returns 'Mar 15, 2024'
 * formatDate('2024-03-15T14:30:00', 'short') // Returns '3/15/24'
 * formatDate('2024-03-15T14:30:00', 'long') // Returns 'March 15, 2024'
 */
export function formatDate(
  isoDate: string,
  format: 'short' | 'medium' | 'long' = 'medium'
): string {
  if (!isoDate) return 'N/A';

  try {
    const date = new Date(isoDate);

    switch (format) {
      case 'short':
        return date.toLocaleDateString('en-US', {
          month: 'numeric',
          day: 'numeric',
          year: '2-digit'
        });
      case 'long':
        return date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      case 'medium':
      default:
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
    }
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Format date in weekday format
 * @param isoDate - ISO 8601 datetime string
 * @returns Formatted date with weekday (e.g., 'Fri, Mar 15')
 *
 * @example
 * formatDateWithWeekday('2024-03-15T14:30:00') // Returns 'Fri, Mar 15'
 */
export function formatDateWithWeekday(isoDate: string): string {
  if (!isoDate) return 'N/A';

  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Calculate layover time between two flight segments
 * @param segment1 - First flight segment (ending)
 * @param segment2 - Second flight segment (starting)
 * @returns Layover duration in minutes
 *
 * @example
 * calculateLayoverTime(segment1, segment2) // Returns 90 (for 1.5 hour layover)
 */
export function calculateLayoverTime(
  segment1: FlightSegment,
  segment2: FlightSegment
): number {
  if (!segment1?.arrival?.at || !segment2?.departure?.at) return 0;

  try {
    const arrivalTime = new Date(segment1.arrival.at).getTime();
    const departureTime = new Date(segment2.departure.at).getTime();
    const differenceMs = departureTime - arrivalTime;

    return Math.max(0, Math.floor(differenceMs / 60000)); // Convert to minutes
  } catch {
    return 0;
  }
}

/**
 * Get detailed layover information
 * @param segment1 - First flight segment
 * @param segment2 - Second flight segment
 * @returns Detailed layover information
 */
export function getLayoverInfo(
  segment1: FlightSegment,
  segment2: FlightSegment
): LayoverInfo | null {
  const duration = calculateLayoverTime(segment1, segment2);

  if (duration <= 0) return null;

  const airport = segment1.arrival.iataCode;
  const isLong = duration >= 240; // 4+ hours

  // Check if overnight (arrival and departure on different days)
  const arrivalDate = new Date(segment1.arrival.at);
  const departureDate = new Date(segment2.departure.at);
  const isOvernight = arrivalDate.getDate() !== departureDate.getDate();

  return {
    airport,
    duration,
    durationFormatted: formatMinutesToHours(duration),
    isLong,
    isOvernight,
  };
}

/**
 * Convert minutes to formatted hours and minutes
 * @param minutes - Total minutes
 * @returns Formatted string (e.g., '1h 30m', '45m')
 */
export function formatMinutesToHours(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours && mins) {
    return `${hours}h ${mins}m`;
  } else if (hours) {
    return `${hours}h`;
  } else {
    return `${mins}m`;
  }
}

/**
 * Map IATA airport code to airport name
 * @param code - IATA airport code (e.g., 'JFK')
 * @returns Full airport name
 *
 * @example
 * getAirportName('JFK') // Returns 'John F. Kennedy International Airport'
 * getAirportName('LAX') // Returns 'Los Angeles International Airport'
 */
export function getAirportName(code: string): string {
  const airports: Record<string, string> = {
    // North America - Major US Airports
    'JFK': 'John F. Kennedy International Airport',
    'LAX': 'Los Angeles International Airport',
    'ORD': "O'Hare International Airport",
    'DFW': 'Dallas/Fort Worth International Airport',
    'ATL': 'Hartsfield-Jackson Atlanta International Airport',
    'MIA': 'Miami International Airport',
    'SFO': 'San Francisco International Airport',
    'LAS': 'Harry Reid International Airport',
    'SEA': 'Seattle-Tacoma International Airport',
    'BOS': 'Boston Logan International Airport',
    'EWR': 'Newark Liberty International Airport',
    'IAH': 'George Bush Intercontinental Airport',
    'MCO': 'Orlando International Airport',
    'CLT': 'Charlotte Douglas International Airport',
    'PHX': 'Phoenix Sky Harbor International Airport',
    'DEN': 'Denver International Airport',
    'DTW': 'Detroit Metropolitan Wayne County Airport',
    'MSP': 'Minneapolis-St Paul International Airport',
    'PHL': 'Philadelphia International Airport',
    'LGA': 'LaGuardia Airport',

    // Europe - Major Airports
    'LHR': 'London Heathrow Airport',
    'CDG': 'Paris Charles de Gaulle Airport',
    'FRA': 'Frankfurt Airport',
    'AMS': 'Amsterdam Airport Schiphol',
    'MAD': 'Adolfo Suárez Madrid-Barajas Airport',
    'FCO': 'Leonardo da Vinci-Fiumicino Airport',
    'BCN': 'Barcelona-El Prat Airport',
    'MUC': 'Munich Airport',
    'LGW': 'London Gatwick Airport',
    'IST': 'Istanbul Airport',
    'ZRH': 'Zurich Airport',
    'VIE': 'Vienna International Airport',
    'CPH': 'Copenhagen Airport',
    'OSL': 'Oslo Airport',
    'ARN': 'Stockholm Arlanda Airport',

    // Asia - Major Airports
    'DXB': 'Dubai International Airport',
    'HND': 'Tokyo Haneda Airport',
    'NRT': 'Narita International Airport',
    'SIN': 'Singapore Changi Airport',
    'HKG': 'Hong Kong International Airport',
    'ICN': 'Incheon International Airport',
    'PVG': 'Shanghai Pudong International Airport',
    'BKK': 'Suvarnabhumi Airport',
    'KUL': 'Kuala Lumpur International Airport',
    'DEL': 'Indira Gandhi International Airport',
    'BOM': 'Chhatrapati Shivaji Maharaj International Airport',

    // Middle East
    'DOH': 'Hamad International Airport',
    'AUH': 'Abu Dhabi International Airport',

    // South America
    'GRU': 'São Paulo/Guarulhos International Airport',
    'GIG': 'Rio de Janeiro/Galeão International Airport',
    'EZE': 'Ministro Pistarini International Airport',
    'BOG': 'El Dorado International Airport',
    'LIM': 'Jorge Chávez International Airport',

    // Oceania
    'SYD': 'Sydney Kingsford Smith Airport',
    'MEL': 'Melbourne Airport',
    'AKL': 'Auckland Airport',
  };

  return airports[code.toUpperCase()] || code;
}

/**
 * Get airport city name from IATA code
 * @param code - IATA airport code
 * @returns City name
 */
export function getAirportCity(code: string): string {
  const cities: Record<string, string> = {
    'JFK': 'New York', 'LGA': 'New York', 'EWR': 'Newark',
    'LAX': 'Los Angeles', 'SFO': 'San Francisco',
    'ORD': 'Chicago', 'DFW': 'Dallas', 'ATL': 'Atlanta',
    'MIA': 'Miami', 'LAS': 'Las Vegas', 'SEA': 'Seattle',
    'BOS': 'Boston', 'IAH': 'Houston', 'MCO': 'Orlando',
    'LHR': 'London', 'LGW': 'London', 'CDG': 'Paris',
    'FRA': 'Frankfurt', 'AMS': 'Amsterdam', 'MAD': 'Madrid',
    'FCO': 'Rome', 'BCN': 'Barcelona', 'MUC': 'Munich',
    'DXB': 'Dubai', 'HND': 'Tokyo', 'NRT': 'Tokyo',
    'SIN': 'Singapore', 'HKG': 'Hong Kong', 'ICN': 'Seoul',
    'GRU': 'São Paulo', 'GIG': 'Rio de Janeiro',
  };

  return cities[code.toUpperCase()] || code;
}

/**
 * Map airline IATA code to airline name
 * @param code - IATA airline code (e.g., 'AA', 'DL')
 * @returns Full airline name
 *
 * @example
 * getAirlineName('AA') // Returns 'American Airlines'
 * getAirlineName('DL') // Returns 'Delta Air Lines'
 */
export function getAirlineName(code: string): string {
  const airlines: Record<string, string> = {
    // US Carriers
    'AA': 'American Airlines',
    'DL': 'Delta Air Lines',
    'UA': 'United Airlines',
    'WN': 'Southwest Airlines',
    'B6': 'JetBlue Airways',
    'AS': 'Alaska Airlines',
    'NK': 'Spirit Airlines',
    'F9': 'Frontier Airlines',
    'G4': 'Allegiant Air',
    'SY': 'Sun Country Airlines',

    // European Carriers
    'BA': 'British Airways',
    'LH': 'Lufthansa',
    'AF': 'Air France',
    'KL': 'KLM Royal Dutch Airlines',
    'IB': 'Iberia',
    'AZ': 'ITA Airways',
    'LX': 'Swiss International Air Lines',
    'OS': 'Austrian Airlines',
    'SN': 'Brussels Airlines',
    'TP': 'TAP Air Portugal',
    'SK': 'Scandinavian Airlines',
    'AY': 'Finnair',
    'FR': 'Ryanair',
    'U2': 'easyJet',
    'VY': 'Vueling',

    // Middle Eastern Carriers
    'EK': 'Emirates',
    'QR': 'Qatar Airways',
    'EY': 'Etihad Airways',
    'TK': 'Turkish Airlines',
    'SV': 'Saudia',
    'GF': 'Gulf Air',

    // Asian Carriers
    'SQ': 'Singapore Airlines',
    'CX': 'Cathay Pacific',
    'NH': 'All Nippon Airways',
    'JL': 'Japan Airlines',
    'KE': 'Korean Air',
    'OZ': 'Asiana Airlines',
    'TG': 'Thai Airways',
    'MH': 'Malaysia Airlines',
    'AI': 'Air India',
    'CA': 'Air China',
    'MU': 'China Eastern Airlines',
    'CZ': 'China Southern Airlines',

    // Latin American Carriers
    'AM': 'Aeroméxico',
    'AR': 'Aerolíneas Argentinas',
    'AV': 'Avianca',
    'LA': 'LATAM Airlines',
    'CM': 'Copa Airlines',
    'G3': 'Gol Linhas Aéreas',

    // Oceania Carriers
    'QF': 'Qantas',
    'NZ': 'Air New Zealand',
    'VA': 'Virgin Australia',

    // African Carriers
    'ET': 'Ethiopian Airlines',
    'SA': 'South African Airways',
    'MS': 'EgyptAir',

    // Canadian Carriers
    'AC': 'Air Canada',
    'WS': 'WestJet',
  };

  return airlines[code.toUpperCase()] || code;
}

/**
 * Calculate savings between original and current price
 * @param originalPrice - Original price
 * @param currentPrice - Current/sale price
 * @returns Object with amount saved and percentage saved
 *
 * @example
 * calculateSavings(500, 350) // Returns { amount: 150, percentage: 30 }
 */
export function calculateSavings(
  originalPrice: number,
  currentPrice: number
): { amount: number; percentage: number } {
  const amount = originalPrice - currentPrice;
  const percentage = originalPrice > 0
    ? Math.round((amount / originalPrice) * 100)
    : 0;

  return {
    amount: Math.max(0, amount),
    percentage: Math.max(0, percentage),
  };
}

/**
 * Format price with currency symbol
 * @param amount - Price amount
 * @param currency - Currency code (e.g., 'USD', 'EUR')
 * @returns Formatted price string
 *
 * @example
 * formatPrice(1234.56, 'USD') // Returns '$1,234.56'
 * formatPrice(1234.56, 'EUR') // Returns '€1,234.56'
 */
export function formatPrice(amount: number, currency: string = 'USD'): string {
  const currencySymbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'AUD': 'A$',
    'CAD': 'C$',
    'CHF': 'CHF',
    'CNY': '¥',
    'BRL': 'R$',
    'INR': '₹',
  };

  const symbol = currencySymbols[currency.toUpperCase()] || currency;
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // For currencies that use symbol after amount (some European currencies)
  if (['EUR', 'CHF'].includes(currency.toUpperCase())) {
    return `${formatted} ${symbol}`;
  }

  return `${symbol}${formatted}`;
}

/**
 * Check if flight is overnight (crosses midnight)
 * @param departureTime - Departure ISO datetime
 * @param arrivalTime - Arrival ISO datetime
 * @returns True if flight is overnight
 */
export function isOvernightFlight(departureTime: string, arrivalTime: string): boolean {
  try {
    const departure = new Date(departureTime);
    const arrival = new Date(arrivalTime);
    return departure.getDate() !== arrival.getDate();
  } catch {
    return false;
  }
}

/**
 * Get time of day category for a given time
 * @param isoDate - ISO datetime string
 * @returns Time category (morning, afternoon, evening, night)
 */
export function getTimeOfDay(isoDate: string): 'morning' | 'afternoon' | 'evening' | 'night' | 'red-eye' {
  try {
    const date = new Date(isoDate);
    const hour = date.getHours();

    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    if (hour >= 22 || hour < 5) return 'red-eye';
    return 'night';
  } catch {
    return 'morning';
  }
}

/**
 * Calculate total flight time including layovers
 * @param segments - Array of flight segments
 * @returns Total time in minutes
 */
export function calculateTotalTripTime(segments: FlightSegment[]): number {
  if (!segments || segments.length === 0) return 0;

  const firstDeparture = new Date(segments[0].departure.at).getTime();
  const lastArrival = new Date(segments[segments.length - 1].arrival.at).getTime();

  return Math.floor((lastArrival - firstDeparture) / 60000);
}
