'use client';

/**
 * Admin Agent Booking Detail Page
 * Fly2Any admin processes agent quote bookings here:
 * - View trip details, passengers, itinerary
 * - Add flight PNR / hotel confirmations
 * - Confirm booking & send client notification
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, CheckCircle, Clock, User, Plane, Building2, Car,
  Calendar, DollarSign, MapPin, Mail, Phone, Users, Ticket,
  AlertCircle, RefreshCw, Save, Send, Shield, FileText, Copy,
  ChevronDown, Loader2
} from 'lucide-react';

interface BookingDetail {
  id: string;
  confirmationNumber: string;
  tripName: string;
  destination: string;
  startDate: string;
  endDate: string;
  duration: number;
  travelers: number;
  adults: number;
  children: number;
  infants: number;
  flights: any[];
  hotels: any[];
  activities: any[];
  transfers: any[];
  carRentals: any[];
  subtotal: number;
  agentMarkup: number;
  taxes: number;
  fees: number;
  discount: number;
  total: number;
  currency: string;
  status: string;
  paymentStatus: string;
  totalPaid: number;
  balanceDue: number;
  source: string | null;
  notes: string | null;
  createdAt: string;
  flightConfirmations: any;
  hotelConfirmations: any;
  activityConfirmations: any;
  transferConfirmations: any;
  confirmationEmailSent: boolean;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
  agent: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    agencyName: string | null;
    businessName: string | null;
    email: string | null;
    phone: string | null;
    user: { email: string; name: string | null };
  };
  quote: {
    id: string;
    quoteNumber: string;
    shareableLink: string;
    createdAt: string;
    sentAt: string | null;
    acceptedAt: string | null;
    convertedAt: string | null;
  } | null;
  commissions: Array<{
    id: string;
    agentEarnings: number;
    platformFee: number;
    grossProfit: number;
    status: string;
  }>;
}

interface PassengerData {
  passengers: Array<{
    type: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    gender?: string;
    passportNumber?: string;
    nationality?: string;
  }>;
  contact: {
    email: string;
    phone?: string;
    specialRequests?: string;
  };
  adminNotes?: string;
  confirmedBy?: string;
  confirmedAt?: string;
}

export default function AdminAgentBookingDetailPage() {
  const router = useRouter();
  const params = useParams()!;
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [passengerData, setPassengerData] = useState<PassengerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Confirmation form
  const [flightPNRs, setFlightPNRs] = useState<string[]>(['']);
  const [hotelConfs, setHotelConfs] = useState<string[]>(['']);
  const [adminNotes, setAdminNotes] = useState('');
  const [sendEmail, setSendEmail] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [params.id]);

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/admin/agent-bookings/${params.id}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setBooking(data.booking);
      setPassengerData(data.passengerData);

      // Pre-fill existing confirmations
      if (data.booking.flightConfirmations) {
        const confs = Array.isArray(data.booking.flightConfirmations)
          ? data.booking.flightConfirmations.map((c: any) => c.pnr || c)
          : [data.booking.flightConfirmations];
        setFlightPNRs(confs.length > 0 ? confs : ['']);
      }
      if (data.booking.hotelConfirmations) {
        const confs = Array.isArray(data.booking.hotelConfirmations)
          ? data.booking.hotelConfirmations.map((c: any) => c.confirmationNumber || c)
          : [data.booking.hotelConfirmations];
        setHotelConfs(confs.length > 0 ? confs : ['']);
      }
    } catch {
      router.push('/admin/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfirmations = async () => {
    if (!booking) return;
    setSaving(true);
    try {
      const validPNRs = flightPNRs.filter(p => p.trim());
      const validHotels = hotelConfs.filter(h => h.trim());

      const res = await fetch(`/api/admin/agent-bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flightConfirmations: validPNRs.length > 0 ? validPNRs.map(pnr => ({ pnr })) : undefined,
          hotelConfirmations: validHotels.length > 0 ? validHotels.map(c => ({ confirmationNumber: c })) : undefined,
          adminNotes: adminNotes || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      alert('Confirmations saved!');
      fetchBooking();
    } catch {
      alert('Failed to save confirmations');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!booking) return;
    if (!confirm('Confirm this booking and notify the client?')) return;
    setConfirming(true);
    try {
      const validPNRs = flightPNRs.filter(p => p.trim());
      const validHotels = hotelConfs.filter(h => h.trim());

      const res = await fetch(`/api/admin/agent-bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'CONFIRMED',
          flightConfirmations: validPNRs.length > 0 ? validPNRs.map(pnr => ({ pnr })) : undefined,
          hotelConfirmations: validHotels.length > 0 ? validHotels.map(c => ({ confirmationNumber: c })) : undefined,
          adminNotes: adminNotes || undefined,
          sendConfirmationEmail: sendEmail,
        }),
      });
      if (!res.ok) throw new Error('Failed to confirm');
      alert('Booking confirmed! Client and agent have been notified.');
      fetchBooking();
    } catch {
      alert('Failed to confirm booking');
    } finally {
      setConfirming(false);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!booking) return null;

  const agentName = booking.agent?.agencyName || booking.agent?.businessName ||
    `${booking.agent?.firstName || ''} ${booking.agent?.lastName || ''}`.trim() || 'Unknown';
  const commission = booking.commissions?.[0];

  const statusColors: Record<string, string> = {
    PENDING: 'bg-orange-100 text-orange-700 border-orange-300',
    CONFIRMED: 'bg-green-100 text-green-700 border-green-300',
    COMPLETED: 'bg-blue-100 text-blue-700 border-blue-300',
    CANCELLED: 'bg-red-100 text-red-700 border-red-300',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/admin/bookings')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{booking.tripName}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[booking.status] || 'bg-gray-100'}`}>
              {booking.status === 'PENDING' ? '⚡ NEEDS PROCESSING' : booking.status}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              {booking.paymentStatus.replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            <button onClick={() => copyText(booking.confirmationNumber)} className="flex items-center gap-1 font-mono hover:text-gray-900">
              {booking.confirmationNumber} <Copy className="w-3 h-3" />
            </button>
            <span>·</span>
            <span>{booking.destination}</span>
            {booking.quote && (
              <>
                <span>·</span>
                <Link href={`/agent/quotes/${booking.quote.id}`} className="text-blue-600 hover:underline">
                  Quote {booking.quote.quoteNumber}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* PENDING Banner */}
      {booking.status === 'PENDING' && (
        <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-orange-900">Action Required — Manual Processing</p>
            <p className="text-sm text-orange-700 mt-1">
              This booking was created from an agent quote checkout. You need to:
            </p>
            <ol className="text-sm text-orange-700 mt-2 ml-4 list-decimal space-y-1">
              <li>Book flights with consolidator and enter PNR below</li>
              <li>Confirm hotel reservations and enter confirmation numbers</li>
              <li>Confirm any activities/transfers</li>
              <li>Click "Confirm Booking" to notify client and agent</li>
            </ol>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trip Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Trip Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-4 h-4 text-gray-400 mb-1" />
                <p className="text-xs text-gray-500">Dates</p>
                <p className="text-sm font-semibold">{new Date(booking.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(booking.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <Clock className="w-4 h-4 text-gray-400 mb-1" />
                <p className="text-xs text-gray-500">Duration</p>
                <p className="text-sm font-semibold">{booking.duration} nights</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <Users className="w-4 h-4 text-gray-400 mb-1" />
                <p className="text-xs text-gray-500">Travelers</p>
                <p className="text-sm font-semibold">{booking.adults}A {booking.children > 0 ? `${booking.children}C ` : ''}{booking.infants > 0 ? `${booking.infants}I` : ''}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <DollarSign className="w-4 h-4 text-gray-400 mb-1" />
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-sm font-bold text-green-700">${booking.total.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Itinerary Items */}
          {[
            { label: 'Flights', icon: Plane, items: booking.flights || [], color: 'blue' },
            { label: 'Hotels', icon: Building2, items: booking.hotels || [], color: 'orange' },
            { label: 'Activities', icon: Ticket, items: booking.activities || [], color: 'purple' },
            { label: 'Transfers', icon: Car, items: booking.transfers || [], color: 'cyan' },
          ].filter(s => s.items.length > 0).map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.label} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">{section.label} ({section.items.length})</h3>
                </div>
                <div className="space-y-2">
                  {section.items.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">{item.name || item.title || item.airline || `${section.label} ${idx + 1}`}</span>
                        {(item.price || item.totalPrice) && <span className="font-semibold">${(item.price || item.totalPrice)?.toLocaleString()}</span>}
                      </div>
                      {item.origin && <p className="text-gray-500">{item.origin} → {item.destination}</p>}
                      {item.departureDate && <p className="text-gray-500">{item.departureDate}</p>}
                      {item.checkIn && <p className="text-gray-500">Check-in: {item.checkIn} · Check-out: {item.checkOut}</p>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Passengers */}
          {passengerData?.passengers && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Passengers</h2>
              <div className="space-y-2">
                {passengerData.passengers.map((pax, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <span className="font-medium text-sm">{pax.firstName} {pax.lastName}</span>
                      <span className="text-xs text-gray-500 ml-2 capitalize">({pax.type})</span>
                    </div>
                    {pax.dateOfBirth && <span className="text-xs text-gray-500">DOB: {pax.dateOfBirth}</span>}
                    {pax.nationality && <span className="text-xs text-gray-500">{pax.nationality}</span>}
                    {pax.passportNumber && <span className="text-xs font-mono text-gray-500">PP: {pax.passportNumber}</span>}
                  </div>
                ))}
              </div>
              {passengerData.contact && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
                  <p className="font-medium text-blue-900 mb-1">Contact Info</p>
                  <div className="flex flex-wrap gap-4 text-blue-700">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{passengerData.contact.email}</span>
                    {passengerData.contact.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{passengerData.contact.phone}</span>}
                  </div>
                  {passengerData.contact.specialRequests && (
                    <p className="mt-2 text-blue-600 text-xs">Special Requests: {passengerData.contact.specialRequests}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TICKETING / CONFIRMATION FORM */}
          <div className="bg-white rounded-xl border-2 border-orange-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" />
              Supplier Confirmations
            </h2>

            {/* Flight PNRs */}
            {(booking.flights?.length > 0) && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Flight PNR / Record Locators</label>
                {flightPNRs.map((pnr, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={pnr}
                      onChange={e => {
                        const updated = [...flightPNRs];
                        updated[idx] = e.target.value.toUpperCase();
                        setFlightPNRs(updated);
                      }}
                      placeholder="e.g. ABC123"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
                    />
                    {flightPNRs.length > 1 && (
                      <button onClick={() => setFlightPNRs(flightPNRs.filter((_, i) => i !== idx))}
                        className="text-red-500 text-sm px-2 hover:bg-red-50 rounded">Remove</button>
                    )}
                  </div>
                ))}
                <button onClick={() => setFlightPNRs([...flightPNRs, ''])}
                  className="text-sm text-blue-600 hover:underline mt-1">+ Add another PNR</button>
              </div>
            )}

            {/* Hotel Confirmations */}
            {(booking.hotels?.length > 0) && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Confirmation Numbers</label>
                {hotelConfs.map((conf, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={conf}
                      onChange={e => {
                        const updated = [...hotelConfs];
                        updated[idx] = e.target.value;
                        setHotelConfs(updated);
                      }}
                      placeholder="Hotel confirmation #"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
                    />
                    {hotelConfs.length > 1 && (
                      <button onClick={() => setHotelConfs(hotelConfs.filter((_, i) => i !== idx))}
                        className="text-red-500 text-sm px-2 hover:bg-red-50 rounded">Remove</button>
                    )}
                  </div>
                ))}
                <button onClick={() => setHotelConfs([...hotelConfs, ''])}
                  className="text-sm text-blue-600 hover:underline mt-1">+ Add another</button>
              </div>
            )}

            {/* Admin Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes (internal)</label>
              <textarea
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none resize-none"
                rows={3}
                placeholder="Consolidator used, pricing notes, special instructions..."
              />
            </div>

            {/* Send Email Toggle */}
            <label className="flex items-center gap-2 mb-4 cursor-pointer">
              <input type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
              <span className="text-sm text-gray-700">Send confirmation email to client when confirming</span>
            </label>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={handleSaveConfirmations} disabled={saving}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Draft
              </button>
              {booking.status === 'PENDING' && (
                <button onClick={handleConfirmBooking} disabled={confirming}
                  className="flex-[2] py-2.5 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {confirming ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Confirm Booking & Notify Client
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Client</h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium">{booking.client.firstName} {booking.client.lastName}</p>
              <p className="text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" />{booking.client.email}</p>
              {booking.client.phone && <p className="text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" />{booking.client.phone}</p>}
            </div>
          </div>

          {/* Agent */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Agent</h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium">{agentName}</p>
              <p className="text-gray-500">{booking.agent.user?.email}</p>
              {booking.agent.phone && <p className="text-gray-500">{booking.agent.phone}</p>}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Pricing Breakdown</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>${booking.subtotal.toLocaleString()}</span></div>
              {booking.agentMarkup > 0 && <div className="flex justify-between"><span className="text-gray-500">Agent Markup</span><span className="text-purple-600">+${booking.agentMarkup.toLocaleString()}</span></div>}
              {booking.taxes > 0 && <div className="flex justify-between"><span className="text-gray-500">Taxes</span><span>${booking.taxes.toLocaleString()}</span></div>}
              {booking.fees > 0 && <div className="flex justify-between"><span className="text-gray-500">Fees</span><span>${booking.fees.toLocaleString()}</span></div>}
              {booking.discount > 0 && <div className="flex justify-between"><span className="text-gray-500">Discount</span><span className="text-red-500">-${booking.discount.toLocaleString()}</span></div>}
              <div className="border-t pt-2 flex justify-between font-bold"><span>Total</span><span className="text-lg">${booking.total.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Paid</span><span className="text-green-600">${booking.totalPaid.toLocaleString()}</span></div>
              {booking.balanceDue > 0 && <div className="flex justify-between"><span className="text-gray-500">Balance</span><span className="text-orange-600">${booking.balanceDue.toLocaleString()}</span></div>}
            </div>
          </div>

          {/* Commission */}
          {commission && (
            <div className="bg-purple-50 rounded-xl border border-purple-200 p-5">
              <h3 className="font-semibold text-purple-900 mb-3">Commission</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-purple-700">Gross Profit</span><span className="font-medium">${commission.grossProfit.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-purple-700">Platform Fee</span><span>${commission.platformFee.toLocaleString()}</span></div>
                <div className="flex justify-between font-semibold"><span className="text-purple-900">Agent Earnings</span><span>${commission.agentEarnings.toLocaleString()}</span></div>
                <div className="text-xs text-purple-600 capitalize mt-1">Status: {commission.status.replace('_', ' ').toLowerCase()}</div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Timeline</h3>
            <div className="space-y-3 text-sm">
              {booking.quote?.createdAt && <TimelineItem label="Quote Created" date={booking.quote.createdAt} />}
              {booking.quote?.sentAt && <TimelineItem label="Quote Sent" date={booking.quote.sentAt} />}
              {booking.quote?.acceptedAt && <TimelineItem label="Quote Accepted" date={booking.quote.acceptedAt} success />}
              {booking.quote?.convertedAt && <TimelineItem label="Checkout Completed" date={booking.quote.convertedAt} success />}
              <TimelineItem label="Booking Created" date={booking.createdAt} />
              {booking.status === 'CONFIRMED' && <TimelineItem label="Confirmed by Admin" date={booking.createdAt} success />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ label, date, success }: { label: string; date: string; success?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${success ? 'bg-green-500' : 'bg-gray-400'}`} />
      <div className="flex-1">
        <span className="text-gray-900">{label}</span>
      </div>
      <span className="text-xs text-gray-500">{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
    </div>
  );
}
