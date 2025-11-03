# Sentry Integration Setup Guide

This guide will help you complete the Sentry error monitoring integration for Fly2Any.

## Overview

Sentry has been integrated into the Fly2Any platform to provide:
- Real-time error tracking and alerting
- Performance monitoring
- Session replay for debugging
- Error aggregation and reporting
- Source map support for production debugging

## Files Created

The following configuration files have been set up:

1. **`sentry.client.config.ts`** - Client-side (browser) Sentry configuration
2. **`sentry.server.config.ts`** - Server-side (Node.js) Sentry configuration
3. **`sentry.edge.config.ts`** - Edge runtime (middleware) Sentry configuration
4. **`next.config.mjs`** - Updated with Sentry webpack plugin
5. **`lib/errorLogger.ts`** - Updated to send errors to Sentry

## Sentry Package Installed

- **Package**: `@sentry/nextjs`
- **Version**: `10.22.0`

## Required Environment Variables

You need to add the following environment variables to your `.env.local` file (for development) and to your production environment (Vercel, AWS, etc.):

### For Development (.env.local)

```env
# Sentry DSN (Data Source Name)
# Get this from: https://sentry.io/settings/[your-org]/projects/[your-project]/keys/
NEXT_PUBLIC_SENTRY_DSN=https://[key]@[org-id].ingest.sentry.io/[project-id]

# Sentry Environment (optional - defaults to NODE_ENV)
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development

# Sentry Organization Slug (for source map uploads)
SENTRY_ORG=your-org-slug

# Sentry Project Slug (for source map uploads)
SENTRY_PROJECT=your-project-slug

# Sentry Auth Token (for source map uploads in builds)
# Get this from: https://sentry.io/settings/[your-org]/auth-tokens/
SENTRY_AUTH_TOKEN=your-auth-token
```

### For Production (Vercel/AWS/etc.)

Add the same variables to your production environment, but change the environment value:

```env
NEXT_PUBLIC_SENTRY_DSN=https://[key]@[org-id].ingest.sentry.io/[project-id]
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
SENTRY_AUTH_TOKEN=your-auth-token
```

## Step-by-Step Setup Instructions

### Step 1: Create a Sentry Account

1. Go to [https://sentry.io/signup/](https://sentry.io/signup/)
2. Sign up for a free account (includes 5,000 errors/month)
3. Choose "React" or "Next.js" as your platform

### Step 2: Create a New Project

1. In Sentry dashboard, click "Create Project"
2. Select **Next.js** as the platform
3. Set alert frequency to your preference
4. Name your project (e.g., "fly2any" or "fly2any-production")
5. Click "Create Project"

### Step 3: Get Your DSN

1. After creating the project, you'll see your DSN
2. It looks like: `https://abc123@o123456.ingest.sentry.io/789012`
3. Copy this DSN

Alternatively, find it later at:
- Navigate to: **Settings** → **Projects** → **[Your Project]** → **Client Keys (DSN)**

### Step 4: Get Organization and Project Slugs

1. Your **Organization Slug** is in the URL: `https://sentry.io/organizations/[org-slug]/`
2. Your **Project Slug** is in the URL: `https://sentry.io/organizations/[org-slug]/projects/[project-slug]/`

### Step 5: Create an Auth Token

This is needed for uploading source maps during builds:

1. Go to: **Settings** → **Auth Tokens**
2. Click "Create New Token"
3. Name it "Fly2Any Source Maps" or similar
4. Select scopes:
   - ✅ `project:read`
   - ✅ `project:releases`
   - ✅ `org:read`
5. Click "Create Token"
6. **Copy the token immediately** (you can't see it again!)

### Step 6: Add Environment Variables

Create or update your `.env.local` file:

```bash
# In your project root
touch .env.local

# Add the variables (use your actual values):
echo 'NEXT_PUBLIC_SENTRY_DSN=your-dsn-here' >> .env.local
echo 'NEXT_PUBLIC_SENTRY_ENVIRONMENT=development' >> .env.local
echo 'SENTRY_ORG=your-org-slug' >> .env.local
echo 'SENTRY_PROJECT=your-project-slug' >> .env.local
echo 'SENTRY_AUTH_TOKEN=your-auth-token' >> .env.local
```

Or manually edit `.env.local` with your preferred text editor.

### Step 7: Add to .gitignore

Ensure `.env.local` is in your `.gitignore`:

```bash
# Check if it's already there
grep -q "^.env.local$" .gitignore || echo ".env.local" >> .gitignore
```

### Step 8: Add to Production Environment

For **Vercel**:
1. Go to your project in Vercel dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - `NEXT_PUBLIC_SENTRY_DSN`
   - `NEXT_PUBLIC_SENTRY_ENVIRONMENT` (set to "production")
   - `SENTRY_ORG`
   - `SENTRY_PROJECT`
   - `SENTRY_AUTH_TOKEN`
4. Click "Save" for each

For **AWS/Other platforms**:
- Add the environment variables to your deployment configuration
- Ensure `NEXT_PUBLIC_*` variables are available at build time

### Step 9: Test the Integration

#### Development Test:

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open browser console and check for:
   ```
   [ErrorLogger] Sentry client initialized via sentry.client.config.ts
   ```

3. Trigger a test error (add this temporarily to a page):
   ```typescript
   import { logError } from '@/lib/errorLogger';

   // In a component or handler
   logError(new Error('Test Sentry Integration'), {
     context: 'test',
     testData: 'This is a test error',
   });
   ```

4. Check your Sentry dashboard - the error should appear within a few seconds

#### Production Test:

1. Build your application:
   ```bash
   npm run build
   ```

2. Check the build output for Sentry source map uploads:
   ```
   ℹ Sentry: Source maps uploaded successfully
   ```

3. Deploy to production and trigger a test error
4. Verify it appears in your Sentry dashboard

### Step 10: Configure Alerts (Optional)

1. In Sentry dashboard, go to **Alerts** → **Create Alert**
2. Set up notifications for:
   - New issues
   - High-frequency errors
   - Performance degradation
3. Choose notification method (email, Slack, etc.)

## Features Enabled

### Client-Side Monitoring
- ✅ Error tracking
- ✅ Performance monitoring (10% sample rate in production)
- ✅ Session replay (10% sample rate in production, 100% on errors)
- ✅ Breadcrumbs for debugging
- ✅ Source maps for readable stack traces

### Server-Side Monitoring
- ✅ Error tracking
- ✅ Performance monitoring (10% sample rate in production)
- ✅ HTTP request tracing
- ✅ Sensitive data filtering

### Edge Runtime Monitoring
- ✅ Error tracking in middleware
- ✅ Reduced sample rate (5% in production)
- ✅ Sensitive header filtering

### Error Logger Integration
- ✅ Automatic Sentry reporting via `logError()`
- ✅ Error ID tagging for easy searching
- ✅ Metadata and context preservation
- ✅ Sensitive data filtering
- ✅ User-facing error toast notifications

## Usage Examples

### Basic Error Logging

```typescript
import { logError } from '@/lib/errorLogger';

try {
  // Your code
  await riskyOperation();
} catch (error) {
  const errorId = logError(error, {
    context: 'riskyOperation',
    userId: user?.id,
  });
  console.log('Error logged with ID:', errorId);
}
```

### Context-Specific Logger

```typescript
import { createContextLogger } from '@/lib/errorLogger';

const logger = createContextLogger('payment-processing');

// These errors will have context: 'payment-processing'
logger.error(new Error('Payment failed'));
logger.warning('Slow payment response');
logger.info('Payment attempt');
```

### Error Boundary Integration

```typescript
import { logErrorBoundary } from '@/lib/errorLogger';

class ErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logErrorBoundary(error, errorInfo, 'checkout-page');
  }
}
```

## Monitoring Dashboard

Access your Sentry dashboard at:
```
https://sentry.io/organizations/[your-org]/issues/
```

Key sections:
- **Issues**: All errors and exceptions
- **Performance**: Transaction and span performance
- **Replays**: Session recordings (when errors occur)
- **Releases**: Track errors by deployment version

## Troubleshooting

### No Errors Appearing in Sentry

1. **Check DSN**: Ensure `NEXT_PUBLIC_SENTRY_DSN` is set correctly
2. **Check Console**: Look for Sentry initialization messages
3. **Check Environment**: Sentry only sends events in production by default
4. **Check beforeSend**: Ensure your `beforeSend` hook isn't filtering everything

### Source Maps Not Uploading

1. **Check Auth Token**: Ensure `SENTRY_AUTH_TOKEN` is valid
2. **Check Permissions**: Token needs `project:releases` scope
3. **Check Build Output**: Look for Sentry upload messages
4. **Check Network**: Ensure build server can reach sentry.io

### Too Many Events

1. **Adjust Sample Rates**: Edit configuration files to reduce sample rates
2. **Filter Errors**: Add more filters to `ignoreErrors` arrays
3. **Upgrade Plan**: Consider upgrading Sentry plan for higher quota

### Sensitive Data Leaking

1. **Check Filters**: Review `beforeSend` hooks in config files
2. **Review Data**: Use Sentry's "Data Scrubbing" settings
3. **Update Filters**: Add sensitive field names to filter lists

## Performance Considerations

- **Bundle Size**: Sentry adds ~50KB to your client bundle
- **Performance Impact**: Minimal (<1% overhead)
- **Sample Rates**: Configured to balance insight vs. cost
  - Production tracing: 10% of transactions
  - Production replays: 10% of sessions, 100% of error sessions
  - Development: 100% sampling for full visibility

## Cost Management

Free tier includes:
- 5,000 errors per month
- 10,000 performance units per month
- 50 session replays per month

To stay within limits:
- Keep sample rates low in production (currently configured)
- Use `ignoreErrors` to filter noise
- Monitor quota in Sentry dashboard
- Consider upgrading for production apps with high traffic

## Security Best Practices

1. **Never commit** `.env.local` or environment files with real credentials
2. **Use different projects** for development and production
3. **Rotate auth tokens** periodically
4. **Review sensitive data** filters regularly
5. **Use Sentry's IP allowlist** if needed
6. **Enable two-factor authentication** on your Sentry account

## Additional Resources

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Configuration Options](https://docs.sentry.io/platforms/javascript/configuration/)
- [Source Maps Guide](https://docs.sentry.io/platforms/javascript/sourcemaps/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)

## Support

If you encounter issues:
1. Check [Sentry Status](https://status.sentry.io/)
2. Review [Sentry Discussions](https://github.com/getsentry/sentry/discussions)
3. Contact [Sentry Support](https://sentry.io/support/)
4. Review your project's error logs

## Summary

Sentry integration is now complete! Once you add the environment variables, errors will automatically be captured and sent to your Sentry dashboard. The integration includes:

- ✅ Client-side error monitoring
- ✅ Server-side error monitoring
- ✅ Edge runtime monitoring
- ✅ Session replay on errors
- ✅ Performance tracking
- ✅ Source map support
- ✅ Sensitive data filtering
- ✅ Custom error logger integration

Remember to test in development first, then deploy to production with the appropriate environment variables set.
