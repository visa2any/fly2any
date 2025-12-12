/**
 * Real-time Alerts Dashboard - Fly2Any Growth OS
 *
 * Monitor and manage business alerts
 */
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BellAlertIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  FunnelIcon,
  ArrowPathIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

interface Alert {
  id: string
  title: string
  message: string
  severity: 'critical' | 'warning' | 'info' | 'success'
  category: string
  timestamp: string
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: string
}

interface AlertRule {
  id: string
  name: string
  description: string
  category: string
  enabled: boolean
  severity: 'critical' | 'warning' | 'info' | 'success'
  cooldownMinutes: number
  channels: string[]
}

interface AlertStats {
  total: number
  unacknowledged: number
  bySeverity: Record<string, number>
  byCategory: Record<string, number>
  last24Hours: number
}

// Mock data
const mockAlerts: Alert[] = [
  {
    id: 'alert_1',
    title: 'Revenue Spike Detected',
    message: 'Hourly revenue exceeded $12,500 - 25% above normal',
    severity: 'success',
    category: 'revenue',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    acknowledged: false
  },
  {
    id: 'alert_2',
    title: 'Cart Abandonment High',
    message: 'Cart abandonment rate reached 82% in the last hour',
    severity: 'warning',
    category: 'conversion',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    acknowledged: false
  },
  {
    id: 'alert_3',
    title: 'API Response Time Elevated',
    message: 'Average API response time is 2.3s (threshold: 2s)',
    severity: 'warning',
    category: 'system',
    timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    acknowledged: true,
    acknowledgedBy: 'admin@fly2any.com',
    acknowledgedAt: new Date(Date.now() - 90 * 60000).toISOString()
  },
  {
    id: 'alert_4',
    title: 'New Booking Milestone',
    message: 'Reached 10,000 total bookings!',
    severity: 'success',
    category: 'revenue',
    timestamp: new Date(Date.now() - 4 * 60 * 60000).toISOString(),
    acknowledged: true,
    acknowledgedBy: 'admin@fly2any.com'
  },
  {
    id: 'alert_5',
    title: 'Traffic Surge',
    message: 'Traffic increased 150% vs normal - possible viral content',
    severity: 'info',
    category: 'traffic',
    timestamp: new Date(Date.now() - 6 * 60 * 60000).toISOString(),
    acknowledged: true
  }
]

const mockRules: AlertRule[] = [
  {
    id: 'rule_1',
    name: 'Revenue Spike',
    description: 'Alert when hourly revenue exceeds $10,000',
    category: 'revenue',
    enabled: true,
    severity: 'success',
    cooldownMinutes: 60,
    channels: ['dashboard', 'slack']
  },
  {
    id: 'rule_2',
    name: 'Revenue Drop',
    description: 'Alert when revenue drops 50% compared to previous period',
    category: 'revenue',
    enabled: true,
    severity: 'critical',
    cooldownMinutes: 30,
    channels: ['dashboard', 'email', 'slack']
  },
  {
    id: 'rule_3',
    name: 'Cart Abandonment Spike',
    description: 'Alert when cart abandonment exceeds 80%',
    category: 'conversion',
    enabled: true,
    severity: 'warning',
    cooldownMinutes: 60,
    channels: ['dashboard']
  },
  {
    id: 'rule_4',
    name: 'API Error Rate High',
    description: 'Alert when API error rate exceeds 5%',
    category: 'system',
    enabled: true,
    severity: 'critical',
    cooldownMinutes: 15,
    channels: ['dashboard', 'slack', 'email']
  },
  {
    id: 'rule_5',
    name: 'Core Web Vitals Degradation',
    description: 'Alert when LCP exceeds 4 seconds',
    category: 'seo',
    enabled: false,
    severity: 'warning',
    cooldownMinutes: 120,
    channels: ['dashboard']
  }
]

const mockStats: AlertStats = {
  total: 247,
  unacknowledged: 2,
  bySeverity: { critical: 12, warning: 45, info: 120, success: 70 },
  byCategory: { revenue: 85, traffic: 42, system: 35, seo: 28, conversion: 42, content: 15 },
  last24Hours: 18
}

export default function AlertsDashboard() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts)
  const [rules, setRules] = useState<AlertRule[]>(mockRules)
  const [stats, setStats] = useState<AlertStats>(mockStats)
  const [filter, setFilter] = useState<string>('all')
  const [showRules, setShowRules] = useState(false)
  const [loading, setLoading] = useState(false)

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      default:
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 border-red-300 dark:bg-red-900/20 dark:border-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-800'
      case 'success':
        return 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-800'
      default:
        return 'bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-800'
    }
  }

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      revenue: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      traffic: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      system: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      seo: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      conversion: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      content: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
      security: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    }
    return colors[category] || colors.system
  }

  const formatTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a =>
      a.id === alertId
        ? { ...a, acknowledged: true, acknowledgedBy: 'admin@fly2any.com', acknowledgedAt: new Date().toISOString() }
        : a
    ))
    setStats(prev => ({ ...prev, unacknowledged: prev.unacknowledged - 1 }))
  }

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(r =>
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    ))
  }

  const filteredAlerts = filter === 'all'
    ? alerts
    : filter === 'unacknowledged'
      ? alerts.filter(a => !a.acknowledged)
      : alerts.filter(a => a.severity === filter)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Link href="/admin" className="hover:text-blue-600">Admin</Link>
              <ChevronRightIcon className="w-4 h-4" />
              <Link href="/admin/growth" className="hover:text-blue-600">Growth</Link>
              <ChevronRightIcon className="w-4 h-4" />
              <span>Alerts</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <BellAlertIcon className="w-8 h-8 text-red-600" />
              Real-time Alerts
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Monitor and respond to important business events
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowRules(!showRules)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showRules
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-50'
              }`}
            >
              <Cog6ToothIcon className="w-5 h-5" />
              {showRules ? 'View Alerts' : 'Configure Rules'}
            </button>
            <button
              onClick={() => setLoading(true)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Alerts</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Unacknowledged</p>
            <p className="text-2xl font-bold text-red-600">{stats.unacknowledged}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Critical (24h)</p>
            <p className="text-2xl font-bold text-red-600">{stats.bySeverity.critical}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Warnings (24h)</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.bySeverity.warning}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Last 24 Hours</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.last24Hours}</p>
          </div>
        </div>

        {showRules ? (
          /* Alert Rules Configuration */
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Cog6ToothIcon className="w-5 h-5" />
                Alert Rules Configuration
              </h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {rules.map(rule => (
                <div key={rule.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleRule(rule.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          rule.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          rule.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{rule.name}</h3>
                          {getSeverityIcon(rule.severity)}
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryBadgeColor(rule.category)}`}>
                            {rule.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rule.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Cooldown: {rule.cooldownMinutes}m</span>
                          <span>Channels: {rule.channels.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Alerts List */
          <>
            {/* Filter */}
            <div className="flex items-center gap-2 mb-6">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Alerts</option>
                <option value="unacknowledged">Unacknowledged</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
              </select>
            </div>

            <div className="space-y-4">
              {filteredAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`rounded-xl border p-6 ${getSeverityColor(alert.severity)} ${
                    alert.acknowledged ? 'opacity-75' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {getSeverityIcon(alert.severity)}
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{alert.title}</h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryBadgeColor(alert.category)}`}>
                            {alert.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.message}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{formatTimeAgo(alert.timestamp)}</span>
                          {alert.acknowledged && (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckIcon className="w-3 h-3" />
                              Acknowledged by {alert.acknowledgedBy}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {!alert.acknowledged && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {filteredAlerts.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                  <BellAlertIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No alerts match your filter</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
