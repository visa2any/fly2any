'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPinIcon,
  CalendarIcon,
  UsersIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  EnvelopeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { trackFormSubmit, trackQuoteRequest } from '@/lib/analytics-safe';
import PhoneInput from '@/components/PhoneInputSimple';
import AirportAutocomplete from '@/components/flights/AirportAutocomplete';
import { AirportSelection } from '@/types/flights';

// ========================================================================================
// OPTIMIZED FLIGHT FORM - ULTRATHINK PROGRESSIVE ENHANCEMENT
// ========================================================================================

interface FlightFormData {
  // Trip Details (Step 1)
  tripType: 'round-trip' | 'one-way';
  origin: AirportSelection | null;
  destination: AirportSelection | null;
  departureDate: string;
  returnDate: string;
  flexibleDates: boolean;
  
  // Passengers & Class (Step 2)
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  travelClass: 'economy' | 'premium' | 'business' | 'first';
  
  // Contact & Preferences (Step 3)
  contactInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  budget: 'economy' | 'standard' | 'premium' | 'luxury';
  urgentRequest: boolean;
  notes: string;
}

interface MobileFlightFormOptimizedProps {
  onSubmit?: (data: FlightFormData) => void;
  onClose?: () => void;
  className?: string;
}

// Simplified step configuration - Only 3 steps for better UX
type StepType = 'trip' | 'details' | 'contact';

const STEP_CONFIG = [
  { 
    key: 'trip' as StepType, 
    title: 'Viagem', 
    icon: PaperAirplaneIcon,
    description: 'Rota e datas'
  },
  { 
    key: 'details' as StepType, 
    title: 'Detalhes', 
    icon: UsersIcon,
    description: 'Passageiros e classe'
  },
  { 
    key: 'contact' as StepType, 
    title: 'Contato', 
    icon: UserIcon,
    description: 'Seus dados'
  }
];

export default function MobileFlightFormOptimized({ 
  onSubmit, 
  onClose,
  className = ''
}: MobileFlightFormOptimizedProps) {
  
  // State Management
  const [currentStep, setCurrentStep] = useState<StepType>('trip');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FlightFormData, string>>>({});
  
  const [formData, setFormData] = useState<FlightFormData>({
    tripType: 'round-trip',
    origin: null,
    destination: null,
    departureDate: '',
    returnDate: '',
    flexibleDates: false,
    passengers: {
      adults: 1,
      children: 0,
      infants: 0
    },
    travelClass: 'economy',
    contactInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    },
    budget: 'standard',
    urgentRequest: false,
    notes: ''
  });

  // Get current step index
  const getCurrentStepIndex = useCallback(() => {
    return STEP_CONFIG.findIndex(s => s.key === currentStep);
  }, [currentStep]);

  // Validation for each step
  const validateStep = useCallback((step: StepType): boolean => {
    const newErrors: Partial<Record<keyof FlightFormData, string>> = {};
    
    switch (step) {
      case 'trip':
        if (!formData.origin?.iataCode) {
          newErrors.origin = 'Selecione o aeroporto de origem';
        }
        if (!formData.destination?.iataCode) {
          newErrors.destination = 'Selecione o aeroporto de destino';
        }
        if (!formData.departureDate) {
          newErrors.departureDate = 'Selecione a data de ida';
        }
        if (formData.tripType === 'round-trip' && !formData.returnDate) {
          newErrors.returnDate = 'Selecione a data de volta';
        }
        break;
        
      case 'details':
        if (formData.passengers.adults < 1) {
          newErrors.passengers = 'Pelo menos 1 adulto é necessário';
        }
        if (formData.passengers.infants > formData.passengers.adults) {
          newErrors.passengers = 'Número de bebês não pode exceder o de adultos';
        }
        break;
        
      case 'contact':
        if (!formData.contactInfo.firstName.trim()) {
          newErrors.contactInfo = 'Nome é obrigatório';
        }
        if (!formData.contactInfo.email.trim() || !/\S+@\S+\.\S+/.test(formData.contactInfo.email)) {
          newErrors.contactInfo = 'Email válido é obrigatório';
        }
        if (!formData.contactInfo.phone.trim() || formData.contactInfo.phone.length < 10) {
          newErrors.contactInfo = 'Telefone válido é obrigatório';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Navigation handlers
  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      const currentIndex = getCurrentStepIndex();
      if (currentIndex < STEP_CONFIG.length - 1) {
        setCurrentStep(STEP_CONFIG[currentIndex + 1].key);
        setErrors({});
        // Minimal haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(10);
        }
      }
    }
  }, [currentStep, getCurrentStepIndex, validateStep]);

  const prevStep = useCallback(() => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(STEP_CONFIG[currentIndex - 1].key);
      setErrors({});
    }
  }, [getCurrentStepIndex]);

  // Form submission
  const handleSubmit = useCallback(async () => {
    if (!validateStep('contact')) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Track analytics
      trackFormSubmit('flight_form_mobile_optimized');
      trackQuoteRequest({ services: ['voos'] });

      // Prepare submission data
      const submissionData = {
        nome: `${formData.contactInfo.firstName} ${formData.contactInfo.lastName}`,
        email: formData.contactInfo.email,
        telefone: formData.contactInfo.phone,
        servicos: ['voos'],
        serviceData: {
          voos: {
            ...formData,
            origin: formData.origin?.iataCode || '',
            destination: formData.destination?.iataCode || ''
          }
        },
        observacoes: formData.notes,
        urgente: formData.urgentRequest,
        flexivelDatas: formData.flexibleDates,
        budget: formData.budget,
        timestamp: new Date().toISOString(),
        source: 'mobile_flight_form_optimized',
        userAgent: navigator.userAgent
      };

      // Submit to API
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar solicitação');
      }

      if (onSubmit) {
        onSubmit(formData);
      }

      alert('✅ Solicitação enviada com sucesso! Entraremos em contato em breve.');
      
    } catch (error) {
      console.error('Error submitting flight form:', error);
      alert('❌ Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSubmit, validateStep]);

  // Helper functions
  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Calculate total passengers
  const totalPassengers = useMemo(() => {
    return formData.passengers.adults + formData.passengers.children + formData.passengers.infants;
  }, [formData.passengers]);

  // Progress percentage
  const progressPercentage = useMemo(() => {
    return ((getCurrentStepIndex() + 1) / STEP_CONFIG.length) * 100;
  }, [getCurrentStepIndex]);

  return (
    <div className={`h-full flex flex-col bg-white ${className}`}>
      
      {/* Clean Header with Progress */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-1 text-white/90 hover:text-white transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              <span className="text-sm">Voltar</span>
            </button>
          )}
          <h1 className="text-base font-bold flex-1 text-center">✈️ Cotação de Voo</h1>
          <div className="text-xs text-white/80">
            {getCurrentStepIndex() + 1}/{STEP_CONFIG.length}
          </div>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="p-4 space-y-4"
          >
            
            {/* STEP 1: Trip Details - Consolidated */}
            {currentStep === 'trip' && (
              <div className="space-y-4">
                {/* Step Header */}
                <div className="text-center mb-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                    <PaperAirplaneIcon className="w-7 h-7 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Para onde vamos?</h2>
                  <p className="text-sm text-gray-600">Configure sua rota e datas</p>
                </div>

                {/* Trip Type - Simplified */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'round-trip' as const, label: 'Ida e volta', icon: '↔️' },
                      { value: 'one-way' as const, label: 'Somente ida', icon: '→' }
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setFormData(prev => ({ ...prev, tripType: type.value }))}
                        className={`p-3 rounded-lg font-medium transition-all ${
                          formData.tripType === type.value
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-white text-gray-700 border border-gray-200'
                        }`}
                      >
                        <span className="text-lg mr-2">{type.icon}</span>
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Route Selection - Simplified */}
                <div className="space-y-3">
                  <div className="relative">
                    <AirportAutocomplete
                      value={formData.origin}
                      onChange={(airport) => setFormData(prev => ({ ...prev, origin: airport }))}
                      placeholder="🛫 Origem"
                      className="w-full"
                      inputClassName={`w-full px-4 py-3 text-base rounded-lg border-2 ${
                        errors.origin ? 'border-red-300' : 'border-gray-200'
                      } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all`}
                      isMobile={true}
                      maxResults={3}
                    />
                    {errors.origin && (
                      <p className="text-xs text-red-500 mt-1">{errors.origin}</p>
                    )}
                  </div>

                  {/* Swap Button */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        origin: prev.destination,
                        destination: prev.origin
                      }))}
                      className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <ArrowPathIcon className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  <div className="relative">
                    <AirportAutocomplete
                      value={formData.destination}
                      onChange={(airport) => setFormData(prev => ({ ...prev, destination: airport }))}
                      placeholder="🛬 Destino"
                      className="w-full"
                      inputClassName={`w-full px-4 py-3 text-base rounded-lg border-2 ${
                        errors.destination ? 'border-red-300' : 'border-gray-200'
                      } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all`}
                      isMobile={true}
                      maxResults={3}
                    />
                    {errors.destination && (
                      <p className="text-xs text-red-500 mt-1">{errors.destination}</p>
                    )}
                  </div>
                </div>

                {/* Dates - Simplified Grid */}
                <div className="space-y-3">
                  <div className={`grid gap-3 ${formData.tripType === 'round-trip' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-1 block">
                        Data de ida
                      </label>
                      <input
                        type="date"
                        value={formData.departureDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, departureDate: e.target.value }))}
                        min={getTodayDate()}
                        className={`w-full px-3 py-2.5 text-base rounded-lg border-2 ${
                          errors.departureDate ? 'border-red-300' : 'border-gray-200'
                        } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all`}
                      />
                    </div>
                    
                    {formData.tripType === 'round-trip' && (
                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1 block">
                          Data de volta
                        </label>
                        <input
                          type="date"
                          value={formData.returnDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, returnDate: e.target.value }))}
                          min={formData.departureDate || getTomorrowDate()}
                          className={`w-full px-3 py-2.5 text-base rounded-lg border-2 ${
                            errors.returnDate ? 'border-red-300' : 'border-gray-200'
                          } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all`}
                        />
                      </div>
                    )}
                  </div>

                  {/* Flexible Dates - Single checkbox */}
                  <label className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.flexibleDates}
                      onChange={(e) => setFormData(prev => ({ ...prev, flexibleDates: e.target.checked }))}
                      className="w-4 h-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Datas flexíveis</span>
                      <p className="text-xs text-gray-600">+/- 3 dias para melhores preços</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 2: Details - Passengers & Class */}
            {currentStep === 'details' && (
              <div className="space-y-4">
                {/* Step Header */}
                <div className="text-center mb-4">
                  <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                    <UsersIcon className="w-7 h-7 text-purple-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Detalhes da viagem</h2>
                  <p className="text-sm text-gray-600">Passageiros e classe</p>
                </div>

                {/* Passengers Section */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-800">Passageiros</h3>
                    <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      {totalPassengers} {totalPassengers === 1 ? 'passageiro' : 'passageiros'}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { type: 'adults' as const, label: 'Adultos', desc: '12+ anos', min: 1 },
                      { type: 'children' as const, label: 'Crianças', desc: '2-11 anos', min: 0 },
                      { type: 'infants' as const, label: 'Bebês', desc: '0-2 anos', min: 0 }
                    ].map((passenger) => (
                      <div key={passenger.type} className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{passenger.label}</div>
                          <div className="text-xs text-gray-500">{passenger.desc}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              passengers: {
                                ...prev.passengers,
                                [passenger.type]: Math.max(passenger.min, prev.passengers[passenger.type] - 1)
                              }
                            }))}
                            disabled={formData.passengers[passenger.type] <= passenger.min}
                            className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="text-lg font-medium">−</span>
                          </button>
                          <span className="w-8 text-center font-semibold text-gray-900">
                            {formData.passengers[passenger.type]}
                          </span>
                          <button
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              passengers: {
                                ...prev.passengers,
                                [passenger.type]: Math.min(9, prev.passengers[passenger.type] + 1)
                              }
                            }))}
                            disabled={
                              formData.passengers[passenger.type] >= 9 ||
                              (passenger.type === 'infants' && formData.passengers.infants >= formData.passengers.adults)
                            }
                            className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="text-lg font-medium">+</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {errors.passengers && (
                    <p className="text-xs text-red-500 mt-2">{errors.passengers}</p>
                  )}
                </div>

                {/* Travel Class */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-800">Classe de viagem</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'economy' as const, label: 'Econômica', icon: '💺' },
                      { value: 'premium' as const, label: 'Premium', icon: '🛋️' },
                      { value: 'business' as const, label: 'Executiva', icon: '✈️' },
                      { value: 'first' as const, label: 'Primeira', icon: '👑' }
                    ].map((cls) => (
                      <button
                        key={cls.value}
                        onClick={() => setFormData(prev => ({ ...prev, travelClass: cls.value }))}
                        className={`p-3 rounded-lg font-medium transition-all ${
                          formData.travelClass === cls.value
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'bg-white text-gray-700 border border-gray-200'
                        }`}
                      >
                        <span className="text-lg mr-1">{cls.icon}</span>
                        {cls.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Contact & Submit */}
            {currentStep === 'contact' && (
              <div className="space-y-4">
                {/* Step Header */}
                <div className="text-center mb-4">
                  <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                    <CheckIcon className="w-7 h-7 text-green-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Finalizar cotação</h2>
                  <p className="text-sm text-gray-600">Seus dados para contato</p>
                </div>

                {/* Contact Form */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-1 block">
                        Nome *
                      </label>
                      <input
                        type="text"
                        value={formData.contactInfo.firstName}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, firstName: e.target.value }
                        }))}
                        placeholder="Primeiro nome"
                        className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-1 block">
                        Sobrenome *
                      </label>
                      <input
                        type="text"
                        value={formData.contactInfo.lastName}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, lastName: e.target.value }
                        }))}
                        placeholder="Sobrenome"
                        className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">
                      E-mail *
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={formData.contactInfo.email}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, email: e.target.value }
                        }))}
                        placeholder="seu@email.com"
                        className="w-full pl-10 pr-3 py-2.5 text-sm rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">
                      Telefone *
                    </label>
                    <PhoneInput
                      value={formData.contactInfo.phone}
                      onChange={(value) => setFormData(prev => ({
                        ...prev,
                        contactInfo: { ...prev.contactInfo, phone: value }
                      }))}
                      className="w-full"
                      required
                    />
                  </div>

                  {errors.contactInfo && (
                    <p className="text-xs text-red-500">{errors.contactInfo}</p>
                  )}
                </div>

                {/* Budget & Urgency */}
                <div className="bg-gray-50 rounded-xl p-3 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-2 block">
                      Orçamento estimado
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'economy' as const, label: 'Econômico' },
                        { value: 'standard' as const, label: 'Padrão' },
                        { value: 'premium' as const, label: 'Premium' },
                        { value: 'luxury' as const, label: 'Luxo' }
                      ].map((budget) => (
                        <button
                          key={budget.value}
                          onClick={() => setFormData(prev => ({ ...prev, budget: budget.value }))}
                          className={`p-2 rounded text-xs font-medium transition-all ${
                            formData.budget === budget.value
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 border border-gray-200'
                          }`}
                        >
                          {budget.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.urgentRequest}
                      onChange={(e) => setFormData(prev => ({ ...prev, urgentRequest: e.target.checked }))}
                      className="w-4 h-4 rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">⚡ Solicitação urgente</span>
                      <p className="text-xs text-gray-600">Preciso viajar em até 7 dias</p>
                    </div>
                  </label>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">
                    Observações (opcional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Preferências especiais, horários, etc..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                  />
                </div>

                {/* Summary */}
                <div className="bg-blue-50 rounded-xl p-3 space-y-2">
                  <h4 className="text-sm font-semibold text-blue-900">Resumo da viagem</h4>
                  <div className="space-y-1 text-xs text-blue-800">
                    <div className="flex justify-between">
                      <span>Rota:</span>
                      <span className="font-medium">
                        {formData.origin?.iataCode} → {formData.destination?.iataCode}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tipo:</span>
                      <span className="font-medium">
                        {formData.tripType === 'round-trip' ? 'Ida e volta' : 'Somente ida'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Passageiros:</span>
                      <span className="font-medium">{totalPassengers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Classe:</span>
                      <span className="font-medium capitalize">{formData.travelClass}</span>
                    </div>
                    {formData.flexibleDates && (
                      <div className="text-blue-600 font-medium">✓ Datas flexíveis</div>
                    )}
                    {formData.urgentRequest && (
                      <div className="text-orange-600 font-medium">⚡ Urgente</div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-4 px-6 rounded-xl font-bold text-base shadow-lg disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Enviando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CheckIcon className="w-5 h-5" />
                      Enviar Cotação
                    </span>
                  )}
                </button>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-200 bg-white px-4 py-3 flex justify-between items-center">
        <button
          onClick={prevStep}
          disabled={currentStep === 'trip'}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 text-sm font-medium disabled:opacity-50 transition-all"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Voltar
        </button>

        {/* Step Indicators */}
        <div className="flex gap-2">
          {STEP_CONFIG.map((step, index) => (
            <div
              key={step.key}
              className={`w-2 h-2 rounded-full transition-all ${
                index <= getCurrentStepIndex() 
                  ? 'bg-blue-600' 
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {currentStep !== 'contact' ? (
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium transition-all hover:bg-blue-700"
          >
            Continue
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-20"></div>
        )}
      </div>
    </div>
  );
}