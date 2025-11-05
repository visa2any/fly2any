/**
 * Conversation Persistence System
 * Handles localStorage and database synchronization for AI conversations
 *
 * Features:
 * - Auto-save conversations to localStorage
 * - Session recovery on page refresh/close
 * - Migration to database when user logs in
 * - Multi-device sync for authenticated users
 */

import { v4 as uuidv4 } from 'uuid';

// ==========================================
// Types
// ==========================================

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  consultant?: {
    name: string;
    team: string;
    emoji: string;
  };
  flightResults?: any[];
  hotelResults?: any[];
  timestamp: number;
}

export interface ConversationState {
  id: string;
  sessionId: string;
  userId?: string | null;
  status: 'active' | 'completed' | 'abandoned';
  messages: ConversationMessage[];
  currentConsultantTeam?: string;
  conversationContext?: any;
  searchHistory?: any[];
  metadata: {
    startedAt: number;
    lastMessageAt: number;
    completedAt?: number;
    messageCount: number;
    platform: 'web' | 'mobile';
    browser?: string;
  };
}

// ==========================================
// Constants
// ==========================================

const STORAGE_KEYS = {
  SESSION_ID: 'fly2any_session_id',
  CONVERSATION: 'fly2any_conversation',
  CONVERSATION_LIST: 'fly2any_conversations',
  LAST_SYNC: 'fly2any_last_sync'
};

const CONVERSATION_TIMEOUT = 48 * 60 * 60 * 1000; // 48 hours
const AUTO_SAVE_DEBOUNCE = 1000; // 1 second

// ==========================================
// Session Management
// ==========================================

/**
 * Get or create session ID
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);

  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
  }

  return sessionId;
}

/**
 * Clear session ID (use when starting fresh conversation)
 */
export function clearSessionId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
}

// ==========================================
// Conversation Management
// ==========================================

/**
 * Start a new conversation
 */
export function startConversation(userId?: string | null): ConversationState {
  const sessionId = getSessionId();
  const conversationId = uuidv4();

  const conversation: ConversationState = {
    id: conversationId,
    sessionId,
    userId: userId || null,
    status: 'active',
    messages: [],
    metadata: {
      startedAt: Date.now(),
      lastMessageAt: Date.now(),
      messageCount: 0,
      platform: isMobile() ? 'mobile' : 'web',
      browser: getBrowserInfo()
    }
  };

  saveConversation(conversation);
  return conversation;
}

/**
 * Load active conversation from localStorage
 */
export function loadConversation(): ConversationState | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CONVERSATION);
    if (!stored) return null;

    const conversation: ConversationState = JSON.parse(stored);

    // Check if conversation is expired
    if (isConversationExpired(conversation)) {
      archiveConversation(conversation);
      return null;
    }

    return conversation;
  } catch (error) {
    console.error('Failed to load conversation:', error);
    return null;
  }
}

/**
 * Save conversation to localStorage
 */
export function saveConversation(conversation: ConversationState): void {
  if (typeof window === 'undefined') return;

  try {
    conversation.metadata.lastMessageAt = Date.now();
    localStorage.setItem(STORAGE_KEYS.CONVERSATION, JSON.stringify(conversation));

    // Also update last sync timestamp
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
  } catch (error) {
    console.error('Failed to save conversation:', error);
  }
}

/**
 * Add message to conversation
 */
export function addMessage(
  conversation: ConversationState,
  message: Omit<ConversationMessage, 'id' | 'timestamp'>
): ConversationState {
  const newMessage: ConversationMessage = {
    ...message,
    id: uuidv4(),
    timestamp: Date.now()
  };

  const updated: ConversationState = {
    ...conversation,
    messages: [...conversation.messages, newMessage],
    metadata: {
      ...conversation.metadata,
      lastMessageAt: Date.now(),
      messageCount: conversation.messages.length + 1
    }
  };

  saveConversation(updated);
  return updated;
}

/**
 * Update conversation context
 */
export function updateConversationContext(
  conversation: ConversationState,
  context: any
): ConversationState {
  const updated: ConversationState = {
    ...conversation,
    conversationContext: context
  };

  saveConversation(updated);
  return updated;
}

/**
 * Update current consultant
 */
export function updateCurrentConsultant(
  conversation: ConversationState,
  team: string
): ConversationState {
  const updated: ConversationState = {
    ...conversation,
    currentConsultantTeam: team
  };

  saveConversation(updated);
  return updated;
}

/**
 * Mark conversation as completed
 */
export function completeConversation(conversation: ConversationState): ConversationState {
  const updated: ConversationState = {
    ...conversation,
    status: 'completed',
    metadata: {
      ...conversation.metadata,
      completedAt: Date.now()
    }
  };

  saveConversation(updated);
  archiveConversation(updated);
  return updated;
}

/**
 * Clear active conversation
 */
export function clearConversation(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.CONVERSATION);
}

// ==========================================
// Conversation History
// ==========================================

/**
 * Archive conversation to history
 */
export function archiveConversation(conversation: ConversationState): void {
  if (typeof window === 'undefined') return;

  try {
    // Get existing conversations
    const stored = localStorage.getItem(STORAGE_KEYS.CONVERSATION_LIST);
    const conversations: ConversationState[] = stored ? JSON.parse(stored) : [];

    // Add current conversation
    conversations.push({
      ...conversation,
      status: conversation.status === 'active' ? 'abandoned' : conversation.status
    });

    // Keep only last 10 conversations
    const recent = conversations.slice(-10);

    localStorage.setItem(STORAGE_KEYS.CONVERSATION_LIST, JSON.stringify(recent));

    // Clear active conversation
    clearConversation();
  } catch (error) {
    console.error('Failed to archive conversation:', error);
  }
}

/**
 * Get conversation history
 */
export function getConversationHistory(): ConversationState[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CONVERSATION_LIST);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load conversation history:', error);
    return [];
  }
}

/**
 * Get conversation by ID from history
 */
export function getConversationById(id: string): ConversationState | null {
  const history = getConversationHistory();
  return history.find(c => c.id === id) || null;
}

// ==========================================
// Recovery & Sync
// ==========================================

/**
 * Check if there's a recoverable conversation
 */
export function hasRecoverableConversation(): boolean {
  const conversation = loadConversation();
  return conversation !== null && conversation.messages.length > 0;
}

/**
 * Check if conversation is expired
 */
export function isConversationExpired(conversation: ConversationState): boolean {
  const age = Date.now() - conversation.metadata.lastMessageAt;
  return age > CONVERSATION_TIMEOUT;
}

/**
 * Get conversation age in minutes
 */
export function getConversationAge(conversation: ConversationState): number {
  const age = Date.now() - conversation.metadata.lastMessageAt;
  return Math.floor(age / (60 * 1000));
}

/**
 * Should show recovery prompt?
 */
export function shouldShowRecoveryPrompt(conversation: ConversationState | null): boolean {
  if (!conversation) return false;
  if (conversation.status !== 'active') return false;
  if (conversation.messages.length === 0) return false;

  const age = getConversationAge(conversation);
  // Show if conversation is between 1 minute and 24 hours old
  return age >= 1 && age <= 24 * 60;
}

// ==========================================
// User Association
// ==========================================

/**
 * Associate conversation with user (when user logs in)
 */
export function associateConversationWithUser(
  conversation: ConversationState,
  userId: string
): ConversationState {
  const updated: ConversationState = {
    ...conversation,
    userId
  };

  saveConversation(updated);
  return updated;
}

/**
 * Prepare conversation for database migration
 */
export function prepareConversationForMigration(
  conversation: ConversationState
): any {
  return {
    id: conversation.id,
    sessionId: conversation.sessionId,
    userId: conversation.userId,
    status: conversation.status,
    currentConsultantTeam: conversation.currentConsultantTeam,
    messages: conversation.messages,
    conversationContext: conversation.conversationContext,
    searchHistory: conversation.searchHistory,
    metadata: conversation.metadata
  };
}

// ==========================================
// Utilities
// ==========================================

/**
 * Check if running on mobile device
 */
function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Get browser info
 */
function getBrowserInfo(): string {
  if (typeof window === 'undefined') return 'unknown';

  const ua = navigator.userAgent;
  if (ua.indexOf('Chrome') > -1) return 'Chrome';
  if (ua.indexOf('Safari') > -1) return 'Safari';
  if (ua.indexOf('Firefox') > -1) return 'Firefox';
  if (ua.indexOf('Edge') > -1) return 'Edge';
  return 'Other';
}

/**
 * Clear all conversation data
 */
export function clearAllConversationData(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
  localStorage.removeItem(STORAGE_KEYS.CONVERSATION);
  localStorage.removeItem(STORAGE_KEYS.CONVERSATION_LIST);
  localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
}

/**
 * Export conversation as JSON
 */
export function exportConversation(conversation: ConversationState): string {
  return JSON.stringify(conversation, null, 2);
}

/**
 * Get conversation stats
 */
export function getConversationStats(conversation: ConversationState) {
  const userMessages = conversation.messages.filter(m => m.role === 'user').length;
  const assistantMessages = conversation.messages.filter(m => m.role === 'assistant').length;
  const duration = conversation.metadata.lastMessageAt - conversation.metadata.startedAt;
  const durationMinutes = Math.floor(duration / (60 * 1000));

  return {
    totalMessages: conversation.messages.length,
    userMessages,
    assistantMessages,
    durationMinutes,
    status: conversation.status,
    consultantsInvolved: [...new Set(conversation.messages.map(m => m.consultant?.name).filter(Boolean))],
    hasFlightResults: conversation.messages.some(m => m.flightResults),
    hasHotelResults: conversation.messages.some(m => m.hotelResults)
  };
}
