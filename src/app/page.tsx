'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { trackFormSubmit, trackQuoteRequest } from '@/lib/analytics';
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
import CityAutocomplete from '@/components/CityAutocomplete';
import DatePicker from '@/components/DatePicker';
import PhoneInput from '@/components/PhoneInputSimple';
import ChatAgent from '@/components/ChatAgent';
import FloatingChat from '@/components/FloatingChat';
import LeadCaptureSimple from '@/components/LeadCaptureSimple';
import { cities } from '@/data/cities';

interface ServiceFormData {
  serviceType: 'voos' | 'hoteis' | 'carros' | 'passeios' | 'seguro';
  completed: boolean;
  // Dados de viagem
  origem: string;
  destino: string;
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
  origem: string;
  destino: string;
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
  const [isMobile, setIsMobile] = useState(false);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    selectedServices: [],
    currentServiceIndex: 0,
    // Dados de viagem
    origem: '',
    destino: '',
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
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation
    const error = validateField(name, value);
    setValidationErrors(prev => ({ ...prev, [name]: error }));
  };

  // Handle field blur
  const handleFieldBlur = (name: string) => {
    setTouchedFields(prev => ({ ...prev, [name]: true }));
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
    
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 1024);
      }
    };
    checkMobile();
    
    // Close passengers dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('passengers-dropdown');
      const trigger = event.target as HTMLElement;
      if (dropdown && !trigger.closest('#passengers-dropdown') && !trigger.closest('[data-passengers-trigger]')) {
        dropdown.style.display = 'none';
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkMobile);
      document.addEventListener('click', handleClickOutside);
      return () => {
        window.removeEventListener('resize', checkMobile);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, []);

  const getCurrentService = () => {
    return formData.selectedServices[formData.currentServiceIndex];
  };

  const updateCurrentService = (updates: Partial<ServiceFormData>) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.map((service, index) =>
        index === prev.currentServiceIndex ? { ...service, ...updates } : service
      )
    }));
  };

  const addNewService = (serviceType: 'voos' | 'hoteis' | 'carros' | 'passeios' | 'seguro') => {
    const newService: ServiceFormData = {
      serviceType,
      completed: false,
      origem: '',
      destino: '',
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

    setFormData(prev => ({
      ...prev,
      selectedServices: [...prev.selectedServices, newService],
      currentServiceIndex: prev.selectedServices.length
    }));

    setCurrentStep(2);
    setIsAddingService(false);
  };

  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.filter((_, i) => i !== index),
      currentServiceIndex: Math.max(0, prev.currentServiceIndex - 1)
    }));
  };

  const completeCurrentService = () => {
    updateCurrentService({ completed: true });
    
    // Return to service selection to add more services
    setCurrentStep(1);
    setIsAddingService(false);
  };

  const startNewQuotation = () => {
    setFormData({
      selectedServices: [],
      currentServiceIndex: 0,
      // Dados de viagem
      origem: '',
      destino: '',
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
    setIsSubmitting(true);

    try {
      // Convert form data to plain object
      const formDataObj = {
        selectedServices: formData.selectedServices,
        currentServiceIndex: formData.currentServiceIndex,
        origem: formData.origem,
        destino: formData.destino,
        dataIda: formData.dataIda,
        dataVolta: formData.dataVolta,
        tipoViagem: formData.tipoViagem,
        classeVoo: formData.classeVoo,
        adultos: formData.adultos,
        criancas: formData.criancas,
        bebes: formData.bebes,
        companhiaPreferida: formData.companhiaPreferida,
        horarioPreferido: formData.horarioPreferido,
        escalas: formData.escalas,
        nome: formData.nome,
        sobrenome: formData.sobrenome,
        email: formData.email,
        telefone: formData.telefone,
        whatsapp: formData.whatsapp,
        orcamentoAproximado: formData.orcamentoAproximado,
        flexibilidadeDatas: formData.flexibilidadeDatas,
        observacoes: formData.observacoes
      };

      // Track conversion events
      if (typeof trackFormSubmit === 'function') {
        trackFormSubmit('quote_request', formDataObj);
      }
      if (typeof trackQuoteRequest === 'function') {
        trackQuoteRequest(formDataObj);
      }

      // Send to API
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao enviar formulário');
      }

      // Success response
      console.log('Lead enviado com sucesso:', result);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 5000);
      
      // Reset form and go back to start after successful submission
      setTimeout(() => {
        // Clear any validation errors and touched fields
        setValidationErrors({});
        setTouchedFields({});
        
        // Close any open dropdowns
        const dropdown = document.getElementById('passengers-dropdown');
        if (dropdown) {
          dropdown.style.display = 'none';
        }
        
        // Reset to initial state
        startNewQuotation();
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      alert('❌ Erro ao enviar formulário. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e40af 0%, #a21caf 50%, #713f12 100%)',
    position: 'relative' as const,
    overflow: 'visible' as const,
    fontFamily: 'Inter, sans-serif'
  };

  const floatingElement1Style = {
    position: 'absolute' as const,
    top: '80px',
    left: '40px',
    width: '300px',
    height: '300px',
    background: 'rgba(96, 165, 250, 0.2)',
    borderRadius: '50%',
    filter: 'blur(60px)'
  };

  const floatingElement2Style = {
    position: 'absolute' as const,
    top: '160px',
    right: '40px',
    width: '400px',
    height: '400px',
    background: 'rgba(232, 121, 249, 0.2)',
    borderRadius: '50%',
    filter: 'blur(60px)'
  };

  const floatingElement3Style = {
    position: 'absolute' as const,
    bottom: '-32px',
    left: '80px',
    width: '350px',
    height: '350px',
    background: 'rgba(250, 204, 21, 0.2)',
    borderRadius: '50%',
    filter: 'blur(60px)'
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
      <div style={containerStyle}>
        {/* Floating Background Elements */}
        <div style={floatingElement1Style}></div>
        <div style={floatingElement2Style}></div>
        <div style={floatingElement3Style}></div>

        {/* Header */}
        <header style={headerStyle}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '16px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Logo size="md" showText={true} />
            {!isMobile && (
              <nav style={{ display: 'flex', gap: '24px' }}>
                <Link href="/" style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'color 0.3s',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Home
                </Link>
                <Link href="/voos-brasil-eua" style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'color 0.3s',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <FlightIcon style={{ width: '14px', height: '14px' }} />
                  Voos
                </Link>
                <Link href="/como-funciona" style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'color 0.3s',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Como Funciona
                </Link>
                <Link href="/blog" style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'color 0.3s',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  Blog
                </Link>
                <Link href="/faq" style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'color 0.3s',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  FAQ
                </Link>
                <Link href="/sobre" style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'color 0.3s',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Sobre
                </Link>
                <Link href="/contato" style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'color 0.3s',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <PhoneIcon style={{ width: '14px', height: '14px' }} />
                  Contato
                </Link>
              </nav>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main>
        <section style={{
          position: 'relative',
          zIndex: 10,
          padding: '60px 0 80px 0'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 32px',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '64px',
            alignItems: 'center'
          }}>
            {/* Left Side - Content */}
            <div style={{
              color: 'white',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.8s ease-out, transform 0.8s ease-out'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '8px 16px',
                background: 'rgba(234, 179, 8, 0.2)',
                backdropFilter: 'blur(10px)',
                borderRadius: '50px',
                border: '1px solid rgba(250, 204, 21, 0.3)',
                marginBottom: '32px',
                marginTop: '20px'
              }}>
                <span style={{
                  color: '#fde047',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>🌎 Conectando você ao mundo há 21 anos</span>
              </div>
              <h1 style={{
                fontSize: isMobile ? '36px' : '64px',
                fontWeight: '700',
                fontFamily: 'Poppins, sans-serif',
                lineHeight: '1.2',
                margin: '0 0 24px 0',
                letterSpacing: '-0.01em',
                maxWidth: '100%'
              }}>
                <span style={{
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #ea580c)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}>
                  Fly2Any
                </span>, sua ponte aérea entre EUA, Brasil e o Mundo!
              </h1>
              <p style={{
                fontSize: '22px',
                color: 'rgba(219, 234, 254, 0.95)',
                lineHeight: '1.7',
                maxWidth: '520px',
                marginBottom: '40px',
                fontWeight: '400'
              }}>
                Conectamos brasileiros, americanos e outras nacionalidades ao Brasil e ao mundo 
                com atendimento personalizado, preços exclusivos e 21 anos de experiência.
              </p>
              
              {/* Trust Indicators */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '32px',
                marginBottom: '40px',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    background: 'rgba(34, 197, 94, 0.2)',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid rgba(34, 197, 94, 0.3)'
                  }}>
                    <CheckIcon style={{ width: '16px', height: '16px', color: '#22c55e' }} />
                  </div>
                  <span style={{ color: 'rgba(219, 234, 254, 0.9)', fontSize: '14px', fontWeight: '500' }}>
                    +10 anos de experiência
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    background: 'rgba(34, 197, 94, 0.2)',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid rgba(34, 197, 94, 0.3)'
                  }}>
                    <StarIcon style={{ width: '16px', height: '16px', color: '#fbbf24' }} />
                  </div>
                  <span style={{ color: 'rgba(219, 234, 254, 0.9)', fontSize: '14px', fontWeight: '500' }}>
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
                    <UsersIcon style={{ width: '16px', height: '16px', color: '#22c55e' }} />
                  </div>
                  <span style={{ color: 'rgba(219, 234, 254, 0.9)', fontSize: '14px', fontWeight: '500' }}>
                    +5.000 clientes
                  </span>
                </div>
              </div>
              
              {/* Quick Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '40px',
                flexWrap: 'wrap'
              }}>

                <button
                  type="button"
                  onClick={() => {
                    const formSection = document.querySelector('form');
                    if (formSection) {
                      formSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: 'white',
                    padding: '16px 32px',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(37, 99, 235, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(37, 99, 235, 0.3)';
                  }}
                >
                  <FlightIcon style={{ width: '20px', height: '20px' }} />
                  Cotar Voos Agora
                </button>
                
                <a
                  href="https://wa.me/551151944717"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    padding: '16px 32px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    fontSize: '16px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <ChatIcon style={{ width: '20px', height: '20px' }} />
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Right Side - Form */}
            <div style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(-30px)',
              transition: 'opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s'
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(20px)',
                borderRadius: isMobile ? '24px' : '32px',
                padding: isMobile ? '28px' : '40px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                maxHeight: isMobile ? '80vh' : 'auto',
                overflowY: isMobile ? 'auto' : 'visible',
                position: 'relative' as const
              }}>
                {/* Form Header with Badge */}
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '40px',
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
                
                <h3 style={{
                  fontSize: '26px',
                  fontWeight: '800',
                  color: '#111827',
                  fontFamily: 'Poppins, sans-serif',
                  margin: '0 0 8px 0',
                  letterSpacing: '-0.02em',
                  lineHeight: '1.2'
                }}>
                  Sua Cotação em até 2 horas, menor preço garantido!
                </h3>
                <p style={{
                  color: '#6b7280',
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
                  background: '#f8fafc',
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
                      color: '#475569'
                    }}>
                      Progresso da Cotação
                    </span>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#3b82f6'
                    }}>
                      {Math.round(getProgressPercentage())}%
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: '#e2e8f0',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${getProgressPercentage()}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
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
                        background: currentStep >= 1 ? '#10b981' : '#d1d5db'
                      }}></div>
                      <span style={{
                        fontSize: '12px',
                        color: currentStep >= 1 ? '#059669' : '#6b7280'
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
                        background: currentStep >= 2 ? '#10b981' : '#d1d5db'
                      }}></div>
                      <span style={{
                        fontSize: '12px',
                        color: currentStep >= 2 ? '#059669' : '#6b7280'
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
                        background: currentStep >= 3 ? '#10b981' : '#d1d5db'
                      }}></div>
                      <span style={{
                        fontSize: '12px',
                        color: currentStep >= 3 ? '#059669' : '#6b7280'
                      }}>
                        Contato
                      </span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Step 1: Quotation Mode & Service Selection */}
                  {currentStep === 1 && (
                    <div>

                      {/* Service Selection */}
                      <div>
                          <label style={{ fontWeight: 600, marginBottom: '16px', display: 'block', color: '#1f2937' }}>
                            {isAddingService 
                              ? 'Selecione outro serviço para adicionar:' 
                              : 'Selecione os serviços desejados:'
                            }
                          </label>
                          
                          {/* Selected Services Display */}
                          {formData.selectedServices.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                              <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
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
                                    <span style={{ fontWeight: 500, color: '#374151' }}>
                                      {service.serviceType.charAt(0).toUpperCase() + service.serviceType.slice(1)}
                                    </span>
                                    {service.completed && (
                                      <CheckIcon style={{ width: '14px', height: '14px', color: '#10b981' }} />
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => removeService(index)}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        color: '#6b7280',
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
                            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', 
                            gap: isMobile ? '12px' : '8px', 
                            marginTop: '16px' 
                          }}>
                            {(['voos', 'hoteis', 'carros', 'passeios', 'seguro'] as const).map(serviceType => {
                              const isSelected = formData.selectedServices.some(s => s.serviceType === serviceType);
                              const isMaxServices = formData.selectedServices.length >= 5;
                              
                              return (
                                <button 
                                  key={serviceType}
                                  type="button" 
                                  onClick={() => addNewService(serviceType)} 
                                  disabled={isSelected || (isMaxServices && !isSelected)}
                                  style={{ 
                                    padding: '12px 16px', 
                                    borderRadius: '12px', 
                                    border: isSelected ? '2px solid #10b981' : '2px solid #e5e7eb', 
                                    background: isSelected ? '#f0fdf4' : (isMaxServices ? '#f9fafb' : '#ffffff'), 
                                    cursor: isSelected || isMaxServices ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    opacity: isSelected || isMaxServices ? 0.6 : 1,
                                    position: 'relative',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    transition: 'all 0.3s ease',
                                    transform: 'scale(1)',
                                    boxShadow: isSelected ? '0 4px 12px rgba(16, 185, 129, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.05)'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isSelected && !isMaxServices) {
                                      e.currentTarget.style.transform = 'scale(1.05)';
                                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.25)';
                                      e.currentTarget.style.borderColor = '#3b82f6';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isSelected && !isMaxServices) {
                                      e.currentTarget.style.transform = 'scale(1)';
                                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                                      e.currentTarget.style.borderColor = '#e5e7eb';
                                    }
                                  }}
                                >
                                  {serviceType === 'voos' && (
                                    <>
                                      <FlightIcon style={{ width: '18px', height: '18px' }} /> 
                                      Voos
                                      <span style={{
                                        position: 'absolute',
                                        top: '-8px',
                                        right: '-8px',
                                        background: '#f59e0b',
                                        color: 'white',
                                        fontSize: '10px',
                                        padding: '2px 4px',
                                        borderRadius: '4px',
                                        fontWeight: '600'
                                      }}>
                                        Mais Procurado
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
                                  {isSelected && <CheckIcon style={{ width: '14px', height: '14px', color: '#10b981' }} />}
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
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
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
                                  onClick={() => setCurrentStep(3)}
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
                          {/* Origem e Destino na mesma linha */}
                          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 500 }}>
                                <LocationIcon style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                                Origem
                              </label>
                              <CityAutocomplete
                                value={getCurrentService()?.origem || ''}
                                onChange={value => updateCurrentService({ origem: value })}
                                cities={cities}
                                placeholder="Cidade de origem"
                                label=""
                                iconColor="#3b82f6"
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 500 }}>
                                <LocationIcon style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                                Destino
                              </label>
                              <CityAutocomplete
                                value={getCurrentService()?.destino || ''}
                                onChange={value => updateCurrentService({ destino: value })}
                                cities={cities}
                                placeholder="Cidade de destino"
                                label=""
                                iconColor="#3b82f6"
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
                              <LocationIcon style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                              Destino
                            </label>
                            <CityAutocomplete
                              value={getCurrentService()?.destino || ''}
                              onChange={value => updateCurrentService({ destino: value })}
                              cities={cities}
                              placeholder="Cidade do hotel"
                              label=""
                              iconColor="#3b82f6"
                            />
                          </div>
                          
                          {/* Check-in e Check-out */}
                          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 500 }}>
                                <CalendarIcon style={{ width: '14px', height: '14px', color: '#6b7280' }} />
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
                                <CalendarIcon style={{ width: '14px', height: '14px', color: '#6b7280' }} />
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
                                <BedIcon style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                                Quartos
                              </label>
                              <select
                                value={getCurrentService()?.quartos || 1}
                                onChange={(e) => updateCurrentService({ quartos: parseInt(e.target.value) })}
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
                                <StarIcon style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                                Categoria
                              </label>
                              <select
                                value={getCurrentService()?.categoriaHotel || 'qualquer'}
                                onChange={(e) => updateCurrentService({ categoriaHotel: e.target.value })}
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
                                onChange={value => updateCurrentService({ localRetirada: value })}
                                cities={cities}
                                placeholder="Onde retirar o carro"
                                label=""
                                iconColor="#3b82f6"
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Local de Entrega</label>
                              <CityAutocomplete
                                value={getCurrentService()?.destino || ''}
                                onChange={value => updateCurrentService({ destino: value })}
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
                                onChange={(e) => updateCurrentService({ horaRetirada: e.target.value })}
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
                                onChange={(e) => updateCurrentService({ horaEntrega: e.target.value })}
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
                              onChange={(e) => updateCurrentService({ categoriaVeiculo: e.target.value })}
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
                              value={getCurrentService()?.destino || ''}
                              onChange={value => updateCurrentService({ destino: value })}
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
                                onChange={(e) => updateCurrentService({ tipoPasseio: e.target.value })}
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
                                onChange={(e) => updateCurrentService({ duracao: e.target.value })}
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
                              value={getCurrentService()?.destino || ''}
                              onChange={value => updateCurrentService({ destino: value })}
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
                                onChange={(e) => updateCurrentService({ tipoSeguro: e.target.value })}
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
                                onChange={(e) => updateCurrentService({ cobertura: e.target.value })}
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
                              onChange={(e) => updateCurrentService({ idadeViajante: e.target.value })}
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
                            onChange={(e) => updateCurrentService({ tipoViagem: e.target.value as 'ida-volta' | 'somente-ida' | 'multiplas-cidades' })}
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
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>▼</span>
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
                              <span style={{ fontWeight: '500', color: '#374151' }}>Adultos</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const current = getCurrentService();
                                    if (current && current.adultos > 1) {
                                      updateCurrentService({ adultos: current.adultos - 1 });
                                    }
                                  }}
                                  style={{
                                    width: '24px', height: '24px', borderRadius: '4px',
                                    border: '1px solid #d1d5db', background: '#f9fafb',
                                    cursor: 'pointer', fontSize: '14px', fontWeight: 'bold',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = '#f9fafb'}
                                >
                                  −
                                </button>
                                <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: '600', fontSize: '16px' }}>
                                  {getCurrentService()?.adultos || 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const current = getCurrentService();
                                    if (current && current.adultos < 9) {
                                      updateCurrentService({ adultos: current.adultos + 1 });
                                    }
                                  }}
                                  style={{
                                    width: '24px', height: '24px', borderRadius: '4px',
                                    border: '1px solid #d1d5db', background: '#f9fafb',
                                    cursor: 'pointer', fontSize: '14px', fontWeight: 'bold',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = '#f9fafb'}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            
                            {/* Crianças */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                              <span style={{ fontWeight: '500', color: '#374151' }}>Crianças <span style={{ fontSize: '12px', color: '#6b7280' }}>(2-11 anos)</span></span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const current = getCurrentService();
                                    if (current && current.criancas > 0) {
                                      updateCurrentService({ criancas: current.criancas - 1 });
                                    }
                                  }}
                                  style={{
                                    width: '24px', height: '24px', borderRadius: '4px',
                                    border: '1px solid #d1d5db', background: '#f9fafb',
                                    cursor: 'pointer', fontSize: '14px', fontWeight: 'bold',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = '#f9fafb'}
                                >
                                  −
                                </button>
                                <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: '600', fontSize: '16px' }}>
                                  {getCurrentService()?.criancas || 0}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const current = getCurrentService();
                                    if (current && current.criancas < 8) {
                                      updateCurrentService({ criancas: current.criancas + 1 });
                                    }
                                  }}
                                  style={{
                                    width: '24px', height: '24px', borderRadius: '4px',
                                    border: '1px solid #d1d5db', background: '#f9fafb',
                                    cursor: 'pointer', fontSize: '14px', fontWeight: 'bold',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = '#f9fafb'}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            
                            {/* Bebês */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: '500', color: '#374151' }}>Bebês <span style={{ fontSize: '12px', color: '#6b7280' }}>(até 2 anos)</span></span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const current = getCurrentService();
                                    if (current && current.bebes > 0) {
                                      updateCurrentService({ bebes: current.bebes - 1 });
                                    }
                                  }}
                                  style={{
                                    width: '24px', height: '24px', borderRadius: '4px',
                                    border: '1px solid #d1d5db', background: '#f9fafb',
                                    cursor: 'pointer', fontSize: '14px', fontWeight: 'bold',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = '#f9fafb'}
                                >
                                  −
                                </button>
                                <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: '600', fontSize: '16px' }}>
                                  {getCurrentService()?.bebes || 0}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const current = getCurrentService();
                                    if (current && current.bebes < 4) {
                                      updateCurrentService({ bebes: current.bebes + 1 });
                                    }
                                  }}
                                  style={{
                                    width: '24px', height: '24px', borderRadius: '4px',
                                    border: '1px solid #d1d5db', background: '#f9fafb',
                                    cursor: 'pointer', fontSize: '14px', fontWeight: 'bold',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = '#f9fafb'}
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
                            onChange={(e) => updateCurrentService({ classeVoo: e.target.value as 'economica' | 'premium' | 'executiva' | 'primeira' })}
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
                            background: '#10b981',
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
                      <h4 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>Seus Dados</h4>
                      
                      {/* Services Summary */}
                      {formData.selectedServices.length > 0 && (
                        <div style={{
                          background: '#f8fafc',
                          borderRadius: '12px',
                          padding: '16px',
                          marginBottom: '24px',
                          border: '1px solid #e2e8f0'
                        }}>
                          <h5 style={{ 
                            margin: '0 0 12px 0', 
                            color: '#374151', 
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
                                <span style={{ fontWeight: 500, color: '#374151' }}>
                                  {service.serviceType.charAt(0).toUpperCase() + service.serviceType.slice(1)}
                                </span>
                                {service.origem && service.destino && (
                                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                    {service.origem} → {service.destino}
                                  </span>
                                )}
                                <CheckIcon style={{ width: '14px', height: '14px', color: '#10b981' }} />
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
                            onChange={(e) => handleInputChange('nome', e.target.value)}
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
                            onChange={(e) => handleInputChange('email', e.target.value)}
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
                            onChange={(value) => handleInputChange('whatsapp', value)}
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
                            onChange={(value) => handleInputChange('telefone', value)}
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
                      <h4 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>Detalhes da Viagem</h4>
                      
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                          Orçamento Aproximado (Opcional)
                        </label>
                        <select
                          value={formData.orcamentoAproximado}
                          onChange={(e) => setFormData(prev => ({ ...prev, orcamentoAproximado: e.target.value }))}
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
                            onChange={(e) => setFormData(prev => ({ ...prev, flexibilidadeDatas: e.target.checked }))}
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
                          onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
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
                            padding: '12px 24px',
                            background: isSubmitting ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            boxShadow: !isSubmitting ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
                            transform: isSubmitting ? 'scale(0.98)' : 'scale(1)'
                          }}
                        >
                          {isSubmitting ? '🔄 Enviando...' : '🚀 Enviar Cotação'}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section style={{
          position: 'relative',
          zIndex: 10,
          padding: '100px 0',
          background: 'rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 32px'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
              <h2 style={{
                fontSize: isMobile ? '36px' : '56px',
                fontWeight: '800',
                color: 'white',
                fontFamily: 'Poppins, sans-serif',
                margin: '0 0 24px 0',
                letterSpacing: '-0.02em'
              }}>
                Por que 
                <span style={{
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}> 5.000+ Brasileiros </span>
                Confiam na Fly2Any?
              </h2>
              <p style={{
                fontSize: '20px',
                color: 'rgba(219, 234, 254, 0.9)',
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: '1.6'
              }}>
                Descubra os diferenciais que fazem da Fly2Any a escolha número 1 para viagens Brasil-EUA
              </p>
            </div>

            {/* Features Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
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
                  description: 'Mais de 10 anos especializados em viagens Brasil-EUA',
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
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '24px',
                  padding: '40px 32px',
                  textAlign: 'center',
                  transition: 'all 0.4s ease',
                  cursor: 'pointer',
                  position: 'relative' as const,
                  overflow: 'hidden' as const
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
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
                    color: 'white',
                    marginBottom: '16px',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    color: 'rgba(219, 234, 254, 0.8)',
                    fontSize: '16px',
                    lineHeight: '1.6',
                    marginBottom: '16px'
                  }}>
                    {feature.description}
                  </p>
                  <div style={{
                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                    color: '#1f2937',
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

        {/* Social Proof Section */}
        <section style={{
          position: 'relative',
          zIndex: 10,
          padding: '80px 0',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '0 24px'
          }}>
            <h3 style={{
              fontSize: isMobile ? '36px' : '48px',
              fontWeight: '800',
              color: 'white',
              fontFamily: 'Poppins, sans-serif',
              margin: '0 0 24px 0',
              letterSpacing: '-0.02em'
            }}>
              Mais de 5.000 Brasileiros Já Voaram Conosco
            </h3>
            <p style={{
              fontSize: '20px',
              color: 'rgba(219, 234, 254, 0.8)',
              marginBottom: '48px',
              maxWidth: '600px',
              margin: '0 auto 48px auto'
            }}>
              Junte-se à maior comunidade de brasileiros que confiam na Fly2Any para suas viagens
            </p>

            {/* Enhanced Statistics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
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
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '20px',
                  padding: '32px 24px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}>
                  <div style={{
                    fontSize: '32px',
                    marginBottom: '8px'
                  }}>
                    {stat.icon}
                  </div>
                  <div style={{
                    fontSize: isMobile ? '28px' : '36px',
                    fontWeight: '800',
                    color: '#fbbf24',
                    fontFamily: 'Poppins, sans-serif',
                    marginBottom: '8px'
                  }}>
                    {stat.number}
                  </div>
                  <div style={{
                    color: 'rgba(219, 234, 254, 0.9)',
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
                fontSize: isMobile ? '28px' : '36px',
                fontWeight: '800',
                color: 'white',
                fontFamily: 'Poppins, sans-serif',
                marginBottom: '16px',
                letterSpacing: '-0.02em'
              }}>
                O que nossos clientes dizem
              </h4>
              <p style={{
                fontSize: '18px',
                color: 'rgba(219, 234, 254, 0.8)',
                marginBottom: '48px',
                maxWidth: '500px',
                margin: '0 auto 48px auto'
              }}>
                Histórias reais de brasileiros que realizaram o sonho de voltar para casa
              </p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
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
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '24px',
                    padding: '32px',
                    textAlign: 'left',
                    transition: 'all 0.4s ease',
                    cursor: 'pointer',
                    position: 'relative' as const,
                    overflow: 'hidden' as const
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                    e.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <div style={{
                      display: 'flex',
                      marginBottom: '12px'
                    }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} style={{
                          color: '#facc15',
                          fontSize: '18px'
                        }}>★</span>
                      ))}
                    </div>
                    <p style={{
                      color: 'rgba(219, 234, 254, 0.9)',
                      fontSize: '16px',
                      lineHeight: '1.6',
                      marginBottom: '16px',
                      fontStyle: 'italic'
                    }}>
                      &quot;{testimonial.text}&quot;
                    </p>
                    <div style={{
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                      paddingTop: '16px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #60a5fa, #e879f9)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                          fontWeight: '600',
                          color: 'white'
                        }}>
                          {testimonial.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '600'
                          }}>
                            {testimonial.name}
                          </div>
                          <div style={{
                            color: 'rgba(219, 234, 254, 0.7)',
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
                color: 'rgba(219, 234, 254, 0.9)',
                fontSize: '16px',
                fontWeight: '500'
              }}>
                Mais de 5.000 brasileiros já economizaram conosco
              </div>
            </div>
          </div>
        </section>
        </main>

        {/* CTA Section */}
        <section style={{
          position: 'relative',
          zIndex: 10,
          padding: '100px 0',
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.8), rgba(17, 24, 39, 0.9))',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '0 24px',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: isMobile ? '32px' : '48px',
              fontWeight: '800',
              color: 'white',
              fontFamily: 'Poppins, sans-serif',
              margin: '0 0 24px 0',
              letterSpacing: '-0.02em'
            }}>
              Pronto para sua 
              <span style={{
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}> Próxima Viagem</span>?
            </h2>
            <p style={{
              fontSize: '20px',
              color: 'rgba(219, 234, 254, 0.9)',
              marginBottom: '48px',
              lineHeight: '1.6'
            }}>
              Junte-se a mais de 5.000 brasileiros que já confiaram na Fly2Any. 
              Receba sua cotação personalizada em até 2 horas!
            </p>
            
            <div style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'center',
              marginBottom: '48px',
              flexWrap: 'wrap'
            }}>
              <button
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: 'white',
                  padding: '20px 40px',
                  borderRadius: '15px',
                  border: 'none',
                  fontSize: '18px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 15px 30px rgba(37, 99, 235, 0.4)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontFamily: 'Poppins, sans-serif'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(37, 99, 235, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 15px 30px rgba(37, 99, 235, 0.4)';
                }}
              >
                ✈️ Solicitar Cotação Agora
              </button>
              
                <a
                  href="https://wa.me/551151944717"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  padding: '20px 40px',
                  borderRadius: '15px',
                  fontSize: '18px',
                  fontWeight: '700',
                  textDecoration: 'none',
                  boxShadow: '0 15px 30px rgba(16, 185, 129, 0.4)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontFamily: 'Poppins, sans-serif'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(16, 185, 129, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 15px 30px rgba(16, 185, 129, 0.4)';
                }}
              >
                💬 Falar no WhatsApp
              </a>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px',
              flexWrap: 'wrap',
              fontSize: '14px',
              color: 'rgba(219, 234, 254, 0.7)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckIcon style={{ width: '16px', height: '16px', color: '#10b981' }} />
                Cotação 100% gratuita
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckIcon style={{ width: '16px', height: '16px', color: '#10b981' }} />
                Resposta em até 2 horas
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckIcon style={{ width: '16px', height: '16px', color: '#10b981' }} />
                Sem compromisso
              </div>
            </div>
          </div>
        </section>

        <footer style={{
          position: 'relative',
          zIndex: 10,
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(3, 7, 18, 0.95))',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '80px 0 40px 0',
          color: 'white'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 32px'
          }}>
            {/* Main Footer Content */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr',
              gap: '48px',
              marginBottom: '64px'
            }}>
              {/* Logo and Description */}
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #2563eb, #c026d3)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{
                      color: 'white',
                      fontSize: '24px',
                      fontWeight: '800',
                      fontFamily: 'Poppins, sans-serif'
                    }}>F</span>
                  </div>
                  <div>
                    <h3 style={{
                      color: 'white',
                      fontSize: '24px',
                      fontWeight: '800',
                      margin: 0,
                      fontFamily: 'Poppins, sans-serif'
                    }}>Fly2Any</h3>
                    <p style={{
                      color: 'rgba(219, 234, 254, 0.7)',
                      fontSize: '14px',
                      margin: 0
                    }}>Conectando você ao Brasil</p>
                  </div>
                </div>
                <p style={{
                  color: 'rgba(219, 234, 254, 0.8)',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  marginBottom: '24px'
                }}>
                  Especialistas em viagens Brasil-EUA há mais de 10 anos. 
                  Conectamos brasileiros nos EUA ao Brasil com atendimento personalizado e preços exclusivos.
                </p>
                
                {/* Contact Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <button
                    onClick={() => {
                      const contactForm = document.getElementById('contact-form');
                      if (contactForm) {
                        contactForm.style.display = contactForm.style.display === 'none' ? 'block' : 'none';
                      }
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(219, 234, 254, 0.8)',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'color 0.3s',
                      cursor: 'pointer',
                      padding: '0'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(219, 234, 254, 0.8)'}>
                    <MailIcon style={{ width: '20px', height: '20px' }} />
                    Enviar Mensagem
                  </button>
                  <a href="https://wa.me/551151944717" style={{
                    color: 'rgba(219, 234, 254, 0.8)',
                    textDecoration: 'none',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'color 0.3s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(219, 234, 254, 0.8)'}>
                    <ChatIcon style={{ width: '20px', height: '20px' }} />
                    WhatsApp 24/7
                  </a>
                </div>
                
                {/* Contact Form */}
                <div id="contact-form" style={{
                  display: 'none',
                  marginTop: '24px',
                  padding: '24px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <h4 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    marginBottom: '16px',
                    color: 'white',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    Envie sua Mensagem
                  </h4>
                  <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input
                      type="text"
                      placeholder="Seu Nome"
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                    <input
                      type="email"
                      placeholder="Seu Email"
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                    <textarea
                      placeholder="Sua Mensagem"
                      rows={4}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        fontSize: '14px',
                        outline: 'none',
                        resize: 'vertical'
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      Enviar Mensagem
                    </button>
                  </form>
                </div>
              </div>

              {/* Services */}
              <div>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  marginBottom: '24px',
                  color: 'white',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  Nossos Serviços
                </h4>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  {[
                    { name: 'Passagens Aéreas', href: '/', icon: '✈️' },
                    { name: 'Hotéis no Brasil', href: '/', icon: '🏨' },
                    { name: 'Aluguel de Carros', href: '/', icon: '🚗' },
                    { name: 'Passeios e Tours', href: '/', icon: '🗺️' },
                    { name: 'Seguro Viagem', href: '/', icon: '🛡️' }
                  ].map((service, index) => (
                    <li key={index} style={{ marginBottom: '12px' }}>
                      <Link href={service.href} style={{
                        color: 'rgba(219, 234, 254, 0.8)',
                        textDecoration: 'none',
                        fontSize: '15px',
                        transition: 'color 0.3s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(219, 234, 254, 0.8)'}>
                        <span style={{ fontSize: '16px' }}>{service.icon}</span>
                        {service.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  marginBottom: '24px',
                  color: 'white',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  Suporte
                </h4>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  {[
                    { name: 'Como Funciona', href: '/como-funciona' },
                    { name: 'FAQ', href: '/faq' },
                    { name: 'Contato', href: '/contato' },
                    { name: 'Sobre Nós', href: '/sobre' },
                    { name: 'Blog', href: '/blog' }
                  ].map((item, index) => (
                    <li key={index} style={{ marginBottom: '12px' }}>
                      <Link href={item.href} style={{
                        color: 'rgba(219, 234, 254, 0.8)',
                        textDecoration: 'none',
                        fontSize: '15px',
                        transition: 'color 0.3s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(219, 234, 254, 0.8)'}>
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  marginBottom: '24px',
                  color: 'white',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  Legal
                </h4>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  {[
                    { name: 'Política de Privacidade', href: '/politica-privacidade' },
                    { name: 'Termos de Uso', href: '/termos-uso' },
                    { name: 'Cookies', href: '#' },
                    { name: 'Segurança', href: '#' }
                  ].map((item, index) => (
                    <li key={index} style={{ marginBottom: '12px' }}>
                      <Link href={item.href} style={{
                        color: 'rgba(219, 234, 254, 0.8)',
                        textDecoration: 'none',
                        fontSize: '15px',
                        transition: 'color 0.3s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(219, 234, 254, 0.8)'}>
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                
                {/* Trust Badges */}
                <div style={{ marginTop: '32px' }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      color: '#10b981',
                      textAlign: 'center',
                      fontWeight: '600'
                    }}>
                      🔒 SSL Certificado
                    </div>
                    <div style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      color: '#3b82f6',
                      textAlign: 'center',
                      fontWeight: '600'
                    }}>
                      ⭐ 4.9/5 Estrelas
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer Bottom */}
            <div style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '32px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '24px'
            }}>
              <div>
                <p style={{ 
                  margin: 0,
                  color: 'rgba(147, 197, 253, 0.8)',
                  fontSize: '14px'
                }}>
                  &copy; 2024 Fly2Any. Todos os direitos reservados.
                </p>
                <p style={{
                  margin: '4px 0 0 0',
                  color: 'rgba(147, 197, 253, 0.6)',
                  fontSize: '12px'
                }}>
                  Conectando você ao mundo há 21 anos.
                </p>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <span style={{
                  color: 'rgba(147, 197, 253, 0.6)',
                  fontSize: '12px'
                }}>
                  Feito com ❤️ para brasileiros
                </span>
              </div>
            </div>
          </div>
        </footer>

        {/* Success Toast */}
        {showSuccessToast && (
          <div style={{
            position: 'fixed',
            top: isMobile ? '16px' : '24px',
            right: isMobile ? '16px' : '24px',
            left: isMobile ? '16px' : 'auto',
            zIndex: 9999,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            padding: isMobile ? '16px' : '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: isMobile ? '14px' : '16px',
            fontWeight: '600',
            maxWidth: isMobile ? 'none' : '400px',
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
        )}

        {/* Floating Chat Buttons */}
        <FloatingChat />

        {/* Lead Capture Modal */}
        <LeadCaptureSimple
          isOpen={showLeadCapture}
          onClose={() => setShowLeadCapture(false)}
          context="popup"
        />
      </div>
    </>
  );
}
