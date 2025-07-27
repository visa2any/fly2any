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
import ResponsiveHeader from '@/components/ResponsiveHeader';
import Footer from '@/components/Footer';
import GlobalMobileStyles from '@/components/GlobalMobileStyles';
import CityAutocomplete from '@/components/CityAutocomplete';
import DatePicker from '@/components/DatePicker';
import PhoneInput from '@/components/PhoneInputSimple';
import ChatAgent from '@/components/ChatAgent';
import FloatingChat from '@/components/FloatingChat';
import LeadCaptureSimple from '@/components/LeadCaptureSimple';
import NewsletterCapture from '@/components/NewsletterCapture';
import ExitIntentPopup from '@/components/ExitIntentPopup';
import { cities } from '@/data/cities';

interface ServiceFormData {
  serviceType: 'vuelos' | 'hoteles' | 'autos' | 'tours' | 'seguro';
  completed: boolean;
  // Datos de viaje
  origen: string;
  destino: string;
  fechaSalida: string;
  fechaRegreso: string;
  tipoViaje: 'ida-vuelta' | 'solo-ida' | 'multiples-ciudades';
  claseVuelo: 'economica' | 'premium' | 'ejecutiva' | 'primera';
  adultos: number;
  ninos: number;
  bebes: number;
  // Preferencias de vuelo
  aerolineaPreferida: string;
  horarioPreferido: 'manana' | 'tarde' | 'noche' | 'cualquiera';
  escalas: 'sin-escalas' | 'una-escala' | 'cualquiera';
  // Datos específicos de hoteles
  checkin?: string;
  checkout?: string;
  habitaciones?: number;
  categoriaHotel?: string;
  // Datos específicos de autos
  lugarRecogida?: string;
  fechaRecogida?: string;
  horaRecogida?: string;
  fechaEntrega?: string;
  horaEntrega?: string;
  categoriaVehiculo?: string;
  // Datos específicos de tours
  tipoTour?: string;
  duracion?: string;
  // Datos específicos de seguro
  tipoSeguro?: string;
  cobertura?: string;
  edadViajero?: string;
  // Datos adicionales
  observaciones?: string;
  flexibilidadFechas?: boolean;
  presupuestoAproximado?: string;
}

interface FormData {
  selectedServices: ServiceFormData[];
  currentServiceIndex: number;
  // Datos de viaje
  origen: string;
  destino: string;
  fechaSalida: string;
  fechaRegreso: string;
  tipoViaje: 'ida-vuelta' | 'solo-ida' | 'multiples-ciudades';
  claseVuelo: 'economica' | 'premium' | 'ejecutiva' | 'primera';
  adultos: number;
  ninos: number;
  bebes: number;
  // Preferencias de vuelo
  aerolineaPreferida: string;
  horarioPreferido: 'manana' | 'tarde' | 'noche' | 'cualquiera';
  escalas: 'sin-escalas' | 'una-escala' | 'cualquiera';
  // Datos personales (compartidos entre todos los servicios)
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  whatsapp: string;
  nacionalidad: string;
  // Preferencias de viaje
  presupuestoAproximado: string;
  flexibilidadFechas: boolean;
  solicitudesEspeciales: string;
  // Preferencias de contacto
  contactoPreferido: 'email' | 'telefono' | 'whatsapp';
  mejorHoraLlamar: string;
}

export default function SpanishHomePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAddingService, setIsAddingService] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    selectedServices: [],
    currentServiceIndex: 0,
    // Datos de viaje
    origen: '',
    destino: '',
    fechaSalida: '',
    fechaRegreso: '',
    tipoViaje: 'ida-vuelta',
    claseVuelo: 'economica',
    adultos: 1,
    ninos: 0,
    bebes: 0,
    // Preferencias de vuelo
    aerolineaPreferida: '',
    horarioPreferido: 'cualquiera',
    escalas: 'cualquiera',
    // Datos personales
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    whatsapp: '',
    nacionalidad: 'AR',
    // Preferencias de viaje
    presupuestoAproximado: '',
    flexibilidadFechas: false,
    solicitudesEspeciales: '',
    // Preferencias de contacto
    contactoPreferido: 'email',
    mejorHoraLlamar: ''
  });

  useEffect(() => {
    setIsVisible(true);
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const addService = (serviceType: ServiceFormData['serviceType']) => {
    const newService: ServiceFormData = {
      serviceType,
      completed: false,
      origen: formData.origen,
      destino: formData.destino,
      fechaSalida: formData.fechaSalida,
      fechaRegreso: formData.fechaRegreso,
      tipoViaje: formData.tipoViaje,
      claseVuelo: formData.claseVuelo,
      adultos: formData.adultos,
      ninos: formData.ninos,
      bebes: formData.bebes,
      aerolineaPreferida: formData.aerolineaPreferida,
      horarioPreferido: formData.horarioPreferido,
      escalas: formData.escalas
    };

    setFormData(prev => ({
      ...prev,
      selectedServices: [...prev.selectedServices, newService],
      currentServiceIndex: prev.selectedServices.length
    }));
    
    setIsAddingService(false);
    setCurrentStep(2);
  };

  const getCurrentService = () => {
    return formData.selectedServices[formData.currentServiceIndex];
  };

  const updateCurrentService = (updates: Partial<ServiceFormData>) => {
    setFormData(prev => {
      const newServices = [...prev.selectedServices];
      newServices[prev.currentServiceIndex] = {
        ...newServices[prev.currentServiceIndex],
        ...updates
      };
      return {
        ...prev,
        selectedServices: newServices
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Track analytics
      trackFormSubmit('quote_request', {
        services: formData.selectedServices.map(s => s.serviceType),
        origen: formData.origen,
        destino: formData.destino,
        nacionalidad: formData.nacionalidad
      });

      const response = await fetch('/api/quotes/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          language: 'es',
          source: 'homepage',
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        setShowSuccess(true);
        trackQuoteRequest(formData.selectedServices.map(s => s.serviceType).join(','));
        
        // Reset form
        setFormData({
          selectedServices: [],
          currentServiceIndex: 0,
          origen: '',
          destino: '',
          fechaSalida: '',
          fechaRegreso: '',
          tipoViaje: 'ida-vuelta',
          claseVuelo: 'economica',
          adultos: 1,
          ninos: 0,
          bebes: 0,
          aerolineaPreferida: '',
          horarioPreferido: 'cualquiera',
          escalas: 'cualquiera',
          nombre: '',
          apellido: '',
          email: '',
          telefono: '',
          whatsapp: '',
          nacionalidad: 'AR',
          presupuestoAproximado: '',
          flexibilidadFechas: false,
          solicitudesEspeciales: '',
          contactoPreferido: 'email',
          mejorHoraLlamar: ''
        });
        setCurrentStep(1);
        setIsAddingService(true);
      } else {
        throw new Error('Failed to submit quote request');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Hubo un error al enviar tu solicitud. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e40af 0%, #a21caf 50%, #713f12 100%)',
    position: 'relative' as const,
    overflow: 'hidden'
  };

  const floatingElement1Style = {
    position: 'absolute' as const,
    top: '-80px',
    left: '-80px',
    width: '500px',
    height: '500px',
    background: 'rgba(29, 78, 216, 0.3)',
    borderRadius: '50%',
    filter: 'blur(80px)',
    zIndex: 1
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
      <GlobalMobileStyles />
      <div style={containerStyle} className="mobile-overflow-hidden">
        {/* Floating Background Elements */}
        <div style={floatingElement1Style}></div>
        <div style={floatingElement2Style}></div>
        <div style={floatingElement3Style}></div>

        {/* Responsive Header */}
        <ResponsiveHeader style={headerStyle} />

        {/* Main Content */}
        <main>
        <section style={{
          position: 'relative',
          zIndex: 10,
          padding: isMobile ? '40px 0 60px 0' : '60px 0 80px 0'
        }} className="mobile-section">
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: isMobile ? '0 16px' : '0 32px',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '40px' : '64px',
            alignItems: 'center'
          }} className="mobile-container mobile-grid-single">
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
                }}>🌎 Conectándote al mundo por 21 años</span>
              </div>
              <h1 style={{
                fontSize: isMobile ? '32px' : '64px',
                fontWeight: '700',
                fontFamily: 'Poppins, sans-serif',
                lineHeight: '1.2',
                margin: '0 0 24px 0',
                letterSpacing: '-0.01em',
                maxWidth: '100%',
                textAlign: isMobile ? 'center' : 'left',
                color: 'white'
              }} className="mobile-title">
                Fly2Any, tu puerta de entrada entre EUA, Brasil y el Mundo!
              </h1>
              <p style={{
                fontSize: isMobile ? '18px' : '22px',
                color: 'rgba(219, 234, 254, 0.95)',
                lineHeight: '1.7',
                maxWidth: isMobile ? '100%' : '520px',
                marginBottom: isMobile ? '32px' : '40px',
                fontWeight: '400',
                textAlign: isMobile ? 'center' : 'left'
              }} className="mobile-subtitle">
                Conectamos latinoamericanos a Brasil y al mundo 
                con servicio personalizado, precios exclusivos y 21 años de experiencia.
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
                    +10 años experiencia
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
                    4.9/5 estrellas
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
                gap: isMobile ? '12px' : '16px',
                marginBottom: isMobile ? '32px' : '40px',
                flexWrap: 'wrap',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'center' : 'flex-start'
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
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: 'white',
                    padding: isMobile ? '16px 24px' : '16px 32px',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    width: isMobile ? '100%' : 'auto',
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
                  className="mobile-full-width"
                >
                  <FlightIcon style={{ width: '20px', height: '20px' }} />
                  Cotización Gratis en 2 Horas
                </button>

                <Link
                  href="/es/contacto"
                  style={{
                    background: 'linear-gradient(135deg, #25d366, #128c7e)',
                    color: 'white',
                    padding: isMobile ? '16px 24px' : '16px 32px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 10px 25px rgba(37, 211, 102, 0.3)',
                    transition: 'all 0.3s ease',
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(37, 211, 102, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(37, 211, 102, 0.3)';
                  }}
                  className="mobile-full-width"
                >
                  <ChatIcon style={{ width: '20px', height: '20px' }} />
                  WhatsApp
                </Link>

                <Link
                  href="mailto:info@fly2any.com"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    color: 'white',
                    padding: isMobile ? '16px 24px' : '16px 32px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
                    transition: 'all 0.3s ease',
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.3)';
                  }}
                  className="mobile-full-width"
                >
                  <MailIcon style={{ width: '20px', height: '20px' }} />
                  Enviar Email
                </Link>
              </div>
              
              {/* Customer Statistics */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
                gap: '24px',
                marginTop: '32px'
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fbbf24' }}>15,000+</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>Viajeros Felices</div>
                </div>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fbbf24' }}>4.9/5</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>Calificación</div>
                </div>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fbbf24' }}>24/7</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>Soporte</div>
                </div>
              </div>
            </div>

            {/* Right Side - Quote Form */}
            <div style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
              transitionDelay: '0.2s'
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
              }} className="mobile-full-width">
                {/* Success Message */}
                {showSuccess && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(255, 255, 255, 0.98)',
                    borderRadius: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '32px',
                    zIndex: 1000
                  }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '24px'
                    }}>
                      <CheckIcon style={{ width: '40px', height: '40px', color: 'white' }} />
                    </div>
                    <h3 style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#1f2937',
                      marginBottom: '12px'
                    }}>
                      ¡Solicitud Enviada!
                    </h3>
                    <p style={{
                      color: '#6b7280',
                      marginBottom: '24px',
                      lineHeight: '1.5'
                    }}>
                      ¡Gracias! Te enviaremos tu cotización personalizada en 2 horas.
                    </p>
                    <button
                      onClick={() => setShowSuccess(false)}
                      style={{
                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Hacer Otra Cotización
                    </button>
                  </div>
                )}

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
                  ✨ GRATIS
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
                  Tu cotización en 2 horas, mejor precio garantizado!
                </h3>
                <p style={{
                  color: '#6b7280',
                  margin: '0 0 24px 0',
                  fontSize: '16px',
                  lineHeight: '1.5'
                }}>
                  Completa los datos y recibe las <strong>mejores ofertas del mercado</strong> con precios inmejorables
                </p>

                <form onSubmit={handleSubmit}>
                  {/* Step 1: Service Selection */}
                  {currentStep === 1 && (
                    <div>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '16px',
                        textAlign: 'center'
                      }}>
                        ¿Qué servicios necesitas?
                      </h3>
                      <p style={{
                        color: '#6b7280',
                        fontSize: '14px',
                        textAlign: 'center',
                        marginBottom: '24px'
                      }}>
                        Selecciona uno o más servicios (máx. 3)
                      </p>

                      {/* Service Selection */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '12px',
                        marginBottom: '24px'
                      }}>
                        {(['vuelos', 'hoteles', 'autos', 'tours', 'seguro'] as const).map((serviceType) => {
                          const isSelected = formData.selectedServices.some(s => s.serviceType === serviceType);
                          const isMaxServices = formData.selectedServices.length >= 3 && !isSelected;
                          
                          return (
                            <button
                              key={serviceType}
                              type="button"
                              disabled={isMaxServices}
                              onClick={() => {
                                if (isSelected) {
                                  // Remove service
                                  setFormData(prev => ({
                                    ...prev,
                                    selectedServices: prev.selectedServices.filter(s => s.serviceType !== serviceType)
                                  }));
                                } else if (!isMaxServices) {
                                  // Add service
                                  addService(serviceType);
                                }
                              }}
                              style={{
                                background: isSelected ? 'linear-gradient(135deg, #10b981, #059669)' : 
                                          isMaxServices ? '#f3f4f6' : 'white',
                                color: isSelected ? 'white' : isMaxServices ? '#9ca3af' : '#374151',
                                border: isSelected ? 'none' : '2px solid #e5e7eb',
                                borderColor: isSelected ? 'transparent' : isMaxServices ? '#e5e7eb' : '#e5e7eb',
                                borderRadius: '12px',
                                padding: '16px 12px',
                                cursor: isMaxServices ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s',
                                fontSize: '14px',
                                fontWeight: '500',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: isSelected ? '0 4px 12px rgba(16, 185, 129, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.05)'
                              }}
                              onMouseEnter={(e) => {
                                if (!isSelected && !isMaxServices) {
                                  e.currentTarget.style.transform = 'scale(1.02)';
                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
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
                              {serviceType === 'vuelos' && (
                                <>
                                  <FlightIcon style={{ width: '18px', height: '18px' }} /> 
                                  Vuelos
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
                                    Más Popular
                                  </span>
                                </>
                              )}
                              {serviceType === 'hoteles' && (
                                <>
                                  <HotelIcon style={{ width: '18px', height: '18px' }} /> Hoteles
                                </>
                              )}
                              {serviceType === 'autos' && (
                                <>
                                  <CarIcon style={{ width: '18px', height: '18px' }} /> Autos
                                </>
                              )}
                              {serviceType === 'tours' && (
                                <>
                                  <TourIcon style={{ width: '18px', height: '18px' }} /> Tours
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
                              + Agregar Otro Servicio
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
                              ✓ Finalizar ({formData.selectedServices.length} servicio{formData.selectedServices.length > 1 ? 's' : ''})
                            </button>
                          </div>
                        </div>
                      )}
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
                          {getCurrentService()?.serviceType === 'vuelos' && '✈️'}
                          {getCurrentService()?.serviceType === 'hoteles' && '🏨'}
                          {getCurrentService()?.serviceType === 'autos' && '🚗'}
                          {getCurrentService()?.serviceType === 'tours' && '🎯'}
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
                              getCurrentService()?.serviceType === 'vuelos' ? 'Vuelos' :
                              getCurrentService()?.serviceType === 'hoteles' ? 'Hoteles' :
                              getCurrentService()?.serviceType === 'autos' ? 'Autos' :
                              getCurrentService()?.serviceType === 'tours' ? 'Tours' :
                              'Seguro de Viaje'
                            }
                          </h3>
                          <p style={{
                            fontSize: '12px',
                            color: '#64748b',
                            margin: 0
                          }}>
                            Servicio {formData.currentServiceIndex + 1} de {formData.selectedServices.length}
                          </p>
                        </div>
                      </div>
                      
                      {/* Service-specific forms */}
                      {getCurrentService()?.serviceType === 'vuelos' && (
                        <>
                          {/* Origen y Destino en la misma línea */}
                          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 500 }}>
                                <LocationIcon style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                                Origen
                              </label>
                              <CityAutocomplete
                                value={getCurrentService()?.origen || ''}
                                onChange={value => updateCurrentService({ origen: value })}
                                cities={cities}
                                placeholder="Ciudad de origen"
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
                                placeholder="Ciudad de destino"
                                label=""
                                iconColor="#3b82f6"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {getCurrentService()?.serviceType === 'hoteles' && (
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
                              placeholder="Ciudad de destino"
                              label=""
                              iconColor="#3b82f6"
                            />
                          </div>
                        </>
                      )}

                      {/* Fechas */}
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 500 }}>
                            <CalendarIcon style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                            {getCurrentService()?.serviceType === 'vuelos' ? 'Salida' : 
                             getCurrentService()?.serviceType === 'hoteles' ? 'Check-in' : 
                             'Fecha Inicio'}
                          </label>
                          <DatePicker
                            value={getCurrentService()?.fechaSalida || ''}
                            onChange={value => updateCurrentService({ 
                              fechaSalida: value, 
                              checkin: value 
                            })}
                            placeholder="Seleccionar fecha"
                            iconColor="#3b82f6"
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 500 }}>
                            <CalendarIcon style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                            {getCurrentService()?.serviceType === 'vuelos' ? 'Regreso' : 
                             getCurrentService()?.serviceType === 'hoteles' ? 'Check-out' : 
                             'Fecha Fin'}
                          </label>
                          <DatePicker
                            value={getCurrentService()?.fechaRegreso || ''}
                            onChange={value => updateCurrentService({ 
                              fechaRegreso: value, 
                              checkout: value 
                            })}
                            placeholder="Seleccionar fecha"
                            iconColor="#3b82f6"
                          />
                        </div>
                      </div>

                      {/* Viajeros/Huéspedes */}
                      <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 500 }}>
                          <UsersIcon style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                          {getCurrentService()?.serviceType === 'hoteles' ? 'Huéspedes' : 'Viajeros'}
                        </label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>Adultos</label>
                            <select
                              value={getCurrentService()?.adultos || 1}
                              onChange={(e) => updateCurrentService({ adultos: parseInt(e.target.value) })}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '14px',
                                background: 'white'
                              }}
                            >
                              {[1,2,3,4,5,6,7,8].map(num => (
                                <option key={num} value={num}>{num}</option>
                              ))}
                            </select>
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>Niños</label>
                            <select
                              value={getCurrentService()?.ninos || 0}
                              onChange={(e) => updateCurrentService({ ninos: parseInt(e.target.value) })}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '14px',
                                background: 'white'
                              }}
                            >
                              {[0,1,2,3,4].map(num => (
                                <option key={num} value={num}>{num}</option>
                              ))}
                            </select>
                          </div>
                          {getCurrentService()?.serviceType === 'vuelos' && (
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>Bebés</label>
                              <select
                                value={getCurrentService()?.bebes || 0}
                                onChange={(e) => updateCurrentService({ bebes: parseInt(e.target.value) })}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  border: '2px solid #e5e7eb',
                                  borderRadius: '8px',
                                  fontSize: '14px',
                                  background: 'white'
                                }}
                              >
                                {[0,1,2].map(num => (
                                  <option key={num} value={num}>{num}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Service Navigation Buttons */}
                      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            // Mark current service as completed
                            updateCurrentService({ completed: true });
                            
                            // Check if there are more services to configure
                            const nextIncompleteIndex = formData.selectedServices.findIndex((service, index) => 
                              index > formData.currentServiceIndex && !service.completed
                            );
                            
                            if (nextIncompleteIndex !== -1) {
                              // Go to next incomplete service
                              setFormData(prev => ({ ...prev, currentServiceIndex: nextIncompleteIndex }));
                            } else {
                              // All services completed, go to personal info
                              setCurrentStep(3);
                            }
                          }}
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
                          {formData.selectedServices.findIndex((service, index) => 
                            index > formData.currentServiceIndex && !service.completed
                          ) !== -1 ? 'Siguiente Servicio' : 'Continuar a Información de Contacto'}
                        </button>
                        
                        {formData.selectedServices.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            style={{
                              background: 'transparent',
                              color: '#6b7280',
                              border: '2px solid #e5e7eb',
                              padding: '12px 20px',
                              borderRadius: '12px',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            Volver a Servicios
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Personal Information */}
                  {currentStep === 3 && (
                    <div>
                      <div style={{
                        background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '24px',
                        border: '1px solid #22c55e',
                        textAlign: 'center'
                      }}>
                        <h3 style={{
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: '#15803d',
                          margin: '0 0 4px 0'
                        }}>
                          ¡Casi Listo! 🎉
                        </h3>
                        <p style={{
                          fontSize: '12px',
                          color: '#16a34a',
                          margin: 0
                        }}>
                          Solo necesitamos tu información de contacto para enviar la cotización
                        </p>
                      </div>

                      {/* Campos de nombre */}
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: '#374151' }}>
                            Nombre *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.nombre}
                            onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                            placeholder="Juan"
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: '2px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '14px',
                              transition: 'border-color 0.3s',
                              boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: '#374151' }}>
                            Apellido *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.apellido}
                            onChange={(e) => setFormData(prev => ({ ...prev, apellido: e.target.value }))}
                            placeholder="Pérez"
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: '2px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '14px',
                              transition: 'border-color 0.3s',
                              boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 500 }}>
                          <MailIcon style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="juan@ejemplo.com"
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px',
                            transition: 'border-color 0.3s',
                            boxSizing: 'border-box'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        />
                      </div>

                      {/* Teléfono */}
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 500 }}>
                          <PhoneIcon style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                          Teléfono *
                        </label>
                        <PhoneInput
                          value={formData.telefono}
                          onChange={(value) => setFormData(prev => ({ ...prev, telefono: value }))}
                          placeholder="+54 11 1234-5678"
                          iconColor="#3b82f6"
                        />
                      </div>

                      {/* Nacionalidad */}
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: '#374151' }}>
                          Nacionalidad
                        </label>
                        <select
                          value={formData.nacionalidad}
                          onChange={(e) => setFormData(prev => ({ ...prev, nacionalidad: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px',
                            background: 'white',
                            boxSizing: 'border-box'
                          }}
                        >
                          <option value="AR">Argentina</option>
                          <option value="MX">México</option>
                          <option value="CO">Colombia</option>
                          <option value="CL">Chile</option>
                          <option value="PE">Perú</option>
                          <option value="UY">Uruguay</option>
                          <option value="EC">Ecuador</option>
                          <option value="VE">Venezuela</option>
                          <option value="BO">Bolivia</option>
                          <option value="PY">Paraguay</option>
                          <option value="Other">Otro</option>
                        </select>
                      </div>

                      {/* Solicitudes Especiales */}
                      <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: '#374151' }}>
                          Solicitudes Especiales o Notas (Opcional)
                        </label>
                        <textarea
                          value={formData.solicitudesEspeciales}
                          onChange={(e) => setFormData(prev => ({ ...prev, solicitudesEspeciales: e.target.value }))}
                          placeholder="Cualquier requerimiento especial, preferencias o preguntas..."
                          rows={3}
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px',
                            resize: 'vertical',
                            fontFamily: 'inherit',
                            boxSizing: 'border-box'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        />
                      </div>

                      {/* Navigation Buttons */}
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          style={{
                            flex: 1,
                            background: isSubmitting ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '16px 24px',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: isSubmitting ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                        >
                          {isSubmitting ? (
                            <>
                              <div style={{
                                width: '16px',
                                height: '16px',
                                border: '2px solid transparent',
                                borderTop: '2px solid white',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                              }} />
                              Enviando...
                            </>
                          ) : (
                            <>
                              <MailIcon style={{ width: '18px', height: '18px' }} />
                              Obtener Mi Cotización Gratis
                            </>
                          )}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            // Go back to service details or service selection
                            const lastIncompleteService = formData.selectedServices.findIndex(service => !service.completed);
                            if (lastIncompleteService !== -1) {
                              setFormData(prev => ({ ...prev, currentServiceIndex: lastIncompleteService }));
                              setCurrentStep(2);
                            } else {
                              setCurrentStep(1);
                            }
                          }}
                          style={{
                            background: 'transparent',
                            color: '#6b7280',
                            border: '2px solid #e5e7eb',
                            padding: '16px 20px',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          Atrás
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Destinations Section */}
        <section style={{
          position: 'relative',
          zIndex: 5,
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          padding: isMobile ? '60px 16px' : '80px 32px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{
                fontSize: isMobile ? '28px' : '36px',
                fontWeight: '700',
                color: 'white',
                marginBottom: '16px',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Destinos Populares en Brasil
              </h2>
              <p style={{
                fontSize: '18px',
                color: 'rgba(219, 234, 254, 0.9)',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                Descubre los destinos más buscados por viajeros latinoamericanos
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '24px'
            }}>
              {[
                {
                  city: 'Río de Janeiro',
                  description: 'Playas icónicas, Cristo Redentor, vida nocturna vibrante',
                  image: '🏖️',
                  price: 'desde $299'
                },
                {
                  city: 'São Paulo',
                  description: 'Centro de negocios, escena gastronómica, atracciones culturales',
                  image: '🏙️',
                  price: 'desde $349'
                },
                {
                  city: 'Salvador',
                  description: 'Centro histórico, cultura afrobrasileña, playas hermosas',
                  image: '🏛️',
                  price: 'desde $279'
                },
                {
                  city: 'Brasília',
                  description: 'Arquitectura moderna, Patrimonio de la Humanidad UNESCO',
                  image: '🏢',
                  price: 'desde $329'
                },
                {
                  city: 'Recife',
                  description: 'Paraíso tropical, arrecifes de coral, arquitectura colonial',
                  image: '🌴',
                  price: 'desde $259'
                },
                {
                  city: 'Fortaleza',
                  description: 'Playas impresionantes, dunas de arena, gastronomía marina',
                  image: '⛱️',
                  price: 'desde $269'
                }
              ].map((destination, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontSize: '48px', marginBottom: '16px', textAlign: 'center' }}>
                    {destination.image}
                  </div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '8px',
                    textAlign: 'center'
                  }}>
                    {destination.city}
                  </h3>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: '1.5',
                    marginBottom: '16px',
                    textAlign: 'center',
                    fontSize: '14px'
                  }}>
                    {destination.description}
                  </p>
                  <div style={{
                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                    color: '#1f2937',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    textAlign: 'center',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    {destination.price}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section style={{
          position: 'relative',
          zIndex: 5,
          padding: isMobile ? '60px 16px' : '80px 32px'
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{
                fontSize: isMobile ? '28px' : '36px',
                fontWeight: '700',
                color: 'white',
                marginBottom: '16px',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Por Qué Latinoamericanos Eligen Fly2Any
              </h2>
              <p style={{
                fontSize: '18px',
                color: 'rgba(219, 234, 254, 0.9)',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                La agencia de viajes más confiable para viajes Latinoamérica-Brasil
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '32px'
            }}>
              {[
                {
                  icon: '🌎',
                  title: 'Equipo Latinoamericano',
                  description: 'Equipo hispanohablante con base en Miami, disponible 7 días a la semana'
                },
                {
                  icon: '🇧🇷',
                  title: 'Expertos en Brasil',
                  description: '21+ años especializándose exclusivamente en viajes a Brasil y conocimiento cultural'
                },
                {
                  icon: '💰',
                  title: 'Garantía del Mejor Precio',
                  description: 'Comparamos múltiples aerolíneas y proveedores para encontrarte las mejores ofertas'
                },
                {
                  icon: '📋',
                  title: 'Asistencia con Visa',
                  description: 'Ayuda completa con requisitos de visa para Brasil para ciudadanos latinoamericanos'
                },
                {
                  icon: '🛡️',
                  title: 'Soporte 24/7',
                  description: 'Asistencia de emergencia durante tu viaje cuando más nos necesitas'
                },
                {
                  icon: '⭐',
                  title: 'Historial Comprobado',
                  description: '15,000+ viajeros felices y calificación 4.9/5 de clientes verificados'
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    padding: '32px 24px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                    {feature.icon}
                  </div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '12px'
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section style={{
          position: 'relative',
          zIndex: 5,
          background: 'rgba(250, 204, 21, 0.1)',
          backdropFilter: 'blur(10px)',
          padding: isMobile ? '60px 16px' : '80px 32px',
          borderTop: '1px solid rgba(250, 204, 21, 0.3)',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: isMobile ? '28px' : '36px',
              fontWeight: '700',
              color: 'white',
              marginBottom: '16px',
              fontFamily: 'Poppins, sans-serif'
            }}>
              ¿Listo para Descubrir Brasil?
            </h2>
            <p style={{
              fontSize: '18px',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '32px',
              lineHeight: '1.5'
            }}>
              Únete a miles de latinoamericanos que confiaron en nosotros para su aventura brasileña. 
              ¡Obtén tu cotización personalizada en solo 2 horas!
            </p>
            
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center'
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
                  background: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
                  color: '#1f2937',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  width: isMobile ? '100%' : 'auto'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                }}
              >
                Comenzar a Planificar Mi Viaje
              </button>
              
              <Link
                href="mailto:info@fly2any.com"
                style={{
                  background: 'transparent',
                  color: 'white',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontSize: '18px',
                  fontWeight: '600',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s',
                  display: 'inline-block',
                  width: isMobile ? '100%' : 'auto',
                  boxSizing: 'border-box',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
              >
                Enviar Email
              </Link>
            </div>
          </div>
        </section>
        </main>

        {/* Interactive Components */}
        <FloatingChat />
        <ChatAgent />
        <LeadCaptureSimple />
        <NewsletterCapture />
        <ExitIntentPopup />

        {/* Footer */}
        <Footer />
      </div>

      {/* Schema.org JSON-LD for Spanish page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": "https://fly2any.com/es",
            "url": "https://fly2any.com/es",
            "name": "Fly2Any - Especialistas en Viajes a Brasil para Latinoamericanos",
            "description": "Agencia de viajes especialista en Brasil para latinoamericanos. Mejores vuelos, hoteles y servicios de viaje.",
            "inLanguage": "es-419",
            "isPartOf": {
              "@type": "WebSite",
              "@id": "https://fly2any.com",
              "url": "https://fly2any.com",
              "name": "Fly2Any"
            },
            "about": {
              "@type": "TravelAgency",
              "name": "Fly2Any",
              "description": "Especialistas en viajes a Brasil para viajeros latinoamericanos"
            },
            "mainEntity": {
              "@type": "TravelAgency",
              "@id": "https://fly2any.com",
              "name": "Fly2Any - Especialistas en Viajes a Brasil",
              "description": "Agencia de viajes especialista en Brasil para latinoamericanos",
              "serviceArea": {
                "@type": "Country",
                "name": "Brazil"
              },
              "audience": {
                "@type": "Audience",
                "audienceType": "Viajeros latinoamericanos a Brasil"
              }
            }
          }),
        }}
      />

      {/* Add CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}