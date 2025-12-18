/**
 * Duffel Provider Adapter
 * Implements BookingProvider interface for Duffel API
 */

import { duffelAPI } from '@/lib/api/duffel';
import type {
  BookingProvider,
  ProviderOrder,
  OrderStatus,
  PaymentStatus,
  NormalizedPassenger,
  NormalizedDocument,
  NormalizedItinerary,
  NormalizedSegment,
  OrderConditions,
  BookedService,
  AvailableService,
  CancellationQuote,
  CancellationResult,
  ChangeOption,
  ChangeResult,
  ServiceRequest,
  ServiceResult,
} from './types';

export class DuffelAdapter implements BookingProvider {
  name = 'Duffel';
  code = 'duffel' as const;

  async getOrder(orderId: string): Promise<ProviderOrder> {
    const response = await duffelAPI.getOrder(orderId);
    const order = response.data;

    return this.normalizeOrder(order);
  }

  async cancelOrder(orderId: string): Promise<CancellationResult> {
    try {
      await duffelAPI.cancelOrder(orderId);
      return {
        success: true,
        orderId,
        status: 'cancelled',
      };
    } catch (error: any) {
      return {
        success: false,
        orderId,
        status: 'failed',
        error: error.message,
      };
    }
  }

  async getCancellationQuote(orderId: string): Promise<CancellationQuote> {
    const response = await duffelAPI.getOrderCancellationQuote(orderId);
    const quote = response.data || response;

    return {
      orderId,
      refundAmount: parseFloat(quote.refund_amount || '0'),
      penaltyAmount: parseFloat(quote.penalty_amount || '0'),
      currency: quote.refund_currency || 'USD',
      expiresAt: quote.expires_at,
      canCancel: quote.confirmed_at == null,
    };
  }

  async getAvailableServices(orderId: string): Promise<AvailableService[]> {
    const response = await duffelAPI.getOrderAvailableServices(orderId);
    const services = response.data || [];

    return services.map((s: any) => ({
      id: s.id,
      type: this.mapServiceType(s.type),
      segmentIds: s.segment_ids || [],
      passengerIds: s.passenger_ids || [],
      maxQuantity: s.maximum_quantity || 1,
      totalAmount: parseFloat(s.total_amount || '0'),
      currency: s.total_currency || 'USD',
      description: s.metadata?.baggage_type || s.type,
      metadata: s.metadata,
    }));
  }

  async addServices(orderId: string, services: ServiceRequest[]): Promise<ServiceResult> {
    try {
      const duffelServices = services.map(s => ({
        id: s.serviceId,
        quantity: s.quantity,
      }));

      const response = await duffelAPI.addServicesToOrder(orderId, duffelServices);
      const order = response.data;

      return {
        success: true,
        services: this.normalizeServices(order.services || []),
        newTotalAmount: parseFloat(order.total_amount || '0'),
      };
    } catch (error: any) {
      return {
        success: false,
        services: [],
        newTotalAmount: 0,
        error: error.message,
      };
    }
  }

  // ==================== NORMALIZATION HELPERS ====================

  private normalizeOrder(order: any): ProviderOrder {
    const passengers = this.normalizePassengers(order.passengers || [], order.documents || []);
    const documents = this.normalizeDocuments(order.documents || []);

    return {
      id: order.id,
      provider: 'Duffel',
      bookingReference: order.booking_reference,
      status: this.mapOrderStatus(order),
      passengers,
      documents,
      itineraries: this.normalizeItineraries(order.slices || []),
      totalAmount: parseFloat(order.total_amount || '0'),
      currency: order.total_currency || 'USD',
      paymentStatus: this.mapPaymentStatus(order.payment_status),
      balanceDue: parseFloat(order.payment_status?.balance_due || '0'),
      conditions: this.normalizeConditions(order.conditions),
      services: this.normalizeServices(order.services || []),
      createdAt: order.created_at,
      syncedAt: new Date().toISOString(),
      raw: order,
    };
  }

  private normalizePassengers(passengers: any[], documents: any[]): NormalizedPassenger[] {
    return passengers.map(p => {
      const ticket = documents.find(
        d => d.passenger_ids?.includes(p.id) && d.type === 'electronic_ticket'
      );

      return {
        id: p.id,
        firstName: p.given_name || p.first_name,
        lastName: p.family_name || p.last_name,
        type: this.mapPassengerType(p.type),
        dateOfBirth: p.born_on,
        email: p.email,
        phone: p.phone_number,
        ticketNumber: ticket?.unique_identifier,
        ticketIssuedAt: ticket?.created_at,
      };
    });
  }

  private normalizeDocuments(documents: any[]): NormalizedDocument[] {
    return documents.map(d => ({
      type: d.type === 'electronic_ticket' ? 'electronic_ticket' : 'itinerary',
      passengerId: d.passenger_ids?.[0],
      uniqueIdentifier: d.unique_identifier,
      issuedAt: d.created_at,
    }));
  }

  private normalizeItineraries(slices: any[]): NormalizedItinerary[] {
    return slices.map((slice, idx) => ({
      id: slice.id,
      direction: idx === 0 ? 'outbound' : 'return',
      segments: this.normalizeSegments(slice.segments || []),
      duration: slice.duration || 'PT0H',
    }));
  }

  private normalizeSegments(segments: any[]): NormalizedSegment[] {
    return segments.map(seg => ({
      id: seg.id,
      flightNumber: `${seg.marketing_carrier?.iata_code || seg.operating_carrier?.iata_code}${seg.marketing_carrier_flight_number}`,
      airline: {
        code: seg.marketing_carrier?.iata_code || seg.operating_carrier?.iata_code,
        name: seg.marketing_carrier?.name || seg.operating_carrier?.name || 'Unknown',
      },
      aircraft: seg.aircraft ? {
        code: seg.aircraft.iata_code,
        name: seg.aircraft.name || seg.aircraft.iata_code,
      } : undefined,
      departure: {
        airport: seg.origin?.iata_code,
        terminal: seg.origin_terminal,
        at: seg.departing_at,
      },
      arrival: {
        airport: seg.destination?.iata_code,
        terminal: seg.destination_terminal,
        at: seg.arriving_at,
      },
      duration: seg.duration || 'PT0H',
      cabinClass: seg.passengers?.[0]?.cabin_class_marketing_name || seg.passengers?.[0]?.cabin_class || 'economy',
      fareBrand: seg.passengers?.[0]?.fare_brand_name,
    }));
  }

  private normalizeConditions(conditions: any): OrderConditions {
    if (!conditions) return {};

    return {
      refundBeforeDeparture: conditions.refund_before_departure ? {
        allowed: conditions.refund_before_departure.allowed,
        penaltyAmount: parseFloat(conditions.refund_before_departure.penalty_amount || '0'),
        penaltyCurrency: conditions.refund_before_departure.penalty_currency,
      } : undefined,
      changeBeforeDeparture: conditions.change_before_departure ? {
        allowed: conditions.change_before_departure.allowed,
        penaltyAmount: parseFloat(conditions.change_before_departure.penalty_amount || '0'),
        penaltyCurrency: conditions.change_before_departure.penalty_currency,
      } : undefined,
    };
  }

  private normalizeServices(services: any[]): BookedService[] {
    return services.map(s => ({
      id: s.id,
      type: this.mapServiceType(s.type),
      segmentId: s.segment_ids?.[0],
      passengerId: s.passenger_ids?.[0],
      quantity: s.quantity || 1,
      totalAmount: parseFloat(s.total_amount || '0'),
      currency: s.total_currency || 'USD',
      metadata: s.metadata,
    }));
  }

  // ==================== MAPPING HELPERS ====================

  private mapOrderStatus(order: any): OrderStatus {
    if (order.cancelled_at) return 'cancelled';
    if (order.documents?.some((d: any) => d.type === 'electronic_ticket')) return 'ticketed';
    if (order.booking_reference) return 'confirmed';
    return 'pending';
  }

  private mapPaymentStatus(status: any): PaymentStatus {
    if (!status) return 'awaiting_payment';
    if (status.awaiting_payment === false) return 'paid';
    if (parseFloat(status.balance_due || '0') > 0) return 'awaiting_payment';
    return 'paid';
  }

  private mapPassengerType(type: string): 'adult' | 'child' | 'infant' {
    const t = type?.toLowerCase();
    if (t === 'child' || t === 'seated_child') return 'child';
    if (t === 'infant' || t === 'infant_without_seat') return 'infant';
    return 'adult';
  }

  private mapServiceType(type: string): BookedService['type'] {
    const t = type?.toLowerCase();
    if (t?.includes('bag')) return 'baggage';
    if (t?.includes('seat')) return 'seat';
    if (t?.includes('meal')) return 'meal';
    if (t?.includes('lounge')) return 'lounge';
    return 'other';
  }
}

// Export singleton
export const duffelAdapter = new DuffelAdapter();
