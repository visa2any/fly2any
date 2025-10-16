'use client';

import { useState, useEffect } from 'react';
import { Header, type Language } from './Header';
import { Footer } from '../home/Footer';

interface GlobalLayoutProps {
  children: React.ReactNode;
}

// Footer translations
const footerContent = {
  en: {
    company: 'Company',
    about: 'About Us',
    careers: 'Careers',
    press: 'Press',
    blog: 'Blog',
    support: 'Support',
    help: 'Help Center',
    contact: 'Contact Us',
    faq: 'FAQ',
    destinations: 'Popular Destinations',
    legal: 'Legal',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    cookies: 'Cookie Policy',
    newsletter: 'Subscribe to Our Newsletter',
    emailPlaceholder: 'Enter your email',
    subscribe: 'Subscribe',
    copyright: '© 2025 Fly2Any. All rights reserved.',
    payments: 'Secure Payments',
  },
  pt: {
    company: 'Empresa',
    about: 'Sobre Nós',
    careers: 'Carreiras',
    press: 'Imprensa',
    blog: 'Blog',
    support: 'Suporte',
    help: 'Central de Ajuda',
    contact: 'Contato',
    faq: 'Perguntas Frequentes',
    destinations: 'Destinos Populares',
    legal: 'Legal',
    privacy: 'Política de Privacidade',
    terms: 'Termos de Serviço',
    cookies: 'Política de Cookies',
    newsletter: 'Assine Nossa Newsletter',
    emailPlaceholder: 'Digite seu email',
    subscribe: 'Assinar',
    copyright: '© 2025 Fly2Any. Todos os direitos reservados.',
    payments: 'Pagamentos Seguros',
  },
  es: {
    company: 'Empresa',
    about: 'Acerca de',
    careers: 'Carreras',
    press: 'Prensa',
    blog: 'Blog',
    support: 'Soporte',
    help: 'Centro de Ayuda',
    contact: 'Contacto',
    faq: 'Preguntas Frecuentes',
    destinations: 'Destinos Populares',
    legal: 'Legal',
    privacy: 'Política de Privacidad',
    terms: 'Términos de Servicio',
    cookies: 'Política de Cookies',
    newsletter: 'Suscríbete a Nuestro Boletín',
    emailPlaceholder: 'Ingresa tu email',
    subscribe: 'Suscribirse',
    copyright: '© 2025 Fly2Any. Todos los derechos reservados.',
    payments: 'Pagos Seguros',
  },
};

/**
 * Global Layout Wrapper Component
 *
 * Wraps all pages with:
 * - Global Header (sticky, with language switcher)
 * - Main content area
 * - Global Footer
 *
 * Manages global state:
 * - Language selection (EN/PT/ES)
 * - Persists language to localStorage
 */
export function GlobalLayout({ children }: GlobalLayoutProps) {
  const [language, setLanguage] = useState<Language>('en');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('fly2any_language');
    if (savedLanguage && ['en', 'pt', 'es'].includes(savedLanguage)) {
      setLanguage(savedLanguage as Language);
    }
  }, []);

  // Save language to localStorage when it changes
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('fly2any_language', lang);
  };

  return (
    <>
      {/* Global Header */}
      <Header
        language={language}
        onLanguageChange={handleLanguageChange}
        showAuth={true}
      />

      {/* Main Content */}
      <main className="min-h-screen">
        {children}
      </main>

      {/* Global Footer */}
      <Footer content={footerContent[language]} />
    </>
  );
}
