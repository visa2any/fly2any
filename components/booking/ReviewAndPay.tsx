'use client';

import { useState } from 'react';
import { CreditCard, Lock, Apple, ChevronDown, ChevronUp, Check, MapPin, Home, User, Calendar, Wallet, Shield } from 'lucide-react';
import { useCurrency } from '@/lib/context/CurrencyContext';

interface PaymentData {
  method: 'card';
  cardNumber?: string;
  cardName?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  billingAddress?: string;
  billingCity?: string;
  billingZip?: string;
  billingCountry?: string;
  saveCard?: boolean;
}

interface DOTCompliance {
  noCarryOn: boolean;
  noCheckedBag: boolean;
  nonRefundable: boolean;
  noChanges: boolean;
  totalPrice: boolean;
  hour24Cancellation: boolean;
}

interface ReviewAndPayProps {
  flightSummary: {
    route: string;
    date: string;
    airline: string;
    fareClass: string;
    passengers: number;
  };
  totalPrice: number;
  currency: string;
  onSubmit: (paymentData: PaymentData) => void;
  isProcessing?: boolean;
  requiresDOTCompliance?: boolean;
  formId?: string;
  isReturningCustomer?: boolean;
  customerEmail?: string;
}

export function ReviewAndPay({
  flightSummary,
  totalPrice,
  currency,
  onSubmit,
  isProcessing = false,
  requiresDOTCompliance = false,
  formId,
}: ReviewAndPayProps) {
  // CRITICAL: Use global currency context for E2E consistency
  const { getSymbol } = useCurrency();
  const displayCurrency = getSymbol();

  const [paymentMethod] = useState<'card'>('card');
  const [expandedSection, setExpandedSection] = useState<'flight' | 'payment' | null>('payment');

  // Payment form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingZip, setBillingZip] = useState('');
  const [billingCountry, setBillingCountry] = useState('US');
  const [saveCard, setSaveCard] = useState(false);
  const [sameAsContact, setSameAsContact] = useState(true);

  // DOT Compliance checkboxes
  const [dotCompliance, setDotCompliance] = useState<DOTCompliance>({
    noCarryOn: false,
    noCheckedBag: false,
    nonRefundable: false,
    noChanges: false,
    totalPrice: false,
    hour24Cancellation: false,
  });

  const allDOTChecked = Object.values(dotCompliance).every(v => v);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate card number with Luhn
    if (!isValidCardNumber(cardNumber)) {
      setCardError('Please enter a valid card number');
      return;
    }

    if (requiresDOTCompliance && !allDOTChecked) {
      alert('Please acknowledge all fare restrictions before proceeding.');
      return;
    }

    const paymentData: PaymentData = {
      method: paymentMethod,
      cardNumber,
      cardName,
      expiryMonth,
      expiryYear,
      cvv,
      billingAddress,
      billingCity,
      billingZip,
      billingCountry,
      saveCard,
    };

    onSubmit(paymentData);
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  // Luhn algorithm for card validation
  const isValidCardNumber = (num: string): boolean => {
    const digits = num.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(digits)) return false;
    let sum = 0;
    let isEven = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i], 10);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  };

  const [cardError, setCardError] = useState('');

  const toggleSection = (section: 'flight' | 'payment') => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4">
      {/* Flight Summary (Collapsible) */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => toggleSection('flight')}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
              ✈️
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold text-gray-900">Flight Details</h4>
              <p className="text-xs text-gray-600">{flightSummary.route} • {flightSummary.date}</p>
            </div>
          </div>
          {expandedSection === 'flight' ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSection === 'flight' && (
          <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Airline:</span>
                <p className="font-semibold text-gray-900">{flightSummary.airline}</p>
              </div>
              <div>
                <span className="text-gray-600">Fare Class:</span>
                <p className="font-semibold text-gray-900">{flightSummary.fareClass}</p>
              </div>
              <div>
                <span className="text-gray-600">Passengers:</span>
                <p className="font-semibold text-gray-900">{flightSummary.passengers}</p>
              </div>
              <div>
                <span className="text-gray-600">Total:</span>
                <p className="font-bold text-primary-600 text-lg">{displayCurrency} {totalPrice.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Section */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <div className="p-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            <h3 className="text-base font-bold">Secure Payment</h3>
          </div>
          <p className="text-xs mt-1 opacity-90">
            Your payment information is encrypted with 256-bit SSL
          </p>
        </div>

        <div className="p-4">
          {/* Card Payment Form - Mobile-Optimized Layout */}
          <div className="space-y-3">
              {/* Card Details Header */}
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-primary-500" />
                  Card Details *
                </label>
                <span className="text-xs text-gray-500">
                  💳 Visa Mastercard Amex Discover
                </span>
              </div>

              {/* Card Number - Full Width */}
              <div>
                <input
                  type="text"
                  value={formatCardNumber(cardNumber)}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setCardNumber(val);
                    setCardError('');
                  }}
                  onBlur={() => {
                    if (cardNumber.length >= 13 && !isValidCardNumber(cardNumber)) {
                      setCardError('Invalid card number');
                    }
                  }}
                  placeholder="Card Number"
                  maxLength={19}
                  className={`w-full px-3 py-3 text-sm border rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${cardError ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
                {cardError && <p className="text-xs text-red-600 mt-1">{cardError}</p>}
              </div>

              {/* Cardholder Name - Full Width */}
              <div>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Cardholder Name"
                  className="w-full px-3 py-3 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              {/* Expiry & CVV Row - Touch-Friendly */}
              <div className="grid grid-cols-3 gap-2">
                {/* Month */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Expiry Month</label>
                  <select
                    value={expiryMonth}
                    onChange={(e) => setExpiryMonth(e.target.value)}
                    className="w-full px-3 py-3 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">MM</option>
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = (i + 1).toString().padStart(2, '0');
                      return <option key={month} value={month}>{month}</option>;
                    })}
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Expiry Year</label>
                  <select
                    value={expiryYear}
                    onChange={(e) => setExpiryYear(e.target.value)}
                    className="w-full px-3 py-3 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">YY</option>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = (new Date().getFullYear() + i).toString().slice(-2);
                      return <option key={year} value={year}>{year}</option>;
                    })}
                  </select>
                </div>

                {/* CVV */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Security Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    placeholder="CVV"
                    maxLength={4}
                    className="w-full px-3 py-3 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center"
                    required
                  />
                </div>
              </div>

              {/* Billing Address */}
              <div className="pt-3 border-t border-gray-200">
                <h4 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary-500" />
                  Billing Address
                </h4>
                <label className="flex items-center gap-2 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sameAsContact}
                    onChange={(e) => setSameAsContact(e.target.checked)}
                    className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-xs font-semibold text-gray-700">
                    Billing address same as contact information
                  </span>
                </label>

                {!sameAsContact && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={billingAddress}
                      onChange={(e) => setBillingAddress(e.target.value)}
                      placeholder="Street Address"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500"
                      required
                    />

                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={billingCity}
                        onChange={(e) => setBillingCity(e.target.value)}
                        placeholder="City"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500"
                        required
                      />

                      <input
                        type="text"
                        value={billingZip}
                        onChange={(e) => setBillingZip(e.target.value)}
                        placeholder="ZIP Code"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500"
                        required
                      />

                      <select
                        value={billingCountry}
                        onChange={(e) => setBillingCountry(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500"
                        required
                      >
                        <option value="US">United States</option>
                        <option value="GB">United Kingdom</option>
                        <option value="CA">Canada</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Save Card */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveCard}
                  onChange={(e) => setSaveCard(e.target.checked)}
                  className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-xs text-gray-700">
                  Save payment method for faster checkout
                </span>
              </label>
            </div>
        </div>
      </div>

      {/* DOT Compliance Checklist */}
      {requiresDOTCompliance && (
        <div className="border-2 border-warning-300 bg-warning-50 rounded-lg p-4">
          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>⚠️</span> Before Completing Your Purchase
          </h4>

          <div className="space-y-2">
            {[
              { key: 'noCarryOn', text: 'I understand: No carry-on bag allowed (personal item only)' },
              { key: 'noCheckedBag', text: 'I understand: No checked baggage included' },
              { key: 'nonRefundable', text: 'I understand: This ticket is non-refundable' },
              { key: 'noChanges', text: 'I understand: Changes are not permitted' },
              { key: 'totalPrice', text: `I confirm the total price is ${displayCurrency} ${totalPrice.toFixed(2)}` },
              { key: 'hour24Cancellation', text: 'I understand I have 24 hours to cancel for a full refund' },
            ].map(({ key, text }) => (
              <label key={key} className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dotCompliance[key as keyof DOTCompliance]}
                  onChange={(e) => setDotCompliance(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="mt-0.5 w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  required
                />
                <span className="text-xs text-gray-800">{text}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Terms & Conditions */}
      <div className="border border-gray-300 rounded-lg p-4 bg-white">
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
            required
          />
          <span className="text-xs text-gray-700">
            I accept the <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary-600 underline hover:text-primary-700 font-semibold">Terms of Service</a> and{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-600 underline hover:text-primary-700 font-semibold">Privacy Policy</a>
          </span>
        </label>
      </div>

      {/* FINAL SUBMIT BUTTON - AT BOTTOM */}
      <div className="border-2 border-success-500 rounded-lg p-4 bg-gradient-to-br from-success-50 to-success-100 shadow-lg">
        <button
          type="submit"
          disabled={isProcessing}
          className={`
            w-full py-4 px-6 rounded-xl font-black text-white text-lg shadow-2xl transition-all transform
            ${isProcessing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-success-500 via-success-600 to-success-500 hover:from-success-600 hover:via-success-700 hover:to-success-600 hover:shadow-2xl hover:scale-105 active:scale-95 animate-pulse'
            }
          `}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing Payment...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Lock className="w-5 h-5" />
              COMPLETE BOOKING • {displayCurrency} {totalPrice.toFixed(2)}
            </span>
          )}
        </button>

        {/* Enhanced Trust Signals */}
        <div className="mt-4 space-y-3">
          {/* Payment Method Logos */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md">
              <CreditCard className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-semibold text-gray-700">VISA</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md">
              <CreditCard className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-semibold text-gray-700">MASTERCARD</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md">
              <CreditCard className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-semibold text-gray-700">AMEX</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md">
              <Wallet className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-gray-700">PAYPAL</span>
            </div>
          </div>

          {/* Security Badges */}
          <div className="flex items-center justify-center gap-4 text-xs text-gray-600 font-medium">
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-green-600" />
              <span>256-bit SSL</span>
            </div>
            <span className="text-gray-400">•</span>
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>PCI DSS Compliant</span>
            </div>
            <span className="text-gray-400">•</span>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-green-600" />
              <span>3D Secure</span>
            </div>
          </div>

          {/* Support & Trust Indicators */}
          <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold">24/7 Support</span>
              <a href="mailto:support@fly2any.com" className="text-primary-600 hover:underline font-medium">
                Contact Us
              </a>
            </div>
            <span className="text-gray-400">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-green-600 font-semibold">✓</span>
              <span>500K+ Happy Travelers</span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
