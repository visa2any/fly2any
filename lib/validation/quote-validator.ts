/**
 * Comprehensive Quote Validation
 * Validates all aspects of quote before save/update
 */

import {
  QuoteErrorFactory,
  generateCorrelationId,
  createQuoteApiError,
} from "@/lib/errors/QuoteApiErrors";
import prisma from "@/lib/prisma";
import { calculateQuotePricing, validatePricing } from "@/lib/pricing/QuotePricingService";
import type { PricingContext } from "@/lib/pricing/QuotePricingService";

/**
 * Validate quote data structure
 */
export async function validateQuoteData(
  quoteData: any,
  operation: 'CREATE' | 'UPDATE'
): Promise<void> {
  const correlationId = generateCorrelationId();

  // Required fields
  const requiredFields = ['tripName', 'destination', 'startDate', 'endDate'];
  for (const field of requiredFields) {
    if (!quoteData[field]) {
      throw QuoteErrorFactory.validationFailed(
        `${field} is required`,
        correlationId,
        { field }
      );
    }
  }

  // Validate travelers
  const adults = quoteData.adults || 0;
  const children = quoteData.children || 0;
  const infants = quoteData.infants || 0;

  if (adults < 1) {
    throw QuoteErrorFactory.validationFailed(
      'At least one adult is required',
      correlationId,
      { field: 'adults' }
    );
  }

  const totalTravelers = adults + children + infants;
  if (totalTravelers > 50) {
    throw QuoteErrorFactory.validationFailed(
      'Maximum 50 travelers allowed',
      correlationId,
      { totalTravelers }
    );
  }

  // Validate dates
  const startDate = new Date(quoteData.startDate);
  const endDate = new Date(quoteData.endDate);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw QuoteErrorFactory.validationFailed(
      'Invalid date format',
      correlationId,
      { startDate: quoteData.startDate, endDate: quoteData.endDate }
    );
  }

  if (endDate <= startDate) {
    throw QuoteErrorFactory.validationFailed(
      'End date must be after start date',
      correlationId,
      { startDate, endDate }
    );
  }

  // Validate duration
  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  if (duration > 365) {
    throw QuoteErrorFactory.validationFailed(
      'Maximum trip duration is 365 days',
      correlationId,
      { duration }
    );
  }

  // Validate currency
  const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'CHF', 'JPY'];
  if (quoteData.currency && !validCurrencies.includes(quoteData.currency)) {
    throw createQuoteApiError(
      'CURRENCY_INVALID',
      `Invalid currency: ${quoteData.currency}`,
      'HIGH',
      false,
      correlationId,
      { validCurrencies, provided: quoteData.currency }
    );
  }

  // Validate pricing fields
  if (quoteData.agentMarkupPercent !== undefined) {
    if (quoteData.agentMarkupPercent < 0 || quoteData.agentMarkupPercent > 100) {
      throw QuoteErrorFactory.validationFailed(
        'Agent markup must be between 0 and 100',
        correlationId,
        { agentMarkupPercent: quoteData.agentMarkupPercent }
      );
    }
  }

  if (quoteData.discount !== undefined && quoteData.discount < 0) {
    throw QuoteErrorFactory.validationFailed(
      'Discount cannot be negative',
      correlationId,
      { discount: quoteData.discount }
    );
  }

  if (quoteData.expiresInDays !== undefined) {
    if (quoteData.expiresInDays < 1 || quoteData.expiresInDays > 90) {
      throw QuoteErrorFactory.validationFailed(
        'Expiration must be between 1 and 90 days',
        correlationId,
        { expiresInDays: quoteData.expiresInDays }
      );
    }
  }
}

/**
 * Validate client ownership
 */
export async function validateClientOwnership(
  clientId: string,
  agentId: string
): Promise<void> {
  const correlationId = generateCorrelationId();

  const client = await prisma!.agentClient.findFirst({
    where: {
      id: clientId,
      agentId: agentId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  });

  if (!client) {
    throw QuoteErrorFactory.clientNotFound(clientId, correlationId);
  }
}

/**
 * Validate pricing consistency
 */
export async function validatePricingConsistency(
  quoteData: any,
  computedPricing: any,
  travelers: number
): Promise<void> {
  const correlationId = generateCorrelationId();

  // Validate pricing calculation
  const validation = validatePricing(computedPricing, travelers);
  if (!validation.valid) {
    throw QuoteErrorFactory.pricingValidationFailed(
      correlationId,
      validation.errors
    );
  }

  // Check if provided total matches computed total
  if (quoteData.total !== undefined && quoteData.total !== computedPricing.total) {
    throw QuoteErrorFactory.itemsInconsistent(correlationId, {
      expectedTotal: computedPricing.total,
      calculatedTotal: quoteData.total,
    });
  }

  // Validate subtotal
  const itemsTotal = computeItemsTotal(quoteData);
  if (Math.abs(itemsTotal - computedPricing.subtotal) > 0.01) {
    throw QuoteErrorFactory.itemsInconsistent(correlationId, {
      expectedTotal: itemsTotal,
      calculatedTotal: computedPricing.subtotal,
    });
  }
}

/**
 * Compute total from all items
 */
function computeItemsTotal(quoteData: any): number {
  const flights = (quoteData.flights || []).reduce((sum: number, f: any) => sum + f.price, 0);
  const hotels = (quoteData.hotels || []).reduce((sum: number, h: any) => sum + h.price, 0);
  const activities = (quoteData.activities || []).reduce((sum: number, a: any) => sum + a.price, 0);
  const transfers = (quoteData.transfers || []).reduce((sum: number, t: any) => sum + t.price, 0);
  const carRentals = (quoteData.carRentals || []).reduce((sum: number, c: any) => sum + c.price, 0);
  const insurance = quoteData.insurance?.price || 0;
  const customItems = (quoteData.customItems || []).reduce((sum: number, i: any) => sum + i.price, 0);

  return flights + hotels + activities + transfers + carRentals + insurance + customItems;
}

/**
 * Calculate pricing for quote
 */
export function calculateQuotePricingSafe(
  quoteData: any,
  travelers: number
) {
  const allItems = [
    ...quoteData.flights || [],
    ...quoteData.hotels || [],
    ...quoteData.activities || [],
    ...quoteData.transfers || [],
    ...quoteData.carRentals || [],
    ...quoteData.customItems || [],
  ];

  const pricingContext: PricingContext = {
    travelers,
    currency: quoteData.currency || 'USD',
    agentMarkupPercent: quoteData.agentMarkupPercent || 15,
    taxes: quoteData.taxes || 0,
    fees: quoteData.fees || 0,
    discount: quoteData.discount || 0,
  };

  return calculateQuotePricing(allItems, pricingContext);
}

/**
 * Validate quote items
 */
export async function validateQuoteItems(quoteData: any): Promise<void> {
  const correlationId = generateCorrelationId();

  // Validate flights
  if (quoteData.flights) {
    quoteData.flights.forEach((flight: any, index: number) => {
      if (!flight.airline || !flight.price || !flight.date) {
        throw QuoteErrorFactory.validationFailed(
          `Flight at index ${index} is missing required fields`,
          correlationId,
          { index, flight }
        );
      }
      if (flight.price < 0) {
        throw QuoteErrorFactory.validationFailed(
          `Flight price cannot be negative at index ${index}`,
          correlationId,
          { index, price: flight.price }
        );
      }
    });
  }

  // Validate hotels
  if (quoteData.hotels) {
    quoteData.hotels.forEach((hotel: any, index: number) => {
      if (!hotel.name || !hotel.price || !hotel.checkIn || !hotel.checkOut) {
        throw QuoteErrorFactory.validationFailed(
          `Hotel at index ${index} is missing required fields`,
          correlationId,
          { index, hotel }
        );
      }
      if (hotel.price < 0) {
        throw QuoteErrorFactory.validationFailed(
          `Hotel price cannot be negative at index ${index}`,
          correlationId,
          { index, price: hotel.price }
        );
      }
    });
  }

  // Validate activities
  if (quoteData.activities) {
    quoteData.activities.forEach((activity: any, index: number) => {
      if (!activity.name || !activity.price) {
        throw QuoteErrorFactory.validationFailed(
          `Activity at index ${index} is missing required fields`,
          correlationId,
          { index, activity }
        );
      }
      if (activity.price < 0) {
        throw QuoteErrorFactory.validationFailed(
          `Activity price cannot be negative at index ${index}`,
          correlationId,
          { index, price: activity.price }
        );
      }
    });
  }
}