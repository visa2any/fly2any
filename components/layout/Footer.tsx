'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FooterTestimonials } from './FooterTestimonials';

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

export interface Testimonial {
  name: string;
  location: string;
  rating: number;
  text: string;
  image: string;
}

export interface FooterProps {
  content: FooterContent;
  language?: Language;
  destinations?: FooterDestination[];
  testimonials?: Testimonial[];
  showLogo?: boolean;
  showSocial?: boolean;
  showPayments?: boolean;
  showNewsletter?: boolean;
  showTestimonials?: boolean;
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

// Default testimonials with real profile photos - USA only
const defaultTestimonials: Testimonial[] = [
  {
    name: 'Sarah Johnson',
    location: 'New York, NY',
    rating: 5,
    text: 'Best travel booking experience ever! Found amazing deals and the customer service was outstanding.',
    image: 'https://i.pravatar.cc/150?img=5'
  },
  {
    name: 'Michael Rodriguez',
    location: 'Miami, FL',
    rating: 5,
    text: 'Fly2Any made my dream vacation possible. Easy to use and great prices!',
    image: 'https://i.pravatar.cc/150?img=12'
  },
  {
    name: 'Emily Chen',
    location: 'Los Angeles, CA',
    rating: 5,
    text: 'I always book through Fly2Any now. The price guarantee saved me hundreds!',
    image: 'https://i.pravatar.cc/150?img=9'
  },
  {
    name: 'David Thompson',
    location: 'Chicago, IL',
    rating: 5,
    text: 'Incredible service and support! Booked my entire family vacation with confidence.',
    image: 'https://i.pravatar.cc/150?img=13'
  },
  {
    name: 'Jennifer Williams',
    location: 'Houston, TX',
    rating: 5,
    text: 'Fast, reliable, and great value. Will definitely use again for my next trip!',
    image: 'https://i.pravatar.cc/150?img=47'
  },
  {
    name: 'Robert Anderson',
    location: 'Seattle, WA',
    rating: 5,
    text: 'Professional platform with excellent deals. Highly recommend to all travelers!',
    image: 'https://i.pravatar.cc/150?img=33'
  },
];

export function Footer({
  content,
  language = 'en',
  destinations,
  testimonials,
  showLogo = true,
  showSocial = true,
  showPayments = true,
  showNewsletter = true,
  showTestimonials = true,
  showAppDownload = false,
  className = '',
}: FooterProps) {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const footerDestinations = destinations || defaultDestinations[language];
  const footerTestimonials = testimonials || defaultTestimonials;

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
      {/* Newsletter Section - Compact */}
      {showNewsletter && (
        <div className="border-b border-gray-700/50 bg-gradient-to-r from-primary-900/20 to-secondary-900/20">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-7" style={{ maxWidth: '1600px' }}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <h3 className="text-lg md:text-xl font-bold mb-1.5 flex items-center justify-center md:justify-start gap-2">
                  {content.newsletter}
                </h3>
                <p className="text-gray-400 text-sm">
                  {content.newsletterDescription ||
                    (language === 'en' ? 'Get exclusive deals and travel inspiration' :
                     language === 'pt' ? 'Receba ofertas exclusivas e inspiração' :
                     'Recibe ofertas exclusivas e inspiración')}
                </p>
              </div>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2 w-full md:w-auto">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={content.emailPlaceholder}
                  className="bg-gray-800/80 border-gray-600 text-white placeholder:text-gray-400 w-full md:w-72 h-10 text-sm focus:border-primary-400 focus:ring-1 focus:ring-primary-400/50"
                  disabled={isSubscribing || subscribed}
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="whitespace-nowrap px-5 h-10 text-sm bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
                  disabled={isSubscribing || subscribed}
                >
                  {isSubscribing ? '...' : subscribed ? '✓' : content.subscribe}
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Compact Testimonials Section */}
      {showTestimonials && (
        <FooterTestimonials
          testimonials={footerTestimonials}
          language={language}
        />
      )}

      {/* App Download Banner - Compact */}
      {showAppDownload && (
        <div className="border-b border-gray-700/50 bg-gradient-to-r from-secondary-900/20 to-primary-900/20">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-5" style={{ maxWidth: '1600px' }}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <h3 className="text-base md:text-lg font-bold mb-1 flex items-center justify-center md:justify-start gap-2">
                  {content.downloadApp ||
                    (language === 'en' ? 'Download Our App' :
                     language === 'pt' ? 'Baixe Nosso App' :
                     'Descarga Nuestra App')}
                </h3>
                <p className="text-gray-400 text-sm">
                  {language === 'en' ? 'Exclusive deals & faster booking' :
                   language === 'pt' ? 'Ofertas exclusivas e reservas rápidas' :
                   'Ofertas exclusivas y reservas rápidas'}
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href="https://apps.apple.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-black hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-colors text-xs"
                >
                  <span className="text-lg">🍎</span>
                  <div className="text-left">
                    <div className="text-[9px] text-gray-400">Download on</div>
                    <div className="font-bold">App Store</div>
                  </div>
                </a>
                <a
                  href="https://play.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-black hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-colors text-xs"
                >
                  <span className="text-lg">📱</span>
                  <div className="text-left">
                    <div className="text-[9px] text-gray-400">GET IT ON</div>
                    <div className="font-bold">Google Play</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Footer Content */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-10" style={{ maxWidth: '1600px' }}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8 mb-8">
          {/* Services Column - FIRST */}
          <div>
            <h4 className="font-semibold text-sm mb-3 text-gray-300">
              {language === 'en' ? 'Services' : language === 'pt' ? 'Serviços' : 'Servicios'}
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/flights" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {language === 'en' ? 'Flights' : language === 'pt' ? 'Voos' : 'Vuelos'}
                </a>
              </li>
              <li>
                <a href="/hotels" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {language === 'en' ? 'Hotels' : language === 'pt' ? 'Hotéis' : 'Hoteles'}
                </a>
              </li>
              <li>
                <a href="/cars" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {language === 'en' ? 'Cars' : language === 'pt' ? 'Carros' : 'Autos'}
                </a>
              </li>
              <li>
                <a href="/packages" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {language === 'en' ? 'Packages' : language === 'pt' ? 'Pacotes' : 'Paquetes'}
                </a>
              </li>
              <li>
                <a href="/tours" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {language === 'en' ? 'Tours' : language === 'pt' ? 'Passeios' : 'Tours'}
                </a>
              </li>
              <li>
                <a href="/activities" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {language === 'en' ? 'Activities' : language === 'pt' ? 'Atividades' : 'Actividades'}
                </a>
              </li>
              <li>
                <a href="/insurance" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {language === 'en' ? 'Travel Insurance' : language === 'pt' ? 'Seguro Viagem' : 'Seguro de Viaje'}
                </a>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-semibold text-sm mb-3 text-gray-300">
              {content.company}
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {content.about}
                </a>
              </li>
              <li>
                <a href="/careers" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {content.careers}
                </a>
              </li>
              <li>
                <a href="/press" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {content.press}
                </a>
              </li>
              <li>
                <a href="/blog" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {content.blog}
                </a>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="font-semibold text-sm mb-3 text-gray-300">
              {content.support}
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/help" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {content.help}
                </a>
              </li>
              <li>
                <a href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {content.contact}
                </a>
              </li>
              <li>
                <a href="/faq" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {content.faq}
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/13057971087"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <span className="text-green-400 text-xs">📱</span>
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* Destinations Column */}
          <div>
            <h4 className="font-semibold text-sm mb-3 text-gray-300">
              {content.destinations}
            </h4>
            <ul className="space-y-2">
              {footerDestinations.slice(0, 6).map((destination) => (
                <li key={destination.url}>
                  <a href={destination.url} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {destination.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="font-semibold text-sm mb-3 text-gray-300">
              {content.legal}
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {content.privacy}
                </a>
              </li>
              <li>
                <a href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {content.terms}
                </a>
              </li>
              <li>
                <a href="/cookies" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {content.cookies}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700/50 pt-7">
          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-5 text-xs">
            <div className="flex items-center gap-1.5 text-gray-400">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>{language === 'en' ? 'Secure Booking' : language === 'pt' ? 'Reserva Segura' : 'Reserva Segura'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400">
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
              </svg>
              <span>{language === 'en' ? 'SSL Encrypted' : language === 'pt' ? 'Criptografia SSL' : 'Encriptación SSL'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>{language === 'en' ? 'No Hidden Fees' : language === 'pt' ? 'Sem Taxas Ocultas' : 'Sin Cargos Ocultos'}</span>
            </div>
          </div>

          {/* Main Footer Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4">
            {/* Logo & Copyright */}
            <div className="flex flex-col items-center md:items-start gap-2">
              {showLogo && (
                <Image
                  src="/fly2any-logo.png"
                  alt="Fly2Any Travel"
                  width={120}
                  height={36}
                  className="h-7 w-auto brightness-0 invert"
                />
              )}
              <p className="text-xs text-gray-500 text-center md:text-left">{content.copyright}</p>
            </div>

            {/* Payment Methods - Compact */}
            {showPayments && (
              <div className="flex flex-wrap gap-1.5 justify-center items-center">
                <span className="text-xs text-gray-500 mr-1">{content.payments}:</span>
                <span className="bg-gray-800/60 px-2 py-1 rounded text-[10px] border border-gray-700/50">Visa</span>
                <span className="bg-gray-800/60 px-2 py-1 rounded text-[10px] border border-gray-700/50">Mastercard</span>
                <span className="bg-gray-800/60 px-2 py-1 rounded text-[10px] border border-gray-700/50">Amex</span>
                <span className="bg-gray-800/60 px-2 py-1 rounded text-[10px] border border-gray-700/50">PayPal</span>
              </div>
            )}

            {/* Social Links - Compact */}
            {showSocial && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {content.followUs || (language === 'en' ? 'Follow' : language === 'pt' ? 'Siga' : 'Sigue')}:
                </span>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                   className="w-7 h-7 rounded-full bg-gray-800/60 hover:bg-blue-600 flex items-center justify-center transition-colors"
                   aria-label="Facebook">
                  <span className="text-sm">📘</span>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                   className="w-7 h-7 rounded-full bg-gray-800/60 hover:bg-sky-500 flex items-center justify-center transition-colors"
                   aria-label="Twitter">
                  <span className="text-sm">🐦</span>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                   className="w-7 h-7 rounded-full bg-gray-800/60 hover:bg-pink-600 flex items-center justify-center transition-colors"
                   aria-label="Instagram">
                  <span className="text-sm">📷</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
