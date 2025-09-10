'use client';

import React from 'react';
import Image from 'next/image';

export default function OmnichannelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-0 m-0">
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-xl border-b border-border/20 shadow-lg p-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-xl flex items-center justify-center shadow-md shadow-primary/20 -rotate-1 flex-shrink-0">
              <Image
                src="/fly2any-logo.png"
                alt="Fly2Any"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent m-0 leading-tight">
                  Fly2Any Central Omnichannel Premium
                </h1>
                <p className="text-muted-foreground text-xs mt-0.5 font-medium hidden sm:block leading-tight">
                  Gerencie todas as conversas com design premium e funcionalidades avançadas
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 rounded-full text-white shadow-md shadow-green-500/20 text-xs font-semibold">
              <div className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></div>
              <span className="hidden sm:inline">Sistema</span> Online
            </div>
            <a 
              href="/admin" 
              className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-xs font-semibold shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 transition-all duration-300 no-underline hover:scale-[1.02] flex items-center gap-1"
            >
              ← <span className="hidden sm:inline">Voltar</span> Admin
            </a>
          </div>
        </div>
      </header>
        
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}