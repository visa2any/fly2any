'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { MailIcon, PhoneIcon } from '@/components/Icons';

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
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (!enabled || hasShown) return;

    let hasTriggered = false;

    // Show after delay
    const delayTimeout = setTimeout(() => {
      if (!hasTriggered) {
        setIsVisible(true);
        setHasShown(true);
        hasTriggered = true;
      }
    }, delay * 1000);

    // Exit intent detection
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasTriggered) {
        clearTimeout(delayTimeout);
        setIsVisible(true);
        setHasShown(true);
        hasTriggered = true;
      }
    };

    // Scroll detection - show when user scrolls 70% of page
    const handleScroll = () => {
      const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrolled > 70 && !hasTriggered) {
        clearTimeout(delayTimeout);
        setIsVisible(true);
        setHasShown(true);
        hasTriggered = true;
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(delayTimeout);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [enabled, delay, hasShown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          whatsapp: selectedCountry.code + ' ' + whatsapp,
          source: 'exit_intent_popup',
          serviceType: 'special_offer',
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Erro ao enviar lead:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
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
            🎉 Oferta Garantida!
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            marginBottom: '24px',
            lineHeight: '1.6'
          }}>
            Você receberá nossa oferta especial no seu email e WhatsApp em alguns minutos!
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
          <XMarkIcon style={{ width: '18px', height: '18px' }} />
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                style={{
                  width: '100%',
                  padding: '14px 14px 14px 40px',
                  borderRadius: '10px',
                  border: '1px solid #d1d5db',
                  background: '#ffffff',
                  fontSize: '15px',
                  color: '#111827',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                required
              />
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
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder={selectedCountry.code === '+55' ? '11 99999-9999' : selectedCountry.code === '+1' ? '555-123-4567' : '123456789'}
                  style={{
                    flex: 1,
                    padding: '14px 14px 14px 40px',
                    borderRadius: '10px',
                    border: '1px solid #d1d5db',
                    background: '#ffffff',
                    fontSize: '15px',
                    color: '#111827',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#10b981';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div style={{
                fontSize: '12px',
                color: '#6b7280',
                marginTop: '4px',
                paddingLeft: '40px'
              }}>
                Opcional • WhatsApp com código do país
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting || !email}
              style={{
                width: '100%',
                background: isSubmitting || !email ? '#9ca3af' : 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                fontWeight: '600',
                padding: '16px',
                borderRadius: '10px',
                border: 'none',
                cursor: isSubmitting || !email ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                transition: 'transform 0.2s ease',
                fontFamily: 'Poppins, sans-serif'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting && email) {
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
              lineHeight: '1.4'
            }}>
              🔒 Dados protegidos pela LGPD
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}