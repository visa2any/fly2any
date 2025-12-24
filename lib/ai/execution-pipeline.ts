/**
 * Execution Pipeline — Mandatory State Injection Enforcer
 *
 * CRITICAL: This is the ONLY path to LLM responses.
 * No LLM call can occur without passing through this pipeline.
 *
 * Pipeline:
 * userInput → reasoningLayer → stageEngine → complianceLayer → stateInjection → LLM
 */

import { generateTravelResponse, type GroqMessage, type GroqResponse } from './groq-client';
import { type AgentState } from './agent-state-injector';
import { type ReasoningOutput } from './reasoning-layer';
import { type HandoffSlots } from './entity-extractor';
import { type ConversationStage } from './reasoning-layer';
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
// STATE NOT INJECTED ERROR
// ============================================================================

export class StateNotInjectedError extends Error {
  constructor(reason: string) {
    super(`[STATE_NOT_INJECTED] ${reason}`);
    this.name = 'StateNotInjectedError';
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
 * Build serialized state block for prompt injection
 */
export function buildStateBlock(state: AgentState): string {
  const slotLines = Object.entries(state.slots)
    .filter(([_, v]) => v !== undefined)
    .map(([k, v]) => `    ${k}: ${(v as any).value}`);

  const rules = [
    '- do not ask for existing slots',
    '- do not switch language',
    '- do not claim no results before searching',
  ];

  if (state.handoffFrom) {
    rules.push(`- received handoff from ${state.handoffFrom}, trust all slots`);
  }

  return `---
SYSTEM STATE (NON-NEGOTIABLE)
intent: ${state.intent}
stage: ${state.stage}
language: ${state.language}
slots:
${slotLines.length > 0 ? slotLines.join('\n') : '    (none)'}
rules:
${rules.map(r => `  ${r}`).join('\n')}
---`;
}

// ============================================================================
// MAIN PIPELINE EXECUTOR
// ============================================================================

/**
 * Execute the unified pipeline — ONLY way to get LLM response
 *
 * @throws StateNotInjectedError if state cannot be built
 */
export async function executePipeline(input: PipelineInput): Promise<PipelineOutput> {
  // Step 1: Build mandatory state (throws if invalid)
  const agentState = buildAgentState(input);

  // Step 2: Build state block for logging
  const stateBlock = buildStateBlock(agentState);

  // Step 3: Log final prompt (debug mode)
  console.log('[EXECUTION_PIPELINE] ==========================================');
  console.log('[EXECUTION_PIPELINE] FINAL PROMPT STATE BLOCK:');
  console.log(stateBlock);
  console.log('[EXECUTION_PIPELINE] ==========================================');

  // Step 4: Call LLM with mandatory state injection
  const response = await generateTravelResponse(input.message, {
    agentType: input.agentType,
    conversationHistory: input.conversationHistory,
    customerName: input.customerName,
    searchResults: input.searchResults,
    agentState, // MANDATORY - this triggers state injection path
  });

  if (!response.success || !response.message) {
    throw new Error(`LLM call failed: ${response.error || 'No response'}`);
  }

  return {
    response: response.message,
    agentState,
    debugLog: {
      stateInjected: true,
      intent: agentState.intent,
      stage: agentState.stage,
      language: agentState.language,
      slotsCount: Object.keys(agentState.slots).filter(k => (agentState.slots as any)[k]).length,
      finalPromptLog: stateBlock,
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
