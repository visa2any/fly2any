"use client";

// components/agent/QuoteDetailClient.tsx
// Level 6 Ultra-Premium Quote Detail with Payment Link
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import Link from "next/link";
import {
  Plane, Building2, Car, MapPin, Shield, Calendar,
  Users, DollarSign, Send, Copy, ExternalLink, Clock,
  CheckCircle, XCircle, Eye, CreditCard, RefreshCw,
  ChevronDown, ChevronRight, Percent, FileText, Mail
} from "lucide-react";

interface QuoteDetailClientProps {
  quote: {
    id: string;
    tripName: string;
    destination: string;
    startDate: Date;
    endDate: Date;
    duration: number;
    travelers: number;
    adults: number;
    children: number;
    infants: number;
    flights: any;
    hotels: any;
    activities: any;
    transfers: any;
    carRentals: any;
    insurance: any;
    customItems: any;
    flightsCost: number;
    hotelsCost: number;
    activitiesCost: number;
    transfersCost: number;
    carRentalsCost: number;
    insuranceCost: number;
    customItemsCost: number;
    subtotal: number;
    agentMarkupPercent: number | null;
    agentMarkup: number;
    taxes: number;
    fees: number;
    discount: number;
    total: number;
    currency: string;
    notes: string | null;
    agentNotes: string | null;
    status: string;
    expiresAt: Date;
    createdAt: Date;
    sentAt: Date | null;
    viewedAt: Date | null;
    acceptedAt: Date | null;
    declinedAt: Date | null;
    paymentLinkId?: string | null;
    paymentStatus?: string | null;
    paidAt?: Date | null;
    paidAmount?: number | null;
    client: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string | null;
    };
    booking: {
      id: string;
      confirmationNumber: string;
    } | null;
  };
}

export default function QuoteDetailClient({ quote }: QuoteDetailClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sendingQuote, setSendingQuote] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("flights");

  // Parse JSON arrays
  const flights = Array.isArray(quote.flights) ? quote.flights : JSON.parse(quote.flights as string || "[]");
  const hotels = Array.isArray(quote.hotels) ? quote.hotels : JSON.parse(quote.hotels as string || "[]");
  const activities = Array.isArray(quote.activities) ? quote.activities : JSON.parse(quote.activities as string || "[]");
  const transfers = Array.isArray(quote.transfers) ? quote.transfers : JSON.parse(quote.transfers as string || "[]");
  const carRentals = Array.isArray(quote.carRentals) ? quote.carRentals : JSON.parse(quote.carRentals as string || "[]");
  const insurance = Array.isArray(quote.insurance) ? quote.insurance : JSON.parse(quote.insurance as string || "[]");
  const customItems = Array.isArray(quote.customItems) ? quote.customItems : JSON.parse(quote.customItems as string || "[]");

  const paymentLink = quote.paymentLinkId
    ? `${window.location.origin}/pay/${quote.paymentLinkId}`
    : null;

  const handleSendQuote = async () => {
    setSendingQuote(true);
    try {
      const response = await fetch(`/api/agents/quotes/${quote.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: `Your Travel Quote for ${quote.tripName}`,
          message: quote.notes || `Here is your personalized travel quote for ${quote.destination}.`,
        }),
      });

      if (!response.ok) throw new Error("Failed to send quote");

      toast.success("Quote sent to client!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to send quote");
    } finally {
      setSendingQuote(false);
    }
  };

  const handleGeneratePaymentLink = async () => {
    setGeneratingLink(true);
    try {
      const response = await fetch(`/api/agents/quotes/${quote.id}/payment-link`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to generate payment link");

      toast.success("Payment link generated!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to generate payment link");
    } finally {
      setGeneratingLink(false);
    }
  };

  const copyPaymentLink = () => {
    if (paymentLink) {
      navigator.clipboard.writeText(paymentLink);
      toast.success("Payment link copied!");
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { icon: any; color: string; bg: string; label: string }> = {
      DRAFT: { icon: FileText, color: "text-gray-600", bg: "bg-gray-100", label: "Draft" },
      SENT: { icon: Send, color: "text-blue-600", bg: "bg-blue-100", label: "Sent" },
      VIEWED: { icon: Eye, color: "text-purple-600", bg: "bg-purple-100", label: "Viewed" },
      ACCEPTED: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-100", label: "Accepted" },
      DECLINED: { icon: XCircle, color: "text-red-600", bg: "bg-red-100", label: "Declined" },
      EXPIRED: { icon: Clock, color: "text-orange-600", bg: "bg-orange-100", label: "Expired" },
      CONVERTED: { icon: CreditCard, color: "text-teal-600", bg: "bg-teal-100", label: "Converted" },
    };
    return configs[status] || configs.DRAFT;
  };

  const statusConfig = getStatusConfig(quote.status);
  const StatusIcon = statusConfig.icon;

  const sections = [
    { key: "flights", label: "Flights", icon: Plane, cost: quote.flightsCost, items: flights },
    { key: "hotels", label: "Hotels", icon: Building2, cost: quote.hotelsCost, items: hotels },
    { key: "activities", label: "Activities", icon: MapPin, cost: quote.activitiesCost, items: activities },
    { key: "transfers", label: "Transfers", icon: Car, cost: quote.transfersCost, items: transfers },
    { key: "carRentals", label: "Car Rentals", icon: Car, cost: quote.carRentalsCost, items: carRentals },
    { key: "insurance", label: "Insurance", icon: Shield, cost: quote.insuranceCost, items: insurance },
  ].filter(s => s.items.length > 0 || s.cost > 0);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Trip Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)]"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                  <StatusIcon className="w-4 h-4" />
                  {statusConfig.label}
                </span>
                {quote.paymentStatus === "PAID" && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-600">
                    <CheckCircle className="w-4 h-4" />
                    Paid
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{quote.destination}</h2>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Quote ID</p>
              <p className="font-mono text-sm font-medium text-gray-900">#{quote.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-gray-50 rounded-xl">
              <Calendar className="w-4 h-4 text-gray-400 mb-1" />
              <p className="text-xs text-gray-500">Dates</p>
              <p className="text-sm font-semibold text-gray-900">
                {new Date(quote.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(quote.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <Clock className="w-4 h-4 text-gray-400 mb-1" />
              <p className="text-xs text-gray-500">Duration</p>
              <p className="text-sm font-semibold text-gray-900">{quote.duration} nights</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <Users className="w-4 h-4 text-gray-400 mb-1" />
              <p className="text-xs text-gray-500">Travelers</p>
              <p className="text-sm font-semibold text-gray-900">{quote.travelers} guests</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <Clock className="w-4 h-4 text-gray-400 mb-1" />
              <p className="text-xs text-gray-500">Expires</p>
              <p className="text-sm font-semibold text-gray-900">
                {new Date(quote.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Itinerary Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Itinerary</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {sections.map((section) => {
              const Icon = section.icon;
              const isExpanded = expandedSection === section.key;

              return (
                <div key={section.key}>
                  <button
                    onClick={() => setExpandedSection(isExpanded ? null : section.key)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{section.label}</p>
                        <p className="text-sm text-gray-500">{section.items.length} item{section.items.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-gray-900">${section.cost.toLocaleString()}</span>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  <AnimatePresence>
                    {isExpanded && section.items.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-4 space-y-3">
                          {section.items.map((item: any, idx: number) => (
                            <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                              <p className="font-medium text-gray-900">{item.name || item.title || `${section.label} ${idx + 1}`}</p>
                              {item.description && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}
                              {item.price && <p className="text-sm font-semibold text-indigo-600 mt-2">${item.price.toLocaleString()}</p>}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Notes */}
        {quote.notes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)]"
          >
            <h3 className="font-semibold text-gray-900 mb-3">Notes for Client</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{quote.notes}</p>
          </motion.div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Client Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)]"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Client</h3>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
              {quote.client.firstName[0]}{quote.client.lastName[0]}
            </div>
            <div>
              <p className="font-medium text-gray-900">{quote.client.firstName} {quote.client.lastName}</p>
              <p className="text-sm text-gray-500">{quote.client.email}</p>
            </div>
          </div>
          {quote.client.phone && (
            <p className="text-sm text-gray-500">{quote.client.phone}</p>
          )}
        </motion.div>

        {/* Pricing Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)]"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Pricing</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">${quote.subtotal.toLocaleString()}</span>
            </div>
            {quote.agentMarkup > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  Markup ({quote.agentMarkupPercent}%)
                </span>
                <span className="text-emerald-600">+${quote.agentMarkup.toLocaleString()}</span>
              </div>
            )}
            {quote.taxes > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Taxes</span>
                <span className="text-gray-900">${quote.taxes.toLocaleString()}</span>
              </div>
            )}
            {quote.fees > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Fees</span>
                <span className="text-gray-900">${quote.fees.toLocaleString()}</span>
              </div>
            )}
            {quote.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount</span>
                <span className="text-red-500">-${quote.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-gray-100 pt-3 flex justify-between">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-gray-900">${quote.total.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>

        {/* Payment Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white"
        >
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-5 h-5" />
            <h3 className="font-semibold">Payment Link</h3>
          </div>

          {paymentLink ? (
            <div className="space-y-3">
              <div className="bg-white/20 rounded-xl p-3">
                <p className="text-xs text-white/70 mb-1">Link</p>
                <p className="text-sm font-mono truncate">{paymentLink}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copyPaymentLink}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
                <a
                  href={paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open
                </a>
              </div>
              {quote.paymentStatus === "PAID" && (
                <div className="mt-3 p-3 bg-emerald-500/30 rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Paid</p>
                    <p className="text-xs text-white/80">
                      {quote.paidAt && new Date(quote.paidAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="text-sm text-white/80 mb-3">
                Generate a payment link for your client to pay this quote directly.
              </p>
              <button
                onClick={handleGeneratePaymentLink}
                disabled={generatingLink || quote.status === "DRAFT"}
                className="w-full py-2.5 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generatingLink ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Generate Link
                  </>
                )}
              </button>
              {quote.status === "DRAFT" && (
                <p className="text-xs text-white/60 mt-2 text-center">
                  Send the quote first to generate a payment link
                </p>
              )}
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          {quote.status === "DRAFT" && (
            <button
              onClick={handleSendQuote}
              disabled={sendingQuote}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sendingQuote ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Send to Client
                </>
              )}
            </button>
          )}

          <Link
            href={`/agent/quotes/${quote.id}/edit`}
            className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            Edit Quote
          </Link>

          {quote.booking && (
            <Link
              href={`/agent/bookings/${quote.booking.id}`}
              className="w-full py-3 bg-emerald-50 text-emerald-700 rounded-xl font-medium hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              View Booking
            </Link>
          )}
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)]"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Timeline</h3>
          <div className="space-y-4">
            <TimelineItem
              icon={FileText}
              label="Created"
              date={quote.createdAt}
              active
            />
            {quote.sentAt && (
              <TimelineItem
                icon={Send}
                label="Sent"
                date={quote.sentAt}
                active
              />
            )}
            {quote.viewedAt && (
              <TimelineItem
                icon={Eye}
                label="Viewed"
                date={quote.viewedAt}
                active
              />
            )}
            {quote.acceptedAt && (
              <TimelineItem
                icon={CheckCircle}
                label="Accepted"
                date={quote.acceptedAt}
                active
                success
              />
            )}
            {quote.declinedAt && (
              <TimelineItem
                icon={XCircle}
                label="Declined"
                date={quote.declinedAt}
                active
                error
              />
            )}
            {quote.paidAt && (
              <TimelineItem
                icon={CreditCard}
                label="Paid"
                date={quote.paidAt}
                active
                success
              />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function TimelineItem({
  icon: Icon,
  label,
  date,
  active,
  success,
  error,
}: {
  icon: any;
  label: string;
  date: Date;
  active?: boolean;
  success?: boolean;
  error?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          success ? 'bg-emerald-100 text-emerald-600' :
          error ? 'bg-red-100 text-red-600' :
          active ? 'bg-indigo-100 text-indigo-600' :
          'bg-gray-100 text-gray-400'
        }`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">
          {new Date(date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}
