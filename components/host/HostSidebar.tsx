'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import {
  LayoutDashboard, Building2, Calendar, ClipboardList, Settings,
  LogOut, MessageSquare, Shield, Wallet, TrendingUp, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MENU_ITEMS = [
  { label: 'Dashboard',   icon: LayoutDashboard, href: '/host/dashboard' },
  { label: 'Properties',  icon: Building2,        href: '/host/properties' },
  { label: 'Bookings',    icon: ClipboardList,    href: '/host/bookings' },
  { label: 'Calendar',    icon: Calendar,         href: '/host/calendar' },
  { label: 'Messages',    icon: MessageSquare,    href: '/host/messages' },
  { label: 'Payouts',     icon: Wallet,           href: '/host/payouts' },
  { label: 'Finances',    icon: TrendingUp,       href: '/host/finances' },
  { label: 'Trust',       icon: Shield,           href: '/host/verification' },
];

// All 8 items shown in scrollable mobile row
const MOBILE_NAV_ITEMS = MENU_ITEMS;

export default function HostSidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  // startsWith so sub-routes like /host/properties/123 still highlight Properties
  const isActive = (href: string) => pathname === href || (href !== '/host/dashboard' && (pathname ?? '').startsWith(href));

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <div
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className={cn(
          'hidden md:flex flex-col bg-white border-r border-neutral-200 h-full z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300 overflow-x-hidden shrink-0',
          expanded ? 'w-56' : 'w-[72px]'
        )}
      >
        <nav className="flex-1 overflow-y-auto px-3 space-y-1.5 py-4 mt-2 scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent">
          {MENU_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all relative overflow-hidden whitespace-nowrap',
                  active
                    ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm ring-1 ring-primary-100'
                    : 'text-gray-600 hover:bg-neutral-50 hover:text-gray-900'
                )}
              >
                {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full" />}
                <div className={cn('p-1.5 shrink-0 rounded-lg', expanded ? '' : 'mx-auto', active ? 'bg-primary-100 text-primary-600' : 'bg-transparent')}>
                  <item.icon className="w-[18px] h-[18px]" />
                </div>
                <span className={cn('flex-1 text-sm font-bold transition-opacity duration-300 overflow-hidden', expanded ? 'opacity-100' : 'opacity-0 w-0')}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-100 flex flex-col gap-3 shrink-0">
          <Link
            href="/host/profile"
            className={cn(
              'w-full flex items-center gap-3 p-3 rounded-xl border border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50 text-gray-600 font-bold transition-all text-sm overflow-hidden whitespace-nowrap',
              expanded ? 'justify-start' : 'justify-center'
            )}
          >
            <div className={cn('p-0.5 shrink-0 rounded-lg', expanded ? '' : 'mx-auto')}>
              <Settings className="w-[18px] h-[18px]" />
            </div>
            <span className={cn('transition-opacity duration-300', expanded ? 'opacity-100' : 'opacity-0 w-0')}>Host Profile</span>
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className={cn(
              'w-full flex items-center gap-3 p-3 rounded-xl border border-rose-50 hover:border-rose-100 hover:bg-rose-50 text-rose-600 font-bold transition-all text-sm overflow-hidden whitespace-nowrap',
              expanded ? 'justify-start' : 'justify-center'
            )}
          >
            <div className={cn('p-0.5 shrink-0 rounded-lg', expanded ? '' : 'mx-auto')}>
              <LogOut className="w-[18px] h-[18px] text-rose-500" />
            </div>
            <span className={cn('transition-opacity duration-300', expanded ? 'opacity-100' : 'opacity-0 w-0')}>Sign Out</span>
          </button>
        </div>
      </div>

      {/* MOBILE BOTTOM NAV — scrollable, all 8 items */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-50 flex overflow-x-auto hide-scrollbar shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {MOBILE_NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2.5 pb-safe shrink-0 min-w-[64px] transition-colors',
                active ? 'text-primary-600' : 'text-gray-400 hover:text-gray-700'
              )}
            >
              <item.icon className={cn('w-5 h-5', active && 'stroke-[2.5]')} />
              <span className={cn('text-[9px] font-bold tracking-tight whitespace-nowrap', active ? 'text-primary-600' : 'text-gray-400')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
