'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
    badge: '12'
  },
  {
    name: 'Clientes',
    href: '/admin/customers',
    icon: '👥'
  },
  {
    name: 'Campanhas',
    href: '/admin/campaigns',
    icon: '🚀'
  },
  {
    name: 'Suporte',
    href: '/admin/support',
    icon: '💬',
    badge: '3'
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: '📈'
  },
  {
    name: 'Configurações',
    href: '/admin/settings',
    icon: '⚙️'
  }
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

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
          <div className="admin-logo">F</div>
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
            <div className="admin-user-avatar">A</div>
            <div className="admin-user-info">
              <div className="admin-user-name">Admin</div>
              <div className="admin-user-role">Administrador</div>
            </div>
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
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-0 font-semibold">
              ✨ Novo Lead
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