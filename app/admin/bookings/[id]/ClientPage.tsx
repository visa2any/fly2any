'use client';


import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
} from 'lucide-react';
import type { Booking } from '@/lib/bookings/types';

export default function AdminBookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [params.id]);

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
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      completed: 'bg-blue-100 text-blue-800 border-blue-300',
    };

    const icons = {
      pending: <Clock className="w-4 h-4" />,
      confirmed: <CheckCircle2 className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />,
      completed: <CheckCircle2 className="w-4 h-4" />,
    };

    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
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
