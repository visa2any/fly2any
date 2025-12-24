/**
 * Agent State Injector
 *
 * CRITICAL: Enforces mandatory state injection before agent response generation.
 *
 * Rules:
 * 1. Every agent MUST receive structured state (intent, slots, stage, language)
 * 2. Missing state = RUNTIME ERROR (no silent fallback)
 * 3. Slot-aware guardrails prevent re-asking for known data
 * 4. Language lock enforced pre-generation
 */

import type { HandoffSlots } from './entity-extractor';
import type { ConversationStage } from './reasoning-layer';

// ============================================================================
// TYPES
// ============================================================================

export interface AgentState {
  // MANDATORY - throw if missing
  intent: string;
  stage: ConversationStage;
  language: 'en' | 'pt' | 'es';

  // Slots with confidence
  slots: {
    origin?: { value: string; confidence: number };
    destination?: { value: string; confidence: number };
    departureDate?: { value: string; confidence: number };
    returnDate?: { value: string; confidence: number };
    passengers?: { value: number; confidence: number };
    cabinClass?: { value: string; confidence: number };
    tripType?: { value: string; confidence: number };
  };

  // Optional context
  emotionalState?: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  agentName?: string;
  handoffFrom?: string;
}

export interface InjectedPrompt {
  systemPrompt: string;
  guardrails: string[];
  debugLog: AgentDebugLog;
}

export interface AgentDebugLog {
  timestamp: number;
  agentName: string;
  intent: string;
  stage: string;
  language: string;
  slotsInjected: Record<string, { value: string; confidence: number }>;
  guardrailsActive: string[];
}

// ============================================================================
// ERROR CLASS
// ============================================================================

export class MissingAgentStateError extends Error {
  constructor(public missingFields: string[]) {
    super(`[AGENT_STATE_VIOLATION] Missing mandatory fields: ${missingFields.join(', ')}`);
    this.name = 'MissingAgentStateError';
  }
}

// ============================================================================
// STATE VALIDATION
// ============================================================================

/**
 * HARD FAIL: Throws if mandatory state is missing
 */
export function validateAgentState(state: Partial<AgentState>): asserts state is AgentState {
  const missing: string[] = [];

  if (!state.intent) missing.push('intent');
  if (!state.stage) missing.push('stage');
  if (!state.language) missing.push('language');
  if (!state.slots) missing.push('slots');

  if (missing.length > 0) {
    console.error('[AGENT_STATE_VIOLATION] Attempted to generate response without mandatory state:', missing);
    throw new MissingAgentStateError(missing);
  }
}

// ============================================================================
// SLOT-AWARE GUARDRAILS
// ============================================================================

interface SlotGuardrail {
  slotName: keyof AgentState['slots'];
  forbiddenPatterns: RegExp[];
  forbiddenPatternsPT: RegExp[];
  forbiddenPatternsES: RegExp[];
}

const SLOT_GUARDRAILS: SlotGuardrail[] = [
  {
    slotName: 'destination',
    forbiddenPatterns: [
      /where.*(?:would you like|do you want|going|travel|destination)/i,
      /where.*like to go/i,
      /(?:which|what).*destination/i,
      /could.*(?:tell|provide).*destination/i,
    ],
    forbiddenPatternsPT: [
      /(?:para onde|onde).*(?:quer|gostaria|deseja)/i,
      /(?:qual|pode informar).*destino/i,
      /(?:não consegui|preciso).*destino/i,
    ],
    forbiddenPatternsES: [
      /(?:adónde|donde).*(?:quiere|desea|le gustaría)/i,
      /(?:cuál|puede proporcionar).*destino/i,
    ],
  },
  {
    slotName: 'origin',
    forbiddenPatterns: [
      /where.*(?:from|departing|leaving|starting)/i,
      /(?:which|what).*(?:origin|departure)/i,
      /could.*(?:tell|provide).*origin/i,
    ],
    forbiddenPatternsPT: [
      /(?:de onde|qual).*(?:origem|saída|partida)/i,
      /(?:pode informar|preciso).*origem/i,
    ],
    forbiddenPatternsES: [
      /(?:de dónde|cuál).*(?:origen|salida)/i,
    ],
  },
  {
    slotName: 'departureDate',
    forbiddenPatterns: [
      /when.*(?:would you like|do you want|plan|travel)/i,
      /(?:which|what).*(?:date|dates|day)/i,
      /could.*(?:tell|provide).*date/i,
    ],
    forbiddenPatternsPT: [
      /(?:quando|qual).*(?:data|dia|datas)/i,
      /(?:pode informar|preciso).*(?:data|datas)/i,
    ],
    forbiddenPatternsES: [
      /(?:cuándo|cuál).*(?:fecha|día)/i,
    ],
  },
];

/**
 * Build guardrail instructions based on known slots
 */
export function buildSlotGuardrails(state: AgentState): string[] {
  const guardrails: string[] = [];
  const lang = state.language;

  for (const guard of SLOT_GUARDRAILS) {
    const slot = state.slots[guard.slotName];
    if (slot && slot.confidence >= 0.4) {
      const slotDisplay = typeof slot.value === 'string' ? slot.value : String(slot.value);
      guardrails.push(
        `[SLOT LOCKED: ${guard.slotName} = "${slotDisplay}" (confidence: ${slot.confidence.toFixed(2)})]`,
        `[FORBIDDEN: Do NOT ask for ${guard.slotName}. It is already known.]`
      );
    }
  }

  // Generic no-restart guardrail
  const knownSlots = Object.entries(state.slots)
    .filter(([_, v]) => v && (v as any).confidence >= 0.4)
    .map(([k, v]) => `${k}="${(v as any).value}"`);

  if (knownSlots.length > 0) {
    guardrails.push(
      `[KNOWN DATA: ${knownSlots.join(', ')}]`,
      `[RULE: You may CONFIRM or CORRECT these, but NEVER re-ask as if unknown.]`
    );
  }

  // Language lock
  guardrails.push(
    `[LANGUAGE LOCK: ${lang.toUpperCase()}. ALL responses MUST be in ${lang.toUpperCase()} only.]`
  );

  return guardrails;
}

/**
 * Validate that a response doesn't violate slot guardrails
 */
export function validateResponseGuardrails(
  response: string,
  state: AgentState
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];
  const lang = state.language;

  for (const guard of SLOT_GUARDRAILS) {
    const slot = state.slots[guard.slotName];
    if (slot && slot.confidence >= 0.4) {
      const patterns = lang === 'pt' ? guard.forbiddenPatternsPT :
                       lang === 'es' ? guard.forbiddenPatternsES :
                       guard.forbiddenPatterns;

      for (const pattern of patterns) {
        if (pattern.test(response)) {
          violations.push(
            `GUARDRAIL_VIOLATION: Asked for ${guard.slotName} when already have: ${slot.value}`
          );
          break;
        }
      }
    }
  }

  return { valid: violations.length === 0, violations };
}

// ============================================================================
// PROMPT INJECTION
// ============================================================================

/**
 * Build agent system prompt with mandatory state injection
 */
export function injectAgentState(state: AgentState, agentName: string = 'Agent'): InjectedPrompt {
  // HARD FAIL if state invalid
  validateAgentState(state);

  const guardrails = buildSlotGuardrails(state);

  // Build structured context block
  const stateBlock = [
    '='.repeat(60),
    'INJECTED STATE (MANDATORY - READ BEFORE RESPONDING)',
    '='.repeat(60),
    `INTENT: ${state.intent}`,
    `STAGE: ${state.stage}`,
    `LANGUAGE: ${state.language.toUpperCase()} (LOCKED)`,
    '',
    'KNOWN SLOTS:',
    ...Object.entries(state.slots)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => `  - ${k}: "${(v as any).value}" (confidence: ${(v as any).confidence.toFixed(2)})`),
    '',
    'GUARDRAILS:',
    ...guardrails,
    '',
    state.handoffFrom ? `[HANDOFF: Received context from ${state.handoffFrom}. Trust all slots.]` : '',
    '='.repeat(60),
  ].filter(Boolean).join('\n');

  // Build agent-specific instructions
  const agentInstructions = getAgentInstructions(agentName, state);

  const systemPrompt = `${stateBlock}\n\n${agentInstructions}`;

  // Debug log for dev mode
  const debugLog: AgentDebugLog = {
    timestamp: Date.now(),
    agentName,
    intent: state.intent,
    stage: state.stage,
    language: state.language,
    slotsInjected: Object.fromEntries(
      Object.entries(state.slots)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, { value: String((v as any).value), confidence: (v as any).confidence }])
    ) as Record<string, { value: string; confidence: number }>,
    guardrailsActive: guardrails,
  };

  // Log in dev mode
  if (process.env.NODE_ENV === 'development') {
    console.log('[AGENT_STATE_INJECTION]', JSON.stringify(debugLog, null, 2));
  }

  return { systemPrompt, guardrails, debugLog };
}

// ============================================================================
// AGENT-SPECIFIC INSTRUCTIONS
// ============================================================================

function getAgentInstructions(agentName: string, state: AgentState): string {
  const lang = state.language;

  const baseInstructions: Record<string, Record<string, string>> = {
    'Sarah Chen': {
      en: `You are Sarah Chen, Fly2Any Flight Operations Specialist.
You have ALREADY received the user's request from Lisa.
The slots above are CONFIRMED data - do NOT re-ask for them.

Your job:
- If slots are complete: proceed to search or confirm details
- If slots need clarification: ask for clarification (not re-collection)
- NEVER say "I couldn't find" or ask for origin/destination/dates if they exist above`,
      pt: `Você é Sarah Chen, Especialista em Operações de Voo da Fly2Any.
Você JÁ recebeu o pedido do usuário da Lisa.
Os slots acima são dados CONFIRMADOS - NÃO pergunte novamente.

Seu trabalho:
- Se os slots estão completos: prossiga para busca ou confirmação
- Se precisam esclarecimento: peça esclarecimento (não recoleta)
- NUNCA diga "não consegui encontrar" ou peça origem/destino/datas se existem acima`,
      es: `Eres Sarah Chen, Especialista en Operaciones de Vuelo de Fly2Any.
Ya has recibido la solicitud del usuario de Lisa.
Los slots arriba son datos CONFIRMADOS - NO los preguntes de nuevo.

Tu trabajo:
- Si los slots están completos: procede a buscar o confirmar detalles
- Si necesitan aclaración: pide aclaración (no recolección)
- NUNCA digas "no pude encontrar" o preguntes origen/destino/fechas si existen arriba`,
    },
    'Lisa Thompson': {
      en: `You are Lisa Thompson, Fly2Any Customer Service Lead.
You are gathering initial information from the user.
Check the slots above - if data exists, CONFIRM it, don't re-ask.

Your job:
- Collect missing information naturally
- Confirm what you understood
- Hand off to specialist when ready`,
      pt: `Você é Lisa Thompson, Líder de Atendimento ao Cliente da Fly2Any.
Você está coletando informações iniciais do usuário.
Verifique os slots acima - se dados existem, CONFIRME, não pergunte novamente.

Seu trabalho:
- Colete informações faltantes naturalmente
- Confirme o que você entendeu
- Transfira para especialista quando pronto`,
      es: `Eres Lisa Thompson, Líder de Servicio al Cliente de Fly2Any.
Estás recopilando información inicial del usuario.
Revisa los slots arriba - si hay datos, CONFIRMA, no los preguntes de nuevo.

Tu trabajo:
- Recopila información faltante naturalmente
- Confirma lo que entendiste
- Transfiere al especialista cuando esté listo`,
    },
  };

  const agentKey = Object.keys(baseInstructions).find(k =>
    agentName.toLowerCase().includes(k.toLowerCase().split(' ')[0])
  ) || 'Lisa Thompson';

  return baseInstructions[agentKey][lang] || baseInstructions[agentKey].en;
}

// ============================================================================
// HANDOFF CONTRACT
// ============================================================================

export interface HandoffContract {
  intent: string;
  stage: ConversationStage;
  slots: AgentState['slots'];
  confidence: Record<string, number>;
  conversationLanguage: 'en' | 'pt' | 'es';
  fromAgent: string;
  toAgent: string;
  timestamp: number;
}

/**
 * Create handoff contract for agent transfer
 */
export function createHandoffContract(
  state: AgentState,
  fromAgent: string,
  toAgent: string
): HandoffContract {
  validateAgentState(state);

  const confidence: Record<string, number> = {};
  for (const [key, value] of Object.entries(state.slots)) {
    if (value) {
      confidence[key] = (value as any).confidence;
    }
  }

  const contract: HandoffContract = {
    intent: state.intent,
    stage: state.stage,
    slots: state.slots,
    confidence,
    conversationLanguage: state.language,
    fromAgent,
    toAgent,
    timestamp: Date.now(),
  };

  console.log(`[HANDOFF_CONTRACT] ${fromAgent} → ${toAgent}:`, JSON.stringify(contract, null, 2));

  return contract;
}

/**
 * Restore AgentState from handoff contract
 */
export function stateFromHandoffContract(contract: HandoffContract): AgentState {
  return {
    intent: contract.intent,
    stage: contract.stage,
    language: contract.conversationLanguage,
    slots: contract.slots,
    handoffFrom: contract.fromAgent,
  };
}

