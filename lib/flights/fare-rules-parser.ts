/**
 * Fare Rules Parser
 *
 * Parses Amadeus Flight Offers Price API response with detailed-fare-rules
 * into a user-friendly format for display in the UI.
 *
 * API Response Structure:
 * {
 *   data: {
 *     fareRules: {
 *       rules: [
 *         {
 *           category: "REFUNDS" | "EXCHANGE" | "REVALIDATION",
 *           maxPenaltyAmount: "0.00" | "150.00" | null,
 *           rules: [{
 *             notApplicable: boolean,
 *             maxPenaltyAmount: string,
 *             descriptions: { descriptionType: string, text: string }
 *           }]
 *         }
 *       ]
 *     }
 *   }
 * }
 */

export interface ParsedFareRules {
  // Refund policy
  refundable: boolean;
  refundFee: number | null; // null means not applicable or unknown
  refundText: string;

  // Change/Exchange policy
  changeable: boolean;
  changeFee: number | null; // null means not applicable or unknown
  changeText: string;

  // Seat selection (may not be in fare rules API, using estimate)
  seatSelectionIncluded: boolean;
  seatSelectionFee: number | null;

  // 24-hour rule (US DOT regulation - always true for US flights)
  twentyFourHourRule: boolean;

  // Raw data for debugging
  hasRealData: boolean;
}

/**
 * Parse Amadeus fare rules response into structured format
 */
export function parseFareRules(fareRulesResponse: any): ParsedFareRules {
  const rules = fareRulesResponse?.data?.fareRules?.rules || [];

  // Check if we have any real rules data
  const hasRealData = rules.length > 0;

  // Find REFUNDS category
  const refundRule = rules.find((r: any) => r.category === 'REFUNDS');
  const refundable = refundRule?.rules?.[0]
    ? !refundRule.rules[0].notApplicable
    : false;

  const refundFee = refundRule?.maxPenaltyAmount
    ? parseFloat(refundRule.maxPenaltyAmount)
    : null;

  const refundText = refundRule?.rules?.[0]?.descriptions?.text || '';

  // Find EXCHANGE category
  const exchangeRule = rules.find((r: any) => r.category === 'EXCHANGE');
  const changeable = exchangeRule?.rules?.[0]
    ? !exchangeRule.rules[0].notApplicable
    : false;

  const changeFee = exchangeRule?.maxPenaltyAmount
    ? parseFloat(exchangeRule.maxPenaltyAmount)
    : null;

  const changeText = exchangeRule?.rules?.[0]?.descriptions?.text || '';

  return {
    refundable,
    refundFee,
    refundText,
    changeable,
    changeFee,
    changeText,
    // Seat selection not typically in fare rules API, will use cabin class heuristic
    seatSelectionIncluded: false,
    seatSelectionFee: null,
    // US DOT regulation - always true for US flights
    twentyFourHourRule: true,
    hasRealData,
  };
}

/**
 * Determine if seat selection is included based on cabin class and fare type
 * This is a heuristic since seat selection is not typically in fare rules API
 */
export function estimateSeatSelection(
  cabinClass: string,
  fareType: string
): { included: boolean; fee: number | null } {
  const cabin = cabinClass?.toUpperCase() || '';
  const fare = fareType?.toUpperCase() || '';

  // Business/First class typically includes seat selection
  if (cabin.includes('BUSINESS') || cabin.includes('FIRST')) {
    return { included: true, fee: null };
  }

  // Premium Economy often includes seat selection
  if (cabin.includes('PREMIUM')) {
    return { included: true, fee: null };
  }

  // FLEX/PLUS fares often include seat selection
  if (fare.includes('FLEX') || fare.includes('PLUS')) {
    return { included: true, fee: null };
  }

  // Basic Economy typically charges for seat selection
  if (fare.includes('BASIC') || fare.includes('LIGHT')) {
    return { included: false, fee: 30 };
  }

  // Standard Economy - varies, typically $15-45
  return { included: false, fee: null };
}

/**
 * Format fare rules for display
 */
export function formatFareRules(
  parsedRules: ParsedFareRules,
  cabinClass: string,
  fareType: string
): {
  refundBadge: { text: string; color: 'green' | 'red' };
  changeBadge: { text: string; color: 'green' | 'blue' | 'orange' };
  seatBadge: { text: string; color: 'green' | 'blue' };
  dataSource: 'airline' | 'estimate';
} {
  const seatInfo = estimateSeatSelection(cabinClass, fareType);
  const dataSource = parsedRules.hasRealData ? 'airline' : 'estimate';

  // Refund badge
  let refundBadge;
  if (parsedRules.refundable) {
    const feeText =
      parsedRules.refundFee !== null && parsedRules.refundFee > 0
        ? ` ($${parsedRules.refundFee} fee)`
        : '';
    refundBadge = {
      text: `✅ Refundable${feeText}`,
      color: 'green' as const,
    };
  } else {
    refundBadge = {
      text: parsedRules.hasRealData
        ? '❌ Non-refundable'
        : '❌ Typically non-refundable',
      color: 'red' as const,
    };
  }

  // Change badge
  let changeBadge;
  if (parsedRules.changeable) {
    const feeText =
      parsedRules.changeFee !== null
        ? ` $${parsedRules.changeFee}`
        : ' allowed';
    changeBadge = {
      text: `✅ Changes${feeText}`,
      color: 'green' as const,
    };
  } else {
    changeBadge = {
      text: parsedRules.hasRealData
        ? '❌ No changes'
        : '⚠️ Changes ~$75-200',
      color: parsedRules.hasRealData ? ('orange' as const) : ('orange' as const),
    };
  }

  // Seat badge
  let seatBadge;
  if (seatInfo.included) {
    seatBadge = {
      text: '✅ Seat selection included',
      color: 'green' as const,
    };
  } else if (seatInfo.fee !== null) {
    seatBadge = {
      text: `💺 Seat selection ~$${seatInfo.fee}`,
      color: 'blue' as const,
    };
  } else {
    seatBadge = {
      text: '💺 Seats ~$15-45',
      color: 'blue' as const,
    };
  }

  return {
    refundBadge,
    changeBadge,
    seatBadge,
    dataSource,
  };
}
