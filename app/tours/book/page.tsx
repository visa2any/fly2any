'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { ArrowLeft, Users, Clock, Shield, CreditCard, Loader2, CheckCircle } from 'lucide-react';

function TourBookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Get tour data from URL params
  const tourId = searchParams.get('id') || '';
  const tourName = decodeURIComponent(searchParams.get('name') || 'Tour');
  const price = parseFloat(searchParams.get('price') || '0');
  const img = decodeURIComponent(searchParams.get('img') || '');
  const duration = searchParams.get('duration') || '3h';
  const bookingLink = decodeURIComponent(searchParams.get('link') || '');

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    date: '',
    travelers: 1,
    notes: '',
  });

  const totalPrice = price * formData.travelers;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reservations/tours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'tour',
          tourId,
          tourName,
          pricePerPerson: price,
          totalPrice,
          bookingLink, // For admin operations
          ...formData,
        }),
      });
      if (res.ok) {
        setStep(3);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <MaxWidthContainer>
          <div className="py-3 flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Book Tour</h1>
              <p className="text-xs text-gray-500">Step {step} of 3</p>
            </div>
          </div>
        </MaxWidthContainer>
      </div>

      <MaxWidthContainer>
        <div className="py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Traveler Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tour Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Travelers</label>
                    <select
                      value={formData.travelers}
                      onChange={(e) => setFormData({ ...formData, travelers: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests (Optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
                <button
                  onClick={() => setStep(2)}
                  disabled={!formData.firstName || !formData.email || !formData.date}
                  className="w-full mt-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Payment</h2>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-orange-700">
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">Secure Payment</span>
                  </div>
                  <p className="text-sm text-orange-600 mt-1">Your payment info is protected</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <input type="text" placeholder="1234 5678 9012 3456" className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                      <input type="text" placeholder="MM/YY" className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                      <input type="text" placeholder="123" className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(1)} className="px-6 py-3 border border-gray-200 rounded-lg font-medium hover:bg-gray-50">
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                    {loading ? 'Processing...' : `Pay $${totalPrice.toFixed(0)}`}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                <p className="text-gray-600 mb-6">Your tour has been booked. Check your email for confirmation.</p>
                <button onClick={() => router.push('/tours')} className="px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700">
                  Book Another Tour
                </button>
              </div>
            )}
          </div>

          {/* Sidebar - Tour Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 sticky top-20">
              {img && (
                <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
                  <Image src={img} alt={tourName} fill className="object-cover" unoptimized />
                </div>
              )}
              <h3 className="font-bold text-gray-900 mb-2">{tourName}</h3>
              <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{duration}</span>
                <span className="flex items-center gap-1"><Users className="w-4 h-4" />{formData.travelers}</span>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">${price.toFixed(0)} x {formData.travelers}</span>
                  <span className="text-gray-900">${totalPrice.toFixed(0)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-orange-600">${totalPrice.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MaxWidthContainer>
    </div>
  );
}

export default function TourBookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>}>
      <TourBookingContent />
    </Suspense>
  );
}
