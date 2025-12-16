/**
 * Pricing Aggregator Service
 * Calculates and aggregates journey pricing
 */

import {
  Journey,
  JourneyPricing,
  JourneyPricingItem,
  JourneyDay,
  JourneyFlightSegment,
  JourneyExperience,
  JourneyAccommodation,
} from '../types';
import { normalizePrice } from '@/lib/flights/types';

// ============================================================================
// PRICING AGGREGATOR
// ============================================================================

export class PricingAggregator {
  /**
   * Calculate complete journey pricing
   */
  static calculate(journey: Journey): JourneyPricing {
    const flights = this.calculateFlights(journey);
    const hotels = this.calculateHotels(journey);
    const experiences = this.calculateExperiences(journey);

    const total = flights.subtotal + hotels.subtotal + experiences.subtotal;
    const perPerson = journey.travelers.adults > 0
      ? total / (journey.travelers.adults + journey.travelers.children)
      : total;

    // Calculate savings vs booking separately (estimate 5-15% savings)
    const separatePrice = total * 1.08; // 8% higher if booked separately
    const savings = {
      amount: Math.round(separatePrice - total),
      percentage: 8,
      vsSepatate: separatePrice,
    };

    return {
      flights,
      hotels,
      experiences,
      total: Math.round(total * 100) / 100,
      currency: journey.pricing.currency || 'USD',
      perPerson: Math.round(perPerson * 100) / 100,
      savings,
    };
  }

  /**
   * Calculate flight pricing
   */
  static calculateFlights(journey: Journey): { items: JourneyPricingItem[]; subtotal: number } {
    const items: JourneyPricingItem[] = [];
    let subtotal = 0;

    journey.days.forEach((day) => {
      day.segments.forEach((segment) => {
        if ((segment.type === 'outbound-flight' || segment.type === 'return-flight') && segment.flight) {
          const flight = segment.flight;
          const price = flight.price.amount;

          items.push({
            id: segment.id,
            name: `${segment.type === 'outbound-flight' ? 'Outbound' : 'Return'} Flight`,
            quantity: 1,
            unitPrice: price,
            totalPrice: price,
            currency: flight.price.currency,
          });

          subtotal += price;
        }
      });
    });

    return { items, subtotal };
  }

  /**
   * Calculate hotel pricing
   */
  static calculateHotels(journey: Journey): { items: JourneyPricingItem[]; subtotal: number } {
    const items: JourneyPricingItem[] = [];
    let subtotal = 0;

    // Find unique hotels from segments (new format)
    const hotelIds = new Set<string>();

    journey.days.forEach((day) => {
      // Check new segment format
      day.segments.forEach((segment) => {
        if (segment.type === 'hotel' && segment.hotel && !hotelIds.has(segment.hotel.id)) {
          hotelIds.add(segment.hotel.id);
          const hotel = segment.hotel;
          const totalPrice = hotel.price.amount;
          const nights = this.calculateNights(hotel.checkIn, hotel.checkOut);

          items.push({
            id: hotel.id,
            name: hotel.name,
            quantity: nights,
            unitPrice: hotel.price.perNight || totalPrice / nights,
            totalPrice,
            currency: hotel.price.currency,
          });

          subtotal += totalPrice;
        }
      });

      // Also check old accommodation format for backwards compatibility
      if (day.accommodation && !hotelIds.has(day.accommodation.id)) {
        hotelIds.add(day.accommodation.id);
        const acc = day.accommodation;
        const totalPrice = acc.totalPrice?.amount || 0;

        items.push({
          id: acc.id,
          name: acc.hotel.name,
          quantity: acc.nights,
          unitPrice: totalPrice / acc.nights,
          totalPrice,
          currency: acc.totalPrice?.currency || 'USD',
        });

        subtotal += totalPrice;
      }
    });

    return { items, subtotal };
  }

  /**
   * Calculate nights between two dates
   */
  private static calculateNights(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  }

  /**
   * Calculate experiences pricing (estimated)
   */
  static calculateExperiences(journey: Journey): {
    items: JourneyPricingItem[];
    subtotal: number;
    isEstimate: boolean;
  } {
    const items: JourneyPricingItem[] = [];
    let subtotal = 0;
    let hasEstimates = false;

    journey.days.forEach((day) => {
      day.experiences.forEach((exp) => {
        if (exp.status === 'added' || exp.status === 'booked') {
          const price = exp.price.amount;

          items.push({
            id: exp.id,
            name: exp.name,
            quantity: 1,
            unitPrice: price,
            totalPrice: price,
            currency: exp.price.currency,
          });

          subtotal += price;
          if (exp.price.isEstimate) hasEstimates = true;
        }
      });
    });

    return { items, subtotal, isEstimate: hasEstimates };
  }

  /**
   * Format price for display
   */
  static formatPrice(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Calculate price per night
   */
  static getPricePerNight(total: number, nights: number): number {
    return nights > 0 ? Math.round(total / nights) : total;
  }

  /**
   * Calculate price per person
   */
  static getPricePerPerson(total: number, travelers: { adults: number; children: number }): number {
    const count = travelers.adults + travelers.children;
    return count > 0 ? Math.round(total / count) : total;
  }

  /**
   * Generate pricing summary text
   */
  static getSummaryText(pricing: JourneyPricing): string {
    const parts: string[] = [];

    if (pricing.flights.subtotal > 0) {
      parts.push(`Flights: ${this.formatPrice(pricing.flights.subtotal, pricing.currency)}`);
    }
    if (pricing.hotels.subtotal > 0) {
      parts.push(`Hotels: ${this.formatPrice(pricing.hotels.subtotal, pricing.currency)}`);
    }
    if (pricing.experiences.subtotal > 0) {
      const suffix = pricing.experiences.isEstimate ? ' (est.)' : '';
      parts.push(`Experiences: ${this.formatPrice(pricing.experiences.subtotal, pricing.currency)}${suffix}`);
    }

    return parts.join(' + ');
  }
}

export default PricingAggregator;
