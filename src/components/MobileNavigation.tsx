'use client';
import React from 'react';

import Link from 'next/link';
import { FlightIcon, PhoneIcon } from './Icons';

interface MobileNavigationProps {
  currentPath?: string;
  style?: React.CSSProperties;
}

export default function MobileNavigation({ currentPath = '/', style }: MobileNavigationProps) {
  // Navigation is always visible

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
      {/* Simplified always-visible mobile nav */}

      {/* Mobile Menu */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: 'rgba(255, 255, 255, 0.98)',
        zIndex: 1000,
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        ...style
      }}>
        <div style={{ 
          width: '100%',
          padding: '0 8px'
        }}>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            justifyContent: 'space-around'
          }}>
            {navigationItems.slice(0, 4).map((item) => (
              <li key={item.href} style={{ 
                flex: 1,
                textAlign: 'center'
              }}>
                <Link
                  href={item.href}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 4px',
                    textDecoration: 'none',
                    color: currentPath === item.href ? '#1e40af' : '#374151',
                    fontWeight: currentPath === item.href ? '600' : '500',
                    fontSize: '12px'
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
                  {item.icon === 'flight' && <FlightIcon style={{ width: '20px', height: '20px' }} />}
                  {item.icon === 'contact' && <PhoneIcon style={{ width: '20px', height: '20px' }} />}
                  {item.icon === 'home' && (
                    <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  )}
                  {item.icon === 'help' && (
                    <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* No additional styles needed */}
    </>
  );
}
