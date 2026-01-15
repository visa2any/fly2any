"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Package, DollarSign, MoreHorizontal, Copy, FileText, Save, Download, Shield } from "lucide-react";
import { useQuoteWorkspace } from "./QuoteWorkspaceProvider";
import { ctaOptimization } from "./client-preview/USConversionCopy";

export default function QuoteFooter() {
  const { state, openPreview, openClientModal, openSendModal, saveQuote, openTemplatesPanel } = useQuoteWorkspace();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { items, pricing, client } = state;

  const itemCount = items.length;
  const canPreview = itemCount > 0;
  const canSend = itemCount > 0 && client !== null;

  // Duplicate quote
  const handleDuplicate = async () => {
    if (!state.id) return;
    setDuplicating(true);
    try {
      const res = await fetch(`/api/agents/quotes/${state.id}/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keepClient: true }),
      });
      if (res.ok) {
        const data = await res.json();
        window.location.href = `/agent/quotes/workspace?id=${data.id}`;
      }
    } catch (error) {
      console.error("Failed to duplicate:", error);
    } finally {
      setDuplicating(false);
      setShowMoreMenu(false);
    }
  };

  // Export PDF
  const handleExportPdf = async () => {
    setErrorMessage(null);

    // Ensure quote is saved first
    if (!state.id) {
      const result = await saveQuote?.();
      if (!result?.success) {
        setErrorMessage(result?.error || 'Failed to save quote before exporting PDF');
        setTimeout(() => setErrorMessage(null), 5000);
        return;
      }
    }

    const quoteId = state.id;
    if (!quoteId) {
      setErrorMessage('Quote must be saved before exporting PDF');
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    try {
      window.open(`/api/agents/quotes/${quoteId}/pdf`, "_blank");
      setShowMoreMenu(false);
    } catch (error) {
      setErrorMessage('Failed to open PDF');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  // Format currency
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: pricing.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      {/* Error Notification Toast */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4"
          >
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 shadow-lg flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">{errorMessage}</p>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
      {/* Left: Quick Stats */}
      <div className="hidden sm:flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2 text-gray-500">
          <Package className="w-4 h-4" />
          <span>
            <span className="font-semibold text-gray-900">{itemCount}</span> items
          </span>
        </div>
        {pricing.total > 0 && (
          <div className="flex items-center gap-2 text-gray-500">
            <DollarSign className="w-4 h-4" />
            <span>
              Total: <span className="font-semibold text-gray-900">{formatPrice(pricing.total)}</span>
            </span>
          </div>
        )}
      </div>

      {/* Mobile: Compact Stats */}
      <div className="flex sm:hidden items-center gap-3">
        <span className="text-xs text-gray-500">
          {itemCount} items • {formatPrice(pricing.total)}
        </span>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Client Selection */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openClientModal}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
            client
              ? "bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-100"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {client ? (
            <>
              <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center text-white text-[10px] font-semibold">
                {client.firstName[0]}{client.lastName[0]}
              </div>
              <span className="hidden sm:inline">{client.firstName}</span>
              <span className="sm:hidden">Client</span>
            </>
          ) : (
            <>
              <User className="w-4 h-4" />
              <span>Select Client</span>
            </>
          )}
        </motion.button>

        {/* More Actions Menu */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
          >
            <MoreHorizontal className="w-4 h-4" />
          </motion.button>

          <AnimatePresence>
            {showMoreMenu && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMoreMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
                >
                  <div className="p-1">
                    <button
                      onClick={() => {
                        openTemplatesPanel?.();
                        setShowMoreMenu(false);
                      }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <FileText className="w-4 h-4 text-gray-400" />
                      Templates
                    </button>
                    <button
                      onClick={async () => {
                        setErrorMessage(null);
                        const result = await saveQuote?.();
                        if (result?.success) {
                          setShowMoreMenu(false);
                        } else {
                          setErrorMessage(result?.error || 'Failed to save quote');
                          setTimeout(() => setErrorMessage(null), 5000);
                        }
                      }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Save className="w-4 h-4 text-gray-400" />
                      Save Quote
                    </button>
                    <button
                      onClick={handleDuplicate}
                      disabled={!state.id || duplicating}
                      className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Copy className="w-4 h-4 text-gray-400" />
                      {duplicating ? "Duplicating..." : "Duplicate"}
                    </button>
                    <button
                      onClick={handleExportPdf}
                      disabled={itemCount === 0}
                      className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Download className="w-4 h-4 text-gray-400" />
                      Export PDF
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Send Quote Button - Optimized CTA */}
        <motion.button
          whileHover={{ scale: canSend ? 1.02 : 1 }}
          whileTap={{ scale: canSend ? 0.98 : 1 }}
          onClick={openSendModal}
          disabled={!canSend}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${
            canSend
              ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/25 hover:from-primary-700 hover:to-primary-800"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <Send className="w-4 h-4" />
          <span>{ctaOptimization.primary.confirm}</span>
        </motion.button>
      </div>

      {/* Security Reassurance - Subtle */}
      <div className="hidden lg:flex items-center justify-center gap-1 text-[10px] text-gray-400 mt-1">
        <Shield className="w-3 h-3" />
        <span>{ctaOptimization.support.secureCheckout}</span>
      </div>
      </div>
    </>
  );
}
