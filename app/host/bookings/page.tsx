'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import {
  Search, Users, CheckCircle2, Clock, XCircle, CalendarDays,
  Loader2, BookOpen, X, Mail, Phone, MessageSquare, ShieldCheck,
  CreditCard, FileText, AlertCircle, Copy, Check
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Booking {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  totalPrice: number | null;
  currency: string;
  guestCount: number;
  specialRequests: string | null;
  guestFirstName: string | null;
  guestLastName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  paymentStatus: string;
  paymentMethod: string | null;
  confirmationNumber: string | null;
  createdAt: string;
  property: { id: string; name: string; coverImageUrl: string | null };
  user: { id: string; name: string | null; email: string | null; image: string | null };
}

const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
  confirmed: { label: 'Confirmed', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  pending: { label: 'Pending', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
};

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'text-amber-600' },
  paid: { label: 'Paid', color: 'text-emerald-600' },
  refunded: { label: 'Refunded', color: 'text-red-600' },
  failed: { label: 'Failed', color: 'text-red-600' },
};

const TABS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

function generateCheckinCode(bookingId: string): string {
  const storageKey = `checkin-code-${bookingId}`;
  const existing = localStorage.getItem(storageKey);
  if (existing) return existing;
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  localStorage.setItem(storageKey, code);
  return code;
}

function getGuestDisplayName(booking: Booking): string {
  if (booking.guestFirstName || booking.guestLastName) {
    return [booking.guestFirstName, booking.guestLastName].filter(Boolean).join(' ');
  }
  return booking.user?.name || booking.user?.email || 'Guest';
}

function getGuestEmail(booking: Booking): string | null {
  return booking.guestEmail || booking.user?.email || null;
}

function getNights(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

function isPastCheckout(endDate: string): boolean {
  return new Date(endDate) < new Date();
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch('/api/properties/bookings');
      if (res.ok) {
        const json = await res.json();
        setBookings(json.data || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    setActionLoading(newStatus);
    try {
      const res = await fetch(`/api/properties/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        const updatedBooking = json.data as Booking;
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? updatedBooking : b))
        );
        setSelectedBooking(updatedBooking);
        const labels: Record<string, string> = {
          confirmed: 'Booking confirmed',
          cancelled: 'Booking declined',
          completed: 'Booking marked as completed',
        };
        toast.success(labels[newStatus] || 'Status updated');
      } else {
        toast.error(json.error || 'Failed to update booking');
      }
    } catch {
      toast.error('Network error. Please try again.');
    }
    setActionLoading(null);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success('Check-in code copied');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const filtered = bookings.filter((b) => {
    const matchesTab = activeTab === 'all' || b.status === activeTab;
    const matchesSearch =
      !searchQuery ||
      getGuestDisplayName(b).toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.confirmationNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-neutral-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] pt-4 pb-20">
      <MaxWidthContainer>
        <div className="mb-8 mt-4">
          <h1 className="text-2xl md:text-3xl font-black text-[#0A0A0A] mb-1">Bookings</h1>
          <p className="text-neutral-500 text-sm">Manage guest reservations across all your properties.</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto hide-scrollbar p-1.5 bg-neutral-100/50 rounded-2xl border border-neutral-100 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black capitalize transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-[#0A0A0A] text-white shadow-soft'
                  : 'text-neutral-500 hover:text-[#0A0A0A] hover:bg-white/60'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-8 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by guest name, property, or confirmation number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-neutral-100 shadow-sm hover:shadow-soft focus:shadow-soft text-[#0A0A0A] placeholder-neutral-400 focus:outline-none focus:border-primary-300 transition-all font-medium"
          />
        </div>

        {/* Bookings List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-neutral-50 border border-neutral-200 rounded-3xl text-center">
            <BookOpen className="w-12 h-12 text-neutral-300 mb-4" />
            <h3 className="text-[#0A0A0A] font-bold text-lg mb-2">No bookings found</h3>
            <p className="text-neutral-500 text-sm max-w-sm">
              {searchQuery || activeTab !== 'all'
                ? 'Try adjusting your filters.'
                : 'Bookings will appear here when guests reserve your properties.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking) => {
              const statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
              return (
                <button
                  key={booking.id}
                  onClick={() => setSelectedBooking(booking)}
                  className="w-full text-left group flex flex-col md:flex-row md:items-center gap-4 p-6 rounded-[2rem] bg-white border border-neutral-100 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-extrabold text-[#0A0A0A] leading-none group-hover:text-[#E74035] transition-colors truncate">
                        {getGuestDisplayName(booking)}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${statusCfg.bg} ${statusCfg.color}`}
                      >
                        <statusCfg.icon className="w-3 h-3" />
                        {statusCfg.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-neutral-400 font-medium text-xs">
                      <span className="text-neutral-600 font-bold">{booking.property.name}</span>
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-[#F7C928]" />
                        {new Date(booking.startDate).toLocaleDateString()} -{' '}
                        {new Date(booking.endDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#E74035]/60" />
                        {booking.guestCount} guest{booking.guestCount !== 1 ? 's' : ''}
                      </span>
                      {booking.confirmationNumber && (
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-neutral-400" />
                          {booking.confirmationNumber}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {booking.totalPrice != null && (
                      <div className="text-2xl font-black text-[#0A0A0A]">
                        <span className="text-sm font-bold text-neutral-400 mr-1">{booking.currency}</span>
                        {booking.totalPrice.toLocaleString()}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </MaxWidthContainer>

      {/* Booking Detail Slide-Over */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdateStatus={updateBookingStatus}
          actionLoading={actionLoading}
          copiedCode={copiedCode}
          onCopyCode={handleCopyCode}
        />
      )}
    </div>
  );
}

/* ─── Booking Detail Modal ─── */

interface BookingDetailModalProps {
  booking: Booking;
  onClose: () => void;
  onUpdateStatus: (bookingId: string, status: string) => void;
  actionLoading: string | null;
  copiedCode: boolean;
  onCopyCode: (code: string) => void;
}

function BookingDetailModal({
  booking,
  onClose,
  onUpdateStatus,
  actionLoading,
  copiedCode,
  onCopyCode,
}: BookingDetailModalProps) {
  const statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
  const paymentCfg = PAYMENT_STATUS_CONFIG[booking.paymentStatus] || PAYMENT_STATUS_CONFIG.pending;
  const nights = getNights(booking.startDate, booking.endDate);
  const guestName = getGuestDisplayName(booking);
  const guestEmail = getGuestEmail(booking);
  const pastCheckout = isPastCheckout(booking.endDate);

  const checkinCode = booking.status === 'confirmed' ? generateCheckinCode(booking.id) : null;

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-neutral-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-black text-[#0A0A0A]">Booking Details</h2>
            {booking.confirmationNumber && (
              <p className="text-xs text-neutral-400 font-medium mt-0.5">
                #{booking.confirmationNumber}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider border ${statusCfg.bg} ${statusCfg.color}`}
            >
              <statusCfg.icon className="w-4 h-4" />
              {statusCfg.label}
            </span>
            {booking.totalPrice != null && (
              <span className="text-2xl font-black text-[#0A0A0A] ml-auto">
                <span className="text-sm font-bold text-neutral-400 mr-1">{booking.currency}</span>
                {booking.totalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Check-in Code (for confirmed bookings) */}
          {checkinCode && (
            <div className="bg-[#27C56B]/5 border border-[#27C56B]/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-[#27C56B]" />
                <span className="text-sm font-black text-[#0A0A0A]">Check-in Code</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black tracking-[0.3em] text-[#0A0A0A]">
                  {checkinCode}
                </span>
                <button
                  onClick={() => onCopyCode(checkinCode)}
                  className="p-2 rounded-xl hover:bg-[#27C56B]/10 transition-colors"
                >
                  {copiedCode ? (
                    <Check className="w-4 h-4 text-[#27C56B]" />
                  ) : (
                    <Copy className="w-4 h-4 text-neutral-400" />
                  )}
                </button>
              </div>
              <p className="text-xs text-neutral-500 mt-2">Share this code with the guest for check-in.</p>
            </div>
          )}

          {/* Property Info */}
          <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100">
            <h3 className="text-sm font-black text-[#0A0A0A] mb-3">Property</h3>
            <p className="text-base font-bold text-[#0A0A0A] mb-2">{booking.property.name}</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-neutral-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-[#F7C928]" />
                {new Date(booking.startDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
                {' - '}
                {new Date(booking.endDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                {nights} night{nights !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#E74035]/60" />
                {booking.guestCount} guest{booking.guestCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Price Breakdown */}
          {booking.totalPrice != null && (
            <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100">
              <h3 className="text-sm font-black text-[#0A0A0A] mb-3">Price Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500 font-medium">
                    Nightly rate x {nights} night{nights !== 1 ? 's' : ''}
                  </span>
                  <span className="text-[#0A0A0A] font-bold">
                    {booking.currency} {booking.totalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t border-neutral-200 pt-2 mt-2">
                  <span className="text-[#0A0A0A] font-black">Total</span>
                  <span className="text-[#0A0A0A] font-black">
                    {booking.currency} {booking.totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Guest Details */}
          <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100">
            <h3 className="text-sm font-black text-[#0A0A0A] mb-3">Guest Details</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E74035]/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-[#E74035]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0A0A0A]">{guestName}</p>
                  <p className="text-xs text-neutral-400 font-medium">
                    Booked {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {guestEmail && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-neutral-500" />
                  </div>
                  <a
                    href={`mailto:${guestEmail}`}
                    className="text-sm font-medium text-[#0A0A0A] hover:text-[#E74035] transition-colors"
                  >
                    {guestEmail}
                  </a>
                </div>
              )}

              {booking.guestPhone && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-neutral-500" />
                  </div>
                  <a
                    href={`tel:${booking.guestPhone}`}
                    className="text-sm font-medium text-[#0A0A0A] hover:text-[#E74035] transition-colors"
                  >
                    {booking.guestPhone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Special Requests */}
          {booking.specialRequests && (
            <div className="bg-[#F7C928]/5 border border-[#F7C928]/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-[#F7C928]" />
                <h3 className="text-sm font-black text-[#0A0A0A]">Special Requests</h3>
              </div>
              <p className="text-sm text-neutral-600 font-medium leading-relaxed">
                {booking.specialRequests}
              </p>
            </div>
          )}

          {/* Payment Status */}
          <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100">
            <h3 className="text-sm font-black text-[#0A0A0A] mb-3">Payment</h3>
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-neutral-400" />
              <div>
                <p className={`text-sm font-bold ${paymentCfg.color}`}>{paymentCfg.label}</p>
                {booking.paymentMethod && (
                  <p className="text-xs text-neutral-400 font-medium capitalize">
                    via {booking.paymentMethod}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {booking.status === 'pending' && (
              <>
                <button
                  onClick={() => onUpdateStatus(booking.id, 'confirmed')}
                  disabled={actionLoading !== null}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#27C56B] hover:bg-[#22b15f] text-white font-black text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {actionLoading === 'confirmed' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Confirm Booking
                </button>
                <button
                  onClick={() => onUpdateStatus(booking.id, 'cancelled')}
                  disabled={actionLoading !== null}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white border-2 border-[#E5484D] text-[#E5484D] hover:bg-[#E5484D] hover:text-white font-black text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === 'cancelled' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Decline Booking
                </button>
              </>
            )}

            {booking.status === 'confirmed' && pastCheckout && (
              <button
                onClick={() => onUpdateStatus(booking.id, 'completed')}
                disabled={actionLoading !== null}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#0A0A0A] hover:bg-[#1a1a1a] text-white font-black text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {actionLoading === 'completed' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Mark as Completed
              </button>
            )}

            {booking.status === 'confirmed' && !pastCheckout && (
              <button
                onClick={() => onUpdateStatus(booking.id, 'cancelled')}
                disabled={actionLoading !== null}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white border-2 border-[#E5484D] text-[#E5484D] hover:bg-[#E5484D] hover:text-white font-black text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === 'cancelled' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Cancel Booking
              </button>
            )}

            <Link
              href="/host/messages"
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-[#0A0A0A] font-black text-sm transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              Message Guest
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
