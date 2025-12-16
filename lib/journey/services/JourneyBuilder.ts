/**
 * Journey Builder Service
 * Core engine for building travel journeys
 */

import { nanoid } from 'nanoid';
import {
  Journey,
  JourneySearchParams,
  JourneyDay,
  JourneyDaySegment,
  JourneyPricing,
  JourneyValidationResult,
  JourneyWarning,
  JourneyPreferences,
  JourneyTravelers,
} from '../types';
import { format, addDays, differenceInDays, parseISO } from 'date-fns';

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_PREFERENCES: JourneyPreferences = {
  pace: 'balanced',
  interests: ['culture', 'food'],
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ============================================================================
// JOURNEY BUILDER
// ============================================================================

export class JourneyBuilder {
  /**
   * Build a new Journey from search parameters
   */
  static build(params: JourneySearchParams): Journey {
    const id = nanoid(12);
    const now = new Date().toISOString();

    const departureDate = parseISO(params.departureDate);
    const returnDate = parseISO(params.returnDate);
    const duration = differenceInDays(returnDate, departureDate) + 1;

    // Generate days
    const days = this.generateDays(departureDate, returnDate);

    // Initialize pricing
    const pricing = this.initializePricing();

    // Merge preferences with defaults
    const preferences: JourneyPreferences = {
      ...DEFAULT_PREFERENCES,
      ...params.preferences,
    };

    const journey: Journey = {
      id,
      status: 'draft',
      origin: {
        code: params.origin.split(',')[0].trim(),
        name: params.origin,
        city: '', // Will be populated from airport lookup
        country: '',
      },
      destination: {
        code: params.destination.split(',')[0].trim(),
        name: params.destination,
        city: '',
        country: '',
      },
      departureDate: params.departureDate,
      returnDate: params.returnDate,
      duration,
      travelers: params.travelers,
      preferences,
      days,
      pricing,
      warnings: [],
      createdAt: now,
      updatedAt: now,
    };

    return journey;
  }

  /**
   * Generate array of JourneyDay objects with flight/hotel placeholders
   */
  static generateDays(departureDate: Date, returnDate: Date): JourneyDay[] {
    const days: JourneyDay[] = [];
    const totalDays = differenceInDays(returnDate, departureDate) + 1;

    for (let i = 0; i < totalDays; i++) {
      const currentDate = addDays(departureDate, i);
      const dayOfWeek = DAY_NAMES[currentDate.getDay()];
      const isArrivalDay = i === 0;
      const isDepartureDay = i === totalDays - 1;

      // Build segments for this day
      const segments: JourneyDaySegment[] = [];

      // Add outbound flight on first day
      if (isArrivalDay) {
        segments.push({
          id: nanoid(8),
          type: 'outbound-flight',
        });
      }

      // Add hotel segment for all days except last (departure) day
      if (!isDepartureDay) {
        segments.push({
          id: nanoid(8),
          type: 'hotel',
        });
      }

      // Add return flight on last day
      if (isDepartureDay && totalDays > 1) {
        segments.push({
          id: nanoid(8),
          type: 'return-flight',
        });
      }

      const day: JourneyDay = {
        dayNumber: i + 1,
        date: format(currentDate, 'yyyy-MM-dd'),
        dayOfWeek,
        isArrivalDay,
        isDepartureDay,
        segments,
        experiences: [],
        warnings: [],
      };

      days.push(day);
    }

    return days;
  }

  /**
   * Initialize empty pricing structure
   */
  static initializePricing(): JourneyPricing {
    return {
      flights: { items: [], subtotal: 0 },
      hotels: { items: [], subtotal: 0 },
      experiences: { items: [], subtotal: 0, isEstimate: true },
      total: 0,
      currency: 'USD',
    };
  }

  /**
   * Validate journey configuration
   */
  static validate(journey: Journey): JourneyValidationResult {
    const errors: Array<{ field: string; message: string }> = [];
    const warnings: JourneyWarning[] = [];

    // Required fields
    if (!journey.origin.code) {
      errors.push({ field: 'origin', message: 'Origin is required' });
    }
    if (!journey.destination.code) {
      errors.push({ field: 'destination', message: 'Destination is required' });
    }
    if (!journey.departureDate) {
      errors.push({ field: 'departureDate', message: 'Departure date is required' });
    }
    if (!journey.returnDate) {
      errors.push({ field: 'returnDate', message: 'Return date is required' });
    }
    if (journey.travelers.adults < 1) {
      errors.push({ field: 'travelers', message: 'At least 1 adult is required' });
    }

    // Date validation
    const departure = parseISO(journey.departureDate);
    const returnD = parseISO(journey.returnDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (departure < today) {
      errors.push({ field: 'departureDate', message: 'Departure date must be in the future' });
    }
    if (returnD <= departure) {
      errors.push({ field: 'returnDate', message: 'Return date must be after departure' });
    }

    // Traveler validation
    if (journey.travelers.infants > journey.travelers.adults) {
      errors.push({ field: 'travelers', message: 'Infants cannot exceed number of adults' });
    }

    // Warnings for incomplete journey
    const hasOutboundFlight = journey.days[0]?.segments.some(
      (s) => s.type === 'outbound-flight' && s.flight
    );
    const hasReturnFlight = journey.days[journey.days.length - 1]?.segments.some(
      (s) => s.type === 'return-flight' && s.flight
    );
    const hasHotel = journey.days.some((d) =>
      d.segments.some((s) => s.type === 'hotel' && s.hotel) || d.accommodation
    );

    if (!hasOutboundFlight) {
      warnings.push({
        id: nanoid(8),
        type: 'timing',
        severity: 'warning',
        title: 'No outbound flight',
        message: 'Select an outbound flight to complete your journey',
      });
    }
    if (!hasReturnFlight) {
      warnings.push({
        id: nanoid(8),
        type: 'timing',
        severity: 'warning',
        title: 'No return flight',
        message: 'Select a return flight to complete your journey',
      });
    }
    if (!hasHotel) {
      warnings.push({
        id: nanoid(8),
        type: 'timing',
        severity: 'warning',
        title: 'No accommodation',
        message: 'Select a hotel for your stay',
      });
    }

    // Long trip warning
    if (journey.duration > 14) {
      warnings.push({
        id: nanoid(8),
        type: 'fatigue',
        severity: 'info',
        title: 'Long trip',
        message: 'Consider adding rest days to your itinerary',
        suggestion: 'AI can help optimize your schedule',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Calculate experience slots based on pace
   */
  static getExperienceSlots(day: JourneyDay, pace: JourneyPreferences['pace']): string[] {
    const slots: string[] = [];

    // Arrival day - limited time
    if (day.isArrivalDay) {
      if (pace !== 'relaxed') slots.push('afternoon');
      slots.push('evening');
      return slots;
    }

    // Departure day - limited time
    if (day.isDepartureDay) {
      slots.push('morning');
      if (pace === 'intensive') slots.push('afternoon');
      return slots;
    }

    // Full day
    switch (pace) {
      case 'relaxed':
        slots.push('morning', 'evening');
        break;
      case 'balanced':
        slots.push('morning', 'afternoon', 'evening');
        break;
      case 'intensive':
        slots.push('morning', 'afternoon', 'evening', 'night');
        break;
    }

    return slots;
  }

  /**
   * Update journey status
   */
  static updateStatus(journey: Journey): Journey {
    const validation = this.validate(journey);

    const hasFlights = journey.days.some((d) =>
      d.segments.some((s) =>
        (s.type === 'outbound-flight' || s.type === 'return-flight') && s.flight
      )
    );
    const hasHotel = journey.days.some((d) =>
      d.segments.some((s) => s.type === 'hotel' && s.hotel) || d.accommodation
    );
    const allBooked = journey.days.every((d) =>
      d.segments.every((s) => {
        if (s.type === 'outbound-flight' || s.type === 'return-flight') {
          return s.flight?.status === 'booked';
        }
        if (s.type === 'hotel') {
          return s.hotel?.status === 'booked';
        }
        return true;
      }) &&
      (!d.accommodation || d.accommodation.status === 'booked')
    );

    let status = journey.status;

    if (allBooked && hasFlights && hasHotel) {
      status = 'booked';
    } else if (hasFlights && hasHotel) {
      status = 'ready';
    } else if (validation.isValid) {
      status = 'draft';
    }

    return {
      ...journey,
      status,
      warnings: validation.warnings,
      updatedAt: new Date().toISOString(),
    };
  }
}

export default JourneyBuilder;
