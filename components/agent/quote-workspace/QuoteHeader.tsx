"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Check, Edit2, Eye, Settings, User, X, Command, Plane, Building2, Car, Compass, Bus, Shield, Package, Link as LinkIcon } from "lucide-react";
import { useQuoteWorkspace } from "./QuoteWorkspaceProvider";
import { useViewMode } from "./itinerary/ViewModeContext";
import { SmartPresets, AutosaveIndicator, formatShortcut } from "./velocity";
import Link from "next/link";

export default function QuoteHeader() {
  const { state, setTripName } = useQuoteWorkspace();
  const { viewMode, toggleViewMode } = useViewMode();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(state.tripName);
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

  const productIcons = [
    { icon: Plane, label: "Flight", active: false },
    { icon: Building2, label: "Hotel", active: false },
    { icon: Car, label: "Car", active: false },
    { icon: LinkIcon, label: "Link", active: false },
    { icon: Bus, label: "Transfer", active: false },
    { icon: Shield, label: "Insurance", active: false },
    { icon: Package, label: "Custom", active: false },
  ];

  return (
    <div className="h-11 px-3 flex items-center justify-between gap-3">
      {/* Left: Back + Name + Status */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Link href="/agent/quotes" className="p-1.5 -ml-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
          <ArrowLeft className="w-4 h-4" />
        </Link>

        {isEditing ? (
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              className="flex-1 min-w-0 px-2 py-1 text-sm font-semibold border border-primary-400 rounded-md focus:outline-none"
            />
            <button onClick={handleSave} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"><Check className="w-4 h-4" /></button>
            <button onClick={() => { setEditValue(state.tripName); setIsEditing(false); }} className="p-1 text-gray-400 hover:bg-gray-100 rounded"><X className="w-4 h-4" /></button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)} className="group flex items-center gap-1.5 min-w-0 hover:bg-gray-50 rounded-md px-1.5 py-0.5">
            <span className="text-sm font-semibold text-gray-900 truncate">{state.tripName || "Untitled Quote"}</span>
            <Edit2 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 flex-shrink-0" />
          </button>
        )}

        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wide ${statusColors[state.status]}`}>
          {state.status}
        </span>

        {/* Product Icons */}
        <div className="hidden lg:flex items-center gap-1 ml-2 pl-2 border-l border-gray-200">
          {productIcons.map(({ icon: Icon, label }, idx) => (
            <div key={idx} className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors" title={label}>
              <Icon className="w-4 h-4 text-gray-400" />
            </div>
          ))}
        </div>
      </div>

      {/* Center: Client */}
      <div className="hidden md:flex items-center">
        {state.client ? (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-primary-50 rounded-full">
            <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center text-white text-[10px] font-bold">
              {state.client.firstName[0]}{state.client.lastName[0]}
            </div>
            <span className="text-xs font-medium text-primary-700">{state.client.firstName}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-gray-400 text-xs"><User className="w-3.5 h-3.5" /><span>No client</span></div>
        )}
      </div>

      {/* Smart Presets - Desktop Only */}
      <div className="hidden lg:block">
        <SmartPresets variant="compact" />
      </div>

      {/* View Mode Toggle */}
      <div className="hidden sm:flex items-center gap-2">
        <button
          onClick={toggleViewMode}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            viewMode === "client"
              ? "bg-violet-100 text-violet-700 border border-violet-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
          }`}
          title={`Toggle Preview (${formatShortcut({ key: "P", ctrl: true })})`}
        >
          {viewMode === "client" ? (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Client View</span>
            </>
          ) : (
            <>
              <Settings className="w-3.5 h-3.5" />
              <span>Agent View</span>
            </>
          )}
        </button>

        {/* Command Palette Trigger */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title={`Command Palette (${formatShortcut({ key: "K", ctrl: true, shift: true })})`}
        >
          <Command className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Save Status */}
      <AutosaveIndicator
        status={state.ui.isSaving ? "saving" : state.ui.lastSavedAt ? "saved" : "idle"}
        lastSavedAt={state.ui.lastSavedAt}
        variant="minimal"
      />
    </div>
  );
}
