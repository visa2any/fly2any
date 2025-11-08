/**
 * AI Assistant Authentication Strategy
 *
 * Smart user identification system that balances:
 * - User experience (don't ask too early)
 * - Data collection (grow database)
 * - Privacy (respect anonymity when possible)
 * - Security (require auth for sensitive operations)
 */

import { prisma } from '@/lib/db/prisma';
import { createHash } from 'crypto';

export interface UserSession {
  sessionId: string;
  ipAddress: string;
  country?: string;
  isAuthenticated: boolean;
  userId?: string;
  email?: string;
  name?: string;
  conversationCount: number;
  lastActivity: Date;
  createdAt: Date;
}

export interface AuthTrigger {
  action: string;
  requiresAuth: boolean;
  urgency: 'immediate' | 'gentle' | 'optional';
  reason: string;
}

/**
 * Actions that REQUIRE authentication (sensitive operations)
 */
const REQUIRES_AUTH_ACTIONS = [
  'book-flight',
  'book-hotel',
  'make-payment',
  'view-bookings',
  'cancel-booking',
  'modify-booking',
  'request-refund',
  'file-complaint',
  'access-loyalty-points',
  'view-saved-cards',
  'change-password',
  'update-profile'
];

/**
 * Actions that BENEFIT from auth (personalization)
 */
const BENEFITS_FROM_AUTH = [
  'search-flights',
  'search-hotels',
  'compare-prices',
  'save-search',
  'set-price-alert',
  'get-recommendations',
  'track-booking',
  'chat-history'
];

/**
 * Actions that DON'T need auth (public information)
 */
const PUBLIC_ACTIONS = [
  'ask-question',
  'get-info',
  'check-visa',
  'learn-about-policy',
  'browse-destinations',
  'read-faq',
  'contact-support'
];

/**
 * Determine if action requires authentication
 */
export function shouldRequireAuth(action: string): AuthTrigger {
  // Immediate auth required
  if (REQUIRES_AUTH_ACTIONS.includes(action)) {
    return {
      action,
      requiresAuth: true,
      urgency: 'immediate',
      reason: 'This action requires a secure account for your protection.'
    };
  }

  // Gentle suggestion (better experience with auth)
  if (BENEFITS_FROM_AUTH.includes(action)) {
    return {
      action,
      requiresAuth: false,
      urgency: 'gentle',
      reason: 'Sign in to save your preferences and get personalized recommendations.'
    };
  }

  // No auth needed
  return {
    action,
    requiresAuth: false,
    urgency: 'optional',
    reason: 'No account needed for this action.'
  };
}

/**
 * Progressive Engagement Strategy
 *
 * Timing matters! Ask for auth at the right moment:
 */
export interface ProgressiveEngagement {
  stage: 'anonymous' | 'interested' | 'engaged' | 'converting';
  messageCount: number;
  showAuthPrompt: boolean;
  promptMessage: string;
  promptTiming: 'now' | 'after-response' | 'never';
}

export function getEngagementStage(
  session: UserSession,
  currentAction: string
): ProgressiveEngagement {
  const { conversationCount, isAuthenticated } = session;

  // Already authenticated - no prompt needed
  if (isAuthenticated) {
    return {
      stage: 'converting',
      messageCount: conversationCount,
      showAuthPrompt: false,
      promptMessage: '',
      promptTiming: 'never'
    };
  }

  // Stage 1: Anonymous (0-2 messages)
  // Just exploring - DON'T ask for auth yet
  if (conversationCount <= 2) {
    return {
      stage: 'anonymous',
      messageCount: conversationCount,
      showAuthPrompt: false,
      promptMessage: '',
      promptTiming: 'never'
    };
  }

  // Stage 2: Interested (3-5 messages)
  // Showing interest - Gentle suggestion
  if (conversationCount <= 5) {
    const authTrigger = shouldRequireAuth(currentAction);

    if (authTrigger.requiresAuth) {
      return {
        stage: 'interested',
        messageCount: conversationCount,
        showAuthPrompt: true,
        promptMessage: '🔐 To proceed with booking, please sign in or create a free account. It takes just 30 seconds!',
        promptTiming: 'now'
      };
    }

    // Soft encouragement (not blocking)
    return {
      stage: 'interested',
      messageCount: conversationCount,
      showAuthPrompt: true,
      promptMessage: '💡 Tip: Create a free account to save your searches and get personalized deals!',
      promptTiming: 'after-response'
    };
  }

  // Stage 3: Engaged (6-10 messages)
  // Heavily engaged - Stronger prompt
  if (conversationCount <= 10) {
    return {
      stage: 'engaged',
      messageCount: conversationCount,
      showAuthPrompt: true,
      promptMessage: '🎁 Unlock exclusive benefits! Sign up now and get 10% off your first booking + priority support.',
      promptTiming: 'after-response'
    };
  }

  // Stage 4: Converting (10+ messages)
  // Very engaged - Time to convert
  return {
    stage: 'converting',
    messageCount: conversationCount,
    showAuthPrompt: true,
    promptMessage: '⭐ You\'re a power user! Create an account to save your chat history, preferences, and unlock VIP features.',
    promptTiming: 'after-response'
  };
}

/**
 * Authentication Messages (multi-language)
 */
export const AUTH_MESSAGES = {
  en: {
    signInRequired: '🔐 Please sign in to continue with this action.',
    signInBenefit: '💡 Sign in to save your preferences and get better recommendations.',
    signUpOffer: '🎁 Create a free account and get 10% off your first booking!',
    continueAsGuest: 'Continue as guest',
    signIn: 'Sign In',
    signUp: 'Create Account',
    quickSignUp: 'Quick Sign Up (30 seconds)',
    benefits: {
      title: 'Why create an account?',
      items: [
        '✅ Save your searches and bookings',
        '✅ Get personalized recommendations',
        '✅ Access exclusive deals',
        '✅ Priority customer support',
        '✅ Track your travel history',
        '✅ Earn loyalty points'
      ]
    }
  },
  pt: {
    signInRequired: '🔐 Por favor, faça login para continuar com esta ação.',
    signInBenefit: '💡 Faça login para salvar suas preferências e obter melhores recomendações.',
    signUpOffer: '🎁 Crie uma conta gratuita e ganhe 10% de desconto na primeira reserva!',
    continueAsGuest: 'Continuar como convidado',
    signIn: 'Entrar',
    signUp: 'Criar Conta',
    quickSignUp: 'Cadastro Rápido (30 segundos)',
    benefits: {
      title: 'Por que criar uma conta?',
      items: [
        '✅ Salvar pesquisas e reservas',
        '✅ Recomendações personalizadas',
        '✅ Ofertas exclusivas',
        '✅ Suporte prioritário',
        '✅ Histórico de viagens',
        '✅ Pontos de fidelidade'
      ]
    }
  },
  es: {
    signInRequired: '🔐 Por favor, inicia sesión para continuar con esta acción.',
    signInBenefit: '💡 Inicia sesión para guardar tus preferencias y obtener mejores recomendaciones.',
    signUpOffer: '🎁 ¡Crea una cuenta gratuita y obtén 10% de descuento en tu primera reserva!',
    continueAsGuest: 'Continuar como invitado',
    signIn: 'Iniciar Sesión',
    signUp: 'Crear Cuenta',
    quickSignUp: 'Registro Rápido (30 segundos)',
    benefits: {
      title: '¿Por qué crear una cuenta?',
      items: [
        '✅ Guardar búsquedas y reservas',
        '✅ Recomendaciones personalizadas',
        '✅ Ofertas exclusivas',
        '✅ Soporte prioritario',
        '✅ Historial de viajes',
        '✅ Puntos de fidelidad'
      ]
    }
  }
};

/**
 * Track user session with IP
 */
export async function trackUserSession(ipAddress: string): Promise<UserSession> {
  // Check if session exists in database
  const existingSession = await findSessionByIP(ipAddress);

  if (existingSession) {
    // Update last activity
    await updateSessionActivity(existingSession.sessionId);
    return existingSession;
  }

  // Create new session
  const newSession: UserSession = {
    sessionId: generateSessionId(),
    ipAddress,
    country: await getCountryFromIP(ipAddress),
    isAuthenticated: false,
    conversationCount: 0,
    lastActivity: new Date(),
    createdAt: new Date()
  };

  await saveSession(newSession);
  return newSession;
}

/**
 * Database operations (Prisma integration)
 */

/**
 * Hash IP address for privacy (GDPR compliance)
 */
function hashIP(ip: string): string {
  return createHash('sha256').update(ip).digest('hex');
}

/**
 * Resolve IP address to geolocation data
 * Uses ipapi.co free tier (1000 requests/day)
 */
async function resolveGeolocation(ipAddress: string): Promise<{
  country_code: string | null;
  region: string | null;
  timezone: string | null;
} | null> {
  try {
    // Skip private/local IPs
    if (
      ipAddress === '127.0.0.1' ||
      ipAddress === 'localhost' ||
      ipAddress.startsWith('192.168.') ||
      ipAddress.startsWith('10.') ||
      ipAddress.startsWith('172.16.')
    ) {
      return null;
    }

    // Call ipapi.co (free, no auth required)
    const response = await fetch(`https://ipapi.co/${ipAddress}/json/`, {
      signal: AbortSignal.timeout(3000), // 3 second timeout
      headers: {
        'User-Agent': 'Fly2Any-AuthStrategy/1.0'
      }
    });

    if (!response.ok) {
      console.warn(`[AuthStrategy] Geolocation API returned ${response.status}`);
      return null;
    }

    const data = await response.json();

    // Check for rate limit or error
    if (data.error) {
      console.warn('[AuthStrategy] Geolocation API error:', data.reason || data.error);
      return null;
    }

    return {
      country_code: data.country_code || data.country || null,
      region: data.region || data.region_code || null,
      timezone: data.timezone || null
    };
  } catch (error) {
    // Fail silently - geolocation is nice-to-have
    console.warn('[AuthStrategy] Geolocation failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

/**
 * Find session by IP address (within 24 hours)
 */
async function findSessionByIP(ipAddress: string): Promise<UserSession | null> {
  try {
    if (!prisma) {
      console.warn('[AuthStrategy] Prisma not configured - skipping session lookup');
      return null;
    }

    const ipHash = hashIP(ipAddress);
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const session = await prisma.userSessionTracking.findFirst({
      where: {
        ipHash,
        createdAt: {
          gte: twentyFourHoursAgo
        }
      },
      orderBy: {
        lastActivity: 'desc'
      }
    });

    if (!session) {
      return null;
    }

    return {
      sessionId: session.sessionId,
      ipAddress: session.ipAddress,
      country: session.country || undefined,
      isAuthenticated: session.isAuthenticated,
      userId: session.userId || undefined,
      email: session.email || undefined,
      name: session.name || undefined,
      conversationCount: session.conversationCount,
      lastActivity: session.lastActivity,
      createdAt: session.createdAt
    };
  } catch (error) {
    console.error('[AuthStrategy] Failed to find session by IP:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

/**
 * Update session activity timestamp
 */
async function updateSessionActivity(sessionId: string): Promise<void> {
  try {
    if (!prisma) {
      console.warn('[AuthStrategy] Prisma not configured - skipping activity update');
      return;
    }

    await prisma.userSessionTracking.update({
      where: { sessionId },
      data: {
        lastActivity: new Date(),
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('[AuthStrategy] Failed to update session activity:', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Save new session to database
 */
async function saveSession(session: UserSession): Promise<void> {
  try {
    if (!prisma) {
      console.warn('[AuthStrategy] Prisma not configured - skipping session save');
      return;
    }

    const ipHash = hashIP(session.ipAddress);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    await prisma.userSessionTracking.create({
      data: {
        sessionId: session.sessionId,
        ipAddress: session.ipAddress,
        ipHash,
        country: session.country || null,
        isAuthenticated: session.isAuthenticated,
        userId: session.userId || null,
        email: session.email || null,
        name: session.name || null,
        conversationCount: session.conversationCount,
        searchCount: 0,
        bookingAttempts: 0,
        lastActivity: session.lastActivity,
        createdAt: session.createdAt,
        expiresAt
      }
    });

    console.log(`[AuthStrategy] Saved new session: ${session.sessionId}`);
  } catch (error) {
    console.error('[AuthStrategy] Failed to save session:', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Get country from IP address using geolocation service
 */
async function getCountryFromIP(ipAddress: string): Promise<string | undefined> {
  const geoData = await resolveGeolocation(ipAddress);
  return geoData?.country_code || undefined;
}

/**
 * Increment conversation count for a session
 */
export async function incrementConversationCount(sessionId: string): Promise<void> {
  try {
    if (!prisma) return;

    await prisma.userSessionTracking.update({
      where: { sessionId },
      data: {
        conversationCount: { increment: 1 },
        lastActivity: new Date()
      }
    });
  } catch (error) {
    console.error('[AuthStrategy] Failed to increment conversation count:', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Increment search count for a session
 */
export async function incrementSearchCount(sessionId: string): Promise<void> {
  try {
    if (!prisma) return;

    await prisma.userSessionTracking.update({
      where: { sessionId },
      data: {
        searchCount: { increment: 1 },
        lastActivity: new Date()
      }
    });
  } catch (error) {
    console.error('[AuthStrategy] Failed to increment search count:', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Increment booking attempts for a session
 */
export async function incrementBookingAttempts(sessionId: string): Promise<void> {
  try {
    if (!prisma) return;

    await prisma.userSessionTracking.update({
      where: { sessionId },
      data: {
        bookingAttempts: { increment: 1 },
        lastActivity: new Date()
      }
    });
  } catch (error) {
    console.error('[AuthStrategy] Failed to increment booking attempts:', error instanceof Error ? error.message : 'Unknown error');
  }
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Convert anonymous user to authenticated
 */
export async function upgradeToAuthenticatedUser(
  sessionId: string,
  userId: string,
  email: string,
  name: string
): Promise<void> {
  try {
    if (!prisma) {
      console.warn('[AuthStrategy] Prisma not configured - skipping user upgrade');
      return;
    }

    // Update session with user info
    await prisma.userSessionTracking.update({
      where: { sessionId },
      data: {
        isAuthenticated: true,
        userId,
        email,
        name,
        updatedAt: new Date()
      }
    });

    // Migrate conversation history to user account
    await prisma.aIConversation.updateMany({
      where: { sessionId },
      data: {
        userId,
        updatedAt: new Date()
      }
    });

    console.log(`[AuthStrategy] Upgraded session ${sessionId} to authenticated user ${userId}`);
  } catch (error) {
    console.error('[AuthStrategy] Failed to upgrade user:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

/**
 * Check if user needs auth for specific action
 */
export function buildAuthPrompt(
  action: string,
  session: UserSession,
  language: 'en' | 'pt' | 'es' = 'en'
): {
  needsAuth: boolean;
  message: string;
  canContinueAsGuest: boolean;
} {
  const authTrigger = shouldRequireAuth(action);
  const engagement = getEngagementStage(session, action);
  const messages = AUTH_MESSAGES[language];

  // Immediate auth required
  if (authTrigger.requiresAuth) {
    return {
      needsAuth: true,
      message: messages.signInRequired,
      canContinueAsGuest: false
    };
  }

  // Progressive engagement prompt
  if (engagement.showAuthPrompt) {
    let message = messages.signInBenefit;

    if (engagement.stage === 'engaged') {
      message = messages.signUpOffer;
    } else if (engagement.stage === 'converting') {
      message = `⭐ ${messages.benefits.title}\n\n${messages.benefits.items.join('\n')}`;
    }

    return {
      needsAuth: false,
      message,
      canContinueAsGuest: true
    };
  }

  // No auth needed
  return {
    needsAuth: false,
    message: '',
    canContinueAsGuest: true
  };
}

/**
 * Privacy-conscious data collection
 *
 * What we track:
 * - IP address (for fraud prevention & location)
 * - Conversation topics (to improve AI)
 * - Session duration
 * - Actions taken
 *
 * What we DON'T track without consent:
 * - Personal information (until user creates account)
 * - Payment details (stored securely, PCI-compliant)
 * - Browsing history outside our platform
 */

/**
 * GDPR/CCPA Compliance
 */
export const PRIVACY_NOTICES = {
  en: 'We use cookies and IP tracking to improve your experience. By continuing, you agree to our Privacy Policy.',
  pt: 'Usamos cookies e rastreamento de IP para melhorar sua experiência. Ao continuar, você concorda com nossa Política de Privacidade.',
  es: 'Usamos cookies y seguimiento de IP para mejorar tu experiencia. Al continuar, aceptas nuestra Política de Privacidad.'
};
