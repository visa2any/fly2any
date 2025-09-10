/**
 * SUSTAINABILITY TRACKING & ANALYTICS DASHBOARD
 * 
 * Comprehensive dashboard for monitoring sustainable tourism performance,
 * COP 30 positioning progress, and environmental impact metrics.
 * 
 * Features:
 * - Real-time sustainability KPIs
 * - COP 30 content performance tracking
 * - Environmental impact visualization
 * - Keyword ranking monitoring
 * - Partnership ROI analysis
 * - Carbon offset tracking
 * - Content automation status
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  GlobeAltIcon, 
  ArrowTrendingUpIcon, 
  CalendarIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface SustainabilityMetrics {
  carbonOffsetTotal: number;
  conservationFunding: number;
  sustainableBookings: number;
  ecoPartners: number;
  certificationLevel: string;
  monthlyGrowth: number;
}

interface COP30Performance {
  daysUntilEvent: number;
  keywordRankings: KeywordRanking[];
  contentPublished: number;
  organicTraffic: number;
  bookingInquiries: number;
  partnershipDeals: number;
}

interface KeywordRanking {
  keyword: string;
  position: number;
  change: number;
  searchVolume: number;
  difficulty: number;
  traffic: number;
}

interface EnvironmentalImpact {
  co2Offset: number;
  forestProtected: number;
  communitiesSupported: number;
  biodiversityProjects: number;
  impactScore: number;
  nextMilestone: string;
}

interface ContentAutomation {
  activeRules: number;
  contentInPipeline: number;
  publishedThisMonth: number;
  trendingKeywords: number;
  automationEfficiency: number;
  lastUpdate: Date;
}

interface PartnershipMetrics {
  activePartnerships: number;
  pendingDeals: number;
  backlinksEarned: number;
  authorityIncrease: number;
  roi: number;
  topPartners: Partner[];
}

interface Partner {
  name: string;
  type: string;
  value: number;
  status: 'active' | 'pending' | 'negotiating';
}

const SustainabilityDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'cop30' | 'impact' | 'automation' | 'partnerships'>('overview');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [sustainabilityMetrics, setSustainabilityMetrics] = useState<SustainabilityMetrics | null>(null);
  const [cop30Performance, setCOP30Performance] = useState<COP30Performance | null>(null);
  const [environmentalImpact, setEnvironmentalImpact] = useState<EnvironmentalImpact | null>(null);
  const [contentAutomation, setContentAutomation] = useState<ContentAutomation | null>(null);
  const [partnershipMetrics, setPartnershipMetrics] = useState<PartnershipMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, [timeRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // In real implementation, these would be API calls
      setSustainabilityMetrics(await fetchSustainabilityMetrics());
      setCOP30Performance(await fetchCOP30Performance());
      setEnvironmentalImpact(await fetchEnvironmentalImpact());
      setContentAutomation(await fetchContentAutomation());
      setPartnershipMetrics(await fetchPartnershipMetrics());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data fetching functions
  const fetchSustainabilityMetrics = async (): Promise<SustainabilityMetrics> => {
    return {
      carbonOffsetTotal: 1247.5,
      conservationFunding: 125000,
      sustainableBookings: 1842,
      ecoPartners: 27,
      certificationLevel: 'Expert',
      monthlyGrowth: 23.5
    };
  };

  const fetchCOP30Performance = async (): Promise<COP30Performance> => {
    const cop30Date = new Date('2025-11-10');
    const now = new Date();
    const daysUntil = Math.floor((cop30Date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      daysUntilEvent: daysUntil,
      keywordRankings: [
        { keyword: 'cop 30 brazil travel', position: 2, change: 8, searchVolume: 1200, difficulty: 45, traffic: 850 },
        { keyword: 'sustainable conference travel', position: 1, change: 0, searchVolume: 800, difficulty: 62, traffic: 640 },
        { keyword: 'cop 30 accommodation belém', position: 3, change: 12, searchVolume: 600, difficulty: 40, traffic: 480 },
        { keyword: 'climate conference brazil', position: 1, change: 5, searchVolume: 500, difficulty: 35, traffic: 500 },
        { keyword: 'cop 30 sustainable tourism', position: 1, change: 15, searchVolume: 400, difficulty: 30, traffic: 400 }
      ],
      contentPublished: 23,
      organicTraffic: 45200,
      bookingInquiries: 186,
      partnershipDeals: 8
    };
  };

  const fetchEnvironmentalImpact = async (): Promise<EnvironmentalImpact> => {
    return {
      co2Offset: 1247.5,
      forestProtected: 15420,
      communitiesSupported: 34,
      biodiversityProjects: 12,
      impactScore: 94,
      nextMilestone: '2,000 tons CO2 offset'
    };
  };

  const fetchContentAutomation = async (): Promise<ContentAutomation> => {
    return {
      activeRules: 12,
      contentInPipeline: 8,
      publishedThisMonth: 23,
      trendingKeywords: 15,
      automationEfficiency: 87,
      lastUpdate: new Date()
    };
  };

  const fetchPartnershipMetrics = async (): Promise<PartnershipMetrics> => {
    return {
      activePartnerships: 15,
      pendingDeals: 6,
      backlinksEarned: 89,
      authorityIncrease: 23,
      roi: 340,
      topPartners: [
        { name: 'WWF Brazil', type: 'Environmental NGO', value: 95000, status: 'active' },
        { name: 'Amazon Fund', type: 'Government', value: 78000, status: 'active' },
        { name: 'UN Environment', type: 'International Org', value: 120000, status: 'pending' }
      ]
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Sustainability Dashboard
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Monitor your sustainable tourism impact and COP 30 positioning
              </p>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex space-x-2">
              {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${
                    timeRange === range
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'cop30', name: 'COP 30 Progress', icon: GlobeAltIcon },
              { id: 'impact', name: 'Environmental Impact', icon: ArrowTrendingUpIcon },
              { id: 'automation', name: 'Content Automation', icon: ClockIcon },
              { id: 'partnerships', name: 'Partnerships', icon: CurrencyDollarIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Overview Tab */}
        {activeTab === 'overview' && sustainabilityMetrics && (
          <div className="space-y-8">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="CO2 Offset Total"
                value={`${sustainabilityMetrics.carbonOffsetTotal} tons`}
                change={`+${sustainabilityMetrics.monthlyGrowth}%`}
                positive={true}
                icon={<GlobeAltIcon className="w-8 h-8 text-green-600" />}
              />
              <MetricCard
                title="Conservation Funding"
                value={`$${(sustainabilityMetrics.conservationFunding / 1000).toFixed(0)}k`}
                change="+12.3%"
                positive={true}
                icon={<ArrowTrendingUpIcon className="w-8 h-8 text-blue-600" />}
              />
              <MetricCard
                title="Sustainable Bookings"
                value={sustainabilityMetrics.sustainableBookings.toLocaleString()}
                change="+18.7%"
                positive={true}
                icon={<CheckCircleIcon className="w-8 h-8 text-purple-600" />}
              />
              <MetricCard
                title="Eco Partners"
                value={sustainabilityMetrics.ecoPartners.toString()}
                change="+3 this month"
                positive={true}
                icon={<CurrencyDollarIcon className="w-8 h-8 text-yellow-600" />}
              />
            </div>

            {/* Certification Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sustainability Certification Status
              </h3>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <div>
                  <p className="text-xl font-semibold text-gray-900">
                    Expert Level Certified
                  </p>
                  <p className="text-sm text-gray-600">
                    Verified B-Corp Travel Company with 94% sustainability score
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COP 30 Progress Tab */}
        {activeTab === 'cop30' && cop30Performance && (
          <div className="space-y-8">
            {/* COP 30 Countdown */}
            <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg shadow-lg p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    COP 30 Brazil Conference
                  </h2>
                  <p className="text-xl opacity-90">
                    {cop30Performance.daysUntilEvent} days until history
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-6xl font-bold">
                    {cop30Performance.daysUntilEvent}
                  </div>
                  <div className="text-lg opacity-75">
                    days remaining
                  </div>
                </div>
              </div>
            </div>

            {/* COP 30 Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                title="Content Published"
                value={cop30Performance.contentPublished.toString()}
                change="+8 this week"
                positive={true}
                icon={<ChartBarIcon className="w-8 h-8 text-green-600" />}
              />
              <MetricCard
                title="Organic Traffic"
                value={cop30Performance.organicTraffic.toLocaleString()}
                change="+45.2%"
                positive={true}
                icon={<ArrowTrendingUpIcon className="w-8 h-8 text-blue-600" />}
              />
              <MetricCard
                title="Booking Inquiries"
                value={cop30Performance.bookingInquiries.toString()}
                change="+67.3%"
                positive={true}
                icon={<CurrencyDollarIcon className="w-8 h-8 text-purple-600" />}
              />
            </div>

            {/* Keyword Rankings Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  COP 30 Keyword Rankings
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Keyword
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Change
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Traffic
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Volume
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cop30Performance.keywordRankings.map((keyword) => (
                      <tr key={keyword.keyword}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {keyword.keyword}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          #{keyword.position}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            keyword.change > 0 
                              ? 'bg-green-100 text-green-800' 
                              : keyword.change < 0 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {keyword.change > 0 ? '+' : ''}{keyword.change}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {keyword.traffic}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {keyword.searchVolume.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Environmental Impact Tab */}
        {activeTab === 'impact' && environmentalImpact && (
          <div className="space-y-8">
            {/* Impact Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ImpactCard
                title="CO2 Offset"
                value={`${environmentalImpact.co2Offset} tons`}
                description="Carbon emissions neutralized"
                color="green"
              />
              <ImpactCard
                title="Forest Protected"
                value={`${(environmentalImpact.forestProtected / 1000).toFixed(1)}k hectares`}
                description="Rainforest preservation funded"
                color="blue"
              />
              <ImpactCard
                title="Communities"
                value={environmentalImpact.communitiesSupported.toString()}
                description="Indigenous groups supported"
                color="purple"
              />
              <ImpactCard
                title="Projects"
                value={environmentalImpact.biodiversityProjects.toString()}
                description="Biodiversity initiatives"
                color="yellow"
              />
            </div>

            {/* Impact Score */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Environmental Impact Score
              </h3>
              <div className="flex items-center space-x-6">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="transparent"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-green-500"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={`${environmentalImpact.impactScore}, 100`}
                      strokeLinecap="round"
                      fill="transparent"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">
                      {environmentalImpact.impactScore}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-gray-900 mb-2">
                    Exceptional Impact
                  </p>
                  <p className="text-gray-600 mb-4">
                    You're in the top 5% of sustainable travel companies
                  </p>
                  <p className="text-sm text-gray-500">
                    Next milestone: {environmentalImpact.nextMilestone}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Automation Tab */}
        {activeTab === 'automation' && contentAutomation && (
          <div className="space-y-8">
            {/* Automation Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Active Rules"
                value={contentAutomation.activeRules.toString()}
                change="All systems operational"
                positive={true}
                icon={<CheckCircleIcon className="w-8 h-8 text-green-600" />}
              />
              <MetricCard
                title="Content Pipeline"
                value={contentAutomation.contentInPipeline.toString()}
                change="pieces in production"
                positive={true}
                icon={<ClockIcon className="w-8 h-8 text-blue-600" />}
              />
              <MetricCard
                title="Published This Month"
                value={contentAutomation.publishedThisMonth.toString()}
                change="+15% vs last month"
                positive={true}
                icon={<ChartBarIcon className="w-8 h-8 text-purple-600" />}
              />
              <MetricCard
                title="Trending Keywords"
                value={contentAutomation.trendingKeywords.toString()}
                change="being monitored"
                positive={true}
                icon={<ArrowTrendingUpIcon className="w-8 h-8 text-yellow-600" />}
              />
            </div>

            {/* Automation Efficiency */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Automation Efficiency
              </h3>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${contentAutomation.automationEfficiency}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {contentAutomation.automationEfficiency}%
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Last updated: {contentAutomation.lastUpdate.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Partnerships Tab */}
        {activeTab === 'partnerships' && partnershipMetrics && (
          <div className="space-y-8">
            {/* Partnership Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Active Partnerships"
                value={partnershipMetrics.activePartnerships.toString()}
                change="+3 this month"
                positive={true}
                icon={<CheckCircleIcon className="w-8 h-8 text-green-600" />}
              />
              <MetricCard
                title="Pending Deals"
                value={partnershipMetrics.pendingDeals.toString()}
                change="in negotiation"
                positive={true}
                icon={<ClockIcon className="w-8 h-8 text-blue-600" />}
              />
              <MetricCard
                title="Backlinks Earned"
                value={partnershipMetrics.backlinksEarned.toString()}
                change={`+${partnershipMetrics.authorityIncrease}% authority`}
                positive={true}
                icon={<ArrowTrendingUpIcon className="w-8 h-8 text-purple-600" />}
              />
              <MetricCard
                title="Partnership ROI"
                value={`${partnershipMetrics.roi}%`}
                change="vs investment"
                positive={true}
                icon={<CurrencyDollarIcon className="w-8 h-8 text-yellow-600" />}
              />
            </div>

            {/* Top Partners */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Top Partnerships
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {partnershipMetrics.topPartners.map((partner) => (
                  <div key={partner.name} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          partner.status === 'active' ? 'bg-green-100' :
                          partner.status === 'pending' ? 'bg-yellow-100' : 'bg-blue-100'
                        }`}>
                          <CheckCircleIcon className={`w-6 h-6 ${
                            partner.status === 'active' ? 'text-green-600' :
                            partner.status === 'pending' ? 'text-yellow-600' : 'text-blue-600'
                          }`} />
                        </div>
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-900">
                          {partner.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {partner.type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        ${(partner.value / 1000).toFixed(0)}k
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        partner.status === 'active' ? 'bg-green-100 text-green-800' :
                        partner.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {partner.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Utility Components

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, positive, icon }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        {icon}
      </div>
      <div className="ml-4 flex-1">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        <p className={`text-sm ${positive ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </p>
      </div>
    </div>
  </div>
);

interface ImpactCardProps {
  title: string;
  value: string;
  description: string;
  color: 'green' | 'blue' | 'purple' | 'yellow';
}

const ImpactCard: React.FC<ImpactCardProps> = ({ title, value, description, color }) => {
  const colorClasses = {
    green: 'bg-green-50 text-green-800 border-green-200',
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
    purple: 'bg-purple-50 text-purple-800 border-purple-200',
    yellow: 'bg-yellow-50 text-yellow-800 border-yellow-200'
  };

  return (
    <div className={`rounded-lg border-2 p-6 ${colorClasses[color]}`}>
      <p className="text-lg font-semibold mb-2">{title}</p>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-sm opacity-75">{description}</p>
    </div>
  );
};

export default SustainabilityDashboard;