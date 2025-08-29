/**
 * AI Performance Monitoring Dashboard
 * Real-time monitoring and analytics for all AI systems
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  CpuChipIcon,
  SparklesIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  BoltIcon,
  ChatBubbleLeftEllipsisIcon
} from '@heroicons/react/24/outline';

import { unifiedAIOrchestrator } from '@/lib/ai/unified-ai-orchestrator';

interface SystemMetrics {
  system: string;
  status: 'healthy' | 'degraded' | 'offline';
  performance: number;
  accuracy: number;
  responseTime: number;
  requestCount: number;
  errorRate: number;
  uptime: number;
  lastUpdate: Date;
}

interface AIInsight {
  id: string;
  type: 'performance' | 'accuracy' | 'user_satisfaction' | 'business_impact' | 'optimization';
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  metric: number;
  trend: 'up' | 'down' | 'stable';
  recommendation?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface BusinessMetrics {
  conversionRate: number;
  averageBookingValue: number;
  customerSatisfaction: number;
  automationEfficiency: number;
  costSavings: number;
  revenueImpact: number;
  userEngagement: number;
  aiUsageRate: number;
}

interface PerformanceData {
  timestamp: Date;
  systemMetrics: SystemMetrics[];
  businessMetrics: BusinessMetrics;
  insights: AIInsight[];
  alerts: SystemAlert[];
}

interface SystemAlert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  system: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
}

const AI_SYSTEMS = [
  { id: 'gpt4', name: 'GPT-4 Assistant', color: 'purple' },
  { id: 'pricePredictor', name: 'Price Predictor', color: 'green' },
  { id: 'automation', name: 'Intelligent Automation', color: 'blue' },
  { id: 'amadeus', name: 'AI Amadeus Client', color: 'orange' },
  { id: 'personalization', name: 'Personalization Engine', color: 'pink' },
  { id: 'unified', name: 'Unified Assistant', color: 'indigo' }
];

export default function AIPerformanceDashboard() {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch performance data
  const fetchPerformanceData = useCallback(async () => {
    try {
      // In a real implementation, this would fetch from your monitoring API
      const mockData: PerformanceData = {
        timestamp: new Date(),
        systemMetrics: AI_SYSTEMS.map(system => ({
          system: system.id,
          status: Math.random() > 0.1 ? 'healthy' : 'degraded',
          performance: 0.8 + Math.random() * 0.2,
          accuracy: 0.85 + Math.random() * 0.15,
          responseTime: 500 + Math.random() * 1000,
          requestCount: Math.floor(Math.random() * 10000),
          errorRate: Math.random() * 0.05,
          uptime: 0.98 + Math.random() * 0.02,
          lastUpdate: new Date()
        })),
        businessMetrics: {
          conversionRate: 0.15 + Math.random() * 0.1,
          averageBookingValue: 800 + Math.random() * 400,
          customerSatisfaction: 4.2 + Math.random() * 0.8,
          automationEfficiency: 0.7 + Math.random() * 0.3,
          costSavings: 50000 + Math.random() * 30000,
          revenueImpact: 200000 + Math.random() * 100000,
          userEngagement: 0.6 + Math.random() * 0.4,
          aiUsageRate: 0.75 + Math.random() * 0.25
        },
        insights: generateMockInsights(),
        alerts: generateMockAlerts()
      };

      setPerformanceData(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
      setLoading(false);
    }
  }, [selectedTimeframe]);

  // Auto-refresh data
  useEffect(() => {
    fetchPerformanceData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchPerformanceData, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [fetchPerformanceData, autoRefresh]);

  const generateMockInsights = (): AIInsight[] => [
    {
      id: '1',
      type: 'performance',
      title: 'GPT-4 Response Time Improved',
      description: 'Average response time decreased by 15% over the last hour',
      impact: 'positive',
      metric: 15,
      trend: 'down',
      recommendation: 'Continue monitoring current optimization settings',
      priority: 'medium'
    },
    {
      id: '2',
      type: 'accuracy',
      title: 'Price Prediction Accuracy High',
      description: 'Price forecasting accuracy at 96.2%, exceeding target',
      impact: 'positive',
      metric: 96.2,
      trend: 'up',
      priority: 'low'
    },
    {
      id: '3',
      type: 'business_impact',
      title: 'Conversion Rate Increase',
      description: 'AI-assisted searches show 23% higher conversion rate',
      impact: 'positive',
      metric: 23,
      trend: 'up',
      recommendation: 'Promote AI-assisted search more prominently',
      priority: 'high'
    },
    {
      id: '4',
      type: 'optimization',
      title: 'Automation Opportunity',
      description: 'Detected 45% of users eligible for auto-booking',
      impact: 'neutral',
      metric: 45,
      trend: 'stable',
      recommendation: 'Implement proactive automation suggestions',
      priority: 'medium'
    }
  ];

  const generateMockAlerts = (): SystemAlert[] => [
    {
      id: '1',
      severity: 'warning',
      system: 'pricePredictor',
      message: 'Price prediction accuracy below 95% threshold',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      resolved: false
    },
    {
      id: '2',
      severity: 'info',
      system: 'automation',
      message: 'New automation rule deployed successfully',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      resolved: true
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'offline': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatMetric = (value: number, type: 'percentage' | 'currency' | 'number' | 'time') => {
    switch (type) {
      case 'percentage':
        return `${(value * 100).toFixed(1)}%`;
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'time':
        return `${Math.round(value)}ms`;
      default:
        return value.toLocaleString();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!performanceData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load performance data</p>
        <button 
          onClick={fetchPerformanceData}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="ai-performance-dashboard p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <CpuChipIcon className="w-8 h-8 mr-3 text-blue-500" />
              AI Performance Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Real-time monitoring and analytics for all AI systems
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Timeframe Selector */}
            <select
              value={selectedTimeframe}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedTimeframe(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            
            {/* Auto-refresh Toggle */}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAutoRefresh(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">Auto-refresh</span>
            </label>
            
            {/* Manual Refresh */}
            <button
              onClick={fetchPerformanceData}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {performanceData.systemMetrics.map((system) => {
          const systemConfig = AI_SYSTEMS.find(s => s.id === system.system);
          return (
            <motion.div
              key={system.system}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-xl shadow-lg p-6 border-l-4 cursor-pointer hover:shadow-xl transition-shadow ${
                selectedSystem === system.system ? 'border-l-blue-500' : 'border-l-gray-200'
              }`}
              onClick={() => setSelectedSystem(selectedSystem === system.system ? null : system.system)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  {systemConfig?.name || system.system}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(system.status)}`}>
                  {system.status}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Performance</span>
                  <span className="text-sm font-medium">
                    {formatMetric(system.performance, 'percentage')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Accuracy</span>
                  <span className="text-sm font-medium">
                    {formatMetric(system.accuracy, 'percentage')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Response Time</span>
                  <span className="text-sm font-medium">
                    {formatMetric(system.responseTime, 'time')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Requests</span>
                  <span className="text-sm font-medium">
                    {formatMetric(system.requestCount, 'number')}
                  </span>
                </div>
              </div>
              
              {/* Performance Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${system.performance * 100}%` }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Business Metrics */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <ChartBarIcon className="w-6 h-6 mr-2 text-green-500" />
          Business Impact Metrics
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {formatMetric(performanceData.businessMetrics.conversionRate, 'percentage')}
            </div>
            <div className="text-sm text-gray-600">Conversion Rate</div>
            <div className="flex items-center justify-center mt-1">
              <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-xs text-green-600">+12%</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {formatMetric(performanceData.businessMetrics.averageBookingValue, 'currency')}
            </div>
            <div className="text-sm text-gray-600">Avg Booking Value</div>
            <div className="flex items-center justify-center mt-1">
              <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-xs text-green-600">+8%</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {performanceData.businessMetrics.customerSatisfaction.toFixed(1)}★
            </div>
            <div className="text-sm text-gray-600">Customer Satisfaction</div>
            <div className="flex items-center justify-center mt-1">
              <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-xs text-green-600">+0.3</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {formatMetric(performanceData.businessMetrics.revenueImpact, 'currency')}
            </div>
            <div className="text-sm text-gray-600">Revenue Impact</div>
            <div className="flex items-center justify-center mt-1">
              <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-xs text-green-600">+15%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Insights */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <SparklesIcon className="w-6 h-6 mr-2 text-purple-500" />
            AI Insights & Recommendations
          </h2>
          
          <div className="space-y-4">
            {performanceData.insights.map((insight) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.priority === 'critical' ? 'border-l-red-500 bg-red-50' :
                  insight.priority === 'high' ? 'border-l-orange-500 bg-orange-50' :
                  insight.priority === 'medium' ? 'border-l-yellow-500 bg-yellow-50' :
                  'border-l-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{insight.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                    {insight.recommendation && (
                      <p className="text-sm text-blue-600 mt-2 font-medium">
                        💡 {insight.recommendation}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center ml-4">
                    {insight.trend === 'up' ? (
                      <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                    ) : insight.trend === 'down' ? (
                      <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                    ) : (
                      <div className="w-4 h-4 bg-gray-300 rounded-full" />
                    )}
                    <span className="ml-2 text-sm font-medium">
                      {insight.metric}%
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <ExclamationTriangleIcon className="w-6 h-6 mr-2 text-yellow-500" />
            System Alerts
          </h2>
          
          <div className="space-y-3">
            {performanceData.alerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-500">All systems operating normally</p>
              </div>
            ) : (
              performanceData.alerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)} ${
                    alert.resolved ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-medium text-sm">
                          {AI_SYSTEMS.find(s => s.id === alert.system)?.name || alert.system}
                        </span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        {alert.resolved && (
                          <CheckCircleIcon className="w-4 h-4 text-green-500 ml-2" />
                        )}
                      </div>
                      <p className="text-sm mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {alert.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* AI System Usage Analytics */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <UserGroupIcon className="w-6 h-6 mr-2 text-indigo-500" />
          AI System Usage Analytics
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
            <div className="flex items-center">
              <ChatBubbleLeftEllipsisIcon className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <div className="text-2xl font-bold text-purple-700">
                  {formatMetric(performanceData.businessMetrics.aiUsageRate, 'percentage')}
                </div>
                <div className="text-sm text-purple-600">AI Usage Rate</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
            <div className="flex items-center">
              <BoltIcon className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <div className="text-2xl font-bold text-blue-700">
                  {formatMetric(performanceData.businessMetrics.automationEfficiency, 'percentage')}
                </div>
                <div className="text-sm text-blue-600">Automation Efficiency</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
            <div className="flex items-center">
              <CurrencyDollarIcon className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <div className="text-2xl font-bold text-green-700">
                  {formatMetric(performanceData.businessMetrics.costSavings, 'currency')}
                </div>
                <div className="text-sm text-green-600">Cost Savings</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}