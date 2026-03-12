"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Check, Edit2, Eye, Settings, X, Plus, Bell, ChevronDown, Share2, Download, Printer, HelpCircle, MoreHorizontal, Sparkles, Clock, CalendarDays, LogOut, User, Calendar, Undo2, Redo2, AlertTriangle, Menu } from "lucide-react";
import { useQuoteWorkspace } from "./QuoteWorkspaceProvider";
import { useViewMode } from "./itinerary/ViewModeContext";
import { SmartPresets, AutosaveIndicator, formatShortcut } from "./velocity";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useQuoteAnalysis } from "./hooks/useQuoteAnalysis";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import FollowUpSchedulerModal from "./overlays/FollowUpSchedulerModal";

function QuoteStrengthBadge() {
  const { analysis, isLoading } = useQuoteAnalysis();

  if (!analysis && !isLoading) return null;

  return (
    <AnimatePresence>
      {analysis && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
            analysis.score >= 80 ? "bg-green-50 border-green-200 text-green-700" :
            analysis.score >= 60 ? "bg-yellow-50 border-yellow-200 text-yellow-700" :
            "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${
            analysis.score >= 80 ? "bg-green-500" :
            analysis.score >= 60 ? "bg-yellow-500" : "bg-red-500"
          }`} />
          <span className="text-[10px] font-bold">Strength: {analysis.score}%</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function QuoteHeader() {
  const { state, setTripName, openSendModal, saveQuote, canUndo, canRedo, undo, redo, setExpiryDate, staleItems } = useQuoteWorkspace();
  const { viewMode, toggleViewMode } = useViewMode();
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(state.tripName);
  const [showMore, setShowMore] = useState(false);
  const [isGeneratingNarrative, setIsGeneratingNarrative] = useState(false);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastViewedAt, setLastViewedAt] = useState<string | null>(null);
  const [viewCount, setViewCount] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Fetch last viewed time when quote is sent/viewed/accepted
  useEffect(() => {
    if (!state.id || !['sent', 'viewed', 'accepted', 'declined'].includes(state.status)) return;
    fetch(`/api/agents/quotes/${state.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.quote?.lastViewedAt) setLastViewedAt(data.quote.lastViewedAt);
        if (data?.quote?.viewCount) setViewCount(data.quote.viewCount);
      })
      .catch(() => {});
  }, [state.id, state.status]);

  // Load follow-ups as notifications
  useEffect(() => {
    const raw = localStorage.getItem("agent-followups");
    if (raw) {
      try { setNotifications(JSON.parse(raw)); } catch { setNotifications([]); }
    }
  }, [showNotifications]);

  // Click-outside to close dropdowns
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Expiry now comes from state (server-persisted via autosave)
  const expiryDate = state.expiryDate || "";

  const handleSaveExpiry = (date: string) => {
    setExpiryDate(date || null);
    setShowExpiryPicker(false);
    toast.success("Expiry date set");
  };

  const expiryDaysLeft = expiryDate
    ? Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000)
    : null;

  const handleGenerateNarrative = useCallback(async () => {
    if (isGeneratingNarrative) return;
    if (!state.destination && state.items.length === 0) {
      toast.error("Add a destination or items first.");
      return;
    }
    setIsGeneratingNarrative(true);
    const toastId = toast.loading("✨ Crafting your trip story...");
    try {
      const res = await fetch("/api/agents/quotes/narrative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripName: state.tripName,
          destination: state.destination,
          startDate: state.startDate,
          endDate: state.endDate,
          travelers: state.travelers?.total,
          items: state.items.slice(0, 10),
          tone: "friendly",
          clientName: state.client?.firstName,
        }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      if (data.narrative) {
        await navigator.clipboard.writeText(data.narrative);
        toast.success("Trip narrative copied to clipboard!", { id: toastId, duration: 4000 });
      }
    } catch {
      toast.error("Failed to generate narrative", { id: toastId });
    } finally {
      setIsGeneratingNarrative(false);
    }
  }, [state, isGeneratingNarrative]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => { setEditValue(state.tripName); }, [state.tripName]);

  const handleSave = () => { setTripName(editValue || "Untitled Quote"); setIsEditing(false); };
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") { setEditValue(state.tripName); setIsEditing(false); } };

  const formatTimeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const statusColors: Record<string, string> = {
    draft: "text-gray-500 bg-gray-100",
    sent: "text-blue-600 bg-blue-50",
    accepted: "text-emerald-600 bg-emerald-50",
    expired: "text-amber-600 bg-amber-50",
    declined: "text-red-600 bg-red-50",
  };

  const handleExport = async () => {
    let quoteId = state.id;
    if (!quoteId && saveQuote) {
      const saved = await saveQuote();
      quoteId = saved?.quote?.id || state.id;
    }
    if (quoteId) {
      window.open(`/api/agents/quotes/${quoteId}/pdf`, "_blank");
    } else {
      toast.error("Please save the quote first before exporting to PDF.");
    }
  };

  const handlePrint = () => {
    // If preview overlay is already open, print directly
    // Otherwise we need the preview's print CSS to be in the DOM
    const previewEl = document.getElementById("quote-client-preview");
    if (previewEl) {
      window.print();
    } else {
      // Open preview first, then print after it renders
      import("react-hot-toast").then(({ default: t }) =>
        t("Opening preview for print...", { duration: 1500, icon: "🖨️" })
      );
      // Dispatch event to open preview — QuotePreviewOverlay handles printing CSS
      window.dispatchEvent(new CustomEvent("open-preview-then-print"));
    }
  };

  const toolbarIcons = [
    { icon: Share2, label: "Share quote", action: () => openSendModal?.() },
    { icon: Download, label: "Export PDF", action: handleExport },
    { icon: Printer, label: "Print quote", action: handlePrint },
    { icon: HelpCircle, label: "Keyboard shortcuts", action: () => window.dispatchEvent(new CustomEvent("open-shortcuts")) },
    { icon: MoreHorizontal, label: "More options", action: () => setShowMore(!showMore) },
  ];


  return (
    <>
    <FollowUpSchedulerModal
      isOpen={showFollowUp}
      onClose={() => setShowFollowUp(false)}
      quoteId={state.id}
      clientName={state.client?.firstName}
    />
    <div className="h-14 px-4 flex items-center justify-between gap-4 bg-white border-b border-gray-200 shadow-sm">
      {/* Left: Back + Title + Status + Product Icons */}
      <div className="flex items-center gap-2">
        <Link href="/agent/quotes" className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-150">
          <ArrowLeft className="w-4 h-4 stroke-[1.5]" />
        </Link>

        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              className="px-2 py-1 text-sm font-semibold border border-primary-400 rounded-md focus:outline-none w-48"
            />
            <button onClick={handleSave} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"><Check className="w-4 h-4" /></button>
            <button onClick={() => { setEditValue(state.tripName); setIsEditing(false); }} className="p-1 text-gray-400 hover:bg-gray-100 rounded"><X className="w-4 h-4" /></button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)} className="group flex items-center gap-1.5 hover:bg-gray-50 rounded-md px-2 py-1">
            <span className="text-sm font-semibold text-gray-900">{state.tripName || "Untitled Quote"}</span>
            <Edit2 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100" />
          </button>
        )}

        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase ${statusColors[state.status]}`}>
          {state.status}
        </span>

        {/* Client Last Viewed Badge */}
        {['sent', 'viewed', 'accepted', 'declined'].includes(state.status) && (
          <span
            title={`Viewed ${viewCount} time${viewCount !== 1 ? 's' : ''}`}
            className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${
              lastViewedAt
                ? "bg-violet-50 text-violet-600 border border-violet-200"
                : "bg-gray-50 text-gray-400 border border-gray-200"
            }`}
          >
            <Eye className="w-2.5 h-2.5" />
            {lastViewedAt ? formatTimeAgo(lastViewedAt) : "Not viewed"}
          </span>
        )}

        {/* AI Quote Strength Badge */}
        <QuoteStrengthBadge />

        {/* Price Staleness Warning */}
        {staleItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-semibold"
            title={`${staleItems.length} item${staleItems.length > 1 ? 's have' : ' has'} prices older than 2 hours`}
          >
            <AlertTriangle className="w-2.5 h-2.5" />
            {staleItems.length} stale price{staleItems.length > 1 ? 's' : ''}
          </motion.div>
        )}

        {/* Toolbar Actions */}
        <div className="hidden lg:flex items-center gap-1 ml-3 pl-3 border-l border-gray-200">
          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 mr-1 pr-1 border-r border-gray-200">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4 stroke-[1.5]" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo2 className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>

          {/* AI Narrative Generator */}
          <button
            onClick={handleGenerateNarrative}
            disabled={isGeneratingNarrative}
            title="Generate AI trip narrative (copies to clipboard)"
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
              isGeneratingNarrative
                ? "bg-violet-50 text-violet-400 cursor-wait"
                : "text-violet-600 hover:bg-violet-50 hover:text-violet-700"
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGeneratingNarrative ? "animate-pulse" : ""}`} />
            <span>AI Story</span>
          </button>

          {/* Expiry Date */}
          <div className="relative">
            <button
              onClick={() => setShowExpiryPicker(!showExpiryPicker)}
              title="Set quote expiry date"
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                expiryDate
                  ? expiryDaysLeft !== null && expiryDaysLeft <= 1
                    ? "text-red-600 bg-red-50"
                    : expiryDaysLeft !== null && expiryDaysLeft <= 3
                    ? "text-amber-600 bg-amber-50"
                    : "text-emerald-600 bg-emerald-50"
                  : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              {expiryDate && expiryDaysLeft !== null ? (
                <span>{expiryDaysLeft <= 0 ? "Expired" : `${expiryDaysLeft}d left`}</span>
              ) : (
                <span>Expiry</span>
              )}
            </button>
            <AnimatePresence>
              {showExpiryPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-3 z-50 min-w-[200px]"
                >
                  <p className="text-[10px] font-semibold text-gray-500 mb-2 uppercase tracking-wide flex items-center gap-1">
                    <Clock className="w-3 h-3" />Quote Expiry
                  </p>
                  <input
                    type="date"
                    defaultValue={expiryDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => handleSaveExpiry(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                  <div className="flex gap-1 mt-2">
                    {[1, 3, 7].map((d) => {
                      const dt = new Date();
                      dt.setDate(dt.getDate() + d);
                      const val = dt.toISOString().split("T")[0];
                      return (
                        <button key={d} onClick={() => handleSaveExpiry(val)}
                          className="flex-1 py-1 text-[10px] font-semibold bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 rounded transition-colors">
                          {d}d
                        </button>
                      );
                    })}
                  </div>
                  {expiryDate && (
                    <button onClick={() => { setExpiryDate(null); setShowExpiryPicker(false); }}
                      className="mt-2 w-full text-[10px] text-red-500 hover:text-red-700 text-center">
                      Clear expiry
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {toolbarIcons.map(({ icon: Icon, label, action }, idx) => (
            <button
              key={idx}
              onClick={action}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all duration-150"
              title={label}
            >
              <Icon className="w-4 h-4 stroke-[1.5]" />
            </button>
          ))}

          {/* Follow-Up Scheduler */}
          <button
            onClick={() => setShowFollowUp(true)}
            title="Schedule follow-up reminder"
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-amber-600 hover:bg-amber-50 transition-all duration-150"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Follow-up</span>
          </button>
        </div>
      </div>

      {/* Mobile Actions Menu */}
      <div className="lg:hidden relative">
        <button
          onClick={() => setShowMobileActions(!showMobileActions)}
          className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-150"
          title="Actions"
        >
          <Menu className="w-5 h-5 stroke-[1.5]" />
        </button>
        <AnimatePresence>
          {showMobileActions && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setShowMobileActions(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                className="absolute left-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
              >
                <div className="p-1">
                  <button onClick={() => { undo(); setShowMobileActions(false); }} disabled={!canUndo}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg disabled:opacity-30">
                    <Undo2 className="w-4 h-4 text-gray-400" /> Undo
                  </button>
                  <button onClick={() => { redo(); setShowMobileActions(false); }} disabled={!canRedo}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg disabled:opacity-30">
                    <Redo2 className="w-4 h-4 text-gray-400" /> Redo
                  </button>
                  <hr className="my-1 border-gray-100" />
                  <button onClick={() => { handleGenerateNarrative(); setShowMobileActions(false); }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-violet-700 hover:bg-violet-50 rounded-lg">
                    <Sparkles className="w-4 h-4" /> AI Story
                  </button>
                  <button onClick={() => { openSendModal?.(); setShowMobileActions(false); }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                    <Share2 className="w-4 h-4 text-gray-400" /> Share Quote
                  </button>
                  <button onClick={() => { handleExport(); setShowMobileActions(false); }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                    <Download className="w-4 h-4 text-gray-400" /> Export PDF
                  </button>
                  <button onClick={() => { handlePrint(); setShowMobileActions(false); }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                    <Printer className="w-4 h-4 text-gray-400" /> Print
                  </button>
                  <hr className="my-1 border-gray-100" />
                  <button onClick={() => { setShowExpiryPicker(true); setShowMobileActions(false); }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                    <CalendarDays className="w-4 h-4 text-gray-400" /> Set Expiry
                  </button>
                  <button onClick={() => { setShowFollowUp(true); setShowMobileActions(false); }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-amber-700 hover:bg-amber-50 rounded-lg">
                    <Bell className="w-4 h-4" /> Follow-up
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Center: Client (if assigned) */}
      <div className="hidden md:flex items-center">
        {state.client && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-primary-50 rounded-full">
            <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center text-white text-[10px] font-bold">
              {state.client.firstName[0]}{state.client.lastName[0]}
            </div>
            <span className="text-xs font-medium text-primary-700">{state.client.firstName}</span>
          </div>
        )}
      </div>

      {/* Right: Actions + View Toggle + Autosave + Create Quote + Notifications + User */}
      <div className="flex items-center gap-2">
        {/* View Mode Toggle */}
        <button
          onClick={toggleViewMode}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            viewMode === "client"
              ? "bg-violet-100 text-violet-700 border border-violet-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
          }`}
          title={`Toggle View (${formatShortcut({ key: "P", ctrl: true })})`}
        >
          {viewMode === "client" ? <><Eye className="w-3.5 h-3.5" /><span>Client View</span></> : <><Settings className="w-3.5 h-3.5" /><span>Agent View</span></>}
        </button>

        {/* Autosave */}
        <AutosaveIndicator
          status={state.ui.isSaving ? "saving" : state.ui.lastSavedAt ? "saved" : "idle"}
          lastSavedAt={state.ui.lastSavedAt}
          variant="minimal"
        />

        {/* New Quote Button — auto-saves current quote first */}
        <button
          onClick={async () => {
            if (state.items.length > 0) {
              const result = await saveQuote?.();
              if (!result?.success && !result?.quote) {
                // Show a toast but still allow navigation
                import("react-hot-toast").then(({ default: t }) =>
                  t.error("Could not auto-save. Check autosave status.")
                );
              }
            }
            window.location.href = "/agent/quotes/workspace";
          }}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-all"
          title="Save current quote and create a new one"
        >
          <Plus className="w-4 h-4" />
          <span>New</span>
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications((v) => !v)}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-150 relative"
          >
            <Bell className="w-5 h-5 stroke-[1.5]" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            )}
          </button>
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-[60] overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">Notifications</span>
                  {notifications.length > 0 && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">{notifications.length}</span>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-gray-400">No notifications</div>
                ) : (
                  <>
                    <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                      {notifications.map((n, i) => (
                        <div key={i} className="px-4 py-3 hover:bg-gray-50 transition-colors group">
                          <div className="flex items-start gap-3">
                            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-3.5 h-3.5 text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-900 truncate">Follow-up: {n.clientName || "Client"}</p>
                              <p className="text-[10px] text-gray-500">{n.followUpDate} · via {n.channel}</p>
                              {n.note && <p className="text-[10px] text-gray-400 truncate mt-0.5">{n.note}</p>}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const updated = notifications.filter((_, idx) => idx !== i);
                                setNotifications(updated);
                                localStorage.setItem("agent-followups", JSON.stringify(updated));
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 rounded transition-all flex-shrink-0"
                              title="Dismiss"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setNotifications([]);
                          localStorage.setItem("agent-followups", "[]");
                        }}
                        className="text-[10px] text-gray-400 hover:text-red-500 transition-colors"
                      >
                        Clear all
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setShowProfile((v) => !v)}
            className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded-lg transition-all duration-150"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-[0_2px_8px_rgba(99,102,241,0.25)]">
              {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 stroke-[1.5] transition-transform ${showProfile ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-[60] overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 truncate">{session?.user?.name || "Agent"}</p>
                  <p className="text-[10px] text-gray-400 truncate">{session?.user?.email}</p>
                </div>
                <div className="py-1">
                  <a href="/agent" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <User className="w-4 h-4 text-gray-400" />My Profile
                  </a>
                  <button
                    onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
    </>
  );
}
