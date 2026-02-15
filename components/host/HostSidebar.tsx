'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, Calendar, ClipboardList, Settings, LogOut, ChevronLeft, MessageSquare, Shield } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming cn utility exists, or use template literals

const MENU_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/host/dashboard' },
  { label: 'Properties', icon: Building2, href: '/host/properties' },
  { label: 'Bookings', icon: ClipboardList, href: '/host/bookings' },
  { label: 'Calendar', icon: Calendar, href: '/host/calendar' },
  { label: 'Messages', icon: MessageSquare, href: '/host/messages' },
  { label: 'Trust Center', icon: Shield, href: '/host/verification' },
];

export default function HostSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-neutral-200 fixed top-0 left-0 h-full z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-6">
           <Link href="/" className="flex items-center gap-2 mb-8 group">
              <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
              <span className="text-sm font-semibold text-gray-500 group-hover:text-gray-900 transition-colors">Back to Fly2Any</span>
           </Link>
           
           <div className="mb-2 px-2">
             <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Host Panel</span>
           </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                  isActive 
                    ? "bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-100" 
                    : "text-gray-600 hover:bg-neutral-50 hover:text-gray-900"
                )}
              >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full" />}
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary-600" : "text-gray-400 group-hover:text-gray-600")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-100">
           <Link 
             href="/account/settings"
             className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-neutral-50 hover:text-gray-900 transition-all"
           >
              <Settings className="w-5 h-5 text-gray-400" />
              Settings
           </Link>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-50 flex justify-around p-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {MENU_ITEMS.map((item) => {
           const isActive = pathname === item.href;
           return (
             <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg min-w-[64px]",
                  isActive ? "text-primary-600" : "text-gray-400"
                )}
             >
                <item.icon className={cn("w-6 h-6", isActive && "fill-current opacity-20")} />
                <span className="text-[10px] font-medium">{item.label}</span>
             </Link>
           );
        })}
      </nav>
    </>
  );
}
