/**
 * Type definitions for AI Session Management
 *
 * Provides TypeScript type safety for session-related operations
 */

import { UserSession } from '@/lib/ai/auth-strategy';

// ============================================================================
// API Request/Response Types
// ============================================================================

export type SessionAction = 'create' | 'update' | 'increment' | 'upgrade';

export interface CreateSessionRequest {
  action: 'create';
}

export interface UpdateSessionRequest {
  action: 'update';
  sessionId: string;
}

export interface IncrementSessionRequest {
  action: 'increment';
  sessionId: string;
  incrementConversation?: boolean;
}

export interface UpgradeSessionRequest {
  action: 'upgrade';
  sessionId: string;
  userId: string;
  email: string;
  name: string;
}

export type SessionRequest =
  | CreateSessionRequest
  | UpdateSessionRequest
  | IncrementSessionRequest
  | UpgradeSessionRequest;

export interface SessionResponse {
  success: true;
  session: SessionData;
  message?: string;
}

export interface SessionErrorResponse {
  success: false;
  error: string;
  message?: string;
}

export type SessionAPIResponse = SessionResponse | SessionErrorResponse;

// ============================================================================
// Session Data Types
// ============================================================================

export interface SessionData {
  sessionId: string;
  ipAddress: string;
  isAuthenticated: boolean;
  userId?: string;
  email?: string;
  name?: string;
  conversationCount: number;
  lastActivity: string;
  createdAt: string;
  anonymizedAt?: string;
  userAgent?: string;
}

export interface SessionStats {
  totalSessions: number;
  authenticatedSessions: number;
  anonymousSessions: number;
  anonymizedSessions: number;
  activeSessions24h: number;
  totalConversations: number;
  averageConversationsPerSession: string;
}

export interface SessionStatsResponse {
  success: true;
  stats: SessionStats;
}

// ============================================================================
// Internal Storage Types
// ============================================================================

export interface StoredSession extends UserSession {
  userAgent?: string;
  shouldAnonymize: boolean;
  anonymizedAt?: Date;
}

// ============================================================================
// Hook Types
// ============================================================================

export interface UseAISessionOptions {
  /**
   * Auto-initialize session on mount
   * @default true
   */
  autoInit?: boolean;

  /**
   * Current action being performed (for auth triggers)
   * @default 'ask-question'
   */
  currentAction?: string;

  /**
   * Language for auth messages
   * @default 'en'
   */
  language?: 'en' | 'pt' | 'es';
}

export interface UseAISessionReturn {
  session: UserSession | null;
  loading: boolean;
  error: Error | null;
  incrementConversation: () => Promise<void>;
  updateActivity: () => Promise<void>;
  upgradeSession: (userId: string, email: string, name: string) => Promise<void>;
  deleteSession: () => Promise<void>;
  refreshSession: () => Promise<void>;
  shouldShowAuthPrompt: boolean;
  authPromptMessage: string;
  requiresAuth: boolean;
  engagementStage: 'anonymous' | 'interested' | 'engaged' | 'converting';
  canContinueAsGuest: boolean;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface SessionAnalytics {
  sessionId: string;
  eventType: 'message' | 'auth_prompt' | 'sign_up' | 'booking' | 'conversion';
  eventData?: Record<string, any>;
  timestamp: Date;
}

export interface ConversionMetrics {
  totalVisitors: number;
  totalSignUps: number;
  conversionRate: number;
  averageTimeToConversion: number; // in minutes
  topConversionTriggers: Array<{
    trigger: string;
    count: number;
  }>;
}

export interface EngagementMetrics {
  averageSessionDuration: number; // in minutes
  averageConversationsPerSession: number;
  bounceRate: number; // percentage
  returnUserRate: number; // percentage
  conversationsByStage: {
    anonymous: number;
    interested: number;
    engaged: number;
    converting: number;
  };
}

// ============================================================================
// Privacy & Compliance Types
// ============================================================================

export interface PrivacySettings {
  allowTracking: boolean;
  allowAnalytics: boolean;
  allowPersonalization: boolean;
  consentDate?: Date;
}

export interface DataExportRequest {
  sessionId: string;
  includeConversations?: boolean;
  includeAnalytics?: boolean;
  format: 'json' | 'csv';
}

export interface DataExportResponse {
  success: true;
  data: {
    session: SessionData;
    conversations?: any[];
    analytics?: SessionAnalytics[];
  };
  exportedAt: string;
}

export interface DataDeletionRequest {
  sessionId: string;
  reason?: string;
}

export interface DataDeletionResponse {
  success: true;
  deletedAt: string;
  message: string;
}

// ============================================================================
// Database Schema Types (for future migration)
// ============================================================================

export interface UserSessionsTable {
  session_id: string;
  ip_address_hash: string;
  ip_address_anonymized?: string;
  user_agent?: string;
  is_authenticated: boolean;
  user_id?: string;
  email?: string;
  name?: string;
  conversation_count: number;
  last_activity: Date;
  created_at: Date;
  anonymized_at?: Date;
  country?: string;
}

export interface SessionAnalyticsTable {
  id: number;
  session_id: string;
  event_type: string;
  event_data?: any; // JSONB in Postgres
  created_at: Date;
}

// ============================================================================
// Utility Types
// ============================================================================

export type SessionID = string & { readonly __brand: 'SessionID' };
export type UserID = string & { readonly __brand: 'UserID' };
export type IPAddress = string & { readonly __brand: 'IPAddress' };
export type IPAddressHash = string & { readonly __brand: 'IPAddressHash' };

// ============================================================================
// Type Guards
// ============================================================================

export function isSessionResponse(
  response: SessionAPIResponse
): response is SessionResponse {
  return response.success === true && 'session' in response;
}

export function isSessionErrorResponse(
  response: SessionAPIResponse
): response is SessionErrorResponse {
  return response.success === false;
}

export function isAuthenticatedSession(
  session: SessionData | UserSession
): session is SessionData & { userId: string; email: string; name: string } {
  return session.isAuthenticated === true;
}

export function isAnonymousSession(
  session: SessionData | UserSession
): session is SessionData & { userId: undefined } {
  return session.isAuthenticated === false;
}

// ============================================================================
// Constants
// ============================================================================

export const SESSION_CONSTANTS = {
  /**
   * Time in hours before IP is anonymized
   */
  IP_ANONYMIZATION_HOURS: 24,

  /**
   * Time in days before session is deleted
   */
  SESSION_RETENTION_DAYS: 30,

  /**
   * Maximum sessions to store in memory
   */
  MAX_MEMORY_SESSIONS: 100000,

  /**
   * Auto-refresh interval for stats (milliseconds)
   */
  STATS_REFRESH_INTERVAL: 30000,

  /**
   * Conversation count thresholds for engagement stages
   */
  ENGAGEMENT_THRESHOLDS: {
    ANONYMOUS: 2,
    INTERESTED: 5,
    ENGAGED: 10
  }
} as const;

// ============================================================================
// Error Types
// ============================================================================

export class SessionError extends Error {
  constructor(
    message: string,
    public code: SessionErrorCode,
    public details?: any
  ) {
    super(message);
    this.name = 'SessionError';
  }
}

export enum SessionErrorCode {
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  INVALID_SESSION_ID = 'INVALID_SESSION_ID',
  MISSING_PARAMETERS = 'MISSING_PARAMETERS',
  UPGRADE_FAILED = 'UPGRADE_FAILED',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a typed session ID
 */
export function createSessionId(id: string): SessionID {
  return id as SessionID;
}

/**
 * Create a typed user ID
 */
export function createUserId(id: string): UserID {
  return id as UserID;
}

/**
 * Create a typed IP address
 */
export function createIPAddress(ip: string): IPAddress {
  return ip as IPAddress;
}

/**
 * Create a typed IP hash
 */
export function createIPHash(hash: string): IPAddressHash {
  return hash as IPAddressHash;
}

/**
 * Check if session is within anonymization window
 */
export function shouldAnonymizeSession(session: SessionData): boolean {
  const createdAt = new Date(session.createdAt);
  const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  return hoursSinceCreation >= SESSION_CONSTANTS.IP_ANONYMIZATION_HOURS;
}

/**
 * Check if session should be deleted (30 days old)
 */
export function shouldDeleteSession(session: SessionData): boolean {
  const createdAt = new Date(session.createdAt);
  const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceCreation >= SESSION_CONSTANTS.SESSION_RETENTION_DAYS;
}

/**
 * Calculate session age in hours
 */
export function getSessionAgeHours(session: SessionData): number {
  const createdAt = new Date(session.createdAt);
  return (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
}

/**
 * Calculate time since last activity in minutes
 */
export function getMinutesSinceActivity(session: SessionData): number {
  const lastActivity = new Date(session.lastActivity);
  return (Date.now() - lastActivity.getTime()) / (1000 * 60);
}
