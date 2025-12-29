'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AccountSidebar } from './AccountSidebar';
import {
  LayoutDashboard,
  Plane,
  Bell,
  Heart,
  User,
} from 'lucide-react';

interface AccountLayoutClientProps {
  children: ReactNode;
}

export function AccountLayoutClient({ children }: AccountLayoutClientProps) {
  const pathname = usePathname();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [activeAlerts, setActiveAlerts] = useState(0);

  // Fetch notification and alert counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const notificationsRes = await fetch('/api/notifications?unreadOnly=true&limit=1');
        if (notificationsRes.ok) {
          const data = await notificationsRes.json();
          setUnreadNotifications(data.total || 0);
        }

        const alertsRes = await fetch('/api/price-alerts?activeOnly=true');
        if (alertsRes.ok) {
          const data = await alertsRes.json();
          setActiveAlerts(data.alerts?.length || 0);
        }
      } catch (error) {
        console.error('Failed to fetch counts:', error);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  // Mobile bottom nav items
  const mobileNavItems = [
    { href: '/account', icon: LayoutDashboard, label: 'Home' },
    { href: '/account/bookings', icon: Plane, label: 'Bookings' },
    { href: '/account/alerts', icon: Bell, label: 'Alerts', badge: activeAlerts },
    { href: '/account/wishlist', icon: Heart, label: 'Wishlist' },
    { href: '/account/profile', icon: User, label: 'Profile' },
  ];

  const isActive = (href: string) => {
    if (href === '/account') return pathname === '/account';
    return pathname?.startsWith(href);
  };

  return (
    <div className="flex min-h-screen bg-neutral-50 w-full max-w-full overflow-x-hidden">
      <AccountSidebar
        unreadNotifications={unreadNotifications}
        activeAlerts={activeAlerts}
      />

      {/* Main Content Area - Level-6 Ultra Premium Mobile */}
      <main className="flex-1 lg:ml-0 pb-20 lg:pb-0 w-full max-w-full overflow-x-hidden">
        <div className="w-full max-w-full px-0 md:px-4 lg:px-6 py-0 md:py-4 min-h-screen overflow-x-hidden">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation - Apple-Class Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[999] bg-white/95 backdrop-blur-xl border-t border-neutral-200/80 safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {mobileNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center flex-1 h-full pt-1
                  transition-all duration-200 ease-out
                  active:scale-95
                  ${active ? 'text-primary-600' : 'text-neutral-500'}
                `}
              >
                <div className="relative">
                  <item.icon className={`w-6 h-6 ${active ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold bg-primary-500 text-white rounded-full">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] mt-1 font-medium ${active ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
                {active && (
                  <div className="absolute bottom-1 w-1 h-1 bg-primary-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
