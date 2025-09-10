'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FlightIcon, CheckIcon, ClockIcon, StarIcon, PhoneIcon } from '@/components/Icons';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import Footer from '@/components/Footer';
import GlobalMobileStyles from '@/components/GlobalMobileStyles';

// High-converting Miami-São Paulo landing page with urgency and scarcity tactics
export default function VoosMiamiSaoPauloPromocional() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 11,
    minutes: 23,
    seconds: 45
  });
  
  const [visitorsCount, setVisitorsCount] = useState(847);
  const [bookedToday, setBookedToday] = useState(23);

  // Dynamic counters for social proof
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newSeconds = prev.seconds - 1;
        if (newSeconds < 0) {
          const newMinutes = prev.minutes - 1;
          if (newMinutes < 0) {
            const newHours = prev.hours - 1;
            if (newHours < 0) {
              return { hours: 23, minutes: 59, seconds: 59 };
            }
            return { hours: newHours, minutes: 59, seconds: 59 };
          }
          return { ...prev, minutes: newMinutes, seconds: 59 };
        }
        return { ...prev, seconds: newSeconds };
      });
    }, 1000);

    const visitorsTimer = setInterval(() => {
      setVisitorsCount(prev => Math.min(prev + Math.floor(Math.random() * 3), 999));
    }, 15000);

    const bookedTimer = setInterval(() => {
      if (Math.random() > 0.7) {
        setBookedToday(prev => prev + 1);
      }
    }, 30000);

    return () => {
      clearInterval(timer);
      clearInterval(visitorsTimer);
      clearInterval(bookedTimer);
    };
  }, []);

  const handleWhatsAppClick = () => {
    const message = "Oi! Vi a promoção especial Miami-São Paulo no site e quero garantir o desconto de R$ 4.200!";
    window.open(`https://wa.me/551151944717?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <>
      <ResponsiveHeader />
      <GlobalMobileStyles />
      
      {/* Urgency Alert Bar */}
      <div style={{
        background: 'linear-gradient(135deg, #dc2626, #ef4444)',
        color: 'white',
        padding: '12px',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: '600',
        position: 'sticky',
        top: '0',
        zIndex: 1000,
        animation: 'pulse 2s infinite'
      }}>
        🔥 ÚLTIMA OPORTUNIDADE: Apenas {12 - Math.floor(bookedToday/2)} vagas restantes para Miami-São Paulo hoje!
      </div>

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0c4a6e 0%, #dc2626 70%, #ea580c 100%)',
        color: 'white',
        padding: '80px 24px',
        textAlign: 'center',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Elements */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          fontSize: '120px',
          opacity: '0.05',
          transform: 'rotate(-15deg)'
        }}>🛫</div>
        
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          fontSize: '80px',
          opacity: '0.05',
          transform: 'rotate(15deg)'
        }}>🇧🇷</div>

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Urgency Badge */}
          <div style={{
            background: '#fbbf24',
            color: '#1f2937',
            padding: '12px 24px',
            borderRadius: '50px',
            fontSize: '16px',
            fontWeight: '800',
            marginBottom: '32px',
            display: 'inline-block',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            animation: 'bounce 1s infinite'
          }}>
            ⚡ OFERTA TERMINA EM {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
          </div>

          <h1 style={{
            fontSize: '4.5rem',
            fontWeight: '900',
            marginBottom: '24px',
            textShadow: '3px 3px 6px rgba(0,0,0,0.4)',
            lineHeight: '1.1'
          }}>
            Miami ✈️ São Paulo
            <br/>
            <span style={{ color: '#fbbf24' }}>
              Por Apenas $675
            </span>
          </h1>

          <div style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#ef4444',
            textDecoration: 'line-through',
            marginBottom: '16px'
          }}>
            Era $2.890 💸
          </div>

          <p style={{
            fontSize: '1.8rem',
            marginBottom: '40px',
            fontWeight: '600',
            maxWidth: '800px',
            margin: '0 auto 40px auto'
          }}>
            Voe direto para São Paulo com <strong>economia de R$ 4.200</strong>!<br/>
            Atendimento 100% em português + parcelamento em até 12x
          </p>

          {/* Value Props */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '50px'
          }}>
            {[
              '✈️ Voo Direto 8h30min',
              '💼 Bagagem Incluída',
              '🇧🇷 Atendimento em Português',
              '💳 Parcelamento 12x'
            ].map((benefit, index) => (
              <div key={index} style={{
                background: 'rgba(34, 197, 94, 0.2)',
                border: '2px solid #22c55e',
                borderRadius: '30px',
                padding: '12px 20px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#dcfce7'
              }}>
                {benefit}
              </div>
            ))}
          </div>

          {/* Main CTA */}
          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '40px'
          }}>
            <button
              onClick={handleWhatsAppClick}
              style={{
                background: '#25D366',
                color: 'white',
                padding: '20px 40px',
                borderRadius: '12px',
                fontSize: '20px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 8px 24px rgba(37, 211, 102, 0.3)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              💬 GARANTIR POR $675 AGORA
            </button>
            
            <a
              href="tel:+551151944717"
              style={{
                background: 'transparent',
                color: 'white',
                padding: '20px 40px',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '700',
                border: '3px solid white',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#0c4a6e';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'white';
              }}
            >
              📞 LIGAR: (11) 5194-4717
            </a>
          </div>

          {/* Social Proof Counter */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '20px',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            <div style={{ fontSize: '14px', marginBottom: '8px', opacity: '0.9' }}>
              🔥 Hoje na rota Miami-São Paulo:
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              <span>👥 {visitorsCount} pessoas visualizando</span>
              <span>✅ {bookedToday} já reservaram</span>
            </div>
          </div>
        </div>
      </section>

      {/* Scarcity Section */}
      <section style={{
        background: '#fef2f2',
        padding: '60px 24px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            color: '#dc2626',
            marginBottom: '30px'
          }}>
            ⚠️ APENAS {12 - Math.floor(bookedToday/2)} VAGAS RESTANTES HOJE!
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '30px',
            marginBottom: '50px'
          }}>
            <div style={{
              background: 'white',
              border: '3px solid #dc2626',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏰</div>
              <h3 style={{ color: '#dc2626', fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
                Oferta Limitada
              </h3>
              <p style={{ color: '#7f1d1d' }}>
                Válida apenas até às 23:59 de hoje
              </p>
            </div>
            
            <div style={{
              background: 'white',
              border: '3px solid #dc2626',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎟️</div>
              <h3 style={{ color: '#dc2626', fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
                Vagas Limitadas
              </h3>
              <p style={{ color: '#7f1d1d' }}>
                Apenas 12 passagens com esse preço
              </p>
            </div>
            
            <div style={{
              background: 'white',
              border: '3px solid #dc2626',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔥</div>
              <h3 style={{ color: '#dc2626', fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
                Demanda Alta
              </h3>
              <p style={{ color: '#7f1d1d' }}>
                {bookedToday} pessoas já garantiram hoje
              </p>
            </div>
          </div>
          
          <div style={{
            background: '#dc2626',
            color: 'white',
            padding: '24px',
            borderRadius: '16px',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            💡 <strong>DICA EXCLUSIVA:</strong> As 3 próximas pessoas que reservarem ganham upgrade gratuito para assento preferencial + kit amenidades premium!
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section style={{
        background: '#f8fafc',
        padding: '80px 24px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            color: '#1f2937',
            marginBottom: '50px'
          }}>
            Veja Quanto Você Está Economizando
          </h2>
          
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              gap: '40px',
              alignItems: 'center',
              marginBottom: '30px'
            }}>
              <div>
                <h3 style={{ color: '#ef4444', fontSize: '24px', marginBottom: '16px' }}>
                  ❌ Sites Tradicionais
                </h3>
                <div style={{
                  fontSize: '3rem',
                  fontWeight: '800',
                  color: '#ef4444',
                  textDecoration: 'line-through'
                }}>
                  $2,890
                </div>
                <div style={{ color: '#7f1d1d', fontSize: '16px', marginTop: '8px' }}>
                  + Taxas ocultas<br/>
                  + Sem suporte em português
                </div>
              </div>
              
              <div style={{
                fontSize: '60px',
                color: '#f59e0b',
                fontWeight: '800'
              }}>
                VS
              </div>
              
              <div>
                <h3 style={{ color: '#22c55e', fontSize: '24px', marginBottom: '16px' }}>
                  ✅ Fly2Any
                </h3>
                <div style={{
                  fontSize: '3rem',
                  fontWeight: '800',
                  color: '#22c55e'
                }}>
                  $675
                </div>
                <div style={{ color: '#15803d', fontSize: '16px', marginTop: '8px' }}>
                  + Sem taxas extras<br/>
                  + Suporte 24/7 em português
                </div>
              </div>
            </div>
            
            <div style={{
              background: '#22c55e',
              color: 'white',
              padding: '20px',
              borderRadius: '12px',
              fontSize: '24px',
              fontWeight: '800'
            }}>
              💰 SUA ECONOMIA: $2,215 (R$ 4,200)
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{
        background: 'linear-gradient(135deg, #1e3a8a, #7c3aed)',
        color: 'white',
        padding: '80px 24px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            marginBottom: '60px'
          }}>
            O Que Dizem Nossos Clientes Miami-São Paulo
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '40px'
          }}>
            {[
              {
                name: "Carlos Mendes",
                location: "Miami, FL",
                text: "Inacreditável! Economizei mais de R$ 4.000 na passagem. O atendimento em português foi perfeito!",
                rating: 5,
                date: "Há 2 dias"
              },
              {
                name: "Priscila Santos", 
                location: "Coral Gables, FL",
                text: "Melhor experiência que já tive comprando passagem. Rápido, barato e confiável. Super recomendo!",
                rating: 5,
                date: "Há 1 semana"
              },
              {
                name: "Roberto Silva",
                location: "Aventura, FL", 
                text: "Uso a Fly2Any há anos para ir ao Brasil. Sempre os melhores preços e atendimento impecável.",
                rating: 5,
                date: "Há 3 dias"
              }
            ].map((testimonial, index) => (
              <div key={index} style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                padding: '32px',
                textAlign: 'left'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  marginBottom: '16px'
                }}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} style={{ width: '20px', height: '20px', fill: '#fbbf24' }} />
                  ))}
                </div>
                
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  fontStyle: 'italic'
                }}>
                  "{testimonial.text}"
                </p>
                
                <div>
                  <div style={{
                    fontWeight: '600',
                    fontSize: '16px',
                    marginBottom: '4px'
                  }}>
                    {testimonial.name}
                  </div>
                  <div style={{
                    opacity: '0.8',
                    fontSize: '14px',
                    marginBottom: '4px'
                  }}>
                    {testimonial.location}
                  </div>
                  <div style={{
                    opacity: '0.6',
                    fontSize: '12px'
                  }}>
                    {testimonial.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        background: '#dc2626',
        color: 'white',
        padding: '80px 24px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: '900',
            marginBottom: '30px'
          }}>
            ⚡ Última Chance: $675 Miami-São Paulo
          </h2>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '3px solid white',
            borderRadius: '16px',
            padding: '30px',
            marginBottom: '40px'
          }}>
            <div style={{ fontSize: '18px', marginBottom: '16px' }}>
              ⏰ Esta oferta expira em:
            </div>
            <div style={{
              fontSize: '4rem',
              fontWeight: '900',
              color: '#fbbf24',
              fontFamily: 'monospace'
            }}>
              {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </div>
            <div style={{ fontSize: '16px', marginTop: '16px', opacity: '0.9' }}>
              Apenas {12 - Math.floor(bookedToday/2)} vagas restantes!
            </div>
          </div>
          
          <button
            onClick={handleWhatsAppClick}
            style={{
              background: '#25D366',
              color: 'white',
              padding: '24px 48px',
              borderRadius: '12px',
              fontSize: '22px',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(37, 211, 102, 0.4)',
              marginBottom: '20px'
            }}
          >
            💬 GARANTIR MIAMI-SÃO PAULO POR $675
          </button>
          
          <div style={{
            fontSize: '14px',
            opacity: '0.8',
            marginTop: '20px'
          }}>
            ✅ Sem pegadinhas | ✅ Sem taxas extras | ✅ Atendimento em português
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </>
  );
}