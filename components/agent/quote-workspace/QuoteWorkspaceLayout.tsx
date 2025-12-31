"use client";

import { ReactNode } from "react";

interface QuoteWorkspaceLayoutProps {
  header: ReactNode;
  discovery: ReactNode;
  itinerary: ReactNode;
  pricing: ReactNode;
  footer: ReactNode;
  overlays?: ReactNode;
}

export default function QuoteWorkspaceLayout({
  header,
  discovery,
  itinerary,
  pricing,
  footer,
  overlays,
}: QuoteWorkspaceLayoutProps) {
  return (
    <div className="h-screen bg-gray-50/50 flex flex-col overflow-hidden">
      {/* Compact Header */}
      <header className="flex-shrink-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        {header}
      </header>

      {/* Main 3-Column - Max Workspace */}
      <main className="flex-1 min-h-0">
        <div className="h-full grid grid-cols-1 lg:grid-cols-[300px_1fr_280px] xl:grid-cols-[320px_1fr_300px]">
          {/* Left: Discovery - Narrower */}
          <aside className="hidden lg:flex flex-col bg-white border-r border-gray-100 overflow-hidden">
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
              {discovery}
            </div>
          </aside>

          {/* Center: Itinerary Canvas - Maximum Space */}
          <section className="flex flex-col min-h-0 bg-gradient-to-b from-gray-50/80 to-white">
            <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-gray-200">
              {itinerary}
            </div>
          </section>

          {/* Right: Pricing - Compact */}
          <aside className="hidden lg:flex flex-col bg-white border-l border-gray-100 overflow-hidden">
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
              {pricing}
            </div>
          </aside>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="flex-shrink-0 z-40 bg-white/95 backdrop-blur-sm border-t border-gray-100">
        {footer}
      </footer>

      {overlays}
    </div>
  );
}
