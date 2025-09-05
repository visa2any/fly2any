'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CheckIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CurrencyDollarIcon,
  PencilIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  SparklesIcon,
  RocketLaunchIcon,
  HomeIcon,
  BuildingOfficeIcon,
  TruckIcon,
  CameraIcon,
  ShieldCheckIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { trackFormSubmit, trackQuoteRequest } from '@/lib/analytics-safe';
import PhoneInput from '@/components/PhoneInputSimple';
import MobileFlightFormUnified from './MobileFlightFormUnified';
import MobileHotelForm from './MobileHotelForm';
import MobileCarForm from './MobileCarForm';
import MobileTourForm from './MobileTourForm';
import MobileInsuranceForm from './MobileInsuranceForm';
import PremiumSuccessModal from './PremiumSuccessModal';
import Logo from '@/components/Logo';

interface ServiceData {
  voos?: any;
  hoteis?: any;
  carros?: any;
  passeios?: any;
  seguro?: any;
}

interface LeadFormData {
  // Personal Information
  nome: string;
  email: string;
  telefone: string;
  origem: string;
  
  // Selected Services
  servicos: string[];
  
  // Service-specific data
  serviceData: ServiceData;
  
  // Additional
  observacoes: string;
  urgente: boolean;
  flexivelDatas: boolean;
  
  // Budget and preferences
  budget?: string;
  preferencias?: string;
}

interface MobileLeadCaptureCorrectProps {
  onSubmit?: (data: LeadFormData) => void;
  onClose?: () => void;
  preSelectedService?: string | null;
  className?: string;
  isEmbedded?: boolean;
}

type StepType = 'services' | 'personal' | 'voos' | 'hoteis' | 'carros' | 'passeios' | 'seguro' | 'budget-notes' | 'finalizacao';

export default function MobileLeadCaptureCorrect({ onSubmit, onClose, preSelectedService, className = '', isEmbedded = false }: MobileLeadCaptureCorrectProps) {
  const [currentStep, setCurrentStep] = useState<StepType>(
    preSelectedService ? preSelectedService as StepType : 'services'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClientSide, setIsClientSide] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{
    nome?: string;
    email?: string;
    servicos?: string[];
    leadId?: string;
  }>({});
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // ULTRATHINK: Hydration-safe client-side check for animations
  React.useEffect(() => {
    setIsClientSide(true);
  }, []);
  
  const [formData, setFormData] = useState<LeadFormData>({
    nome: '',
    email: '',
    telefone: '',
    origem: '',
    servicos: preSelectedService ? [preSelectedService] : [],
    serviceData: {},
    observacoes: '',
    urgente: false,
    flexivelDatas: false,
    budget: 'standard',
    preferencias: ''
  });

  const services = [
    {
      id: 'voos',
      name: 'Passagens Aéreas',
      icon: '✈️',
      description: 'Voos nacionais e internacionais',
      color: 'from-primary-500 to-primary-600'
    },
    {
      id: 'hoteis',
      name: 'Hotéis',
      icon: '🏨',
      description: 'Hospedagem em destinos nacionais e internacionais',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      id: 'carros',
      name: 'Aluguel de Carros',
      icon: '🚗',
      description: 'Veículos para suas viagens',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'passeios',
      name: 'Passeios & Tours',
      icon: '🎯',
      description: 'Experiências e roteiros personalizados',
      color: 'from-warning-500 to-warning-600'
    },
    {
      id: 'seguro',
      name: 'Seguro Viagem',
      icon: '🛡️',
      description: 'Proteção para sua viagem',
      color: 'from-success-500 to-success-600'
    }
  ];

  const handleServiceToggle = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      servicos: prev.servicos.includes(serviceId)
        ? prev.servicos.filter(s => s !== serviceId)
        : [...prev.servicos, serviceId]
    }));
  };

  const handleServiceUpdate = useCallback((serviceType: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      serviceData: {
        ...prev.serviceData,
        [serviceType]: data
      }
    }));
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Track analytics
      trackFormSubmit('lead_capture_mobile');
      trackQuoteRequest({ services: formData.servicos });

      // Prepare submission data
      const submissionData = {
        ...formData,
        timestamp: new Date().toISOString(),
        source: 'mobile_app',
        userAgent: navigator.userAgent
      };

      // Submit to leads API
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar lead');
      }

      const result = await response.json();
      
      // Prepare success data for premium modal
      setSuccessData({
        nome: formData.nome,
        email: formData.email,
        servicos: formData.servicos,
        leadId: result.leadId || `FLY${Date.now()}`
      });
      
      if (onSubmit) {
        onSubmit(submissionData);
      }

      // Show premium success modal
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Error submitting lead:', error);
      setErrorMessage('Erro ao enviar sua solicitação. Tente novamente.');
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'services':
        return formData.servicos.length > 0;
      case 'personal':
        return formData.nome && formData.email && formData.telefone;
      case 'budget-notes':
        return true; // Budget and notes are optional
      case 'voos':
      case 'hoteis':
      case 'carros':
      case 'passeios':
      case 'seguro':
        return true; // Service forms handle their own validation
      case 'finalizacao':
        return true;
      default:
        return false;
    }
  };

  const getNextStep = (): StepType | null => {
    let stepOrder: StepType[];
    
    if (preSelectedService) {
      // For pre-selected service: SERVICE → PERSONAL → BUDGET-NOTES → FINALIZACAO
      stepOrder = [preSelectedService as StepType, 'personal', 'budget-notes', 'finalizacao'];
    } else {
      // For regular flow: SERVICES → PERSONAL → [SELECTED SERVICES] → BUDGET-NOTES → FINALIZACAO
      const selectedServiceSteps = formData.servicos.filter(s => s !== 'personal' && s !== 'budget-notes' && s !== 'finalizacao') as StepType[];
      stepOrder = ['services', 'personal', ...selectedServiceSteps, 'budget-notes', 'finalizacao'];
    }
    
    const currentIndex = stepOrder.indexOf(currentStep);
    return currentIndex < stepOrder.length - 1 ? stepOrder[currentIndex + 1] : null;
  };

  const getPrevStep = (): StepType | null => {
    let stepOrder: StepType[];
    
    if (preSelectedService) {
      // For pre-selected service: SERVICE → PERSONAL → BUDGET-NOTES → FINALIZACAO
      stepOrder = [preSelectedService as StepType, 'personal', 'budget-notes', 'finalizacao'];
    } else {
      // For regular flow: SERVICES → PERSONAL → [SELECTED SERVICES] → BUDGET-NOTES → FINALIZACAO
      const selectedServiceSteps = formData.servicos.filter(s => s !== 'personal' && s !== 'budget-notes' && s !== 'finalizacao') as StepType[];
      stepOrder = ['services', 'personal', ...selectedServiceSteps, 'budget-notes', 'finalizacao'];
    }
    
    const currentIndex = stepOrder.indexOf(currentStep);
    return currentIndex > 0 ? stepOrder[currentIndex - 1] : null;
  };

  const nextStep = () => {
    const next = getNextStep();
    if (next && canProceed()) {
      setCurrentStep(next);
    }
  };

  const prevStep = () => {
    const prev = getPrevStep();
    if (prev) {
      setCurrentStep(prev);
    }
  };

  const getCurrentService = () => services.find(s => s.id === currentStep);
  const isServiceStep = ['voos', 'hoteis', 'carros', 'passeios', 'seguro'].includes(currentStep);
  
  // ULTRATHINK: Identify ultra-premium forms that have built-in navigation
  const isUltraPremiumStep = ['voos'].includes(currentStep);
  
  // Enhanced step helpers
  const getStepLabel = () => {
    switch (currentStep) {
      case 'services': return 'Selecione os Serviços';
      case 'personal': return 'Seus Dados';
      case 'budget-notes': return 'Orçamento e Preferências';
      case 'finalizacao': return 'Finalizar Solicitação';
      default: return getCurrentService()?.name || 'Detalhes do Serviço';
    }
  };
  
  const getStepDescription = () => {
    switch (currentStep) {
      case 'services': return 'Escolha os serviços que deseja contratar';
      case 'personal': return 'Para que possamos entrar em contato';
      case 'budget-notes': return 'Faixa de preço e observações especiais';
      case 'finalizacao': return 'Revise e envie sua solicitação';
      default: return getCurrentService()?.description || 'Configure os detalhes';
    }
  };

  return (
    <div className={`h-full bg-gradient-to-br from-neutral-50 to-neutral-100 ${className} flex flex-col`}>
      {/* CONSISTENT WHITE HEADER - Hidden when embedded or for Ultra-Premium Forms */}
      {!isEmbedded && !isUltraPremiumStep && (
        <div className="md:hidden sticky top-0 z-50">
          {/* Modern Status Bar with Enhanced UX */}
          <div className="h-safe-top bg-gradient-to-r from-primary-600 to-primary-700 relative">
            <div className="absolute inset-0 bg-black/5"></div>
          </div>
          
          {/* WHITE HEADER - Fly2Any Main Header */}
          <div className="bg-white shadow-neu-md border-b border-neutral-200/50">
            <div className="flex items-center justify-between px-2 py-1">
              {/* Left Section - Logo */}
              <div className="flex items-center gap-3">
                <Logo 
                  size="sm" 
                  variant="logo-only" 
                  className="flex-shrink-0"
                />
              </div>
              
              {/* Right Section - Clean Menu */}
              <div className="flex items-center gap-2">
                <button className="text-neutral-600 hover:text-neutral-800 text-xs font-medium px-3 py-2 rounded-xl hover:bg-neutral-100 transition-all duration-200 shadow-neu-sm">
                  🇧🇷
                </button>
                <button className="p-2 hover:bg-neutral-100 rounded-xl transition-all duration-200 active:scale-95 shadow-neu-sm">
                  <Bars3Icon className="w-5 h-5 text-neutral-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* CLEAN STEP NAVIGATION - Hidden when embedded or for Ultra-Premium Forms */}
      {!isEmbedded && !isUltraPremiumStep && (
        <div className="md:hidden sticky z-40 bg-white/95 backdrop-blur-sm border-b border-neutral-200/50 shadow-sm mobile-step-nav-position">
          <div className="px-4 py-2">
            {/* Step Title and Progress */}
            <div className="flex items-center justify-between mb-2">
              {/* Back Button */}
              {getPrevStep() && (
                <button
                  onClick={prevStep}
                  className="flex items-center gap-1 text-neutral-600 hover:text-primary-600 transition-colors p-1 -ml-1"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">Voltar</span>
                </button>
              )}
              
              {/* Step Title */}
              <div className="flex-1 text-center px-2">
                <h2 className="text-sm font-bold text-neutral-900">{getStepLabel()}</h2>
                <p className="text-xs text-neutral-500 mt-0.5">{getStepDescription()}</p>
              </div>
              
              {/* Step Counter */}
              <div className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                {(() => {
                  if (preSelectedService) {
                    const steps = [preSelectedService, 'personal', 'budget-notes', 'finalizacao'];
                    return `${steps.indexOf(currentStep) + 1} de ${steps.length}`;
                  } else {
                    const selectedServiceSteps = formData.servicos.filter(s => s !== 'personal' && s !== 'budget-notes' && s !== 'finalizacao');
                    const steps = ['services', 'personal', ...selectedServiceSteps, 'budget-notes', 'finalizacao'];
                    return `${steps.indexOf(currentStep) + 1} de ${steps.length}`;
                  }
                })()}
              </div>
            </div>

            {/* Clean Progress Bar */}
            <div className="flex items-center gap-0.5">
              {(() => {
                if (preSelectedService) {
                  return [preSelectedService, 'personal', 'budget-notes', 'finalizacao'];
                } else {
                  const selectedServiceSteps = formData.servicos.filter(s => s !== 'personal' && s !== 'budget-notes' && s !== 'finalizacao');
                  return ['services', 'personal', ...selectedServiceSteps, 'budget-notes', 'finalizacao'];
                }
              })().map((step, index, array) => {
                const isActive = step === currentStep;
                const isPassed = array.indexOf(currentStep) > index;
                
                return (
                  <div
                    key={step}
                    className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                      isPassed ? 'bg-success-500' : 
                      isActive ? 'bg-primary-500' : 
                      'bg-neutral-200'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Form Content - With Proper Spacing for Sticky Elements (Ultra-Premium Forms Handle Their Own Layout) */}
      <div className={`flex-1 overflow-auto ${!isUltraPremiumStep ? 'mobile-form-content-spacing' : ''}`}>
        {isClientSide ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="pb-32 md:pb-4"
            >
            {/* Step 1: Service Selection - Edge-to-Edge Design */}
            {currentStep === 'services' && (
              <div className="space-y-4">
                {/* Header Section with Padding */}
                <div className="text-center px-4 py-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    O que você precisa?
                  </h3>
                  <p className="text-neutral-600">
                    Selecione os serviços que deseja contratar
                  </p>
                </div>

                {/* Services List - Full Width */}
                <div className="space-y-0">
                  {services.map((service, index) => (
                    <motion.button
                      key={service.id}
                      type="button"
                      onClick={() => handleServiceToggle(service.id)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full p-4 border-b border-neutral-100 transition-all duration-200 min-h-[72px] ${
                        formData.servicos.includes(service.id)
                          ? 'bg-primary-50 border-l-4 border-l-primary-500'
                          : 'bg-white hover:bg-neutral-50 active:bg-neutral-100'
                      } ${index === 0 ? 'border-t border-neutral-100' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${service.color} flex items-center justify-center text-white text-xl flex-shrink-0`}>
                          {service.icon}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <h4 className="font-semibold text-neutral-900 truncate">{service.name}</h4>
                          <p className="text-sm text-neutral-600 truncate">{service.description}</p>
                        </div>
                        <div className="flex-shrink-0">
                          {formData.servicos.includes(service.id) ? (
                            <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                              <CheckIcon className="w-4 h-4 text-white" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 border-2 border-neutral-300 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Personal Information - Optimized Layout */}
            {currentStep === 'personal' && (
              <div className="space-y-0">
                {/* Header Section with Padding */}
                <div className="text-center px-4 py-6 bg-gradient-to-br from-primary-50 to-primary-100 border-b border-primary-200">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <UserIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-primary-900 mb-2">
                    Seus Dados
                  </h3>
                  <p className="text-primary-700">
                    Para que possamos entrar em contato
                  </p>
                </div>

                {/* Form Fields - Full Width */}
                <div className="bg-white">
                  <div className="p-4 border-b border-neutral-100">
                    <label className="block text-sm font-semibold text-neutral-800 mb-3">
                      Nome Completo *
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <input
                        type="text"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        placeholder="Seu nome completo"
                        className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 bg-white text-base"
                        required
                      />
                    </div>
                  </div>

                  <div className="p-4 border-b border-neutral-100">
                    <label className="block text-sm font-semibold text-neutral-800 mb-3">
                      E-mail *
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="seu@email.com"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-neutral-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 bg-white shadow-neu-inset-xs"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Telefone *
                    </label>
                    <PhoneInput
                      value={formData.telefone}
                      onChange={(value) => setFormData({ ...formData, telefone: value })}
                      className="w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Cidade de Origem
                    </label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <input
                        type="text"
                        value={formData.origem}
                        onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
                        placeholder="Ex: São Paulo, SP"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-neutral-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 bg-white shadow-neu-inset-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Service-specific Forms - Multi-Step Wizard */}
            {currentStep === 'voos' && (
              <MobileFlightFormUnified
                onSearch={(data) => handleServiceUpdate('voos', data)}
                mode="embedded"
                stepFlow="extended"
                showNavigation={false}
                className=""
              />
            )}

            {currentStep === 'hoteis' && (
              <MobileHotelForm
                onSearch={(data) => handleServiceUpdate('hoteis', data)}
                className="rounded-2xl shadow-neu-lg border border-neutral-200"
              />
            )}

            {currentStep === 'carros' && (
              <MobileCarForm
                onSearch={(data) => handleServiceUpdate('carros', data)}
                className="rounded-2xl shadow-neu-lg border border-neutral-200"
              />
            )}

            {currentStep === 'passeios' && (
              <MobileTourForm
                onUpdate={(data) => handleServiceUpdate('passeios', data)}
                initialData={formData.serviceData.passeios}
                className="rounded-2xl shadow-neu-lg border border-neutral-200"
              />
            )}

            {currentStep === 'seguro' && (
              <MobileInsuranceForm
                onUpdate={(data) => handleServiceUpdate('seguro', data)}
                initialData={formData.serviceData.seguro}
                className="rounded-2xl shadow-neu-lg border border-neutral-200"
              />
            )}

            {/* Budget & Notes Step */}
            {currentStep === 'budget-notes' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-success-500 to-success-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-neu-md">
                    <CurrencyDollarIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    Orçamento e Preferências
                  </h3>
                  <p className="text-neutral-600">
                    Nos ajude a encontrar a melhor opção para você
                  </p>
                </div>

                {/* Budget Range Selection */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-neutral-800 flex items-center gap-2">
                    <CurrencyDollarIcon className="w-5 h-5" />
                    Faixa de orçamento (opcional)
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { value: 'budget', label: 'Econômico', range: 'R$ 500 - R$ 1.500', icon: '💰', color: 'success' },
                      { value: 'standard', label: 'Padrão', range: 'R$ 1.500 - R$ 3.000', icon: '💳', color: 'primary' },
                      { value: 'premium', label: 'Premium', range: 'R$ 3.000 - R$ 5.000', icon: '💎', color: 'accent' },
                      { value: 'luxury', label: 'Luxo', range: 'R$ 5.000+', icon: '🏆', color: 'warning' }
                    ].map((budget) => (
                      <motion.button
                        key={budget.value}
                        onClick={() => setFormData(prev => ({ ...prev, budget: budget.value }))}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`
                          w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left
                          ${formData.budget === budget.value
                            ? `border-${budget.color}-500 bg-${budget.color}-50 shadow-neu-sm`
                            : 'border-neutral-200 bg-white hover:border-neutral-300 shadow-neu-xs'
                          }
                        `}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">{budget.icon}</div>
                          <div className="flex-1">
                            <div className="font-semibold text-neutral-900">{budget.label}</div>
                            <div className="text-sm text-neutral-600">{budget.range}</div>
                          </div>
                          {formData.budget === budget.value && (
                            <CheckIcon className="w-6 h-6 text-success-600" />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Special Preferences */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-neutral-800 flex items-center gap-2">
                    <PencilIcon className="w-5 h-5" />
                    Observações e preferências especiais
                  </h4>
                  
                  <div className="relative">
                    <PencilIcon className="absolute left-4 top-4 w-5 h-5 text-neutral-400 z-10" />
                    <textarea
                      value={formData.preferencias || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, preferencias: e.target.value }))}
                      placeholder="Alguma preferência especial? Ex: horário de voo, companhia aérea favorita, tipo de quarto, etc..."
                      rows={4}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-neutral-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 bg-white shadow-neu-inset text-neutral-900 resize-none"
                    />
                  </div>
                </div>

                {/* Quick Options */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-neutral-800">Opções rápidas</h4>
                  
                  <div className="space-y-3">
                    <motion.label 
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center gap-3 p-4 bg-warning-50 rounded-2xl border-2 border-warning-200 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.urgente}
                        onChange={(e) => setFormData(prev => ({ ...prev, urgente: e.target.checked }))}
                        className="w-5 h-5 rounded border-warning-300 text-warning-600 focus:ring-warning-500 shadow-neu-inset-xs"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-warning-900 flex items-center gap-2">
                          <span>⚡</span> Solicitação urgente
                        </div>
                        <p className="text-sm text-warning-700">Preciso viajar nos próximos 7 dias</p>
                      </div>
                    </motion.label>

                    <motion.label 
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center gap-3 p-4 bg-primary-50 rounded-2xl border-2 border-primary-200 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.flexivelDatas}
                        onChange={(e) => setFormData(prev => ({ ...prev, flexivelDatas: e.target.checked }))}
                        className="w-5 h-5 rounded border-primary-300 text-primary-600 focus:ring-primary-500 shadow-neu-inset-xs"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-primary-900 flex items-center gap-2">
                          <span>📅</span> Tenho flexibilidade nas datas
                        </div>
                        <p className="text-sm text-primary-700">Posso ajustar as datas para melhor preço</p>
                      </div>
                    </motion.label>
                  </div>
                </div>
              </div>
            )}

            {/* Final Step: Review and Submit */}
            {currentStep === 'finalizacao' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-success-500 to-success-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    Quase pronto!
                  </h3>
                  <p className="text-neutral-600">
                    Revise suas informações e envie sua solicitação
                  </p>
                </div>

                {/* Review Section */}
                <div className="bg-white rounded-2xl p-4 shadow-neu-lg border border-neutral-200">
                  <h4 className="font-semibold text-neutral-900 mb-3">Resumo da Solicitação</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-neutral-600">Solicitante:</span>
                      <p className="font-medium">{formData.nome}</p>
                      <p className="text-sm text-neutral-600">{formData.email} • {formData.telefone}</p>
                    </div>

                    <div>
                      <span className="text-sm text-neutral-600">Serviços solicitados:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {formData.servicos.map(serviceId => {
                          const service = services.find(s => s.id === serviceId);
                          return (
                            <span
                              key={serviceId}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                            >
                              {service?.icon} {service?.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    
                    {formData.budget && (
                      <div>
                        <span className="text-sm text-neutral-600">Orçamento:</span>
                        <p className="font-medium">{
                          formData.budget === 'budget' ? 'Econômico (R$ 500 - R$ 1.500)' :
                          formData.budget === 'standard' ? 'Padrão (R$ 1.500 - R$ 3.000)' :
                          formData.budget === 'premium' ? 'Premium (R$ 3.000 - R$ 5.000)' :
                          'Luxo (R$ 5.000+)'
                        }</p>
                      </div>
                    )}
                    
                    {formData.preferencias && (
                      <div>
                        <span className="text-sm text-neutral-600">Preferências especiais:</span>
                        <p className="font-medium text-sm">{formData.preferencias}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Options */}
                <div className="bg-white rounded-2xl p-4 shadow-neu-lg border border-neutral-200">
                  <h4 className="font-semibold text-neutral-900 mb-3">Informações Adicionais</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Observações ou solicitações especiais
                      </label>
                      <textarea
                        value={formData.observacoes}
                        onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                        placeholder="Alguma observação especial, preferência ou requisito..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 bg-white shadow-neu-inset-xs resize-none"
                      />
                    </div>

                    <div className="space-y-3">
                      {(formData.urgente || formData.flexivelDatas) && (
                        <div>
                          <span className="text-sm text-neutral-600">Opções especiais:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {formData.urgente && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-warning-100 text-warning-700 rounded-full text-sm font-medium">
                                ⚡ Urgente
                              </span>
                            )}
                            {formData.flexivelDatas && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                                📅 Datas flexíveis
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <label className="flex items-center gap-3 p-3 bg-warning-50 rounded-xl border border-warning-200">
                        <input
                          type="checkbox"
                          checked={formData.urgente}
                          onChange={(e) => setFormData({ ...formData, urgente: e.target.checked })}
                          className="w-5 h-5 rounded border-warning-300 text-warning-600 focus:ring-warning-500"
                        />
                        <div>
                          <span className="text-sm font-medium text-warning-900">Solicitação urgente</span>
                          <p className="text-xs text-warning-700">Preciso viajar nos próximos 7 dias</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl border border-primary-200">
                        <input
                          type="checkbox"
                          checked={formData.flexivelDatas}
                          onChange={(e) => setFormData({ ...formData, flexivelDatas: e.target.checked })}
                          className="w-5 h-5 rounded border-primary-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div>
                          <span className="text-sm font-medium text-primary-900">Tenho flexibilidade nas datas</span>
                          <p className="text-xs text-primary-700">Posso ajustar as datas para melhor preço</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-success-600 to-success-700 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-neu-lg hover:shadow-neu-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-center gap-3">
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="w-6 h-6" />
                        Enviar Solicitação
                      </>
                    )}
                  </div>
                </motion.button>

                <div className="text-center text-sm text-neutral-600">
                  <p>✅ Resposta em até 2 horas (horário comercial)</p>
                  <p>📞 Atendimento especializado</p>
                  <p>💰 Cotação gratuita e sem compromisso</p>
                </div>
              </div>
            )}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="p-4 pb-32 md:pb-4">
            {/* Step 1: Service Selection */}
            {currentStep === 'services' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    O que você precisa?
                  </h3>
                  <p className="text-neutral-600">
                    Selecione os serviços que deseja contratar
                  </p>
                </div>

                <div className="space-y-3">
                  {services.map((service) => (
                    <motion.button
                      key={service.id}
                      type="button"
                      onClick={() => handleServiceToggle(service.id)}
                      whileHover={isClientSide ? { scale: 1.02 } : {}}
                      whileTap={isClientSide ? { scale: 0.98 } : {}}
                      className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 ${
                        formData.servicos.includes(service.id)
                          ? 'border-primary-500 bg-primary-50 shadow-neu-sm'
                          : 'border-neutral-200 bg-white hover:border-primary-300 shadow-neu-xs'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r ${service.color}`}>
                          <span className="text-xl">{service.icon}</span>
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-neutral-900">{service.name}</div>
                          <div className="text-sm text-neutral-600">{service.description}</div>
                        </div>
                        {formData.servicos.includes(service.id) && (
                          <CheckIcon className="w-6 h-6 text-primary-600" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Personal Information */}
            {currentStep === 'personal' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-success-500 to-success-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-neu-md">
                    <UserIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    Seus Dados
                  </h3>
                  <p className="text-neutral-600">
                    Para que possamos entrar em contato
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Nome Completo *
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <input
                        type="text"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        placeholder="Seu nome completo"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-neutral-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 bg-white shadow-neu-inset-xs"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="seu@email.com"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-neutral-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 bg-white shadow-neu-inset-xs"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Telefone *
                    </label>
                    <PhoneInput
                      value={formData.telefone}
                      onChange={(value) => setFormData({ ...formData, telefone: value })}
                      className="w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Cidade de Origem
                    </label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <input
                        type="text"
                        value={formData.origem}
                        onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
                        placeholder="Ex: São Paulo, SP"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-neutral-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 bg-white shadow-neu-inset-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Service-specific Forms - Multi-Step Wizard */}
            {currentStep === 'voos' && (
              <MobileFlightFormUnified
                onSearch={(data) => handleServiceUpdate('voos', data)}
                mode="embedded"
                stepFlow="extended"
                showNavigation={false}
                className=""
              />
            )}

            {currentStep === 'hoteis' && (
              <MobileHotelForm
                onSearch={(data) => handleServiceUpdate('hoteis', data)}
                className="rounded-2xl shadow-neu-lg border border-neutral-200"
              />
            )}

            {currentStep === 'carros' && (
              <MobileCarForm
                onSearch={(data) => handleServiceUpdate('carros', data)}
                className="rounded-2xl shadow-neu-lg border border-neutral-200"
              />
            )}

            {currentStep === 'passeios' && (
              <MobileTourForm
                onUpdate={(data) => handleServiceUpdate('passeios', data)}
                initialData={formData.serviceData.passeios}
                className="rounded-2xl shadow-neu-lg border border-neutral-200"
              />
            )}

            {currentStep === 'seguro' && (
              <MobileInsuranceForm
                onUpdate={(data) => handleServiceUpdate('seguro', data)}
                initialData={formData.serviceData.seguro}
                className="rounded-2xl shadow-neu-lg border border-neutral-200"
              />
            )}

            {/* Budget & Notes Step */}
            {currentStep === 'budget-notes' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-success-500 to-success-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-neu-md">
                    <CurrencyDollarIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    Orçamento e Preferências
                  </h3>
                  <p className="text-neutral-600">
                    Nos ajude a encontrar a melhor opção para você
                  </p>
                </div>

                {/* Budget Range Selection */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-neutral-800 flex items-center gap-2">
                    <CurrencyDollarIcon className="w-5 h-5" />
                    Faixa de orçamento (opcional)
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { value: 'budget', label: 'Econômico', range: 'R$ 500 - R$ 1.500', icon: '💰', color: 'success' },
                      { value: 'standard', label: 'Padrão', range: 'R$ 1.500 - R$ 3.000', icon: '💳', color: 'primary' },
                      { value: 'premium', label: 'Premium', range: 'R$ 3.000 - R$ 5.000', icon: '💎', color: 'accent' },
                      { value: 'luxury', label: 'Luxo', range: 'R$ 5.000+', icon: '🏆', color: 'warning' }
                    ].map((budget) => (
                      <motion.button
                        key={budget.value}
                        onClick={() => setFormData(prev => ({ ...prev, budget: budget.value }))}
                        whileHover={isClientSide ? { scale: 1.02 } : {}}
                        whileTap={isClientSide ? { scale: 0.98 } : {}}
                        className={`
                          w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left
                          ${formData.budget === budget.value
                            ? `border-${budget.color}-500 bg-${budget.color}-50 shadow-neu-sm`
                            : 'border-neutral-200 bg-white hover:border-neutral-300 shadow-neu-xs'
                          }
                        `}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">{budget.icon}</div>
                          <div className="flex-1">
                            <div className="font-semibold text-neutral-900">{budget.label}</div>
                            <div className="text-sm text-neutral-600">{budget.range}</div>
                          </div>
                          {formData.budget === budget.value && (
                            <CheckIcon className="w-6 h-6 text-success-600" />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Special Preferences */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-neutral-800 flex items-center gap-2">
                    <PencilIcon className="w-5 h-5" />
                    Observações e preferências especiais
                  </h4>
                  
                  <div className="relative">
                    <PencilIcon className="absolute left-4 top-4 w-5 h-5 text-neutral-400 z-10" />
                    <textarea
                      value={formData.preferencias || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, preferencias: e.target.value }))}
                      placeholder="Alguma preferência especial? Ex: horário de voo, companhia aérea favorita, tipo de quarto, etc..."
                      rows={4}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-neutral-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 bg-white shadow-neu-inset text-neutral-900 resize-none"
                    />
                  </div>
                </div>

                {/* Summary Preview */}
                <div className="bg-neutral-50 rounded-2xl p-4 shadow-neu-inset border border-neutral-200">
                  <h4 className="font-semibold text-neutral-900 mb-3">Resumo da Solicitação</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-neutral-600">Serviços solicitados:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {formData.servicos.map(serviceId => {
                          const service = services.find(s => s.id === serviceId);
                          return service ? (
                            <span key={serviceId} className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                              {service.icon} {service.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                    
                    {formData.budget && (
                      <div>
                        <span className="text-sm text-neutral-600">Orçamento:</span>
                        <p className="font-medium">{
                          formData.budget === 'budget' ? 'Econômico (R$ 500 - R$ 1.500)' :
                          formData.budget === 'standard' ? 'Padrão (R$ 1.500 - R$ 3.000)' :
                          formData.budget === 'premium' ? 'Premium (R$ 3.000 - R$ 5.000)' :
                          'Luxo (R$ 5.000+)'
                        }</p>
                      </div>
                    )}
                    
                    {formData.preferencias && (
                      <div>
                        <span className="text-sm text-neutral-600">Preferências especiais:</span>
                        <p className="font-medium text-sm">{formData.preferencias}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Options */}
                <div className="bg-white rounded-2xl p-4 shadow-neu-lg border border-neutral-200">
                  <h4 className="font-semibold text-neutral-900 mb-3">Informações Adicionais</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Observações ou solicitações especiais
                      </label>
                      <textarea
                        value={formData.observacoes}
                        onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                        placeholder="Alguma observação especial, preferência ou requisito..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 bg-white shadow-neu-inset-xs resize-none"
                      />
                    </div>

                    <div className="space-y-3">
                      {(formData.urgente || formData.flexivelDatas) && (
                        <div>
                          <span className="text-sm text-neutral-600">Opções especiais:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {formData.urgente && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-warning-100 text-warning-700 rounded-full text-sm font-medium">
                                ⚡ Urgente
                              </span>
                            )}
                            {formData.flexivelDatas && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                                📅 Datas flexíveis
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <label className="flex items-center gap-3 p-3 bg-warning-50 rounded-xl border border-warning-200">
                        <input
                          type="checkbox"
                          checked={formData.urgente}
                          onChange={(e) => setFormData({ ...formData, urgente: e.target.checked })}
                          className="w-5 h-5 rounded border-warning-300 text-warning-600 focus:ring-warning-500"
                        />
                        <div>
                          <span className="text-sm font-medium text-warning-900">Solicitação urgente</span>
                          <p className="text-xs text-warning-700">Preciso viajar nos próximos 7 dias</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl border border-primary-200">
                        <input
                          type="checkbox"
                          checked={formData.flexivelDatas}
                          onChange={(e) => setFormData({ ...formData, flexivelDatas: e.target.checked })}
                          className="w-5 h-5 rounded border-primary-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div>
                          <span className="text-sm font-medium text-primary-900">Tenho flexibilidade nas datas</span>
                          <p className="text-xs text-primary-700">Posso ajustar as datas para melhor preço</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  whileHover={isClientSide ? { scale: 1.02 } : {}}
                  whileTap={isClientSide ? { scale: 0.98 } : {}}
                  className="w-full bg-gradient-to-r from-success-600 to-success-700 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-neu-lg hover:shadow-neu-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-center gap-3">
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={isClientSide ? { rotate: 360 } : {}}
                          transition={isClientSide ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
                          className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="w-6 h-6" />
                        Enviar Solicitação
                      </>
                    )}
                  </div>
                </motion.button>

                <div className="text-center text-sm text-neutral-600">
                  <p>✅ Resposta em até 2 horas (horário comercial)</p>
                  <p>📞 Atendimento especializado</p>
                  <p>💰 Cotação gratuita e sem compromisso</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* OPTIMAL UX: Step Navigation Controls - Always Visible Above Bottom Menu */}
      {currentStep !== 'finalizacao' && (
        <div className="fixed bottom-20 left-0 right-0 z-40 bg-gradient-to-r from-white to-neutral-50 border-t border-neutral-200 shadow-neu-lg backdrop-blur-md">
          <div className="px-4 py-3">
            <div className="flex gap-3">
              {getPrevStep() && (
                <motion.button
                  onClick={prevStep}
                  whileHover={isClientSide ? { scale: 1.02, y: -1 } : {}}
                  whileTap={isClientSide ? { scale: 0.95 } : {}}
                  className="flex-1 flex items-center justify-center gap-3 py-4 px-4 bg-gradient-to-r from-neutral-100 to-neutral-200 text-neutral-700 rounded-2xl font-semibold hover:from-neutral-200 hover:to-neutral-300 transition-all duration-200 shadow-neu-sm hover:shadow-neu-md active:scale-95 focus:ring-4 focus:ring-neutral-300/50 focus:outline-none"
                  style={{ touchAction: 'manipulation' }}
                  aria-label="Voltar para o passo anterior"
                  role="button"
                  tabIndex={0}
                >
                  <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shadow-neu-xs">
                    <ArrowLeftIcon className="w-4 h-4" />
                  </div>
                  <span>Voltar</span>
                </motion.button>
              )}
              
              <motion.button
                onClick={nextStep}
                disabled={!canProceed()}
                whileHover={isClientSide ? { 
                  scale: canProceed() ? 1.02 : 1, 
                  y: canProceed() ? -1 : 0,
                  boxShadow: canProceed() ? "0 10px 25px -5px rgba(59, 130, 246, 0.3)" : undefined
                } : {}}
                whileTap={isClientSide ? { scale: canProceed() ? 0.95 : 1 } : {}}
                className="flex-1 flex items-center justify-center gap-3 py-4 px-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-2xl font-bold shadow-neu-lg hover:shadow-neu-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden focus:ring-4 focus:ring-primary-300/50 focus:outline-none"
                style={{ touchAction: 'manipulation' }}
                aria-label={`Continuar para ${currentStep === 'budget-notes' ? 'finalizar' : 'próximo passo'}`}
                role="button"
                tabIndex={0}
              >
                {/* Animated Background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-accent-500 to-primary-500 opacity-0 hover:opacity-100 transition-opacity duration-300"
                  initial={isClientSide ? { x: '-100%' } : {}}
                  whileHover={isClientSide ? { x: '0%' } : {}}
                  transition={isClientSide ? { duration: 0.3 } : {}}
                />
                
                <div className="relative z-10 flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                    {currentStep === 'budget-notes' ? (
                      <SparklesIcon className="w-4 h-4" />
                    ) : (
                      <ArrowRightIcon className="w-4 h-4" />
                    )}
                  </div>
                  <span>
                    {currentStep === 'budget-notes' ? 'Revisar & Finalizar' : 
                     currentStep === 'personal' ? 'Ir para Orçamento' : 
                     isServiceStep ? 'Next Service' :
                     'Continue'}
                  </span>
                  {currentStep !== 'budget-notes' && (
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-white/80"
                    >
                      →
                    </motion.div>
                  )}
                </div>
              </motion.button>
            </div>
            
            {/* Enhanced Progress Dots - Better Visual Feedback */}
            <div className="flex justify-center mt-3 gap-1">
              {(() => {
                if (preSelectedService) {
                  return [preSelectedService, 'personal', 'budget-notes', 'finalizacao'];
                } else {
                  const selectedServiceSteps = formData.servicos.filter(s => s !== 'personal' && s !== 'budget-notes' && s !== 'finalizacao');
                  return ['services', 'personal', ...selectedServiceSteps, 'budget-notes', 'finalizacao'];
                }
              })().map((step, index, array) => {
                const isActive = step === currentStep;
                const isPassed = array.indexOf(currentStep) > index;
                
                return (
                  <motion.div
                    key={step}
                    initial={isClientSide ? { scale: 0.8, opacity: 0.5 } : {}}
                    animate={isClientSide ? { 
                      scale: isActive ? 1.25 : isPassed ? 1.1 : 1,
                      opacity: isActive ? 1 : isPassed ? 0.8 : 0.4
                    } : {}}
                    transition={isClientSide ? { duration: 0.3, type: "spring", damping: 15 } : {}}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      isPassed ? 'bg-success-500 shadow-glow-sm' : 
                      isActive ? 'bg-primary-500 shadow-glow-md' : 
                      'bg-neutral-300'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Bottom App Navigation - Optimized UX */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-neutral-200/50 shadow-lg z-50">
        <div className="safe-area-bottom">
          <div className="flex items-center justify-around py-3 px-4">
          <motion.button
            whileTap={isClientSide ? { scale: 0.9 } : {}}
            whileHover={isClientSide ? { scale: 1.05, y: -1 } : {}}
            onClick={() => window.location.href = '/'}
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-neutral-100/80 transition-colors focus:ring-2 focus:ring-neutral-300/50 focus:outline-none"
            aria-label="Voltar para a página inicial"
            role="button"
            tabIndex={0}
          >
            <HomeIcon className="w-5 h-5 text-neutral-600" />
            <span className="text-xs font-medium text-neutral-600">Início</span>
          </motion.button>
          
          <motion.button
            whileTap={isClientSide ? { scale: 0.9 } : {}}
            whileHover={isClientSide ? { 
              scale: 1.05, 
              y: -1,
              backgroundColor: currentStep === 'voos' || formData.servicos.includes('voos') 
                ? "rgba(59, 130, 246, 0.1)" 
                : "rgba(156, 163, 175, 0.1)"
            } : {}}
            onClick={() => setCurrentStep('voos')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 focus:ring-2 focus:outline-none ${
              currentStep === 'voos' || formData.servicos.includes('voos') 
                ? 'bg-primary-50 text-primary-600 focus:ring-primary-300/50' 
                : 'text-neutral-600 hover:bg-neutral-100/80 focus:ring-neutral-300/50'
            }`}
            aria-label="Ir para formulário de voos"
            role="button"
            tabIndex={0}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span className="text-xs font-medium">Voos</span>
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentStep('hoteis')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
              currentStep === 'hoteis' || formData.servicos.includes('hoteis')
                ? 'bg-emerald-50 text-emerald-600'
                : 'text-neutral-600 hover:bg-neutral-100/80'
            }`}
          >
            <BuildingOfficeIcon className="w-5 h-5" />
            <span className="text-xs font-medium">Hotéis</span>
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentStep('carros')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
              currentStep === 'carros' || formData.servicos.includes('carros')
                ? 'bg-purple-50 text-purple-600'
                : 'text-neutral-600 hover:bg-neutral-100/80'
            }`}
          >
            <TruckIcon className="w-5 h-5" />
            <span className="text-xs font-medium">Carros</span>
          </motion.button>
          
          <motion.button
            whileTap={isClientSide ? { scale: 0.9 } : {}}
            onClick={() => setCurrentStep('passeios')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
              currentStep === 'passeios' || formData.servicos.includes('passeios')
                ? 'bg-warning-50 text-warning-600'
                : 'text-neutral-600 hover:bg-neutral-100/80'
            }`}
            aria-label="Ir para formulário de passeios"
            role="button"
            tabIndex={0}
          >
            <CameraIcon className="w-5 h-5" />
            <span className="text-xs font-medium">Tours</span>
          </motion.button>
          </div>
        </div>
      </div>

      {/* Premium Success Modal - ULTRATHINK Enhancement */}
      <PremiumSuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          // Reset form or navigate away if needed
          if (onClose) {
            setTimeout(() => onClose(), 300);
          }
        }}
        leadData={successData}
      />

      {/* ULTRATHINK: Premium Error Modal */}
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