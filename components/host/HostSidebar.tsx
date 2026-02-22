'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, Calendar, ClipboardList, Settings, LogOut, ChevronLeft, MessageSquare, ShieldCheck, Wallet, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const MENU_ITEMS = [
  { label: 'Home', icon: LayoutDashboard, href: '/host/dashboard' },
  { label: 'Calendar', icon: Calendar, href: '/host/calendar' },
  { label: 'Inbox', icon: MessageSquare, href: '/host/messages' },
  { label: 'Listings', icon: Building2, href: '/host/properties' },
  { label: 'Trust', icon: ShieldCheck, href: '/host/trust' },
  { label: 'Insights', icon: TrendingUp, href: '/host/finances' },
];

export default function HostSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* DESKTOP SIDEBAR - Fixed Slim Standard (Stitch) */}
      <div className="hidden md:flex flex-col bg-[#0B1221] w-[80px] h-full z-50 fixed left-0 top-0 bottom-0 border-r border-white/5 items-center py-6">
        
        {/* LOGO AREA (Top Icon) */}
        <div className="mb-12">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
                <Building2 className="w-6 h-6" />
            </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 flex flex-col gap-6">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "p-3 rounded-2xl transition-all relative group",
                  isActive 
                    ? "bg-[#3B82F6] text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]" 
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className="w-6 h-6" />
                
                {/* Tooltip on hover */}
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#1B243B] text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-1 group-hover:translate-x-0 whitespace-nowrap shadow-xl border border-white/5 uppercase tracking-widest z-maximum">
                    {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* BOTTOM ACTIONS */}
        <div className="mt-auto flex flex-col gap-6 pb-2">
            <Link 
                href="/host/profile"
                className="p-3 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 transition-all"
            >
                <Settings className="w-6 h-6" />
            </Link>
            
            <div className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-white/10 p-0.5">
                <img 
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" 
                    alt="User" 
                    className="w-full h-full object-cover rounded-xl shadow-inner"
                />
            </div>
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0B1221] border-t border-white/5 z-50 flex justify-around p-3 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.5)]">
        {MENU_ITEMS.map((item) => {
           const isActive = pathname === item.href;
           return (
             <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl transition-colors",
                  isActive ? "text-[#3B82F6]" : "text-white/30"
                )}
             >
                <item.icon className={cn("w-6 h-6", isActive && "drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]")} />
             </Link>
           );
        })}
      </nav>
    </>
  );
}
