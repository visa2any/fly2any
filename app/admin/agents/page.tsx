// app/admin/agents/page.tsx
// Admin Agents Management - Level 6 Ultra-Premium
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import AgentsAdminClient from './AgentsAdminClient';

export const metadata = {
  title: 'Manage Agents - Admin',
  description: 'Manage travel agents, commissions, and performance',
};

export default async function AdminAgentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/signin');

  const user = await prisma!.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    redirect('/');
  }

  const [agents, stats] = await Promise.all([
    prisma!.travelAgent.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        _count: { select: { quotes: true, bookings: true, clients: true, commissions: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma!.travelAgent.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
  ]);

  const commissionStats = await prisma!.agentCommission.aggregate({
    _sum: { agentEarnings: true, platformFee: true },
  });

  // BULLETPROOF: JSON stringify/parse
  const serializedAgents = JSON.parse(JSON.stringify(agents));

  return (
    <AgentsAdminClient
      initialAgents={serializedAgents}
      stats={JSON.parse(JSON.stringify({
        byStatus: Object.fromEntries(stats.map(s => [s.status, s._count.id])),
        totalCommissions: commissionStats._sum.agentEarnings || 0,
        platformFees: commissionStats._sum.platformFee || 0,
        total: agents.length,
      }))}
    />
  );
}
