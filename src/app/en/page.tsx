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
  serviceType: 'flights' | 'hotels' | 'cars' | 'tours' | 'insurance';
  completed: boolean;
  // Travel data
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  tripType: 'round-trip' | 'one-way' | 'multi-city';
  flightClass: 'economy' | 'premium' | 'business' | 'first';
  adults: number;
  children: number;
  infants: number;
  // Flight preferences
  preferredAirline: string;
  preferredTime: 'morning' | 'afternoon' | 'evening' | 'any';
  stops: 'non-stop' | 'one-stop' | 'any';
  // Hotel specific data
  checkin?: string;
  checkout?: string;
  rooms?: number;
  hotelCategory?: string;
  // Car specific data
  pickupLocation?: string;
  pickupDate?: string;
  pickupTime?: string;
  dropoffDate?: string;
  dropoffTime?: string;
  vehicleCategory?: string;
  // Tour specific data
  tourType?: string;
  duration?: string;
  // Insurance specific data
  insuranceType?: string;
  coverage?: string;
  travelerAge?: string;
  // Additional data
  notes?: string;
  flexibleDates?: boolean;
  approximateBudget?: string;
}

interface FormData {
  selectedServices: ServiceFormData[];
  currentServiceIndex: number;
  // Travel data
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  tripType: 'round-trip' | 'one-way' | 'multi-city';
  flightClass: 'economy' | 'premium' | 'business' | 'first';
  adults: number;
  children: number;
  infants: number;
  // Flight preferences
  preferredAirline: string;
  preferredTime: 'morning' | 'afternoon' | 'evening' | 'any';
  stops: 'non-stop' | 'one-stop' | 'any';
  // Personal data (shared across all services)
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsapp: string;
  nationality: string;
  // Travel preferences
  approximateBudget: string;
  flexibleDates: boolean;
  specialRequests: string;
  // Contact preferences
  preferredContact: 'email' | 'phone' | 'whatsapp';
  bestTimeToCall: string;
}

export default function EnglishHomePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAddingService, setIsAddingService] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    selectedServices: [],
    currentServiceIndex: 0,
    // Travel data
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    tripType: 'round-trip',
    flightClass: 'economy',
    adults: 1,
    children: 0,
    infants: 0,
    // Flight preferences
    preferredAirline: '',
    preferredTime: 'any',
    stops: 'any',
    // Personal data
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    whatsapp: '',
    nationality: 'US',
    // Travel preferences
    approximateBudget: '',
    flexibleDates: false,
    specialRequests: '',
    // Contact preferences
    preferredContact: 'email',
    bestTimeToCall: ''
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
      origin: formData.origin,
      destination: formData.destination,
      departureDate: formData.departureDate,
      returnDate: formData.returnDate,
      tripType: formData.tripType,
      flightClass: formData.flightClass,
      adults: formData.adults,
      children: formData.children,
      infants: formData.infants,
      preferredAirline: formData.preferredAirline,
      preferredTime: formData.preferredTime,
      stops: formData.stops
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
        origin: formData.origin,
        destination: formData.destination,
        nationality: formData.nationality
      });

      const response = await fetch('/api/quotes/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          language: 'en',
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
          origin: '',
          destination: '',
          departureDate: '',
          returnDate: '',
          tripType: 'round-trip',
          flightClass: 'economy',
          adults: 1,
          children: 0,
          infants: 0,
          preferredAirline: '',
          preferredTime: 'any',
          stops: 'any',
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          whatsapp: '',
          nationality: 'US',
          approximateBudget: '',
          flexibleDates: false,
          specialRequests: '',
          preferredContact: 'email',
          bestTimeToCall: ''
        });
        setCurrentStep(1);
        setIsAddingService(true);
      } else {
        throw new Error('Failed to submit quote request');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your request. Please try again.');
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
                }}>🌎 Connecting you to the world for 21 years</span>
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
                Fly2Any, your gateway between USA, Brazil and the World!
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
                We connect Brazilians, Americans and other nationalities to Brazil and the world 
                with personalized service, exclusive prices and 21 years of experience.
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
                    +10 years experience
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
                    4.9/5 stars
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
                    +5,000 customers
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
                  Get Free Quote in 2 Hours
                </button>

                <Link
                  href="/en/contact"
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
                  Email Us
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
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>Happy Travelers</div>
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
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>Customer Rating</div>
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
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>Support</div>
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
                      Quote Request Sent!
                    </h3>
                    <p style={{
                      color: '#6b7280',
                      marginBottom: '24px',
                      lineHeight: '1.5'
                    }}>
                      Thank you! We'll send your personalized quote within 2 hours.
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
                      Get Another Quote
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
                  ✨ FREE
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
                  Your Quote in 2 hours, best price guaranteed!
                </h3>
                <p style={{
                  color: '#6b7280',
                  margin: '0 0 24px 0',
                  fontSize: '16px',
                  lineHeight: '1.5'
                }}>
                  Fill in the details and receive the <strong>best market offers</strong> with unbeatable prices
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
                        What services do you need?
                      </h3>
                      <p style={{
                        color: '#6b7280',
                        fontSize: '14px',
                        textAlign: 'center',
                        marginBottom: '24px'
                      }}>
                        Select one or more services (max 3)
                      </p>

                      {/* Service Selection */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '12px',
                        marginBottom: '24px'
                      }}>
                        {(['flights', 'hotels', 'cars', 'tours', 'insurance'] as const).map((serviceType) => {
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
                              {serviceType === 'flights' && (
                                <>
                                  <FlightIcon style={{ width: '18px', height: '18px' }} /> 
                                  Flights
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
                                    Most Popular
                                  </span>
                                </>
                              )}
                              {serviceType === 'hotels' && (
                                <>
                                  <HotelIcon style={{ width: '18px', height: '18px' }} /> Hotels
                                </>
                              )}
                              {serviceType === 'cars' && (
                                <>
                                  <CarIcon style={{ width: '18px', height: '18px' }} /> Cars
                                </>
                              )}
                              {serviceType === 'tours' && (
                                <>
                                  <TourIcon style={{ width: '18px', height: '18px' }} /> Tours
                                </>
                              )}
                              {serviceType === 'insurance' && (
                                <>
                                  <InsuranceIcon style={{ width: '18px', height: '18px' }} /> Insurance
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
                              + Add Another Service
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
                              ✓ Complete ({formData.selectedServices.length} service{formData.selectedServices.length > 1 ? 's' : ''})
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
                          {getCurrentService()?.serviceType === 'flights' && '✈️'}
                          {getCurrentService()?.serviceType === 'hotels' && '🏨'}
                          {getCurrentService()?.serviceType === 'cars' && '🚗'}
                          {getCurrentService()?.serviceType === 'tours' && '🎯'}
                          {getCurrentService()?.serviceType === 'insurance' && '🛡️'}
                        </span>
                        <div>
                          <h3 style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: '#0369a1',
                            margin: '0 0 4px 0'
                          }}>
                            Configuring: {
                              getCurrentService()?.serviceType === 'flights' ? 'Flights' :
                              getCurrentService()?.serviceType === 'hotels' ? 'Hotels' :
                              getCurrentService()?.serviceType === 'cars' ? 'Cars' :
                              getCurrentService()?.serviceType === 'tours' ? 'Tours' :
                              'Travel Insurance'
                            }
                          </h3>
                          <p style={{
                            fontSize: '12px',
                            color: '#64748b',
                            margin: 0
                          }}>
                            Service {formData.currentServiceIndex + 1} of {formData.selectedServices.length}
                          </p>
                        </div>
                      </div>
                      
                      {/* Service-specific forms */}
                      {getCurrentService()?.serviceType === 'flights' && (
                        <>
                          {/* Origin and Destination on same line */}
                          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 500 }}>
                                <LocationIcon style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                                Origin
                              </label>
                              <CityAutocomplete
                                value={getCurrentService()?.origin || ''}
                                onChange={value => updateCurrentService({ origin: value })}
                                cities={cities}
                                placeholder="Origin city"
                                label=""
                                iconColor="#3b82f6"
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 500 }}>
                                <LocationIcon style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                                Destination
                              </label>
                              <CityAutocomplete
                                value={getCurrentService()?.destination || ''}
                                onChange={value => updateCurrentService({ destination: value })}
                                cities={cities}
                                placeholder="Destination city"
                                label=""
                                iconColor="#3b82f6"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {getCurrentService()?.serviceType === 'hotels' && (
                        <>
                          {/* Destination */}
                          <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 500 }}>
                              <LocationIcon style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                              Destination
                            </label>
                            <CityAutocomplete
                              value={getCurrentService()?.destination || ''}
                              onChange={value => updateCurrentService({ destination: value })}
                              cities={cities}
                              placeholder="Destination city"
                              label=""
                              iconColor="#3b82f6"
                            />
                          </div>
                        </>
                      )}

                      {/* Dates */}
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 500 }}>
                            <CalendarIcon style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                            {getCurrentService()?.serviceType === 'flights' ? 'Departure' : 
                             getCurrentService()?.serviceType === 'hotels' ? 'Check-in' : 
                             'Start Date'}
                          </label>
                          <DatePicker
                            value={getCurrentService()?.departureDate || ''}
                            onChange={value => updateCurrentService({ 
                              departureDate: value, 
                              checkin: value 
                            })}
                            placeholder="Select date"
                            iconColor="#3b82f6"
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 500 }}>
                            <CalendarIcon style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                            {getCurrentService()?.serviceType === 'flights' ? 'Return' : 
                             getCurrentService()?.serviceType === 'hotels' ? 'Check-out' : 
                             'End Date'}
                          </label>
                          <DatePicker
                            value={getCurrentService()?.returnDate || ''}
                            onChange={value => updateCurrentService({ 
                              returnDate: value, 
                              checkout: value 
                            })}
                            placeholder="Select date"
                            iconColor="#3b82f6"
                          />
                        </div>
                      </div>

                      {/* Travelers/Guests */}
                      <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 500 }}>
                          <UsersIcon style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                          {getCurrentService()?.serviceType === 'hotels' ? 'Guests' : 'Travelers'}
                        </label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>Adults</label>
                            <select
                              value={getCurrentService()?.adults || 1}
                              onChange={(e) => updateCurrentService({ adults: parseInt(e.target.value) })}
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
                            <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>Children</label>
                            <select
                              value={getCurrentService()?.children || 0}
                              onChange={(e) => updateCurrentService({ children: parseInt(e.target.value) })}
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
                          {getCurrentService()?.serviceType === 'flights' && (
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>Infants</label>
                              <select
                                value={getCurrentService()?.infants || 0}
                                onChange={(e) => updateCurrentService({ infants: parseInt(e.target.value) })}
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
                          ) !== -1 ? 'Next Service' : 'Continue to Contact Info'}
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
                            Back to Services
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
                          Almost Done! 🎉
                        </h3>
                        <p style={{
                          fontSize: '12px',
                          color: '#16a34a',
                          margin: 0
                        }}>
                          Just need your contact info to send the quote
                        </p>
                      </div>

                      {/* Name fields */}
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: '#374151' }}>
                            First Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.firstName}
                            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                            placeholder="John"
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
                            Last Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.lastName}
                            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                            placeholder="Smith"
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
                          placeholder="john@example.com"
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

                      {/* Phone */}
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 500 }}>
                          <PhoneIcon style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                          Phone *
                        </label>
                        <PhoneInput
                          value={formData.phone}
                          onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                          placeholder="+1 (555) 123-4567"
                          iconColor="#3b82f6"
                        />
                      </div>

                      {/* Nationality */}
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: '#374151' }}>
                          Nationality
                        </label>
                        <select
                          value={formData.nationality}
                          onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
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
                          <option value="US">United States</option>
                          <option value="BR">Brazil</option>
                          <option value="CA">Canada</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {/* Special Requests */}
                      <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: '#374151' }}>
                          Special Requests or Notes (Optional)
                        </label>
                        <textarea
                          value={formData.specialRequests}
                          onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                          placeholder="Any special requirements, preferences, or questions..."
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
                              Sending...
                            </>
                          ) : (
                            <>
                              <MailIcon style={{ width: '18px', height: '18px' }} />
                              Get My Free Quote
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
                          Back
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
                Popular Brazil Destinations
              </h2>
              <p style={{
                fontSize: '18px',
                color: 'rgba(219, 234, 254, 0.9)',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                Discover the most sought-after destinations by American travelers
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '24px'
            }}>
              {[
                {
                  city: 'Rio de Janeiro',
                  description: 'Iconic beaches, Christ the Redeemer, vibrant nightlife',
                  image: '🏖️',
                  price: 'from $299'
                },
                {
                  city: 'São Paulo',
                  description: 'Business hub, amazing food scene, cultural attractions',
                  image: '🏙️',
                  price: 'from $349'
                },
                {
                  city: 'Salvador',
                  description: 'Historic center, Afro-Brazilian culture, beautiful beaches',
                  image: '🏛️',
                  price: 'from $279'
                },
                {
                  city: 'Brasília',
                  description: 'Modern architecture, UNESCO World Heritage site',
                  image: '🏢',
                  price: 'from $329'
                },
                {
                  city: 'Recife',
                  description: 'Tropical paradise, coral reefs, colonial architecture',
                  image: '🌴',
                  price: 'from $259'
                },
                {
                  city: 'Fortaleza',
                  description: 'Stunning beaches, sand dunes, seafood cuisine',
                  image: '⛱️',
                  price: 'from $269'
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
                Why Americans Choose Fly2Any
              </h2>
              <p style={{
                fontSize: '18px',
                color: 'rgba(219, 234, 254, 0.9)',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                The most trusted travel agency for US-Brazil trips
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '32px'
            }}>
              {[
                {
                  icon: '🇺🇸',
                  title: 'US-Based Team',
                  description: 'English-speaking support team based in Miami, available 7 days a week'
                },
                {
                  icon: '🇧🇷',
                  title: 'Brazil Experts',
                  description: '21+ years specializing exclusively in Brazil travel and cultural insights'
                },
                {
                  icon: '💰',
                  title: 'Best Price Guarantee',
                  description: 'We shop multiple airlines and suppliers to find you the best deals'
                },
                {
                  icon: '📋',
                  title: 'Visa Assistance',
                  description: 'Complete help with Brazil visa requirements for US citizens'
                },
                {
                  icon: '🛡️',
                  title: '24/7 Trip Support',
                  description: 'Emergency assistance during your trip when you need us most'
                },
                {
                  icon: '⭐',
                  title: 'Proven Track Record',
                  description: '15,000+ happy travelers and 4.9/5 star rating from verified customers'
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
              Ready to Discover Brazil?
            </h2>
            <p style={{
              fontSize: '18px',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '32px',
              lineHeight: '1.5'
            }}>
              Join thousands of Americans who trusted us with their Brazil adventure. 
              Get your personalized quote in just 2 hours!
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
                Start Planning My Trip
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
                Email Us
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

      {/* Schema.org JSON-LD for English page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": "https://fly2any.com/en",
            "url": "https://fly2any.com/en",
            "name": "Fly2Any - Brazil Travel Specialists for Americans",
            "description": "Expert travel agency specializing in trips to Brazil for Americans. Best flight deals, hotels, and travel services.",
            "inLanguage": "en-US",
            "isPartOf": {
              "@type": "WebSite",
              "@id": "https://fly2any.com",
              "url": "https://fly2any.com",
              "name": "Fly2Any"
            },
            "about": {
              "@type": "TravelAgency",
              "name": "Fly2Any",
              "description": "Brazil travel specialists serving American travelers"
            },
            "mainEntity": {
              "@type": "TravelAgency",
              "@id": "https://fly2any.com",
              "name": "Fly2Any - Brazil Travel Specialists",
              "description": "Expert travel agency specializing in trips to Brazil for Americans",
              "serviceArea": {
                "@type": "Country",
                "name": "Brazil"
              },
              "audience": {
                "@type": "Audience",
                "audienceType": "American travelers to Brazil"
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