"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, HelpCircle, LayoutDashboard, Users, FileText, ClipboardCheck, DollarSign, Wallet, Package, Building2, Activity, Settings } from "lucide-react";

interface AgentSidebarProps {
  agent: {
    id: string;
    tier: string;
    status: string;
    businessName?: string | null;
    user: { name: string | null; email: string; image?: string | null };
  };
}

const navigation = [
  { name: "Dashboard", href: "/agent", icon: LayoutDashboard },
  { name: "Clients", href: "/agent/clients", icon: Users },
  { name: "Quotes", href: "/agent/quotes", icon: FileText, badge: "NEW" },
  { name: "Bookings", href: "/agent/bookings", icon: ClipboardCheck },
  { name: "Commissions", href: "/agent/commissions", icon: DollarSign },
  { name: "Payouts", href: "/agent/payouts", icon: Wallet },
];

const secondaryNav = [
  { name: "Products", href: "/agent/products", icon: Package },
  { name: "Suppliers", href: "/agent/suppliers", icon: Building2 },
  { name: "Activity Log", href: "/agent/activity", icon: Activity },
  { name: "Settings", href: "/agent/settings", icon: Settings },
];

const tierColors: Record<string, string> = {
  INDEPENDENT: "bg-gray-100 text-gray-800",
  PROFESSIONAL: "bg-blue-100 text-blue-800",
  AGENCY_PARTNER: "bg-purple-100 text-purple-800",
  WHITE_LABEL: "bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-900",
};

export default function AgentSidebar({ agent }: AgentSidebarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true); // Default collapsed

  // Persist collapsed state - only after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("agentSidebarCollapsed");
    if (saved !== null) setIsCollapsed(saved === "true");
  }, []);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("agentSidebarCollapsed", String(next));
    // Dispatch event for layout to listen
    window.dispatchEvent(new CustomEvent("sidebarToggle", { detail: { collapsed: next } }));
  };

  const isActive = (href: string) => (href === "/agent" ? pathname === href : pathname.startsWith(href));

  const NavItem = ({ item, onClick }: { item: typeof navigation[0]; onClick?: () => void }) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    return (
      <div className="relative group">
        <Link
          href={item.href}
          onClick={onClick}
          className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            active ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"
          } ${isCollapsed ? "justify-center" : ""}`}
        >
          <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-primary-600" : "text-gray-400"}`} />
          {!isCollapsed && <span className="truncate">{item.name}</span>}
          {!isCollapsed && (item as any).badge && (
            <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              {(item as any).badge}
            </span>
          )}
        </Link>
        {/* Tooltip when collapsed */}
        {isCollapsed && (
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
            {item.name}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="ml-3 text-lg font-semibold text-gray-900">Agent Portal</span>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && <div className="lg:hidden fixed inset-0 z-40 bg-gray-600/75" onClick={() => setIsMobileMenuOpen(false)} />}

      {/* Sidebar */}
      <aside
        className="fixed top-0 left-0 bottom-0 z-50 bg-white border-r border-gray-200 flex flex-col transition-all duration-200 ease-out w-16 -translate-x-full lg:translate-x-0"
        style={{ width: mounted ? (isCollapsed ? '4rem' : '16rem') : undefined, transform: isMobileMenuOpen ? 'translateX(0)' : undefined }}
        suppressHydrationWarning
      >
        {/* Logo */}
        <div className={`h-14 flex items-center border-b border-gray-200 ${isCollapsed ? "justify-center px-2" : "justify-between px-4"}`}>
          <Link href="/agent" className="flex items-center">
            {isCollapsed ? (
              <span className="text-xl font-bold text-primary-600">F</span>
            ) : (
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">Fly2Any</span>
            )}
          </Link>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-1 rounded text-gray-500 hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Agent Info - Hidden when collapsed */}
        {!isCollapsed && (
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {agent.user.name?.charAt(0) || agent.user.email.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{agent.businessName || agent.user.name || "Agent"}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tierColors[agent.tier] || tierColors.INDEPENDENT}`}>
                  {agent.tier.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className={`flex-1 py-3 space-y-1 overflow-y-auto ${isCollapsed ? "px-2" : "px-3"}`}>
          {navigation.map((item) => <NavItem key={item.name} item={item} onClick={() => setIsMobileMenuOpen(false)} />)}
          <div className="py-2"><div className="border-t border-gray-200" /></div>
          {secondaryNav.map((item) => <NavItem key={item.name} item={item} onClick={() => setIsMobileMenuOpen(false)} />)}
        </nav>

        {/* Footer */}
        <div className={`border-t border-gray-200 ${isCollapsed ? "p-2" : "p-3"}`}>
          {/* Help Link */}
          <div className="relative group">
            <a href="/help" className={`flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg ${isCollapsed ? "justify-center" : ""}`}>
              <HelpCircle className="w-5 h-5" />
              {!isCollapsed && <span>Help</span>}
            </a>
            {isCollapsed && (
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                Help
              </div>
            )}
          </div>
          {/* Collapse Toggle */}
          <button
            onClick={toggleCollapse}
            className={`w-full flex items-center gap-2 px-3 py-2 mt-1 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ${isCollapsed ? "justify-center" : ""}`}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
          </button>
        </div>
      </aside>
    </>
  );
}
