'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FooterTestimonials } from './FooterTestimonials';
import { useTranslations } from 'next-intl';
import { useLanguage } from '@/lib/i18n/client';
import type { Language } from '@/lib/i18n/types';

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

// Deprecated: Moved to next-intl translations

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
  content, // Deprecated - kept for backward compatibility
  language: deprecatedLanguage, // Deprecated - now managed via hook
  destinations,
  testimonials,
  showLogo = true,
  showSocial = true,
  showPayments = true,
  showNewsletter = true,
  showTestimonials = false, // Temporarily hidden - set to true when reviews are ready
  showAppDownload = false,
  className = '',
}: FooterProps) {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  // Use next-intl for translations
  const t = useTranslations('Footer');
  const { language } = useLanguage();

  // Update destinations with translated city names
  const translatedDestinations: FooterDestination[] = [
    { name: t('paris'), url: '/destinations/paris' },
    { name: t('tokyo'), url: '/destinations/tokyo' },
    { name: t('newYork'), url: '/destinations/new-york' },
    { name: t('dubai'), url: '/destinations/dubai' },
    { name: t('london'), url: '/destinations/london' },
    { name: t('barcelona'), url: '/destinations/barcelona' },
  ];

  const footerDestinations = destinations || translatedDestinations;
  const footerTestimonials = testimonials || defaultTestimonials;

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      alert(t('validEmailError'));
      return;
    }

    setIsSubscribing(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubscribing(false);
      setSubscribed(true);
      setEmail('');
      alert(t('subscribeSuccess'));
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
                  {t('newsletter')}
                </h3>
                <p className="text-gray-400 text-sm">
                  {t('newsletterDescription')}
                </p>
              </div>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2 w-full md:w-auto">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  className="bg-gray-800/80 border-gray-600 text-white placeholder:text-gray-400 w-full md:w-72 h-10 text-sm focus:border-primary-400 focus:ring-1 focus:ring-primary-400/50"
                  disabled={isSubscribing || subscribed}
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="whitespace-nowrap px-5 h-10 text-sm bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
                  disabled={isSubscribing || subscribed}
                >
                  {isSubscribing ? '...' : subscribed ? '✓' : t('subscribe')}
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
                  {t('downloadApp')}
                </h3>
                <p className="text-gray-400 text-sm">
                  {t('downloadAppDescription')}
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

      {/* Level-6: Main Footer Content - Mobile optimized */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10" style={{ maxWidth: '1600px' }}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8 mb-6 md:mb-8">
          {/* Level-6: Services Column */}
          <div>
            <h4 className="font-semibold text-xs md:text-sm mb-2 md:mb-3 text-gray-300">
              {t('services')}
            </h4>
            <ul className="space-y-1.5 md:space-y-2">
              <li>
                <a href="/flights" className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors">
                  {t('flights')}
                </a>
              </li>
              <li>
                <a href="/hotels" className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors">
                  {t('hotels')}
                </a>
              </li>
              <li>
                <a href="/deals" className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors">
                  {t('deals')}
                </a>
              </li>
              <li>
                <a href="/destinations" className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors">
                  {t('destinations')}
                </a>
              </li>
              <li>
                <a href="/airlines" className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors">
                  {t('airlines')}
                </a>
              </li>
              {/* ============================================
                  TEMPORARILY HIDDEN - Uncomment when ready to launch
                  Cars, Packages, Tours, Activities, Insurance footer links
                  ============================================ */}
              {/* <li>
                <a href="/cars" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {t('cars')}
                </a>
              </li>
              <li>
                <a href="/packages" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {t('packages')}
                </a>
              </li>
              <li>
                <a href="/tours" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {t('tours')}
                </a>
              </li>
              <li>
                <a href="/activities" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {t('activities')}
                </a>
              </li>
              <li>
                <a href="/insurance" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {t('travelInsurance')}
                </a>
              </li> */}
            </ul>
          </div>

          {/* Level-6: Company Column */}
          <div>
            <h4 className="font-semibold text-xs md:text-sm mb-2 md:mb-3 text-gray-300">
              {t('company')}
            </h4>
            <ul className="space-y-1.5 md:space-y-2">
              <li><a href="/about" className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors">{t('about')}</a></li>
              <li><a href="/careers" className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors">{t('careers')}</a></li>
              <li><a href="/press" className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors">{t('press')}</a></li>
              <li><a href="/blog" className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors">{t('blog')}</a></li>
              <li><a href="/affiliate" className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"><span className="text-yellow-400 text-[10px]">⭐</span>{t('affiliateProgram')}</a></li>
              <li><a href="/become-agent" className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"><span className="text-blue-400 text-[10px]">💼</span>Become Agent</a></li>
              <li><a href="/refer" className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"><span className="text-green-400 text-[10px]">🎁</span>{t('referEarn')}</a></li>
            </ul>
          </div>

          {/* Level-6: Support Column */}
          <div>
            <h4 className="font-semibold text-xs md:text-sm mb-2 md:mb-3 text-gray-300">
              {t('support')}
            </h4>
            <ul className="space-y-1.5 md:space-y-2">
              <li><a href="/help" className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors">{t('help')}</a></li>
              <li><a href="/contact" className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors">{t('contact')}</a></li>
              <li><a href="/faq" className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors">{t('faq')}</a></li>
              <li><a href="/reviews" className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors">Customer Reviews</a></li>
                          </ul>
          </div>

          {/* Resources Column - Fix orphan pages */}
          <div className="hidden md:block">
            <h4 className="font-semibold text-xs md:text-sm mb-2 md:mb-3 text-gray-300">Resources</h4>
            <ul className="space-y-1.5 md:space-y-2">
              <li><a href="/travel-guide" className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors">Travel Guide</a></li>
                            <li><a href="/solo-travel" className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors">Solo Travel Tips</a></li>
              <li><a href="/travel-planning" className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors">Trip Planning</a></li>
              <li><a href="/travel-insurance" className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors">Travel Insurance</a></li>
            </ul>
          </div>

          {/* Level-6: Destinations Column */}
          <div>
            <h4 className="font-semibold text-xs md:text-sm mb-2 md:mb-3 text-gray-300">
              {t('destinations')}
            </h4>
            <ul className="space-y-1.5 md:space-y-2">
              {footerDestinations.slice(0, 6).map((dest) => (
                <li key={dest.url}><a href={dest.url} className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors">{dest.name}</a></li>
              ))}
            </ul>
          </div>

          {/* Level-6: Popular Routes - Hidden on mobile for space */}
          <div className="hidden md:block col-span-2 md:col-span-3 lg:col-span-5 mt-4 pt-4 border-t border-gray-700/50">
            <h4 className="font-semibold text-xs md:text-sm mb-2 text-gray-300">Popular Routes</h4>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              <a href="/flights/new-york-to-los-angeles" className="text-[10px] md:text-xs text-gray-500 hover:text-white transition-colors">NYC → LAX</a>
              <a href="/flights/new-york-to-miami" className="text-[10px] md:text-xs text-gray-500 hover:text-white transition-colors">NYC → MIA</a>
              <a href="/flights/los-angeles-to-new-york" className="text-[10px] md:text-xs text-gray-500 hover:text-white transition-colors">LAX → NYC</a>
              <a href="/flights/chicago-to-new-york" className="text-[10px] md:text-xs text-gray-500 hover:text-white transition-colors">ORD → NYC</a>
              <a href="/flights/new-york-to-london" className="text-[10px] md:text-xs text-gray-500 hover:text-white transition-colors">NYC → LHR</a>
              <a href="/flights/miami-to-cancun" className="text-[10px] md:text-xs text-gray-500 hover:text-white transition-colors">MIA → CUN</a>
            </div>
          </div>

          {/* Level-6: Legal Column */}
          <div>
            <h4 className="font-semibold text-xs md:text-sm mb-2 md:mb-3 text-gray-300">
              {t('legal')}
            </h4>
            <ul className="space-y-1.5 md:space-y-2">
              <li><a href="/privacy" className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors">{t('privacy')}</a></li>
              <li><a href="/terms" className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors">{t('terms')}</a></li>
              <li><a href="/cookies" className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors">{t('cookies')}</a></li>
            </ul>
          </div>
        </div>

        {/* Level-6: Bottom Bar - Mobile optimized */}
        <div className="border-t border-gray-700/50 pt-4 md:pt-6">
          {/* Trust Badges - Smaller on mobile */}
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mb-4 text-[10px] md:text-xs">
            <div className="flex items-center gap-1 text-gray-400">
              <svg className="w-3 h-3 md:w-4 md:h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>{t('secureBooking')}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <svg className="w-3 h-3 md:w-4 md:h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
              </svg>
              <span>{t('sslEncrypted')}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <svg className="w-3 h-3 md:w-4 md:h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>{t('noHiddenFees')}</span>
            </div>
          </div>

          {/* Level-6: Main Footer Bar - pb-20 for mobile bottom nav clearance */}
          <div className="flex flex-col items-center gap-3 md:gap-4 pb-20 md:pb-4">
            {/* Logo & Copyright */}
            <div className="flex flex-col items-center gap-1.5">
              {showLogo && (
                <Image src="/logo-transparent.png" alt="Fly2Any" width={290} height={100} className="h-5 md:h-7 w-auto" style={{ filter: 'brightness(0) invert(1)' }} loading="eager" />
              )}
              <p className="text-[10px] md:text-xs text-gray-500 text-center">{t('copyright')}</p>
            </div>

            {/* Payment Methods - Inline pills */}
            {showPayments && (
              <div className="flex flex-wrap gap-1 justify-center items-center">
                <span className="bg-gray-800/60 px-1.5 py-0.5 rounded text-[9px] md:text-[10px] border border-gray-700/50">Visa</span>
                <span className="bg-gray-800/60 px-1.5 py-0.5 rounded text-[9px] md:text-[10px] border border-gray-700/50">MC</span>
                <span className="bg-gray-800/60 px-1.5 py-0.5 rounded text-[9px] md:text-[10px] border border-gray-700/50">Amex</span>
                <span className="bg-gray-800/60 px-1.5 py-0.5 rounded text-[9px] md:text-[10px] border border-gray-700/50">PayPal</span>
              </div>
            )}

            {/* Social Links - Compact */}
            {showSocial && (
              <div className="flex items-center gap-2">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-gray-800/60 hover:bg-blue-600 flex items-center justify-center transition-colors" aria-label="Facebook"><span className="text-xs md:text-sm">📘</span></a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-gray-800/60 hover:bg-sky-500 flex items-center justify-center transition-colors" aria-label="Twitter"><span className="text-xs md:text-sm">🐦</span></a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-gray-800/60 hover:bg-pink-600 flex items-center justify-center transition-colors" aria-label="Instagram"><span className="text-xs md:text-sm">📷</span></a>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
