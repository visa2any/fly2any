/**
 * Flight search validators and utility functions
 */

import { FlightSearchParams, FlightSearchFormData, AirportSelection } from '@/types/flights';

/**
 * Validate flight search parameters
 */
export function validateFlightSearchParams(params: FlightSearchParams): string[] {
  const errors: string[] = [];

  // Required fields validation
  if (!params.originLocationCode || params.originLocationCode.length !== 3) {
    errors.push('Origin airport code must be 3 characters');
  }

  if (!params.destinationLocationCode || params.destinationLocationCode.length !== 3) {
    errors.push('Destination airport code must be 3 characters');
  }

  if (params.originLocationCode === params.destinationLocationCode) {
    errors.push('Origin and destination airports must be different');
  }

  if (!params.departureDate) {
    errors.push('Departure date is required');
  } else {
    const departureDate = new Date(params.departureDate + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (departureDate < today) {
      errors.push('Departure date cannot be in the past');
    }
    
    // Check if departure date is too far in the future (360 days)
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 360);
    if (departureDate > maxDate) {
      errors.push('Departure date cannot be more than 360 days in the future');
    }
  }

  // Return date validation (if provided)
  if (params.returnDate) {
    const departureDate = new Date(params.departureDate + 'T00:00:00');
    const returnDate = new Date(params.returnDate + 'T00:00:00');
    
    if (returnDate <= departureDate) {
      errors.push('Return date must be after departure date');
    }
  }

  // Passenger count validation
  if (!params.adults || params.adults < 1 || params.adults > 9) {
    errors.push('Number of adults must be between 1 and 9');
  }

  if (params.children && (params.children < 0 || params.children > 8)) {
    errors.push('Number of children must be between 0 and 8');
  }

  if (params.infants && (params.infants < 0 || params.infants > params.adults)) {
    errors.push('Number of infants cannot exceed number of adults');
  }

  const totalPassengers = params.adults + (params.children || 0) + (params.infants || 0);
  if (totalPassengers > 9) {
    errors.push('Total number of passengers cannot exceed 9');
  }

  // Price validation
  if (params.maxPrice && (params.maxPrice < 0 || params.maxPrice > 100000)) {
    errors.push('Maximum price must be between $0 and $100,000');
  }

  // Max results validation
  if (params.max && (params.max < 1 || params.max > 250)) {
    errors.push('Maximum number of results must be between 1 and 250');
  }

  return errors;
}

/**
 * Validate form data before converting to search params
 */
export function validateFlightSearchForm(formData: FlightSearchFormData): string[] {
  const errors: string[] = [];

  // Trip type validation
  if (!formData.tripType) {
    errors.push('Trip type is required');
  }

  // Multi-city validation
  if (formData.tripType === 'multi-city') {
    if (!formData.segments || formData.segments.length < 2) {
      errors.push('Multi-city trips require at least 2 segments');
    } else {
      formData.segments.forEach((segment, index) => {
        if (!segment.origin.iataCode && !segment.origin.city) {
          errors.push(`Flight ${index + 1}: Select origin airport`);
        }
        if (!segment.destination.iataCode && !segment.destination.city) {
          errors.push(`Flight ${index + 1}: Select destination airport`);
        }
        if (segment.origin.iataCode === segment.destination.iataCode && segment.origin.iataCode) {
          errors.push(`Flight ${index + 1}: Origin and destination must be different`);
        }
        if (!segment.departureDate) {
          errors.push(`Flight ${index + 1}: Select departure date`);
        } else {
          const departureDate = new Date(segment.departureDate + 'T00:00:00');
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (departureDate < today) {
            errors.push(`Flight ${index + 1}: Departure date must be today or in the future`);
          }
          
          // Check sequential dates
          if (index > 0 && formData.segments && formData.segments[index - 1]) {
            const prevDate = new Date(formData.segments[index - 1].departureDate + 'T00:00:00');
            if (departureDate <= prevDate) {
              errors.push(`Flight ${index + 1}: Date must be after Flight ${index}`);
            }
          }
        }
      });
    }
  } else {
    // Regular validation for round-trip and one-way
    if (!formData.origin?.iataCode) {
      errors.push('Origin airport is required');
    }

    if (!formData.destination?.iataCode) {
      errors.push('Destination airport is required');
    }

    if (formData.origin?.iataCode === formData.destination?.iataCode) {
      errors.push('Origin and destination airports must be different');
    }

    // Date validation
    if (!formData.departureDate) {
      errors.push('Departure date is required');
    }

    if (formData.tripType === 'round-trip' && !formData.returnDate) {
      errors.push('Return date is required for round-trip flights');
    }

    // Fix date comparison with proper timezone handling
    if (formData.departureDate && formData.returnDate) {
      const departureDate = new Date(formData.departureDate + 'T00:00:00');
      const returnDate = new Date(formData.returnDate + 'T00:00:00');
      
      if (returnDate <= departureDate) {
        errors.push('Return date must be after departure date');
      }
    }
  }

  // Passenger validation (common for all trip types)
  const totalPassengers = formData.passengers.adults + formData.passengers.children + formData.passengers.infants;
  if (totalPassengers === 0) {
    errors.push('At least one passenger is required');
  }

  if (totalPassengers > 9) {
    errors.push('Total number of passengers cannot exceed 9');
  }

  if (formData.passengers.infants > formData.passengers.adults) {
    errors.push('Number of infants cannot exceed number of adults');
  }

  return errors;
}

/**
 * Convert form data to API search parameters
 */
export function convertFormToSearchParams(formData: FlightSearchFormData): FlightSearchParams {
  return {
    originLocationCode: formData.origin.iataCode,
    destinationLocationCode: formData.destination.iataCode,
    departureDate: formatDateForAPI(formData.departureDate),
    returnDate: formData.returnDate ? formatDateForAPI(formData.returnDate) : undefined,
    adults: formData.passengers.adults,
    children: formData.passengers.children > 0 ? formData.passengers.children : undefined,
    infants: formData.passengers.infants > 0 ? formData.passengers.infants : undefined,
    travelClass: formData.travelClass,
    oneWay: formData.tripType === 'one-way',
    nonStop: formData.preferences.nonStop,
    flexibleDates: formData.preferences.flexibleDates && 'enabled' in formData.preferences.flexibleDates ? {
      enabled: formData.preferences.flexibleDates.enabled,
      days: formData.preferences.flexibleDates.days
    } : undefined,
    maxPrice: formData.preferences.maxPrice,
    currencyCode: 'USD'
  };
}

/**
 * Format date for Amadeus API (YYYY-MM-DD) without timezone issues
 */
export function formatDateForAPI(date: Date): string {
  // Use local timezone values instead of UTC to avoid timezone shifts
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Validate IATA airport code
 */
export function validateIATACode(code: string): boolean {
  return /^[A-Z]{3}$/.test(code);
}

/**
 * Validate airport selection
 */
export function validateAirportSelection(airport: AirportSelection): boolean {
  return !!(
    airport &&
    airport.iataCode &&
    validateIATACode(airport.iataCode) &&
    airport.name &&
    airport.city &&
    airport.country
  );
}

/**
 * Validate passenger age for category
 */
export function validatePassengerAge(age: number, category: 'adult' | 'child' | 'infant'): boolean {
  switch (category) {
    case 'adult':
      return age >= 12;
    case 'child':
      return age >= 2 && age < 12;
    case 'infant':
      return age < 2;
    default:
      return false;
  }
}

/**
 * Get passenger category by age
 */
export function getPassengerCategory(age: number): 'adult' | 'child' | 'infant' {
  if (age < 2) return 'infant';
  if (age < 12) return 'child';
  return 'adult';
}

/**
 * Validate price range
 */
export function validatePriceRange(min: number, max: number): boolean {
  return min >= 0 && max > 0 && min < max && max <= 100000;
}

/**
 * Validate duration in minutes
 */
export function validateDuration(minutes: number): boolean {
  return minutes > 0 && minutes <= (24 * 60); // Max 24 hours
}

/**
 * Clean and format airport search query
 */
export function cleanAirportSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[^a-zA-Z0-9\s\-\.]/g, '') // Remove special characters except spaces, hyphens, and dots
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .substring(0, 50); // Limit length
}

/**
 * Validate search query for airports
 */
export function validateAirportSearchQuery(query: string): boolean {
  const cleaned = cleanAirportSearchQuery(query);
  return cleaned.length >= 2 && cleaned.length <= 50;
}

/**
 * Check if search results are valid
 */
export function validateSearchResults(results: any): boolean {
  return !!(
    results &&
    results.data &&
    Array.isArray(results.data) &&
    results.data.length >= 0
  );
}

/**
 * Validate flight offer structure
 */
export function validateFlightOffer(offer: any): boolean {
  return !!(
    offer &&
    offer.id &&
    offer.itineraries &&
    Array.isArray(offer.itineraries) &&
    offer.itineraries.length > 0 &&
    offer.price &&
    offer.price.total &&
    offer.price.currency
  );
}

/**
 * Check if dates are in valid range for booking
 */
export function isValidBookingDateRange(departureDate: string, returnDate?: string): boolean {
  const departure = new Date(departureDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Departure must be today or future
  if (departure < today) {
    return false;
  }
  
  // If return date provided, it must be after departure
  if (returnDate) {
    const returnD = new Date(returnDate);
    if (returnD <= departure) {
      return false;
    }
  }
  
  return true;
}

/**
 * Get minimum departure date (today)
 */
export function getMinDepartureDate(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Get maximum departure date (360 days from today)
 */
export function getMaxDepartureDate(): Date {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 360);
  return maxDate;
}

/**
 * Get minimum return date based on departure
 */
export function getMinReturnDate(departureDate: Date): Date {
  const minReturn = new Date(departureDate);
  minReturn.setDate(minReturn.getDate() + 1);
  return minReturn;
}

/**
 * Calculate trip duration in days
 */
export function calculateTripDuration(departureDate: string, returnDate: string): number {
  const departure = new Date(departureDate);
  const returnD = new Date(returnDate);
  const diffTime = returnD.getTime() - departure.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if flight is domestic (Brazil)
 */
export function isDomesticFlight(originCode: string, destinationCode: string): boolean {
  const brazilianAirports = [
    'GRU', 'CGH', 'VCP', 'GIG', 'SDU', 'BSB', 'SSA', 'REC', 'FOR', 
    'BEL', 'MAO', 'CWB', 'POA', 'FLN', 'VIX', 'CNF', 'NAT', 'MCZ',
    'CGB', 'AJU', 'JPA', 'THE', 'SLZ', 'PVH', 'RBR', 'BVB', 'CPV',
    'IOS', 'JDO', 'MGF', 'PHB', 'PNZ', 'UDI', 'NVT', 'GYN', 'CXJ'
  ];
  
  return brazilianAirports.includes(originCode) && brazilianAirports.includes(destinationCode);
}

/**
 * Get flight type description
 */
export function getFlightTypeDescription(originCode: string, destinationCode: string): string {
  if (isDomesticFlight(originCode, destinationCode)) {
    return 'Voo Doméstico';
  }
  return 'Voo Internacional';
}

/**
 * Validate traveler information for booking
 */
export function validateTravelerInfo(traveler: any): string[] {
  const errors: string[] = [];
  
  if (!traveler.name?.firstName) {
    errors.push('Nome é obrigatório');
  }
  
  if (!traveler.name?.lastName) {
    errors.push('Sobrenome é obrigatório');
  }
  
  if (!traveler.dateOfBirth) {
    errors.push('Data de nascimento é obrigatória');
  } else {
    const birthDate = new Date(traveler.dateOfBirth);
    const today = new Date();
    if (birthDate >= today) {
      errors.push('Data de nascimento deve ser no passado');
    }
  }
  
  if (!traveler.gender || !['MALE', 'FEMALE'].includes(traveler.gender)) {
    errors.push('Gênero é obrigatório');
  }
  
  return errors;
}

/**
 * Validate contact information for booking
 */
export function validateContactInfo(contact: any): string[] {
  const errors: string[] = [];
  
  if (!contact.emailAddress) {
    errors.push('Email é obrigatório');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.emailAddress)) {
    errors.push('Email deve ter formato válido');
  }
  
  if (!contact.phones || !Array.isArray(contact.phones) || contact.phones.length === 0) {
    errors.push('Pelo menos um telefone é obrigatório');
  } else {
    contact.phones.forEach((phone: any, index: number) => {
      if (!phone.countryCallingCode) {
        errors.push(`Código do país é obrigatório para telefone ${index + 1}`);
      }
      if (!phone.number) {
        errors.push(`Número é obrigatório para telefone ${index + 1}`);
      }
    });
  }
  
  return errors;
}

/**
 * Check if booking is refundable based on fare rules
 */
export function isRefundableBooking(flightOffer: any): boolean {
  // This would need to be implemented based on fare rules
  // For now, return a default value
  return false;
}

/**
 * Get booking deadline based on flight offer
 */
export function getBookingDeadline(flightOffer: any): Date | null {
  if (flightOffer.lastTicketingDate) {
    return new Date(flightOffer.lastTicketingDate);
  }
  return null;
}