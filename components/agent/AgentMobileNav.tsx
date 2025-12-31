'use client';

// components/agent/AgentMobileNav.tsx
// Level 6 Ultra-Premium Mobile Bottom Navigation
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, FileText, Calendar, Settings
} from 'lucide-react';

const navItems = [
  { href: '/agent', icon: LayoutDashboard, label: 'Home' },
  { href: '/agent/clients', icon: Users, label: 'Clients' },
  { href: '/agent/quotes', icon: FileText, label: 'Quotes' },
  { href: '/agent/bookings', icon: Calendar, label: 'Bookings' },
  { href: '/agent/settings', icon: Settings, label: 'Settings' },
];

export default function AgentMobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/agent') return pathname === '/agent';
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-around h-16 px-2 safe-area-pb">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center justify-center py-1"
              >
                <div
                  className={`relative p-1.5 rounded-xl transition-all duration-200 ${
                    active ? 'bg-indigo-50' : ''
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      active ? 'text-indigo-600' : 'text-gray-400'
                    }`}
                  />
                  {active && (
                    <motion.div
                      layoutId="mobileNavIndicator"
                      className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"
                    />
                  )}
                </div>
                <span
                  className={`text-[10px] mt-0.5 font-medium transition-colors ${
                    active ? 'text-indigo-600' : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
