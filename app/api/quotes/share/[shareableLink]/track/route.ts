export const dynamic = 'force-dynamic';

// Quote View Tracking API
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const TrackSchema = z.object({
  sessionId: z.string().optional(),
  duration: z.number().optional(),
  scrollDepth: z.number().min(0).max(100).optional(),
  sectionsViewed: z.array(z.string()).optional(),
  clickedCTA: z.boolean().optional(),
  ctaType: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shareableLink: string }> }
) {
  try {
    const { shareableLink } = await params;

    const quote = await prisma!.agentQuote.findFirst({
      where: { shareableLink },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    const body = await request.json();
    const data = TrackSchema.parse(body);

    // Get device info from headers
    const userAgent = request.headers.get("user-agent") || "";
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
               request.headers.get("x-real-ip") || "";

    // Detect device type
    let device = "desktop";
    if (/mobile/i.test(userAgent)) device = "mobile";
    else if (/tablet|ipad/i.test(userAgent)) device = "tablet";

    // Detect browser
    let browser = "unknown";
    if (/chrome/i.test(userAgent)) browser = "chrome";
    else if (/firefox/i.test(userAgent)) browser = "firefox";
    else if (/safari/i.test(userAgent)) browser = "safari";
    else if (/edge/i.test(userAgent)) browser = "edge";

    // Detect OS
    let os = "unknown";
    if (/windows/i.test(userAgent)) os = "windows";
    else if (/mac/i.test(userAgent)) os = "macos";
    else if (/linux/i.test(userAgent)) os = "linux";
    else if (/android/i.test(userAgent)) os = "android";
    else if (/ios|iphone|ipad/i.test(userAgent)) os = "ios";

    // Check if this is an update to existing view or new view
    let view = null;
    if (data.sessionId) {
      view = await prisma!.quoteView.findFirst({
        where: {
          quoteId: quote.id,
          sessionId: data.sessionId,
          createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) }, // Within 30 min
        },
      });
    }

    if (view) {
      // Update existing view
      await prisma!.quoteView.update({
        where: { id: view.id },
        data: {
          duration: data.duration,
          scrollDepth: data.scrollDepth,
          sectionsViewed: data.sectionsViewed || view.sectionsViewed,
          clickedCTA: data.clickedCTA || view.clickedCTA,
          ctaType: data.ctaType || view.ctaType,
        },
      });
    } else {
      // Create new view
      await prisma!.quoteView.create({
        data: {
          quoteId: quote.id,
          sessionId: data.sessionId,
          ipAddress: ip,
          userAgent,
          device,
          browser,
          os,
          duration: data.duration,
          scrollDepth: data.scrollDepth,
          sectionsViewed: data.sectionsViewed || [],
          clickedCTA: data.clickedCTA || false,
          ctaType: data.ctaType,
        },
      });

      // Update quote view count
      const updateData: any = {
        viewCount: { increment: 1 },
        lastViewedAt: new Date(),
      };

      // First view - update status and calculate timeToView
      if (quote.status === "SENT" && !quote.viewedAt) {
        const sentAt = quote.sentAt || quote.createdAt;
        const timeToView = Math.round((Date.now() - sentAt.getTime()) / 60000); // minutes

        updateData.status = "VIEWED";
        updateData.viewedAt = new Date();
        updateData.timeToView = timeToView;
      }

      await prisma!.agentQuote.update({
        where: { id: quote.id },
        data: updateData,
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[QUOTE_TRACK_ERROR]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
