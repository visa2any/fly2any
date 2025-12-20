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
  Luggage, Snowflake, Star, Building2, Info, ExternalLink, Navigation
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
  // Location info with contact details
  pickupLocationInfo?: LocationInfo;
  dropoffLocationInfo?: LocationInfo;
  // API-provided policy information
  mileage?: {
    unlimited?: boolean;
    included?: string;
    extraMileageCost?: string | null;
  };
  insurance?: {
    included?: boolean;
    cdwIncluded?: boolean;
    theftProtection?: boolean;
    liabilityAmount?: string;
    deductible?: string;
    type?: string;
  };
  fuelPolicy?: {
    type?: string;
    description?: string;
    fuelType?: string;
  };
  driverRequirements?: {
    minimumAge?: number;
    youngDriverAge?: number;
    youngDriverFee?: string;
    licenseHeldYears?: number;
  };
  cancellation?: {
    freeCancellationHours?: number;
    policy?: string;
    noShowFee?: string;
  };
  additionalFees?: {
    additionalDriver?: string;
    gps?: string;
    childSeat?: string;
    tollPass?: string;
    oneWayFee?: string | null;
  };
  termsAndConditions?: {
    depositRequired?: boolean;
    depositAmount?: string;
    depositCurrency?: string;
    depositType?: string;
    depositNote?: string;
    creditCardOnly?: boolean;
    debitCardAccepted?: boolean;
    inspectionRequired?: boolean;
    gracePeriodMinutes?: number;
    lateReturnFee?: string;
  };
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
  cardBrand?: string;
}

// ===========================
// MAIN COMPONENT
// ===========================

function CarCheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse URL params
  const carDataParam = searchParams.get('car');
  const pickupLocation = searchParams.get('pickup') || '';
  const dropoffLocation = searchParams.get('dropoff') || pickupLocation;
  const pickupDate = searchParams.get('pickupDate') || '';
  const dropoffDate = searchParams.get('dropoffDate') || '';
  const pickupTime = searchParams.get('pickupTime') || '10:00';
  const dropoffTime = searchParams.get('dropoffTime') || '10:00';

  // State
  const [car, setCar] = useState<CarData | null>(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  // Driver information
  const [driver, setDriver] = useState<DriverInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    licenseNumber: '',
    licenseCountry: 'US',
    licenseExpiry: '',
  });

  // Payment information
  const [payment, setPayment] = useState<PaymentInfo>({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });

  // Terms acceptance
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Calculate rental days
  const rentalDays = pickupDate && dropoffDate
    ? Math.ceil((new Date(dropoffDate).getTime() - new Date(pickupDate).getTime()) / (1000 * 60 * 60 * 24))
    : 1;

  // Parse car data from URL
  useEffect(() => {
    if (carDataParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(carDataParam));
        setCar(parsed);
      } catch {
        setError('Invalid car data');
      }
    }
  }, [carDataParam]);

  // Calculate pricing
  const basePrice = car ? car.pricePerDay * rentalDays : 0;
  const taxesAndFees = basePrice * 0.12;
  const totalPrice = basePrice + taxesAndFees;

  // Form validation
  const isDriverValid = driver.firstName && driver.lastName && driver.email && driver.phone &&
    driver.dateOfBirth && driver.licenseNumber && driver.licenseExpiry;

  const isPaymentValid = payment.cardNumber.length >= 15 && payment.cardholderName &&
    payment.expiryMonth && payment.expiryYear && payment.cvv.length >= 3;

  // Handle booking submission
  const handleSubmit = async () => {
    if (!car || !isDriverValid || !isPaymentValid) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/cars/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          car,
          pickupLocation,
          dropoffLocation,
          pickupDate,
          dropoffDate,
          pickupTime,
          dropoffTime,
          driver,
          payment: {
            cardNumber: payment.cardNumber,
            cardholderName: payment.cardholderName,
            cardBrand: getCardBrand(payment.cardNumber),
          },
          contactInfo: {
            email: driver.email,
            phone: driver.phone,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBookingRef(data.booking.bookingReference);
        setBookingComplete(true);
      } else {
        setError(data.message || 'Failed to create booking');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get card brand from number
  const getCardBrand = (num: string) => {
    if (num.startsWith('4')) return 'visa';
    if (/^5[1-5]/.test(num)) return 'mastercard';
    if (/^3[47]/.test(num)) return 'amex';
    if (/^6/.test(num)) return 'discover';
    return 'unknown';
  };

  // Loading state
  if (!car) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading car details...</p>
        </div>
      </div>
    );
  }

  // Booking complete state
  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl p-8 text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Booking Received!</h1>
            <p className="text-slate-600 mb-6">
              Your car rental reservation has been submitted successfully.
            </p>

            <div className="bg-slate-50 rounded-2xl p-6 mb-6">
              <p className="text-sm text-slate-500 mb-2">Booking Reference</p>
              <p className="text-2xl font-bold text-primary-600">{bookingRef}</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Payment Processing</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Our team will verify your payment details and confirm your reservation within 24 hours.
                    You will receive a confirmation email at <strong>{driver.email}</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 mb-8 text-left">
              <h3 className="font-semibold text-slate-900 mb-3">Reservation Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Vehicle</span>
                  <span className="font-medium">{car.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Pickup</span>
                  <span className="font-medium">{pickupLocation} - {new Date(pickupDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Return</span>
                  <span className="font-medium">{dropoffLocation} - {new Date(dropoffDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-slate-900 font-medium">Total</span>
                  <span className="font-bold text-primary-600">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Link
                href="/account/bookings"
                className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
              >
                View My Bookings
              </Link>
              <Link
                href="/"
                className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Complete Your Booking</h1>
              <p className="text-sm text-slate-500">{car.name} - {rentalDays} day{rentalDays > 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-4">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  step >= s ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {s}
                </div>
                <span className={`text-sm font-medium ${step >= s ? 'text-slate-900' : 'text-slate-400'}`}>
                  {s === 1 ? 'Driver Details' : 'Payment'}
                </span>
                {s < 2 && <ChevronRight className="w-4 h-4 text-slate-300" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
                >
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary-600" />
                    Driver Information
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                      <input
                        type="text"
                        value={driver.firstName}
                        onChange={(e) => setDriver({ ...driver, firstName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
                      <input
                        type="text"
                        value={driver.lastName}
                        onChange={(e) => setDriver({ ...driver, lastName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                      <input
                        type="email"
                        value={driver.email}
                        onChange={(e) => setDriver({ ...driver, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                      <input
                        type="tel"
                        value={driver.phone}
                        onChange={(e) => setDriver({ ...driver, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="+1 555 123 4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth *</label>
                      <div className="grid grid-cols-3 gap-2">
                        {/* Month */}
                        <select
                          value={driver.dateOfBirth ? driver.dateOfBirth.split('-')[1] : ''}
                          onChange={(e) => {
                            const parts = driver.dateOfBirth ? driver.dateOfBirth.split('-') : ['', '', ''];
                            parts[1] = e.target.value;
                            if (parts[0] && parts[1] && parts[2]) {
                              setDriver({ ...driver, dateOfBirth: parts.join('-') });
                            } else {
                              setDriver({ ...driver, dateOfBirth: `${parts[0] || ''}-${parts[1]}-${parts[2] || ''}` });
                            }
                          }}
                          className="w-full px-3 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        >
                          <option value="">Month</option>
                          <option value="01">January</option>
                          <option value="02">February</option>
                          <option value="03">March</option>
                          <option value="04">April</option>
                          <option value="05">May</option>
                          <option value="06">June</option>
                          <option value="07">July</option>
                          <option value="08">August</option>
                          <option value="09">September</option>
                          <option value="10">October</option>
                          <option value="11">November</option>
                          <option value="12">December</option>
                        </select>
                        {/* Day */}
                        <select
                          value={driver.dateOfBirth ? driver.dateOfBirth.split('-')[2] : ''}
                          onChange={(e) => {
                            const parts = driver.dateOfBirth ? driver.dateOfBirth.split('-') : ['', '', ''];
                            parts[2] = e.target.value;
                            if (parts[0] && parts[1] && parts[2]) {
                              setDriver({ ...driver, dateOfBirth: parts.join('-') });
                            } else {
                              setDriver({ ...driver, dateOfBirth: `${parts[0] || ''}-${parts[1] || ''}-${parts[2]}` });
                            }
                          }}
                          className="w-full px-3 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        >
                          <option value="">Day</option>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                            <option key={day} value={day.toString().padStart(2, '0')}>{day}</option>
                          ))}
                        </select>
                        {/* Year */}
                        <select
                          value={driver.dateOfBirth ? driver.dateOfBirth.split('-')[0] : ''}
                          onChange={(e) => {
                            const parts = driver.dateOfBirth ? driver.dateOfBirth.split('-') : ['', '', ''];
                            parts[0] = e.target.value;
                            if (parts[0] && parts[1] && parts[2]) {
                              setDriver({ ...driver, dateOfBirth: parts.join('-') });
                            } else {
                              setDriver({ ...driver, dateOfBirth: `${parts[0]}-${parts[1] || ''}-${parts[2] || ''}` });
                            }
                          }}
                          className="w-full px-3 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        >
                          <option value="">Year</option>
                          {Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - 18 - i).map(year => (
                            <option key={year} value={year.toString()}>{year}</option>
                          ))}
                        </select>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Must be at least 18 years old to rent a car</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">License Country *</label>
                      <select
                        value={driver.licenseCountry}
                        onChange={(e) => setDriver({ ...driver, licenseCountry: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                        <option value="BR">Brazil</option>
                        <option value="MX">Mexico</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">License Number *</label>
                      <input
                        type="text"
                        value={driver.licenseNumber}
                        onChange={(e) => setDriver({ ...driver, licenseNumber: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="DL123456789"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">License Expiry *</label>
                      <input
                        type="date"
                        value={driver.licenseExpiry}
                        onChange={(e) => setDriver({ ...driver, licenseExpiry: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={() => setStep(2)}
                      disabled={!isDriverValid}
                      className="px-8 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      Continue to Payment
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
                >
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary-600" />
                    Payment Details
                  </h2>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <div className="flex gap-3">
                      <Lock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-blue-800">Secure Payment</p>
                        <p className="text-sm text-blue-700 mt-1">
                          Your payment will be processed securely. Your card will only be charged after our team confirms availability.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Card Number *</label>
                      <input
                        type="text"
                        value={payment.cardNumber}
                        onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="4242 4242 4242 4242"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Cardholder Name *</label>
                      <input
                        type="text"
                        value={payment.cardholderName}
                        onChange={(e) => setPayment({ ...payment, cardholderName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="JOHN DOE"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Month *</label>
                        <select
                          value={payment.expiryMonth}
                          onChange={(e) => setPayment({ ...payment, expiryMonth: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="">MM</option>
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                              {String(i + 1).padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Year *</label>
                        <select
                          value={payment.expiryYear}
                          onChange={(e) => setPayment({ ...payment, expiryYear: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="">YY</option>
                          {Array.from({ length: 10 }, (_, i) => {
                            const year = new Date().getFullYear() + i;
                            return (
                              <option key={year} value={String(year).slice(-2)}>
                                {year}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">CVV *</label>
                        <input
                          type="text"
                          value={payment.cvv}
                          onChange={(e) => setPayment({ ...payment, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="123"
                        />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  {/* Terms & Conditions Acknowledgment */}
                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-amber-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-amber-800">
                        I have read and agree to the <strong>Rental Policies</strong>, <strong>Terms & Conditions</strong>, and <strong>Cancellation Policy</strong> displayed on this page. I understand the fuel policy, mileage terms, insurance coverage, deposit requirements, and driver requirements.
                      </span>
                    </label>
                  </div>

                  <div className="mt-6 flex gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors flex items-center gap-2"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!isPaymentValid || !acceptedTerms || isSubmitting}
                      className="flex-1 px-8 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5" />
                          Complete Booking - ${totalPrice.toFixed(2)}
                        </>
                      )}
                    </button>
                  </div>

                  {!acceptedTerms && (
                    <p className="mt-2 text-xs text-amber-600 text-center">
                      ⚠️ Please review and accept the rental policies to proceed
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sticky top-32">
              {/* Car Image */}
              <div className="relative h-40 bg-slate-100 rounded-xl overflow-hidden mb-4">
                {car.image?.startsWith('http') ? (
                  <Image
                    src={car.image}
                    alt={car.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    {car.image || '🚗'}
                  </div>
                )}
              </div>

              {/* Car Info */}
              <h3 className="text-lg font-bold text-slate-900">{car.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{car.company} - {car.category}</p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users className="w-4 h-4" />
                  <span>{car.passengers} Passengers</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Settings className="w-4 h-4" />
                  <span>{car.transmission}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Fuel className="w-4 h-4" />
                  <span>{car.fuelType}</span>
                </div>
                {car.luggage && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Luggage className="w-4 h-4" />
                    <span>{car.luggage} Bags</span>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-4 mb-4">
                <h4 className="font-medium text-slate-900 mb-2">Rental Period</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span>Pickup: {pickupLocation}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>{pickupDate ? new Date(pickupDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'N/A'} at {pickupTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 mt-2">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <span>Return: {dropoffLocation}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>{dropoffDate ? new Date(dropoffDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'N/A'} at {dropoffTime}</span>
                  </div>
                </div>
              </div>

              {/* PICKUP LOCATION DETAILS */}
              <div className="border-t border-slate-100 pt-4 mb-4">
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-green-600" />
                  Pickup Location
                </h4>
                <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                  <p className="font-medium text-green-900 text-sm">{car.pickupLocationInfo?.name || `${pickupLocation} Airport`}</p>
                  <p className="text-xs text-green-700 mt-1">{car.pickupLocationInfo?.address || 'Car Rental Center, Terminal B'}</p>

                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-green-700">
                      <Phone className="w-3 h-3" />
                      <a href={`tel:${car.pickupLocationInfo?.phone || '+1-800-555-0123'}`} className="hover:underline">
                        {car.pickupLocationInfo?.phone || '+1 (800) 555-0123'}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-green-700">
                      <Mail className="w-3 h-3" />
                      <a href={`mailto:${car.pickupLocationInfo?.email || 'rentals@carrental.com'}`} className="hover:underline">
                        {car.pickupLocationInfo?.email || 'rentals@carrental.com'}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-green-700">
                      <Clock className="w-3 h-3" />
                      <span>{car.pickupLocationInfo?.hours || '24/7 Service'}</span>
                    </div>
                  </div>

                  {/* Google Maps Link */}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(car.pickupLocationInfo?.address || `${pickupLocation} Airport Car Rental`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center justify-center gap-2 w-full py-2 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <MapPin className="w-3 h-3" />
                    Open in Google Maps
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* DROPOFF LOCATION DETAILS (if different) */}
              {dropoffLocation !== pickupLocation && (
                <div className="border-t border-slate-100 pt-4 mb-4">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-red-600" />
                    Drop-off Location
                  </h4>
                  <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                    <p className="font-medium text-red-900 text-sm">{car.dropoffLocationInfo?.name || `${dropoffLocation} Airport`}</p>
                    <p className="text-xs text-red-700 mt-1">{car.dropoffLocationInfo?.address || 'Car Rental Center, Terminal B'}</p>

                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-xs text-red-700">
                        <Phone className="w-3 h-3" />
                        <a href={`tel:${car.dropoffLocationInfo?.phone || '+1-800-555-0124'}`} className="hover:underline">
                          {car.dropoffLocationInfo?.phone || '+1 (800) 555-0124'}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-red-700">
                        <Mail className="w-3 h-3" />
                        <a href={`mailto:${car.dropoffLocationInfo?.email || 'rentals@carrental.com'}`} className="hover:underline">
                          {car.dropoffLocationInfo?.email || 'rentals@carrental.com'}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-red-700">
                        <Clock className="w-3 h-3" />
                        <span>{car.dropoffLocationInfo?.hours || '24/7 Service'}</span>
                      </div>
                    </div>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(car.dropoffLocationInfo?.address || `${dropoffLocation} Airport Car Rental`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex items-center justify-center gap-2 w-full py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <MapPin className="w-3 h-3" />
                      Open in Google Maps
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Pricing */}
              <div className="border-t border-slate-100 pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">${(car.pricePerDay || 0).toFixed(2)}/day x {rentalDays} day{rentalDays > 1 ? 's' : ''}</span>
                    <span className="font-medium">${(basePrice || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Taxes & Fees</span>
                    <span className="font-medium">${(taxesAndFees || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-100 text-lg">
                    <span className="font-semibold text-slate-900">Total</span>
                    <span className="font-bold text-primary-600">${(totalPrice || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>{car.cancellation?.policy || 'Free cancellation up to 48h before pickup'}</span>
                </div>
              </div>

              {/* RENTAL POLICIES - From API */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary-600" />
                  Rental Policies
                </h4>

                {/* Mileage Policy */}
                <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-xs font-semibold text-green-800 mb-1">📍 Mileage</p>
                  <p className="text-sm text-green-700">
                    {car.mileage?.unlimited || car.unlimited_mileage ? '✓ Unlimited mileage included' : car.mileage?.included || 'Standard mileage allowance'}
                  </p>
                </div>

                {/* Fuel Policy */}
                <div className="mb-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-xs font-semibold text-amber-800 mb-1">⛽ Fuel Policy</p>
                  <p className="text-sm text-amber-700">
                    {car.fuelPolicy?.description || 'Full-to-Full: Return with full tank'}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    Fuel type: {car.fuelPolicy?.fuelType || car.fuelType || 'Petrol'}
                  </p>
                </div>

                {/* Insurance & Coverage */}
                <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs font-semibold text-blue-800 mb-1">🛡️ Insurance & Coverage</p>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>{car.insurance?.included || car.insurance_included ? '✓ Basic insurance included' : '○ Basic liability only'}</p>
                    {car.insurance?.cdwIncluded && <p>✓ CDW (Collision Damage Waiver) included</p>}
                    {car.insurance?.theftProtection && <p>✓ Theft Protection included</p>}
                    <p className="text-xs text-blue-600">
                      Liability: {car.insurance?.liabilityAmount || '$1,000,000'} | Deductible: {car.insurance?.deductible || '$500'}
                    </p>
                  </div>
                </div>

                {/* Driver Requirements */}
                <div className="mb-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="text-xs font-semibold text-purple-800 mb-1">👤 Driver Requirements</p>
                  <div className="text-sm text-purple-700 space-y-1">
                    <p>• Minimum age: {car.driverRequirements?.minimumAge || 21} years</p>
                    <p>• License held: {car.driverRequirements?.licenseHeldYears || 1}+ year(s)</p>
                    {car.driverRequirements?.youngDriverFee && (
                      <p className="text-xs text-purple-600">
                        Young driver fee (under {car.driverRequirements?.youngDriverAge || 25}): {car.driverRequirements?.youngDriverFee}
                      </p>
                    )}
                  </div>
                </div>

                {/* Additional Fees */}
                {car.additionalFees && (
                  <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs font-semibold text-slate-700 mb-1">💰 Optional Add-ons</p>
                    <div className="text-xs text-slate-600 grid grid-cols-2 gap-1">
                      <span>GPS: {car.additionalFees.gps || '$10/day'}</span>
                      <span>Child seat: {car.additionalFees.childSeat || '$12/day'}</span>
                      <span>Extra driver: {car.additionalFees.additionalDriver || '$15/day'}</span>
                      <span>Toll pass: {car.additionalFees.tollPass || '$8/day'}</span>
                      {car.additionalFees.oneWayFee && (
                        <span className="col-span-2">One-way fee: {car.additionalFees.oneWayFee}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* SECURITY DEPOSIT - Highlighted */}
                <div className="p-3 bg-yellow-50 rounded-lg border-2 border-yellow-300">
                  <p className="text-xs font-bold text-yellow-800 mb-2">💳 SECURITY DEPOSIT (Card Hold)</p>
                  <div className="text-sm text-yellow-900 space-y-1">
                    <p className="font-bold text-lg">{car.termsAndConditions?.depositAmount || '$300'}</p>
                    <p className="text-xs text-yellow-700">{car.termsAndConditions?.depositType || 'Credit Card Hold (Pre-authorization)'}</p>
                    <p className="text-xs text-yellow-600 mt-2">{car.termsAndConditions?.depositNote || 'This hold will be released within 5-7 business days after vehicle return'}</p>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <p className="text-xs font-semibold text-red-800 mb-1">📋 Terms & Conditions</p>
                  <div className="text-xs text-red-700 space-y-1">
                    <p>• {car.termsAndConditions?.creditCardOnly ? 'Credit card ONLY (debit cards NOT accepted for deposit)' : 'Credit/Debit card accepted'}</p>
                    <p>• Vehicle inspection at pickup & return</p>
                    <p>• Grace period: {car.termsAndConditions?.gracePeriodMinutes || 29} minutes</p>
                    <p>• Late return: {car.termsAndConditions?.lateReturnFee || 'Additional day rate'}</p>
                  </div>
                </div>

                {/* Cancellation */}
                <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <p className="text-xs font-semibold text-orange-800 mb-1">❌ Cancellation Policy</p>
                  <div className="text-xs text-orange-700 space-y-1">
                    <p>• Free up to {car.cancellation?.freeCancellationHours || 48}h before pickup</p>
                    <p>• No-show: {car.cancellation?.noShowFee || '100% charged'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Footer - Level 6 Premium */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50 safe-area-inset-bottom">
        <div className="px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-primary-600">${totalPrice.toFixed(2)}</span>
              <span className="text-xs text-slate-500">total</span>
            </div>
            <p className="text-xs text-slate-500">{rentalDays} day{rentalDays > 1 ? 's' : ''} · {car?.name}</p>
            {step === 2 && !acceptedTerms && (
              <p className="text-xs text-amber-600">Accept terms above ↑</p>
            )}
          </div>
          <button
            onClick={step === 2 ? handleSubmit : () => setStep(2)}
            disabled={(step === 1 && !isDriverValid) || (step === 2 && (!isPaymentValid || !acceptedTerms || isSubmitting))}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : step === 1 ? (
              <>Continue</>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Book Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom padding for mobile to account for sticky footer */}
      <div className="lg:hidden h-20" />
    </div>
  );
}

// Export with Suspense wrapper
export default function CarCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
      </div>
    }>
      <CarCheckoutContent />
    </Suspense>
  );
}
