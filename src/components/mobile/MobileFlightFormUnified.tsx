'use client';

import React, { useState, useCallback } from 'react';
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
  CurrencyDollarIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { trackFormSubmit, trackQuoteRequest } from '@/lib/analytics-safe';
import PhoneInput from '@/components/PhoneInputSimple';
import AirportAutocomplete from '@/components/flights/AirportAutocomplete';
import { AirportSelection } from '@/types/flights';

// ========================================================================================
// UNIFIED FLIGHT FORM INTERFACES & TYPES
// ========================================================================================

interface FlightFormData {
  // Trip Configuration
  tripType: 'round-trip' | 'one-way' | 'multi-city';
  origin: AirportSelection | null;
  destination: AirportSelection | null;
  departureDate: string;
  returnDate: string;
  
  // Passengers
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  
  // Travel Preferences
  travelClass: 'economy' | 'premium' | 'business' | 'first';
  budget: 'economy' | 'standard' | 'premium' | 'luxury';
  preferences: string;
  urgente: boolean;
  flexivelDatas: boolean;
  
  // Contact Information
  contactInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    countryCode: string;
  };
}

interface MobileFlightFormUnifiedProps {
  // Core functionality
  onSearch?: (data: FlightFormData) => void;
  onSubmit?: (data: FlightFormData) => void;
  onClose?: () => void;
  
  // Configuration
  mode?: 'compact' | 'premium' | 'embedded';
  stepFlow?: 'basic' | 'extended'; // 3-step vs 4-step
  showNavigation?: boolean;
  className?: string;
  
  // Initial data
  initialData?: Partial<FlightFormData>;
}

type StepType = 'travel' | 'contact' | 'budget-notes' | 'review';

// ========================================================================================
// DESIGN SYSTEM TOKENS
// ========================================================================================

const designTokens = {
  colors: {
    primary: {
      50: 'bg-blue-50',
      100: 'bg-blue-100',
      500: 'bg-blue-500',
      600: 'bg-blue-600',
      700: 'bg-blue-700'
    },
    success: {
      50: 'bg-green-50',
      500: 'bg-green-500',
      600: 'bg-green-600'
    },
    warning: {
      50: 'bg-yellow-50',
      500: 'bg-yellow-500'
    }
  },
  spacing: {
    section: 'space-y-4',
    field: 'mb-4',
    compact: 'p-3',
    comfortable: 'p-4',
    spacious: 'p-6'
  },
  typography: {
    title: 'text-lg font-bold text-gray-900',
    subtitle: 'text-sm text-gray-600',
    label: 'text-xs font-semibold text-gray-700 mb-2 block',
    input: 'text-base font-medium'
  },
  animations: {
    page: { duration: 0.3 },
    button: { duration: 0.2, type: 'spring', damping: 20 },
    micro: { duration: 0.15 }
  }
};

// ========================================================================================
// UNIFIED MOBILE FLIGHT FORM COMPONENT
// ========================================================================================

export default function MobileFlightFormUnified({ 
  onSearch, 
  onSubmit,
  onClose,
  mode = 'premium',
  stepFlow = 'extended',
  showNavigation = true,
  className = '',
  initialData = {}
}: MobileFlightFormUnifiedProps) {
  
  // =====================
  // STATE MANAGEMENT
  // =====================
  
  const [currentStep, setCurrentStep] = useState<StepType>('travel');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
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
    flexivelDatas: false,
    ...initialData
  });

  // =====================
  // STEP CONFIGURATION
  // =====================
  
  const getStepConfig = () => {
    const baseSteps = [
      { key: 'travel', title: 'Viagem', icon: PaperAirplaneIcon },
      { key: 'contact', title: 'Contato', icon: UserIcon }
    ];
    
    if (stepFlow === 'extended') {
      return [
        ...baseSteps,
        { key: 'budget-notes', title: 'Orçamento', icon: SparklesIcon },
        { key: 'review', title: 'Revisar', icon: CheckIcon }
      ];
    } else {
      return [
        ...baseSteps,
        { key: 'review', title: 'Revisar', icon: CheckIcon }
      ];
    }
  };

  const steps = getStepConfig();
  const getCurrentStepIndex = () => steps.findIndex(s => s.key === currentStep);
  
  // =====================
  // VALIDATION LOGIC
  // =====================
  
  const canProceedFromStep = (step: StepType): boolean => {
    switch (step) {
      case 'travel':
        return !!(
          formData.tripType && 
          formData.origin?.iataCode && 
          formData.destination?.iataCode && 
          formData.departureDate && 
          (formData.tripType !== 'round-trip' || formData.returnDate) &&
          formData.passengers.adults > 0
        );
      case 'contact':
        return !!(
          formData.contactInfo.firstName && 
          formData.contactInfo.lastName && 
          formData.contactInfo.email && 
          formData.contactInfo.phone
        );
      case 'budget-notes':
        return true; // Optional step
      case 'review':
        return true;
      default:
        return false;
    }
  };

  // =====================
  // NAVIGATION HANDLERS
  // =====================
  
  const nextStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1 && canProceedFromStep(currentStep)) {
      setCurrentStep(steps[currentIndex + 1].key as StepType);
      setActiveSection(null);
      if ('vibrate' in navigator) {
        navigator.vibrate([10, 40, 8]);
      }
    }
  };

  const prevStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].key as StepType);
      setActiveSection(null);
      if ('vibrate' in navigator) {
        navigator.vibrate([5, 20, 5]);
      }
    }
  };

  // =====================
  // FORM HANDLERS
  // =====================
  
  const handlePassengerChange = useCallback((type: 'adults' | 'children' | 'infants', increment: boolean) => {
    setFormData(prev => ({
      ...prev,
      passengers: {
        ...prev.passengers,
        [type]: Math.max(0, prev.passengers[type] + (increment ? 1 : -1))
      }
    }));
    
    if ('vibrate' in navigator) {
      navigator.vibrate(increment ? 12 : 8);
    }
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Track analytics
      trackFormSubmit(`flight_form_mobile_${mode}`);
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
            originAirport: formData.origin,
            destinationAirport: formData.destination,
            origin: formData.origin?.iataCode || '',
            destination: formData.destination?.iataCode || ''
          }
        },
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
        observacoes: formData.preferences || '',
        urgente: formData.urgente,
        flexivelDatas: formData.flexivelDatas,
        budget: formData.budget,
        timestamp: new Date().toISOString(),
        source: `mobile_flight_form_unified_${mode}`,
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

      // Call callbacks
      if (onSubmit) {
        onSubmit(formData);
      }
      
      if (onSearch) {
        onSearch(formData);
      }

      alert('Sua solicitação foi enviada com sucesso! Entraremos em contato em breve.');
      
    } catch (error) {
      console.error('Error submitting flight form:', error);
      alert('Erro ao enviar sua solicitação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // =====================
  // UTILITY FUNCTIONS
  // =====================
  
  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // =====================
  // MODE-SPECIFIC STYLING
  // =====================
  
  const getModeStyles = () => {
    switch (mode) {
      case 'compact':
        return {
          container: 'bg-white',
          section: 'bg-white rounded-lg border border-gray-200 p-3 mb-3',
          title: 'text-sm font-bold text-gray-900',
          spacing: 'space-y-2'
        };
      case 'premium':
        return {
          container: 'bg-gradient-to-br from-slate-50 via-blue-50/80 to-indigo-50',
          section: 'backdrop-blur-xl bg-gradient-to-r from-white/90 via-white/95 to-white/90 rounded-2xl p-4 mb-4 border border-blue-200/50 shadow-lg',
          title: 'text-lg font-bold text-gray-900',
          spacing: 'space-y-4'
        };
      case 'embedded':
        return {
          container: 'bg-transparent',
          section: 'bg-white rounded-xl border border-gray-100 p-4 mb-4 shadow-sm',
          title: 'text-base font-bold text-gray-900',
          spacing: 'space-y-3'
        };
      default:
        return {
          container: 'bg-white',
          section: 'bg-white rounded-xl border border-gray-200 p-4 mb-4',
          title: 'text-lg font-bold text-gray-900',
          spacing: 'space-y-4'
        };
    }
  };

  const modeStyles = getModeStyles();

  // ========================================================================================
  // RENDER COMPONENT
  // ========================================================================================

  return (
    <div className={`h-full flex flex-col ${modeStyles.container} ${className}`}>
      
      {/* UNIFIED HEADER - Only show if navigation enabled */}
      {showNavigation && (
        <div className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-sky-500 text-white px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            {onClose && (
              <button
                onClick={onClose}
                className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Voltar</span>
              </button>
            )}
            
            {/* Title & Progress */}
            <div className="flex-1 text-center">
              <h1 className="text-sm font-bold">✈️ Cotação de Voos</h1>
              <div className="flex justify-center gap-1 mt-1">
                {steps.map((step, index) => {
                  const isActive = step.key === currentStep;
                  const isCompleted = getCurrentStepIndex() > index;
                  
                  return (
                    <div
                      key={step.key}
                      className={`w-6 h-1 rounded-full transition-all ${
                        isCompleted ? 'bg-white' : isActive ? 'bg-white/70' : 'bg-white/30'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
            
            {/* Step Counter */}
            <div className="text-xs text-white/80">
              {getCurrentStepIndex() + 1}/{steps.length}
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={designTokens.animations.page}
            className={`${modeStyles.spacing} p-4`}
          >
            
            {/* STEP 1: TRAVEL DETAILS */}
            {currentStep === 'travel' && (
              <div className={modeStyles.spacing}>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <PaperAirplaneIcon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className={modeStyles.title}>Detalhes da Viagem</h2>
                  <p className="text-sm text-gray-600 mt-1">Configure sua viagem ideal</p>
                </div>

                {/* Trip Type */}
                <div className={modeStyles.section}>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Tipo de Viagem</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'round-trip', label: 'Ida e volta', icon: '↔️' },
                      { value: 'one-way', label: 'Somente ida', icon: '→' }
                    ].map((type) => (
                      <motion.button
                        key={type.value}
                        onClick={() => setFormData(prev => ({ ...prev, tripType: type.value as any }))}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          formData.tripType === type.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-blue-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-lg mb-1">{type.icon}</div>
                          <div>{type.label}</div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Route Selection */}
                <div className={modeStyles.section}>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Rota</h3>
                  <div className="space-y-3">
                    <AirportAutocomplete
                      value={formData.origin}
                      onChange={(airport) => setFormData(prev => ({ ...prev, origin: airport }))}
                      placeholder="🛫 De onde?"
                      className="w-full"
                      inputClassName="px-4 py-3 text-sm rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      isMobile={true}
                      maxResults={4}
                    />
                    
                    <div className="flex justify-center">
                      <button
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            origin: prev.destination,
                            destination: prev.origin
                          }));
                        }}
                        className="p-2 bg-blue-100 rounded-lg text-blue-600 hover:bg-blue-200 transition-colors"
                      >
                        <ArrowPathIcon className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <AirportAutocomplete
                      value={formData.destination}
                      onChange={(airport) => setFormData(prev => ({ ...prev, destination: airport }))}
                      placeholder="🛬 Para onde?"
                      className="w-full"
                      inputClassName="px-4 py-3 text-sm rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      isMobile={true}
                      maxResults={4}
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className={modeStyles.section}>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Datas</h3>
                  <div className={`grid gap-3 ${formData.tripType === 'round-trip' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">📅 Ida</label>
                      <input
                        type="date"
                        value={formData.departureDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, departureDate: e.target.value }))}
                        min={getTodayDate()}
                        className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:border-blue-500"
                      />
                    </div>
                    
                    {formData.tripType === 'round-trip' && (
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">📅 Volta</label>
                        <input
                          type="date"
                          value={formData.returnDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, returnDate: e.target.value }))}
                          min={formData.departureDate || getTomorrowDate()}
                          className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:border-blue-500"
                        />
                      </div>
                    )}
                  </div>
                  
                  <label className="flex items-center gap-2 mt-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.flexivelDatas}
                      onChange={(e) => setFormData(prev => ({ ...prev, flexivelDatas: e.target.checked }))}
                      className="w-4 h-4 rounded border-blue-300 text-blue-600"
                    />
                    <span className="text-xs text-gray-700">Datas flexíveis (+/- 3 dias)</span>
                  </label>
                </div>

                {/* Passengers */}
                <div className={modeStyles.section}>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Passageiros</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { type: 'adults', label: 'Adultos', emoji: '👤', min: 1 },
                      { type: 'children', label: 'Crianças', emoji: '🧒', min: 0 },
                      { type: 'infants', label: 'Bebês', emoji: '👶', min: 0 }
                    ].map((passenger) => (
                      <div key={passenger.type} className="text-center">
                        <div className="text-xs font-medium text-gray-700 mb-2 flex flex-col items-center">
                          <span className="text-lg mb-1">{passenger.emoji}</span>
                          <span>{passenger.label}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handlePassengerChange(passenger.type as any, false)}
                            disabled={formData.passengers[passenger.type as keyof typeof formData.passengers] <= passenger.min}
                            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center disabled:opacity-50 text-sm font-bold hover:bg-gray-200"
                          >
                            -
                          </button>
                          <span className="font-bold text-lg min-w-[24px]">
                            {formData.passengers[passenger.type as keyof typeof formData.passengers]}
                          </span>
                          <button
                            onClick={() => handlePassengerChange(passenger.type as any, true)}
                            disabled={formData.passengers[passenger.type as keyof typeof formData.passengers] >= 9}
                            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center disabled:opacity-50 text-sm font-bold hover:bg-gray-200"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Travel Class */}
                <div className={modeStyles.section}>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Classe de Viagem</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'economy', label: 'Econômica', icon: '💺' },
                      { value: 'premium', label: 'Premium', icon: '🎯' },
                      { value: 'business', label: 'Executiva', icon: '💼' },
                      { value: 'first', label: 'Primeira', icon: '👑' }
                    ].map((cls) => (
                      <button
                        key={cls.value}
                        onClick={() => setFormData(prev => ({ ...prev, travelClass: cls.value as any }))}
                        className={`p-3 rounded-lg border-2 text-xs font-medium transition-all ${
                          formData.travelClass === cls.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-blue-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-lg mb-1">{cls.icon}</div>
                          <div>{cls.label}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: CONTACT INFORMATION */}
            {currentStep === 'contact' && (
              <div className={modeStyles.spacing}>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <UserIcon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className={modeStyles.title}>Seus Dados</h2>
                  <p className="text-sm text-gray-600 mt-1">Para que possamos entrar em contato</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-2 block">Nome *</label>
                      <input
                        type="text"
                        value={formData.contactInfo.firstName}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, firstName: e.target.value }
                        }))}
                        placeholder="Primeiro"
                        className="w-full px-3 py-3 text-sm rounded-lg border-2 border-gray-200 focus:border-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-2 block">Sobrenome *</label>
                      <input
                        type="text"
                        value={formData.contactInfo.lastName}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, lastName: e.target.value }
                        }))}
                        placeholder="Último"
                        className="w-full px-3 py-3 text-sm rounded-lg border-2 border-gray-200 focus:border-green-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-2 block">E-mail *</label>
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
                        className="w-full pl-10 pr-4 py-3 text-sm rounded-lg border-2 border-gray-200 focus:border-green-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-2 block">Telefone *</label>
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
                </div>
              </div>
            )}

            {/* STEP 3: BUDGET & NOTES (Extended Flow Only) */}
            {currentStep === 'budget-notes' && stepFlow === 'extended' && (
              <div className={modeStyles.spacing}>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <CurrencyDollarIcon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className={modeStyles.title}>Orçamento & Preferências</h2>
                  <p className="text-sm text-gray-600 mt-1">Personalize sua experiência</p>
                </div>

                <div className="space-y-6">
                  {/* Budget Selection */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Faixa de Orçamento</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'economy', label: 'Econômico', range: 'R$ 500 - 1.500', icon: '💰' },
                        { value: 'standard', label: 'Padrão', range: 'R$ 1.500 - 3.000', icon: '💳' },
                        { value: 'premium', label: 'Premium', range: 'R$ 3.000 - 5.000', icon: '💎' },
                        { value: 'luxury', label: 'Luxo', range: 'R$ 5.000+', icon: '👑' }
                      ].map((budget) => (
                        <button
                          key={budget.value}
                          onClick={() => setFormData(prev => ({ ...prev, budget: budget.value as any }))}
                          className={`p-3 rounded-lg border-2 text-xs font-medium transition-all text-left ${
                            formData.budget === budget.value
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="text-lg">{budget.icon}</div>
                            <div>
                              <div className="font-bold">{budget.label}</div>
                              <div className="text-xs text-gray-500">{budget.range}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preferences */}
                  <div>
                    <label className="text-sm font-semibold text-gray-800 mb-2 block">Preferências Especiais</label>
                    <textarea
                      value={formData.preferences}
                      onChange={(e) => setFormData(prev => ({ ...prev, preferences: e.target.value }))}
                      placeholder="Horário preferido, companhia aérea, necessidades especiais..."
                      rows={3}
                      className="w-full px-4 py-3 text-sm rounded-lg border-2 border-gray-200 focus:border-purple-500 resize-none"
                    />
                  </div>

                  {/* Quick Options */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.urgente}
                        onChange={(e) => setFormData(prev => ({ ...prev, urgente: e.target.checked }))}
                        className="w-4 h-4 rounded border-yellow-300 text-yellow-600"
                      />
                      <span className="text-sm font-medium text-yellow-900">⚡ Urgente (7 dias)</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.flexivelDatas}
                        onChange={(e) => setFormData(prev => ({ ...prev, flexivelDatas: e.target.checked }))}
                        className="w-4 h-4 rounded border-blue-300 text-blue-600"
                      />
                      <span className="text-sm font-medium text-blue-900">📅 Datas flexíveis</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & SUBMIT */}
            {currentStep === 'review' && (
              <div className={modeStyles.spacing}>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <CheckIcon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className={modeStyles.title}>Revisar & Confirmar</h2>
                  <p className="text-sm text-gray-600 mt-1">Verifique suas informações antes de enviar</p>
                </div>

                <div className="space-y-4">
                  {/* Travel Summary */}
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <h3 className="text-sm font-bold text-blue-900 mb-2">✈️ Viagem</h3>
                    <div className="space-y-1 text-xs text-blue-800">
                      <div className="flex justify-between">
                        <span>Rota:</span>
                        <span className="font-medium">{formData.origin?.iataCode} → {formData.destination?.iataCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Data ida:</span>
                        <span className="font-medium">
                          {formData.departureDate && new Date(formData.departureDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      {formData.returnDate && (
                        <div className="flex justify-between">
                          <span>Data volta:</span>
                          <span className="font-medium">
                            {new Date(formData.returnDate).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Passageiros:</span>
                        <span className="font-medium">
                          {formData.passengers.adults}A
                          {formData.passengers.children > 0 && `+${formData.passengers.children}C`}
                          {formData.passengers.infants > 0 && `+${formData.passengers.infants}B`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Summary */}
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <h3 className="text-sm font-bold text-green-900 mb-2">👤 Contato</h3>
                    <div className="space-y-1 text-xs text-green-800">
                      <div>{formData.contactInfo.firstName} {formData.contactInfo.lastName}</div>
                      <div>{formData.contactInfo.email}</div>
                      <div>{formData.contactInfo.phone}</div>
                    </div>
                  </div>

                  {/* Special Options */}
                  {(formData.urgente || formData.flexivelDatas) && (
                    <div className="flex gap-2">
                      {formData.urgente && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">⚡ Urgente</span>
                      )}
                      {formData.flexivelDatas && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">📅 Flexível</span>
                      )}
                    </div>
                  )}

                  {/* Trust Indicators */}
                  <div className="text-center space-y-1 text-xs text-gray-600 mt-4">
                    <p>✅ Resposta em até 2 horas</p>
                    <p>📞 Atendimento especializado</p>
                    <p>💰 Cotação gratuita</p>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl font-bold text-sm shadow-lg disabled:opacity-50 mt-6"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Enviando...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <PaperAirplaneIcon className="w-4 h-4" />
                        Enviar Solicitação
                      </div>
                    )}
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* UNIFIED NAVIGATION - Only show if enabled and not on final step */}
      {showNavigation && currentStep !== 'review' && (
        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-4 py-3">
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={getCurrentStepIndex() === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 text-sm font-medium disabled:opacity-50 hover:text-gray-800"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              Voltar
            </button>

            <div className="flex gap-1">
              {steps.map((step, index) => {
                const isActive = step.key === currentStep;
                const isCompleted = getCurrentStepIndex() > index;
                
                return (
                  <div
                    key={step.key}
                    className={`w-2 h-2 rounded-full transition-all ${
                      isCompleted ? 'bg-green-600' : isActive ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                );
              })}
            </div>

            <button
              onClick={nextStep}
              disabled={!canProceedFromStep(currentStep)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-blue-700"
            >
              Continue
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}