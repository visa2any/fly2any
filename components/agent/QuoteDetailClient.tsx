"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";

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

  // Parse JSON arrays
  const flights = Array.isArray(quote.flights) ? quote.flights : JSON.parse(quote.flights as string || "[]");
  const hotels = Array.isArray(quote.hotels) ? quote.hotels : JSON.parse(quote.hotels as string || "[]");
  const activities = Array.isArray(quote.activities) ? quote.activities : JSON.parse(quote.activities as string || "[]");
  const transfers = Array.isArray(quote.transfers) ? quote.transfers : JSON.parse(quote.transfers as string || "[]");
  const carRentals = Array.isArray(quote.carRentals) ? quote.carRentals : JSON.parse(quote.carRentals as string || "[]");
  const insurance = Array.isArray(quote.insurance) ? quote.insurance : JSON.parse(quote.insurance as string || "[]");
  const customItems = Array.isArray(quote.customItems) ? quote.customItems : JSON.parse(quote.customItems as string || "[]");

  const handleSendQuote = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/agents/quotes/${quote.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: `Your Travel Quote for ${quote.tripName}`,
          message: quote.notes || `Here is your personalized travel quote for ${quote.destination}.`,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send quote");
      }

      toast.success("Quote sent successfully!");
      router.refresh();
    } catch (error: any) {
      console.error("Send quote error:", error);
      toast.error(error.message || "Failed to send quote");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/agents/quotes/${quote.id}/pdf`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate PDF");
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Itinerary-${quote.tripName.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("PDF downloaded successfully!");
    } catch (error: any) {
      console.error("Download PDF error:", error);
      toast.error(error.message || "Failed to download PDF");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailPDF = async () => {
    if (!confirm(`Send PDF itinerary to ${quote.client.firstName} ${quote.client.lastName} (${quote.client.email})?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/agents/quotes/${quote.id}/email-pdf`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send PDF");
      }

      const data = await response.json();
      toast.success(data.message || "PDF sent successfully!");
    } catch (error: any) {
      console.error("Email PDF error:", error);
      toast.error(error.message || "Failed to send PDF");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuote = async () => {
    if (!confirm(`Delete quote "${quote.tripName}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/agents/quotes/${quote.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete quote");
      }

      toast.success("Quote deleted successfully!");
      router.push("/agent/quotes");
    } catch (error: any) {
      console.error("Delete quote error:", error);
      toast.error(error.message || "Failed to delete quote");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${quote.currency === "USD" ? "$" : quote.currency} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Quote Details */}
      <div className="lg:col-span-2 space-y-6">
        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            {/* Primary Actions */}
            <div className="flex flex-wrap gap-3">
              {quote.status === "DRAFT" && (
                <>
                  <button
                    onClick={handleSendQuote}
                    disabled={loading}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium"
                  >
                    {loading ? "Sending..." : "Send to Client"}
                  </button>
                  <Link
                    href={`/agent/quotes/${quote.id}/edit`}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Edit Quote
                  </Link>
                </>
              )}

              {(quote.status === "SENT" || quote.status === "VIEWED") && (
                <button
                  onClick={handleSendQuote}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  {loading ? "Resending..." : "Resend to Client"}
                </button>
              )}

              {quote.status === "ACCEPTED" && !quote.booking && (
                <Link
                  href={`/agent/bookings/convert?quoteId=${quote.id}`}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Convert to Booking
                </Link>
              )}

              {quote.status === "CONVERTED" && quote.booking && (
                <Link
                  href={`/agent/bookings/${quote.booking.id}`}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
                >
                  View Booking
                </Link>
              )}

              {(quote.status === "DRAFT" || quote.status === "DECLINED" || quote.status === "EXPIRED") && (
                <button
                  onClick={handleDeleteQuote}
                  disabled={loading}
                  className="px-6 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 font-medium"
                >
                  {loading ? "Deleting..." : "Delete Quote"}
                </button>
              )}
            </div>

            {/* PDF Actions */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-3">Itinerary PDF</p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleDownloadPDF}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 disabled:opacity-50 font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </button>
                <button
                  onClick={handleEmailPDF}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email PDF to Client
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Professional itinerary with all trip details, products, and pricing
              </p>
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">👤</span>
            Client Information
          </h3>
          <div className="space-y-2">
            <p className="text-gray-900 font-medium text-lg">
              {quote.client.firstName} {quote.client.lastName}
            </p>
            <p className="text-gray-600 text-sm">{quote.client.email}</p>
            {quote.client.phone && <p className="text-gray-600 text-sm">{quote.client.phone}</p>}
          </div>
        </div>

        {/* Trip Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">✈️</span>
            Trip Details
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Trip Name</p>
              <p className="text-gray-900 font-medium">{quote.tripName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Destination</p>
              <p className="text-gray-900 font-medium">{quote.destination}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Departure</p>
                <p className="text-gray-900 font-medium">{formatDate(quote.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Return</p>
                <p className="text-gray-900 font-medium">{formatDate(quote.endDate)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-gray-900 font-medium">
                  {quote.duration} {quote.duration === 1 ? "Day" : "Days"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Travelers</p>
                <p className="text-gray-900 font-medium">
                  {quote.travelers} Total ({quote.adults} Adults
                  {quote.children > 0 && `, ${quote.children} Children`}
                  {quote.infants > 0 && `, ${quote.infants} Infants`})
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Products Included */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📦</span>
            Products Included
          </h3>
          <div className="space-y-4">
            {flights.length > 0 && (
              <ProductSection title="Flights" icon="✈️" items={flights} currency={quote.currency} />
            )}
            {hotels.length > 0 && (
              <ProductSection title="Hotels" icon="🏨" items={hotels} currency={quote.currency} />
            )}
            {activities.length > 0 && (
              <ProductSection title="Activities" icon="🎯" items={activities} currency={quote.currency} />
            )}
            {transfers.length > 0 && (
              <ProductSection title="Transfers" icon="🚗" items={transfers} currency={quote.currency} />
            )}
            {carRentals.length > 0 && (
              <ProductSection title="Car Rentals" icon="🚙" items={carRentals} currency={quote.currency} />
            )}
            {insurance.length > 0 && (
              <ProductSection title="Insurance" icon="🛡️" items={insurance} currency={quote.currency} />
            )}
            {customItems.length > 0 && (
              <ProductSection title="Custom Items" icon="📝" items={customItems} currency={quote.currency} />
            )}
          </div>
        </div>

        {/* Messages */}
        {quote.notes && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">💬</span>
              Message to Client
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
          </div>
        )}

        {quote.agentNotes && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">📝</span>
              Internal Notes (Private)
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">{quote.agentNotes}</p>
          </div>
        )}
      </div>

      {/* Right Column: Pricing & Timeline */}
      <div className="lg:col-span-1 space-y-6">
        {/* Pricing Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">💰</span>
            Pricing Summary
          </h3>

          <div className="space-y-3">
            {quote.flightsCost > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Flights</span>
                <span className="font-medium text-gray-900">{formatCurrency(quote.flightsCost)}</span>
              </div>
            )}
            {quote.hotelsCost > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Hotels</span>
                <span className="font-medium text-gray-900">{formatCurrency(quote.hotelsCost)}</span>
              </div>
            )}
            {quote.activitiesCost > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Activities</span>
                <span className="font-medium text-gray-900">{formatCurrency(quote.activitiesCost)}</span>
              </div>
            )}
            {quote.transfersCost > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Transfers</span>
                <span className="font-medium text-gray-900">{formatCurrency(quote.transfersCost)}</span>
              </div>
            )}
            {quote.carRentalsCost > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Car Rentals</span>
                <span className="font-medium text-gray-900">{formatCurrency(quote.carRentalsCost)}</span>
              </div>
            )}
            {quote.insuranceCost > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Insurance</span>
                <span className="font-medium text-gray-900">{formatCurrency(quote.insuranceCost)}</span>
              </div>
            )}
            {quote.customItemsCost > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Other Items</span>
                <span className="font-medium text-gray-900">{formatCurrency(quote.customItemsCost)}</span>
              </div>
            )}

            <div className="border-t border-gray-200 pt-3 mt-3"></div>
            <div className="flex justify-between">
              <span className="text-gray-700 font-medium">Subtotal</span>
              <span className="font-semibold text-gray-900">{formatCurrency(quote.subtotal)}</span>
            </div>

            {quote.agentMarkup > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Agent Markup ({quote.agentMarkupPercent}%)</span>
                <span className="font-medium text-green-600">+{formatCurrency(quote.agentMarkup)}</span>
              </div>
            )}

            {quote.taxes > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Taxes & Fees</span>
                <span className="font-medium text-gray-900">+{formatCurrency(quote.taxes)}</span>
              </div>
            )}

            {quote.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-red-600">-{formatCurrency(quote.discount)}</span>
              </div>
            )}

            <div className="border-t-2 border-gray-300 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-primary-600">{formatCurrency(quote.total)}</span>
              </div>
            </div>

            <div className="bg-primary-50 rounded-lg p-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Per Person</span>
                <span className="text-lg font-bold text-primary-700">
                  {formatCurrency(quote.total / quote.travelers)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📅</span>
            Activity Timeline
          </h3>
          <div className="space-y-4">
            <TimelineItem
              title="Quote Created"
              time={formatDateTime(quote.createdAt)}
              icon="📝"
              color="gray"
            />

            {quote.sentAt && (
              <TimelineItem
                title="Sent to Client"
                time={formatDateTime(quote.sentAt)}
                icon="📧"
                color="blue"
              />
            )}

            {quote.viewedAt && (
              <TimelineItem
                title="Viewed by Client"
                time={formatDateTime(quote.viewedAt)}
                icon="👁️"
                color="purple"
              />
            )}

            {quote.acceptedAt && (
              <TimelineItem
                title="Accepted by Client"
                time={formatDateTime(quote.acceptedAt)}
                icon="✅"
                color="green"
              />
            )}

            {quote.declinedAt && (
              <TimelineItem
                title="Declined by Client"
                time={formatDateTime(quote.declinedAt)}
                icon="❌"
                color="red"
              />
            )}

            {quote.booking && (
              <TimelineItem
                title="Converted to Booking"
                time="Booking created"
                icon="🎉"
                color="teal"
              />
            )}

            <TimelineItem
              title="Expires"
              time={formatDate(quote.expiresAt)}
              icon="⏰"
              color={new Date(quote.expiresAt) < new Date() ? "red" : "orange"}
            />
          </div>
        </div>

        {/* Booking Info */}
        {quote.booking && (
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <h4 className="font-medium text-teal-900 mb-2">Converted to Booking</h4>
            <p className="text-sm text-teal-700 mb-3">
              Reference: <strong>{quote.booking.confirmationNumber}</strong>
            </p>
            <Link
              href={`/agent/bookings/${quote.booking.id}`}
              className="inline-block px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium"
            >
              View Booking
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductSection({ title, icon, items, currency }: any) {
  const formatCurrency = (amount: number) => {
    return `${currency === "USD" ? "$" : currency} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
        <span className="mr-1">{icon}</span>
        {title} ({items.length})
      </p>
      <div className="ml-6 space-y-2">
        {items.map((item: any, index: number) => (
          <div key={index} className="flex justify-between text-sm">
            <div className="flex-1">
              <p className="text-gray-900 font-medium">{item.name}</p>
              {item.description && <p className="text-gray-600 text-xs">{item.description}</p>}
            </div>
            <span className="font-medium text-gray-900 ml-4">{formatCurrency(item.price)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineItem({ title, time, icon, color }: any) {
  const colors = {
    gray: "bg-gray-100 text-gray-800",
    blue: "bg-blue-100 text-blue-800",
    purple: "bg-purple-100 text-purple-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    orange: "bg-orange-100 text-orange-800",
    teal: "bg-teal-100 text-teal-800",
  };

  return (
    <div className="flex items-start gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colors[color as keyof typeof colors]}`}>
        <span className="text-sm">{icon}</span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-600">{time}</p>
      </div>
    </div>
  );
}
