/**
 * AI Analytics Shared Types
 *
 * These types are used by both:
 * - Server-side API routes (app/api/ai/analytics/route.ts)
 * - Client-side components (components/admin/AIAnalyticsDashboard.tsx)
 *
 * Extracting types to a shared location ensures they're accessible
 * in all contexts (web SSR, static export, mobile builds).
 */

// ===========================
// EVENT TYPES
// ===========================

export interface AIAnalyticsEvent {
  // Event identification
  eventType:
    | 'chat_opened'
    | 'chat_closed'
    | 'message_sent'
    | 'consultant_routed'
    | 'flight_search_performed'
    | 'auth_prompt_shown'
    | 'auth_prompt_clicked'
    | 'conversion_signup'
    | 'conversion_login'
    | 'conversion_booking'
    | 'session_engaged'
    | 'flight_selected';

  // Session tracking
  sessionId: string;
  timestamp: string;

  // User context (privacy-compliant)
  userId?: string;
  isAuthenticated: boolean;
  userFingerprint?: string; // Anonymized browser fingerprint

  // Event-specific data
  metadata?: {
    // Message tracking
    messageRole?: 'user' | 'assistant';
    messageLength?: number;
    consultantTeam?: string;
    consultantName?: string;

    // Flight search
    flightSearchQuery?: string;
    origin?: string;
    destination?: string;
    resultsCount?: number;
    searchDuration?: number;

    // Auth prompts
    authPromptStage?: 'first_interaction' | 'search_performed' | 'results_viewed' | 'pre_booking';
    authPromptAction?: 'signup' | 'login' | 'dismiss';

    // Conversions
    conversionType?: 'signup' | 'login' | 'booking';
    conversionValue?: number;

    // Session engagement
    sessionDuration?: number;
    messageCount?: number;
    engagementScore?: number;

    // Flight selection
    flightId?: string;
    flightPrice?: number;
  };

  // Geo context (aggregate only)
  country?: string;
  timezone?: string;
}

// ===========================
// STATISTICS TYPES
// ===========================

export interface AIAnalyticsStats {
  // Conversation metrics
  totalConversations: number;
  totalMessages: number;
  avgMessagesPerConversation: number;

  // Consultant routing
  consultantBreakdown: {
    team: string;
    name: string;
    messageCount: number;
    percentage: number;
  }[];

  // Flight searches
  totalFlightSearches: number;
  flightSearchConversionRate: number;
  avgSearchDuration: number;
  popularRoutes: {
    route: string;
    count: number;
  }[];

  // Auth effectiveness
  authPromptStats: {
    totalShown: number;
    totalClicked: number;
    clickThroughRate: number;
    byStage: {
      stage: string;
      shown: number;
      clicked: number;
      ctr: number;
    }[];
  };

  // Conversions
  conversions: {
    totalSignups: number;
    totalLogins: number;
    totalBookings: number;
    conversionRate: number;
    avgConversionValue: number;
  };

  // Engagement
  engagement: {
    avgSessionDuration: number;
    avgEngagementScore: number;
    peakHours: {
      hour: number;
      count: number;
    }[];
  };

  // Top questions
  topQuestions: {
    question: string;
    count: number;
  }[];
}
