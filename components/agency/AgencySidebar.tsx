'use client';

// components/agency/AgencySidebar.tsx
// Level 6 Ultra-Premium Agency Sidebar
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, DollarSign, BarChart3, Settings,
  FileText, CreditCard, ChevronLeft, ChevronRight, Building2,
  Percent, TrendingUp, ArrowLeftRight
} from 'lucide-react';

interface AgencySidebarProps {
  agent: {
    id: string;
    agencyName?: string | null;
    businessName?: string | null;
    logo?: string | null;
    brandColor?: string | null;
  };
}

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/agency', icon: LayoutDashboard },
  { name: 'Team', href: '/agency/team', icon: Users },
  { name: 'Markup Rules', href: '/agency/markup-rules', icon: Percent },
  { name: 'Analytics', href: '/agency/analytics', icon: BarChart3 },
  { name: 'Clients', href: '/agency/clients', icon: FileText },
  { name: 'Payouts', href: '/agency/payouts', icon: CreditCard },
  { name: 'Settings', href: '/agency/settings', icon: Settings },
];

export default function AgencySidebar({ agent }: AgencySidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const agencyName = agent.agencyName || agent.businessName || 'My Agency';

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 288 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col bg-white border-r border-gray-100 shadow-sm z-40"
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          <Link href="/agency" className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg"
              style={{ background: agent.brandColor || 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
            >
              <Building2 className="w-5 h-5" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-bold text-gray-900 truncate"
                >
                  {agencyName}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/agency' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="font-medium text-sm"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Switch to Agent Portal */}
        <div className="p-3 border-t border-gray-100">
          <Link href="/agent">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <ArrowLeftRight className="w-5 h-5" />
              {!collapsed && <span className="text-sm font-medium">Agent Portal</span>}
            </motion.div>
          </Link>
        </div>
      </motion.aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-50 safe-area-bottom">
        <div className="flex items-center justify-around">
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const isActive = pathname === item.href || (item.href !== '/agency' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg ${
                  isActive ? 'text-indigo-600' : 'text-gray-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
