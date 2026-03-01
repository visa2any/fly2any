// app/client/quotes/[shareableLink]/page.tsx
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import QuoteHeader from '@/components/client/QuoteHeader';
import QuoteDetails from '@/components/client/QuoteDetails';
import QuoteItinerary from '@/components/client/QuoteItinerary';
import QuoteActions from '@/components/client/QuoteActions';
import QuotePricing from '@/components/client/QuotePricing';
import ClientQuoteStatusBanner from '@/components/client/ClientQuoteStatusBanner';
import MobileQuoteAcceptBar from '@/components/client/MobileQuoteAcceptBar';
import QuoteViewTracker from '@/components/client/QuoteViewTracker';

interface PageProps {
  params: { shareableLink: string };
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps) {
  const idFromToken = params.shareableLink.startsWith('qt-') ? params.shareableLink.slice(3) : null;
  const quote = await prisma!.agentQuote.findFirst({
    where: idFromToken ? { id: idFromToken } : { shareableLink: params.shareableLink },
  });
  if (!quote) return { title: 'Quote Not Found' };
  return {
    title: `${quote.tripName} - Travel Quote from Fly2Any`,
    description: `View your personalized travel quote for ${quote.destination}`,
  };
}

export default async function ClientQuoteViewPage({ params }: PageProps) {
  const idFromToken = params.shareableLink.startsWith('qt-') ? params.shareableLink.slice(3) : null;

  const quote = await prisma!.agentQuote.findFirst({
    where: idFromToken ? { id: idFromToken } : { shareableLink: params.shareableLink },
    include: {
      client: true,
      agent: { include: { user: { select: { name: true, email: true } } } },
    },
  });

  if (!quote) notFound();

  const isExpired = new Date() > quote.expiresAt;
  const canAccept = ['SENT', 'VIEWED'].includes(quote.status) && !isExpired;
  const shareableLink = quote.shareableLink || `qt-${quote.id}`;

  const quoteData = {
    ...quote,
    shareableLink,
    agent: {
      name: (quote.agent as any).businessName || quote.agent.user.name || 'Travel Agent',
      email: quote.agent.user.email,
      phone: (quote.agent as any).phone ?? null,
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Client-side view tracking — deduped by sessionId, no server-side spam */}
      <QuoteViewTracker shareableLink={shareableLink} />

      <QuoteHeader quote={quoteData} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-4 pb-28 lg:pb-8">
        <ClientQuoteStatusBanner
          status={quote.status}
          isExpired={isExpired}
          acceptedAt={quote.acceptedAt}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main — 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            <QuoteDetails quote={quoteData} />
            <QuoteItinerary quote={quoteData} />
          </div>

          {/* Sidebar — 1/3 */}
          <div className="space-y-6">
            <QuotePricing quote={quoteData} />
            {canAccept && <QuoteActions quote={quoteData} canAccept={canAccept} />}
          </div>
        </div>
      </main>

      {/* Mobile sticky Accept CTA */}
      {canAccept && (
        <MobileQuoteAcceptBar
          quote={{ id: quoteData.id, shareableLink, status: quote.status, total: Number(quote.total), currency: String(quote.currency || 'USD') }}
          expiresAt={quote.expiresAt.toISOString()}
        />
      )}

      <footer className="mt-12 py-8 border-t border-gray-200 bg-white" id="agent-contact">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-600">
            Questions about this quote? Contact{' '}
            <a href={`mailto:${quoteData.agent.email}`} className="text-primary-600 hover:text-primary-700 font-medium">
              {quoteData.agent.name}
            </a>
            {quoteData.agent.phone && (
              <> or call{' '}
                <a href={`tel:${quoteData.agent.phone}`} className="text-primary-600 hover:text-primary-700 font-medium">
                  {quoteData.agent.phone}
                </a>
              </>
            )}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Powered by <a href="/" className="text-primary-600 hover:text-primary-700">Fly2Any</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
