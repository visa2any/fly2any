#!/usr/bin/env node

/**
 * Secrets Rotation Script
 * 
 * This script helps rotate critical secrets for the Fly2Any platform.
 * It generates new secure values for common secrets and provides
 * instructions for updating them in your environment.
 * 
 * Usage:
 *   node scripts/rotate-secrets.js [--dry-run] [--output=json]
 * 
 * Security Note:
 *   - Never commit rotated secrets to version control
 *   - Update secrets in your environment (Vercel, Doppler, etc.)
 *   - Rotate secrets quarterly or after security incidents
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const outputFormat = args.find(arg => arg.startsWith('--output='))?.split('=')[1] || 'text';

// Generate secure random strings
function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

function generateJWTSecret() {
  return crypto.randomBytes(32).toString('base64');
}

function generateAPIKey() {
  return `sk_${crypto.randomBytes(24).toString('hex')}`;
}

// List of secrets to rotate
const secrets = [
  {
    name: 'NEXTAUTH_SECRET',
    description: 'NextAuth.js secret for JWT encryption',
    currentValue: process.env.NEXTAUTH_SECRET || 'Not set in environment',
    newValue: generateSecret(32),
    rotationFrequency: '90 days',
    criticality: 'HIGH',
    affectedServices: ['Authentication', 'Sessions', 'API'],
  },
  {
    name: 'NEXTAUTH_URL',
    description: 'NextAuth.js base URL',
    currentValue: process.env.NEXTAUTH_URL || 'Not set in environment',
    newValue: 'https://www.fly2any.com',
    rotationFrequency: 'When domain changes',
    criticality: 'HIGH',
    affectedServices: ['Authentication', 'OAuth Callbacks'],
  },
  {
    name: 'DATABASE_URL',
    description: 'PostgreSQL connection string',
    currentValue: process.env.DATABASE_URL ? '***REDACTED***' : 'Not set in environment',
    newValue: '***UPDATE MANUALLY***',
    rotationFrequency: 'When compromised',
    criticality: 'CRITICAL',
    affectedServices: ['Database', 'All Services'],
    notes: 'Rotate database credentials via Neon/Postgres provider',
  },
  {
    name: 'JWT_SECRET',
    description: 'JWT signing secret',
    currentValue: process.env.JWT_SECRET || 'Not set in environment',
    newValue: generateJWTSecret(),
    rotationFrequency: '90 days',
    criticality: 'HIGH',
    affectedServices: ['API', 'Authentication'],
  },
  {
    name: 'ENCRYPTION_KEY',
    description: 'Key for encrypting sensitive data',
    currentValue: process.env.ENCRYPTION_KEY ? '***REDACTED***' : 'Not set in environment',
    newValue: generateSecret(32),
    rotationFrequency: '180 days',
    criticality: 'CRITICAL',
    affectedServices: ['Payment Processing', 'PII Storage'],
    notes: 'Must re-encrypt existing data with new key',
  },
  {
    name: 'STRIPE_SECRET_KEY',
    description: 'Stripe API secret key',
    currentValue: process.env.STRIPE_SECRET_KEY ? '***REDACTED***' : 'Not set in environment',
    newValue: '***UPDATE IN STRIPE DASHBOARD***',
    rotationFrequency: '90 days',
    criticality: 'CRITICAL',
    affectedServices: ['Payments', 'Subscriptions'],
    notes: 'Generate new key in Stripe Dashboard and update here',
  },
  {
    name: 'SENTRY_DSN',
    description: 'Sentry error tracking DSN',
    currentValue: process.env.SENTRY_DSN ? '***REDACTED***' : 'Not set in environment',
    newValue: '***UPDATE IN SENTRY***',
    rotationFrequency: 'When compromised',
    criticality: 'MEDIUM',
    affectedServices: ['Error Tracking', 'Monitoring'],
  },
  {
    name: 'UPSTASH_REDIS_REST_TOKEN',
    description: 'Upstash Redis REST API token',
    currentValue: process.env.UPSTASH_REDIS_REST_TOKEN ? '***REDACTED***' : 'Not set in environment',
    newValue: '***UPDATE IN UPSTASH***',
    rotationFrequency: '90 days',
    criticality: 'HIGH',
    affectedServices: ['Caching', 'Rate Limiting', 'Session Storage'],
  },
  {
    name: 'GOOGLE_CLIENT_SECRET',
    description: 'Google OAuth client secret',
    currentValue: process.env.GOOGLE_CLIENT_SECRET ? '***REDACTED***' : 'Not set in environment',
    newValue: '***UPDATE IN GOOGLE CLOUD CONSOLE***',
    rotationFrequency: '90 days',
    criticality: 'HIGH',
    affectedServices: ['Authentication', 'OAuth'],
  },
  {
    name: 'API_MASTER_KEY',
    description: 'Master API key for internal services',
    currentValue: process.env.API_MASTER_KEY ? '***REDACTED***' : 'Not set in environment',
    newValue: generateAPIKey(),
    rotationFrequency: '180 days',
    criticality: 'CRITICAL',
    affectedServices: ['Internal API', 'Microservices'],
  },
];

// Generate rotation report
function generateReport() {
  const timestamp = new Date().toISOString();
  const report = {
    metadata: {
      generatedAt: timestamp,
      dryRun,
      environment: process.env.NODE_ENV || 'development',
    },
    secrets,
    instructions: {
      immediateActions: [
        'Update all secrets in your environment (Vercel, Doppler, etc.)',
        'Restart all services to apply new secrets',
        'Update any hardcoded secrets in configuration files',
        'Notify team members of rotation',
      ],
      postRotation: [
        'Verify authentication still works',
        'Test payment processing',
        'Check error tracking is functional',
        'Monitor logs for authentication failures',
      ],
      emergencyContacts: [
        'DevOps Team: devops@fly2any.com',
        'Security Team: security@fly2any.com',
        'On-call Engineer: +1-XXX-XXX-XXXX',
      ],
    },
  };

  return report;
}

// Output formatting
function formatReport(report, format) {
  if (format === 'json') {
    return JSON.stringify(report, null, 2);
  }

  // Text format
  let output = '';

  output += '╔══════════════════════════════════════════════════════════════╗\n';
  output += '║                  SECRETS ROTATION REPORT                     ║\n';
  output += '╠══════════════════════════════════════════════════════════════╣\n';
  output += `║ Generated: ${report.metadata.generatedAt}\n`;
  output += `║ Dry Run: ${report.metadata.dryRun ? 'YES' : 'NO'}\n`;
  output += `║ Environment: ${report.metadata.environment}\n`;
  output += '╚══════════════════════════════════════════════════════════════╝\n\n';

  output += 'SECRETS TO ROTATE:\n';
  output += '─────────────────\n';

  report.secrets.forEach((secret, index) => {
    output += `\n${index + 1}. ${secret.name} (${secret.criticality})\n`;
    output += `   Description: ${secret.description}\n`;
    output += `   Rotation: Every ${secret.rotationFrequency}\n`;
    output += `   Current: ${secret.currentValue}\n`;
    output += `   New Value: ${secret.newValue}\n`;
    if (secret.notes) {
      output += `   Note: ${secret.notes}\n`;
    }
    output += `   Affected: ${secret.affectedServices.join(', ')}\n`;
  });

  output += '\n\nACTION REQUIRED:\n';
  output += '───────────────\n';
  report.instructions.immediateActions.forEach((action, index) => {
    output += `${index + 1}. ${action}\n`;
  });

  output += '\n\nPOST-ROTATION CHECKS:\n';
  output += '───────────────────\n';
  report.instructions.postRotation.forEach((check, index) => {
    output += `${index + 1}. ${check}\n`;
  });

  output += '\n\nEMERGENCY CONTACTS:\n';
  output += '─────────────────\n';
  report.instructions.emergencyContacts.forEach((contact, index) => {
    output += `${index + 1}. ${contact}\n`;
  });

  output += '\n\n⚠️  IMPORTANT SECURITY NOTES:\n';
  output += '──────────────────────────\n';
  output += '• NEVER commit secrets to version control\n';
  output += '• Use environment variables or secret management tools\n';
  output += '• Rotate secrets immediately after security incidents\n';
  output += '• Maintain old secrets during transition period (24-48 hours)\n';
  output += '• Use this script in CI/CD for automated reminders\n';

  return output;
}

// Main execution
function main() {
  console.log('🔐 Starting secrets rotation process...\n');

  if (dryRun) {
    console.log('⚠️  DRY RUN MODE: No actual rotation will be performed\n');
  }

  const report = generateReport();
  const formattedReport = formatReport(report, outputFormat);

  console.log(formattedReport);

  // Save report to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportDir = path.join(__dirname, '../reports/secrets-rotation');
  const reportFile = path.join(reportDir, `rotation-report-${timestamp}.${outputFormat === 'json' ? 'json' : 'txt'}`);

  if (!dryRun) {
    // Create reports directory if it doesn't exist
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    // Save report
    fs.writeFileSync(reportFile, formattedReport);
    console.log(`\n📄 Report saved to: ${reportFile}`);

    // Generate environment file template
    const envTemplate = report.secrets
      .map(secret => `${secret.name}=${secret.newValue}`)
      .join('\n');

    const envFile = path.join(reportDir, `.env.rotated-${timestamp}`);
    fs.writeFileSync(envFile, envTemplate);
    console.log(`📄 Environment template saved to: ${envFile}`);

    console.log('\n✅ Secrets rotation report generated successfully!');
    console.log('\n🚨 Next steps:');
    console.log('   1. Update secrets in your environment (Vercel, Doppler, etc.)');
    console.log('   2. Restart all services');
    console.log('   3. Run tests to verify functionality');
  } else {
    console.log('\n✅ Dry run completed. No changes were made.');
  }
}

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('❌ Error during secrets rotation:', error.message);
  process.exit(1);
});

// Run main function
if (require.main === module) {
  main();
}

module.exports = { generateReport, formatReport };