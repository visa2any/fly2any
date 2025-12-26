'use client';

import { useState, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { ArrowLeft, Users, Clock, Shield, CreditCard, Loader2, CheckCircle, Star, Calendar, Download, Share2 } from 'lucide-react';
import { BookingSteps, inputStyles, labelStyles, buttonStyles } from '@/components/shared/BookingSteps';
import { ExperienceConfirmation } from '@/components/booking/ExperienceConfirmation';

function ActivityBookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [confirmationId, setConfirmationId] = useState('');

  const activityId = searchParams.get('id') || '';
  const activityName = decodeURIComponent(searchParams.get('name') || 'Activity');
  const price = parseFloat(searchParams.get('price') || '0');
  const img = decodeURIComponent(searchParams.get('img') || '');
  const duration = searchParams.get('duration') || '2h';
  const bookingLink = decodeURIComponent(searchParams.get('link') || '');

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

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reservations/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'activity',
          activityId,
          activityName,
          pricePerPerson: price,
          totalPrice,
          bookingLink,
          ...formData,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setConfirmationId(data.id || `AC-${Date.now().toString(36).toUpperCase()}`);
        setStep(3);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activityId, activityName, price, totalPrice, bookingLink, formData]);

  // Step 3: Premium Full-Page Confirmation
  if (step === 3) {
    return (
      <ExperienceConfirmation
        type="activity"
        confirmationId={confirmationId}
        productName={activityName}
        productImage={img}
        duration={duration}
        rating={4.7}
        date={formData.date}
        participants={formData.travelers}
        customerName={`${formData.firstName} ${formData.lastName}`}
        customerEmail={formData.email}
        customerPhone={formData.phone}
        specialRequests={formData.notes}
        pricePerPerson={price}
        totalPrice={totalPrice}
        currency="USD"
        cancellable={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white">
      {/* Header - Apple Level 6 */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100/80 shadow-sm">
        <MaxWidthContainer>
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-2.5 rounded-xl hover:bg-gray-100/80 transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Book Activity</h1>
                <p className="text-xs text-gray-500">Secure checkout</p>
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
        <BookingSteps currentStep={step} accentColor="purple" labels={['Details', 'Payment', 'Confirmed']} />
      </MaxWidthContainer>

      <MaxWidthContainer>
        <div className="pb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Traveler Details */}
            {step === 1 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100/50">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Participant Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelStyles}>First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className={`${inputStyles.base} ${inputStyles.purple}`}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelStyles}>Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className={`${inputStyles.base} ${inputStyles.purple}`}
                      placeholder="Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelStyles}>Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`${inputStyles.base} ${inputStyles.purple}`}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelStyles}>Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`${inputStyles.base} ${inputStyles.purple}`}
                      placeholder="+1 (555) 000-0000"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelStyles}>Activity Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className={`${inputStyles.base} ${inputStyles.purple}`}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelStyles}>Number of Participants</label>
                    <select
                      value={formData.travelers}
                      onChange={(e) => setFormData({ ...formData, travelers: parseInt(e.target.value) })}
                      className={`${inputStyles.base} ${inputStyles.purple}`}
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-5">
                  <label className={labelStyles}>Special Requests <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className={`${inputStyles.base} ${inputStyles.purple}`}
                    rows={3}
                    placeholder="Any accessibility needs, equipment requirements, or special requests..."
                  />
                </div>
                <button
                  onClick={() => setStep(2)}
                  disabled={!formData.firstName || !formData.email || !formData.date}
                  className={`${buttonStyles.base} ${buttonStyles.primary.purple} mt-6`}
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100/50">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Information</h2>
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-100 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 text-purple-700">
                    <Shield className="w-5 h-5" />
                    <span className="font-semibold">Secure & Encrypted</span>
                  </div>
                  <p className="text-sm text-purple-600/80 mt-1">Your payment details are protected with bank-level security</p>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className={labelStyles}>Card Number</label>
                    <input type="text" placeholder="1234 5678 9012 3456" className={`${inputStyles.base} ${inputStyles.purple}`} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelStyles}>Expiry Date</label>
                      <input type="text" placeholder="MM / YY" className={`${inputStyles.base} ${inputStyles.purple}`} />
                    </div>
                    <div>
                      <label className={labelStyles}>Security Code</label>
                      <input type="text" placeholder="CVV" className={`${inputStyles.base} ${inputStyles.purple}`} />
                    </div>
                  </div>
                  <div>
                    <label className={labelStyles}>Name on Card</label>
                    <input type="text" placeholder="JOHN DOE" className={`${inputStyles.base} ${inputStyles.purple}`} />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(1)} className="px-6 py-3.5 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`flex-1 ${buttonStyles.base} ${buttonStyles.primary.purple}`}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                    {loading ? 'Processing...' : `Pay $${totalPrice.toFixed(0)}`}
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Sidebar - Activity Summary - Apple Level 6 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100/50 overflow-hidden sticky top-24">
              {img && (
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image src={img} alt={activityName} fill className="object-cover" unoptimized />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
              )}
              <div className="p-5">
                <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{activityName}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{duration}</span>
                  <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400 text-amber-400" />4.7</span>
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">${price.toFixed(0)} x {formData.travelers} participant{formData.travelers > 1 ? 's' : ''}</span>
                    <span className="text-gray-900 font-medium">${totalPrice.toFixed(0)}</span>
                  </div>
                  {formData.date && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(formData.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-purple-600">${totalPrice.toFixed(0)}</span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-green-500" />Free cancellation</div>
                  <div className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-blue-500" />Best price guarantee</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MaxWidthContainer>
    </div>
  );
}

export default function ActivityBookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50/50 to-white">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    }>
      <ActivityBookingContent />
    </Suspense>
  );
}
