'use client';

// components/agent/QuoteListClient.tsx
// Level 6 Ultra-Premium Quote List
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Calendar, Users, DollarSign, Send, Eye, CheckCircle,
  XCircle, Clock, ChevronRight, Trash2, Copy, ExternalLink, FileText
} from 'lucide-react';

interface Quote {
  id: string;
  tripName: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  travelers: number;
  total: number;
  currency: string;
  status: string;
  shareableLink?: string | null;
  client: { firstName: string; lastName: string; email: string };
  createdAt: Date;
  sentAt: Date | null;
  expiresAt: Date;
}

const statusConfig: Record<string, { bg: string; text: string; icon: any; dot: string }> = {
  DRAFT: { bg: 'bg-gray-50', text: 'text-gray-700', icon: FileText, dot: 'bg-gray-400' },
  SENT: { bg: 'bg-blue-50', text: 'text-blue-700', icon: Send, dot: 'bg-blue-500' },
  VIEWED: { bg: 'bg-purple-50', text: 'text-purple-700', icon: Eye, dot: 'bg-purple-500' },
  ACCEPTED: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle, dot: 'bg-emerald-500' },
  DECLINED: { bg: 'bg-red-50', text: 'text-red-700', icon: XCircle, dot: 'bg-red-500' },
  EXPIRED: { bg: 'bg-orange-50', text: 'text-orange-700', icon: Clock, dot: 'bg-orange-500' },
  CONVERTED: { bg: 'bg-teal-50', text: 'text-teal-700', icon: CheckCircle, dot: 'bg-teal-500' },
};

export default function QuoteListClient({ quotes }: { quotes: Quote[] }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState<string | null>(null);

  const filteredQuotes = quotes.filter(q => {
    if (statusFilter !== 'ALL' && q.status !== statusFilter) return false;
    if (searchQuery) {
      const s = searchQuery.toLowerCase();
      return q.tripName.toLowerCase().includes(s) || q.destination.toLowerCase().includes(s) ||
        `${q.client.firstName} ${q.client.lastName}`.toLowerCase().includes(s);
    }
    return true;
  });

  const handleSend = async (id: string, name: string) => {
    if (!confirm(`Send quote to ${name}?`)) return;
    setLoading(id);
    try {
      const res = await fetch(`/api/agents/quotes/${id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: 'Your Travel Quote', message: 'Please review your quote.' }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Quote sent!');
      router.refresh();
    } catch {
      toast.error('Failed to send');
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    setLoading(id);
    try {
      const res = await fetch(`/api/agents/quotes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      toast.success('Quote deleted');
      router.refresh();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setLoading(null);
    }
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/client/quotes/${link}`);
    toast.success('Link copied!');
  };

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  const formatDate = (d: Date) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const statuses = ['ALL', 'DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'DECLINED', 'EXPIRED'];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search quotes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
            {statuses.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
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
        Showing <span className="font-medium text-gray-900">{filteredQuotes.length}</span> quotes
      </p>

      {filteredQuotes.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No quotes found</h3>
          <p className="text-gray-500 mt-1">Try adjusting filters or create a new quote</p>
        </motion.div>
      )}

      {/* Quote Cards */}
      <AnimatePresence>
        {filteredQuotes.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQuotes.map((q, idx) => {
              const sc = statusConfig[q.status] || statusConfig.DRAFT;
              const StatusIcon = sc.icon;
              const isExpired = new Date() > new Date(q.expiresAt) && !['ACCEPTED', 'CONVERTED', 'DECLINED'].includes(q.status);
              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {isExpired ? 'Expired' : q.status.replace('_', ' ')}
                    </span>
                    <div className="flex gap-1">
                      {q.shareableLink && (
                        <button onClick={() => copyLink(q.shareableLink!)} className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(q.id, q.tripName)} disabled={loading === q.id} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <Link href={`/agent/quotes/${q.id}`} className="block">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{q.tripName}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{q.destination}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
                      <Users className="w-4 h-4" />
                      {q.client.firstName} {q.client.lastName}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
                      <Calendar className="w-4 h-4" />
                      {formatDate(q.startDate)} · {q.duration} days
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(q.total)}</p>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </Link>

                  {q.status === 'DRAFT' && (
                    <button
                      onClick={() => handleSend(q.id, `${q.client.firstName} ${q.client.lastName}`)}
                      disabled={loading === q.id}
                      className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {loading === q.id ? 'Sending...' : 'Send to Client'}
                    </button>
                  )}

                  {q.shareableLink && q.status !== 'DRAFT' && (
                    <a
                      href={`/client/quotes/${q.shareableLink}`}
                      target="_blank"
                      className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View as Client
                    </a>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
