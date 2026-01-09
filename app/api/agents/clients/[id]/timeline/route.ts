import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = params.id;

    // Fetch quotes as activities
    const quotes = await prisma.agentQuote.findMany({
      where: { clientId },
      select: {
        id: true,
        tripName: true,
        total: true,
        status: true,
        createdAt: true,
        sentAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Transform quotes into timeline activities
    const activities = quotes.flatMap((quote) => {
      const items = [];

      // Quote created
      items.push({
        id: `quote-created-${quote.id}`,
        type: 'quote' as const,
        title: `Quote Created: ${quote.tripName}`,
        description: `New quote for ${quote.tripName}`,
        timestamp: quote.createdAt.toISOString(),
        amount: quote.total,
      });

      // Quote sent
      if (quote.sentAt) {
        items.push({
          id: `quote-sent-${quote.id}`,
          type: 'email' as const,
          title: `Quote Sent: ${quote.tripName}`,
          description: `Quote #${quote.id.slice(0, 8)} sent via email`,
          timestamp: quote.sentAt.toISOString(),
          amount: quote.total,
        });
      }

      // Quote accepted
      if (quote.status === 'accepted') {
        items.push({
          id: `booking-confirmed-${quote.id}`,
          type: 'booking' as const,
          title: `Booking Confirmed: ${quote.tripName}`,
          description: `Quote accepted and booking confirmed`,
          timestamp: quote.createdAt.toISOString(),
          status: 'confirmed',
          amount: quote.total,
        });
      }

      return items;
    });

    // Sort by timestamp descending
    activities.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Error fetching client timeline:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client timeline' },
      { status: 500 }
    );
  }
}
