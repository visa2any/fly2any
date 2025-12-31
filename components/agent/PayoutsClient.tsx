'use client';

// components/agent/PayoutsClient.tsx
// Level 6 Ultra-Premium Payouts Client
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Wallet, DollarSign, Clock, CheckCircle, XCircle, Loader2,
  Receipt, TrendingUp, AlertCircle, X
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

interface PayoutsClientProps {
  payouts: any[];
  stats: any;
  availableBalance: number;
  availableCommissions: any[];
  agent: any;
}

const statusConfig: Record<string, { bg: string; text: string; icon: any; dot: string }> = {
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock, dot: 'bg-amber-500' },
  PROCESSING: { bg: 'bg-blue-50', text: 'text-blue-700', icon: Loader2, dot: 'bg-blue-500' },
  COMPLETED: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle, dot: 'bg-emerald-500' },
  FAILED: { bg: 'bg-red-50', text: 'text-red-700', icon: XCircle, dot: 'bg-red-500' },
  CANCELLED: { bg: 'bg-gray-50', text: 'text-gray-700', icon: XCircle, dot: 'bg-gray-500' },
};

export default function PayoutsClient({
  payouts, stats, availableBalance, availableCommissions, agent,
}: PayoutsClientProps) {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestAmount, setRequestAmount] = useState(availableBalance);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestPayout = async () => {
    if (requestAmount <= 0 || requestAmount > availableBalance) {
      toast.error('Invalid payout amount');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/agents/payouts/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: requestAmount }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Payout request submitted!');
      setShowRequestModal(false);
      window.location.reload();
    } catch {
      toast.error('Failed to request payout');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statCards = [
    { label: 'Available', value: formatCurrency(availableBalance), sub: `${availableCommissions.length} ready`, icon: Wallet, gradient: 'from-emerald-500 to-teal-600' },
    { label: 'Total Paid', value: formatCurrency(stats.totalPaid), sub: `${stats.completed} completed`, icon: CheckCircle, gradient: 'from-blue-500 to-indigo-600' },
    { label: 'Pending', value: formatCurrency(stats.pendingAmount), sub: `${stats.pending + stats.processing} in process`, icon: Clock, gradient: 'from-amber-500 to-orange-600' },
    { label: 'Average', value: formatCurrency(stats.averagePayoutAmount), sub: `${stats.totalPayouts} total`, icon: TrendingUp, gradient: 'from-purple-500 to-pink-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Request Payout CTA */}
      <AnimatePresence>
        {availableBalance > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-emerald-900">Ready to Withdraw</p>
                  <p className="text-sm text-emerald-700">{formatCurrency(availableBalance)} available</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowRequestModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-700 transition-all"
              >
                Request Payout
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payout History */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Payout History</h3>
        </div>

        {payouts.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No payouts yet</h3>
            <p className="text-gray-500 mt-1">Your payout requests will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Payout #', 'Amount', 'Commissions', 'Requested', 'Status', 'Paid Date'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payouts.map((p, idx) => {
                  const sc = statusConfig[p.status] || statusConfig.PENDING;
                  return (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4 text-sm font-medium text-gray-900">{p.payoutNumber}</td>
                      <td className="px-5 py-4 text-sm font-bold text-gray-900">{formatCurrency(p.amount)}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{p.commissions.length} commissions</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{formatDate(p.requestedAt)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{p.paidAt ? formatDate(p.paidAt) : '-'}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Request Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => !isSubmitting && setShowRequestModal(false)}
            />
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              >
                <div className="p-6">
                  <button
                    onClick={() => setShowRequestModal(false)}
                    disabled={isSubmitting}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25">
                    <Wallet className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Request Payout</h3>
                  <p className="text-gray-600 text-center mb-6">Enter the amount you'd like to withdraw</p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={requestAmount}
                          onChange={e => setRequestAmount(parseFloat(e.target.value) || 0)}
                          max={availableBalance}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg font-semibold"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Available: {formatCurrency(availableBalance)}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowRequestModal(false)}
                        disabled={isSubmitting}
                        className="py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleRequestPayout}
                        disabled={isSubmitting || requestAmount <= 0 || requestAmount > availableBalance}
                        className="py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Submitting...
                          </>
                        ) : 'Submit Request'}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
