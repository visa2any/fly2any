'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { CampaignManager, Campaign, CampaignType, CampaignStatus, AudienceConfig, ScheduleConfig, ABTestConfig } from '@/lib/email/campaign-manager';

interface CampaignFormData {
  name: string;
  type: CampaignType;
  templates: {
    id: string;
    name: string;
    template: string;
    subject: string;
    previewText?: string;
  }[];
  audience: AudienceConfig;
  schedule: ScheduleConfig;
  abTest?: ABTestConfig;
}

const campaignTypes: { value: CampaignType; label: string }[] = [
  { value: 'welcome_series', label: 'Welcome Series' },
  { value: 'promotional', label: 'Promotional' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 're_engagement', label: 'Re-engagement' },
  { value: 'price_alert', label: 'Price Alert' },
  { value: 'booking_follow_up', label: 'Booking Follow-up' },
  { value: 'drip_campaign', label: 'Drip Campaign' },
  { value: 'seasonal', label: 'Seasonal' }
];

const templateOptions = [
  { value: 'welcome-lead', label: 'Welcome Email for New Leads', type: 'welcome_series' },
  { value: 'flight-deal-promo', label: 'Flight Deal Promotional Email', type: 'promotional' },
  { value: 'booking-follow-up', label: 'Booking Follow-up Email', type: 'booking_follow_up' },
  { value: 'newsletter', label: 'Newsletter Template', type: 'newsletter' },
  { value: 'price-drop-alert', label: 'Price Drop Alert', type: 'price_alert' },
  { value: 'booking-confirmation', label: 'Booking Confirmation', type: 'transactional' }
];

export default function EmailCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [campaignMetrics, setCampaignMetrics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates' | 'automation'>('campaigns');

  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    type: 'promotional',
    templates: [],
    audience: {
      segments: [],
      filters: {}
    },
    schedule: {
      type: 'immediate'
    }
  });

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async (): Promise<void> => {
    try {
      setLoading(true);
      // This would integrate with the CampaignManager
      // const campaignManager = new CampaignManager();
      // const campaigns = await campaignManager.getCampaigns();
      // setCampaigns(campaigns);
      
      // For now, using mock data
      setCampaigns([]);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Integration with CampaignManager
      // const campaignManager = new CampaignManager();
      // await campaignManager.createCampaign({
      //   ...formData,
      //   status: 'draft',
      //   createdBy: 'current-user-id'
      // });
      
      setShowCreateForm(false);
      loadCampaigns();
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  const handleLaunchCampaign = async (campaignId: string) => {
    try {
      // const campaignManager = new CampaignManager();
      // await campaignManager.launchCampaign(campaignId);
      loadCampaigns();
    } catch (error) {
      console.error('Failed to launch campaign:', error);
    }
  };

  const getStatusBadge = (status: CampaignStatus) => {
    const badges = {
      'draft': 'bg-gray-100 text-gray-800',
      'scheduled': 'bg-blue-100 text-blue-800',
      'running': 'bg-green-100 text-green-800',
      'paused': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-purple-100 text-purple-800',
      'failed': 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📧 Email Campaign Manager</h1>
              <p className="text-gray-600 mt-2">Manage your Mailgun-powered email campaigns with advanced automation</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              ➕ Create Campaign
            </button>
          </div>
          
          {/* Tab Navigation */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'campaigns', label: '📋 Campaigns', icon: '📋' },
                { id: 'templates', label: '📝 Templates', icon: '📝' },
                { id: 'automation', label: '🤖 Automation', icon: '🤖' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div>
            {/* Campaign Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-2xl">📧</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {campaigns.filter(c => c.status === 'running').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Sent</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <span className="text-2xl">📈</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Open Rate</p>
                    <p className="text-2xl font-bold text-gray-900">0%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Conversions</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Campaigns List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Email Campaigns</h2>
              </div>
              
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading campaigns...</p>
                </div>
              ) : campaigns.length === 0 ? (
                <div className="p-8 text-center">
                  <span className="text-6xl mb-4 block">📧</span>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
                  <p className="text-gray-600 mb-4">Create your first email campaign to get started</p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                  >
                    Create First Campaign
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Campaign
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Audience
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Performance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {campaigns.map((campaign) => (
                        <tr key={campaign.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                              <div className="text-sm text-gray-500">
                                Created {new Date(campaign.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(campaign.status)}`}>
                              {campaign.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {campaignTypes.find(t => t.value === campaign.type)?.label || campaign.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {campaign.audience.segments?.length || 0} segments
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {campaign.metrics ? (
                              <div>
                                <div>Sent: {campaign.metrics.sent}</div>
                                <div>Open: {campaign.metrics.openRate.toFixed(1)}%</div>
                              </div>
                            ) : (
                              'No data'
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex space-x-2">
                              {campaign.status === 'draft' && (
                                <button
                                  onClick={() => handleLaunchCampaign(campaign.id)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  🚀 Launch
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedCampaign(campaign);
                                  setShowAnalytics(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                📊 Analytics
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedCampaign(campaign);
                                  setShowEditForm(true);
                                }}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                ✏️ Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">📝 Email Templates</h2>
              <p className="text-sm text-gray-600 mt-1">Mailgun-optimized templates for different campaign types</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templateOptions.map((template) => (
                  <div key={template.value} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">{template.label}</h3>
                        <p className="text-sm text-gray-600 mb-4">Type: {template.type}</p>
                      </div>
                      <span className="text-2xl">📧</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700">
                        👁️ Preview
                      </button>
                      <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm font-medium hover:bg-gray-200">
                        ✏️ Edit
                      </button>
                      <button className="bg-green-100 text-green-700 px-3 py-2 rounded text-sm font-medium hover:bg-green-200">
                        🧪 Test
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Automation Tab */}
        {activeTab === 'automation' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">🤖 Email Automation</h2>
              <p className="text-sm text-gray-600 mt-1">Set up automated email workflows and drip campaigns</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Welcome Series */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-3">👋</span>
                    <div>
                      <h3 className="font-medium text-gray-900">Welcome Series</h3>
                      <p className="text-sm text-gray-600">Onboard new leads with a 3-email sequence</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-2">1</span>
                      Welcome email (immediate)
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-2">2</span>
                      Getting started guide (2 days)
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-2">3</span>
                      First deal recommendations (7 days)
                    </div>
                  </div>
                  
                  <button className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700">
                    Set Up Welcome Series
                  </button>
                </div>

                {/* Price Drop Alerts */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-3">📉</span>
                    <div>
                      <h3 className="font-medium text-gray-900">Price Drop Alerts</h3>
                      <p className="text-sm text-gray-600">Automated alerts when flight prices drop</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">• Monitor saved flight routes</div>
                    <div className="text-sm text-gray-600 mb-2">• Instant alerts for price drops</div>
                    <div className="text-sm text-gray-600 mb-4">• Personalized deal recommendations</div>
                  </div>
                  
                  <button className="w-full bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700">
                    Configure Price Alerts
                  </button>
                </div>

                {/* Re-engagement Campaign */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-3">🔄</span>
                    <div>
                      <h3 className="font-medium text-gray-900">Re-engagement</h3>
                      <p className="text-sm text-gray-600">Win back inactive subscribers</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">• Target 30+ days inactive</div>
                    <div className="text-sm text-gray-600 mb-2">• Special discount offers</div>
                    <div className="text-sm text-gray-600 mb-4">• Last chance messaging</div>
                  </div>
                  
                  <button className="w-full bg-purple-600 text-white py-2 rounded font-medium hover:bg-purple-700">
                    Set Up Re-engagement
                  </button>
                </div>

                {/* Newsletter Automation */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-3">📰</span>
                    <div>
                      <h3 className="font-medium text-gray-900">Newsletter</h3>
                      <p className="text-sm text-gray-600">Weekly travel news and deals</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">• Weekly schedule (Thursdays)</div>
                    <div className="text-sm text-gray-600 mb-2">• Curated travel content</div>
                    <div className="text-sm text-gray-600 mb-4">• Featured destinations</div>
                  </div>
                  
                  <button className="w-full bg-indigo-600 text-white py-2 rounded font-medium hover:bg-indigo-700">
                    Schedule Newsletter
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Campaign Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Create Email Campaign</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateCampaign} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Black Friday Flight Deals"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, type: e.target.value as CampaignType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {campaignTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Template
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      const template = templateOptions.find(t => t.value === e.target.value);
                      if (template) {
                        setFormData({
                          ...formData,
                          templates: [{
                            id: template.value,
                            name: template.label,
                            template: template.value,
                            subject: `New ${template.label}`
                          }]
                        });
                      }
                    }}
                  >
                    <option value="">Select a template</option>
                    {templateOptions.map((template) => (
                      <option key={template.value} value={template.value}>
                        {template.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="immediate"
                        name="schedule"
                        value="immediate"
                        checked={formData.schedule.type === 'immediate'}
                        onChange={() => setFormData({
                          ...formData,
                          schedule: { ...formData.schedule, type: 'immediate' }
                        })}
                        className="mr-2"
                      />
                      <label htmlFor="immediate" className="text-sm text-gray-700">
                        Send immediately after creation
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="scheduled"
                        name="schedule"
                        value="scheduled"
                        checked={formData.schedule.type === 'scheduled'}
                        onChange={() => setFormData({
                          ...formData,
                          schedule: { ...formData.schedule, type: 'scheduled' }
                        })}
                        className="mr-2"
                      />
                      <label htmlFor="scheduled" className="text-sm text-gray-700">
                        Schedule for later
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                  >
                    Create Campaign
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}