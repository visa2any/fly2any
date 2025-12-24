/**
 * Session Manager — Centralized State Persistence
 *
 * CRITICAL: This module ensures:
 * 1. Language NEVER resets on handoff
 * 2. Slots NEVER get lost
 * 3. Stage NEVER gets ignored
 * 4. Agents receive HYDRATED sessions
 */

import type { ConversationStage } from './reasoning-layer';
import type { HandoffSlots } from './entity-extractor';

// ============================================================================
// SESSION STATE TYPE
// ============================================================================

export interface SessionState {
  // LOCKED - Once set, NEVER changes
  language: 'pt' | 'en' | 'es';

  // ACCUMULATED - Only grows, never shrinks
  slots: {
    origin?: string;
    destination?: string;
    departureDate?: string;
    returnDate?: string;
    cabin?: string;
    direct?: boolean;
    adults?: number;
  };

  // PROGRESSES - Only moves forward
  stage: ConversationStage;

  // TRACKING
  activeAgent: string;
  lastAction?: string;
  apiStatus?: 'pending' | 'success' | 'error';
  handoffHistory: string[];
}

// ============================================================================
// SESSION STORE (In-memory for now, can be Redis later)
// ============================================================================

const sessions = new Map<string, SessionState>();

// ============================================================================
// HARD GUARDS
// ============================================================================

/**
 * GUARD: Block slot questions if slots exist
 */
export function shouldBlockSlotQuestion(session: SessionState, slotName: string): boolean {
  const slot = session.slots[slotName as keyof typeof session.slots];
  return slot !== undefined && slot !== null && slot !== '';
}

/**
 * GUARD: Block English responses if language is PT
 */
export function shouldBlockEnglish(session: SessionState): boolean {
  return session.language === 'pt';
}

/**
 * GUARD: Force search execution if READY_TO_SEARCH
 */
export function shouldForceSearch(session: SessionState): boolean {
  return session.stage === 'READY_TO_SEARCH';
}

/**
 * GUARD: Check if all required slots are present
 */
export function hasAllRequiredSlots(session: SessionState): boolean {
  return !!(
    session.slots.origin &&
    session.slots.destination &&
    session.slots.departureDate
  );
}

// ============================================================================
// SESSION OPERATIONS
// ============================================================================

/**
 * Create or get session
 */
export function getOrCreateSession(sessionId: string): SessionState {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      language: 'pt', // Default to PT-BR
      slots: {},
      stage: 'GREETING',
      activeAgent: 'Lisa Thompson',
      handoffHistory: [],
    });
  }
  return sessions.get(sessionId)!;
}

/**
 * Update session with new data (MERGE, never overwrite)
 */
export function updateSession(
  sessionId: string,
  updates: Partial<SessionState>
): SessionState {
  const current = getOrCreateSession(sessionId);

  // MERGE slots (never lose existing)
  const mergedSlots = {
    ...current.slots,
    ...(updates.slots || {}),
  };

  // Language LOCK - once set to PT, stays PT
  const language = current.language === 'pt' ? 'pt' : (updates.language || current.language);

  // Stage can only progress, not regress
  const stageOrder: ConversationStage[] = [
    'GREETING',
    'GATHERING_DETAILS',
    'NARROWING',
    'READY_TO_SEARCH',
    'SEARCH_EXECUTED',
    'PRESENTING_OPTIONS',
    'DEEP_DIVE',
    'BOOKING_INTENT',
    'CHECKOUT',
    'POST_BOOKING',
  ];
  const currentIndex = stageOrder.indexOf(current.stage);
  const newIndex = updates.stage ? stageOrder.indexOf(updates.stage) : -1;
  const stage = newIndex > currentIndex ? updates.stage! : current.stage;

  const updated: SessionState = {
    ...current,
    ...updates,
    language,
    slots: mergedSlots,
    stage,
    handoffHistory: updates.activeAgent && updates.activeAgent !== current.activeAgent
      ? [...current.handoffHistory, `${current.activeAgent} → ${updates.activeAgent}`]
      : current.handoffHistory,
  };

  sessions.set(sessionId, updated);
  return updated;
}

/**
 * Handoff session to new agent (PRESERVES ALL STATE)
 */
export function handoffSession(
  sessionId: string,
  fromAgent: string,
  toAgent: string
): SessionState {
  const session = getOrCreateSession(sessionId);

  console.log('[SESSION_MANAGER] ========================================');
  console.log('[SESSION_MANAGER] HANDOFF:', fromAgent, '→', toAgent);
  console.log('[SESSION_MANAGER] Language (LOCKED):', session.language);
  console.log('[SESSION_MANAGER] Slots:', JSON.stringify(session.slots));
  console.log('[SESSION_MANAGER] Stage:', session.stage);
  console.log('[SESSION_MANAGER] ========================================');

  return updateSession(sessionId, {
    activeAgent: toAgent,
    lastAction: `handoff_${fromAgent}_to_${toAgent}`,
  });
}

/**
 * Get session for debugging
 */
export function getSessionDebug(sessionId: string): SessionState | null {
  return sessions.get(sessionId) || null;
}

// ============================================================================
// DEBUG PANEL OUTPUT
// ============================================================================

export interface DebugPanelData {
  sessionId: string;
  activeAgent: string;
  language: string;
  stage: string;
  slots: Record<string, any>;
  lastAction?: string;
  apiStatus?: string;
  handoffHistory: string[];
  guards: {
    blockSlotQuestions: boolean;
    blockEnglish: boolean;
    forceSearch: boolean;
    hasAllSlots: boolean;
  };
}

/**
 * Generate debug panel data for UI
 */
export function getDebugPanelData(sessionId: string): DebugPanelData | null {
  const session = sessions.get(sessionId);
  if (!session) return null;

  return {
    sessionId,
    activeAgent: session.activeAgent,
    language: session.language,
    stage: session.stage,
    slots: session.slots,
    lastAction: session.lastAction,
    apiStatus: session.apiStatus,
    handoffHistory: session.handoffHistory,
    guards: {
      blockSlotQuestions: hasAllRequiredSlots(session),
      blockEnglish: shouldBlockEnglish(session),
      forceSearch: shouldForceSearch(session),
      hasAllSlots: hasAllRequiredSlots(session),
    },
  };
}
