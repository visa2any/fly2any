"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import {
  Plane, Building2, MapPin, Calendar, Users, Clock, Check, X,
  ChevronDown, ChevronUp, Star, Shield, Loader2, AlertCircle,
  Phone, Mail, ArrowRight
} from "lucide-react";
import Link from "next/link";

interface Quote {
  id: string;
  quoteNumber: string;
  tripName: string;
  destination: string;
  startDate: string;
  endDate: string;
  duration: number;
  travelers: number;
  adults: number;
  children: number;
  infants: number;
  flights: any[];
  hotels: any[];
  activities: any[];
  transfers: any[];
  carRentals: any[];
  insurance: any;
  customItems: any[];
  subtotal: number;
  taxes: number;
  fees: number;
  discount: number;
  total: number;
  currency: string;
  inclusions: string[];
  exclusions: string[];
  importantInfo: string;
  expiresAt: string;
  status: string;
  shareableLink: string;
}

interface ComparisonData {
  comparison: {
    id: string;
    name: string;
    description: string;
    expiresAt: string;
  };
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
  agent: {
    id: string;
    firstName: string;
    lastName: string;
    agencyName: string;
    email: string;
    phone: string;
    logo: string;
    brandColor: string;
  };
  quotes: Quote[];
}

export default function QuoteComparisonPage({
  params,
}: {
  params: Promise<{ shareableLink: string }>;
}) {
  const { shareableLink } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<ComparisonData | null>(null);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    flights: true,
    hotels: true,
    activities: false,
  });

  useEffect(() => {
    fetchComparison();
  }, [shareableLink]);

  const fetchComparison = async () => {
    try {
      const res = await fetch(`/api/quotes/compare/${shareableLink}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to load comparison");
      }
      const result = await res.json();
      setData(result);
      if (result.quotes.length > 0) {
        setSelectedQuoteId(result.quotes[0].id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const fmt = (n: number, currency = "USD") =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-fly2any-red animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your travel options...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Comparison Not Found</h1>
          <p className="text-gray-600">{error || "This comparison link may have expired or is invalid."}</p>
        </div>
      </div>
    );
  }

  const { comparison, client, agent, quotes } = data;
  const brandColor = agent.brandColor || "#E74035";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {agent.logo ? (
                <img src={agent.logo} alt={agent.agencyName} className="h-10 object-contain" />
              ) : (
                <div className="text-xl font-bold" style={{ color: brandColor }}>
                  {agent.agencyName || `${agent.firstName} ${agent.lastName}`}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              {agent.phone && (
                <a href={`tel:${agent.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                  <Phone className="w-4 h-4" /> {agent.phone}
                </a>
              )}
              {agent.email && (
                <a href={`mailto:${agent.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                  <Mail className="w-4 h-4" /> Contact
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-gray-500 mb-2">Prepared for {client.firstName} {client.lastName}</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{comparison.name}</h1>
          {comparison.description && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{comparison.description}</p>
          )}
          <p className="mt-4 text-sm text-gray-500">
            Comparing {quotes.length} travel options
          </p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="px-4 sm:px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Quote Selector Tabs - Mobile */}
          <div className="lg:hidden mb-6 flex gap-2 overflow-x-auto pb-2">
            {quotes.map((quote, idx) => (
              <button
                key={quote.id}
                onClick={() => setSelectedQuoteId(quote.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  selectedQuoteId === quote.id
                    ? "bg-gray-900 text-white"
                    : "bg-white border border-gray-200 text-gray-700"
                }`}
              >
                Option {idx + 1}
              </button>
            ))}
          </div>

          {/* Desktop Grid / Mobile Single */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-6">
            {quotes.map((quote, idx) => (
              <QuoteCard
                key={quote.id}
                quote={quote}
                index={idx}
                brandColor={brandColor}
                isRecommended={idx === 0}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
              />
            ))}
          </div>

          {/* Mobile Single Quote View */}
          <div className="lg:hidden">
            {quotes
              .filter((q) => q.id === selectedQuoteId)
              .map((quote, idx) => (
                <QuoteCard
                  key={quote.id}
                  quote={quote}
                  index={quotes.findIndex((q) => q.id === quote.id)}
                  brandColor={brandColor}
                  isRecommended={quotes.findIndex((q) => q.id === quote.id) === 0}
                  expandedSections={expandedSections}
                  toggleSection={toggleSection}
                />
              ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-gray-400 text-sm">
            Questions? Contact your travel advisor at{" "}
            <a href={`mailto:${agent.email}`} className="text-white hover:underline">{agent.email}</a>
          </p>
          <p className="text-gray-500 text-xs mt-4">
            Powered by <span className="text-fly2any-red">Fly2Any</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

// Quote Card Component
function QuoteCard({
  quote,
  index,
  brandColor,
  isRecommended,
  expandedSections,
  toggleSection,
}: {
  quote: Quote;
  index: number;
  brandColor: string;
  isRecommended: boolean;
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
}) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: quote.currency, maximumFractionDigits: 0 }).format(n);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-white rounded-2xl border-2 overflow-hidden ${
        isRecommended ? "border-fly2any-red shadow-xl shadow-red-500/10" : "border-gray-200"
      }`}
    >
      {/* Header */}
      <div className="p-5 border-b border-gray-100" style={{ backgroundColor: isRecommended ? `${brandColor}10` : undefined }}>
        {isRecommended && (
          <div className="flex items-center gap-1 text-fly2any-red text-xs font-semibold mb-2">
            <Star className="w-3 h-3 fill-current" /> RECOMMENDED
          </div>
        )}
        <h3 className="text-lg font-bold text-gray-900">Option {index + 1}</h3>
        <p className="text-sm text-gray-600">{quote.tripName}</p>

        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {quote.destination}</span>
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {quote.duration} days</span>
          <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {quote.travelers}</span>
        </div>
      </div>

      {/* Price */}
      <div className="p-5 bg-gray-50">
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-900">{fmt(quote.total)}</p>
          <p className="text-sm text-gray-500">{fmt(quote.total / quote.travelers)} per person</p>
        </div>
      </div>

      {/* Sections */}
      <div className="divide-y divide-gray-100">
        {/* Flights */}
        {quote.flights.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection("flights")}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <span className="flex items-center gap-2 font-medium text-gray-900">
                <Plane className="w-4 h-4 text-blue-500" /> Flights ({quote.flights.length})
              </span>
              {expandedSections.flights ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {expandedSections.flights && (
              <div className="px-4 pb-4 space-y-2">
                {quote.flights.map((f: any, i: number) => (
                  <div key={i} className="p-3 bg-blue-50 rounded-xl text-sm">
                    <p className="font-medium">{f.from} → {f.to}</p>
                    <p className="text-gray-600">{f.airline} {f.flight}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Hotels */}
        {quote.hotels.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection("hotels")}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <span className="flex items-center gap-2 font-medium text-gray-900">
                <Building2 className="w-4 h-4 text-purple-500" /> Hotels ({quote.hotels.length})
              </span>
              {expandedSections.hotels ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {expandedSections.hotels && (
              <div className="px-4 pb-4 space-y-2">
                {quote.hotels.map((h: any, i: number) => (
                  <div key={i} className="p-3 bg-purple-50 rounded-xl text-sm">
                    <p className="font-medium">{h.name}</p>
                    <p className="text-gray-600">{h.roomType} • {h.nights} nights</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Inclusions */}
        {quote.inclusions.length > 0 && (
          <div className="p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Includes</p>
            <ul className="space-y-1">
              {quote.inclusions.slice(0, 4).map((inc, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500" /> {inc}
                </li>
              ))}
              {quote.inclusions.length > 4 && (
                <li className="text-sm text-gray-500">+{quote.inclusions.length - 4} more</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="p-4 border-t border-gray-100">
        <Link
          href={`/client/quotes/${quote.shareableLink}`}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-white transition-all"
          style={{ backgroundColor: brandColor }}
        >
          View Full Details <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}
