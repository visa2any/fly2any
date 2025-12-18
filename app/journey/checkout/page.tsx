'use client';

/**
 * Journey Checkout Page
 * Fly2Any Travel Operating System
 * Level 6 Ultra-Premium / Apple-Class
 */

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Plane,
  Building2,
  Sparkles,
  User,
  CreditCard,
  Shield,
  Lock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Check,
} from 'lucide-react';
import { PricingAggregator } from '@/lib/journey/services/PricingAggregator';
import { Journey, JourneyPricing } from '@/lib/journey/types';
import { PromoCodeSection } from '@/components/booking/PromoCodeSection';

// ============================================================================
// TYPES
// ============================================================================

type CheckoutStep = 1 | 2 | 3;

interface TravelerInfo {
  id: string;
  type: 'adult' | 'child';
  title: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
}

interface PaymentInfo {
  cardNumber: string;
  expiry: string;
  cvv: string;
  name: string;
  billingAddress: string;
  billingCity: string;
  billingZip: string;
  billingCountry: string;
}

// ============================================================================
// MAIN PAGE
// ============================================================================

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<CheckoutStep>(1);
  const [journey, setJourney] = useState<Journey | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [travelers, setTravelers] = useState<TravelerInfo[]>([]);
  const [payment, setPayment] = useState<PaymentInfo>({
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: '',
    billingAddress: '',
    billingCity: '',
    billingZip: '',
    billingCountry: 'US',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    discountAmount: number;
  } | null>(null);

  // Load journey from sessionStorage
  useEffect(() => {
    const storedJourney = sessionStorage.getItem('journey_checkout');
    if (storedJourney) {
      const parsed = JSON.parse(storedJourney) as Journey;
      setJourney(parsed);

      // Initialize travelers
      const totalTravelers = parsed.travelers.adults + parsed.travelers.children;
      const initialTravelers: TravelerInfo[] = [];

      for (let i = 0; i < parsed.travelers.adults; i++) {
        initialTravelers.push({
          id: `adult-${i}`,
          type: 'adult',
          title: 'Mr',
          firstName: '',
          lastName: '',
          email: i === 0 ? '' : undefined,
          phone: i === 0 ? '' : undefined,
        });
      }

      for (let i = 0; i < parsed.travelers.children; i++) {
        initialTravelers.push({
          id: `child-${i}`,
          type: 'child',
          title: '',
          firstName: '',
          lastName: '',
          dateOfBirth: '',
        });
      }

      setTravelers(initialTravelers);
    } else {
      setError('No journey data found. Please return to journey builder.');
    }
    setLoading(false);
  }, []);

  // Update traveler
  const updateTraveler = (id: string, field: string, value: string) => {
    setTravelers(prev =>
      prev.map(t => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  // Validate step
  const canProceed = (currentStep: CheckoutStep): boolean => {
    if (currentStep === 1) {
      return travelers.every(t => t.firstName && t.lastName);
    }
    if (currentStep === 2) {
      return payment.cardNumber.length >= 15 &&
        payment.expiry.length >= 4 &&
        payment.cvv.length >= 3 &&
        payment.name.length > 0;
    }
    return agreedToTerms;
  };

  // Handle checkout
  const handleCheckout = async () => {
    if (!journey || !agreedToTerms) return;

    setProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Store confirmation data
      const confirmation = {
        id: `JRN-${Date.now().toString(36).toUpperCase()}`,
        journey,
        travelers,
        bookedAt: new Date().toISOString(),
      };
      sessionStorage.setItem('journey_confirmation', JSON.stringify(confirmation));

      // Navigate to confirmation
      router.push('/journey/confirmation');
    } catch (err) {
      setError('Failed to process booking. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#D63A35]" />
      </div>
    );
  }

  if (error || !journey) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-4">{error || 'Journey data not found'}</p>
        <Link
          href="/journey"
          className="px-6 py-3 bg-[#D63A35] text-white rounded-xl font-medium hover:bg-[#C7342F] transition-colors"
        >
          Return to Journey Builder
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">Secure Checkout</span>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            {[
              { num: 1, label: 'Travelers' },
              { num: 2, label: 'Payment' },
              { num: 3, label: 'Confirm' },
            ].map((s, i) => (
              <React.Fragment key={s.num}>
                {i > 0 && <div className="w-8 sm:w-16 h-0.5 bg-gray-200" />}
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      step > s.num
                        ? 'bg-green-500 text-white'
                        : step === s.num
                        ? 'bg-[#D63A35] text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span className={`hidden sm:inline text-sm ${step >= s.num ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                    {s.label}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left: Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Traveler Details */}
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                  <User className="w-5 h-5 text-[#D63A35]" />
                  <h2 className="font-semibold text-gray-900">Traveler Details</h2>
                </div>

                <div className="p-5 space-y-6">
                  {travelers.map((traveler, idx) => (
                    <div key={traveler.id} className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          {traveler.type === 'adult' ? `Adult ${idx + 1}` : `Child ${idx - journey.travelers.adults + 1}`}
                        </span>
                        {idx === 0 && (
                          <span className="text-xs bg-[#D63A35] text-white px-2 py-0.5 rounded-full">
                            Primary Contact
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {traveler.type === 'adult' && (
                          <select
                            value={traveler.title}
                            onChange={(e) => updateTraveler(traveler.id, 'title', e.target.value)}
                            className="h-12 px-4 rounded-xl border border-gray-200 focus:border-[#D63A35] focus:ring-2 focus:ring-[#D63A35]/20 outline-none"
                          >
                            <option value="Mr">Mr</option>
                            <option value="Ms">Ms</option>
                            <option value="Mrs">Mrs</option>
                            <option value="Dr">Dr</option>
                          </select>
                        )}
                        <input
                          type="text"
                          placeholder="First Name"
                          value={traveler.firstName}
                          onChange={(e) => updateTraveler(traveler.id, 'firstName', e.target.value)}
                          className="h-12 px-4 rounded-xl border border-gray-200 focus:border-[#D63A35] focus:ring-2 focus:ring-[#D63A35]/20 outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Last Name"
                          value={traveler.lastName}
                          onChange={(e) => updateTraveler(traveler.id, 'lastName', e.target.value)}
                          className="h-12 px-4 rounded-xl border border-gray-200 focus:border-[#D63A35] focus:ring-2 focus:ring-[#D63A35]/20 outline-none"
                        />
                      </div>

                      {idx === 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <input
                            type="email"
                            placeholder="Email Address"
                            value={traveler.email || ''}
                            onChange={(e) => updateTraveler(traveler.id, 'email', e.target.value)}
                            className="h-12 px-4 rounded-xl border border-gray-200 focus:border-[#D63A35] focus:ring-2 focus:ring-[#D63A35]/20 outline-none"
                          />
                          <input
                            type="tel"
                            placeholder="Phone Number"
                            value={traveler.phone || ''}
                            onChange={(e) => updateTraveler(traveler.id, 'phone', e.target.value)}
                            className="h-12 px-4 rounded-xl border border-gray-200 focus:border-[#D63A35] focus:ring-2 focus:ring-[#D63A35]/20 outline-none"
                          />
                        </div>
                      )}

                      {idx < travelers.length - 1 && <hr className="border-gray-100" />}
                    </div>
                  ))}
                </div>

                <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!canProceed(1)}
                    className="w-full h-12 bg-[#D63A35] text-white font-semibold rounded-xl hover:bg-[#C7342F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-[#D63A35]" />
                  <h2 className="font-semibold text-gray-900">Payment Details</h2>
                </div>

                <div className="p-5 space-y-4">
                  <input
                    type="text"
                    placeholder="Card Number"
                    value={payment.cardNumber}
                    onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#D63A35] focus:ring-2 focus:ring-[#D63A35]/20 outline-none"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={payment.expiry}
                      onChange={(e) => setPayment({ ...payment, expiry: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      className="h-12 px-4 rounded-xl border border-gray-200 focus:border-[#D63A35] focus:ring-2 focus:ring-[#D63A35]/20 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="CVV"
                      value={payment.cvv}
                      onChange={(e) => setPayment({ ...payment, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      className="h-12 px-4 rounded-xl border border-gray-200 focus:border-[#D63A35] focus:ring-2 focus:ring-[#D63A35]/20 outline-none"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Name on Card"
                    value={payment.name}
                    onChange={(e) => setPayment({ ...payment, name: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#D63A35] focus:ring-2 focus:ring-[#D63A35]/20 outline-none"
                  />

                  <hr className="border-gray-100 my-4" />

                  <h3 className="text-sm font-medium text-gray-700">Billing Address</h3>

                  <input
                    type="text"
                    placeholder="Street Address"
                    value={payment.billingAddress}
                    onChange={(e) => setPayment({ ...payment, billingAddress: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#D63A35] focus:ring-2 focus:ring-[#D63A35]/20 outline-none"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="City"
                      value={payment.billingCity}
                      onChange={(e) => setPayment({ ...payment, billingCity: e.target.value })}
                      className="h-12 px-4 rounded-xl border border-gray-200 focus:border-[#D63A35] focus:ring-2 focus:ring-[#D63A35]/20 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      value={payment.billingZip}
                      onChange={(e) => setPayment({ ...payment, billingZip: e.target.value })}
                      className="h-12 px-4 rounded-xl border border-gray-200 focus:border-[#D63A35] focus:ring-2 focus:ring-[#D63A35]/20 outline-none"
                    />
                  </div>
                </div>

                <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 h-12 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!canProceed(2)}
                    className="flex-1 h-12 bg-[#D63A35] text-white font-semibold rounded-xl hover:bg-[#C7342F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Review Booking
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Journey Summary */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">Journey Summary</h2>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#D63A35]/10 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-[#D63A35]" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {journey.origin.code} → {journey.destination.code}
                        </p>
                        <p className="text-sm text-gray-500">
                          {journey.duration} days • {journey.travelers.adults + journey.travelers.children} travelers
                        </p>
                      </div>
                    </div>

                    {journey.pricing.flights.subtotal > 0 && (
                      <div className="flex items-center justify-between py-2 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <Plane className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Flights</span>
                        </div>
                        <span className="font-medium">
                          {PricingAggregator.formatPrice(journey.pricing.flights.subtotal, journey.pricing.currency)}
                        </span>
                      </div>
                    )}

                    {journey.pricing.hotels.subtotal > 0 && (
                      <div className="flex items-center justify-between py-2 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Hotels</span>
                        </div>
                        <span className="font-medium">
                          {PricingAggregator.formatPrice(journey.pricing.hotels.subtotal, journey.pricing.currency)}
                        </span>
                      </div>
                    )}

                    {journey.pricing.experiences.subtotal > 0 && (
                      <div className="flex items-center justify-between py-2 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Experiences</span>
                        </div>
                        <span className="font-medium">
                          {PricingAggregator.formatPrice(journey.pricing.experiences.subtotal, journey.pricing.currency)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Terms */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded border-gray-300 text-[#D63A35] focus:ring-[#D63A35]"
                    />
                    <span className="text-sm text-gray-600">
                      I agree to the{' '}
                      <a href="/terms" className="text-[#D63A35] underline">Terms of Service</a>
                      {' '}and{' '}
                      <a href="/privacy" className="text-[#D63A35] underline">Privacy Policy</a>.
                      I understand that my booking is subject to availability.
                    </span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 h-12 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={!agreedToTerms || processing}
                    className="flex-1 h-12 bg-gradient-to-r from-[#D63A35] to-[#C7342F] text-white font-semibold rounded-xl shadow-lg shadow-red-200 hover:from-[#C7342F] hover:to-[#B12F2B] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Complete Booking • {PricingAggregator.formatPrice(journey.pricing.total, journey.pricing.currency)}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Price Summary (Desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-24 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Price Summary</h3>
              </div>

              <div className="p-5 space-y-3">
                {journey.pricing.flights.subtotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Flights</span>
                    <span>{PricingAggregator.formatPrice(journey.pricing.flights.subtotal, journey.pricing.currency)}</span>
                  </div>
                )}

                {journey.pricing.hotels.subtotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Hotels</span>
                    <span>{PricingAggregator.formatPrice(journey.pricing.hotels.subtotal, journey.pricing.currency)}</span>
                  </div>
                )}

                {journey.pricing.experiences.subtotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Experiences</span>
                    <span>{PricingAggregator.formatPrice(journey.pricing.experiences.subtotal, journey.pricing.currency)}</span>
                  </div>
                )}

                <hr className="border-gray-100" />

                {/* Promo Code Section */}
                <PromoCodeSection
                  totalPrice={journey.pricing.total}
                  currency={journey.pricing.currency}
                  productType="all"
                  onApply={(code, discount) => setAppliedDiscount(discount)}
                  onRemove={() => setAppliedDiscount(null)}
                  appliedDiscount={appliedDiscount}
                />

                {/* Discount line */}
                {appliedDiscount && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({appliedDiscount.code})</span>
                    <span>-{PricingAggregator.formatPrice(appliedDiscount.discountAmount, journey.pricing.currency)}</span>
                  </div>
                )}

                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-[#D63A35]">
                    {PricingAggregator.formatPrice(
                      journey.pricing.total - (appliedDiscount?.discountAmount || 0),
                      journey.pricing.currency
                    )}
                  </span>
                </div>

                {journey.pricing.savings && journey.pricing.savings.amount > 0 && (
                  <div className="mt-3 p-3 bg-green-50 rounded-xl">
                    <p className="text-sm text-green-700 font-medium">
                      You save {PricingAggregator.formatPrice(
                        journey.pricing.savings.amount + (appliedDiscount?.discountAmount || 0),
                        journey.pricing.currency
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Trust badges */}
              <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Secure SSL encryption</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Best price guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Price Footer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 safe-area-bottom">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              Total {appliedDiscount && <span className="text-green-600">(-{appliedDiscount.code})</span>}
            </p>
            <p className="text-xl font-bold text-gray-900">
              {PricingAggregator.formatPrice(
                journey.pricing.total - (appliedDiscount?.discountAmount || 0),
                journey.pricing.currency
              )}
            </p>
          </div>
          {step === 3 && (
            <button
              onClick={handleCheckout}
              disabled={!agreedToTerms || processing}
              className="h-12 px-6 bg-[#D63A35] text-white font-semibold rounded-xl disabled:opacity-50"
            >
              {processing ? 'Processing...' : 'Complete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JourneyCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#D63A35]" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
