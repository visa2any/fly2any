// app/client/quotes/[shareableLink]/page.tsx
// Level 6 Ultra-Premium Public Quote Viewing Page
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import QuoteHeader from '@/components/client/QuoteHeader';
import QuoteDetails from '@/components/client/QuoteDetails';
import QuoteItinerary from '@/components/client/QuoteItinerary';
import QuoteActions from '@/components/client/QuoteActions';
import QuotePricing from '@/components/client/QuotePricing';
import ClientQuoteStatusBanner from '@/components/client/ClientQuoteStatusBanner';

interface PageProps {
  params: { shareableLink: string };
}

export async function generateMetadata({ params }: PageProps) {
  const quote = await prisma!.agentQuote.findUnique({
    where: { shareableLink: params.shareableLink },
  });

  if (!quote) {
    return {
      title: 'Quote Not Found',
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

  // Track view (only once per session)
  const shouldTrackView = quote.status === 'SENT' || quote.viewCount === 0;

  if (shouldTrackView) {
    await prisma!.agentQuote.update({
      where: { id: quote.id },
      data: {
        status: quote.status === 'SENT' ? 'VIEWED' : quote.status,
        viewCount: { increment: 1 },
        lastViewedAt: new Date(),
      },
    });
  }

  // Check if quote has expired
  const isExpired = new Date() > quote.expiresAt;
  const canAccept = ['SENT', 'VIEWED'].includes(quote.status) && !isExpired;

  // Format quote data for components
  const quoteData = {
    ...quote,
    agent: {
      name: quote.agent.businessName || quote.agent.user.name || 'Travel Agent',
      email: quote.agent.user.email,
      phone: quote.agent.phone,
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <QuoteHeader quote={quoteData} />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-4">
        {/* Status Banners */}
        <ClientQuoteStatusBanner
          status={quote.status}
          isExpired={isExpired}
          acceptedAt={quote.acceptedAt}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <QuoteDetails quote={quoteData} />
            <QuoteItinerary quote={quoteData} />
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            <QuotePricing quote={quoteData} />
            <QuoteActions quote={quoteData} canAccept={canAccept} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-600">
            Questions about this quote? Contact{' '}
            <a
              href={`mailto:${quoteData.agent.email}`}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {quoteData.agent.name}
            </a>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Powered by{' '}
            <a href="/" className="text-indigo-600 hover:text-indigo-700">
              Fly2Any
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
