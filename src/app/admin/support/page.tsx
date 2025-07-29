'use client';

import React, { useState } from 'react';

const ticketsData = [
  {
    id: 1,
    subject: 'Problema com reserva de hotel',
    customer: 'Maria Silva',
    email: 'maria@email.com',
    priority: 'Alta',
    status: 'Aberto',
    category: 'Reservas',
    createdAt: '2024-01-15T10:30:00',
    updatedAt: '2024-01-15T14:20:00',
    description: 'Cliente relata que não conseguiu confirmar a reserva do hotel em Paris. Sistema apresentou erro durante o pagamento.',
    messages: [
      {
        id: 1,
        sender: 'Maria Silva',
        type: 'customer',
        message: 'Estou tentando fazer a reserva há 2 dias mas o sistema não aceita meu cartão.',
        timestamp: '2024-01-15T10:30:00'
      },
      {
        id: 2,
        sender: 'Suporte',
        type: 'agent',
        message: 'Olá Maria, vamos verificar o problema. Pode me informar os últimos 4 dígitos do cartão?',
        timestamp: '2024-01-15T11:15:00'
      }
    ]
  },
  {
    id: 2,
    subject: 'Cancelamento de viagem',
    customer: 'João Santos',
    email: 'joao@email.com',
    priority: 'Média',
    status: 'Em andamento',
    category: 'Cancelamentos',
    createdAt: '2024-01-15T09:15:00',
    updatedAt: '2024-01-15T13:45:00',
    description: 'Cliente deseja cancelar viagem para Londres devido a problemas pessoais.',
    messages: [
      {
        id: 1,
        sender: 'João Santos',
        type: 'customer',
        message: 'Preciso cancelar minha viagem para Londres. É possível reembolso?',
        timestamp: '2024-01-15T09:15:00'
      }
    ]
  },
  {
    id: 3,
    subject: 'Dúvida sobre documentação',
    customer: 'Ana Costa',
    email: 'ana@email.com',
    priority: 'Baixa',
    status: 'Resolvido',
    category: 'Documentação',
    createdAt: '2024-01-14T16:20:00',
    updatedAt: '2024-01-15T08:30:00',
    description: 'Cliente tem dúvidas sobre visto para Dubai.',
    messages: [
      {
        id: 1,
        sender: 'Ana Costa',
        type: 'customer',
        message: 'Preciso de visto para viajar para Dubai?',
        timestamp: '2024-01-14T16:20:00'
      },
      {
        id: 2,
        sender: 'Suporte',
        type: 'agent',
        message: 'Para brasileiros, não é necessário visto para Dubai para estadias de até 90 dias.',
        timestamp: '2024-01-15T08:30:00'
      }
    ]
  }
];

const priorityOptions = ['Todas', 'Alta', 'Média', 'Baixa'];
const statusOptions = ['Todos', 'Aberto', 'Em andamento', 'Resolvido', 'Fechado'];
const categoryOptions = ['Todas', 'Reservas', 'Cancelamentos', 'Documentação', 'Pagamentos', 'Outros'];

const getPriorityBadge = (priority: string) => {
  const badges = {
    'Alta': 'admin-badge admin-badge-danger',
    'Média': 'admin-badge admin-badge-warning',
    'Baixa': 'admin-badge admin-badge-info'
  };
  return badges[priority as keyof typeof badges] || 'admin-badge admin-badge-neutral';
};

const getStatusBadge = (status: string) => {
  const badges = {
    'Aberto': 'admin-badge admin-badge-danger',
    'Em andamento': 'admin-badge admin-badge-warning',
    'Resolvido': 'admin-badge admin-badge-success',
    'Fechado': 'admin-badge admin-badge-neutral'
  };
  return badges[status as keyof typeof badges] || 'admin-badge admin-badge-neutral';
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('pt-BR');
};

export default function SupportPage() {
  const [selectedPriority, setSelectedPriority] = useState('Todas');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<typeof ticketsData[0] | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [showEditTicket, setShowEditTicket] = useState(false);
  const [tickets, setTickets] = useState(ticketsData);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    customer: '',
    email: '',
    priority: 'Média',
    category: 'Outros',
    description: ''
  });

  const filteredTickets = tickets.filter(ticket => {
    const matchesPriority = selectedPriority === 'Todas' || ticket.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'Todos' || ticket.status === selectedStatus;
    const matchesCategory = selectedCategory === 'Todas' || ticket.category === selectedCategory;
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesPriority && matchesStatus && matchesCategory && matchesSearch;
  });

  const stats = {
    total: tickets.length,
    aberto: tickets.filter(t => t.status === 'Aberto').length,
    andamento: tickets.filter(t => t.status === 'Em andamento').length,
    resolvido: tickets.filter(t => t.status === 'Resolvido').length,
    alta: tickets.filter(t => t.priority === 'Alta').length
  };

  const handleCreateTicket = () => {
    const newTicket = {
      id: tickets.length + 1,
      ...ticketForm,
      status: 'Aberto',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [{
        id: 1,
        sender: ticketForm.customer,
        type: 'customer' as const,
        message: ticketForm.description,
        timestamp: new Date().toISOString()
      }]
    };
    setTickets([newTicket, ...tickets]);
    setShowCreateTicket(false);
    resetTicketForm();
  };

  const handleUpdateTicketStatus = (ticketId: number, newStatus: string) => {
    setTickets(tickets.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, status: newStatus, updatedAt: new Date().toISOString() }
        : ticket
    ));
  };

  const handleDeleteTicket = (ticketId: number) => {
    if (confirm('Tem certeza que deseja excluir este ticket?')) {
      setTickets(tickets.filter(ticket => ticket.id !== ticketId));
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(null);
      }
    }
  };

  const resetTicketForm = () => {
    setTicketForm({
      subject: '',
      customer: '',
      email: '',
      priority: 'Média',
      category: 'Outros',
      description: ''
    });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedTicket) {
      // Aqui seria integrado com a API para enviar a mensagem
      console.log('Enviando mensagem:', newMessage);
      setNewMessage('');
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
                Central de Suporte
              </h1>
              <p className="text-sm text-admin-text-secondary">
                Tickets de suporte e atendimento
              </p>
            </div>
            <button 
              onClick={() => setShowCreateTicket(true)}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-0 font-semibold flex items-center gap-2"
            >
              <span className="text-lg">🎫</span>
              Novo Ticket
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="admin-stats-card">
          <div className="admin-stats-value">{stats.total}</div>
          <div className="admin-stats-label">Total de Tickets</div>
        </div>
        <div className="admin-stats-card">
          <div className="admin-stats-value text-red-600">{stats.aberto}</div>
          <div className="admin-stats-label">Abertos</div>
        </div>
        <div className="admin-stats-card">
          <div className="admin-stats-value text-amber-600">{stats.andamento}</div>
          <div className="admin-stats-label">Em Andamento</div>
        </div>
        <div className="admin-stats-card">
          <div className="admin-stats-value text-emerald-600">{stats.resolvido}</div>
          <div className="admin-stats-label">Resolvidos</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <label className="admin-label">Buscar</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Assunto, cliente ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="admin-label">Status</label>
              <select 
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="admin-label">Prioridade</label>
              <select 
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
              >
                {priorityOptions.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="admin-label">Categoria</label>
              <select 
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categoryOptions.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
          <h2 className="bg-white rounded-xl shadow-lg border border-gray-200-title">Tickets ({filteredTickets.length})</h2>
          <p className="bg-white rounded-xl shadow-lg border border-gray-200-description">
            Lista de todos os tickets de suporte
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-admin-border-color">
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">ID</th>
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">Assunto</th>
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">Cliente</th>
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">Categoria</th>
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">Prioridade</th>
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">Status</th>
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">Atualizado</th>
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-admin-border-color hover:bg-admin-bg-secondary/30">
                    <td className="py-3 px-2 text-admin-text-primary font-mono">#{ticket.id}</td>
                    <td className="py-3 px-2">
                      <div className="font-medium text-admin-text-primary">{ticket.subject}</div>
                      <div className="text-sm text-admin-text-secondary truncate max-w-48">
                        {ticket.description}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-medium text-admin-text-primary">{ticket.customer}</div>
                      <div className="text-sm text-admin-text-secondary">{ticket.email}</div>
                    </td>
                    <td className="py-3 px-2 text-admin-text-primary">{ticket.category}</td>
                    <td className="py-3 px-2">
                      <span className={getPriorityBadge(ticket.priority)}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className={getStatusBadge(ticket.status)}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-admin-text-secondary text-sm">
                      {formatDateTime(ticket.updatedAt)}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex gap-2">
                        <button 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs py-1 px-3 rounded-lg hover:scale-105 transition-all duration-200 border-0"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          👁️ Ver
                        </button>
                        <select 
                          value={ticket.status}
                          onChange={(e) => handleUpdateTicketStatus(ticket.id, e.target.value)}
                          className="text-xs border rounded px-2 py-1"
                        >
                          <option value="Aberto">Aberto</option>
                          <option value="Em andamento">Em andamento</option>
                          <option value="Resolvido">Resolvido</option>
                          <option value="Fechado">Fechado</option>
                        </select>
                        <button 
                          className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs py-1 px-3 rounded-lg hover:scale-105 transition-all duration-200 border-0"
                          onClick={() => handleDeleteTicket(ticket.id)}
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

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-admin-bg-overlay z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="bg-white rounded-xl shadow-lg border border-gray-200-title">Ticket #{selectedTicket.id}</h2>
                  <p className="bg-white rounded-xl shadow-lg border border-gray-200-description">{selectedTicket.subject}</p>
                </div>
                <button 
                  className="text-admin-text-secondary hover:text-admin-text-primary"
                  onClick={() => setSelectedTicket(null)}
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-200-content flex-1 overflow-y-auto">
              {/* Ticket Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-admin-bg-secondary/30 rounded-lg">
                <div>
                  <label className="admin-label">Cliente</label>
                  <div className="text-admin-text-primary">{selectedTicket.customer}</div>
                  <div className="text-sm text-admin-text-secondary">{selectedTicket.email}</div>
                </div>
                <div>
                  <label className="admin-label">Status</label>
                  <span className={getStatusBadge(selectedTicket.status)}>
                    {selectedTicket.status}
                  </span>
                </div>
                <div>
                  <label className="admin-label">Prioridade</label>
                  <span className={getPriorityBadge(selectedTicket.priority)}>
                    {selectedTicket.priority}
                  </span>
                </div>
                <div>
                  <label className="admin-label">Categoria</label>
                  <div className="text-admin-text-primary">{selectedTicket.category}</div>
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-4">
                <h3 className="font-semibold text-admin-text-primary">Conversação</h3>
                {selectedTicket.messages.map((message) => (
                  <div key={message.id} className={`p-4 rounded-lg ${
                    message.type === 'customer' 
                      ? 'bg-admin-bg-secondary/50 ml-8' 
                      : 'bg-blue-50 mr-8'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium text-admin-text-primary">
                        {message.sender}
                      </div>
                      <div className="text-sm text-admin-text-secondary">
                        {formatDateTime(message.timestamp)}
                      </div>
                    </div>
                    <div className="text-admin-text-primary">
                      {message.message}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <div className="mt-6 border-t border-admin-border-color pt-6">
                <label className="admin-label">Nova Mensagem</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                  placeholder="Digite sua resposta..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <div className="flex gap-2 mt-4">
                  <button 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-200 border-0 font-medium"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    📤 Enviar Resposta
                  </button>
                  <button 
                    onClick={() => selectedTicket && handleUpdateTicketStatus(selectedTicket.id, 'Resolvido')}
                    className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-200 border-0 font-medium"
                  >
                    ✅ Resolver
                  </button>
                  <button 
                    onClick={() => selectedTicket && setTickets(tickets.map(t => 
                      t.id === selectedTicket.id ? {...t, priority: 'Alta', updatedAt: new Date().toISOString()} : t
                    ))}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-200 border-0 font-medium"
                  >
                    ⚠️ Escalar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateTicket && (
        <div className="fixed inset-0 bg-admin-bg-overlay z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
              <div className="flex justify-between items-center">
                <h2 className="bg-white rounded-xl shadow-lg border border-gray-200-title">Criar Novo Ticket</h2>
                <button 
                  className="text-admin-text-secondary hover:text-admin-text-primary"
                  onClick={() => { setShowCreateTicket(false); resetTicketForm(); }}
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Nome do Cliente *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={ticketForm.customer}
                    onChange={(e) => setTicketForm({...ticketForm, customer: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="admin-label">Email *</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={ticketForm.email}
                    onChange={(e) => setTicketForm({...ticketForm, email: e.target.value})}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="admin-label">Assunto *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="admin-label">Prioridade</label>
                  <select 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm({...ticketForm, priority: e.target.value})}
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                  </select>
                </div>
                <div>
                  <label className="admin-label">Categoria</label>
                  <select 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
                  >
                    <option value="Reservas">Reservas</option>
                    <option value="Cancelamentos">Cancelamentos</option>
                    <option value="Documentação">Documentação</option>
                    <option value="Pagamentos">Pagamentos</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="admin-label">Descrição do Problema *</label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 resize-none"
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button 
                  onClick={handleCreateTicket}
                  disabled={!ticketForm.subject || !ticketForm.customer || !ticketForm.email || !ticketForm.description}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-2 rounded-lg hover:scale-105 transition-all duration-200 border-0 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🎫 Criar Ticket
                </button>
                <button 
                  onClick={() => { setShowCreateTicket(false); resetTicketForm(); }}
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