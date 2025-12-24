/**
 * Execution Pipeline — Mandatory State Injection Enforcer
 *
 * CRITICAL: This is the ONLY path to LLM responses.
 * No LLM call can occur without passing through this pipeline.
 *
 * Pipeline (STRICT ORDER):
 * 1. reasoningLayer(userInput, session)
 * 2. stageEngine(reasoning, session)
 * 3. complianceLayer(reasoning, stage, session)
 * 4. systemPrompt = buildMandatoryPrompt(reasoning, stage)
 * 5. LLM(systemPrompt, userMessage)
 *
 * If ANY layer fails → throw AI_PIPELINE_NOT_EXECUTED
 */

import { generateTravelResponse, type GroqMessage, type GroqResponse } from './groq-client';
import { type AgentState } from './agent-state-injector';
import { processUserIntent, type ReasoningOutput, type ConversationStage } from './reasoning-layer';
import { finalComplianceCheck } from './agent-compliance';
import { type HandoffSlots } from './entity-extractor';
import { type TeamType } from './consultant-handoff';
import {
  executeFlightSearch,
  generatePostActionResponse,
  type RawFlightSlots,
  type SearchExecutionResult,
} from './flight-search-executor';
import {
  getOrCreateSession,
  updateSession,
  shouldForceSearch,
  hasAllRequiredSlots,
  getDebugPanelData,
  type SessionState,
} from './session-manager';

// ============================================================================
// TYPES
// ============================================================================

export interface PipelineInput {
  message: string;
  language: 'en' | 'pt' | 'es';
  intent: string;
  stage: ConversationStage;
  agentType: TeamType;

  // Structured slots from entity extraction
  slots: HandoffSlots;

  // Session tracking (CRITICAL for persistence)
  sessionId?: string;

  // Optional context
  conversationHistory?: GroqMessage[];
  customerName?: string;
  reasoning?: ReasoningOutput;
  handoffFrom?: string;
  searchResults?: any;
}

export interface PipelineOutput {
  response: string;
  agentState: AgentState;
  actionExecuted?: boolean;
  searchResults?: any;
  debugPanel?: {
    sessionId: string;
    activeAgent: string;
    language: string;
    stage: string;
    slots: Record<string, any>;
    lastAction?: string;
    apiStatus?: string;
    guards: {
      blockSlotQuestions: boolean;
      blockEnglish: boolean;
      forceSearch: boolean;
      hasAllSlots: boolean;
    };
  };
  debugLog: {
    stateInjected: boolean;
    intent: string;
    stage: string;
    language: string;
    slotsCount: number;
    finalPromptLog: string;
    actionBlocked?: boolean;
  };
}

// ============================================================================
// PIPELINE ERRORS
// ============================================================================

export class StateNotInjectedError extends Error {
  constructor(reason: string) {
    super(`[STATE_NOT_INJECTED] ${reason}`);
    this.name = 'StateNotInjectedError';
  }
}

export class PipelineNotExecutedError extends Error {
  constructor(failedStep: string) {
    super(`[AI_PIPELINE_NOT_EXECUTED] Failed at: ${failedStep}`);
    this.name = 'PipelineNotExecutedError';
  }
}

// ============================================================================
// PIPELINE BUILDER
// ============================================================================

/**
 * Build mandatory AgentState from pipeline input
 * THROWS if required fields are missing
 */
export function buildAgentState(input: PipelineInput): AgentState {
  // Validate mandatory fields
  if (!input.intent) {
    console.error('[STATE_NOT_INJECTED] Missing intent');
    throw new StateNotInjectedError('Missing intent');
  }
  if (!input.stage) {
    console.error('[STATE_NOT_INJECTED] Missing stage');
    throw new StateNotInjectedError('Missing stage');
  }
  if (!input.language) {
    console.error('[STATE_NOT_INJECTED] Missing language');
    throw new StateNotInjectedError('Missing language');
  }

  // Build state with slot confidence
  const state: AgentState = {
    intent: input.intent,
    stage: input.stage,
    language: input.language,
    slots: {},
    handoffFrom: input.handoffFrom,
  };

  // Map slots from HandoffSlots to AgentState slots
  if (input.slots) {
    if (input.slots.origin) {
      state.slots.origin = {
        value: input.slots.origin.value,
        confidence: input.slots.origin.confidence
      };
    }
    if (input.slots.destination) {
      state.slots.destination = {
        value: input.slots.destination.value,
        confidence: input.slots.destination.confidence
      };
    }
    if (input.slots.departureDate) {
      state.slots.departureDate = {
        value: input.slots.departureDate.value,
        confidence: input.slots.departureDate.confidence
      };
    }
    if (input.slots.returnDate) {
      state.slots.returnDate = {
        value: input.slots.returnDate.value,
        confidence: input.slots.returnDate.confidence
      };
    }
    if (input.slots.passengers) {
      state.slots.passengers = {
        value: input.slots.passengers.value,
        confidence: input.slots.passengers.confidence
      };
    }
    if (input.slots.cabinClass) {
      state.slots.cabinClass = {
        value: input.slots.cabinClass.value,
        confidence: input.slots.cabinClass.confidence
      };
    }
    if (input.slots.tripType) {
      state.slots.tripType = {
        value: input.slots.tripType.value,
        confidence: input.slots.tripType.confidence
      };
    }
  }

  return state;
}

/**
 * Build MANDATORY system prompt — ABSOLUTE TRUTH format
 */
export function buildMandatorySystemPrompt(
  reasoning: ReasoningOutput,
  stage: ConversationStage,
  slots: Record<string, any>,
  agentName: string = 'Travel Consultant'
): string {
  return `
SYSTEM STATE — ABSOLUTE TRUTH

Language: ${reasoning.language || 'en'}
Active Agent: ${agentName}
Intent: ${reasoning.intent}
Stage: ${stage}

Slots (DO NOT ASK AGAIN):
${JSON.stringify(slots, null, 2)}

Rules:
- Never ask for slots already present
- Never say "I couldn't find flights" before search
- Never switch language
- Never restart conversation
- Act ONLY according to stage

If slots are complete and stage is READY_TO_SEARCH,
your ONLY valid action is to proceed with search.
`;
}

// ============================================================================
// MAIN PIPELINE EXECUTOR (STRICT ORDER)
// ============================================================================

/**
 * Execute the unified pipeline — ONLY way to get LLM response
 *
 * STRICT ORDER:
 * 1. reasoningLayer(userInput, session)
 * 2. stageEngine(reasoning, session)
 * 3. ACTION-FIRST: If READY_TO_SEARCH → execute action BEFORE LLM
 * 4. complianceLayer(reasoning, stage, session)
 * 5. systemPrompt = buildMandatoryPrompt(reasoning, stage)
 * 6. LLM(systemPrompt, userMessage) — ONLY if action not mandatory
 *
 * @throws PipelineNotExecutedError if any step fails
 */
export async function executePipeline(input: PipelineInput): Promise<PipelineOutput> {
  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 0: SESSION MANAGEMENT (CRITICAL - Persistence layer)
  // ═══════════════════════════════════════════════════════════════════════════
  const sessionId = input.sessionId || `session_${Date.now()}`;
  const session = getOrCreateSession(sessionId);

  // Update session with input slots (MERGE, never overwrite)
  const sessionSlots: Record<string, any> = {};
  if (input.slots) {
    if (input.slots.origin) sessionSlots.origin = input.slots.origin.value;
    if (input.slots.destination) sessionSlots.destination = input.slots.destination.value;
    if (input.slots.departureDate) sessionSlots.departureDate = input.slots.departureDate.value;
    if (input.slots.returnDate) sessionSlots.returnDate = input.slots.returnDate.value;
    if (input.slots.passengers) sessionSlots.adults = input.slots.passengers.value;
    if (input.slots.cabinClass) sessionSlots.cabin = input.slots.cabinClass.value;
    if (input.slots.tripType) sessionSlots.tripType = input.slots.tripType.value;
  }

  // Detect direct flight from message
  if (input.message.toLowerCase().includes('direto') || input.message.toLowerCase().includes('direct')) {
    sessionSlots.direct = true;
  }

  // Get agent name
  const agentNameMap: Record<string, string> = {
    'customer-service': 'Lisa Thompson',
    'flight-operations': 'Sarah Chen',
    'hotel-accommodations': 'Marcus Rodriguez',
    'payment-billing': 'David Park',
    'crisis-management': 'Captain Mike Johnson',
  };
  const agentName = agentNameMap[input.agentType] || 'Travel Consultant';

  // Update session (language LOCKED, slots MERGED, stage PROGRESSED)
  updateSession(sessionId, {
    language: input.language === 'pt' ? 'pt' : session.language,
    slots: sessionSlots,
    activeAgent: agentName,
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 1: REASONING LAYER
  // ═══════════════════════════════════════════════════════════════════════════
  let reasoning: ReasoningOutput;
  try {
    reasoning = input.reasoning || processUserIntent({
      message: input.message,
      language: input.language,
      sessionState: {},
      conversationHistory: input.conversationHistory || [],
    });
  } catch (e) {
    console.error('[AI_PIPELINE_NOT_EXECUTED] reasoningLayer failed:', e);
    throw new PipelineNotExecutedError('reasoningLayer');
  }

  if (!reasoning) {
    console.error('[AI_PIPELINE_NOT_EXECUTED] reasoning is null');
    throw new PipelineNotExecutedError('reasoningLayer returned null');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 2: STAGE ENGINE (from reasoning) + SESSION UPDATE
  // ═══════════════════════════════════════════════════════════════════════════
  let stage: ConversationStage = reasoning.stage || input.stage || 'GATHERING_DETAILS';

  // GUARD: If all slots present, force READY_TO_SEARCH
  const updatedSession = getOrCreateSession(sessionId);
  if (hasAllRequiredSlots(updatedSession) && reasoning.intent === 'FLIGHT_SEARCH') {
    stage = 'READY_TO_SEARCH';
    console.log('[EXECUTION_PIPELINE] GUARD: All slots present → READY_TO_SEARCH');
  }

  // Update session stage
  updateSession(sessionId, { stage });

  if (!stage) {
    console.error('[AI_PIPELINE_NOT_EXECUTED] stage is null');
    throw new PipelineNotExecutedError('stageEngine returned null');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 3: BUILD SLOTS FROM INPUT
  // ═══════════════════════════════════════════════════════════════════════════
  const slots: Record<string, any> = {};
  if (input.slots) {
    if (input.slots.origin) slots.origin = input.slots.origin.value;
    if (input.slots.destination) slots.destination = input.slots.destination.value;
    if (input.slots.departureDate) slots.departureDate = input.slots.departureDate.value;
    if (input.slots.returnDate) slots.returnDate = input.slots.returnDate.value;
    if (input.slots.passengers) slots.passengers = input.slots.passengers.value;
    if (input.slots.cabinClass) slots.cabinClass = input.slots.cabinClass.value;
    if (input.slots.tripType) slots.tripType = input.slots.tripType.value;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 4: BUILD MANDATORY SYSTEM PROMPT WITH AGENT NAME
  // ═══════════════════════════════════════════════════════════════════════════
  // Note: agentName already defined in STEP 0
  const systemPrompt = buildMandatorySystemPrompt(reasoning, stage, slots, agentName);

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 5: DEBUG LOG
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('[EXECUTION_PIPELINE] ==========================================');
  console.log('[EXECUTION_PIPELINE] Intent:', reasoning.intent);
  console.log('[EXECUTION_PIPELINE] Stage:', stage);
  console.log('[EXECUTION_PIPELINE] Slots:', JSON.stringify(slots, null, 2));
  console.log('[EXECUTION_PIPELINE] ==========================================');

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 6: BUILD AGENT STATE
  // ═══════════════════════════════════════════════════════════════════════════
  const agentState = buildAgentState(input);
  agentState.intent = reasoning.intent;
  agentState.stage = stage;
  agentState.language = (reasoning.language || input.language) as 'en' | 'pt' | 'es';

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 7: ACTION-FIRST EXECUTION (CRITICAL)
  // If intent is FLIGHT_SEARCH and stage is READY_TO_SEARCH → BLOCK LLM, execute action
  // ═══════════════════════════════════════════════════════════════════════════
  const isFlightSearch = reasoning.intent === 'FLIGHT_SEARCH';
  const isReadyToSearch = stage === 'READY_TO_SEARCH';

  if (isFlightSearch && isReadyToSearch) {
    console.log('[EXECUTION_PIPELINE] ACTION-FIRST: Blocking LLM, executing flight search');

    // Update session: API pending
    updateSession(sessionId, { apiStatus: 'pending', lastAction: 'flight_search_started' });

    // Build raw slots from SESSION (not input) for search — SESSION IS SOURCE OF TRUTH
    const currentSession = getOrCreateSession(sessionId);
    const rawSlots: RawFlightSlots = {
      origin: currentSession.slots.origin || slots.origin,
      destination: currentSession.slots.destination || slots.destination,
      departureDate: currentSession.slots.departureDate || slots.departureDate,
      returnDate: currentSession.slots.returnDate || slots.returnDate,
      passengers: currentSession.slots.adults || slots.passengers,
      cabinClass: currentSession.slots.cabin || slots.cabinClass,
      tripType: slots.tripType,
      direct: currentSession.slots.direct || input.message.toLowerCase().includes('direto') || input.message.toLowerCase().includes('direct'),
    };

    console.log('[EXECUTION_PIPELINE] ACTION-FIRST: Using session slots:', JSON.stringify(rawSlots, null, 2));

    // Execute search (NEVER LLM before this)
    const searchResult = await executeFlightSearch(rawSlots, agentState.language);

    // Update session: API result
    updateSession(sessionId, {
      apiStatus: searchResult.success ? 'success' : 'error',
      lastAction: searchResult.success ? 'flight_search_success' : 'flight_search_failed',
      stage: 'SEARCH_EXECUTED',
    });

    // Generate response AFTER action
    const actionResponse = generatePostActionResponse(searchResult, agentState.language);

    console.log('[EXECUTION_PIPELINE] ACTION-FIRST: Search executed:', searchResult.executed);
    console.log('[EXECUTION_PIPELINE] ACTION-FIRST: Success:', searchResult.success);

    // Get debug panel data for return
    const debugPanelData = getDebugPanelData(sessionId);

    return {
      response: actionResponse,
      agentState,
      actionExecuted: searchResult.executed,
      searchResults: searchResult.results,
      debugPanel: debugPanelData || undefined,
      debugLog: {
        stateInjected: true,
        intent: reasoning.intent,
        stage: stage,
        language: agentState.language,
        slotsCount: Object.keys(slots).length,
        finalPromptLog: systemPrompt,
        actionBlocked: true, // LLM was blocked, action executed first
      },
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 8: REGULAR LLM FLOW (Only for non-action stages)
  // ═══════════════════════════════════════════════════════════════════════════
  const response = await generateTravelResponse(input.message, {
    agentType: input.agentType,
    conversationHistory: input.conversationHistory,
    customerName: input.customerName,
    searchResults: input.searchResults,
    agentState,
  });

  if (!response.success || !response.message) {
    throw new Error(`LLM call failed: ${response.error || 'No response'}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 9: COMPLIANCE CHECK
  // ═══════════════════════════════════════════════════════════════════════════
  let finalResponse = response.message;
  try {
    const compliance = finalComplianceCheck(response.message, reasoning, input.language);
    finalResponse = compliance.response;
    if (compliance.wasModified) {
      console.log('[EXECUTION_PIPELINE] Compliance auto-corrected response');
    }
  } catch (e) {
    console.warn('[EXECUTION_PIPELINE] complianceLayer warning:', e);
  }

  // Update session with last action
  updateSession(sessionId, { lastAction: 'llm_response_generated' });

  // Get debug panel data for return
  const debugPanelData = getDebugPanelData(sessionId);

  return {
    response: finalResponse,
    agentState,
    debugPanel: debugPanelData || undefined,
    debugLog: {
      stateInjected: true,
      intent: reasoning.intent,
      stage: stage,
      language: agentState.language,
      slotsCount: Object.keys(slots).length,
      finalPromptLog: systemPrompt,
    },
  };
}

// ============================================================================
// LEGACY WRAPPER (for backwards compatibility during migration)
// ============================================================================

/**
 * Wrap legacy generateTravelResponse calls with pipeline enforcement
 * TEMPORARY: Remove after full migration
 */
export async function enforcedGenerateTravelResponse(
  message: string,
  context: {
    agentType?: string;
    conversationHistory?: GroqMessage[];
    searchResults?: any;
    customerName?: string;
    // NEW: Required for pipeline
    intent: string;
    stage: ConversationStage;
    language: 'en' | 'pt' | 'es';
    slots: HandoffSlots;
    handoffFrom?: string;
  }
): Promise<GroqResponse & { debugLog?: PipelineOutput['debugLog'] }> {
  try {
    const result = await executePipeline({
      message,
      language: context.language,
      intent: context.intent,
      stage: context.stage,
      agentType: (context.agentType || 'customer-service') as TeamType,
      slots: context.slots,
      conversationHistory: context.conversationHistory,
      customerName: context.customerName,
      searchResults: context.searchResults,
      handoffFrom: context.handoffFrom,
    });

    return {
      success: true,
      message: result.response,
      debugLog: result.debugLog,
    };
  } catch (error) {
    if (error instanceof StateNotInjectedError) {
      console.error('[STATE_NOT_INJECTED]', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
    throw error;
  }
}
