import { NextRequest, NextResponse } from 'next/server';
import { sql, isDatabaseAvailable } from '@/lib/db/connection';
import { createHash } from 'crypto';

// ===========================
// TYPE DEFINITIONS
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

// ===========================
// HELPER FUNCTIONS
// ===========================

/**
 * Generate anonymized browser fingerprint
 */
function generateFingerprint(userAgent?: string, accept?: string): string {
  if (!userAgent) return 'unknown';
  const data = `${userAgent}|${accept || 'unknown'}`;
  return createHash('md5').update(data).digest('hex').substring(0, 32);
}

/**
 * Validate event schema
 */
function validateEvent(event: any): event is AIAnalyticsEvent {
  if (!event.eventType || !event.sessionId || !event.timestamp) {
    return false;
  }

  const validEventTypes = [
    'chat_opened',
    'chat_closed',
    'message_sent',
    'consultant_routed',
    'flight_search_performed',
    'auth_prompt_shown',
    'auth_prompt_clicked',
    'conversion_signup',
    'conversion_login',
    'conversion_booking',
    'session_engaged',
    'flight_selected'
  ];

  return validEventTypes.includes(event.eventType);
}

// ===========================
// API HANDLERS
// ===========================

/**
 * POST /api/ai/analytics
 * Track AI assistant analytics events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { events } = body;

    // Validate input
    if (!events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Missing or invalid events array' },
        { status: 400 }
      );
    }

    // Validate each event
    const validEvents = events.filter(validateEvent);

    if (validEvents.length === 0) {
      return NextResponse.json(
        { error: 'No valid events provided' },
        { status: 400 }
      );
    }

    // Add fingerprint if not provided
    const userAgent = request.headers.get('user-agent') || undefined;
    const accept = request.headers.get('accept') || undefined;
    const fingerprint = generateFingerprint(userAgent, accept);

    // Store events in database if available
    if (isDatabaseAvailable() && sql) {
      const insertPromises = validEvents.map(async (event) => {
        try {
          // TypeScript null check - sql is already checked above but TS doesn't narrow properly
          if (!sql) return;

          await sql`
            INSERT INTO ai_analytics_events (
              event_type,
              session_id,
              timestamp,
              user_id,
              is_authenticated,
              user_fingerprint,
              message_role,
              message_length,
              consultant_team,
              consultant_name,
              flight_search_query,
              origin,
              destination,
              results_count,
              search_duration,
              auth_prompt_stage,
              auth_prompt_action,
              conversion_type,
              conversion_value,
              session_duration,
              message_count,
              engagement_score,
              flight_id,
              flight_price,
              country,
              timezone
            ) VALUES (
              ${event.eventType},
              ${event.sessionId},
              ${event.timestamp},
              ${event.userId || null},
              ${event.isAuthenticated},
              ${event.userFingerprint || fingerprint},
              ${event.metadata?.messageRole || null},
              ${event.metadata?.messageLength || null},
              ${event.metadata?.consultantTeam || null},
              ${event.metadata?.consultantName || null},
              ${event.metadata?.flightSearchQuery || null},
              ${event.metadata?.origin || null},
              ${event.metadata?.destination || null},
              ${event.metadata?.resultsCount || null},
              ${event.metadata?.searchDuration || null},
              ${event.metadata?.authPromptStage || null},
              ${event.metadata?.authPromptAction || null},
              ${event.metadata?.conversionType || null},
              ${event.metadata?.conversionValue || null},
              ${event.metadata?.sessionDuration || null},
              ${event.metadata?.messageCount || null},
              ${event.metadata?.engagementScore || null},
              ${event.metadata?.flightId || null},
              ${event.metadata?.flightPrice || null},
              ${event.country || null},
              ${event.timezone || null}
            )
          `;
        } catch (error) {
          console.error('Error inserting AI analytics event:', error);
          // Continue processing other events
        }
      });

      await Promise.all(insertPromises);

      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 Tracked ${validEvents.length} AI analytics events to database`);
      }
    } else {
      // Log events in development mode when DB not available
      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 [DEMO] Received ${validEvents.length} AI analytics events:`);
        validEvents.forEach((event: AIAnalyticsEvent) => {
          console.log(`   ${event.eventType} | Session: ${event.sessionId.substring(0, 8)}...`);
        });
      }
    }

    return NextResponse.json({
      success: true,
      tracked: validEvents.length,
      skipped: events.length - validEvents.length,
    });

  } catch (error) {
    console.error('AI analytics tracking error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track events',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/analytics
 * Retrieve AI assistant analytics statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d

    // Calculate date range
    const daysMap: { [key: string]: number } = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
    };
    const days = daysMap[period] || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    if (!isDatabaseAvailable() || !sql) {
      // Return demo data when database not available
      const demoStats: AIAnalyticsStats = {
        totalConversations: 1247,
        totalMessages: 5632,
        avgMessagesPerConversation: 4.5,
        consultantBreakdown: [
          { team: 'flight-operations', name: 'Captain James Rivera', messageCount: 2341, percentage: 41.6 },
          { team: 'customer-service', name: 'Lisa Anderson', messageCount: 1689, percentage: 30.0 },
          { team: 'hotel-accommodations', name: 'Sofia Martinez', messageCount: 892, percentage: 15.8 },
          { team: 'payment-billing', name: 'Marcus Chen', messageCount: 710, percentage: 12.6 },
        ],
        totalFlightSearches: 847,
        flightSearchConversionRate: 12.5,
        avgSearchDuration: 2347,
        popularRoutes: [
          { route: 'JFK-LAX', count: 234 },
          { route: 'LHR-DXB', count: 187 },
          { route: 'SFO-NRT', count: 145 },
          { route: 'MIA-LIS', count: 123 },
          { route: 'ORD-CDG', count: 98 },
        ],
        authPromptStats: {
          totalShown: 523,
          totalClicked: 187,
          clickThroughRate: 35.8,
          byStage: [
            { stage: 'first_interaction', shown: 312, clicked: 89, ctr: 28.5 },
            { stage: 'search_performed', shown: 145, clicked: 67, ctr: 46.2 },
            { stage: 'results_viewed', shown: 52, clicked: 26, ctr: 50.0 },
            { stage: 'pre_booking', shown: 14, clicked: 5, ctr: 35.7 },
          ],
        },
        conversions: {
          totalSignups: 134,
          totalLogins: 276,
          totalBookings: 106,
          conversionRate: 8.5,
          avgConversionValue: 542.34,
        },
        engagement: {
          avgSessionDuration: 247,
          avgEngagementScore: 7.8,
          peakHours: [
            { hour: 14, count: 234 },
            { hour: 15, count: 267 },
            { hour: 16, count: 289 },
            { hour: 17, count: 198 },
            { hour: 18, count: 156 },
          ],
        },
        topQuestions: [
          { question: 'Flight from NYC to Dubai', count: 87 },
          { question: 'Cheap flights to Europe', count: 65 },
          { question: 'Best hotel deals', count: 54 },
          { question: 'Payment methods', count: 43 },
          { question: 'Cancel booking policy', count: 38 },
        ],
      };

      return NextResponse.json({
        success: true,
        period,
        demoMode: true,
        stats: demoStats,
      });
    }

    // Fetch real analytics from database
    const stats: AIAnalyticsStats = {
      totalConversations: 0,
      totalMessages: 0,
      avgMessagesPerConversation: 0,
      consultantBreakdown: [],
      totalFlightSearches: 0,
      flightSearchConversionRate: 0,
      avgSearchDuration: 0,
      popularRoutes: [],
      authPromptStats: {
        totalShown: 0,
        totalClicked: 0,
        clickThroughRate: 0,
        byStage: [],
      },
      conversions: {
        totalSignups: 0,
        totalLogins: 0,
        totalBookings: 0,
        conversionRate: 0,
        avgConversionValue: 0,
      },
      engagement: {
        avgSessionDuration: 0,
        avgEngagementScore: 0,
        peakHours: [],
      },
      topQuestions: [],
    };

    // Query: Total conversations and messages
    const conversationStats = await sql`
      SELECT
        COUNT(DISTINCT session_id) as total_conversations,
        COUNT(*) FILTER (WHERE event_type = 'message_sent') as total_messages
      FROM ai_analytics_events
      WHERE timestamp >= ${startDate.toISOString()}
    `;
    stats.totalConversations = Number(conversationStats[0]?.total_conversations || 0);
    stats.totalMessages = Number(conversationStats[0]?.total_messages || 0);
    stats.avgMessagesPerConversation = stats.totalConversations > 0
      ? stats.totalMessages / stats.totalConversations
      : 0;

    // Query: Consultant breakdown
    const consultantStats = await sql`
      SELECT
        consultant_team as team,
        consultant_name as name,
        COUNT(*) as message_count
      FROM ai_analytics_events
      WHERE event_type = 'consultant_routed'
        AND timestamp >= ${startDate.toISOString()}
        AND consultant_team IS NOT NULL
      GROUP BY consultant_team, consultant_name
      ORDER BY message_count DESC
    `;
    const totalConsultantMessages = consultantStats.reduce((sum: number, row: any) => sum + Number(row.message_count), 0);
    stats.consultantBreakdown = consultantStats.map((row: any) => ({
      team: row.team,
      name: row.name,
      messageCount: Number(row.message_count),
      percentage: totalConsultantMessages > 0
        ? (Number(row.message_count) / totalConsultantMessages) * 100
        : 0,
    }));

    // Query: Flight searches
    const flightSearchStats = await sql`
      SELECT
        COUNT(*) as total_searches,
        AVG(search_duration) as avg_duration,
        COUNT(*) FILTER (WHERE event_type = 'conversion_booking') as bookings
      FROM ai_analytics_events
      WHERE event_type = 'flight_search_performed'
        AND timestamp >= ${startDate.toISOString()}
    `;
    stats.totalFlightSearches = Number(flightSearchStats[0]?.total_searches || 0);
    stats.avgSearchDuration = Number(flightSearchStats[0]?.avg_duration || 0);
    const bookings = Number(flightSearchStats[0]?.bookings || 0);
    stats.flightSearchConversionRate = stats.totalFlightSearches > 0
      ? (bookings / stats.totalFlightSearches) * 100
      : 0;

    // Query: Popular routes
    const popularRoutes = await sql`
      SELECT
        CONCAT(origin, '-', destination) as route,
        COUNT(*) as count
      FROM ai_analytics_events
      WHERE event_type = 'flight_search_performed'
        AND timestamp >= ${startDate.toISOString()}
        AND origin IS NOT NULL
        AND destination IS NOT NULL
      GROUP BY origin, destination
      ORDER BY count DESC
      LIMIT 10
    `;
    stats.popularRoutes = popularRoutes.map((row: any) => ({
      route: row.route,
      count: Number(row.count),
    }));

    // Query: Auth prompt stats
    const authPromptStats = await sql`
      SELECT
        COUNT(*) FILTER (WHERE event_type = 'auth_prompt_shown') as total_shown,
        COUNT(*) FILTER (WHERE event_type = 'auth_prompt_clicked') as total_clicked
      FROM ai_analytics_events
      WHERE timestamp >= ${startDate.toISOString()}
    `;
    stats.authPromptStats.totalShown = Number(authPromptStats[0]?.total_shown || 0);
    stats.authPromptStats.totalClicked = Number(authPromptStats[0]?.total_clicked || 0);
    stats.authPromptStats.clickThroughRate = stats.authPromptStats.totalShown > 0
      ? (stats.authPromptStats.totalClicked / stats.authPromptStats.totalShown) * 100
      : 0;

    // Query: Auth prompt by stage
    const authByStage = await sql`
      SELECT
        auth_prompt_stage as stage,
        COUNT(*) FILTER (WHERE event_type = 'auth_prompt_shown') as shown,
        COUNT(*) FILTER (WHERE event_type = 'auth_prompt_clicked') as clicked
      FROM ai_analytics_events
      WHERE timestamp >= ${startDate.toISOString()}
        AND auth_prompt_stage IS NOT NULL
      GROUP BY auth_prompt_stage
    `;
    stats.authPromptStats.byStage = authByStage.map((row: any) => {
      const shown = Number(row.shown);
      const clicked = Number(row.clicked);
      return {
        stage: row.stage,
        shown,
        clicked,
        ctr: shown > 0 ? (clicked / shown) * 100 : 0,
      };
    });

    // Query: Conversions
    const conversionStats = await sql`
      SELECT
        COUNT(*) FILTER (WHERE conversion_type = 'signup') as total_signups,
        COUNT(*) FILTER (WHERE conversion_type = 'login') as total_logins,
        COUNT(*) FILTER (WHERE conversion_type = 'booking') as total_bookings,
        AVG(conversion_value) FILTER (WHERE conversion_value IS NOT NULL) as avg_value
      FROM ai_analytics_events
      WHERE event_type IN ('conversion_signup', 'conversion_login', 'conversion_booking')
        AND timestamp >= ${startDate.toISOString()}
    `;
    stats.conversions.totalSignups = Number(conversionStats[0]?.total_signups || 0);
    stats.conversions.totalLogins = Number(conversionStats[0]?.total_logins || 0);
    stats.conversions.totalBookings = Number(conversionStats[0]?.total_bookings || 0);
    stats.conversions.avgConversionValue = Number(conversionStats[0]?.avg_value || 0);
    const totalConversions = stats.conversions.totalSignups + stats.conversions.totalLogins + stats.conversions.totalBookings;
    stats.conversions.conversionRate = stats.totalConversations > 0
      ? (totalConversions / stats.totalConversations) * 100
      : 0;

    // Query: Engagement
    const engagementStats = await sql`
      SELECT
        AVG(session_duration) as avg_duration,
        AVG(engagement_score) as avg_score
      FROM ai_analytics_events
      WHERE event_type = 'session_engaged'
        AND timestamp >= ${startDate.toISOString()}
    `;
    stats.engagement.avgSessionDuration = Number(engagementStats[0]?.avg_duration || 0);
    stats.engagement.avgEngagementScore = Number(engagementStats[0]?.avg_score || 0);

    // Query: Peak hours
    const peakHours = await sql`
      SELECT
        EXTRACT(HOUR FROM timestamp::timestamp) as hour,
        COUNT(*) as count
      FROM ai_analytics_events
      WHERE event_type = 'chat_opened'
        AND timestamp >= ${startDate.toISOString()}
      GROUP BY hour
      ORDER BY count DESC
      LIMIT 5
    `;
    stats.engagement.peakHours = peakHours.map((row: any) => ({
      hour: Number(row.hour),
      count: Number(row.count),
    }));

    // Query: Top questions (from user messages)
    const topQuestions = await sql`
      SELECT
        flight_search_query as question,
        COUNT(*) as count
      FROM ai_analytics_events
      WHERE event_type = 'message_sent'
        AND message_role = 'user'
        AND flight_search_query IS NOT NULL
        AND timestamp >= ${startDate.toISOString()}
      GROUP BY flight_search_query
      ORDER BY count DESC
      LIMIT 10
    `;
    stats.topQuestions = topQuestions.map((row: any) => ({
      question: row.question,
      count: Number(row.count),
    }));

    return NextResponse.json({
      success: true,
      period,
      demoMode: false,
      stats,
    });

  } catch (error) {
    console.error('AI analytics retrieval error:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
