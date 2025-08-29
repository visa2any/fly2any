'use client';

import { SessionProvider } from 'next-auth/react';
import React, { Suspense, StrictMode } from 'react';
import ErrorBoundary from './ErrorBoundary';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Wrap with StrictMode only in development for better debugging
  const ProviderWrapper = process.env.NODE_ENV === 'development' ? StrictMode : React.Fragment;
  
  return (
    <ErrorBoundary 
      level="page" 
      onError={(error, errorInfo) => {
        // Log page-level errors with additional context
        console.error('🚨 Page-level error caught by ErrorBoundary:', {
          message: error.message,
          componentStack: errorInfo.componentStack 
            ? errorInfo.componentStack.split('\n').slice(0, 3).join('\n')
            : 'Component stack not available'
        });
        
        // TODO: Send critical errors to monitoring service
        // if (process.env.NODE_ENV === 'production') {
        //   sendToMonitoringService({ error, errorInfo, level: 'page' });
        // }
      }}
    >
      <ProviderWrapper>
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
      </ProviderWrapper>
    </ErrorBoundary>
  );
}