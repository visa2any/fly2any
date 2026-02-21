'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, Calendar, ClipboardList, Settings, LogOut, ChevronLeft, MessageSquare, Shield, Wallet, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const MENU_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/host/dashboard' },
  { label: 'Properties', icon: Building2, href: '/host/properties' },
  { label: 'Bookings', icon: ClipboardList, href: '/host/bookings' },
  { label: 'Calendar', icon: Calendar, href: '/host/calendar' },
  { label: 'Messages', icon: MessageSquare, href: '/host/messages' },
  { label: 'Payouts', icon: Wallet, href: '/host/payouts' },
  { label: 'Finances', icon: TrendingUp, href: '/host/finances' },
  { label: 'Trust Center', icon: Shield, href: '/host/verification' },
];

// Reduced set for mobile bottom nav — only 5 core items
const MOBILE_NAV_ITEMS = MENU_ITEMS.filter(item => 
  ['Dashboard', 'Properties', 'Bookings', 'Calendar', 'Messages'].includes(item.label)
);

export default function HostSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:flex flex-col bg-midnight-navy border-r border-midnight-navy h-full z-40 shadow-[4px_0_24px_rgba(0,0,0,0.2)] transition-all duration-300 w-[72px] hover:w-56 group absolute left-0 top-0 bottom-0 overflow-x-hidden">
        <nav className="flex-1 overflow-y-auto px-3 space-y-2 py-4 mt-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all relative overflow-hidden whitespace-nowrap group/navitem",
                  isActive 
                    ? "bg-white/10 text-white font-bold shadow-sm" 
                    : "text-neutral-400 hover:bg-white/5 hover:text-white font-semibold"
                )}
              >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full shadow-[0_0_8px_rgba(231,64,53,0.6)]" />}
                <div className={cn("p-1.5 shrink-0 rounded-lg mx-auto group-hover:mx-0 transition-colors", isActive ? "bg-primary-500/20 text-primary-400" : "bg-transparent text-neutral-400 group-hover/navitem:text-white")}>
                  <item.icon className="w-[18px] h-[18px]" />
                </div>
                <span className="flex-1 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 flex flex-col gap-3 shrink-0">
          <Link 
            href="/host/profile"
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 text-neutral-400 font-semibold hover:text-white transition-all text-sm group/btn overflow-hidden whitespace-nowrap mx-auto group-hover:mx-0 justify-center group-hover:justify-start"
          >
            <div className="p-0.5 shrink-0 rounded-lg mx-auto group-hover:mx-0">
              <Settings className="w-[18px] h-[18px] group-hover/btn:text-white transition-colors" />
            </div>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Host Profile</span>
          </Link>
        </div>
      </div>

      {/* MOBILE BOTTOM NAV — 5 core items for better touch targets */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-midnight-navy border-t border-white/10 z-50 flex justify-around p-2 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.3)]">
        {MOBILE_NAV_ITEMS.map((item) => {
           const isActive = pathname === item.href;
           return (
             <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg min-w-[56px] transition-colors",
                  isActive ? "text-primary-400" : "text-neutral-500 hover:text-neutral-300"
                )}
             >
                <item.icon className={cn("w-6 h-6", isActive && "fill-primary-500/20 drop-shadow-[0_0_8px_rgba(231,64,53,0.4)]")} />
                <span className="text-[10px] font-bold">{item.label}</span>
             </Link>
           );
        })}
      </nav>
    </>
  );
}
