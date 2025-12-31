'use client';

// app/pay/[linkId]/page.tsx
// Client-Facing Payment Page - Level 6 Ultra-Premium
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane, Hotel, Car, Ticket, Calendar, Users, MapPin,
  Shield, Lock, CreditCard, CheckCircle, AlertCircle,
  Clock, ChevronRight, Copy, Check
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface PaymentPageProps {
  params: { linkId: string };
}

interface QuoteData {
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
  tripItems: Array<{
    type: string;
    count: number;
    cost: number;
    items?: any[];
  }>;
  pricing: {
    subtotal: number;
    taxes: number;
    fees: number;
    discount: number;
    total: number;
    currency: string;
    depositRequired: boolean;
    depositAmount: number | null;
  };
  client: {
    firstName: string;
    lastName: string;
    email: string;
  };
  agent: {
    agencyName: string | null;
    businessName: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    logo: string | null;
    brandColor: string | null;
  };
  expiresAt: string;
  notes: string | null;
  inclusions: string[];
  exclusions: string[];
}

export default function PaymentPage({ params }: PaymentPageProps) {
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [paid, setPaid] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchQuote();
  }, [params.linkId]);

  const fetchQuote = async () => {
    try {
      const res = await fetch(`/api/pay/${params.linkId}`);
      const data = await res.json();

      if (!res.ok) {
        if (data.expired) {
          setExpired(true);
        } else if (data.paid) {
          setPaid(true);
        } else {
          setError(data.error || 'Failed to load payment details');
        }
        return;
      }

      setQuote(data);
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (!quote) return;
    setProcessing(true);
    // Redirect to checkout - same flow as customer side
    window.location.href = `/checkout/agent-quote?linkId=${params.linkId}`;
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTimeRemaining = () => {
    if (!quote) return '';
    const now = new Date();
    const expires = new Date(quote.expiresAt);
    const diff = expires.getTime() - now.getTime();
    if (diff <= 0) return 'Expired';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'flights': return Plane;
      case 'hotels': return Hotel;
      case 'transfers': return Car;
      case 'activities': return Ticket;
      default: return Ticket;
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your trip details...</p>
        </motion.div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Link Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            Go to Homepage
          </Link>
        </motion.div>
      </div>
    );
  }

  // Expired State
  if (expired) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quote Expired</h1>
          <p className="text-gray-600 mb-6">
            This quote has expired. Please contact your travel agent for an updated quote.
          </p>
        </motion.div>
      </div>
    );
  }

  // Already Paid State
  if (paid) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Already Paid!</h1>
          <p className="text-gray-600 mb-6">
            This quote has already been paid. Check your email for confirmation details.
          </p>
        </motion.div>
      </div>
    );
  }

  if (!quote) return null;

  const agentName = quote.agent.agencyName || quote.agent.businessName ||
    `${quote.agent.firstName || ''} ${quote.agent.lastName || ''}`.trim() || 'Your Travel Agent';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {quote.agent.logo ? (
              <Image
                src={quote.agent.logo}
                alt={agentName}
                width={40}
                height={40}
                className="rounded-lg"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: quote.agent.brandColor || '#E74035' }}
              >
                {agentName.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900 text-sm">{agentName}</p>
              <p className="text-xs text-gray-500">Travel Quote #{quote.quoteNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-orange-600 font-medium">{getTimeRemaining()}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Trip Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {quote.tripName}
          </h1>
          <div className="flex items-center justify-center gap-4 text-gray-600">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {quote.destination}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {quote.duration} days
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {quote.travelers} travelers
            </span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Trip Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Date Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Departure</p>
                  <p className="font-semibold text-gray-900">{formatDate(quote.startDate)}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">Return</p>
                  <p className="font-semibold text-gray-900">{formatDate(quote.endDate)}</p>
                </div>
              </div>
            </motion.div>

            {/* Trip Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">What's Included</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {quote.tripItems.map((item, idx) => {
                  const Icon = getItemIcon(item.type);
                  return (
                    <div key={idx} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 capitalize">
                            {item.type} ({item.count})
                          </p>
                          {item.items && item.items[0] && (
                            <p className="text-sm text-gray-500">
                              {item.type === 'flights' && `${item.items[0].origin} → ${item.items[0].destination}`}
                              {item.type === 'hotels' && item.items[0].name}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="font-medium text-gray-900">
                        {formatCurrency(item.cost, quote.pricing.currency)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Inclusions/Exclusions */}
            {(quote.inclusions?.length > 0 || quote.exclusions?.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                {quote.inclusions?.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-900 mb-2">Inclusions</h3>
                    <ul className="space-y-1">
                      {quote.inclusions.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                          <Check className="w-4 h-4 text-emerald-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {quote.exclusions?.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Exclusions</h3>
                    <ul className="space-y-1">
                      {quote.exclusions.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-500">• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Right Column - Payment */}
          <div className="space-y-6">
            {/* Price Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-24"
            >
              <div className="p-6 bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                <p className="text-sm opacity-80 mb-1">Total Price</p>
                <p className="text-4xl font-bold">
                  {formatCurrency(quote.pricing.total, quote.pricing.currency)}
                </p>
                {quote.pricing.depositRequired && quote.pricing.depositAmount && (
                  <p className="text-sm mt-2 bg-white/20 rounded-lg px-3 py-1.5 inline-block">
                    Deposit: {formatCurrency(quote.pricing.depositAmount, quote.pricing.currency)}
                  </p>
                )}
              </div>

              <div className="p-6 space-y-4">
                {/* Price Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(quote.pricing.subtotal, quote.pricing.currency)}</span>
                  </div>
                  {quote.pricing.taxes > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Taxes & Fees</span>
                      <span>{formatCurrency(quote.pricing.taxes + quote.pricing.fees, quote.pricing.currency)}</span>
                    </div>
                  )}
                  {quote.pricing.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(quote.pricing.discount, quote.pricing.currency)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-semibold text-gray-900">
                    <span>Total</span>
                    <span>{formatCurrency(quote.pricing.total, quote.pricing.currency)}</span>
                  </div>
                </div>

                {/* Pay Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePayNow}
                  disabled={processing}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pay Now
                    </>
                  )}
                </motion.button>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <Lock className="w-3.5 h-3.5" />
                  <span>256-bit SSL encryption</span>
                </div>

                {/* Share */}
                <button
                  onClick={copyToClipboard}
                  className="w-full py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </motion.div>

            {/* Agent Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            >
              <p className="text-xs text-gray-500 mb-2">Questions? Contact</p>
              <p className="font-medium text-gray-900">{agentName}</p>
              {quote.agent.email && (
                <a href={`mailto:${quote.agent.email}`} className="text-sm text-primary-600 hover:underline">
                  {quote.agent.email}
                </a>
              )}
              {quote.agent.phone && (
                <p className="text-sm text-gray-600">{quote.agent.phone}</p>
              )}
            </motion.div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-1">
                <Lock className="w-4 h-4" />
                <span>PCI Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>Powered by <Link href="/" className="text-primary-600 hover:underline">Fly2Any</Link></p>
        </div>
      </footer>
    </div>
  );
}
