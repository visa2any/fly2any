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
    <div className="admin-content">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header-section">
          <h1 className="admin-page-title">
            Gestão de Leads
          </h1>
          <p className="admin-page-description">
            Gerencie todos os leads e oportunidades de negócio
          </p>
        </div>

        {/* Stats Cards */}
        <div className="admin-stats-grid">
          <div className="admin-card admin-stats-card">
            <div className="admin-stats-content">
              <div className="admin-stats-info">
                <p className="admin-stats-label">Total de Leads</p>
                <p className="admin-stats-value">{leadsStats.total}</p>
              </div>
              <div className="admin-stats-icon admin-icon-primary">
                <span>📊</span>
              </div>
            </div>
          </div>

          <div className="admin-card admin-stats-card">
            <div className="admin-stats-content">
              <div className="admin-stats-info">
                <p className="admin-stats-label">Hoje</p>
                <p className="admin-stats-value">{leadsStats.today}</p>
              </div>
              <div className="admin-stats-icon admin-icon-success">
                <span>📅</span>
              </div>
            </div>
          </div>

          <div className="admin-card admin-stats-card">
            <div className="admin-stats-content">
              <div className="admin-stats-info">
                <p className="admin-stats-label">Esta Semana</p>
                <p className="admin-stats-value">{leadsStats.thisWeek}</p>
              </div>
              <div className="admin-stats-icon admin-icon-warning">
                <span>📈</span>
              </div>
            </div>
          </div>

          <div className="admin-card admin-stats-card">
            <div className="admin-stats-content">
              <div className="admin-stats-info">
                <p className="admin-stats-label">Este Mês</p>
                <p className="admin-stats-value">{leadsStats.thisMonth}</p>
              </div>
              <div className="admin-stats-icon admin-icon-info">
                <span>🎯</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-card admin-filters-card">
          <div className="admin-filters-grid">
            <div className="admin-form-group">
              <label className="admin-form-label">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="admin-form-select"
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

            <div className="admin-form-group">
              <label className="admin-form-label">
                Origem
              </label>
              <select
                value={filters.source}
                onChange={(e) => handleFilterChange('source', e.target.value)}
                className="admin-form-select"
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

            <div className="admin-form-group">
              <label className="admin-form-label">
                Buscar
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={handleSearch}
                placeholder="Nome, email, telefone..."
                className="admin-form-input"
              />
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="admin-card admin-table-card">
          <div className="admin-table-container">
            <table className="admin-table">
              <thead className="admin-table-header">
                <tr>
                  <th className="admin-table-th">
                    Lead
                  </th>
                  <th className="admin-table-th">
                    Contato
                  </th>
                  <th className="admin-table-th">
                    Viagem
                  </th>
                  <th className="admin-table-th">
                    Status
                  </th>
                  <th className="admin-table-th">
                    Origem
                  </th>
                  <th className="admin-table-th">
                    Data
                  </th>
                  <th className="admin-table-th admin-table-th-actions">
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
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-700">
                  Página {currentPage} de {leadsData.totalPages} ({leadsData.total} leads)
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === leadsData.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredLeads.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <span className="text-6xl mb-4 block">📋</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum lead encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              {filters.search || filters.status !== 'Todos' || filters.source !== 'Todas'
                ? 'Tente ajustar os filtros ou fazer uma nova busca.'
                : 'Quando você receber leads, eles aparecerão aqui.'}
            </p>
            <button
              onClick={() => {
                setFilters({ status: 'Todos', source: 'Todas', search: '' });
                fetchLeads();
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedLead && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Detalhes do Lead
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Fechar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLead.nome}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLead.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLead.whatsapp}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(selectedLead.status)}`}>
                    {selectedLead.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Origem</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLead.origem}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Destino</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLead.destino}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data de Partida</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedLead.dataPartida)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Passageiros</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLead.numeroPassageiros}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Serviços</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLead.selectedServices.join(', ')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Orçamento</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLead.orcamentoTotal || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Criado em</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDateTime(selectedLead.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
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