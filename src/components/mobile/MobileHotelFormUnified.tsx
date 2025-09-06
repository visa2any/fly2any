'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPinIcon,
  CalendarIcon,
  UsersIcon,
  HomeIcon,
  StarIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  EnvelopeIcon,
  ChevronDownIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline';
import { trackFormSubmit, trackQuoteRequest } from '@/lib/analytics-safe';
import PhoneInput from '@/components/PhoneInput';
import CityAutocomplete from '@/components/CityAutocomplete';
import PremiumSuccessModal from '@/components/mobile/PremiumSuccessModal';
import { cities } from '@/data/cities';

// ========================================================================================
// UNIFIED HOTEL FORM INTERFACES & TYPES
// ========================================================================================

interface HotelFormData {
  // Trip Configuration
  destination: string;
  checkinDate: string;
  checkoutDate: string;
  
  // Accommodation
  rooms: number;
  adults: number;
  children: number;
  
  // Preferences
  hotelCategory: 'budget' | 'standard' | 'premium' | 'luxury';
  amenities: string[];
  locationPreference: string;
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

interface MobileHotelFormUnifiedProps {
  // Core functionality
  onSearch?: (data: HotelFormData) => void;
  onSubmit?: (data: HotelFormData) => void;
  onClose?: () => void;
  
  // Configuration
  mode?: 'compact' | 'premium' | 'embedded';
  stepFlow?: 'basic' | 'extended'; // 3-step vs 4-step
  showNavigation?: boolean;
  className?: string;
  
  // Initial data
  initialData?: Partial<HotelFormData>;
}

type StepType = 'accommodation' | 'budget-notes' | 'contact' | 'confirmation';

// ========================================================================================
// DESIGN SYSTEM TOKENS
// ========================================================================================

const designTokens = {
  colors: {
    primary: {
      50: 'bg-green-50',
      100: 'bg-green-100',
      500: 'bg-green-500',
      600: 'bg-green-600',
      700: 'bg-green-700'
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

export default function MobileHotelFormUnified({
  onSearch,
  onSubmit,
  onClose,
  mode = 'premium',
  stepFlow = 'extended',
  showNavigation = true,
  className = '',
  initialData = {}
}: MobileHotelFormUnifiedProps) {

  // =====================
  // STATE MANAGEMENT
  // =====================
  
  const [currentStep, setCurrentStep] = useState<StepType>('accommodation');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState<HotelFormData>({
    destination: initialData.destination || '',
    checkinDate: initialData.checkinDate || '',
    checkoutDate: initialData.checkoutDate || '',
    rooms: initialData.rooms || 1,
    adults: initialData.adults || 2,
    children: initialData.children || 0,
    hotelCategory: initialData.hotelCategory || 'standard',
    amenities: initialData.amenities || [],
    locationPreference: initialData.locationPreference || '',
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
        { key: 'accommodation', title: 'Detalhes do Hotel', icon: BuildingOffice2Icon },
        { key: 'budget-notes', title: 'Budget', icon: CurrencyDollarIcon },
        { key: 'contact', title: 'Contact', icon: UserIcon },
        { key: 'confirmation', title: 'Confirmation', icon: SparklesIcon }
      ];
    } else {
      return [
        { key: 'accommodation', title: 'Detalhes do Hotel', icon: BuildingOffice2Icon },
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
      case 'accommodation':
        return !!(
          formData.destination && 
          formData.checkinDate && 
          formData.checkoutDate && 
          formData.rooms >= 1 && 
          formData.adults >= 1
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
  
  const handleCountChange = useCallback((type: 'rooms' | 'adults' | 'children', increment: boolean) => {
    setFormData(prev => ({
      ...prev,
      [type]: increment 
        ? prev[type] + 1 
        : Math.max(type === 'rooms' ? 1 : 0, prev[type] - 1)
    }));
  }, []);

  const handleAmenityToggle = useCallback((amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  }, []);

  // =====================
  // SUBMISSION HANDLERS
  // =====================

  const handleSubmit = async () => {
    // ULTRATHINK: Enhanced Frontend Validation
    const validation = validateFormData();
    if (!validation.isValid) {
      setErrorMessage(validation.message);
      setShowErrorModal(true);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Track analytics
      trackFormSubmit(`hotel_form_mobile_${mode}`);
      trackQuoteRequest({ services: ['hoteis'] });

      // Prepare submission data
      const submissionData = {
        nome: `${formData.contactInfo.firstName.trim()} ${formData.contactInfo.lastName.trim()}`,
        email: formData.contactInfo.email.trim(),
        telefone: formData.contactInfo.phone,
        servicos: ['hoteis'],
        serviceData: {
          hoteis: {
            ...formData,
            nights: formData.checkinDate && formData.checkoutDate ? 
              Math.ceil((new Date(formData.checkoutDate).getTime() - new Date(formData.checkinDate).getTime()) / (1000 * 3600 * 24)) 
              : 1
          }
        },
        hotelSearchParams: {
          destination: formData.destination,
          checkinDate: formData.checkinDate,
          checkoutDate: formData.checkoutDate,
          rooms: formData.rooms,
          adults: formData.adults,
          children: formData.children,
          category: formData.hotelCategory
        },
        observacoes: formData.preferences || '',
        urgente: formData.urgente,
        flexivelDatas: formData.flexivelDatas,
        budget: formData.budget,
        timestamp: new Date().toISOString(),
        source: `mobile_hotel_form_unified_${mode}`,
        userAgent: navigator.userAgent
      };

      // Log complete submission data for verification
      console.log('🏨 [ULTRATHINK] Complete Hotel Form Submission Data:', {
        timestamp: new Date().toISOString(),
        formData,
        submissionData,
        source: 'mobile_hotel_form_unified'
      });

      // Submit to API
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Falha ao enviar solicitação');
      }

      // Call callbacks
      if (onSubmit) {
        onSubmit(formData);
      }
      
      // Show success feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }

      // Show success modal instead of alert
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Erro ao enviar formulário de hotel:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao enviar solicitação. Tente novamente.');
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ULTRATHINK: Enhanced Validation Function
  const validateFormData = () => {
    // Check required fields
    if (!formData.contactInfo.firstName?.trim()) {
      return { isValid: false, message: '❌ Nome é obrigatório' };
    }
    if (!formData.contactInfo.lastName?.trim()) {
      return { isValid: false, message: '❌ Sobrenome é obrigatório' };
    }
    if (!formData.contactInfo.email?.trim()) {
      return { isValid: false, message: '❌ Email é obrigatório' };
    }
    if (!formData.contactInfo.phone?.trim()) {
      return { isValid: false, message: '❌ Telefone é obrigatório' };
    }
    if (!formData.destination?.trim()) {
      return { isValid: false, message: '❌ Destino é obrigatório' };
    }
    if (!formData.checkinDate) {
      return { isValid: false, message: '❌ Data de check-in é obrigatória' };
    }
    if (!formData.checkoutDate) {
      return { isValid: false, message: '❌ Data de check-out é obrigatória' };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contactInfo.email.trim())) {
      return { isValid: false, message: '❌ Email deve ter um formato válido' };
    }

    // Validate dates
    const checkinDate = new Date(formData.checkinDate);
    const checkoutDate = new Date(formData.checkoutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkinDate < today) {
      return { isValid: false, message: '❌ Data de check-in deve ser futura' };
    }
    if (checkoutDate <= checkinDate) {
      return { isValid: false, message: '❌ Data de check-out deve ser posterior ao check-in' };
    }

    return { isValid: true, message: '' };
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
          container: 'bg-gradient-to-br from-slate-50 via-green-50/80 to-emerald-50',
          section: 'backdrop-blur-xl bg-gradient-to-r from-white/90 via-white/95 to-white/90 rounded-xl p-3 mb-3 border border-green-200/50 shadow-lg',
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
            
            {/* STEP 1: ACCOMMODATION DETAILS */}
            {currentStep === 'accommodation' && (
              <div className={modeStyles.spacing}>
                <div className="mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <BuildingOffice2Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className={`${modeStyles.title} leading-tight mb-1`}>Detalhes do Hotel</h2>
                      <p className="text-sm text-gray-600 leading-relaxed">Configure sua hospedagem ideal</p>
                    </div>
                  </div>
                </div>

                {/* Destination */}
                <div className={modeStyles.section}>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Destino</h3>
                  <CityAutocomplete
                    value={formData.destination}
                    onChange={(value) => setFormData(prev => ({ ...prev, destination: value }))}
                    cities={cities}
                    placeholder="Para onde você vai?"
                    className="w-full"
                  />
                </div>

                {/* Check-in/out Dates */}
                <div className={modeStyles.section}>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Datas</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Check-in</label>
                      <input
                        type="date"
                        value={formData.checkinDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, checkinDate: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-gray-200 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Check-out</label>
                      <input
                        type="date"
                        value={formData.checkoutDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, checkoutDate: e.target.value }))}
                        min={formData.checkinDate || new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-gray-200 focus:border-green-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Rooms & Guests - Horizontal Grid for Mobile Optimization */}
                <div className={modeStyles.section}>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Quartos e Hóspedes</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { key: 'rooms', label: 'Quartos', emoji: '🏨', min: 1, max: 10 },
                      { key: 'adults', label: 'Adultos', emoji: '👤', min: 1, max: 20 },
                      { key: 'children', label: 'Crianças', emoji: '🧒', min: 0, max: 10 }
                    ].map(({ key, label, emoji, min, max }) => (
                      <div key={key} className="text-center">
                        <div className="text-xs font-medium text-gray-700 mb-2 flex flex-col items-center">
                          <span className="text-lg mb-1">{emoji}</span>
                          <span>{label}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCountChange(key as 'rooms' | 'adults' | 'children', false)}
                            disabled={(formData[key as keyof HotelFormData] as number) <= min}
                            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center disabled:opacity-50 text-sm font-bold hover:bg-gray-200 transition-colors"
                          >
                            -
                          </button>
                          <span className="font-bold text-lg min-w-[24px]">
                            {formData[key as keyof HotelFormData] as number}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCountChange(key as 'rooms' | 'adults' | 'children', true)}
                            disabled={(formData[key as keyof HotelFormData] as number) >= max}
                            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center disabled:opacity-50 text-sm font-bold hover:bg-gray-200 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hotel Category */}
                <div className={modeStyles.section}>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Categoria do Hotel</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'budget', label: 'Econômico', stars: '⭐⭐', desc: 'Básico e funcional' },
                      { value: 'standard', label: 'Padrão', stars: '⭐⭐⭐', desc: 'Conforto e qualidade' },
                      { value: 'premium', label: 'Premium', stars: '⭐⭐⭐⭐', desc: 'Luxo e serviços' },
                      { value: 'luxury', label: 'Luxo', stars: '⭐⭐⭐⭐⭐', desc: 'Experiência única' }
                    ].map((category) => (
                      <button
                        key={category.value}
                        onClick={() => setFormData(prev => ({ ...prev, hotelCategory: category.value as any }))}
                        className={`p-3 rounded-lg border-2 text-xs font-medium transition-all text-left ${
                          formData.hotelCategory === category.value
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold">{category.label}</span>
                          <span>{category.stars}</span>
                        </div>
                        <div className="text-xs text-gray-500">{category.desc}</div>
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
                      className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg disabled:opacity-50 hover:bg-green-700"
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
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
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
                      className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg disabled:opacity-50 hover:bg-green-700"
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
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Faixa de Orçamento por Noite</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'economy', label: 'Econômico', range: 'R$ 50 - 150', icon: '💰' },
                        { value: 'standard', label: 'Padrão', range: 'R$ 150 - 300', icon: '💳' },
                        { value: 'premium', label: 'Premium', range: 'R$ 300 - 500', icon: '💎' },
                        { value: 'luxury', label: 'Luxo', range: 'R$ 500+', icon: '👑' }
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
                      placeholder="Localização preferida, tipo de quarto, amenidades especiais..."
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
                      className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg disabled:opacity-50 hover:bg-green-700"
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
                    className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg"
                  >
                    <SparklesIcon className="w-8 h-8 text-white" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <h2 className={`${modeStyles.title} text-green-600`}>Confirmation</h2>
                    <p className="text-sm text-gray-600 mt-1">Confirme o envio da sua solicitação</p>
                  </motion.div>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="space-y-4"
                >
                  {/* Complete Hotel Summary */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <BuildingOffice2Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-green-900">Sua Reserva de Hotel</h3>
                        <p className="text-xs text-green-700">
                          {formData.destination}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Hotel Details */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="text-center p-2 bg-white/50 rounded-lg">
                          <div className="font-semibold text-green-800">Check-in</div>
                          <div className="text-green-600">
                            {formData.checkinDate && new Date(formData.checkinDate).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        <div className="text-center p-2 bg-white/50 rounded-lg">
                          <div className="font-semibold text-green-800">Check-out</div>
                          <div className="text-green-600">
                            {formData.checkoutDate && new Date(formData.checkoutDate).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>

                      {/* Rooms & Guests */}
                      <div className="bg-white/50 rounded-lg p-3">
                        <div className="font-semibold text-green-800 mb-2 text-xs">Acomodação</div>
                        <div className="flex justify-between text-xs">
                          <span className="text-green-600">{formData.rooms} Quarto(s)</span>
                          <span className="text-green-600">{formData.adults} Adulto(s)</span>
                          {formData.children > 0 && (
                            <span className="text-green-600">{formData.children} Criança(s)</span>
                          )}
                        </div>
                        <div className="mt-2">
                          <span className="text-xs text-green-600 capitalize">Categoria: {formData.hotelCategory}</span>
                        </div>
                      </div>
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
                      <div className="text-lg">🏨</div>
                      <h4 className="text-sm font-bold text-blue-900">Nossa Promessa</h4>
                      <div className="space-y-1 text-xs text-blue-700">
                        <p>✅ Resposta garantida em até 2 horas</p>
                        <p>🏨 Melhores hotéis e tarifas</p>
                        <p>💰 Reservas sem taxas extras</p>
                        <p>🛡️ Suporte durante sua estadia</p>
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
                            <div className="font-semibold text-purple-800 mb-1 text-xs">Faixa de Orçamento</div>
                            <div className="text-purple-700 text-xs capitalize">
                              {formData.budget === 'economy' && '💰 Econômico (R$ 50 - 150 por noite)'}
                              {formData.budget === 'standard' && '💳 Padrão (R$ 150 - 300 por noite)'}
                              {formData.budget === 'premium' && '💎 Premium (R$ 300 - 500 por noite)'}
                              {formData.budget === 'luxury' && '👑 Luxo (R$ 500+ por noite)'}
                            </div>
                          </div>
                        )}

                        {/* Special Preferences */}
                        {formData.preferences && (
                          <div className="bg-white/50 rounded-lg p-3">
                            <div className="font-semibold text-purple-800 mb-1 text-xs">Preferências Especiais</div>
                            <div className="text-purple-700 text-xs">{formData.preferences}</div>
                          </div>
                        )}

                        {/* Special Options */}
                        {(formData.urgente || formData.flexivelDatas) && (
                          <div className="bg-white/50 rounded-lg p-3">
                            <div className="font-semibold text-purple-800 mb-2 text-xs">Opções Especiais</div>
                            <div className="flex flex-wrap gap-2">
                              {formData.urgente && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">⚡ Urgente (7 dias)</span>
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
                          <strong className="text-slate-800">🏨 Destino:</strong>
                          <br />{formData.destination}
                        </div>
                        <div>
                          <strong className="text-slate-800">📅 Período:</strong>
                          <br />
                          {formData.checkinDate && formData.checkoutDate && (
                            <>
                              {new Date(formData.checkinDate).toLocaleDateString('pt-BR')} - {new Date(formData.checkoutDate).toLocaleDateString('pt-BR')}
                              <br />
                              ({formData.checkinDate && formData.checkoutDate ? 
                                Math.ceil((new Date(formData.checkoutDate).getTime() - new Date(formData.checkinDate).getTime()) / (1000 * 3600 * 24)) 
                                : 0} noite{formData.checkinDate && formData.checkoutDate && 
                                Math.ceil((new Date(formData.checkoutDate).getTime() - new Date(formData.checkinDate).getTime()) / (1000 * 3600 * 24)) !== 1 ? 's' : ''})
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span><strong>🏨 Quartos:</strong> {formData.rooms}</span>
                          <span><strong>👥 Hóspedes:</strong> {formData.adults + formData.children}</span>
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
                    className="w-full bg-gradient-to-r from-green-600 via-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-bold text-sm shadow-xl disabled:opacity-50 mt-4 relative overflow-hidden"
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
                        <BuildingOffice2Icon className="w-5 h-5" />
                        Solicitar Cotação de Hotel
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

      {/* ULTRATHINK: Premium Success & Error Modals */}
      <PremiumSuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          if (onClose) onClose();
        }}
        leadData={{
          nome: `${formData.contactInfo.firstName} ${formData.contactInfo.lastName}`,
          email: formData.contactInfo.email,
          servicos: ['hoteis'],
          leadId: undefined
        }}
      />

      <PremiumSuccessModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        leadData={{
          nome: errorMessage,
          servicos: []
        }}
      />

    </div>
  );
}