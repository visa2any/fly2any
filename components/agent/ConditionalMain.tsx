"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface ConditionalMainProps {
  children: ReactNode;
  pendingMessage?: ReactNode;
}

export default function ConditionalMain({ children, pendingMessage }: ConditionalMainProps) {
  const pathname = usePathname();
  const isWorkspace = pathname === "/agent/quotes/workspace";

  // Always render main wrapper to avoid hydration mismatch
  // Use CSS to conditionally apply padding
  return (
    <main className={isWorkspace ? "" : "py-4 px-4 sm:px-6 lg:px-8 pb-24 lg:pb-6"} suppressHydrationWarning>
      {!isWorkspace && pendingMessage}
      {children}
    </main>
  );
}
