'use client';

import { useState, useEffect } from 'react';
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
  const [isVisible, setIsVisible] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasShown, setHasShown] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Check localStorage for user preferences
  useEffect(() => {
    const storedPreferences = localStorage.getItem('exitPopupPreferences');
    if (storedPreferences) {
      const prefs = JSON.parse(storedPreferences);
      
      // Check if user closed the modal before
      if (prefs.permanentlyClosed) {
        setHasShown(true);
        return;
      }
      
      // Check if shown recently (within 7 days)
      const lastShown = prefs.lastShown ? new Date(prefs.lastShown) : null;
      if (lastShown) {
        const daysSinceShown = (Date.now() - lastShown.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceShown < 7) {
          setHasShown(true);
          return;
        }
      }
      
      // Check if user already subscribed
      if (prefs.hasSubscribed) {
        setHasShown(true);
        return;
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled || hasShown) return;

    let hasTriggered = false;

    // Show after delay
    const delayTimeout = setTimeout(() => {
      if (!hasTriggered && shouldShowPopup()) {
        showPopup();
        hasTriggered = true;
      }
    }, delay * 1000);

    // Exit intent detection
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasTriggered && shouldShowPopup()) {
        clearTimeout(delayTimeout);
        showPopup();
        hasTriggered = true;
      }
    };

    // Scroll detection - show when user scrolls 70% of page
    const handleScroll = () => {
      const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrolled > 70 && !hasTriggered && shouldShowPopup()) {
        clearTimeout(delayTimeout);
        showPopup();
        hasTriggered = true;
      }
    };

    // Helper function to check if popup should be shown
    const shouldShowPopup = () => {
      const storedPreferences = localStorage.getItem('exitPopupPreferences');
      if (storedPreferences) {
        const prefs = JSON.parse(storedPreferences);
        if (prefs.permanentlyClosed || prefs.hasSubscribed) {
          return false;
        }
      }
      return true;
    };

    // Helper function to show popup and update localStorage
    const showPopup = () => {
      setIsVisible(true);
      setHasShown(true);
      
      const prefs = JSON.parse(localStorage.getItem('exitPopupPreferences') || '{}');
      prefs.lastShown = new Date().toISOString();
      prefs.showCount = (prefs.showCount || 0) + 1;
      localStorage.setItem('exitPopupPreferences', JSON.stringify(prefs));
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(delayTimeout);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [enabled, delay, hasShown]);

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
        
        // Mark user as subscribed in localStorage
        const prefs = JSON.parse(localStorage.getItem('exitPopupPreferences') || '{}');
        prefs.hasSubscribed = true;
        prefs.subscribedAt = new Date().toISOString();
        prefs.subscribedEmail = email.toLowerCase().trim();
        localStorage.setItem('exitPopupPreferences', JSON.stringify(prefs));
        
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
    
    // Save user preference to not show again for a while
    const prefs = JSON.parse(localStorage.getItem('exitPopupPreferences') || '{}');
    prefs.permanentlyClosed = true;
    prefs.closedAt = new Date().toISOString();
    localStorage.setItem('exitPopupPreferences', JSON.stringify(prefs));
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
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header with urgency */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          color: 'white',
          padding: '20px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '4px' }}>🌟 Espere!</div>
          <div style={{
            fontWeight: '600',
            fontSize: '16px',
            fontFamily: 'Poppins, sans-serif'
          }}>
            Receba ofertas exclusivas de viagem
          </div>
        </div>

        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            color: 'white',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
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
          <XIcon style={{ width: '18px', height: '18px' }} />
        </button>
        
        <div style={{ padding: '24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✈️</div>
            <h2 style={{
              fontSize: '22px',
              fontWeight: '700',
              fontFamily: 'Poppins, sans-serif',
              color: '#111827',
              marginBottom: '8px'
            }}>
              Não perca nossas ofertas!
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              marginBottom: '20px',
              lineHeight: '1.5'
            }}>
              Receba as melhores promoções de passagens e hotéis direto no seu email
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                onChange={(e) => {
                  setNome(e.target.value);
                  if (validationErrors.nome) {
                    setValidationErrors(prev => ({ ...prev, nome: '' }));
                  }
                }}
                placeholder="Seu nome completo"
                style={{
                  width: '100%',
                  padding: '14px 14px 14px 40px',
                  borderRadius: '10px',
                  border: `1px solid ${validationErrors.nome ? '#ef4444' : '#d1d5db'}`,
                  background: '#ffffff',
                  fontSize: '15px',
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationErrors.email) {
                    setValidationErrors(prev => ({ ...prev, email: '' }));
                  }
                }}
                placeholder="seu@email.com"
                style={{
                  width: '100%',
                  padding: '14px 14px 14px 40px',
                  borderRadius: '10px',
                  border: `1px solid ${validationErrors.email ? '#ef4444' : '#d1d5db'}`,
                  background: '#ffffff',
                  fontSize: '15px',
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
                  onChange={(e) => {
                    const country = countries.find(c => c.code === e.target.value) || countries[0];
                    setSelectedCountry(country);
                  }}
                  style={{
                    padding: '14px 6px',
                    borderRadius: '10px',
                    border: '1px solid #d1d5db',
                    background: '#ffffff',
                    fontSize: '13px',
                    color: '#111827',
                    outline: 'none',
                    minWidth: '75px',
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
                  onChange={(e) => {
                    setWhatsapp(e.target.value);
                    if (validationErrors.whatsapp) {
                      setValidationErrors(prev => ({ ...prev, whatsapp: '' }));
                    }
                  }}
                  placeholder={selectedCountry.code === '+55' ? '11 99999-9999' : selectedCountry.code === '+1' ? '555-123-4567' : '123456789'}
                  style={{
                    flex: 1,
                    padding: '14px 14px 14px 40px',
                    borderRadius: '10px',
                    border: `1px solid ${validationErrors.whatsapp ? '#ef4444' : '#d1d5db'}`,
                    background: '#ffffff',
                    fontSize: '15px',
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
                padding: '16px',
                borderRadius: '10px',
                border: 'none',
                cursor: isSubmitting || !nome.trim() || !email.trim() ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                transition: 'transform 0.2s ease',
                fontFamily: 'Poppins, sans-serif'
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

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              fontSize: '13px',
              color: '#6b7280',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckIcon style={{ width: '14px', height: '14px', color: '#10b981' }} />
                <span>Sem spam</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckIcon style={{ width: '14px', height: '14px', color: '#10b981' }} />
                <span>Cancele fácil</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckIcon style={{ width: '14px', height: '14px', color: '#10b981' }} />
                <span>100% seguro</span>
              </div>
            </div>
            <p style={{
              fontSize: '11px',
              color: '#9ca3af',
              lineHeight: '1.4',
              marginBottom: '8px'
            }}>
              🔒 Dados protegidos pela LGPD
            </p>
            <button
              type="button"
              onClick={handleClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                fontSize: '11px',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: '4px 8px',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#6b7280';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#9ca3af';
              }}
            >
              Não mostrar novamente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}