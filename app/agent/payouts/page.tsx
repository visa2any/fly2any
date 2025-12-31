// app/agent/payouts/page.tsx
// Agent Payouts - Request withdrawals and view payout history
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

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
      paypalEmail: true,
      bankName: true,
      bankAccountLast4: true,
    },
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

  // Fetch available commission balance (no DateTime fields)
  const availableCommissionsRaw = await prisma?.agentCommission.findMany({
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

  const availableCommissions = (availableCommissionsRaw || []).map((c: any) => ({
    id: String(c.id || ""),
    agentEarnings: Number(c.agentEarnings) || 0,
    confirmationNumber: c.booking?.confirmationNumber ? String(c.booking.confirmationNumber) : null,
    tripName: c.booking?.tripName ? String(c.booking.tripName) : "Unknown Trip",
  }));

  const availableBalance = availableCommissions.reduce(
    (sum, c) => sum + c.agentEarnings,
    0
  );

  // Fetch all payouts (no DateTime fields in select)
  const payoutsRaw = await prisma?.agentPayout.findMany({
    where: { agentId: agent.id },
    select: {
      id: true,
      payoutNumber: true,
      amount: true,
      status: true,
      payoutMethod: true,
      notes: true,
      _count: {
        select: {
          commissionsIncluded: true,
        },
      },
    },
    orderBy: { requestedAt: "desc" },
    take: 50,
  });

  // Explicit primitive serialization
  const payouts = (payoutsRaw || []).map((p: any) => ({
    id: String(p.id || ""),
    payoutNumber: p.payoutNumber ? String(p.payoutNumber) : null,
    amount: Number(p.amount) || 0,
    status: String(p.status || "PENDING"),
    payoutMethod: p.payoutMethod ? String(p.payoutMethod) : null,
    notes: p.notes ? String(p.notes) : null,
    commissionsCount: Number(p._count?.commissionsIncluded) || 0,
  }));

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
  };

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    PROCESSING: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
    FAILED: "bg-red-100 text-red-700",
    CANCELLED: "bg-gray-100 text-gray-700",
  };

  const hasPayoutMethod = agent.payoutMethod && (
    (agent.payoutMethod === "PAYPAL" && agent.paypalEmail) ||
    (agent.payoutMethod === "BANK_TRANSFER" && agent.bankName)
  );

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

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm">Available Balance</p>
            <p className="text-4xl font-bold mt-1">${availableBalance.toLocaleString()}</p>
            <p className="text-green-100 text-sm mt-2">
              {availableCommissions.length} commission{availableCommissions.length !== 1 ? "s" : ""} ready for withdrawal
            </p>
          </div>
          {availableBalance >= 50 && hasPayoutMethod ? (
            <Link
              href="/agent/payouts/request"
              className="px-6 py-3 bg-white text-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors"
            >
              Request Payout
            </Link>
          ) : availableBalance < 50 ? (
            <div className="text-right">
              <p className="text-green-100 text-sm">Minimum: $50</p>
              <p className="text-green-100 text-xs">${(50 - availableBalance).toFixed(2)} more needed</p>
            </div>
          ) : (
            <Link
              href="/agent/settings"
              className="px-6 py-3 bg-white text-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors"
            >
              Set Up Payout Method
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Total Payouts</p>
          <p className="text-2xl font-bold">{stats.totalPayouts}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-600">Total Paid</p>
          <p className="text-2xl font-bold text-green-900">${stats.totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600">Processing</p>
          <p className="text-2xl font-bold text-blue-900">{stats.processing}</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
          <p className="text-sm text-emerald-600">Completed</p>
          <p className="text-2xl font-bold text-emerald-900">{stats.completed}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <p className="text-sm text-orange-600">In Transit</p>
          <p className="text-2xl font-bold text-orange-900">${stats.pendingAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* Payout Method Info */}
      {!hasPayoutMethod && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium text-yellow-800">No Payout Method Set</p>
              <p className="text-sm text-yellow-700 mt-1">
                Configure your payout method in settings to receive your earnings.
              </p>
              <Link
                href="/agent/settings"
                className="inline-block mt-2 text-sm text-yellow-800 font-medium hover:underline"
              >
                Go to Settings →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Payouts Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h2 className="font-medium text-gray-900">Payout History</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Payout #</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Method</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Commissions</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Amount</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {payouts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No payouts yet. Request your first payout when you have available earnings.
                </td>
              </tr>
            ) : (
              payouts.map((payout) => (
                <tr key={payout.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    {payout.payoutNumber || `#${payout.id.slice(0, 8)}`}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {payout.payoutMethod === "PAYPAL" ? "PayPal" :
                     payout.payoutMethod === "BANK_TRANSFER" ? "Bank Transfer" :
                     payout.payoutMethod || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[payout.status] || "bg-gray-100 text-gray-700"}`}>
                      {payout.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {payout.commissionsCount}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    ${payout.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/agent/payouts/${payout.id}`}
                      className="text-primary-600 hover:underline text-sm"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Available Commissions */}
      {availableCommissions.length > 0 && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h2 className="font-medium text-gray-900">Available Commissions</h2>
            <p className="text-sm text-gray-500">These commissions are ready for withdrawal</p>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Trip</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Confirmation</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {availableCommissions.map((commission) => (
                <tr key={commission.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{commission.tripName}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {commission.confirmationNumber || "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-green-600">
                    ${commission.agentEarnings.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
