'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Wallet, User, Lock, Info, Check, AlertCircle } from 'lucide-react';

export type PaymentMethod = 'USER_PAYMENT' | 'ACC_CREDIT_CARD' | 'WALLET';

interface PaymentFormProps {
  onPaymentComplete: (paymentData: PaymentResult) => void;
  onPaymentError: (error: string) => void;
  prebookingData: {
    secretKey?: string;
    transactionId: string;
    totalPrice: {
      amount: number;
      currency: string;
      formatted: string;
    };
  };
  isLoading: boolean;
}

interface PaymentResult {
  success: boolean;
  transactionId: string;
  paymentMethod: PaymentMethod;
  paymentDetails?: {
    cardLast4?: string;
    paymentProvider?: string;
  };
}

interface CreditCardForm {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
}

export default function PaymentForm({
  onPaymentComplete,
  onPaymentError,
  prebookingData,
  isLoading
}: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('USER_PAYMENT');
  const [cardForm, setCardForm] = useState<CreditCardForm>({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  // Load LiteAPI Payment SDK
  useEffect(() => {
    if (selectedMethod === 'USER_PAYMENT' && !sdkLoaded) {
      const script = document.createElement('script');
      script.src = 'https://payment-wrapper.liteapi.travel/dist/liteAPIPayment.js?v=a1';
      script.onload = () => setSdkLoaded(true);
      document.head.appendChild(script);
      
      return () => {
        document.head.removeChild(script);
      };
    }
  }, [selectedMethod, sdkLoaded]);

  // Initialize LiteAPI Payment SDK
  useEffect(() => {
    if (selectedMethod === 'USER_PAYMENT' && sdkLoaded && prebookingData.secretKey) {
      const liteAPIConfig = {
        publicKey: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox',
        appearance: { theme: 'flat' },
        targetElement: '#liteapi-payment-element',
        secretKey: prebookingData.secretKey,
        returnUrl: `${window.location.origin}/hoteis/booking/payment-return?transactionId=${prebookingData.transactionId}`
      };

      // @ts-expect-error - LiteAPI SDK global
      if (window.liteAPIPayment) {
        // @ts-expect-error - LiteAPI SDK method call on global window object
        window.liteAPIPayment.init(liteAPIConfig);
      }
    }
  }, [selectedMethod, sdkLoaded, prebookingData.secretKey, prebookingData.transactionId]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardInputChange = (field: keyof CreditCardForm, value: string) => {
    let formattedValue = value;
    
    if (field === 'number') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/[^0-9]/g, '').substring(0, 4);
    }

    setCardForm((prev: any) => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  const handleAccountCreditCardPayment = async (): Promise<void> => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/hotels/booking/finalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: prebookingData.transactionId,
          paymentMethod: 'ACC_CREDIT_CARD',
          paymentDetails: {}
        }),
      });

      const result = await response.json();

      if (result.success) {
        onPaymentComplete({
          success: true,
          transactionId: prebookingData.transactionId,
          paymentMethod: 'ACC_CREDIT_CARD',
          paymentDetails: {
            paymentProvider: 'LiteAPI Account'
          }
        });
      } else {
        onPaymentError(result.error || 'Erro no processamento do pagamento');
      }
    } catch (error) {
      onPaymentError('Erro de conexão. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWalletPayment = async (): Promise<void> => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/hotels/booking/finalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: prebookingData.transactionId,
          paymentMethod: 'WALLET',
          paymentDetails: {}
        }),
      });

      const result = await response.json();

      if (result.success) {
        onPaymentComplete({
          success: true,
          transactionId: prebookingData.transactionId,
          paymentMethod: 'WALLET',
          paymentDetails: {
            paymentProvider: 'Account Wallet'
          }
        });
      } else {
        onPaymentError(result.error || 'Saldo insuficiente na wallet ou erro no processamento');
      }
    } catch (error) {
      onPaymentError('Erro de conexão. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentMethods = [
    {
      id: 'USER_PAYMENT' as PaymentMethod,
      name: 'Cartão de Crédito',
      description: 'Pague com seu cartão de crédito ou Google Pay',
      icon: CreditCard,
      recommended: true
    },
    {
      id: 'ACC_CREDIT_CARD' as PaymentMethod,
      name: 'Pagamento Empresarial',
      description: 'Cobrança no cartão corporativo da conta',
      icon: User,
      recommended: false
    },
    {
      id: 'WALLET' as PaymentMethod,
      name: 'Wallet da Conta',
      description: 'Usar saldo pré-pago da conta',
      icon: Wallet,
      recommended: false
    }
  ];

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Método de Pagamento</h3>
        <div className="space-y-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <label
                key={method.id}
                className={`relative flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedMethod === method.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedMethod(e.target.value as PaymentMethod)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedMethod === method.id ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <Icon size={20} className={selectedMethod === method.id ? 'text-blue-600' : 'text-gray-600'} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{method.name}</span>
                      {method.recommended && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Recomendado
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Payment Form Content */}
      <div className="border-t pt-6">
        {selectedMethod === 'USER_PAYMENT' && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lock size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Pagamento Seguro via LiteAPI</span>
            </div>
            
            {!sdkLoaded ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Carregando gateway de pagamento...</span>
              </div>
            ) : (
              <div>
                <div id="liteapi-payment-element" className="min-h-[300px] border border-gray-200 rounded-lg p-4">
                  {/* LiteAPI SDK will inject payment form here */}
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info size={16} className="text-blue-600 mt-0.5" />
                    <div className="text-sm text-gray-700">
                      <p className="font-medium">Pagamento Seguro</p>
                      <p>Suas informações são protegidas por criptografia SSL e processadas pela LiteAPI.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedMethod === 'ACC_CREDIT_CARD' && (
          <div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800">Pagamento Empresarial</p>
                  <p className="text-amber-700 mt-1">
                    A cobrança será feita no cartão corporativo associado à sua conta LiteAPI.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <User size={24} className="text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Pagamento via Conta Empresarial</h4>
              <p className="text-gray-600 mb-6">
                O valor de <strong>{prebookingData.totalPrice.formatted}</strong> será cobrado 
                no cartão corporativo da conta.
              </p>
              
              <button
                onClick={handleAccountCreditCardPayment}
                disabled={isProcessing || isLoading}
                className="w-full max-w-xs mx-auto bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processando...
                  </div>
                ) : (
                  'Confirmar Pagamento'
                )}
              </button>
            </div>
          </div>
        )}

        {selectedMethod === 'WALLET' && (
          <div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
              <div className="flex items-start gap-2">
                <Wallet size={16} className="text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-800">Pagamento via Wallet</p>
                  <p className="text-green-700 mt-1">
                    Será utilizado o saldo pré-pago da sua conta. Se insuficiente, o restante será cobrado no cartão da conta.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <Wallet size={24} className="text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Pagamento via Wallet</h4>
              <p className="text-gray-600 mb-6">
                O valor de <strong>{prebookingData.totalPrice.formatted}</strong> será debitado 
                do saldo da wallet.
              </p>
              
              <button
                onClick={handleWalletPayment}
                disabled={isProcessing || isLoading}
                className="w-full max-w-xs mx-auto bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processando...
                  </div>
                ) : (
                  'Pagar com Wallet'
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Price Summary */}
      <div className="border-t pt-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total a Pagar</span>
            <span className="text-blue-600">{prebookingData.totalPrice.formatted}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Incluindo todas as taxas e impostos
          </p>
        </div>
      </div>
    </div>
  );
}