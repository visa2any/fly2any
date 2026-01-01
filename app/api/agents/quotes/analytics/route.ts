export const dynamic = 'force-dynamic';

// Quote Analytics Dashboard API
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d"; // 7d, 30d, 90d, 1y
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    // Calculate date range
    let startDate: Date;
    let endDate = new Date();

    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
    } else {
      startDate = new Date();
      switch (period) {
        case "7d": startDate.setDate(startDate.getDate() - 7); break;
        case "30d": startDate.setDate(startDate.getDate() - 30); break;
        case "90d": startDate.setDate(startDate.getDate() - 90); break;
        case "1y": startDate.setFullYear(startDate.getFullYear() - 1); break;
        default: startDate.setDate(startDate.getDate() - 30);
      }
    }

    // Fetch all quotes in range
    const quotes = await prisma!.agentQuote.findMany({
      where: {
        agentId: agent.id,
        createdAt: { gte: startDate, lte: endDate },
      },
      include: {
        views: true,
        messages: true,
        client: { select: { firstName: true, lastName: true } },
      },
    });

    // Calculate metrics
    const totalQuotes = quotes.length;
    const draftQuotes = quotes.filter(q => q.status === "DRAFT").length;
    const sentQuotes = quotes.filter(q => ["SENT", "VIEWED", "MODIFIED", "ACCEPTED", "DECLINED", "EXPIRED", "CONVERTED"].includes(q.status)).length;
    const viewedQuotes = quotes.filter(q => q.viewCount > 0).length;
    const acceptedQuotes = quotes.filter(q => q.status === "ACCEPTED" || q.status === "CONVERTED").length;
    const declinedQuotes = quotes.filter(q => q.status === "DECLINED").length;
    const expiredQuotes = quotes.filter(q => q.status === "EXPIRED").length;
    const convertedQuotes = quotes.filter(q => q.status === "CONVERTED" || q.convertedToBooking).length;

    // Financial metrics
    const totalQuoteValue = quotes.reduce((sum, q) => sum + q.total, 0);
    const avgQuoteValue = totalQuotes > 0 ? totalQuoteValue / totalQuotes : 0;
    const acceptedValue = quotes
      .filter(q => q.status === "ACCEPTED" || q.status === "CONVERTED")
      .reduce((sum, q) => sum + q.total, 0);
    const declinedValue = quotes
      .filter(q => q.status === "DECLINED")
      .reduce((sum, q) => sum + q.total, 0);

    // Performance metrics
    const quotesWithViewTime = quotes.filter(q => q.timeToView !== null);
    const avgTimeToView = quotesWithViewTime.length > 0
      ? quotesWithViewTime.reduce((sum, q) => sum + (q.timeToView || 0), 0) / quotesWithViewTime.length
      : null;

    const quotesWithAcceptTime = quotes.filter(q => q.timeToAccept !== null);
    const avgTimeToAccept = quotesWithAcceptTime.length > 0
      ? quotesWithAcceptTime.reduce((sum, q) => sum + (q.timeToAccept || 0), 0) / quotesWithAcceptTime.length
      : null;

    const conversionRate = sentQuotes > 0 ? (acceptedQuotes / sentQuotes) * 100 : 0;
    const viewRate = sentQuotes > 0 ? (viewedQuotes / sentQuotes) * 100 : 0;

    // View analytics
    const allViews = quotes.flatMap(q => q.views);
    const totalViews = allViews.length;
    const uniqueSessions = new Set(allViews.map(v => v.sessionId).filter(Boolean)).size;
    const mobileViews = allViews.filter(v => v.device === "mobile").length;
    const desktopViews = allViews.filter(v => v.device === "desktop").length;
    const avgViewDuration = allViews.length > 0
      ? allViews.reduce((sum, v) => sum + (v.duration || 0), 0) / allViews.length
      : null;

    // Message analytics
    const allMessages = quotes.flatMap(q => q.messages);
    const emailsSent = allMessages.filter(m => m.channel === "email").length;
    const smsSent = allMessages.filter(m => m.channel === "sms").length;
    const whatsappSent = allMessages.filter(m => m.channel === "whatsapp").length;

    // Top destinations
    const destinationCounts: Record<string, { count: number; value: number }> = {};
    quotes.forEach(q => {
      if (!destinationCounts[q.destination]) {
        destinationCounts[q.destination] = { count: 0, value: 0 };
      }
      destinationCounts[q.destination].count++;
      destinationCounts[q.destination].value += q.total;
    });
    const topDestinations = Object.entries(destinationCounts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Daily breakdown for charts
    const dailyData: Record<string, { quotes: number; value: number; accepted: number }> = {};
    quotes.forEach(q => {
      const day = q.createdAt.toISOString().split("T")[0];
      if (!dailyData[day]) {
        dailyData[day] = { quotes: 0, value: 0, accepted: 0 };
      }
      dailyData[day].quotes++;
      dailyData[day].value += q.total;
      if (q.status === "ACCEPTED" || q.status === "CONVERTED") {
        dailyData[day].accepted++;
      }
    });

    const chartData = Object.entries(dailyData)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Recent activity
    const recentQuotes = quotes
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10)
      .map(q => ({
        id: q.id,
        quoteNumber: q.quoteNumber,
        tripName: q.tripName,
        destination: q.destination,
        client: `${q.client.firstName} ${q.client.lastName}`,
        total: q.total,
        status: q.status,
        viewCount: q.viewCount,
        createdAt: q.createdAt,
      }));

    return NextResponse.json({
      period: { start: startDate, end: endDate },
      summary: {
        totalQuotes,
        draftQuotes,
        sentQuotes,
        viewedQuotes,
        acceptedQuotes,
        declinedQuotes,
        expiredQuotes,
        convertedQuotes,
      },
      financial: {
        totalQuoteValue,
        avgQuoteValue,
        acceptedValue,
        declinedValue,
        potentialRevenue: totalQuoteValue - acceptedValue - declinedValue,
      },
      performance: {
        conversionRate,
        viewRate,
        avgTimeToView,
        avgTimeToAccept,
      },
      engagement: {
        totalViews,
        uniqueSessions,
        mobileViews,
        desktopViews,
        avgViewDuration,
      },
      delivery: {
        emailsSent,
        smsSent,
        whatsappSent,
        totalSent: emailsSent + smsSent + whatsappSent,
      },
      topDestinations,
      chartData,
      recentQuotes,
    });

  } catch (error) {
    console.error("[QUOTE_ANALYTICS_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
