'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { analytics } from '@/lib/analytics-client';
import { Contact, Campaign, EmailTemplate, Segment, AutomationWorkflow } from '@/lib/email-marketing/utils';
import { useEmailMarketingShortcuts } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsHelp } from '@/components/ui/KeyboardShortcutsHelp';

// Import all the new components
import SegmentationEngine from '@/components/email-marketing/SegmentationEngine';
import CampaignBuilder from '@/components/email-marketing/CampaignBuilder';
import AnalyticsDashboard from '@/components/email-marketing/AnalyticsDashboard';
import AutomationWorkflows from '@/components/email-marketing/AutomationWorkflows';
import BulkActions from '@/components/email-marketing/BulkActions';
import TemplateGallery from '@/components/email-marketing/TemplateGallery';
import ActivityFeed from '@/components/email-marketing/ActivityFeed';
import ImportExportWizard from '@/components/email-marketing/ImportExportWizard';
import ABTestingFramework from '@/components/email-marketing/ABTestingFramework';
import DeliverabilityTools from '@/components/email-marketing/DeliverabilityTools';

interface Stats {
  totalContacts: number;
  segmentStats: Record<string, number>;
  campaignsSent: number;
  avgOpenRate: string;
  avgClickRate: string;
}

export default function EmailMarketingV2Page() {
  const searchParams = useSearchParams();
  
  // State management
  const [activeTab, setActiveTab] = useState<'dashboard' | 'campaigns' | 'automation' | 'segments' | 'analytics' | 'templates' | 'deliverability' | 'testing'>('dashboard');
  const [stats, setStats] = useState<Stats | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle URL tab parameter changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['dashboard', 'campaigns', 'automation', 'segments', 'analytics', 'templates', 'deliverability', 'testing'].includes(tabParam)) {
      setActiveTab(tabParam as typeof activeTab);
    }
  }, [searchParams]);

  // Initialize analytics and load data
  useEffect(() => {
    analytics.init();
    analytics.page('Email Marketing V2', { section: 'admin' });
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load stats, contacts, and campaigns in parallel
      await Promise.all([
        fetchStats(),
        fetchContacts(),
        fetchCampaigns()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/email-marketing/v2?action=stats');
      const data = await response.json();
      if (data.success && data.data) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/email-marketing/v2?action=contacts');
      const data = await response.json();
      if (data.success && data.data && Array.isArray(data.data.contacts)) {
        setContacts(data.data.contacts);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/email-marketing/v2?action=campaigns');
      const data = await response.json();
      if (data.success && data.data.campaigns) {
        const formattedCampaigns = data.data.campaigns.map((campaign: any) => ({
          id: campaign.id,
          name: campaign.name,
          type: campaign.template_type,
          sent: campaign.total_sent || 0,
          opens: campaign.total_opened || 0,
          clicks: campaign.total_clicked || 0,
          date: campaign.created_at,
          status: campaign.status === 'completed' ? 'Enviada' : 
                 campaign.status === 'sending' ? 'Enviando' :
                 campaign.status === 'draft' ? 'Rascunho' : campaign.status
        }));
        setCampaigns(formattedCampaigns);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  // Keyboard shortcuts setup
  const shortcuts = useEmailMarketingShortcuts({
    onNewCampaign: () => setActiveTab('campaigns'),
    onViewContacts: () => setActiveTab('segments'),
    onViewAnalytics: () => setActiveTab('analytics'),
    onToggleSidebar: () => {}, // Sidebar is handled by main admin layout
    onShowKeyboardHelp: () => setShowKeyboardHelp(true),
    onRefresh: loadInitialData,
    onSelectAll: () => setSelectedContacts(contacts.map(c => c.id || '')),
    onExport: () => setActiveTab('dashboard'), // Could open export wizard
    onImport: () => setActiveTab('dashboard')  // Could open import wizard
  });

  // Navigation tabs
  const navTabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊', description: 'Visão geral e estatísticas' },
    { id: 'campaigns', name: 'Campanhas', icon: '📧', description: 'Criar e gerenciar campanhas' },
    { id: 'automation', name: 'Automação', icon: '⚡', description: 'Workflows automatizados' },
    { id: 'segments', name: 'Segmentos', icon: '🎯', description: 'Segmentação inteligente' },
    { id: 'analytics', name: 'Analytics', icon: '📈', description: 'Relatórios avançados' },
    { id: 'templates', name: 'Templates', icon: '🎨', description: 'Galeria de templates' },
    { id: 'deliverability', name: 'Deliverability', icon: '🛡️', description: 'Ferramentas de entregabilidade' },
    { id: 'testing', name: 'A/B Testing', icon: '🧪', description: 'Testes e otimização' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Quick Stats */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card rounded-xl p-6 text-center shadow-lg shadow-gray-200/50">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center text-2xl mx-auto mb-4">📧</div>
                  <div className="text-3xl font-bold text-slate-900 mb-2">{stats.totalContacts.toLocaleString()}</div>
                  <div className="text-sm font-medium text-slate-600">Total de Contatos</div>
                </div>
                
                <div className="glass-card rounded-xl p-6 text-center shadow-lg shadow-gray-200/50">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white flex items-center justify-center text-2xl mx-auto mb-4">📊</div>
                  <div className="text-3xl font-bold text-slate-900 mb-2">{stats.campaignsSent.toLocaleString()}</div>
                  <div className="text-sm font-medium text-slate-600">Campanhas Enviadas</div>
                </div>
                
                <div className="glass-card rounded-xl p-6 text-center shadow-lg shadow-gray-200/50">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center justify-center text-2xl mx-auto mb-4">👀</div>
                  <div className="text-3xl font-bold text-slate-900 mb-2">{stats.avgOpenRate}</div>
                  <div className="text-sm font-medium text-slate-600">Taxa de Abertura</div>
                </div>
                
                <div className="glass-card rounded-xl p-6 text-center shadow-lg shadow-gray-200/50">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white flex items-center justify-center text-2xl mx-auto mb-4">🎯</div>
                  <div className="text-3xl font-bold text-slate-900 mb-2">{stats.avgClickRate}</div>
                  <div className="text-sm font-medium text-slate-600">Taxa de Clique</div>
                </div>
              </div>
            )}

            {/* Import/Export Wizard */}
            <ImportExportWizard
              contacts={contacts}
              onImportComplete={() => {
                fetchStats();
                fetchContacts();
              }}
            />

            {/* Recent Activity Feed */}
            <ActivityFeed />
          </div>
        );
      
      case 'campaigns':
        return (
          <div className="space-y-6">
            <CampaignBuilder 
              onSave={(campaign) => {
                setCampaigns([...campaigns, campaign]);
                fetchCampaigns();
              }}
              onSend={(campaign) => {
                // Handle campaign send
                fetchStats();
              }}
            />
          </div>
        );
      
      case 'automation':
        return (
          <AutomationWorkflows 
            onWorkflowSelect={(workflow) => {
              console.log('Selected workflow:', workflow);
            }}
          />
        );
      
      case 'segments':
        return (
          <div className="space-y-6">
            {/* Bulk Actions */}
            <BulkActions
              contacts={contacts}
              selectedContacts={selectedContacts}
              onContactsUpdate={fetchContacts}
              onSelectionClear={() => setSelectedContacts([])}
            />
            
            {/* Segmentation Engine */}
            <SegmentationEngine
              contacts={contacts}
              onSegmentCreate={(segment) => {
                console.log('Created segment:', segment);
              }}
              onSegmentSelect={(segment) => {
                console.log('Selected segment:', segment);
              }}
            />
          </div>
        );
      
      case 'analytics':
        return (
          <AnalyticsDashboard campaigns={campaigns} />
        );
      
      case 'templates':
        return (
          <TemplateGallery 
            onTemplateSelect={(template) => {
              // Navigate to campaign builder with selected template
              setActiveTab('campaigns');
            }}
          />
        );
      
      case 'deliverability':
        return <DeliverabilityTools />;
      
      case 'testing':
        return (
          <ABTestingFramework 
            campaigns={campaigns}
          />
        );
      
      default:
        return <div>Tab content not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {navTabs.find(tab => tab.id === activeTab)?.icon} {navTabs.find(tab => tab.id === activeTab)?.name}
            </h2>
            <p className="text-gray-600 text-sm">
              {navTabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Contact selection info */}
            {selectedContacts.length > 0 && (
              <div className="text-sm text-blue-600 font-medium">
                {selectedContacts.length} contatos selecionados
              </div>
            )}
            
            {/* Quick actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('campaigns')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-300 shadow-lg font-medium"
              >
                ➕ Nova Campanha
              </button>
              
              <button
                onClick={() => setShowKeyboardHelp(true)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                title="Atalhos do teclado (Ctrl+?)"
              >
                ⌨️
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-4 border-t pt-4">
          <nav className="flex space-x-1 overflow-x-auto">
            {navTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {renderTabContent()}
      </div>

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsHelp
        shortcuts={shortcuts}
        isOpen={showKeyboardHelp}
        onClose={() => setShowKeyboardHelp(false)}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 z-40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="font-medium text-gray-900">Carregando dados...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}