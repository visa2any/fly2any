"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Plus, Search, ChevronRight, Clock, MapPin,
  Users, DollarSign, AlertCircle, Loader2, RefreshCw,
  Plane, Building2, Car, Compass, CheckCircle, Send,
  Filter, MoreVertical, Copy, Trash2
} from "lucide-react";
import { useQuoteWorkspace } from "../QuoteWorkspaceProvider";
import toast from "react-hot-toast";

interface QuoteListItem {
  id: string;
  tripName: string | null;
  destination: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  adults: number;
  children: number;
  totalPrice: number | null;
  currency: string | null;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  flights?: any[];
  hotels?: any[];
  activities?: any[];
  transfers?: any[];
  carRentals?: any[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  draft:     { label: "Draft",     color: "text-gray-600",   bg: "bg-gray-100",   icon: Clock },
  sent:      { label: "Sent",      color: "text-blue-600",   bg: "bg-blue-100",   icon: Send },
  accepted:  { label: "Accepted",  color: "text-green-600",  bg: "bg-green-100",  icon: CheckCircle },
  rejected:  { label: "Rejected",  color: "text-red-600",    bg: "bg-red-100",    icon: AlertCircle },
  expired:   { label: "Expired",   color: "text-orange-600", bg: "bg-orange-100", icon: Clock },
  booked:    { label: "Booked",    color: "text-purple-600", bg: "bg-purple-100", icon: CheckCircle },
};

const FILTER_STATUSES = ["all", "draft", "sent", "accepted", "rejected", "expired", "booked"];

function QuoteCard({ quote, onOpen, onDuplicate, onDelete }: {
  quote: QuoteListItem;
  onOpen: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const statusCfg = STATUS_CONFIG[quote.status] || STATUS_CONFIG.draft;
  const StatusIcon = statusCfg.icon;

  const itemCount = (quote.flights?.length || 0) + (quote.hotels?.length || 0) +
    (quote.activities?.length || 0) + (quote.transfers?.length || 0) + (quote.carRentals?.length || 0);

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;
  const formatPrice = (n: number | null, currency = "USD") => n != null
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD", maximumFractionDigits: 0 }).format(n)
    : null;

  const relativeTime = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="group relative bg-white border border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={() => onOpen(quote.id)}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0 shadow-sm">
            <FileText className="w-5 h-5 text-white" />
          </div>

          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 truncate text-sm">
                  {quote.tripName || "Untitled Quote"}
                </h3>
                {quote.destination && (
                  <p className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5 truncate">
                    <MapPin className="w-3 h-3 flex-shrink-0" />{quote.destination}
                  </p>
                )}
              </div>

              {/* Status + Menu */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full ${statusCfg.bg} ${statusCfg.color}`}>
                  <StatusIcon className="w-2.5 h-2.5" />{statusCfg.label}
                </span>
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setShowMenu(v => !v)}
                    className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                  <AnimatePresence>
                    {showMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden"
                        onMouseLeave={() => setShowMenu(false)}
                      >
                        <button
                          onClick={() => { onDuplicate(quote.id); setShowMenu(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                        >
                          <Copy className="w-3.5 h-3.5 text-gray-400" />Duplicate
                        </button>
                        <button
                          onClick={() => { onDelete(quote.id); setShowMenu(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />Delete
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Details Row */}
            <div className="flex items-center gap-3 mt-2">
              {/* Client */}
              {quote.client && (
                <span className="flex items-center gap-1 text-[11px] text-gray-500">
                  <Users className="w-3 h-3" />
                  {quote.client.firstName} {quote.client.lastName}
                </span>
              )}
              {/* Dates */}
              {quote.startDate && (
                <span className="flex items-center gap-1 text-[11px] text-gray-500">
                  <Clock className="w-3 h-3" />
                  {formatDate(quote.startDate)}
                  {quote.endDate && quote.endDate !== quote.startDate && ` – ${formatDate(quote.endDate)}`}
                </span>
              )}
              {/* Travelers */}
              {(quote.adults > 0) && (
                <span className="flex items-center gap-1 text-[11px] text-gray-500">
                  <Users className="w-3 h-3" />
                  {quote.adults + (quote.children || 0)} pax
                </span>
              )}
            </div>

            {/* Bottom Row: product icons + price + time */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1">
                {(quote.flights?.length || 0) > 0 && (
                  <span className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center">
                    <Plane className="w-3 h-3 text-blue-600" />
                  </span>
                )}
                {(quote.hotels?.length || 0) > 0 && (
                  <span className="w-5 h-5 rounded bg-purple-100 flex items-center justify-center">
                    <Building2 className="w-3 h-3 text-purple-600" />
                  </span>
                )}
                {(quote.activities?.length || 0) > 0 && (
                  <span className="w-5 h-5 rounded bg-emerald-100 flex items-center justify-center">
                    <Compass className="w-3 h-3 text-emerald-600" />
                  </span>
                )}
                {(quote.carRentals?.length || 0) > 0 && (
                  <span className="w-5 h-5 rounded bg-cyan-100 flex items-center justify-center">
                    <Car className="w-3 h-3 text-cyan-600" />
                  </span>
                )}
                {itemCount === 0 && (
                  <span className="text-[10px] text-gray-400">No items yet</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {quote.totalPrice != null && (
                  <span className="text-sm font-bold text-gray-900">
                    {formatPrice(quote.totalPrice, quote.currency || "USD")}
                  </span>
                )}
                <span className="text-[10px] text-gray-400">{relativeTime(quote.updatedAt)}</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary-500 transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function AllQuotesView() {
  const { saveQuote, state } = useQuoteWorkspace();
  const [quotes, setQuotes] = useState<QuoteListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [saving, setSaving] = useState(false);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (filter !== "all") params.set("status", filter);
      const res = await fetch(`/api/agents/quotes?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setQuotes(data.quotes || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      toast.error("Failed to load quotes");
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  // Save current quote then open new workspace
  const handleNewQuote = async () => {
    if (state.items.length > 0) {
      setSaving(true);
      try {
        const result = await saveQuote();
        if (!result?.success) {
          toast.error("Could not save current quote. Please save manually first.");
          setSaving(false);
          return;
        }
        toast.success("Quote saved! Opening new workspace...");
      } catch {
        toast.error("Save failed");
        setSaving(false);
        return;
      }
      setSaving(false);
    }
    window.location.href = "/agent/quotes/workspace";
  };

  const handleOpenQuote = (id: string) => {
    window.location.href = `/agent/quotes/workspace?id=${id}`;
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/agents/quotes/${id}/duplicate`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success("Quote duplicated!");
      fetchQuotes();
      if (data.quote?.id) handleOpenQuote(data.quote.id);
    } catch {
      toast.error("Failed to duplicate quote");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this quote? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/agents/quotes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Quote deleted");
      setQuotes(prev => prev.filter(q => q.id !== id));
    } catch {
      toast.error("Failed to delete quote");
    }
  };

  const filtered = quotes.filter(q =>
    !search || q.tripName?.toLowerCase().includes(search.toLowerCase()) ||
    q.destination?.toLowerCase().includes(search.toLowerCase()) ||
    q.client?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    q.client?.lastName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-gray-50/50">
      {/* Toolbar */}
      <div className="flex-shrink-0 px-6 pt-4 pb-3 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search quotes..."
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            {["all", "draft", "sent", "accepted"].map(s => (
              <button
                key={s}
                onClick={() => { setFilter(s); setPage(1); }}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all capitalize ${
                  filter === s ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button
            onClick={fetchQuotes}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* New Quote Button */}
          <button
            onClick={handleNewQuote}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60 shadow-sm shadow-primary-500/20"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            New Quote
          </button>
        </div>
      </div>

      {/* Quote List */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2.5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            <p className="text-sm text-gray-400">Loading quotes...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <FileText className="w-7 h-7 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700">
                {search ? "No quotes match your search" : "No quotes yet"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {search ? "Try a different search term" : "Create your first quote to get started"}
              </p>
            </div>
            {!search && (
              <button
                onClick={handleNewQuote}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4" />New Quote
              </button>
            )}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map(q => (
              <QuoteCard
                key={q.id}
                quote={q}
                onOpen={handleOpenQuote}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
