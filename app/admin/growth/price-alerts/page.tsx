'use client'

import { useState, useEffect } from 'react'
import { Bell, TrendingDown, Users, Zap, Filter, Search, RefreshCw, Play, Pause, Trash2, Mail, MessageSquare, ChevronDown, CheckCircle2, AlertTriangle, Clock } from 'lucide-react'

interface PriceAlert {
  id: string
  userId: string
  userEmail: string
  route: string
  origin: string
  destination: string
  targetPrice: number
  currentPrice: number
  status: 'active' | 'triggered' | 'expired' | 'paused'
  notificationChannels: string[]
  createdAt: string
  triggeredAt?: string
}

interface AlertStats {
  total: number
  active: number
  triggered: number
  expired: number
  avgSavings: number
  conversionRate: number
}

export default function PriceAlertsAdmin() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [stats, setStats] = useState<AlertStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'triggered' | 'expired'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/price-alerts')
      if (res.ok) {
        const data = await res.json()
        setAlerts(data.alerts || [])
        setStats(data.stats || { total: 0, active: 0, triggered: 0, expired: 0, avgSavings: 0, conversionRate: 0 })
      }
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const triggerPriceCheck = async () => {
    await fetch('/api/cron/price-alerts', { method: 'POST' })
    fetchData()
  }

  const filteredAlerts = alerts.filter(a => {
    if (filter !== 'all' && a.status !== filter) return false
    if (searchQuery && !a.route.toLowerCase().includes(searchQuery.toLowerCase()) && !a.userEmail.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const statusColors = {
    active: 'bg-green-100 text-green-700 border-green-200',
    triggered: 'bg-blue-100 text-blue-700 border-blue-200',
    expired: 'bg-gray-100 text-gray-600 border-gray-200',
    paused: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
    </div>
  )

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg">
              <Bell className="h-7 w-7 text-white" />
            </div>
            Price Alerts Management
          </h1>
          <p className="text-gray-500 mt-1">Monitor and manage customer price alerts</p>
        </div>
        <div className="flex gap-3">
          <button onClick={triggerPriceCheck} className="px-4 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all flex items-center gap-2 font-medium shadow-sm">
            <Zap className="h-4 w-4" /> Run Price Check
          </button>
          <button onClick={fetchData} className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">
            <RefreshCw className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total Alerts', value: stats.total, icon: Bell, color: 'blue' },
            { label: 'Active', value: stats.active, icon: CheckCircle2, color: 'green' },
            { label: 'Triggered', value: stats.triggered, icon: Zap, color: 'orange' },
            { label: 'Expired', value: stats.expired, icon: Clock, color: 'gray' },
            { label: 'Avg Savings', value: `$${stats.avgSavings}`, icon: TrendingDown, color: 'purple' },
            { label: 'Conversion', value: `${stats.conversionRate}%`, icon: Users, color: 'cyan' }
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`bg-gradient-to-br from-${color}-50 to-${color}-100/50 border border-${color}-200 rounded-xl p-4`}>
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-5 w-5 text-${color}-600`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-600">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by route or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'triggered', 'expired'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${filter === f ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Route', 'User', 'Target', 'Current', 'Savings', 'Status', 'Channels', 'Created', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAlerts.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-500">No price alerts found</td></tr>
              ) : filteredAlerts.map(alert => {
                const savings = alert.targetPrice - alert.currentPrice
                const savingsPercent = ((savings / alert.targetPrice) * 100).toFixed(0)
                return (
                  <tr key={alert.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{alert.origin} → {alert.destination}</div>
                      <div className="text-xs text-gray-500">{alert.route}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 truncate max-w-[150px]">{alert.userEmail}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">${alert.targetPrice}</td>
                    <td className="px-4 py-3">
                      <span className={alert.currentPrice <= alert.targetPrice ? 'text-green-600 font-semibold' : 'text-gray-900'}>
                        ${alert.currentPrice}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {savings > 0 ? (
                        <span className="text-green-600 font-medium">-${savings} ({savingsPercent}%)</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[alert.status]}`}>
                        {alert.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {alert.notificationChannels.includes('email') && <Mail className="h-4 w-4 text-gray-400" />}
                        {alert.notificationChannels.includes('push') && <Bell className="h-4 w-4 text-gray-400" />}
                        {alert.notificationChannels.includes('sms') && <MessageSquare className="h-4 w-4 text-gray-400" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(alert.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                          {alert.status === 'active' ? <Pause className="h-4 w-4 text-gray-600" /> : <Play className="h-4 w-4 text-gray-600" />}
                        </button>
                        <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
