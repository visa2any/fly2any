'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { FlightIcon, PhoneIcon, ChatIcon } from './Icons';

interface MobileNavigationProps {
  currentPath?: string;
}

export default function MobileNavigation({ currentPath = '/' }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navigationItems = [
    { href: '/', label: 'Início', icon: 'home' },
    { href: '/voos-brasil-eua', label: 'Voos Brasil-EUA', icon: 'flight' },
    { href: '/como-funciona', label: 'Como Funciona', icon: 'help' },
    { href: '/blog', label: 'Blog', icon: 'blog' },
    { href: '/faq', label: 'FAQ', icon: 'faq' },
    { href: '/sobre', label: 'Sobre', icon: 'info' },
    { href: '/contato', label: 'Contato', icon: 'contact' },
  ];

  return (
    <>
      {/* Mobile Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Logo size="sm" showText={true} variant="default" />
        
        {/* Hamburger Menu Button */}
        <button
          onClick={toggleMenu}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            width: '24px',
            height: '24px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            zIndex: 1001
          }}
          aria-label="Toggle menu"
        >
          <div style={{
            width: '100%',
            height: '2px',
            backgroundColor: isOpen ? 'transparent' : '#1f2937',
            transition: 'all 0.3s ease',
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0)',
            transformOrigin: 'center'
          }} />
          <div style={{
            width: '100%',
            height: '2px',
            backgroundColor: '#1f2937',
            transition: 'all 0.3s ease',
            transform: isOpen ? 'rotate(-45deg) translate(0, -2px)' : 'rotate(0)',
            transformOrigin: 'center'
          }} />
          <div style={{
            width: '100%',
            height: '2px',
            backgroundColor: isOpen ? 'transparent' : '#1f2937',
            transition: 'all 0.3s ease',
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0)',
            transformOrigin: 'center'
          }} />
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            animation: 'fadeIn 0.3s ease'
          }}
          onClick={toggleMenu}
        />
      )}

      {/* Mobile Menu */}
      <nav style={{
        position: 'fixed',
        top: 0,
        right: isOpen ? 0 : '-100%',
        width: '280px',
        height: '100vh',
        background: 'white',
        zIndex: 1000,
        transition: 'right 0.3s ease',
        boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
        overflow: 'auto',
        paddingTop: '80px'
      }}>
        <div style={{ padding: '20px' }}>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0
          }}>
            {navigationItems.map((item) => (
              <li key={item.href} style={{ marginBottom: '4px' }}>
                <Link
                  href={item.href}
                  onClick={toggleMenu}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: currentPath === item.href ? '#1e40af' : '#374151',
                    backgroundColor: currentPath === item.href ? 'rgba(30, 64, 175, 0.1)' : 'transparent',
                    fontWeight: currentPath === item.href ? '600' : '500',
                    fontSize: '16px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (currentPath !== item.href) {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPath !== item.href) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {item.icon === 'flight' && <FlightIcon style={{ width: '18px', height: '18px' }} />}
                  {item.icon === 'contact' && <PhoneIcon style={{ width: '18px', height: '18px' }} />}
                  {item.icon === 'home' && (
                    <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  )}
                  {item.icon === 'help' && (
                    <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {item.icon === 'blog' && (
                    <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  )}
                  {item.icon === 'faq' && (
                    <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {item.icon === 'info' && (
                    <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Contact Actions */}
          <div style={{
            marginTop: '32px',
            padding: '20px 16px',
            backgroundColor: 'rgba(30, 64, 175, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(30, 64, 175, 0.1)'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: '#1e40af'
            }}>
              Fale Conosco
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link
                href="/contato"
                onClick={toggleMenu}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  color: '#1e40af',
                  backgroundColor: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: '1px solid rgba(30, 64, 175, 0.2)',
                  transition: 'all 0.2s ease'
                }}
              >
                <ChatIcon style={{ width: '16px', height: '16px' }} />
                Cotação Gratuita
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}
