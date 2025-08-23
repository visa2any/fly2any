'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function LiveSiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Debug log to verify component is rendering
  React.useEffect(() => {
    console.log('🚀 LiveSiteHeader is rendering!');
  }, []);

  return (
    <>
      <header role="banner" className="site-header bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white mobile-header-fixed" style={{ height: '50px' }}>
        <div className="container max-w-7xl mx-auto px-0 py-1 md:px-6 md:py-4 mobile-safe-area">
          <div className="flex items-center justify-between px-3 md:px-0 h-full">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/fly2any-logo.png"
                alt="Fly2Any - Especialistas em viagens Brasil-EUA"
                width={80}
                height={30}
                className="h-6 w-auto md:h-10 md:w-auto"
                priority
              />
            </Link>
          </div>

          {/* Right Section - Navigation and Language */}
          <div className="flex items-center gap-8">
            {/* Navigation Menu - Desktop */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link href="/" className="text-white hover:text-purple-200 transition-colors">
                Início
              </Link>
              <Link href="/como-funciona" className="text-white hover:text-purple-200 transition-colors">
                Como Funciona
              </Link>
              <Link href="/blog" className="text-white hover:text-purple-200 transition-colors">
                Blog
              </Link>
              <Link href="/faq" className="text-white hover:text-purple-200 transition-colors">
                FAQ
              </Link>
              <Link href="/sobre-nos" className="text-white hover:text-purple-200 transition-colors">
                Sobre Nós
              </Link>
              <Link href="/contato" className="text-white hover:text-purple-200 transition-colors">
                Contato
              </Link>
            </nav>

            {/* Language Selector */}
            <button className="flex items-center gap-2 text-white hover:text-purple-200 transition-colors text-sm font-medium">
              🇧🇷 PT
            </button>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-white p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
    
    {/* Mobile Menu Dropdown */}
    {mobileMenuOpen && (
      <div className="lg:hidden fixed top-12 left-0 right-0 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white z-50 shadow-lg">
        <nav className="flex flex-col p-4 space-y-3">
          <Link href="/" className="text-white hover:text-purple-200 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
            Início
          </Link>
          <Link href="/como-funciona" className="text-white hover:text-purple-200 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
            Como Funciona
          </Link>
          <Link href="/blog" className="text-white hover:text-purple-200 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
            Blog
          </Link>
          <Link href="/faq" className="text-white hover:text-purple-200 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
            FAQ
          </Link>
          <Link href="/sobre-nos" className="text-white hover:text-purple-200 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
            Sobre Nós
          </Link>
          <Link href="/contato" className="text-white hover:text-purple-200 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
            Contato
          </Link>
        </nav>
      </div>
    )}
    </>
  );
}