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
  RefreshCw,
  CloudOff,
  CloudCheck,
} from 'lucide-react';
import type { Booking } from '@/lib/bookings/types';
import {
  EnhancedFlightCard,
  BookingExtrasCard,
  AdminPricingCard,
  BookingManagementCard,
} from '@/components/booking';
import { getConsolidatorLinkFromBooking } from '@/lib/utils/consolidator-link';

export default function AdminBookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; changes: string[]; error?: string } | null>(null);

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

  // Sync booking with provider (Duffel/Amadeus)
  const handleSync = async () => {
    if (!booking) return;

    // Only sync if booking has a provider order ID
    if (!booking.duffelOrderId && !booking.amadeusBookingId) {
      setSyncResult({ success: false, changes: [], error: 'No provider order ID found' });
      return;
    }

    try {
      setSyncing(true);
      setSyncResult(null);

      const response = await fetch(`/api/admin/bookings/${booking.id}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true, includeServices: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSyncResult({ success: false, changes: [], error: data.error || 'Sync failed' });
        return;
      }

      setSyncResult({
        success: true,
        changes: data.changes || [],
        error: undefined,
      });

      // Refresh booking to show updated data
      fetchBooking();
    } catch (error: any) {
      console.error('Sync error:', error);
      setSyncResult({ success: false, changes: [], error: error.message });
    } finally {
      setSyncing(false);
    }
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
      <div className="w-full px-4 md:px-6 py-4 space-y-4">
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

            {/* Sync with Provider Button */}
            {(booking.duffelOrderId || booking.amadeusBookingId) && (
              <button
                onClick={handleSync}
                disabled={syncing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold rounded-lg transition-colors"
                title="Sync e-tickets, status & policies from provider"
              >
                {syncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Sync Provider
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

        {/* Sync Result Banner */}
        {syncResult && (
          <div className={`p-4 rounded-lg border ${syncResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-3">
              {syncResult.success ? (
                <CloudCheck className="w-5 h-5 text-green-600" />
              ) : (
                <CloudOff className="w-5 h-5 text-red-600" />
              )}
              <div className="flex-1">
                <p className={`font-semibold ${syncResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {syncResult.success ? 'Sync Complete' : 'Sync Failed'}
                </p>
                {syncResult.success && syncResult.changes.length > 0 ? (
                  <p className="text-sm text-green-700">Updated: {syncResult.changes.join(', ')}</p>
                ) : syncResult.success && syncResult.changes.length === 0 ? (
                  <p className="text-sm text-green-700">No changes detected - booking is up to date</p>
                ) : (
                  <p className="text-sm text-red-700">{syncResult.error}</p>
                )}
              </div>
              <button onClick={() => setSyncResult(null)} className="text-gray-500 hover:text-gray-700">×</button>
            </div>
          </div>
        )}

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

                {/* Consolidator Information - Enhanced UX */}
                <div className="border-t pt-6">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Consolidator Booking Info
                  </h3>

                  {/* Smart URL Paste - Auto-extracts booking ID */}
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <label className="block text-sm font-semibold text-blue-800 mb-2">
                      Paste Consolidator Booking URL (auto-fills reference)
                    </label>
                    <input
                      type="text"
                      placeholder="https://air.thebestagent.pro/#booking/..."
                      onChange={(e) => {
                        const url = e.target.value;
                        // Extract UUID from TheBestAgent URL
                        const match = url.match(/booking\/([a-f0-9-]{36})/i);
                        if (match) {
                          setTicketingData(prev => ({
                            ...prev,
                            consolidatorReference: match[1],
                            consolidatorName: prev.consolidatorName || 'TheBestAgent'
                          }));
                        }
                      }}
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                    <p className="text-xs text-blue-600 mt-1">Paste the booking URL and we'll extract the reference automatically</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Consolidator</label>
                      <select
                        value={ticketingData.consolidatorName}
                        onChange={(e) => setTicketingData(prev => ({ ...prev, consolidatorName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="">Select...</option>
                        <option value="TheBestAgent">TheBestAgent</option>
                        <option value="Mondee">Mondee</option>
                        <option value="SkyBird">SkyBird</option>
                        <option value="TravelPort">TravelPort</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Booking Reference</label>
                      <input
                        type="text"
                        value={ticketingData.consolidatorReference}
                        onChange={(e) => setTicketingData(prev => ({ ...prev, consolidatorReference: e.target.value }))}
                        placeholder="UUID or reference #"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm text-gray-600 mb-1">Net Cost (Your Price)</label>
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
                      <div className="flex items-center justify-between mt-2 p-2 bg-green-50 rounded-lg">
                        <span className="text-sm text-green-700">Your Profit:</span>
                        <span className="text-lg font-bold text-green-700">
                          ${(booking.customerPrice - parseFloat(ticketingData.consolidatorPrice)).toFixed(2)}
                        </span>
                      </div>
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

        {/* Pending Ticketing Alert with Quick Actions */}
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
                </p>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {getConsolidatorLinkFromBooking(booking) && (
                    <a
                      href={getConsolidatorLinkFromBooking(booking) || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow"
                    >
                      <Plane className="w-4 h-4" />
                      Open in TheBestAgent
                    </a>
                  )}
                  <button
                    onClick={() => {
                      const seg = booking.flight?.outbound?.segments?.[0];
                      const retSeg = booking.flight?.return?.segments?.[0];
                      const text = `${seg?.origin || ''}-${seg?.destination || ''} ${new Date(seg?.departureTime).toLocaleDateString('en-GB')}${retSeg ? ` / ${retSeg.origin}-${retSeg.destination} ${new Date(retSeg.departureTime).toLocaleDateString('en-GB')}` : ''}`;
                      navigator.clipboard.writeText(text);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    <MapPin className="w-4 h-4" />
                    Copy Route
                  </button>
                  <button
                    onClick={() => {
                      const names = booking.passengers?.map((p: any) => `${p.firstName} ${p.lastName}`).join(', ');
                      navigator.clipboard.writeText(names || '');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Copy Names
                  </button>
                </div>

                {/* Passenger Quick Reference - All info needed for booking */}
                <div className="mt-4 p-4 bg-white rounded-xl border border-orange-200">
                  <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Passenger Details (click to copy)
                  </h4>
                  <div className="space-y-2">
                    {booking.passengers?.map((p: any, i: number) => (
                      <div key={i} className="flex flex-wrap gap-2 items-center text-sm p-2 bg-gray-50 rounded-lg">
                        <button
                          onClick={() => navigator.clipboard.writeText(`${p.lastName}/${p.firstName}`)}
                          className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded font-mono text-xs"
                          title="Copy Name (GDS format)"
                        >
                          {p.lastName}/{p.firstName}
                        </button>
                        {p.dateOfBirth && (
                          <button
                            onClick={() => navigator.clipboard.writeText(new Date(p.dateOfBirth).toLocaleDateString('en-GB'))}
                            className="px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded text-xs"
                            title="Copy DOB"
                          >
                            DOB: {new Date(p.dateOfBirth).toLocaleDateString('en-GB')}
                          </button>
                        )}
                        {p.passportNumber && (
                          <button
                            onClick={() => navigator.clipboard.writeText(p.passportNumber)}
                            className="px-2 py-1 bg-green-100 hover:bg-green-200 text-green-800 rounded font-mono text-xs"
                            title="Copy Passport"
                          >
                            {p.passportNumber}
                          </button>
                        )}
                        {p.gender && (
                          <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                            {p.gender === 'male' ? 'M' : 'F'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mt-4">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Ticketing Details Card - Critical info for manual ticketing */}
            {(booking.status === 'pending_ticketing' || booking.status === 'ticketed') && (
              <div className="bg-white rounded-lg border-2 border-indigo-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <h3 className="font-bold flex items-center gap-2">
                    <FileCheck className="w-5 h-5" />
                    Ticketing Reference Details
                  </h3>
                  <p className="text-xs text-white/80">Key information for consolidator booking</p>
                </div>
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Booking Reference */}
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Fly2Any Ref</p>
                    <p className="text-lg font-bold text-indigo-700 font-mono">{booking.bookingReference}</p>
                  </div>
                  {/* Duffel Order ID */}
                  {booking.duffelOrderId && (
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Duffel Order ID</p>
                      <p className="text-sm font-mono text-gray-800 break-all">{booking.duffelOrderId}</p>
                    </div>
                  )}
                  {/* Source API */}
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Source</p>
                    <p className={`text-sm font-semibold ${
                      booking.sourceApi === 'Duffel' ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {booking.sourceApi || 'Unknown'}
                    </p>
                  </div>
                  {/* Net Price */}
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Net Price (Offer)</p>
                    <p className="text-lg font-bold text-gray-900">
                      {booking.payment.currency} {(booking.netPrice || booking.flight.price.total).toFixed(2)}
                    </p>
                  </div>
                  {/* Customer Price */}
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Customer Paid</p>
                    <p className="text-lg font-bold text-green-600">
                      {booking.payment.currency} {(booking.customerPrice || booking.payment.amount).toFixed(2)}
                    </p>
                  </div>
                  {/* Markup */}
                  {booking.markupAmount && booking.markupAmount > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Your Markup</p>
                      <p className="text-lg font-bold text-amber-600">
                        +{booking.payment.currency} {booking.markupAmount.toFixed(2)}
                      </p>
                    </div>
                  )}
                  {/* Duffel Offer ID from Notes */}
                  {booking.notes?.includes('Duffel Offer ID:') && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 font-medium">Duffel Offer ID</p>
                      <p className="text-xs font-mono text-gray-700 break-all">
                        {booking.notes.split('Duffel Offer ID:')[1]?.trim()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Enhanced Flight Card */}
            <EnhancedFlightCard flight={booking.flight} />

            {/* Booking Extras Card */}
            <BookingExtrasCard
              fareUpgrade={booking.fareUpgrade}
              bundle={booking.bundle}
              addOns={booking.addOns}
              seats={booking.seats}
              promoCode={booking.promoCode}
              currency={booking.payment.currency}
            />

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

          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Customer Profile Card */}
            <div className="bg-white rounded-lg border-2 border-blue-200 shadow-sm p-4">
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Customer Profile
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${booking.contactInfo.email}`} className="text-sm text-blue-600 hover:underline font-medium">
                    {booking.contactInfo.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a href={`tel:${booking.contactInfo.phone}`} className="text-sm text-gray-700 font-medium">
                    {booking.contactInfo.phone}
                  </a>
                </div>
                {booking.contactInfo.alternatePhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-300" />
                    <span className="text-sm text-gray-600">{booking.contactInfo.alternatePhone}</span>
                  </div>
                )}
                {booking.contactInfo.emergencyContact && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Emergency Contact</p>
                    <p className="text-sm font-medium text-gray-800">{booking.contactInfo.emergencyContact.name}</p>
                    <p className="text-xs text-gray-600">{booking.contactInfo.emergencyContact.phone} ({booking.contactInfo.emergencyContact.relationship})</p>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Management Card */}
            <BookingManagementCard
              booking={booking}
              onRefresh={fetchBooking}
              onConfirmPayment={booking.status === 'pending' && booking.payment.status === 'pending' ? handleConfirmPayment : undefined}
              onSendEmail={async (type) => {
                if (type === 'confirmation') {
                  await handleSendConfirmationEmail();
                }
              }}
              onOpenTicketing={booking.status === 'pending_ticketing' ? () => setShowTicketingForm(true) : undefined}
            />

            {/* Admin Pricing Card */}
            <AdminPricingCard booking={booking} />

            {/* E-Tickets & Sync Status Card */}
            {(booking.duffelOrderId || booking.amadeusBookingId || booking.eTickets?.length) && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Ticket className="w-4 h-4" />
                    Provider & E-Tickets
                  </span>
                  {booking.syncStatus && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      booking.syncStatus === 'synced' ? 'bg-green-100 text-green-700' :
                      booking.syncStatus === 'error' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {booking.syncStatus}
                    </span>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  {booking.sourceApi && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Provider:</span>
                      <span className="font-semibold">{booking.sourceApi}</span>
                    </div>
                  )}
                  {booking.duffelOrderId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-mono text-xs">{booking.duffelOrderId.substring(0, 20)}...</span>
                    </div>
                  )}
                  {booking.providerStatus && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-semibold capitalize">{booking.providerStatus}</span>
                    </div>
                  )}
                  {booking.lastSyncedAt && (
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Last Synced:</span>
                      <span>{new Date(booking.lastSyncedAt).toLocaleString()}</span>
                    </div>
                  )}
                  {/* E-Tickets List */}
                  {booking.eTickets && booking.eTickets.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-600 mb-2">E-Tickets:</p>
                      {booking.eTickets.map((ticket: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-xs py-1 bg-gray-50 px-2 rounded mb-1">
                          <span className="text-gray-600">{ticket.firstName} {ticket.lastName}</span>
                          <span className="font-mono text-green-700">{ticket.ticketNumber}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Status (compact) */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">Payment Status</span>
                {getPaymentStatusBadge(booking.payment.status)}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="font-semibold capitalize">{booking.payment.method.replace('_', ' ')}</span>
                </div>
                {booking.payment.cardLast4 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Card:</span>
                    <span className="font-semibold">{booking.payment.cardBrand?.toUpperCase() || 'CARD'} •••• {booking.payment.cardLast4}</span>
                  </div>
                )}
                {booking.payment.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">TXN:</span>
                    <span className="font-mono text-xs">{booking.payment.transactionId.substring(0, 16)}...</span>
                  </div>
                )}
                {booking.payment.paidAt && (
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Paid:</span>
                    <span>{new Date(booking.payment.paidAt).toLocaleString()}</span>
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
