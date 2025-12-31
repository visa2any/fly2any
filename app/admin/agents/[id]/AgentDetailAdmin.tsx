'use client';

// app/admin/agents/[id]/AgentDetailAdmin.tsx
// Level 6 Ultra-Premium Admin Agent Detail
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft, User, Mail, Phone, Calendar, DollarSign, FileText, Plane,
  Users, CheckCircle, Clock, XCircle, Building2, Edit, Save, Loader2
} from 'lucide-react';

interface Props {
  agent: any;
  stats: { totalEarnings: number; platformFees: number };
}

const statusConfig: Record<string, { bg: string; text: string; icon: any }> = {
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock },
  ACTIVE: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle },
  SUSPENDED: { bg: 'bg-red-50', text: 'text-red-700', icon: XCircle },
};

const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

export default function AgentDetailAdmin({ agent, stats }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [commissionRate, setCommissionRate] = useState((agent.defaultCommission || 0.05) * 100);
  const [loading, setLoading] = useState(false);

  const updateAgent = async (data: any) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/agents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: agent.id, ...data }),
      });
      if (!res.ok) throw new Error();
      toast.success('Agent updated');
      router.refresh();
      setEditing(false);
    } catch {
      toast.error('Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const sc = statusConfig[agent.status] || statusConfig.PENDING;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/agents" className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{agent.businessName || agent.user.name}</h1>
          <p className="text-gray-500">{agent.user.email}</p>
        </div>
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${sc.bg} ${sc.text}`}>
          <sc.icon className="w-4 h-4" />
          {agent.status}
        </span>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Earnings', value: formatCurrency(stats.totalEarnings), icon: DollarSign, gradient: 'from-emerald-500 to-teal-600' },
          { label: 'Platform Fees', value: formatCurrency(stats.platformFees), icon: Building2, gradient: 'from-blue-500 to-indigo-600' },
          { label: 'Quotes', value: agent._count.quotes, icon: FileText, gradient: 'from-purple-500 to-pink-600' },
          { label: 'Bookings', value: agent._count.bookings, icon: Plane, gradient: 'from-amber-500 to-orange-600' },
          { label: 'Clients', value: agent._count.clients, icon: Users, gradient: 'from-cyan-500 to-blue-600' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-2`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Agent Details</h2>
          <button
            onClick={() => editing ? updateAgent({ commissionRate }) : setEditing(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
            {editing ? 'Save' : 'Edit'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Business Name</p>
                <p className="font-medium text-gray-900">{agent.businessName || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{agent.phone || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Joined</p>
                <p className="font-medium text-gray-900">{new Date(agent.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500">Commission Rate (%)</label>
              {editing ? (
                <input
                  type="number"
                  value={commissionRate}
                  onChange={e => setCommissionRate(parseFloat(e.target.value))}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="font-medium text-gray-900 text-xl">{((agent.defaultCommission || 0.05) * 100).toFixed(0)}%</p>
              )}
            </div>
            <div className="flex gap-2">
              {agent.status !== 'ACTIVE' && (
                <button
                  onClick={() => updateAgent({ status: 'ACTIVE' })}
                  disabled={loading}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                >
                  Activate
                </button>
              )}
              {agent.status === 'ACTIVE' && (
                <button
                  onClick={() => updateAgent({ status: 'SUSPENDED' })}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  Suspend
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quotes */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Recent Quotes</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {agent.quotes.length === 0 ? (
              <p className="p-5 text-sm text-gray-500 text-center">No quotes yet</p>
            ) : (
              agent.quotes.slice(0, 5).map((q: any) => (
                <div key={q.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{q.tripName}</p>
                    <p className="text-xs text-gray-500">{q.quoteNumber}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(q.total)}</p>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Recent Bookings</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {agent.bookings.length === 0 ? (
              <p className="p-5 text-sm text-gray-500 text-center">No bookings yet</p>
            ) : (
              agent.bookings.slice(0, 5).map((b: any) => (
                <div key={b.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{b.bookingNumber}</p>
                    <p className="text-xs text-gray-500">{b.status}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(b.total)}</p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
