// Client Quote Portal - Public View
// E2E: Agent Creates → Sends → CLIENT VIEWS HERE → Reacts → Books
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import ClientQuotePortal from "./ClientQuotePortal";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { token } = await params;
  const quote = await prisma?.agentQuote.findFirst({
    where: { viewToken: token },
    select: { tripName: true, destination: true },
  });

  if (!quote) return { title: "Quote Not Found" };

  return {
    title: `${quote.tripName} - Your Travel Quote | Fly2Any`,
    description: `View and confirm your personalized travel quote to ${quote.destination || "your dream destination"}`,
    robots: "noindex, nofollow", // Private quote
  };
}

export default async function ClientQuotePage({ params }: Props) {
  const { token } = await params;

  // Fetch quote with all relations
  const quote = await prisma?.agentQuote.findFirst({
    where: { viewToken: token },
    include: {
      agent: {
        include: {
          user: { select: { name: true, email: true, image: true } },
        },
      },
      client: true,
      items: { orderBy: { dayIndex: "asc" } },
    },
  });

  if (!quote) notFound();

  // Check expiration
  const isExpired = quote.expiresAt && new Date(quote.expiresAt) < new Date();
  if (isExpired && quote.status !== "EXPIRED") {
    await prisma?.agentQuote.update({
      where: { id: quote.id },
      data: { status: "EXPIRED" },
    });
  }

  // Track view (async, non-blocking)
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";
  const isMobile = /mobile|android|iphone/i.test(userAgent);

  // Fire and forget view tracking
  trackView(quote.id, isMobile);

  // Serialize for client
  const serializedQuote = JSON.parse(JSON.stringify({
    ...quote,
    isExpired,
  }));

  return <ClientQuotePortal quote={serializedQuote} token={token} />;
}

async function trackView(quoteId: string, isMobile: boolean) {
  try {
    await prisma?.agentQuote.update({
      where: { id: quoteId },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date(),
        status: { set: "VIEWED" }, // Only if not already accepted/declined
        metadata: {
          // @ts-ignore - JSONB update
          lastViewDevice: isMobile ? "mobile" : "desktop",
        },
      },
    });
  } catch (e) {
    console.error("View tracking failed:", e);
  }
}
