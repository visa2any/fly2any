"use client";

// components/agent/BookingDetailClient.tsx
// Level 6 / Level 3-4 Hybrid — Booking Detail View
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import Link from "next/link";
import {
  Plane, Building2, Car, MapPin, Calendar, Users, DollarSign,
  CheckCircle, XCircle, Clock, CreditCard, ArrowLeft,
  Shield, Ticket, ChevronDown, FileText, User, Mail, Phone,
  AlertCircle, RefreshCw, Copy
} from "lucide-react";

interface BookingDetailClientProps {
  booking: {
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
    insurance: any;
    customItems: any[];
    subtotal: number;
    agentMarkup: number;
    taxes: number;
    fees: number;
    discount: number;
    total: number;
    currency: string;
    paymentStatus: string;
    depositAmount: number;
    balanceDue: number;
    totalPaid: number;
    depositDueDate: string | null;
    finalPaymentDue: string | null;
    status: string;
    source: string | null;
    notes: string | null;
    createdAt: string;
    client: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string | null;
    };
    quote: {
      id: string;
      quoteNumber: string;
      createdAt: string;
      sentAt: string | null;
      acceptedAt: string | null;
      agentMarkupPercent: number | null;
    } | null;
    commissions: Array<{
      id: string;
      agentEarnings: number;
      platformFee: number;
      status: string;
      holdUntil: string;
      grossProfit: number;
    }>;
  };
}

export default function BookingDetailClient({ booking }: BookingDetailClientProps) {
  const router = useRouter();
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD");
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Parse passenger info from notes
  let passengerInfo: any = null;
  try {
    if (booking.notes) {
      const parsed = JSON.parse(booking.notes);
      if (parsed.passengers) passengerInfo = parsed;
    }
  } catch { /* notes is plain text */ }

  const statusColors: Record<string, { bg: string; text: string; icon: any }> = {
    PENDING: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock },
    CONFIRMED: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
    IN_PROGRESS: { bg: "bg-blue-100", text: "text-blue-700", icon: RefreshCw },
    COMPLETED: { bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircle },
    CANCELLED: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
  };

  const paymentStatusColors: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: "bg-yellow-100", text: "text-yellow-700" },
    DEPOSIT_PAID: { bg: "bg-orange-100", text: "text-orange-700" },
    FULLY_PAID: { bg: "bg-green-100", text: "text-green-700" },
    REFUNDED: { bg: "bg-gray-100", text: "text-gray-700" },
  };

  const sConfig = statusColors[booking.status] || statusColors.PENDING;
  const pConfig = paymentStatusColors[booking.paymentStatus] || paymentStatusColors.PENDING;
  const StatusIcon = sConfig.icon;
  const commission = booking.commissions?.[0];

  const handleRecordPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    setRecordingPayment(true);
    try {
      const res = await fetch(`/api/agents/bookings/${booking.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          paymentMethod,
          paymentType: amount >= booking.balanceDue ? "FULL" : "PARTIAL",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to record payment");
      }

      toast.success(`Payment of $${amount.toLocaleString()} recorded`);
      setShowPaymentForm(false);
      setPaymentAmount("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setRecordingPayment(false);
    }
  };

  const copyConfirmation = () => {
    navigator.clipboard.writeText(booking.confirmationNumber);
    toast.success("Copied!");
  };

  const sections = [
    { key: "flights", label: "Flights", icon: Plane, items: booking.flights || [] },
    { key: "hotels", label: "Hotels", icon: Building2, items: booking.hotels || [] },
    { key: "activities", label: "Activities", icon: Ticket, items: booking.activities || [] },
    { key: "transfers", label: "Transfers", icon: Car, items: booking.transfers || [] },
    { key: "carRentals", label: "Car Rentals", icon: Car, items: booking.carRentals || [] },
  ].filter(s => s.items.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push("/agent/bookings")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{booking.tripName}</h1>
            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${sConfig.bg} ${sConfig.text}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {booking.status}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${pConfig.bg} ${pConfig.text}`}>
              {booking.paymentStatus.replace("_", " ")}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button onClick={copyConfirmation}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 font-mono transition-colors">
              {booking.confirmationNumber}
              <Copy className="w-3.5 h-3.5" />
            </button>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">{booking.destination}</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trip Overview */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Trip Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-gray-50 rounded-xl">
                <Calendar className="w-4 h-4 text-gray-400 mb-1" />
                <p className="text-xs text-gray-500">Dates</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(booking.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(booking.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <Clock className="w-4 h-4 text-gray-400 mb-1" />
                <p className="text-xs text-gray-500">Duration</p>
                <p className="text-sm font-semibold text-gray-900">{booking.duration} nights</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <Users className="w-4 h-4 text-gray-400 mb-1" />
                <p className="text-xs text-gray-500">Travelers</p>
                <p className="text-sm font-semibold text-gray-900">{booking.travelers} guests</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <MapPin className="w-4 h-4 text-gray-400 mb-1" />
                <p className="text-xs text-gray-500">Destination</p>
                <p className="text-sm font-semibold text-gray-900">{booking.destination}</p>
              </div>
            </div>
          </motion.div>

          {/* Itinerary Items */}
          {sections.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Itinerary</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <div key={section.key} className="px-6 py-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-indigo-600" />
                        </div>
                        <p className="font-medium text-gray-900">{section.label} ({section.items.length})</p>
                      </div>
                      <div className="space-y-2 ml-11">
                        {section.items.map((item: any, idx: number) => (
                          <div key={idx} className="p-3 bg-gray-50 rounded-lg text-sm">
                            <p className="font-medium text-gray-900">
                              {item.name || item.title || item.airline || `${section.label} ${idx + 1}`}
                            </p>
                            {item.origin && item.destination && (
                              <p className="text-gray-500 mt-0.5">{item.origin} → {item.destination}</p>
                            )}
                            {item.checkIn && (
                              <p className="text-gray-500 mt-0.5">{item.checkIn} – {item.checkOut}</p>
                            )}
                            {(item.price || item.totalPrice) && (
                              <p className="text-indigo-600 font-medium mt-1">${(item.price || item.totalPrice)?.toLocaleString()}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Passengers (from notes) */}
          {passengerInfo?.passengers && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-4">Passengers</h2>
              <div className="space-y-3">
                {passengerInfo.passengers.map((pax: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{pax.firstName} {pax.lastName}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {pax.type}
                        {pax.dateOfBirth ? ` · DOB: ${pax.dateOfBirth}` : ''}
                        {pax.nationality ? ` · ${pax.nationality}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {passengerInfo.contact?.specialRequests && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs font-medium text-amber-800 mb-1">Special Requests</p>
                  <p className="text-sm text-amber-700">{passengerInfo.contact.specialRequests}</p>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Client</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                {booking.client.firstName[0]}{booking.client.lastName[0]}
              </div>
              <div>
                <p className="font-medium text-gray-900">{booking.client.firstName} {booking.client.lastName}</p>
                <p className="text-sm text-gray-500">{booking.client.email}</p>
              </div>
            </div>
            {booking.client.phone && (
              <p className="text-sm text-gray-500 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> {booking.client.phone}
              </p>
            )}
          </motion.div>

          {/* Payment Summary */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Payment</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">${booking.subtotal.toLocaleString()}</span>
              </div>
              {booking.agentMarkup > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Markup</span>
                  <span className="text-emerald-600">+${booking.agentMarkup.toLocaleString()}</span>
                </div>
              )}
              {booking.taxes > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Taxes</span>
                  <span>${booking.taxes.toLocaleString()}</span>
                </div>
              )}
              {booking.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-red-500">-${booking.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-lg">${booking.total.toLocaleString()}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="text-gray-500">Paid</span>
                <span className="text-emerald-600 font-medium">${booking.totalPaid.toLocaleString()}</span>
              </div>
              {booking.balanceDue > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Balance Due</span>
                  <span className="text-orange-600 font-medium">${booking.balanceDue.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Record Payment */}
            {booking.balanceDue > 0 && booking.status !== "CANCELLED" && (
              <div className="mt-4">
                {showPaymentForm ? (
                  <div className="space-y-3 p-3 bg-gray-50 rounded-xl">
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={e => setPaymentAmount(e.target.value)}
                      placeholder={`Amount (max $${booking.balanceDue.toLocaleString()})`}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                    />
                    <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                      <option value="CREDIT_CARD">Credit Card</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="PAYPAL">PayPal</option>
                      <option value="CASH">Cash</option>
                      <option value="OTHER">Other</option>
                    </select>
                    <div className="flex gap-2">
                      <button onClick={handleRecordPayment} disabled={recordingPayment}
                        className="flex-1 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-50">
                        {recordingPayment ? "Recording..." : "Record"}
                      </button>
                      <button onClick={() => setShowPaymentForm(false)}
                        className="py-2 px-3 border border-gray-200 rounded-lg text-sm hover:bg-gray-100">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowPaymentForm(true)}
                    className="w-full py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Record Payment
                  </button>
                )}
              </div>
            )}
          </motion.div>

          {/* Commission */}
          {commission && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-5 text-white">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5" /> Commission
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Gross Profit</span>
                  <span className="font-medium">${commission.grossProfit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Platform Fee</span>
                  <span>-${commission.platformFee.toLocaleString()}</span>
                </div>
                <div className="border-t border-white/20 pt-2 flex justify-between font-semibold">
                  <span>Your Earnings</span>
                  <span className="text-lg">${commission.agentEarnings.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-3 p-2 bg-white/15 rounded-lg text-xs text-center">
                <span className="capitalize">{commission.status.replace("_", " ").toLowerCase()}</span>
                {commission.holdUntil && (
                  <span className="ml-1">· Releases {new Date(commission.holdUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                )}
              </div>
            </motion.div>
          )}

          {/* Status Info & Actions */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="space-y-3">
            {booking.status === "PENDING" && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">Processing by Fly2Any</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Fly2Any is confirming reservations and issuing e-tickets. No action needed from you.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {booking.status === "CONFIRMED" && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-emerald-900">Confirmed by Fly2Any</p>
                    <p className="text-xs text-emerald-700 mt-1">
                      All reservations have been confirmed. E-tickets and vouchers have been sent to the client.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {booking.quote && (
              <Link href={`/agent/quotes/${booking.quote.id}`}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                View Original Quote
              </Link>
            )}
          </motion.div>

          {/* Quote Timeline */}
          {booking.quote && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Timeline</h3>
              <div className="space-y-3">
                <TimelineItem icon={FileText} label="Quote Created" date={booking.quote.createdAt} active />
                {booking.quote.sentAt && <TimelineItem icon={Mail} label="Quote Sent" date={booking.quote.sentAt} active />}
                {booking.quote.acceptedAt && <TimelineItem icon={CheckCircle} label="Quote Accepted" date={booking.quote.acceptedAt} active success />}
                <TimelineItem icon={CreditCard} label="Booking Created" date={booking.createdAt} active />
                {booking.paymentStatus === "FULLY_PAID" && (
                  <TimelineItem icon={DollarSign} label="Fully Paid" date={booking.createdAt} active success />
                )}
                {booking.status === "CONFIRMED" && (
                  <TimelineItem icon={CheckCircle} label="Confirmed" date={booking.createdAt} active success />
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function TimelineItem({
  icon: Icon, label, date, active, success
}: {
  icon: any; label: string; date: string; active?: boolean; success?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
        success ? 'bg-emerald-100 text-emerald-600' :
        active ? 'bg-indigo-100 text-indigo-600' :
        'bg-gray-100 text-gray-400'
      }`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">
          {new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
