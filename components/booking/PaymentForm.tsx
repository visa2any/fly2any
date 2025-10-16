'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Info,
  Wallet,
  Smartphone,
  Plus,
  Trash2
} from 'lucide-react';

// Card type detection
type CardType = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown';

interface PaymentMethod {
  id: string;
  type: CardType;
  last4: string;
  expiryDate: string;
  cardholderName: string;
}

interface PriceBreakdown {
  baseFarePerPassenger: number;
  passengers: number;
  taxesAndFees: number;
  seatSelection?: number;
  baggageFees?: number;
  travelInsurance?: number;
}

interface PaymentFormProps {
  priceBreakdown: PriceBreakdown;
  onSubmit?: (paymentData: any) => void;
  passengerAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  priceBreakdown,
  onSubmit,
  passengerAddress
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'applepay' | 'googlepay' | 'saved'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardType, setCardType] = useState<CardType>('unknown');
  const [sameAsPassenger, setSameAsPassenger] = useState(false);
  const [saveCard, setSaveCard] = useState(false);
  const [includeInsurance, setIncludeInsurance] = useState(!!priceBreakdown.travelInsurance);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCvvTooltip, setShowCvvTooltip] = useState(false);

  // Validation states
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});

  // Billing address
  const [billingAddress, setBillingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA'
  });

  // Mock saved payment methods
  const [savedMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'visa', last4: '4242', expiryDate: '12/25', cardholderName: 'John Doe' },
    { id: '2', type: 'mastercard', last4: '5555', expiryDate: '09/26', cardholderName: 'John Doe' },
  ]);
  const [selectedSavedMethod, setSelectedSavedMethod] = useState<string>('');

  // Sync billing with passenger address
  useEffect(() => {
    if (sameAsPassenger && passengerAddress) {
      setBillingAddress({
        street: passengerAddress.street,
        city: passengerAddress.city,
        state: passengerAddress.state,
        zipCode: passengerAddress.zipCode,
        country: passengerAddress.country
      });
    }
  }, [sameAsPassenger, passengerAddress]);

  // Card type detection
  const detectCardType = (number: string): CardType => {
    const cleaned = number.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6(?:011|5)/.test(cleaned)) return 'discover';
    return 'unknown';
  };

  // Format card number
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const type = detectCardType(cleaned);
    setCardType(type);

    let formatted = cleaned;
    if (type === 'amex') {
      // Amex: 4-6-5 format
      formatted = cleaned.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3').trim();
    } else {
      // Others: 4-4-4-4 format
      formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
    }

    setCardNumber(formatted);
  };

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      setExpiryDate(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
    } else {
      setExpiryDate(cleaned);
    }
  };

  // Luhn algorithm validation
  const validateCardNumber = (number: string): boolean => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.length < 13 || cleaned.length > 19) return false;

    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  };

  // Validate expiry date
  const validateExpiryDate = (date: string): boolean => {
    if (!/^\d{2}\/\d{2}$/.test(date)) return false;

    const [month, year] = date.split('/').map(Number);
    if (month < 1 || month > 12) return false;

    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;

    return true;
  };

  // Validate CVV
  const validateCVV = (cvv: string): boolean => {
    if (cardType === 'amex') return /^\d{4}$/.test(cvv);
    return /^\d{3}$/.test(cvv);
  };

  // Handle blur events
  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    validateField(field);
  };

  // Validate individual field
  const validateField = (field: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'cardNumber':
        if (!cardNumber) {
          newErrors.cardNumber = 'Card number is required';
        } else if (!validateCardNumber(cardNumber)) {
          newErrors.cardNumber = 'Invalid card number';
        } else {
          delete newErrors.cardNumber;
        }
        break;
      case 'cardholderName':
        if (!cardholderName) {
          newErrors.cardholderName = 'Cardholder name is required';
        } else if (cardholderName.length < 3) {
          newErrors.cardholderName = 'Name is too short';
        } else {
          delete newErrors.cardholderName;
        }
        break;
      case 'expiryDate':
        if (!expiryDate) {
          newErrors.expiryDate = 'Expiry date is required';
        } else if (!validateExpiryDate(expiryDate)) {
          newErrors.expiryDate = 'Invalid or expired date';
        } else {
          delete newErrors.expiryDate;
        }
        break;
      case 'cvv':
        if (!cvv) {
          newErrors.cvv = 'CVV is required';
        } else if (!validateCVV(cvv)) {
          newErrors.cvv = cardType === 'amex' ? 'CVV must be 4 digits' : 'CVV must be 3 digits';
        } else {
          delete newErrors.cvv;
        }
        break;
    }

    setErrors(newErrors);
  };

  // Calculate total
  const calculateTotal = () => {
    let total = priceBreakdown.baseFarePerPassenger * priceBreakdown.passengers;
    total += priceBreakdown.taxesAndFees;
    if (priceBreakdown.seatSelection) total += priceBreakdown.seatSelection;
    if (priceBreakdown.baggageFees) total += priceBreakdown.baggageFees;
    if (includeInsurance && priceBreakdown.travelInsurance) total += priceBreakdown.travelInsurance;
    return total;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    if (paymentMethod === 'card') {
      setTouched({
        cardNumber: true,
        cardholderName: true,
        expiryDate: true,
        cvv: true
      });

      validateField('cardNumber');
      validateField('cardholderName');
      validateField('expiryDate');
      validateField('cvv');

      if (Object.keys(errors).length > 0) return;
    }

    // Simulate payment processing
    setIsProcessing(true);

    setTimeout(() => {
      const paymentData = {
        method: paymentMethod,
        cardType,
        last4: cardNumber.slice(-4),
        amount: calculateTotal(),
        billingAddress,
        saveCard,
        timestamp: new Date().toISOString()
      };

      if (onSubmit) {
        onSubmit(paymentData);
      } else {
        console.log('Payment processed:', paymentData);
        alert('Payment processed successfully! (Mock)');
      }

      setIsProcessing(false);
    }, 2000);
  };

  // Card type icons
  const getCardIcon = (type: CardType) => {
    const baseClass = "h-8 w-12 object-contain";
    switch (type) {
      case 'visa':
        return <div className={`${baseClass} bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold`}>VISA</div>;
      case 'mastercard':
        return <div className={`${baseClass} bg-red-600 rounded flex items-center justify-center text-white text-xs font-bold`}>MC</div>;
      case 'amex':
        return <div className={`${baseClass} bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold`}>AMEX</div>;
      case 'discover':
        return <div className={`${baseClass} bg-orange-500 rounded flex items-center justify-center text-white text-xs font-bold`}>DISC</div>;
      default:
        return <CreditCard className="h-6 w-6 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            {/* Security Header */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Lock className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">Secure Payment</h2>
                  <p className="text-sm text-gray-600">Your payment information is encrypted</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="px-3 py-1 bg-green-50 border border-green-200 rounded-full flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-green-700">SSL</span>
                </div>
                <div className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">PCI</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-4">Payment Method</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    paymentMethod === 'card'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CreditCard className="h-6 w-6 mx-auto mb-2 text-gray-700" />
                  <span className="text-xs font-medium text-gray-700">Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    paymentMethod === 'paypal'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Wallet className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <span className="text-xs font-medium text-gray-700">PayPal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('applepay')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    paymentMethod === 'applepay'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Smartphone className="h-6 w-6 mx-auto mb-2 text-gray-700" />
                  <span className="text-xs font-medium text-gray-700">Apple Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('googlepay')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    paymentMethod === 'googlepay'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Smartphone className="h-6 w-6 mx-auto mb-2 text-gray-700" />
                  <span className="text-xs font-medium text-gray-700">Google Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('saved')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    paymentMethod === 'saved'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <span className="text-xs font-medium text-gray-700">Saved</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Saved Payment Methods */}
              {paymentMethod === 'saved' && (
                <div className="space-y-3 mb-6">
                  {savedMethods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setSelectedSavedMethod(method.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedSavedMethod === method.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {getCardIcon(method.type)}
                          <div>
                            <p className="font-medium text-gray-900">•••• {method.last4}</p>
                            <p className="text-sm text-gray-600">{method.cardholderName} • Expires {method.expiryDate}</p>
                          </div>
                        </div>
                        <button type="button" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all flex items-center justify-center gap-2 text-gray-600 hover:text-primary-600"
                  >
                    <Plus className="h-5 w-5" />
                    <span className="font-medium">Add New Card</span>
                  </button>
                </div>
              )}

              {/* Card Payment Form */}
              {paymentMethod === 'card' && (
                <div className="space-y-6">
                  {/* Card Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => formatCardNumber(e.target.value)}
                        onBlur={() => handleBlur('cardNumber')}
                        maxLength={cardType === 'amex' ? 17 : 19}
                        placeholder="1234 5678 9012 3456"
                        className={`w-full px-4 py-3 pr-12 border-2 rounded-lg focus:outline-none transition-colors ${
                          touched.cardNumber && errors.cardNumber
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:border-primary-500'
                        }`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {getCardIcon(cardType)}
                      </div>
                    </div>
                    {touched.cardNumber && errors.cardNumber && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.cardNumber}
                      </p>
                    )}
                  </div>

                  {/* Cardholder Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                      onBlur={() => handleBlur('cardholderName')}
                      placeholder="JOHN DOE"
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                        touched.cardholderName && errors.cardholderName
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:border-primary-500'
                      }`}
                    />
                    {touched.cardholderName && errors.cardholderName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.cardholderName}
                      </p>
                    )}
                  </div>

                  {/* Expiry & CVV */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={expiryDate}
                        onChange={(e) => formatExpiryDate(e.target.value)}
                        onBlur={() => handleBlur('expiryDate')}
                        maxLength={5}
                        placeholder="MM/YY"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                          touched.expiryDate && errors.expiryDate
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:border-primary-500'
                        }`}
                      />
                      {touched.expiryDate && errors.expiryDate && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.expiryDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        CVV
                        <button
                          type="button"
                          onMouseEnter={() => setShowCvvTooltip(true)}
                          onMouseLeave={() => setShowCvvTooltip(false)}
                          className="ml-1 inline-block"
                        >
                          <Info className="h-4 w-4 text-gray-400 inline" />
                        </button>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                          onBlur={() => handleBlur('cvv')}
                          maxLength={cardType === 'amex' ? 4 : 3}
                          placeholder={cardType === 'amex' ? '1234' : '123'}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                            touched.cvv && errors.cvv
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-gray-300 focus:border-primary-500'
                          }`}
                        />
                        {showCvvTooltip && (
                          <div className="absolute z-10 -top-20 right-0 bg-gray-900 text-white text-xs rounded-lg p-3 w-48">
                            <p>3-digit code on the back of your card (4 digits for Amex on the front)</p>
                          </div>
                        )}
                      </div>
                      {touched.cvv && errors.cvv && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.cvv}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Billing Address */}
                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Billing Address</h3>
                      {passengerAddress && (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sameAsPassenger}
                            onChange={(e) => setSameAsPassenger(e.target.checked)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700">Same as passenger</span>
                        </label>
                      )}
                    </div>

                    <div className="space-y-4">
                      <input
                        type="text"
                        value={billingAddress.street}
                        onChange={(e) => setBillingAddress({ ...billingAddress, street: e.target.value })}
                        placeholder="Street Address"
                        disabled={sameAsPassenger}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />

                      <div className="grid md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={billingAddress.city}
                          onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                          placeholder="City"
                          disabled={sameAsPassenger}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />

                        <input
                          type="text"
                          value={billingAddress.state}
                          onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                          placeholder="State"
                          disabled={sameAsPassenger}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={billingAddress.zipCode}
                          onChange={(e) => setBillingAddress({ ...billingAddress, zipCode: e.target.value })}
                          placeholder="ZIP Code"
                          disabled={sameAsPassenger}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />

                        <select
                          value={billingAddress.country}
                          onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })}
                          disabled={sameAsPassenger}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option value="USA">United States</option>
                          <option value="CAN">Canada</option>
                          <option value="MEX">Mexico</option>
                          <option value="UK">United Kingdom</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Save Card Checkbox */}
                  <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Save card for future bookings</p>
                      <p className="text-sm text-gray-600">Your card will be securely saved for faster checkout</p>
                    </div>
                  </label>
                </div>
              )}

              {/* PayPal */}
              {paymentMethod === 'paypal' && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                    <Wallet className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">PayPal Checkout</h3>
                  <p className="text-gray-600 mb-6">You will be redirected to PayPal to complete your payment</p>
                  <button
                    type="button"
                    className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Continue to PayPal
                  </button>
                </div>
              )}

              {/* Apple Pay */}
              {paymentMethod === 'applepay' && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-900 rounded-full mb-4">
                    <Smartphone className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Apple Pay</h3>
                  <p className="text-gray-600 mb-6">Pay securely with Apple Pay</p>
                  <button
                    type="button"
                    className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Pay with Apple Pay
                  </button>
                </div>
              )}

              {/* Google Pay */}
              {paymentMethod === 'googlepay' && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                    <Smartphone className="h-10 w-10 text-gray-700" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Google Pay</h3>
                  <p className="text-gray-600 mb-6">Pay securely with Google Pay</p>
                  <button
                    type="button"
                    className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Pay with Google Pay
                  </button>
                </div>
              )}

              {/* 3D Secure Notice */}
              {(paymentMethod === 'card' || paymentMethod === 'saved') && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">3D Secure Authentication</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Your bank may require additional verification for this transaction. This adds an extra layer of security to your payment.
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing || (paymentMethod === 'saved' && !selectedSavedMethod)}
                className="w-full mt-6 py-4 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5" />
                    Complete Booking - ${calculateTotal().toFixed(2)}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Price Breakdown</h3>

            <div className="space-y-4">
              <div className="flex justify-between text-gray-700">
                <span>Base Fare ({priceBreakdown.passengers} passenger{priceBreakdown.passengers > 1 ? 's' : ''})</span>
                <span className="font-medium">${(priceBreakdown.baseFarePerPassenger * priceBreakdown.passengers).toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-gray-700">
                <span>Taxes & Fees</span>
                <span className="font-medium">${priceBreakdown.taxesAndFees.toFixed(2)}</span>
              </div>

              {priceBreakdown.seatSelection && priceBreakdown.seatSelection > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Seat Selection</span>
                  <span className="font-medium">${priceBreakdown.seatSelection.toFixed(2)}</span>
                </div>
              )}

              {priceBreakdown.baggageFees && priceBreakdown.baggageFees > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Baggage Fees</span>
                  <span className="font-medium">${priceBreakdown.baggageFees.toFixed(2)}</span>
                </div>
              )}

              {priceBreakdown.travelInsurance && (
                <div className="border-t border-gray-200 pt-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeInsurance}
                      onChange={(e) => setIncludeInsurance(e.target.checked)}
                      className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">Travel Insurance</p>
                          <p className="text-xs text-gray-600 mt-1">Trip cancellation & medical coverage</p>
                        </div>
                        <span className="font-medium text-gray-700">${priceBreakdown.travelInsurance.toFixed(2)}</span>
                      </div>
                    </div>
                  </label>
                </div>
              )}

              <div className="border-t-2 border-gray-300 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Total</span>
                  <span className="text-3xl font-bold text-primary-600">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
                    <Lock className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-700">256-bit SSL</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
                    <ShieldCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-700">PCI DSS</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-2">
                    <CheckCircle2 className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-700">Verified</p>
                </div>
              </div>
            </div>

            {/* Refund Policy */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                <strong className="text-gray-900">Secure Payment Guarantee:</strong> Your payment information is encrypted and never stored on our servers. Full refund available up to 24 hours before departure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
