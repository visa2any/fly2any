// app/client/quotes/[shareableLink]/page.tsx
// Public Quote Viewing Page - No Authentication Required
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import QuoteHeader from "@/components/client/QuoteHeader";
import QuoteDetails from "@/components/client/QuoteDetails";
import QuoteItinerary from "@/components/client/QuoteItinerary";
import QuoteActions from "@/components/client/QuoteActions";
import QuotePricing from "@/components/client/QuotePricing";

interface PageProps {
  params: { shareableLink: string };
}

export async function generateMetadata({ params }: PageProps) {
  const quote = await prisma!.agentQuote.findUnique({
    where: { shareableLink: params.shareableLink },
  });

  if (!quote) {
    return {
      title: "Quote Not Found",
    };
  }

  return {
    title: `${quote.tripName} - Travel Quote from Fly2Any`,
    description: `View your personalized travel quote for ${quote.destination}`,
  };
}

export default async function ClientQuoteViewPage({ params }: PageProps) {
  const quote = await prisma!.agentQuote.findUnique({
    where: { shareableLink: params.shareableLink },
    include: {
      client: true,
      agent: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!quote) {
    notFound();
  }

  // Track view (only once per session - will implement client-side)
  // Update view count and timestamp
  const shouldTrackView = quote.status === "SENT" || quote.viewCount === 0;

  if (shouldTrackView) {
    await prisma!.agentQuote.update({
      where: { id: quote.id },
      data: {
        status: quote.status === "SENT" ? "VIEWED" : quote.status,
        viewCount: { increment: 1 },
        lastViewedAt: new Date(),
      },
    });
  }

  // Check if quote has expired
  const isExpired = new Date() > quote.expiresAt;
  const canAccept = ["SENT", "VIEWED"].includes(quote.status) && !isExpired;

  // Format quote data for components
  const quoteData = {
    ...quote,
    agent: {
      name: quote.agent.businessName || quote.agent.user.name || "Travel Agent",
      email: quote.agent.user.email,
      phone: quote.agent.phone,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <QuoteHeader quote={quoteData} />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Expired Banner */}
        {isExpired && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-600 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800">This quote has expired</p>
                <p className="text-sm text-red-700 mt-1">
                  Please contact your travel agent to request a new quote.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Already Accepted/Declined Banner */}
        {quote.status === "ACCEPTED" && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-green-600 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-green-800">Quote Accepted!</p>
                <p className="text-sm text-green-700 mt-1">
                  You accepted this quote on{" "}
                  {quote.acceptedAt?.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  . Your agent will contact you shortly.
                </p>
              </div>
            </div>
          </div>
        )}

        {quote.status === "DECLINED" && (
          <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-gray-600 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-800">Quote Declined</p>
                <p className="text-sm text-gray-700 mt-1">
                  You declined this quote. Contact your agent if you'd like to discuss alternative
                  options.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quote Details */}
            <QuoteDetails quote={quoteData} />

            {/* Itinerary */}
            <QuoteItinerary quote={quoteData} />
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Pricing Summary */}
            <QuotePricing quote={quoteData} />

            {/* Actions (Accept/Decline) */}
            <QuoteActions quote={quoteData} canAccept={canAccept} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-600">
            Questions about this quote? Contact{" "}
            <a
              href={`mailto:${quoteData.agent.email}`}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              {quoteData.agent.name}
            </a>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Powered by{" "}
            <a href="/" className="text-primary-600 hover:text-primary-700">
              Fly2Any
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
