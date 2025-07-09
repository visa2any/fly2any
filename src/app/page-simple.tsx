'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { trackFormSubmit, trackQuoteRequest, trackButtonClick } from '@/lib/analytics';
import { FlightIcon, HotelIcon, CarIcon, TourIcon, InsuranceIcon, PlusIcon, MinusIcon, CalendarIcon, UsersIcon, LocationIcon, ClockIcon, ArrowRightIcon, ArrowLeftIcon, PhoneIcon, MailIcon, ChatIcon, CheckIcon, StarIcon } from '@/components/Icons';
import Logo from '@/components/Logo';
import CityAutocomplete from '@/components/CityAutocomplete';
import DatePicker from '@/components/DatePicker';
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
}

interface FormData {
  selectedServices: ServiceFormData[];
  currentServiceIndex: number;
  quotationMode: 'individual' | 'multiple';
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
  const [isPassengerDropdownOpen, setIsPassengerDropdownOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    selectedServices: [],
    currentServiceIndex: 0,
    quotationMode: 'individual',
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

  const [showQuotationModeSelection, setShowQuotationModeSelection] = useState(true);
  const [isAddingService, setIsAddingService] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 1024);
      }
    };
    checkMobile();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
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
    setShowQuotationModeSelection(false);
    setIsAddingService(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Track conversion events
      trackFormSubmit('quote_request', formData);
      trackQuoteRequest(formData);

      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert('🎉 Formulário enviado! Nossa equipe entrará em contato em até 2 horas.');
    } catch (error) {
      alert('❌ Erro ao enviar formulário. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e40af 0%, #a21caf 50%, #713f12 100%)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
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
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Logo size="md" showText={true} />
          </div>
        </header>

        {/* Main Content */}
        <section style={{
          position: 'relative',
          zIndex: 10,
          padding: '80px 24px'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '64px',
            alignItems: 'center'
          }}>
            {/* Left Side - Content */}
            <div style={{
              color: 'white'
            }}>
              <h1 style={{
                fontSize: isMobile ? '36px' : '64px',
                fontWeight: 'bold',
                fontFamily: 'Poppins, sans-serif',
                lineHeight: '1.2',
                margin: '0 0 24px 0'
              }}>
                Sua Viagem dos <br />
                <span style={{
                  background: 'linear-gradient(135deg, #facc15, #f59e0b)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Sonhos
                </span> ao Brasil
              </h1>
              <p style={{
                fontSize: '20px',
                color: 'rgba(219, 234, 254, 0.9)',
                lineHeight: '1.6',
                maxWidth: '500px'
              }}>
                Conectamos brasileiros nos EUA ao Brasil com atendimento personalizado e preços exclusivos.
              </p>
            </div>

            {/* Right Side - Form */}
            <div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                padding: '32px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 35px 60px -12px rgba(0, 0, 0, 0.3)'
              }}>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  fontFamily: 'Poppins, sans-serif',
                  margin: '0 0 8px 0'
                }}>
                  Cotação Gratuita em 2 Horas
                </h3>
                <p style={{
                  color: '#6b7280',
                  margin: '0 0 24px 0'
                }}>
                  Preencha os dados e receba as melhores ofertas
                </p>

                <form onSubmit={handleSubmit}>
                  {/* Step 1: Service Selection */}
                  {currentStep === 1 && (
                    <div>
                      <label style={{ fontWeight: 500, marginBottom: '16px', display: 'block' }}>
                        Qual serviço você deseja cotar?
                      </label>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                        <button type="button" onClick={() => addNewService('voos')} style={{ 
                          padding: '8px 12px', 
                          borderRadius: '8px', 
                          border: '1px solid #e5e7eb', 
                          background: '#f3f4f6', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <FlightIcon style={{ width: '18px', height: '18px' }} /> Voos
                        </button>
                        <button type="button" onClick={() => addNewService('hoteis')} style={{ 
                          padding: '8px 12px', 
                          borderRadius: '8px', 
                          border: '1px solid #e5e7eb', 
                          background: '#f3f4f6', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <HotelIcon style={{ width: '18px', height: '18px' }} /> Hotéis
                        </button>
                        <button type="button" onClick={() => addNewService('carros')} style={{ 
                          padding: '8px 12px', 
                          borderRadius: '8px', 
                          border: '1px solid #e5e7eb', 
                          background: '#f3f4f6', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <CarIcon style={{ width: '18px', height: '18px' }} /> Carros
                        </button>
                        <button type="button" onClick={() => addNewService('passeios')} style={{ 
                          padding: '8px 12px', 
                          borderRadius: '8px', 
                          border: '1px solid #e5e7eb', 
                          background: '#f3f4f6', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <TourIcon style={{ width: '18px', height: '18px' }} /> Passeios
                        </button>
                        <button type="button" onClick={() => addNewService('seguro')} style={{ 
                          padding: '8px 12px', 
                          borderRadius: '8px', 
                          border: '1px solid #e5e7eb', 
                          background: '#f3f4f6', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <InsuranceIcon style={{ width: '18px', height: '18px' }} /> Seguro
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Service Details */}
                  {currentStep === 2 && getCurrentService() && (
                    <div>
                      <h4 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>
                        Configurando: {getCurrentService()?.serviceType}
                      </h4>
                      
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Origem</label>
                        <CityAutocomplete
                          value={getCurrentService()?.origem || ''}
                          onChange={value => updateCurrentService({ origem: value })}
                          cities={cities}
                          placeholder="Cidade de origem"
                        />
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Destino</label>
                        <CityAutocomplete
                          value={getCurrentService()?.destino || ''}
                          onChange={value => updateCurrentService({ destino: value })}
                          cities={cities}
                          placeholder="Cidade de destino"
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Data de Ida</label>
                          <DatePicker
                            value={getCurrentService()?.dataIda || ''}
                            onChange={value => updateCurrentService({ dataIda: value })}
                            placeholder="Selecione a data"
                            label=""
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Data de Volta</label>
                          <DatePicker
                            value={getCurrentService()?.dataVolta || ''}
                            onChange={value => updateCurrentService({ dataVolta: value })}
                            placeholder="Selecione a data"
                            label=""
                          />
                        </div>
                      </div>

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
                        <button type="button" onClick={() => setCurrentStep(3)} style={{ 
                          padding: '8px 16px',
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}>
                          Continuar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Personal Information */}
                  {currentStep === 3 && (
                    <div>
                      <h4 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>Seus Dados</h4>
                      
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Nome</label>
                        <input
                          type="text"
                          value={formData.nome}
                          onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                          style={{ 
                            width: '100%', 
                            padding: '8px', 
                            border: '1px solid #d1d5db',
                            borderRadius: '8px'
                          }}
                          placeholder="Seu nome"
                        />
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          style={{ 
                            width: '100%', 
                            padding: '8px', 
                            border: '1px solid #d1d5db',
                            borderRadius: '8px'
                          }}
                          placeholder="Seu email"
                        />
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Telefone</label>
                        <input
                          type="text"
                          value={formData.telefone}
                          onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                          style={{ 
                            width: '100%', 
                            padding: '8px', 
                            border: '1px solid #d1d5db',
                            borderRadius: '8px'
                          }}
                          placeholder="Seu telefone"
                        />
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
                        <button type="submit" disabled={isSubmitting} style={{ 
                          padding: '8px 16px',
                          background: isSubmitting ? '#9ca3af' : '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: isSubmitting ? 'not-allowed' : 'pointer'
                        }}>
                          {isSubmitting ? 'Enviando...' : 'Enviar Cotação'}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}