'use client';

import Link from 'next/link';
import Logo from '@/components/Logo';
import { MailIcon, ChatIcon } from '@/components/Icons';

interface FooterProps {
  isMobile?: boolean;
}

export default function Footer({ isMobile = false }: FooterProps) {
  return (
    <footer style={{
      position: 'relative',
      zIndex: 10,
      background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(3, 7, 18, 0.95))',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '80px 0 40px 0',
      color: 'white'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 32px'
      }}>
        {/* Main Footer Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr',
          gap: '48px',
          marginBottom: '64px'
        }}>
          {/* Logo and Description */}
          <div>
            <div style={{ marginBottom: '24px' }}>
              <Logo 
                size="md" 
                showText={false} 
                variant="logo-only" 
                headingLevel="div"
                className="logo-footer"
              />
            </div>
            <p style={{
              color: 'rgba(219, 234, 254, 0.8)',
              fontSize: '16px',
              lineHeight: '1.6',
              marginBottom: '24px'
            }}>
              Especialistas em viagens Brasil-EUA há mais de 10 anos. 
              Conectamos brasileiros nos EUA ao Brasil com atendimento personalizado e preços exclusivos.
            </p>
            
            {/* Contact Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button
                onClick={() => {
                  const contactForm = document.getElementById('contact-form');
                  if (contactForm) {
                    contactForm.style.display = contactForm.style.display === 'none' ? 'block' : 'none';
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(219, 234, 254, 0.8)',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'color 0.3s',
                  cursor: 'pointer',
                  padding: '0'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(219, 234, 254, 0.8)'}>
                <MailIcon style={{ width: '20px', height: '20px' }} />
                Enviar Mensagem
              </button>
              <a href="https://wa.me/551151944717" style={{
                color: 'rgba(219, 234, 254, 0.8)',
                textDecoration: 'none',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'color 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(219, 234, 254, 0.8)'}>
                <ChatIcon style={{ width: '20px', height: '20px' }} />
                WhatsApp 24/7
              </a>
            </div>
            
            {/* Contact Form */}
            <div id="contact-form" style={{
              display: 'none',
              marginTop: '24px',
              padding: '24px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '700',
                marginBottom: '16px',
                color: 'white',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Envie sua Mensagem
              </h4>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input
                  type="text"
                  placeholder="Seu Nome"
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <input
                  type="email"
                  placeholder="Seu Email"
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <textarea
                  placeholder="Sua Mensagem"
                  rows={4}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Enviar Mensagem
                </button>
              </form>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 style={{
              fontSize: '18px',
              fontWeight: '700',
              marginBottom: '24px',
              color: 'white',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Nossos Serviços
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              {[
                { name: 'Passagens Aéreas', href: '/', icon: '✈️' },
                { name: 'Hotéis no Brasil', href: '/', icon: '🏨' },
                { name: 'Aluguel de Carros', href: '/', icon: '🚗' },
                { name: 'Passeios e Tours', href: '/', icon: '🗺️' },
                { name: 'Seguro Viagem', href: '/', icon: '🛡️' }
              ].map((service, index) => (
                <li key={index} style={{ marginBottom: '12px' }}>
                  <Link href={service.href} style={{
                    color: 'rgba(219, 234, 254, 0.8)',
                    textDecoration: 'none',
                    fontSize: '15px',
                    transition: 'color 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(219, 234, 254, 0.8)'}>
                    <span style={{ fontSize: '16px' }}>{service.icon}</span>
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 style={{
              fontSize: '18px',
              fontWeight: '700',
              marginBottom: '24px',
              color: 'white',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Suporte
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              {[
                { name: 'Como Funciona', href: '/como-funciona' },
                { name: 'FAQ', href: '/faq' },
                { name: 'Contato', href: '/contato' },
                { name: 'Sobre Nós', href: '/sobre' },
                { name: 'Blog', href: '/blog' }
              ].map((item, index) => (
                <li key={index} style={{ marginBottom: '12px' }}>
                  <Link href={item.href} style={{
                    color: 'rgba(219, 234, 254, 0.8)',
                    textDecoration: 'none',
                    fontSize: '15px',
                    transition: 'color 0.3s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(219, 234, 254, 0.8)'}>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 style={{
              fontSize: '18px',
              fontWeight: '700',
              marginBottom: '24px',
              color: 'white',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Legal
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              {[
                { name: 'Política de Privacidade', href: '/politica-privacidade' },
                { name: 'Termos de Uso', href: '/termos-uso' },
                { name: 'Cookies', href: '#' },
                { name: 'Segurança', href: '#' }
              ].map((item, index) => (
                <li key={index} style={{ marginBottom: '12px' }}>
                  <Link href={item.href} style={{
                    color: 'rgba(219, 234, 254, 0.8)',
                    textDecoration: 'none',
                    fontSize: '15px',
                    transition: 'color 0.3s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(219, 234, 254, 0.8)'}>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            
            {/* Trust Badges */}
            <div style={{ marginTop: '32px' }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: '#10b981',
                  textAlign: 'center',
                  fontWeight: '600'
                }}>
                  🔒 SSL Certificado
                </div>
                <div style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: '#3b82f6',
                  textAlign: 'center',
                  fontWeight: '600'
                }}>
                  ⭐ 4.9/5 Estrelas
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px'
        }}>
          <div>
            <p style={{ 
              margin: 0,
              color: 'rgba(147, 197, 253, 0.8)',
              fontSize: '14px'
            }}>
              &copy; 2024 Fly2Any. Todos os direitos reservados.
            </p>
            <p style={{
              margin: '4px 0 0 0',
              color: 'rgba(147, 197, 253, 0.6)',
              fontSize: '12px'
            }}>
              Conectando você ao mundo há 21 anos.
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <span style={{
              color: 'rgba(147, 197, 253, 0.6)',
              fontSize: '12px'
            }}>
              Feito com ❤️ para brasileiros
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}