/**
 * Runtime Execution Orchestrator
 *
 * CRITICAL: Connects Reasoning → Stage Engine → Action Executor
 *
 * Flow:
 * 1. User Input
 * 2. Reasoning Layer (intent detection)
 * 3. Stage Engine (transition + permissions)
 * 4. Action Executor (search/booking APIs)
 *
 * GOVERNANCE: Respects stage rules, requires consent, full logging
 */

import type { ReasoningOutput, ConversationStage } from './reasoning-layer';
import type { AgentActionType } from './agent-actions';
import {
  getOrCreateStageContext,
  processStageTransition,
  isActionAllowed,
  isActionForbidden,
  grantSearchConsent,
  grantBookingConsent,
  extractDataFromMessage,
  STAGE_RULES,
  type StageContext,
  type TransitionResult,
} from './conversion/stage-engine';
import { ActionExecutor, type ExecutionResult } from './agent-action-executor';

// ============================================================================
// TYPES
// ============================================================================

export interface OrchestrationResult {
  success: boolean;
  stage: ConversationStage;
  stageTransition: TransitionResult | null;
  actionExecuted: boolean;
  actionResult: ExecutionResult | null;
  logs: ExecutionLog[];
  blockedReason?: string;
  nextAction?: 'ask_consent' | 'continue' | 'wait_input';
}

export interface ExecutionLog {
  timestamp: number;
  type: 'intent' | 'stage' | 'permission' | 'action' | 'result';
  message: string;
  data?: Record<string, unknown>;
}

export interface OrchestrationInput {
  sessionId: string;
  message: string;
  reasoning: ReasoningOutput;
  language?: string;
}

// ============================================================================
// LOGGING
// ============================================================================

class RuntimeLogger {
  private logs: ExecutionLog[] = [];

  log(type: ExecutionLog['type'], message: string, data?: Record<string, unknown>): void {
    const entry: ExecutionLog = {
      timestamp: Date.now(),
      type,
      message,
      data,
    };
    this.logs.push(entry);
    console.log(`[RUNTIME-${type.toUpperCase()}] ${message}`, data ? JSON.stringify(data) : '');
  }

  getLogs(): ExecutionLog[] {
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
  }
}

// ============================================================================
// INTENT → ACTION MAPPING
// ============================================================================

const INTENT_ACTION_MAP: Record<string, AgentActionType> = {
  flight_search: 'search-flights',
  hotel_search: 'search-hotels',
  car_search: 'search-cars',
  booking_status: 'check-availability',
  compare: 'compare-options',
  add_to_cart: 'add-to-cart',
  booking: 'book',
};

function intentToAction(intent: string): AgentActionType | null {
  // Normalize intent
  const normalized = intent.toLowerCase().replace(/[_\s]+/g, '_');
  return INTENT_ACTION_MAP[normalized] || null;
}

// ============================================================================
// CONSENT DETECTION
// ============================================================================

const SEARCH_CONSENT_PATTERNS = /\b(yes|sim|sí|ok|sure|pode|buscar|search|find|go ahead|pode buscar|claro|vamos|search now|busque|procure)\b/i;
const BOOKING_CONSENT_PATTERNS = /\b(book|reservar|confirmar|proceed|continue|finalizar|i want to book|quero reservar|confirme|reserve)\b/i;

function detectConsent(message: string): { search: boolean; booking: boolean } {
  return {
    search: SEARCH_CONSENT_PATTERNS.test(message),
    booking: BOOKING_CONSENT_PATTERNS.test(message),
  };
}

// ============================================================================
// MAIN ORCHESTRATOR
// ============================================================================

/**
 * Orchestrate execution from reasoning to action
 *
 * CRITICAL FLOW:
 * 1. Log intent detected
 * 2. Update stage context with collected data
 * 3. Check/grant consent
 * 4. Attempt stage transition
 * 5. Check action permissions
 * 6. Execute action if allowed
 * 7. Log all steps
 */
export async function orchestrateExecution(
  input: OrchestrationInput
): Promise<OrchestrationResult> {
  const logger = new RuntimeLogger();
  const { sessionId, message, reasoning } = input;

  // Step 1: Log intent detection
  logger.log('intent', `Detected: ${reasoning.interpreted_intent}`, {
    chaos: reasoning.chaos_classification,
    confidence: reasoning.confidence_level,
    stage: reasoning.conversation_stage,
  });

  // Step 2: Get/create stage context
  const context = getOrCreateStageContext(sessionId);
  logger.log('stage', `Current stage: ${context.currentStage}`, {
    collectedData: context.collectedData,
    consents: context.userConsents,
  });

  // Step 3: Extract data from message
  const updatedData = extractDataFromMessage(message, context.collectedData);
  context.collectedData = updatedData;
  logger.log('stage', 'Data extracted', { collectedData: updatedData });

  // Step 4: Detect and grant consent
  const consents = detectConsent(message);
  if (consents.search && !context.userConsents.searchPermission) {
    grantSearchConsent(sessionId);
    logger.log('permission', 'Search consent GRANTED');
  }
  if (consents.booking && !context.userConsents.bookingPermission) {
    grantBookingConsent(sessionId);
    logger.log('permission', 'Booking consent GRANTED');
  }

  // Refresh context after consent updates
  const updatedContext = getOrCreateStageContext(sessionId);

  // Step 5: Attempt stage transition
  const transitionResult = processStageTransition(sessionId, message);
  logger.log('stage', `Transition result: ${transitionResult.reason}`, {
    allowed: transitionResult.allowed,
    newStage: transitionResult.newStage,
    consentRequired: transitionResult.consentRequired,
  });

  // Step 6: Check if consent is required but not granted
  if (transitionResult.consentRequired) {
    logger.log('permission', `Consent required: ${transitionResult.consentRequired}`);
    return {
      success: true,
      stage: transitionResult.newStage,
      stageTransition: transitionResult,
      actionExecuted: false,
      actionResult: null,
      logs: logger.getLogs(),
      nextAction: 'ask_consent',
    };
  }

  // Step 7: Determine action from intent
  const actionType = intentToAction(reasoning.interpreted_intent);
  if (!actionType) {
    logger.log('action', `No action mapped for intent: ${reasoning.interpreted_intent}`);
    return {
      success: true,
      stage: transitionResult.newStage,
      stageTransition: transitionResult,
      actionExecuted: false,
      actionResult: null,
      logs: logger.getLogs(),
      nextAction: 'continue',
    };
  }

  // Step 8: Check action permissions
  const actionAllowed = isActionAllowed(sessionId, mapActionToStageAction(actionType));
  const actionForbidden = isActionForbidden(sessionId, mapActionToStageAction(actionType));

  logger.log('permission', `Action "${actionType}" allowed: ${actionAllowed}, forbidden: ${actionForbidden}`, {
    currentStage: updatedContext.currentStage,
    stageRules: STAGE_RULES[updatedContext.currentStage],
  });

  if (actionForbidden) {
    logger.log('action', `Action BLOCKED: ${actionType} is forbidden in ${updatedContext.currentStage}`);
    return {
      success: true,
      stage: updatedContext.currentStage,
      stageTransition: transitionResult,
      actionExecuted: false,
      actionResult: null,
      logs: logger.getLogs(),
      blockedReason: `Action "${actionType}" not allowed in ${updatedContext.currentStage} stage`,
      nextAction: 'continue',
    };
  }

  if (!actionAllowed) {
    // Check if we need consent first
    const rules = STAGE_RULES[updatedContext.currentStage];
    if (rules.requiresConsent.includes('search') && !updatedContext.userConsents.searchPermission) {
      logger.log('permission', 'Search action pending consent');
      return {
        success: true,
        stage: updatedContext.currentStage,
        stageTransition: transitionResult,
        actionExecuted: false,
        actionResult: null,
        logs: logger.getLogs(),
        nextAction: 'ask_consent',
      };
    }
  }

  // Step 9: Execute action (if in READY_TO_SEARCH with consent)
  if (actionType === 'search-flights' || actionType === 'search-hotels') {
    if (updatedContext.currentStage === 'READY_TO_SEARCH' && updatedContext.userConsents.searchPermission) {
      logger.log('action', `EXECUTING: ${actionType}`);

      const executor = new ActionExecutor({ baseUrl: '' });
      let result: ExecutionResult;

      if (actionType === 'search-flights') {
        result = await executor.searchFlights({
          origin: updatedContext.collectedData.origin,
          destination: updatedContext.collectedData.destination,
          date: updatedContext.collectedData.dates,
          passengers: updatedContext.collectedData.passengers,
          cabinClass: updatedContext.collectedData.cabinClass,
        });
      } else {
        result = await executor.searchHotels({
          location: updatedContext.collectedData.destination,
          checkIn: updatedContext.collectedData.dateRange?.start,
          checkOut: updatedContext.collectedData.dateRange?.end,
        });
      }

      logger.log('result', `Action result: ${result.success ? 'SUCCESS' : 'FAILED'}`, {
        data: result.data,
        error: result.error,
      });

      return {
        success: true,
        stage: updatedContext.currentStage,
        stageTransition: transitionResult,
        actionExecuted: true,
        actionResult: result,
        logs: logger.getLogs(),
        nextAction: 'continue',
      };
    }

    // Not ready - need transition or consent
    logger.log('action', `Cannot execute ${actionType}: stage=${updatedContext.currentStage}, consent=${updatedContext.userConsents.searchPermission}`);
  }

  return {
    success: true,
    stage: updatedContext.currentStage,
    stageTransition: transitionResult,
    actionExecuted: false,
    actionResult: null,
    logs: logger.getLogs(),
    nextAction: 'continue',
  };
}

/**
 * Map executor action type to stage action name
 */
function mapActionToStageAction(actionType: AgentActionType): string {
  const mapping: Record<string, string> = {
    'search-flights': 'execute_search',
    'search-hotels': 'execute_search',
    'search-cars': 'execute_search',
    'book': 'process_booking',
    'add-to-cart': 'add_to_cart',
    'compare-options': 'compare',
  };
  return mapping[actionType] || actionType;
}

/**
 * Check if search can be executed immediately
 */
export function canExecuteSearchNow(sessionId: string): {
  canExecute: boolean;
  reason: string;
  missingData: string[];
  needsConsent: boolean;
} {
  const context = getOrCreateStageContext(sessionId);
  const missingData: string[] = [];

  if (!context.collectedData.destination && !context.collectedData.origin) {
    missingData.push('origin or destination');
  }
  if (!context.collectedData.dates) {
    missingData.push('travel dates');
  }

  const hasEnoughData = missingData.length === 0;
  const hasConsent = context.userConsents.searchPermission;
  const isRightStage = context.currentStage === 'READY_TO_SEARCH';

  if (!hasEnoughData) {
    return {
      canExecute: false,
      reason: `Missing required data: ${missingData.join(', ')}`,
      missingData,
      needsConsent: false,
    };
  }

  if (!hasConsent) {
    return {
      canExecute: false,
      reason: 'User consent required for search',
      missingData: [],
      needsConsent: true,
    };
  }

  if (!isRightStage) {
    return {
      canExecute: false,
      reason: `Not in READY_TO_SEARCH stage (current: ${context.currentStage})`,
      missingData: [],
      needsConsent: false,
    };
  }

  return {
    canExecute: true,
    reason: 'All conditions met for search execution',
    missingData: [],
    needsConsent: false,
  };
}

/**
 * Force execute search (bypasses stage check, but still needs data + consent)
 */
export async function forceExecuteSearch(
  sessionId: string,
  params: {
    origin?: string;
    destination?: string;
    date?: string;
    passengers?: number;
  }
): Promise<OrchestrationResult> {
  const logger = new RuntimeLogger();
  const context = getOrCreateStageContext(sessionId);

  // Merge params with collected data
  const searchParams = {
    origin: params.origin || context.collectedData.origin,
    destination: params.destination || context.collectedData.destination,
    date: params.date || context.collectedData.dates,
    passengers: params.passengers || context.collectedData.passengers,
  };

  // Validate minimum data
  if (!searchParams.destination && !searchParams.origin) {
    logger.log('action', 'BLOCKED: No origin or destination');
    return {
      success: false,
      stage: context.currentStage,
      stageTransition: null,
      actionExecuted: false,
      actionResult: null,
      logs: logger.getLogs(),
      blockedReason: 'Origin or destination required',
      nextAction: 'wait_input',
    };
  }

  // Check consent
  if (!context.userConsents.searchPermission) {
    logger.log('permission', 'BLOCKED: No search consent');
    return {
      success: false,
      stage: context.currentStage,
      stageTransition: null,
      actionExecuted: false,
      actionResult: null,
      logs: logger.getLogs(),
      blockedReason: 'Search consent required',
      nextAction: 'ask_consent',
    };
  }

  // Execute
  logger.log('action', 'FORCE EXECUTING search-flights', searchParams);
  const executor = new ActionExecutor({ baseUrl: '' });
  const result = await executor.searchFlights(searchParams);

  logger.log('result', `Result: ${result.success ? 'SUCCESS' : 'FAILED'}`, {
    count: result.data?.count,
    error: result.error,
  });

  return {
    success: result.success,
    stage: context.currentStage,
    stageTransition: null,
    actionExecuted: true,
    actionResult: result,
    logs: logger.getLogs(),
    nextAction: 'continue',
  };
}
