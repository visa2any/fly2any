'use client';

import { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { MailIcon, PhoneIcon } from '@/components/Icons';

interface NewsletterCaptureProps {
  variant?: 'horizontal' | 'vertical' | 'popup';
  showWhatsApp?: boolean;
  className?: string;
}

export default function NewsletterCapture({ 
  variant = 'horizontal', 
  showWhatsApp = true,
  className = ''
}: NewsletterCaptureProps) {
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
          whatsapp: showWhatsApp ? whatsapp : '',
          source: 'newsletter',
          serviceType: 'newsletter_subscription',
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          setShowForm(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Erro ao enviar newsletter:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showForm) return null;

  if (isSuccess) {
    return (
      <div style={{
        background: 'rgba(16, 185, 129, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center',
        color: 'white'
      }} className={className}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto'
        }}>
          <CheckIcon style={{ width: '32px', height: '32px', color: 'white' }} />
        </div>
        <h3 style={{
          fontSize: '24px',
          fontWeight: '700',
          fontFamily: 'Poppins, sans-serif',
          marginBottom: '8px'
        }}>
          🎉 Bem-vindo(a) ao clube VIP!
        </h3>
        <p style={{
          fontSize: '16px',
          color: 'rgba(255, 255, 255, 0.8)',
          lineHeight: '1.5'
        }}>
          Você receberá nossas melhores ofertas em primeira mão!
        </p>
      </div>
    );
  }

  const horizontalLayout = (
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '16px',
      padding: '32px',
      color: 'white'
    }} className={className}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: '32px',
        alignItems: 'center'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '8px 16px',
            background: 'rgba(250, 204, 21, 0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: '50px',
            border: '1px solid rgba(250, 204, 21, 0.3)',
            marginBottom: '16px'
          }}>
            <span style={{
              color: '#fde047',
              fontWeight: '600',
              fontSize: '14px'
            }}>🎯 OFERTA EXCLUSIVA</span>
          </div>
          <h3 style={{
            fontSize: '32px',
            fontWeight: '700',
            fontFamily: 'Poppins, sans-serif',
            lineHeight: '1.2',
            marginBottom: '12px'
          }}>
            Receba ofertas{' '}
            <span style={{
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              imperdíveis
            </span>{' '}
            de viagem!
          </h3>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: '1.6'
          }}>
            <strong>Até 70% OFF</strong> em passagens + <strong>desconto exclusivo</strong> em hotéis
          </p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
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
                  placeholder="Seu melhor email"
                  style={{
                    width: '100%',
                    padding: '16px 16px 16px 48px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    background: '#ffffff',
                    fontSize: '16px',
                    color: '#111827',
                    outline: 'none'
                  }}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !email}
                style={{
                  background: isSubmitting || !email ? '#9ca3af' : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  color: '#1f2937',
                  fontWeight: '700',
                  padding: '16px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: isSubmitting || !email ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  whiteSpace: 'nowrap',
                  transition: 'transform 0.2s ease',
                  fontFamily: 'Poppins, sans-serif'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting && email) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {isSubmitting ? '⏳ Enviando...' : '🎁 QUERO DESCONTOS'}
              </button>
            </div>
            
            {showWhatsApp && (
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
                  placeholder="WhatsApp (opcional - para ofertas VIP)"
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 48px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    background: '#ffffff',
                    fontSize: '14px',
                    color: '#111827',
                    outline: 'none'
                  }}
                />
              </div>
            )}
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '16px'
          }}>
            <CheckIcon style={{ width: '16px', height: '16px', color: '#10b981' }} />
            <span style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.7)'
            }}>
              100% gratuito • Cancele quando quiser • Sem spam
            </span>
          </div>
        </form>
      </div>
    </div>
  );

  const verticalLayout = (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '16px',
      padding: '32px',
      textAlign: 'center',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    }} className={className}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '50px',
          fontSize: '14px',
          fontWeight: '700',
          marginBottom: '16px'
        }}>
          <span>🔥</span>
          <span>OFERTA LIMITADA</span>
        </div>
        <h3 style={{
          fontSize: '28px',
          fontWeight: '700',
          fontFamily: 'Poppins, sans-serif',
          color: '#111827',
          marginBottom: '12px'
        }}>
          Passagens com até{' '}
          <span style={{
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            70% OFF
          </span>
        </h3>
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          lineHeight: '1.5'
        }}>
          + Cashback exclusivo + Seguro viagem grátis
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
            placeholder="Digite seu email"
            style={{
              width: '100%',
              padding: '16px 16px 16px 48px',
              borderRadius: '12px',
              border: '1px solid #d1d5db',
              background: '#ffffff',
              fontSize: '16px',
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
        
        {showWhatsApp && (
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
              placeholder="WhatsApp (para ofertas VIP instantâneas)"
              style={{
                width: '100%',
                padding: '16px 16px 16px 48px',
                borderRadius: '12px',
                border: '1px solid #d1d5db',
                background: '#ffffff',
                fontSize: '16px',
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
        )}
        
        <button
          type="submit"
          disabled={isSubmitting || !email}
          style={{
            width: '100%',
            background: isSubmitting || !email ? '#9ca3af' : 'linear-gradient(135deg, #f59e0b, #ea580c)',
            color: 'white',
            fontWeight: '700',
            padding: '20px',
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
          {isSubmitting ? '⏳ Enviando...' : '🚀 QUERO MINHA OFERTA AGORA'}
        </button>
      </form>

      <div style={{
        marginTop: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          <CheckIcon style={{ width: '16px', height: '16px', color: '#10b981' }} />
          <span>Ofertas exclusivas diárias</span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          <CheckIcon style={{ width: '16px', height: '16px', color: '#10b981' }} />
          <span>Primeiro acesso às promoções</span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          <CheckIcon style={{ width: '16px', height: '16px', color: '#10b981' }} />
          <span>Cancelamento fácil</span>
        </div>
      </div>
    </div>
  );

  // Popup layout removed - use ExitIntentPopup component instead

  switch (variant) {
    case 'vertical':
      return verticalLayout;
    default:
      return horizontalLayout;
  }
}