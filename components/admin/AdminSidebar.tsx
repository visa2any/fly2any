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
  Webhook,
  Brain,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Award,
  Gift,
  DollarSign,
  Search,
  CreditCard,
  PiggyBank,
  GitBranch,
  Ticket,
  Star,
  Bell,
  Plane,
  Smartphone,
  ShieldCheck,
  Sparkles,
  Target,
  Rocket,
  HeartPulse,
  MailPlus,
} from 'lucide-react'

interface AdminSidebarProps {
  role: string
}

interface NavSection {
  title: string
  items: NavItem[]
  defaultOpen?: boolean
}

interface NavItem {
  label: string
  href: string
  icon: any
  roles?: string[]
}

export default function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    main: true,
    growth: true,
    business: false,
    system: false,
    cms: false,
  })

  useEffect(() => {
    const saved = localStorage.getItem('admin_sidebar_collapsed')
    if (saved) setIsCollapsed(saved === 'true')
    const sections = localStorage.getItem('admin_sidebar_sections')
    if (sections) setOpenSections(JSON.parse(sections))
  }, [])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('admin_sidebar_collapsed', String(newState))
  }

  const toggleSection = (key: string) => {
    const newState = { ...openSections, [key]: !openSections[key] }
    setOpenSections(newState)
    localStorage.setItem('admin_sidebar_sections', JSON.stringify(newState))
  }

  // Organized sections
  const sections: NavSection[] = [
    {
      title: 'Main',
      defaultOpen: true,
      items: [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { label: 'Bookings', href: '/admin/bookings', icon: Briefcase },
        { label: 'Users', href: '/admin/users', icon: Users, roles: ['super_admin', 'admin'] },
        { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      ]
    },
    {
      title: 'Growth & AI',
      defaultOpen: true,
      items: [
        { label: 'AI Hub', href: '/admin/ai-hub', icon: Brain, roles: ['super_admin', 'admin'] },
        { label: 'AI Growth Brain', href: '/admin/growth', icon: Rocket, roles: ['super_admin', 'admin'] },
        { label: 'AI SEO Engine', href: '/admin/ai-seo', icon: Sparkles, roles: ['super_admin', 'admin'] },
        { label: 'AI Analytics', href: '/admin/ai-analytics', icon: Brain },
        { label: 'Retention', href: '/admin/retention', icon: HeartPulse, roles: ['super_admin', 'admin'] },
        { label: 'Email Marketing', href: '/admin/email-marketing', icon: MailPlus, roles: ['super_admin', 'admin'] },
        { label: 'Campaigns', href: '/admin/campaigns', icon: Target, roles: ['super_admin', 'admin'] },
      ]
    },
    {
      title: 'Business',
      items: [
        { label: 'Agents', href: '/admin/agents', icon: Briefcase, roles: ['super_admin', 'admin'] },
        { label: 'Affiliates', href: '/admin/affiliates', icon: Award, roles: ['super_admin', 'admin'] },
        { label: 'Payouts', href: '/admin/payouts', icon: DollarSign, roles: ['super_admin', 'admin'] },
        { label: 'Referrals', href: '/admin/referrals', icon: Gift, roles: ['super_admin', 'admin'] },
        { label: 'Vouchers', href: '/admin/vouchers', icon: Ticket, roles: ['super_admin', 'admin'] },
        { label: 'Rewards', href: '/admin/rewards', icon: Star, roles: ['super_admin', 'admin'] },
        { label: 'Authorizations', href: '/admin/authorizations', icon: CreditCard },
      ]
    },
    {
      title: 'System',
      items: [
        { label: 'SEO Monitor', href: '/admin/seo-monitoring', icon: Search },
        { label: 'Performance', href: '/admin/performance', icon: TrendingUp },
        { label: 'Monitoring', href: '/admin/monitoring', icon: Activity },
        { label: 'Aviation', href: '/admin/aviation', icon: Plane, roles: ['super_admin', 'admin'] },
        { label: 'Routing', href: '/admin/routing', icon: GitBranch, roles: ['super_admin', 'admin'] },
        { label: 'Webhooks', href: '/admin/webhooks', icon: Webhook, roles: ['super_admin', 'admin'] },
        { label: 'PWA', href: '/admin/pwa', icon: Smartphone, roles: ['super_admin', 'admin'] },
        { label: 'Notifications', href: '/admin/notifications', icon: Bell, roles: ['super_admin', 'admin'] },
        { label: 'Cost Savings', href: '/admin/cost-savings', icon: PiggyBank, roles: ['super_admin', 'admin'] },
        { label: 'Security', href: '/admin/security', icon: ShieldCheck, roles: ['super_admin'] },
        { label: 'Settings', href: '/admin/settings', icon: Settings, roles: ['super_admin', 'admin'] },
      ]
    },
    {
      title: 'CMS',
      items: [
        { label: 'Deals', href: '/admin/cms/deals', icon: Zap },
        { label: 'Destinations', href: '/admin/cms/destinations', icon: MapPin },
        { label: 'Emails', href: '/admin/cms/emails', icon: Mail },
      ]
    },
  ]

  const filterItems = (items: NavItem[]) =>
    items.filter(item => !item.roles || item.roles.includes(role))

  const NavLink = ({ item }: { item: NavItem }) => {
    const Icon = item.icon
    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
    return (
      <Link
        href={item.href}
        title={isCollapsed ? item.label : undefined}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all ${
          isActive
            ? 'bg-gray-900 text-white font-medium'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        {!isCollapsed && <span>{item.label}</span>}
      </Link>
    )
  }

  return (
    <aside className={`${isCollapsed ? 'w-14' : 'w-56'} bg-white border-r border-gray-100 min-h-[calc(100vh-3.5rem)] transition-all duration-200 relative overflow-y-auto`}>
      {/* Toggle */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-3 top-4 z-10 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:shadow transition"
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      <nav className="p-2 space-y-1">
        {sections.map((section, idx) => {
          const items = filterItems(section.items)
          if (items.length === 0) return null
          const sectionKey = section.title.toLowerCase().replace(/\s+/g, '')
          const isOpen = openSections[sectionKey] ?? section.defaultOpen ?? false

          return (
            <div key={idx} className={idx > 0 ? 'pt-3 mt-3 border-t border-gray-100' : ''}>
              {!isCollapsed && (
                <button
                  onClick={() => toggleSection(sectionKey)}
                  className="flex items-center justify-between w-full px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600"
                >
                  {section.title}
                  <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                </button>
              )}
              {(isOpen || isCollapsed) && (
                <div className="space-y-0.5 mt-1">
                  {items.map(item => <NavLink key={item.href} item={item} />)}
                </div>
              )}
            </div>
          )
        })}

        {/* Super Admin Badge */}
        {role === 'super_admin' && !isCollapsed && (
          <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-600" />
              <span className="text-[11px] font-semibold text-purple-700">SUPER ADMIN</span>
            </div>
          </div>
        )}
      </nav>
    </aside>
  )
}
