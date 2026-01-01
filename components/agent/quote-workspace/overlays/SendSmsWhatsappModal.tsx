"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, MessageCircle, Phone, Send, Loader2, CheckCircle2,
  AlertCircle, Smartphone, Copy, ExternalLink
} from "lucide-react";

interface SendSmsWhatsappModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteId: string;
  clientPhone?: string;
  clientName: string;
  quoteSummary: {
    tripName: string;
    destination: string;
    total: number;
    currency: string;
  };
}

type Channel = "sms" | "whatsapp";

export default function SendSmsWhatsappModal({
  isOpen,
  onClose,
  quoteId,
  clientPhone = "",
  clientName,
  quoteSummary,
}: SendSmsWhatsappModalProps) {
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [phone, setPhone] = useState(clientPhone);
  const [customMessage, setCustomMessage] = useState("");
  const [useCustomMessage, setUseCustomMessage] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [shareableLink, setShareableLink] = useState("");

  const defaultMessage = channel === "whatsapp"
    ? `Hi ${clientName.split(" ")[0]}! Your travel quote for *${quoteSummary.tripName}* is ready.\n\nTotal: *$${quoteSummary.total.toLocaleString()}*\nDestination: ${quoteSummary.destination}\n\nView your quote here:`
    : `Hi ${clientName.split(" ")[0]}! Your quote for ${quoteSummary.tripName} ($${quoteSummary.total.toLocaleString()}) is ready. View here:`;

  const handleSend = async () => {
    if (!phone || phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    setSending(true);
    setError("");

    try {
      const res = await fetch(`/api/agents/quotes/${quoteId}/send-sms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          phoneNumber: phone.startsWith("+") ? phone : `+1${phone.replace(/\D/g, "")}`,
          message: useCustomMessage ? customMessage : undefined,
          includeLink: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send");
      }

      setShareableLink(data.shareableLink);
      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareableLink);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${channel === "whatsapp" ? "bg-green-100" : "bg-blue-100"}`}>
                {channel === "whatsapp" ? (
                  <MessageCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Smartphone className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Send via {channel === "whatsapp" ? "WhatsApp" : "SMS"}
                </h2>
                <p className="text-xs text-gray-500">Instant delivery to client's phone</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {sent ? (
            /* Success State */
            <div className="p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center"
              >
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quote Sent!</h3>
              <p className="text-sm text-gray-600 mb-6">
                Your quote has been delivered via {channel === "whatsapp" ? "WhatsApp" : "SMS"}
              </p>

              {shareableLink && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <p className="text-xs text-gray-500 mb-2">Shareable Link</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={shareableLink}
                      readOnly
                      className="flex-1 text-sm bg-white border border-gray-200 rounded-lg px-3 py-2"
                    />
                    <button
                      onClick={copyLink}
                      className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Copy className="w-4 h-4 text-gray-600" />
                    </button>
                    <a
                      href={shareableLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-600" />
                    </a>
                  </div>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            /* Form */
            <div className="p-6 space-y-5">
              {/* Channel Selector */}
              <div className="flex gap-3">
                <button
                  onClick={() => setChannel("whatsapp")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${
                    channel === "whatsapp"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">WhatsApp</span>
                </button>
                <button
                  onClick={() => setChannel("sms")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${
                    channel === "sms"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                  <span className="font-medium">SMS</span>
                </button>
              </div>

              {/* Phone Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-fly2any-red/20 focus:border-fly2any-red transition-all"
                  />
                </div>
              </div>

              {/* Message Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Message</label>
                  <button
                    onClick={() => setUseCustomMessage(!useCustomMessage)}
                    className="text-xs text-fly2any-red hover:underline"
                  >
                    {useCustomMessage ? "Use default" : "Customize"}
                  </button>
                </div>
                {useCustomMessage ? (
                  <textarea
                    value={customMessage || defaultMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-fly2any-red/20 focus:border-fly2any-red transition-all text-sm resize-none"
                  />
                ) : (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 whitespace-pre-line">
                    {defaultMessage}
                    <span className="text-fly2any-red">{"\n[Quote Link]"}</span>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Send Button */}
              <button
                onClick={handleSend}
                disabled={sending || !phone}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium text-white transition-all ${
                  channel === "whatsapp"
                    ? "bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/25"
                    : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send via {channel === "whatsapp" ? "WhatsApp" : "SMS"}
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
