import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

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

    // Fetch client quotes for intelligence
    const quotes = await prisma.agentQuote.findMany({
      where: { clientId },
      select: {
        id: true,
        total: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate intelligence metrics
    const totalQuotes = quotes.length;
    const acceptedQuotes = quotes.filter(q => q.status === 'accepted').length;
    const conversionRate = totalQuotes > 0 ? acceptedQuotes / totalQuotes : 0;

    const lifetimeValue = quotes
      .filter(q => q.status === 'accepted')
      .reduce((sum, q) => sum + (q.total || 0), 0);

    const avgDealSize = acceptedQuotes > 0 ? lifetimeValue / acceptedQuotes : 0;

    const lastAcceptedQuote = quotes.find(q => q.status === 'accepted');
    const lastBookingDate = lastAcceptedQuote?.createdAt || new Date().toISOString();

    // Calculate average lead time (days between quote creation and acceptance)
    const leadTimes = quotes
      .filter(q => q.status === 'accepted' && q.updatedAt && q.createdAt)
      .map(q => {
        const created = new Date(q.createdAt);
        const updated = new Date(q.updatedAt);
        return Math.floor((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      });

    const avgLeadTime = leadTimes.length > 0
      ? Math.round(leadTimes.reduce((sum, t) => sum + t, 0) / leadTimes.length)
      : 45;

    // Mock response time (in production, calculate from communication logs)
    const avgResponseTime = 4.2;

    // Risk score calculation (0 = no risk, higher = more risk)
    const riskScore = 0; // In production: check cancellations, late payments, disputes

    const intelligence = {
      lifetimeValue: Math.round(lifetimeValue),
      conversionRate: Math.round(conversionRate * 100) / 100,
      avgResponseTime,
      avgDealSize: Math.round(avgDealSize),
      lastBookingDate,
      outstandingBalance: 0, // In production: check payment records
      totalQuotes,
      acceptedQuotes,
      preferredClass: 'Business', // In production: analyze booking patterns
      leadTime: avgLeadTime,
      riskScore,
    };

    return NextResponse.json({ intelligence });
  } catch (error) {
    console.error('Error fetching client stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client statistics' },
      { status: 500 }
    );
  }
}
