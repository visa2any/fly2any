'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
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
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Detectar idioma atual baseado na URL
  const getCurrentLanguage = () => {
    if (pathname.startsWith('/en')) return 'en';
    if (pathname.startsWith('/es')) return 'es';
    return 'pt';
  };

  const currentLang = getCurrentLanguage();

  // Mapear URLs equivalentes entre idiomas
  const getLanguageUrl = (targetLang: string) => {
    // Simplificado: sempre direcionar para a homepage do idioma escolhido
    if (targetLang === 'en') return '/en';
    if (targetLang === 'es') return '/es';
    return '/'; // português (default)
  };

  const languages = [
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];

  // Calcular posição do dropdown
  useEffect(() => {
    if (isLanguageDropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
  }, [isLanguageDropdownOpen]);

  return (
    <>
      {/* Mobile Header - Hidden on desktop via CSS */}
      <div className="mobile-header-container">
        <MobileHeader currentPath={pathname} />
      </div>

      {/* Desktop Header - Hidden on mobile via CSS */}
      <div className="desktop-header-container">
        <header style={{
      position: 'relative',
      zIndex: 10,
      background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      ...style
    }} className={className}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Logo size="md" variant="logo-only" />
        </Link>
        
        <nav style={{ display: 'flex', gap: '24px' }}>
          <Link href="/" style={{
            color: pathname === '/' ? 'white' : 'rgba(255, 255, 255, 0.9)',
            textDecoration: 'none',
            fontWeight: pathname === '/' ? '600' : '500',
            transition: 'color 0.3s',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </Link>
          <Link href="/voos" style={{
            color: (pathname === '/voos' || pathname === '/voos-brasil-eua') ? 'white' : 'rgba(255, 255, 255, 0.9)',
            textDecoration: 'none',
            fontWeight: (pathname === '/voos' || pathname === '/voos-brasil-eua') ? '600' : '500',
            transition: 'color 0.3s',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <FlightIcon style={{ width: '14px', height: '14px' }} />
            Voos
          </Link>
          <Link href="/hoteis" style={{
            color: pathname === '/hoteis' ? 'white' : 'rgba(255, 255, 255, 0.9)',
            textDecoration: 'none',
            fontWeight: pathname === '/hoteis' ? '600' : '500',
            transition: 'color 0.3s',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Hotéis
          </Link>
          <Link href="/como-funciona" style={{
            color: pathname === '/como-funciona' ? 'white' : 'rgba(255, 255, 255, 0.9)',
            textDecoration: 'none',
            fontWeight: pathname === '/como-funciona' ? '600' : '500',
            transition: 'color 0.3s',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Como Funciona
          </Link>
          <Link href="/blog" style={{
            color: pathname === '/blog' ? 'white' : 'rgba(255, 255, 255, 0.9)',
            textDecoration: 'none',
            fontWeight: pathname === '/blog' ? '600' : '500',
            transition: 'color 0.3s',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            Blog
          </Link>
          <Link href="/faq" style={{
            color: pathname === '/faq' ? 'white' : 'rgba(255, 255, 255, 0.9)',
            textDecoration: 'none',
            fontWeight: pathname === '/faq' ? '600' : '500',
            transition: 'color 0.3s',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            FAQ
          </Link>
          <Link href="/sobre" style={{
            color: pathname === '/sobre' ? 'white' : 'rgba(255, 255, 255, 0.9)',
            textDecoration: 'none',
            fontWeight: pathname === '/sobre' ? '600' : '500',
            transition: 'color 0.3s',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Sobre
          </Link>
          <Link href="/contato" style={{
            color: pathname === '/contato' ? 'white' : 'rgba(255, 255, 255, 0.9)',
            textDecoration: 'none',
            fontWeight: pathname === '/contato' ? '600' : '500',
            transition: 'color 0.3s',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <PhoneIcon style={{ width: '14px', height: '14px' }} />
            Contato
          </Link>
        </nav>

        {/* Auth & Language Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '24px' }}>
          {/* Login Button */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <LoginButton variant="header" showText={true} />
          </div>

          {/* Language Selector */}
          <div style={{ position: 'relative' }}>
            <button
              ref={buttonRef}
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              <span style={{ fontSize: '16px' }}>
                {languages.find(lang => lang.code === currentLang)?.flag}
              </span>
              <span>
                {languages.find(lang => lang.code === currentLang)?.code.toUpperCase()}
              </span>
              <svg 
                style={{ 
                  width: '12px', 
                  height: '12px', 
                  transform: isLanguageDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
      </div>

      {/* Portal dropdown */}
      {isLanguageDropdownOpen && typeof window !== 'undefined' && createPortal(
        <>
          {/* Backdrop */}
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999998,
              background: 'transparent'
            }}
            onClick={() => setIsLanguageDropdownOpen(false)}
          />
          
          {/* Dropdown */}
          <div style={{
            position: 'fixed',
            top: dropdownPosition.top,
            right: dropdownPosition.right,
            background: 'white',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            minWidth: '160px',
            zIndex: 999999,
            backdropFilter: 'blur(10px)'
          }}>
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => {
                  const url = getLanguageUrl(language.code);
                  console.log(`🚀 PORTAL: Clicou em ${language.name}, navegando para: ${url}`);
                  setIsLanguageDropdownOpen(false);
                  window.location.href = url;
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px 16px',
                  color: '#374151',
                  textDecoration: 'none',
                  fontSize: '14px',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                  cursor: 'pointer',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left'
                }}
              >
                <span style={{ fontSize: '18px', marginRight: '8px' }}>{language.flag}</span>
                <span>{language.name}</span>
              </button>
            ))}
          </div>
        </>,
        document.body
      )}

      {/* CSS for responsive behavior */}
      <style jsx>{`
        .mobile-header-container {
          display: none;
        }
        
        .desktop-header-container {
          display: block;
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