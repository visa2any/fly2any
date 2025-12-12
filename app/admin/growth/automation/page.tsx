/**
 * Automation Control Center - Fly2Any Growth OS
 *
 * Monitor and control all automated growth tasks
 */
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  CpuChipIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  BoltIcon
} from '@heroicons/react/24/outline'

interface AutomationTask {
  id: string
  name: string
  schedule: 'hourly' | 'daily' | 'weekly' | 'monthly'
  enabled: boolean
  lastRun?: string
  nextRun?: string
  status: 'idle' | 'running' | 'success' | 'error'
  error?: string
  lastDuration?: number
}

interface AutomationStatus {
  totalTasks: number
  enabledTasks: number
  runningTasks: number
  errorTasks: number
}

const mockTasks: AutomationTask[] = [
  {
    id: 'content_generation',
    name: 'Daily Content Generation',
    schedule: 'daily',
    enabled: true,
    lastRun: new Date(Date.now() - 8 * 60 * 60000).toISOString(),
    status: 'success',
    lastDuration: 45200
  },
  {
    id: 'social_distribution',
    name: 'Social Media Distribution',
    schedule: 'hourly',
    enabled: true,
    lastRun: new Date(Date.now() - 35 * 60000).toISOString(),
    status: 'success',
    lastDuration: 12500
  },
  {
    id: 'price_alerts',
    name: 'Price Alert Processing',
    schedule: 'hourly',
    enabled: true,
    lastRun: new Date(Date.now() - 40 * 60000).toISOString(),
    status: 'success',
    lastDuration: 8200
  },
  {
    id: 'seo_audit',
    name: 'SEO Health Audit',
    schedule: 'daily',
    enabled: true,
    lastRun: new Date(Date.now() - 12 * 60 * 60000).toISOString(),
    status: 'success',
    lastDuration: 32100
  },
  {
    id: 'competitor_monitor',
    name: 'Competitor Monitoring',
    schedule: 'daily',
    enabled: true,
    lastRun: new Date(Date.now() - 14 * 60 * 60000).toISOString(),
    status: 'error',
    error: 'Rate limit exceeded',
    lastDuration: 5400
  },
  {
    id: 'weekly_report',
    name: 'Weekly Performance Report',
    schedule: 'weekly',
    enabled: true,
    lastRun: new Date(Date.now() - 3 * 24 * 60 * 60000).toISOString(),
    status: 'success',
    lastDuration: 28900
  },
  {
    id: 'sitemap_ping',
    name: 'Sitemap Ping to Search Engines',
    schedule: 'daily',
    enabled: true,
    lastRun: new Date(Date.now() - 6 * 60 * 60000).toISOString(),
    status: 'success',
    lastDuration: 2100
  },
  {
    id: 'cache_warmup',
    name: 'Cache Warmup for Popular Routes',
    schedule: 'hourly',
    enabled: false,
    lastRun: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    status: 'idle',
    lastDuration: 15600
  }
]

const mockStatus: AutomationStatus = {
  totalTasks: 8,
  enabledTasks: 7,
  runningTasks: 0,
  errorTasks: 1
}

export default function AutomationDashboard() {
  const [tasks, setTasks] = useState<AutomationTask[]>(mockTasks)
  const [status, setStatus] = useState<AutomationStatus>(mockStatus)
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const getStatusIcon = (taskStatus: string) => {
    switch (taskStatus) {
      case 'running':
        return <ArrowPathIcon className="w-5 h-5 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />
    }
  }

  const getScheduleBadgeColor = (schedule: string) => {
    switch (schedule) {
      case 'hourly':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      case 'daily':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      case 'weekly':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
      case 'monthly':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatTimeAgo = (timestamp?: string) => {
    if (!timestamp) return 'Never'
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return '-'
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, enabled: !t.enabled } : t
    ))
    setStatus(prev => ({
      ...prev,
      enabledTasks: tasks.filter(t => t.id === taskId ? !t.enabled : t.enabled).length
    }))
  }

  const runTask = async (taskId: string) => {
    setRunningTaskId(taskId)
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, status: 'running' as const } : t
    ))

    // Simulate task execution
    setTimeout(() => {
      setTasks(prev => prev.map(t =>
        t.id === taskId ? {
          ...t,
          status: 'success' as const,
          lastRun: new Date().toISOString(),
          lastDuration: Math.floor(Math.random() * 30000) + 5000
        } : t
      ))
      setRunningTaskId(null)
    }, 3000)
  }

  const runAllTasks = async () => {
    setRefreshing(true)
    // Would trigger all enabled tasks
    setTimeout(() => setRefreshing(false), 5000)
  }

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
              <span>Automation</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <CpuChipIcon className="w-8 h-8 text-cyan-600" />
              Automation Control Center
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Monitor and control all automated growth tasks
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={runAllTasks}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
            >
              <BoltIcon className={`w-5 h-5 ${refreshing ? 'animate-pulse' : ''}`} />
              {refreshing ? 'Running All...' : 'Run All Now'}
            </button>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <CpuChipIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{status.totalTasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Enabled</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{status.enabledTasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <ArrowPathIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Running</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {runningTaskId ? 1 : status.runningTasks}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Errors</p>
                <p className="text-2xl font-bold text-red-600">{status.errorTasks}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Cog6ToothIcon className="w-5 h-5" />
              Automation Tasks
            </h2>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map(task => (
              <div key={task.id} className={`p-6 ${!task.enabled ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {/* Toggle */}
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors mt-1 ${
                        task.enabled ? 'bg-cyan-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        task.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>

                    {/* Task Info */}
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{task.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getScheduleBadgeColor(task.schedule)}`}>
                          {task.schedule}
                        </span>
                        {getStatusIcon(task.status)}
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>Last run: {formatTimeAgo(task.lastRun)}</span>
                        <span>Duration: {formatDuration(task.lastDuration)}</span>
                      </div>

                      {task.error && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                          Error: {task.error}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Run Button */}
                  <button
                    onClick={() => runTask(task.id)}
                    disabled={!task.enabled || runningTaskId === task.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      !task.enabled || runningTaskId === task.id
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/30'
                    }`}
                  >
                    {runningTaskId === task.id ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <PlayIcon className="w-4 h-4" />
                        Run Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/growth/alerts"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">View Alerts</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Monitor automation alerts and errors
            </p>
          </Link>

          <Link
            href="/admin/growth/reports"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Weekly Reports</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View and configure automated reports
            </p>
          </Link>

          <Link
            href="/admin/growth/content"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Content Factory</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage AI content generation
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
