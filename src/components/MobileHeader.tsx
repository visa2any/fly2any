'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import { FlightIcon, PhoneIcon } from './Icons';

interface MobileHeaderProps {
  currentPath?: string;
}

export default function MobileHeader({ currentPath = '/' }: MobileHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const pathname = usePathname();

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

  const navigationItems = [
    { href: '/', label: 'Início', icon: 'home' },
    { href: '/voos-brasil-eua', label: 'Voos Brasil-EUA', icon: 'flight' },
    { href: '/voos-miami-sao-paulo', label: 'Miami ↔ São Paulo', icon: 'flight' },
    { href: '/voos-new-york-rio-janeiro', label: 'NY ↔ Rio de Janeiro', icon: 'flight' },
    { href: '/como-funciona', label: 'Como Funciona', icon: 'help' },
    { href: '/blog', label: 'Blog', icon: 'blog' },
    { href: '/faq', label: 'FAQ', icon: 'faq' },
    { href: '/sobre', label: 'Sobre Nós', icon: 'info' },
    { href: '/contato', label: 'Contato', icon: 'contact' },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '70px',
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px'
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none' }} onClick={closeMenu}>
          <Logo size="sm" variant="logo-only" />
        </Link>

        {/* Right Side - Language Selector + Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Language Selector Mobile */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '6px',
                padding: '6px 8px',
                color: 'white',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                minWidth: '50px',
                justifyContent: 'center'
              }}
            >
              <span style={{ fontSize: '14px' }}>
                {languages.find(lang => lang.code === currentLang)?.flag}
              </span>
              <span style={{ fontSize: '11px' }}>
                {languages.find(lang => lang.code === currentLang)?.code.toUpperCase()}
              </span>
            </button>

            {/* Mobile Language Dropdown */}
            {isLanguageDropdownOpen && (
              <>
                <div 
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 9998
                  }}
                  onClick={() => setIsLanguageDropdownOpen(false)}
                />
                
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  background: 'white',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '6px',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
                  overflow: 'hidden',
                  minWidth: '140px',
                  zIndex: 9999
                }}>
                  {languages.map((language) => (
                    <Link
                      key={language.code}
                      href={getLanguageUrl(language.code)}
                      onClick={() => {
                        setIsLanguageDropdownOpen(false);
                        closeMenu();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 12px',
                        color: currentLang === language.code ? '#1e40af' : '#374151',
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: currentLang === language.code ? '600' : '500',
                        background: currentLang === language.code ? '#f0f9ff' : 'transparent',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>{language.flag}</span>
                      <span>{language.name}</span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Hamburger Menu Button */}
        <button
          onClick={toggleMenu}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            transition: 'all 0.3s ease'
          }}
          aria-label="Menu"
        >
          <div style={{
            width: '25px',
            height: '3px',
            background: 'white',
            borderRadius: '2px',
            transform: isMenuOpen ? 'rotate(45deg) translate(6px, 6px)' : 'none',
            transition: 'all 0.3s ease'
          }} />
          <div style={{
            width: '25px',
            height: '3px',
            background: 'white',
            borderRadius: '2px',
            opacity: isMenuOpen ? 0 : 1,
            transition: 'all 0.3s ease'
          }} />
          <div style={{
            width: '25px',
            height: '3px',
            background: 'white',
            borderRadius: '2px',
            transform: isMenuOpen ? 'rotate(-45deg) translate(6px, -6px)' : 'none',
            transition: 'all 0.3s ease'
          }} />
        </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            animation: 'fadeIn 0.3s ease'
          }}
          onClick={closeMenu}
        />
      )}

      {/* Mobile Menu */}
      <nav style={{
        position: 'fixed',
        top: '70px',
        right: isMenuOpen ? 0 : '-100%',
        width: '280px',
        height: 'calc(100vh - 70px)',
        background: 'white',
        zIndex: 1001,
        boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
        transition: 'right 0.3s ease',
        overflowY: 'auto'
      }}>
        <div style={{ padding: '24px 0' }}>
          {/* Navigation Items */}
          {navigationItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px 24px',
                textDecoration: 'none',
                color: currentPath === item.href ? '#1e40af' : '#374151',
                backgroundColor: currentPath === item.href ? '#f0f9ff' : 'transparent',
                borderLeft: currentPath === item.href ? '4px solid #1e40af' : '4px solid transparent',
                fontWeight: currentPath === item.href ? '600' : '500',
                fontSize: '16px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (currentPath !== item.href) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }
              }}
              onMouseLeave={(e) => {
                if (currentPath !== item.href) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {/* Icons */}
              {item.icon === 'flight' && <FlightIcon style={{ width: '20px', height: '20px', color: currentPath === item.href ? '#1e40af' : '#6b7280' }} />}
              {item.icon === 'contact' && <PhoneIcon style={{ width: '20px', height: '20px', color: currentPath === item.href ? '#1e40af' : '#6b7280' }} />}
              {item.icon === 'home' && (
                <svg style={{ width: '20px', height: '20px', color: currentPath === item.href ? '#1e40af' : '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              )}
              {item.icon === 'help' && (
                <svg style={{ width: '20px', height: '20px', color: currentPath === item.href ? '#1e40af' : '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {item.icon === 'blog' && (
                <svg style={{ width: '20px', height: '20px', color: currentPath === item.href ? '#1e40af' : '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              )}
              {item.icon === 'faq' && (
                <svg style={{ width: '20px', height: '20px', color: currentPath === item.href ? '#1e40af' : '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {item.icon === 'info' && (
                <svg style={{ width: '20px', height: '20px', color: currentPath === item.href ? '#1e40af' : '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {item.label}
            </Link>
          ))}

          {/* Contact Section */}
          <div style={{
            margin: '24px 0',
            padding: '0 24px',
            borderTop: '1px solid #e5e7eb',
            paddingTop: '24px'
          }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '16px'
            }}>
              Fale Conosco
            </h4>
            
            <a
              href="https://wa.me/551151944717"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: '#10b981',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                marginBottom: '12px',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#059669';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#10b981';
              }}
            >
              <svg style={{ width: '20px', height: '20px' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              WhatsApp
            </a>

            <Link
              href="/contato"
              onClick={closeMenu}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: '#f3f4f6',
                color: '#374151',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f3f4f6';
              }}
            >
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </Link>
          </div>
        </div>
      </nav>

      {/* Body spacing when menu is open */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        body {
          margin-top: 70px;
          overflow-x: hidden;
        }
      `}</style>
    </>
  );
}