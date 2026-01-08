"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Check, Edit2, Eye, Settings, User, X, Command, Plus, Bell, ChevronDown, Share2, Download, HelpCircle, MoreHorizontal } from "lucide-react";
import { useQuoteWorkspace } from "./QuoteWorkspaceProvider";
import { useViewMode } from "./itinerary/ViewModeContext";
import { SmartPresets, AutosaveIndicator, formatShortcut } from "./velocity";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function QuoteHeader() {
  const { state, setTripName, openSendModal, saveQuote } = useQuoteWorkspace();
  const { viewMode, toggleViewMode } = useViewMode();
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(state.tripName);
  const [showMore, setShowMore] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => { setEditValue(state.tripName); }, [state.tripName]);

  const handleSave = () => { setTripName(editValue || "Untitled Quote"); setIsEditing(false); };
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") { setEditValue(state.tripName); setIsEditing(false); } };

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
      quoteId = saved?.id || state.id;
    }
    if (quoteId) {
      window.open(`/api/agents/quotes/${quoteId}/pdf`, "_blank");
    } else {
      alert("Please save the quote first before exporting to PDF.");
    }
  };

  const toolbarIcons = [
    { icon: Share2, label: "Share quote", action: () => openSendModal?.() },
    { icon: Download, label: "Export PDF", action: handleExport },
    { icon: HelpCircle, label: "Keyboard shortcuts", action: () => window.dispatchEvent(new CustomEvent("open-shortcuts")) },
    { icon: MoreHorizontal, label: "More options", action: () => setShowMore(!showMore) },
  ];

  return (
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

        {/* Toolbar Actions */}
        <div className="hidden lg:flex items-center gap-1 ml-3 pl-3 border-l border-gray-200">
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
        </div>
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

        {/* New Quote Button */}
        <Link
          href="/agent/quotes/workspace"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-all"
          title="Create new quote"
        >
          <Plus className="w-4 h-4" />
          <span>New</span>
        </Link>

        {/* Notifications */}
        <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-150 relative">
          <Bell className="w-5 h-5 stroke-[1.5]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* User Profile */}
        <div className="relative z-50 flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded-lg transition-all duration-150 cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-[0_2px_8px_rgba(99,102,241,0.25)]">
            {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 stroke-[1.5]" />
        </div>
      </div>
    </div>
  );
}
