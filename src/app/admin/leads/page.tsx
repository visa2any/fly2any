'use client';

import React, { useState } from 'react';

const leadsData = [
  {
    id: 1,
    name: 'Maria Silva',
    email: 'maria@email.com',
    phone: '+55 11 99999-9999',
    destination: 'Paris, França',
    budget: 'R$ 5.000 - R$ 8.000',
    travelers: 2,
    departureDate: '2024-03-15',
    status: 'Novo',
    source: 'Site',
    createdAt: '2024-01-15T10:30:00',
    notes: 'Interessada em pacote de lua de mel'
  },
  {
    id: 2,
    name: 'João Santos',
    email: 'joao@email.com',
    phone: '+55 11 88888-8888',
    destination: 'Londres, Inglaterra',
    budget: 'R$ 3.000 - R$ 5.000',
    travelers: 1,
    departureDate: '2024-04-20',
    status: 'Em contato',
    source: 'WhatsApp',
    createdAt: '2024-01-15T09:15:00',
    notes: 'Viagem de negócios, flexível com datas'
  },
  {
    id: 3,
    name: 'Ana Costa',
    email: 'ana@email.com',
    phone: '+55 11 77777-7777',
    destination: 'Dubai, Emirados Árabes',
    budget: 'R$ 10.000+',
    travelers: 4,
    departureDate: '2024-05-10',
    status: 'Proposta',
    source: 'Instagram',
    createdAt: '2024-01-15T08:45:00',
    notes: 'Família com crianças, resort all-inclusive'
  },
  {
    id: 4,
    name: 'Pedro Lima',
    email: 'pedro@email.com',
    phone: '+55 11 66666-6666',
    destination: 'Tóquio, Japão',
    budget: 'R$ 8.000 - R$ 12.000',
    travelers: 2,
    departureDate: '2024-06-01',
    status: 'Convertido',
    source: 'Google Ads',
    createdAt: '2024-01-14T16:20:00',
    notes: 'Fechou pacote completo de 10 dias'
  },
  {
    id: 5,
    name: 'Carla Oliveira',
    email: 'carla@email.com',
    phone: '+55 11 55555-5555',
    destination: 'Nova York, EUA',
    budget: 'R$ 6.000 - R$ 9.000',
    travelers: 3,
    departureDate: '2024-07-15',
    status: 'Perdido',
    source: 'Facebook',
    createdAt: '2024-01-14T14:10:00',
    notes: 'Não respondeu após 3 tentativas de contato'
  }
];

const statusOptions = ['Todos', 'Novo', 'Em contato', 'Proposta', 'Convertido', 'Perdido'];
const sourceOptions = ['Todas', 'Site', 'WhatsApp', 'Instagram', 'Google Ads', 'Facebook'];

const getStatusBadge = (status: string) => {
  const badges = {
    'Novo': 'admin-badge admin-badge-info',
    'Em contato': 'admin-badge admin-badge-warning',
    'Proposta': 'admin-badge admin-badge-neutral',
    'Convertido': 'admin-badge admin-badge-success',
    'Perdido': 'admin-badge admin-badge-danger'
  };
  return badges[status as keyof typeof badges] || 'admin-badge admin-badge-neutral';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('pt-BR');
};

export default function LeadsPage() {
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedSource, setSelectedSource] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<typeof leadsData[0] | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [leads, setLeads] = useState(leadsData);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    destination: '',
    budget: '',
    travelers: 1,
    departureDate: '',
    status: 'Novo',
    source: 'Site',
    notes: ''
  });

  const filteredLeads = leads.filter(lead => {
    const matchesStatus = selectedStatus === 'Todos' || lead.status === selectedStatus;
    const matchesSource = selectedSource === 'Todas' || lead.source === selectedSource;
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.destination.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSource && matchesSearch;
  });

  const stats = {
    total: leads.length,
    novo: leads.filter(l => l.status === 'Novo').length,
    contato: leads.filter(l => l.status === 'Em contato').length,
    proposta: leads.filter(l => l.status === 'Proposta').length,
    convertido: leads.filter(l => l.status === 'Convertido').length,
    perdido: leads.filter(l => l.status === 'Perdido').length
  };

  const handleCreateLead = () => {
    const newLead = {
      id: leads.length + 1,
      ...formData,
      travelers: parseInt(formData.travelers.toString()),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setLeads([newLead, ...leads]);
    setShowCreateForm(false);
    resetForm();
  };

  const handleEditLead = () => {
    if (selectedLead) {
      setLeads(leads.map(lead => 
        lead.id === selectedLead.id 
          ? { ...lead, ...formData, updatedAt: new Date().toISOString() }
          : lead
      ));
      setShowEditForm(false);
      setSelectedLead(null);
      resetForm();
    }
  };

  const handleDeleteLead = (leadId: number) => {
    if (confirm('Tem certeza que deseja excluir este lead?')) {
      setLeads(leads.filter(lead => lead.id !== leadId));
      if (selectedLead?.id === leadId) {
        setSelectedLead(null);
      }
    }
  };

  const handleUpdateStatus = (leadId: number, newStatus: string) => {
    setLeads(leads.map(lead => 
      lead.id === leadId 
        ? { ...lead, status: newStatus, updatedAt: new Date().toISOString() }
        : lead
    ));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      destination: '',
      budget: '',
      travelers: 1,
      departureDate: '',
      status: 'Novo',
      source: 'Site',
      notes: ''
    });
  };

  const openEditForm = (lead: typeof leadsData[0]) => {
    setFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      destination: lead.destination,
      budget: lead.budget,
      travelers: lead.travelers,
      departureDate: lead.departureDate,
      status: lead.status,
      source: lead.source,
      notes: lead.notes
    });
    setShowEditForm(true);
    setSelectedLead(lead);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="admin-card">
        <div className="admin-card-content">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-admin-text-primary mb-2">
                Gestão de Leads
              </h1>
              <p className="text-admin-text-secondary">
                Gerencie e acompanhe todos os leads da sua agência
              </p>
            </div>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-0 font-semibold flex items-center gap-2"
            >
              <span className="text-lg">✨</span>
              Novo Lead
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid">
        <div className="admin-stats-card">
          <div className="admin-stats-value">{stats.total}</div>
          <div className="admin-stats-label">Total de Leads</div>
        </div>
        <div className="admin-stats-card">
          <div className="admin-stats-value text-blue-600">{stats.novo}</div>
          <div className="admin-stats-label">Novos</div>
        </div>
        <div className="admin-stats-card">
          <div className="admin-stats-value text-amber-600">{stats.contato}</div>
          <div className="admin-stats-label">Em Contato</div>
        </div>
        <div className="admin-stats-card">
          <div className="admin-stats-value text-emerald-600">{stats.convertido}</div>
          <div className="admin-stats-label">Convertidos</div>
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
                placeholder="Nome, email ou destino..."
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
              <label className="admin-label">Origem</label>
              <select 
                className="admin-input"
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
              >
                {sourceOptions.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Leads ({filteredLeads.length})</h2>
          <p className="admin-card-description">
            Lista de todos os leads capturados
          </p>
        </div>
        <div className="admin-card-content">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-admin-border-color">
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">Nome</th>
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">Destino</th>
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">Orçamento</th>
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">Viajantes</th>
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">Status</th>
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">Origem</th>
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">Data</th>
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-admin-border-color hover:bg-admin-bg-secondary/30">
                    <td className="py-3 px-2">
                      <div>
                        <div className="font-medium text-admin-text-primary">{lead.name}</div>
                        <div className="text-sm text-admin-text-secondary">{lead.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-admin-text-primary">{lead.destination}</td>
                    <td className="py-3 px-2 text-admin-text-primary">{lead.budget}</td>
                    <td className="py-3 px-2 text-admin-text-primary">{lead.travelers}</td>
                    <td className="py-3 px-2">
                      <span className={getStatusBadge(lead.status)}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-admin-text-secondary">{lead.source}</td>
                    <td className="py-3 px-2 text-admin-text-secondary text-sm">
                      {formatDateTime(lead.createdAt)}
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex gap-1">
                        <button 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs py-1 px-3 rounded-lg hover:scale-105 transition-all duration-200 border-0"
                          onClick={() => setSelectedLead(lead)}
                        >
                          👁️ Ver
                        </button>
                        <button 
                          className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs py-1 px-3 rounded-lg hover:scale-105 transition-all duration-200 border-0"
                          onClick={() => openEditForm(lead)}
                        >
                          ✏️ Editar
                        </button>
                        <button 
                          className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs py-1 px-3 rounded-lg hover:scale-105 transition-all duration-200 border-0"
                          onClick={() => handleDeleteLead(lead.id)}
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
        </div>
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-admin-bg-overlay z-50 flex items-center justify-center p-4">
          <div className="admin-card max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="admin-card-header">
              <div className="flex justify-between items-center">
                <h2 className="admin-card-title">Detalhes do Lead</h2>
                <button 
                  className="text-admin-text-secondary hover:text-admin-text-primary"
                  onClick={() => setSelectedLead(null)}
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="admin-card-content">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Nome</label>
                  <div className="text-admin-text-primary">{selectedLead.name}</div>
                </div>
                <div>
                  <label className="admin-label">Email</label>
                  <div className="text-admin-text-primary">{selectedLead.email}</div>
                </div>
                <div>
                  <label className="admin-label">Telefone</label>
                  <div className="text-admin-text-primary">{selectedLead.phone}</div>
                </div>
                <div>
                  <label className="admin-label">Status</label>
                  <span className={getStatusBadge(selectedLead.status)}>
                    {selectedLead.status}
                  </span>
                </div>
                <div>
                  <label className="admin-label">Destino</label>
                  <div className="text-admin-text-primary">{selectedLead.destination}</div>
                </div>
                <div>
                  <label className="admin-label">Orçamento</label>
                  <div className="text-admin-text-primary">{selectedLead.budget}</div>
                </div>
                <div>
                  <label className="admin-label">Número de Viajantes</label>
                  <div className="text-admin-text-primary">{selectedLead.travelers}</div>
                </div>
                <div>
                  <label className="admin-label">Data de Partida</label>
                  <div className="text-admin-text-primary">{formatDate(selectedLead.departureDate)}</div>
                </div>
                <div>
                  <label className="admin-label">Origem</label>
                  <div className="text-admin-text-primary">{selectedLead.source}</div>
                </div>
                <div>
                  <label className="admin-label">Criado em</label>
                  <div className="text-admin-text-primary">{formatDateTime(selectedLead.createdAt)}</div>
                </div>
                <div className="col-span-2">
                  <label className="admin-label">Observações</label>
                  <div className="text-admin-text-primary">{selectedLead.notes}</div>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button 
                  onClick={() => alert('Redirecionando para WhatsApp...')}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-200 border-0 font-medium flex items-center gap-2"
                >
                  💬 WhatsApp
                </button>
                <button 
                  onClick={() => openEditForm(selectedLead!)}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-200 border-0 font-medium flex items-center gap-2"
                >
                  📝 Editar
                </button>
                <button 
                  onClick={() => alert('Enviando proposta por email...')}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-200 border-0 font-medium flex items-center gap-2"
                >
                  📧 Proposta
                </button>
                <select 
                  value={selectedLead?.status}
                  onChange={(e) => selectedLead && handleUpdateStatus(selectedLead.id, e.target.value)}
                  className="admin-input text-sm"
                >
                  <option value="Novo">Novo</option>
                  <option value="Em contato">Em contato</option>
                  <option value="Proposta">Proposta</option>
                  <option value="Convertido">Convertido</option>
                  <option value="Perdido">Perdido</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Lead Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-admin-bg-overlay z-50 flex items-center justify-center p-4">
          <div className="admin-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="admin-card-header">
              <div className="flex justify-between items-center">
                <h2 className="admin-card-title">Criar Novo Lead</h2>
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
                  <label className="admin-label">Nome *</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="admin-label">Email *</label>
                  <input
                    type="email"
                    className="admin-input"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="admin-label">Telefone</label>
                  <input
                    type="tel"
                    className="admin-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
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
                  <label className="admin-label">Orçamento</label>
                  <select 
                    className="admin-input"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    <option value="R$ 1.000 - R$ 3.000">R$ 1.000 - R$ 3.000</option>
                    <option value="R$ 3.000 - R$ 5.000">R$ 3.000 - R$ 5.000</option>
                    <option value="R$ 5.000 - R$ 8.000">R$ 5.000 - R$ 8.000</option>
                    <option value="R$ 8.000 - R$ 12.000">R$ 8.000 - R$ 12.000</option>
                    <option value="R$ 12.000+">R$ 12.000+</option>
                  </select>
                </div>
                <div>
                  <label className="admin-label">Número de Viajantes</label>
                  <input
                    type="number"
                    className="admin-input"
                    value={formData.travelers}
                    onChange={(e) => setFormData({...formData, travelers: parseInt(e.target.value)})}
                    min="1"
                  />
                </div>
                <div>
                  <label className="admin-label">Data de Partida</label>
                  <input
                    type="date"
                    className="admin-input"
                    value={formData.departureDate}
                    onChange={(e) => setFormData({...formData, departureDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="admin-label">Origem</label>
                  <select 
                    className="admin-input"
                    value={formData.source}
                    onChange={(e) => setFormData({...formData, source: e.target.value})}
                  >
                    <option value="Site">Site</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Facebook">Facebook</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="admin-label">Observações</label>
                  <textarea
                    className="admin-input h-24 resize-none"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button 
                  onClick={handleCreateLead}
                  disabled={!formData.name || !formData.email || !formData.destination}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2 rounded-lg hover:scale-105 transition-all duration-200 border-0 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✅ Criar Lead
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

      {/* Edit Lead Form Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-admin-bg-overlay z-50 flex items-center justify-center p-4">
          <div className="admin-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="admin-card-header">
              <div className="flex justify-between items-center">
                <h2 className="admin-card-title">Editar Lead</h2>
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
                  <label className="admin-label">Nome *</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="admin-label">Email *</label>
                  <input
                    type="email"
                    className="admin-input"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="admin-label">Telefone</label>
                  <input
                    type="tel"
                    className="admin-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
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
                  <label className="admin-label">Orçamento</label>
                  <select 
                    className="admin-input"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    <option value="R$ 1.000 - R$ 3.000">R$ 1.000 - R$ 3.000</option>
                    <option value="R$ 3.000 - R$ 5.000">R$ 3.000 - R$ 5.000</option>
                    <option value="R$ 5.000 - R$ 8.000">R$ 5.000 - R$ 8.000</option>
                    <option value="R$ 8.000 - R$ 12.000">R$ 8.000 - R$ 12.000</option>
                    <option value="R$ 12.000+">R$ 12.000+</option>
                  </select>
                </div>
                <div>
                  <label className="admin-label">Número de Viajantes</label>
                  <input
                    type="number"
                    className="admin-input"
                    value={formData.travelers}
                    onChange={(e) => setFormData({...formData, travelers: parseInt(e.target.value)})}
                    min="1"
                  />
                </div>
                <div>
                  <label className="admin-label">Data de Partida</label>
                  <input
                    type="date"
                    className="admin-input"
                    value={formData.departureDate}
                    onChange={(e) => setFormData({...formData, departureDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="admin-label">Status</label>
                  <select 
                    className="admin-input"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Novo">Novo</option>
                    <option value="Em contato">Em contato</option>
                    <option value="Proposta">Proposta</option>
                    <option value="Convertido">Convertido</option>
                    <option value="Perdido">Perdido</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="admin-label">Observações</label>
                  <textarea
                    className="admin-input h-24 resize-none"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button 
                  onClick={handleEditLead}
                  disabled={!formData.name || !formData.email || !formData.destination}
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