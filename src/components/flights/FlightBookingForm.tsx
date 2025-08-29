'use client';

/**
 * 🎫 Flight Booking Form Component
 * Máxima conversão através de UX otimizada e psychology triggers
 * Focus: Trust, Security, Simplicity, and Conversion Optimization
 */

import React, { useState, useEffect, useMemo } from 'react';
import type { ChangeEvent } from 'react';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  CreditCardIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  CalendarIcon
} from '@/components/Icons';
import { 
  BookingFormData, 
  PassengerInfo, 
  BookingState, 
  BookingError,
  ProcessedFlightOffer 
} from '@/types/flights';

interface FlightBookingFormProps {
  selectedFlight: ProcessedFlightOffer;
  onBookingComplete: (booking: any) => void;
  onBack: () => void;
  className?: string;
}

export default function FlightBookingForm({
  selectedFlight,
  onBookingComplete,
  onBack,
  className = ''
}: FlightBookingFormProps) {
  const [bookingData, setBookingData] = useState<BookingFormData>({
    passengers: [],
    contactInfo: {
      email: '',
      phone: { countryCode: '+1', number: '' },
      phones: []
    },
    payment: {
      type: 'CREDIT_CARD',
      billingAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US'
      }
    },
    agreements: {
      terms: false,
      privacy: false,
      marketing: false,
      termsAndConditions: false,
      privacyPolicy: false,
      marketingEmails: false
    }
  });

  const [bookingState, setBookingState] = useState<BookingState>({
    currentStep: 'PASSENGER_INFO',
    isLoading: false,
    errors: [],
    warnings: [],
    validationState: {
      passengers: false,
      contact: false,
      payment: false,
      agreements: false,
      overall: false
    },
    paymentProcessing: false,
    bookingConfirmed: false
  });

  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 minutes
  const [showTrustSignals, setShowTrustSignals] = useState(true);

  // 🎯 Initialize passengers based on flight selection
  useEffect(() => {
    const passengerCount = selectedFlight.rawOffer?.travelerPricings?.length || 1;
    const initialPassengers: PassengerInfo[] = [];
    
    for (let i = 0; i < passengerCount; i++) {
      initialPassengers.push({
        id: `passenger-${i + 1}`,
        type: 'ADULT',
        title: 'MR',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'M',
        nationality: 'BR',
        document: {
          type: 'PASSPORT',
          number: '',
          expiryDate: '',
          issuingCountry: 'BR'
        }
      });
    }
    
    setBookingData((prev: any) => ({ ...prev, passengers: initialPassengers }));
  }, [selectedFlight]);

  // 🎯 Price lock countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev: any) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 🎯 Validation logic
  const validateCurrentStep = useMemo(() => {
    switch (bookingState.currentStep) {
      case 'PASSENGER_INFO':
        return bookingData.passengers.every((p: any) => 
          p.firstName && p.lastName && p.dateOfBirth && p.document?.number
        );
      case 'SPECIAL_REQUESTS':
        return true; // Optional step
      case 'PAYMENT':
        return bookingData.contactInfo.email && 
               bookingData.contactInfo.phone?.number &&
               bookingData.payment.cardNumber &&
               bookingData.payment.cvv;
      case 'CONFIRMATION':
        return bookingData.agreements.terms && 
               bookingData.agreements.privacy;
      default:
        return false;
    }
  }, [bookingData, bookingState.currentStep]);

  const handleNextStep = () => {
    if (!validateCurrentStep) return;
    
    const steps = ['PASSENGER_INFO', 'SPECIAL_REQUESTS', 'PAYMENT', 'CONFIRMATION'];
    const currentIndex = steps.indexOf(bookingState.currentStep);
    
    if (currentIndex < steps.length - 1) {
      setBookingState((prev: any) => ({
        ...prev,
        currentStep: steps[currentIndex + 1] as any
      }));
    }
  };

  const handlePrevStep = () => {
    const steps = ['PASSENGER_INFO', 'SPECIAL_REQUESTS', 'PAYMENT', 'CONFIRMATION'];
    const currentIndex = steps.indexOf(bookingState.currentStep);
    
    if (currentIndex > 0) {
      setBookingState((prev: any) => ({
        ...prev,
        currentStep: steps[currentIndex - 1] as any
      }));
    }
  };

  const handleSubmitBooking = async (): Promise<void> => {
    setBookingState((prev: any) => ({ ...prev, isLoading: true, paymentProcessing: true }));
    
    try {
      const response = await fetch('/api/flights/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setBookingState((prev: any) => ({ ...prev, bookingConfirmed: true }));
        onBookingComplete(result.data);
      } else {
        setBookingState((prev: any) => ({
          ...prev,
          errors: [{ field: 'general', message: result.error, type: 'API' }]
        }));
      }
    } catch (error) {
      setBookingState((prev: any) => ({
        ...prev,
        errors: [{ field: 'general', message: 'Erro de conexão', type: 'GENERAL' }]
      }));
    } finally {
      setBookingState((prev: any) => ({ ...prev, isLoading: false, paymentProcessing: false }));
    }
  };

  return (
    <div className={`flight-booking-form ${className}`}>
      {/* 🎯 Header with Trust Signals */}
      <div className="booking-header bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-8 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              🎫 Finalizar Reserva
            </h1>
            <p className="text-gray-600">
              Última etapa para garantir sua viagem dos sonhos!
            </p>
          </div>
          
          {/* 🎯 Price Lock Timer */}
          <div className="bg-white rounded-xl p-4 border-2 border-orange-200 text-center">
            <div className="text-sm text-gray-600 mb-1">Preço bloqueado por</div>
            <div className={`text-2xl font-bold ${timeRemaining < 300 ? 'text-red-600 animate-pulse' : 'text-green-600'}`}>
              {formatTime(timeRemaining)}
            </div>
            <div className="text-xs text-gray-500">minutos restantes</div>
          </div>
        </div>

        {/* 🎯 Trust Indicators */}
        {showTrustSignals && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <LockClosedIcon className="w-4 h-4 text-green-600" />
              <span>SSL Seguro</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircleIcon className="w-4 h-4 text-green-600" />
              <span>ANAC Certificado</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <GlobeAltIcon className="w-4 h-4 text-blue-600" />
              <span>50k+ Clientes</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
              <span>Cancelamento 24h</span>
            </div>
          </div>
        )}

        {/* 🎯 Progress Indicator */}
        <div className="flex items-center justify-between">
          {['Passageiros', 'Extras', 'Pagamento', 'Confirmação'].map((step: any, index: number) => {
            const steps = ['PASSENGER_INFO', 'SPECIAL_REQUESTS', 'PAYMENT', 'CONFIRMATION'];
            const currentIndex = steps.indexOf(bookingState.currentStep);
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;
            
            return (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isCompleted ? 'bg-green-500 text-white' :
                  isActive ? 'bg-blue-500 text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {isCompleted ? '✓' : index + 1}
                </div>
                <div className={`ml-2 text-sm font-medium ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {step}
                </div>
                {index < 3 && (
                  <div className={`mx-4 h-px w-8 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 🎯 Flight Summary Card */}
      <div className="flight-summary bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">✈️ Resumo da Viagem</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-1">Rota</div>
            <div className="font-semibold text-gray-900">
              {selectedFlight.outbound.departure.iataCode} → {selectedFlight.outbound.arrival.iataCode}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Data & Horário</div>
            <div className="font-semibold text-gray-900">
              {selectedFlight.outbound.departure.date} às {selectedFlight.outbound.departure.time}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Valor Total</div>
            <div className="text-2xl font-bold text-blue-600">
              {selectedFlight.totalPrice}
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 Step Content */}
      <div className="step-content">
        {bookingState.currentStep === 'PASSENGER_INFO' && (
          <PassengerInfoStep 
            passengers={bookingData.passengers}
            onChange={(passengers: PassengerInfo[]) => setBookingData((prev: any) => ({ ...prev, passengers }))}
          />
        )}
        
        {bookingState.currentStep === 'SPECIAL_REQUESTS' && (
          <SpecialRequestsStep 
            specialRequests={bookingData.specialRequests}
            onChange={(specialRequests: any) => setBookingData((prev: any) => ({ ...prev, specialRequests }))}
          />
        )}
        
        {bookingState.currentStep === 'PAYMENT' && (
          <PaymentStep 
            contactInfo={bookingData.contactInfo}
            payment={bookingData.payment}
            onContactChange={(contactInfo: any) => setBookingData((prev: any) => ({ ...prev, contactInfo }))}
            onPaymentChange={(payment: any) => setBookingData((prev: any) => ({ ...prev, payment }))}
          />
        )}
        
        {bookingState.currentStep === 'CONFIRMATION' && (
          <ConfirmationStep 
            bookingData={bookingData}
            selectedFlight={selectedFlight}
            agreements={bookingData.agreements}
            onChange={(agreements: any) => setBookingData((prev: any) => ({ ...prev, agreements }))}
          />
        )}
      </div>

      {/* 🎯 Navigation Buttons */}
      <div className="navigation-buttons flex items-center justify-between pt-8 border-t border-gray-200 mt-8">
        <button
          onClick={bookingState.currentStep === 'PASSENGER_INFO' ? onBack : handlePrevStep}
          className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← {bookingState.currentStep === 'PASSENGER_INFO' ? 'Voltar aos Voos' : 'Etapa Anterior'}
        </button>
        
        <div className="flex items-center gap-4">
          {/* 🎯 Urgency Message */}
          {timeRemaining < 300 && (
            <div className="text-sm text-red-600 font-medium animate-pulse">
              ⚡ Finalize rapidamente - preço pode expirar!
            </div>
          )}
          
          {bookingState.currentStep === 'CONFIRMATION' ? (
            <button
              onClick={handleSubmitBooking}
              disabled={!validateCurrentStep || bookingState.isLoading}
              className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                validateCurrentStep && !bookingState.isLoading
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {bookingState.paymentProcessing ? '💳 Processando...' : '🎉 Confirmar Reserva'}
            </button>
          ) : (
            <button
              onClick={handleNextStep}
              disabled={!validateCurrentStep}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                validateCurrentStep
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Próxima Etapa →
            </button>
          )}
        </div>
      </div>

      {/* 🎯 Security Footer */}
      <div className="security-footer mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <LockClosedIcon className="w-4 h-4" />
            <span>Dados criptografados SSL 256-bit</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4" />
            <span>Certificado ANAC</span>
          </div>
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-4 h-4" />
            <span>Proteção ao consumidor</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// 🎯 STEP COMPONENTS
// =============================================================================

function PassengerInfoStep({ passengers, onChange }: any) {
  const updatePassenger = (index: number, field: string, value: any) => {
    const updated = [...passengers];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updated[index] = {
        ...updated[index],
        [parent]: { ...updated[index][parent], [child]: value }
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    onChange(updated);
  };

  return (
    <div className="passenger-info-step">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        👤 Informações dos Passageiros
      </h2>
      
      {passengers.map((passenger: PassengerInfo, index: number) => (
        <div key={passenger.id} className="passenger-form bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Passageiro {index + 1} {passenger.type === 'ADULT' ? '(Adulto)' : '(Criança)'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome *
              </label>
              <input
                type="text"
                value={passenger.firstName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updatePassenger(index, 'firstName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nome"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sobrenome *
              </label>
              <input
                type="text"
                value={passenger.lastName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updatePassenger(index, 'lastName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Sobrenome"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Nascimento *
              </label>
              <input
                type="date"
                value={passenger.dateOfBirth}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updatePassenger(index, 'dateOfBirth', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gênero *
              </label>
              <select
                value={passenger.gender}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => updatePassenger(index, 'gender', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número do Documento *
              </label>
              <input
                type="text"
                value={passenger.document?.number || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updatePassenger(index, 'document.number', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Passaporte ou RG"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Validade do Documento *
              </label>
              <input
                type="date"
                value={passenger.document?.expiryDate || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updatePassenger(index, 'document.expiryDate', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
        </div>
      ))}
      
      {/* 🎯 Tips Section */}
      <div className="tips-section bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-3">💡 Dicas Importantes:</h4>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• Confira se os nomes estão exatamente como no documento</li>
          <li>• Para voos internacionais, use sempre o passaporte</li>
          <li>• Documentos devem ter validade mínima de 6 meses</li>
        </ul>
      </div>
    </div>
  );
}

function SpecialRequestsStep({ specialRequests, onChange }: any) {
  return (
    <div className="special-requests-step">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        🎯 Serviços Extras (Opcional)
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Meal Selection */}
        <div className="service-card bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">🍽️ Refeições Especiais</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4 text-blue-600" />
              <span className="text-sm">Vegetariana</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4 text-blue-600" />
              <span className="text-sm">Vegana</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4 text-blue-600" />
              <span className="text-sm">Sem glúten</span>
            </label>
          </div>
        </div>
        
        {/* Seat Selection */}
        <div className="service-card bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">🪑 Preferência de Assento</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="radio" name="seat" className="w-4 h-4 text-blue-600" />
              <span className="text-sm">Janela</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="radio" name="seat" className="w-4 h-4 text-blue-600" />
              <span className="text-sm">Corredor</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="radio" name="seat" className="w-4 h-4 text-blue-600" />
              <span className="text-sm">Sem preferência</span>
            </label>
          </div>
        </div>
      </div>
      
      {/* Upsell Section */}
      <div className="upsell-section mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <h3 className="text-lg font-semibold text-green-900 mb-4">
          ✨ Upgrades Disponíveis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="upgrade-option bg-white rounded-lg p-4 border border-green-200">
            <div className="text-lg font-bold text-green-600 mb-2">🧳 Bagagem Extra</div>
            <div className="text-sm text-gray-600 mb-3">+23kg por apenas R$ 89</div>
            <button className="w-full bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
              Adicionar
            </button>
          </div>
          
          <div className="upgrade-option bg-white rounded-lg p-4 border border-green-200">
            <div className="text-lg font-bold text-green-600 mb-2">🪑 Assento Premium</div>
            <div className="text-sm text-gray-600 mb-3">Mais espaço por R$ 149</div>
            <button className="w-full bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
              Selecionar
            </button>
          </div>
          
          <div className="upgrade-option bg-white rounded-lg p-4 border border-green-200">
            <div className="text-lg font-bold text-green-600 mb-2">🛡️ Seguro Viagem</div>
            <div className="text-sm text-gray-600 mb-3">Proteção completa R$ 45</div>
            <button className="w-full bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
              Proteger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentStep({ contactInfo, payment, onContactChange, onPaymentChange }: any) {
  return (
    <div className="payment-step">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        💳 Pagamento e Contato
      </h2>
      
      {/* Contact Information */}
      <div className="contact-section bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📧 Informações de Contato</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={contactInfo.email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onContactChange({ ...contactInfo, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="seu@email.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone *
            </label>
            <div className="flex gap-2">
              <select
                value={contactInfo.phone.countryCode}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => onContactChange({
                  ...contactInfo,
                  phone: { ...contactInfo.phone, countryCode: e.target.value }
                })}
                className="w-20 px-2 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="+55">+55</option>
                <option value="+1">+1</option>
                <option value="+34">+34</option>
              </select>
              <input
                type="tel"
                value={contactInfo.phone.number}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onContactChange({
                  ...contactInfo,
                  phone: { ...contactInfo.phone, number: e.target.value }
                })}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="(11) 99999-9999"
                required
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Payment Information */}
      <div className="payment-section bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💳 Dados do Pagamento</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número do Cartão *
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Validade *
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="MM/AA"
                maxLength={5}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVV *
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="123"
                maxLength={4}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome no Cartão *
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nome como no cartão"
                required
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Security Badges */}
      <div className="security-badges mt-6 flex items-center justify-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <LockClosedIcon className="w-4 h-4 text-green-600" />
          <span>Pagamento 100% Seguro</span>
        </div>
        <div className="flex items-center gap-2">
          <CreditCardIcon className="w-4 h-4 text-blue-600" />
          <span>Aceito Visa, Master, Elo</span>
        </div>
      </div>
    </div>
  );
}

function ConfirmationStep({ bookingData, selectedFlight, agreements, onChange }: any) {
  return (
    <div className="confirmation-step">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        ✅ Confirmação Final
      </h2>
      
      {/* Final Summary */}
      <div className="final-summary bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Resumo da Reserva</h3>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Rota:</span>
            <span className="font-semibold">{selectedFlight.outbound.departure.iataCode} → {selectedFlight.outbound.arrival.iataCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Data:</span>
            <span className="font-semibold">{selectedFlight.outbound.departure.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Passageiros:</span>
            <span className="font-semibold">{bookingData.passengers.length}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-blue-600 border-t pt-4">
            <span>Total:</span>
            <span>{selectedFlight.totalPrice}</span>
          </div>
        </div>
      </div>
      
      {/* Terms and Conditions */}
      <div className="terms-section bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📄 Termos e Condições</h3>
        <div className="space-y-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={agreements.termsAndConditions}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ ...agreements, termsAndConditions: e.target.checked })}
              className="w-4 h-4 text-blue-600 mt-1"
              required
            />
            <span className="text-sm text-gray-700">
              Aceito os <a href="#" className="text-blue-600 hover:underline">termos e condições</a> da Fly2Any *
            </span>
          </label>
          
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={agreements.privacyPolicy}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ ...agreements, privacyPolicy: e.target.checked })}
              className="w-4 h-4 text-blue-600 mt-1"
              required
            />
            <span className="text-sm text-gray-700">
              Aceito a <a href="#" className="text-blue-600 hover:underline">política de privacidade</a> *
            </span>
          </label>
          
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={agreements.marketingEmails}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ ...agreements, marketingEmails: e.target.checked })}
              className="w-4 h-4 text-blue-600 mt-1"
            />
            <span className="text-sm text-gray-700">
              Quero receber ofertas exclusivas por email (opcional)
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}