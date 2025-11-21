// app/agent/payouts/page.tsx
// Agent Payouts - Request withdrawals and view payout history
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import PayoutsClient from "@/components/agent/PayoutsClient";

export const metadata = {
  title: "Payouts - Agent Portal",
  description: "Request payouts and manage your earnings withdrawals",
};

export default async function AgentPayoutsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/agent/payouts");
  }

  const agent = await prisma!.travelAgent.findUnique({
    where: { userId: session.user.id },
  });

  if (!agent) {
    redirect("/agent/register");
  }

  if (agent.status !== "ACTIVE") {
    return (
      <div className="max-w-4xl mx-auto mt-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">
            Account Pending Approval
          </h2>
          <p className="text-yellow-700">
            Your agent account is pending approval. Payout requests will be available once activated.
          </p>
        </div>
      </div>
    );
  }

  // Fetch available commission balance
  const availableCommissions = await prisma!.agentCommission.findMany({
    where: {
      agentId: agent.id,
      status: "AVAILABLE",
    },
    select: {
      id: true,
      agentEarnings: true,
      booking: {
        select: {
          confirmationNumber: true,
          tripName: true,
        },
      },
    },
  });

  const availableBalance = availableCommissions.reduce(
    (sum, c) => sum + c.agentEarnings,
    0
  );

  // Fetch all payouts
  const payouts = await prisma!.agentPayout.findMany({
    where: { agentId: agent.id },
    include: {
      commissionsIncluded: {
        select: {
          id: true,
          agentEarnings: true,
          booking: {
            select: {
              confirmationNumber: true,
              tripName: true,
            },
          },
        },
      },
    },
    orderBy: { requestedAt: "desc" },
  });

  // Calculate stats
  const stats = {
    totalPayouts: payouts.length,
    totalPaid: payouts
      .filter((p) => p.status === "COMPLETED")
      .reduce((sum, p) => sum + p.amount, 0),
    pending: payouts.filter((p) => p.status === "PENDING").length,
    processing: payouts.filter((p) => p.status === "PROCESSING").length,
    completed: payouts.filter((p) => p.status === "COMPLETED").length,
    failed: payouts.filter((p) => p.status === "FAILED").length,
    pendingAmount: payouts
      .filter((p) => p.status === "PENDING" || p.status === "PROCESSING")
      .reduce((sum, p) => sum + p.amount, 0),
    averagePayoutAmount:
      payouts.length > 0
        ? payouts.reduce((sum, p) => sum + p.amount, 0) / payouts.length
        : 0,
    lastPayoutDate: payouts
      .filter((p) => p.completedAt)
      .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))[0]?.completedAt,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payouts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Request withdrawals and manage your earnings
          </p>
        </div>
      </div>

      {/* Client Component */}
      <PayoutsClient
        payouts={payouts}
        stats={stats}
        availableBalance={availableBalance}
        availableCommissions={availableCommissions}
        agent={agent}
      />
    </div>
  );
}
