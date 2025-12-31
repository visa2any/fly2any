"use client";

import { ReactNode } from "react";

// Simple wrapper - no dynamic state to avoid hydration issues
// Sidebar state is managed only in AgentSidebar
export default function AgentContentWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="lg:pl-16">
      {children}
    </div>
  );
}
