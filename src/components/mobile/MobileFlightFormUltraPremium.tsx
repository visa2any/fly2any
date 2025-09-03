'use client';

import React, { useState } from 'react';
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
  ChevronDownIcon,
  SparklesIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { trackFormSubmit, trackQuoteRequest } from '@/lib/analytics-safe';
import PhoneInput from '@/components/PhoneInputSimple';
import AirportAutocomplete from '@/components/flights/AirportAutocomplete';
import EnhancedSuccessModal from '@/components/mobile/EnhancedSuccessModal';
import { AirportSelection } from '@/types/flights';

interface FlightFormData {
  tripType: 'round-trip' | 'one-way' | 'multi-city';
  origin: AirportSelection | null;
  destination: AirportSelection | null;
  departureDate: string;
  returnDate: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  travelClass: 'economy' | 'premium' | 'business' | 'first';
  contactInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    countryCode: string;
  };
  budget: 'economy' | 'standard' | 'premium' | 'luxury';
  preferences: string;
  urgente: boolean;
  flexivelDatas: boolean;
}

interface MobileFlightFormUltraPremiumProps {
  onSearch?: (data: FlightFormData) => void;
  className?: string;
}

type StepType = 'travel' | 'contact' | 'budget-notes' | 'submit';

export default function MobileFlightFormUltraPremium({ onSearch, className = '' }: MobileFlightFormUltraPremiumProps) {
  const [currentStep, setCurrentStep] = useState<StepType>('travel');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FlightFormData>({
    tripType: 'round-trip',
    origin: null,
    destination: null,
    departureDate: '',
    returnDate: '',
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
      phone: '',
      countryCode: '+55'
    },
    budget: 'standard',
    preferences: '',
    urgente: false,
    flexivelDatas: false
  });

  const steps = [
    { key: 'travel', title: 'Viagem', icon: PaperAirplaneIcon },
    { key: 'contact', title: 'Contato', icon: UserIcon },
    { key: 'budget-notes', title: 'Orçamento', icon: SparklesIcon },
    { key: 'submit', title: 'Enviar', icon: CheckIcon }
  ];

  const getCurrentStepIndex = () => steps.findIndex(s => s.key === currentStep);
  
  const validateStep = (step: StepType): { isValid: boolean; errors: Record<string, string> } => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 'travel':
        if (!formData.origin?.iataCode) newErrors.origin = 'Selecione a origem';
        if (!formData.destination?.iataCode) newErrors.destination = 'Selecione o destino';
        if (!formData.departureDate) newErrors.departureDate = 'Selecione a data de ida';
        if (formData.tripType === 'round-trip' && !formData.returnDate) {
          newErrors.returnDate = 'Selecione a data de volta';
        }
        if (formData.passengers.adults < 1) newErrors.passengers = 'Pelo menos 1 adulto é necessário';
        if (formData.passengers.infants > formData.passengers.adults) {
          newErrors.passengers = 'Número de bebês não pode exceder adultos';
        }
        break;
      case 'contact':
        if (!formData.contactInfo.firstName.trim()) newErrors.firstName = 'Nome é obrigatório';
        if (!formData.contactInfo.lastName.trim()) newErrors.lastName = 'Sobrenome é obrigatório';
        if (!formData.contactInfo.email.trim() || !/\S+@\S+\.\S+/.test(formData.contactInfo.email)) {
          newErrors.email = 'Email válido é obrigatório';
        }
        if (!formData.contactInfo.phone.trim() || formData.contactInfo.phone.length < 10) {
          newErrors.phone = 'Telefone válido é obrigatório';
        }
        break;
      case 'budget-notes':
        // Optional step - no validation required
        break;
      case 'submit':
        // Final review - no additional validation
        break;
    }
    
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };
  
  const canProceedFromStep = (step: StepType): boolean => {
    const validation = validateStep(step);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const nextStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1) {
      if (canProceedFromStep(currentStep)) {
        setCurrentStep(steps[currentIndex + 1].key as StepType);
        setFocusedField(null);
        setErrors({});
        if ('vibrate' in navigator) {
          navigator.vibrate(10);
        }
      }
    }
  };

  const prevStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].key as StepType);
      setFocusedField(null);
      setErrors({});
      if ('vibrate' in navigator) {
        navigator.vibrate(5);
      }
    }
  };

  const handlePassengerChange = (type: 'adults' | 'children' | 'infants', increment: boolean) => {
    setFormData(prev => ({
      ...prev,
      passengers: {
        ...prev.passengers,
        [type]: Math.max(0, prev.passengers[type] + (increment ? 1 : -1))
      }
    }));
    
    if ('vibrate' in navigator) {
      navigator.vibrate(increment ? 15 : 10);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      trackFormSubmit('flight_form_mobile_ultra_premium');
      trackQuoteRequest({ services: ['voos'] });

      // ULTRATHINK: Fixed API data structure to match schema requirements
      const submissionData = {
        // Required fields matching CreateLeadInput interface
        nome: `${formData.contactInfo.firstName} ${formData.contactInfo.lastName}`.trim(),
        email: formData.contactInfo.email.trim(),
        whatsapp: formData.contactInfo.phone, // Required by schema
        telefone: formData.contactInfo.phone, // Also keep telefone for compatibility
        selectedServices: ['voos'], // Fixed: was 'servicos', now 'selectedServices'
        
        // Travel information using schema field names
        origem: formData.origin?.name || formData.origin?.iataCode || '',
        destino: formData.destination?.name || formData.destination?.iataCode || '',
        tipoViagem: formData.tripType === 'round-trip' ? 'ida_volta' : 'ida',
        dataPartida: formData.departureDate,
        dataRetorno: formData.returnDate || undefined,
        
        // Passenger information
        adultos: formData.passengers.adults,
        criancas: formData.passengers.children,
        bebes: formData.passengers.infants,
        numeroPassageiros: formData.passengers.adults + formData.passengers.children + formData.passengers.infants,
        
        // Flight preferences
        classeViagem: formData.travelClass,
        flexibilidadeDatas: formData.flexivelDatas,
        
        // Budget and preferences
        prioridadeOrcamento: formData.budget,
        observacoes: formData.preferences || '',
        
        // System fields
        source: 'mobile_flight_form_ultra_premium',
        userAgent: navigator.userAgent,
        
        // Additional data for compatibility
        fullData: {
          ...formData,
          originAirport: formData.origin,
          destinationAirport: formData.destination,
          flightSearchParams: {
            originLocationCode: formData.origin?.iataCode || '',
            destinationLocationCode: formData.destination?.iataCode || '',
            departureDate: formData.departureDate,
            returnDate: formData.returnDate || undefined,
            adults: formData.passengers.adults,
            children: formData.passengers.children,
            infants: formData.passengers.infants,
            travelClass: formData.travelClass.toUpperCase(),
            oneWay: formData.tripType === 'one-way',
            flexibleDates: formData.flexivelDatas ? { enabled: true, days: 3 } : undefined
          },
          urgente: formData.urgente,
          timestamp: new Date().toISOString()
        }
      };

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar solicitação');
      }

      const responseData = await response.json();
      setSubmissionId(responseData.lead?.id || null);

      if (onSearch) {
        onSearch(formData);
      }

      // Show enhanced success modal instead of basic alert
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Error submitting flight form:', error);
      alert('Erro ao enviar sua solicitação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Clean Background - Optimized for mobile performance */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/60 to-indigo-50/50" />


      {/* Ultra Premium Content Area with Glass Container - Full Height */}
      <div className="relative flex-1 overflow-visible">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20, rotateY: 5 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: -20, rotateY: -5 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="h-full p-6 sm:p-4"
          >
            
            {/* STEP 1: ALWAYS-VISIBLE ULTRA-COMPACT TRAVEL DETAILS */}
            {currentStep === 'travel' && (
              <div className="h-full flex flex-col space-y-4 sm:space-y-3 overflow-y-auto">
                
                {/* Trip Type Section */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="backdrop-blur-2xl bg-gradient-to-r from-white/90 via-white/95 to-white/90 rounded-2xl p-3 sm:p-2 border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.98), rgba(248,250,252,0.95))',
                    boxShadow: 'inset 5px 5px 10px rgba(255,255,255,0.8), inset -5px -5px 10px rgba(226,232,240,0.3), 0 10px 20px rgba(59,130,246,0.1)'
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360, boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)' }}
                      transition={{ duration: 0.3, type: "spring", stiffness: 400 }}
                      className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl border-2 border-white/20"
                    >
                      <span className="text-xl">✈️</span>
                    </motion.div>
                    <div className="flex-1">
                      <span className="text-lg font-bold text-gray-900">✈️ Tipo de Viagem</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'round-trip', label: '🔄 Ida e volta', icon: '✈️', gradient: 'from-blue-500 via-blue-600 to-indigo-600' },
                      { value: 'one-way', label: '➡️ Somente ida', icon: '✈️', gradient: 'from-emerald-500 via-emerald-600 to-teal-600' }
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, tripType: type.value as any }));
                          if ('vibrate' in navigator) navigator.vibrate(10);
                        }}
                        className={`p-3 rounded-xl text-sm font-semibold transition-all duration-200 touch-manipulation min-h-[48px] border ${
                          formData.tripType === type.value
                            ? 'bg-blue-600 text-white shadow-md border-blue-700'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center gap-2 relative">
                          <span className="text-2xl">{type.icon}</span>
                          <span className="font-semibold text-center text-sm leading-tight">{type.label}</span>
                          {formData.tripType === type.value && (
                            <motion.div
                              initial={{ scale: 0, rotate: -90 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 300 }}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-white/30 rounded-full flex items-center justify-center"
                            >
                              <CheckIcon className="w-2.5 h-2.5 text-white" />
                            </motion.div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>

                {/* Route Selection */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="backdrop-blur-2xl bg-gradient-to-r from-white/90 via-white/95 to-white/90 rounded-2xl p-3 border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.98), rgba(240,253,250,0.95))',
                    boxShadow: 'inset 5px 5px 10px rgba(255,255,255,0.8), inset -5px -5px 10px rgba(209,250,229,0.3), 0 10px 20px rgba(16,185,129,0.1)'
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div
                      whileHover={{ scale: 1.3, rotateY: 180, boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)' }}
                      transition={{ duration: 0.3, type: "spring", stiffness: 400 }}
                      className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/30"
                    >
                      <MapPinIcon className="w-6 h-6 text-white" />
                    </motion.div>
                    <div className="flex-1">
                      <span className="text-lg font-bold text-gray-900">🌍 Rota da Viagem</span>
                      <div className="text-xs text-emerald-600 font-medium">Seleção de rota</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="flex flex-col">
                          <AirportAutocomplete
                            value={formData.origin}
                            onChange={(airport) => {
                              setFormData(prev => ({ ...prev, origin: airport }));
                              if (errors.origin) setErrors(prev => ({ ...prev, origin: '' }));
                              if ('vibrate' in navigator) navigator.vibrate(10);
                            }}
                            placeholder="🛫 De onde?"
                            className="w-full"
                            inputClassName={`px-4 py-3 sm:py-2.5 text-base sm:text-sm rounded-xl border-2 ${errors.origin ? 'border-red-400' : 'border-gray-200/80'} focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200/50 bg-white/90 backdrop-blur-sm transition-all placeholder:text-gray-400 placeholder:font-normal min-h-[48px] sm:min-h-[44px] touch-manipulation font-medium tracking-normal shadow-sm focus:shadow-md`}
                            isMobile={true}
                            maxResults={3}
                            expandDirection="right"
                          />
                          {errors.origin && <span className="text-xs text-red-500 mt-1">{errors.origin}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            origin: prev.destination,
                            destination: prev.origin
                          }));
                          if ('vibrate' in navigator) navigator.vibrate(10);
                        }}
                        className="p-3 bg-orange-500 rounded-xl text-white shadow-md hover:bg-orange-600 transition-colors duration-200 min-w-[48px] min-h-[48px] touch-manipulation"
                      >
                        <ArrowPathIcon className="w-5 h-5" />
                      </button>
                      <div className="flex-1">
                        <div className="flex flex-col">
                          <AirportAutocomplete
                            value={formData.destination}
                            onChange={(airport) => {
                              setFormData(prev => ({ ...prev, destination: airport }));
                              if (errors.destination) setErrors(prev => ({ ...prev, destination: '' }));
                              if ('vibrate' in navigator) navigator.vibrate(10);
                            }}
                            placeholder="🛬 Para onde?"
                            className="w-full"
                            inputClassName={`px-4 py-3 sm:py-2.5 text-base sm:text-sm rounded-xl border-2 ${errors.destination ? 'border-red-400' : 'border-gray-200/80'} focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200/50 bg-white/90 backdrop-blur-sm transition-all placeholder:text-gray-400 placeholder:font-normal min-h-[48px] sm:min-h-[44px] touch-manipulation font-medium tracking-normal shadow-sm focus:shadow-md`}
                            isMobile={true}
                            maxResults={3}
                            expandDirection="left"
                          />
                          {errors.destination && <span className="text-xs text-red-500 mt-1">{errors.destination}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Date Selection */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="backdrop-blur-2xl bg-gradient-to-r from-white/90 via-white/95 to-white/90 rounded-2xl p-3 border border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.98), rgba(253,244,255,0.95))',
                    boxShadow: 'inset 5px 5px 10px rgba(255,255,255,0.8), inset -5px -5px 10px rgba(233,213,255,0.3), 0 10px 20px rgba(147,51,234,0.1)'
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <motion.div
                      whileHover={{ scale: 1.1, rotateX: 360 }}
                      transition={{ duration: 0.5 }}
                      className="w-8 h-8 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg"
                    >
                      <CalendarIcon className="w-4 h-4 text-white" />
                    </motion.div>
                    <span className="text-sm sm:text-xs font-bold text-gray-900 tracking-wide leading-tight">Datas da Viagem</span>
                  </div>
                  <div className="space-y-2">
                    <div className={`grid gap-2 ${formData.tripType === 'round-trip' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      <div>
                        <label className="text-xs font-semibold text-purple-700 mb-1 block flex items-center gap-1 tracking-wide leading-tight">
                          <span>📅</span> Ida
                        </label>
                        <input
                          type="date"
                          value={formData.departureDate}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, departureDate: e.target.value }));
                            if (errors.departureDate) setErrors(prev => ({ ...prev, departureDate: '' }));
                            if ('vibrate' in navigator) navigator.vibrate(10);
                          }}
                          onFocus={() => setFocusedField('departure')}
                          onBlur={() => setFocusedField(null)}
                          min={getTodayDate()}
                          className={`w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm rounded-xl border-2 bg-white/90 backdrop-blur-sm transition-all min-h-[48px] sm:min-h-[44px] touch-manipulation font-medium tracking-normal shadow-sm focus:shadow-md ${
                            errors.departureDate
                              ? 'border-red-400'
                              : focusedField === 'departure'
                              ? 'border-purple-500 ring-2 ring-purple-200 shadow-lg'
                              : 'border-gray-200/80 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'
                          }`}
                        />
                      </div>
                      {formData.tripType === 'round-trip' && (
                        <div>
                          <label className="text-xs font-semibold text-pink-700 mb-1 block flex items-center gap-1 tracking-wide leading-tight">
                            <span>📅</span> Volta
                          </label>
                          <input
                            type="date"
                            value={formData.returnDate}
                            onChange={(e) => {
                              setFormData(prev => ({ ...prev, returnDate: e.target.value }));
                              if (errors.returnDate) setErrors(prev => ({ ...prev, returnDate: '' }));
                              if ('vibrate' in navigator) navigator.vibrate(10);
                            }}
                            onFocus={() => setFocusedField('return')}
                            onBlur={() => setFocusedField(null)}
                            min={formData.departureDate || getTomorrowDate()}
                            className={`w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm rounded-xl border-2 bg-white/90 backdrop-blur-sm transition-all min-h-[48px] sm:min-h-[44px] touch-manipulation font-medium tracking-normal shadow-sm focus:shadow-md ${
                              errors.returnDate
                                ? 'border-red-400'
                                : focusedField === 'return'
                                ? 'border-pink-500 ring-2 ring-pink-200 shadow-lg'
                                : 'border-gray-200/80 focus:border-pink-500 focus:ring-2 focus:ring-pink-200'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                    {/* Error messages for dates */}
                    {(errors.departureDate || errors.returnDate) && (
                      <div className="text-xs text-red-500 mt-1">
                        {errors.departureDate || errors.returnDate}
                      </div>
                    )}
                    <motion.label 
                      whileHover={{ scale: 1.01, boxShadow: '0 4px 12px rgba(59, 130, 246, 0.12)' }}
                      whileTap={{ scale: 0.99 }}
                      transition={{ type: "spring", damping: 25, stiffness: 500 }}
                      className="flex items-center gap-2 p-2 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-xl border border-blue-200/60 cursor-pointer transition-all hover:shadow-md min-h-[44px] touch-manipulation"
                      style={{
                        boxShadow: 'inset 2px 2px 4px rgba(255,255,255,0.8), inset -2px -2px 4px rgba(219,234,254,0.4)'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.flexivelDatas}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, flexivelDatas: e.target.checked }));
                          if ('vibrate' in navigator) navigator.vibrate(10);
                        }}
                        className="w-4 h-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-base">📅</span>
                        <span className="text-xs font-semibold text-blue-900 tracking-normal leading-relaxed">Datas flexíveis (+/- 3 dias)</span>
                      </div>
                    </motion.label>
                  </div>
                </motion.div>

                {/* Passengers Selection */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="backdrop-blur-2xl bg-gradient-to-r from-white/90 via-white/95 to-white/90 rounded-2xl p-3 border border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.98), rgba(255,247,237,0.95))',
                    boxShadow: 'inset 5px 5px 10px rgba(255,255,255,0.8), inset -5px -5px 10px rgba(254,215,170,0.3), 0 10px 20px rgba(234,88,12,0.1)'
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div
                      whileHover={{ scale: 1.3, rotateZ: 360, boxShadow: '0 12px 35px rgba(249, 115, 22, 0.5)' }}
                      transition={{ duration: 0.4, type: "spring", stiffness: 500 }}
                      className="w-14 h-14 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/30 animate-pulse hover:animate-none"
                    >
                      <UsersIcon className="w-7 h-7 text-white" />
                    </motion.div>
                    <div className="flex-1">
                      <span className="text-lg font-bold text-gray-900">👥 Passageiros</span>
                      <div className="text-xs text-orange-600 font-medium">Contador de passageiros</div>
                    </div>
                    <div className="text-xl font-bold text-orange-600 bg-gradient-to-r from-orange-50 to-red-50 px-4 py-2 rounded-xl border-2 border-orange-200 shadow-md">
                      {formData.passengers.adults + formData.passengers.children + formData.passengers.infants} passageiros
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { type: 'adults', label: 'Adultos', emoji: '👤', desc: '12+', color: 'from-blue-500 via-blue-600 to-indigo-600' },
                      { type: 'children', label: 'Crianças', emoji: '🧒', desc: '2-11', color: 'from-green-500 via-green-600 to-emerald-600' },
                      { type: 'infants', label: 'Bebês', emoji: '👶', desc: '0-2', color: 'from-pink-500 via-pink-600 to-rose-600' }
                    ].map((passenger) => (
                      <div key={passenger.type} className="text-center">
                        <div className="text-xs font-semibold text-gray-700 mb-1 flex flex-col items-center tracking-wide leading-tight">
                          <div className="flex items-center gap-1 mb-0.5">
                            <span className="text-sm">{passenger.emoji}</span>
                            <span className="font-bold text-xs tracking-wide leading-tight">{passenger.label}</span>
                          </div>
                          <span className="text-xs text-gray-500 font-medium tracking-normal leading-relaxed">{passenger.desc}</span>
                        </div>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <button
                            onClick={() => {
                              handlePassengerChange(passenger.type as any, false);
                              if ('vibrate' in navigator) navigator.vibrate(5);
                            }}
                            disabled={formData.passengers[passenger.type as keyof typeof formData.passengers] <= (passenger.type === 'adults' ? 1 : 0)}
                            className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center disabled:opacity-50 text-gray-700 font-bold transition-colors hover:bg-gray-300 min-w-[32px] min-h-[32px] touch-manipulation"
                          >
                            <span className="text-lg font-bold">−</span>
                          </button>
                          <span className="font-black text-xl min-w-[24px] text-gray-900 tracking-wide leading-tight animate-pulse">
                            {formData.passengers[passenger.type as keyof typeof formData.passengers]}
                          </span>
                          <button
                            onClick={() => {
                              handlePassengerChange(passenger.type as any, true);
                              if ('vibrate' in navigator) navigator.vibrate(5);
                            }}
                            disabled={
                              formData.passengers[passenger.type as keyof typeof formData.passengers] >= 9 ||
                              (passenger.type === 'infants' && formData.passengers.infants >= formData.passengers.adults)
                            }
                            className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center disabled:opacity-50 text-white font-bold transition-colors hover:bg-blue-700 min-w-[32px] min-h-[32px] touch-manipulation"
                          >
                            <span className="text-lg font-bold">+</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Travel Class Selection */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="backdrop-blur-2xl bg-gradient-to-r from-white/90 via-white/95 to-white/90 rounded-2xl p-3 border border-yellow-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.98), rgba(255,251,235,0.95))',
                    boxShadow: 'inset 5px 5px 10px rgba(255,255,255,0.8), inset -5px -5px 10px rgba(254,240,138,0.3), 0 10px 20px rgba(217,119,6,0.1)'
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <motion.div
                      whileHover={{ scale: 1.1, rotateY: 360 }}
                      transition={{ duration: 0.7 }}
                      className="w-8 h-8 bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg"
                    >
                      <SparklesIcon className="w-4 h-4 text-white" />
                    </motion.div>
                    <span className="text-sm sm:text-xs font-bold text-gray-900 tracking-wide leading-tight">Classe de Viagem</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'economy', label: 'Econômica', icon: '💺', gradient: 'from-blue-500 via-blue-600 to-cyan-600', desc: 'Básico' },
                      { value: 'premium', label: 'Premium', icon: '🛋️', gradient: 'from-purple-500 via-purple-600 to-indigo-600', desc: 'Conforto+' },
                      { value: 'business', label: 'Executiva', icon: '✈️', gradient: 'from-amber-500 via-orange-500 to-red-500', desc: 'Luxo' },
                      { value: 'first', label: 'Primeira', icon: '👑', gradient: 'from-pink-500 via-rose-500 to-red-600', desc: 'Ultimate' }
                    ].map((cls) => (
                      <motion.button
                        key={cls.value}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, travelClass: cls.value as any }));
                          if ('vibrate' in navigator) navigator.vibrate(15);
                        }}
                        whileHover={{ scale: 1.02, y: -2, boxShadow: '0 8px 25px rgba(59, 130, 246, 0.2)', borderColor: 'rgba(59, 130, 246, 0.3)' }}
                        whileTap={{ scale: 0.98, y: 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 400, mass: 0.8 }}
                        className={`p-3 rounded-xl text-xs font-semibold transition-all duration-300 touch-manipulation min-h-[48px] ${
                          formData.travelClass === cls.value
                            ? `bg-gradient-to-br ${cls.gradient} text-white border border-white/20`
                            : 'bg-white/80 text-gray-700 border border-gray-200/80 hover:border-gray-300 hover:bg-white/90'
                        }`}
                        style={{
                          boxShadow: formData.travelClass === cls.value 
                            ? 'inset 2px 2px 4px rgba(255,255,255,0.2), inset -2px -2px 4px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.15)'
                            : 'inset 3px 3px 6px rgba(255,255,255,0.9), inset -3px -3px 6px rgba(226,232,240,0.4), 0 2px 4px rgba(0,0,0,0.05)'
                        }}
                      >
                        <div className="flex flex-col items-center gap-1 relative">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{cls.icon}</span>
                            <span className="font-semibold text-sm">{cls.label}</span>
                          </div>
                          <span className="text-xs opacity-80 text-center font-medium">{cls.desc}</span>
                          {formData.travelClass === cls.value && (
                            <motion.div
                              initial={{ scale: 0, rotate: -90 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 300 }}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-white/30 rounded-full flex items-center justify-center"
                            >
                              <CheckIcon className="w-2.5 h-2.5 text-white" />
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

              </div>
            )}

            {/* STEP 2: ULTRA PREMIUM CONTACT */}
            {currentStep === 'contact' && (
              <div className="h-full flex flex-col">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center mb-4"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl mx-auto mb-3 flex items-center justify-center shadow-xl">
                    <UserIcon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">👤 Seus Dados Pessoais</h4>
                  <p className="text-base text-indigo-600 mt-2 font-semibold tracking-normal leading-relaxed animate-pulse">Para que possamos criar sua experiência premium</p>
                </motion.div>

                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label className="text-xs font-semibold text-gray-700 mb-2 block tracking-wide leading-tight">Nome *</label>
                      <input
                        type="text"
                        value={formData.contactInfo.firstName}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, firstName: e.target.value }
                        }))}
                        placeholder="Primeiro nome"
                        className="w-full px-3 py-3 text-sm rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white/90 backdrop-blur-sm shadow-sm transition-all placeholder:text-gray-400 placeholder:font-normal font-medium tracking-normal min-h-[48px] touch-manipulation"
                        required
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <label className="text-xs font-semibold text-gray-700 mb-2 block tracking-wide leading-tight">Sobrenome *</label>
                      <input
                        type="text"
                        value={formData.contactInfo.lastName}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, lastName: e.target.value }
                        }))}
                        placeholder="Sobrenome"
                        className="w-full px-3 py-3 text-sm rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white/90 backdrop-blur-sm shadow-sm transition-all placeholder:text-gray-400 placeholder:font-normal font-medium tracking-normal min-h-[48px] touch-manipulation"
                        required
                      />
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="text-xs font-semibold text-gray-700 mb-2 block tracking-wide leading-tight">E-mail *</label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <motion.input
                        type="email"
                        value={formData.contactInfo.email}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, email: e.target.value }
                        }))}
                        placeholder="seu@email.com"
                        whileFocus={{ scale: 1.02, y: -2, boxShadow: '0 8px 25px rgba(99, 102, 241, 0.2)' }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="w-full pl-12 pr-4 py-4 text-base rounded-2xl border-3 border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200/50 bg-white/95 backdrop-blur-md shadow-lg focus:shadow-2xl transition-all duration-500 placeholder:text-gray-400 font-semibold tracking-normal min-h-[52px] touch-manipulation hover:shadow-xl hover:border-indigo-300"
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="text-xs font-semibold text-gray-700 mb-2 block tracking-wide leading-tight">Telefone *</label>
                    <PhoneInput
                      value={formData.contactInfo.phone}
                      onChange={(value) => setFormData(prev => ({
                        ...prev,
                        contactInfo: { ...prev.contactInfo, phone: value }
                      }))}
                      className="w-full"
                      required
                    />
                  </motion.div>

                </div>
              </div>
            )}

            {/* STEP 3: ULTRA PREMIUM BUDGET & NOTES */}
            {currentStep === 'budget-notes' && (
              <div className="h-full flex flex-col">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center mb-4"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl mx-auto mb-3 flex items-center justify-center shadow-xl">
                    <SparklesIcon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">💎 Orçamento & Preferências</h4>
                  <p className="text-base text-orange-600 mt-2 font-semibold tracking-normal leading-relaxed animate-pulse">Personalize sua experiência de viagem</p>
                </motion.div>

                <div className="flex-1 space-y-4">
                  {/* Premium Budget Selection */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="text-sm font-bold text-gray-800 mb-3 block flex items-center gap-2">
                      <span className="text-lg">💎</span>
                      Faixa de Orçamento
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'economy', label: 'Econômico', range: 'R$ 500 - R$ 1.500', icon: '💰', gradient: 'from-green-500 to-emerald-500' },
                        { value: 'standard', label: 'Padrão', range: 'R$ 1.500 - R$ 3.000', icon: '💳', gradient: 'from-blue-500 to-cyan-500' },
                        { value: 'premium', label: 'Premium', range: 'R$ 3.000 - R$ 5.000', icon: '💎', gradient: 'from-purple-500 to-indigo-500' },
                        { value: 'luxury', label: 'Luxo', range: 'R$ 5.000+', icon: '👑', gradient: 'from-amber-500 to-orange-500' }
                      ].map((budget) => (
                        <motion.button
                          key={budget.value}
                          onClick={() => setFormData(prev => ({ ...prev, budget: budget.value as any }))}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className={`p-4 rounded-xl border-2 text-xs font-semibold transition-all duration-300 shadow-lg ${
                            formData.budget === budget.value
                              ? `border-transparent bg-gradient-to-br ${budget.gradient} text-white shadow-xl`
                              : 'border-gray-200 bg-white/80 text-gray-700 hover:border-gray-300 hover:shadow-xl'
                          }`}
                        >
                          <div className="text-center space-y-2">
                            <div className="text-2xl">{budget.icon}</div>
                            <div className="font-bold">{budget.label}</div>
                            <div className={`text-xs ${formData.budget === budget.value ? 'text-white/90' : 'text-gray-500'}`}>
                              {budget.range}
                            </div>
                            {formData.budget === budget.value && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-5 h-5 bg-white/30 rounded-full flex items-center justify-center mx-auto"
                              >
                                <CheckIcon className="w-3 h-3 text-white" />
                              </motion.div>
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Premium Preferences */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="text-sm font-bold text-gray-800 mb-3 block flex items-center gap-2">
                      <span className="text-lg">✨</span>
                      Preferências Especiais
                    </label>
                    <textarea
                      value={formData.preferences}
                      onChange={(e) => setFormData(prev => ({ ...prev, preferences: e.target.value }))}
                      placeholder="Horário preferido, companhia aérea favorita, necessidades especiais, observações..."
                      rows={3}
                      className="w-full px-4 py-3 text-sm rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 bg-white/90 backdrop-blur-sm shadow-sm transition-all resize-none placeholder:text-gray-400"
                    />
                  </motion.div>

                  {/* Premium Quick Options */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-800 mb-2 block flex items-center gap-2">
                      <span className="text-lg">⚡</span>
                      Opções Rápidas
                    </label>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <motion.label 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: "spring", damping: 22, stiffness: 500, delay: 0.5 }}
                        whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)' }}
                        whileTap={{ scale: 0.99 }}
                        className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 cursor-pointer transition-all hover:shadow-lg"
                      >
                        <input
                          type="checkbox"
                          checked={formData.urgente}
                          onChange={(e) => setFormData(prev => ({ ...prev, urgente: e.target.checked }))}
                          className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">⚡</span>
                          <div>
                            <span className="text-sm font-bold text-amber-900">Solicitação Urgente</span>
                            <p className="text-xs text-amber-700">Preciso viajar nos próximos 7 dias</p>
                          </div>
                        </div>
                      </motion.label>

                      {/* Removed duplicate flexible dates checkbox - already exists in travel step */}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: ULTRA PREMIUM SUBMIT */}
            {currentStep === 'submit' && (
              <div className="h-full flex flex-col">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center mb-4"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl mx-auto mb-3 flex items-center justify-center shadow-xl">
                    <CheckIcon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">✅ Confirmar Solicitação Premium</h4>
                  <p className="text-base text-emerald-600 mt-2 font-semibold tracking-normal leading-relaxed animate-pulse">Revise todos os detalhes antes de enviar</p>
                </motion.div>

                <div className="flex-1 space-y-3 overflow-y-auto">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="backdrop-blur-sm bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl p-3 border border-blue-200 shadow-sm"
                  >
                    <h5 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2 tracking-tight leading-snug">
                      <span className="text-lg">✈️</span>
                      Detalhes da Viagem
                    </h5>
                    <div className="space-y-1 text-xs text-blue-800">
                      <div className="flex justify-between">
                        <span className="font-medium tracking-normal">Rota:</span>
                        <span className="font-bold tracking-wide">{formData.origin?.iataCode} ✈️ {formData.destination?.iataCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Datas:</span>
                        <span className="font-bold">
                          {formData.departureDate && new Date(formData.departureDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                          {formData.returnDate && ` - ${new Date(formData.returnDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Passageiros:</span>
                        <span className="font-bold">
                          👤{formData.passengers.adults}
                          {formData.passengers.children > 0 && ` 🧒${formData.passengers.children}`}
                          {formData.passengers.infants > 0 && ` 👶${formData.passengers.infants}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Classe:</span>
                        <span className="font-bold">
                          {formData.travelClass === 'economy' && '💺 Econômica'}
                          {formData.travelClass === 'premium' && '🛋️ Premium'}
                          {formData.travelClass === 'business' && '✈️ Executiva'}
                          {formData.travelClass === 'first' && '👑 Primeira'}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="backdrop-blur-sm bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-200 shadow-sm"
                  >
                    <h5 className="text-sm font-bold text-emerald-900 mb-2 flex items-center gap-2">
                      <span className="text-lg">👤</span>
                      Informações de Contato
                    </h5>
                    <div className="space-y-1 text-xs text-emerald-800">
                      <div className="font-bold">{formData.contactInfo.firstName} {formData.contactInfo.lastName}</div>
                      <div className="flex items-center gap-1">
                        <EnvelopeIcon className="w-3 h-3" />
                        {formData.contactInfo.email}
                      </div>
                      <div className="flex items-center gap-1">
                        📱 {formData.contactInfo.phone}
                      </div>
                    </div>
                  </motion.div>

                  {(formData.urgente || formData.flexivelDatas) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-wrap gap-2"
                    >
                      {formData.urgente && (
                        <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-full text-xs font-semibold shadow-sm">
                          ⚡ Urgente
                        </span>
                      )}
                      {formData.flexivelDatas && (
                        <span className="px-3 py-1 bg-gradient-to-r from-blue-400 to-indigo-400 text-white rounded-full text-xs font-semibold shadow-sm">
                          📅 Flexível
                        </span>
                      )}
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-center space-y-2 text-xs text-gray-600 mt-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200"
                  >
                    <div className="flex items-center justify-center gap-4">
                      <div className="flex items-center gap-1">
                        <span className="text-green-500">✅</span>
                        <span className="font-medium">Resposta em 2h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-blue-500">📞</span>
                        <span className="font-medium">Suporte 24/7</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      <div className="flex items-center gap-1">
                        <span className="text-purple-500">💰</span>
                        <span className="font-medium">Cotação gratuita</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-amber-500">⭐</span>
                        <span className="font-medium">Premium Experience</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <motion.button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-4 w-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 text-white py-4 px-6 rounded-2xl font-bold text-base shadow-2xl disabled:opacity-50 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-pulse"></div>
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-3 relative z-10">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      <span>Enviando sua solicitação premium...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-3 relative z-10">
                      <SparklesIcon className="w-5 h-5" />
                      <span>✈️ Enviar Solicitação Premium</span>
                      <SparklesIcon className="w-5 h-5" />
                    </span>
                  )}
                </motion.button>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Ultra Premium Navigation with Glass Morphism - ULTRATHINK: Proper z-index */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="relative border-t border-white/30 bg-white/80 backdrop-blur-xl px-4 py-3 flex justify-between items-center relative z-40 shadow-lg"
      >
        {/* Premium Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/80 to-white/90"></div>
        <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-gray-50/50 to-transparent"></div>
        
        <motion.button
          onClick={prevStep}
          disabled={currentStep === 'travel'}
          whileHover={{ scale: 1.02, x: -2 }}
          whileTap={{ scale: 0.98 }}
          className="relative flex items-center gap-2 px-4 py-2 text-gray-600 text-sm font-semibold disabled:opacity-50 transition-all duration-300 rounded-xl hover:bg-white/50 disabled:hover:bg-transparent z-10"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Voltar
        </motion.button>

        {/* Enhanced Dots */}
        <div className="relative flex gap-2 z-10">
          {steps.map((step, index) => {
            const isActive = step.key === currentStep;
            const isCompleted = getCurrentStepIndex() > index;
            
            return (
              <motion.div
                key={step.key}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="relative"
              >
                <div
                  className={`w-3 h-3 rounded-full transition-all duration-300 shadow-sm ${
                    isCompleted 
                      ? 'bg-gradient-to-br from-emerald-400 to-teal-400 shadow-emerald-300/50' 
                      : isActive 
                        ? 'bg-gradient-to-br from-blue-400 to-indigo-400 shadow-blue-300/50' 
                        : 'bg-gray-300'
                  }`}
                />
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 rounded-full border-2 border-blue-400/50 animate-ping"
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {currentStep !== 'submit' ? (
          <motion.button
            onClick={nextStep}
            disabled={!canProceedFromStep(currentStep)}
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
            className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl disabled:hover:shadow-lg z-10"
          >
            Continue
            <ChevronRightIcon className="w-4 h-4" />
          </motion.button>
        ) : (
          <div className="relative w-20 z-10"></div>
        )}
      </motion.div>

      {/* Enhanced Success Modal */}
      <EnhancedSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        customerName={`${formData.contactInfo.firstName} ${formData.contactInfo.lastName}`.trim() || 'Cliente'}
        customerEmail={formData.contactInfo.email}
        customerPhone={formData.contactInfo.phone}
        serviceType="Voos"
        route={formData.origin && formData.destination 
          ? `${formData.origin.name} → ${formData.destination.name}` 
          : undefined}
        leadId={submissionId || undefined}
      />
    </div>
  );
}