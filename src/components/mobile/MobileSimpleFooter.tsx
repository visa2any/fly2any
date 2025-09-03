'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function MobileSimpleFooter() {
  return (
    <footer className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white py-8">
      <div className="container max-w-md mx-auto px-4 text-center">
        
        {/* Company Logo */}
        <div className="mb-4">
          <Image
            src="/fly2any-logo.svg"
            alt="Fly2Any"
            width={100}
            height={32}
            className="h-8 w-auto mx-auto"
          />
        </div>
        
        {/* Company Tagline */}
        <p className="text-purple-100/80 text-sm mb-6 leading-relaxed">
          Especialistas em viagens Brasil-EUA<br/>
          <span className="text-amber-400 font-semibold">5.000+ brasileiros</span> já confiaram em nós
        </p>
        
        {/* WhatsApp Contact - Primary CTA */}
        <Link 
          href="https://wa.me/551151944717" 
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 mb-6 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <span className="text-lg">💬</span>
          <span>Falar no WhatsApp</span>
        </Link>

        {/* Trust Signals */}
        <div className="flex justify-center items-center gap-4 mb-6 text-sm">
          <div className="flex items-center gap-1">
            <span>🔒</span>
            <span className="text-green-400 font-medium">SSL</span>
          </div>
          <div className="flex items-center gap-1">
            <span>⭐</span>
            <span className="text-amber-400 font-medium">4.9/5</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🛡️</span>
            <span className="text-blue-400 font-medium">Seguro</span>
          </div>
        </div>
        
        {/* Essential Links */}
        <div className="flex justify-center gap-4 text-xs text-purple-100/70 mb-4">
          <Link href="/politica-privacidade" className="hover:text-white transition-colors">
            Privacidade
          </Link>
          <span>•</span>
          <Link href="/termos-uso" className="hover:text-white transition-colors">
            Termos
          </Link>
          <span>•</span>
          <Link href="/contato" className="hover:text-white transition-colors">
            Contato
          </Link>
        </div>
        
        {/* Copyright */}
        <div className="text-center border-t border-white/20 pt-4">
          <p className="text-purple-100/70 text-xs">
            © 2024 Fly2Any • Todos os direitos reservados
          </p>
          <p className="text-purple-100/50 text-xs mt-1">
            Feito com ❤️ para brasileiros
          </p>
        </div>
      </div>
    </footer>
  );
}