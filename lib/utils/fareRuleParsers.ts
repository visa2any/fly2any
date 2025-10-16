/**
 * Fare Rule Parsers - Convert Amadeus API fare rules into user-friendly format
 *
 * Purpose: Parse complex airline fare rules into plain language that users can understand
 * Critical for DOT legal compliance - must show refund/change policies before booking
 *
 * Fare Rule Categories (from Amadeus API):
 * - VR (Voluntary Refunds): Is it refundable? What's the fee?
 * - PE (Penalties): What are the penalties for violations?
 * - VC (Voluntary Changes): Can I change my flight? What's the fee?
 * - MN (Minimum Stay): Do I need to stay minimum nights?
 * - MX (Maximum Stay): Is there a maximum stay period?
 * - REVALIDATION: Can ticket be revalidated?
 */

export interface ParsedFareRules {
  refundable: boolean;
  refundPolicy: string;
  refundFee: number | null;

  changeable: boolean;
  changePolicy: string;
  changeFee: number | null;

  cancellable: boolean;
  cancellationPolicy: string;

  restrictions: string[];
  rawRules: any[]; // Keep original data for debugging
}

/**
 * Main parser - Converts Amadeus fare rules response into structured format
 */
export function parseFareRules(apiResponse: any): ParsedFareRules {
  try {
    const fareRules = apiResponse?.data?.fareRules?.rules || [];

    // Initialize structured response with defaults
    const parsed: ParsedFareRules = {
      refundable: false,
      refundPolicy: '',
      refundFee: null,

      changeable: false,
      changePolicy: '',
      changeFee: null,

      cancellable: true, // DOT requires 24h cancellation
      cancellationPolicy: '✅ Free cancellation within 24 hours of booking (DOT requirement)',

      restrictions: [],
      rawRules: fareRules,
    };

    // Parse each fare rule category
    fareRules.forEach((rule: any) => {
      const category = rule.category?.toUpperCase();

      switch (category) {
        case 'REFUNDS':
        case 'VR': // Voluntary Refunds
          parseRefundRules(rule, parsed);
          break;

        case 'EXCHANGE':
        case 'VC': // Voluntary Changes
          parseChangeRules(rule, parsed);
          break;

        case 'PENALTIES':
        case 'PE':
          parsePenaltyRules(rule, parsed);
          break;

        case 'REVALIDATION':
          parseRevalidationRules(rule, parsed);
          break;

        case 'MINIMUM_STAY':
        case 'MN':
          parseMinimumStay(rule, parsed);
          break;

        case 'MAXIMUM_STAY':
        case 'MX':
          parseMaximumStay(rule, parsed);
          break;

        default:
          // Other categories - add to restrictions
          if (rule.rules?.[0]?.descriptions?.text) {
            parsed.restrictions.push(rule.rules[0].descriptions.text);
          }
      }
    });

    return parsed;
  } catch (error) {
    console.error('❌ Error parsing fare rules:', error);
    throw new Error('Failed to parse fare rules data');
  }
}

/**
 * Parse refund rules - Is ticket refundable? What's the fee?
 *
 * Examples:
 * - Non-refundable: "❌ No refund after 24 hours"
 * - Refundable with fee: "✅ Refundable with $150 penalty"
 * - Fully refundable: "✅ Fully refundable with no penalty"
 */
function parseRefundRules(rule: any, parsed: ParsedFareRules) {
  const ruleDetails = rule.rules?.[0];

  if (ruleDetails?.notApplicable === true) {
    parsed.refundable = false;
    parsed.refundPolicy = '❌ Non-refundable ticket (except 24-hour grace period)';
    return;
  }

  // Check for refund fee/penalty
  const penaltyAmount = parseFloat(ruleDetails?.maxPenaltyAmount || rule.maxPenaltyAmount || '0');

  if (penaltyAmount === 0) {
    parsed.refundable = true;
    parsed.refundPolicy = '✅ Fully refundable with no penalty';
    parsed.refundFee = 0;
  } else {
    parsed.refundable = true;
    parsed.refundPolicy = `✅ Refundable with $${penaltyAmount} penalty`;
    parsed.refundFee = penaltyAmount;
  }

  // Override with actual description text if available (more accurate)
  if (ruleDetails?.descriptions?.text) {
    const text = ruleDetails.descriptions.text;
    const icon = parsed.refundable ? '✅' : '❌';
    parsed.refundPolicy = `${icon} ${text}`;
  }
}

/**
 * Parse change/exchange rules - Can ticket be changed? What's the fee?
 *
 * Examples:
 * - Not changeable: "❌ Changes not permitted"
 * - Changeable with fee: "✅ Changes allowed with $200 fee (plus fare difference)"
 * - Changeable no fee: "✅ Changes allowed with no fee (fare difference may apply)"
 */
function parseChangeRules(rule: any, parsed: ParsedFareRules) {
  const ruleDetails = rule.rules?.[0];

  if (ruleDetails?.notApplicable === true) {
    parsed.changeable = false;
    parsed.changePolicy = '❌ Changes not permitted. Ticket must be cancelled and rebooked at current price.';
    return;
  }

  // Check for change fee
  const penaltyAmount = parseFloat(ruleDetails?.maxPenaltyAmount || rule.maxPenaltyAmount || '0');

  if (penaltyAmount === 0) {
    parsed.changeable = true;
    parsed.changePolicy = '✅ Changes allowed with no fee (fare difference may apply)';
    parsed.changeFee = 0;
  } else {
    parsed.changeable = true;
    parsed.changePolicy = `✅ Changes allowed with $${penaltyAmount} fee (plus fare difference)`;
    parsed.changeFee = penaltyAmount;
  }

  // Override with actual description text if available
  if (ruleDetails?.descriptions?.text) {
    const text = ruleDetails.descriptions.text;
    const icon = parsed.changeable ? '✅' : '❌';
    parsed.changePolicy = `${icon} ${text}`;
  }
}

/**
 * Parse penalty rules - General penalties for violations
 */
function parsePenaltyRules(rule: any, parsed: ParsedFareRules) {
  const ruleDetails = rule.rules?.[0];

  if (ruleDetails?.descriptions?.text) {
    parsed.restrictions.push(`⚠️ Penalty: ${ruleDetails.descriptions.text}`);
  }
}

/**
 * Parse revalidation rules - Can ticket be revalidated?
 */
function parseRevalidationRules(rule: any, parsed: ParsedFareRules) {
  const ruleDetails = rule.rules?.[0];

  if (ruleDetails?.notApplicable === true) {
    parsed.restrictions.push('❌ Ticket revalidation not permitted');
  } else if (ruleDetails?.descriptions?.text) {
    parsed.restrictions.push(`ℹ️ Revalidation: ${ruleDetails.descriptions.text}`);
  }
}

/**
 * Parse minimum stay requirements
 */
function parseMinimumStay(rule: any, parsed: ParsedFareRules) {
  const ruleDetails = rule.rules?.[0];

  if (ruleDetails?.descriptions?.text) {
    parsed.restrictions.push(`ℹ️ Minimum stay: ${ruleDetails.descriptions.text}`);
  }
}

/**
 * Parse maximum stay requirements
 */
function parseMaximumStay(rule: any, parsed: ParsedFareRules) {
  const ruleDetails = rule.rules?.[0];

  if (ruleDetails?.descriptions?.text) {
    parsed.restrictions.push(`ℹ️ Maximum stay: ${ruleDetails.descriptions.text}`);
  }
}

/**
 * Helper: Format fare rules for display in UI
 * Returns a user-friendly summary for quick scanning
 */
export function formatFareRulesSummary(rules: ParsedFareRules): string[] {
  const summary: string[] = [];

  // Refund status
  if (rules.refundable) {
    if (rules.refundFee === 0) {
      summary.push('✅ Fully refundable');
    } else {
      summary.push(`✅ Refundable (${formatCurrency(rules.refundFee)} fee)`);
    }
  } else {
    summary.push('❌ Non-refundable');
  }

  // Change status
  if (rules.changeable) {
    if (rules.changeFee === 0) {
      summary.push('✅ Changes allowed (no fee)');
    } else {
      summary.push(`✅ Changes allowed (${formatCurrency(rules.changeFee)} fee)`);
    }
  } else {
    summary.push('❌ No changes allowed');
  }

  // 24-hour cancellation (DOT requirement)
  summary.push('✅ Free cancellation within 24h');

  return summary;
}

/**
 * Helper: Check if fare is "Basic Economy" based on restrictions
 */
export function isBasicEconomyFare(rules: ParsedFareRules): boolean {
  return !rules.refundable && !rules.changeable;
}

/**
 * Helper: Calculate total cost if user needs to cancel/change
 */
export function calculateCancellationCost(
  ticketPrice: number,
  rules: ParsedFareRules,
  action: 'cancel' | 'change'
): number {
  if (action === 'cancel') {
    if (!rules.refundable) {
      return ticketPrice; // Lose entire ticket price
    }
    return rules.refundFee || 0; // Just the penalty fee
  }

  if (action === 'change') {
    if (!rules.changeable) {
      return ticketPrice; // Would need to rebuy at current price
    }
    return rules.changeFee || 0; // Just the change fee (plus fare difference)
  }

  return 0;
}

/**
 * Helper: Format currency amounts
 */
function formatCurrency(amount: number | null): string {
  if (amount === null || amount === undefined) {
    return 'N/A';
  }
  return `$${amount.toFixed(2)}`;
}

/**
 * Helper: Get user-friendly fare class name based on rules
 */
export function getFareClassName(rules: ParsedFareRules): string {
  if (isBasicEconomyFare(rules)) {
    return 'Basic Economy';
  }

  if (rules.refundable && rules.changeable && rules.refundFee === 0 && rules.changeFee === 0) {
    return 'Flexible/Premium';
  }

  if (rules.changeable || rules.refundable) {
    return 'Standard Economy';
  }

  return 'Economy';
}

/**
 * Helper: Get severity level for UI styling
 * Returns 'severe' | 'warning' | 'ok'
 */
export function getRuleSeverity(rules: ParsedFareRules): 'severe' | 'warning' | 'ok' {
  // Severe: Can't refund AND can't change
  if (!rules.refundable && !rules.changeable) {
    return 'severe';
  }

  // Warning: Can refund or change but with fees
  if ((rules.refundable && rules.refundFee! > 0) || (rules.changeable && rules.changeFee! > 0)) {
    return 'warning';
  }

  // OK: Refundable and changeable with no/low fees
  return 'ok';
}
