'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Building2, CalendarDays, BookOpen, ArrowLeft
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/host/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/host/properties', label: 'Properties', icon: Building2 },
  { href: '/host/bookings', label: 'Bookings', icon: BookOpen },
  { href: '/host/calendar', label: 'Calendar', icon: CalendarDays },
];

export default function HostSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 min-h-screen bg-[#0a0a0f] border-r border-white/10 fixed left-0 top-0 z-40">
        {/* Logo / Back */}
        <div className="h-16 flex items-center px-4 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" />
            Back to Fly2Any
          </Link>
        </div>

        {/* Brand */}
        <div className="px-4 py-5">
          <div className="text-xs uppercase tracking-widest text-white/30 font-bold mb-1">Host Panel</div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            // Strip locale prefix (e.g. /pt-BR/host/dashboard → /host/dashboard) for matching
            const cleanPath = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '') || '/';
            const isActive = cleanPath === item.href || cleanPath.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : ''}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
          <Link href="/list-your-property/create" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold text-xs hover:scale-[1.02] transition-transform shadow-lg shadow-amber-400/10">
            + New Property
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[#0a0a0f]/95 backdrop-blur border-t border-white/10 z-50 flex">
        {NAV_ITEMS.map((item) => {
          const cleanPath = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '') || '/';
          const isActive = cleanPath === item.href || cleanPath.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-bold transition-colors ${
                isActive ? 'text-amber-400' : 'text-white/40'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
