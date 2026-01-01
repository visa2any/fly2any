"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText, Clock, CheckCircle2, XCircle, Eye, Download,
  MessageCircle, ChevronRight, Loader2, AlertCircle, Calendar,
  MapPin, Users, DollarSign, ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface ClientQuote {
  id: string;
  quoteNumber: string;
  tripName: string;
  destination: string;
  startDate: string;
  endDate: string;
  duration: number;
  travelers: number;
  total: number;
  currency: string;
  status: string;
  expiresAt: string;
  shareableLink: string;
  viewCount: number;
  createdAt: string;
  agent: {
    firstName: string;
    lastName: string;
    agencyName: string;
    email: string;
    phone: string;
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-700", icon: <FileText className="w-4 h-4" /> },
  SENT: { label: "Awaiting Review", color: "bg-blue-100 text-blue-700", icon: <Clock className="w-4 h-4" /> },
  VIEWED: { label: "Under Review", color: "bg-purple-100 text-purple-700", icon: <Eye className="w-4 h-4" /> },
  ACCEPTED: { label: "Accepted", color: "bg-green-100 text-green-700", icon: <CheckCircle2 className="w-4 h-4" /> },
  DECLINED: { label: "Declined", color: "bg-red-100 text-red-700", icon: <XCircle className="w-4 h-4" /> },
  EXPIRED: { label: "Expired", color: "bg-orange-100 text-orange-700", icon: <AlertCircle className="w-4 h-4" /> },
  CONVERTED: { label: "Booked", color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 className="w-4 h-4" /> },
};

export default function ClientPortalPage() {
  const { data: session, status: authStatus } = useSession();
  const [quotes, setQuotes] = useState<ClientQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (session?.user?.id) {
      fetchQuotes();
    }
  }, [session]);

  const fetchQuotes = async () => {
    try {
      const res = await fetch("/api/client/quotes");
      if (res.ok) {
        const data = await res.json();
        setQuotes(data.quotes || []);
      }
    } catch (error) {
      console.error("Failed to fetch quotes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuotes = quotes.filter((q) => {
    if (filter === "all") return true;
    if (filter === "active") return ["SENT", "VIEWED"].includes(q.status);
    if (filter === "accepted") return ["ACCEPTED", "CONVERTED"].includes(q.status);
    if (filter === "expired") return q.status === "EXPIRED";
    return true;
  });

  const fmt = (n: number, currency = "USD") =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-fly2any-red animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Sign In Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to access your travel quotes.</p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 px-6 py-3 bg-fly2any-red hover:bg-fly2any-red-hover text-white font-medium rounded-xl transition-colors"
          >
            Sign In <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold text-gray-900">My Travel Quotes</h1>
          <p className="text-gray-600 mt-1">View and manage your travel proposals</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { value: "all", label: "All Quotes", count: quotes.length },
            { value: "active", label: "Active", count: quotes.filter((q) => ["SENT", "VIEWED"].includes(q.status)).length },
            { value: "accepted", label: "Accepted", count: quotes.filter((q) => ["ACCEPTED", "CONVERTED"].includes(q.status)).length },
            { value: "expired", label: "Expired", count: quotes.filter((q) => q.status === "EXPIRED").length },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                filter === tab.value
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {tab.label}
              <span
                className={`px-1.5 py-0.5 rounded text-xs ${
                  filter === tab.value ? "bg-white/20" : "bg-gray-100"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Quotes List */}
        {filteredQuotes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No quotes found</h2>
            <p className="text-gray-500">
              {filter === "all"
                ? "You don't have any travel quotes yet."
                : `No ${filter} quotes at the moment.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuotes.map((quote, idx) => {
              const statusConfig = STATUS_CONFIG[quote.status] || STATUS_CONFIG.DRAFT;
              const isExpired = new Date(quote.expiresAt) < new Date() && !["ACCEPTED", "CONVERTED", "DECLINED"].includes(quote.status);

              return (
                <motion.div
                  key={quote.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left - Trip Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{quote.tripName}</h3>
                          <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                            {statusConfig.icon} {statusConfig.label}
                          </span>
                          {isExpired && quote.status !== "EXPIRED" && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                              Expired
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" /> {quote.destination}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(quote.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} —{" "}
                            {new Date(quote.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" /> {quote.travelers} travelers
                          </span>
                        </div>

                        <div className="mt-3 flex items-center gap-4 text-sm">
                          <span className="text-gray-500">From: {quote.agent.agencyName || `${quote.agent.firstName} ${quote.agent.lastName}`}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500">Quote #{quote.quoteNumber}</span>
                        </div>
                      </div>

                      {/* Right - Price & Actions */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{fmt(quote.total, quote.currency)}</p>
                          <p className="text-sm text-gray-500">{fmt(quote.total / quote.travelers, quote.currency)}/person</p>
                        </div>

                        <Link
                          href={`/client/quotes/${quote.shareableLink}`}
                          className="flex items-center gap-2 px-5 py-2.5 bg-fly2any-red hover:bg-fly2any-red-hover text-white font-medium rounded-xl transition-colors whitespace-nowrap"
                        >
                          View Quote <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions Bar */}
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" /> Viewed {quote.viewCount}x
                      </span>
                      <span>Created {new Date(quote.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`mailto:${quote.agent.email}?subject=Question about ${quote.tripName}`}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" /> Contact Agent
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
