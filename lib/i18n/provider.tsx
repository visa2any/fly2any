'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';

/**
 * Client-side i18n provider - TEMPORARILY FROZEN TO ENGLISH ONLY
 * TODO: Re-enable dynamic language loading when multilingual support is activated
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  // TEMPORARY: Always use English messages
  // TODO: Re-enable dynamic language loading by using the useLanguage hook and useEffect
  const messages = require('@/messages/en.json');

  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
