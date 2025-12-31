// app/agent/payouts/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Payouts - Agent Portal",
  description: "Request payouts and manage your earnings withdrawals",
};

export default async function AgentPayoutsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/agent/payouts");
  }

  const agent = await prisma?.travelAgent.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      status: true,
      payoutMethod: true,
      payoutEmail: true,
      availableBalance: true,
      pendingBalance: true,
      currentBalance: true,
      minPayoutThreshold: true,
    },
  });

  if (!agent) {
    redirect("/agent/register");
  }

  if (agent.status !== "ACTIVE") {
    return (
      <div className="max-w-4xl mx-auto mt-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Account Pending</h2>
          <p className="text-yellow-700">Payout requests available once activated.</p>
        </div>
      </div>
    );
  }

  const availableBalance = Number(agent.availableBalance) || 0;
  const minThreshold = Number(agent.minPayoutThreshold) || 100;
  const hasPayoutMethod = Boolean(agent.payoutEmail);

  // Fetch payouts
  const payoutsRaw = await prisma?.agentPayout.findMany({
    where: { agentId: agent.id },
    select: {
      id: true,
      payoutNumber: true,
      amount: true,
      status: true,
      payoutMethod: true,
    },
    orderBy: { requestedAt: "desc" },
    take: 20,
  });

  const payouts = (payoutsRaw || []).map((p: any) => ({
    id: String(p.id),
    payoutNumber: p.payoutNumber ? String(p.payoutNumber) : null,
    amount: Number(p.amount) || 0,
    status: String(p.status || "PENDING"),
    payoutMethod: p.payoutMethod ? String(p.payoutMethod) : "stripe",
  }));

  const totalPaid = payouts.filter((p) => p.status === "COMPLETED").reduce((s, p) => s + p.amount, 0);

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    PROCESSING: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
    FAILED: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Payouts</h1>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm">Available Balance</p>
            <p className="text-4xl font-bold">${availableBalance.toLocaleString()}</p>
          </div>
          {availableBalance >= minThreshold && hasPayoutMethod ? (
            <Link href="/agent/payouts/request" className="px-6 py-3 bg-white text-green-600 rounded-lg font-medium">
              Request Payout
            </Link>
          ) : (
            <div className="text-right text-green-100 text-sm">
              Min: ${minThreshold}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Total Payouts</p>
          <p className="text-2xl font-bold">{payouts.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-600">Total Paid</p>
          <p className="text-2xl font-bold text-green-900">${totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-900">
            {payouts.filter((p) => p.status === "PENDING" || p.status === "PROCESSING").length}
          </p>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h2 className="font-medium">Payout History</h2>
        </div>
        {payouts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No payouts yet.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Payout #</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payouts.map((payout) => (
                <tr key={payout.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{payout.payoutNumber || `#${payout.id.slice(0, 8)}`}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[payout.status] || "bg-gray-100"}`}>
                      {payout.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">${payout.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
