"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Plane, Building2, Car, MapPin, Calendar, Users, Clock,
  CheckCircle, AlertCircle, ChevronDown, Phone, Mail, MessageCircle,
  Shield, Heart, Send, Download
} from "lucide-react";
import {
  TrustLayer, AgentSignature, ClientPricingPanel, FinalReassurance,
  DayChapter, ProductEnrichment, getProductHeadline, getSelectionReason,
  useCoCreation, ClientReactions, ClientSuggestionInput,
} from "@/components/agent/quote-workspace/client-preview";

interface QuoteItem {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  price: number;
  dayIndex: number;
  timeSlot?: string;
  image?: string;
  details?: any;
}

interface Quote {
  id: string;
  tripName: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  status: string;
  total: number;
  currency: string;
  travelers: { adults: number; children: number; infants: number; total: number };
  items: QuoteItem[];
  toneProfile?: string;
  isExpired: boolean;
  expiresAt?: string;
  agent: {
    businessName?: string;
    phone?: string;
    user: { name?: string; email: string; image?: string };
  };
  client?: { firstName: string; lastName: string; email: string };
  termsAndConditions?: string;
  metadata?: any;
}

interface Props {
  quote: Quote;
  token: string;
}

const PRODUCT_ICONS: Record<string, typeof Plane> = {
  flight: Plane, hotel: Building2, car: Car, activity: MapPin,
  transfer: Car, insurance: Shield, custom: CheckCircle,
};

export default function ClientQuotePortal({ quote, token }: Props) {
  const [showTerms, setShowTerms] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(quote.status === "ACCEPTED");

  const tone = (quote.toneProfile as any) || "luxury";
  const agentName = quote.agent.user.name || quote.agent.businessName || "Your Travel Advisor";

  // Co-Creation hook
  const coCreation = useCoCreation({
    quoteId: quote.id,
    clientId: quote.client?.email || "guest",
    clientName: quote.client ? `${quote.client.firstName} ${quote.client.lastName}` : "Guest",
    isClientMode: true,
    onSyncToServer: async (action, data) => {
      await fetch(`/api/quote/${token}/interaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data }),
      });
    },
  });

  // Group items by day
  const itemsByDay = useMemo(() => {
    const grouped: Record<number, QuoteItem[]> = {};
    quote.items.forEach((item) => {
      if (!grouped[item.dayIndex]) grouped[item.dayIndex] = [];
      grouped[item.dayIndex].push(item);
    });
    return grouped;
  }, [quote.items]);

  const dayCount = Object.keys(itemsByDay).length;
  const tripDays = quote.startDate && quote.endDate
    ? Math.ceil((new Date(quote.endDate).getTime() - new Date(quote.startDate).getTime()) / 86400000) + 1
    : dayCount;

  // Handle accept quote
  const handleAccept = async () => {
    setAccepting(true);
    try {
      const res = await fetch(`/api/quote/${token}/accept`, { method: "POST" });
      if (res.ok) {
        setAccepted(true);
      }
    } catch (e) {
      console.error("Accept failed:", e);
    } finally {
      setAccepting(false);
    }
  };

  const fmt = (n: number) => new Intl.NumberFormat("en-US", {
    style: "currency", currency: quote.currency || "USD", maximumFractionDigits: 0,
  }).format(n);

  // Expired state
  if (quote.isExpired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl p-8 text-center shadow-xl"
        >
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quote Expired</h1>
          <p className="text-gray-600 mb-6">
            This quote is no longer available. Please contact your travel advisor for an updated quote.
          </p>
          <a
            href={`mailto:${quote.agent.user.email}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
          >
            <Mail className="w-5 h-5" />
            Contact {agentName}
          </a>
        </motion.div>
      </div>
    );
  }

  // Accepted confirmation
  if (accepted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full bg-white rounded-2xl p-8 text-center shadow-xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">You're All Set!</h1>
          <p className="text-gray-600 mb-6">
            Your trip to <strong>{quote.destination || "your destination"}</strong> is confirmed.
            {agentName} will reach out shortly with next steps.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Confirmation for</p>
            <p className="text-lg font-semibold text-gray-900">{quote.tripName}</p>
            <p className="text-2xl font-bold text-emerald-600 mt-2">{fmt(quote.total)}</p>
          </div>
          <FinalReassurance variant="compact" agentName={agentName} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <header className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm text-gray-400 mb-2">Your Personalized Travel Quote</p>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{quote.tripName}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
              {quote.destination && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> {quote.destination}
                </span>
              )}
              {quote.startDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(quote.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  {quote.endDate && ` - ${new Date(quote.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" /> {quote.travelers.total} Traveler{quote.travelers.total > 1 ? "s" : ""}
              </span>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Agent Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
            {quote.agent.user.image ? (
              <Image src={quote.agent.user.image} alt={agentName} width={56} height={56} className="object-cover" />
            ) : (
              <span className="text-xl font-bold text-primary-600">{agentName.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500">Curated by</p>
            <p className="font-semibold text-gray-900">{agentName}</p>
          </div>
          <div className="flex items-center gap-2">
            {quote.agent.phone && (
              <a href={`tel:${quote.agent.phone}`} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <Phone className="w-5 h-5 text-gray-600" />
              </a>
            )}
            <a href={`mailto:${quote.agent.user.email}`} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Mail className="w-5 h-5 text-gray-600" />
            </a>
          </div>
        </motion.div>

        {/* Itinerary Timeline */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Itinerary</h2>

          <div className="space-y-6">
            {Object.entries(itemsByDay).map(([dayIdx, items], i) => {
              const dayNum = parseInt(dayIdx) + 1;
              const position = i === 0 ? "first" : i === dayCount - 1 ? "last" : "middle";
              const mood = i === 0 ? "arrival" : i === dayCount - 1 ? "departure" : "explore";

              return (
                <div key={dayIdx}>
                  <DayChapter
                    dayNumber={dayNum}
                    date={quote.startDate ? new Date(new Date(quote.startDate).getTime() + parseInt(dayIdx) * 86400000) : undefined}
                    tone={tone}
                    position={position}
                    mood={mood}
                  />

                  <div className="space-y-3 mt-3 pl-4 border-l-2 border-gray-100">
                    {items.map((item, idx) => {
                      const Icon = PRODUCT_ICONS[item.type] || CheckCircle;

                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * idx }}
                          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm relative"
                        >
                          {/* Reactions */}
                          <div className="absolute top-3 right-3">
                            <ClientReactions
                              itemId={item.id}
                              currentReaction={coCreation.getReaction(item.id)}
                              onReact={coCreation.react}
                              onSuggest={coCreation.openSuggestionInput}
                            />
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5 text-primary-500" />
                            </div>
                            <div className="flex-1 min-w-0 pr-16">
                              <p className="text-xs text-primary-600 font-medium mb-0.5">
                                {getProductHeadline(tone, item.type as any, idx)}
                              </p>
                              <h4 className="font-semibold text-gray-900">{item.title}</h4>
                              {item.subtitle && <p className="text-sm text-gray-500">{item.subtitle}</p>}
                              <p className="text-xs text-gray-400 mt-1 italic">
                                {getSelectionReason(item.type as any, idx)}
                              </p>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">{fmt(item.price)}</p>
                          </div>

                          {/* Suggestion Input */}
                          <AnimatePresence>
                            {coCreation.state.showSuggestionInput === item.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 pt-3 border-t border-gray-100"
                              >
                                <ClientSuggestionInput
                                  itemId={item.id}
                                  itemName={item.title}
                                  dayIndex={parseInt(dayIdx)}
                                  clientName={quote.client ? `${quote.client.firstName}` : "Guest"}
                                  onSubmit={coCreation.submitSuggestion}
                                  onClose={coCreation.closeSuggestionInput}
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Pricing Panel */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <ClientPricingPanel
            total={quote.total}
            perPerson={Math.round(quote.total / quote.travelers.total)}
            travelers={quote.travelers.total}
            tripDays={tripDays}
            currency={quote.currency}
          />
        </motion.section>

        {/* Final Reassurance */}
        <FinalReassurance agentName={agentName} agentPhone={quote.agent.phone || undefined} />

        {/* Trust Layer */}
        <TrustLayer showHumanPresence={false} />

        {/* Terms & CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4"
        >
          {/* Expiry notice */}
          {quote.expiresAt && (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-lg text-sm">
              <Clock className="w-4 h-4" />
              <span>This quote expires on {new Date(quote.expiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
            </div>
          )}

          {/* Terms */}
          {quote.termsAndConditions && (
            <div>
              <button
                onClick={() => setShowTerms(!showTerms)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${showTerms ? "rotate-180" : ""}`} />
                Terms & Conditions
              </button>
              <AnimatePresence>
                {showTerms && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg text-sm text-gray-600 whitespace-pre-wrap">
                      {quote.termsAndConditions}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Accept Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleAccept}
            disabled={accepting}
            className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-primary-500/25 hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {accepting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Confirm My Trip - {fmt(quote.total)}
              </>
            )}
          </motion.button>

          <p className="text-center text-xs text-gray-400">
            By confirming, you agree to the terms above. Your agent will contact you to finalize payment.
          </p>
        </motion.section>

        {/* Agent Signature */}
        <AgentSignature
          agentName={agentName}
          agentTitle="Travel Advisor"
          agentEmail={quote.agent.user.email}
          agentPhone={quote.agent.phone || undefined}
          agentPhoto={quote.agent.user.image || undefined}
          tone={tone}
          clientName={quote.client?.firstName}
        />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm">Powered by Fly2Any</p>
          <p className="text-xs mt-2">Your personalized travel experience</p>
        </div>
      </footer>
    </div>
  );
}
