"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Trash2, Download, Copy, X, Loader2, CheckCircle2,
  Mail, MessageCircle, Archive, RefreshCcw, Tag, AlertTriangle
} from "lucide-react";

interface BulkQuoteActionsProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onActionComplete: () => void;
}

type BulkAction = "send" | "delete" | "export" | "duplicate" | "archive" | "resend";

export default function BulkQuoteActions({
  selectedIds,
  onClearSelection,
  onActionComplete,
}: BulkQuoteActionsProps) {
  const [loading, setLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState<BulkAction | null>(null);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);
  const [showConfirm, setShowConfirm] = useState<BulkAction | null>(null);

  if (selectedIds.length === 0) return null;

  const performAction = async (action: BulkAction) => {
    setShowConfirm(null);
    setLoading(true);
    setCurrentAction(action);
    setResult(null);

    let success = 0;
    let failed = 0;

    try {
      for (const id of selectedIds) {
        try {
          let res: Response;

          switch (action) {
            case "send":
              res = await fetch(`/api/agents/quotes/${id}/send`, { method: "POST" });
              break;
            case "delete":
              res = await fetch(`/api/agents/quotes/${id}`, { method: "DELETE" });
              break;
            case "duplicate":
              res = await fetch(`/api/agents/quotes/${id}/duplicate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
              });
              break;
            case "archive":
              res = await fetch(`/api/agents/quotes/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "ARCHIVED" }),
              });
              break;
            case "resend":
              res = await fetch(`/api/agents/quotes/${id}/send`, { method: "POST" });
              break;
            case "export":
              res = await fetch(`/api/agents/quotes/${id}/pdf`);
              if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `quote-${id}.pdf`;
                a.click();
              }
              break;
            default:
              res = new Response(null, { status: 400 });
          }

          if (res?.ok) {
            success++;
          } else {
            failed++;
          }
        } catch {
          failed++;
        }
      }

      setResult({ success, failed });

      if (success > 0) {
        setTimeout(() => {
          onActionComplete();
          onClearSelection();
          setResult(null);
        }, 2000);
      }
    } finally {
      setLoading(false);
      setCurrentAction(null);
    }
  };

  const confirmAction = (action: BulkAction) => {
    if (action === "delete") {
      setShowConfirm(action);
    } else {
      performAction(action);
    }
  };

  const actions = [
    { id: "send" as BulkAction, label: "Send", icon: <Send className="w-4 h-4" />, color: "bg-blue-600 hover:bg-blue-700" },
    { id: "resend" as BulkAction, label: "Resend", icon: <RefreshCcw className="w-4 h-4" />, color: "bg-purple-600 hover:bg-purple-700" },
    { id: "duplicate" as BulkAction, label: "Duplicate", icon: <Copy className="w-4 h-4" />, color: "bg-gray-600 hover:bg-gray-700" },
    { id: "export" as BulkAction, label: "Export PDF", icon: <Download className="w-4 h-4" />, color: "bg-emerald-600 hover:bg-emerald-700" },
    { id: "archive" as BulkAction, label: "Archive", icon: <Archive className="w-4 h-4" />, color: "bg-orange-600 hover:bg-orange-700" },
    { id: "delete" as BulkAction, label: "Delete", icon: <Trash2 className="w-4 h-4" />, color: "bg-red-600 hover:bg-red-700" },
  ];

  return (
    <>
      {/* Floating action bar */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
      >
        <div className="bg-gray-900 rounded-2xl shadow-2xl shadow-black/25 p-2 flex items-center gap-2">
          {/* Selection count */}
          <div className="px-4 py-2 border-r border-gray-700">
            <span className="text-white font-medium">
              {selectedIds.length} selected
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 px-2">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={() => confirmAction(action.id)}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 ${action.color} text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading && currentAction === action.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  action.icon
                )}
                <span className="hidden sm:inline">{action.label}</span>
              </button>
            ))}
          </div>

          {/* Close button */}
          <button
            onClick={onClearSelection}
            className="p-2 hover:bg-gray-700 rounded-xl transition-colors ml-2"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Result toast */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`absolute -top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${
                result.failed === 0
                  ? "bg-green-500 text-white"
                  : result.success === 0
                  ? "bg-red-500 text-white"
                  : "bg-yellow-500 text-white"
              }`}
            >
              {result.failed === 0 ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {result.success} quotes updated successfully
                </span>
              ) : result.success === 0 ? (
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Failed to update {result.failed} quotes
                </span>
              ) : (
                <span>
                  {result.success} succeeded, {result.failed} failed
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Confirmation modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center"
            >
              <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete {selectedIds.length} Quote{selectedIds.length > 1 ? "s" : ""}?
              </h3>
              <p className="text-gray-600 mb-6">
                This action cannot be undone. These quotes will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(null)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => performAction("delete")}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
