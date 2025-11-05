/**
 * AI Agent Permission System
 *
 * Manages what actions require user permission and generates permission requests.
 * Safe actions (searching, comparing) = auto-execute
 * Financial actions (booking, charging) = require explicit permission
 */

import { AgentAction, AgentActionType } from './agent-actions';

export type PermissionImpact = 'low' | 'medium' | 'high' | 'critical';

export interface PermissionRequest {
  action: AgentActionType;
  description: string;
  impact: PermissionImpact;
  cost?: number;
  currency?: string;
  reversible: boolean;
  requiresPayment: boolean;
  warnings?: string[];
  alternatives?: string[];
}

/**
 * Actions that don't need permission (safe to auto-execute)
 */
export const AUTO_EXECUTE_ACTIONS: AgentActionType[] = [
  'search-flights',
  'search-hotels',
  'search-cars',
  'search-packages',
  'check-availability',
  'compare-options',
  'add-to-cart',
  'remove-from-cart',
  'calculate-total',
  'verify-requirements',
  'check-visa',
  'check-baggage',
  'check-seat-availability',
  'create-itinerary',
  'create-comparison',
  'find-alternatives',
  'check-price-drop',
];

/**
 * Actions that require explicit permission
 */
export const PERMISSION_REQUIRED_ACTIONS: AgentActionType[] = [
  'book',
  'modify-booking',
  'cancel-booking',
  'verify-payment',
  'apply-discount', // If it involves payment verification
];

/**
 * Check if action requires explicit permission
 */
export function needsPermission(action: AgentAction): PermissionRequest | null {
  // Auto-execute actions don't need permission
  if (AUTO_EXECUTE_ACTIONS.includes(action.type)) {
    return null;
  }

  // Generate permission request for actions that need it
  switch (action.type) {
    case 'book':
      return {
        action: action.type,
        description: generateBookingDescription(action),
        impact: calculateImpact(action),
        cost: extractCost(action),
        currency: extractCurrency(action) || 'USD',
        reversible: false,
        requiresPayment: true,
        warnings: getBookingWarnings(action),
        alternatives: getBookingAlternatives(action),
      };

    case 'modify-booking':
      return {
        action: action.type,
        description: generateModifyDescription(action),
        impact: 'medium',
        cost: extractModificationCost(action),
        currency: extractCurrency(action) || 'USD',
        reversible: true,
        requiresPayment: extractModificationCost(action) > 0,
        warnings: getModificationWarnings(action),
      };

    case 'cancel-booking':
      return {
        action: action.type,
        description: generateCancelDescription(action),
        impact: 'high',
        cost: extractCancellationCost(action),
        currency: extractCurrency(action) || 'USD',
        reversible: false,
        requiresPayment: false,
        warnings: getCancellationWarnings(action),
      };

    case 'verify-payment':
      return {
        action: action.type,
        description: 'Verify payment information',
        impact: 'medium',
        reversible: true,
        requiresPayment: false,
      };

    case 'apply-discount':
      // Only needs permission if it requires payment verification
      if (action.params?.requiresVerification) {
        return {
          action: action.type,
          description: 'Apply discount code to booking',
          impact: 'low',
          reversible: true,
          requiresPayment: false,
        };
      }
      return null;

    default:
      // Unknown action - be safe and require permission
      return {
        action: action.type,
        description: `Perform action: ${action.description}`,
        impact: 'medium',
        reversible: false,
        requiresPayment: false,
      };
  }
}

/**
 * Generate permission request message for each consultant
 */
export function generatePermissionRequest(
  request: PermissionRequest,
  consultantId: string
): string {
  const costText = request.cost ? `$${request.cost.toFixed(2)}` : '';

  switch (consultantId) {
    case 'lisa-service':
      return generateLisaPermissionRequest(request, costText);
    case 'sarah-flight':
      return generateSarahPermissionRequest(request, costText);
    case 'marcus-budget':
      return generateMarcusPermissionRequest(request, costText);
    case 'emma-luxury':
      return generateEmmaPermissionRequest(request, costText);
    case 'alex-adventure':
      return generateAlexPermissionRequest(request, costText);
    default:
      return generateDefaultPermissionRequest(request, costText);
  }
}

/**
 * Lisa's permission requests (warm, caring)
 */
function generateLisaPermissionRequest(request: PermissionRequest, costText: string): string {
  switch (request.action) {
    case 'book':
      return `Hon, before I proceed with booking this trip for ${costText}, I need your confirmation. Everything looks perfect! Shall I go ahead and complete the reservation for you? 💳`;
    case 'modify-booking':
      if (request.cost && request.cost > 0) {
        return `Sweetie, modifying your booking will cost an additional ${costText}. Would you like me to proceed with the changes? 💕`;
      }
      return `Dear, I can modify your booking for you. Shall I make those changes? ✨`;
    case 'cancel-booking':
      if (request.cost && request.cost > 0) {
        return `Oh hon, I need to let you know that cancelling will cost ${costText}. Are you sure you'd like me to proceed with the cancellation? 💔`;
      }
      return `Sweetie, just to confirm - would you like me to cancel this booking? I want to make sure this is what you want. 💕`;
    default:
      return `Dear, I need your permission to ${request.description.toLowerCase()}. May I proceed? ✨`;
  }
}

/**
 * Sarah's permission requests (professional, clear)
 */
function generateSarahPermissionRequest(request: PermissionRequest, costText: string): string {
  switch (request.action) {
    case 'book':
      return `Ready to book this flight for ${costText}? Just confirm and I'll complete the reservation.`;
    case 'modify-booking':
      if (request.cost && request.cost > 0) {
        return `Modification will cost ${costText}. Confirm to proceed with changes?`;
      }
      return `Confirm to proceed with booking modification?`;
    case 'cancel-booking':
      if (request.cost && request.cost > 0) {
        return `Cancellation fee: ${costText}. Confirm to proceed with cancellation?`;
      }
      return `Confirm booking cancellation?`;
    default:
      return `Permission required: ${request.description}. Confirm to proceed?`;
  }
}

/**
 * Marcus's permission requests (casual, money-focused)
 */
function generateMarcusPermissionRequest(request: PermissionRequest, costText: string): string {
  switch (request.action) {
    case 'book':
      return `Alright amigo! Ready to lock in this deal at ${costText}? Just say the word and I'll book it! 💰`;
    case 'modify-booking':
      if (request.cost && request.cost > 0) {
        return `Heads up, friend - changing this will cost ${costText} extra. Still want me to do it? 💸`;
      }
      return `Want me to make those changes to your booking, amigo?`;
    case 'cancel-booking':
      if (request.cost && request.cost > 0) {
        return `Whoa, cancelling will cost you ${costText}. You sure about this, friend? 💰`;
      }
      return `You want me to cancel this? Just checking, amigo!`;
    default:
      return `Need your OK to ${request.description.toLowerCase()}, friend. Good to go? 👍`;
  }
}

/**
 * Emma's permission requests (sophisticated, refined)
 */
function generateEmmaPermissionRequest(request: PermissionRequest, costText: string): string {
  switch (request.action) {
    case 'book':
      return `I'm ready to finalize your reservation for ${costText}. May I proceed with securing this luxury experience?`;
    case 'modify-booking':
      if (request.cost && request.cost > 0) {
        return `The modification will incur a fee of ${costText}. Shall I proceed with the amendments?`;
      }
      return `May I proceed with modifying your reservation?`;
    case 'cancel-booking':
      if (request.cost && request.cost > 0) {
        return `Please note there is a cancellation fee of ${costText}. Shall I proceed with the cancellation?`;
      }
      return `Shall I proceed with cancelling your reservation?`;
    default:
      return `Your authorization is required to ${request.description.toLowerCase()}. May I proceed?`;
  }
}

/**
 * Alex's permission requests (exciting, adventure-focused)
 */
function generateAlexPermissionRequest(request: PermissionRequest, costText: string): string {
  switch (request.action) {
    case 'book':
      return `Your adventure awaits! Ready to lock in this trip for ${costText}? Let's make it official! 🎉`;
    case 'modify-booking':
      if (request.cost && request.cost > 0) {
        return `Changing your adventure will cost ${costText}. Want me to make the switch? 🗺️`;
      }
      return `Want to adjust your adventure plans? Say the word! 🌍`;
    case 'cancel-booking':
      if (request.cost && request.cost > 0) {
        return `Hold up! Cancelling costs ${costText}. You sure you want to call off the adventure? 😢`;
      }
      return `Cancel the adventure? Just making sure! 🎒`;
    default:
      return `Need your go-ahead to ${request.description.toLowerCase()}. Ready? 🚀`;
  }
}

/**
 * Default permission request
 */
function generateDefaultPermissionRequest(request: PermissionRequest, costText: string): string {
  if (costText) {
    return `This action will cost ${costText}. Do you want to proceed?`;
  }
  return `Permission required: ${request.description}. Proceed?`;
}

/**
 * Calculate impact level based on cost and action type
 */
function calculateImpact(action: AgentAction): PermissionImpact {
  const cost = extractCost(action);

  if (action.type === 'cancel-booking') return 'high';
  if (action.type === 'book') {
    if (cost > 2000) return 'critical';
    if (cost > 1000) return 'high';
    if (cost > 500) return 'medium';
    return 'low';
  }
  if (action.type === 'modify-booking') return 'medium';

  return 'low';
}

/**
 * Extract cost from action parameters
 */
function extractCost(action: AgentAction): number {
  return action.params?.price?.total ||
         action.params?.cost ||
         action.params?.total ||
         action.result?.total ||
         0;
}

/**
 * Extract currency from action parameters
 */
function extractCurrency(action: AgentAction): string | undefined {
  return action.params?.price?.currency ||
         action.params?.currency ||
         action.result?.currency ||
         'USD';
}

/**
 * Extract modification cost
 */
function extractModificationCost(action: AgentAction): number {
  return action.params?.modificationFee ||
         action.params?.fee ||
         0;
}

/**
 * Extract cancellation cost
 */
function extractCancellationCost(action: AgentAction): number {
  return action.params?.cancellationFee ||
         action.params?.penaltyFee ||
         action.params?.fee ||
         0;
}

/**
 * Generate booking description
 */
function generateBookingDescription(action: AgentAction): string {
  const type = action.params?.type || 'trip';
  const cost = extractCost(action);
  return `Book ${type} for $${cost.toFixed(2)}`;
}

/**
 * Generate modify description
 */
function generateModifyDescription(action: AgentAction): string {
  const bookingId = action.params?.bookingId || 'booking';
  return `Modify ${bookingId}`;
}

/**
 * Generate cancel description
 */
function generateCancelDescription(action: AgentAction): string {
  const bookingId = action.params?.bookingId || 'booking';
  return `Cancel ${bookingId}`;
}

/**
 * Get booking warnings
 */
function getBookingWarnings(action: AgentAction): string[] {
  const warnings: string[] = [];

  if (!action.params?.insurance) {
    warnings.push('Travel insurance not selected');
  }

  if (action.params?.nonRefundable) {
    warnings.push('This booking is non-refundable');
  }

  const cost = extractCost(action);
  if (cost > 1500) {
    warnings.push('High-value booking');
  }

  return warnings;
}

/**
 * Get modification warnings
 */
function getModificationWarnings(action: AgentAction): string[] {
  const warnings: string[] = [];

  const fee = extractModificationCost(action);
  if (fee > 0) {
    warnings.push(`Modification fee applies: $${fee}`);
  }

  if (action.params?.fareRulesChanged) {
    warnings.push('Fare rules may have changed');
  }

  return warnings;
}

/**
 * Get cancellation warnings
 */
function getCancellationWarnings(action: AgentAction): string[] {
  const warnings: string[] = [];

  const fee = extractCancellationCost(action);
  if (fee > 0) {
    warnings.push(`Cancellation fee: $${fee}`);
  }

  if (action.params?.nonRefundable) {
    warnings.push('Non-refundable booking - no refund available');
  }

  if (action.params?.refundAmount) {
    warnings.push(`Refund amount: $${action.params.refundAmount}`);
  }

  return warnings;
}

/**
 * Get booking alternatives
 */
function getBookingAlternatives(action: AgentAction): string[] {
  const alternatives: string[] = [];

  alternatives.push('Hold this price for 24 hours');
  alternatives.push('Search for alternative options');
  alternatives.push('Check price alerts');

  return alternatives;
}

/**
 * Check if user has permission level for action
 */
export function hasPermissionLevel(
  userPermissionLevel: string,
  requiredImpact: PermissionImpact
): boolean {
  const levels = ['low', 'medium', 'high', 'critical'];
  const userLevelIndex = levels.indexOf(userPermissionLevel);
  const requiredLevelIndex = levels.indexOf(requiredImpact);

  return userLevelIndex >= requiredLevelIndex;
}

/**
 * Create permission response
 */
export interface PermissionResponse {
  granted: boolean;
  reason?: string;
  timestamp: Date;
}

export function createPermissionResponse(granted: boolean, reason?: string): PermissionResponse {
  return {
    granted,
    reason,
    timestamp: new Date(),
  };
}

/**
 * Validate permission request
 */
export function validatePermissionRequest(request: PermissionRequest): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!request.action) {
    errors.push('Action type is required');
  }

  if (!request.description) {
    errors.push('Action description is required');
  }

  if (request.requiresPayment && !request.cost) {
    errors.push('Cost is required for payment actions');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
