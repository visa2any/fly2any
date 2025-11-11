'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  Shield,
  Briefcase,
  MapPin,
  Mail,
  Activity,
  Zap,
  Database,
  Webhook,
  Brain,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface AdminSidebarProps {
  role: string
}

interface NavItem {
  label: string
  href: string
  icon: any
  roles?: string[] // If specified, only these roles can see it
}

export default function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('admin_sidebar_collapsed')
    if (saved) {
      setIsCollapsed(saved === 'true')
    }
  }, [])

  // Save collapsed state to localStorage when it changes
  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('admin_sidebar_collapsed', String(newState))
  }

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard
    },
    {
      label: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3
    },
    {
      label: 'AI Analytics',
      href: '/admin/ai-analytics',
      icon: Brain
    },
    {
      label: 'Users',
      href: '/admin/users',
      icon: Users,
      roles: ['super_admin', 'admin']
    },
    {
      label: 'Bookings',
      href: '/admin/bookings',
      icon: Briefcase
    },
    {
      label: 'Performance',
      href: '/admin/performance',
      icon: TrendingUp
    },
    {
      label: 'Monitoring',
      href: '/admin/monitoring',
      icon: Activity
    },
    {
      label: 'Webhooks',
      href: '/admin/webhooks',
      icon: Webhook,
      roles: ['super_admin', 'admin']
    },
    {
      label: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      roles: ['super_admin', 'admin']
    }
  ]

  // Filter nav items based on role
  const visibleItems = navItems.filter(item => {
    if (!item.roles) return true
    return item.roles.includes(role)
  })

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-60'} bg-white border-r border-gray-200 min-h-[calc(100vh-3.5rem)] transition-all duration-300 ease-in-out relative`}>
      {/* Toggle button */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-3 top-6 z-10 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        )}
      </button>

      <nav className={`${isCollapsed ? 'p-2' : 'p-4'} space-y-1`}>
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center ${isCollapsed ? 'justify-center px-2 py-3' : 'space-x-3 px-4 py-2.5'} rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          )
        })}

        {/* Section divider */}
        <div className="pt-6 mt-6 border-t border-gray-200">
          {!isCollapsed && (
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              CMS
            </p>
          )}
          <Link
            href="/admin/cms/deals"
            title={isCollapsed ? 'Travel Deals' : undefined}
            className={`flex items-center ${isCollapsed ? 'justify-center px-2 py-3' : 'space-x-3 px-4 py-2.5'} rounded-lg transition-all ${
              pathname?.startsWith('/admin/cms/deals')
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Zap className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm">Travel Deals</span>}
          </Link>
          <Link
            href="/admin/cms/destinations"
            title={isCollapsed ? 'Destinations' : undefined}
            className={`flex items-center ${isCollapsed ? 'justify-center px-2 py-3' : 'space-x-3 px-4 py-2.5'} rounded-lg transition-all ${
              pathname?.startsWith('/admin/cms/destinations')
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <MapPin className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm">Destinations</span>}
          </Link>
          <Link
            href="/admin/cms/emails"
            title={isCollapsed ? 'Email Templates' : undefined}
            className={`flex items-center ${isCollapsed ? 'justify-center px-2 py-3' : 'space-x-3 px-4 py-2.5'} rounded-lg transition-all ${
              pathname?.startsWith('/admin/cms/emails')
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Mail className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm">Email Templates</span>}
          </Link>
        </div>

        {/* Admin info */}
        {role === 'super_admin' && (
          <div className={`mt-6 ${isCollapsed ? 'p-2' : 'p-4'} bg-purple-50 rounded-lg border border-purple-200 transition-all`}>
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2 mb-2'}`}>
              <Shield className="h-4 w-4 text-purple-600 flex-shrink-0" title={isCollapsed ? 'SUPER ADMIN - Full system access' : undefined} />
              {!isCollapsed && <span className="text-xs font-semibold text-purple-600">SUPER ADMIN</span>}
            </div>
            {!isCollapsed && (
              <p className="text-xs text-purple-700">
                Full system access with all permissions
              </p>
            )}
          </div>
        )}
      </nav>
    </aside>
  )
}
