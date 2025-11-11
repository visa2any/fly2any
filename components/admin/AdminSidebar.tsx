'use client'

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
  TrendingUp
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
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}

        {/* Section divider */}
        <div className="pt-6 mt-6 border-t border-gray-200">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            CMS
          </p>
          <Link
            href="/admin/cms/deals"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              pathname?.startsWith('/admin/cms/deals')
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Zap className="h-5 w-5" />
            <span>Travel Deals</span>
          </Link>
          <Link
            href="/admin/cms/destinations"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              pathname?.startsWith('/admin/cms/destinations')
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <MapPin className="h-5 w-5" />
            <span>Destinations</span>
          </Link>
          <Link
            href="/admin/cms/emails"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              pathname?.startsWith('/admin/cms/emails')
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Mail className="h-5 w-5" />
            <span>Email Templates</span>
          </Link>
        </div>

        {/* Admin info */}
        {role === 'super_admin' && (
          <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-semibold text-purple-600">SUPER ADMIN</span>
            </div>
            <p className="text-xs text-purple-700">
              Full system access with all permissions
            </p>
          </div>
        )}
      </nav>
    </aside>
  )
}
