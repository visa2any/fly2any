/**
 * 🎯 Enhanced Amadeus Fare Rules Parser
 * Extracts maximum real data from all Amadeus API sources
 */

export interface RealFareRulesData {
  refund: {
    allowed: boolean | null;
    fee: string | null;
    penalty: string | null;
    beforeDeparture: string | null;
    afterDeparture: string | null;
    dataSource: 'api' | 'fare-rules' | 'fare-basis' | 'estimated';
    confidence: number; // 0-100
  };
  change: {
    allowed: boolean | null;
    fee: string | null;
    penalty: string | null;
    sameDayChange: boolean | null;
    dataSource: 'api' | 'fare-rules' | 'fare-basis' | 'estimated';
    confidence: number;
  };
  baggage: {
    carryOn: {
      included: boolean;
      weight: string | null;
      dimensions: string | null;
      dataSource: 'api' | 'airline-standard' | 'estimated';
    };
    checked: {
      included: boolean;
      quantity: number;
      weight: string | null;
      additionalFee: string | null;
      dataSource: 'api' | 'fare-rules' | 'estimated';
    };
  };
  seatSelection: {
    advance: boolean | null;
    fee: string | null;
    free: boolean | null;
    dataSource: 'api' | 'fare-rules' | 'estimated';
  };
  fareType: {
    category: 'BASIC' | 'STANDARD' | 'FLEXIBLE' | null;
    brandedFare: string | null;
    fareBasis: string | null;
    dataSource: 'api' | 'fare-basis' | 'branded-fare';
    confidence: number;
  };
}

/**
 * Extract maximum real data from Amadeus offer
 */
export function extractRealFareRulesData(offer: any): RealFareRulesData {
  const result: RealFareRulesData = {
    refund: {
      allowed: null,
      fee: null,
      penalty: null,
      beforeDeparture: null,
      afterDeparture: null,
      dataSource: 'estimated',
      confidence: 0
    },
    change: {
      allowed: null,
      fee: null,
      penalty: null,
      sameDayChange: null,
      dataSource: 'estimated',
      confidence: 0
    },
    baggage: {
      carryOn: {
        included: true, // IATA standard
        weight: '8kg', // IATA standard
        dimensions: '55x40x20cm', // IATA standard
        dataSource: 'airline-standard'
      },
      checked: {
        included: false,
        quantity: 0,
        weight: null,
        additionalFee: null,
        dataSource: 'estimated'
      }
    },
    seatSelection: {
      advance: null,
      fee: null,
      free: null,
      dataSource: 'estimated'
    },
    fareType: {
      category: null,
      brandedFare: null,
      fareBasis: null,
      dataSource: 'api',
      confidence: 0
    }
  };

  // 1. Extract from pricingOptions (highest confidence API data)
  const pricingOptions = offer.pricingOptions;
  if (pricingOptions) {
    // Refund data from API
    if (pricingOptions.refundableFare !== undefined) {
      result.refund.allowed = pricingOptions.refundableFare;
      result.refund.dataSource = 'api';
      result.refund.confidence = 95;
    }

    // Change data from API
    if (pricingOptions.noPenaltyFare !== undefined) {
      result.change.allowed = pricingOptions.noPenaltyFare;
      result.change.fee = pricingOptions.noPenaltyFare ? 'Free' : 'Fee applies';
      result.change.dataSource = 'api';
      result.change.confidence = 95;
    }

    if (pricingOptions.noRestrictionFare !== undefined) {
      if (result.change.allowed === null) {
        result.change.allowed = pricingOptions.noRestrictionFare;
        result.change.dataSource = 'api';
        result.change.confidence = 90;
      }
    }
  }

  // 2. Extract baggage from travelerPricings (real API data)
  const travelerPricing = offer.travelerPricings?.[0];
  if (travelerPricing?.fareDetailsBySegment?.[0]) {
    const fareDetails = travelerPricing.fareDetailsBySegment[0];
    
    // Real baggage data from API
    if (fareDetails.includedCheckedBags) {
      const checkedBags = fareDetails.includedCheckedBags;
      result.baggage.checked.included = (checkedBags.quantity || 0) > 0;
      result.baggage.checked.quantity = checkedBags.quantity || 0;
      result.baggage.checked.weight = checkedBags.weight ? 
        `${checkedBags.weight}${checkedBags.weightUnit?.toLowerCase() || 'kg'}` : null;
      result.baggage.checked.dataSource = 'api';
    }

    // Extract fare basis for fare type analysis
    if (fareDetails.fareBasis) {
      result.fareType.fareBasis = fareDetails.fareBasis;
      result.fareType.category = analyzeFareBasis(fareDetails.fareBasis, fareDetails.cabin);
      result.fareType.dataSource = 'fare-basis';
      result.fareType.confidence = 85;
    }

    // Extract branded fare
    if (fareDetails.brandedFare) {
      result.fareType.brandedFare = fareDetails.brandedFare;
      if (!result.fareType.category) {
        result.fareType.category = analyzeBrandedFare(fareDetails.brandedFare, fareDetails.cabin);
        result.fareType.dataSource = 'branded-fare';
        result.fareType.confidence = 80;
      }
    }
  }

  // 3. Parse detailed fare rules if available
  if (offer.detailedFareRules) {
    parseDetailedFareRulesAdvanced(offer.detailedFareRules, result);
  }

  // 4. Apply fare basis rules to enhance missing data
  if (result.fareType.fareBasis && result.fareType.category) {
    enhanceDataFromFareCategory(result);
  }

  // 5. Apply airline-specific rules
  const airline = offer.validatingAirlineCodes?.[0];
  if (airline) {
    applyAirlineSpecificRules(airline, result);
  }

  return result;
}

/**
 * Analyze fare basis code to determine fare type
 */
function analyzeFareBasis(fareBasis: string, cabinClass?: string): 'BASIC' | 'STANDARD' | 'FLEXIBLE' | null {
  const code = fareBasis.toUpperCase();
  const firstLetter = code.charAt(0);
  const cabin = cabinClass?.toUpperCase();
  
  // 🎯 PRIORITY: CABIN CLASS DETERMINES BASE FARE TYPE
  if (cabin === 'BUSINESS' || cabin === 'FIRST') {
    return 'FLEXIBLE'; // Business/First are always flexible
  } else if (cabin === 'PREMIUM_ECONOMY') {
    return 'STANDARD'; // Premium Economy is standard tier
  }
  
  // For Economy, analyze fare basis for granular classification
  if (cabin === 'ECONOMY') {
    // IATA fare basis analysis for Economy
    if (['Y', 'H', 'B'].includes(firstLetter)) {
      return 'FLEXIBLE'; // Full fare economy
    } else if (['W', 'S', 'A', 'F'].includes(firstLetter)) {
      return 'STANDARD'; // Mid-tier restrictions
    } else if (['K', 'L', 'M', 'N', 'Q', 'T', 'V', 'X', 'Z'].includes(firstLetter)) {
      return 'BASIC'; // Heavily restricted
    }
    
    // Advanced analysis based on fare basis patterns
    if (code.includes('PROMO') || code.includes('SALE') || code.includes('BASIC')) {
      return 'BASIC';
    } else if (code.includes('FLEX') || code.includes('FULL') || code.includes('PREMIUM')) {
      return 'FLEXIBLE';
    }
    
    return 'STANDARD'; // Default for Economy
  }
  
  // Fallback to original logic if no cabin class
  if (['Y', 'H', 'B'].includes(firstLetter)) {
    return 'FLEXIBLE';
  } else if (['W', 'S', 'A', 'F'].includes(firstLetter)) {
    return 'STANDARD';
  } else if (['K', 'L', 'M', 'N', 'Q', 'T', 'V', 'X', 'Z'].includes(firstLetter)) {
    return 'BASIC';
  }
  
  return 'STANDARD';
}

/**
 * Analyze branded fare name
 */
function analyzeBrandedFare(brandedFare: string, cabinClass?: string): 'BASIC' | 'STANDARD' | 'FLEXIBLE' | null {
  const branded = brandedFare.toLowerCase();
  const cabin = cabinClass?.toUpperCase();
  
  // 🎯 PRIORITY: CABIN CLASS DETERMINES BASE FARE TYPE
  if (cabin === 'BUSINESS' || cabin === 'FIRST') {
    return 'FLEXIBLE'; // Business/First are always flexible
  } else if (cabin === 'PREMIUM_ECONOMY') {
    return 'STANDARD'; // Premium Economy is standard tier
  }
  
  if (branded.includes('basic') || branded.includes('light') || branded.includes('saver')) {
    return 'BASIC';
  } else if (branded.includes('flex') || branded.includes('premium') || branded.includes('plus')) {
    return 'FLEXIBLE';
  } else if (branded.includes('standard') || branded.includes('main') || branded.includes('classic')) {
    return 'STANDARD';
  }
  
  return null;
}

/**
 * Parse detailed fare rules text for real data
 */
function parseDetailedFareRulesAdvanced(detailedFareRules: any, result: RealFareRulesData): void {
  try {
    if (Array.isArray(detailedFareRules)) {
      detailedFareRules.forEach(rule => {
        if (rule.category && rule.text) {
          parseRuleCategoryAdvanced(rule.category, rule.text, result);
        }
      });
    } else if (typeof detailedFareRules === 'string') {
      parseRawFareRulesTextAdvanced(detailedFareRules, result);
    } else if (typeof detailedFareRules === 'object') {
      // Handle structured fare rules
      Object.keys(detailedFareRules).forEach(key => {
        const value = detailedFareRules[key];
        if (typeof value === 'string') {
          parseRuleCategoryAdvanced(key, value, result);
        }
      });
    }
  } catch (error) {
    console.warn('Error parsing detailed fare rules:', error);
  }
}

/**
 * Parse individual rule category with advanced patterns
 */
function parseRuleCategoryAdvanced(category: string, text: string, result: RealFareRulesData): void {
  const cat = category.toLowerCase();
  const txt = text.toLowerCase();

  // Refund rules
  if (cat.includes('refund') || cat.includes('cancel')) {
    if (txt.includes('non-refundable') || txt.includes('no refund')) {
      result.refund.allowed = false;
      result.refund.dataSource = 'fare-rules';
      result.refund.confidence = 90;
    } else if (txt.includes('refundable') || txt.includes('refund allowed')) {
      result.refund.allowed = true;
      result.refund.dataSource = 'fare-rules';
      result.refund.confidence = 90;
      
      // Extract fee information
      const feeMatch = txt.match(/(?:fee|penalty)[\s:]*(?:usd|eur|gbp|$|€|£)?\s*(\d+)/i);
      if (feeMatch) {
        result.refund.fee = `$${feeMatch[1]}`;
      } else if (txt.includes('no fee') || txt.includes('free refund')) {
        result.refund.fee = 'Free';
      }
    }
  }

  // Change rules
  if (cat.includes('change') || cat.includes('reissue') || cat.includes('exchange')) {
    if (txt.includes('no changes') || txt.includes('changes not permitted')) {
      result.change.allowed = false;
      result.change.dataSource = 'fare-rules';
      result.change.confidence = 90;
    } else if (txt.includes('changes allowed') || txt.includes('reissue permitted')) {
      result.change.allowed = true;
      result.change.dataSource = 'fare-rules';
      result.change.confidence = 90;
      
      // Extract fee information
      const feeMatch = txt.match(/(?:fee|penalty)[\s:]*(?:usd|eur|gbp|$|€|£)?\s*(\d+)/i);
      if (feeMatch) {
        result.change.fee = `$${feeMatch[1]}`;
      } else if (txt.includes('no fee') || txt.includes('free change')) {
        result.change.fee = 'Free';
      }
    }
  }

  // Baggage rules
  if (cat.includes('baggage')) {
    const baggageMatch = txt.match(/(\d+)\s*x?\s*(\d+)\s*(kg|lb)/i);
    if (baggageMatch) {
      result.baggage.checked.quantity = parseInt(baggageMatch[1]);
      result.baggage.checked.weight = `${baggageMatch[2]}${baggageMatch[3].toLowerCase()}`;
      result.baggage.checked.included = true;
      result.baggage.checked.dataSource = 'fare-rules';
    }
  }

  // Seat selection rules
  if (cat.includes('seat')) {
    if (txt.includes('advance seat selection') || txt.includes('seat assignment')) {
      result.seatSelection.advance = true;
      result.seatSelection.dataSource = 'fare-rules';
      
      if (txt.includes('free') || txt.includes('no charge')) {
        result.seatSelection.free = true;
        result.seatSelection.fee = 'Free';
      } else {
        const feeMatch = txt.match(/(?:fee|cost)[\s:]*(?:usd|eur|gbp|$|€|£)?\s*(\d+)/i);
        if (feeMatch) {
          result.seatSelection.fee = `$${feeMatch[1]}`;
          result.seatSelection.free = false;
        }
      }
    }
  }
}

/**
 * Parse raw fare rules text
 */
function parseRawFareRulesTextAdvanced(text: string, result: RealFareRulesData): void {
  const lines = text.split(/\n|\r\n|\r/);
  
  lines.forEach(line => {
    const lower = line.toLowerCase().trim();
    
    // Look for refund information
    if (lower.includes('refund')) {
      if (lower.includes('non-refundable') || lower.includes('no refund')) {
        result.refund.allowed = false;
        result.refund.dataSource = 'fare-rules';
        result.refund.confidence = 85;
      } else if (lower.includes('refundable')) {
        result.refund.allowed = true;
        result.refund.dataSource = 'fare-rules';
        result.refund.confidence = 85;
      }
    }
    
    // Look for change information
    if (lower.includes('change') || lower.includes('exchange')) {
      if (lower.includes('no changes') || lower.includes('changes not permitted')) {
        result.change.allowed = false;
        result.change.dataSource = 'fare-rules';
        result.change.confidence = 85;
      } else if (lower.includes('changes allowed')) {
        result.change.allowed = true;
        result.change.dataSource = 'fare-rules';
        result.change.confidence = 85;
      }
    }
  });
}

/**
 * Enhance data based on fare category
 */
function enhanceDataFromFareCategory(result: RealFareRulesData): void {
  const category = result.fareType.category;
  
  if (category === 'BASIC') {
    // Basic fares typically have restrictions
    if (result.refund.allowed === null) {
      result.refund.allowed = false;
      result.refund.confidence = 70;
    }
    if (result.change.allowed === null) {
      result.change.allowed = false;
      result.change.confidence = 70;
    }
  } else if (category === 'FLEXIBLE') {
    // Flexible fares typically allow changes/refunds
    if (result.refund.allowed === null) {
      result.refund.allowed = true;
      result.refund.confidence = 70;
    }
    if (result.change.allowed === null) {
      result.change.allowed = true;
      result.change.confidence = 70;
    }
  }
}

/**
 * Apply airline-specific rules
 */
function applyAirlineSpecificRules(airline: string, result: RealFareRulesData): void {
  // Major airlines' known policies
  const airlineRules: Record<string, any> = {
    'AA': { // American Airlines
      carryOnWeight: '8kg',
      checkedBagFee: '$30'
    },
    'UA': { // United Airlines
      carryOnWeight: '8kg', 
      checkedBagFee: '$35'
    },
    'DL': { // Delta
      carryOnWeight: '8kg',
      checkedBagFee: '$35'
    },
    'LH': { // Lufthansa
      carryOnWeight: '8kg',
      checkedBagFee: '€25'
    },
    'AF': { // Air France
      carryOnWeight: '12kg',
      checkedBagFee: '€25'
    },
    'G3': { // Gol
      carryOnWeight: '10kg',
      checkedBagWeight: '23kg'
    },
    'AD': { // Azul
      carryOnWeight: '10kg',
      checkedBagWeight: '23kg'
    }
  };

  const rules = airlineRules[airline];
  if (rules) {
    if (rules.carryOnWeight && !result.baggage.carryOn.weight) {
      result.baggage.carryOn.weight = rules.carryOnWeight;
    }
    if (rules.checkedBagFee && !result.baggage.checked.additionalFee) {
      result.baggage.checked.additionalFee = rules.checkedBagFee;
    }
  }
}

/**
 * Format fare rules data for display
 */
export function formatFareRulesForDisplay(data: RealFareRulesData) {
  return {
    refund: {
      display: data.refund.allowed === true 
        ? (data.refund.fee || 'Refundable')
        : data.refund.allowed === false 
        ? 'Non-Refundable'
        : 'Check at booking',
      confidence: data.refund.confidence,
      source: data.refund.dataSource
    },
    change: {
      display: data.change.allowed === true 
        ? (data.change.fee || 'Changeable')
        : data.change.allowed === false 
        ? 'No Changes'
        : 'Check at booking',
      confidence: data.change.confidence,
      source: data.change.dataSource
    },
    baggage: {
      checked: {
        display: data.baggage.checked.included 
          ? `${data.baggage.checked.quantity}x${data.baggage.checked.weight || '23kg'}`
          : 'Not included',
        source: data.baggage.checked.dataSource
      },
      carryOn: {
        display: `${data.baggage.carryOn.weight} carry-on`,
        source: data.baggage.carryOn.dataSource
      }
    },
    fareType: {
      display: data.fareType.category || 'Standard',
      confidence: data.fareType.confidence,
      source: data.fareType.dataSource
    }
  };
}