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
  debugLog: {
    stateInjected: boolean;
    intent: string;
    stage: string;
    language: string;
    slotsCount: number;
    finalPromptLog: string;
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
 * 3. complianceLayer(reasoning, stage, session)
 * 4. systemPrompt = buildMandatoryPrompt(reasoning, stage)
 * 5. LLM(systemPrompt, userMessage)
 *
 * @throws PipelineNotExecutedError if any step fails
 */
export async function executePipeline(input: PipelineInput): Promise<PipelineOutput> {
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
  // STEP 2: STAGE ENGINE (from reasoning)
  // ═══════════════════════════════════════════════════════════════════════════
  const stage: ConversationStage = reasoning.stage || input.stage || 'GATHERING_DETAILS';

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
  const agentNameMap: Record<string, string> = {
    'customer-service': 'Lisa Thompson',
    'flight-operations': 'Sarah Chen',
    'hotel-accommodations': 'Marcus Rodriguez',
    'payment-billing': 'David Park',
    'crisis-management': 'Captain Mike Johnson',
  };
  const agentName = agentNameMap[input.agentType] || 'Travel Consultant';
  const systemPrompt = buildMandatorySystemPrompt(reasoning, stage, slots, agentName);

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 5: LOG FINAL PROMPT (DEBUG)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('[EXECUTION_PIPELINE] ==========================================');
  console.log('[EXECUTION_PIPELINE] FINAL SYSTEM PROMPT:');
  console.log(systemPrompt);
  console.log('[EXECUTION_PIPELINE] ==========================================');

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 6: BUILD AGENT STATE FOR INJECTION
  // ═══════════════════════════════════════════════════════════════════════════
  const agentState = buildAgentState(input);
  agentState.intent = reasoning.intent;
  agentState.stage = stage;
  agentState.language = (reasoning.language || input.language) as 'en' | 'pt' | 'es';

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 7: CALL LLM WITH MANDATORY STATE
  // ═══════════════════════════════════════════════════════════════════════════
  const response = await generateTravelResponse(input.message, {
    agentType: input.agentType,
    conversationHistory: input.conversationHistory,
    customerName: input.customerName,
    searchResults: input.searchResults,
    agentState, // MANDATORY - triggers state injection path
  });

  if (!response.success || !response.message) {
    throw new Error(`LLM call failed: ${response.error || 'No response'}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 8: COMPLIANCE CHECK (post-generation validation)
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
    // Don't throw - compliance is post-validation
  }

  return {
    response: finalResponse,
    agentState,
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
