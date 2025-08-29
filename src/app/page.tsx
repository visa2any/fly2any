'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import Link from 'next/link';
import { trackFormSubmit, trackQuoteRequest } from '@/lib/analytics-safe';
import { 
  FlightIcon, 
  HotelIcon, 
  CarIcon, 
  TourIcon, 
  InsuranceIcon, 
  CalendarIcon, 
  UsersIcon, 
  BedIcon,
  PhoneIcon,
  CheckIcon,
  StarIcon,
  ChatIcon,
  MailIcon,
  LocationIcon
} from '@/components/Icons';
import Logo from '@/components/Logo';
// import ResponsiveHeader from '@/components/ResponsiveHeader'; // Temporarily replaced with LiveSiteHeader
import Footer from '@/components/Footer';
// Import new header and footer ONLY for home page (temporary until full Fly2Any implementation)
import LiveSiteHeader from '@/components/home/LiveSiteHeader';
import LiveSiteFooter from '@/components/home/LiveSiteFooter';
import GlobalMobileStyles from '@/components/GlobalMobileStyles';
import AirportAutocomplete from '@/components/flights/AirportAutocomplete';
import CityAutocomplete from '@/components/CityAutocomplete';
import { AirportSelection } from '@/types/flights';
import DatePicker from '@/components/DatePicker';
import PhoneInput from '@/components/PhoneInputSimple';
import FloatingChat from '@/components/FloatingChat';
import LeadCaptureSimple from '@/components/LeadCaptureSimple';
import NewsletterCapture from '@/components/NewsletterCapture';
import ExitIntentPopup from '@/components/ExitIntentPopup';
import { cities } from '@/data/cities';
// Mobile-specific imports
import { useMobileUtils } from '@/hooks/useMobileDetection';
import MobileAppLayout from '@/components/mobile/MobileAppLayout';

interface ServiceFormData {
  serviceType: 'voos' | 'hoteis' | 'carros' | 'passeios' | 'seguro';
  completed: boolean;
  // Dados de viagem
  origem: AirportSelection | null;
  destino: AirportSelection | null;
  dataIda: string;
  dataVolta: string;
  tipoViagem: 'ida-volta' | 'somente-ida' | 'multiplas-cidades';
  classeVoo: 'economica' | 'premium' | 'executiva' | 'primeira';
  adultos: number;
  criancas: number;
  bebes: number;
  // Preferências de voo
  companhiaPreferida: string;
  horarioPreferido: 'manha' | 'tarde' | 'noite' | 'qualquer';
  escalas: 'sem-escalas' | 'uma-escala' | 'qualquer';
  // Dados específicos de hotéis
  checkin?: string;
  checkout?: string;
  quartos?: number;
  categoriaHotel?: string;
  // Dados específicos de carros
  localRetirada?: string;
  dataRetirada?: string;
  horaRetirada?: string;
  dataEntrega?: string;
  horaEntrega?: string;
  categoriaVeiculo?: string;
  // Dados específicos de passeios
  tipoPasseio?: string;
  duracao?: string;
  // Dados específicos de seguro
  tipoSeguro?: string;
  cobertura?: string;
  idadeViajante?: string;
  // Dados adicionais
  observacoes?: string;
  flexibilidadeDatas?: boolean;
  orcamentoAproximado?: string;
}

interface FormData {
  selectedServices: ServiceFormData[];
  currentServiceIndex: number;
  // Dados de viagem
  origem: AirportSelection | null;
  destino: AirportSelection | null;
  dataIda: string;
  dataVolta: string;
  tipoViagem: 'ida-volta' | 'somente-ida' | 'multiplas-cidades';
  classeVoo: 'economica' | 'premium' | 'executiva' | 'primeira';
  adultos: number;
  criancas: number;
  bebes: number;
  // Preferências de voo
  companhiaPreferida: string;
  horarioPreferido: 'manha' | 'tarde' | 'noite' | 'qualquer';
  escalas: 'sem-escalas' | 'uma-escala' | 'qualquer';
  // Dados pessoais (compartilhados entre todos os serviços)
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  whatsapp: string;
  // Additional properties
  serviceType?: string;
  orcamentoAproximado?: string;
  flexibilidadeDatas?: boolean;
  observacoes?: string;
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  
  // Use unified mobile detection
  const { isMobileDevice, isTablet, isPortraitMobile } = useMobileUtils();
  
  // Show premium app form automatically on mobile only
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  
  // Auto-show premium form on mobile after page loads
  useEffect(() => {
    console.log('🔍 Mobile Detection:', { isMobileDevice, isTablet, isPortraitMobile });
    if (isMobileDevice) {
      console.log('📱 Mobile detected - showing premium form');
      // Show immediately for testing
      setShowLeadCapture(true);
    } else {
      console.log('💻 Desktop detected - keeping original form');
    }
  }, [isMobileDevice, isTablet, isPortraitMobile]);
  const [formData, setFormData] = useState<FormData>({
    selectedServices: [],
    currentServiceIndex: 0,
    // Dados de viagem
    origem: null,
    destino: null,
    dataIda: '',
    dataVolta: '',
    tipoViagem: 'ida-volta',
    classeVoo: 'economica',
    adultos: 1,
    criancas: 0,
    bebes: 0,
    // Preferências de voo
    companhiaPreferida: '',
    horarioPreferido: 'qualquer',
    escalas: 'qualquer',
    // Dados pessoais
    nome: '',
    sobrenome: '',
    email: '',
    telefone: '',
    whatsapp: '',
    // Additional properties
    serviceType: '',
    orcamentoAproximado: '',
    flexibilidadeDatas: false,
    observacoes: ''
  });

  const [isAddingService, setIsAddingService] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSocialProof, setShowSocialProof] = useState(false);
  const [socialProofIndex, setSocialProofIndex] = useState(0);
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [exitIntentEmail, setExitIntentEmail] = useState('');
  const [showMobileSuccess, setShowMobileSuccess] = useState(false);
  const [mobileInteractionCount, setMobileInteractionCount] = useState(0);

  // Social proof notifications data
  const socialProofNotifications = [
    { name: "Maria S.", location: "Orlando", route: "São Paulo", price: "$347", time: "2 min" },
    { name: "João M.", location: "Miami", route: "Rio de Janeiro", price: "$456", time: "5 min" },
    { name: "Ana P.", location: "Boston", route: "Brasília", price: "$487", time: "8 min" },
    { name: "Carlos R.", location: "New York", route: "Salvador", price: "$543", time: "12 min" },
    { name: "Lucia F.", location: "Los Angeles", route: "Fortaleza", price: "$578", time: "18 min" }
  ];

  // Social proof cycling effect
  useEffect(() => {
    const startSocialProof = setTimeout(() => {
      setShowSocialProof(true);
    }, 3000); // Show after 3 seconds

    const cycleSocialProof = setInterval(() => {
      setSocialProofIndex((prev: number) => (prev + 1) % socialProofNotifications.length);
      setShowSocialProof(true);
      
      // Hide after 4 seconds, show next after 8 seconds
      setTimeout(() => setShowSocialProof(false), 4000);
    }, 12000); // Show every 12 seconds

    return () => {
      clearTimeout(startSocialProof);
      clearInterval(cycleSocialProof);
    };
  }, []);

  // Exit intent detection
  useEffect(() => {
    let hasShownExitIntent = false;
    
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShownExitIntent && !showExitIntent) {
        hasShownExitIntent = true;
        setShowExitIntent(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [showExitIntent]);

  // Real-time validation function
  const validateField = (name: string, value: string): string => {
    if (!value || typeof value !== 'string') {
      return `${name} é obrigatório`;
    }

    switch (name) {
      case 'nome':
        return value.trim().length < 2 ? 'Nome deve ter pelo menos 2 caracteres' : '';
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value.trim()) ? 'Email inválido' : '';
      case 'telefone':
        const cleanPhone = value.replace(/\D/g, '');
        return cleanPhone.length < 10 ? 'Telefone deve ter pelo menos 10 dígitos' : '';
      case 'whatsapp':
        const cleanWhatsapp = value.replace(/\D/g, '');
        return cleanWhatsapp.length < 10 ? 'WhatsApp é obrigatório e deve ter pelo menos 10 dígitos' : '';
      case 'origem':
        return value.trim().length < 2 ? 'Origem é obrigatória' : '';
      case 'destino':
        return value.trim().length < 2 ? 'Destino é obrigatório' : '';
      case 'dataIda':
        return !value.trim() ? 'Data de ida é obrigatória' : '';
      default:
        return '';
    }
  };

  // Handle input changes with validation
  const handleInputChange = (name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    
    // Real-time validation
    const error = validateField(name, value);
    setValidationErrors((prev: any) => ({ ...prev, [name]: error }));
  };

  // Handle field blur
  const handleFieldBlur = (name: string) => {
    setTouchedFields((prev: any) => ({ ...prev, [name]: true }));
  };

  // Calculate progress percentage
  const getProgressPercentage = () => {
    const totalSteps = 3;
    
    // Add progress within current step
    let stepProgress = 0;
    if (currentStep === 1) {
      stepProgress = formData.selectedServices.length > 0 ? 0.5 : 0;
    } else if (currentStep === 2) {
      const service = getCurrentService();
      if (service) {
        const fields = ['origem', 'destino', 'dataIda'];
        const filledFields = fields.filter(field => service[field as keyof ServiceFormData]);
        stepProgress = fields.length > 0 ? (filledFields.length / fields.length) : 0;
      }
    } else if (currentStep === 3) {
      const fields = ['nome', 'email', 'telefone'];
      const filledFields = fields.filter(field => formData[field as keyof FormData]);
      stepProgress = fields.length > 0 ? (filledFields.length / fields.length) : 0;
    }
    
    return Math.min(100, totalSteps > 0 ? (((currentStep - 1) / totalSteps) + (stepProgress / totalSteps)) * 100 : 0);
  };

  // Check if current step is valid
  const isStepValid = () => {
    if (currentStep === 1) {
      return formData.selectedServices.length > 0;
    } else if (currentStep === 2) {
      const service = getCurrentService();
      if (!service) return false;
      
      // Validação básica para todos os serviços
      const basicValid = service.origem && service.destino;
      
      // Validação específica para voos
      if (service.serviceType === 'voos') {
        return basicValid && service.dataIda && service.tipoViagem && 
               service.adultos >= 1 && service.criancas >= 0 && service.bebes >= 0;
      }
      
      // Para outros serviços, validação básica
      return basicValid && service.dataIda;
    } else if (currentStep === 3) {
      return formData.nome && formData.email && formData.whatsapp &&
             !validateField('nome', formData.nome) &&
             !validateField('email', formData.email) &&
             !validateField('whatsapp', formData.whatsapp);
    }
    return false;
  };

  useEffect(() => {
    setIsVisible(true);
    
    // Close passengers dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('passengers-dropdown');
      const trigger = event.target as HTMLElement;
      if (dropdown && !trigger.closest('#passengers-dropdown') && !trigger.closest('[data-passengers-trigger]')) {
        dropdown.style.display = 'none';
      }
    };
    
    if (typeof window !== 'undefined') {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, []);

  const getCurrentService = () => {
    return formData.selectedServices[formData.currentServiceIndex];
  };

  const updateCurrentService = (updates: Partial<ServiceFormData>) => {
    setFormData((prev: any) => {
      const updatedServices = prev.selectedServices.map((service: any, index: number) =>
        index === prev.currentServiceIndex ? { ...service, ...updates } : service
      );
      
      // Também atualizar campos no nível principal se origem/destino forem alterados
      const mainLevelUpdates: Partial<FormData> = {};
      if (updates.origem !== undefined) {
        mainLevelUpdates.origem = updates.origem;
      }
      if (updates.destino !== undefined) {
        mainLevelUpdates.destino = updates.destino;
      }
      if (updates.dataIda !== undefined) {
        mainLevelUpdates.dataIda = updates.dataIda;
      }
      if (updates.dataVolta !== undefined) {
        mainLevelUpdates.dataVolta = updates.dataVolta;
      }
      
      return {
        ...prev,
        ...mainLevelUpdates,
        selectedServices: updatedServices
      };
    });
  };

  const addNewService = (serviceType: 'voos' | 'hoteis' | 'carros' | 'passeios' | 'seguro') => {
    const newService: ServiceFormData = {
      serviceType,
      completed: false,
      origem: null,
      destino: null,
      dataIda: '',
      dataVolta: '',
      tipoViagem: 'ida-volta',
      classeVoo: 'economica',
      adultos: 1,
      criancas: 0,
      bebes: 0,
      companhiaPreferida: '',
      horarioPreferido: 'qualquer',
      escalas: 'qualquer'
    };

    setFormData((prev: any) => ({
      ...prev,
      selectedServices: [...prev.selectedServices, newService],
      currentServiceIndex: prev.selectedServices.length
    }));

    setCurrentStep(2);
    setIsAddingService(false);
  };

  const removeService = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      selectedServices: prev.selectedServices.filter((_: any, i: number) => i !== index),
      currentServiceIndex: Math.max(0, prev.currentServiceIndex - 1)
    }));
  };

  const completeCurrentService = () => {
    updateCurrentService({ completed: true });
    
    // After completing current service, check if there are more services to process
    const currentIndex = formData.currentServiceIndex;
    const hasMoreServices = currentIndex < formData.selectedServices.length - 1;
    
    if (hasMoreServices) {
      // Move to next service in step 2
      setFormData((prev: any) => ({
        ...prev,
        currentServiceIndex: currentIndex + 1
      }));
      setCurrentStep(2); // Stay in step 2 for next service
    } else {
      // No more services to process, advance to personal information
      setCurrentStep(3);
    }
    setIsAddingService(false);
  };

  const startNewQuotation = () => {
    setFormData({
      selectedServices: [],
      currentServiceIndex: 0,
      // Dados de viagem
      origem: null,
      destino: null,
      dataIda: '',
      dataVolta: '',
      tipoViagem: 'ida-volta',
      classeVoo: 'economica',
      adultos: 1,
      criancas: 0,
      bebes: 0,
      // Preferências de voo
      companhiaPreferida: '',
      horarioPreferido: 'qualquer',
      escalas: 'qualquer',
      // Dados pessoais
      nome: '',
      sobrenome: '',
      email: '',
      telefone: '',
      whatsapp: '',
      // Additional properties
      serviceType: '',
      orcamentoAproximado: '',
      flexibilidadeDatas: false,
      observacoes: ''
    });
    setCurrentStep(1);
    setIsAddingService(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    
    // CRITICAL FIX: Only allow final form submission, prevent auto-advancement
    // Form submission should only happen from the final step (step 4)
    if (currentStep < 4) {
      console.log('🔄 [FORM DEBUG] Blocked form submission - not on final step. Current step:', currentStep);
      return; // Prevent any auto-advancement
    }
    
    setIsSubmitting(true);
    
    console.log('🚀 [FORM DEBUG] Final form submit triggered, currentStep:', currentStep);
    console.log('🚀 [FORM DEBUG] Form data:', { nome: formData.nome, email: formData.email });
    
    // EMERGENCY BLOCK: Only allow submission when ALL required fields are filled
    const hasRequiredPersonalInfo = formData.nome?.trim() && formData.email?.trim();
    const hasRequiredTravelInfo = formData.selectedServices && formData.selectedServices.length > 0;
    
    if (!hasRequiredPersonalInfo) {
      console.log('❌ [FORM DEBUG] BLOCKED: Missing personal information');
      console.log('❌ [FORM DEBUG] Nome:', formData.nome, 'Email:', formData.email);
      setIsSubmitting(false);
      alert('❌ Por favor, preencha seu Nome e Email antes de continuar.');
      return;
    }
    
    if (!hasRequiredTravelInfo) {
      console.log('❌ [FORM DEBUG] BLOCKED: Missing travel information');
      setIsSubmitting(false);
      
      // If user hasn't selected services, go back to step 1
      if (currentStep < 1) {
        setCurrentStep(1);
        return;
      }
      
      alert('❌ Por favor, selecione pelo menos um serviço.');
      return;
    }
    
    // ONLY proceed with submission if we have all required data
    console.log('🚀 [FORM DEBUG] Starting form submission...');
    
    try {
      // Get current service data
      const currentService = getCurrentService();
      console.log('📋 [FORM DEBUG] Current service:', currentService);
      
      // Convert form data to plain object
      const formDataObj = {
        // Personal information
        nome: formData.nome || '',
        sobrenome: formData.sobrenome || '',
        email: formData.email || '',
        telefone: formData.telefone || '',
        whatsapp: formData.whatsapp || '',
        
        // Travel information with fallbacks
        origem: formData.origem || currentService?.origem || 'A definir',
        destino: formData.destino || currentService?.destino || 'A definir',
        dataIda: formData.dataIda || currentService?.dataIda,
        dataVolta: formData.dataVolta || currentService?.dataVolta,
        tipoViagem: formData.tipoViagem || currentService?.tipoViagem || 'ida-volta',
        classeVoo: formData.classeVoo || 'economica',
        
        // Passengers with defaults
        adultos: formData.adultos || 1,
        criancas: formData.criancas || 0,
        bebes: formData.bebes || 0,
        
        // Preferences
        companhiaPreferida: formData.companhiaPreferida || '',
        horarioPreferido: formData.horarioPreferido || 'qualquer',
        escalas: formData.escalas || 'qualquer',
        orcamentoAproximado: formData.orcamentoAproximado || '',
        flexibilidadeDatas: formData.flexibilidadeDatas || false,
        observacoes: formData.observacoes || '',
        
        // System fields
        selectedServices: ['flight'], // Always include at least flight
        source: 'website'
      };
  // CRITICAL: Add step navigation functions to prevent form submission
  const goToNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

      console.log('📤 [FORM DEBUG] Sending data:', JSON.stringify(formDataObj, null, 2));

      // Track conversion events
      if (typeof trackFormSubmit === 'function') {
        trackFormSubmit('quote_request', formDataObj);
      }
      if (typeof trackQuoteRequest === 'function') {
        trackQuoteRequest(formDataObj);
      }

      // Send to API with enhanced error handling
      console.log('🌐 [FORM DEBUG] Making API call...');
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataObj)
      });

      console.log('📥 [FORM DEBUG] Response status:', response.status);
      
      let result;
      try {
        result = await response.json();
        console.log('📥 [FORM DEBUG] Response data:', result);
      } catch (parseError) {
        console.error('❌ [FORM DEBUG] Failed to parse response JSON:', parseError);
        throw new Error('Resposta inválida do servidor');
      }

      // CRITICAL FIX: Check for success in the result object first
      if (result.success === true) {
        console.log('✅ [FORM DEBUG] API returned success=true, treating as successful');
        
        // Success response
        console.log('Lead enviado com sucesso:', result);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 5000);
        
        // Reset form and go back to start after successful submission
        setTimeout(() => {
          setValidationErrors({});
          setTouchedFields({});
          
          const dropdown = document.getElementById('passengers-dropdown');
          if (dropdown) {
            dropdown.style.display = 'none';
          }
          
          startNewQuotation();
        }, 2000);
        
        return; // Exit successfully
      }

      // FALLBACK: Check HTTP status if success field is not true
      if (!response.ok && result.success !== true) {
        console.warn('⚠️ [FORM DEBUG] API returned error:', {
          status: response.status,
          success: result.success,
          error: result.error,
          message: result.message
        });
        
        // Log detailed error information
        if (result.metadata?.validationErrors) {
          console.error('❌ [FORM DEBUG] Validation errors:', result.metadata.validationErrors);
        }
        
        throw new Error(result.message || result.error || 'Erro na resposta do servidor');
      }

      // If we get here, something unexpected happened but we'll treat it as success
      console.log('⚠️ [FORM DEBUG] Unexpected response, but no clear error - treating as success');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 5000);
      
      setTimeout(() => {
        setValidationErrors({});
        setTouchedFields({});
        startNewQuotation();
      }, 2000);
      
    } catch (error) {
      console.error('❌ [FORM DEBUG] Form submission error:', error);
      console.error('❌ [FORM DEBUG] Error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      
      // Enhanced error handling with better user messages
      let errorMessage = '❌ Erro ao enviar formulário. Nossa equipe foi notificada.';
      
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('failed to fetch') || errorMsg.includes('network') || errorMsg.includes('connection')) {
          errorMessage = '❌ Erro de conexão. Verifique sua internet e tente novamente.';
        } else if (errorMsg.includes('timeout')) {
          errorMessage = '❌ Tempo esgotado. Tente novamente.';
        } else if (errorMsg.includes('400') || errorMsg.includes('validation') || errorMsg.includes('invalid')) {
          errorMessage = '❌ Dados inválidos. Verifique os campos e tente novamente.';
        } else if (errorMsg.includes('500') || errorMsg.includes('internal server')) {
          errorMessage = '❌ Erro interno do servidor. Nossa equipe foi notificada.';
        } else if (errorMsg.includes('dados inválidos')) {
          errorMessage = '❌ Por favor, verifique se todos os campos obrigatórios estão preenchidos.';
        }
      }
      
      // Show error to user
      alert(errorMessage + '\n\n📱 Para atendimento imediato, entre em contato via WhatsApp.');
      
      // Log for debugging but don't fail completely
      console.log('🔄 [FORM DEBUG] Form will remain open for retry');
      
    } finally {
      setIsSubmitting(false);
      console.log('🏁 [FORM DEBUG] Form submission process completed');
    }
  };

  // UI/UX Best Practice Color System (60-30-10 Rule)
  const colors = {
    // Primary (60%) - Base/Neutral
    primary: {
      white: '#FFFFFF',
      gray50: '#F9FAFB',
      gray100: '#F3F4F6',
      gray200: '#E5E7EB'
    },
    // Secondary (30%) - Supporting
    secondary: {
      gray400: '#9CA3AF',
      gray500: '#6B7280',
      gray600: '#4B5563',
      gray700: '#374151',
      gray800: '#1F2937',
      gray900: '#111827',
      blue: '#3B82F6',
      blueDark: '#1E40AF'
    },
    // Accent (10%) - Brand highlights only
    accent: {
      orange: '#FF6B35',
      orangeLight: '#FF8C42',
      yellow: '#FFB000',
      green: '#10B981'
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%)',
    position: 'relative' as const,
    overflow: 'visible' as const,
    fontFamily: 'Inter, sans-serif',
    width: '100%',
    maxWidth: '100vw',
    margin: 0,
    padding: 0
  };

  const floatingElement1Style = {
    position: 'absolute' as const,
    top: '120px',
    left: '60px',
    width: isMobileDevice ? '100px' : '200px',
    height: isMobileDevice ? '100px' : '200px',
    background: 'rgba(59, 130, 246, 0.08)', // Subtle blue
    borderRadius: '50%',
    filter: 'blur(40px)',
    animation: 'float 8s ease-in-out infinite',
    display: isMobileDevice ? 'none' : 'block'
  };

  const floatingElement2Style = {
    position: 'absolute' as const,
    top: '200px',
    right: '60px',
    width: isMobileDevice ? '75px' : '150px',
    height: isMobileDevice ? '75px' : '150px',
    background: 'rgba(255, 107, 53, 0.06)', // Very subtle orange accent
    borderRadius: '50%',
    filter: 'blur(30px)',
    animation: 'float 10s ease-in-out infinite 3s',
    display: isMobileDevice ? 'none' : 'block'
  };

  const floatingElement3Style = {
    position: 'absolute' as const,
    bottom: '100px',
    left: '50%',
    width: isMobileDevice ? '90px' : '180px',
    height: isMobileDevice ? '90px' : '180px',
    background: 'rgba(243, 244, 246, 0.8)', // Light gray
    borderRadius: '50%',
    filter: 'blur(35px)',
    animation: 'float 12s ease-in-out infinite 6s',
    display: isMobileDevice ? 'none' : 'block'
  };

  const headerStyle = {
    position: 'relative' as const,
    zIndex: 10,
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
  };

  return (
    <>
      <GlobalMobileStyles />
      <LiveSiteHeader />

      {/* Mobile Success Notification */}
      <div className={isMobileDevice && showMobileSuccess ? 'mobile-success-visible' : 'mobile-success-hidden'}>
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'linear-gradient(135deg, #10B981, #059669)',
          color: 'white',
          padding: '16px',
          borderRadius: '16px',
          maxWidth: '280px',
          width: '90vw',
          zIndex: 1002,
          textAlign: 'center',
          animation: 'bounceIn 0.6s ease-out',
          boxShadow: '0 20px 40px rgba(16, 185, 129, 0.4)',
          border: '2px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '6px' }}>🎉</div>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '700', 
            marginBottom: '4px' 
          }}>
            Ótima escolha!
          </div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>
            Mais {Math.floor(Math.random() * 15) + 5} pessoas fizeram isso hoje
          </div>
        </div>
      </div> {/* Close mobile-success div */}

      {/* Exit Intent Modal */}
      <div className={showExitIntent ? 'exit-intent-visible' : 'exit-intent-hidden'}>
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            background: colors.primary.white,
            borderRadius: '16px',
            padding: '40px',
            maxWidth: '500px',
            margin: '20px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            animation: 'slideInUp 0.4s ease-out'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>
              ✈️
            </div>
            
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: colors.secondary.gray900,
              marginBottom: '12px',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Espere! Não perca essa oportunidade
            </h3>
            
            <p style={{
              color: colors.secondary.gray600,
              marginBottom: '24px',
              fontSize: '16px',
              lineHeight: '1.5'
            }}>
              Receba um <strong>desconto exclusivo de 10%</strong> na sua próxima viagem ao Brasil + 
              nosso guia gratuito com dicas de viagem!
            </p>
            
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '20px'
            }}>
              <input
                type="email"
                placeholder="Seu melhor email"
                value={exitIntentEmail}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setExitIntentEmail(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: `2px solid ${colors.primary.gray200}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button
                onClick={() => {
                  if (exitIntentEmail) {
                    console.log('Exit intent email captured:', exitIntentEmail);
                    setShowExitIntent(false);
                  }
                }}
                style={{
                  background: colors.accent.orange,
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Quero!
              </button>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setShowExitIntent(false)}
                style={{
                  background: 'none',
                  border: `1px solid ${colors.primary.gray200}`,
                  color: colors.secondary.gray600,
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Não, obrigado
              </button>
              
              <a
                href="https://wa.me/551151944717?text=Vi a oferta especial! Gostaria de mais informações"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#25D366',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
                onClick={() => setShowExitIntent(false)}
              >
                💬 WhatsApp Direto
              </a>
            </div>
          </div>
        </div>
      </div> {/* Close exit-intent div */}

      {/* Social Proof Notification Widget */}
      <div className={showSocialProof ? 'social-proof-widget-visible' : 'social-proof-widget-hidden'}>
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          background: colors.primary.white,
          border: `2px solid ${colors.accent.orange}`,
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          maxWidth: '320px',
          animation: 'slideInLeft 0.5s ease-out',
          display: isMobileDevice ? 'none' : 'block' // Hide on mobile to avoid obstruction
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              background: colors.accent.green,
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}></div>
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: colors.secondary.gray900,
                marginBottom: '4px'
              }}>
                {socialProofNotifications[socialProofIndex].name} de {socialProofNotifications[socialProofIndex].location}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: colors.secondary.gray600 
              }}>
                Reservou {socialProofNotifications[socialProofIndex].route} • {socialProofNotifications[socialProofIndex].price}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: colors.accent.orange,
                marginTop: '2px'
              }}>
                há {socialProofNotifications[socialProofIndex].time} atrás
              </div>
            </div>
            <button 
              onClick={() => setShowSocialProof(false)}
              style={{
                background: 'none',
                border: 'none',
                color: colors.secondary.gray400,
                cursor: 'pointer',
                fontSize: '16px',
                padding: '4px'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      </div> {/* Close social-proof-widget div */}
      
      <div style={containerStyle} className="mobile-overflow-hidden">
        {/* Mobile App Experience - Always render but conditionally show */}
        <div className={isMobileDevice ? 'mobile-layout-visible' : 'mobile-layout-hidden'}>
          <MobileAppLayout>
            <div>Mobile App Content</div>
          </MobileAppLayout>
        </div>

        {/* Desktop Content - Always render but conditionally show */}
        <div className={!isMobileDevice ? 'desktop-content-visible' : 'desktop-content-hidden'}>
            {/* Floating Background Elements */}
            <div style={floatingElement1Style}></div>
            <div style={floatingElement2Style}></div>
            <div style={floatingElement3Style}></div>

        {/* Main Content - Always render to avoid hook inconsistency */}
        <main className={isMobileDevice ? 'mobile-view' : 'desktop-view'}>
        <section style={{
          position: 'relative',
          zIndex: 10,
          padding: isMobileDevice ? '40px 0 60px 0' : '60px 0 80px 0',
          width: '100%',
          maxWidth: '100vw'
        }} className="mobile-section">
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: isMobileDevice ? '0 20px' : '0 32px',
            display: 'grid',
            gridTemplateColumns: isMobileDevice ? '1fr' : '1fr 1fr',
            gap: isMobileDevice ? '40px' : '64px',
            alignItems: 'center'
          }} className="mobile-container mobile-grid-single">
            {/* Left Side - Content */}
            <div style={{
              color: colors.secondary.gray900,
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.8s ease-out, transform 0.8s ease-out'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '8px 16px',
                background: colors.primary.white,
                backdropFilter: 'blur(10px)',
                borderRadius: '50px',
                border: `1px solid ${colors.primary.gray200}`,
                marginBottom: '32px',
                marginTop: '20px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
              </div>
              <h1 style={{
                fontSize: isMobileDevice ? '24px' : '56px',
                fontWeight: '800',
                fontFamily: 'Poppins, sans-serif',
                lineHeight: '1.3',
                margin: isMobileDevice ? '0 0 16px 0' : '0 0 24px 0',
                letterSpacing: '-0.02em',
                maxWidth: '100%',
                textAlign: isMobileDevice ? 'center' : 'left',
                color: colors.secondary.gray900
              }} className="mobile-title">
                Fly2Any, sua ponte aérea entre EUA, Brasil e o Mundo!
              </h1>
              <p style={{
                fontSize: isMobileDevice ? '16px' : '20px',
                color: colors.secondary.gray600,
                lineHeight: '1.6',
                maxWidth: isMobileDevice ? '100%' : '520px',
                marginBottom: isMobileDevice ? '24px' : '40px',
                fontWeight: '400',
                textAlign: isMobileDevice ? 'center' : 'left'
              }} className="mobile-subtitle">
                Conectando americanos, brasileiros e outras nacionalidades ao Brasil e ao mundo com atendimento personalizado, preços exclusivos e 21 anos de experiência.
              </p>
              
              {/* Trust Indicators */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobileDevice ? '16px' : '32px',
                marginBottom: isMobileDevice ? '24px' : '40px',
                flexWrap: 'wrap',
                justifyContent: isMobileDevice ? 'center' : 'flex-start'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    background: colors.primary.gray50,
                    padding: '8px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.accent.green}20`
                  }}>
                    <CheckIcon style={{ width: '16px', height: '16px', color: colors.accent.green }} />
                  </div>
                  <span style={{ color: colors.secondary.gray600, fontSize: isMobileDevice ? '12px' : '14px', fontWeight: '500' }}>
                    Garantia Melhor Preço
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    background: colors.primary.gray50,
                    padding: '8px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.accent.yellow}20`
                  }}>
                    <StarIcon style={{ width: '16px', height: '16px', color: colors.accent.yellow }} />
                  </div>
                  <span style={{ color: colors.secondary.gray600, fontSize: '14px', fontWeight: '500' }}>
                    4.9/5 estrelas
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    background: 'rgba(34, 197, 94, 0.2)',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid rgba(34, 197, 94, 0.3)'
                  }}>
                    <UsersIcon style={{ width: '16px', height: '16px', color: colors.accent.green }} />
                  </div>
                  <span style={{ color: colors.secondary.gray600, fontSize: '14px', fontWeight: '500' }}>
                    +5.000 clientes
                  </span>
                </div>
              </div>
              
              {/* Quick Action Buttons */}
              <div style={{
                display: 'flex',
                gap: isMobileDevice ? '12px' : '16px',
                marginBottom: isMobileDevice ? '32px' : '40px',
                flexWrap: 'wrap',
                flexDirection: isMobileDevice ? 'column' : 'row',
                alignItems: isMobileDevice ? 'center' : 'flex-start'
              }} className="mobile-button-group">

                <button
                  type="button"
                  onClick={() => {
                    const formSection = document.querySelector('form');
                    if (formSection) {
                      formSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  style={{
                    background: colors.accent.orange,
                    color: 'white',
                    padding: isMobileDevice ? '14px 20px' : '18px 36px',
                    borderRadius: isMobileDevice ? '10px' : '12px',
                    border: 'none',
                    fontSize: isMobileDevice ? '14px' : '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    width: isMobileDevice ? '100%' : 'auto',
                    boxShadow: `0 4px 14px ${colors.accent.orange}25`,
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transform: 'scale(1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 8px 20px ${colors.accent.orange}35`;
                    e.currentTarget.style.background = colors.accent.orangeLight;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 4px 14px ${colors.accent.orange}25`;
                    e.currentTarget.style.background = colors.accent.orange;
                  }}
                >
                  <FlightIcon style={{ width: isMobileDevice ? '16px' : '20px', height: isMobileDevice ? '16px' : '20px' }} />
                  {isMobileDevice ? 'Free Quote - Save $250' : 'Save up to $250 - Free Quote'}
                </button>
                
                <a
                  href="https://wa.me/551151944717"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    padding: isMobileDevice ? '14px 20px' : '16px 32px',
                    borderRadius: isMobileDevice ? '10px' : '12px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    fontSize: isMobileDevice ? '14px' : '16px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: isMobileDevice ? '100%' : 'auto'
                  }}
                >
                  <ChatIcon style={{ width: isMobileDevice ? '16px' : '20px', height: isMobileDevice ? '16px' : '20px' }} />
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Right Side - Form */}
            <div 
              id="quote-form"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(-30px)',
                transition: 'opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s'
              }}
            >
              <div style={{
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(20px)',
                borderRadius: isMobileDevice ? '16px' : '32px',
                padding: isMobileDevice ? '20px' : '40px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                maxHeight: isMobileDevice ? '90vh' : 'auto',
                overflowY: isMobileDevice ? 'auto' : 'visible',
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch',
                position: 'relative' as const,
                width: '100%',
                maxWidth: isMobileDevice ? 'none' : '100%'
              }}>
                {/* Mobile Progress Indicator - Sticky */}
                <div className={isMobileDevice && currentStep > 1 ? 'mobile-progress-visible' : 'mobile-progress-hidden'}>
                  <div style={{
                    position: 'fixed',
                    top: '70px',
                    left: '0',
                    right: '0',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    padding: '12px 20px',
                    borderBottom: '1px solid rgba(255, 107, 53, 0.2)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    animation: 'mobileSlideUp 0.3s ease-out'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        fontSize: '20px',
                        animation: 'pulse 2s infinite'
                      }}>🚀</span>
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: colors.secondary.gray700 
                      }}>
                        Cotação em andamento
                      </span>
                    </div>
                    <div style={{
                      background: colors.accent.orange,
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {Math.round((currentStep / 4) * 100)}%
                    </div>
                  </div>
                </div> {/* Close mobile-progress div */}

                {/* Form Header with Badge */}
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: isMobileDevice ? '20px' : '40px',
                  background: 'linear-gradient(135deg, #059669, #10b981)',
                  color: 'white',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  ✨ GRATUITO
                </div>
                
                <div style={{
                  background: 'linear-gradient(135deg, #FFE4B5, #FFF8DC)',
                  border: `1px solid ${colors.accent.yellow}`,
                  borderRadius: '8px',
                  padding: '8px 12px',
                  marginBottom: '16px',
                  textAlign: 'center'
                }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: colors.accent.orange,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    🏆 21 ANOS DE EXPERIÊNCIA: Especialistas em viagens EUA-Brasil
                  </span>
                </div>
                
                <h3 style={{
                  fontSize: '26px',
                  fontWeight: '800',
                  color: colors.secondary.gray900,
                  fontFamily: 'Poppins, sans-serif',
                  margin: '0 0 8px 0',
                  letterSpacing: '-0.02em',
                  lineHeight: '1.2'
                }}>
                  Sua Cotação em até 2 horas, menor preço garantido!
                </h3>
                <p style={{
                  color: colors.secondary.gray600,
                  margin: '0 0 24px 0',
                  fontSize: '16px',
                  lineHeight: '1.5'
                }}>
                  Preencha os dados e receba as <strong>melhores ofertas</strong> do mercado com preço imbatível
                </p>

                {/* Progress Bar */}
                <div style={{
                  marginBottom: '24px',
                  padding: '16px',
                  background: colors.primary.gray50,
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: colors.secondary.gray600
                    }}>
                      Progresso da Cotação
                    </span>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: colors.secondary.blue
                    }}>
                      {Math.round(getProgressPercentage())}%
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: colors.primary.gray200,
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${getProgressPercentage()}%`,
                      height: '100%',
                      background: colors.accent.orange,
                      borderRadius: '4px',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '8px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: currentStep >= 1 ? '#10b981' : colors.primary.gray200
                      }}></div>
                      <span style={{
                        fontSize: '12px',
                        color: currentStep >= 1 ? colors.accent.green : '#6b7280'
                      }}>
                        Serviços
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: currentStep >= 2 ? '#10b981' : colors.primary.gray200
                      }}></div>
                      <span style={{
                        fontSize: '12px',
                        color: currentStep >= 2 ? colors.accent.green : '#6b7280'
                      }}>
                        Detalhes
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: currentStep >= 3 ? '#10b981' : colors.primary.gray200
                      }}></div>
                      <span style={{
                        fontSize: '12px',
                        color: currentStep >= 3 ? colors.accent.green : '#6b7280'
                      }}>
                        Contato
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mobile: Add a button to test premium form manually */}
                <div className={isMobileDevice ? 'mobile-test-button-visible' : 'mobile-test-button-hidden'}>
                  <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <h2 style={{ color: 'red', fontSize: '20px', marginBottom: '20px' }}>MOBILE DETECTED</h2>
                    <button
                      type="button"
                      onClick={() => {
                        console.log('🚀 Opening premium form manually');
                        setShowLeadCapture(true);
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        padding: '20px 40px',
                        borderRadius: '12px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        border: 'none',
                        cursor: 'pointer',
                        width: '90%',
                        maxWidth: '400px'
                      }}
                    >
                      🚀 ABRIR APP PREMIUM 🚀
                    </button>
                    <p style={{ marginTop: '12px', color: 'green', fontSize: '14px' }}>
                      Premium App Form Status: {showLeadCapture ? 'OPEN' : 'CLOSED'}
                    </p>
                  </div>
                </div> {/* Close mobile-test-button div */}
                {/* Desktop: Keep the original form below */}

                <form onSubmit={handleSubmit} className={isMobileDevice ? 'mobile-form-hidden' : 'desktop-form-visible'} style={{ 
                  border: isMobileDevice ? 'none' : '2px solid green',
                  padding: isMobileDevice ? '0' : '20px',
                  borderRadius: '8px'
                }}>
                  {/* Step 1: Quotation Mode & Service Selection */}
                  {currentStep === 1 && (
                    <div>

                      {/* Service Selection */}
                      <div>
                          <label style={{ fontWeight: 600, marginBottom: '16px', display: 'block', color: colors.secondary.gray800 }}>
                            {isAddingService 
                              ? 'Selecione outro serviço para adicionar:' 
                              : 'Selecione os serviços desejados:'
                            }
                          </label>
                          
                          {/* Selected Services Display */}
                          {formData.selectedServices.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                              <div style={{ fontSize: '14px', fontWeight: 600, color: colors.secondary.gray700, marginBottom: '8px' }}>
                                Serviços Selecionados ({formData.selectedServices.length})
                              </div>
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {formData.selectedServices.map((service, index) => (
                                  <div key={index} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: service.completed ? '#dcfce7' : '#dbeafe',
                                    border: service.completed ? '1px solid #bbf7d0' : '1px solid #bfdbfe',
                                    borderRadius: '8px',
                                    padding: '6px 8px',
                                    fontSize: '14px'
                                  }}>
                                    <span>
                                      {service.serviceType === 'voos' && '✈️'}
                                      {service.serviceType === 'hoteis' && '🏨'}
                                      {service.serviceType === 'carros' && '🚗'}
                                      {service.serviceType === 'passeios' && '🎯'}
                                      {service.serviceType === 'seguro' && '🛡️'}
                                    </span>
                                    <span style={{ fontWeight: 500, color: colors.secondary.gray700 }}>
                                      {service.serviceType.charAt(0).toUpperCase() + service.serviceType.slice(1)}
                                    </span>
                                    {service.completed && (
                                      <CheckIcon style={{ width: '14px', height: '14px', color: colors.accent.green }} />
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => removeService(index)}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        color: colors.secondary.gray600,
                                        fontSize: '16px'
                                      }}
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Available Services */}
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: isMobileDevice ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', 
                            gap: isMobileDevice ? '12px' : '8px', 
                            marginTop: '16px' 
                          }}>
                            {(['voos', 'hoteis', 'carros', 'passeios', 'seguro'] as const).map(serviceType => {
                              const isSelected = formData.selectedServices.some(s => s.serviceType === serviceType);
                              const isMaxServices = formData.selectedServices.length >= 5;
                              
                              return (
                                <button 
                                  key={serviceType}
                                  type="button" 
                                  onClick={() => {
                                    addNewService(serviceType);
                                    
                                    // Mobile interaction tracking and feedback
                                    if (isMobileDevice) {
                                      setMobileInteractionCount((prev: any) => prev + 1);
                                      setShowMobileSuccess(true);
                                      setTimeout(() => setShowMobileSuccess(false), 1500);
                                      
                                      // Track mobile engagement
                                      if (typeof window !== 'undefined' && window.gtag) {
                                        window.gtag('event', 'mobile_service_selection', {
                                          event_category: 'engagement',
                                          event_label: serviceType,
                                          value: mobileInteractionCount + 1
                                        });
                                      }
                                    }
                                  }} 
                                  disabled={isSelected || (isMaxServices && !isSelected)}
                                  style={{ 
                                    padding: isMobileDevice ? '12px 16px' : '16px 20px', 
                                    borderRadius: isMobileDevice ? '8px' : '12px', 
                                    border: isSelected ? `2px solid ${colors.accent.orange}` : `1px solid ${colors.primary.gray200}`, 
                                    background: isSelected ? `${colors.accent.orange}05` : colors.primary.white, 
                                    cursor: isSelected || isMaxServices ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: isMobileDevice ? '6px' : '8px',
                                    opacity: isSelected || isMaxServices ? 0.7 : 1,
                                    position: 'relative',
                                    fontSize: isMobileDevice ? '12px' : '14px',
                                    fontWeight: '600',
                                    transition: 'all 0.2s ease',
                                    transform: 'scale(1)',
                                    boxShadow: isSelected ? `0 4px 12px ${colors.accent.orange}15` : '0 1px 3px rgba(0, 0, 0, 0.1)',
                                    color: colors.secondary.gray800,
                                    width: '100%',
                                    minHeight: isMobileDevice ? '44px' : 'auto'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isSelected && !isMaxServices) {
                                      e.currentTarget.style.transform = 'translateY(-2px)';
                                      e.currentTarget.style.boxShadow = `0 4px 12px rgba(0, 0, 0, 0.15)`;
                                      e.currentTarget.style.borderColor = colors.secondary.blue;
                                      e.currentTarget.style.background = colors.primary.gray50;
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isSelected && !isMaxServices) {
                                      e.currentTarget.style.transform = 'translateY(0)';
                                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                                      e.currentTarget.style.borderColor = colors.primary.gray200;
                                      e.currentTarget.style.background = colors.primary.white;
                                    }
                                  }}
                                >
                                  {serviceType === 'voos' && (
                                    <>
                                      <FlightIcon style={{ width: '18px', height: '18px' }} /> 
                                      Voos
                                      <span style={{
                                        position: 'absolute',
                                        top: '-6px',
                                        right: '-6px',
                                        background: colors.accent.orange,
                                        color: 'white',
                                        fontSize: '9px',
                                        padding: '2px 6px',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        boxShadow: `0 2px 4px ${colors.accent.orange}40`
                                      }}>
                                        Popular
                                      </span>
                                    </>
                                  )}
                                  {serviceType === 'hoteis' && (
                                    <>
                                      <HotelIcon style={{ width: '18px', height: '18px' }} /> Hotéis
                                    </>
                                  )}
                                  {serviceType === 'carros' && (
                                    <>
                                      <CarIcon style={{ width: '18px', height: '18px' }} /> Carros
                                    </>
                                  )}
                                  {serviceType === 'passeios' && (
                                    <>
                                      <TourIcon style={{ width: '18px', height: '18px' }} /> Passeios
                                    </>
                                  )}
                                  {serviceType === 'seguro' && (
                                    <>
                                      <InsuranceIcon style={{ width: '18px', height: '18px' }} /> Seguro
                                    </>
                                  )}
                                  {isSelected && <CheckIcon style={{ width: '14px', height: '14px', color: colors.accent.green }} />}
                                </button>
                              );
                            })}
                          </div>

                          {/* Continue/Finish Buttons */}
                          {formData.selectedServices.length > 0 && !isAddingService && (
                            <div style={{ marginTop: '24px' }}>
                              <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Show service selection again for adding another service
                                    setIsAddingService(true);
                                  }}
                                  style={{
                                    flex: 1,
                                    background: colors.accent.orange,
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 20px',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                  }}
                                >
                                  + Adicionar Outro Serviço
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCurrentStep(2)}
                                  style={{
                                    flex: 1,
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 20px',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                  }}
                                >
                                  ✓ Finalizar ({formData.selectedServices.length} serviço{formData.selectedServices.length > 1 ? 's' : ''})
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                    </div>
                  )}

                  {/* Step 2: Service Details */}
                  {currentStep === 2 && getCurrentService() && (
                    <div>
                      {/* Current Service Header */}
                      <div style={{
                        background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '24px',
                        border: '1px solid #0ea5e9',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <span style={{ fontSize: '28px' }}>
                          {getCurrentService()?.serviceType === 'voos' && '✈️'}
                          {getCurrentService()?.serviceType === 'hoteis' && '🏨'}
                          {getCurrentService()?.serviceType === 'carros' && '🚗'}
                          {getCurrentService()?.serviceType === 'passeios' && '🎯'}
                          {getCurrentService()?.serviceType === 'seguro' && '🛡️'}
                        </span>
                        <div>
                          <h3 style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: '#0369a1',
                            margin: '0 0 4px 0'
                          }}>
                            Configurando: {
                              getCurrentService()?.serviceType === 'voos' ? 'Voos' :
                              getCurrentService()?.serviceType === 'hoteis' ? 'Hotéis' :
                              getCurrentService()?.serviceType === 'carros' ? 'Carros' :
                              getCurrentService()?.serviceType === 'passeios' ? 'Passeios' :
                              'Seguro Viagem'
                            }
                          </h3>
                          <p style={{
                            fontSize: '12px',
                            color: '#64748b',
                            margin: 0
                          }}>
                            Serviço {formData.currentServiceIndex + 1} de {formData.selectedServices.length}
                          </p>
                        </div>
                      </div>
                      
                      {/* Service-specific forms */}
                      {getCurrentService()?.serviceType === 'voos' && (
                        <>
                          {/* Origem e Destino - Mobile Responsive */}
                          <div style={{ 
                            display: 'flex', 
                            flexDirection: isMobileDevice ? 'column' : 'row',
                            gap: isMobileDevice ? '16px' : '12px', 
                            marginBottom: '16px' 
                          }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 500 }}>
                                <LocationIcon style={{ width: '14px', height: '14px', color: colors.secondary.gray600 }} />
                                Origem
                              </label>
                              <AirportAutocomplete
                                value={getCurrentService()?.origem || { iataCode: '', name: '', city: '', country: '' }}
                                onChange={(airport) => updateCurrentService({ origem: airport })}
                                placeholder="Aeroporto de origem"
                                className="w-full"
                                inputClassName="prevent-form-submit"
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 500 }}>
                                <LocationIcon style={{ width: '14px', height: '14px', color: colors.secondary.gray600 }} />
                                Destino
                              </label>
                              <AirportAutocomplete
                                value={getCurrentService()?.destino || { iataCode: '', name: '', city: '', country: '' }}
                                onChange={(airport) => updateCurrentService({ destino: airport })}
                                placeholder="Aeroporto de destino"
                                className="w-full"
                                inputClassName="prevent-form-submit"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {getCurrentService()?.serviceType === 'hoteis' && (
                        <>
                          {/* Destino */}
                          <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 500 }}>
                              <LocationIcon style={{ width: '14px', height: '14px', color: colors.secondary.gray600 }} />
                              Destino
                            </label>
                            <CityAutocomplete
                              value={
                                (() => {
                                  const destino = getCurrentService()?.destino;
                                  if (!destino) return '';
                                  if (typeof destino === 'string') return destino;
                                  return destino.city || '';
                                })()
                              }
                              onChange={(value: any) => updateCurrentService({ destino: value })}
                              cities={cities}
                              placeholder="Cidade do hotel"
                              label=""
                              iconColor="#3b82f6"
                            />
                          </div>
                          
                          {/* Check-in e Check-out - Mobile Responsive */}
                          <div style={{ 
                            display: 'flex', 
                            flexDirection: isMobileDevice ? 'column' : 'row',
                            gap: isMobileDevice ? '16px' : '12px', 
                            marginBottom: '16px' 
                          }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 500 }}>
                                <CalendarIcon style={{ width: '14px', height: '14px', color: colors.secondary.gray600 }} />
                                Check-in
                              </label>
                              <DatePicker
                                value={getCurrentService()?.checkin || ''}
                                onChange={value => updateCurrentService({ checkin: value })}
                                placeholder="Data de entrada"
                                label=""
                                iconColor="#3b82f6"
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 500 }}>
                                <CalendarIcon style={{ width: '14px', height: '14px', color: colors.secondary.gray600 }} />
                                Check-out
                              </label>
                              <DatePicker
                                value={getCurrentService()?.checkout || ''}
                                onChange={value => updateCurrentService({ checkout: value })}
                                placeholder="Data de saída"
                                label=""
                                iconColor="#3b82f6"
                              />
                            </div>
                          </div>
                          
                          {/* Quartos e Categoria */}
                          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 500 }}>
                                <BedIcon style={{ width: '14px', height: '14px', color: colors.secondary.gray600 }} />
                                Quartos
                              </label>
                              <select
                                value={getCurrentService()?.quartos || 1}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => updateCurrentService({ quartos: parseInt(e.target.value) })}
                                style={{
                                  width: '100%',
                                  padding: '10px 12px',
                                  border: '2px solid #e5e7eb',
                                  borderRadius: '8px',
                                  background: '#ffffff',
                                  fontSize: '14px',
                                  cursor: 'pointer',
                                  fontWeight: '500',
                                  transition: 'all 0.2s ease',
                                  outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                              >
                                {[1,2,3,4,5].map(num => (
                                  <option key={num} value={num}>{num} Quarto{num > 1 ? 's' : ''}</option>
                                ))}
                              </select>
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 500 }}>
                                <StarIcon style={{ width: '14px', height: '14px', color: colors.secondary.gray600 }} />
                                Categoria
                              </label>
                              <select
                                value={getCurrentService()?.categoriaHotel || 'qualquer'}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => updateCurrentService({ categoriaHotel: e.target.value })}
                                style={{
                                  width: '100%',
                                  padding: '10px 12px',
                                  border: '2px solid #e5e7eb',
                                  borderRadius: '8px',
                                  background: '#ffffff',
                                  fontSize: '14px',
                                  cursor: 'pointer',
                                  fontWeight: '500',
                                  transition: 'all 0.2s ease',
                                  outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                              >
                                <option value="qualquer">Qualquer</option>
                                <option value="economico">Econômico</option>
                                <option value="conforto">Conforto</option>
                                <option value="luxo">Luxo</option>
                              </select>
                            </div>
                          </div>
                        </>
                      )}

                      {getCurrentService()?.serviceType === 'carros' && (
                        <>
                          {/* Local de Retirada e Entrega */}
                          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Local de Retirada</label>
                              <CityAutocomplete
                                value={getCurrentService()?.localRetirada || ''}
                                onChange={(value: any) => updateCurrentService({ localRetirada: value })}
                                cities={cities}
                                placeholder="Onde retirar o carro"
                                label=""
                                iconColor="#3b82f6"
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Local de Entrega</label>
                              <CityAutocomplete
                                value={
                                  (() => {
                                    const destino = getCurrentService()?.destino;
                                    if (!destino) return '';
                                    if (typeof destino === 'string') return destino;
                                    return destino.city || '';
                                  })()
                                }
                                onChange={(value: any) => updateCurrentService({ destino: value })}
                                cities={cities}
                                placeholder="Onde entregar o carro"
                                label=""
                                iconColor="#3b82f6"
                              />
                            </div>
                          </div>
                          
                          {/* Data e Hora de Retirada */}
                          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Data de Retirada</label>
                              <DatePicker
                                value={getCurrentService()?.dataRetirada || ''}
                                onChange={value => updateCurrentService({ dataRetirada: value })}
                                placeholder="Data de retirada"
                                label=""
                                iconColor="#3b82f6"
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Hora de Retirada</label>
                              <select
                                value={getCurrentService()?.horaRetirada || '10:00'}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => updateCurrentService({ horaRetirada: e.target.value })}
                                style={{
                                  width: '100%',
                                  padding: '10px 12px',
                                  border: '2px solid #e5e7eb',
                                  borderRadius: '8px',
                                  background: '#ffffff',
                                  fontSize: '14px',
                                  cursor: 'pointer',
                                  fontWeight: '500',
                                  transition: 'all 0.2s ease',
                                  outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                              >
                                {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map(hora => (
                                  <option key={hora} value={hora}>{hora}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          {/* Data e Hora de Entrega */}
                          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Data de Entrega</label>
                              <DatePicker
                                value={getCurrentService()?.dataEntrega || ''}
                                onChange={value => updateCurrentService({ dataEntrega: value })}
                                placeholder="Data de entrega"
                                label=""
                                iconColor="#3b82f6"
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Hora de Entrega</label>
                              <select
                                value={getCurrentService()?.horaEntrega || '10:00'}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => updateCurrentService({ horaEntrega: e.target.value })}
                                style={{
                                  width: '100%',
                                  padding: '10px 12px',
                                  border: '2px solid #e5e7eb',
                                  borderRadius: '8px',
                                  background: '#ffffff',
                                  fontSize: '14px',
                                  cursor: 'pointer',
                                  fontWeight: '500',
                                  transition: 'all 0.2s ease',
                                  outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                              >
                                {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map(hora => (
                                  <option key={hora} value={hora}>{hora}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          {/* Categoria do Veículo */}
                          <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Categoria do Veículo</label>
                            <select
                              value={getCurrentService()?.categoriaVeiculo || 'economico'}
                              onChange={(e: ChangeEvent<HTMLSelectElement>) => updateCurrentService({ categoriaVeiculo: e.target.value })}
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '8px',
                                background: '#ffffff',
                                fontSize: '14px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                transition: 'all 0.2s ease',
                                outline: 'none'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            >
                              <option value="economico">Econômico</option>
                              <option value="compacto">Compacto</option>
                              <option value="intermediario">Intermediário</option>
                              <option value="executivo">Executivo</option>
                              <option value="suv">SUV</option>
                              <option value="minivan">Minivan</option>
                            </select>
                          </div>
                        </>
                      )}

                      {getCurrentService()?.serviceType === 'passeios' && (
                        <>
                          {/* Destino */}
                          <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Destino</label>
                            <CityAutocomplete
                              value={
                                (() => {
                                  const destino = getCurrentService()?.destino;
                                  if (!destino) return '';
                                  if (typeof destino === 'string') return destino;
                                  return destino.city || '';
                                })()
                              }
                              onChange={(value: any) => updateCurrentService({ destino: value })}
                              cities={cities}
                              placeholder="Cidade dos passeios"
                              label=""
                              iconColor="#3b82f6"
                            />
                          </div>
                          
                          {/* Data do Passeio */}
                          <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Data do Passeio</label>
                            <DatePicker
                              value={getCurrentService()?.dataIda || ''}
                              onChange={value => updateCurrentService({ dataIda: value })}
                              placeholder="Data do passeio"
                              label=""
                              iconColor="#3b82f6"
                            />
                          </div>
                          
                          {/* Tipo de Passeio e Duração */}
                          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Tipo de Passeio</label>
                              <select
                                value={getCurrentService()?.tipoPasseio || 'city-tour'}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => updateCurrentService({ tipoPasseio: e.target.value })}
                                style={{
                                  width: '100%',
                                  padding: '10px 12px',
                                  border: '2px solid #e5e7eb',
                                  borderRadius: '8px',
                                  background: '#ffffff',
                                  fontSize: '14px',
                                  cursor: 'pointer',
                                  fontWeight: '500',
                                  transition: 'all 0.2s ease',
                                  outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                              >
                                <option value="city-tour">City Tour</option>
                                <option value="aventura">Aventura</option>
                                <option value="cultural">Cultural</option>
                                <option value="gastronomico">Gastronômico</option>
                                <option value="natureza">Natureza</option>
                                <option value="historico">Histórico</option>
                              </select>
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Duração</label>
                              <select
                                value={getCurrentService()?.duracao || 'meio-dia'}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => updateCurrentService({ duracao: e.target.value })}
                                style={{
                                  width: '100%',
                                  padding: '10px 12px',
                                  border: '2px solid #e5e7eb',
                                  borderRadius: '8px',
                                  background: '#ffffff',
                                  fontSize: '14px',
                                  cursor: 'pointer',
                                  fontWeight: '500',
                                  transition: 'all 0.2s ease',
                                  outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                              >
                                <option value="2-4-horas">2-4 horas</option>
                                <option value="meio-dia">Meio dia</option>
                                <option value="dia-inteiro">Dia inteiro</option>
                                <option value="2-dias">2 dias</option>
                                <option value="3-dias">3 dias</option>
                                <option value="semana">1 semana</option>
                              </select>
                            </div>
                          </div>
                        </>
                      )}

                      {getCurrentService()?.serviceType === 'seguro' && (
                        <>
                          {/* Destino */}
                          <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Destino da Viagem</label>
                            <CityAutocomplete
                              value={
                                (() => {
                                  const destino = getCurrentService()?.destino;
                                  if (!destino) return '';
                                  if (typeof destino === 'string') return destino;
                                  return destino.city || '';
                                })()
                              }
                              onChange={(value: any) => updateCurrentService({ destino: value })}
                              cities={cities}
                              placeholder="Para onde está viajando"
                              label=""
                              iconColor="#3b82f6"
                            />
                          </div>
                          
                          {/* Datas da Viagem */}
                          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Data de Início</label>
                              <DatePicker
                                value={getCurrentService()?.dataIda || ''}
                                onChange={value => updateCurrentService({ dataIda: value })}
                                placeholder="Início da viagem"
                                label=""
                                iconColor="#3b82f6"
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Data de Fim</label>
                              <DatePicker
                                value={getCurrentService()?.dataVolta || ''}
                                onChange={value => updateCurrentService({ dataVolta: value })}
                                placeholder="Fim da viagem"
                                label=""
                                iconColor="#3b82f6"
                              />
                            </div>
                          </div>
                          
                          {/* Tipo de Seguro e Cobertura */}
                          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Tipo de Seguro</label>
                              <select
                                value={getCurrentService()?.tipoSeguro || 'basico'}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => updateCurrentService({ tipoSeguro: e.target.value })}
                                style={{
                                  width: '100%',
                                  padding: '10px 12px',
                                  border: '2px solid #e5e7eb',
                                  borderRadius: '8px',
                                  background: '#ffffff',
                                  fontSize: '14px',
                                  cursor: 'pointer',
                                  fontWeight: '500',
                                  transition: 'all 0.2s ease',
                                  outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                              >
                                <option value="basico">Básico</option>
                                <option value="completo">Completo</option>
                                <option value="premium">Premium</option>
                                <option value="familia">Família</option>
                              </select>
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Cobertura</label>
                              <select
                                value={getCurrentService()?.cobertura || 'USD30000'}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => updateCurrentService({ cobertura: e.target.value })}
                                style={{
                                  width: '100%',
                                  padding: '10px 12px',
                                  border: '2px solid #e5e7eb',
                                  borderRadius: '8px',
                                  background: '#ffffff',
                                  fontSize: '14px',
                                  cursor: 'pointer',
                                  fontWeight: '500',
                                  transition: 'all 0.2s ease',
                                  outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                              >
                                <option value="USD30000">USD 30.000</option>
                                <option value="USD60000">USD 60.000</option>
                                <option value="USD100000">USD 100.000</option>
                                <option value="USD250000">USD 250.000</option>
                              </select>
                            </div>
                          </div>
                          
                          {/* Idade do Viajante */}
                          <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Idade do Viajante Mais Velho</label>
                            <select
                              value={getCurrentService()?.idadeViajante || '18-64'}
                              onChange={(e: ChangeEvent<HTMLSelectElement>) => updateCurrentService({ idadeViajante: e.target.value })}
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '8px',
                                background: '#ffffff',
                                fontSize: '14px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                transition: 'all 0.2s ease',
                                outline: 'none'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            >
                              <option value="0-17">0-17 anos</option>
                              <option value="18-64">18-64 anos</option>
                              <option value="65-74">65-74 anos</option>
                              <option value="75+">75+ anos</option>
                            </select>
                          </div>
                        </>
                      )}

                      {/* Service-specific options */}
                      {getCurrentService()?.serviceType === 'voos' && (
                        <>
                          {/* Tipo de Viagem, Passageiros e Classe na mesma linha */}
                          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Tipo de Viagem</label>
                          <select
                            value={getCurrentService()?.tipoViagem || 'ida-volta'}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => updateCurrentService({ tipoViagem: e.target.value as 'ida-volta' | 'somente-ida' | 'multiplas-cidades' })}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              border: '2px solid #e5e7eb',
                              borderRadius: '8px',
                              background: '#ffffff',
                              fontSize: '14px',
                              cursor: 'pointer',
                              fontWeight: '500',
                              transition: 'all 0.2s ease',
                              outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                          >
                            <option value="ida-volta">Ida e Volta</option>
                            <option value="somente-ida">Somente Ida</option>
                            <option value="multiplas-cidades">Multi-City</option>
                          </select>
                        </div>
                        
                        <div style={{ flex: 1, position: 'relative' }}>
                          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Passageiros</label>
                          <div
                            data-passengers-trigger
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              border: '2px solid #e5e7eb',
                              borderRadius: '8px',
                              background: '#ffffff',
                              fontSize: '14px',
                              cursor: 'pointer',
                              fontWeight: '500',
                              transition: 'all 0.2s ease',
                              outline: 'none',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                            onClick={() => {
                              const dropdown = document.getElementById('passengers-dropdown');
                              if (dropdown) {
                                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                              }
                            }}
                            onFocus={() => {
                              const element = document.querySelector('[data-passengers-trigger]') as HTMLElement;
                              if (element) element.style.borderColor = '#3b82f6';
                            }}
                            onBlur={() => {
                              const element = document.querySelector('[data-passengers-trigger]') as HTMLElement;
                              if (element) element.style.borderColor = '#e5e7eb';
                            }}
                          >
                            <span>
                              {getCurrentService()?.adultos || 1} Adulto{(getCurrentService()?.adultos || 1) > 1 ? 's' : ''}
                              {(getCurrentService()?.criancas || 0) > 0 && `, ${getCurrentService()?.criancas} Criança${getCurrentService()?.criancas > 1 ? 's' : ''}`}
                              {(getCurrentService()?.bebes || 0) > 0 && `, ${getCurrentService()?.bebes} Bebê${getCurrentService()?.bebes > 1 ? 's' : ''}`}
                            </span>
                            <span style={{ fontSize: '12px', color: colors.secondary.gray600 }}>▼</span>
                          </div>
                          
                          {/* Dropdown Panel */}
                          <div
                            id="passengers-dropdown"
                            style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              right: 0,
                              background: '#ffffff',
                              border: '2px solid #e5e7eb',
                              borderTop: 'none',
                              borderRadius: '0 0 8px 8px',
                              padding: '12px',
                              display: 'none',
                              zIndex: 1000,
                              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                            }}
                          >
                            {/* Adultos */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                              <span style={{ fontWeight: '500', color: colors.secondary.gray700 }}>Adultos</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                  type="button"
                                  onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    const current = getCurrentService();
                                    if (current && current.adultos > 1) {
                                      updateCurrentService({ adultos: current.adultos - 1 });
                                    }
                                  }}
                                  style={{
                                    width: '24px', height: '24px', borderRadius: '4px',
                                    border: '1px solid #d1d5db', background: colors.primary.gray50,
                                    cursor: 'pointer', fontSize: '14px', fontWeight: 'bold',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = colors.primary.gray50}
                                >
                                  −
                                </button>
                                <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: '600', fontSize: '16px' }}>
                                  {getCurrentService()?.adultos || 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    const current = getCurrentService();
                                    if (current && current.adultos < 9) {
                                      updateCurrentService({ adultos: current.adultos + 1 });
                                    }
                                  }}
                                  style={{
                                    width: '24px', height: '24px', borderRadius: '4px',
                                    border: '1px solid #d1d5db', background: colors.primary.gray50,
                                    cursor: 'pointer', fontSize: '14px', fontWeight: 'bold',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = colors.primary.gray50}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            
                            {/* Crianças */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                              <span style={{ fontWeight: '500', color: colors.secondary.gray700 }}>Crianças <span style={{ fontSize: '12px', color: colors.secondary.gray600 }}>(2-11 anos)</span></span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                  type="button"
                                  onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    const current = getCurrentService();
                                    if (current && current.criancas > 0) {
                                      updateCurrentService({ criancas: current.criancas - 1 });
                                    }
                                  }}
                                  style={{
                                    width: '24px', height: '24px', borderRadius: '4px',
                                    border: '1px solid #d1d5db', background: colors.primary.gray50,
                                    cursor: 'pointer', fontSize: '14px', fontWeight: 'bold',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = colors.primary.gray50}
                                >
                                  −
                                </button>
                                <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: '600', fontSize: '16px' }}>
                                  {getCurrentService()?.criancas || 0}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    const current = getCurrentService();
                                    if (current && current.criancas < 8) {
                                      updateCurrentService({ criancas: current.criancas + 1 });
                                    }
                                  }}
                                  style={{
                                    width: '24px', height: '24px', borderRadius: '4px',
                                    border: '1px solid #d1d5db', background: colors.primary.gray50,
                                    cursor: 'pointer', fontSize: '14px', fontWeight: 'bold',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = colors.primary.gray50}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            
                            {/* Bebês */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: '500', color: colors.secondary.gray700 }}>Bebês <span style={{ fontSize: '12px', color: colors.secondary.gray600 }}>(até 2 anos)</span></span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                  type="button"
                                  onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    const current = getCurrentService();
                                    if (current && current.bebes > 0) {
                                      updateCurrentService({ bebes: current.bebes - 1 });
                                    }
                                  }}
                                  style={{
                                    width: '24px', height: '24px', borderRadius: '4px',
                                    border: '1px solid #d1d5db', background: colors.primary.gray50,
                                    cursor: 'pointer', fontSize: '14px', fontWeight: 'bold',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = colors.primary.gray50}
                                >
                                  −
                                </button>
                                <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: '600', fontSize: '16px' }}>
                                  {getCurrentService()?.bebes || 0}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    const current = getCurrentService();
                                    if (current && current.bebes < 4) {
                                      updateCurrentService({ bebes: current.bebes + 1 });
                                    }
                                  }}
                                  style={{
                                    width: '24px', height: '24px', borderRadius: '4px',
                                    border: '1px solid #d1d5db', background: colors.primary.gray50,
                                    cursor: 'pointer', fontSize: '14px', fontWeight: 'bold',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = colors.primary.gray50}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Classe</label>
                          <select
                            value={getCurrentService()?.classeVoo || 'economica'}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => updateCurrentService({ classeVoo: e.target.value as 'economica' | 'premium' | 'executiva' | 'primeira' })}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              border: '2px solid #e5e7eb',
                              borderRadius: '8px',
                              background: '#ffffff',
                              fontSize: '14px',
                              cursor: 'pointer',
                              fontWeight: '500',
                              transition: 'all 0.2s ease',
                              outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                          >
                            <option value="economica">Econômica</option>
                            <option value="premium">Premium Economy</option>
                            <option value="executiva">Executiva</option>
                            <option value="primeira">Primeira Classe</option>
                          </select>
                        </div>
                      </div>

                      {/* Datas */}
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Data de Ida</label>
                          <DatePicker
                            value={getCurrentService()?.dataIda || ''}
                            onChange={value => updateCurrentService({ dataIda: value })}
                            placeholder="Selecione a data"
                            label=""
                            iconColor="#3b82f6"
                          />
                        </div>
                        {getCurrentService()?.tipoViagem === 'ida-volta' && (
                          <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Data de Volta</label>
                            <DatePicker
                              value={getCurrentService()?.dataVolta || ''}
                              onChange={value => updateCurrentService({ dataVolta: value })}
                              placeholder="Selecione a data"
                              label=""
                              iconColor="#3b82f6"
                            />
                          </div>
                        )}
                      </div>
                        </>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                        <button type="button" onClick={() => setCurrentStep(1)} style={{ 
                          padding: '8px 16px',
                          background: '#f3f4f6',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}>
                          Voltar
                        </button>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {formData.selectedServices.length > 0 && (
                            <button 
                              type="button" 
                              onClick={() => {
                                setCurrentStep(1);
                                setIsAddingService(true);
                              }} 
                              style={{ 
                                padding: '8px 16px',
                                background: '#f3f4f6',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px'
                              }}
                            >
                              + Adicionar Serviço
                            </button>
                          )}
                          
                          <button type="button" onClick={completeCurrentService} style={{ 
                            padding: '8px 16px',
                            background: colors.accent.green,
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                          }}>
                            {formData.currentServiceIndex < formData.selectedServices.length - 1 
                              ? 'Próximo Serviço' 
                              : 'Continuar'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Personal Information */}
                  {currentStep === 3 && (
                    <div>
                      <h4 style={{ margin: '0 0 16px 0', color: colors.secondary.gray800 }}>Seus Dados</h4>
                      
                      {/* Services Summary */}
                      {formData.selectedServices.length > 0 && (
                        <div style={{
                          background: colors.primary.gray50,
                          borderRadius: '12px',
                          padding: '16px',
                          marginBottom: '24px',
                          border: '1px solid #e2e8f0'
                        }}>
                          <h5 style={{ 
                            margin: '0 0 12px 0', 
                            color: colors.secondary.gray700, 
                            fontSize: '14px', 
                            fontWeight: '600' 
                          }}>
                            Resumo dos Serviços ({formData.selectedServices.length})
                          </h5>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {formData.selectedServices.map((service, index) => (
                              <div key={index} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: '#ffffff',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                padding: '8px 12px',
                                fontSize: '14px'
                              }}>
                                <span>
                                  {service.serviceType === 'voos' && '✈️'}
                                  {service.serviceType === 'hoteis' && '🏨'}
                                  {service.serviceType === 'carros' && '🚗'}
                                  {service.serviceType === 'passeios' && '🎯'}
                                  {service.serviceType === 'seguro' && '🛡️'}
                                </span>
                                <span style={{ fontWeight: 500, color: colors.secondary.gray700 }}>
                                  {service.serviceType.charAt(0).toUpperCase() + service.serviceType.slice(1)}
                                </span>
                                {service.origem && service.destino && (
                                  <span style={{ fontSize: '12px', color: colors.secondary.gray600 }}>
                                    {service.origem ? (typeof service.origem === 'string' ? service.origem : service.origem.name || service.origem.iataCode) : ''} → {service.destino ? (typeof service.destino === 'string' ? service.destino : service.destino.name || service.destino.iataCode) : ''}
                                  </span>
                                )}
                                <CheckIcon style={{ width: '14px', height: '14px', color: colors.accent.green }} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Nome e Email na mesma linha */}
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Nome</label>
                          <input
                            type="text"
                            value={formData.nome}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('nome', e.target.value)}
                            onBlur={() => handleFieldBlur('nome')}
                            style={{ 
                              width: '100%', 
                              padding: '10px 12px', 
                              border: (touchedFields.nome && validationErrors.nome) ? '2px solid #ef4444' : '1px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '14px',
                              transition: 'all 0.3s ease',
                              outline: 'none'
                            }}
                            placeholder="Seu nome"
                          />
                          {touchedFields.nome && validationErrors.nome && (
                            <div style={{
                              color: '#ef4444',
                              fontSize: '11px',
                              marginTop: '2px'
                            }}>
                              {validationErrors.nome}
                            </div>
                          )}
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Email</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
                            onBlur={() => handleFieldBlur('email')}
                            style={{ 
                              width: '100%', 
                              padding: '10px 12px', 
                              border: (touchedFields.email && validationErrors.email) ? '2px solid #ef4444' : '1px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '14px',
                              transition: 'all 0.3s ease',
                              outline: 'none'
                            }}
                            placeholder="seu@email.com"
                          />
                          {touchedFields.email && validationErrors.email && (
                            <div style={{
                              color: '#ef4444',
                              fontSize: '11px',
                              marginTop: '2px'
                            }}>
                              {validationErrors.email}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Telefones na mesma linha */}
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <PhoneInput
                            value={formData.whatsapp}
                            onChange={(value: string) => {
                              handleInputChange('whatsapp', value);
                              
                              // Mobile feedback on phone input
                              if (isMobileDevice && value.length > 8) {
                                setMobileInteractionCount((prev: any) => prev + 1);
                                if (mobileInteractionCount > 0 && mobileInteractionCount % 3 === 0) {
                                  setShowMobileSuccess(true);
                                  setTimeout(() => setShowMobileSuccess(false), 1000);
                                }
                              }
                            }}
                            onBlur={() => handleFieldBlur('whatsapp')}
                            placeholder="Seu WhatsApp"
                            label="WhatsApp"
                            required={true}
                            error={validationErrors.whatsapp}
                            touched={touchedFields.whatsapp}
                            defaultCountry="US"
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <PhoneInput
                            value={formData.telefone}
                            onChange={(value: string) => handleInputChange('telefone', value)}
                            onBlur={() => handleFieldBlur('telefone')}
                            placeholder="Telefone alternativo"
                            label="Telefone Alternativo"
                            required={false}
                            error={validationErrors.telefone}
                            touched={touchedFields.telefone}
                            defaultCountry="US"
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                        <button type="button" onClick={() => setCurrentStep(2)} style={{ 
                          padding: '8px 16px',
                          background: '#f3f4f6',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}>
                          Voltar
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setCurrentStep(4)} 
                          disabled={!isStepValid()}
                          style={{ 
                            padding: '12px 24px',
                            background: isStepValid() ? '#10b981' : '#9ca3af',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: isStepValid() ? 'pointer' : 'not-allowed',
                            fontSize: '16px',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            opacity: isStepValid() ? 1 : 0.6
                          }}
                        >
                          Continuar ✓
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Trip Details */}
                  {currentStep === 4 && (
                    <div>
                      <h4 style={{ margin: '0 0 16px 0', color: colors.secondary.gray800 }}>Detalhes da Viagem</h4>
                      
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                          Orçamento Aproximado (Opcional)
                        </label>
                        <select
                          value={formData.orcamentoAproximado}
                          onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData((prev: any) => ({ ...prev, orcamentoAproximado: e.target.value }))}
                          style={{ 
                            width: '100%', 
                            padding: '8px', 
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            background: '#ffffff'
                          }}
                        >
                          <option value="">Selecione uma faixa de preço</option>
                          <option value="ate-1000">Até $1.000</option>
                          <option value="1000-2500">$1.000 - $2.500</option>
                          <option value="2500-5000">$2.500 - $5.000</option>
                          <option value="5000-10000">$5.000 - $10.000</option>
                          <option value="acima-10000">Acima de $10.000</option>
                          <option value="sem-preferencia">Sem preferência</option>
                        </select>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          cursor: 'pointer',
                          fontWeight: 500
                        }}>
                          <input
                            type="checkbox"
                            checked={formData.flexibilidadeDatas}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData((prev: any) => ({ ...prev, flexibilidadeDatas: e.target.checked }))}
                            style={{ transform: 'scale(1.2)' }}
                          />
                          Tenho flexibilidade nas datas (±3 dias)
                        </label>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                          Observações Adicionais (Opcional)
                        </label>
                        <textarea
                          value={formData.observacoes}
                          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData((prev: any) => ({ ...prev, observacoes: e.target.value }))}
                          rows={3}
                          style={{ 
                            width: '100%', 
                            padding: '8px', 
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            resize: 'vertical',
                            fontFamily: 'inherit'
                          }}
                          placeholder="Alguma preferência especial, necessidade específica ou informação adicional..."
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                        <button type="button" onClick={() => setCurrentStep(3)} style={{ 
                          padding: '8px 16px',
                          background: '#f3f4f6',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}>
                          Voltar
                        </button>
                        <button 
                          type="submit" 
                          disabled={isSubmitting}
                          style={{ 
                            padding: isMobileDevice ? '14px 20px' : '12px 24px',
                            background: isSubmitting ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: isMobileDevice ? '10px' : '12px',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            fontSize: isMobileDevice ? '14px' : '16px',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            boxShadow: !isSubmitting ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
                            transform: isSubmitting ? 'scale(0.98)' : 'scale(1)',
                            width: isMobileDevice ? '100%' : 'auto',
                            minHeight: isMobileDevice ? '44px' : 'auto'
                          }}
                        >
                          {isSubmitting ? '🔄 Enviando...' : isMobileDevice ? '🚀 Enviar Cotação Grátis' : '🚀 Enviar Cotação'}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Hidden on Mobile for Better Conversion */}
        <div className={!isMobileDevice ? 'features-section-visible' : 'features-section-hidden'}>
        <section style={{
          position: 'relative',
          zIndex: 10,
          padding: '100px 0',
          background: colors.primary.gray50,
          width: '100%',
          maxWidth: '100vw'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: isMobileDevice ? '0 20px' : '0 32px'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
              <h2 style={{
                fontSize: isMobileDevice ? '24px' : '56px',
                fontWeight: '800',
                color: colors.secondary.gray900,
                fontFamily: 'Poppins, sans-serif',
                margin: isMobileDevice ? '0 0 16px 0' : '0 0 24px 0',
                letterSpacing: '-0.02em',
                lineHeight: '1.3'
              }}>
                Por que 
                <span style={{
                  color: colors.accent.orange
                }}> 5.000+ Brasileiros </span>
                Confiam na Fly2Any?
              </h2>
              <p style={{
                fontSize: '20px',
                color: colors.secondary.gray600,
                maxWidth: '600px',
                margin: '0 auto 32px auto',
                lineHeight: '1.6'
              }}>
                Discover what makes Fly2Any the #1 choice for USA-Brazil travel
              </p>
              
              {/* Price Anchoring Widget */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.05), rgba(255, 176, 0, 0.05))',
                border: `2px solid ${colors.accent.orange}`,
                borderRadius: '16px',
                padding: '24px',
                maxWidth: '500px',
                margin: '0 auto',
                textAlign: 'center'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}>
                  <div>
                    <div style={{
                      fontSize: '12px',
                      color: colors.secondary.gray500,
                      textDecoration: 'line-through',
                      marginBottom: '4px'
                    }}>
                      Outras Agências
                    </div>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: colors.secondary.gray400
                    }}>
                      $950
                    </div>
                  </div>
                  
                  <div style={{
                    fontSize: '24px',
                    color: colors.accent.orange
                  }}>
                    →
                  </div>
                  
                  <div>
                    <div style={{
                      fontSize: '12px',
                      color: colors.accent.orange,
                      fontWeight: '600',
                      marginBottom: '4px'
                    }}>
                      Com a Fly2Any
                    </div>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '800',
                      color: colors.accent.orange
                    }}>
                      $675
                    </div>
                  </div>
                  
                  <div>
                    <div style={{
                      fontSize: '12px',
                      color: colors.accent.green,
                      fontWeight: '600',
                      marginBottom: '4px'
                    }}>
                      Sua Economia
                    </div>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '800',
                      color: colors.accent.green
                    }}>
                      $275
                    </div>
                  </div>
                </div>
                
                <div style={{
                  marginTop: '16px',
                  padding: '8px 16px',
                  background: colors.accent.orange,
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'inline-block'
                }}>
                  💰 Average savings on USA-Brazil flights
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobileDevice ? '1fr' : 'repeat(3, 1fr)',
              gap: '40px',
              marginBottom: '80px'
            }}>
              {[
                {
                  icon: '⚡',
                  title: 'Resposta em 2 Horas',
                  description: 'Cotação personalizada garantida em até 2 horas durante horário comercial',
                  highlight: 'Mais rápido que qualquer site'
                },
                {
                  icon: '💰',
                  title: 'Preços Exclusivos',
                  description: 'Parcerias diretas com companhias aéreas garantem os melhores preços do mercado',
                  highlight: 'Economize até 40%'
                },
                {
                  icon: '🌎',
                  title: 'Atendimento Multilíngue',
                  description: 'Equipe especializada que fala português, espanhol e inglês',
                  highlight: 'Suporte 24/7 em 3 idiomas'
                },
                {
                  icon: '✈️',
                  title: 'Experiência Comprovada',
                  description: 'Over 10 years specialized in USA-Brazil travel',
                  highlight: '+10.000 viagens realizadas'
                },
                {
                  icon: '🛡️',
                  title: 'Garantia Total',
                  description: 'Suporte completo antes, durante e após sua viagem',
                  highlight: 'Proteção 100% garantida'
                },
                {
                  icon: '💳',
                  title: 'Facilidade de Pagamento',
                  description: 'Parcelamento em até 12x ou pagamento à vista com desconto',
                  highlight: 'Sem taxa de conveniência'
                }
              ].map((feature, index) => (
                <div key={index} style={{
                  background: colors.primary.white,
                  border: `1px solid ${colors.primary.gray200}`,
                  borderRadius: '16px',
                  padding: '40px 32px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative' as const,
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                }}>
                  <div style={{
                    fontSize: '48px',
                    marginBottom: '24px',
                    display: 'block'
                  }}>
                    {feature.icon}
                  </div>
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: colors.secondary.gray900,
                    marginBottom: '16px',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    color: colors.secondary.gray600,
                    fontSize: '16px',
                    lineHeight: '1.6',
                    marginBottom: '16px'
                  }}>
                    {feature.description}
                  </p>
                  <div style={{
                    background: colors.accent.orange,
                    color: colors.primary.white,
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'inline-block'
                  }}>
                    {feature.highlight}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        </div> {/* Close features-section div */}

        {/* Social Proof Section - Hidden on Mobile for Better Conversion */}
        <div className={!isMobileDevice ? 'social-proof-visible' : 'social-proof-hidden'}>
        <section style={{
          position: 'relative',
          zIndex: 10,
          padding: '80px 0',
          textAlign: 'center',
          width: '100%',
          maxWidth: '100vw'
        }}>
          <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: isMobileDevice ? '0 20px' : '0 24px'
          }}>
            <h3 style={{
              fontSize: isMobileDevice ? '20px' : '36px',
              fontWeight: '700',
              color: colors.secondary.gray900,
              fontFamily: 'Poppins, sans-serif',
              margin: isMobileDevice ? '0 0 12px 0' : '0 0 16px 0',
              letterSpacing: '-0.02em',
              lineHeight: '1.3'
            }}>
              Mais de 5.000 Brasileiros Já Voaram Conosco
            </h3>
            <p style={{
              fontSize: '20px',
              color: colors.secondary.gray600,
              marginBottom: '48px',
              maxWidth: '600px',
              margin: '0 auto 48px auto'
            }}>
              Junte-se à maior comunidade de brasileiros que confiam na Fly2Any para suas viagens
            </p>

            {/* Enhanced Statistics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobileDevice ? '1fr 1fr' : 'repeat(4, 1fr)',
              gap: '32px',
              marginBottom: '64px',
              maxWidth: '800px',
              margin: '0 auto 64px auto'
            }}>
              {[
                { number: '5.000+', label: 'Clientes Satisfeitos', icon: '👥' },
                { number: '4.9★', label: 'Avaliação Média', icon: '⭐' },
                { number: '2h', label: 'Resposta Garantida', icon: '⚡' },
                { number: '10+', label: 'Anos de Experiência', icon: '🏆' }
              ].map((stat, index) => (
                <div key={index} style={{
                  background: colors.primary.white,
                  border: `1px solid ${colors.primary.gray200}`,
                  borderRadius: '16px',
                  padding: '32px 24px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 8px 16px rgba(0, 0, 0, 0.1)`;
                  e.currentTarget.style.borderColor = colors.primary.gray200;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.borderColor = colors.primary.gray200;
                }}>
                  <div style={{
                    fontSize: '28px',
                    marginBottom: '12px'
                  }}>
                    {stat.icon}
                  </div>
                  <div style={{
                    fontSize: isMobileDevice ? '24px' : '32px',
                    fontWeight: '700',
                    color: colors.secondary.gray900,
                    fontFamily: 'Poppins, sans-serif',
                    marginBottom: '8px'
                  }}>
                    {stat.number}
                  </div>
                  <div style={{
                    color: colors.secondary.gray600,
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Customer Testimonials */}
            <div style={{
              marginTop: '64px',
              marginBottom: '48px'
            }}>
              <h4 style={{
                fontSize: isMobileDevice ? '24px' : '32px',
                fontWeight: '700',
                color: colors.secondary.gray900,
                fontFamily: 'Poppins, sans-serif',
                marginBottom: '12px',
                letterSpacing: '-0.02em'
              }}>
                O que nossos clientes dizem
              </h4>
              <p style={{
                fontSize: '16px',
                color: colors.secondary.gray600,
                marginBottom: '40px',
                maxWidth: '500px',
                margin: '0 auto 40px auto'
              }}>
                Histórias reais de clientes satisfeitos com nossos serviços
              </p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobileDevice ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
                maxWidth: '900px',
                margin: '0 auto'
              }}>
                {[
                  {
                    name: "Maria Silva",
                    location: "Orlando, FL",
                    rating: 5,
                    text: "Excelente atendimento! Conseguiram um preço incrível para minha viagem ao Brasil. A equipe foi super atenciosa e resolveu tudo rapidamente.",
                    service: "Passagem São Paulo"
                  },
                  {
                    name: "João Santos",
                    location: "Miami, FL", 
                    rating: 5,
                    text: "Já usei várias vezes e sempre superam minhas expectativas. O atendimento em português faz toda diferença. Recomendo muito!",
                    service: "Passagem Rio de Janeiro"
                  },
                  {
                    name: "Ana Costa",
                    location: "Boston, MA",
                    rating: 5,
                    text: "Economizei mais de $300 comparado com outros sites. Além do preço, o suporte foi excepcional durante toda a viagem.",
                    service: "Pacote Completo"
                  }
                ].map((testimonial, index) => (
                  <div key={index} style={{
                    background: colors.primary.white,
                    border: `1px solid ${colors.primary.gray200}`,
                    borderRadius: '16px',
                    padding: '24px',
                    textAlign: 'left',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    position: 'relative' as const,
                    overflow: 'hidden' as const,
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = `0 8px 16px rgba(0, 0, 0, 0.1)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                  }}>
                    <div style={{
                      display: 'flex',
                      marginBottom: '16px'
                    }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} style={{
                          color: colors.accent.yellow,
                          fontSize: '16px'
                        }}>★</span>
                      ))}
                    </div>
                    <p style={{
                      color: colors.secondary.gray700,
                      fontSize: '15px',
                      lineHeight: '1.6',
                      marginBottom: '20px',
                      fontStyle: 'italic'
                    }}>
                      &quot;{testimonial.text}&quot;
                    </p>
                    <div style={{
                      borderTop: `1px solid ${colors.primary.gray200}`,
                      paddingTop: '16px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: colors.primary.gray100,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: colors.secondary.gray600
                        }}>
                          {testimonial.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{
                            color: colors.secondary.gray900,
                            fontSize: '14px',
                            fontWeight: '600'
                          }}>
                            {testimonial.name}
                          </div>
                          <div style={{
                            color: colors.secondary.gray500,
                            fontSize: '12px'
                          }}>
                            {testimonial.location} • {testimonial.service}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Proof */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', marginRight: '-12px' }}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #60a5fa, #e879f9)',
                    border: '2px solid white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: '-12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'white'
                  }}>
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div style={{
                color: colors.secondary.gray600,
                fontSize: '16px',
                fontWeight: '500'
              }}>
                Mais de 5.000 brasileiros já economizaram conosco
              </div>
            </div>
          </div>
        </section>
        </div> {/* Close social-proof div */}
        </main>

        {/* Success Toast */}
        <div className={showSuccessToast ? 'success-toast-visible' : 'success-toast-hidden'}>
          <div style={{
            position: 'fixed',
            top: isMobileDevice ? '16px' : '24px',
            right: isMobileDevice ? '16px' : '24px',
            left: isMobileDevice ? '16px' : 'auto',
            zIndex: 9999,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            padding: isMobileDevice ? '16px' : '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: isMobileDevice ? '14px' : '16px',
            fontWeight: '600',
            maxWidth: isMobileDevice ? 'none' : '400px',
            transform: 'translateX(0)',
            transition: 'all 0.5s ease-out'
          }}>
            <div style={{
              fontSize: '24px'
            }}>
              🎉
            </div>
            <div>
              <div style={{ fontWeight: '700', marginBottom: '4px' }}>
                Cotação enviada com sucesso!
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                Nossa equipe entrará em contato em até 2 horas.
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                Retornando ao início...
              </div>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px'
              }}
            >
              ×
            </button>
          </div>
        </div> {/* Close success-toast div */}

        {/* Floating Chat Buttons */}
        <FloatingChat />
        </div> {/* Close desktop-content div */}

        {/* Lead Capture Modal - Premium App Experience on Mobile Only */}
        <div className={isMobileDevice ? 'lead-capture-mobile-visible' : 'lead-capture-mobile-hidden'}>
          <LeadCaptureSimple
            isOpen={showLeadCapture}
            onClose={() => {
              console.log('🔒 Closing premium form');
              setShowLeadCapture(false);
            }}
            context="mobile-app"
          />
        </div> {/* Close lead-capture-mobile div */}

        {/* Exit Intent Popup */}
        <ExitIntentPopup enabled={true} delay={60} />
      </div>
      
      {/* Footer - Desktop Only (Mobile has integrated footer in hero) */}
      <div className={!isMobileDevice ? 'desktop-footer-visible' : 'desktop-footer-hidden'}>
        <LiveSiteFooter />
      </div>
    </>
  );
}
