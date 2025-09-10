'use client';

import React, { useState, useEffect } from 'react';

interface ExitIntentPopupProps {
  enabled?: boolean;
  delay?: number; // Show after X seconds as fallback
  showOnScroll?: boolean; // Show when user scrolls up
  offers?: OfferType[];
  onCapture?: (data: LeadData) => void;
  onClose?: () => void;
}

interface OfferType {
  title: string;
  subtitle: string;
  discount: string;
  originalPrice?: string;
  salePrice?: string;
  savings: string;
  urgency: string;
  benefits: string[];
}

interface LeadData {
  email: string;
  phone?: string;
  name?: string;
  source: 'exit-intent';
  offer: string;
}

const defaultOffers: OfferType[] = [
  {
    title: "⚠️ Espera! Não Vá Embora!",
    subtitle: "Como brasileiro nos EUA, você tem direito a um desconto especial",
    discount: "DESCONTO EXCLUSIVO DE 25%",
    originalPrice: "$1,890",
    salePrice: "$675",
    savings: "R$ 6.400",
    urgency: "Válido apenas pelos próximos 15 minutos",
    benefits: [
      "✅ Sem taxa de agência",
      "✅ Parcelamento em 12x",
      "✅ Atendimento em português",
      "✅ Melhor preço garantido"
    ]
  },
  {
    title: "🎁 Oferta Especial Para Você!",
    subtitle: "Não perca esta oportunidade única para brasileiros",
    discount: "ECONOMIA DE ATÉ R$ 5.500",
    originalPrice: "$2,150",
    salePrice: "$890",
    savings: "R$ 5.500",
    urgency: "Oferta expira em 10 minutos",
    benefits: [
      "✅ Voos diretos disponíveis",
      "✅ Cancelamento grátis",
      "✅ Suporte 24/7",
      "✅ Programa de milhas"
    ]
  }
];

export default function ExitIntentPopup({
  enabled = true,
  delay = 45000, // 45 seconds
  showOnScroll = true,
  offers = defaultOffers,
  onCapture,
  onClose
}: ExitIntentPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    name: ''
  });
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [hasShown, setHasShown] = useState(false);

  const currentOffer = offers[currentOfferIndex];

  // Countdown timer
  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsVisible(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible]);

  // Exit intent detection
  useEffect(() => {
    if (!enabled || hasShown) return;

    let timeoutId: NodeJS.Timeout;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        showPopup();
      }
    };

    const handleScroll = () => {
      if (!showOnScroll) return;
      
      const scrollDirection = window.pageYOffset < (window as any).lastScrollTop ? 'up' : 'down';
      (window as any).lastScrollTop = window.pageYOffset;
      
      if (scrollDirection === 'up' && window.pageYOffset > 100) {
        showPopup();
      }
    };

    const showPopup = () => {
      if (!hasShown) {
        setIsVisible(true);
        setHasShown(true);
        if (timeoutId) clearTimeout(timeoutId);
      }
    };

    // Fallback timer
    timeoutId = setTimeout(showPopup, delay);

    // Event listeners
    document.addEventListener('mouseleave', handleMouseLeave);
    if (showOnScroll) {
      window.addEventListener('scroll', handleScroll);
      (window as any).lastScrollTop = 0;
    }

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (showOnScroll) {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [enabled, delay, showOnScroll, hasShown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) return;

    const leadData: LeadData = {
      email: formData.email,
      phone: formData.phone,
      name: formData.name,
      source: 'exit-intent',
      offer: currentOffer.title
    };

    if (onCapture) {
      await onCapture(leadData);
    }

    // Redirect to WhatsApp
    const message = `Oi! Vi a oferta especial no site: ${currentOffer.discount}. Quero garantir meu desconto! Email: ${formData.email}`;
    window.open(`https://wa.me/551151944717?text=${encodeURIComponent(message)}`, '_blank');
    
    handleClose();
  };

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!enabled || !isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.3s ease-out'
      }}>
        {/* Popup Content */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '0',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
          animation: 'slideInScale 0.4s ease-out'
        }}>
          {/* Close Button */}
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '15px',
              right: '20px',
              background: 'none',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              color: '#6b7280',
              zIndex: 10,
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#f3f4f6';
              e.currentTarget.style.color = '#1f2937';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            ×
          </button>

          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #dc2626, #ef4444)',
            color: 'white',
            padding: '30px 40px 20px',
            borderRadius: '20px 20px 0 0',
            textAlign: 'center',
            position: 'relative'
          }}>
            {/* Urgency Badge */}
            <div style={{
              background: '#fbbf24',
              color: '#1f2937',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '700',
              marginBottom: '20px',
              display: 'inline-block',
              textTransform: 'uppercase',
              animation: 'pulse 2s infinite'
            }}>
              ⏰ EXPIRA EM {formatTime(timeLeft)}
            </div>

            <h2 style={{
              fontSize: '32px',
              fontWeight: '800',
              marginBottom: '12px',
              lineHeight: '1.2'
            }}>
              {currentOffer.title}
            </h2>
            
            <p style={{
              fontSize: '18px',
              opacity: '0.95',
              marginBottom: '0'
            }}>
              {currentOffer.subtitle}
            </p>
          </div>

          {/* Offer Details */}
          <div style={{
            padding: '40px',
            textAlign: 'center'
          }}>
            {/* Discount Highlight */}
            <div style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: 'white',
              padding: '20px',
              borderRadius: '16px',
              marginBottom: '30px'
            }}>
              <h3 style={{
                fontSize: '28px',
                fontWeight: '800',
                marginBottom: '8px'
              }}>
                {currentOffer.discount}
              </h3>
              
              {currentOffer.originalPrice && currentOffer.salePrice && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '20px',
                  fontSize: '20px',
                  fontWeight: '600'
                }}>
                  <span style={{
                    textDecoration: 'line-through',
                    opacity: '0.7'
                  }}>
                    {currentOffer.originalPrice}
                  </span>
                  <span>→</span>
                  <span style={{ fontSize: '28px', fontWeight: '800' }}>
                    {currentOffer.salePrice}
                  </span>
                </div>
              )}
              
              <div style={{
                fontSize: '16px',
                opacity: '0.9',
                marginTop: '8px'
              }}>
                Economia: {currentOffer.savings}
              </div>
            </div>

            {/* Benefits */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '12px',
              marginBottom: '30px'
            }}>
              {currentOffer.benefits.map((benefit, index) => (
                <div key={index} style={{
                  background: '#f0fdf4',
                  border: '2px solid #22c55e',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#15803d'
                }}>
                  {benefit}
                </div>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <input
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  style={{
                    padding: '16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
                
                <input
                  type="email"
                  placeholder="Seu melhor email *"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  style={{
                    padding: '16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
                
                <input
                  type="tel"
                  placeholder="Seu WhatsApp (opcional)"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  style={{
                    padding: '16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <button
                type="submit"
                disabled={!formData.email}
                style={{
                  background: formData.email ? '#25D366' : '#9ca3af',
                  color: 'white',
                  padding: '18px 32px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: formData.email ? 'pointer' : 'not-allowed',
                  width: '100%',
                  transition: 'all 0.2s',
                  marginBottom: '16px'
                }}
                onMouseEnter={e => {
                  if (formData.email) {
                    e.currentTarget.style.background = '#22c55e';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={e => {
                  if (formData.email) {
                    e.currentTarget.style.background = '#25D366';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                🎁 QUERO MEU DESCONTO EXCLUSIVO
              </button>

              <div style={{
                fontSize: '14px',
                color: '#6b7280',
                textAlign: 'center'
              }}>
                {currentOffer.urgency}
              </div>
            </form>

            {/* Trust Indicators */}
            <div style={{
              marginTop: '24px',
              padding: '16px',
              background: '#f8fafc',
              borderRadius: '12px',
              fontSize: '12px',
              color: '#6b7280'
            }}>
              🔒 Seus dados estão seguros | ✅ Sem spam | 🇧🇷 Atendimento em português
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInScale {
          from {
            opacity: 0;
            transform: scale(0.7) translateY(50px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @media (max-width: 768px) {
          div {
            padding: 20px !important;
          }
        }
      `}</style>
    </>
  );
}