'use client';

// components/agent/ClientListClient.tsx
// Level 6 Ultra-Premium Client List
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, LayoutGrid, List, User, Mail, Phone, Building2,
  Star, ChevronRight, Calendar, FileText, Plane, Trash2, Filter
} from 'lucide-react';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  company: string | null;
  segment: string;
  isVip: boolean;
  homeAirport: string | null;
  tags: string[];
  _count: { quotes: number; bookings: number };
  createdAt: Date;
  lastContactDate: Date | null;
}

const segmentConfig: Record<string, { bg: string; text: string; label: string }> = {
  STANDARD: { bg: 'bg-gray-50', text: 'text-gray-700', label: 'Standard' },
  VIP: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'VIP' },
  HONEYMOON: { bg: 'bg-pink-50', text: 'text-pink-700', label: 'Honeymoon' },
  FAMILY: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Family' },
  BUSINESS: { bg: 'bg-teal-50', text: 'text-teal-700', label: 'Business' },
  GROUP_ORGANIZER: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Group' },
  CORPORATE: { bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'Corporate' },
  LUXURY: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Luxury' },
};

export default function ClientListClient({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [loading, setLoading] = useState<string | null>(null);

  const filteredClients = clients
    .filter(c => {
      if (segmentFilter !== 'ALL' && c.segment !== segmentFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          c.firstName.toLowerCase().includes(q) ||
          c.lastName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.company?.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      if (sortBy === 'quotes') return b._count.quotes - a._count.quotes;
      if (sortBy === 'bookings') return b._count.bookings - a._count.bookings;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Archive client "${name}"?`)) return;
    setLoading(id);
    try {
      const res = await fetch(`/api/agents/clients/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      toast.success('Client archived');
      router.refresh();
    } catch {
      toast.error('Failed to archive');
    } finally {
      setLoading(null);
    }
  };

  const formatDate = (d: Date | null) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never';

  const segments = ['ALL', 'STANDARD', 'VIP', 'HONEYMOON', 'FAMILY', 'BUSINESS', 'CORPORATE', 'LUXURY'];

  return (
    <div className="space-y-6">
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
              placeholder="Search clients..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
            {segments.map(s => (
              <button
                key={s}
                onClick={() => setSegmentFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  segmentFilter === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s === 'ALL' ? 'All' : segmentConfig[s]?.label || s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="recent">Recent</option>
              <option value="name">Name</option>
              <option value="quotes">Quotes</option>
              <option value="bookings">Bookings</option>
            </select>
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}>
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <p className="text-sm text-gray-500">
        Showing <span className="font-medium text-gray-900">{filteredClients.length}</span> clients
      </p>

      {/* Empty */}
      {filteredClients.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No clients found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your filters or add a new client</p>
        </motion.div>
      )}

      {/* Grid View */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' && filteredClients.length > 0 && (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((c, idx) => {
              const seg = segmentConfig[c.segment] || segmentConfig.STANDARD;
              return (
                <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }}>
                  <Link href={`/agent/clients/${c.id}`} className="block bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                        {c.firstName.charAt(0)}{c.lastName.charAt(0)}
                      </div>
                      <div className="flex items-center gap-2">
                        {c.isVip && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${seg.bg} ${seg.text}`}>{seg.label}</span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900">{c.firstName} {c.lastName}</h3>
                    <p className="text-sm text-gray-500 truncate">{c.email}</p>
                    {c.company && <p className="text-xs text-gray-400 mt-1">{c.company}</p>}
                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 text-sm text-gray-500">
                      <div className="flex items-center gap-1"><FileText className="w-4 h-4" /> {c._count.quotes}</div>
                      <div className="flex items-center gap-1"><Plane className="w-4 h-4" /> {c._count.bookings}</div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Table View */}
        {viewMode === 'table' && filteredClients.length > 0 && (
          <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Client', 'Contact', 'Segment', 'Quotes', 'Bookings', 'Created', ''].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredClients.map((c, idx) => {
                    const seg = segmentConfig[c.segment] || segmentConfig.STANDARD;
                    return (
                      <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }} className="hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                              {c.firstName.charAt(0)}{c.lastName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 flex items-center gap-1.5">
                                {c.firstName} {c.lastName}
                                {c.isVip && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                              </p>
                              {c.company && <p className="text-xs text-gray-500">{c.company}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-gray-900">{c.email}</p>
                          {c.phone && <p className="text-xs text-gray-500">{c.phone}</p>}
                        </td>
                        <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${seg.bg} ${seg.text}`}>{seg.label}</span></td>
                        <td className="px-5 py-4 text-gray-900 font-medium">{c._count.quotes}</td>
                        <td className="px-5 py-4 text-gray-900 font-medium">{c._count.bookings}</td>
                        <td className="px-5 py-4 text-sm text-gray-500">{formatDate(c.createdAt)}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/agent/clients/${c.id}`} className="text-indigo-600 hover:text-indigo-700 font-medium text-sm inline-flex items-center gap-1">
                              View <ChevronRight className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={e => { e.preventDefault(); handleDelete(c.id, `${c.firstName} ${c.lastName}`); }}
                              disabled={loading === c.id}
                              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
      </AnimatePresence>
    </div>
  );
}
