/**
 * 📈 EMAIL METRICS WIDGET
 * Quick email performance metrics widget for admin dashboard
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  EnvelopeIcon,
  EyeIcon,
  CursorArrowRippleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface EmailMetrics {
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
}

export default function EmailMetricsWidget() {
  const [metrics, setMetrics] = useState<EmailMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  const fetchMetrics = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/email-marketing/v2?action=metrics&timeRange=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Failed to fetch email metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [timeRange]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case '24h': return 'Last 24 Hours';
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      default: return 'Last 7 Days';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white">
              📈
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Email Metrics</h3>
              <p className="text-sm text-gray-600">Performance overview</p>
            </div>
          </div>
          
          <select
            value={timeRange}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTimeRange(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="24h">24h</option>
            <option value="7d">7d</option>
            <option value="30d">30d</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {metrics ? (
          <div className="space-y-4">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <EnvelopeIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {formatNumber(metrics.totalSent)}
                </div>
                <div className="text-sm text-blue-600">Sent</div>
              </div>

              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <EyeIcon className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-900">
                  {metrics.openRate.toFixed(1)}%
                </div>
                <div className="text-sm text-green-600">Open Rate</div>
              </div>

              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <CursorArrowRippleIcon className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  {metrics.clickRate.toFixed(1)}%
                </div>
                <div className="text-sm text-purple-600">Click Rate</div>
              </div>

              <div className="text-center p-3 bg-emerald-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  ✅
                </div>
                <div className="text-2xl font-bold text-emerald-900">
                  {metrics.deliveryRate.toFixed(1)}%
                </div>
                <div className="text-sm text-emerald-600">Delivery</div>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Emails Opened</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{formatNumber(metrics.opened)}</span>
                  <div className="flex items-center text-green-600">
                    <ArrowTrendingUpIcon className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Emails Clicked</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{formatNumber(metrics.clicked)}</span>
                  <div className="flex items-center text-green-600">
                    <ArrowTrendingUpIcon className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Bounce Rate</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{metrics.bounceRate.toFixed(1)}%</span>
                  <div className={`flex items-center ${metrics.bounceRate < 5 ? 'text-green-600' : 'text-red-600'}`}>
                    {metrics.bounceRate < 5 ? 
                      <ArrowTrendingDownIcon className="h-4 w-4" /> :
                      <ArrowTrendingUpIcon className="h-4 w-4" />
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Health Score */}
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Email Health Score</span>
                <span className="text-sm font-bold text-gray-900">
                  {Math.round((metrics.deliveryRate + metrics.openRate + (100 - metrics.bounceRate)) / 3)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                  style={{ width: `${Math.round((metrics.deliveryRate + metrics.openRate + (100 - metrics.bounceRate)) / 3)}%` }}
                ></div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-3 border-t border-gray-200">
              <div className="flex gap-2">
                <button 
                  onClick={() => window.open('/admin/email-marketing/v2', '_blank')}
                  className="flex-1 py-2 px-3 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 transition-colors"
                >
                  View Details
                </button>
                <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors">
                  Export
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">📊</div>
            <div className="text-sm text-gray-600 font-medium">
              No metrics available for {getTimeRangeLabel(timeRange)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}