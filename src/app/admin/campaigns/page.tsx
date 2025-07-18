'use client';

import React, { useState, useEffect } from 'react';

interface Campaign {
  id: number;
  name: string;
  type: string;
  destination: string;
  status: 'Ativa' | 'Pausada' | 'Finalizada' | 'Rascunho';
  budget: number;
  spent: number;
  leads: number;
  conversions: number;
  startDate: string;
  endDate: string;
  channels: string[];
  description: string;
  targetAudience: string;
  createdAt: string;
  updatedAt?: string;
}

const statusOptions = ['Todas', 'Ativa', 'Pausada', 'Finalizada', 'Rascunho'];
const typeOptions = ['Todos', 'Email Marketing', 'Google Ads', 'Instagram Ads', 'Social Media', 'WhatsApp'];
const channelOptions = ['Email', 'Instagram', 'Facebook', 'Google Ads', 'YouTube', 'WhatsApp'];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const getStatusBadge = (status: string) => {
  const badges = {
    'Ativa': 'bg-gradient-to-r from-emerald-500 to-green-500 text-white border-emerald-300',
    'Pausada': 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-300',
    'Finalizada': 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-gray-300',
    'Rascunho': 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-300'
  };
  return badges[status as keyof typeof badges] || 'admin-badge-neutral';
};

const getROI = (conversions: number, spent: number) => {
  if (spent === 0) return 0;
  const revenue = conversions * 2500; // Ticket médio estimado
  return ((revenue - spent) / spent) * 100;
};

export default function CampaignsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Todas');
  const [selectedType, setSelectedType] = useState('Todos');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Email Marketing',
    destination: '',
    budget: 0,
    startDate: '',
    endDate: '',
    channels: [] as string[],
    description: '',
    targetAudience: ''
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/campaigns');
      const result = await response.json();
      
      if (result.success) {
        setCampaigns(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesStatus = selectedStatus === 'Todas' || campaign.status === selectedStatus;
    const matchesType = selectedType === 'Todos' || campaign.type === selectedType;
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.destination.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesType && matchesSearch;
  });

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'Ativa').length,
    totalBudget: campaigns.reduce((sum, c) => sum + c.budget, 0),
    totalSpent: campaigns.reduce((sum, c) => sum + c.spent, 0),
    totalLeads: campaigns.reduce((sum, c) => sum + c.leads, 0),
    totalConversions: campaigns.reduce((sum, c) => sum + c.conversions, 0)
  };

  const handleCreateCampaign = async () => {
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchCampaigns();
        setShowCreateForm(false);
        resetForm();
      } else {
        alert('Erro ao criar campanha: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
      alert('Erro ao criar campanha');
    }
  };

  const handleEditCampaign = async () => {
    if (selectedCampaign) {
      try {
        const response = await fetch('/api/campaigns', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: selectedCampaign.id,
            ...formData
          }),
        });
        
        const result = await response.json();
        
        if (result.success) {
          await fetchCampaigns();
          setShowEditForm(false);
          setSelectedCampaign(null);
          resetForm();
        } else {
          alert('Erro ao atualizar campanha: ' + result.error);
        }
      } catch (error) {
        console.error('Erro ao atualizar campanha:', error);
        alert('Erro ao atualizar campanha');
      }
    }
  };

  const handleDeleteCampaign = async (campaignId: number) => {
    if (confirm('Tem certeza que deseja excluir esta campanha?')) {
      try {
        const response = await fetch(`/api/campaigns?id=${campaignId}`, {
          method: 'DELETE',
        });
        
        const result = await response.json();
        
        if (result.success) {
          await fetchCampaigns();
          if (selectedCampaign?.id === campaignId) {
            setSelectedCampaign(null);
          }
        } else {
          alert('Erro ao excluir campanha: ' + result.error);
        }
      } catch (error) {
        console.error('Erro ao excluir campanha:', error);
        alert('Erro ao excluir campanha');
      }
    }
  };

  const handleUpdateStatus = async (campaignId: number, newStatus: string) => {
    try {
      const response = await fetch('/api/campaigns', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: campaignId,
          status: newStatus
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchCampaigns();
      } else {
        alert('Erro ao atualizar status: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'Email Marketing',
      destination: '',
      budget: 0,
      startDate: '',
      endDate: '',
      channels: [],
      description: '',
      targetAudience: ''
    });
  };

  const openEditForm = (campaign: Campaign) => {
    setFormData({
      name: campaign.name,
      type: campaign.type,
      destination: campaign.destination,
      budget: campaign.budget,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      channels: campaign.channels,
      description: campaign.description,
      targetAudience: campaign.targetAudience
    });
    setShowEditForm(true);
    setSelectedCampaign(campaign);
  };

  const handleChannelChange = (channel: string, checked: boolean) => {
    if (checked) {
      setFormData({...formData, channels: [...formData.channels, channel]});
    } else {
      setFormData({...formData, channels: formData.channels.filter(c => c !== channel)});
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="admin-card">
        <div className="admin-card-content">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-admin-text-primary mb-1">
                Gestão de Campanhas
              </h1>
              <p className="text-sm text-admin-text-secondary">
                Gerencie campanhas de marketing e publicidade
              </p>
            </div>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-0 font-semibold flex items-center gap-2"
            >
              <span className="text-lg">🚀</span>
              Nova Campanha
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid">
        <div className="admin-stats-card group hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center text-2xl shadow-lg">
              📢
            </div>
          </div>
          <div className="admin-stats-value text-3xl font-bold mb-1 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {stats.total}
          </div>
          <div className="admin-stats-label text-gray-500 font-medium">Total Campanhas</div>
        </div>
        <div className="admin-stats-card group hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white flex items-center justify-center text-2xl shadow-lg">
              ⚡
            </div>
          </div>
          <div className="admin-stats-value text-3xl font-bold mb-1 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {stats.active}
          </div>
          <div className="admin-stats-label text-gray-500 font-medium">Campanhas Ativas</div>
        </div>
        <div className="admin-stats-card group hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white flex items-center justify-center text-2xl shadow-lg">
              💰
            </div>
          </div>
          <div className="admin-stats-value text-3xl font-bold mb-1 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {formatCurrency(stats.totalSpent)}
          </div>
          <div className="admin-stats-label text-gray-500 font-medium">Investimento Total</div>
        </div>
        <div className="admin-stats-card group hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center justify-center text-2xl shadow-lg">
              🎯
            </div>
          </div>
          <div className="admin-stats-value text-3xl font-bold mb-1 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {stats.totalLeads}
          </div>
          <div className="admin-stats-label text-gray-500 font-medium">Leads Gerados</div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card">
        <div className="admin-card-content">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <label className="admin-label">Buscar</label>
              <input
                type="text"
                className="admin-input"
                placeholder="Nome da campanha ou destino..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="admin-label">Status</label>
              <select 
                className="admin-input"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="admin-label">Tipo</label>
              <select 
                className="admin-input"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {typeOptions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Campanhas ({filteredCampaigns.length})</h2>
          <p className="admin-card-description">
            Lista de todas as campanhas de marketing
          </p>
        </div>
        <div className="admin-card-content">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-admin-text-secondary">Carregando campanhas...</div>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-admin-border-color">
                  <th className="text-left py-2 px-2 text-admin-text-secondary font-medium text-sm">Campanha</th>
                  <th className="text-left py-2 px-2 text-admin-text-secondary font-medium text-sm">Tipo</th>
                  <th className="text-left py-2 px-2 text-admin-text-secondary font-medium text-sm">Status</th>
                  <th className="text-left py-2 px-2 text-admin-text-secondary font-medium text-sm">Orçamento</th>
                  <th className="text-left py-2 px-2 text-admin-text-secondary font-medium text-sm">Leads</th>
                  <th className="text-left py-2 px-2 text-admin-text-secondary font-medium text-sm">ROI</th>
                  <th className="text-left py-2 px-2 text-admin-text-secondary font-medium text-sm">Período</th>
                  <th className="text-left py-2 px-2 text-admin-text-secondary font-medium text-sm">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-admin-border-color hover:bg-admin-bg-secondary/30">
                    <td className="py-2 px-2">
                      <div>
                        <div className="font-medium text-sm text-admin-text-primary">{campaign.name}</div>
                        <div className="text-xs text-admin-text-secondary">{campaign.destination}</div>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-sm text-admin-text-primary">{campaign.type}</td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusBadge(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <div className="text-sm text-admin-text-primary font-semibold">{formatCurrency(campaign.budget)}</div>
                      <div className="text-xs text-admin-text-secondary">Gasto: {formatCurrency(campaign.spent)}</div>
                    </td>
                    <td className="py-2 px-2">
                      <div className="text-sm text-admin-text-primary font-semibold">{campaign.leads}</div>
                      <div className="text-xs text-admin-text-secondary">{campaign.conversions} conversões</div>
                    </td>
                    <td className="py-2 px-2">
                      <span className={`text-sm font-semibold ${getROI(campaign.conversions, campaign.spent) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {getROI(campaign.conversions, campaign.spent).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2 px-2 text-xs text-admin-text-secondary">
                      {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex gap-1">
                        <button 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs py-1 px-2 rounded hover:scale-105 transition-all duration-200 border-0"
                          onClick={() => setSelectedCampaign(campaign)}
                        >
                          👁️
                        </button>
                        <button 
                          className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs py-1 px-2 rounded hover:scale-105 transition-all duration-200 border-0"
                          onClick={() => openEditForm(campaign)}
                        >
                          ✏️
                        </button>
                        <select 
                          value={campaign.status}
                          onChange={(e) => handleUpdateStatus(campaign.id, e.target.value)}
                          className="text-xs border rounded px-1 py-1"
                        >
                          <option value="Rascunho">Rascunho</option>
                          <option value="Ativa">Ativa</option>
                          <option value="Pausada">Pausada</option>
                          <option value="Finalizada">Finalizada</option>
                        </select>
                        <button 
                          className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs py-1 px-2 rounded hover:scale-105 transition-all duration-200 border-0"
                          onClick={() => handleDeleteCampaign(campaign.id)}
                        >
                          🗑️
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

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-admin-bg-overlay z-50 flex items-center justify-center p-4">
          <div className="admin-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="admin-card-header">
              <div className="flex justify-between items-center">
                <h2 className="admin-card-title">Detalhes da Campanha</h2>
                <button 
                  className="text-admin-text-secondary hover:text-admin-text-primary"
                  onClick={() => setSelectedCampaign(null)}
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="admin-card-content">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Nome da Campanha</label>
                  <div className="text-admin-text-primary font-semibold">{selectedCampaign.name}</div>
                </div>
                <div>
                  <label className="admin-label">Status</label>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(selectedCampaign.status)}`}>
                    {selectedCampaign.status}
                  </span>
                </div>
                <div>
                  <label className="admin-label">Tipo</label>
                  <div className="text-admin-text-primary">{selectedCampaign.type}</div>
                </div>
                <div>
                  <label className="admin-label">Destino</label>
                  <div className="text-admin-text-primary">{selectedCampaign.destination}</div>
                </div>
                <div>
                  <label className="admin-label">Orçamento</label>
                  <div className="text-admin-text-primary font-semibold">{formatCurrency(selectedCampaign.budget)}</div>
                </div>
                <div>
                  <label className="admin-label">Gasto</label>
                  <div className="text-admin-text-primary font-semibold">{formatCurrency(selectedCampaign.spent)}</div>
                </div>
                <div>
                  <label className="admin-label">Leads Gerados</label>
                  <div className="text-admin-text-primary font-semibold">{selectedCampaign.leads}</div>
                </div>
                <div>
                  <label className="admin-label">Conversões</label>
                  <div className="text-admin-text-primary font-semibold">{selectedCampaign.conversions}</div>
                </div>
                <div>
                  <label className="admin-label">Data de Início</label>
                  <div className="text-admin-text-primary">{formatDate(selectedCampaign.startDate)}</div>
                </div>
                <div>
                  <label className="admin-label">Data de Fim</label>
                  <div className="text-admin-text-primary">{formatDate(selectedCampaign.endDate)}</div>
                </div>
                <div className="col-span-2">
                  <label className="admin-label">Canais</label>
                  <div className="flex gap-2 flex-wrap">
                    {selectedCampaign.channels.map(channel => (
                      <span key={channel} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="admin-label">Público-Alvo</label>
                  <div className="text-admin-text-primary">{selectedCampaign.targetAudience}</div>
                </div>
                <div className="col-span-2">
                  <label className="admin-label">Descrição</label>
                  <div className="text-admin-text-primary">{selectedCampaign.description}</div>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button 
                  onClick={() => openEditForm(selectedCampaign)}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-200 border-0 font-medium flex items-center gap-2"
                >
                  ✏️ Editar
                </button>
                <button 
                  onClick={() => alert('Relatório de performance será gerado...')}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-200 border-0 font-medium flex items-center gap-2"
                >
                  📊 Relatório
                </button>
                <button 
                  onClick={() => alert('Duplicando campanha...')}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-200 border-0 font-medium flex items-center gap-2"
                >
                  📋 Duplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Campaign Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-admin-bg-overlay z-50 flex items-center justify-center p-4">
          <div className="admin-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="admin-card-header">
              <div className="flex justify-between items-center">
                <h2 className="admin-card-title">Criar Nova Campanha</h2>
                <button 
                  className="text-admin-text-secondary hover:text-admin-text-primary"
                  onClick={() => { setShowCreateForm(false); resetForm(); }}
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="admin-card-content">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Nome da Campanha *</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="admin-label">Tipo *</label>
                  <select 
                    className="admin-input"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    {typeOptions.slice(1).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="admin-label">Destino *</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.destination}
                    onChange={(e) => setFormData({...formData, destination: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="admin-label">Orçamento *</label>
                  <input
                    type="number"
                    className="admin-input"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <label className="admin-label">Data de Início *</label>
                  <input
                    type="date"
                    className="admin-input"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="admin-label">Data de Fim *</label>
                  <input
                    type="date"
                    className="admin-input"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="admin-label">Canais de Marketing</label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {channelOptions.map(channel => (
                      <label key={channel} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.channels.includes(channel)}
                          onChange={(e) => handleChannelChange(channel, e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{channel}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="admin-label">Público-Alvo</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                    placeholder="Ex: Casais, 25-45 anos, alta renda"
                  />
                </div>
                <div className="col-span-2">
                  <label className="admin-label">Descrição</label>
                  <textarea
                    className="admin-input h-24 resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button 
                  onClick={handleCreateCampaign}
                  disabled={!formData.name || !formData.destination || !formData.budget}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-2 rounded-lg hover:scale-105 transition-all duration-200 border-0 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🚀 Criar Campanha
                </button>
                <button 
                  onClick={() => { setShowCreateForm(false); resetForm(); }}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-2 rounded-lg hover:scale-105 transition-all duration-200 border-0 font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Campaign Form Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-admin-bg-overlay z-50 flex items-center justify-center p-4">
          <div className="admin-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="admin-card-header">
              <div className="flex justify-between items-center">
                <h2 className="admin-card-title">Editar Campanha</h2>
                <button 
                  className="text-admin-text-secondary hover:text-admin-text-primary"
                  onClick={() => { setShowEditForm(false); resetForm(); }}
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="admin-card-content">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Nome da Campanha *</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="admin-label">Tipo *</label>
                  <select 
                    className="admin-input"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    {typeOptions.slice(1).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="admin-label">Destino *</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.destination}
                    onChange={(e) => setFormData({...formData, destination: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="admin-label">Orçamento *</label>
                  <input
                    type="number"
                    className="admin-input"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <label className="admin-label">Data de Início *</label>
                  <input
                    type="date"
                    className="admin-input"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="admin-label">Data de Fim *</label>
                  <input
                    type="date"
                    className="admin-input"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="admin-label">Canais de Marketing</label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {channelOptions.map(channel => (
                      <label key={channel} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.channels.includes(channel)}
                          onChange={(e) => handleChannelChange(channel, e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{channel}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="admin-label">Público-Alvo</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                    placeholder="Ex: Casais, 25-45 anos, alta renda"
                  />
                </div>
                <div className="col-span-2">
                  <label className="admin-label">Descrição</label>
                  <textarea
                    className="admin-input h-24 resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button 
                  onClick={handleEditCampaign}
                  disabled={!formData.name || !formData.destination || !formData.budget}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg hover:scale-105 transition-all duration-200 border-0 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  💾 Salvar Alterações
                </button>
                <button 
                  onClick={() => { setShowEditForm(false); resetForm(); }}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-2 rounded-lg hover:scale-105 transition-all duration-200 border-0 font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}