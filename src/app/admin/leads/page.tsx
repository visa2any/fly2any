'use client';

import React, { useState, useEffect } from 'react';

interface Lead {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  telefone?: string;
  origem: string;
  destino: string;
  dataPartida: string;
  dataRetorno?: string;
  numeroPassageiros: number;
  selectedServices: string[];
  status: string;
  source: string;
  createdAt: string;
  orcamentoTotal?: string;
  fullData?: any;
}

interface LeadsData {
  leads: Lead[];
  total: number;
  page: number;
  totalPages: number;
}

interface LeadsStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  byService: Record<string, number>;
}

const statusOptions = ['Todos', 'novo', 'contatado', 'cotacao_enviada', 'negociacao', 'fechado', 'perdido'];
const sourceOptions = ['Todas', 'website', 'whatsapp', 'instagram', 'google_ads', 'facebook'];

const getStatusBadge = (status: string) => {
  const badges = {
    'novo': 'admin-badge admin-badge-info',
    'contatado': 'admin-badge admin-badge-warning',
    'cotacao_enviada': 'admin-badge admin-badge-neutral',
    'negociacao': 'admin-badge admin-badge-warning',
    'fechado': 'admin-badge admin-badge-success',
    'perdido': 'admin-badge admin-badge-danger'
  };
  return badges[status as keyof typeof badges] || 'admin-badge admin-badge-neutral';
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const formatDateTime = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('pt-BR');
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [leadsData, setLeadsData] = useState<LeadsData>({
    leads: [],
    total: 0,
    page: 1,
    totalPages: 0
  });
  const [leadsStats, setLeadsStats] = useState<LeadsStats>({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    byService: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: 'Todos',
    source: 'Todas',
    search: ''
  });
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch leads data
  const fetchLeads = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/leads?page=${page}&limit=50`);
      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }
      
      const data: LeadsData = await response.json();
      setLeadsData(data);
      setLeads(data.leads);
      setFilteredLeads(data.leads);
      
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Erro ao carregar leads');
    } finally {
      setLoading(false);
    }
  };

  // Fetch leads stats
  const fetchLeadsStats = async () => {
    try {
      const response = await fetch('/api/admin/leads?stats=true');
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      const stats: LeadsStats = await response.json();
      setLeadsStats(stats);
      
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchLeads();
    fetchLeadsStats();
  }, []);

  // Filter leads
  useEffect(() => {
    let filtered = [...leads];

    // Filter by status
    if (filters.status !== 'Todos') {
      filtered = filtered.filter(lead => lead.status === filters.status);
    }

    // Filter by source
    if (filters.source !== 'Todas') {
      filtered = filtered.filter(lead => lead.source === filters.source);
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(lead =>
        lead.nome.toLowerCase().includes(searchLower) ||
        lead.email.toLowerCase().includes(searchLower) ||
        lead.whatsapp.includes(filters.search) ||
        lead.origem.toLowerCase().includes(searchLower) ||
        lead.destino.toLowerCase().includes(searchLower)
      );
    }

    setFilteredLeads(filtered);
  }, [leads, filters]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchLeads(page);
  };

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      search: e.target.value
    }));
  };

  // View lead details
  const viewLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsViewModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsViewModalOpen(false);
    setSelectedLead(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando leads...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌ {error}</div>
          <button
            onClick={() => fetchLeads()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="admin-card">
        <div className="admin-card-content">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-admin-text-primary mb-1">
                Gestão de Leads
              </h1>
              <p className="text-sm text-admin-text-secondary">
                Gerencie todos os leads e oportunidades de negócio
              </p>
            </div>
            <button
              onClick={() => fetchLeads()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-0 font-semibold"
            >
              🔄 Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="admin-card">
          <div className="admin-card-content">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center text-2xl">
                📊
              </div>
            </div>
            <div className="text-2xl font-bold text-admin-text-primary mb-1">{leadsStats.total}</div>
            <div className="text-sm text-admin-text-secondary">Total de Leads</div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-content">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white flex items-center justify-center text-2xl">
                📅
              </div>
            </div>
            <div className="text-2xl font-bold text-admin-text-primary mb-1">{leadsStats.today}</div>
            <div className="text-sm text-admin-text-secondary">Hoje</div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-content">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white flex items-center justify-center text-2xl">
                📈
              </div>
            </div>
            <div className="text-2xl font-bold text-admin-text-primary mb-1">{leadsStats.thisWeek}</div>
            <div className="text-sm text-admin-text-secondary">Esta Semana</div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-content">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white flex items-center justify-center text-2xl">
                🎯
              </div>
            </div>
            <div className="text-2xl font-bold text-admin-text-primary mb-1">{leadsStats.thisMonth}</div>
            <div className="text-sm text-admin-text-secondary">Este Mês</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card">
        <div className="admin-card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="admin-label">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="admin-input"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status === 'Todos' ? 'Todos' : 
                     status === 'novo' ? 'Novo' :
                     status === 'contatado' ? 'Contatado' :
                     status === 'cotacao_enviada' ? 'Cotação Enviada' :
                     status === 'negociacao' ? 'Negociação' :
                     status === 'fechado' ? 'Fechado' :
                     status === 'perdido' ? 'Perdido' : status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="admin-label">Origem</label>
              <select
                value={filters.source}
                onChange={(e) => handleFilterChange('source', e.target.value)}
                className="admin-input"
              >
                {sourceOptions.map(source => (
                  <option key={source} value={source}>
                    {source === 'Todas' ? 'Todas' :
                     source === 'website' ? 'Website' :
                     source === 'whatsapp' ? 'WhatsApp' :
                     source === 'instagram' ? 'Instagram' :
                     source === 'google_ads' ? 'Google Ads' :
                     source === 'facebook' ? 'Facebook' : source}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="admin-label">Buscar</label>
              <input
                type="text"
                value={filters.search}
                onChange={handleSearch}
                placeholder="Nome, email, telefone..."
                className="admin-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            Leads ({filteredLeads.length})
          </h2>
          <p className="admin-card-description">
            Lista de todos os leads recebidos
          </p>
        </div>
        <div className="admin-card-content">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-admin-border-color">
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">
                    Lead
                  </th>
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">
                    Contato
                  </th>
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">
                    Viagem
                  </th>
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">
                    Status
                  </th>
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">
                    Origem
                  </th>
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">
                    Data
                  </th>
                  <th className="text-right py-3 px-2 text-admin-text-secondary font-medium">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="admin-table-body">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="admin-table-row">
                    <td className="admin-table-td">
                      <div className="admin-user-cell">
                        <div className="admin-avatar">
                          <span className="admin-avatar-text">
                            {lead.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </span>
                        </div>
                        <div className="admin-user-info">
                          <div className="admin-user-name">
                            {lead.nome}
                          </div>
                          <div className="admin-user-meta">
                            ID: {lead.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="admin-table-td">
                      <div className="admin-contact-info">
                        <div className="admin-contact-primary">{lead.email}</div>
                        <div className="admin-contact-secondary">{lead.whatsapp}</div>
                      </div>
                    </td>
                    <td className="admin-table-td">
                      <div className="admin-travel-info">
                        <div className="admin-travel-route">
                          {lead.origem} → {lead.destino}
                        </div>
                        <div className="admin-travel-details">
                          {formatDate(lead.dataPartida)} • {lead.numeroPassageiros} pax
                        </div>
                      </div>
                    </td>
                    <td className="admin-table-td">
                      <span className={getStatusBadge(lead.status)}>
                        {lead.status === 'novo' ? 'Novo' :
                         lead.status === 'contatado' ? 'Contatado' :
                         lead.status === 'cotacao_enviada' ? 'Cotação Enviada' :
                         lead.status === 'negociacao' ? 'Negociação' :
                         lead.status === 'fechado' ? 'Fechado' :
                         lead.status === 'perdido' ? 'Perdido' : lead.status}
                      </span>
                    </td>
                    <td className="admin-table-td">
                      <span className="admin-source-label">
                        {lead.source === 'website' ? 'Website' :
                         lead.source === 'whatsapp' ? 'WhatsApp' :
                         lead.source === 'instagram' ? 'Instagram' :
                         lead.source === 'google_ads' ? 'Google Ads' :
                         lead.source === 'facebook' ? 'Facebook' : lead.source}
                      </span>
                    </td>
                    <td className="admin-table-td">
                      <span className="admin-date-label">
                        {formatDateTime(lead.createdAt)}
                      </span>
                    </td>
                    <td className="admin-table-td admin-table-actions">
                      <button
                        onClick={() => viewLead(lead)}
                        className="admin-btn admin-btn-sm admin-btn-primary"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {leadsData.totalPages > 1 && (
            <div className="admin-pagination">
              <div className="admin-pagination-content">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="admin-btn admin-btn-sm admin-btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Anterior
                </button>
                <div className="admin-pagination-info">
                  <span className="text-sm text-admin-text-secondary">
                    Página <span className="font-semibold text-admin-text-primary">{currentPage}</span> de <span className="font-semibold text-admin-text-primary">{leadsData.totalPages}</span>
                  </span>
                  <span className="text-xs text-admin-text-muted block md:inline md:ml-2">
                    ({leadsData.total} leads total)
                  </span>
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === leadsData.totalPages}
                  className="admin-btn admin-btn-sm admin-btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próxima →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredLeads.length === 0 && !loading && (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">📋</div>
            <h3 className="admin-empty-title">
              Nenhum lead encontrado
            </h3>
            <p className="admin-empty-description">
              {filters.search || filters.status !== 'Todos' || filters.source !== 'Todas'
                ? 'Tente ajustar os filtros ou fazer uma nova busca.'
                : 'Quando você receber leads, eles aparecerão aqui.'}
            </p>
            <button
              onClick={() => {
                setFilters({ status: 'Todos', source: 'Todas', search: '' });
                fetchLeads();
              }}
              className="admin-btn admin-btn-primary"
            >
              🔄 Limpar Filtros
            </button>
          </div>
        )}
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedLead && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                📋 Detalhes do Lead
              </h3>
              <button
                onClick={closeModal}
                className="admin-modal-close"
              >
                <span className="sr-only">Fechar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="admin-modal-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="admin-field-group">
                  <label className="admin-label">👤 Nome</label>
                  <p className="admin-field-value">{selectedLead.nome}</p>
                </div>
                <div className="admin-field-group">
                  <label className="admin-label">📧 Email</label>
                  <p className="admin-field-value">{selectedLead.email}</p>
                </div>
                <div className="admin-field-group">
                  <label className="admin-label">📱 WhatsApp</label>
                  <p className="admin-field-value">{selectedLead.whatsapp}</p>
                </div>
                <div className="admin-field-group">
                  <label className="admin-label">🏷️ Status</label>
                  <span className={getStatusBadge(selectedLead.status)}>
                    {selectedLead.status === 'novo' ? 'Novo' :
                     selectedLead.status === 'contatado' ? 'Contatado' :
                     selectedLead.status === 'cotacao_enviada' ? 'Cotação Enviada' :
                     selectedLead.status === 'negociacao' ? 'Negociação' :
                     selectedLead.status === 'fechado' ? 'Fechado' :
                     selectedLead.status === 'perdido' ? 'Perdido' : selectedLead.status}
                  </span>
                </div>
                <div className="admin-field-group">
                  <label className="admin-label">🛫 Origem</label>
                  <p className="admin-field-value">{selectedLead.origem}</p>
                </div>
                <div className="admin-field-group">
                  <label className="admin-label">🛬 Destino</label>
                  <p className="admin-field-value">{selectedLead.destino}</p>
                </div>
                <div className="admin-field-group">
                  <label className="admin-label">📅 Data de Partida</label>
                  <p className="admin-field-value">{formatDate(selectedLead.dataPartida)}</p>
                </div>
                <div className="admin-field-group">
                  <label className="admin-label">👥 Passageiros</label>
                  <p className="admin-field-value">{selectedLead.numeroPassageiros}</p>
                </div>
                <div className="admin-field-group">
                  <label className="admin-label">🎯 Serviços</label>
                  <p className="admin-field-value">{selectedLead.selectedServices.join(', ')}</p>
                </div>
                <div className="admin-field-group">
                  <label className="admin-label">💰 Orçamento</label>
                  <p className="admin-field-value">{selectedLead.orcamentoTotal || 'N/A'}</p>
                </div>
                <div className="admin-field-group md:col-span-2">
                  <label className="admin-label">🕒 Criado em</label>
                  <p className="admin-field-value">{formatDateTime(selectedLead.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                onClick={closeModal}
                className="admin-btn admin-btn-secondary"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}