'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Plane,
  Bell,
  Heart,
  Search,
  MessageSquare,
  Settings,
  CreditCard,
  Users,
  FileText,
  Gift,
  BarChart3,
  Shield,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Award,
  Trophy,
  UserCircle,
  Map,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  isNew?: boolean;
}

interface AccountSidebarProps {
  unreadNotifications?: number;
  activeAlerts?: number;
}

export function AccountSidebar({ unreadNotifications = 0, activeAlerts = 0 }: AccountSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const navItems: NavItem[] = [
    {
      href: '/account',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      href: '/account/bookings',
      label: 'My Bookings',
      icon: <Plane className="w-5 h-5" />,
    },
    {
      href: '/account/searches',
      label: 'Saved Searches',
      icon: <Search className="w-5 h-5" />,
    },
    {
      href: '/account/alerts',
      label: 'Price Alerts',
      icon: <Bell className="w-5 h-5" />,
      badge: activeAlerts,
    },
    {
      href: '/account/wishlist',
      label: 'Wishlist',
      icon: <Heart className="w-5 h-5" />,
    },
    {
      href: '/account/notifications',
      label: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      badge: unreadNotifications,
    },
    {
      href: '/account/conversations',
      label: 'AI Conversations',
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      href: '/account/travelers',
      label: 'Travelers',
      icon: <Users className="w-5 h-5" />,
      isNew: true,
    },
    {
      href: '/account/payment-methods',
      label: 'Payment Methods',
      icon: <CreditCard className="w-5 h-5" />,
      isNew: true,
    },
    {
      href: '/account/documents',
      label: 'Travel Documents',
      icon: <FileText className="w-5 h-5" />,
      isNew: true,
    },
    {
      href: '/account/trip-history',
      label: 'Trip History',
      icon: <BarChart3 className="w-5 h-5" />,
      isNew: true,
    },
    {
      href: '/account/trips',
      label: 'Trip Boards',
      icon: <Map className="w-5 h-5" />,
      isNew: true,
    },
    {
      href: '/account/referrals',
      label: 'Refer & Earn',
      icon: <Gift className="w-5 h-5" />,
      isNew: true,
    },
    {
      href: '/account/loyalty',
      label: 'Loyalty & Rewards',
      icon: <Award className="w-5 h-5" />,
      isNew: true,
    },
    {
      href: '/account/leaderboard',
      label: 'Leaderboard',
      icon: <Trophy className="w-5 h-5" />,
      isNew: true,
    },
    {
      href: '/account/profile',
      label: 'My Profile',
      icon: <UserCircle className="w-5 h-5" />,
    },
    {
      href: '/account/preferences',
      label: 'Preferences',
      icon: <Settings className="w-5 h-5" />,
    },
    {
      href: '/account/security',
      label: 'Security',
      icon: <Shield className="w-5 h-5" />,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/account') {
      return pathname === '/account';
    }
    return pathname?.startsWith(href);
  };

  const SidebarContent = () => (
    <nav className="flex-1 space-y-1 px-2 py-4">
      {navItems.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              group flex items-center rounded-lg transition-all duration-200
              ${isCollapsed ? 'justify-center px-2 py-3' : 'px-3 py-2.5 gap-3'}
              ${
                active
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'
              }
            `}
            title={isCollapsed ? item.label : undefined}
          >
            <div className="flex-shrink-0 relative">
              {item.icon}
              {item.badge && item.badge > 0 && (
                <span
                  className={`
                  absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center
                  rounded-full text-[10px] font-bold
                  ${active ? 'bg-white text-primary-600' : 'bg-primary-500 text-white'}
                `}
                >
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </div>

            {!isCollapsed && (
              <>
                <span className="flex-1 text-sm font-medium">{item.label}</span>
                {item.isNew && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-secondary-500 text-white rounded-full">
                    NEW
                  </span>
                )}
              </>
            )}
          </Link>
        );
      })}
    </nav>
  );

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <aside
      className={`
        hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
      style={{ height: 'calc(100vh - 72px)' }}
    >
      <div className="sticky top-0">
        {/* Collapse Toggle */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          {!isCollapsed && (
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              My Account
            </h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`
              p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-primary-600 transition-colors
              ${isCollapsed ? 'mx-auto' : 'ml-auto'}
            `}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 144px)' }}>
          <SidebarContent />
        </div>
      </div>
    </aside>
  );

  // Mobile Menu Button (Fixed Position)
  const MobileMenuButton = () => (
    <button
      onClick={() => setIsMobileOpen(!isMobileOpen)}
      className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full shadow-2xl hover:shadow-primary/50 transition-all duration-200 hover:scale-110 active:scale-95"
      aria-label="Open account menu"
    >
      <Menu className="w-6 h-6" />
    </button>
  );

  // Mobile Sidebar (Overlay)
  const MobileSidebar = () => (
    <>
      {/* Backdrop */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] animate-fadeIn"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`
          lg:hidden fixed top-0 left-0 bottom-0 z-[9999] w-80 bg-white shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-primary-500 to-primary-600">
          <h2 className="text-lg font-bold text-white">My Account</h2>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <div className="overflow-y-auto h-[calc(100vh-72px)]">
          <SidebarContent />
        </div>
      </aside>
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileMenuButton />
      <MobileSidebar />
    </>
  );
}
