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

  // Site principal em inglês americano
  const currentLang = 'en';


  // Traduções do header
  const translations = {
    pt: {
      home: 'Home',
      flights: 'Voos',
      hotels: 'Hotéis',
      howItWorks: 'Como Funciona',
      blog: 'Blog',
      faq: 'FAQ',
      about: 'Sobre',
      contact: 'Contato',
      login: 'Entrar'
    },
    en: {
      home: 'Home',
      flights: 'Flights',
      hotels: 'Hotels',
      howItWorks: 'How It Works',
      blog: 'Blog',
      faq: 'FAQ',
      about: 'About',
      contact: 'Contact',
      login: 'Sign In'
    },
    es: {
      home: 'Inicio',
      flights: 'Vuelos',
      hotels: 'Hoteles',
      howItWorks: 'Cómo Funciona',
      blog: 'Blog',
      faq: 'FAQ',
      about: 'Acerca de',
      contact: 'Contacto',
      login: 'Iniciar Sesión'
    }
  };

  const t = translations[currentLang] || translations.en;

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
      background: 'linear-gradient(to bottom right, #1e3a8a, #581c87, #312e81)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      overflow: 'hidden',
      ...style
    }} className={className}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none'
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
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Logo size="md" variant="logo-only" />
        </Link>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
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
            {t.home}
          </Link>
          <Link href="/flights" style={{
            color: (pathname === '/flights' || pathname === '/voos' || pathname === '/voos-brasil-eua') ? 'white' : 'rgba(255, 255, 255, 0.9)',
            textDecoration: 'none',
            fontWeight: (pathname === '/flights' || pathname === '/voos' || pathname === '/voos-brasil-eua') ? '600' : '500',
            transition: 'color 0.3s',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <FlightIcon style={{ width: '14px', height: '14px' }} />
            {t.flights}
          </Link>
          <Link href="/hotels" style={{
            color: (pathname === '/hotels' || pathname === '/hoteis') ? 'white' : 'rgba(255, 255, 255, 0.9)',
            textDecoration: 'none',
            fontWeight: (pathname === '/hotels' || pathname === '/hoteis') ? '600' : '500',
            transition: 'color 0.3s',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {t.hotels}
          </Link>
          <Link href="/how-it-works" style={{
            color: (pathname === '/how-it-works' || pathname === '/como-funciona') ? 'white' : 'rgba(255, 255, 255, 0.9)',
            textDecoration: 'none',
            fontWeight: (pathname === '/how-it-works' || pathname === '/como-funciona') ? '600' : '500',
            transition: 'color 0.3s',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t.howItWorks}
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
            {t.blog}
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
            {t.faq}
          </Link>
          <Link href="/about" style={{
            color: (pathname === '/about' || pathname === '/sobre') ? 'white' : 'rgba(255, 255, 255, 0.9)',
            textDecoration: 'none',
            fontWeight: (pathname === '/about' || pathname === '/sobre') ? '600' : '500',
            transition: 'color 0.3s',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t.about}
          </Link>
          <Link href="/contact" style={{
            color: (pathname === '/contact' || pathname === '/contato') ? 'white' : 'rgba(255, 255, 255, 0.9)',
            textDecoration: 'none',
            fontWeight: (pathname === '/contact' || pathname === '/contato') ? '600' : '500',
            transition: 'color 0.3s',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <PhoneIcon style={{ width: '14px', height: '14px' }} />
            {t.contact}
          </Link>
          </nav>

          {/* Login Button */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <LoginButton variant="header" showText={true} loginText={t.login} />
          </div>
        </div>
      </div>
    </header>
      </div>


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