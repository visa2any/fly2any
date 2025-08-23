'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function LiveSiteHeader() {
  // Debug log to verify component is rendering
  React.useEffect(() => {
    console.log('🚀 LiveSiteHeader is rendering!');
  }, []);

  return (
    <header role="banner" className="site-header bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white mobile-header-fixed">
      <div className="container max-w-7xl mx-auto px-0 py-2 md:px-6 md:py-4 mobile-safe-area">
        <div className="flex items-center justify-between px-4 md:px-0">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/fly2any-logo.png"
                alt="Fly2Any - Especialistas em viagens Brasil-EUA"
                width={120}
                height={40}
                className="h-10 w-auto"
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
            <button className="lg:hidden text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}