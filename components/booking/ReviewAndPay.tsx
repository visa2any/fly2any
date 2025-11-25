'use client';

import { useState } from 'react';
import { CreditCard, Lock, Apple, ChevronDown, ChevronUp, Check, MapPin, Home, User, Calendar, Shield, Wallet, PenLine } from 'lucide-react';
import { CompactDocumentUpload } from './CompactDocumentUpload';

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
  // Authorization fields
  signatureName?: string;
  authorizationAccepted?: boolean;
  documents?: {
    cardFront: string | null;
    cardBack: string | null;
    photoId: string | null;
  };
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
  isReturningCustomer?: boolean; // Skip document verification for returning customers
  customerEmail?: string; // Used to check returning customer status
}

export function ReviewAndPay({
  flightSummary,
  totalPrice,
  currency,
  onSubmit,
  isProcessing = false,
  requiresDOTCompliance = false,
  formId,
  isReturningCustomer = false,
  customerEmail,
}: ReviewAndPayProps) {
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

  // Authorization state
  const [signatureName, setSignatureName] = useState('');
  const [authorizationAccepted, setAuthorizationAccepted] = useState(false);
  const [documents, setDocuments] = useState<{
    cardFront: string | null;
    cardBack: string | null;
    photoId: string | null;
  }>({
    cardFront: null,
    cardBack: null,
    photoId: null,
  });

  // Check if documents are complete (all 3 uploaded or returning customer)
  const documentsComplete = isReturningCustomer ||
    (documents.cardFront && documents.cardBack && documents.photoId);

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

    if (requiresDOTCompliance && !allDOTChecked) {
      alert('Please acknowledge all fare restrictions before proceeding.');
      return;
    }

    // Validate authorization
    if (!signatureName.trim()) {
      alert('Please type your full name to authorize this payment.');
      return;
    }

    if (!authorizationAccepted) {
      alert('Please accept the payment authorization to continue.');
      return;
    }

    // Validate documents (required for new customers)
    if (!isReturningCustomer && !documentsComplete) {
      alert('Please upload all verification documents (Card Front, Card Back, and Photo ID) to continue.');
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
      // Authorization data
      signatureName,
      authorizationAccepted,
      documents: isReturningCustomer ? undefined : documents,
    };

    onSubmit(paymentData);
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

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
                <p className="font-bold text-primary-600 text-lg">{currency} {totalPrice.toFixed(2)}</p>
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
          {/* Card Payment Form - Ultra Compact Single Row */}
          <div className="space-y-3">
              {/* All Card Fields in ONE Row */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-primary-500" />
                    Card Details *
                  </label>
                  <span className="text-xs text-gray-500">
                    💳 Visa Mastercard Amex Discover
                  </span>
                </div>
                <div className="grid grid-cols-12 gap-2">
                  {/* Card Number - 5 cols */}
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={formatCardNumber(cardNumber)}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ''))}
                      placeholder="Card Number"
                      maxLength={19}
                      className="w-full px-2 py-2 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  {/* Cardholder Name - 4 cols */}
                  <div className="col-span-4">
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Cardholder Name"
                      className="w-full px-2 py-2 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  {/* Month - 1 col */}
                  <div className="col-span-1">
                    <select
                      value={expiryMonth}
                      onChange={(e) => setExpiryMonth(e.target.value)}
                      className="w-full px-1 py-2 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="">MM</option>
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = (i + 1).toString().padStart(2, '0');
                        return <option key={month} value={month}>{month}</option>;
                      })}
                    </select>
                  </div>

                  {/* Year - 1 col */}
                  <div className="col-span-1">
                    <select
                      value={expiryYear}
                      onChange={(e) => setExpiryYear(e.target.value)}
                      className="w-full px-1 py-2 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="">YY</option>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = (new Date().getFullYear() + i).toString().slice(-2);
                        return <option key={year} value={year}>{year}</option>;
                      })}
                    </select>
                  </div>

                  {/* CVV - 1 col */}
                  <div className="col-span-1">
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="CVV"
                      maxLength={4}
                      className="w-full px-1 py-2 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center"
                      required
                    />
                  </div>
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

      {/* Payment Authorization Section */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <div className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white">
          <div className="flex items-center gap-2">
            <PenLine className="w-5 h-5" />
            <h3 className="text-base font-bold">Payment Authorization</h3>
          </div>
          <p className="text-xs mt-1 opacity-90">
            Required to process your booking securely
          </p>
        </div>

        <div className="p-4 space-y-4">
          {/* Signature Input */}
          <div>
            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 mb-1.5">
              <PenLine className="w-3.5 h-3.5 text-primary-500" />
              Type your full name to sign *
            </label>
            <input
              type="text"
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value.toUpperCase())}
              placeholder="JOHN SMITH"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-medium tracking-wide"
              required
            />
            <p className="text-[10px] text-gray-500 mt-1">
              This serves as your electronic signature authorizing this transaction
            </p>
          </div>

          {/* Document Upload */}
          <CompactDocumentUpload
            onDocumentsChange={setDocuments}
            required={!isReturningCustomer}
            isReturningCustomer={isReturningCustomer}
          />

          {/* Authorization Checkbox */}
          <div className="pt-3 border-t border-gray-200">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={authorizationAccepted}
                onChange={(e) => setAuthorizationAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                required
              />
              <span className="text-xs text-gray-700 leading-relaxed">
                I, <strong className="text-gray-900">{signatureName || '[Your Name]'}</strong>, authorize
                Fly2Any Travel to charge <strong className="text-primary-600">{currency} {totalPrice.toFixed(2)}</strong> to
                my credit card. I confirm that I am the cardholder (or authorized to use this card), all
                passenger information is accurate, and I accept the fare rules and cancellation policy.
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
              { key: 'totalPrice', text: `I confirm the total price is ${currency} ${totalPrice.toFixed(2)}` },
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
              COMPLETE BOOKING • {currency} {totalPrice.toFixed(2)}
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
