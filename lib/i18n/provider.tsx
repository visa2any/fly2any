'use client';

import { NextIntlClientProvider } from 'next-intl';
import { useLanguage } from './client';
import { ReactNode, useEffect, useState } from 'react';

/**
 * Client-side i18n provider
 * Wraps components that need translations
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMessages() {
      try {
        const msgs = await import(`@/messages/${language}.json`);
        setMessages(msgs.default);
      } catch (error) {
        console.error('Failed to load translations:', error);
        // Fallback to English
        const fallback = await import(`@/messages/en.json`);
        setMessages(fallback.default);
      } finally {
        setIsLoading(false);
      }
    }

    loadMessages();
  }, [language]);

  if (isLoading || !messages) {
    return <>{children}</>;  // Render children without translations during load
  }

  return (
    <NextIntlClientProvider locale={language} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
