'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  TruckIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  EnvelopeIcon,
  ChevronDownIcon,
  SparklesIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { CarIcon } from '@/components/Icons';
import { trackFormSubmit, trackQuoteRequest } from '@/lib/analytics-safe';
import PhoneInput from '@/components/PhoneInputSimple';
import CityAutocomplete from '@/components/CityAutocomplete';
import { cities } from '@/data/cities';

// ========================================================================================
// UNIFIED CAR RENTAL FORM INTERFACES & TYPES
// ========================================================================================

interface CarFormData {
  // Rental Configuration
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  dropoffDate: string;
  dropoffTime: string;
  sameLocation: boolean;
  
  // Driver & Requirements
  driverAge: string;
  driverExperience: string;
  
  // Car Preferences
  carCategory: 'economy' | 'compact' | 'standard' | 'premium' | 'suv' | 'luxury';
  transmission: 'manual' | 'automatic';
  features: string[];
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

interface MobileCarFormUnifiedProps {
  // Core functionality
  onSearch?: (data: CarFormData) => void;
  onSubmit?: (data: CarFormData) => void;
  onClose?: () => void;
  
  // Configuration
  mode?: 'compact' | 'premium' | 'embedded';
  stepFlow?: 'basic' | 'extended'; // 3-step vs 4-step
  showNavigation?: boolean;
  className?: string;
  
  // Initial data
  initialData?: Partial<CarFormData>;
}

type StepType = 'rental' | 'budget-notes' | 'contact' | 'confirmation';

// ========================================================================================
// DESIGN SYSTEM TOKENS
// ========================================================================================

const designTokens = {
  colors: {
    primary: {
      50: 'bg-orange-50',
      100: 'bg-orange-100',
      500: 'bg-orange-500',
      600: 'bg-orange-600',
      700: 'bg-orange-700'
    },
    success: {
      50: 'bg-emerald-50',
      500: 'bg-emerald-500',
      600: 'bg-emerald-600'
    },
    warning: {
      50: 'bg-yellow-50',
      500: 'bg-yellow-500'
    },
    purple: {
      50: 'bg-purple-50',
      500: 'bg-purple-500',
      600: 'bg-purple-600'
    }
  },
  animations: {
    page: { duration: 0.3, ease: "easeOut" as const }
  }
};

// ========================================================================================
// MAIN COMPONENT
// ========================================================================================

export default function MobileCarFormUnified({
  onSearch,
  onSubmit,
  onClose,
  mode = 'premium',
  stepFlow = 'extended',
  showNavigation = true,
  className = '',
  initialData = {}
}: MobileCarFormUnifiedProps) {

  // =====================
  // STATE MANAGEMENT
  // =====================
  
  const [currentStep, setCurrentStep] = useState<StepType>('rental');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CarFormData>({
    pickupLocation: initialData.pickupLocation || '',
    dropoffLocation: initialData.dropoffLocation || '',
    pickupDate: initialData.pickupDate || '',
    pickupTime: initialData.pickupTime || '10:00',
    dropoffDate: initialData.dropoffDate || '',
    dropoffTime: initialData.dropoffTime || '10:00',
    sameLocation: initialData.sameLocation || true,
    driverAge: initialData.driverAge || '',
    driverExperience: initialData.driverExperience || '',
    carCategory: initialData.carCategory || 'compact',
    transmission: initialData.transmission || 'automatic',
    features: initialData.features || [],
    budget: initialData.budget || 'standard',
    preferences: initialData.preferences || '',
    urgente: initialData.urgente || false,
    flexivelDatas: initialData.flexivelDatas || false,
    contactInfo: {
      firstName: initialData.contactInfo?.firstName || '',
      lastName: initialData.contactInfo?.lastName || '',
      email: initialData.contactInfo?.email || '',
      phone: initialData.contactInfo?.phone || '',
      countryCode: initialData.contactInfo?.countryCode || '+55'
    }
  });

  // =====================
  // STEP CONFIGURATION
  // =====================
  
  const getStepConfig = () => {
    if (stepFlow === 'extended') {
      return [
        { key: 'rental', title: 'Detalhes do Aluguel', icon: TruckIcon },
        { key: 'budget-notes', title: 'Budget', icon: CurrencyDollarIcon },
        { key: 'contact', title: 'Contact', icon: UserIcon },
        { key: 'confirmation', title: 'Confirmation', icon: SparklesIcon }
      ];
    } else {
      return [
        { key: 'rental', title: 'Detalhes do Aluguel', icon: TruckIcon },
        { key: 'contact', title: 'Contact', icon: UserIcon },
        { key: 'confirmation', title: 'Confirmation', icon: SparklesIcon }
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
      case 'rental':
        return !!(
          formData.pickupLocation && 
          formData.pickupDate && 
          formData.pickupTime &&
          formData.dropoffDate && 
          formData.dropoffTime &&
          (formData.sameLocation || formData.dropoffLocation) &&
          formData.driverAge
        );
      case 'budget-notes':
        return true; // Optional step, can always proceed
      case 'contact':
        return !!(
          formData.contactInfo.firstName && 
          formData.contactInfo.lastName && 
          formData.contactInfo.email && 
          formData.contactInfo.phone
        );
      case 'confirmation':
        return false; // Final step, no proceeding
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
  
  const handleSameLocationToggle = useCallback((same: boolean) => {
    setFormData(prev => ({
      ...prev,
      sameLocation: same,
      dropoffLocation: same ? prev.pickupLocation : ''
    }));
  }, []);

  const handleFeatureToggle = useCallback((feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  }, []);

  // =====================
  // SUBMISSION HANDLERS
  // =====================

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Track analytics
      trackFormSubmit(`car_form_mobile_${mode}`);
      trackQuoteRequest({ services: ['carros'] });

      // Calculate rental days
      const rentalDays = formData.pickupDate && formData.dropoffDate ? 
        Math.ceil((new Date(formData.dropoffDate).getTime() - new Date(formData.pickupDate).getTime()) / (1000 * 3600 * 24)) 
        : 1;

      // Prepare submission data
      const submissionData = {
        nome: `${formData.contactInfo.firstName} ${formData.contactInfo.lastName}`,
        email: formData.contactInfo.email,
        telefone: formData.contactInfo.phone,
        servicos: ['carros'],
        serviceData: {
          carros: {
            ...formData,
            rentalDays,
            dropoffLocation: formData.sameLocation ? formData.pickupLocation : formData.dropoffLocation
          }
        },
        carRentalParams: {
          pickupLocation: formData.pickupLocation,
          dropoffLocation: formData.sameLocation ? formData.pickupLocation : formData.dropoffLocation,
          pickupDate: formData.pickupDate,
          pickupTime: formData.pickupTime,
          dropoffDate: formData.dropoffDate,
          dropoffTime: formData.dropoffTime,
          carCategory: formData.carCategory,
          transmission: formData.transmission,
          driverAge: formData.driverAge
        },
        observacoes: formData.preferences || '',
        urgente: formData.urgente,
        flexivelDatas: formData.flexivelDatas,
        budget: formData.budget,
        timestamp: new Date().toISOString(),
        source: `mobile_car_form_unified_${mode}`,
        userAgent: navigator.userAgent
      };

      // Log complete submission data for verification
      console.log('🚗 [ULTRATHINK] Complete Car Form Submission Data:', {
        timestamp: new Date().toISOString(),
        formData,
        submissionData,
        source: 'mobile_car_form_unified'
      });

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
      
      // Show success feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }

    } catch (error) {
      console.error('Erro ao enviar formulário de aluguel de carro:', error);
      alert('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // =====================
  // DYNAMIC STYLING
  // =====================
  
  const getModeStyles = () => {
    switch (mode) {
      case 'compact':
        return {
          container: 'bg-white',
          section: 'bg-gray-50 rounded-lg p-3 mb-3 border border-gray-200',
          title: 'text-sm font-bold text-gray-900',
          spacing: 'space-y-2'
        };
      case 'premium':
        return {
          container: 'bg-gradient-to-br from-slate-50 via-orange-50/80 to-yellow-50',
          section: 'backdrop-blur-xl bg-gradient-to-r from-white/90 via-white/95 to-white/90 rounded-xl p-3 mb-3 border border-orange-200/50 shadow-lg',
          title: 'text-base font-bold text-gray-900',
          spacing: 'space-y-3'
        };
      default:
        return {
          container: 'bg-white',
          section: 'bg-white rounded-lg p-3 mb-3 border border-gray-200 shadow-sm',
          title: 'text-sm font-semibold text-gray-900',
          spacing: 'space-y-3'
        };
    }
  };

  const modeStyles = getModeStyles();

  // ========================================================================================
  // RENDER
  // ========================================================================================

  return (
    <div className={`h-full flex flex-col ${modeStyles.container} ${className}`}>
      

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={designTokens.animations.page}
            className="h-full"
          >
            
            {/* STEP 1: RENTAL DETAILS */}
            {currentStep === 'rental' && (
              <div className={modeStyles.spacing}>
                <div className="mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <TruckIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className={`${modeStyles.title} leading-tight mb-1`}>Detalhes do Aluguel</h2>
                      <p className="text-sm text-gray-600 leading-relaxed">Configure seu aluguel de carro</p>
                    </div>
                  </div>
                </div>

                {/* Pickup Location */}
                <div className={modeStyles.section}>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Local de Retirada</h3>
                  <CityAutocomplete
                    value={formData.pickupLocation}
                    onChange={(value) => {
                      setFormData(prev => ({ 
                        ...prev, 
                        pickupLocation: value,
                        dropoffLocation: prev.sameLocation ? value : prev.dropoffLocation
                      }));
                    }}
                    cities={cities}
                    placeholder="Onde retirar o carro?"
                    className="w-full"
                  />
                </div>

                {/* Dropoff Location Toggle */}
                <div className={modeStyles.section}>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Local de Devolução</h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleSameLocationToggle(true)}
                        className={`flex-1 p-3 rounded-lg border-2 text-xs font-medium transition-all ${
                          formData.sameLocation
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-sm font-bold">Mesmo local</div>
                          <div className="text-xs text-gray-500">Mais econômico</div>
                        </div>
                      </button>
                      <button
                        onClick={() => handleSameLocationToggle(false)}
                        className={`flex-1 p-3 rounded-lg border-2 text-xs font-medium transition-all ${
                          !formData.sameLocation
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-sm font-bold">Local diferente</div>
                          <div className="text-xs text-gray-500">Mais flexível</div>
                        </div>
                      </button>
                    </div>
                    
                    {!formData.sameLocation && (
                      <CityAutocomplete
                        value={formData.dropoffLocation}
                        onChange={(value) => setFormData(prev => ({ ...prev, dropoffLocation: value }))}
                        cities={cities}
                        placeholder="Onde devolver o carro?"
                        className="w-full"
                      />
                    )}
                  </div>
                </div>

                {/* Pickup Date/Time */}
                <div className={modeStyles.section}>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Retirada</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Data</label>
                      <input
                        type="date"
                        value={formData.pickupDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, pickupDate: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-gray-200 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Horário</label>
                      <input
                        type="time"
                        value={formData.pickupTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, pickupTime: e.target.value }))}
                        className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-gray-200 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Dropoff Date/Time */}
                <div className={modeStyles.section}>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Devolução</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Data</label>
                      <input
                        type="date"
                        value={formData.dropoffDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, dropoffDate: e.target.value }))}
                        min={formData.pickupDate || new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-gray-200 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Horário</label>
                      <input
                        type="time"
                        value={formData.dropoffTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, dropoffTime: e.target.value }))}
                        className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-gray-200 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Driver Info */}
                <div className={modeStyles.section}>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Informações do Condutor</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Idade</label>
                      <select
                        value={formData.driverAge}
                        onChange={(e) => setFormData(prev => ({ ...prev, driverAge: e.target.value }))}
                        className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-gray-200 focus:border-orange-500"
                      >
                        <option value="">Selecione</option>
                        <option value="18-24">18-24 anos</option>
                        <option value="25-29">25-29 anos</option>
                        <option value="30-39">30-39 anos</option>
                        <option value="40-49">40-49 anos</option>
                        <option value="50+">50+ anos</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Experiência</label>
                      <select
                        value={formData.driverExperience}
                        onChange={(e) => setFormData(prev => ({ ...prev, driverExperience: e.target.value }))}
                        className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-gray-200 focus:border-orange-500"
                      >
                        <option value="">Selecione</option>
                        <option value="1-2">1-2 anos</option>
                        <option value="3-5">3-5 anos</option>
                        <option value="6-10">6-10 anos</option>
                        <option value="10+">Mais de 10 anos</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Car Category */}
                <div className={modeStyles.section}>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Categoria do Veículo</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'economy', label: 'Econômico', example: 'Gol, Onix', icon: '🚗' },
                      { value: 'compact', label: 'Compacto', example: 'HB20, Ka', icon: '🚙' },
                      { value: 'standard', label: 'Padrão', example: 'Corolla, Civic', icon: '🚘' },
                      { value: 'premium', label: 'Premium', example: 'Accord, Camry', icon: '🏎️' },
                      { value: 'suv', label: 'SUV', example: 'HR-V, Tiguan', icon: '🚐' },
                      { value: 'luxury', label: 'Luxo', example: 'BMW, Audi', icon: '✨' }
                    ].map((category) => (
                      <button
                        key={category.value}
                        onClick={() => setFormData(prev => ({ ...prev, carCategory: category.value as any }))}
                        className={`p-3 rounded-lg border-2 text-xs font-medium transition-all text-left ${
                          formData.carCategory === category.value
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{category.icon}</span>
                          <div>
                            <div className="font-bold">{category.label}</div>
                            <div className="text-xs text-gray-500">{category.example}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* SIMPLE NAVIGATION BUTTONS - Clear of fixed menu */}
                <div className="mt-6 pt-4 pb-32 mb-4 border-t border-gray-200 safe-area-inset-bottom">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={prevStep}
                      disabled={getCurrentStepIndex() === 0}
                      className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-200"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                      Voltar
                    </button>

                    <div className="text-sm text-gray-500">
                      {getCurrentStepIndex() + 1} de {steps.length}
                    </div>

                    <button
                      onClick={nextStep}
                      disabled={!canProceedFromStep(currentStep)}
                      className="flex items-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg disabled:opacity-50 hover:bg-orange-700"
                    >
                      Avançar
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: BUDGET & NOTES (Extended Flow Only) */}
            {currentStep === 'budget-notes' && stepFlow === 'extended' && (
              <div className={modeStyles.spacing}>
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <CurrencyDollarIcon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className={modeStyles.title}>Budget</h2>
                  <p className="text-sm text-gray-600 mt-1">Personalize sua experiência</p>
                </div>

                <div className="space-y-4">
                  {/* Budget Selection */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Orçamento por Dia</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'economy', label: 'Econômico', range: 'R$ 50 - 100', icon: '💰' },
                        { value: 'standard', label: 'Padrão', range: 'R$ 100 - 200', icon: '💳' },
                        { value: 'premium', label: 'Premium', range: 'R$ 200 - 400', icon: '💎' },
                        { value: 'luxury', label: 'Luxo', range: 'R$ 400+', icon: '👑' }
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

                  {/* Transmission */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Transmissão</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, transmission: 'automatic' }))}
                        className={`p-3 rounded-lg border-2 text-xs font-medium transition-all ${
                          formData.transmission === 'automatic'
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-lg mb-1">⚙️</div>
                          <div className="font-bold">Automático</div>
                          <div className="text-xs text-gray-500">Mais confortável</div>
                        </div>
                      </button>
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, transmission: 'manual' }))}
                        className={`p-3 rounded-lg border-2 text-xs font-medium transition-all ${
                          formData.transmission === 'manual'
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-lg mb-1">🔧</div>
                          <div className="font-bold">Manual</div>
                          <div className="text-xs text-gray-500">Mais econômico</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Recursos Desejados</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        'Ar Condicionado',
                        'GPS/Navegação',
                        'Bluetooth',
                        'Câmera de Ré',
                        'Seguro Completo',
                        'Condutor Adicional',
                        'Cadeirinha Bebê',
                        'WiFi'
                      ].map((feature) => (
                        <button
                          key={feature}
                          onClick={() => handleFeatureToggle(feature)}
                          className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                            formData.features.includes(feature)
                              ? 'border-orange-500 bg-orange-50 text-orange-700'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          {feature}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preferences */}
                  <div>
                    <label className="text-sm font-semibold text-gray-800 mb-2 block">Observações Especiais</label>
                    <textarea
                      value={formData.preferences}
                      onChange={(e) => setFormData(prev => ({ ...prev, preferences: e.target.value }))}
                      placeholder="Marca preferida, cor, necessidades especiais..."
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
                      <span className="text-sm font-medium text-yellow-900">⚡ Urgente (Hoje)</span>
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

                {/* SIMPLE NAVIGATION BUTTONS - Clear of fixed menu */}
                <div className="mt-6 pt-4 pb-32 mb-4 border-t border-gray-200 safe-area-inset-bottom">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={prevStep}
                      disabled={getCurrentStepIndex() === 0}
                      className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-200"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                      Voltar
                    </button>

                    <div className="text-sm text-gray-500">
                      {getCurrentStepIndex() + 1} de {steps.length}
                    </div>

                    <button
                      onClick={nextStep}
                      disabled={!canProceedFromStep(currentStep)}
                      className="flex items-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg disabled:opacity-50 hover:bg-orange-700"
                    >
                      Avançar
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: CONTACT INFORMATION */}
            {currentStep === 'contact' && (
              <div className={modeStyles.spacing}>
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className={modeStyles.title}>Contact</h2>
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
                        className="w-full px-3 py-3 text-sm rounded-lg border-2 border-gray-200 focus:border-orange-500"
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
                        className="w-full px-3 py-3 text-sm rounded-lg border-2 border-gray-200 focus:border-orange-500"
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
                        className="w-full pl-10 pr-4 py-3 text-sm rounded-lg border-2 border-gray-200 focus:border-orange-500"
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

                {/* SIMPLE NAVIGATION BUTTONS - Clear of fixed menu */}
                <div className="mt-6 pt-4 pb-32 mb-4 border-t border-gray-200 safe-area-inset-bottom">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={prevStep}
                      disabled={getCurrentStepIndex() === 0}
                      className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-200"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                      Voltar
                    </button>

                    <div className="text-sm text-gray-500">
                      {getCurrentStepIndex() + 1} de {steps.length}
                    </div>

                    <button
                      onClick={nextStep}
                      disabled={!canProceedFromStep(currentStep)}
                      className="flex items-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg disabled:opacity-50 hover:bg-orange-700"
                    >
                      Avançar
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: CONFIRMATION & SUBMIT */}
            {currentStep === 'confirmation' && (
              <div className={modeStyles.spacing}>
                <div className="text-center mb-4">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg"
                  >
                    <SparklesIcon className="w-8 h-8 text-white" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <h2 className={`${modeStyles.title} text-orange-600`}>Confirmation</h2>
                    <p className="text-sm text-gray-600 mt-1">Confirme o envio da sua solicitação</p>
                  </motion.div>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="space-y-4"
                >
                  {/* Complete Car Rental Summary */}
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                        <TruckIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-orange-900">Seu Aluguel de Carro</h3>
                        <p className="text-xs text-orange-700">
                          {formData.pickupLocation}
                          {!formData.sameLocation && ` → ${formData.dropoffLocation}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Rental Period */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="text-center p-2 bg-white/50 rounded-lg">
                          <div className="font-semibold text-orange-800">Retirada</div>
                          <div className="text-orange-600">
                            {formData.pickupDate && new Date(formData.pickupDate).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="text-orange-600">{formData.pickupTime}</div>
                        </div>
                        <div className="text-center p-2 bg-white/50 rounded-lg">
                          <div className="font-semibold text-orange-800">Devolução</div>
                          <div className="text-orange-600">
                            {formData.dropoffDate && new Date(formData.dropoffDate).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="text-orange-600">{formData.dropoffTime}</div>
                        </div>
                      </div>

                      {/* Car Details */}
                      <div className="bg-white/50 rounded-lg p-3">
                        <div className="font-semibold text-orange-800 mb-2 text-xs">Veículo & Condutor</div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-orange-600">Categoria: {formData.carCategory}</span>
                          <span className="text-orange-600">Transmissão: {formData.transmission}</span>
                        </div>
                        <div className="text-orange-600 text-xs">
                          Idade do condutor: {formData.driverAge}
                        </div>
                        {formData.driverExperience && (
                          <div className="text-orange-600 text-xs">
                            Experiência: {formData.driverExperience}
                          </div>
                        )}
                      </div>

                      {/* Features */}
                      {formData.features.length > 0 && (
                        <div className="bg-white/50 rounded-lg p-3">
                          <div className="font-semibold text-orange-800 mb-2 text-xs">Recursos Solicitados</div>
                          <div className="flex flex-wrap gap-1">
                            {formData.features.map(feature => (
                              <span key={feature} className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Service Promise */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="bg-blue-50 rounded-xl p-4 border border-blue-200"
                  >
                    <div className="text-center space-y-2">
                      <div className="text-lg">🚗</div>
                      <h4 className="text-sm font-bold text-blue-900">Nossa Promessa</h4>
                      <div className="space-y-1 text-xs text-blue-700">
                        <p>✅ Resposta garantida em até 2 horas</p>
                        <p>🚗 Melhores locadoras e preços</p>
                        <p>💰 Sem taxas de intermediação</p>
                        <p>🛡️ Suporte durante o aluguel</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Contact Info */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h4 className="text-sm font-bold text-gray-900 mb-2">Dados de Contato</h4>
                    <div className="text-xs text-gray-700 space-y-1">
                      <p>{formData.contactInfo.firstName} {formData.contactInfo.lastName}</p>
                      <p>📧 {formData.contactInfo.email}</p>
                      <p>📱 {formData.contactInfo.phone}</p>
                    </div>
                  </div>

                  {/* Complete Budget & Preferences */}
                  {stepFlow === 'extended' && (
                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                      <h4 className="text-sm font-bold text-purple-900 mb-3">💰 Orçamento & Preferências</h4>
                      <div className="space-y-3">
                        {/* Budget Selection */}
                        {formData.budget && (
                          <div className="bg-white/50 rounded-lg p-3">
                            <div className="font-semibold text-purple-800 mb-1 text-xs">Orçamento por Dia</div>
                            <div className="text-purple-700 text-xs capitalize">
                              {formData.budget === 'economy' && '💰 Econômico (R$ 50 - 100 por dia)'}
                              {formData.budget === 'standard' && '💳 Padrão (R$ 100 - 200 por dia)'}
                              {formData.budget === 'premium' && '💎 Premium (R$ 200 - 400 por dia)'}
                              {formData.budget === 'luxury' && '👑 Luxo (R$ 400+ por dia)'}
                            </div>
                          </div>
                        )}

                        {/* Special Preferences */}
                        {formData.preferences && (
                          <div className="bg-white/50 rounded-lg p-3">
                            <div className="font-semibold text-purple-800 mb-1 text-xs">Observações Especiais</div>
                            <div className="text-purple-700 text-xs">{formData.preferences}</div>
                          </div>
                        )}

                        {/* Special Options */}
                        {(formData.urgente || formData.flexivelDatas) && (
                          <div className="bg-white/50 rounded-lg p-3">
                            <div className="font-semibold text-purple-800 mb-2 text-xs">Opções Especiais</div>
                            <div className="flex flex-wrap gap-2">
                              {formData.urgente && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">⚡ Urgente (Hoje)</span>
                              )}
                              {formData.flexivelDatas && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">📅 Datas Flexíveis</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Show when no preferences */}
                        {!formData.budget && !formData.preferences && !formData.urgente && !formData.flexivelDatas && (
                          <div className="text-xs text-purple-600 text-center py-2">
                            Sem preferências especiais selecionadas
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Complete Data Summary */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                    className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-slate-500 rounded-lg flex items-center justify-center">
                        <CheckIcon className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">Resumo Completo da Solicitação</h4>
                    </div>
                    
                    <div className="text-xs text-slate-700 space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <strong className="text-slate-800">🚗 Aluguel:</strong>
                          <br />{formData.pickupLocation}
                          {!formData.sameLocation && (
                            <><br />→ {formData.dropoffLocation}</>
                          )}
                        </div>
                        <div>
                          <strong className="text-slate-800">📅 Período:</strong>
                          <br />
                          {formData.pickupDate && formData.dropoffDate && (
                            <>
                              {new Date(formData.pickupDate).toLocaleDateString('pt-BR')} - {new Date(formData.dropoffDate).toLocaleDateString('pt-BR')}
                              <br />
                              ({formData.pickupDate && formData.dropoffDate ? 
                                Math.ceil((new Date(formData.dropoffDate).getTime() - new Date(formData.pickupDate).getTime()) / (1000 * 3600 * 24)) 
                                : 0} dia{formData.pickupDate && formData.dropoffDate && 
                                Math.ceil((new Date(formData.dropoffDate).getTime() - new Date(formData.pickupDate).getTime()) / (1000 * 3600 * 24)) !== 1 ? 's' : ''})
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span><strong>🚙 Categoria:</strong> {formData.carCategory}</span>
                          <span><strong>⚙️ Câmbio:</strong> {formData.transmission}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-200 text-center">
                        <p className="text-slate-600">
                          ✅ Todos os dados serão enviados para nossa equipe especializada
                          <br />
                          📧 Você receberá uma confirmação por e-mail em instantes
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Final Submit Button */}
                  <motion.button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.0 }}
                    className="w-full bg-gradient-to-r from-orange-600 via-orange-600 to-yellow-600 text-white py-3 px-4 rounded-xl font-bold text-sm shadow-xl disabled:opacity-50 mt-4 relative overflow-hidden"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Enviando...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <TruckIcon className="w-5 h-5" />
                        Solicitar Cotação de Carro
                      </div>
                    )}
                    
                    {/* Subtle animation background */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                  </motion.button>
                </motion.div>
              </div>
            )}
            
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}