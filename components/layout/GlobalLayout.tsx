'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { SessionProvider } from '@/components/auth/SessionProvider';
import { Header, type Language } from './Header';
import { Footer } from './Footer';
import { BottomTabBar } from '@/components/mobile/BottomTabBar';
import { NavigationDrawer } from '@/components/mobile/NavigationDrawer';
import { AITravelAssistant } from '@/components/ai/AITravelAssistant';
import { MobileFullscreen } from '@/components/layout/MobileFullscreen';
import { useLanguage } from '@/lib/i18n/client';
import { useTranslations } from 'next-intl';

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
 * Inner Layout Component (with session access)
 */
function GlobalLayoutInner({ children }: GlobalLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage(); // Use centralized i18n hook
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Get translations using next-intl
  const tHeader = useTranslations('Header');

  // Create adapter object for components not yet migrated
  const headerTranslationsAdapter = {
    flights: tHeader('flights'),
    hotels: tHeader('hotels'),
    cars: tHeader('cars'),
    tours: tHeader('tours'),
    activities: tHeader('activities'),
    packages: tHeader('packages'),
    travelInsurance: tHeader('travelInsurance'),
    deals: tHeader('deals'),
    discover: tHeader('discover'),
    explore: tHeader('explore'),
    travelGuide: tHeader('travelGuide'),
    faq: tHeader('faq'),
    blog: tHeader('blog'),
    destinations: tHeader('destinations'),
    airlines: tHeader('airlines'),
    popularRoutes: tHeader('popularRoutes'),
    support: tHeader('support'),
    signin: tHeader('signin'),
    signup: tHeader('signup'),
    wishlist: tHeader('wishlist'),
    notifications: tHeader('notifications'),
    account: tHeader('account'),
  };

  // Check if current route uses dedicated layout (admin or agent portal)
  const isAdminRoute = pathname?.startsWith('/admin');
  const isAgentRoute = pathname?.startsWith('/agent');

  // Handle "More" tab click from bottom bar
  const handleMoreClick = () => {
    setMobileDrawerOpen(true);
  };

  // Admin and Agent routes use their own dedicated layouts - bypass global layout
  if (isAdminRoute || isAgentRoute) {
    return <>{children}</>;
  }

  // Standard platform layout for all other pages
  return (
    <>
      {/* Mobile Fullscreen Handler */}
      <MobileFullscreen />

      {/* Global Header - now manages language internally */}
      <Header showAuth={true} />

      {/* Main Content - No padding needed, BottomTabBar has built-in spacer */}
      <main
        id="main-content"
        className="min-h-screen w-full"
        tabIndex={-1}
      >
        {children}
      </main>

      {/* Global Footer */}
      <Footer content={footerContent[language]} language={language} />

      {/* Mobile Bottom Tab Bar */}
      <BottomTabBar
        translations={headerTranslationsAdapter}
        onMoreClick={handleMoreClick}
      />

      {/* Mobile Navigation Drawer */}
      <NavigationDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        language={language}
        onLanguageChange={setLanguage}
        translations={headerTranslationsAdapter}
        userId={session?.user?.id}
      />

      {/* AI Travel Assistant */}
      <AITravelAssistant language={language} />
    </>
  );
}

/**
 * Global Layout Wrapper Component
 *
 * Wraps all pages with:
 * - Session Provider (NextAuth)
 * - Global Header (sticky, with language switcher)
 * - Main content area
 * - Global Footer
 * - AI Travel Assistant (floating, 24/7 available)
 * - Mobile Bottom Tab Bar
 * - Mobile Navigation Drawer
 *
 * Manages global state:
 * - Language selection (EN/PT/ES)
 * - Persists language to localStorage
 * - Mobile navigation state
 */
export function GlobalLayout({ children }: GlobalLayoutProps) {
  return (
    <SessionProvider>
      <GlobalLayoutInner>{children}</GlobalLayoutInner>
    </SessionProvider>
  );
}
