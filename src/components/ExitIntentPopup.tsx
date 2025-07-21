'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { MailIcon, PhoneIcon } from '@/components/Icons';

interface ExitIntentPopupProps {
  enabled?: boolean;
  delay?: number; // delay in seconds before showing
}

export default function ExitIntentPopup({ enabled = true, delay = 30 }: ExitIntentPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
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
          whatsapp,
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
          maxWidth: '480px',
          width: '100%',
          padding: '48px 32px',
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
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        maxWidth: '600px',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header with urgency */}
        <div style={{
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          color: 'white',
          padding: '24px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️ ESPERE!</div>
          <div style={{
            fontWeight: '700',
            fontSize: '18px',
            fontFamily: 'Poppins, sans-serif'
          }}>
            Não perca esta oportunidade única!
          </div>
        </div>

        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            color: 'white',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
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
          <XMarkIcon style={{ width: '24px', height: '24px' }} />
        </button>
        
        <div style={{ padding: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎁</div>
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              color: '#1f2937',
              padding: '8px 16px',
              borderRadius: '50px',
              fontSize: '14px',
              fontWeight: '700',
              marginBottom: '16px',
              animation: 'pulse 2s infinite'
            }}>
              OFERTA EXCLUSIVA - APENAS HOJE
            </div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              fontFamily: 'Poppins, sans-serif',
              color: '#111827',
              marginBottom: '12px'
            }}>
              Antes de sair...
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#6b7280',
              marginBottom: '24px',
              lineHeight: '1.6'
            }}>
              Que tal economizar <strong style={{ color: '#ef4444' }}>até R$ 2.500</strong> na sua próxima viagem?
            </p>

            {/* Social proof */}
            <div style={{
              background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px',
              border: '1px solid #bae6fd'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                gap: '16px',
                fontSize: '14px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontWeight: '700',
                    fontSize: '18px',
                    color: '#3b82f6'
                  }}>15.000+</div>
                  <div style={{ color: '#6b7280' }}>Viajantes</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontWeight: '700',
                    fontSize: '18px',
                    color: '#10b981'
                  }}>R$ 8.5M</div>
                  <div style={{ color: '#6b7280' }}>Economizados</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontWeight: '700',
                    fontSize: '18px',
                    color: '#a855f7'
                  }}>4.9★</div>
                  <div style={{ color: '#6b7280' }}>Avaliação</div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                📧 Seu melhor email:
              </label>
              <div style={{ position: 'relative' }}>
                <MailIcon style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '20px',
                  height: '20px',
                  color: '#9ca3af'
                }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu email aqui"
                  style={{
                    width: '100%',
                    padding: '16px 16px 16px 48px',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    background: '#ffffff',
                    fontSize: '16px',
                    color: '#111827',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                  required
                />
              </div>
            </div>
            
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                📱 WhatsApp (opcional - para ofertas VIP):
              </label>
              <div style={{ position: 'relative' }}>
                <PhoneIcon style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '20px',
                  height: '20px',
                  color: '#9ca3af'
                }} />
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+55 (11) 99999-9999"
                  style={{
                    width: '100%',
                    padding: '16px 16px 16px 48px',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    background: '#ffffff',
                    fontSize: '16px',
                    color: '#111827',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#10b981';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting || !email}
              style={{
                width: '100%',
                background: isSubmitting || !email ? '#9ca3af' : 'linear-gradient(135deg, #f59e0b, #ea580c)',
                color: 'white',
                fontWeight: '700',
                padding: '20px 24px',
                borderRadius: '12px',
                border: 'none',
                cursor: isSubmitting || !email ? 'not-allowed' : 'pointer',
                fontSize: '18px',
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
                    width: '20px',
                    height: '20px',
                    border: '2px solid white',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <span>Processando...</span>
                </div>
              ) : (
                '🚀 SIM! QUERO ECONOMIZAR R$ 2.500'
              )}
            </button>
          </form>

          {/* Benefits */}
          <div style={{ marginTop: '32px' }}>
            <h3 style={{
              fontWeight: '600',
              color: '#111827',
              textAlign: 'center',
              marginBottom: '16px',
              fontSize: '16px'
            }}>
              O que você vai receber:
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckIcon style={{ width: '16px', height: '16px', color: '#10b981' }} />
                <span>Ofertas exclusivas de passagens com até 70% OFF</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckIcon style={{ width: '16px', height: '16px', color: '#10b981' }} />
                <span>Promoções relâmpago de hotéis (até 80% OFF)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckIcon style={{ width: '16px', height: '16px', color: '#10b981' }} />
                <span>Pacotes completos com desconto especial</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckIcon style={{ width: '16px', height: '16px', color: '#10b981' }} />
                <span>Alertas de error fare (passagens com preço de erro)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckIcon style={{ width: '16px', height: '16px', color: '#10b981' }} />
                <span>Consultoria gratuita para sua viagem</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <p style={{
              fontSize: '12px',
              color: '#9ca3af',
              lineHeight: '1.4'
            }}>
              🔒 Seus dados estão seguros • 📧 Sem spam • ❌ Cancele quando quiser
            </p>
          </div>

          {/* Urgency timer */}
          <div style={{
            marginTop: '20px',
            background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{
              color: '#dc2626',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              ⏰ Esta oferta expira em algumas horas!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}