/**
 * Weekly Reports Dashboard - Fly2Any Growth OS
 *
 * View and configure automated weekly reports
 */
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  DocumentChartBarIcon,
  CalendarIcon,
  EnvelopeIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
  PlayIcon,
  Cog6ToothIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface ReportData {
  week: number
  year: number
  dateRange: string
  revenue: number
  revenueChange: number
  bookings: number
  bookingsChange: number
  visitors: number
  visitorsChange: number
  conversionRate: number
  status: 'sent' | 'pending' | 'failed'
  sentAt?: string
  recipients: number
}

interface ReportConfig {
  enabled: boolean
  sendDay: string
  sendTime: string
  recipients: string[]
  includeCharts: boolean
}

const mockReports: ReportData[] = [
  {
    week: 50,
    year: 2025,
    dateRange: 'Dec 9 - Dec 15',
    revenue: 125800,
    revenueChange: 12.5,
    bookings: 259,
    bookingsChange: 8.3,
    visitors: 45200,
    visitorsChange: 15.2,
    conversionRate: 2.1,
    status: 'pending',
    recipients: 3
  },
  {
    week: 49,
    year: 2025,
    dateRange: 'Dec 2 - Dec 8',
    revenue: 111800,
    revenueChange: 5.2,
    bookings: 239,
    bookingsChange: 3.1,
    visitors: 39200,
    visitorsChange: 8.7,
    conversionRate: 1.9,
    status: 'sent',
    sentAt: '2025-12-09T09:00:00Z',
    recipients: 3
  },
  {
    week: 48,
    year: 2025,
    dateRange: 'Nov 25 - Dec 1',
    revenue: 106300,
    revenueChange: -2.1,
    bookings: 232,
    bookingsChange: -1.8,
    visitors: 36100,
    visitorsChange: -5.3,
    conversionRate: 1.8,
    status: 'sent',
    sentAt: '2025-12-02T09:00:00Z',
    recipients: 3
  },
  {
    week: 47,
    year: 2025,
    dateRange: 'Nov 18 - Nov 24',
    revenue: 108600,
    revenueChange: 18.4,
    bookings: 236,
    bookingsChange: 15.2,
    visitors: 38100,
    visitorsChange: 12.8,
    conversionRate: 1.9,
    status: 'sent',
    sentAt: '2025-11-25T09:00:00Z',
    recipients: 2
  }
]

const mockConfig: ReportConfig = {
  enabled: true,
  sendDay: 'Monday',
  sendTime: '09:00',
  recipients: ['admin@fly2any.com', 'growth@fly2any.com', 'ceo@fly2any.com'],
  includeCharts: true
}

export default function ReportsDashboard() {
  const [reports, setReports] = useState<ReportData[]>(mockReports)
  const [config, setConfig] = useState<ReportConfig>(mockConfig)
  const [showConfig, setShowConfig] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)

  const formatCurrency = (n: number) => `$${n.toLocaleString()}`
  const formatChange = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`

  const generateReport = async () => {
    setGenerating(true)
    // Simulate report generation
    setTimeout(() => {
      setGenerating(false)
      // Would trigger actual report generation API
    }, 2000)
  }

  const sendTestReport = async () => {
    // Would send a test report to the first recipient
    alert('Test report sent to ' + config.recipients[0])
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
              <span>Reports</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <DocumentChartBarIcon className="w-8 h-8 text-emerald-600" />
              Weekly Reports
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Automated weekly performance reports
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showConfig
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-50'
              }`}
            >
              <Cog6ToothIcon className="w-5 h-5" />
              Configure
            </button>
            <button
              onClick={generateReport}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              <PlayIcon className={`w-5 h-5 ${generating ? 'animate-pulse' : ''}`} />
              {generating ? 'Generating...' : 'Generate Now'}
            </button>
          </div>
        </div>

        {/* Schedule Info */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Report Schedule</h2>
                <p className="text-emerald-100">
                  {config.enabled ? (
                    <>Every {config.sendDay} at {config.sendTime} UTC</>
                  ) : (
                    <>Reports are currently disabled</>
                  )}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <EnvelopeIcon className="w-5 h-5" />
                <span>{config.recipients.length} recipients</span>
              </div>
              <div className={`mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                config.enabled ? 'bg-white/20' : 'bg-red-500/50'
              }`}>
                {config.enabled ? 'Active' : 'Disabled'}
              </div>
            </div>
          </div>
        </div>

        {showConfig ? (
          /* Configuration Panel */
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Cog6ToothIcon className="w-5 h-5" />
              Report Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <button
                  onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    config.enabled ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
                <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                  {config.enabled ? 'Reports enabled' : 'Reports disabled'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Send Day
                </label>
                <select
                  value={config.sendDay}
                  onChange={(e) => setConfig(prev => ({ ...prev, sendDay: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="Sunday">Sunday</option>
                  <option value="Monday">Monday</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Send Time (UTC)
                </label>
                <input
                  type="time"
                  value={config.sendTime}
                  onChange={(e) => setConfig(prev => ({ ...prev, sendTime: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Include Charts
                </label>
                <button
                  onClick={() => setConfig(prev => ({ ...prev, includeCharts: !prev.includeCharts }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    config.includeCharts ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.includeCharts ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recipients
                </label>
                <div className="space-y-2">
                  {config.recipients.map((email, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          const newRecipients = [...config.recipients]
                          newRecipients[idx] = e.target.value
                          setConfig(prev => ({ ...prev, recipients: newRecipients }))
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={() => {
                          setConfig(prev => ({
                            ...prev,
                            recipients: prev.recipients.filter((_, i) => i !== idx)
                          }))
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, recipients: [...prev.recipients, ''] }))}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add recipient
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={sendTestReport}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Send Test Report
              </button>
              <button
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Save Configuration
              </button>
            </div>
          </div>
        ) : null}

        {/* Report History */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Report History
            </h2>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {reports.map(report => (
              <div key={`${report.year}-${report.week}`} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Week {report.week}, {report.year}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        report.status === 'sent'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : report.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {report.dateRange}
                      {report.sentAt && (
                        <> · Sent {new Date(report.sentAt).toLocaleDateString()} to {report.recipients} recipients</>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                      <ArrowDownTrayIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Metrics */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Revenue</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(report.revenue)}</p>
                    <div className={`flex items-center gap-1 text-sm ${
                      report.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {report.revenueChange >= 0 ? (
                        <ArrowTrendingUpIcon className="w-4 h-4" />
                      ) : (
                        <ArrowTrendingDownIcon className="w-4 h-4" />
                      )}
                      {formatChange(report.revenueChange)}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Bookings</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{report.bookings}</p>
                    <div className={`flex items-center gap-1 text-sm ${
                      report.bookingsChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {report.bookingsChange >= 0 ? (
                        <ArrowTrendingUpIcon className="w-4 h-4" />
                      ) : (
                        <ArrowTrendingDownIcon className="w-4 h-4" />
                      )}
                      {formatChange(report.bookingsChange)}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Visitors</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{report.visitors.toLocaleString()}</p>
                    <div className={`flex items-center gap-1 text-sm ${
                      report.visitorsChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {report.visitorsChange >= 0 ? (
                        <ArrowTrendingUpIcon className="w-4 h-4" />
                      ) : (
                        <ArrowTrendingDownIcon className="w-4 h-4" />
                      )}
                      {formatChange(report.visitorsChange)}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Conversion</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{report.conversionRate}%</p>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <CheckCircleIcon className="w-4 h-4" />
                      rate
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
