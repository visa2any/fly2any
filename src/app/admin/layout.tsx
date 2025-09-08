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
    name: 'Email Marketing Pro',
    href: '/admin/email-marketing/v2',
    icon: '📧',
    badge: 'V2',
    submenu: [
      {
        name: 'Dashboard',
        href: '/admin/email-marketing/v2?tab=dashboard',
        icon: '📊'
      },
      {
        name: 'Campanhas',
        href: '/admin/email-marketing/v2?tab=campaigns',
        icon: '🚀'
      },
      {
        name: 'Automação',
        href: '/admin/email-marketing/v2?tab=automation',
        icon: '⚡'
      },
      {
        name: 'Segmentos',
        href: '/admin/email-marketing/v2?tab=segments',
        icon: '🎯'
      },
      {
        name: 'Analytics',
        href: '/admin/email-marketing/v2?tab=analytics',
        icon: '📈'
      },
      {
        name: 'Templates',
        href: '/admin/email-marketing/v2?tab=templates',
        icon: '📨'
      },
      {
        name: 'Entregabilidade',
        href: '/admin/email-marketing/v2?tab=deliverability',
        icon: '✅'
      },
      {
        name: 'Testes A/B',
        href: '/admin/email-marketing/v2?tab=testing',
        icon: '🧪'
      }
    ]
  },
  {
    name: 'Campanhas',
    href: '/admin/campaigns',
    icon: '🚀'
  },
  {
    name: 'WhatsApp',
    href: '/admin/whatsapp',
    icon: '💬'
  },
  {
    name: 'Phone Management',
    href: '/admin/phone-management',
    icon: '📱',
    badge: '14K'
  },
  {
    name: 'Omnichannel',
    href: '/admin/omnichannel-test',
    icon: '🌐',
    badge: '12'
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: '📈'
  },
  {
    name: 'Suporte',
    href: '/admin/support',
    icon: '🛠️',
    badge: '3'
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
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  // Note: Authentication redirects are handled by middleware
  // No need to redirect here to avoid conflicts

  const handleLogout = async (): Promise<void> => {
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

  // Don't render admin layout for login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }
  
  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  };

  const isMenuExpanded = (menuName: string) => {
    return expandedMenus.includes(menuName);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-screen z-40 transition-all duration-300 bg-white/95 backdrop-blur-lg border-r border-slate-200 ${
          sidebarExpanded ? 'w-64' : 'w-16'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        {/* Logo/Header */}
        <div className="h-16 flex items-center justify-center border-b border-slate-200 px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              F2A
            </div>
            {sidebarExpanded && (
              <span className="font-bold text-gray-800 text-lg">Fly2Any</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-2">
            {navigation.map((item) => (
              <div key={item.name}>
                {/* Main Menu Item */}
                {(item as any).submenu ? (
                  <button
                    onClick={() => {
                      if (sidebarExpanded) {
                        toggleMenu(item.name);
                      }
                    }}
                    className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive(item.href, item.exact)
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-lg mr-3 flex-shrink-0">{item.icon}</span>
                    {sidebarExpanded && (
                      <div className="flex-1 flex items-center justify-between">
                        <span className="truncate">{item.name}</span>
                        <div className="flex items-center gap-2">
                          {item.badge && (
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                              isActive(item.href, item.exact)
                                ? 'bg-white/20 text-white'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                          <span className={`transform transition-transform ${isMenuExpanded(item.name) ? 'rotate-90' : ''}`}>
                            ▶
                          </span>
                        </div>
                      </div>
                    )}
                    {!sidebarExpanded && item.badge && (
                      <span className="absolute left-10 top-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive(item.href, item.exact)
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="text-lg mr-3 flex-shrink-0">{item.icon}</span>
                    {sidebarExpanded && (
                      <div className="flex-1 flex items-center justify-between">
                        <span className="truncate">{item.name}</span>
                        {item.badge && (
                          <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${
                            isActive(item.href, item.exact)
                              ? 'bg-white/20 text-white'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                    {!sidebarExpanded && item.badge && (
                      <span className="absolute left-10 top-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </Link>
                )}

                {/* Submenu */}
                {(item as any).submenu && sidebarExpanded && isMenuExpanded(item.name) && (
                  <div className="ml-6 mt-1 space-y-1">
                    {(item as any).submenu.map((subItem: any) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={`group flex items-center px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                          pathname.includes(subItem.href.split('?')[0]) && new URLSearchParams(window.location.search).get('tab') === subItem.href.split('tab=')[1]
                            ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="text-sm mr-3 flex-shrink-0">{subItem.icon}</span>
                        <span className="truncate">{subItem.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* User Menu */}
        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {session?.user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            {sidebarExpanded && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 truncate">Administrador</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`p-1.5 rounded-lg transition-colors ${
                sidebarExpanded ? 'hover:bg-gray-100' : 'hover:bg-gray-100'
              }`}
              title="Sair"
            >
              {isLoggingOut ? (
                <span className="animate-spin text-lg">⏳</span>
              ) : (
                <span className="text-lg">🚪</span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ${sidebarExpanded ? 'md:ml-64' : 'md:ml-16'}`}>
        {/* Header */}
        <header className="h-16 bg-white/95 backdrop-blur-lg border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <span className="text-xl">☰</span>
            </button>
            
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm">
              <span className="font-medium text-gray-500">Admin</span>
              {pathname !== '/admin' && (
                <>
                  <span className="text-gray-400">/</span>
                  <span className="font-medium text-gray-900">
                    {navigation.find(item => pathname.startsWith(item.href))?.name || 'Página'}
                  </span>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="text-xl">🔔</span>
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </button>
            
            {/* Quick Settings */}
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="text-xl">⚙️</span>
            </button>
            
            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm disabled:opacity-50"
            >
              {isLoggingOut ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Saindo...</span>
                </>
              ) : (
                <>
                  <span>🚪</span>
                  <span className="hidden sm:inline">Sair</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
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