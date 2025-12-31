"use client";

import { useState, useEffect, ReactNode } from "react";

export default function AgentContentWrapper({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("agentSidebarCollapsed");
    setIsCollapsed(saved === null ? true : saved === "true");

    const handler = (e: CustomEvent<{ collapsed: boolean }>) => setIsCollapsed(e.detail.collapsed);
    window.addEventListener("sidebarToggle", handler as EventListener);
    return () => window.removeEventListener("sidebarToggle", handler as EventListener);
  }, []);

  // Use inline style to avoid hydration mismatch
  // Server renders with pl-16, client syncs after mount
  return (
    <div
      style={{ paddingLeft: mounted ? (isCollapsed ? '4rem' : '16rem') : undefined }}
      className="transition-all duration-200 ease-out lg:pl-16"
      suppressHydrationWarning
    >
      {children}
    </div>
  );
}
