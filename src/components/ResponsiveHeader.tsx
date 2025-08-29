'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Logo from './Logo';
import MobileHeader from './MobileHeader';
import { FlightIcon, PhoneIcon } from './Icons';
import LoginButton from './auth/LoginButton';

interface ResponsiveHeaderProps {
  style?: React.CSSProperties;
  className?: string;
}

export default function ResponsiveHeader({ style, className }: ResponsiveHeaderProps) {
  const pathname = usePathname();
  const [showDealAlert, setShowDealAlert] = useState(true);
  const [liveBookings, setLiveBookings] = useState(247);
  const [flashDealTimer, setFlashDealTimer] = useState(125 * 60); // 2h 5m in seconds

  // US Market focused language
  const currentLang = 'en';

  // Update live stats every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveBookings((prev: any) => prev + (Math.random() > 0.7 ? 1 : 0));
      setFlashDealTimer((prev: any) => Math.max(0, prev - 1));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Format countdown timer
  const formatTimer = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  // US Market optimized navigation
  const translations = {
    en: {
      flights: 'Flights',
      deals: 'Deals',
      support: '24/7 Support',
      login: 'Sign In'
    }
  };

  const t = translations[currentLang] || translations.en;

  return (
    <>
      {/* Flash Deal Alert Banner */}
      {showDealAlert && (
        <div style={{
          background: 'linear-gradient(135deg, #dc2626, #ef4444)',
          color: 'white',
          padding: '8px 0',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: '600',
          position: 'relative',
          zIndex: 20,
          animation: 'flashPulse 2s infinite'
        }}>
          <div style={{
            maxWidth: '1600px',
            margin: '0 auto',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px'
          }}>
            <span>🔥 FLASH SALE: NYC→LA from $187 (40% OFF)</span>
            <span>⏰ Expires in {formatTimer(flashDealTimer)}</span>
            <button
              onClick={() => setShowDealAlert(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Mobile Header - Hidden on desktop via CSS */}
      <div className="mobile-header-container">
        <MobileHeader currentPath={pathname} />
      </div>

      {/* Desktop Header - Hidden on mobile via CSS */}
      <div className="desktop-header-container">
        <header style={{
          position: 'relative',
          zIndex: 10,
          background: 'linear-gradient(to bottom right, #1e3a8a, #581c87, #312e81)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          overflow: 'hidden',
          ...style
        }} className={className}>
          
          {/* Trust Signals Bar */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '6px 0',
            fontSize: '12px'
          }}>
            <div style={{
              maxWidth: '1600px',
              margin: '0 auto',
              padding: '0 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: 'rgba(255, 255, 255, 0.9)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🛡️</span>
                  <span>BBB A+ Rated</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>⭐</span>
                  <span>4.9/5 from 2.1M+ customers</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>💰</span>
                  <span>Price Match Guarantee</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📞</span>
                  <span>24/7 Support: 1-800-FLY2ANY</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="live-dot" style={{
                    width: '6px',
                    height: '6px',
                    background: '#10b981',
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite'
                  }}></span>
                  <span>{liveBookings} flights booked today</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Header Content */}
          <div style={{
            maxWidth: '1600px',
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <Logo size="md" variant="logo-only" />
              </Link>
              
              {/* Competitive Advantage Badge */}
              <div style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span>⚡</span>
                <span>5X FASTER THAN KAYAK</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              {/* Streamlined Navigation */}
              <nav style={{ display: 'flex', gap: '24px' }}>
                <Link href="/flights" style={{
                  color: pathname.includes('/flights') ? 'white' : 'rgba(255, 255, 255, 0.9)',
                  textDecoration: 'none',
                  fontWeight: pathname.includes('/flights') ? '700' : '600',
                  transition: 'color 0.3s',
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FlightIcon style={{ width: '16px', height: '16px' }} />
                  {t.flights}
                  {pathname.includes('/flights') && (
                    <div style={{
                      width: '6px',
                      height: '6px',
                      background: '#10b981',
                      borderRadius: '50%'
                    }}></div>
                  )}
                </Link>
                
                <Link href="/deals" style={{
                  color: pathname.includes('/deals') ? 'white' : 'rgba(255, 255, 255, 0.9)',
                  textDecoration: 'none',
                  fontWeight: pathname.includes('/deals') ? '700' : '600',
                  transition: 'color 0.3s',
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  position: 'relative'
                }}>
                  <span>🔥</span>
                  {t.deals}
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: '#dc2626',
                    color: 'white',
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    fontWeight: '700'
                  }}>
                    HOT
                  </div>
                </Link>
                
                <Link href="/support" style={{
                  color: pathname.includes('/support') ? 'white' : 'rgba(255, 255, 255, 0.9)',
                  textDecoration: 'none',
                  fontWeight: pathname.includes('/support') ? '700' : '600',
                  transition: 'color 0.3s',
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>💬</span>
                  {t.support}
                </Link>
              </nav>

              {/* AI Assistant Badge */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                <span>🤖</span>
                <span style={{ fontSize: '13px', color: 'white', fontWeight: '600' }}>
                  AI Assistant
                </span>
                <div style={{
                  width: '6px',
                  height: '6px',
                  background: '#10b981',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }}></div>
              </div>

              {/* Login Button */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <LoginButton variant="header" showText={true} loginText={t.login} />
              </div>
            </div>
          </div>
          
          {/* Animated Background Elements */}
          <div style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 0
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              background: '#60a5fa',
              borderRadius: '50%',
              mixBlendMode: 'multiply',
              filter: 'blur(20px)',
              opacity: 0.3,
              animation: 'pulse 4s ease-in-out infinite'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: '-10px',
              left: '20%',
              width: '60px',
              height: '60px',
              background: '#ec4899',
              borderRadius: '50%',
              mixBlendMode: 'multiply',
              filter: 'blur(15px)',
              opacity: 0.2,
              animation: 'pulse 6s ease-in-out infinite 2s'
            }}></div>
          </div>
        </header>
      </div>

      {/* CSS for responsive behavior and animations */}
      <style jsx={true}>{`
        .mobile-header-container {
          display: none;
        }
        
        .desktop-header-container {
          display: block;
        }
        
        @keyframes flashPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        @keyframes pulse {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.7; 
            transform: scale(1.1); 
          }
        }
        
        @media (max-width: 1200px) {
          .desktop-header-container nav {
            gap: 16px !important;
          }
          
          .desktop-header-container nav a {
            font-size: 14px !important;
          }
        }
        
        @media (max-width: 767px) {
          .mobile-header-container {
            display: block;
          }
          
          .desktop-header-container {
            display: none;
          }
        }
      `}</style>
    </>
  );
}