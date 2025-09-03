'use client';

import { SessionProvider } from 'next-auth/react';
import React, { Suspense, StrictMode } from 'react';
import ErrorBoundary from './ErrorBoundary';

interface ProvidersProps {
  children: React.ReactNode;
}

// Development wrapper component for StrictMode (build-safe)
function DevelopmentWrapper({ children }: { children: React.ReactNode }) {
  // Use React Fragment to avoid any SSR/SSG issues
  // StrictMode can be added back after deployment is stable
  return <React.Fragment>{children}</React.Fragment>;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary 
      level="page"
    >
      <DevelopmentWrapper>
        <SessionProvider refetchOnWindowFocus={false}>
          <Suspense 
            fallback={
              <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full text-center">
                  <div className="animate-spin text-4xl mb-4">⭐</div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">Loading Fly2Any</h2>
                  <p className="text-gray-600 text-sm">Setting up your travel experience...</p>
                </div>
              </div>
            }
          >
            {children}
          </Suspense>
        </SessionProvider>
      </DevelopmentWrapper>
    </ErrorBoundary>
  );
}