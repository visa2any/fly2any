"use client";

import { useState } from "react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { toast } from "react-hot-toast";

interface PayoutsClientProps {
  payouts: any[];
  stats: any;
  availableBalance: number;
  availableCommissions: any[];
  agent: any;
}

export default function PayoutsClient({
  payouts,
  stats,
  availableBalance,
  availableCommissions,
  agent,
}: PayoutsClientProps) {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestAmount, setRequestAmount] = useState(availableBalance);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestPayout = async () => {
    if (requestAmount <= 0 || requestAmount > availableBalance) {
      toast.error("Invalid payout amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/agents/payouts/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: requestAmount }),
      });

      if (!response.ok) throw new Error("Failed to request payout");

      toast.success("Payout request submitted successfully!");
      setShowRequestModal(false);
      window.location.reload();
    } catch (error) {
      toast.error("Failed to request payout");
    } finally {
      setIsSubmitting(false);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const configs: Record<string, { bg: string; text: string }> = {
      PENDING: { bg: "bg-yellow-100", text: "text-yellow-800" },
      PROCESSING: { bg: "bg-blue-100", text: "text-blue-800" },
      COMPLETED: { bg: "bg-green-100", text: "text-green-800" },
      FAILED: { bg: "bg-red-100", text: "text-red-800" },
      CANCELLED: { bg: "bg-gray-100", text: "text-gray-800" },
    };
    const config = configs[status] || configs.PENDING;
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-sm border border-green-200 p-6">
          <p className="text-sm font-medium text-green-700 mb-2">Available to Withdraw</p>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(availableBalance)}</p>
          <p className="text-xs text-green-600 mt-1">
            {availableCommissions.length} commissions ready
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600 mb-2">Total Paid Out</p>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalPaid)}</p>
          <p className="text-xs text-gray-600 mt-1">{stats.completed} payouts completed</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600 mb-2">Pending Payouts</p>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.pendingAmount)}</p>
          <p className="text-xs text-gray-600 mt-1">
            {stats.pending + stats.processing} in process
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600 mb-2">Average Payout</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(stats.averagePayoutAmount)}
          </p>
          <p className="text-xs text-gray-600 mt-1">{stats.totalPayouts} total requests</p>
        </div>
      </div>

      {/* Request Payout Button */}
      {availableBalance > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-900">Ready to Withdraw</h3>
              <p className="text-sm text-green-700 mt-1">
                You have {formatCurrency(availableBalance)} available for withdrawal
              </p>
            </div>
            <button
              onClick={() => setShowRequestModal(true)}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg transition-colors"
            >
              Request Payout
            </button>
          </div>
        </div>
      )}

      {/* Payout History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Payout History</h3>
        </div>

        {payouts.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payouts yet</h3>
            <p className="text-gray-600">Your payout requests will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payout #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commissions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payout.payoutNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {formatCurrency(payout.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {payout.commissions.length} commissions
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(payout.requestedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={payout.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {payout.paidAt ? formatDate(payout.paidAt) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Payout</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(parseFloat(e.target.value) || 0)}
                  max={availableBalance}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Available: {formatCurrency(availableBalance)}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestPayout}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
