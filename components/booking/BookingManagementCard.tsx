'use client';

/**
 * Booking Management Card — Fly2Any
 * Level 6 Apple-Class admin booking management actions
 */

import { useState } from 'react';
import {
  Ticket, Send, Download, RefreshCw, Ban, CheckCircle,
  Edit, Printer, MessageSquare, Clock, AlertTriangle,
  FileText, Mail, Phone, ExternalLink, Loader2
} from 'lucide-react';
import type { Booking } from '@/lib/bookings/types';

interface BookingManagementCardProps {
  booking: Booking;
  onRefresh: () => void;
  onConfirmPayment?: () => Promise<void>;
  onSendEmail?: (type: string) => Promise<void>;
  onOpenTicketing?: () => void;
  className?: string;
}

export function BookingManagementCard({
  booking,
  onRefresh,
  onConfirmPayment,
  onSendEmail,
  onOpenTicketing,
  className = '',
}: BookingManagementCardProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (action: string, handler?: () => Promise<void>) => {
    if (!handler) return;
    setLoading(action);
    try {
      await handler();
    } finally {
      setLoading(null);
    }
  };

  const isPending = booking.status === 'pending';
  const isPendingTicketing = booking.status === 'pending_ticketing' || booking.ticketingStatus === 'pending_ticketing';
  const isTicketed = booking.ticketingStatus === 'ticketed';
  const isAmadeus = booking.sourceApi === 'Amadeus';

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
        <div className="flex items-center gap-3">
          <Edit className="w-6 h-6" />
          <div>
            <h3 className="text-lg font-bold">Manage Booking</h3>
            <p className="text-sm text-white/80">Quick actions & management tools</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Status Alert */}
        {isPendingTicketing && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800">Manual Ticketing Required</p>
              <p className="text-sm text-amber-700">Issue ticket via consolidator within 24 hours</p>
            </div>
          </div>
        )}

        {/* Primary Actions */}
        <div className="grid grid-cols-2 gap-3">
          {/* Confirm Payment */}
          {isPending && booking.payment.status === 'pending' && onConfirmPayment && (
            <button
              onClick={() => handleAction('confirm', onConfirmPayment)}
              disabled={loading === 'confirm'}
              className="flex items-center justify-center gap-2 p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-semibold disabled:opacity-50"
            >
              {loading === 'confirm' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Confirm Payment
            </button>
          )}

          {/* Issue Ticket */}
          {isPendingTicketing && isAmadeus && onOpenTicketing && (
            <button
              onClick={onOpenTicketing}
              className="flex items-center justify-center gap-2 p-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-semibold"
            >
              <Ticket className="w-4 h-4" />
              Issue Ticket
            </button>
          )}

          {/* Resend Email */}
          {onSendEmail && (
            <button
              onClick={() => handleAction('email', () => onSendEmail('confirmation'))}
              disabled={loading === 'email'}
              className="flex items-center justify-center gap-2 p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold disabled:opacity-50"
            >
              {loading === 'email' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Resend Email
            </button>
          )}

          {/* Refresh */}
          <button
            onClick={onRefresh}
            className="flex items-center justify-center gap-2 p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
          <button className="flex flex-col items-center gap-1 p-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <Download className="w-5 h-5" />
            <span className="text-xs">Download</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <Printer className="w-5 h-5" />
            <span className="text-xs">Print</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <FileText className="w-5 h-5" />
            <span className="text-xs">Invoice</span>
          </button>
        </div>

        {/* Quick Contact */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Quick Contact</p>
          <div className="flex gap-2">
            <a
              href={`mailto:${booking.contactInfo.email}`}
              className="flex-1 flex items-center justify-center gap-2 p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              <Mail className="w-4 h-4" />
              Email
            </a>
            {booking.contactInfo.phone && (
              <a
                href={`tel:${booking.contactInfo.phone}`}
                className="flex-1 flex items-center justify-center gap-2 p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <Phone className="w-4 h-4" />
                Call
              </a>
            )}
          </div>
        </div>

        {/* Ticketing Info (if ticketed) */}
        {isTicketed && (
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <CheckCircle className="w-4 h-4" />
              <span className="font-semibold text-sm">Ticket Issued</span>
            </div>
            {booking.airlineRecordLocator && (
              <p className="text-sm text-gray-600">
                PNR: <span className="font-mono font-bold">{booking.airlineRecordLocator}</span>
              </p>
            )}
            {booking.eticketNumbers && booking.eticketNumbers.length > 0 && (
              <div className="text-sm text-gray-600">
                E-Tickets: {booking.eticketNumbers.map((t, i) => (
                  <span key={i} className="font-mono text-xs bg-gray-100 px-1 rounded ml-1">{t}</span>
                ))}
              </div>
            )}
            {booking.ticketedAt && (
              <p className="text-xs text-gray-400 mt-1">
                Issued: {new Date(booking.ticketedAt).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* Timestamps */}
        <div className="pt-4 border-t border-gray-100 text-xs text-gray-400 space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Created: {new Date(booking.createdAt).toLocaleString()}
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-3 h-3" />
            Updated: {new Date(booking.updatedAt).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingManagementCard;
