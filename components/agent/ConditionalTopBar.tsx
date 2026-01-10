"use client";

import { usePathname } from "next/navigation";
import AgentTopBar from "./AgentTopBar";

interface ConditionalTopBarProps {
  agent: any;
  user: any;
}

export default function ConditionalTopBar({ agent, user }: ConditionalTopBarProps) {
  const pathname = usePathname();
  const isWorkspace = pathname === "/agent/quotes/workspace";

  // Always render to avoid hydration mismatch, hide with CSS
  return (
    <div className={isWorkspace ? "hidden" : ""} suppressHydrationWarning>
      <AgentTopBar agent={agent} user={user} />
    </div>
  );
}
