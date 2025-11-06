/**
 * Environment Variable Validation
 *
 * Validates all required and optional environment variables at startup
 * Prevents deployment with misconfigured credentials
 */

export interface EnvVarConfig {
  name: string;
  required: boolean;
  description: string;
  example?: string;
  validator?: (value: string) => boolean;
}

// Core required variables (application cannot function without these)
export const REQUIRED_ENV_VARS: EnvVarConfig[] = [
  {
    name: 'AMADEUS_API_KEY',
    required: true,
    description: 'Amadeus API key for flight search',
    example: 'abcd1234efgh5678',
  },
  {
    name: 'AMADEUS_API_SECRET',
    required: true,
    description: 'Amadeus API secret',
    example: 'supersecretkey123',
  },
];

// Optional but strongly recommended for production
export const RECOMMENDED_ENV_VARS: EnvVarConfig[] = [
  // Payment Processing
  {
    name: 'STRIPE_SECRET_KEY',
    required: false,
    description: 'Stripe secret key for payment processing',
    example: 'sk_test_...',
    validator: (val) => val.startsWith('sk_test_') || val.startsWith('sk_live_'),
  },
  {
    name: 'NEXT_PUBLIC_STRIPE_PUBLIC_KEY',
    required: false,
    description: 'Stripe publishable key (client-side)',
    example: 'pk_test_...',
    validator: (val) => val.startsWith('pk_test_') || val.startsWith('pk_live_'),
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    required: false,
    description: 'Stripe webhook signature verification secret',
    example: 'whsec_...',
    validator: (val) => val.startsWith('whsec_'),
  },

  // Flight Booking
  {
    name: 'DUFFEL_ACCESS_TOKEN',
    required: false,
    description: 'Duffel API token for flight booking',
    example: 'duffel_test_...',
    validator: (val) => val.startsWith('duffel_test_') || val.startsWith('duffel_live_'),
  },

  // Database
  {
    name: 'DATABASE_URL',
    required: false,
    description: 'PostgreSQL connection string',
    example: 'postgresql://user:pass@host:5432/dbname',
    validator: (val) => val.startsWith('postgres://') || val.startsWith('postgresql://'),
  },

  // Authentication
  {
    name: 'NEXTAUTH_SECRET',
    required: false,
    description: 'NextAuth.js secret for session encryption',
    example: '<generate with: openssl rand -base64 32>',
    validator: (val) => val.length >= 32,
  },
  {
    name: 'NEXTAUTH_URL',
    required: false,
    description: 'NextAuth.js URL (production domain)',
    example: 'https://www.fly2any.com',
    validator: (val) => val.startsWith('http://') || val.startsWith('https://'),
  },

  // Error Monitoring
  {
    name: 'NEXT_PUBLIC_SENTRY_DSN',
    required: false,
    description: 'Sentry Data Source Name for error tracking',
    example: 'https://...@sentry.io/...',
    validator: (val) => val.startsWith('https://') && val.includes('sentry.io'),
  },
  {
    name: 'NEXT_PUBLIC_SENTRY_ENVIRONMENT',
    required: false,
    description: 'Sentry environment (development, staging, production)',
    example: 'production',
  },
  {
    name: 'SENTRY_ORG',
    required: false,
    description: 'Sentry organization slug',
    example: 'fly2any',
  },
  {
    name: 'SENTRY_PROJECT',
    required: false,
    description: 'Sentry project slug',
    example: 'fly2any-web',
  },
  {
    name: 'SENTRY_AUTH_TOKEN',
    required: false,
    description: 'Sentry auth token for source maps upload',
    example: 'sntrys_...',
  },

  // Caching
  {
    name: 'UPSTASH_REDIS_REST_URL',
    required: false,
    description: 'Upstash Redis REST URL for caching',
    example: 'https://your-redis.upstash.io',
    validator: (val) => val.startsWith('https://'),
  },
  {
    name: 'UPSTASH_REDIS_REST_TOKEN',
    required: false,
    description: 'Upstash Redis REST token',
    example: 'AbCd1234...',
  },

  // Email Services
  {
    name: 'GMAIL_EMAIL',
    required: false,
    description: 'Gmail email for sending confirmation emails',
    example: 'notifications@fly2any.com',
    validator: (val) => val.includes('@'),
  },
  {
    name: 'GMAIL_APP_PASSWORD',
    required: false,
    description: 'Gmail app password (not regular password)',
    example: 'abcd efgh ijkl mnop',
  },
];

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  missing: {
    required: string[];
    recommended: string[];
  };
}

/**
 * Validate all environment variables
 */
export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missing = {
    required: [] as string[],
    recommended: [] as string[],
  };

  // Check required variables
  for (const envVar of REQUIRED_ENV_VARS) {
    const value = process.env[envVar.name];

    if (!value) {
      errors.push(`❌ Missing REQUIRED: ${envVar.name} - ${envVar.description}`);
      missing.required.push(envVar.name);
    } else if (envVar.validator && !envVar.validator(value)) {
      errors.push(`❌ Invalid format: ${envVar.name}`);
    }
  }

  // Check recommended variables
  for (const envVar of RECOMMENDED_ENV_VARS) {
    const value = process.env[envVar.name];

    if (!value) {
      warnings.push(`⚠️  Missing recommended: ${envVar.name} - ${envVar.description}`);
      missing.recommended.push(envVar.name);
    } else if (envVar.validator && !envVar.validator(value)) {
      warnings.push(`⚠️  Invalid format: ${envVar.name}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    missing,
  };
}

/**
 * Log validation results with color coding
 */
export function logValidationResults(result: ValidationResult): void {
  console.log('\n🔍 Environment Variable Validation\n');

  if (result.valid && result.warnings.length === 0) {
    console.log('✅ All environment variables configured correctly!\n');
    return;
  }

  if (result.errors.length > 0) {
    console.log('❌ CRITICAL ERRORS:\n');
    result.errors.forEach(error => console.log(`   ${error}`));
    console.log('');
  }

  if (result.warnings.length > 0) {
    console.log('⚠️  WARNINGS (Recommended):\n');
    result.warnings.forEach(warning => console.log(`   ${warning}`));
    console.log('');
  }

  if (result.missing.required.length > 0 || result.missing.recommended.length > 0) {
    console.log('📝 Quick Setup Guide:\n');

    if (result.missing.required.length > 0) {
      console.log('   Required variables:');
      result.missing.required.forEach(name => {
        const config = REQUIRED_ENV_VARS.find(v => v.name === name);
        console.log(`   - ${name}${config?.example ? ` (e.g., ${config.example})` : ''}`);
      });
      console.log('');
    }

    if (result.missing.recommended.length > 0) {
      console.log('   Recommended variables:');
      result.missing.recommended.slice(0, 5).forEach(name => {
        const config = RECOMMENDED_ENV_VARS.find(v => v.name === name);
        console.log(`   - ${name}${config?.example ? ` (e.g., ${config.example})` : ''}`);
      });
      if (result.missing.recommended.length > 5) {
        console.log(`   ... and ${result.missing.recommended.length - 5} more`);
      }
      console.log('');
    }

    console.log('   See .env.example or docs/DEPLOYMENT.md for full setup guide\n');
  }
}

/**
 * Check if production-critical variables are set
 */
export function isProductionReady(): boolean {
  const productionCritical = [
    'STRIPE_SECRET_KEY',
    'DUFFEL_ACCESS_TOKEN',
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXT_PUBLIC_SENTRY_DSN',
  ];

  return productionCritical.every(name => {
    const value = process.env[name];
    return value && value.length > 0;
  });
}

/**
 * Get summary of environment configuration status
 */
export function getEnvironmentSummary(): {
  mode: 'development' | 'staging' | 'production';
  hasPayments: boolean;
  hasBooking: boolean;
  hasDatabase: boolean;
  hasMonitoring: boolean;
  hasCaching: boolean;
} {
  return {
    mode: process.env.NODE_ENV === 'production' ? 'production' :
          process.env.VERCEL_ENV === 'preview' ? 'staging' : 'development',
    hasPayments: !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY),
    hasBooking: !!process.env.DUFFEL_ACCESS_TOKEN,
    hasDatabase: !!process.env.DATABASE_URL,
    hasMonitoring: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
    hasCaching: !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
  };
}

/**
 * Initialize environment validation (call at app startup)
 */
export function initializeEnvironmentValidation(): void {
  const result = validateEnvironment();
  logValidationResults(result);

  const summary = getEnvironmentSummary();
  console.log('🔧 Feature Availability:');
  console.log(`   Payment Processing: ${summary.hasPayments ? '✅' : '❌'}`);
  console.log(`   Flight Booking: ${summary.hasBooking ? '✅' : '❌'}`);
  console.log(`   Database: ${summary.hasDatabase ? '✅' : '❌'}`);
  console.log(`   Error Monitoring: ${summary.hasMonitoring ? '✅' : '❌'}`);
  console.log(`   Redis Caching: ${summary.hasCaching ? '✅' : '❌'}`);
  console.log('');

  if (!result.valid) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('❌ Cannot start in production with missing required environment variables');
    } else {
      console.warn('⚠️  Running in development mode with missing variables. Some features may not work.\n');
    }
  }

  if (process.env.NODE_ENV === 'production' && !isProductionReady()) {
    console.warn('⚠️  WARNING: Running in production without all recommended variables.\n');
  }
}
