'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import SessionWrapper from '@/components/SessionWrapper';

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: '📊',
    exact: true
  },
  {
    name: 'Omnichannel',
    href: '/admin/omnichannel-test',
    icon: '🌐',
    badge: '12'
  },
  {
    name: 'Leads',
    href: '/admin/leads',
    icon: '🎯',
    badge: '47'
  },
  {
    name: 'Leads Moderno',
    href: '/admin/leads/modern',
    icon: '✨',
    badge: 'NOVO'
  },
  {
    name: 'Clientes',
    href: '/admin/customers',
    icon: '👥'
  },
  {
    name: 'Phone Management',
    href: '/admin/phone-management',
    icon: '📱',
    badge: '14K'
  },
  {
    name: 'Campanhas',
    href: '/admin/campaigns',
    icon: '🚀'
  },
  {
    name: 'Email Marketing',
    href: '/admin/email-marketing',
    icon: '📧',
    badge: 'GRÁTIS'
  },
  {
    name: 'Templates Email',
    href: '/admin/email-templates',
    icon: '📨'
  },
  {
    name: 'WhatsApp',
    href: '/admin/whatsapp',
    icon: '💬'
  },
  {
    name: 'Suporte',
    href: '/admin/support',
    icon: '🛠️',
    badge: '3'
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: '📈'
  },
  {
    name: 'Teste Gmail',
    href: '/admin/test-gmail',
    icon: '🧪',
    badge: 'TEST'
  },
  {
    name: 'Configurações',
    href: '/admin/settings',
    icon: '⚙️'
  }
];

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (!session && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [session, status, pathname, router]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut({
        callbackUrl: '/admin/login',
        redirect: true
      });
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Don't render admin layout for login page or if not authenticated
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }
  
  // Don't render admin layout if not authenticated
  if (!session) {
    return null;
  }

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="admin-app">
      {/* Sidebar */}
      <aside 
        className={`admin-sidebar ${sidebarExpanded ? 'expanded' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        {/* Logo/Header */}
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <Image
              src="/fly2any-logo.png"
              alt="Fly2Any"
              width={64}
              height={26}
              className="object-contain"
            />
          </div>
          <div className="admin-logo-text">Fly2Any</div>
        </div>

        {/* Navigation */}
        <nav className="admin-sidebar-nav">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`admin-nav-item ${isActive(item.href, item.exact) ? 'active' : ''}`}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span className="admin-nav-label">{item.name}</span>
              {item.badge && (
                <span className="admin-nav-badge">{item.badge}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* User Menu */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-menu">
            <div className="admin-user-avatar">
              {session?.user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="admin-user-info">
              <div className="admin-user-name">
                {session?.user?.name || 'Admin'}
              </div>
              <div className="admin-user-role">Administrador</div>
            </div>
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="admin-logout-btn"
              title="Sair"
            >
              {isLoggingOut ? (
                <span className="animate-spin">⏳</span>
              ) : (
                '🚪'
              )}
            </button>
          </div>
        </div>

        {/* Toggle Button */}
        <button
          className="admin-sidebar-toggle"
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          aria-label="Toggle sidebar"
        >
          <span>{sidebarExpanded ? '←' : '→'}</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="admin-breadcrumb">
            <span>Admin</span>
            {pathname !== '/admin' && (
              <>
                <span className="admin-breadcrumb-separator">/</span>
                <span className="admin-breadcrumb-current">
                  {navigation.find(item => pathname.startsWith(item.href))?.name || 'Página'}
                </span>
              </>
            )}
          </div>

          <div className="admin-header-actions">
            {/* Mobile Menu Toggle */}
            <button
              className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-3 py-2 rounded-lg hover:scale-105 transition-all duration-300 shadow-lg md:hidden border-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              ☰
            </button>
            
            {/* Quick Actions */}
            <button className="bg-gradient-to-r from-orange-400 to-pink-500 text-white p-2 rounded-lg hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl border-0 relative overflow-hidden group">
              <span className="relative z-10">🔔</span>
              <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            </button>
            <button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-0 font-semibold disabled:opacity-50"
            >
              {isLoggingOut ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Saindo...
                </>
              ) : (
                <>
                  🚪 Sair
                </>
              )}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="admin-content">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionWrapper>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SessionWrapper>
  );
}