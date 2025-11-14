'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  CreditCard,
  Plus,
  Edit,
  Trash2,
  Star,
  Shield,
  Check,
  X,
  Loader2,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PaymentMethod {
  id: string;
  type: string;
  provider: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cardholderName?: string;
  isDefault: boolean;
  nickname?: string;
  createdAt: string;
}

export default function PaymentMethodsPage() {
  const { data: session, status } = useSession();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    type: 'card',
    nickname: '',
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    isDefault: false,
  });

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPaymentMethods();
    }
  }, [status]);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/payment-methods');
      if (response.ok) {
        const data = await response.json();
        setMethods(data.methods || []);
      }
    } catch (error) {
      toast.error('Failed to load payment methods');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (method?: PaymentMethod) => {
    if (method) {
      setEditingMethod(method);
      setFormData({
        type: method.type,
        nickname: method.nickname || '',
        cardNumber: '',
        cardholderName: method.cardholderName || '',
        expiryMonth: method.expiryMonth?.toString() || '',
        expiryYear: method.expiryYear?.toString() || '',
        cvv: '',
        isDefault: method.isDefault,
      });
    } else {
      setEditingMethod(null);
      resetForm();
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      type: 'card',
      nickname: '',
      cardNumber: '',
      cardholderName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      isDefault: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingMethod
        ? `/api/payment-methods/${editingMethod.id}`
        : '/api/payment-methods';

      const method = editingMethod ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save payment method');
      }

      toast.success(editingMethod ? 'Payment method updated!' : 'Payment method added!');
      setShowModal(false);
      fetchPaymentMethods();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save payment method');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;

    try {
      const response = await fetch(`/api/payment-methods/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');

      toast.success('Payment method deleted');
      fetchPaymentMethods();
    } catch (error) {
      toast.error('Failed to delete payment method');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch(`/api/payment-methods/${id}/set-default`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to set default');

      toast.success('Default payment method updated');
      fetchPaymentMethods();
    } catch (error) {
      toast.error('Failed to update default payment method');
    }
  };

  const getCardIcon = (brand?: string) => {
    const brandLower = brand?.toLowerCase();
    if (brandLower === 'visa') return '💳 Visa';
    if (brandLower === 'mastercard') return '💳 Mastercard';
    if (brandLower === 'amex') return '💳 Amex';
    if (brandLower === 'discover') return '💳 Discover';
    return '💳 Card';
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-primary-500" />
            Payment Methods
          </h1>
          <p className="text-gray-600 mt-1">Manage your saved payment methods for faster checkout</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Payment Method
        </button>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-1">Secure Payment Processing</h3>
            <p className="text-sm text-blue-700">
              Your payment information is encrypted and securely stored. We never store your full card number or CVV.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Methods</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{methods.length}</p>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <CreditCard className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Credit Cards</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {methods.filter(m => m.type === 'card').length}
              </p>
            </div>
            <div className="p-3 bg-success-50 rounded-lg">
              <CreditCard className="w-6 h-6 text-success-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Default Set</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {methods.some(m => m.isDefault) ? 'Yes' : 'No'}
              </p>
            </div>
            <div className="p-3 bg-warning-50 rounded-lg">
              <Star className="w-6 h-6 text-warning-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods List */}
      {methods.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No payment methods yet</h3>
          <p className="text-gray-600 mb-6">Add a payment method to speed up your checkout process</p>
          <button
            onClick={() => handleOpenModal()}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-md"
          >
            Add Your First Payment Method
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {methods.map((method) => (
            <div
              key={method.id}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white relative overflow-hidden shadow-lg"
            >
              {/* Card Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>

              {/* Default Badge */}
              {method.isDefault && (
                <div className="absolute top-4 right-4">
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-warning-500 text-white text-xs font-bold rounded-full">
                    <Star className="w-3 h-3" />
                    DEFAULT
                  </span>
                </div>
              )}

              {/* Card Type */}
              <div className="mb-8">
                <p className="text-gray-300 text-sm mb-1">{method.nickname || 'Payment Card'}</p>
                <p className="text-2xl font-bold">{getCardIcon(method.brand)}</p>
              </div>

              {/* Card Number */}
              <div className="mb-6">
                <p className="text-gray-400 text-xs mb-1">Card Number</p>
                <p className="text-xl font-mono tracking-wider">
                  •••• •••• •••• {method.last4}
                </p>
              </div>

              {/* Card Details */}
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Cardholder</p>
                  <p className="text-sm font-semibold">{method.cardholderName || 'N/A'}</p>
                </div>
                {method.expiryMonth && method.expiryYear && (
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Expires</p>
                    <p className="text-sm font-semibold">
                      {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                {!method.isDefault && (
                  <button
                    onClick={() => handleSetDefault(method.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <Star className="w-4 h-4" />
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => handleOpenModal(method)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(method.id)}
                  className="flex items-center justify-center px-3 py-2 text-sm bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 text-white rounded-t-xl flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Lock className="w-5 h-5" />
                {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Security Notice */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">
                  Your payment information is encrypted and secure. We use industry-standard PCI DSS Level 1 compliance.
                </p>
              </div>

              {/* Nickname */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nickname (Optional)
                </label>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  placeholder="e.g., Personal Visa, Business Card"
                  className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
              </div>

              {!editingMethod && (
                <>
                  {/* Card Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      value={formData.cardNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                        setFormData({ ...formData, cardNumber: value });
                      }}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-mono"
                      required={!editingMethod}
                    />
                  </div>

                  {/* Cardholder Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Cardholder Name *
                    </label>
                    <input
                      type="text"
                      value={formData.cardholderName}
                      onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
                      placeholder="John Doe"
                      className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      required={!editingMethod}
                    />
                  </div>

                  {/* Expiry & CVV */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Month *
                      </label>
                      <input
                        type="text"
                        value={formData.expiryMonth}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                          if (parseInt(value) <= 12 || value === '') {
                            setFormData({ ...formData, expiryMonth: value });
                          }
                        }}
                        placeholder="MM"
                        maxLength={2}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-mono text-center"
                        required={!editingMethod}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Year *
                      </label>
                      <input
                        type="text"
                        value={formData.expiryYear}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                          setFormData({ ...formData, expiryYear: value });
                        }}
                        placeholder="YYYY"
                        maxLength={4}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-mono text-center"
                        required={!editingMethod}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        CVV *
                      </label>
                      <input
                        type="text"
                        value={formData.cvv}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                          setFormData({ ...formData, cvv: value });
                        }}
                        placeholder="123"
                        maxLength={4}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-mono text-center"
                        required={!editingMethod}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Default Checkbox */}
              <div className="flex items-center gap-3 p-4 bg-warning-50 rounded-lg border border-warning-200">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700 font-medium">
                  <Star className="w-4 h-4 inline mr-1 text-warning-600" />
                  Set as default payment method
                </label>
              </div>

              {/* Warning for Edit Mode */}
              {editingMethod && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    For security reasons, you can only update the nickname and default status. To change card details, please add a new payment method.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors border border-gray-300"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      {editingMethod ? 'Update' : 'Add Payment Method'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
