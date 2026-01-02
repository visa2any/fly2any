"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Check, X, Clock, ChevronDown, RefreshCw,
  Lightbulb, HelpCircle, Heart, Send, Bell
} from "lucide-react";
import { ClientSuggestion, SUGGESTION_LABELS, CoCreationStats } from "./types";

interface AgentSuggestionReviewProps {
  suggestions: ClientSuggestion[];
  stats: CoCreationStats;
  onAcknowledge: (id: string, response?: string) => void;
  onApply: (id: string) => void;
  onDecline: (id: string, response: string) => void;
}

const TYPE_ICONS = {
  alternative: RefreshCw,
  comment: Lightbulb,
  question: HelpCircle,
  preference: Heart,
};

const STATUS_CONFIG = {
  pending: { color: "text-amber-600", bg: "bg-amber-50", label: "Pending" },
  acknowledged: { color: "text-blue-600", bg: "bg-blue-50", label: "Acknowledged" },
  applied: { color: "text-emerald-600", bg: "bg-emerald-50", label: "Applied" },
  declined: { color: "text-gray-500", bg: "bg-gray-50", label: "Declined" },
};

/**
 * AGENT SUGGESTION REVIEW - Control Center
 *
 * UX Philosophy:
 * - Quick scan of client sentiment
 * - One-click acknowledge
 * - Optional response (not required)
 * - Clear status tracking
 */
export default function AgentSuggestionReview({
  suggestions,
  stats,
  onAcknowledge,
  onApply,
  onDecline,
}: AgentSuggestionReviewProps) {
  const [expanded, setExpanded] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");

  const pendingSuggestions = suggestions.filter((s) => s.status === "pending");
  const handledSuggestions = suggestions.filter((s) => s.status !== "pending");

  const handleRespond = (id: string, action: "acknowledge" | "apply" | "decline") => {
    if (action === "acknowledge") {
      onAcknowledge(id, responseText || undefined);
    } else if (action === "apply") {
      onApply(id);
    } else {
      onDecline(id, responseText || "Thanks for sharing. We'll keep this in mind.");
    }
    setRespondingTo(null);
    setResponseText("");
  };

  if (suggestions.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-xl text-center">
        <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No client feedback yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Clients can share thoughts when viewing the preview
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header with Stats */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-gray-600" />
            {stats.pending > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {stats.pending}
              </span>
            )}
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900">Client Feedback</p>
            <p className="text-xs text-gray-500">
              {stats.loved} loved • {stats.suggestions} suggestions
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            {/* Pending - Priority */}
            {pendingSuggestions.length > 0 && (
              <div className="border-t border-gray-100">
                <div className="px-4 py-2 bg-amber-50 border-b border-amber-100">
                  <div className="flex items-center gap-2 text-amber-700">
                    <Bell className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">
                      {pendingSuggestions.length} awaiting review
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {pendingSuggestions.map((suggestion) => (
                    <SuggestionCard
                      key={suggestion.id}
                      suggestion={suggestion}
                      isResponding={respondingTo === suggestion.id}
                      responseText={responseText}
                      onStartRespond={() => setRespondingTo(suggestion.id)}
                      onCancelRespond={() => {
                        setRespondingTo(null);
                        setResponseText("");
                      }}
                      onResponseChange={setResponseText}
                      onAcknowledge={() => handleRespond(suggestion.id, "acknowledge")}
                      onApply={() => handleRespond(suggestion.id, "apply")}
                      onDecline={() => handleRespond(suggestion.id, "decline")}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Handled - Collapsed */}
            {handledSuggestions.length > 0 && (
              <div className="border-t border-gray-100 p-3">
                <p className="text-xs font-medium text-gray-400 mb-2">
                  Previously handled ({handledSuggestions.length})
                </p>
                <div className="space-y-2">
                  {handledSuggestions.slice(0, 3).map((s) => {
                    const Icon = TYPE_ICONS[s.type];
                    const status = STATUS_CONFIG[s.status];
                    return (
                      <div
                        key={s.id}
                        className="flex items-center gap-2 text-xs text-gray-500"
                      >
                        <Icon className="w-3 h-3" />
                        <span className="flex-1 truncate">{s.content}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Individual Suggestion Card
function SuggestionCard({
  suggestion,
  isResponding,
  responseText,
  onStartRespond,
  onCancelRespond,
  onResponseChange,
  onAcknowledge,
  onApply,
  onDecline,
}: {
  suggestion: ClientSuggestion;
  isResponding: boolean;
  responseText: string;
  onStartRespond: () => void;
  onCancelRespond: () => void;
  onResponseChange: (text: string) => void;
  onAcknowledge: () => void;
  onApply: () => void;
  onDecline: () => void;
}) {
  const Icon = TYPE_ICONS[suggestion.type];
  const timeAgo = getTimeAgo(suggestion.timestamp);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-primary-600">
            {suggestion.clientName.charAt(0)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">
              {suggestion.clientName}
            </span>
            <span className="text-xs text-gray-400">{timeAgo}</span>
          </div>
          <div className="flex items-center gap-1.5 mb-2">
            <Icon className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-500">{SUGGESTION_LABELS[suggestion.type]}</span>
          </div>
          <p className="text-sm text-gray-700">{suggestion.content}</p>
        </div>
      </div>

      {/* Actions */}
      {!isResponding ? (
        <div className="flex items-center gap-2 mt-3 pl-11">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAcknowledge}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Acknowledge</span>
          </motion.button>
          {suggestion.type === "alternative" && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onApply}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-medium rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Apply Change</span>
            </motion.button>
          )}
          <button
            onClick={onStartRespond}
            className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 text-xs font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Reply</span>
          </button>
        </div>
      ) : (
        <div className="mt-3 pl-11 space-y-2">
          <textarea
            value={responseText}
            onChange={(e) => onResponseChange(e.target.value)}
            placeholder="Add a note for the client (optional)..."
            className="w-full h-16 px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            autoFocus
          />
          <div className="flex items-center gap-2">
            <button
              onClick={onAcknowledge}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-white text-xs font-medium rounded-lg hover:bg-primary-600"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Send & Acknowledge</span>
            </button>
            <button
              onClick={onCancelRespond}
              className="px-3 py-1.5 text-gray-500 text-xs font-medium rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
