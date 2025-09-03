'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { XIcon, CheckIcon, MailIcon, PhoneIcon } from '@/components/Icons';

// Países principais para o seletor
const countries = [
  { code: '+1', name: 'EUA/Canadá', flag: '🇺🇸' },
  { code: '+55', name: 'Brasil', flag: '🇧🇷' },
  { code: '+351', name: 'Portugal', flag: '🇵🇹' },
  { code: '+44', name: 'Reino Unido', flag: '🇬🇧' },
  { code: '+49', name: 'Alemanha', flag: '🇩🇪' },
  { code: '+33', name: 'França', flag: '🇫🇷' },
  { code: '+39', name: 'Itália', flag: '🇮🇹' },
  { code: '+34', name: 'Espanha', flag: '🇪🇸' },
  { code: '+52', name: 'México', flag: '🇲🇽' },
  { code: '+54', name: 'Argentina', flag: '🇦🇷' }
];

interface ExitIntentPopupProps {
  enabled?: boolean;
  delay?: number; // delay in seconds before showing
}

export default function ExitIntentPopup({ enabled = true, delay = 30 }: ExitIntentPopupProps) {
  // ULTRATHINK MOBILE OPTIMIZATION: Progressive enhancement for mobile UX
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [hasInteracted, setHasInteracted] = useState(false);

  // ULTRATHINK: Mobile detection for progressive enhancement  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        setIsMobile(window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  // Check if popup was already shown/closed in this session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionData = sessionStorage.getItem('exitIntentPopup');
      if (sessionData) {
        const { closed, filled, timestamp } = JSON.parse(sessionData);
        // ULTRATHINK: Longer suppression on mobile (48h vs 24h desktop)
        const suppressionHours = isMobile ? 48 : 24;
        const hoursSinceAction = (Date.now() - timestamp) / (1000 * 60 * 60);
        if ((closed || filled) && hoursSinceAction < suppressionHours) {
          return; // Don't set up any listeners
        }
      }
    }
  }, [isMobile]);

  // Track user interaction
  useEffect(() => {
    if (!enabled) return;

    const handleInteraction = () => {
      setHasInteracted(true);
    };

    // Track clicks, scrolls, and mouse movements as interaction
    document.addEventListener('click', handleInteraction);
    document.addEventListener('scroll', handleInteraction);
    document.addEventListener('mousemove', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('scroll', handleInteraction);
      document.removeEventListener('mousemove', handleInteraction);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Check session storage first
    if (typeof window !== 'undefined') {
      const sessionData = sessionStorage.getItem('exitIntentPopup');
      if (sessionData) {
        const { closed, filled, timestamp } = JSON.parse(sessionData);
        const suppressionHours = isMobile ? 48 : 24;
        const hoursSinceAction = (Date.now() - timestamp) / (1000 * 60 * 60);
        if ((closed || filled) && hoursSinceAction < suppressionHours) {
          return; // Don't show popup
        }
      }
    }

    let hasTriggered = false;
    let delayTimeout: NodeJS.Timeout;

    // ULTRATHINK: Progressive enhancement - much longer delay on mobile
    const effectiveDelay = isMobile ? Math.max(300, delay * 10) : delay; // 5min minimum on mobile

    // Only set delay timer if user has interacted significantly with the page
    const requiredInteractions = isMobile ? 5 : 2; // More interaction required on mobile
    if (hasInteracted && (!isMobile || window.scrollY > 500)) { // Require scroll on mobile
      delayTimeout = setTimeout(() => {
        if (!hasTriggered && !isVisible) {
          const sessionData = sessionStorage.getItem('exitIntentPopup');
          if (!sessionData || !JSON.parse(sessionData).closed) {
            setIsVisible(true);
            hasTriggered = true;
          }
        }
      }, effectiveDelay * 1000);
    }

    // ULTRATHINK: Exit intent detection - DESKTOP ONLY and much more conservative
    const handleMouseLeave = (e: MouseEvent) => {
      // DISABLED ON MOBILE - only desktop exit intent
      if (isMobile) return;
      
      // Only trigger on clear exit intent (mouse leaving from very top) with significant interaction
      if (e.clientY <= 5 && hasInteracted && !hasTriggered && !isVisible && window.scrollY > 1000) {
        // Check if forms have data or user is actively engaged
        const inputs = document.querySelectorAll('input, textarea, select');
        let hasFormData = false;
        inputs.forEach((input: any) => {
          if (input.value && input.value.trim() !== '') {
            hasFormData = true;
          }
        });

        // Don't show if user has filled forms or spent less than 2 minutes
        const timeOnSite = Date.now() - (window as any).pageLoadTime || 0;
        if (hasFormData || timeOnSite < 120000) { // 2 minutes minimum
          sessionStorage.setItem('exitIntentPopup', JSON.stringify({
            filled: true,
            timestamp: Date.now()
          }));
          return;
        }

        const sessionData = sessionStorage.getItem('exitIntentPopup');
        if (!sessionData || !JSON.parse(sessionData).closed) {
          clearTimeout(delayTimeout);
          setIsVisible(true);
          hasTriggered = true;
        }
      }
    };

    // ULTRATHINK: Back button detection - more conservative, especially on mobile
    const handlePopState = () => {
      // Require more engagement before triggering on mobile
      const minimumTimeOnSite = isMobile ? 300000 : 120000; // 5min mobile, 2min desktop
      const timeOnSite = Date.now() - (window as any).pageLoadTime || 0;
      
      if (hasInteracted && !hasTriggered && !isVisible && timeOnSite > minimumTimeOnSite) {
        const sessionData = sessionStorage.getItem('exitIntentPopup');
        if (!sessionData || !JSON.parse(sessionData).closed) {
          setIsVisible(true);
          hasTriggered = true;
        }
      }
    };

    // ULTRATHINK: Only add mouseleave listener on DESKTOP - disabled on mobile
    if (!isMobile && window.innerWidth > 768) {
      document.addEventListener('mouseleave', handleMouseLeave);
    }
    // Back button detection for both desktop and mobile (but with different thresholds)
    window.addEventListener('popstate', handlePopState);

    return () => {
      if (delayTimeout) clearTimeout(delayTimeout);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [enabled, delay, hasInteracted, isVisible, isMobile]); // ULTRATHINK: Include isMobile in deps

  // Funções de validação
  const validateEmail = (email: string): string | null => {
    if (!email.trim()) return 'Email é obrigatório';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Formato de email inválido';
    return null;
  };

  const validateName = (name: string): string | null => {
    if (!name.trim()) return 'Nome é obrigatório';
    if (name.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres';
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name.trim())) return 'Nome deve conter apenas letras';
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    if (!phone.trim()) return null; // Telefone é opcional
    const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
    if (!/^\d{8,15}$/.test(cleanPhone)) {
      return 'Telefone deve ter entre 8 e 15 dígitos';
    }
    return null;
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    const nameError = validateName(nome);
    const emailError = validateEmail(email);
    const phoneError = validatePhone(whatsapp);
    
    if (nameError) errors.nome = nameError;
    if (emailError) errors.email = emailError;
    if (phoneError) errors.whatsapp = phoneError;
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset estados
    setIsError(false);
    setErrorMessage('');
    
    // Validar formulário
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Id': crypto.randomUUID()
        },
        body: JSON.stringify({
          nome: nome.trim(),
          email: email.toLowerCase().trim(),
          whatsapp: whatsapp.trim() ? `${selectedCountry.code}${whatsapp.trim().replace(/[\s\-\(\)]/g, '')}` : '',
          source: 'exit_intent_popup',
          serviceType: 'newsletter_signup',
          selectedServices: ['newsletter'],
          tipoViagem: 'ida_volta',
          numeroPassageiros: 1,
          prioridadeOrcamento: 'custo_beneficio',
          pais: selectedCountry.name.includes('Brasil') ? 'Brasil' : 
                selectedCountry.name.includes('EUA') ? 'Estados Unidos' : 
                selectedCountry.name.includes('Portugal') ? 'Portugal' : 'Outro',
          timestamp: new Date().toISOString()
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setIsSuccess(true);
        // Save to session storage that form was filled
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('exitIntentPopup', JSON.stringify({
            filled: true,
            timestamp: Date.now()
          }));
        }
        // Fechar popup após 4 segundos
        setTimeout(() => {
          setIsVisible(false);
        }, 4000);
      } else {
        setIsError(true);
        setErrorMessage(result.message || result.error || 'Erro ao enviar dados');
      }
    } catch (error) {
      console.error('Erro ao enviar lead:', error);
      setIsError(true);
      setErrorMessage('Erro de conexão. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    // Save to session storage that popup was closed
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('exitIntentPopup', JSON.stringify({
        closed: true,
        timestamp: Date.now()
      }));
    }
  };

  if (!isVisible) return null;

  if (isSuccess) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          maxWidth: '360px',
          width: '100%',
          padding: '32px 24px',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto'
          }}>
            <CheckIcon style={{ width: '40px', height: '40px', color: 'white' }} />
          </div>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            fontFamily: 'Poppins, sans-serif',
            color: '#111827',
            marginBottom: '16px'
          }}>
            ✅ Enviado com Sucesso!
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            marginBottom: '24px',
            lineHeight: '1.6'
          }}>
            Obrigado {nome}! Você receberá nossas ofertas especiais no email {email}{whatsapp && ` e WhatsApp`} em breve!
          </p>
          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
            borderRadius: '12px',
            border: '1px solid #bae6fd'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#0369a1',
              fontWeight: '500'
            }}>
              ✉️ Verifique sua caixa de entrada e salve nosso contato ❤️
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ULTRATHINK: Mobile-optimized modal styling
  const modalStyles = isMobile ? {
    // MOBILE: Bottom sheet style - less intrusive
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    right: 0,
    top: 'auto',
    background: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '0'
  } : {
    // DESKTOP: Center modal
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '16px'
  };

  const containerStyles = isMobile ? {
    // MOBILE: Compact bottom sheet
    background: '#ffffff',
    borderRadius: '20px 20px 0 0',
    maxWidth: '100%',
    width: '100%',
    maxHeight: '70vh',
    position: 'relative' as const,
    overflow: 'auto',
    boxShadow: '0 -10px 25px rgba(0, 0, 0, 0.15)',
    animation: 'slideUp 0.3s ease-out'
  } : {
    // DESKTOP: Center modal
    background: '#ffffff',
    borderRadius: '16px',
    maxWidth: '360px',
    width: '100%',
    position: 'relative' as const,
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  };

  const headerStyles = isMobile ? {
    // MOBILE: Compact header with handle
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: 'white',
    padding: '16px 20px 12px 20px',
    textAlign: 'center' as const,
    position: 'relative' as const,
    borderRadius: '20px 20px 0 0'
  } : {
    // DESKTOP: Full header
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: 'white',
    padding: '20px',
    textAlign: 'center' as const,
    position: 'relative' as const
  };

  return (
    <React.Fragment>
      {/* ULTRATHINK: Mobile animation styles */}
      {isMobile && (
        <style jsx>{`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}</style>
      )}
      
      <div style={modalStyles}>
        <div style={containerStyles}>
        {/* MOBILE: Handle indicator */}
        {isMobile && (
          <div style={{
            width: '40px',
            height: '4px',
            background: '#d1d5db',
            borderRadius: '2px',
            margin: '8px auto 0 auto'
          }} />
        )}
        
        {/* Header with urgency */}
        <div style={headerStyles}>
          <div style={{ 
            fontSize: isMobile ? '16px' : '20px', 
            marginBottom: '4px' 
          }}>
            🌟 {isMobile ? 'Ofertas Exclusivas' : 'Espere!'}
          </div>
          <div style={{
            fontWeight: '600',
            fontSize: isMobile ? '14px' : '16px',
            fontFamily: 'Poppins, sans-serif'
          }}>
            {isMobile ? 'Não perca nossas promoções' : 'Receba ofertas exclusivas de viagem'}
          </div>
        </div>

        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: isMobile ? '8px' : '12px',
            right: isMobile ? '8px' : '12px',
            color: 'white',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            width: isMobile ? '28px' : '32px',
            height: isMobile ? '28px' : '32px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s ease',
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          <XIcon style={{ 
            width: isMobile ? '16px' : '18px', 
            height: isMobile ? '16px' : '18px' 
          }} />
        </button>
        
        <div style={{ padding: isMobile ? '16px 20px 20px 20px' : '24px' }}>
          <div style={{ 
            textAlign: 'center', 
            marginBottom: isMobile ? '16px' : '24px' 
          }}>
            <div style={{ 
              fontSize: isMobile ? '32px' : '48px', 
              marginBottom: isMobile ? '8px' : '12px' 
            }}>✈️</div>
            <h2 style={{
              fontSize: isMobile ? '18px' : '22px',
              fontWeight: '700',
              fontFamily: 'Poppins, sans-serif',
              color: '#111827',
              marginBottom: isMobile ? '6px' : '8px'
            }}>
              {isMobile ? 'Ofertas imperdíveis!' : 'Não perca nossas ofertas!'}
            </h2>
            <p style={{
              fontSize: isMobile ? '14px' : '16px',
              color: '#6b7280',
              marginBottom: isMobile ? '16px' : '20px',
              lineHeight: '1.5'
            }}>
              {isMobile ? 
                'Promoções direto no seu email' : 
                'Receba as melhores promoções de passagens e hotéis direto no seu email'
              }
            </p>
          </div>

          {isError && (
            <div style={{
              background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ color: '#dc2626', fontSize: '16px' }}>⚠️</span>
              <span style={{ color: '#dc2626', fontSize: '14px', fontWeight: '500' }}>
                {errorMessage}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: isMobile ? '12px' : '16px' 
          }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '16px',
                color: '#9ca3af'
              }}>👤</div>
              <input
                type="text"
                value={nome}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setNome(e.target.value);
                  if (validationErrors.nome) {
                    setValidationErrors((prev: any) => ({ ...prev, nome: '' }));
                  }
                }}
                placeholder="Seu nome completo"
                style={{
                  width: '100%',
                  padding: isMobile ? '12px 12px 12px 36px' : '14px 14px 14px 40px',
                  borderRadius: isMobile ? '8px' : '10px',
                  border: `1px solid ${validationErrors.nome ? '#ef4444' : '#d1d5db'}`,
                  background: '#ffffff',
                  fontSize: isMobile ? '16px' : '15px', // 16px prevents zoom on iOS
                  color: '#111827',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = validationErrors.nome ? '#ef4444' : '#3b82f6';
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${validationErrors.nome ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = validationErrors.nome ? '#ef4444' : '#d1d5db';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                required
              />
              {validationErrors.nome && (
                <div style={{
                  fontSize: '12px',
                  color: '#ef4444',
                  marginTop: '4px',
                  paddingLeft: '40px'
                }}>
                  {validationErrors.nome}
                </div>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <MailIcon style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '18px',
                height: '18px',
                color: '#9ca3af'
              }} />
              <input
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setEmail(e.target.value);
                  if (validationErrors.email) {
                    setValidationErrors((prev: any) => ({ ...prev, email: '' }));
                  }
                }}
                placeholder="seu@email.com"
                style={{
                  width: '100%',
                  padding: isMobile ? '12px 12px 12px 36px' : '14px 14px 14px 40px',
                  borderRadius: isMobile ? '8px' : '10px',
                  border: `1px solid ${validationErrors.email ? '#ef4444' : '#d1d5db'}`,
                  background: '#ffffff',
                  fontSize: isMobile ? '16px' : '15px',
                  color: '#111827',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = validationErrors.email ? '#ef4444' : '#3b82f6';
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${validationErrors.email ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = validationErrors.email ? '#ef4444' : '#d1d5db';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                required
              />
              {validationErrors.email && (
                <div style={{
                  fontSize: '12px',
                  color: '#ef4444',
                  marginTop: '4px',
                  paddingLeft: '40px'
                }}>
                  {validationErrors.email}
                </div>
              )}
            </div>
            
            <div style={{ position: 'relative' }}>
              <PhoneIcon style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '18px',
                height: '18px',
                color: '#9ca3af',
                zIndex: 1
              }} />
              <div style={{ display: 'flex', gap: '6px' }}>
                <select
                  value={selectedCountry.code}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const country = countries.find(c => c.code === e.target.value) || countries[0];
                    setSelectedCountry(country);
                  }}
                  style={{
                    padding: isMobile ? '12px 4px' : '14px 6px',
                    borderRadius: isMobile ? '8px' : '10px',
                    border: '1px solid #d1d5db',
                    background: '#ffffff',
                    fontSize: isMobile ? '14px' : '13px',
                    color: '#111827',
                    outline: 'none',
                    minWidth: isMobile ? '70px' : '75px',
                    cursor: 'pointer'
                  }}
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setWhatsapp(e.target.value);
                    if (validationErrors.whatsapp) {
                      setValidationErrors((prev: any) => ({ ...prev, whatsapp: '' }));
                    }
                  }}
                  placeholder={selectedCountry.code === '+55' ? '11 99999-9999' : selectedCountry.code === '+1' ? '555-123-4567' : '123456789'}
                  style={{
                    flex: 1,
                    padding: isMobile ? '12px 12px 12px 36px' : '14px 14px 14px 40px',
                    borderRadius: isMobile ? '8px' : '10px',
                    border: `1px solid ${validationErrors.whatsapp ? '#ef4444' : '#d1d5db'}`,
                    background: '#ffffff',
                    fontSize: isMobile ? '16px' : '15px',
                    color: '#111827',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = validationErrors.whatsapp ? '#ef4444' : '#10b981';
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${validationErrors.whatsapp ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = validationErrors.whatsapp ? '#ef4444' : '#d1d5db';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div style={{
                fontSize: '12px',
                color: validationErrors.whatsapp ? '#ef4444' : '#6b7280',
                marginTop: '4px',
                paddingLeft: '40px'
              }}>
                {validationErrors.whatsapp || 'Opcional • WhatsApp com código do país'}
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting || !nome.trim() || !email.trim()}
              style={{
                width: '100%',
                background: isSubmitting || !nome.trim() || !email.trim() ? '#9ca3af' : 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                fontWeight: '600',
                padding: isMobile ? '14px' : '16px',
                borderRadius: isMobile ? '8px' : '10px',
                border: 'none',
                cursor: isSubmitting || !nome.trim() || !email.trim() ? 'not-allowed' : 'pointer',
                fontSize: isMobile ? '16px' : '16px',
                transition: 'transform 0.2s ease',
                fontFamily: 'Poppins, sans-serif',
                minHeight: isMobile ? '48px' : 'auto' // Touch-friendly height
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting && nome.trim() && email.trim()) {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {isSubmitting ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid white',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <span>Enviando...</span>
                </div>
              ) : (
                '🎯 Quero receber ofertas!'
              )}
            </button>
          </form>

          <div style={{ 
            marginTop: isMobile ? '16px' : '20px', 
            textAlign: 'center' 
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isMobile ? '12px' : '16px',
              fontSize: isMobile ? '12px' : '13px',
              color: '#6b7280',
              marginBottom: isMobile ? '8px' : '12px',
              flexWrap: isMobile ? 'wrap' : 'nowrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckIcon style={{ 
                  width: isMobile ? '12px' : '14px', 
                  height: isMobile ? '12px' : '14px', 
                  color: '#10b981' 
                }} />
                <span>Sem spam</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckIcon style={{ 
                  width: isMobile ? '12px' : '14px', 
                  height: isMobile ? '12px' : '14px', 
                  color: '#10b981' 
                }} />
                <span>Cancele fácil</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckIcon style={{ 
                  width: isMobile ? '12px' : '14px', 
                  height: isMobile ? '12px' : '14px', 
                  color: '#10b981' 
                }} />
                <span>100% seguro</span>
              </div>
            </div>
            <p style={{
              fontSize: isMobile ? '10px' : '11px',
              color: '#9ca3af',
              lineHeight: '1.4'
            }}>
              🔒 Dados protegidos pela LGPD
            </p>
          </div>
        </div>
      </div>
      </div>
    </React.Fragment>
  );
}