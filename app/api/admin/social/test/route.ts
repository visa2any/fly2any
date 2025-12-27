/**
 * Social Media Test API - Fly2Any Marketing OS
 * Tests connection and posting to all configured platforms
 *
 * @route POST /api/admin/social/test
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getConfiguredAdapters, postToPlatform, SocialPlatform } from '@/lib/social';
import { handleApiError, ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';

export const dynamic = 'force-dynamic';

// Check if user is admin
async function isAdmin(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (authHeader === `Bearer ${cronSecret}`) return true;

  const session = await auth();
  if (!session?.user?.email) return false;

  const adminEmails = (process.env.ADMIN_NOTIFICATION_EMAILS || '').split(',');
  return adminEmails.includes(session.user.email);
}

export async function GET(request: NextRequest) {
  return handleApiError(request, async () => {
    if (!await isAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get status of all adapters
    const adapters = getConfiguredAdapters();
    const status: Record<string, { configured: boolean; platform: string }> = {};

    const allPlatforms: SocialPlatform[] = ['twitter', 'instagram', 'facebook', 'tiktok', 'blog'];

    for (const platform of allPlatforms) {
      const adapter = adapters.find(a => a.platform === platform);
      status[platform] = {
        platform,
        configured: adapter?.isConfigured() ?? false,
      };
    }

    // Check env vars (without exposing values)
    const envStatus = {
      twitter: {
        TWITTER_API_KEY: !!process.env.TWITTER_API_KEY,
        TWITTER_API_SECRET: !!process.env.TWITTER_API_SECRET,
        TWITTER_ACCESS_TOKEN: !!process.env.TWITTER_ACCESS_TOKEN,
        TWITTER_ACCESS_SECRET: !!process.env.TWITTER_ACCESS_SECRET,
        TWITTER_BEARER_TOKEN: !!process.env.TWITTER_BEARER_TOKEN,
      },
      meta: {
        META_ACCESS_TOKEN: !!process.env.META_ACCESS_TOKEN,
        INSTAGRAM_ACCOUNT_ID: !!process.env.INSTAGRAM_ACCOUNT_ID,
        FACEBOOK_PAGE_ID: !!process.env.FACEBOOK_PAGE_ID,
      },
      tiktok: {
        TIKTOK_ACCESS_TOKEN: !!process.env.TIKTOK_ACCESS_TOKEN,
        TIKTOK_OPEN_ID: !!process.env.TIKTOK_OPEN_ID,
      },
    };

    return NextResponse.json({
      success: true,
      platforms: status,
      envVars: envStatus,
      configuredCount: adapters.length,
    });

  }, { category: ErrorCategory.CONFIGURATION, severity: ErrorSeverity.LOW });
}

export async function POST(request: NextRequest) {
  return handleApiError(request, async () => {
    if (!await isAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { platform, text, dryRun = true } = body as {
      platform: SocialPlatform;
      text?: string;
      dryRun?: boolean;
    };

    if (!platform) {
      return NextResponse.json({ error: 'Platform required' }, { status: 400 });
    }

    const testContent = {
      text: text || `✈️ Test post from Fly2Any Marketing OS - ${new Date().toISOString()}`,
      link: 'https://www.fly2any.com',
      hashtags: ['Fly2Any', 'TravelDeals', 'Test'],
    };

    // Dry run - just validate
    if (dryRun) {
      const adapters = getConfiguredAdapters();
      const adapter = adapters.find(a => a.platform === platform);

      if (!adapter) {
        return NextResponse.json({
          success: false,
          dryRun: true,
          platform,
          error: `${platform} adapter not configured`,
          envCheck: platform === 'twitter' ? {
            hasApiKey: !!process.env.TWITTER_API_KEY,
            hasApiSecret: !!process.env.TWITTER_API_SECRET,
            hasAccessToken: !!process.env.TWITTER_ACCESS_TOKEN,
            hasAccessSecret: !!process.env.TWITTER_ACCESS_SECRET,
            hasBearerToken: !!process.env.TWITTER_BEARER_TOKEN,
          } : undefined,
        });
      }

      const validation = adapter.validateContent(testContent);

      return NextResponse.json({
        success: true,
        dryRun: true,
        platform,
        configured: adapter.isConfigured(),
        validation,
        formattedContent: adapter.formatContent(testContent),
        message: 'Dry run complete. Set dryRun: false to post.',
      });
    }

    // Real post
    console.log(`[Social Test] Posting to ${platform}...`);
    const result = await postToPlatform(platform, testContent);

    return NextResponse.json({
      success: result.success,
      dryRun: false,
      platform,
      result,
      message: result.success ? 'Posted successfully!' : `Failed: ${result.error}`,
    });

  }, { category: ErrorCategory.EXTERNAL_API, severity: ErrorSeverity.HIGH });
}
