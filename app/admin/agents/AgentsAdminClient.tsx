'use client';

// app/admin/agents/AgentsAdminClient.tsx
// Level 6 Ultra-Premium Admin Agents Management
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Search, Users, DollarSign, CheckCircle, Clock, XCircle, Building2,
  Mail, Phone, ChevronRight, TrendingUp, FileText, Plane, Star, Filter
} from 'lucide-react';

interface Agent {
  id: string;
  userId: string;
  businessName: string | null;
  status: string;
  defaultCommission: number;
  phone: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string; image: string | null };
  _count: { quotes: number; bookings: number; clients: number; commissions: number };
}

interface Props {
  initialAgents: Agent[];
  stats: {
    byStatus: Record<string, number>;
    totalCommissions: number;
    platformFees: number;
    total: number;
  };
}

const statusConfig: Record<string, { bg: string; text: string; icon: any; dot: string }> = {
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock, dot: 'bg-amber-500' },
  ACTIVE: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle, dot: 'bg-emerald-500' },
  SUSPENDED: { bg: 'bg-red-50', text: 'text-red-700', icon: XCircle, dot: 'bg-red-500' },
  INACTIVE: { bg: 'bg-gray-50', text: 'text-gray-700', icon: XCircle, dot: 'bg-gray-500' },
};

const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

export default function AgentsAdminClient({ initialAgents, stats }: Props) {
  const [agents, setAgents] = useState(initialAgents);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = agents.filter(a => {
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return a.businessName?.toLowerCase().includes(s) ||
        a.user.name?.toLowerCase().includes(s) ||
        a.user.email.toLowerCase().includes(s);
    }
    return true;
  });

  const updateStatus = async (id: string, status: string) => {
    setLoading(id);
    try {
      const res = await fetch('/api/admin/agents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: id, status }),
      });
      if (!res.ok) throw new Error();
      setAgents(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      toast.success('Agent status updated');
    } catch {
      toast.error('Failed to update');
    } finally {
      setLoading(null);
    }
  };

  const statCards = [
    { label: 'Total Agents', value: stats.total, icon: Users, gradient: 'from-indigo-500 to-purple-600' },
    { label: 'Active', value: stats.byStatus.ACTIVE || 0, icon: CheckCircle, gradient: 'from-emerald-500 to-teal-600' },
    { label: 'Pending', value: stats.byStatus.PENDING || 0, icon: Clock, gradient: 'from-amber-500 to-orange-600' },
    { label: 'Total Commissions', value: formatCurrency(stats.totalCommissions), icon: DollarSign, gradient: 'from-blue-500 to-cyan-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Travel Agents</h1>
          <p className="text-gray-500 mt-1">Manage agent accounts, commissions, and performance</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)]"
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search agents..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            {['ALL', 'ACTIVE', 'PENDING', 'SUSPENDED'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <p className="text-sm text-gray-500">
        Showing <span className="font-medium text-gray-900">{filtered.length}</span> agents
      </p>

      {/* Agents Table */}
      {filtered.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Agent', 'Contact', 'Performance', 'Commission', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((agent, idx) => {
                  const sc = statusConfig[agent.status] || statusConfig.PENDING;
                  return (
                    <motion.tr
                      key={agent.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-bold">
                            {(agent.user.name || agent.user.email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{agent.businessName || agent.user.name}</p>
                            <p className="text-xs text-gray-500">{agent.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-900">{agent.phone || '-'}</p>
                        <p className="text-xs text-gray-500">Joined {new Date(agent.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1"><FileText className="w-4 h-4 text-gray-400" />{agent._count.quotes}</span>
                          <span className="flex items-center gap-1"><Plane className="w-4 h-4 text-gray-400" />{agent._count.bookings}</span>
                          <span className="flex items-center gap-1"><Users className="w-4 h-4 text-gray-400" />{agent._count.clients}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-900">{(agent.defaultCommission * 100).toFixed(0)}%</p>
                        <p className="text-xs text-gray-500">{agent._count.commissions} earned</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {agent.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {agent.status === 'PENDING' && (
                            <button
                              onClick={() => updateStatus(agent.id, 'ACTIVE')}
                              disabled={loading === agent.id}
                              className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                            >
                              Approve
                            </button>
                          )}
                          {agent.status === 'ACTIVE' && (
                            <button
                              onClick={() => updateStatus(agent.id, 'SUSPENDED')}
                              disabled={loading === agent.id}
                              className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                              Suspend
                            </button>
                          )}
                          <Link href={`/admin/agents/${agent.id}`} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium inline-flex items-center gap-1">
                            View <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No agents found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your filters</p>
        </motion.div>
      )}
    </div>
  );
}
