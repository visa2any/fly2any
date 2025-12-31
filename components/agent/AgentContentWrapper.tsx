"use client";

import { useState, useEffect, ReactNode } from "react";

export default function AgentContentWrapper({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    // Read initial state
    const saved = localStorage.getItem("agentSidebarCollapsed");
    setIsCollapsed(saved === null ? true : saved === "true");

    // Listen for toggle events
    const handler = (e: CustomEvent<{ collapsed: boolean }>) => setIsCollapsed(e.detail.collapsed);
    window.addEventListener("sidebarToggle", handler as EventListener);
    return () => window.removeEventListener("sidebarToggle", handler as EventListener);
  }, []);

  return (
    <div className={`transition-all duration-200 ease-out ${isCollapsed ? "lg:pl-16" : "lg:pl-64"}`}>
      {children}
    </div>
  );
}
