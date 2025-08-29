'use client';
import React from 'react';

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
      {/* Trust Signals Banner */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '24px 0',
        marginBottom: '48px'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 32px'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: 'white',
              margin: '0 0 8px 0',
              fontFamily: 'Poppins, sans-serif'
            }}>
              🛡️ Trusted by 2.1M+ Travelers Worldwide
            </h3>
            <p style={{
              color: 'rgba(219, 234, 254, 0.8)',
              fontSize: '14px',
              margin: 0
            }}>
              Industry-leading certifications and guarantees for your peace of mind
            </p>
          </div>
          
          {/* Trust Badges Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(6, 1fr)',
            gap: '24px',
            alignItems: 'center'
          }}>
            {/* BBB A+ Rating */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🛡️</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#10b981' }}>BBB A+</div>
              <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.7)' }}>Rated</div>
            </div>

            {/* IATA Certified */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>✈️</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#3b82f6' }}>IATA</div>
              <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.7)' }}>Certified</div>
            </div>

            {/* SSL Security */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔒</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#10b981' }}>SSL</div>
              <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.7)' }}>Secured</div>
            </div>

            {/* Customer Rating */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>⭐</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#f59e0b' }}>4.9/5</div>
              <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.7)' }}>Rating</div>
            </div>

            {/* Price Match */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>💰</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#10b981' }}>Price Match</div>
              <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.7)' }}>Guarantee</div>
            </div>

            {/* 24/7 Support */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📞</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#06b6d4' }}>24/7</div>
              <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.7)' }}>Support</div>
            </div>
          </div>
        </div>
      </div>

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
              The smart way to fly. AI-powered flight search that's 5X faster than Kayak, 
              with transparent pricing Expedia can't match. Trusted by 2.1M+ travelers worldwide.
            </p>
            
            {/* Competitive Advantages */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#10b981',
                margin: '0 0 8px 0'
              }}>
                Why Choose Fly2Any?
              </h4>
              <ul style={{
                margin: 0,
                padding: 0,
                listStyle: 'none',
                fontSize: '13px',
                color: '#a7f3d0'
              }}>
                <li style={{ marginBottom: '4px' }}>⚡ Sub-1 second search results</li>
                <li style={{ marginBottom: '4px' }}>🤖 GPT-4 powered AI assistant</li>
                <li style={{ marginBottom: '4px' }}>💎 100% transparent pricing</li>
                <li>🎯 Price match guarantee</li>
              </ul>
            </div>
            
            {/* US Contact Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <a href="tel:1-800-FLY2ANY" style={{
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
                <span style={{ fontSize: '20px' }}>📞</span>
                1-800-FLY2ANY (24/7)
              </a>
              
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
                Live Chat Support
              </button>
              
              <a href="mailto:support@fly2any.com" style={{
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
                <span style={{ fontSize: '20px' }}>✉️</span>
                support@fly2any.com
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

          {/* US Services */}
          <div>
            <h4 style={{
              fontSize: '18px',
              fontWeight: '700',
              marginBottom: '24px',
              color: 'white',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Our Services
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              {[
                { name: 'Domestic Flights', href: '/flights/domestic', icon: '🇺🇸' },
                { name: 'International Flights', href: '/flights/international', icon: '🌍' },
                { name: 'AI Travel Assistant', href: '/ai-assistant', icon: '🤖' },
                { name: 'Price Alerts', href: '/price-alerts', icon: '🔔' },
                { name: 'Group Bookings', href: '/group-bookings', icon: '👥' },
                { name: 'Travel Insurance', href: '/travel-insurance', icon: '🛡️' }
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
              Support & Help
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              {[
                { name: 'How It Works', href: '/how-it-works' },
                { name: 'Help Center', href: '/help' },
                { name: 'Contact Us', href: '/contact' },
                { name: 'Live Chat', href: '/chat' },
                { name: 'Flight Status', href: '/flight-status' },
                { name: 'Booking Management', href: '/manage-booking' }
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

          {/* Legal & Compliance */}
          <div>
            <h4 style={{
              fontSize: '18px',
              fontWeight: '700',
              marginBottom: '24px',
              color: 'white',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Legal & Compliance
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              {[
                { name: 'Privacy Policy', href: '/privacy-policy' },
                { name: 'Terms of Service', href: '/terms-of-service' },
                { name: 'Cookie Policy', href: '/cookie-policy' },
                { name: 'Security', href: '/security' },
                { name: 'Accessibility', href: '/accessibility' },
                { name: 'Sitemap', href: '/sitemap' }
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
            
            {/* Industry Certifications */}
            <div style={{ marginTop: '32px' }}>
              <h5 style={{
                fontSize: '14px',
                fontWeight: '700',
                color: 'white',
                margin: '0 0 12px 0'
              }}>
                Industry Certifications
              </h5>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '11px',
                  color: '#10b981',
                  textAlign: 'center',
                  fontWeight: '600'
                }}>
                  🛡️ BBB A+ Accredited
                </div>
                <div style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '11px',
                  color: '#3b82f6',
                  textAlign: 'center',
                  fontWeight: '600'
                }}>
                  ✈️ IATA Certified Agent
                </div>
                <div style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '11px',
                  color: '#f59e0b',
                  textAlign: 'center',
                  fontWeight: '600'
                }}>
                  ⭐ 4.9/5 Customer Rating
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
              &copy; 2024 Fly2Any. All rights reserved.
            </p>
            <p style={{
              margin: '4px 0 0 0',
              color: 'rgba(147, 197, 253, 0.6)',
              fontSize: '12px'
            }}>
              The smart way to fly • Connecting travelers worldwide since 2003
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px'
          }}>
            {/* Social Media Links */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <a href="https://facebook.com/fly2any" style={{
                color: 'rgba(147, 197, 253, 0.6)',
                fontSize: '20px',
                textDecoration: 'none',
                transition: 'color 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(147, 197, 253, 0.6)'}>
                📘
              </a>
              <a href="https://twitter.com/fly2any" style={{
                color: 'rgba(147, 197, 253, 0.6)',
                fontSize: '20px',
                textDecoration: 'none',
                transition: 'color 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(147, 197, 253, 0.6)'}>
                🐦
              </a>
              <a href="https://instagram.com/fly2any" style={{
                color: 'rgba(147, 197, 253, 0.6)',
                fontSize: '20px',
                textDecoration: 'none',
                transition: 'color 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(147, 197, 253, 0.6)'}>
                📷
              </a>
              <a href="https://linkedin.com/company/fly2any" style={{
                color: 'rgba(147, 197, 253, 0.6)',
                fontSize: '20px',
                textDecoration: 'none',
                transition: 'color 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(147, 197, 253, 0.6)'}>
                💼
              </a>
            </div>
            
            <span style={{
              color: 'rgba(147, 197, 253, 0.6)',
              fontSize: '12px'
            }}>
              Made with 🤖 AI in USA
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}