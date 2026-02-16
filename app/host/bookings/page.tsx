'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import {
  Search, Users, CheckCircle2, Clock, XCircle, CalendarDays,
  Loader2, BookOpen
} from 'lucide-react';

interface Booking {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  totalPrice: number | null;
  currency: string;
  guestCount: number;
  property: { id: string; name: string; coverImageUrl: string | null };
  user: { id: string; name: string | null; email: string | null; image: string | null };
}

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  confirmed: { label: 'Confirmed', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  pending: { label: 'Pending', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
};

const TABS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchBookings() {
      try {
        const res = await fetch('/api/properties/bookings');
        if (res.ok) {
          const json = await res.json();
          setBookings(json.data || []);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    fetchBookings();
  }, []);

  const filtered = bookings.filter(b => {
    const matchesTab = activeTab === 'all' || b.status === activeTab;
    const matchesSearch = !searchQuery ||
      (b.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.property.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] pt-4 pb-20">
      <MaxWidthContainer>
        <div className="mb-8 mt-4">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-1">Bookings</h1>
          <p className="text-gray-500 text-sm">Manage guest reservations across all your properties.</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto hide-scrollbar pb-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap border ${
                activeTab === tab
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-neutral-200 hover:bg-neutral-50 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by guest name or property..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-neutral-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all"
          />
        </div>

        {/* Bookings List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-neutral-50 border border-neutral-200 rounded-3xl text-center">
            <BookOpen className="w-12 h-12 text-neutral-300 mb-4" />
            <h3 className="text-gray-900 font-bold text-lg mb-2">No bookings found</h3>
            <p className="text-gray-500 text-sm max-w-sm">
              {searchQuery || activeTab !== 'all'
                ? 'Try adjusting your filters.'
                : 'Bookings will appear here when guests reserve your properties.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((booking) => {
              const statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
              return (
                <div key={booking.id} className="flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-2xl bg-white border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-gray-900 font-bold truncate">{booking.user?.name || booking.user?.email || 'Guest'}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-semibold ${statusCfg.bg} ${statusCfg.color}`}>
                        <statusCfg.icon className="w-3 h-3" />
                        {statusCfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-400 text-xs">
                      <span>{booking.property.name}</span>
                      <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{booking.guestCount} guests</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {booking.totalPrice != null && (
                      <div className="text-gray-900 font-bold text-lg">
                        {booking.currency} {booking.totalPrice.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </MaxWidthContainer>
    </div>
  );
}
