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

  // Serialize - EXPLICIT fields only (no spread)
  const serializedAgent = {
    id: agent.id,
    businessName: agent.businessName,
    status: agent.status,
    phone: agent.phone,
    defaultCommission: Number(agent.defaultCommission) || 0.05,
    createdAt: agent.createdAt.toISOString(),
    user: {
      id: agent.user.id,
      name: agent.user.name,
      email: agent.user.email,
      image: agent.user.image,
    },
    quotes: agent.quotes.map(q => ({
      id: q.id,
      quoteNumber: q.quoteNumber,
      tripName: q.tripName,
      status: q.status,
      total: Number(q.total) || 0,
      createdAt: q.createdAt.toISOString(),
    })),
    bookings: agent.bookings.map(b => ({
      id: b.id,
      bookingNumber: b.bookingNumber,
      status: b.status,
      total: Number(b.total) || 0,
      createdAt: b.createdAt.toISOString(),
    })),
    _count: agent._count,
  };

  return <AgentDetailAdmin agent={serializedAgent} stats={{ totalEarnings, platformFees }} />;
}
