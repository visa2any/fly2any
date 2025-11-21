"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface Quote {
  id: string;
  tripName: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  travelers: number;
  total: number;
  currency: string;
  status: string;
  client: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: Date;
  sentAt: Date | null;
  viewedAt: Date | null;
  acceptedAt: Date | null;
  declinedAt: Date | null;
  expiresAt: Date;
}

interface QuoteListClientProps {
  quotes: Quote[];
}

export default function QuoteListClient({ quotes }: QuoteListClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState<string | null>(null);

  // Filter quotes
  const filteredQuotes = quotes.filter((quote) => {
    // Status filter
    if (statusFilter !== "ALL" && quote.status !== statusFilter) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        quote.tripName.toLowerCase().includes(query) ||
        quote.destination.toLowerCase().includes(query) ||
        quote.client.firstName.toLowerCase().includes(query) ||
        quote.client.lastName.toLowerCase().includes(query) ||
        quote.client.email.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const handleSendQuote = async (quoteId: string, clientName: string) => {
    if (!confirm(`Send this quote to ${clientName}?`)) {
      return;
    }

    setLoading(quoteId);
    try {
      const response = await fetch(`/api/agents/quotes/${quoteId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: "Your Travel Quote",
          message: "Please review your personalized travel quote.",
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
      setLoading(null);
    }
  };

  const handleDeleteQuote = async (quoteId: string, tripName: string) => {
    if (!confirm(`Delete quote "${tripName}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(quoteId);
    try {
      const response = await fetch(`/api/agents/quotes/${quoteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete quote");
      }

      toast.success("Quote deleted successfully!");
      router.refresh();
    } catch (error: any) {
      console.error("Delete quote error:", error);
      toast.error(error.message || "Failed to delete quote");
    } finally {
      setLoading(null);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency === "USD" ? "$" : currency} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      DRAFT: { bg: "bg-gray-100", text: "text-gray-800", label: "Draft" },
      SENT: { bg: "bg-blue-100", text: "text-blue-800", label: "Sent" },
      VIEWED: { bg: "bg-purple-100", text: "text-purple-800", label: "Viewed" },
      ACCEPTED: { bg: "bg-green-100", text: "text-green-800", label: "Accepted" },
      DECLINED: { bg: "bg-red-100", text: "text-red-800", label: "Declined" },
      EXPIRED: { bg: "bg-orange-100", text: "text-orange-800", label: "Expired" },
      CONVERTED: { bg: "bg-teal-100", text: "text-teal-800", label: "Converted" },
    };

    const badge = badges[status as keyof typeof badges] || badges.DRAFT;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client, trip, or destination..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="VIEWED">Viewed</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="DECLINED">Declined</option>
              <option value="EXPIRED">Expired</option>
              <option value="CONVERTED">Converted</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing <strong>{filteredQuotes.length}</strong> of <strong>{quotes.length}</strong> quotes
          </p>
        </div>
      </div>

      {/* Quote List */}
      {filteredQuotes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {searchQuery || statusFilter !== "ALL" ? (
            <>
              <p className="text-gray-600 mb-4">No quotes match your filters</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                }}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear Filters
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-4">You haven't created any quotes yet</p>
              <Link
                href="/agent/quotes/create"
                className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
              >
                Create Your First Quote
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredQuotes.map((quote) => (
            <div
              key={quote.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-primary-300 transition-all"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  {/* Left: Quote Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{quote.tripName}</h3>
                      {getStatusBadge(quote.status)}
                    </div>

                    <div className="space-y-1 text-sm text-gray-600 mb-4">
                      <p className="flex items-center">
                        <span className="mr-2">📍</span>
                        {quote.destination}
                      </p>
                      <p className="flex items-center">
                        <span className="mr-2">👤</span>
                        {quote.client.firstName} {quote.client.lastName} • {quote.client.email}
                      </p>
                      <p className="flex items-center">
                        <span className="mr-2">📅</span>
                        {formatDate(quote.startDate)} - {formatDate(quote.endDate)} ({quote.duration} days)
                      </p>
                      <p className="flex items-center">
                        <span className="mr-2">👥</span>
                        {quote.travelers} {quote.travelers === 1 ? "Traveler" : "Travelers"}
                      </p>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Created {formatDate(quote.createdAt)}</span>
                      {quote.sentAt && <span>• Sent {formatDate(quote.sentAt)}</span>}
                      {quote.viewedAt && <span>• Viewed {formatDate(quote.viewedAt)}</span>}
                      {quote.acceptedAt && <span>• Accepted {formatDate(quote.acceptedAt)}</span>}
                      {quote.declinedAt && <span>• Declined {formatDate(quote.declinedAt)}</span>}
                    </div>
                  </div>

                  {/* Right: Price & Actions */}
                  <div className="ml-6 text-right">
                    <p className="text-sm text-gray-600 mb-1">Total</p>
                    <p className="text-2xl font-bold text-gray-900 mb-1">
                      {formatCurrency(quote.total, quote.currency)}
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      {formatCurrency(quote.total / quote.travelers, quote.currency)} per person
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/agent/quotes/${quote.id}`}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium text-center"
                      >
                        View Details
                      </Link>

                      {quote.status === "DRAFT" && (
                        <>
                          <button
                            onClick={() => handleSendQuote(quote.id, `${quote.client.firstName} ${quote.client.lastName}`)}
                            disabled={loading === quote.id}
                            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-medium disabled:opacity-50"
                          >
                            {loading === quote.id ? "Sending..." : "Send to Client"}
                          </button>
                          <Link
                            href={`/agent/quotes/${quote.id}/edit`}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium text-center"
                          >
                            Edit
                          </Link>
                        </>
                      )}

                      {(quote.status === "SENT" || quote.status === "VIEWED") && (
                        <button
                          onClick={() => handleSendQuote(quote.id, `${quote.client.firstName} ${quote.client.lastName}`)}
                          disabled={loading === quote.id}
                          className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-medium disabled:opacity-50"
                        >
                          {loading === quote.id ? "Sending..." : "Resend"}
                        </button>
                      )}

                      {quote.status === "ACCEPTED" && (
                        <Link
                          href={`/agent/bookings/convert?quoteId=${quote.id}`}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium text-center"
                        >
                          Convert to Booking
                        </Link>
                      )}

                      {(quote.status === "DRAFT" || quote.status === "DECLINED" || quote.status === "EXPIRED") && (
                        <button
                          onClick={() => handleDeleteQuote(quote.id, quote.tripName)}
                          disabled={loading === quote.id}
                          className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium disabled:opacity-50"
                        >
                          {loading === quote.id ? "Deleting..." : "Delete"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expiration Warning */}
                {(quote.status === "SENT" || quote.status === "VIEWED") && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      Expires on {formatDate(quote.expiresAt)}
                      {new Date(quote.expiresAt) < new Date() && (
                        <span className="ml-2 text-red-600 font-medium">(Expired)</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
