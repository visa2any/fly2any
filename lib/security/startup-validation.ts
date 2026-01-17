/**
 * Security Environment Validation
 * 
 * CRITICAL: This module crashes the app if security is misconfigured
 * This is intentional - blocking deployment is better than running insecurely
 */

export function validateSecurityEnvironment(): void {
  const errors: string[] = [];
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

  // 1. NEXTAUTH_SECRET - CRITICAL
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    errors.push('NEXTAUTH_SECRET is not set');
  } else if (secret.length < 32) {
    errors.push(`NEXTAUTH_SECRET must be at least 32 characters (current: ${secret.length})`);
  } else if (secret === 'your-secret-key' || secret === 'change-me' || secret === 'dev-secret') {
    errors.push('NEXTAUTH_SECRET is using a placeholder value');
  }

  // 2. Database connection
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_POSTGRES_URL;
  if (!dbUrl) {
    errors.push('DATABASE_URL, POSTGRES_URL, or SUPABASE_POSTGRES_URL is not set');
  }

  // 3. Production-specific validations
  if (isProduction) {
    // Block test payments in production
    if (process.env.ENABLE_TEST_PAYMENTS === 'true') {
      errors.push('ENABLE_TEST_PAYMENTS cannot be true in production');
    }

    // Require Stripe live key
    if (process.env.STRIPE_SECRET_KEY) {
      if (process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
        errors.push('Cannot use Stripe test key (sk_test_) in production. Use live key (sk_live_)');
      }
    }

    // Require Duffel
    if (!process.env.DUFFEL_ACCESS_TOKEN) {
      errors.push('DUFFEL_ACCESS_TOKEN not set in production');
    }

    // Require Redis for rate limiting
    if (!process.env.UPSTASH_REDIS_REST_URL && !process.env.REDIS_URL) {
      errors.push('UPSTASH_REDIS_REST_URL or REDIS_URL required for rate limiting in production');
    }
  }

  // 4. Google OAuth validation
  if (!process.env.GOOGLE_CLIENT_ID) {
    errors.push('GOOGLE_CLIENT_ID is not set');
  }
  if (!process.env.GOOGLE_CLIENT_SECRET) {
    errors.push('GOOGLE_CLIENT_SECRET is not set');
  }
  if (isProduction && !process.env.NEXTAUTH_URL) {
    errors.push('NEXTAUTH_URL is not set in production');
  }

  // 5. Redis validation (required for rate limiting and session revocation)
  if (!process.env.UPSTASH_REDIS_REST_URL && !process.env.UPSTASH_REDIS_REST_TOKEN && !process.env.REDIS_URL) {
    errors.push('Redis configuration missing. Rate limiting and session revocation will not work.');
  }

  // Crash if any errors
  if (errors.length > 0) {
    console.error('\n╔══════════════════════════════════════════════════════════╗');
    console.error('║         CRITICAL SECURITY CONFIGURATION ERRORS             ║');
    console.error('╚══════════════════════════════════════════════════════════╝\n');
    
    errors.forEach((err, i) => {
      console.error(`  ${i + 1}. ${err}`);
    });
    
    console.error('\n  Application CANNOT start without fixing these issues.');
    console.error('  This is intentional - blocking deployment is better than running insecurely.\n');
    throw new Error('Security validation failed: ' + errors.join('; '));
  }

  console.log('✅ Security environment validation passed');
}

// Auto-validate on module import in production
if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
  validateSecurityEnvironment();
}