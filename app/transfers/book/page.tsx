'use client';

import { useState, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { ArrowLeft, Users, Clock, Shield, CreditCard, Loader2, CheckCircle, MapPin, Navigation, Calendar, Download, Share2 } from 'lucide-react';
import { BookingSteps, inputStyles, labelStyles, buttonStyles } from '@/components/shared/BookingSteps';

function TransferBookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [confirmationId, setConfirmationId] = useState('');

  const transferId = searchParams.get('id') || '';
  const transferType = searchParams.get('type') || '';
  const transferName = searchParams.get('name') || 'Transfer';
  const price = parseFloat(searchParams.get('price') || '0');
  const pickup = searchParams.get('pickup') || '';
  const dropoff = searchParams.get('dropoff') || '';
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';
  const passengers = parseInt(searchParams.get('passengers') || '1');
  const duration = searchParams.get('duration') || '';
  const cancellation = searchParams.get('cancellation') || '';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    flightNumber: '',
    notes: '',
  });

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reservations/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'transfer',
          transferId,
          transferType,
          transferName,
          price,
          pickup,
          dropoff,
          date,
          time,
          passengers,
          ...formData,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setConfirmationId(data.id || `TF-${Date.now().toString(36).toUpperCase()}`);
        setStep(3);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [transferId, transferType, transferName, price, pickup, dropoff, date, time, passengers, formData]);

  // Teal color styles for transfers
  const tealInputStyles = `${inputStyles.base} focus:ring-teal-500`;
  const tealButtonStyles = 'w-full py-3.5 text-white font-semibold rounded-xl shadow-sm transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700';

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100/80 shadow-sm">
        <MaxWidthContainer>
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-2.5 rounded-xl hover:bg-gray-100/80 transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Book Transfer</h1>
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
        <div className="flex items-center justify-center gap-2 py-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                step > s ? 'bg-teal-500 text-white' : step === s ? 'bg-teal-600 text-white ring-4 ring-teal-200 scale-110' : 'bg-gray-100 text-gray-400'
              }`}>
                {step > s ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 mx-2 ${step > s ? 'bg-teal-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      </MaxWidthContainer>

      <MaxWidthContainer>
        <div className="pb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Passenger Details */}
            {step === 1 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100/50">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Passenger Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelStyles}>First Name</label>
                    <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className={tealInputStyles} placeholder="John" required />
                  </div>
                  <div>
                    <label className={labelStyles}>Last Name</label>
                    <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className={tealInputStyles} placeholder="Doe" required />
                  </div>
                  <div>
                    <label className={labelStyles}>Email Address</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={tealInputStyles} placeholder="john@example.com" required />
                  </div>
                  <div>
                    <label className={labelStyles}>Phone Number</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={tealInputStyles} placeholder="+1 (555) 000-0000" required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelStyles}>Flight Number <span className="text-gray-400 font-normal">(for airport pickups)</span></label>
                    <input type="text" value={formData.flightNumber} onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value })} className={tealInputStyles} placeholder="e.g., AA1234" />
                  </div>
                </div>
                <div className="mt-5">
                  <label className={labelStyles}>Special Requests <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={tealInputStyles} rows={3} placeholder="Child seats, extra luggage, wheelchair access..." />
                </div>
                <button onClick={() => setStep(2)} disabled={!formData.firstName || !formData.email || !formData.phone} className={`${tealButtonStyles} mt-6`}>
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100/50">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Information</h2>
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 text-teal-700">
                    <Shield className="w-5 h-5" />
                    <span className="font-semibold">Secure & Encrypted</span>
                  </div>
                  <p className="text-sm text-teal-600/80 mt-1">Your payment details are protected with bank-level security</p>
                </div>
                <div className="space-y-5">
                  <div><label className={labelStyles}>Card Number</label><input type="text" placeholder="1234 5678 9012 3456" className={tealInputStyles} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelStyles}>Expiry Date</label><input type="text" placeholder="MM / YY" className={tealInputStyles} /></div>
                    <div><label className={labelStyles}>Security Code</label><input type="text" placeholder="CVV" className={tealInputStyles} /></div>
                  </div>
                  <div><label className={labelStyles}>Name on Card</label><input type="text" placeholder="JOHN DOE" className={tealInputStyles} /></div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(1)} className="px-6 py-3.5 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Back</button>
                  <button onClick={handleSubmit} disabled={loading} className={`flex-1 ${tealButtonStyles}`}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                    {loading ? 'Processing...' : `Pay $${price.toFixed(0)}`}
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                <p className="text-gray-500 mb-1">Confirmation #{confirmationId}</p>
                <p className="text-gray-600 mb-6">Your driver details will be sent to <span className="font-medium">{formData.email}</span></p>

                <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">Transfer</span><p className="font-semibold text-gray-900">{transferName}</p></div>
                    <div><span className="text-gray-500">Date & Time</span><p className="font-semibold text-gray-900">{date} at {time}</p></div>
                    <div><span className="text-gray-500">Route</span><p className="font-semibold text-gray-900 truncate">{pickup} → {dropoff}</p></div>
                    <div><span className="text-gray-500">Total Paid</span><p className="font-semibold text-teal-600">${price.toFixed(0)}</p></div>
                  </div>
                </div>

                <div className="flex gap-3 justify-center">
                  <button className="px-5 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"><Download className="w-4 h-4" /> Voucher</button>
                  <button className="px-5 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"><Share2 className="w-4 h-4" /> Share</button>
                </div>
                <button onClick={() => router.push('/')} className={`${tealButtonStyles} mt-6`}>Back to Home</button>
              </div>
            )}
          </div>

          {/* Sidebar - Transfer Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100/50 overflow-hidden sticky top-24">
              <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-5 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-xl">🚗</div>
                  <div>
                    <h3 className="font-bold">{transferName}</h3>
                    <p className="text-teal-100 text-sm">{duration} ride</p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-teal-600 mt-0.5" />
                    <div><span className="text-gray-500">Pickup</span><p className="font-medium text-gray-900">{pickup}</p></div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Navigation className="w-4 h-4 text-teal-600 mt-0.5" />
                    <div><span className="text-gray-500">Dropoff</span><p className="font-medium text-gray-900">{dropoff}</p></div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-teal-600 mt-0.5" />
                    <div><span className="text-gray-500">Date & Time</span><p className="font-medium text-gray-900">{date} at {time}</p></div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-4 h-4 text-teal-600 mt-0.5" />
                    <div><span className="text-gray-500">Passengers</span><p className="font-medium text-gray-900">{passengers}</p></div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mt-4 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-teal-600">${price.toFixed(0)}</span>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-green-500" />{cancellation}</div>
                  <div className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-blue-500" />Flight tracking</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MaxWidthContainer>
    </div>
  );
}

export default function TransferBookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50/50 to-white"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>}>
      <TransferBookingContent />
    </Suspense>
  );
}
