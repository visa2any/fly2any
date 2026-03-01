"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle, LayoutDashboard, Users, FileText, ClipboardCheck,
  DollarSign, Wallet, Package, Building2, Activity, Settings,
  ChevronRight, MessageSquare
} from "lucide-react";

interface AgentSidebarProps {
  agent: {
    id: string;
    tier: string;
    status: string;
    businessName?: string | null;
    user: { name: string | null; email: string; image?: string | null };
  };
}

const TIER_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  gold:     { label: "Gold",     color: "text-amber-700",  bg: "bg-amber-100"  },
  silver:   { label: "Silver",   color: "text-gray-600",   bg: "bg-gray-100"   },
  bronze:   { label: "Bronze",   color: "text-orange-700", bg: "bg-orange-100" },
  platinum: { label: "Platinum", color: "text-indigo-700", bg: "bg-indigo-100" },
  standard: { label: "Agent",    color: "text-blue-700",   bg: "bg-blue-100"   },
};

const primaryNav = [
  { name: "Dashboard",   href: "/agent",             icon: LayoutDashboard },
  { name: "Clients",     href: "/agent/clients",     icon: Users },
  { name: "Quotes",      href: "/agent/quotes",      icon: FileText,       badge: "NEW" },
  { name: "Bookings",    href: "/agent/bookings",    icon: ClipboardCheck },
  { name: "Messages",    href: "/agent/messages",    icon: MessageSquare },
  { name: "Commissions", href: "/agent/commissions", icon: DollarSign },
  { name: "Payouts",     href: "/agent/payouts",     icon: Wallet },
];

const secondaryNav = [
  { name: "Products",     href: "/agent/products",  icon: Package },
  { name: "Suppliers",    href: "/agent/suppliers", icon: Building2 },
  { name: "Activity Log", href: "/agent/activity",  icon: Activity },
  { name: "Settings",     href: "/agent/settings",  icon: Settings },
];

type NavEntry = { name: string; href: string; icon: React.ElementType; badge?: string };

interface NavItemProps {
  item: NavEntry;
  active: boolean;
  hovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick?: () => void;
}

function NavItem({ item, active, hovered, onMouseEnter, onMouseLeave, onClick }: NavItemProps) {
  const Icon = item.icon;
  return (
    <div className="relative" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <Link
        href={item.href}
        onClick={onClick}
        className={`relative flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all duration-200 ${
          active
            ? "bg-primary-600 text-white shadow-[0_4px_12px_rgba(231,64,53,0.3)]"
            : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        }`}
      >
        <Icon className="w-5 h-5 relative z-10" />
        {item.badge && !active && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
        )}
      </Link>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.1 }}
            className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-[60] pointer-events-none"
          >
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap shadow-lg">
              {item.name}
              {item.badge && (
                <span className="px-1 py-px bg-emerald-500 text-[9px] font-bold rounded">
                  {item.badge}
                </span>
              )}
              <ChevronRight className="w-3 h-3 text-gray-500" />
            </div>
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AgentSidebar({ agent }: AgentSidebarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const tier = TIER_CONFIG[agent.tier?.toLowerCase()] || TIER_CONFIG.standard;
  const initials = agent.user.name
    ? agent.user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : agent.user.email.slice(0, 2).toUpperCase();

  const isActive = (href: string) =>
    href === "/agent" ? pathname === href : (pathname ?? "").startsWith(href);

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-sm font-bold text-gray-900">Agent Portal</span>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-gray-900/60"
            onClick={closeMenu}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-16 bg-white border-r border-gray-100 flex flex-col shadow-sm ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } transition-transform duration-200`}
      >
        {/* Logo */}
        <div className="h-14 flex items-center justify-center border-b border-gray-100 flex-shrink-0">
          <Link
            href="/agent"
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-black text-lg shadow-[0_4px_12px_rgba(231,64,53,0.3)] hover:scale-105 transition-transform"
          >
            F
          </Link>
        </div>

        {/* Primary Nav */}
        <nav className="flex-1 py-3 px-2 flex flex-col gap-1 overflow-visible">
          {primaryNav.map((item) => (
            <NavItem
              key={item.name}
              item={item}
              active={isActive(item.href)}
              hovered={hoveredItem === item.name}
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={closeMenu}
            />
          ))}

          <div className="my-1 mx-3 border-t border-gray-100" />

          {secondaryNav.map((item) => (
            <NavItem
              key={item.name}
              item={item}
              active={isActive(item.href)}
              hovered={hoveredItem === item.name}
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={closeMenu}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-100 px-2 py-2 space-y-1">
          {/* Help */}
          <div
            className="relative"
            onMouseEnter={() => setHoveredItem("Help")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <a
              href="/help"
              className="flex items-center justify-center w-10 h-10 mx-auto rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
            </a>
            <AnimatePresence>
              {hoveredItem === "Help" && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.1 }}
                  className="absolute left-full ml-3 bottom-0 z-[60] pointer-events-none"
                >
                  <div className="px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap shadow-lg">
                    Help & Support
                  </div>
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Agent Avatar */}
          <div
            className="relative"
            onMouseEnter={() => setHoveredItem("profile")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Link
              href="/agent/settings"
              className="flex flex-col items-center justify-center w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-bold shadow-sm hover:shadow-md hover:scale-105 transition-all"
            >
              {initials}
            </Link>
            <div className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 px-1 py-px text-[7px] font-black rounded-sm ${tier.bg} ${tier.color} leading-none whitespace-nowrap`}>
              {tier.label.toUpperCase().slice(0, 3)}
            </div>
            <AnimatePresence>
              {hoveredItem === "profile" && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.1 }}
                  className="absolute left-full ml-3 bottom-0 z-[60] pointer-events-none"
                >
                  <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                    <p className="font-semibold">{agent.user.name || agent.user.email}</p>
                    <p className="text-[10px] mt-0.5 text-gray-400">{tier.label} Agent</p>
                  </div>
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>
    </div>
  );
}
