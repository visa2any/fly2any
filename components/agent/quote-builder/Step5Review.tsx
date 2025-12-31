"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Save, User, MapPin, Calendar, Users, Clock, Package, MessageSquare, FileText, DollarSign, Plane, Building2, Compass, Bus, Car, Shield, Info, Loader2, CheckCircle2 } from "lucide-react";
import { QuoteData } from "../QuoteBuilder";

interface Step5ReviewProps {
  quoteData: QuoteData;
  updateQuoteData: (data: Partial<QuoteData>) => void;
  clients: Array<{ id: string; firstName: string; lastName: string; email: string; phone?: string | null }>;
  onSave: (sendNow: boolean) => void;
  onPrev: () => void;
  loading: boolean;
}

const PRODUCTS = [
  { key: "flights", costKey: "flightsCost", label: "Flights", icon: Plane, gradient: "from-blue-500 to-indigo-600" },
  { key: "hotels", costKey: "hotelsCost", label: "Hotels", icon: Building2, gradient: "from-purple-500 to-pink-600" },
  { key: "activities", costKey: "activitiesCost", label: "Activities", icon: Compass, gradient: "from-emerald-500 to-teal-600" },
  { key: "transfers", costKey: "transfersCost", label: "Transfers", icon: Bus, gradient: "from-amber-500 to-orange-600" },
  { key: "carRentals", costKey: "carRentalsCost", label: "Car Rentals", icon: Car, gradient: "from-cyan-500 to-blue-600" },
  { key: "insurance", costKey: "insuranceCost", label: "Insurance", icon: Shield, gradient: "from-rose-500 to-pink-600" },
  { key: "customItems", costKey: "customItemsCost", label: "Custom", icon: Package, gradient: "from-gray-600 to-gray-800" },
];

export default function QuoteBuilderStep5Review({ quoteData, updateQuoteData, clients, onSave, onPrev, loading }: Step5ReviewProps) {
  const [formData, setFormData] = useState({
    notes: quoteData.notes || "",
    agentNotes: quoteData.agentNotes || "",
    expiresInDays: quoteData.expiresInDays || 7,
  });

  const selectedClient = clients.find((c) => c.id === quoteData.clientId);

  useEffect(() => {
    updateQuoteData(formData);
  }, [formData]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const fmt = (n: number) => `${quoteData.currency === "USD" ? "$" : quoteData.currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";
  const expDate = () => { const d = new Date(); d.setDate(d.getDate() + formData.expiresInDays); return fmtDate(d.toISOString()); };

  const SectionCard = ({ icon: Icon, title, gradient, children }: { icon: any; title: string; gradient: string; children: React.ReactNode }) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className={`bg-gradient-to-r ${gradient} px-5 py-3 flex items-center gap-3`}>
        <Icon className="w-5 h-5 text-white" />
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <CheckCircle2 className="w-7 h-7 text-emerald-500" />
          Review & Send Quote
        </h2>
        <p className="text-gray-600">Review all details before sending to your client</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Client */}
          <SectionCard icon={User} title="Client Information" gradient="from-blue-500 to-indigo-600">
            {selectedClient ? (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-600">{selectedClient.firstName[0]}{selectedClient.lastName[0]}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedClient.firstName} {selectedClient.lastName}</p>
                  <p className="text-sm text-gray-500">{selectedClient.email}</p>
                  {selectedClient.phone && <p className="text-sm text-gray-500">{selectedClient.phone}</p>}
                </div>
              </div>
            ) : <p className="text-gray-400 text-sm">No client selected</p>}
          </SectionCard>

          {/* Trip Details */}
          <SectionCard icon={MapPin} title="Trip Details" gradient="from-emerald-500 to-teal-600">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Trip Name</p>
                <p className="font-semibold text-gray-900">{quoteData.tripName || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Destination</p>
                <p className="font-semibold text-gray-900">{quoteData.destination || "—"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Departure</p>
                    <p className="font-medium text-gray-900 text-sm">{fmtDate(quoteData.startDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Return</p>
                    <p className="font-medium text-gray-900 text-sm">{fmtDate(quoteData.endDate)}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{quoteData.duration} {quoteData.duration === 1 ? "Day" : "Days"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{quoteData.travelers} Travelers</span>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Products */}
          <SectionCard icon={Package} title="Products Included" gradient="from-purple-500 to-pink-600">
            <div className="space-y-4">
              {PRODUCTS.map(({ key, label, icon: Icon, gradient }) => {
                const items = (quoteData as any)[key];
                if (!items?.length) return null;
                return (
                  <div key={key}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-6 h-6 bg-gradient-to-br ${gradient} rounded flex items-center justify-center`}>
                        <Icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="font-medium text-gray-800 text-sm">{label} ({items.length})</span>
                    </div>
                    <div className="ml-8 space-y-1">
                      {items.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.name || item.airline || item.company || "Item"}</span>
                          <span className="font-medium text-gray-900">{fmt(item.price || 0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {quoteData.subtotal === 0 && <p className="text-center text-gray-400 py-4">No products added</p>}
            </div>
          </SectionCard>

          {/* Client Message */}
          <SectionCard icon={MessageSquare} title="Message to Client" gradient="from-amber-500 to-orange-600">
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              placeholder="Add a personalized message (included in email)..."
            />
            <p className="text-xs text-gray-500 mt-2">Visible to the client</p>
          </SectionCard>

          {/* Internal Notes */}
          <SectionCard icon={FileText} title="Internal Notes (Private)" gradient="from-gray-600 to-gray-800">
            <textarea
              value={formData.agentNotes}
              onChange={(e) => handleChange("agentNotes", e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              placeholder="Private notes for yourself..."
            />
            <p className="text-xs text-gray-500 mt-2">Only visible to you</p>
          </SectionCard>
        </div>

        {/* Right Column - Pricing */}
        <div className="lg:col-span-1 space-y-5">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm sticky top-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              Pricing Summary
            </h3>

            <div className="space-y-2">
              {PRODUCTS.map(({ costKey, label }) => {
                const cost = (quoteData as any)[costKey];
                if (!cost) return null;
                return (
                  <div key={costKey} className="flex justify-between text-sm">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-medium text-gray-900">{fmt(cost)}</span>
                  </div>
                );
              })}

              {quoteData.subtotal > 0 && (
                <>
                  <div className="border-t border-gray-200 pt-2 mt-2" />
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">Subtotal</span>
                    <span className="font-semibold text-gray-900">{fmt(quoteData.subtotal)}</span>
                  </div>
                </>
              )}

              {quoteData.agentMarkup > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Markup ({quoteData.agentMarkupPercent}%)</span>
                  <span className="font-medium text-emerald-600">+{fmt(quoteData.agentMarkup)}</span>
                </div>
              )}
              {quoteData.taxes > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxes</span>
                  <span className="font-medium text-gray-900">+{fmt(quoteData.taxes)}</span>
                </div>
              )}
              {quoteData.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-red-600">-{fmt(quoteData.discount)}</span>
                </div>
              )}

              <div className="border-t-2 border-gray-300 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary-600">{fmt(quoteData.total)}</span>
                </div>
              </div>

              {quoteData.travelers > 0 && (
                <div className="bg-gradient-to-r from-primary-50 to-rose-50 border border-primary-200 rounded-xl p-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Per Person</span>
                    <span className="text-lg font-bold text-primary-700">{fmt(quoteData.total / quoteData.travelers)}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Expiration */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Quote Expiration
            </h3>
            <select
              value={formData.expiresInDays}
              onChange={(e) => handleChange("expiresInDays", parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value={3}>3 Days</option>
              <option value={7}>7 Days (Recommended)</option>
              <option value={14}>14 Days</option>
              <option value={30}>30 Days</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">Expires: <strong>{expDate()}</strong></p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => onSave(true)}
              disabled={loading || quoteData.subtotal === 0}
              className="w-full px-6 py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {loading ? "Sending..." : "Send to Client"}
            </button>
            <button
              onClick={() => onSave(false)}
              disabled={loading || quoteData.subtotal === 0}
              className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {loading ? "Saving..." : "Save as Draft"}
            </button>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900">
              <p className="font-medium mb-1">What happens next?</p>
              <ul className="space-y-0.5 text-blue-800">
                <li>• Client receives email with quote</li>
                <li>• They can accept/decline online</li>
                <li>• You'll be notified instantly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-start pt-6 border-t border-gray-200">
        <button
          onClick={onPrev}
          disabled={loading}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Pricing
        </button>
      </div>
    </div>
  );
}
