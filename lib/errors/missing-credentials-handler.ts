/**
 * Missing API Credentials Handler
 *
 * Detects missing API credentials and provides:
 * - User-friendly fallback messages
 * - Developer hints in development mode
 * - Graceful feature degradation
 */

export interface CredentialCheck {
  name: string;
  envVar: string;
  required: boolean;
  configured: boolean;
  feature: string;
  userMessage: string;
  devHint: string;
}

/**
 * Check all API credentials
 */
export function checkAllCredentials(): CredentialCheck[] {
  const checks: CredentialCheck[] = [
    {
      name: 'Amadeus API Key',
      envVar: 'AMADEUS_API_KEY',
      required: true,
      configured: !!(process.env.AMADEUS_API_KEY || process.env.NEXT_PUBLIC_AMADEUS_API_KEY),
      feature: 'Flight Search',
      userMessage: 'Flight search is temporarily unavailable. Our team is working on it!',
      devHint: 'Add AMADEUS_API_KEY to your .env.local file. Get your key from https://developers.amadeus.com/',
    },
    {
      name: 'Amadeus API Secret',
      envVar: 'AMADEUS_API_SECRET',
      required: true,
      configured: !!(process.env.AMADEUS_API_SECRET || process.env.NEXT_PUBLIC_AMADEUS_API_SECRET),
      feature: 'Flight Search',
      userMessage: 'Flight search is temporarily unavailable. Our team is working on it!',
      devHint: 'Add AMADEUS_API_SECRET to your .env.local file. Get your secret from https://developers.amadeus.com/',
    },
    {
      name: 'Database URL',
      envVar: 'DATABASE_URL',
      required: false,
      configured: !!process.env.DATABASE_URL,
      feature: 'User Accounts',
      userMessage: 'Account features are currently unavailable. You can still search for flights without signing in.',
      devHint: 'Add DATABASE_URL to your .env.local file. Example: postgresql://user:password@localhost:5432/fly2any',
    },
    {
      name: 'NextAuth Secret',
      envVar: 'NEXTAUTH_SECRET',
      required: false,
      configured: !!process.env.NEXTAUTH_SECRET,
      feature: 'Authentication',
      userMessage: 'Sign in is currently unavailable. You can still search for flights without an account.',
      devHint: 'Add NEXTAUTH_SECRET to your .env.local file. Generate one with: openssl rand -base64 32',
    },
    {
      name: 'Google OAuth Client ID',
      envVar: 'GOOGLE_CLIENT_ID',
      required: false,
      configured: !!process.env.GOOGLE_CLIENT_ID,
      feature: 'Google Sign In',
      userMessage: 'Google sign in is currently unavailable. Try signing in with email instead.',
      devHint: 'Add GOOGLE_CLIENT_ID to your .env.local file. Get it from https://console.cloud.google.com/',
    },
    {
      name: 'Google OAuth Client Secret',
      envVar: 'GOOGLE_CLIENT_SECRET',
      required: false,
      configured: !!process.env.GOOGLE_CLIENT_SECRET,
      feature: 'Google Sign In',
      userMessage: 'Google sign in is currently unavailable. Try signing in with email instead.',
      devHint: 'Add GOOGLE_CLIENT_SECRET to your .env.local file. Get it from https://console.cloud.google.com/',
    },
  ];

  return checks;
}

/**
 * Check if a specific credential is configured
 */
export function isCredentialConfigured(envVar: string): boolean {
  return !!(process.env[envVar] || (process as any).env[`NEXT_PUBLIC_${envVar}`]);
}

/**
 * Get missing credentials
 */
export function getMissingCredentials(): CredentialCheck[] {
  return checkAllCredentials().filter(check => !check.configured);
}

/**
 * Get missing REQUIRED credentials
 */
export function getMissingRequiredCredentials(): CredentialCheck[] {
  return checkAllCredentials().filter(check => check.required && !check.configured);
}

/**
 * Check if all required credentials are configured
 */
export function areRequiredCredentialsConfigured(): boolean {
  return getMissingRequiredCredentials().length === 0;
}

/**
 * Generate user-friendly error message for missing credentials
 */
export function getUserMessage(feature: string): string {
  const checks = checkAllCredentials();
  const relevantCheck = checks.find(check => check.feature === feature && !check.configured);

  if (relevantCheck) {
    return relevantCheck.userMessage;
  }

  return 'This feature is temporarily unavailable. Our team is working on it!';
}

/**
 * Generate developer hint for missing credentials (only in dev mode)
 */
export function getDevHint(feature: string): string | null {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const checks = checkAllCredentials();
  const relevantCheck = checks.find(check => check.feature === feature && !check.configured);

  if (relevantCheck) {
    return relevantCheck.devHint;
  }

  return null;
}

/**
 * Generate configuration status report (for debug API endpoint)
 */
export function getConfigurationReport(): {
  allConfigured: boolean;
  requiredConfigured: boolean;
  missing: CredentialCheck[];
  configured: CredentialCheck[];
} {
  const checks = checkAllCredentials();
  const missing = checks.filter(check => !check.configured);
  const configured = checks.filter(check => check.configured);

  return {
    allConfigured: missing.length === 0,
    requiredConfigured: areRequiredCredentialsConfigured(),
    missing,
    configured,
  };
}

/**
 * Log missing credentials warning (development only)
 */
export function logMissingCredentials(): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const missing = getMissingCredentials();

  if (missing.length === 0) {
    console.log('✅ All credentials configured');
    return;
  }

  console.warn('\n⚠️  Missing API Credentials:\n');

  missing.forEach(check => {
    const icon = check.required ? '❌' : '⚠️';
    const label = check.required ? 'REQUIRED' : 'OPTIONAL';

    console.warn(`${icon} ${check.name} [${label}]`);
    console.warn(`   Feature affected: ${check.feature}`);
    console.warn(`   How to fix: ${check.devHint}`);
    console.warn('');
  });

  if (getMissingRequiredCredentials().length > 0) {
    console.error('❌ Some REQUIRED credentials are missing. The app may not work correctly.\n');
  }
}

/**
 * Create a fallback response for missing credentials
 */
export function createFallbackResponse(feature: string) {
  const userMessage = getUserMessage(feature);
  const devHint = getDevHint(feature);

  return {
    success: false,
    error: 'CredentialsNotConfigured',
    message: userMessage,
    ...(devHint && { devHint }),
  };
}

/**
 * Middleware to check credentials before API call
 */
export function requireCredentials(envVars: string[]): { configured: boolean; response?: any } {
  const missing = envVars.filter(envVar => !isCredentialConfigured(envVar));

  if (missing.length > 0) {
    const checks = checkAllCredentials();
    const missingCheck = checks.find(check => missing.includes(check.envVar));

    if (missingCheck) {
      return {
        configured: false,
        response: {
          error: 'MissingCredentials',
          message: missingCheck.userMessage,
          statusCode: 503,
          ...(process.env.NODE_ENV === 'development' && {
            devHint: missingCheck.devHint,
            missingEnvVars: missing,
          }),
        },
      };
    }
  }

  return { configured: true };
}
