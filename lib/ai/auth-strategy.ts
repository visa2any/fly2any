/**
 * AI Assistant Authentication Strategy
 *
 * Smart user identification system that balances:
 * - User experience (don't ask too early)
 * - Data collection (grow database)
 * - Privacy (respect anonymity when possible)
 * - Security (require auth for sensitive operations)
 */

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
 * Database operations (integrate with your existing DB)
 */
async function findSessionByIP(ipAddress: string): Promise<UserSession | null> {
  // TODO: Implement database query
  // SELECT * FROM user_sessions WHERE ip_address = ? AND created_at > NOW() - INTERVAL 24 HOUR
  return null;
}

async function updateSessionActivity(sessionId: string): Promise<void> {
  // TODO: Implement database update
  // UPDATE user_sessions SET last_activity = NOW() WHERE session_id = ?
}

async function saveSession(session: UserSession): Promise<void> {
  // TODO: Implement database insert
  // INSERT INTO user_sessions (session_id, ip_address, country, ...) VALUES (?, ?, ?, ...)
}

async function getCountryFromIP(ipAddress: string): Promise<string | undefined> {
  // TODO: Use your existing IP geolocation service
  // You mentioned you already have IP tracking implemented
  return undefined;
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
  // Update session with user info
  // UPDATE user_sessions SET is_authenticated = TRUE, user_id = ?, email = ?, name = ? WHERE session_id = ?

  // Migrate conversation history to user account
  // UPDATE conversations SET user_id = ? WHERE session_id = ?

  // Award sign-up bonus (10% discount coupon)
  // INSERT INTO user_coupons (user_id, code, discount, ...) VALUES (?, ?, 10, ...)
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
