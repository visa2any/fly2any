'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function LiveSiteFooter() {
  // Debug log to verify component is rendering
  React.useEffect(() => {
    console.log('🚀 LiveSiteFooter is rendering!');
  }, []);

  return (
    <footer role="contentinfo" className="site-footer bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white py-16">
      <div className="container max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Company Info Column */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <Image
                src="/fly2any-logo.png"
                alt="Fly2Any - Especialistas em viagens Brasil-EUA"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </div>
            
            <p className="text-purple-100/80 text-sm leading-relaxed mb-6">
              Especialistas em viagens Brasil-EUA há mais de 10 anos
            </p>
            
            {/* WhatsApp Contact */}
            <Link href="https://wa.me/message" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              <span>📱</span>
              WhatsApp
            </Link>
          </div>

          {/* Services Column */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">
              Nossos Serviços
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/passagens-aereas" className="text-purple-100/80 hover:text-white text-sm transition-colors">
                  Passagens Aéreas
                </Link>
              </li>
              <li>
                <Link href="/hoteis" className="text-purple-100/80 hover:text-white text-sm transition-colors">
                  Hotéis
                </Link>
              </li>
              <li>
                <Link href="/aluguel-carros" className="text-purple-100/80 hover:text-white text-sm transition-colors">
                  Aluguel de Carros
                </Link>
              </li>
              <li>
                <Link href="/passeios-tours" className="text-purple-100/80 hover:text-white text-sm transition-colors">
                  Passeios e Tours
                </Link>
              </li>
              <li>
                <Link href="/seguro-viagem" className="text-purple-100/80 hover:text-white text-sm transition-colors">
                  Seguro Viagem
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">
              Suporte
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/como-funciona" className="text-purple-100/80 hover:text-white text-sm transition-colors">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-purple-100/80 hover:text-white text-sm transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-purple-100/80 hover:text-white text-sm transition-colors">
                  Contato
                </Link>
              </li>
              <li>
                <Link href="/sobre-nos" className="text-purple-100/80 hover:text-white text-sm transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-purple-100/80 hover:text-white text-sm transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/politica-privacidade" className="text-purple-100/80 hover:text-white text-sm transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/termos-uso" className="text-purple-100/80 hover:text-white text-sm transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-purple-100/80 hover:text-white text-sm transition-colors">
                  Cookies
                </Link>
              </li>
              <li>
                <Link href="/seguranca" className="text-purple-100/80 hover:text-white text-sm transition-colors">
                  Segurança
                </Link>
              </li>
            </ul>
            
            {/* Trust Badges */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span>🔒</span>
                <span className="text-green-400 font-semibold">SSL Certified</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span>⭐</span>
                <span className="text-amber-400 font-semibold">4.9/5 Stars</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-purple-100/80 text-sm">
              © 2024 Fly2Any. Todos os direitos reservados.
            </p>
            <p className="text-purple-100/60 text-xs mt-1">
              Conectando você ao mundo há 21 anos • Feito com ❤️ para brasileiros
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}