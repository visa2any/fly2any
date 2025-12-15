'use client';


import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Plane,
  Calendar,
  DollarSign,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  Download,
  Send,
  CheckCheck,
  Ticket,
  FileCheck,
  Building2,
  Save,
  Loader2,
} from 'lucide-react';
import type { Booking } from '@/lib/bookings/types';

export default function AdminBookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Ticketing form state
  const [showTicketingForm, setShowTicketingForm] = useState(false);
  const [savingTicketing, setSavingTicketing] = useState(false);
  const [ticketingData, setTicketingData] = useState({
    eticketNumbers: [''],
    airlineRecordLocator: '',
    consolidatorName: '',
    consolidatorReference: '',
    consolidatorPrice: '',
    ticketingNotes: '',
  });

  useEffect(() => {
    fetchBooking();
  }, [params.id]);

  // Auto-open ticketing form if action=ticket in URL
  useEffect(() => {
    if (searchParams.get('action') === 'ticket' && booking?.status === 'pending_ticketing') {
      setShowTicketingForm(true);
    }
  }, [searchParams, booking?.status]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/bookings/${params.id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch booking');
      }

      const data = await response.json();
      setBooking(data.booking);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!booking) return;

    if (!confirm('Are you sure you want to confirm payment for this booking?')) {
      return;
    }

    try {
      setConfirmingPayment(true);

      const response = await fetch(`/api/admin/bookings/${booking.id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentConfirmed: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to confirm payment');
      }

      const data = await response.json();

      if (data.success) {
        alert('Payment confirmed successfully!');
        fetchBooking(); // Refresh booking data
      } else {
        alert('Failed to confirm payment: ' + data.error);
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      alert('Error confirming payment. Please try again.');
    } finally {
      setConfirmingPayment(false);
    }
  };

  const handleSendConfirmationEmail = async () => {
    if (!booking) return;

    try {
      setSendingEmail(true);

      const response = await fetch(`/api/admin/bookings/${booking.id}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailType: 'confirmation',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      alert('Confirmation email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error sending email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  // Initialize ticketing data when booking is loaded
  useEffect(() => {
    if (booking) {
      setTicketingData({
        eticketNumbers: booking.eticketNumbers?.length
          ? booking.eticketNumbers
          : booking.passengers.map(() => ''),
        airlineRecordLocator: booking.airlineRecordLocator || '',
        consolidatorName: booking.consolidatorName || '',
        consolidatorReference: booking.consolidatorReference || '',
        consolidatorPrice: booking.consolidatorPrice?.toString() || '',
        ticketingNotes: booking.ticketingNotes || '',
      });
    }
  }, [booking]);

  const handleTicketingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    // Validate required fields
    const hasValidEtickets = ticketingData.eticketNumbers.some(t => t.trim() !== '');
    if (!hasValidEtickets) {
      alert('Please enter at least one e-ticket number');
      return;
    }

    if (!ticketingData.airlineRecordLocator.trim()) {
      alert('Please enter the Airline Record Locator (PNR)');
      return;
    }

    try {
      setSavingTicketing(true);

      const response = await fetch(`/api/admin/bookings/${booking.id}/ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eticketNumbers: ticketingData.eticketNumbers.filter(t => t.trim() !== ''),
          airlineRecordLocator: ticketingData.airlineRecordLocator.trim(),
          consolidatorName: ticketingData.consolidatorName.trim() || undefined,
          consolidatorReference: ticketingData.consolidatorReference.trim() || undefined,
          consolidatorPrice: ticketingData.consolidatorPrice
            ? parseFloat(ticketingData.consolidatorPrice)
            : undefined,
          ticketingNotes: ticketingData.ticketingNotes.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save ticketing info');
      }

      alert('Ticketing information saved successfully! Booking is now ticketed.');
      setShowTicketingForm(false);
      fetchBooking(); // Refresh booking data
    } catch (error: any) {
      console.error('Error saving ticketing info:', error);
      alert('Error saving ticketing info: ' + error.message);
    } finally {
      setSavingTicketing(false);
    }
  };

  const updateEticketNumber = (index: number, value: string) => {
    setTicketingData(prev => ({
      ...prev,
      eticketNumbers: prev.eticketNumbers.map((t, i) => (i === index ? value : t)),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-4">The booking you're looking for doesn't exist.</p>
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Bookings
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      pending_ticketing: 'bg-orange-100 text-orange-800 border-orange-300',
      ticketed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      confirmed: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      completed: 'bg-blue-100 text-blue-800 border-blue-300',
    };

    const icons: Record<string, React.ReactNode> = {
      pending: <Clock className="w-4 h-4" />,
      pending_ticketing: <Ticket className="w-4 h-4" />,
      ticketed: <FileCheck className="w-4 h-4" />,
      confirmed: <CheckCircle2 className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />,
      completed: <CheckCircle2 className="w-4 h-4" />,
    };

    const labels: Record<string, string> = {
      pending: 'Pending',
      pending_ticketing: 'Needs Ticketing',
      ticketed: 'Ticketed',
      confirmed: 'Confirmed',
      cancelled: 'Cancelled',
      completed: 'Completed',
    };

    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${styles[status] || styles.pending}`}>
        {icons[status] || icons.pending}
        {labels[status] || status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      refunded: 'bg-gray-100 text-gray-800',
      failed: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/admin/bookings"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Bookings
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              Booking Details
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-sm font-mono font-semibold text-blue-600">
                {booking.bookingReference}
              </p>
              {getStatusBadge(booking.status)}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Issue Ticket Button - Only for pending_ticketing */}
            {booking.status === 'pending_ticketing' && (
              <button
                onClick={() => setShowTicketingForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-lg transition-colors shadow-lg"
              >
                <Ticket className="w-5 h-5" />
                Issue Ticket
              </button>
            )}

            {booking.status === 'pending' && booking.payment.status === 'pending' && (
              <button
                onClick={handleConfirmPayment}
                disabled={confirmingPayment}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold rounded-lg transition-colors shadow-lg"
              >
                {confirmingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <CheckCheck className="w-5 h-5" />
                    Confirm Payment
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleSendConfirmationEmail}
              disabled={sendingEmail}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors"
            >
              {sendingEmail ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Email
                </>
              )}
            </button>
          </div>
        </div>

        {/* Ticketing Form Modal */}
        {showTicketingForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 rounded-t-xl">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Ticket className="w-6 h-6" />
                  Issue Ticket - {booking.bookingReference}
                </h2>
                <p className="text-orange-100 text-sm mt-1">
                  Enter the ticketing information from your consolidator
                </p>
              </div>

              <form onSubmit={handleTicketingSubmit} className="p-6 space-y-6">
                {/* E-Ticket Numbers */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    E-Ticket Numbers <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Enter 13-digit e-ticket number for each passenger
                  </p>
                  <div className="space-y-2">
                    {booking.passengers.map((passenger, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-40 truncate">
                          {passenger.firstName} {passenger.lastName}
                        </span>
                        <input
                          type="text"
                          value={ticketingData.eticketNumbers[idx] || ''}
                          onChange={(e) => updateEticketNumber(idx, e.target.value)}
                          placeholder="e.g., 0012345678901"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-sm"
                          maxLength={14}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Airline Record Locator (PNR) */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Airline Record Locator (PNR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={ticketingData.airlineRecordLocator}
                    onChange={(e) => setTicketingData(prev => ({ ...prev, airlineRecordLocator: e.target.value.toUpperCase() }))}
                    placeholder="e.g., ABC123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-lg uppercase"
                    maxLength={10}
                  />
                </div>

                {/* Consolidator Information */}
                <div className="border-t pt-6">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Consolidator Information (Optional)
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Consolidator Name</label>
                      <input
                        type="text"
                        value={ticketingData.consolidatorName}
                        onChange={(e) => setTicketingData(prev => ({ ...prev, consolidatorName: e.target.value }))}
                        placeholder="e.g., SkyBird, Mondee"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Consolidator Reference</label>
                      <input
                        type="text"
                        value={ticketingData.consolidatorReference}
                        onChange={(e) => setTicketingData(prev => ({ ...prev, consolidatorReference: e.target.value }))}
                        placeholder="Your consolidator's ref #"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm text-gray-600 mb-1">Consolidator Cost (Net Price)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={ticketingData.consolidatorPrice}
                        onChange={(e) => setTicketingData(prev => ({ ...prev, consolidatorPrice: e.target.value }))}
                        placeholder="0.00"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    {ticketingData.consolidatorPrice && booking.customerPrice && (
                      <p className="text-sm text-green-600 mt-2">
                        Your margin: ${(booking.customerPrice - parseFloat(ticketingData.consolidatorPrice)).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Ticketing Notes */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Internal Notes</label>
                  <textarea
                    value={ticketingData.ticketingNotes}
                    onChange={(e) => setTicketingData(prev => ({ ...prev, ticketingNotes: e.target.value }))}
                    placeholder="Any notes about this ticketing (internal only)"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowTicketingForm(false)}
                    className="px-4 py-2 text-gray-700 font-semibold hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingTicketing}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors"
                  >
                    {savingTicketing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save & Mark Ticketed
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Ticketing Information Banner - Show for ticketed bookings */}
        {booking.status === 'ticketed' && booking.eticketNumbers && booking.eticketNumbers.length > 0 && (
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="bg-emerald-100 rounded-full p-3">
                <FileCheck className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-emerald-800 mb-2">Ticket Issued</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-emerald-600 font-semibold mb-1">Airline PNR</p>
                    <p className="text-2xl font-mono font-bold text-emerald-800">{booking.airlineRecordLocator}</p>
                  </div>
                  <div>
                    <p className="text-xs text-emerald-600 font-semibold mb-1">E-Tickets</p>
                    <div className="space-y-1">
                      {booking.eticketNumbers.map((ticket, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{booking.passengers[idx]?.firstName}:</span>
                          <span className="font-mono text-sm font-semibold text-emerald-800">{ticket}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {booking.ticketedAt && (
                  <p className="text-xs text-emerald-600 mt-3">
                    Ticketed on {new Date(booking.ticketedAt).toLocaleString()}
                    {booking.ticketedBy && ` by ${booking.ticketedBy}`}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pending Ticketing Alert */}
        {booking.status === 'pending_ticketing' && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="bg-orange-100 rounded-full p-3 animate-pulse">
                <Ticket className="w-8 h-8 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-orange-800 mb-2">Awaiting Manual Ticketing</h3>
                <p className="text-sm text-orange-700 mb-3">
                  This booking has been received and is waiting to be ticketed via your consolidator.
                  Click "Issue Ticket" above to enter the e-ticket and PNR information.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-orange-600">Customer Price:</span>
                    <span className="ml-2 font-bold text-orange-800">
                      {booking.payment.currency} {booking.customerPrice?.toFixed(2) || booking.payment.amount.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-orange-600">Duffel Offer ID:</span>
                    <span className="ml-2 font-mono text-xs text-orange-800">
                      {booking.notes?.includes('Duffel Offer ID:')
                        ? booking.notes.split('Duffel Offer ID:')[1]?.trim()
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Flight Details */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Plane className="w-5 h-5 text-blue-600" />
                Flight Details
              </h2>

              <div className="space-y-4">
                {booking.flight.segments.map((segment, idx) => (
                  <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{segment.departure.iataCode}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(segment.departure.at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <Plane className="w-5 h-5 text-gray-400 rotate-90" />
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{segment.arrival.iataCode}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(segment.arrival.at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {segment.carrierCode} {segment.flightNumber}
                        </p>
                        <p className="text-xs text-gray-600">{segment.class}</p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600">
                      {new Date(segment.departure.at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Passengers */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Passengers ({booking.passengers.length})
              </h2>

              <div className="space-y-3">
                {booking.passengers.map((passenger, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {passenger.title} {passenger.firstName} {passenger.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          DOB: {passenger.dateOfBirth} · {passenger.nationality}
                        </p>
                        {passenger.passportNumber && (
                          <p className="text-xs text-gray-500 mt-1">
                            Passport: {passenger.passportNumber}
                          </p>
                        )}
                        {passenger.email && (
                          <p className="text-xs text-gray-500 mt-1">
                            📧 {passenger.email}
                          </p>
                        )}
                        {passenger.phone && (
                          <p className="text-xs text-gray-500 mt-1">
                            📞 {passenger.phone}
                          </p>
                        )}
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {passenger.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fare Upgrade - NEW */}
            {booking.fareUpgrade && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  Fare Upgrade
                </h2>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-lg text-purple-900">{booking.fareUpgrade.fareName}</p>
                    <p className="text-xl font-bold text-purple-600">
                      +{booking.payment.currency} {booking.fareUpgrade.upgradePrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="space-y-1 mt-3">
                    <p className="text-sm font-semibold text-gray-700">Benefits:</p>
                    {booking.fareUpgrade.benefits.map((benefit, idx) => (
                      <p key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        {benefit}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Smart Bundle - NEW */}
            {booking.bundle && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Smart Bundle
                </h2>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-lg text-green-900">{booking.bundle.bundleName}</p>
                    <p className="text-xl font-bold text-green-600">
                      {booking.payment.currency} {booking.bundle.price.toFixed(2)}
                    </p>
                  </div>
                  {booking.bundle.description && (
                    <p className="text-sm text-gray-600 mb-3">{booking.bundle.description}</p>
                  )}
                  <div className="space-y-1 mt-3">
                    <p className="text-sm font-semibold text-gray-700">Includes:</p>
                    {booking.bundle.includes.map((item, idx) => (
                      <p key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Add-Ons - NEW */}
            {booking.addOns && booking.addOns.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Add-Ons ({booking.addOns.length})
                </h2>
                <div className="space-y-2">
                  {booking.addOns.map((addon, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{addon.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{addon.category}</p>
                        {addon.details && (
                          <p className="text-xs text-gray-600 mt-1">{addon.details}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">
                          {booking.payment.currency} {addon.price.toFixed(2)}
                        </p>
                        {addon.quantity && addon.quantity > 1 && (
                          <p className="text-xs text-gray-500">Qty: {addon.quantity}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Promo Code Applied */}
            {booking.promoCode && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Promo Code Applied
                </h2>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-bold text-lg text-green-900 font-mono">{booking.promoCode.code}</p>
                      <p className="text-xs text-green-700 mt-1">
                        {booking.promoCode.type === 'percentage'
                          ? `${booking.promoCode.value}% discount`
                          : `$${booking.promoCode.value} fixed discount`}
                      </p>
                    </div>
                    <p className="text-xl font-bold text-green-600">
                      -{booking.payment.currency} {booking.promoCode.discountAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Information - ENHANCED */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Payment Details
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  {getPaymentStatusBadge(booking.payment.status)}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Method:</span>
                  <span className="text-sm font-semibold text-gray-900 capitalize">
                    {booking.payment.method.replace('_', ' ')}
                  </span>
                </div>

                {booking.payment.cardLast4 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Card:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {booking.payment.cardBrand?.toUpperCase() || 'CARD'} •••• {booking.payment.cardLast4}
                    </span>
                  </div>
                )}

                {booking.payment.transactionId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Transaction:</span>
                    <span className="text-xs font-mono text-gray-700">
                      {booking.payment.transactionId}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Price Breakdown:</p>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Base Fare:</span>
                    <span className="font-semibold text-gray-900">
                      {booking.payment.currency} {booking.flight.price.base.toFixed(2)}
                    </span>
                  </div>

                  {booking.fareUpgrade && booking.fareUpgrade.upgradePrice > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{booking.fareUpgrade.fareName} Upgrade:</span>
                      <span className="font-semibold text-purple-600">
                        +{booking.payment.currency} {booking.fareUpgrade.upgradePrice.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {booking.bundle && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{booking.bundle.bundleName}:</span>
                      <span className="font-semibold text-green-600">
                        +{booking.payment.currency} {booking.bundle.price.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {booking.addOns && booking.addOns.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Add-ons ({booking.addOns.length}):</span>
                      <span className="font-semibold text-blue-600">
                        +{booking.payment.currency} {booking.addOns.reduce((sum, addon) => sum + addon.price, 0).toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Taxes & Fees:</span>
                    <span className="font-semibold text-gray-900">
                      {booking.payment.currency} {booking.flight.price.taxes.toFixed(2)}
                    </span>
                  </div>

                  <div className="pt-2 border-t-2 border-gray-300">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-gray-900">Total Amount:</span>
                      <span className="text-2xl font-bold text-green-600">
                        {booking.payment.currency} {booking.payment.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* ADMIN ONLY: Price Breakdown Details */}
                  <div className="mt-4 pt-3 border-t border-dashed border-orange-300 bg-orange-50/50 rounded-lg p-3">
                    <p className="text-xs font-bold text-orange-700 mb-2 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      Admin Price Details
                    </p>

                    {booking.netPrice && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Net Price (API Cost):</span>
                        <span className="font-semibold text-gray-900">
                          {booking.payment.currency} {booking.netPrice.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {booking.markupAmount && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Markup Applied:</span>
                        <span className="font-semibold text-blue-600">
                          +{booking.payment.currency} {booking.markupAmount.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {booking.duffelCost && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Duffel Fee:</span>
                        <span className="font-semibold text-red-500">
                          -{booking.payment.currency} {booking.duffelCost.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {booking.consolidatorCost && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Consolidator Cost:</span>
                        <span className="font-semibold text-red-500">
                          -{booking.payment.currency} {booking.consolidatorCost.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm pt-2 border-t border-orange-200 mt-2">
                      <span className="font-bold text-gray-700">Net Profit:</span>
                      <span className={`font-bold text-lg ${(booking.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {booking.payment.currency} {(booking.netProfit || 0).toFixed(2)}
                      </span>
                    </div>

                    {booking.routingChannel && (
                      <div className="flex items-center justify-between text-xs mt-2 text-gray-500">
                        <span>Routing:</span>
                        <span className={`px-2 py-0.5 rounded ${booking.routingChannel === 'DUFFEL' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {booking.routingChannel}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {booking.payment.paidAt && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      Paid on: {new Date(booking.payment.paidAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Contact
              </h2>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600">Email</p>
                    <p className="text-sm font-semibold text-gray-900">{booking.contactInfo.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600">Phone</p>
                    <p className="text-sm font-semibold text-gray-900">{booking.contactInfo.phone}</p>
                  </div>
                </div>

                {booking.contactInfo.emergencyContact && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">Emergency Contact</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {booking.contactInfo.emergencyContact.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {booking.contactInfo.emergencyContact.phone}
                    </p>
                    <p className="text-xs text-gray-500">
                      {booking.contactInfo.emergencyContact.relationship}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Metadata */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                Details
              </h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(booking.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Updated:</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(booking.updatedAt).toLocaleString()}
                  </span>
                </div>

                {booking.cancelledAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cancelled:</span>
                    <span className="font-semibold text-red-700">
                      {new Date(booking.cancelledAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
