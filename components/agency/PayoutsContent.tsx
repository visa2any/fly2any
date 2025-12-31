'use client';

// components/agency/PayoutsContent.tsx
// Level 6 Ultra-Premium Payouts Dashboard
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, CreditCard, ArrowUpRight, Clock, CheckCircle,
  XCircle, AlertCircle, ExternalLink, Wallet, TrendingUp,
  RefreshCw, Settings, ChevronRight, Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Agent {
  id: string;
  stripeAccountId: string | null;
  currentBalance: number;
  availableBalance: number;
  pendingBalance: number;
  lifetimeEarnings: number;
  lifetimePaid: number;
  minPayoutThreshold: number;
  payoutMethod: string;
  payoutSchedule: string;
}

interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  processedAt: Date | null;
  createdAt: Date;
}

interface Commission {
  id: string;
  amount: number;
  rate: number;
  status: string;
  createdAt: Date;
  booking: {
    tripName: string;
    confirmationNumber: string;
  } | null;
}

interface Props {
  agent: Agent;
  payouts: Payout[];
  commissions: Commission[];
}

export default function PayoutsContent({ agent, payouts, commissions }: Props) {
  const [stripeStatus, setStripeStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    fetchStripeStatus();
  }, []);

  const fetchStripeStatus = async () => {
    try {
      const res = await fetch('/api/agency/stripe-connect');
      const data = await res.json();
      setStripeStatus(data);
    } catch (error) {
      console.error('Failed to fetch Stripe status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectStripe = async () => {
    setConnecting(true);
    try {
      const res = await fetch('/api/agency/stripe-connect', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to connect Stripe');
      setConnecting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'PAID':
        return { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Completed' };
      case 'PENDING':
        return { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Pending' };
      case 'PROCESSING':
        return { icon: RefreshCw, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Processing' };
      case 'FAILED':
        return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Failed' };
      default:
        return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-50', label: status };
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
        <p className="text-gray-600 mt-1">Manage your earnings and Stripe Connect</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            name: 'Available Balance',
            value: agent.availableBalance,
            icon: Wallet,
            gradient: 'from-emerald-500 to-teal-600',
            info: 'Ready to withdraw',
          },
          {
            name: 'Pending Balance',
            value: agent.pendingBalance,
            icon: Clock,
            gradient: 'from-amber-500 to-orange-600',
            info: 'Processing',
          },
          {
            name: 'Lifetime Earnings',
            value: agent.lifetimeEarnings,
            icon: TrendingUp,
            gradient: 'from-blue-500 to-indigo-600',
            info: 'Total earned',
          },
          {
            name: 'Total Paid Out',
            value: agent.lifetimePaid,
            icon: CreditCard,
            gradient: 'from-violet-500 to-purple-600',
            info: 'All time',
          },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)]"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900">${stat.value.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.info}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Stripe Connect Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Stripe Connect</h2>
              <p className="text-sm text-gray-500">Receive payouts directly to your bank</p>
            </div>
          </div>
          {stripeStatus?.connected && stripeStatus?.details_submitted && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Connected
            </span>
          )}
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : stripeStatus?.connected && stripeStatus?.details_submitted ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Charges</p>
                  <p className={`font-semibold ${stripeStatus.charges_enabled ? 'text-emerald-600' : 'text-red-500'}`}>
                    {stripeStatus.charges_enabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Payouts</p>
                  <p className={`font-semibold ${stripeStatus.payouts_enabled ? 'text-emerald-600' : 'text-red-500'}`}>
                    {stripeStatus.payouts_enabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Available</p>
                  <p className="font-semibold text-gray-900">
                    ${stripeStatus.balance?.available?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Pending</p>
                  <p className="font-semibold text-gray-900">
                    ${stripeStatus.balance?.pending?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>

              {stripeStatus.requirements?.currently_due?.length > 0 && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Action Required</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Please complete the remaining requirements to enable all features.
                    </p>
                    <button
                      onClick={handleConnectStripe}
                      disabled={connecting}
                      className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
                    >
                      {connecting ? 'Loading...' : 'Complete Setup'}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={handleConnectStripe}
                  disabled={connecting}
                  className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <Settings className="w-4 h-4" />
                  {connecting ? 'Loading...' : 'Manage Account'}
                </button>
                <a
                  href="https://dashboard.stripe.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Stripe Dashboard
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Connect Your Bank Account
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Set up Stripe Connect to receive automatic payouts for your commissions directly to your bank account.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConnectStripe}
                disabled={connecting}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 disabled:opacity-50"
              >
                {connecting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Connect with Stripe
                  </>
                )}
              </motion.button>
              <p className="text-xs text-gray-400 mt-4">
                Powered by Stripe. Your data is secure and encrypted.
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Recent Commissions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Commissions</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {commissions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <DollarSign className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No commissions yet</p>
            </div>
          ) : (
            commissions.slice(0, 10).map((commission) => {
              const status = getStatusBadge(commission.status);
              const StatusIcon = status.icon;

              return (
                <div
                  key={commission.id}
                  className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${status.bg}`}>
                      <StatusIcon className={`w-4 h-4 ${status.color}`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {commission.booking?.tripName || 'Booking'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {commission.booking?.confirmationNumber || 'Commission'} • {(commission.rate * 100).toFixed(0)}% rate
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600">+${commission.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(commission.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Payout History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Payout History</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {payouts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <CreditCard className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No payouts yet</p>
            </div>
          ) : (
            payouts.map((payout) => {
              const status = getStatusBadge(payout.status);
              const StatusIcon = status.icon;

              return (
                <div
                  key={payout.id}
                  className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${status.bg}`}>
                      <StatusIcon className={`w-4 h-4 ${status.color}`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Payout to {payout.method}
                      </p>
                      <p className="text-xs text-gray-500">
                        {status.label}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${payout.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(payout.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
}
