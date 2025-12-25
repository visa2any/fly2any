/**
 * Flight Source Detection Utility
 *
 * Unified logic to detect if a flight offer is from Duffel or Amadeus/GDS.
 * Used consistently across search, booking, and confirmation flows.
 *
 * BUSINESS RULE:
 * - Duffel flights: Auto-ticketing via Duffel API + balance payment
 * - Amadeus/GDS flights: Manual ticketing via consolidator
 */

export type FlightSource = 'Duffel' | 'Amadeus';

export interface SourceDetectionResult {
  source: FlightSource;
  confidence: 'high' | 'medium' | 'low';
  detectionMethod: string;
  isDuffel: boolean;
  isAutoTicketable: boolean;
}

/**
 * Detect flight source with multiple fallback methods
 * Priority order ensures maximum detection accuracy
 */
export function detectFlightSource(offer: any): SourceDetectionResult {
  // Method 1: Explicit source property (highest confidence)
  if (offer?.source === 'Duffel') {
    return {
      source: 'Duffel',
      confidence: 'high',
      detectionMethod: 'explicit_source_property',
      isDuffel: true,
      isAutoTicketable: true,
    };
  }

  // Method 2: Duffel offer ID prefix (high confidence)
  // Duffel offer IDs always start with "off_"
  if (offer?.id?.startsWith('off_')) {
    return {
      source: 'Duffel',
      confidence: 'high',
      detectionMethod: 'offer_id_prefix',
      isDuffel: true,
      isAutoTicketable: true,
    };
  }

  // Method 3: Duffel-specific metadata fields
  if (offer?.owner?.iata_code || offer?.duffelMetadata) {
    return {
      source: 'Duffel',
      confidence: 'medium',
      detectionMethod: 'duffel_metadata',
      isDuffel: true,
      isAutoTicketable: true,
    };
  }

  // Method 4: Duffel total_amount field (Duffel uses snake_case)
  if (offer?.total_amount && offer?.total_currency) {
    return {
      source: 'Duffel',
      confidence: 'medium',
      detectionMethod: 'duffel_price_format',
      isDuffel: true,
      isAutoTicketable: true,
    };
  }

  // Method 5: Check for Amadeus-specific fields
  if (offer?.source === 'GDS' || offer?.source === 'Amadeus') {
    return {
      source: 'Amadeus',
      confidence: 'high',
      detectionMethod: 'explicit_source_property',
      isDuffel: false,
      isAutoTicketable: false,
    };
  }

  // Method 6: Amadeus dictionaries field
  if (offer?.dictionaries || offer?.validatingAirlineCodes) {
    return {
      source: 'Amadeus',
      confidence: 'medium',
      detectionMethod: 'amadeus_structure',
      isDuffel: false,
      isAutoTicketable: false,
    };
  }

  // Default: Unknown source → treat as Amadeus (safer, requires manual ticketing)
  return {
    source: 'Amadeus',
    confidence: 'low',
    detectionMethod: 'default_fallback',
    isDuffel: false,
    isAutoTicketable: false,
  };
}

/**
 * Quick check if offer is from Duffel
 */
export function isDuffelOffer(offer: any): boolean {
  return detectFlightSource(offer).isDuffel;
}

/**
 * Quick check if offer can be auto-ticketed
 */
export function isAutoTicketable(offer: any): boolean {
  return detectFlightSource(offer).isAutoTicketable;
}

/**
 * Get source string for database storage
 */
export function getSourceForStorage(offer: any): 'Duffel' | 'Amadeus' {
  return detectFlightSource(offer).source;
}

/**
 * Determine routing channel based on price and source
 *
 * RULES:
 * - Under $500 + Duffel available → DUFFEL (auto-ticket)
 * - Under $500 + No Duffel → CONSOLIDATOR (manual)
 * - $500+ → Either (based on profitability)
 */
export function determineTicketingChannel(
  offer: any,
  priceThreshold: number = 500
): {
  channel: 'DUFFEL_AUTO' | 'MANUAL_CONSOLIDATOR';
  reason: string;
} {
  const detection = detectFlightSource(offer);
  const price = parseFloat(offer?.price?.total || offer?.total_amount || '0');

  if (detection.isDuffel) {
    return {
      channel: 'DUFFEL_AUTO',
      reason: price < priceThreshold
        ? 'duffel_under_threshold_auto_ticket'
        : 'duffel_available_auto_ticket',
    };
  }

  return {
    channel: 'MANUAL_CONSOLIDATOR',
    reason: 'no_duffel_offer_manual_ticketing',
  };
}
