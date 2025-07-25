'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Logo from './Logo';
import MobileHeader from './MobileHeader';
import { FlightIcon, PhoneIcon } from './Icons';

interface ResponsiveHeaderProps {
  style?: React.CSSProperties;
  className?: string;
}

export default function ResponsiveHeader({ style, className }: ResponsiveHeaderProps) {
  const pathname = usePathname();

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
          <Link href="/voos-brasil-eua" style={{
            color: pathname === '/voos-brasil-eua' ? 'white' : 'rgba(255, 255, 255, 0.9)',
            textDecoration: 'none',
            fontWeight: pathname === '/voos-brasil-eua' ? '600' : '500',
            transition: 'color 0.3s',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <FlightIcon style={{ width: '14px', height: '14px' }} />
            Voos
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