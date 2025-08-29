'use client';

import React, { useState } from 'react';

const initialSettings = {
  general: {
    companyName: 'Fly2Any',
    email: 'contato@fly2any.com',
    phone: '+55 11 99999-9999',
    address: 'Rua das Viagens, 123 - São Paulo, SP',
    website: 'https://fly2any.com',
    timezone: 'America/Sao_Paulo'
  },
  notifications: {
    emailNewLead: true,
    emailConversion: true,
    emailTicket: true,
    whatsappNotifications: true,
    dailyReport: true,
    weeklyReport: false
  },
  integrations: {
    whatsappToken: '••••••••••••••••',
    googleAnalytics: 'GA-123456789',
    facebookPixel: '123456789012345',
    mailchimp: '••••••••••••••••',
    stripe: '••••••••••••••••'
  },
  automation: {
    autoAssignLeads: true,
    autoFollowUp: true,
    followUpDelay: 24,
    autoTicketPriority: true,
    reminderDays: 3
  }
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(initialSettings);
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);

  const tabs = [
    { id: 'general', name: 'Geral', icon: '⚙️' },
    { id: 'notifications', name: 'Notificações', icon: '🔔' },
    { id: 'integrations', name: 'Integrações', icon: '🔗' },
    { id: 'automation', name: 'Automação', icon: '🤖' }
  ];

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Aqui seria a integração com a API para salvar as configurações
    console.log('Salvando configurações:', settings);
    setHasChanges(false);
    alert('Configurações salvas com sucesso!');
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="admin-label">Nome da Empresa</label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={settings.general.companyName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('general', 'companyName', e.target.value)}
          />
        </div>
        <div>
          <label className="admin-label">Email Principal</label>
          <input
            type="email"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={settings.general.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('general', 'email', e.target.value)}
          />
        </div>
        <div>
          <label className="admin-label">Telefone</label>
          <input
            type="tel"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={settings.general.phone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('general', 'phone', e.target.value)}
          />
        </div>
        <div>
          <label className="admin-label">Website</label>
          <input
            type="url"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={settings.general.website}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('general', 'website', e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className="admin-label">Endereço</label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={settings.general.address}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('general', 'address', e.target.value)}
          />
        </div>
        <div>
          <label className="admin-label">Fuso Horário</label>
          <select
            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={settings.general.timezone}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateSetting('general', 'timezone', e.target.value)}
          >
            <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
            <option value="America/Rio_Branco">Rio Branco (GMT-5)</option>
            <option value="America/Manaus">Manaus (GMT-4)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-admin-text-primary">Email</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.notifications.emailNewLead}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('notifications', 'emailNewLead', e.target.checked)}
              className="w-4 h-4 text-admin-accent-primary"
            />
            <span className="text-admin-text-primary">Notificar por email sobre novos leads</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.notifications.emailConversion}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('notifications', 'emailConversion', e.target.checked)}
              className="w-4 h-4 text-admin-accent-primary"
            />
            <span className="text-admin-text-primary">Notificar por email sobre conversões</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.notifications.emailTicket}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('notifications', 'emailTicket', e.target.checked)}
              className="w-4 h-4 text-admin-accent-primary"
            />
            <span className="text-admin-text-primary">Notificar por email sobre tickets de suporte</span>
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-admin-text-primary">WhatsApp</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.notifications.whatsappNotifications}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('notifications', 'whatsappNotifications', e.target.checked)}
              className="w-4 h-4 text-admin-accent-primary"
            />
            <span className="text-admin-text-primary">Ativar notificações via WhatsApp</span>
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-admin-text-primary">Relatórios</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.notifications.dailyReport}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('notifications', 'dailyReport', e.target.checked)}
              className="w-4 h-4 text-admin-accent-primary"
            />
            <span className="text-admin-text-primary">Relatório diário de performance</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.notifications.weeklyReport}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('notifications', 'weeklyReport', e.target.checked)}
              className="w-4 h-4 text-admin-accent-primary"
            />
            <span className="text-admin-text-primary">Relatório semanal detalhado</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderIntegrationSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="admin-label">Token WhatsApp Business API</label>
          <input
            type="password"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={settings.integrations.whatsappToken}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('integrations', 'whatsappToken', e.target.value)}
            placeholder="Insira o token do WhatsApp"
          />
          <p className="text-sm text-admin-text-secondary mt-1">
            Token para integração com WhatsApp Business API
          </p>
        </div>
        <div>
          <label className="admin-label">Google Analytics ID</label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={settings.integrations.googleAnalytics}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('integrations', 'googleAnalytics', e.target.value)}
            placeholder="GA-XXXXXXXXX"
          />
        </div>
        <div>
          <label className="admin-label">Facebook Pixel ID</label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={settings.integrations.facebookPixel}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('integrations', 'facebookPixel', e.target.value)}
            placeholder="123456789012345"
          />
        </div>
        <div>
          <label className="admin-label">Mailchimp API Key</label>
          <input
            type="password"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={settings.integrations.mailchimp}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('integrations', 'mailchimp', e.target.value)}
            placeholder="API Key do Mailchimp"
          />
        </div>
        <div>
          <label className="admin-label">Stripe Secret Key</label>
          <input
            type="password"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={settings.integrations.stripe}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('integrations', 'stripe', e.target.value)}
            placeholder="sk_live_..."
          />
        </div>
      </div>

      <div className="border-t border-admin-border-color pt-6">
        <h3 className="text-lg font-semibold text-admin-text-primary mb-4">Status das Integrações</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-admin-bg-secondary/30 rounded-lg">
            <span className="text-admin-text-primary">WhatsApp Business</span>
            <span className="admin-badge admin-badge-success">Conectado</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-admin-bg-secondary/30 rounded-lg">
            <span className="text-admin-text-primary">Google Analytics</span>
            <span className="admin-badge admin-badge-success">Ativo</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-admin-bg-secondary/30 rounded-lg">
            <span className="text-admin-text-primary">Facebook Pixel</span>
            <span className="admin-badge admin-badge-warning">Configuração pendente</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-admin-bg-secondary/30 rounded-lg">
            <span className="text-admin-text-primary">Mailchimp</span>
            <span className="admin-badge admin-badge-danger">Desconectado</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAutomationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-admin-text-primary">Gestão de Leads</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.automation.autoAssignLeads}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('automation', 'autoAssignLeads', e.target.checked)}
              className="w-4 h-4 text-admin-accent-primary"
            />
            <span className="text-admin-text-primary">Atribuir leads automaticamente aos agentes</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.automation.autoFollowUp}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('automation', 'autoFollowUp', e.target.checked)}
              className="w-4 h-4 text-admin-accent-primary"
            />
            <span className="text-admin-text-primary">Follow-up automático de leads</span>
          </label>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Delay para Follow-up (horas)</label>
            <input
              type="number"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={settings.automation.followUpDelay}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('automation', 'followUpDelay', parseInt(e.target.value))}
              min="1"
              max="168"
            />
          </div>
          <div>
            <label className="admin-label">Lembrete de Follow-up (dias)</label>
            <input
              type="number"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={settings.automation.reminderDays}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('automation', 'reminderDays', parseInt(e.target.value))}
              min="1"
              max="30"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-admin-text-primary">Suporte</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.automation.autoTicketPriority}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('automation', 'autoTicketPriority', e.target.checked)}
              className="w-4 h-4 text-admin-accent-primary"
            />
            <span className="text-admin-text-primary">Definir prioridade automática dos tickets</span>
          </label>
        </div>
      </div>

      <div className="border-t border-admin-border-color pt-6">
        <h3 className="text-lg font-semibold text-admin-text-primary mb-4">Regras de Automação Ativas</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-admin-bg-secondary/30 rounded-lg">
            <span className="text-admin-text-primary">Lead não respondido há 48h → Alterar para "Perdido"</span>
            <span className="admin-badge admin-badge-success">Ativo</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-admin-bg-secondary/30 rounded-lg">
            <span className="text-admin-text-primary">Novo lead de alta prioridade → Notificar gerente</span>
            <span className="admin-badge admin-badge-success">Ativo</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-admin-bg-secondary/30 rounded-lg">
            <span className="text-admin-text-primary">Ticket sem resposta há 24h → Escalar prioridade</span>
            <span className="admin-badge admin-badge-warning">Pausado</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'integrations':
        return renderIntegrationSettings();
      case 'automation':
        return renderAutomationSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-admin-text-primary mb-1">
                Configurações
              </h1>
              <p className="text-sm text-admin-text-secondary">
                Configurações gerais do sistema
              </p>
            </div>
            {hasChanges && (
              <button 
                className="admin-btn admin-btn-primary"
                onClick={handleSave}
              >
                💾 Salvar Alterações
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
          <div className="flex space-x-1 bg-admin-bg-secondary/50 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-admin-accent-primary shadow-sm'
                    : 'text-admin-text-secondary hover:text-admin-text-primary'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
          {renderTabContent()}
        </div>
      </div>

      {/* Save Changes Bar */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 bg-admin-accent-primary text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center gap-3">
            <span>Você tem alterações não salvas</span>
            <button 
              className="bg-white text-admin-accent-primary px-4 py-2 rounded-md font-medium"
              onClick={handleSave}
            >
              Salvar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}