'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  ChevronLeftIcon,
  CheckIcon,
  UserIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  SparklesIcon,
  HomeIcon,
  MapPinIcon,
  HeartIcon,
  UserIcon as UserIconOutline,
  Bars3Icon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  MapPinIcon as MapPinIconSolid,
  HeartIcon as HeartIconSolid,
  UserIcon as UserIconSolid
} from '@heroicons/react/24/solid';
import Logo from '@/components/Logo';

// Import service-specific mobile forms
import MobileFlightFormUnified from './MobileFlightFormUnified';
import MobileHotelFormUnified from './MobileHotelFormUnified';
import MobileCarFormUnified from './MobileCarFormUnified';
import MobileTourFormUnified from './MobileTourFormUnified';
import MobileInsuranceFormUnified from './MobileInsuranceFormUnified';

// ========================================================================================
// INTERFACES & TYPES
// ========================================================================================

interface SelectedService {
  serviceType: 'voos' | 'hoteis' | 'carros' | 'passeios' | 'seguro';
  completed?: boolean;
}

interface MobileUnifiedLeadFormProps {
  selectedServices: SelectedService[];
  onClose: () => void;
  isOpen: boolean;
  initialServiceIndex?: number;
}

interface UnifiedMobileFormData {
  currentStep: 1 | 2 | 3 | 4;
  currentServiceIndex: number;
  serviceType: 'voos' | 'hoteis' | 'carros' | 'passeios' | 'seguro';

  // Step 1: Service Details (varies by service)
  serviceDetails: Record<string, any>;

  // Step 2: Budget & Preferences
  budgetRange: string;
  specialPreferences: string;
  isUrgent: boolean;
  hasFlexibleDates: boolean;

  // Step 3: Contact
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;

  // Step 4: Confirmation
  agreedToTerms: boolean;
  marketingOptIn: boolean;
}

// ========================================================================================
// DESIGN SYSTEM & CONSTANTS
// ========================================================================================

const serviceConfig = {
  voos: {
    icon: '✈️',
    title: 'Voos',
    color: '#2563eb',
    lightColor: '#dbeafe'
  },
  hoteis: {
    icon: '🏨',
    title: 'Hotéis',
    color: '#dc2626',
    lightColor: '#fee2e2'
  },
  carros: {
    icon: '🚗',
    title: 'Carros',
    color: '#16a34a',
    lightColor: '#dcfce7'
  },
  passeios: {
    icon: '🎯',
    title: 'Passeios',
    color: '#ca8a04',
    lightColor: '#fef3c7'
  },
  seguro: {
    icon: '🛡️',
    title: 'Seguro',
    color: '#7c3aed',
    lightColor: '#ede9fe'
  }
};

// EXACT homepage navigation tabs configuration
const tabs = [
  {
    id: 'home',
    label: 'Home',
    icon: HomeIcon,
    iconSolid: HomeIconSolid,
    color: 'text-blue-600',
    bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'search',
    label: 'Explorar',
    icon: MapPinIcon,
    iconSolid: MapPinIconSolid,
    color: 'text-purple-600',
    bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
    gradient: 'from-purple-500 to-violet-500'
  },
  {
    id: 'favorites',
    label: 'Favoritos',
    icon: HeartIcon,
    iconSolid: HeartIconSolid,
    color: 'text-rose-600',
    bgColor: 'bg-gradient-to-br from-rose-50 to-pink-100',
    gradient: 'from-rose-500 to-pink-500'
  },
  {
    id: 'profile',
    label: 'Perfil',
    icon: UserIconOutline,
    iconSolid: UserIconSolid,
    color: 'text-orange-600',
    bgColor: 'bg-gradient-to-br from-orange-50 to-amber-100',
    gradient: 'from-orange-500 to-amber-500'
  }
];

const steps = [
  { number: 1, title: 'Detalhes do Serviço', icon: '⚙️', key: 'service' },
  { number: 2, title: 'Budget & Preferências', icon: '💰', key: 'budget' },
  { number: 3, title: 'Contato', icon: '👤', key: 'contact' },
  { number: 4, title: 'Confirmação', icon: '✅', key: 'confirmation' }
];

const trustBadges = [
  '✅ Resposta garantida em até 2 horas',
  '🏆 Melhores preços e tarifas',
  '💰 Sem taxas extras',
  '🛡️ Suporte durante sua viagem'
];

// ========================================================================================
// MOBILE UNIFIED LEAD FORM COMPONENT
// ========================================================================================

export default function MobileUnifiedLeadForm({
  selectedServices,
  onClose,
  isOpen,
  initialServiceIndex = 0
}: MobileUnifiedLeadFormProps) {

  // =====================
  // STATE MANAGEMENT
  // =====================

  const [currentServiceIndex, setCurrentServiceIndex] = useState(initialServiceIndex);
  const [formData, setFormData] = useState<UnifiedMobileFormData>({
    currentStep: 1,
    currentServiceIndex: initialServiceIndex,
    serviceType: selectedServices[initialServiceIndex]?.serviceType || 'voos',
    serviceDetails: {},
    budgetRange: '',
    specialPreferences: '',
    isUrgent: false,
    hasFlexibleDates: false,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+55',
    agreedToTerms: false,
    marketingOptIn: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // =====================
  // COMPUTED VALUES
  // =====================

  const currentService = selectedServices[currentServiceIndex];
  const serviceData = serviceConfig[currentService?.serviceType || 'voos'];
  const hasMultipleServices = selectedServices.length > 1;
  const isLastService = currentServiceIndex === selectedServices.length - 1;

  // =====================
  // EVENT HANDLERS
  // =====================

  const handleServiceFormSubmit = useCallback(async (serviceSpecificData: any) => {
    console.log('📋 Service form data received:', serviceSpecificData);

    // CRITICAL FIX: Wait for state updates to complete before proceeding
    await new Promise(resolve => {
      // Extract contact information from service data if available
      const contactInfo = serviceSpecificData?.contactInfo || {};

      // Update service details AND contact information in unified form data
      setFormData(prev => {
        const updatedData = {
          ...prev,
          serviceDetails: {
            ...prev.serviceDetails,
            [currentService.serviceType]: serviceSpecificData
          },
          // CRITICAL FIX: Update contact fields from service form data
          firstName: contactInfo.firstName || prev.firstName,
          lastName: contactInfo.lastName || prev.lastName,
          email: contactInfo.email || prev.email,
          phone: contactInfo.phone || prev.phone,
          countryCode: contactInfo.countryCode || prev.countryCode
        };

        // Debug log to verify contact data extraction
        console.log('🔧 [DEBUG] Contact info extracted:', {
          firstName: updatedData.firstName,
          lastName: updatedData.lastName,
          email: updatedData.email,
          phone: updatedData.phone,
          source: 'handleServiceFormSubmit'
        });

        // Use setTimeout to ensure state is updated before resolving
        setTimeout(resolve, 0);
        return updatedData;
      });
    });

    // If it's a single service and we're on the last step, complete the submission
    if (!hasMultipleServices && formData.currentStep === 4) {
      await handleFinalSubmission(serviceSpecificData);
    } else {
      // Move to next step or next service
      if (formData.currentStep < 4) {
        setFormData(prev => ({ ...prev, currentStep: (prev.currentStep + 1) as 1 | 2 | 3 | 4 }));
      } else if (!isLastService) {
        // Move to next service
        setCurrentServiceIndex(prev => prev + 1);
        setFormData(prev => ({
          ...prev,
          currentStep: 1,
          currentServiceIndex: prev.currentServiceIndex + 1,
          serviceType: selectedServices[prev.currentServiceIndex + 1].serviceType
        }));
      } else {
        // Final submission
        await handleFinalSubmission(serviceSpecificData);
      }
    }
  }, [currentService, hasMultipleServices, formData.currentStep, isLastService, selectedServices]);

  const handleFinalSubmission = useCallback(async (finalData: any) => {
    // CRITICAL FIX: Prevent double submission
    if (isSubmitting) {
      console.log('⚠️ [DEBUG] Submission already in progress, ignoring duplicate request');
      return;
    }

    setIsSubmitting(true);

    try {
      // CRITICAL FIX: Get current form data from state at submission time
      const currentFormData = { ...formData };

      // Extract any additional contact info from finalData
      const additionalContactInfo = finalData?.contactInfo || {};

      // Use the most recent data available
      const finalContactInfo = {
        firstName: additionalContactInfo.firstName || currentFormData.firstName,
        lastName: additionalContactInfo.lastName || currentFormData.lastName,
        email: additionalContactInfo.email || currentFormData.email,
        phone: additionalContactInfo.phone || currentFormData.phone,
        countryCode: additionalContactInfo.countryCode || currentFormData.countryCode
      };

      // Debug log to verify final form data before submission
      console.log('🚀 [DEBUG] Final form data before submission:', {
        ...finalContactInfo,
        source: 'handleFinalSubmission'
      });

      // Validate required fields
      if (!finalContactInfo.firstName || !finalContactInfo.email) {
        throw new Error('Dados de contato obrigatórios não preenchidos');
      }

      // Prepare unified submission data - Fixed field mapping for API compatibility
      const submissionData = {
        // API-compatible fields
        nome: `${finalContactInfo.firstName} ${finalContactInfo.lastName}`.trim(),
        email: finalContactInfo.email,
        telefone: finalContactInfo.phone,
        whatsapp: finalContactInfo.phone, // Use phone as WhatsApp
        servicos: selectedServices.map(service => service.serviceType),
        selectedServices: selectedServices.map(service => service.serviceType),

        // Additional form data
        serviceDetails: currentFormData.serviceDetails,
        budgetRange: currentFormData.budgetRange,
        observacoes: currentFormData.specialPreferences,
        urgente: currentFormData.isUrgent,
        flexivelDatas: currentFormData.hasFlexibleDates,

        // Contact info (legacy structure kept for compatibility)
        contactInfo: finalContactInfo,

        // Marketing and terms
        agreedToTerms: currentFormData.agreedToTerms,
        marketingOptIn: currentFormData.marketingOptIn,

        // Metadata
        source: 'mobile_unified_multistep',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };

      // Submit to API
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar solicitação');
      }

      console.log('✅ Unified form submitted successfully');
      setShowSuccessModal(true);

      // Close form after short delay
      setTimeout(() => {
        setShowSuccessModal(false);
        onClose();
      }, 3000);

    } catch (error) {
      console.error('❌ Error submitting unified form:', error);
      // Handle error appropriately
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, selectedServices, onClose]);

  const handleStepChange = useCallback((newStep: 1 | 2 | 3 | 4) => {
    setFormData(prev => ({ ...prev, currentStep: newStep }));
  }, []);

  const handlePreviousService = useCallback(() => {
    if (currentServiceIndex > 0) {
      setCurrentServiceIndex(prev => prev - 1);
      setFormData(prev => ({
        ...prev,
        currentServiceIndex: prev.currentServiceIndex - 1,
        serviceType: selectedServices[prev.currentServiceIndex - 1].serviceType,
        currentStep: 1
      }));
    }
  }, [currentServiceIndex, selectedServices]);

  // =====================
  // RENDER SERVICE FORM
  // =====================

  const renderServiceForm = () => {
    const commonProps = {
      mode: 'premium' as const,
      stepFlow: 'extended' as const,
      showNavigation: true,
      onSubmit: handleServiceFormSubmit,
      onClose: onClose,
      currentStep: formData.currentStep,
      onStepChange: handleStepChange,
      unifiedFormData: formData,
      hasMultipleServices,
      isLastService,
      serviceIndex: currentServiceIndex + 1,
      totalServices: selectedServices.length
    };

    switch (currentService?.serviceType) {
      case 'voos':
        return <MobileFlightFormUnified {...commonProps} />;
      case 'hoteis':
        return <MobileHotelFormUnified {...commonProps} />;
      case 'carros':
        return <MobileCarFormUnified {...commonProps} />;
      case 'passeios':
        return <MobileTourFormUnified {...commonProps} />;
      case 'seguro':
        return <MobileInsuranceFormUnified {...commonProps} />;
      default:
        return null;
    }
  };

  // =====================
  // RENDER COMPONENT
  // =====================

  if (!isOpen || !currentService) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* MAIN MOBILE HEADER - Exact same as homepage */}
        <div className="bg-white shadow-neu-md border-b border-neutral-200/50 relative z-[10000]">
          <div className="flex items-center justify-between px-3 py-2">
            {/* Left Section - Logo */}
            <div className="flex items-center">
              <Logo
                size="sm"
                variant="logo-only"
                className="flex-shrink-0"
              />
            </div>

            {/* Right Section - Clean Menu */}
            <div className="flex items-center gap-2">
              <button className="text-neutral-600 hover:text-neutral-800 text-xs font-medium px-3 py-2 rounded-xl hover:bg-neutral-100 transition-all duration-200 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary-500/50" aria-label="Alterar idioma">
                🇧🇷
              </button>
              <button className="p-2 hover:bg-neutral-100 rounded-xl transition-all duration-200 active:scale-95 min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-primary-500/50" aria-label="Menu principal">
                <Bars3Icon className="w-5 h-5 text-neutral-600" />
              </button>
            </div>
          </div>
        </div>
        {/* Header */}
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderBottom: '1px solid #e2e8f0',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '70px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {hasMultipleServices && currentServiceIndex > 0 && (
              <button
                onClick={handlePreviousService}
                style={{
                  padding: '8px',
                  borderRadius: '50%',
                  border: 'none',
                  background: '#f1f5f9',
                  color: '#475569',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ChevronLeftIcon style={{ width: '18px', height: '18px' }} />
              </button>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: serviceData.lightColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px'
                }}
              >
                {serviceData.icon}
              </div>
              <div>
                <h2 style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1e293b'
                }}>
                  {serviceData.title}
                </h2>
                <p style={{
                  margin: 0,
                  fontSize: '13px',
                  color: '#64748b'
                }}>
                  {formData.currentStep} de 4 • {hasMultipleServices ? `Serviço ${currentServiceIndex + 1} de ${selectedServices.length}` : 'Serviço único'}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '8px',
              borderRadius: '50%',
              border: 'none',
              background: '#f1f5f9',
              color: '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <XMarkIcon style={{ width: '20px', height: '20px' }} />
          </button>
        </motion.div>

        {/* Step Indicators */}
        <div
          style={{
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          {steps.map((step, index) => {
            const isActive = step.number === formData.currentStep;
            const isCompleted = step.number < formData.currentStep;

            return (
              <div
                key={step.number}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flex: 1,
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: isCompleted ? serviceData.color : isActive ? serviceData.color : '#e2e8f0',
                    color: isCompleted || isActive ? '#ffffff' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: '600',
                    zIndex: 2,
                    position: 'relative'
                  }}
                >
                  {isCompleted ? <CheckIcon style={{ width: '12px', height: '12px' }} /> : step.number}
                </div>

                {index < steps.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: '2px',
                      backgroundColor: isCompleted ? serviceData.color : '#e2e8f0',
                      marginLeft: '4px',
                      marginRight: '4px'
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Trust Indicators */}
        {formData.currentStep === 1 && (
          <div
            style={{
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              padding: '12px 20px'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {trustBadges.map((badge, index) => (
                <div
                  key={index}
                  style={{
                    fontSize: '11px',
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {badge}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form Content */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            backgroundColor: '#ffffff',
            paddingBottom: '80px' // CRITICAL FIX: Account for bottom navigation
          }}
        >
          {renderServiceForm()}
        </div>

        {/* ULTRATHINK Enhanced Bottom Navigation - FIXED POSITIONING */}
        <div className="bg-white/95 backdrop-blur-xl border-t border-neutral-200/50 px-2 py-2 pb-safe-bottom shadow-neu-lg fixed bottom-0 left-0 right-0 z-[10000]">
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-50/20 to-transparent"></div>
          <div className="flex justify-around relative z-10">
            {tabs.map((tab) => {
              const isActive = tab.id === 'home'; // Highlight home since user is in main app
              const IconComponent = isActive ? tab.iconSolid : tab.icon;

              return (
                <motion.button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'home') {
                      window.location.href = '/';
                    } else if (tab.id === 'search') {
                      // Explorar - could implement search functionality
                      window.location.href = '/';
                    } else if (tab.id === 'favorites') {
                      // Favoritos - could open WhatsApp for now
                      window.open('https://wa.me/5511999999999', '_blank');
                    } else if (tab.id === 'profile') {
                      // Perfil - could open contact or profile
                      window.open('https://wa.me/5511999999999', '_blank');
                    }
                  }}
                  className="flex-1 py-2 px-1 relative min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-1 rounded-lg active:transform active:scale-95"
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.02 }}
                  style={{ touchAction: 'manipulation' }}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Navegar para ${tab.label}`}
                >
                  <div className="flex flex-col items-center">
                    <div className={`p-1.5 rounded-lg transition-all duration-300 ${
                      isActive
                        ? `${tab.bgColor} hover:bg-neutral-50/50`
                        : 'hover:bg-neutral-50'
                    }`}>
                      <IconComponent
                        className={`w-6 h-6 transition-all duration-300 ${
                          isActive ? `${tab.color}` : 'text-neutral-400'
                        }`}
                      />
                    </div>
                    <span className={`text-xs mt-0.5 font-medium transition-all duration-300 ${
                      isActive ? `${tab.color}` : 'text-neutral-400'
                    }`}>
                      {tab.label}
                    </span>
                  </div>

                  {/* ULTRATHINK Enhanced Active Indicator - Full Width Bottom Line */}
                  {isActive && (
                    <motion.div
                      className={`absolute -bottom-0.5 left-1/2 w-14 h-1 bg-gradient-to-r ${tab.gradient} rounded-full shadow-sm`}
                      layoutId="activeIndicator"
                      style={{ x: '-50%' }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", damping: 20, stiffness: 400 }}
                    />
                  )}

                  {/* Enhanced Subtle Highlight Effect */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-lg bg-gradient-to-b from-transparent via-transparent to-neutral-100/20"
                      layoutId="highlightEffect"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Success Modal */}
        <AnimatePresence>
          {showSuccessModal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: '#ffffff',
                borderRadius: '16px',
                padding: '32px',
                textAlign: 'center',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                maxWidth: '320px',
                width: '90%',
                zIndex: 10001
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto'
                }}
              >
                <CheckIcon style={{ width: '32px', height: '32px', color: '#16a34a' }} />
              </div>
              <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '18px',
                fontWeight: '700',
                color: '#1e293b'
              }}>
                Solicitação Enviada!
              </h3>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: '#64748b'
              }}>
                Entraremos em contato em até 2 horas com as melhores opções para você.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}