/**
 * N8N Social Webhook - Autonomous Social Posting
 *
 * N8N calls this endpoint to:
 * - Trigger social queue processing
 * - Post directly to platforms
 * - Get queue status
 *
 * @route POST /api/webhooks/n8n/social
 */

import { NextRequest, NextResponse } from "next/server";
import { handleApiError, ErrorCategory, ErrorSeverity } from "@/lib/monitoring/global-error-handler";
import { contentQueueManager } from "@/lib/social/content-queue-manager";
import { postToPlatform, getConfiguredAdapters, SocialPlatform, SocialPostContent } from "@/lib/social";

const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET || "";

type ActionType = "process_queue" | "post_now" | "get_stats" | "enqueue" | "retry_failed";

interface N8NSocialPayload {
  action: ActionType;
  platform?: SocialPlatform;
  content?: SocialPostContent;
  limit?: number;
  queueItem?: {
    type: "deal" | "guide" | "social";
    title: string;
    content: string;
    platforms: SocialPlatform[];
    imageUrl?: string;
    link?: string;
    hashtags?: string[];
    productType?: "flight" | "hotel" | "tour" | "transfer";
    productData?: Record<string, any>;
  };
}

export async function POST(request: NextRequest) {
  return handleApiError(request, async () => {
    // Validate N8N secret
    const authHeader = request.headers.get("x-n8n-secret") || request.headers.get("authorization");
    if (N8N_WEBHOOK_SECRET && authHeader !== N8N_WEBHOOK_SECRET && authHeader !== `Bearer ${N8N_WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload: N8NSocialPayload = await request.json();
    console.log("[N8N Social] Action:", payload.action);

    switch (payload.action) {
      case "process_queue":
        return handleProcessQueue(payload.limit || 10);

      case "post_now":
        return handlePostNow(payload.platform!, payload.content!);

      case "get_stats":
        return handleGetStats();

      case "enqueue":
        return handleEnqueue(payload.queueItem!);

      case "retry_failed":
        return handleRetryFailed();

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  }, { category: ErrorCategory.EXTERNAL_API, severity: ErrorSeverity.HIGH });
}

async function handleProcessQueue(limit: number) {
  const result = await contentQueueManager.processQueue(limit);
  const stats = await contentQueueManager.getStats();

  console.log(`[N8N Social] Processed ${result.processed} items`);

  return NextResponse.json({
    success: true,
    action: "process_queue",
    ...result,
    queueStats: stats,
  });
}

async function handlePostNow(platform: SocialPlatform, content: SocialPostContent) {
  if (!platform || !content) {
    return NextResponse.json({ error: "platform and content required" }, { status: 400 });
  }

  const result = await postToPlatform(platform, content);

  return NextResponse.json({
    success: result.success,
    action: "post_now",
    platform,
    result,
  });
}

async function handleGetStats() {
  const stats = await contentQueueManager.getStats();
  const adapters = getConfiguredAdapters();
  const upcoming = await contentQueueManager.getUpcoming(10);

  return NextResponse.json({
    success: true,
    action: "get_stats",
    stats,
    configuredPlatforms: adapters.map(a => a.platform),
    upcoming: upcoming.map(u => ({
      id: u.id,
      type: u.type,
      title: u.title,
      platforms: u.platforms,
      scheduledAt: u.scheduledAt,
    })),
  });
}

async function handleEnqueue(item: N8NSocialPayload["queueItem"]) {
  if (!item) {
    return NextResponse.json({ error: "queueItem required" }, { status: 400 });
  }

  const id = await contentQueueManager.enqueue({
    ...item,
    createdBy: "n8n",
  });

  return NextResponse.json({
    success: true,
    action: "enqueue",
    queueId: id,
  });
}

async function handleRetryFailed() {
  const count = await contentQueueManager.retryFailed();

  return NextResponse.json({
    success: true,
    action: "retry_failed",
    retriedCount: count,
  });
}

// GET - N8N health check & docs
export async function GET() {
  const adapters = getConfiguredAdapters();
  const stats = await contentQueueManager.getStats().catch(() => null);

  return NextResponse.json({
    status: "ok",
    service: "fly2any-social-automation",
    configuredPlatforms: adapters.map(a => ({ platform: a.platform, configured: a.isConfigured() })),
    queueStats: stats,
    actions: {
      process_queue: "Process pending posts in queue",
      post_now: "Post immediately to platform",
      get_stats: "Get queue and platform stats",
      enqueue: "Add content to queue",
      retry_failed: "Retry all failed posts",
    },
    example: {
      process_queue: { action: "process_queue", limit: 10 },
      post_now: {
        action: "post_now",
        platform: "twitter",
        content: { text: "Test post", link: "https://fly2any.com" },
      },
      enqueue: {
        action: "enqueue",
        queueItem: {
          type: "deal",
          title: "Flight Deal",
          content: "NYC → Miami from $99!",
          platforms: ["twitter", "facebook"],
          link: "https://fly2any.com/deals/nyc-miami",
        },
      },
    },
  });
}
