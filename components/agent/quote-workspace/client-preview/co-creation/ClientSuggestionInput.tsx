"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Lightbulb, HelpCircle, RefreshCw, Heart } from "lucide-react";
import { ClientSuggestion, SUGGESTION_LABELS } from "./types";

interface ClientSuggestionInputProps {
  itemId: string;
  itemName?: string;
  dayIndex: number;
  clientName: string;
  onSubmit: (suggestion: Omit<ClientSuggestion, "id" | "timestamp" | "status">) => void;
  onClose: () => void;
}

type SuggestionType = keyof typeof SUGGESTION_LABELS;

const TYPE_ICONS = {
  alternative: RefreshCw,
  comment: Lightbulb,
  question: HelpCircle,
  preference: Heart,
};

/**
 * CLIENT SUGGESTION INPUT - Structured Feedback
 *
 * UX Philosophy:
 * - Quick type selection (no confusion)
 * - Short-form input (not a chat)
 * - Clear submission confirmation
 * - Non-blocking overlay
 */
export default function ClientSuggestionInput({
  itemId,
  itemName,
  dayIndex,
  clientName,
  onSubmit,
  onClose,
}: ClientSuggestionInputProps) {
  const [type, setType] = useState<SuggestionType>("comment");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    onSubmit({
      itemId,
      dayIndex,
      type,
      content: content.trim(),
      clientId: "current-client", // In real app, from auth
      clientName,
    });

    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const maxLength = 280; // Twitter-style brevity

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-2"
        >
          <Send className="w-5 h-5 text-white" />
        </motion.div>
        <p className="font-semibold text-emerald-800">Sent to your agent</p>
        <p className="text-xs text-emerald-600 mt-1">They'll review and respond soon</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div>
          <p className="text-sm font-semibold text-gray-900">Share your thoughts</p>
          {itemName && (
            <p className="text-xs text-gray-500 mt-0.5">About: {itemName}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Type Selection - Quick Pills */}
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2">
          What kind of feedback?
        </p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(SUGGESTION_LABELS) as SuggestionType[]).map((t) => {
            const Icon = TYPE_ICONS[t];
            const isActive = type === t;

            return (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary-100 text-primary-700 border border-primary-300"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{SUGGESTION_LABELS[t]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, maxLength))}
          placeholder={
            type === "alternative"
              ? "What would you prefer instead?"
              : type === "question"
              ? "What would you like to know?"
              : "Share what's on your mind..."
          }
          className="w-full h-24 px-3 py-2.5 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-gray-400"
          autoFocus
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-gray-400">
            {content.length}/{maxLength}
          </span>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Send to Agent</span>
          </motion.button>
        </div>
      </div>

      {/* Trust Note */}
      <div className="px-4 pb-4">
        <p className="text-[10px] text-gray-400 text-center">
          Your agent will review this and may adjust your itinerary accordingly.
        </p>
      </div>
    </motion.div>
  );
}
