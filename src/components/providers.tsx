'use client';

import { SessionProvider } from 'next-auth/react';
import React, { Suspense } from 'react';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <Suspense fallback={null}>
        {children}
      </Suspense>
    </SessionProvider>
  );
}