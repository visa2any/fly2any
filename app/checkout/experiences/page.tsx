'use client';

/**
 * Unified Experiences Checkout Page
 * Multi-item cart checkout for Tours, Activities, and Transfers
 * Level 6 Ultra-Premium Design
 */

import { useState, useCallback, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft, Calendar, Users, Clock, MapPin, Shield, CreditCard,
  Loader2, CheckCircle, ChevronDown, ChevronUp, Trash2, AlertCircle,
  Download, Share2, Mail, Phone, User, Sparkles
} from 'lucide-react';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { useExperiencesCart, typeIcons, typeColors, ExperienceType, CartItem } from '@/lib/cart/experiences-cart';
import { BookingSteps, inputStyles, labelStyles, buttonStyles } from '@/components/shared/BookingSteps';

function ExperiencesCheckoutContent() {
  const router = useRouter();
  const { items, total, currency, clearCart, removeItem, itemCount } = useExperiencesCart();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [confirmationId, setConfirmationId] = useState('');
  const [confirmations, setConfirmations] = useState<Array<{ id: string; name: string; type: string }>>([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
  });

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    try {
      // Submit batch reservation
      const res = await fetch('/api/reservations/experiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            type: item.type,
            productId: item.productId,
            name: item.name,
            date: item.date,
            time: item.time,
            participants: item.participants,
            totalPrice: item.totalPrice,
            currency: item.currency,
            location: item.location,
            duration: item.duration,
            bookingLink: item.bookingLink,
          })),
          customer: formData,
          total,
          currency,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setConfirmationId(data.orderId || `EXP-${Date.now().toString(36).toUpperCase()}`);
        setConfirmations(data.reservations || items.map(item => ({
          id: `${item.type.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
          name: item.name,
          type: item.type,
        })));
        clearCart();
        setStep(3);
      } else {
        alert(data.message || 'Booking failed. Please try again.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [items, formData, total, currency, clearCart]);

  // Empty cart state
  if (items.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center max-w-md px-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🛒</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your Trip is Empty</h2>
          <p className="text-gray-500 mb-6">
            Add tours, activities, or transfers to start planning your perfect trip!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/tours')}
              className="px-6 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors"
            >
              Browse Tours
            </button>
            <button
              onClick={() => router.push('/activities')}
              className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors"
            >
              Browse Activities
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100/80 shadow-sm">
        <MaxWidthContainer>
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-2.5 rounded-xl hover:bg-gray-100/80 transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Checkout</h1>
                <p className="text-xs text-gray-500">{itemCount} {itemCount === 1 ? 'item' : 'items'} in your trip</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Shield className="w-4 h-4 text-green-600" />
              <span>256-bit SSL</span>
            </div>
          </div>
        </MaxWidthContainer>
      </div>

      {/* Progress Steps */}
      <MaxWidthContainer>
        <BookingSteps currentStep={step} accentColor="primary" labels={['Review Trip', 'Payment', 'Confirmed']} />
      </MaxWidthContainer>

      <MaxWidthContainer>
        <div className="pb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Review Items & Guest Details */}
            {step === 1 && (
              <>
                {/* Cart Items */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100/50">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Your Trip Items</h2>
                  <div className="space-y-3">
                    {items.map((item) => {
                      const colors = typeColors[item.type as ExperienceType];
                      const isExpanded = expandedItem === item.id;

                      return (
                        <div key={item.id} className={`rounded-xl border ${colors.border} overflow-hidden`}>
                          <div className="flex items-center gap-3 p-3">
                            {/* Image/Icon */}
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              {item.image ? (
                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                              ) : (
                                <div className={`w-full h-full ${colors.bg} flex items-center justify-center text-2xl`}>
                                  {typeIcons[item.type as ExperienceType]}
                                </div>
                              )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <span className={`text-xs font-semibold ${colors.text}`}>
                                    {typeIcons[item.type as ExperienceType]} {item.type}
                                  </span>
                                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
                                </div>
                                <p className="text-sm font-bold text-gray-900 ml-2">{formatPrice(item.totalPrice)}</p>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(item.date)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {item.participants.adults + item.participants.children} pax
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {isExpanded && (
                            <div className="px-3 pb-3 pt-0 text-xs text-gray-500 border-t border-gray-100">
                              <div className="grid grid-cols-2 gap-2 pt-2">
                                {item.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {item.location}
                                  </div>
                                )}
                                {item.time && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {item.time}
                                  </div>
                                )}
                                {item.duration && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {item.duration}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Guest Details */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100/50">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Guest Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelStyles}>
                        <User className="w-4 h-4 inline mr-1" />
                        First Name
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className={`${inputStyles.base} ${inputStyles.primary}`}
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <label className={labelStyles}>
                        <User className="w-4 h-4 inline mr-1" />
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className={`${inputStyles.base} ${inputStyles.primary}`}
                        placeholder="Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className={labelStyles}>
                        <Mail className="w-4 h-4 inline mr-1" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`${inputStyles.base} ${inputStyles.primary}`}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className={labelStyles}>
                        <Phone className="w-4 h-4 inline mr-1" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`${inputStyles.base} ${inputStyles.primary}`}
                        placeholder="+1 (555) 000-0000"
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-5">
                    <label className={labelStyles}>Special Requests <span className="text-gray-400 font-normal">(Optional)</span></label>
                    <textarea
                      value={formData.specialRequests}
                      onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                      className={`${inputStyles.base} ${inputStyles.primary}`}
                      rows={3}
                      placeholder="Any dietary requirements, mobility needs, or special requests..."
                    />
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    disabled={!formData.firstName || !formData.email || !formData.phone}
                    className={`${buttonStyles.base} ${buttonStyles.primary.red} mt-6`}
                  >
                    Continue to Payment
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100/50">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Information</h2>
                <div className="bg-gradient-to-r from-primary-50 to-red-50 border border-primary-100 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 text-primary-700">
                    <Shield className="w-5 h-5" />
                    <span className="font-semibold">Secure & Encrypted</span>
                  </div>
                  <p className="text-sm text-primary-600/80 mt-1">Your payment details are protected with bank-level security</p>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className={labelStyles}>Card Number</label>
                    <input type="text" placeholder="1234 5678 9012 3456" className={`${inputStyles.base} ${inputStyles.primary}`} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelStyles}>Expiry Date</label>
                      <input type="text" placeholder="MM / YY" className={`${inputStyles.base} ${inputStyles.primary}`} />
                    </div>
                    <div>
                      <label className={labelStyles}>Security Code</label>
                      <input type="text" placeholder="CVV" className={`${inputStyles.base} ${inputStyles.primary}`} />
                    </div>
                  </div>
                  <div>
                    <label className={labelStyles}>Name on Card</label>
                    <input type="text" placeholder="JOHN DOE" className={`${inputStyles.base} ${inputStyles.primary}`} />
                  </div>
                </div>

                {/* Manual Ticketing Notice */}
                <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200/50">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-amber-800 mb-1">Pending Confirmation</h3>
                      <p className="text-sm text-amber-700">
                        Your bookings will be confirmed within 24 hours. You'll receive separate confirmation emails for each item in your trip.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(1)} className="px-6 py-3.5 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`flex-1 ${buttonStyles.base} ${buttonStyles.primary.red}`}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                    {loading ? 'Processing...' : `Pay ${formatPrice(total)}`}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100/50 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Trip Booked!</h2>
                <p className="text-gray-500 mb-1">Order #{confirmationId}</p>
                <p className="text-gray-600 mb-6">
                  Check your email at <span className="font-medium">{formData.email}</span> for your vouchers.
                </p>

                {/* Bookings Summary */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                  <h3 className="font-semibold text-gray-900 mb-3">Your Bookings</h3>
                  <div className="space-y-2">
                    {confirmations.map((conf, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-2">
                          <span>{typeIcons[conf.type as ExperienceType]}</span>
                          <span className="text-sm text-gray-900">{conf.name}</span>
                        </div>
                        <span className="text-xs font-mono text-gray-500">#{conf.id}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 justify-center mb-6">
                  <button className="px-5 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" /> Vouchers
                  </button>
                  <button className="px-5 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                </div>

                <button onClick={() => router.push('/')} className={`${buttonStyles.base} ${buttonStyles.primary.red}`}>
                  Back to Home
                </button>
              </div>
            )}
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100/50 overflow-hidden sticky top-24">
              <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h3 className="font-bold text-gray-900">Order Summary</h3>
              </div>
              <div className="p-5 space-y-4">
                {/* Items Summary */}
                <div className="space-y-3">
                  {(step === 3 ? confirmations : items).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span>{typeIcons[(item as any).type as ExperienceType]}</span>
                        <span className="text-gray-600 line-clamp-1">{(item as any).name}</span>
                      </div>
                      {step !== 3 && (
                        <span className="font-medium text-gray-900">{formatPrice((item as CartItem).totalPrice)}</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4">
                  {/* Multi-item discount notice */}
                  {items.length > 1 && step !== 3 && (
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg mb-3">
                      <Sparkles className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-green-700 font-medium">Multi-booking discount applied!</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-primary-600">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    Free cancellation
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-blue-500" />
                    Best price guarantee
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MaxWidthContainer>
    </div>
  );
}

export default function ExperiencesCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    }>
      <ExperiencesCheckoutContent />
    </Suspense>
  );
}
