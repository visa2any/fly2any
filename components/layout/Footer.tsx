'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// Type definitions
export type Language = 'en' | 'pt' | 'es';

export interface FooterContent {
  company: string;
  about: string;
  careers: string;
  press: string;
  blog: string;
  support: string;
  help: string;
  contact: string;
  faq: string;
  destinations: string;
  legal: string;
  privacy: string;
  terms: string;
  cookies: string;
  newsletter: string;
  newsletterDescription?: string;
  emailPlaceholder: string;
  subscribe: string;
  copyright: string;
  payments: string;
  followUs?: string;
  downloadApp?: string;
}

export interface FooterDestination {
  name: string;
  url: string;
}

export interface FooterProps {
  content: FooterContent;
  language?: Language;
  destinations?: FooterDestination[];
  showLogo?: boolean;
  showSocial?: boolean;
  showPayments?: boolean;
  showNewsletter?: boolean;
  showAppDownload?: boolean;
  className?: string;
}

// Default popular destinations
const defaultDestinations: Record<Language, FooterDestination[]> = {
  en: [
    { name: 'Paris', url: '/destinations/paris' },
    { name: 'Tokyo', url: '/destinations/tokyo' },
    { name: 'New York', url: '/destinations/new-york' },
    { name: 'Dubai', url: '/destinations/dubai' },
    { name: 'London', url: '/destinations/london' },
    { name: 'Barcelona', url: '/destinations/barcelona' },
  ],
  pt: [
    { name: 'Paris', url: '/destinations/paris' },
    { name: 'Tóquio', url: '/destinations/tokyo' },
    { name: 'Nova York', url: '/destinations/new-york' },
    { name: 'Dubai', url: '/destinations/dubai' },
    { name: 'Londres', url: '/destinations/london' },
    { name: 'Barcelona', url: '/destinations/barcelona' },
  ],
  es: [
    { name: 'París', url: '/destinations/paris' },
    { name: 'Tokio', url: '/destinations/tokyo' },
    { name: 'Nueva York', url: '/destinations/new-york' },
    { name: 'Dubái', url: '/destinations/dubai' },
    { name: 'Londres', url: '/destinations/london' },
    { name: 'Barcelona', url: '/destinations/barcelona' },
  ],
};

export function Footer({
  content,
  language = 'en',
  destinations,
  showLogo = true,
  showSocial = true,
  showPayments = true,
  showNewsletter = true,
  showAppDownload = false,
  className = '',
}: FooterProps) {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const footerDestinations = destinations || defaultDestinations[language];

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      alert(language === 'en' ? 'Please enter a valid email address' :
            language === 'pt' ? 'Por favor, insira um endereço de e-mail válido' :
            'Por favor, ingresa un correo electrónico válido');
      return;
    }

    setIsSubscribing(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubscribing(false);
      setSubscribed(true);
      setEmail('');

      const successMessage = language === 'en' ? 'Thank you for subscribing!' :
                            language === 'pt' ? 'Obrigado por se inscrever!' :
                            'Gracias por suscribirte!';
      alert(successMessage);
    }, 1000);
  };

  return (
    <footer className={`bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white ${className}`}>
      {/* Newsletter Section */}
      {showNewsletter && (
        <div className="border-b border-gray-700/50 bg-gradient-to-r from-primary-900/20 to-secondary-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-bold mb-2 flex items-center justify-center md:justify-start gap-3">
                  <span className="text-3xl">📬</span>
                  {content.newsletter}
                </h3>
                <p className="text-gray-300 text-lg">
                  {content.newsletterDescription ||
                    (language === 'en' ? 'Get exclusive deals and travel inspiration delivered to your inbox' :
                     language === 'pt' ? 'Receba ofertas exclusivas e inspiração para viagens no seu e-mail' :
                     'Recibe ofertas exclusivas e inspiración para viajes en tu correo')}
                </p>
              </div>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2 w-full md:w-auto">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={content.emailPlaceholder}
                  className="bg-gray-800/80 border-gray-600 text-white placeholder:text-gray-400 w-full md:w-80 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/50"
                  disabled={isSubscribing || subscribed}
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="whitespace-nowrap px-6 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  disabled={isSubscribing || subscribed}
                >
                  {isSubscribing ? '...' : subscribed ? '✓' : content.subscribe}
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* App Download Banner */}
      {showAppDownload && (
        <div className="border-b border-gray-700/50 bg-gradient-to-r from-secondary-900/20 to-primary-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-xl md:text-2xl font-bold mb-2 flex items-center justify-center md:justify-start gap-3">
                  <span className="text-3xl">📱</span>
                  {content.downloadApp ||
                    (language === 'en' ? 'Download Our App' :
                     language === 'pt' ? 'Baixe Nosso App' :
                     'Descarga Nuestra App')}
                </h3>
                <p className="text-gray-300">
                  {language === 'en' ? 'Get exclusive mobile-only deals and faster booking' :
                   language === 'pt' ? 'Obtenha ofertas exclusivas e reservas mais rápidas' :
                   'Obtén ofertas exclusivas y reservas más rápidas'}
                </p>
              </div>
              <div className="flex gap-3">
                <a
                  href="https://apps.apple.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-black hover:bg-gray-800 px-4 py-2.5 rounded-lg transition-all duration-300 hover:scale-105"
                >
                  <span className="text-2xl">🍎</span>
                  <div className="text-left">
                    <div className="text-[10px] text-gray-400">Download on the</div>
                    <div className="text-sm font-bold">App Store</div>
                  </div>
                </a>
                <a
                  href="https://play.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-black hover:bg-gray-800 px-4 py-2.5 rounded-lg transition-all duration-300 hover:scale-105"
                >
                  <span className="text-2xl">📱</span>
                  <div className="text-left">
                    <div className="text-[10px] text-gray-400">GET IT ON</div>
                    <div className="text-sm font-bold">Google Play</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 md:gap-12 mb-12">
          {/* Company Column */}
          <div>
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="text-xl">🏢</span>
              {content.company}
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="/about"
                  className="text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block"
                >
                  {content.about}
                </a>
              </li>
              <li>
                <a
                  href="/careers"
                  className="text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block"
                >
                  {content.careers}
                </a>
              </li>
              <li>
                <a
                  href="/press"
                  className="text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block"
                >
                  {content.press}
                </a>
              </li>
              <li>
                <a
                  href="/blog"
                  className="text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block"
                >
                  {content.blog}
                </a>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="text-xl">💬</span>
              {content.support}
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="/help"
                  className="text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block"
                >
                  {content.help}
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block"
                >
                  {content.contact}
                </a>
              </li>
              <li>
                <a
                  href="/faq"
                  className="text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block"
                >
                  {content.faq}
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/13057971087"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block flex items-center gap-1"
                >
                  <span className="text-green-400">📱</span>
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* Destinations Column */}
          <div>
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="text-xl">✈️</span>
              {content.destinations}
            </h4>
            <ul className="space-y-3">
              {footerDestinations.slice(0, 6).map((destination) => (
                <li key={destination.url}>
                  <a
                    href={destination.url}
                    className="text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block"
                  >
                    {destination.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="text-xl">⚖️</span>
              {content.legal}
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="/privacy"
                  className="text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block"
                >
                  {content.privacy}
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block"
                >
                  {content.terms}
                </a>
              </li>
              <li>
                <a
                  href="/cookies"
                  className="text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block"
                >
                  {content.cookies}
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links / Services Column (Optional 5th column) */}
          <div className="col-span-2 md:col-span-2 lg:col-span-1">
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="text-xl">🎯</span>
              {language === 'en' ? 'Services' : language === 'pt' ? 'Serviços' : 'Servicios'}
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="/flights"
                  className="text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block"
                >
                  {language === 'en' ? 'Flights' : language === 'pt' ? 'Voos' : 'Vuelos'}
                </a>
              </li>
              <li>
                <a
                  href="/hotels"
                  className="text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block"
                >
                  {language === 'en' ? 'Hotels' : language === 'pt' ? 'Hotéis' : 'Hoteles'}
                </a>
              </li>
              <li>
                <a
                  href="/cars"
                  className="text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block"
                >
                  {language === 'en' ? 'Cars' : language === 'pt' ? 'Carros' : 'Autos'}
                </a>
              </li>
              <li>
                <a
                  href="/packages"
                  className="text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block"
                >
                  {language === 'en' ? 'Packages' : language === 'pt' ? 'Pacotes' : 'Paquetes'}
                </a>
              </li>
              <li>
                <a
                  href="/tours"
                  className="text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block"
                >
                  {language === 'en' ? 'Tours' : language === 'pt' ? 'Passeios' : 'Tours'}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700/50 pt-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Logo & Copyright */}
            <div className="flex flex-col items-center lg:items-start gap-4">
              {showLogo && (
                <div className="flex items-center">
                  <Image
                    src="/fly2any-logo.png"
                    alt="Fly2Any Travel"
                    width={140}
                    height={42}
                    className="h-9 w-auto brightness-0 invert"
                  />
                </div>
              )}
              <p className="text-sm text-gray-400 text-center lg:text-left">
                {content.copyright}
              </p>
            </div>

            {/* Payment Methods */}
            {showPayments && (
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-3 font-semibold">{content.payments}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="bg-gray-800/80 hover:bg-gray-700/80 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 hover:scale-105 border border-gray-700">
                    💳 Visa
                  </span>
                  <span className="bg-gray-800/80 hover:bg-gray-700/80 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 hover:scale-105 border border-gray-700">
                    💳 Mastercard
                  </span>
                  <span className="bg-gray-800/80 hover:bg-gray-700/80 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 hover:scale-105 border border-gray-700">
                    💳 Amex
                  </span>
                  <span className="bg-gray-800/80 hover:bg-gray-700/80 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 hover:scale-105 border border-gray-700">
                    💳 PayPal
                  </span>
                  <span className="bg-gray-800/80 hover:bg-gray-700/80 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 hover:scale-105 border border-gray-700">
                    💳 Apple Pay
                  </span>
                  <span className="bg-gray-800/80 hover:bg-gray-700/80 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 hover:scale-105 border border-gray-700">
                    💳 Google Pay
                  </span>
                </div>
              </div>
            )}

            {/* Social Links */}
            {showSocial && (
              <div className="text-center lg:text-right">
                <p className="text-sm text-gray-400 mb-3 font-semibold">
                  {content.followUs ||
                    (language === 'en' ? 'Follow Us' :
                     language === 'pt' ? 'Siga-nos' :
                     'Síguenos')}
                </p>
                <div className="flex gap-3 justify-center lg:justify-end">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800/80 hover:bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                    aria-label="Facebook"
                  >
                    <span className="text-xl">📘</span>
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800/80 hover:bg-sky-500 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                    aria-label="Twitter"
                  >
                    <span className="text-xl">🐦</span>
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800/80 hover:bg-pink-600 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                    aria-label="Instagram"
                  >
                    <span className="text-xl">📷</span>
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800/80 hover:bg-blue-700 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                    aria-label="LinkedIn"
                  >
                    <span className="text-xl">💼</span>
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800/80 hover:bg-red-600 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                    aria-label="YouTube"
                  >
                    <span className="text-xl">📺</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Trust & Security Badges */}
          <div className="mt-8 pt-6 border-t border-gray-700/30">
            <div className="flex flex-wrap items-center justify-center gap-6 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-400 font-medium">
                  {language === 'en' ? 'Secure Booking' : language === 'pt' ? 'Reserva Segura' : 'Reserva Segura'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-400 font-medium">
                  {language === 'en' ? 'SSL Encrypted' : language === 'pt' ? 'Criptografia SSL' : 'Encriptación SSL'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400 font-medium">
                  {language === 'en' ? 'Powered by' : language === 'pt' ? 'Distribuído por' : 'Distribuido por'}
                </span>
                <strong className="text-white">Amadeus</strong>
                <span className="text-gray-600">&</span>
                <strong className="text-white">Duffel</strong>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-gray-400 font-medium">
                  {language === 'en' ? 'No Hidden Fees' : language === 'pt' ? 'Sem Taxas Ocultas' : 'Sin Cargos Ocultos'}
                </span>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              {language === 'en'
                ? 'Fly2Any is a registered trademark. All rights reserved. Prices are subject to availability and may change without notice.'
                : language === 'pt'
                ? 'Fly2Any é uma marca registrada. Todos os direitos reservados. Os preços estão sujeitos a disponibilidade e podem mudar sem aviso prévio.'
                : 'Fly2Any es una marca registrada. Todos los derechos reservados. Los precios están sujetos a disponibilidad y pueden cambiar sin previo aviso.'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
