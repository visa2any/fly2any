'use client';

/**
 * Main Checkout Page - Flight Booking
 * Level 6 Ultra-Premium Design
 * Complete E2E booking flow for flights
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft, Plane, Shield, CreditCard, Users, Calendar,
  CheckCircle, Loader2, AlertCircle, MapPin, ChevronDown,
  Sparkles, Lock, Globe, Mail, Phone, User, Briefcase,
  Heart, Download, Share2, TrendingUp
} from 'lucide-react';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { BookingSteps } from '@/components/shared/BookingSteps';
import { useFlightCart, type PassengerInfo } from '@/lib/cart/flight-cart';
import { formatCurrency } from '@/lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, total, currency, clearCart, updatePassengerInfo } = useFlightCart();
  
  // Handle null searchParams
  const bookingParam = searchParams?.get('booking') || null;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [confirmationId, setConfirmationId] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Passenger forms
  const [passengers, setPassengers] = useState<PassengerInfo[]>([
    { id: 1, type: 'Adult', firstName: '', lastName: '', dateOfBirth: '', gender: '', passportNumber: '', expiryDate: '', nationality: '', email: '', phone: '' }
  ]);

  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    countryCode: '+1',
    specialRequests: ''
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    billingAddress: '',
    billingCity: '',
    billingPostalCode: '',
    billingCountry: 'US'
  });

  // Get flight details from cart or URL
  const flight = items[0]; // Assuming single flight booking for now

  useEffect(() => {
    // If no items in cart, redirect to flights page
    if (items.length === 0 && !bookingParam) {
      router.push('/flights');
    }
  }, [items, router, bookingParam]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handlePassengerChange = (index: number, field: keyof PassengerInfo, value: string) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index] = { ...updatedPassengers[index], [field]: value } as PassengerInfo;
    setPassengers(updatedPassengers);
    updatePassengerInfo(updatedPassengers);
  };

  const handleAddPassenger = () => {
    if (passengers.length < 9) {
      const newPassenger: PassengerInfo = {
        id: passengers.length + 1,
        type: 'Adult',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        passportNumber: '',
        expiryDate: '',
        nationality: '',
        email: '',
        phone: ''
      };
      setPassengers([...passengers, newPassenger]);
    }
  };

  const handleRemovePassenger = (index: number) => {
    if (passengers.length > 1) {
      const updatedPassengers = passengers.filter((_, i) => i !== index);
      setPassengers(updatedPassengers);
      updatePassengerInfo(updatedPassengers);
    }
  };

  const validateStep1 = () => {
    // Basic validation for passenger info
    return passengers.every(p => p.firstName && p.lastName && p.email);
  };

  const validateStep2 = () => {
    return contactInfo.email && contactInfo.phone;
  };

  const validateStep3 = () => {
    return paymentInfo.cardNumber && paymentInfo.expiryDate && paymentInfo.cvv && paymentInfo.nameOnCard;
  };

  const handleSubmitBooking = async () => {
    setLoading(true);
    try {
      // Mock API call - in production, this would connect to your booking API
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flight,
          passengers,
          contactInfo,
          paymentInfo,
          total,
          currency
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setConfirmationId(data.bookingId || `FLY-${Date.now().toString(36).toUpperCase()}`);
        clearCart();
        setStep(4); // Confirmation step
      } else {
        alert(data.message || 'Booking failed. Please try again.');
      }
    } catch (err) {
      console.error('Booking error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
    else if (step === 3 && validateStep3()) handleSubmitBooking();
  };

  const handlePreviousStep = () => {
    if (step > 1) setStep(step - 1);
  };

  if (!flight && items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center max-w-md px-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plane className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Flight Selected</h2>
          <p className="text-gray-500 mb-6">
            Please select a flight to proceed with booking.
          </p>
          <button
            onClick={() => router.push('/flights')}
            className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
          >
            Browse Flights
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <MaxWidthContainer>
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.back()} 
                className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Complete Booking</h1>
                <p className="text-xs text-gray-500">Secure checkout • Best price guaranteed</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
                <Lock className="w-4 h-4 text-green-600" />
                <span>256-bit SSL • PCI DSS Compliant</span>
              </div>
              <div className="text-xs font-medium px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full">
                {formatCurrency(total, currency)}
              </div>
            </div>
          </div>
        </MaxWidthContainer>
      </div>

      {/* Progress Steps */}
      <MaxWidthContainer className="py-6">
        <BookingSteps 
          currentStep={step} 
          accentColor="primary" 
          labels={['Passenger Details', 'Contact Info', 'Payment', 'Confirmation']}
        />
      </MaxWidthContainer>

      <MaxWidthContainer>
        <div className="pb-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Flight Summary Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Flight Details</h2>
                <span className="text-sm font-medium px-3 py-1 bg-primary-50 text-primary-700 rounded-full">
                  {flight?.airline || 'Selected Flight'}
                </span>
              </div>

              {flight && (
                <div className="space-y-4">
                  {/* Route */}
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{flight.departureTime || '10:30'}</p>
                      <p className="text-sm text-gray-500">{flight.departureAirport || 'JFK'}</p>
                      <p className="text-xs text-gray-400">New York, USA</p>
                    </div>
                    
                    <div className="flex-1 px-4">
                      <div className="relative">
                        <div className="h-0.5 bg-gray-200"></div>
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full flex justify-between">
                          <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                          <Plane className="w-5 h-5 text-primary-500 transform rotate-45" />
                          <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                        </div>
                      </div>
                      <p className="text-xs text-center text-gray-500 mt-1">
                        {flight.duration || '6h 15m'} • {flight.stops || 'Non-stop'}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{flight.arrivalTime || '16:45'}</p>
                      <p className="text-sm text-gray-500">{flight.arrivalAirport || 'LAX'}</p>
                      <p className="text-xs text-gray-400">Los Angeles, USA</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="font-medium">{formatDate(flight.departureDate || new Date().toISOString())}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Class</p>
                      <p className="font-medium">{flight.cabinClass || 'Economy'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Passengers</p>
                      <p className="font-medium">{passengers.length} {passengers.length === 1 ? 'Adult' : 'Adults'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Flight No.</p>
                      <p className="font-medium">{flight.flightNumber || 'AA123'}</p>
                    </div>
                  </div>
                </div>
              )}

              <button 
                onClick={() => toggleSection('flightDetails')}
                className="w-full mt-4 pt-4 border-t border-gray-100 flex items-center justify-center text-primary-600 hover:text-primary-700"
              >
                <ChevronDown className={`w-4 h-4 mr-2 transition-transform ${expandedSections.flightDetails ? 'rotate-180' : ''}`} />
                {expandedSections.flightDetails ? 'Show Less' : 'Show Full Details'}
              </button>

              {expandedSections.flightDetails && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Baggage Allowance</p>
                      <p className="font-medium">1 carry-on + 1 checked bag</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Meal Service</p>
                      <p className="font-medium">Complimentary snacks & drinks</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Seat Selection</p>
                      <p className="font-medium">Available at check-in</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">WiFi</p>
                      <p className="font-medium">Available for purchase</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 1: Passenger Details */}
            {step === 1 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Passenger Details</h2>
                  <span className="text-sm text-gray-500">{passengers.length} passenger(s)</span>
                </div>

                <div className="space-y-6">
                  {passengers.map((passenger, index) => (
                    <div key={passenger.id} className="border border-gray-200 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                            <User className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Passenger {index + 1}</h3>
                            <p className="text-sm text-gray-500">{passenger.type}</p>
                          </div>
                        </div>
                        {passengers.length > 1 && (
                          <button
                            onClick={() => handleRemovePassenger(index)}
                            className="text-sm text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                          <input
                            type="text"
                            value={passenger.firstName}
                            onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="John"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                          <input
                            type="text"
                            value={passenger.lastName}
                            onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Doe"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                          <input
                            type="date"
                            value={passenger.dateOfBirth}
                            onChange={(e) => handlePassengerChange(index, 'dateOfBirth', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                          <select
                            value={passenger.gender}
                            onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            required
                          >
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer-not-to-say">Prefer not to say</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                          <input
                            type="text"
                            value={passenger.passportNumber}
                            onChange={(e) => handlePassengerChange(index, 'passportNumber', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="A12345678"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                          <select
                            value={passenger.nationality}
                            onChange={(e) => handlePassengerChange(index, 'nationality', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            <option value="">Select Country</option>
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                            <option value="GB">United Kingdom</option>
                            <option value="AU">Australia</option>
                            <option value="DE">Germany</option>
                            <option value="FR">France</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                          <input
                            type="email"
                            value={passenger.email}
                            onChange={(e) => handlePassengerChange(index, 'email', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="john.doe@example.com"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {passengers.length < 9 && (
                    <button
                      onClick={handleAddPassenger}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
                    >
                      + Add Another Passenger
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Contact Information */}
            {step === 2 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h2>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Mail className="w-5 h-5 text-primary-600" />
                      <h3 className="font-semibold text-gray-900">Primary Contact Email</h3>
                    </div>
                    <input
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-2">Booking confirmation and e-tickets will be sent here</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Phone className="w-5 h-5 text-primary-600" />
                      <h3 className="font-semibold text-gray-900">Phone Number</h3>
                    </div>
                    <div className="flex gap-3">
                      <select
                        value={contactInfo.countryCode}
                        onChange={(e) => setContactInfo({ ...contactInfo, countryCode: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="+1">+1 (US/CA)</option>
                        <option value="+44">+44 (UK)</option>
                        <option value="+61">+61 (AU)</option>
                        <option value="+49">+49 (DE)</option>
                        <option value="+33">+33 (FR)</option>
                      </select>
                      <input
                        type="tel"
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="(555) 123-4567"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Briefcase className="w-5 h-5 text-primary-600" />
                      <h3 className="font-semibold text-gray-900">Special Requests (Optional)</h3>
                    </div>
                    <textarea
                      value={contactInfo.specialRequests}
                      onChange={(e) => setContactInfo({ ...contactInfo, specialRequests: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows={4}
                      placeholder="Special meal requests, wheelchair assistance, seating preferences, etc."
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-800 mb-1">Important Information</h4>
                        <p className="text-sm text-blue-700">
                          Please ensure all passenger details match their government-issued ID exactly. 
                          Incorrect information may result in denied boarding or additional fees.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Lock className="w-4 h-4" />
                    <span>Secure Payment</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Payment Method Selection */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                      <button className="p-4 border-2 border-primary-500 rounded-xl bg-primary-50">
                        <div className="flex items-center justify-between">
                          <CreditCard className="w-6 h-6 text-primary-600" />
                          <CheckCircle className="w-5 h-5 text-primary-600" />
                        </div>
                        <p className="text-sm font-medium mt-2">Credit Card</p>
                      </button>
                      <button className="p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="w-6 h-6 bg-blue-500 rounded"></div>
                        </div>
                        <p className="text-sm font-medium mt-2">PayPal</p>
                      </button>
                      <button className="p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="w-6 h-6 bg-black rounded"></div>
                        </div>
                        <p className="text-sm font-medium mt-2">Apple Pay</p>
                      </button>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                      <input
                        type="text"
                        value={paymentInfo.cardNumber}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                        <input
                          type="text"
                          value={paymentInfo.expiryDate}
                          onChange={(e) => setPaymentInfo({ ...paymentInfo, expiryDate: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                        <input
                          type="text"
                          value={paymentInfo.cvv}
                          onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="123"
                          maxLength={4}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                      <input
                        type="text"
                        value={paymentInfo.nameOnCard}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, nameOnCard: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="JOHN DOE"
                      />
                    </div>
                  </div>

                  {/* Billing Address */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Billing Address</h3>
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={paymentInfo.billingAddress}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, billingAddress: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="123 Main Street"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={paymentInfo.billingCity}
                          onChange={(e) => setPaymentInfo({ ...paymentInfo, billingCity: e.target.value })}
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="City"
                        />
                        <input
                          type="text"
                          value={paymentInfo.billingPostalCode}
                          onChange={(e) => setPaymentInfo({ ...paymentInfo, billingPostalCode: e.target.value })}
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Postal Code"
                        />
                      </div>
                      <select
                        value={paymentInfo.billingCountry}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, billingCountry: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                        <option value="AU">Australia</option>
                      </select>
                    </div>
                  </div>

                  {/* Security Assurance */}
                  <div className="bg-gradient-to-r from-primary-50 to-red-50 border border-primary-100 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <Shield className="w-6 h-6 text-primary-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-primary-800">Payment Security</h4>
                        <p className="text-sm text-primary-700/80 mt-1">
                          Your payment is processed securely with 256-bit SSL encryption. 
                          We never store your full card details on our servers.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Booking Confirmed!</h2>
                <p className="text-lg text-gray-600 mb-1">Your flight is now booked and confirmed</p>
                <p className="text-gray-500 mb-6">Booking Reference: <span className="font-mono font-bold text-primary-600">{confirmationId}</span></p>

                <div className="max-w-md mx-auto mb-8">
                  <div className="bg-gray-50 rounded-xl p-5 text-left">
                    <h3 className="font-semibold text-gray-900 mb-3">Next Steps</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary-600">1</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Check your email</p>
                          <p className="text-sm text-gray-500">We've sent your e-ticket to {contactInfo.email}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary-600">2</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Download mobile boarding pass</p>
                          <p className="text-sm text-gray-500">Available 24 hours before departure</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary-600">3</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Check in online</p>
                          <p className="text-sm text-gray-500">Opens 24 hours before departure</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                  <button className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
                    <Download className="w-5 h-5" />
                    Download E-ticket
                  </button>
                  <button className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    <Share2 className="w-5 h-5" />
                    Share Booking
                  </button>
                </div>

                <button
                  onClick={() => router.push('/account/bookings')}
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  View All Bookings →
                </button>
              </div>
            )}

            {/* Navigation Buttons */}
            {step < 4 && (
              <div className="flex flex-col sm:flex-row gap-3">
                {step > 1 && (
                  <button
                    onClick={handlePreviousStep}
                    className="sm:w-auto px-8 py-3.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={handleNextStep}
                  disabled={
                    (step === 1 && !validateStep1()) ||
                    (step === 2 && !validateStep2()) ||
                    (step === 3 && !validateStep3()) ||
                    loading
                  }
                  className="flex-1 px-8 py-3.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {step === 1 && 'Continue to Contact Info'}
                  {step === 2 && 'Continue to Payment'}
                  {step === 3 && (loading ? 'Processing...' : `Pay ${formatCurrency(total, currency)}`)}
                </button>
              </div>
            )}
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <h3 className="font-bold text-gray-900">Order Summary</h3>
                </div>
                <div className="p-5 space-y-4">
                  {/* Flight Price */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Flight x{passengers.length}</span>
                      <span className="font-medium">{formatCurrency(total / passengers.length, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxes & Fees</span>
                      <span className="font-medium">{formatCurrency(total * 0.15, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Charge</span>
                      <span className="font-medium">{formatCurrency(total * 0.05, currency)}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-gray-900">Subtotal</span>
                      <span className="font-bold">{formatCurrency(total * 1.2, currency)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-primary-600">{formatCurrency(total * 1.2, currency)}</span>
                    </div>
                  </div>

                  {/* Savings */}
                  <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">You save {formatCurrency(total * 0.1, currency)}</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">Best price guaranteed vs. booking direct</p>
                  </div>
                </div>
              </div>

              {/* Trust & Safety */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-3">Why Book With Us</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Best Price Guarantee</p>
                      <p className="text-xs text-gray-500">Found it cheaper? We'll match it + 10% off</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">24/7 Support</p>
                      <p className="text-xs text-gray-500">Live chat, phone, and email support</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Flexible Changes</p>
                      <p className="text-xs text-gray-500">Most bookings can be changed free</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Need Help */}
              <div className="bg-gradient-to-r from-primary-50 to-red-50 border border-primary-100 rounded-2xl p-5">
                <h3 className="font-bold text-primary-800 mb-2">Need Help?</h3>
                <p className="text-sm text-primary-700/80 mb-3">
                  Our travel experts are here to assist you 24/7.
                </p>
                <div className="space-y-2">
                  <a href="tel:+13322200838" className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
                    <Phone className="w-4 h-4" />
                    <span className="font-medium">+1 (332) 220-0838</span>
                  </a>
                  <a href="mailto:support@fly2any.com" className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
                    <Mail className="w-4 h-4" />
                    <span className="font-medium">support@fly2any.com</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MaxWidthContainer>
    </div>
  );
}