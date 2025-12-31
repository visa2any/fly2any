"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Cloud, Edit2, Loader2, RotateCcw, RotateCw, User, X } from "lucide-react";
import { useQuoteWorkspace } from "./QuoteWorkspaceProvider";
import Link from "next/link";

export default function QuoteHeader() {
  const { state, setTripName } = useQuoteWorkspace();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(state.tripName);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Update edit value when trip name changes externally
  useEffect(() => {
    setEditValue(state.tripName);
  }, [state.tripName]);

  const handleSave = () => {
    setTripName(editValue || "Untitled Quote");
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(state.tripName);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  // Status badge colors
  const statusConfig = {
    draft: { bg: "bg-gray-100", text: "text-gray-600", label: "Draft" },
    sent: { bg: "bg-blue-100", text: "text-blue-700", label: "Sent" },
    accepted: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Accepted" },
    expired: { bg: "bg-amber-100", text: "text-amber-700", label: "Expired" },
    declined: { bg: "bg-red-100", text: "text-red-700", label: "Declined" },
  };

  const currentStatus = statusConfig[state.status];

  return (
    <div className="px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
      {/* Left: Back + Trip Name */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Link
          href="/agent/quotes"
          className="p-2 -ml-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Back to Quotes"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        {/* Editable Trip Name */}
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="editing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex items-center gap-2 flex-1 min-w-0"
            >
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                placeholder="Enter trip name..."
                className="flex-1 min-w-0 px-3 py-1.5 text-lg font-semibold text-gray-900 border-2 border-primary-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
              <button
                onClick={handleSave}
                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="display"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              onClick={() => setIsEditing(true)}
              className="group flex items-center gap-2 min-w-0 hover:bg-gray-50 rounded-lg px-2 py-1 -mx-2 transition-colors"
            >
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {state.tripName || "Untitled Quote"}
              </h1>
              <Edit2 className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Status Badge */}
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${currentStatus.bg} ${currentStatus.text} flex-shrink-0`}>
          {currentStatus.label}
        </span>
      </div>

      {/* Center: Client Badge (if selected) */}
      <div className="hidden md:flex items-center">
        {state.client ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 border border-primary-200 rounded-full"
          >
            <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-semibold">
              {state.client.firstName[0]}{state.client.lastName[0]}
            </div>
            <span className="text-sm font-medium text-primary-700">
              {state.client.firstName} {state.client.lastName}
            </span>
          </motion.div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 text-gray-400 text-sm">
            <User className="w-4 h-4" />
            <span>No client selected</span>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Save Status */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 mr-2">
          {state.ui.isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : state.ui.lastSavedAt ? (
            <>
              <Cloud className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-600">Saved</span>
            </>
          ) : null}
        </div>

        {/* Undo/Redo (placeholder for Phase 6) */}
        <button
          disabled
          className="p-2 text-gray-300 rounded-lg cursor-not-allowed"
          title="Undo (coming soon)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          disabled
          className="p-2 text-gray-300 rounded-lg cursor-not-allowed"
          title="Redo (coming soon)"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
