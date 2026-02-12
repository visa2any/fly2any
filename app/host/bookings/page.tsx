'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import {
  Search, Filter, Calendar, Users, CheckCircle2, XCircle, Clock,
  MoreHorizontal, MessageSquare, ChevronRight, DollarSign
} from 'lucide-react';
import { format } from 'date-fns';

const MOCK_BOOKINGS = [
  {
    id: 'bk_1',
    property: { name: 'Seaside Villa', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=200&q=70&auto=format' },
    guest: { name: 'Alice Johnson', email: 'alice@example.com', avatar: null },
    dates: { start: new Date(2026, 2, 10), end: new Date(2026, 2, 15) },
    totalPrice: 2250,
    status: 'confirmed',
    guestsCount: 4,
    bookedAt: new Date(2026, 1, 5),
  },
  {
    id: 'bk_2',
    property: { name: 'Downtown Loft', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200&q=70&auto=format' },
    guest: { name: 'Bob Smith', email: 'bob@example.com', avatar: null },
    dates: { start: new Date(2026, 3, 1), end: new Date(2026, 3, 5) },
    totalPrice: 880,
    status: 'pending',
    guestsCount: 2,
    bookedAt: new Date(2026, 2, 28),
  },
];

const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
  completed: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
};

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-4 pb-20">
      <MaxWidthContainer>
        <div className="flex items-center justify-between mb-8 mt-4">
          <div>
            <h1 className="text-2xl font-black text-white mb-1">Bookings</h1>
            <p className="text-white/50 text-sm">Manage reservations and guest requests.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-white/10 mb-6">
          {['upcoming', 'completed', 'cancelled', 'all'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-bold capitalize transition-colors relative ${
                activeTab === tab ? 'text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
              )}
            </button>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search by guest name or booking ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/20"
            />
          </div>
          <button className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white/70 hover:text-white flex items-center gap-2 font-bold text-sm">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        {/* List */}
        <div className="space-y-4">
          {MOCK_BOOKINGS.map((booking) => (
            <div key={booking.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row gap-4">
              {/* Property Image & Basic Info */}
              <div className="flex items-start gap-4 md:w-1/3">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                  <Image src={booking.property.image} alt={booking.property.name} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-0.5">{booking.property.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
                    <span className="font-mono text-white/30">#{booking.id.toUpperCase()}</span>
                    <span>•</span>
                    <span>{format(booking.bookedAt, 'MMM d, yyyy')}</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[booking.status]}`}>
                    {booking.status === 'confirmed' && <CheckCircle2 className="w-3 h-3" />}
                    {booking.status === 'pending' && <Clock className="w-3 h-3" />}
                    {booking.status}
                  </span>
                </div>
              </div>

              {/* Booking Details */}
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                <div>
                  <div className="text-xs text-white/30 font-bold uppercase mb-1">Dates</div>
                  <div className="text-white text-sm font-semibold">
                    {format(booking.dates.start, 'MMM d')} - {format(booking.dates.end, 'MMM d, yyyy')}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-white/30 font-bold uppercase mb-1">Guests</div>
                  <div className="text-white text-sm font-semibold flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {booking.guestsCount}
                  </div>
                </div>
                 <div>
                  <div className="text-xs text-white/30 font-bold uppercase mb-1">Total</div>
                  <div className="text-white text-sm font-bold text-emerald-400">
                    ${booking.totalPrice}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                   <button className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white" title="Message Guest">
                     <MessageSquare className="w-4 h-4" />
                   </button>
                   <button className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white">
                     <MoreHorizontal className="w-4 h-4" />
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </MaxWidthContainer>
    </div>
  );
}
