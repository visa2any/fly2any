"use client";

import { motion } from "framer-motion";
import { Eye, Send, User, Package, DollarSign } from "lucide-react";
import { useQuoteWorkspace } from "./QuoteWorkspaceProvider";

export default function QuoteFooter() {
  const { state, openPreview, openClientModal, openSendModal } = useQuoteWorkspace();
  const { items, pricing, client } = state;

  const itemCount = items.length;
  const canPreview = itemCount > 0;
  const canSend = itemCount > 0 && client !== null;

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

        {/* Preview Button */}
        <motion.button
          whileHover={{ scale: canPreview ? 1.02 : 1 }}
          whileTap={{ scale: canPreview ? 0.98 : 1 }}
          onClick={openPreview}
          disabled={!canPreview}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
            canPreview
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
              : "bg-gray-50 text-gray-300 cursor-not-allowed"
          }`}
        >
          <Eye className="w-4 h-4" />
          <span className="hidden sm:inline">Preview</span>
        </motion.button>

        {/* Send Quote Button */}
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
          <span>Send Quote</span>
        </motion.button>
      </div>
    </div>
  );
}
