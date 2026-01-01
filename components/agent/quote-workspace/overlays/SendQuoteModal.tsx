"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { X, Send, Mail, FileText, Loader2, Check, Sparkles, MessageCircle, Smartphone, Copy, ExternalLink } from "lucide-react";
import { useQuoteWorkspace, useQuotePricing } from "../QuoteWorkspaceProvider";

type DeliveryChannel = "email" | "sms" | "whatsapp";

export default function SendQuoteModal() {
  const { state, closeSendModal, saveQuote } = useQuoteWorkspace();
  const pricing = useQuotePricing();
  const isOpen = state.ui.sendModalOpen;

  const [channel, setChannel] = useState<DeliveryChannel>("email");
  const [phoneNumber, setPhoneNumber] = useState(state.client?.phone || "");
  const [message, setMessage] = useState("");
  const [includePdf, setIncludePdf] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [shareableLink, setShareableLink] = useState("");

  // Format price
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: pricing.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSend = async () => {
    if (!state.client) return;
    if ((channel === "sms" || channel === "whatsapp") && !phoneNumber) return;

    setSending(true);

    try {
      // Save quote first
      const savedQuote = await saveQuote();
      const quoteId = state.id || savedQuote?.id;

      if (channel === "email") {
        // Send email
        const res = await fetch(`/api/agents/quotes/${quoteId}/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            includePdf,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setShareableLink(data.shareableUrl || "");
          setSent(true);
        }
      } else {
        // Send SMS or WhatsApp
        const res = await fetch(`/api/agents/quotes/${quoteId}/send-sms`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channel,
            phoneNumber: phoneNumber.startsWith("+") ? phoneNumber : `+1${phoneNumber.replace(/\D/g, "")}`,
            message: message || undefined,
            includeLink: true,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setShareableLink(data.shareableLink || "");
          setSent(true);
        }
      }
    } catch (error) {
      console.error("Failed to send quote:", error);
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    closeSendModal();
    // Reset state after a delay
    setTimeout(() => {
      setSent(false);
      setMessage("");
    }, 300);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                {sent ? (
                  /* Success State */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                      className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center"
                    >
                      <Check className="w-10 h-10 text-white" />
                    </motion.div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Quote Sent!</h3>
                    <p className="text-gray-600 mb-4">
                      {state.client?.firstName} will receive this quote via
                      <br />
                      <span className="font-medium text-gray-900">
                        {channel === "email"
                          ? state.client?.email
                          : channel === "whatsapp"
                          ? `WhatsApp (${phoneNumber})`
                          : `SMS (${phoneNumber})`
                        }
                      </span>
                    </p>

                    {/* Shareable Link */}
                    {shareableLink && (
                      <div className="mb-6 p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 mb-2">Shareable Link</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={shareableLink}
                            readOnly
                            className="flex-1 text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-600"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(shareableLink);
                            }}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Copy link"
                          >
                            <Copy className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={handleClose}
                        className="flex-1 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => window.location.href = "/agent/quotes"}
                        className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                      >
                        View All Quotes
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  /* Send Form */
                  <>
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                      <Dialog.Title className="text-lg font-semibold text-gray-900">
                        Send Quote
                      </Dialog.Title>
                      <button
                        onClick={handleClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-5">
                      {/* Delivery Channel Selector */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Delivery Method
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setChannel("email")}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                              channel === "email"
                                ? "border-primary-500 bg-primary-50 text-primary-700"
                                : "border-gray-200 text-gray-600 hover:border-gray-300"
                            }`}
                          >
                            <Mail className="w-5 h-5" />
                            <span className="text-xs font-medium">Email</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setChannel("sms")}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                              channel === "sms"
                                ? "border-primary-500 bg-primary-50 text-primary-700"
                                : "border-gray-200 text-gray-600 hover:border-gray-300"
                            }`}
                          >
                            <Smartphone className="w-5 h-5" />
                            <span className="text-xs font-medium">SMS</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setChannel("whatsapp")}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                              channel === "whatsapp"
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                : "border-gray-200 text-gray-600 hover:border-gray-300"
                            }`}
                          >
                            <MessageCircle className="w-5 h-5" />
                            <span className="text-xs font-medium">WhatsApp</span>
                          </button>
                        </div>
                      </div>

                      {/* Recipient */}
                      {state.client && (
                        <div className="flex items-center gap-3 p-3 bg-primary-50 border border-primary-200 rounded-xl">
                          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                            {state.client.firstName[0]}{state.client.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {state.client.firstName} {state.client.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                            {channel === "email" ? state.client.email : (state.client.phone || "No phone on file")}
                          </p>
                          </div>
                        </div>
                      )}

                      {/* Phone Number Input (for SMS/WhatsApp) */}
                      {(channel === "sms" || channel === "whatsapp") && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <div className="relative">
                            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="tel"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              placeholder="+1 (555) 123-4567"
                              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                          </div>
                          <p className="mt-1.5 text-xs text-gray-500">
                            {channel === "whatsapp"
                              ? "Client must have WhatsApp installed"
                              : "Standard SMS rates may apply"
                            }
                          </p>
                        </div>
                      )}

                      {/* Quote Summary */}
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium text-gray-900">{state.tripName}</span>
                          {" • "}
                          {state.items.length} items
                          {" • "}
                          <span className="font-bold text-primary-600">{formatPrice(pricing.total)}</span>
                        </p>
                      </div>

                      {/* Personal Message */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Personal Message (Optional)
                        </label>
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Hi! I've put together this amazing itinerary for you..."
                          rows={4}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                        />
                      </div>

                      {/* Options - PDF only for email */}
                      {channel === "email" && (
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includePdf}
                            onChange={(e) => setIncludePdf(e.target.checked)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">Include PDF attachment</span>
                          </div>
                        </label>
                      )}

                      {/* Shareable Link Preview */}
                      {(channel === "sms" || channel === "whatsapp") && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                          <div className="flex items-start gap-2">
                            <ExternalLink className="w-4 h-4 text-blue-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-blue-800">Includes shareable link</p>
                              <p className="text-xs text-blue-600 mt-0.5">
                                Client will receive a link to view the full quote online
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-4 border-t border-gray-200 flex gap-3">
                      <button
                        onClick={handleClose}
                        className="flex-1 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSend}
                        disabled={sending || !state.client}
                        className="flex-1 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25"
                      >
                        {sending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Quote
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
