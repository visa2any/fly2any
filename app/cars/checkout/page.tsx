'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car, Users, Fuel, Settings, MapPin, Calendar, Clock, Shield,
  CreditCard, User, Phone, Mail, CheckCircle, AlertCircle,
  ChevronRight, ChevronLeft, Loader2, Lock, ArrowLeft,
  Luggage, Info, ExternalLink, Navigation, FileText, ChevronDown
} from 'lucide-react';

// ===========================
// TYPES
// ===========================

interface LocationInfo {
  code?: string;
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  hours?: string;
  coordinates?: { lat: number; lng: number };
}

interface CarData {
  id: string;
  name: string;
  category: string;
  company: string;
  passengers: number;
  transmission: string;
  fuelType: string;
  pricePerDay: number;
  totalPrice?: number;
  image: string;
  features: string[];
  doors?: number;
  luggage?: number;
  rating?: number;
  reviewCount?: number;
  unlimited_mileage?: boolean;
  insurance_included?: boolean;
  airConditioning?: boolean;
  pickupLocationInfo?: LocationInfo;
  dropoffLocationInfo?: LocationInfo;
  mileage?: { unlimited?: boolean; included?: string; extraMileageCost?: string | null };
  insurance?: { included?: boolean; cdwIncluded?: boolean; theftProtection?: boolean; liabilityAmount?: string; deductible?: string; type?: string };
  fuelPolicy?: { type?: string; description?: string; fuelType?: string };
  driverRequirements?: { minimumAge?: number; youngDriverAge?: number; youngDriverFee?: string; licenseHeldYears?: number };
  cancellation?: { freeCancellationHours?: number; policy?: string; noShowFee?: string };
  additionalFees?: { additionalDriver?: string; gps?: string; childSeat?: string; tollPass?: string; oneWayFee?: string | null };
  termsAndConditions?: { depositRequired?: boolean; depositAmount?: string; depositCurrency?: string; depositType?: string; depositNote?: string; creditCardOnly?: boolean; debitCardAccepted?: boolean; inspectionRequired?: boolean; gracePeriodMinutes?: number; lateReturnFee?: string };
}

interface DriverInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  licenseNumber: string;
  licenseCountry: string;
  licenseExpiry: string;
}

interface PaymentInfo {
  cardNumber: string;
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

// Collapsible Section Component
function PolicySection({ title, icon: Icon, children, defaultOpen = false }: { title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-primary-600" />
          <span className="font-semibold text-slate-800">{title}</span>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-white">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ===========================
// MAIN COMPONENT
// ===========================

function CarCheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const carDataParam = searchParams.get('car');
  const pickupLocation = searchParams.get('pickup') || '';
  const dropoffLocation = searchParams.get('dropoff') || pickupLocation;
  const pickupDate = searchParams.get('pickupDate') || '';
  const dropoffDate = searchParams.get('dropoffDate') || '';
  const pickupTime = searchParams.get('pickupTime') || '10:00';
  const dropoffTime = searchParams.get('dropoffTime') || '10:00';

  const [car, setCar] = useState<CarData | null>(null);
  const [step, setStep] = useState(1); // 1=Driver, 2=Review, 3=Payment
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [driver, setDriver] = useState<DriverInfo>({
    firstName: '', lastName: '', email: '', phone: '',
    dateOfBirth: '', licenseNumber: '', licenseCountry: 'US', licenseExpiry: '',
  });

  const [payment, setPayment] = useState<PaymentInfo>({
    cardNumber: '', cardholderName: '', expiryMonth: '', expiryYear: '', cvv: '',
  });

  const rentalDays = pickupDate && dropoffDate
    ? Math.ceil((new Date(dropoffDate).getTime() - new Date(pickupDate).getTime()) / (1000 * 60 * 60 * 24)) : 1;

  useEffect(() => {
    if (carDataParam) {
      try { setCar(JSON.parse(decodeURIComponent(carDataParam))); }
      catch { setError('Invalid car data'); }
    }
  }, [carDataParam]);

  const basePrice = car ? car.pricePerDay * rentalDays : 0;
  const taxesAndFees = basePrice * 0.12;
  const totalPrice = Math.round((basePrice + taxesAndFees) * 100) / 100;

  const isDriverValid = driver.firstName && driver.lastName && driver.email && driver.phone &&
    driver.dateOfBirth && driver.licenseNumber && driver.licenseExpiry;

  const isPaymentValid = payment.cardNumber.length >= 15 && payment.cardholderName &&
    payment.expiryMonth && payment.expiryYear && payment.cvv.length >= 3;

  const handleSubmit = async () => {
    if (!car || !isDriverValid || !isPaymentValid || !acceptedTerms) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/cars/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          car, pickupLocation, dropoffLocation, pickupDate, dropoffDate, pickupTime, dropoffTime, driver,
          payment: { cardNumber: payment.cardNumber, cardholderName: payment.cardholderName },
          contactInfo: { email: driver.email, phone: driver.phone },
        }),
      });
      const data = await response.json();
      if (data.success) { setBookingRef(data.booking.bookingReference); setBookingComplete(true); }
      else { setError(data.message || 'Failed to create booking'); }
    } catch (err: any) { setError(err.message || 'An error occurred'); }
    finally { setIsSubmitting(false); }
  };

  if (!car) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
      </div>
    );
  }

  // Booking Complete
  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Booking Confirmed!</h1>
            <p className="text-slate-600 mb-6">Your car rental has been reserved successfully.</p>
            <div className="bg-slate-50 rounded-2xl p-6 mb-6">
              <p className="text-sm text-slate-500 mb-2">Booking Reference</p>
              <p className="text-2xl font-bold text-primary-600">{bookingRef}</p>
            </div>
            <div className="flex gap-4">
              <Link href="/account/bookings" className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700">View My Bookings</Link>
              <Link href="/" className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-200">Back to Home</Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24 lg:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft className="w-5 h-5" /></button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Secure Checkout</h1>
              <p className="text-sm text-slate-500">{car.name} · {rentalDays} day{rentalDays > 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2 md:gap-8">
            {[
              { num: 1, label: 'Driver Details' },
              { num: 2, label: 'Review & Accept' },
              { num: 3, label: 'Payment' },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${step >= s.num ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${step >= s.num ? 'text-slate-900' : 'text-slate-400'}`}>{s.label}</span>
                {i < 2 && <ChevronRight className="w-4 h-4 text-slate-300 hidden sm:block" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Forms (2 cols) */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* STEP 1: Driver Details */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><User className="w-5 h-5 text-primary-600" />Driver Information</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                      <input type="text" value={driver.firstName} onChange={(e) => setDriver({ ...driver, firstName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="John" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
                      <input type="text" value={driver.lastName} onChange={(e) => setDriver({ ...driver, lastName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                      <input type="email" value={driver.email} onChange={(e) => setDriver({ ...driver, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="john@example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                      <input type="tel" value={driver.phone} onChange={(e) => setDriver({ ...driver, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="+1 555 123 4567" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth *</label>
                      <div className="grid grid-cols-3 gap-2">
                        <select value={driver.dateOfBirth ? driver.dateOfBirth.split('-')[1] : ''} onChange={(e) => { const p = driver.dateOfBirth ? driver.dateOfBirth.split('-') : ['', '', '']; p[1] = e.target.value; setDriver({ ...driver, dateOfBirth: p.join('-') }); }} className="px-3 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 text-sm">
                          <option value="">Month</option>
                          {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m,i) => <option key={m} value={String(i+1).padStart(2,'0')}>{m}</option>)}
                        </select>
                        <select value={driver.dateOfBirth ? driver.dateOfBirth.split('-')[2] : ''} onChange={(e) => { const p = driver.dateOfBirth ? driver.dateOfBirth.split('-') : ['', '', '']; p[2] = e.target.value; setDriver({ ...driver, dateOfBirth: p.join('-') }); }} className="px-3 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 text-sm">
                          <option value="">Day</option>
                          {Array.from({ length: 31 }, (_, i) => <option key={i+1} value={String(i+1).padStart(2,'0')}>{i+1}</option>)}
                        </select>
                        <select value={driver.dateOfBirth ? driver.dateOfBirth.split('-')[0] : ''} onChange={(e) => { const p = driver.dateOfBirth ? driver.dateOfBirth.split('-') : ['', '', '']; p[0] = e.target.value; setDriver({ ...driver, dateOfBirth: p.join('-') }); }} className="px-3 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 text-sm">
                          <option value="">Year</option>
                          {Array.from({ length: 80 }, (_, i) => <option key={i} value={String(new Date().getFullYear() - 18 - i)}>{new Date().getFullYear() - 18 - i}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">License Country *</label>
                      <select value={driver.licenseCountry} onChange={(e) => setDriver({ ...driver, licenseCountry: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500">
                        <option value="US">United States</option><option value="CA">Canada</option><option value="GB">United Kingdom</option><option value="DE">Germany</option><option value="FR">France</option><option value="BR">Brazil</option><option value="MX">Mexico</option><option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">License Number *</label>
                      <input type="text" value={driver.licenseNumber} onChange={(e) => setDriver({ ...driver, licenseNumber: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500" placeholder="DL123456789" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">License Expiry *</label>
                      <input type="date" value={driver.licenseExpiry} onChange={(e) => setDriver({ ...driver, licenseExpiry: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500" />
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <button onClick={() => setStep(2)} disabled={!isDriverValid} className="px-8 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                      Continue <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Review Policies */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2"><FileText className="w-5 h-5 text-primary-600" />Rental Terms & Policies</h2>
                    <p className="text-sm text-slate-500 mb-6">Please review all policies before proceeding to payment.</p>

                    <div className="space-y-3">
                      {/* Pickup & Dropoff */}
                      <PolicySection title="Pickup & Drop-off Locations" icon={MapPin} defaultOpen={true}>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                            <p className="font-semibold text-green-900 mb-2">📍 Pickup</p>
                            <p className="text-sm text-green-800">{car.pickupLocationInfo?.name || `${pickupLocation} Airport`}</p>
                            <p className="text-xs text-green-700 mt-1">{car.pickupLocationInfo?.address || 'Car Rental Center'}</p>
                            <p className="text-xs text-green-600 mt-2">📞 {car.pickupLocationInfo?.phone || '+1 (800) 555-0123'}</p>
                            <p className="text-xs text-green-600">🕐 {car.pickupLocationInfo?.hours || '24/7'}</p>
                            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(car.pickupLocationInfo?.address || pickupLocation)}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs text-green-700 hover:underline"><ExternalLink className="w-3 h-3" />View on Map</a>
                          </div>
                          <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                            <p className="font-semibold text-red-900 mb-2">📍 Drop-off</p>
                            <p className="text-sm text-red-800">{car.dropoffLocationInfo?.name || `${dropoffLocation} Airport`}</p>
                            <p className="text-xs text-red-700 mt-1">{car.dropoffLocationInfo?.address || 'Car Rental Center'}</p>
                            <p className="text-xs text-red-600 mt-2">📞 {car.dropoffLocationInfo?.phone || '+1 (800) 555-0124'}</p>
                            <p className="text-xs text-red-600">🕐 {car.dropoffLocationInfo?.hours || '24/7'}</p>
                          </div>
                        </div>
                      </PolicySection>

                      {/* Security Deposit */}
                      <PolicySection title="Security Deposit" icon={CreditCard} defaultOpen={true}>
                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                          <p className="text-2xl font-bold text-yellow-900">{car.termsAndConditions?.depositAmount || '$300'}</p>
                          <p className="text-sm text-yellow-800 mt-1">{car.termsAndConditions?.depositType || 'Credit Card Hold (Pre-authorization)'}</p>
                          <p className="text-xs text-yellow-700 mt-2">{car.termsAndConditions?.depositNote || 'Released within 5-7 business days after return'}</p>
                          <p className="text-xs text-yellow-600 mt-2 font-semibold">⚠️ Credit card ONLY - Debit cards not accepted</p>
                        </div>
                      </PolicySection>

                      {/* Fuel & Mileage */}
                      <PolicySection title="Fuel & Mileage Policy" icon={Fuel}>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-3 bg-amber-50 rounded-lg">
                            <p className="font-semibold text-amber-900">⛽ Fuel Policy</p>
                            <p className="text-sm text-amber-800 mt-1">{car.fuelPolicy?.description || 'Full-to-Full: Return with full tank'}</p>
                            <p className="text-xs text-amber-700">Type: {car.fuelPolicy?.fuelType || car.fuelType}</p>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg">
                            <p className="font-semibold text-green-900">📍 Mileage</p>
                            <p className="text-sm text-green-800 mt-1">{car.mileage?.unlimited ? '✓ Unlimited mileage included' : car.mileage?.included || 'Standard allowance'}</p>
                          </div>
                        </div>
                      </PolicySection>

                      {/* Insurance */}
                      <PolicySection title="Insurance & Coverage" icon={Shield}>
                        <div className="space-y-2 text-sm">
                          <p>{car.insurance?.included ? '✅ Basic insurance included' : '⚠️ Basic liability only'}</p>
                          {car.insurance?.cdwIncluded && <p>✅ CDW (Collision Damage Waiver) included</p>}
                          {car.insurance?.theftProtection && <p>✅ Theft Protection included</p>}
                          <p className="text-slate-600">Liability: {car.insurance?.liabilityAmount || '$1,000,000'} | Deductible: {car.insurance?.deductible || '$500'}</p>
                        </div>
                      </PolicySection>

                      {/* Driver Requirements */}
                      <PolicySection title="Driver Requirements" icon={User}>
                        <ul className="text-sm space-y-1">
                          <li>• Minimum age: {car.driverRequirements?.minimumAge || 21} years</li>
                          <li>• License held: {car.driverRequirements?.licenseHeldYears || 1}+ year(s)</li>
                          {car.driverRequirements?.youngDriverFee && <li>• Young driver fee (under {car.driverRequirements?.youngDriverAge || 25}): {car.driverRequirements?.youngDriverFee}</li>}
                        </ul>
                      </PolicySection>

                      {/* Optional Add-ons */}
                      <PolicySection title="Optional Add-ons (At Counter)" icon={Settings}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="p-2 bg-slate-50 rounded-lg text-center">🧭 GPS<br/><span className="font-semibold">{car.additionalFees?.gps || '$10/day'}</span></div>
                          <div className="p-2 bg-slate-50 rounded-lg text-center">👶 Child Seat<br/><span className="font-semibold">{car.additionalFees?.childSeat || '$12/day'}</span></div>
                          <div className="p-2 bg-slate-50 rounded-lg text-center">👤 Extra Driver<br/><span className="font-semibold">{car.additionalFees?.additionalDriver || '$15/day'}</span></div>
                          <div className="p-2 bg-slate-50 rounded-lg text-center">🛣️ Toll Pass<br/><span className="font-semibold">{car.additionalFees?.tollPass || '$8/day'}</span></div>
                        </div>
                        <p className="text-xs text-slate-500 mt-3">*Available at pickup counter. Prices are estimates.</p>
                      </PolicySection>

                      {/* Cancellation */}
                      <PolicySection title="Cancellation Policy" icon={AlertCircle}>
                        <div className="text-sm space-y-1">
                          <p>✅ Free cancellation up to {car.cancellation?.freeCancellationHours || 48} hours before pickup</p>
                          <p>⚠️ Late cancellation: 50% charged</p>
                          <p>❌ No-show: {car.cancellation?.noShowFee || '100% charged'}</p>
                        </div>
                      </PolicySection>
                    </div>

                    {/* Accept Terms */}
                    <div className="mt-6 p-4 bg-primary-50 border-2 border-primary-200 rounded-xl">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-1 w-5 h-5 rounded border-primary-300 text-primary-600 focus:ring-primary-500" />
                        <span className="text-sm text-primary-900">I have read and agree to all <strong>Rental Policies</strong>, <strong>Terms & Conditions</strong>, <strong>Cancellation Policy</strong>, and <strong>Security Deposit</strong> requirements listed above.</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setStep(1)} className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 flex items-center gap-2"><ChevronLeft className="w-5 h-5" />Back</button>
                    <button onClick={() => setStep(3)} disabled={!acceptedTerms} className="flex-1 px-8 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      Proceed to Payment <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Payment */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary-600" />Payment Details</h2>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <div className="flex gap-3">
                      <Lock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-blue-800">Secure Payment</p>
                        <p className="text-sm text-blue-700">Your payment details are encrypted and secure.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Card Number *</label>
                      <input type="text" value={payment.cardNumber} onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500" placeholder="4242 4242 4242 4242" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Cardholder Name *</label>
                      <input type="text" value={payment.cardholderName} onChange={(e) => setPayment({ ...payment, cardholderName: e.target.value.toUpperCase() })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500" placeholder="JOHN DOE" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Month *</label>
                        <select value={payment.expiryMonth} onChange={(e) => setPayment({ ...payment, expiryMonth: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500">
                          <option value="">MM</option>
                          {Array.from({ length: 12 }, (_, i) => <option key={i+1} value={String(i+1).padStart(2,'0')}>{String(i+1).padStart(2,'0')}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Year *</label>
                        <select value={payment.expiryYear} onChange={(e) => setPayment({ ...payment, expiryYear: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500">
                          <option value="">YY</option>
                          {Array.from({ length: 10 }, (_, i) => <option key={i} value={String(new Date().getFullYear() + i).slice(-2)}>{new Date().getFullYear() + i}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">CVV *</label>
                        <input type="text" value={payment.cvv} onChange={(e) => setPayment({ ...payment, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500" placeholder="123" />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <div className="mt-8 flex gap-4">
                    <button onClick={() => setStep(2)} className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 flex items-center gap-2"><ChevronLeft className="w-5 h-5" />Back</button>
                    <button onClick={handleSubmit} disabled={!isPaymentValid || isSubmitting} className="flex-1 px-8 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" />Processing...</> : <><Lock className="w-5 h-5" />Pay ${totalPrice.toFixed(2)}</>}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column - Compact Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5 sticky top-32">
              {/* Car Image */}
              <div className="relative h-32 bg-slate-100 rounded-xl overflow-hidden mb-4">
                {car.image?.startsWith('http') ? (
                  <Image src={car.image} alt={car.name} fill className="object-cover" />
                ) : car.image?.startsWith('/') ? (
                  <Image src={car.image} alt={car.name} fill className="object-contain p-3" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">🚗</div>
                )}
              </div>

              {/* Car Info */}
              <h3 className="text-lg font-bold text-slate-900">{car.name}</h3>
              <p className="text-sm text-slate-500">{car.company} · {car.category}</p>

              {/* Quick Features */}
              <div className="flex flex-wrap gap-2 mt-3 text-xs text-slate-600">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{car.passengers}</span>
                <span className="flex items-center gap-1"><Settings className="w-3 h-3" />{car.transmission}</span>
                <span className="flex items-center gap-1"><Fuel className="w-3 h-3" />{car.fuelType}</span>
              </div>

              {/* Dates */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Pickup</span><span className="font-medium">{new Date(pickupDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {pickupTime}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Return</span><span className="font-medium">{new Date(dropoffDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {dropoffTime}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Duration</span><span className="font-medium">{rentalDays} day{rentalDays > 1 ? 's' : ''}</span></div>
              </div>

              {/* Pricing */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">${car.pricePerDay.toFixed(2)}/day × {rentalDays}</span><span>${basePrice.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Taxes & Fees</span><span>${taxesAndFees.toFixed(2)}</span></div>
                <div className="flex justify-between pt-2 border-t border-slate-100 text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary-600">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Trust */}
              <div className="mt-4 flex items-center gap-2 text-xs text-green-600">
                <Shield className="w-4 h-4" />
                <span>Free cancellation up to 48h</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Footer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50 safe-area-inset-bottom">
        <div className="px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <span className="text-2xl font-bold text-primary-600">${totalPrice.toFixed(2)}</span>
            <p className="text-xs text-slate-500">{rentalDays} day{rentalDays > 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => { if (step === 1 && isDriverValid) setStep(2); else if (step === 2 && acceptedTerms) setStep(3); else if (step === 3) handleSubmit(); }}
            disabled={(step === 1 && !isDriverValid) || (step === 2 && !acceptedTerms) || (step === 3 && (!isPaymentValid || isSubmitting))}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold text-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : step === 3 ? <><Lock className="w-4 h-4" />Pay Now</> : <>Continue <ChevronRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CarCheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-12 h-12 text-primary-500 animate-spin" /></div>}>
      <CarCheckoutContent />
    </Suspense>
  );
}
