'use client';

/**
 * Agent Quote Checkout Page
 * Collects traveler details and submits to manual ticketing
 * Same flow as /flights checkout — routes to PENDING_TICKETING
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plane, Hotel, Car, Ticket, Calendar, Users, MapPin,
  Shield, Lock, CreditCard, CheckCircle, AlertCircle,
  Clock, ChevronDown, ChevronRight, ArrowLeft, User,
  Mail, Phone, Loader2, Download, Globe, FileText
} from 'lucide-react';

interface QuoteData {
  quoteId: string;
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
}

interface PassengerForm {
  type: 'adult' | 'child' | 'infant';
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  passportNumber: string;
  passportExpiry: string;
  nationality: string;
}

interface ContactForm {
  email: string;
  phone: string;
  countryCode: string;
  specialRequests: string;
}

const STEPS = [
  { id: 1, label: 'Traveler Details', icon: Users },
  { id: 2, label: 'Review & Confirm', icon: FileText },
  { id: 3, label: 'Confirmation', icon: CheckCircle },
];

export default function AgentQuoteCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkId = searchParams?.get('linkId') || '';

  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState('');

  // Forms
  const [passengers, setPassengers] = useState<PassengerForm[]>([]);
  const [contact, setContact] = useState<ContactForm>({
    email: '',
    phone: '',
    countryCode: '+1',
    specialRequests: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (!linkId) {
      setError('No payment link provided');
      setLoading(false);
      return;
    }
    fetchQuote();
  }, [linkId]);

  const fetchQuote = async () => {
    try {
      const res = await fetch(`/api/pay/${linkId}`);
      const data = await res.json();

      if (!res.ok) {
        if (data.expired) setError('This quote has expired.');
        else if (data.paid) setError('This quote has already been paid.');
        else setError(data.error || 'Failed to load quote');
        return;
      }

      setQuote({ ...data, quoteId: data.quoteId || '' });

      // Pre-fill contact from client
      if (data.client) {
        setContact(prev => ({
          ...prev,
          email: data.client.email || '',
        }));
      }

      // Initialize passenger forms
      const passengerList: PassengerForm[] = [];
      for (let i = 0; i < (data.adults || 1); i++) {
        passengerList.push({
          type: 'adult',
          firstName: i === 0 ? (data.client?.firstName || '') : '',
          lastName: i === 0 ? (data.client?.lastName || '') : '',
          dateOfBirth: '', gender: '', passportNumber: '', passportExpiry: '', nationality: '',
        });
      }
      for (let i = 0; i < (data.children || 0); i++) {
        passengerList.push({
          type: 'child',
          firstName: '', lastName: '', dateOfBirth: '', gender: '',
          passportNumber: '', passportExpiry: '', nationality: '',
        });
      }
      for (let i = 0; i < (data.infants || 0); i++) {
        passengerList.push({
          type: 'infant',
          firstName: '', lastName: '', dateOfBirth: '', gender: '',
          passportNumber: '', passportExpiry: '', nationality: '',
        });
      }
      setPassengers(passengerList);
    } catch {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handlePassengerChange = (index: number, field: keyof PassengerForm, value: string) => {
    setPassengers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const validateStep1 = (): boolean => {
    // Require first/last name for all passengers and contact email
    for (const p of passengers) {
      if (!p.firstName.trim() || !p.lastName.trim()) return false;
    }
    if (!contact.email.trim()) return false;
    return true;
  };

  const handleSubmit = async () => {
    if (!quote || !agreedToTerms) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/checkout/agent-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkId,
          passengers,
          contact,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Checkout failed');
        setSubmitting(false);
        return;
      }

      setConfirmationNumber(data.confirmationNumber || data.bookingId || '');
      setStep(3);
    } catch {
      setError('Failed to process checkout');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'flights': return Plane;
      case 'hotels': return Hotel;
      case 'transfers': return Car;
      default: return Ticket;
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Loader2 className="w-12 h-12 text-[#E74035] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading checkout...</p>
        </motion.div>
      </div>
    );
  }

  // Error
  if (error && step !== 3) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Process</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => router.back()}
            className="px-6 py-3 bg-[#E74035] text-white rounded-xl font-medium hover:bg-[#D63930] transition-colors">
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  if (!quote) return null;

  const agentName = quote.agent.agencyName || quote.agent.businessName ||
    `${quote.agent.firstName || ''} ${quote.agent.lastName || ''}`.trim() || 'Your Travel Agent';

  // Step 3: Confirmation
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
              className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-12 h-12 text-emerald-600" />
            </motion.div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600 mb-6">
              Your trip to <span className="font-semibold">{quote.destination}</span> is being processed.
            </p>

            {confirmationNumber && (
              <div className="bg-gray-900 rounded-2xl p-5 mb-6 inline-block">
                <p className="text-xs text-gray-400 mb-1">Confirmation Number</p>
                <p className="text-2xl font-bold text-[#F7C928] tracking-wider font-mono">
                  {confirmationNumber}
                </p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-900">What happens next?</p>
                  <ul className="mt-2 space-y-1 text-sm text-blue-700">
                    <li>Your booking is now being processed by Fly2Any</li>
                    <li>Our team will confirm all reservations on your behalf</li>
                    <li>E-tickets and hotel vouchers will be sent to your email</li>
                    <li>Typical processing time: 24–48 hours</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-left">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500">Trip</p>
                <p className="font-semibold text-gray-900">{quote.tripName}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500">Total Paid</p>
                <p className="font-semibold text-gray-900">
                  {formatCurrency(quote.pricing.total, quote.pricing.currency)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500">Dates</p>
                <p className="font-semibold text-gray-900 text-sm">
                  {formatDate(quote.startDate)} - {formatDate(quote.endDate)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500">Travelers</p>
                <p className="font-semibold text-gray-900">{quote.travelers} guests</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/"
                className="flex-1 py-3 px-6 bg-[#E74035] text-white rounded-xl font-medium hover:bg-[#D63930] transition-colors text-center">
                Back to Homepage
              </Link>
            </div>

            <p className="text-xs text-gray-400 mt-6">
              A confirmation email has been sent to {contact.email}
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => step > 1 ? setStep(step - 1) : router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              {quote.agent.logo ? (
                <Image src={quote.agent.logo} alt={agentName} width={32} height={32} className="rounded-lg" />
              ) : (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: quote.agent.brandColor || '#E74035' }}>
                  {agentName.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900 text-sm">{agentName}</p>
                <p className="text-xs text-gray-500">Secure Checkout</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">256-bit SSL</span>
          </div>
        </div>
      </header>

      {/* Steps */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isCompleted = step > s.id;
            return (
              <div key={s.id} className="flex items-center gap-2">
                {idx > 0 && (
                  <div className={`w-12 h-0.5 ${isCompleted ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                )}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isActive ? 'bg-[#E74035] text-white' :
                  isCompleted ? 'bg-emerald-100 text-emerald-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Traveler Details */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  {/* Trip Summary */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{quote.tripName}</h2>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{quote.destination}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{formatDate(quote.startDate)} - {formatDate(quote.endDate)}</span>
                      <span className="flex items-center gap-1"><Users className="w-4 h-4" />{quote.travelers} travelers</span>
                    </div>
                  </div>

                  {/* Passenger Forms */}
                  <div className="space-y-4">
                    {passengers.map((pax, idx) => (
                      <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Traveler {idx + 1}
                            </h3>
                            <p className="text-xs text-gray-500 capitalize">{pax.type}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                            <input
                              type="text"
                              value={pax.firstName}
                              onChange={e => handlePassengerChange(idx, 'firstName', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#E74035]/20 focus:border-[#E74035] outline-none transition-all"
                              placeholder="As shown on passport"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                            <input
                              type="text"
                              value={pax.lastName}
                              onChange={e => handlePassengerChange(idx, 'lastName', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#E74035]/20 focus:border-[#E74035] outline-none transition-all"
                              placeholder="As shown on passport"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                            <input
                              type="date"
                              value={pax.dateOfBirth}
                              onChange={e => handlePassengerChange(idx, 'dateOfBirth', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#E74035]/20 focus:border-[#E74035] outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                            <select
                              value={pax.gender}
                              onChange={e => handlePassengerChange(idx, 'gender', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#E74035]/20 focus:border-[#E74035] outline-none transition-all bg-white"
                            >
                              <option value="">Select</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                            <input
                              type="text"
                              value={pax.passportNumber}
                              onChange={e => handlePassengerChange(idx, 'passportNumber', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#E74035]/20 focus:border-[#E74035] outline-none transition-all"
                              placeholder="Optional"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                            <input
                              type="text"
                              value={pax.nationality}
                              onChange={e => handlePassengerChange(idx, 'nationality', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#E74035]/20 focus:border-[#E74035] outline-none transition-all"
                              placeholder="e.g. US"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Contact Info */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mt-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Mail className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Contact Information</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                          type="email"
                          value={contact.email}
                          onChange={e => setContact(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#E74035]/20 focus:border-[#E74035] outline-none transition-all"
                          placeholder="you@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={contact.phone}
                          onChange={e => setContact(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#E74035]/20 focus:border-[#E74035] outline-none transition-all"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                        <textarea
                          value={contact.specialRequests}
                          onChange={e => setContact(prev => ({ ...prev, specialRequests: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#E74035]/20 focus:border-[#E74035] outline-none transition-all resize-none"
                          rows={3}
                          placeholder="Any dietary, accessibility, or seating preferences..."
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (validateStep1()) setStep(2);
                    }}
                    disabled={!validateStep1()}
                    className="w-full mt-6 py-4 bg-[#E74035] text-white font-semibold rounded-xl hover:bg-[#D63930] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Continue to Review
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {/* Step 2: Review & Confirm */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  {/* Trip Overview */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Review Your Booking</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-gray-900">{quote.tripName}</p>
                          <p className="text-sm text-gray-500">{quote.destination}</p>
                        </div>
                        <p className="text-sm text-gray-500">{quote.duration} days</p>
                      </div>

                      {/* What's Included */}
                      {quote.tripItems.map((item, idx) => {
                        const Icon = getItemIcon(item.type);
                        return (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                                <Icon className="w-4 h-4 text-indigo-600" />
                              </div>
                              <span className="text-sm text-gray-900 capitalize">{item.type} ({item.count})</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {formatCurrency(item.cost, quote.pricing.currency)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Travelers Review */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Travelers</h3>
                    <div className="space-y-3">
                      {passengers.map((pax, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <User className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{pax.firstName} {pax.lastName}</p>
                            <p className="text-xs text-gray-500 capitalize">{pax.type}{pax.dateOfBirth ? ` · ${pax.dateOfBirth}` : ''}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact Review */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Contact</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" /> {contact.email}
                      </div>
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" /> {contact.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={e => setAgreedToTerms(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-[#E74035] focus:ring-[#E74035]"
                      />
                      <span className="text-sm text-gray-600">
                        I agree to the booking terms and conditions. I understand this booking will be processed by Fly2Any
                        and final confirmation including e-tickets will be sent via email.
                      </span>
                    </label>
                  </div>

                  {/* Manual Ticketing Notice */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-amber-900 text-sm">Processing by Fly2Any</p>
                        <p className="text-xs text-amber-700 mt-1">
                          Fly2Any will confirm all reservations and issue your e-tickets.
                          You will receive e-tickets and hotel vouchers within 24-48 hours via email.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setStep(1)}
                      className="flex-1 py-4 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!agreedToTerms || submitting}
                      className="flex-[2] py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                      ) : (
                        <><CheckCircle className="w-5 h-5" /> Confirm Booking — {formatCurrency(quote.pricing.total, quote.pricing.currency)}</>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar - Price Summary (visible on steps 1 & 2) */}
          {step < 3 && (
            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
                <div className="p-6 bg-gradient-to-br from-[#E74035] to-[#D63930] text-white">
                  <p className="text-sm opacity-80 mb-1">Total</p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(quote.pricing.total, quote.pricing.currency)}
                  </p>
                </div>
                <div className="p-6 space-y-3">
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
                  <div className="flex items-center justify-center gap-2 pt-3 text-xs text-gray-500">
                    <Shield className="w-4 h-4" />
                    <span>Secure & Protected</span>
                  </div>
                </div>
              </motion.div>

              {/* Agent Contact */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-500 mb-2">Your Travel Agent</p>
                <p className="font-medium text-gray-900">{agentName}</p>
                {quote.agent.email && (
                  <a href={`mailto:${quote.agent.email}`} className="text-sm text-[#E74035] hover:underline">
                    {quote.agent.email}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
