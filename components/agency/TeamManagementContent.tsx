'use client';

// components/agency/TeamManagementContent.tsx
// Level 6 Ultra-Premium Team Management
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, MoreVertical, Mail, TrendingUp,
  CheckCircle, Clock, XCircle, Edit, Trash2, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TeamMember {
  id: string;
  role: string;
  commissionSplit: number;
  active: boolean;
  canManageClients: boolean;
  canCreateQuotes: boolean;
  canAcceptBookings: boolean;
  canViewReports: boolean;
  joinedAt: Date | null;
  agent: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    totalSales: number;
    totalCommissions: number;
    quotesSent: number;
    quotesAccepted: number;
    status: string;
    user: { image: string | null };
  };
}

interface Props {
  teamMembers: TeamMember[];
  maxTeamMembers: number;
}

export default function TeamManagementContent({ teamMembers, maxTeamMembers }: Props) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'AGENT',
    commissionSplit: 70,
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);

    try {
      const res = await fetch('/api/agency/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success('Team member invited!');
      setShowInviteModal(false);
      setFormData({ firstName: '', lastName: '', email: '', role: 'AGENT', commissionSplit: 70 });
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Failed to invite');
    } finally {
      setInviting(false);
    }
  };

  const getStatusBadge = (status: string, active: boolean) => {
    if (!active) return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Inactive' };
    switch (status) {
      case 'ACTIVE': return { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Active' };
      case 'PENDING': return { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Pending' };
      default: return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-50', label: status };
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-1">
            {teamMembers.length} of {maxTeamMembers} members
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowInviteModal(true)}
          disabled={teamMembers.length >= maxTeamMembers}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 disabled:opacity-50"
        >
          <UserPlus className="w-4 h-4" />
          Invite Agent
        </motion.button>
      </div>

      {/* Team Grid */}
      {teamMembers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl p-12 text-center border border-gray-100"
        >
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Team Members Yet</h3>
          <p className="text-gray-500 mb-6">Invite agents to join your agency</p>
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition-colors"
          >
            Invite Your First Agent
          </button>
        </motion.div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member, idx) => {
            const status = getStatusBadge(member.agent.status, member.active);
            const StatusIcon = status.icon;
            const conversionRate = member.agent.quotesSent > 0
              ? ((member.agent.quotesAccepted / member.agent.quotesSent) * 100).toFixed(0)
              : '0';

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {member.agent.user.image ? (
                      <img
                        src={member.agent.user.image}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {(member.agent.firstName?.[0] || 'A').toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">
                        {member.agent.firstName} {member.agent.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{member.agent.email}</p>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 py-3 border-y border-gray-100">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{member.agent.quotesSent}</p>
                    <p className="text-xs text-gray-500">Quotes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-emerald-600">{conversionRate}%</p>
                    <p className="text-xs text-gray-500">Conv.</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">${(member.agent.totalSales / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-gray-500">Sales</p>
                  </div>
                </div>

                {/* Commission */}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Commission Split</span>
                  <span className="text-sm font-semibold text-indigo-600">
                    {(member.commissionSplit * 100).toFixed(0)}%
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowInviteModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Invite Team Member</h3>
                <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleInvite} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commission Split (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.commissionSplit}
                    onChange={(e) => setFormData({ ...formData, commissionSplit: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Percentage of markup the agent receives</p>
                </div>
                <button
                  type="submit"
                  disabled={inviting}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50"
                >
                  {inviting ? 'Inviting...' : 'Send Invitation'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
