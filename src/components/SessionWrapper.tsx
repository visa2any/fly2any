'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ClientOnly to ensure it's only loaded on client
const ClientOnly = dynamic(() => import('./ClientOnly'), {
  ssr: false,
});

interface SessionWrapperProps {
  children: React.ReactNode;
}

export default function SessionWrapper({ children }: SessionWrapperProps) {
  // During SSR/SSG, render children without SessionProvider
  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  // On client, wrap with ClientOnly to ensure SessionProvider only renders after hydration
  return (
    <ClientOnly>
      <SessionProvider refetchOnWindowFocus={false}>
        {children}
      </SessionProvider>
    </ClientOnly>
  );
}