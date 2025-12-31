"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { HelpCircle, LayoutDashboard, Users, FileText, ClipboardCheck, DollarSign, Wallet, Package, Building2, Activity, Settings } from "lucide-react";

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

export default function AgentSidebar({ agent }: AgentSidebarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (href: string) => (href === "/agent" ? pathname === href : pathname.startsWith(href));

  const NavItem = ({ item, onClick }: { item: typeof navigation[0]; onClick?: () => void }) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    return (
      <div className="relative group">
        <Link
          href={item.href}
          onClick={onClick}
          className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
            active ? "bg-primary-50 text-primary-700" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          }`}
        >
          <Icon className={`w-5 h-5 ${active ? "text-primary-600" : ""}`} />
        </Link>
        {/* Tooltip */}
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
          {item.name}
          {(item as any).badge && <span className="ml-1 px-1 py-0.5 bg-green-500 rounded text-[10px]">{(item as any).badge}</span>}
        </div>
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

      {/* Sidebar - Fixed 64px icon-only */}
      <aside className={`fixed top-0 left-0 bottom-0 z-50 w-16 bg-white border-r border-gray-200 flex flex-col ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} transition-transform duration-200`}>
        {/* Logo */}
        <div className="h-14 flex items-center justify-center border-b border-gray-200">
          <Link href="/agent" className="text-xl font-bold text-primary-600">F</Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {navigation.map((item) => <NavItem key={item.name} item={item} onClick={() => setIsMobileMenuOpen(false)} />)}
          <div className="py-2"><div className="border-t border-gray-200" /></div>
          {secondaryNav.map((item) => <NavItem key={item.name} item={item} onClick={() => setIsMobileMenuOpen(false)} />)}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-2">
          <div className="relative group">
            <a href="/help" className="flex items-center justify-center p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg">
              <HelpCircle className="w-5 h-5" />
            </a>
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
              Help
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
