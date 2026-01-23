"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Mail, MessageCircle, Copy, CheckCircle2, Loader2, 
  Plane, ChevronRight, Eye, Send as SendIcon
} from "lucide-react";
import { useQuoteWorkspace } from "./QuoteWorkspaceProvider";
import { 
  getAllTemplates, 
  getTemplateById, 
  interpolateTemplate,
  prepareTemplateVariables,
  type MessageTemplate 
} from "@/lib/quotes/messageTemplates";
import { sendQuoteEmail, sendQuoteWhatsApp } from "@/lib/quotes/sendQuoteService";

interface SendQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SendChannel = "email" | "whatsapp" | "link";

export function SendQuoteModal({ isOpen, onClose }: SendQuoteModalProps) {
  const { state, isSaving } = useQuoteWorkspace();
  const [activeTab, setActiveTab] = useState<"preview" | "channels" | "message">("channels");
  const [selectedChannel, setSelectedChannel] = useState<SendChannel>("email");
  const [selectedTemplate, setSelectedTemplate] = useState("formal");
  const [customMessage, setCustomMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop">("desktop");
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);

  // Prepare template variables
  const templateVariables = useMemo(() => {
    if (!state.client || !state.id) return null;

    // Generate view token from quote ID (in production, this comes from saved quote)
    const viewToken = `qt-${state.id}`;

    return prepareTemplateVariables(
      {
        tripName: state.tripName,
        destination: state.destination,
        startDate: state.startDate,
        endDate: state.endDate,
        total: state.pricing.total,
        currency: state.pricing.currency,
        viewToken: viewToken,
      },
      state.client,
      {
        name: "", // Agent name would come from auth context
        businessName: "",
      },
      state.travelers.total
    );
  }, [state]);

  // Interpolated message
  const interpolatedMessage = useMemo(() => {
    const template = getTemplateById(selectedTemplate);
    if (!template || !templateVariables) return "";

    const message = customMessage || template.body;
    return interpolateTemplate(message, templateVariables);
  }, [selectedTemplate, customMessage, templateVariables]);

  // Interpolated subject
  const interpolatedSubject = useMemo(() => {
    const template = getTemplateById(selectedTemplate);
    if (!template || !templateVariables) return "";

    return interpolateTemplate(template.subject || "", templateVariables);
  }, [selectedTemplate, templateVariables]);

  // Generate public quote URL
  const publicQuoteUrl = useMemo(() => {
    if (!templateVariables) return "";
    return templateVariables.quoteUrl;
  }, [templateVariables]);

  // Copy link to clipboard
  const copyLink = async () => {
    if (!publicQuoteUrl) return;

    try {
      await navigator.clipboard.writeText(publicQuoteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Send email
  const handleSendEmail = async () => {
    // Guard: Prevent multiple concurrent requests
    if (sending) return;

    // Guard: Wait for autosave to complete
    if (isSaving) {
      alert("Please wait for the quote to finish saving, then try again.");
      return;
    }

    // Validate: Quote must be saved
    if (!state.id) {
      alert("Please save the quote before sending.\n\nClick 'Save Quote' in the footer, then try again.");
      return;
    }

    // Validate: Client must be selected
    if (!state.client) {
      alert("Please select a client before sending.\n\nClick the 'Select Client' button in the footer.");
      return;
    }

    // Validate: Template data must be available
    if (!templateVariables) {
      // Provide specific guidance based on what's missing
      if (!state.client) {
        alert("Unable to prepare message: No client selected.\n\nPlease select a client before sending.");
      } else if (!state.id) {
        alert("Unable to prepare message: Quote not saved.\n\nPlease save the quote before sending.");
      } else {
        alert("Unable to prepare message. Please try again or contact support.");
      }
      return;
    }

    // Generate unique request ID for this operation
    const requestId = `email-${Date.now()}`;
    setCurrentRequestId(requestId);
    setSending(true);

    try {
      await sendQuoteEmail({
        quoteId: state.id,
        to: state.client.email,
        subject: interpolatedSubject,
        message: interpolatedMessage,
      });
      onClose();
    } catch (error) {
      console.error("Failed to send email:", error);
      alert("Failed to send email. Please try again.");
    } finally {
      // Only reset if this is still the current request (prevents race conditions)
      if (currentRequestId === requestId) {
        setSending(false);
        setCurrentRequestId(null);
      }
    }
  };

  // Send WhatsApp message
  const handleSendWhatsApp = async () => {
    // Guard: Prevent multiple concurrent requests
    if (sending) return;

    // Guard: Wait for autosave to complete
    if (isSaving) {
      alert("Please wait for the quote to finish saving, then try again.");
      return;
    }

    // Validate: Quote must be saved
    if (!state.id) {
      alert("Please save the quote before sending.\n\nClick 'Save Quote' in the footer, then try again.");
      return;
    }

    // Validate: Client must be selected
    if (!state.client) {
      alert("Please select a client before sending.\n\nClick the 'Select Client' button in the footer.");
      return;
    }

    // Validate: Client must have phone number
    if (!state.client.phone) {
      alert("Client phone number not available.\n\nPlease add a phone number to the client's profile.");
      return;
    }

    // Validate: Template data must be available
    if (!templateVariables) {
      // Provide specific guidance based on what's missing
      if (!state.client) {
        alert("Unable to prepare message: No client selected.\n\nPlease select a client before sending.");
      } else if (!state.id) {
        alert("Unable to prepare message: Quote not saved.\n\nPlease save the quote before sending.");
      } else {
        alert("Unable to prepare message. Please try again or contact support.");
      }
      return;
    }

    // Generate unique request ID for this operation
    const requestId = `whatsapp-${Date.now()}`;
    setCurrentRequestId(requestId);
    setSending(true);

    try {
      await sendQuoteWhatsApp({
        phone: state.client.phone,
        message: interpolatedMessage,
      });
      onClose();
    } catch (error) {
      console.error("Failed to send WhatsApp:", error);
      alert("Failed to send WhatsApp. Please try again.");
    } finally {
      // Only reset if this is still the current request (prevents race conditions)
      if (currentRequestId === requestId) {
        setSending(false);
        setCurrentRequestId(null);
      }
    }
  };

  // Reset modal when opened
  useEffect(() => {
    if (isOpen) {
      setActiveTab("channels");
      setSelectedChannel("email");
      setSelectedTemplate("formal");
      setCustomMessage("");
      setSending(false);
      setCurrentRequestId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Send Quote</h2>
            <p className="text-sm text-gray-500">{state.tripName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab("channels")}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "channels"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Send Channels
          </button>
          <button
            onClick={() => setActiveTab("message")}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "message"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Message Template
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "preview"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Client Preview
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {/* Channels Tab */}
          {activeTab === "channels" && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Delivery Channel</h3>
                <p className="text-sm text-gray-500">
                  Select how you want to deliver the quote to your client
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Email Channel */}
                <button
                  onClick={() => setSelectedChannel("email")}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    selectedChannel === "email"
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${
                      selectedChannel === "email" ? "bg-primary-500" : "bg-gray-100"
                    }`}>
                      <Mail className={`w-6 h-6 ${
                        selectedChannel === "email" ? "text-white" : "text-gray-600"
                      }`} />
                    </div>
                    <div className={`font-semibold ${
                      selectedChannel === "email" ? "text-primary-900" : "text-gray-900"
                    }`}>
                      Email
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Send directly to client's inbox with personalized message
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Professional delivery
                  </div>
                </button>

                {/* WhatsApp Channel */}
                <button
                  onClick={() => setSelectedChannel("whatsapp")}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    selectedChannel === "whatsapp"
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${
                      selectedChannel === "whatsapp" ? "bg-green-500" : "bg-gray-100"
                    }`}>
                      <MessageCircle className={`w-6 h-6 ${
                        selectedChannel === "whatsapp" ? "text-white" : "text-gray-600"
                      }`} />
                    </div>
                    <div className={`font-semibold ${
                      selectedChannel === "whatsapp" ? "text-primary-900" : "text-gray-900"
                    }`}>
                      WhatsApp
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Send instant message with quote link
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Instant delivery
                  </div>
                </button>

                {/* Public Link Channel */}
                <button
                  onClick={() => setSelectedChannel("link")}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    selectedChannel === "link"
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${
                      selectedChannel === "link" ? "bg-purple-500" : "bg-gray-100"
                    }`}>
                      <Copy className={`w-6 h-6 ${
                        selectedChannel === "link" ? "text-white" : "text-gray-600"
                      }`} />
                    </div>
                    <div className={`font-semibold ${
                      selectedChannel === "link" ? "text-primary-900" : "text-gray-900"
                    }`}>
                      Copy Link
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Share anywhere - email, SMS, social media, etc.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Universal sharing
                  </div>
                </button>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => setActiveTab("message")}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                  Customize Message
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="flex gap-3">
                  {selectedChannel === "link" && (
                    <button
                      onClick={copyLink}
                      className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5" />
                          Copy Link
                        </>
                      )}
                    </button>
                  )}
                  {selectedChannel === "email" && (
                    <button
                      onClick={handleSendEmail}
                      disabled={sending}
                      className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                      {sending ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <SendIcon className="w-5 h-5" />
                          Send Email
                        </>
                      )}
                    </button>
                  )}
                  {selectedChannel === "whatsapp" && (
                    <button
                      onClick={handleSendWhatsApp}
                      disabled={sending}
                      className="px-6 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                      {sending ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <MessageCircle className="w-5 h-5" />
                          Send WhatsApp
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Message Tab */}
          {activeTab === "message" && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Message Template</h3>
                <p className="text-sm text-gray-500">
                  Choose a template or write your own message
                </p>
              </div>

              {/* Template Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {getAllTemplates().map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      setCustomMessage("");
                    }}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedTemplate === template.id && !customMessage
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-semibold text-gray-900 mb-1">{template.name}</div>
                    <div className="text-sm text-gray-600">{template.description}</div>
                  </button>
                ))}
              </div>

              {/* Message Editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    {customMessage ? "Custom Message" : "Message"}
                  </label>
                  <button
                    onClick={() => setCustomMessage("")}
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    Reset to Template
                  </button>
                </div>
                <textarea
                  value={interpolatedMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Write your message..."
                  className="w-full h-64 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Variables: {'{{clientName}}'}, {'{{destination}}'}, {'{{total}}'}, {'{{perPerson}}'}, {'{{tripName}}'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => setActiveTab("channels")}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Back to Channels
                </button>
                <button
                  onClick={() => setActiveTab("channels")}
                  className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
                >
                  Continue to Send
                </button>
              </div>
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === "preview" && (
            <div className="flex flex-col h-full">
              {/* Preview Controls */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">Client Preview</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewMode("desktop")}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        previewMode === "desktop"
                          ? "bg-white text-primary-600 shadow"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Desktop
                    </button>
                    <button
                      onClick={() => setPreviewMode("mobile")}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        previewMode === "mobile"
                          ? "bg-white text-primary-600 shadow"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Mobile
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={publicQuoteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Open in New Tab
                  </a>
                </div>
              </div>

              {/* Preview Content */}
              <div className="flex-1 bg-gray-100 p-6 flex items-center justify-center overflow-auto">
                <div
                  className={`bg-white rounded-xl shadow-2xl overflow-auto ${
                    previewMode === "mobile" ? "w-[375px] h-[667px]" : "w-full h-full"
                  }`}
                >
                  {/* Note: In production, this would render actual ClientQuotePortal */}
                  <div className="p-8 text-center text-gray-500">
                    <Plane className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Client view preview will render here</p>
                    <p className="text-sm mt-2">
                      URL: <code className="bg-gray-100 px-2 py-1 rounded">{publicQuoteUrl}</code>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
