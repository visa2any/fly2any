// app/agency/payouts/page.tsx
// Payouts & Stripe Connect Page - Level 6 Ultra-Premium
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import PayoutsContent from "@/components/agency/PayoutsContent";

export const metadata = {
  title: "Payouts - Agency Portal",
  description: "Manage your agency payouts and Stripe Connect",
};

export default async function PayoutsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const agent = await prisma!.travelAgent.findUnique({
    where: { userId: session.user.id },
  });

  if (!agent || (agent.tier !== "AGENCY" && !agent.hasTeamManagement)) {
    redirect("/agent");
  }

  // Get payout history
  const payouts = await prisma!.agentPayout.findMany({
    where: { agentId: agent.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  // Get commission history
  const commissions = await prisma!.agentCommission.findMany({
    where: { agentId: agent.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      booking: {
        select: {
          tripName: true,
          confirmationNumber: true,
        },
      },
    },
  });

  return (
    <PayoutsContent
      agent={{
        id: agent.id,
        stripeAccountId: agent.stripeAccountId,
        currentBalance: agent.currentBalance,
        availableBalance: agent.availableBalance,
        pendingBalance: agent.pendingBalance,
        lifetimeEarnings: agent.lifetimeEarnings,
        lifetimePaid: agent.lifetimePaid,
        minPayoutThreshold: agent.minPayoutThreshold,
        payoutMethod: agent.payoutMethod,
        payoutSchedule: agent.payoutSchedule,
      }}
      payouts={payouts}
      commissions={commissions}
    />
  );
}
