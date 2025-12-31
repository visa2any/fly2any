// app/admin/agents/[id]/page.tsx
// Admin Agent Detail Page - Level 6 Ultra-Premium
import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import AgentDetailAdmin from './AgentDetailAdmin';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props) {
  const agent = await prisma!.travelAgent.findUnique({
    where: { id: params.id },
    include: { user: { select: { name: true } } },
  });
  return { title: agent ? `${agent.businessName || agent.user.name} - Admin` : 'Agent Not Found' };
}

export default async function AdminAgentDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/signin');

  const user = await prisma!.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) redirect('/');

  const agent = await prisma!.travelAgent.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, name: true, email: true, image: true, createdAt: true } },
      quotes: { take: 10, orderBy: { createdAt: 'desc' }, select: { id: true, quoteNumber: true, tripName: true, total: true, status: true, createdAt: true } },
      bookings: { take: 10, orderBy: { createdAt: 'desc' }, select: { id: true, bookingNumber: true, total: true, status: true, createdAt: true } },
      commissions: { orderBy: { createdAt: 'desc' }, select: { id: true, agentEarnings: true, platformFee: true, status: true, createdAt: true } },
      _count: { select: { quotes: true, bookings: true, clients: true, commissions: true } },
    },
  });

  if (!agent) notFound();

  const totalEarnings = agent.commissions.reduce((sum, c) => sum + Number(c.agentEarnings), 0);
  const platformFees = agent.commissions.reduce((sum, c) => sum + Number(c.platformFee), 0);

  // Serialize dates AND Decimals for client component
  const serializedAgent = {
    ...agent,
    defaultCommission: Number(agent.defaultCommission) || 0.05,
    totalSales: Number(agent.totalSales) || 0,
    totalCommissions: Number(agent.totalCommissions) || 0,
    createdAt: agent.createdAt.toISOString(),
    updatedAt: agent.updatedAt?.toISOString() || null,
    user: {
      ...agent.user,
      createdAt: agent.user.createdAt?.toISOString() || null,
    },
    quotes: agent.quotes.map(q => ({
      ...q,
      total: Number(q.total) || 0,
      createdAt: q.createdAt.toISOString(),
    })),
    bookings: agent.bookings.map(b => ({
      ...b,
      total: Number(b.total) || 0,
      createdAt: b.createdAt.toISOString(),
    })),
    commissions: agent.commissions.map(c => ({
      ...c,
      agentEarnings: Number(c.agentEarnings) || 0,
      platformFee: Number(c.platformFee) || 0,
      createdAt: c.createdAt.toISOString(),
    })),
  };

  return <AgentDetailAdmin agent={serializedAgent} stats={{ totalEarnings, platformFees }} />;
}
