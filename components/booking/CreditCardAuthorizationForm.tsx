'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Lock,
  ShieldCheck,
  User,
  MapPin,
  Mail,
  Phone,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SignatureCanvas } from './SignatureCanvas';
import { DocumentCapture } from './DocumentCapture';
import { COUNTRIES } from '@/lib/data/countries';

type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown';

interface BookingInfo {
  bookingReference: string;
  amount: number;
  currency: string;
  route: string;
  travelDate: string;
  passengerNames: string[];
}

interface CreditCardAuthorizationFormProps {
  booking: BookingInfo;
  onSubmit: (data: CardAuthorizationData) => Promise<void>;
  onCancel?: () => void;
  prefillEmail?: string;
  prefillPhone?: string;
}

export interface CardAuthorizationData {
  cardholderName: string;
  cardNumber: string;
  cardLast4: string;
  cardBrand: CardBrand;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  billingStreet: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  billingCountry: string;
  email: string;
  phone: string;
  cardFrontImage: string | null;
  cardBackImage: string | null;
  idDocumentImage: string | null;
  signatureImage: string | null;
  signatureTyped: string;
  ackAuthorize: boolean;
  ackCardholder: boolean;
  ackNonRefundable: boolean;
  ackPassengerInfo: boolean;
  ackTerms: boolean;
}

export function CreditCardAuthorizationForm({
  booking,
  onSubmit,
  onCancel,
  prefillEmail = '',
  prefillPhone = '',
}: CreditCardAuthorizationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDocuments, setShowDocuments] = useState(false);

  // Form state
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardBrand, setCardBrand] = useState<CardBrand>('unknown');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [billingStreet, setBillingStreet] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingState, setBillingState] = useState('');
  const [billingZip, setBillingZip] = useState('');
  const [billingCountry, setBillingCountry] = useState('US');
  const [email, setEmail] = useState(prefillEmail);
  const [phone, setPhone] = useState(prefillPhone);

  // Document captures
  const [cardFrontImage, setCardFrontImage] = useState<string | null>(null);
  const [cardBackImage, setCardBackImage] = useState<string | null>(null);
  const [idDocumentImage, setIdDocumentImage] = useState<string | null>(null);

  // Signature
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [signatureTyped, setSignatureTyped] = useState('');

  // Acknowledgments
  const [ackAuthorize, setAckAuthorize] = useState(false);
  const [ackCardholder, setAckCardholder] = useState(false);
  const [ackNonRefundable, setAckNonRefundable] = useState(false);
  const [ackPassengerInfo, setAckPassengerInfo] = useState(false);
  const [ackTerms, setAckTerms] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Detect card brand
  const detectCardBrand = useCallback((number: string): CardBrand => {
    const cleaned = number.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6(?:011|5)/.test(cleaned)) return 'discover';
    return 'unknown';
  }, []);

  // Format card number
  const formatCardNumber = useCallback((value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const brand = detectCardBrand(cleaned);
    setCardBrand(brand);

    let formatted = cleaned;
    if (brand === 'amex') {
      formatted = cleaned.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3').trim();
    } else {
      formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
    }
    return formatted.substring(0, brand === 'amex' ? 17 : 19);
  }, [detectCardBrand]);

  // Format expiry date
  const formatExpiryDate = useCallback((value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  }, []);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!cardholderName.trim()) newErrors.cardholderName = 'Required';
    if (!cardNumber.replace(/\s/g, '') || cardNumber.replace(/\s/g, '').length < 13)
      newErrors.cardNumber = 'Invalid card number';
    if (!expiryDate || expiryDate.length !== 5) newErrors.expiryDate = 'Invalid';
    if (!cvv || (cardBrand === 'amex' ? cvv.length !== 4 : cvv.length !== 3))
      newErrors.cvv = 'Invalid';
    if (!billingStreet.trim()) newErrors.billingStreet = 'Required';
    if (!billingCity.trim()) newErrors.billingCity = 'Required';
    if (!billingState.trim()) newErrors.billingState = 'Required';
    if (!billingZip.trim()) newErrors.billingZip = 'Required';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = 'Invalid email';
    if (!phone.trim()) newErrors.phone = 'Required';
    if (!signatureTyped.trim()) newErrors.signatureTyped = 'Required';
    if (!ackAuthorize) newErrors.ackAuthorize = 'Required';
    if (!ackCardholder) newErrors.ackCardholder = 'Required';
    if (!ackNonRefundable) newErrors.ackNonRefundable = 'Required';
    if (!ackPassengerInfo) newErrors.ackPassengerInfo = 'Required';
    if (!ackTerms) newErrors.ackTerms = 'Required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    cardholderName, cardNumber, expiryDate, cvv, cardBrand,
    billingStreet, billingCity, billingState, billingZip,
    email, phone, signatureTyped,
    ackAuthorize, ackCardholder, ackNonRefundable, ackPassengerInfo, ackTerms,
  ]);

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      setError('Please complete all required fields');
      return;
    }

    const [monthStr, yearStr] = expiryDate.split('/');
    const cleanedCardNumber = cardNumber.replace(/\s/g, '');

    const data: CardAuthorizationData = {
      cardholderName: cardholderName.toUpperCase(),
      cardNumber: cleanedCardNumber,
      cardLast4: cleanedCardNumber.slice(-4),
      cardBrand,
      expiryMonth: parseInt(monthStr, 10),
      expiryYear: parseInt(`20${yearStr}`, 10),
      cvv,
      billingStreet,
      billingCity,
      billingState,
      billingZip,
      billingCountry,
      email,
      phone,
      cardFrontImage,
      cardBackImage,
      idDocumentImage,
      signatureImage,
      signatureTyped,
      ackAuthorize,
      ackCardholder,
      ackNonRefundable,
      ackPassengerInfo,
      ackTerms,
    };

    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (err: any) {
      setError(err.message || 'Failed to submit authorization');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Card brand icon
  const getCardBrandIcon = () => {
    const baseClass = 'h-6 w-9 rounded flex items-center justify-center text-white text-[10px] font-bold';
    switch (cardBrand) {
      case 'visa':
        return <div className={`${baseClass} bg-blue-600`}>VISA</div>;
      case 'mastercard':
        return <div className={`${baseClass} bg-red-600`}>MC</div>;
      case 'amex':
        return <div className={`${baseClass} bg-blue-500`}>AMEX</div>;
      case 'discover':
        return <div className={`${baseClass} bg-orange-500`}>DISC</div>;
      default:
        return <CreditCard className="h-5 w-5 text-gray-400" />;
    }
  };

  // Check if all acknowledgments are checked
  const allAcknowledged = ackAuthorize && ackCardholder && ackNonRefundable && ackPassengerInfo && ackTerms;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-3">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-white" />
          <div>
            <h2 className="text-base font-bold text-white">Credit Card Authorization</h2>
            <p className="text-xs text-primary-100">Secure payment authorization form</p>
          </div>
        </div>
      </div>

      {/* Booking Summary */}
      <div className="bg-primary-50 px-4 py-2.5 border-b border-primary-100">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="font-semibold text-primary-900">{booking.bookingReference}</span>
          <span className="text-primary-700">{booking.route}</span>
          <span className="text-primary-700">{booking.travelDate}</span>
          <span className="ml-auto font-bold text-primary-900">
            {booking.currency} {booking.amount.toLocaleString()}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Section: Card Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <CreditCard className="w-4 h-4 text-primary-600" />
            Card Information
          </div>

          {/* Cardholder Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Name on Card <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
              placeholder="JOHN DOE"
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.cardholderName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>

          {/* Card Number */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Card Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className={`w-full px-3 py-2 pr-14 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                {getCardBrandIcon()}
              </div>
            </div>
          </div>

          {/* Expiry & CVV */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Expiry <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                placeholder="MM/YY"
                maxLength={5}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                CVV <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                placeholder={cardBrand === 'amex' ? '1234' : '123'}
                maxLength={cardBrand === 'amex' ? 4 : 3}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.cvv ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Section: Billing Address */}
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <MapPin className="w-4 h-4 text-primary-600" />
            Billing Address
          </div>

          <input
            type="text"
            value={billingStreet}
            onChange={(e) => setBillingStreet(e.target.value)}
            placeholder="Street Address"
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.billingStreet ? 'border-red-500' : 'border-gray-300'
            }`}
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={billingCity}
              onChange={(e) => setBillingCity(e.target.value)}
              placeholder="City"
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.billingCity ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <input
              type="text"
              value={billingState}
              onChange={(e) => setBillingState(e.target.value)}
              placeholder="State"
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.billingState ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={billingZip}
              onChange={(e) => setBillingZip(e.target.value)}
              placeholder="ZIP Code"
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.billingZip ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <select
              value={billingCountry}
              onChange={(e) => setBillingCountry(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section: Contact */}
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Mail className="w-4 h-4 text-primary-600" />
            Contact Information
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Section: Document Verification (Collapsible) */}
        <div className="pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setShowDocuments(!showDocuments)}
            className="w-full flex items-center justify-between py-2 text-sm font-semibold text-gray-900"
          >
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-primary-600" />
              Document Verification
              <span className="text-xs font-normal text-gray-500">(Optional but recommended)</span>
            </div>
            {showDocuments ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {showDocuments && (
            <div className="space-y-3 pt-2">
              <p className="text-xs text-gray-600 bg-amber-50 border border-amber-200 rounded-lg p-2">
                Upload card and ID photos for faster verification and added security. This helps prevent chargebacks and fraud.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <DocumentCapture
                  label="Card Front"
                  type="card-front"
                  onCapture={setCardFrontImage}
                  hint="Last 4 digits visible, cover middle"
                />
                <DocumentCapture
                  label="Card Back"
                  type="card-back"
                  onCapture={setCardBackImage}
                  hint="Signature visible, cover CVV"
                />
                <DocumentCapture
                  label="Photo ID"
                  type="id"
                  onCapture={setIdDocumentImage}
                  hint="Passport or Driver's License"
                />
              </div>
            </div>
          )}
        </div>

        {/* Section: Authorization & Signature */}
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <ShieldCheck className="w-4 h-4 text-primary-600" />
            Authorization & Signature
          </div>

          {/* Acknowledgments */}
          <div className="space-y-2 bg-gray-50 rounded-lg p-3">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={ackAuthorize}
                onChange={(e) => setAckAuthorize(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-xs text-gray-700">
                I authorize Fly2Any Travel to charge my credit card for{' '}
                <strong>{booking.currency} {booking.amount.toLocaleString()}</strong>
              </span>
            </label>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={ackCardholder}
                onChange={(e) => setAckCardholder(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-xs text-gray-700">
                I am the cardholder or an authorized user of this card
              </span>
            </label>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={ackNonRefundable}
                onChange={(e) => setAckNonRefundable(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-xs text-gray-700">
                I understand tickets are subject to airline fare rules and may be non-refundable
              </span>
            </label>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={ackPassengerInfo}
                onChange={(e) => setAckPassengerInfo(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-xs text-gray-700">
                I confirm all passenger names match government-issued ID exactly
              </span>
            </label>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={ackTerms}
                onChange={(e) => setAckTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-xs text-gray-700">
                I agree to the{' '}
                <a href="/terms" className="text-primary-600 underline" target="_blank">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/cancellation-policy" className="text-primary-600 underline" target="_blank">
                  Cancellation Policy
                </a>
              </span>
            </label>
          </div>

          {/* Signature */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Digital Signature <span className="text-red-500">*</span>
            </label>
            <SignatureCanvas onSignatureChange={setSignatureImage} width={320} height={100} />
          </div>

          {/* Typed Name Confirmation */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Type your full legal name to confirm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={signatureTyped}
              onChange={(e) => setSignatureTyped(e.target.value)}
              placeholder="John Doe"
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.signatureTyped ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-start gap-2 p-2.5 bg-green-50 border border-green-200 rounded-lg">
          <Lock className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-green-800">
            Your information is encrypted and securely stored. Card details are used only for this transaction.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !allAcknowledged}
            className="flex-1 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Submit Authorization
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
