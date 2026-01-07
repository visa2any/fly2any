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

  if (isWorkspace) return null;

  return <AgentTopBar agent={agent} user={user} />;
}
