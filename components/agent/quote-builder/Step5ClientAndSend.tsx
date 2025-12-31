"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Save, Users, UserPlus, Search, Mail, Phone, User, Zap, MapPin, DollarSign, Package, Check, Loader2, ArrowLeft, ChevronRight } from "lucide-react";
import { QuoteData } from "../QuoteBuilder";

interface Step5ClientAndSendProps {
  quoteData: QuoteData;
  updateQuoteData: (data: Partial<QuoteData>) => void;
  clients: Array<{ id: string; firstName: string; lastName: string; email: string; phone?: string | null }>;
  onSave: (sendNow: boolean) => Promise<void>;
  onPrev: () => void;
  onQuickCreate?: (clientData: { firstName: string; lastName: string; email: string; phone?: string }) => Promise<string>;
  loading: boolean;
}

export default function QuoteBuilderStep5ClientAndSend({ quoteData, updateQuoteData, clients, onSave, onPrev, onQuickCreate, loading }: Step5ClientAndSendProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [quickCreateLoading, setQuickCreateLoading] = useState(false);
  const [quickCreateData, setQuickCreateData] = useState({ firstName: "", lastName: "", email: "", phone: "" });

  const filteredClients = clients.filter((c) => {
    const q = searchQuery.toLowerCase();
    return c.firstName.toLowerCase().includes(q) || c.lastName.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  const selectedClient = clients.find((c) => c.id === quoteData.clientId);
  const totalProducts = quoteData.flights.length + quoteData.hotels.length + quoteData.activities.length + quoteData.transfers.length + quoteData.carRentals.length + quoteData.insurance.length + quoteData.customItems.length;

  const handleQuickCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onQuickCreate) return;
    setQuickCreateLoading(true);
    try {
      const newClientId = await onQuickCreate(quickCreateData);
      updateQuoteData({ clientId: newClientId });
      setShowQuickCreate(false);
      setQuickCreateData({ firstName: "", lastName: "", email: "", phone: "" });
    } catch (error) {
      console.error("Quick create error:", error);
    } finally {
      setQuickCreateLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Send className="w-7 h-7 text-primary-500" />
          Almost Done! Select Client
        </h2>
        <p className="text-gray-600">Choose an existing client or create a new one, then send your quote</p>
      </div>

      {/* Quote Summary */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Check className="w-5 h-5 text-emerald-600" />
          <h3 className="font-semibold text-gray-900">Quote Summary</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quoteData.destination && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Destination</p>
                <p className="font-semibold text-gray-900 text-sm">{quoteData.destination}</p>
              </div>
            </div>
          )}
          {quoteData.travelers > 0 && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Travelers</p>
                <p className="font-semibold text-gray-900 text-sm">{quoteData.travelers}</p>
              </div>
            </div>
          )}
          {quoteData.total > 0 && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="font-semibold text-emerald-600 text-sm">${quoteData.total.toFixed(2)}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Products</p>
              <p className="font-semibold text-gray-900 text-sm">{totalProducts}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Client Selection */}
      <AnimatePresence mode="wait">
        {selectedClient ? (
          <motion.div key="selected" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-300 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {selectedClient.firstName[0]}{selectedClient.lastName[0]}
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Sending Quote To</p>
                  <p className="text-xl font-bold text-gray-900">{selectedClient.firstName} {selectedClient.lastName}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-600 flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{selectedClient.email}</span>
                    {selectedClient.phone && <span className="text-sm text-gray-500 flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{selectedClient.phone}</span>}
                  </div>
                </div>
              </div>
              <button onClick={() => updateQuoteData({ clientId: "" })} className="text-sm text-primary-600 hover:text-primary-700 font-medium px-4 py-2 rounded-lg hover:bg-white transition-all flex items-center gap-1">
                <Users className="w-4 h-4" />
                Change
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="selector" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button onClick={() => setShowQuickCreate(false)} className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${!showQuickCreate ? "bg-primary-50 text-primary-700 border-b-2 border-primary-600" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}>
                <Users className="w-5 h-5" />
                Select Existing ({clients.length})
              </button>
              <button onClick={() => setShowQuickCreate(true)} className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${showQuickCreate ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}>
                <Zap className="w-5 h-5" />
                Quick Create
              </button>
            </div>

            <div className="p-6">
              {!showQuickCreate ? (
                <>
                  {/* Search */}
                  <div className="mb-5">
                    <div className="relative">
                      <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name or email..." className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                    </div>
                  </div>

                  {/* Client List */}
                  {filteredClients.length === 0 ? (
                    <div className="text-center py-10">
                      <Users className="w-14 h-14 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-4">{searchQuery ? `No clients found for "${searchQuery}"` : "No clients yet"}</p>
                      <button onClick={() => setShowQuickCreate(true)} className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 font-medium transition-all">
                        <UserPlus className="w-5 h-5" />
                        Create First Client
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                      {filteredClients.map((client) => (
                        <button key={client.id} onClick={() => updateQuoteData({ clientId: client.id })} className="text-left p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group">
                          <div className="flex items-center">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-semibold mr-3 group-hover:scale-110 transition-transform">
                              {client.firstName[0]}{client.lastName[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate group-hover:text-primary-700">{client.firstName} {client.lastName}</p>
                              <p className="text-sm text-gray-500 truncate">{client.email}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                /* Quick Create */
                <form onSubmit={handleQuickCreate} className="space-y-5">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-900">Lightning Fast</p>
                      <p className="text-sm text-emerald-700">Just 3 required fields. Add more details later.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name *</label>
                      <input type="text" value={quickCreateData.firstName} onChange={(e) => setQuickCreateData({ ...quickCreateData, firstName: e.target.value })} required placeholder="John" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name *</label>
                      <input type="text" value={quickCreateData.lastName} onChange={(e) => setQuickCreateData({ ...quickCreateData, lastName: e.target.value })} required placeholder="Doe" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                      <input type="email" value={quickCreateData.email} onChange={(e) => setQuickCreateData({ ...quickCreateData, email: e.target.value })} required placeholder="john@example.com" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                      <input type="tel" value={quickCreateData.phone} onChange={(e) => setQuickCreateData({ ...quickCreateData, phone: e.target.value })} placeholder="+1 (555) 123-4567" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowQuickCreate(false)} className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-all">Cancel</button>
                    <button type="submit" disabled={quickCreateLoading} className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2">
                      {quickCreateLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                      {quickCreateLoading ? "Creating..." : "Create & Select"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button onClick={onPrev} className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-all flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="flex gap-3">
          <button onClick={() => onSave(false)} disabled={loading || !selectedClient} className="px-6 py-3 border-2 border-primary-600 text-primary-700 rounded-xl font-medium hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2">
            <Save className="w-5 h-5" />
            Save Draft
          </button>
          <button onClick={() => onSave(true)} disabled={loading || !selectedClient} className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/25 flex items-center gap-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {loading ? "Sending..." : "Send Quote"}
          </button>
        </div>
      </div>

      {!selectedClient && <p className="text-center text-sm text-gray-400 italic">Select or create a client to enable Send</p>}
    </div>
  );
}
