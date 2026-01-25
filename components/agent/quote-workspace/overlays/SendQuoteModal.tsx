"use client";

import { useState, useEffect, useMemo, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, Transition } from "@headlessui/react";
import { 
  X, Send, Mail, FileText, Loader2, Check, Sparkles, MessageCircle, 
  Smartphone, Copy, ExternalLink, ChevronRight, Eye, CheckCircle2 
} from "lucide-react";
import { useQuoteWorkspace, useQuotePricing } from "../QuoteWorkspaceProvider";
import { 
  getAllTemplates, 
  getTemplateById, 
  interpolateTemplate,
  prepareTemplateVariables
} from "@/lib/quotes/messageTemplates";
import { sendQuoteEmail, sendQuoteWhatsApp } from "@/lib/quotes/sendQuoteService";

type DeliveryChannel = "email" | "sms" | "whatsapp" | "link";
type ModalTab = "channels" | "message" | "preview";

export default function SendQuoteModal() {
  const { state, closeSendModal, saveQuote, isSaving } = useQuoteWorkspace();
  const pricing = useQuotePricing();
  const isOpen = state.ui.sendModalOpen;

  // View State
  const [activeTab, setActiveTab] = useState<ModalTab>("channels");
  const [channel, setChannel] = useState<DeliveryChannel>("email");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  
  // Data State
  const [phoneNumber, setPhoneNumber] = useState(state.client?.phone || "");
  const [selectedTemplate, setSelectedTemplate] = useState("formal");
  const [customMessage, setCustomMessage] = useState("");
  const [includePdf, setIncludePdf] = useState(true);
  
  // Interaction State
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [shareableLink, setShareableLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Current Request Tracker
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);

  // Format price helper
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: pricing.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setActiveTab("channels");
      setChannel("email");
      setError(null);
      setSent(false);
      setSending(false);
      setCustomMessage("");
      setSelectedTemplate("formal");
    }
  }, [isOpen]);

  // --- Template Logic ---

  const templateVariables = useMemo(() => {
    if (!state.client || !state.id) return null;
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
      { name: "", businessName: "" }, // Agent info usually from auth context
      state.travelers.total
    );
  }, [state]);

  const interpolatedMessage = useMemo(() => {
    const template = getTemplateById(selectedTemplate);
    if (!template || !templateVariables) return "";
    const message = customMessage || template.body;
    return interpolateTemplate(message, templateVariables);
  }, [selectedTemplate, customMessage, templateVariables]);

  const interpolatedSubject = useMemo(() => {
    const template = getTemplateById(selectedTemplate);
    if (!template || !templateVariables) return "";
    return interpolateTemplate(template.subject || "", templateVariables);
  }, [selectedTemplate, templateVariables]);

  const publicQuoteUrl = templateVariables?.quoteUrl || "";

  // --- Actions ---

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

  const handleSend = async () => {
    if (sending) return;
    if (isSaving) {
      setError("Please wait for autosave to complete");
      return;
    }

    // Validation
    if (!state.client) {
      setError("Please select a client first");
      return;
    }
    
    if ((channel === "sms" || channel === "whatsapp") && !phoneNumber) {
      setError("Phone number is required for this channel");
      return;
    }

    if (!state.id) {
       // Try saving if not saved
       const saveResult = await saveQuote();
       if (!saveResult?.success) {
         setError(saveResult?.error || "Failed to save quote");
         return;
       }
    }

    setSending(true);
    setError(null);
    const requestId = `req-${Date.now()}`;
    setCurrentRequestId(requestId);

    try {
      const quoteId = state.id!; // Should be saved by now

      if (channel === "email") {
        await sendQuoteEmail({
          quoteId,
          to: state.client.email,
          subject: interpolatedSubject,
          message: interpolatedMessage,
        });
        setSent(true);
      } 
      else if (channel === "whatsapp") {
        await sendQuoteWhatsApp({
          phone: phoneNumber,
          message: interpolatedMessage,
        });
        setSent(true);
      }
      else if (channel === "sms") {
        // SMS Endpoint
        const res = await fetch(`/api/agents/quotes/${quoteId}/send-sms`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channel: "sms",
            phoneNumber: phoneNumber.startsWith("+") ? phoneNumber : `+1${phoneNumber.replace(/\D/g, "")}`,
            message: interpolatedMessage,
            includeLink: true,
          }),
        });
        
        if (!res.ok) throw new Error("Failed to send SMS");
        const data = await res.json();
        setShareableLink(data.shareableLink || "");
        setSent(true);
      }
      else if (channel === "link") {
        await copyLink();
        // Just show copied state or success
        setSent(true);
      }

    } catch (err) {
      console.error("Failed to send:", err);
      setError(err instanceof Error ? err.message : "Failed to send quote");
    } finally {
      if (currentRequestId === requestId) {
        setSending(false);
      }
    }
  };

  const handleClose = () => {
    closeSendModal();
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
              <Dialog.Panel className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header with Tabs - if not sent */}
                {!sent && (
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                    <div>
                      <Dialog.Title className="text-xl font-bold text-gray-900">Send Quote</Dialog.Title>
                      <p className="text-sm text-gray-500">{state.tripName || "Untitled Trip"}</p>
                    </div>
                    
                    {/* Centered Tabs */}
                    <div className="hidden md:flex bg-gray-200/50 p-1 rounded-xl">
                      {(["channels", "message", "preview"] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                            activeTab === tab
                              ? "bg-white text-gray-900 shadow-sm"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleClose}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto min-h-[400px]">
                  {sent ? (
                     /* Success State */
                     <motion.div
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="p-12 text-center flex flex-col items-center justify-center h-full"
                   >
                     <motion.div
                       initial={{ scale: 0 }}
                       animate={{ scale: 1 }}
                       transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                       className="w-24 h-24 mb-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200"
                     >
                       <Check className="w-12 h-12 text-white" />
                     </motion.div>
 
                     <h3 className="text-3xl font-bold text-gray-900 mb-3">Quote Sent!</h3>
                     <p className="text-gray-600 mb-8 text-lg max-w-md">
                       {state.client?.firstName} will receive this quote via <span className="font-semibold">{channel}</span>.
                     </p>
 
                     {shareableLink && (
                       <div className="mb-8 w-full max-w-md p-4 bg-gray-50 border border-gray-200 rounded-xl">
                         <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Shareable Link</p>
                         <div className="flex items-center gap-2">
                           <code className="flex-1 text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-600 truncate">
                             {shareableLink}
                           </code>
                           <button
                             onClick={() => {
                               navigator.clipboard.writeText(shareableLink);
                               setCopied(true);
                               setTimeout(() => setCopied(false), 2000);
                             }}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors relative"
                           >
                              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
                           </button>
                         </div>
                       </div>
                     )}
 
                     <div className="flex gap-4 w-full max-w-sm">
                       <button
                         onClick={handleClose}
                         className="flex-1 py-3 text-gray-600 hover:text-gray-900 font-medium hover:bg-gray-50 rounded-xl transition-colors"
                       >
                         Close
                       </button>
                       <button
                         onClick={() => window.location.reload()} // Simplified reset
                         className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                       >
                         Send Another
                       </button>
                     </div>
                   </motion.div>
                  ) : (
                    /* Tabs Content */
                    <div className="p-0 h-full">
                      
                      {/* --- Tab: Channels --- */}
                      {activeTab === "channels" && (
                        <div className="p-8 max-w-3xl mx-auto space-y-8">
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {(["email", "whatsapp", "sms", "link"] as const).map((c) => (
                              <button
                                key={c}
                                onClick={() => setChannel(c)}
                                className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all hover:scale-[1.02] ${
                                  channel === c
                                    ? "border-primary-500 bg-primary-50 text-primary-900 shadow-md ring-1 ring-primary-500/50"
                                    : "border-gray-200 text-gray-600 hover:border-primary-300 hover:bg-gray-50"
                                }`}
                              >
                                <div className={`p-3 rounded-xl ${
                                  channel === c ? "bg-white shadow-sm" : "bg-gray-100"
                                }`}>
                                  {c === "email" && <Mail className={`w-6 h-6 ${channel === c ? "text-primary-600" : "text-gray-500"}`} />}
                                  {c === "whatsapp" && <MessageCircle className={`w-6 h-6 ${channel === c ? "text-green-600" : "text-gray-500"}`} />}
                                  {c === "sms" && <Smartphone className={`w-6 h-6 ${channel === c ? "text-blue-600" : "text-gray-500"}`} />}
                                  {c === "link" && <ExternalLink className={`w-6 h-6 ${channel === c ? "text-purple-600" : "text-gray-500"}`} />}
                                </div>
                                <span className="font-semibold capitalize">{c}</span>
                              </button>
                            ))}
                          </div>

                          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-6">
                             {/* Recipient Details */}
                             <div>
                               <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Recipient</label>
                               <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
                                 <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                                    {state.client?.firstName?.[0]}{state.client?.lastName?.[0]}
                                 </div>
                                 <div>
                                   <div className="font-semibold text-gray-900">{state.client?.firstName} {state.client?.lastName}</div>
                                   <div className="text-sm text-gray-500">
                                     {channel === "email" ? state.client?.email : (phoneNumber || "No phone number")}
                                   </div>
                                 </div>
                               </div>
                             </div>

                             {/* Channel Specific Inputs */}
                             {(channel === "sms" || channel === "whatsapp") && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Verify Phone Number</label>
                                  <input 
                                    type="tel" 
                                    value={phoneNumber} 
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                  />
                                </div>
                             )}

                             {channel === "email" && (
                               <label className="flex items-center gap-3 cursor-pointer p-4 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-gray-200">
                                 <input
                                   type="checkbox"
                                   checked={includePdf}
                                   onChange={(e) => setIncludePdf(e.target.checked)}
                                   className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300"
                                 />
                                 <div className="flex-1">
                                   <div className="font-medium text-gray-900 flex items-center gap-2">
                                     <FileText className="w-4 h-4 text-gray-500" /> Include PDF Attachment
                                   </div>
                                   <div className="text-sm text-gray-500">Attach a professional PDF brochure of this itinerary</div>
                                 </div>
                               </label>
                             )}
                          </div>
                   
                        </div>
                      )}

                      {/* --- Tab: Message --- */}
                      {activeTab === "message" && (
                        <div className="flex h-full">
                           <div className="w-64 border-r border-gray-200 p-4 bg-gray-50 overflow-y-auto">
                              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Templates</h3>
                              <div className="space-y-2">
                                {getAllTemplates().map(t => (
                                  <button
                                    key={t.id}
                                    onClick={() => setSelectedTemplate(t.id)}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors ${
                                      selectedTemplate === t.id
                                      ? "bg-white text-primary-900 shadow-sm ring-1 ring-black/5 font-medium" 
                                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                    }`}
                                  >
                                    {t.name}
                                  </button>
                                ))}
                              </div>
                           </div>
                           <div className="flex-1 p-6 flex flex-col">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900">Message Preview</h3>
                                <button className="text-xs flex items-center gap-1 text-purple-600 font-medium hover:text-purple-700">
                                  <Sparkles className="w-3 h-3" /> AI Rewrite (Available Soon)
                                </button>
                              </div>
                              <textarea
                                value={interpolatedMessage}
                                onChange={(e) => setCustomMessage(e.target.value)}
                                className="flex-1 w-full p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-primary-500 outline-none font-sans text-sm leading-relaxed"
                                placeholder="Type your message..."
                              />
                           </div>
                        </div>
                      )}

                      {/* --- Tab: Preview --- */}
                      {activeTab === "preview" && (
                        <div className="h-full flex flex-col bg-gray-100">
                           <div className="flex-none p-3 bg-white border-b border-gray-200 flex justify-center gap-2">
                              {/* View Toggles */}
                              <div className="bg-gray-100 p-1 rounded-lg flex">
                                <button 
                                  onClick={() => setPreviewMode("desktop")}
                                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${previewMode === "desktop" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
                                >Desktop</button>
                                <button 
                                  onClick={() => setPreviewMode("mobile")}
                                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${previewMode === "mobile" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
                                >Mobile</button>
                              </div>
                              <a 
                                href={publicQuoteUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded-md flex items-center gap-1 transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" /> Open in new tab
                              </a>
                           </div>
                           <div className="flex-1 overflow-auto p-8 flex justify-center items-start">
                              <div className={`bg-white transition-all duration-300 shadow-2xl ${
                                previewMode === "mobile" 
                                  ? "w-[375px] h-[667px] rounded-[3rem] border-8 border-gray-800"
                                  : "w-full h-full max-w-5xl rounded-lg border border-gray-200"
                              } overflow-hidden flex flex-col`}>
                                 <iframe 
                                    src={publicQuoteUrl || "about:blank"} 
                                    className="w-full h-full bg-white"
                                    title="Quote Preview"
                                  />
                              </div>
                           </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>

                {/* Footer Actions - If not sent */}
                {!sent && (
                  <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-between items-center z-10">
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                       {activeTab === "channels" && <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> Ready to send</span>}
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={handleClose}
                        className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      
                      {activeTab !== "channels" ? (
                        <button
                           onClick={() => setActiveTab("channels")}
                           className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
                        >
                           Continue <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={handleSend}
                          disabled={sending}
                          className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-primary-500/25"
                        >
                          {sending ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              Send {channel === "link" ? "Link" : "Quote"}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Error Toast */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-red-50 text-red-600 px-4 py-2 rounded-lg border border-red-200 shadow-lg text-sm font-medium flex items-center gap-2"
                    >
                      <X className="w-4 h-4 cursor-pointer" onClick={() => setError(null)} />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
