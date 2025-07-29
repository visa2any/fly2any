'use client';

import React, { useState } from 'react';
import Timeline360 from '@/components/customers/Timeline360';

const customersData = [
  {
    id: 1,
    name: 'Maria Silva',
    email: 'maria@email.com',
    phone: '+55 11 99999-9999',
    totalTrips: 3,
    totalSpent: 15650,
    lastTrip: '2024-01-10',
    status: 'VIP',
    birthDate: '1985-03-15',
    address: 'Rua das Flores, 123 - São Paulo, SP',
    preferences: 'Resorts all-inclusive, viagens românticas',
    notes: 'Cliente preferencial, sempre indica amigos',
    createdAt: '2023-05-15T14:30:00'
  },
  {
    id: 2,
    name: 'João Santos',
    email: 'joao@email.com',
    phone: '+55 11 88888-8888',
    totalTrips: 1,
    totalSpent: 8200,
    lastTrip: '2023-12-05',
    status: 'Regular',
    birthDate: '1990-07-22',
    address: 'Av. Paulista, 456 - São Paulo, SP',
    preferences: 'Viagens de negócios, hotéis centrais',
    notes: 'Executivo, prefere voos pela manhã',
    createdAt: '2023-11-20T09:15:00'
  },
  {
    id: 3,
    name: 'Ana Costa',
    email: 'ana@email.com',
    phone: '+55 11 77777-7777',
    totalTrips: 5,
    totalSpent: 32400,
    lastTrip: '2024-01-20',
    status: 'Premium',
    birthDate: '1978-11-08',
    address: 'Rua Oscar Freire, 789 - São Paulo, SP',
    preferences: 'Destinos exóticos, hotéis de luxo',
    notes: 'Família com 2 filhos, prefere férias escolares',
    createdAt: '2022-08-10T16:45:00'
  },
  {
    id: 4,
    name: 'Pedro Lima',
    email: 'pedro@email.com',
    phone: '+55 11 66666-6666',
    totalTrips: 2,
    totalSpent: 12800,
    lastTrip: '2023-09-15',
    status: 'Regular',
    birthDate: '1992-12-03',
    address: 'Alameda Santos, 321 - São Paulo, SP',
    preferences: 'Mochilão, destinos alternativos',
    notes: 'Jovem aventureiro, orçamento limitado',
    createdAt: '2023-07-05T11:20:00'
  }
];

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
    'VIP': 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-300',
    'Premium': 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-300',
    'Regular': 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-300'
  };
  return badges[status as keyof typeof badges] || 'inline-flex items-center px-3 py-1 text-xs font-medium rounded-full-neutral';
};

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedCustomer, setSelectedCustomer] = useState<typeof customersData[0] | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [show360View, setShow360View] = useState(false);
  const [customers, setCustomers] = useState(customersData);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    address: '',
    preferences: '',
    notes: '',
    status: 'Regular'
  });

  const statusOptions = ['Todos', 'VIP', 'Premium', 'Regular'];

  const filteredCustomers = customers.filter(customer => {
    const matchesStatus = selectedStatus === 'Todos' || customer.status === selectedStatus;
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: customers.length,
    vip: customers.filter(c => c.status === 'VIP').length,
    premium: customers.filter(c => c.status === 'Premium').length,
    regular: customers.filter(c => c.status === 'Regular').length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    avgSpent: customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length
  };

  const handleCreateCustomer = () => {
    const newCustomer = {
      id: customers.length + 1,
      ...formData,
      totalTrips: 0,
      totalSpent: 0,
      lastTrip: '',
      createdAt: new Date().toISOString()
    };
    setCustomers([newCustomer, ...customers]);
    setShowCreateForm(false);
    resetForm();
  };

  const handleEditCustomer = () => {
    if (selectedCustomer) {
      setCustomers(customers.map(customer => 
        customer.id === selectedCustomer.id 
          ? { ...customer, ...formData }
          : customer
      ));
      setShowEditForm(false);
      setSelectedCustomer(null);
      resetForm();
    }
  };

  const handleDeleteCustomer = (customerId: number) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      setCustomers(customers.filter(customer => customer.id !== customerId));
      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer(null);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      birthDate: '',
      address: '',
      preferences: '',
      notes: '',
      status: 'Regular'
    });
  };

  const openEditForm = (customer: typeof customersData[0]) => {
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      birthDate: customer.birthDate,
      address: customer.address,
      preferences: customer.preferences,
      notes: customer.notes,
      status: customer.status
    });
    setShowEditForm(true);
    setSelectedCustomer(customer);
  };

  return (
    <div style={{
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Success Banner */}
      <div style={{
        backgroundColor: '#10b981',
        color: 'white',
        padding: '12px 0',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: '600',
        marginBottom: '20px'
      }}>
        ✅ CLIENTES FUNCIONANDO! Sistema completo de gestão de clientes
      </div>

      {/* Main Content - Full Width */}
      <div style={{
        width: '100%',
        padding: '20px'
      }}>
        {/* Header - Full Width */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#3b82f6',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
                fontWeight: 'bold'
              }}>👥</div>
              <div>
                <h1 style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  margin: '0 0 4px 0'
                }}>Gestão de Clientes</h1>
                <p style={{
                  fontSize: '16px',
                  color: '#6b7280',
                  margin: '0'
                }}>Gerencie e acompanhe todos os clientes da sua agência</p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                padding: '8px 16px',
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#22c55e',
                  borderRadius: '50%'
                }}></div>
                {stats.total} Clientes
              </div>
              <button 
                onClick={() => setShowCreateForm(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                👤 Novo Cliente
              </button>
            </div>
          </div>
        </div>

        {/* Stats - aplicando o padrão já usado */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
        <div className="glass-card rounded-xl p-6 text-center shadow-lg shadow-gray-200/50 group hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center text-2xl shadow-lg">
              👥
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-2 text-3xl font-bold mb-1 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {stats.total}
          </div>
          <div className="text-sm font-medium text-slate-600 text-gray-500 font-medium">Total de Clientes</div>
        </div>
        <div className="glass-card rounded-xl p-6 text-center shadow-lg shadow-gray-200/50 group hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center text-2xl shadow-lg">
              👑
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-2 text-3xl font-bold mb-1 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {stats.vip}
          </div>
          <div className="text-sm font-medium text-slate-600 text-gray-500 font-medium">Clientes VIP</div>
        </div>
        <div className="glass-card rounded-xl p-6 text-center shadow-lg shadow-gray-200/50 group hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center justify-center text-2xl shadow-lg">
              💰
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-2 text-3xl font-bold mb-1 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div className="text-sm font-medium text-slate-600 text-gray-500 font-medium">Receita Total</div>
        </div>
        <div className="glass-card rounded-xl p-6 text-center shadow-lg shadow-gray-200/50 group hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center justify-center text-2xl shadow-lg">
              📊
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-2 text-3xl font-bold mb-1 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {formatCurrency(stats.avgSpent)}
          </div>
          <div className="text-sm font-medium text-slate-600 text-gray-500 font-medium">Ticket Médio</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <label className="block text-sm font-medium text-slate-700 mb-2">Buscar</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
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
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
          <h2 className="bg-white rounded-xl shadow-lg border border-gray-200-title">Clientes ({filteredCustomers.length})</h2>
          <p className="bg-white rounded-xl shadow-lg border border-gray-200-description">
            Lista de todos os clientes cadastrados
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-slate-200">
                  <th className="text-left py-3 px-2 text-text-slate-600 font-medium">Cliente</th>
                  <th className="text-left py-3 px-2 text-text-slate-600 font-medium">Viagens</th>
                  <th className="text-left py-3 px-2 text-text-slate-600 font-medium">Gasto Total</th>
                  <th className="text-left py-3 px-2 text-text-slate-600 font-medium">Última Viagem</th>
                  <th className="text-left py-3 px-2 text-text-slate-600 font-medium">Status</th>
                  <th className="text-left py-3 px-2 text-text-slate-600 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-border-slate-200 hover:bg-bg-slate-100/30">
                    <td className="py-3 px-2">
                      <div>
                        <div className="font-semibold text-text-slate-900">{customer.name}</div>
                        <div className="text-sm text-text-slate-600">{customer.email}</div>
                        <div className="text-sm text-text-slate-600">{customer.phone}</div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-text-slate-900 font-semibold">{customer.totalTrips}</td>
                    <td className="py-3 px-2 text-text-slate-900 font-semibold">{formatCurrency(customer.totalSpent)}</td>
                    <td className="py-3 px-2 text-text-slate-600">
                      {customer.lastTrip ? formatDate(customer.lastTrip) : 'Nenhuma'}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(customer.status)}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex gap-2">
                        <button 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs py-1 px-3 rounded-lg hover:scale-105 transition-all duration-200 border-0"
                          onClick={() => setSelectedCustomer(customer)}
                        >
                          👁️ Ver
                        </button>
                        <button 
                          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs py-1 px-3 rounded-lg hover:scale-105 transition-all duration-200 border-0"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShow360View(true);
                          }}
                        >
                          🎯 360°
                        </button>
                        <button 
                          className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs py-1 px-3 rounded-lg hover:scale-105 transition-all duration-200 border-0"
                          onClick={() => openEditForm(customer)}
                        >
                          ✏️ Editar
                        </button>
                        <button 
                          className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs py-1 px-3 rounded-lg hover:scale-105 transition-all duration-200 border-0"
                          onClick={() => handleDeleteCustomer(customer.id)}
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

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-admin-bg-overlay z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
              <div className="flex justify-between items-center">
                <h2 className="bg-white rounded-xl shadow-lg border border-gray-200-title">Detalhes do Cliente</h2>
                <button 
                  className="text-text-slate-600 hover:text-text-slate-900"
                  onClick={() => setSelectedCustomer(null)}
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nome</label>
                  <div className="text-text-slate-900 font-semibold">{selectedCustomer.name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(selectedCustomer.status)}`}>
                    {selectedCustomer.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <div className="text-text-slate-900">{selectedCustomer.email}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Telefone</label>
                  <div className="text-text-slate-900">{selectedCustomer.phone}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Data de Nascimento</label>
                  <div className="text-text-slate-900">{formatDate(selectedCustomer.birthDate)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Cliente desde</label>
                  <div className="text-text-slate-900">{formatDate(selectedCustomer.createdAt)}</div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Endereço</label>
                  <div className="text-text-slate-900">{selectedCustomer.address}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Total de Viagens</label>
                  <div className="text-text-slate-900 font-semibold">{selectedCustomer.totalTrips}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Gasto Total</label>
                  <div className="text-text-slate-900 font-semibold">{formatCurrency(selectedCustomer.totalSpent)}</div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Preferências</label>
                  <div className="text-text-slate-900">{selectedCustomer.preferences}</div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Observações</label>
                  <div className="text-text-slate-900">{selectedCustomer.notes}</div>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button 
                  onClick={() => setShow360View(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-200 border-0 font-medium flex items-center gap-2"
                >
                  🎯 Visão 360°
                </button>
                <button 
                  onClick={() => alert('Redirecionando para WhatsApp...')}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-200 border-0 font-medium flex items-center gap-2"
                >
                  💬 WhatsApp
                </button>
                <button 
                  onClick={() => openEditForm(selectedCustomer)}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-200 border-0 font-medium flex items-center gap-2"
                >
                  ✏️ Editar
                </button>
                <button 
                  onClick={() => alert('Enviando email promocional...')}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-200 border-0 font-medium flex items-center gap-2"
                >
                  📧 Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Customer Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-admin-bg-overlay z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
              <div className="flex justify-between items-center">
                <h2 className="bg-white rounded-xl shadow-lg border border-gray-200-title">Criar Novo Cliente</h2>
                <button 
                  className="text-text-slate-600 hover:text-text-slate-900"
                  onClick={() => { setShowCreateForm(false); resetForm(); }}
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nome *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Telefone</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Data de Nascimento</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <select 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Regular">Regular</option>
                    <option value="Premium">Premium</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Endereço</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Preferências</label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                    value={formData.preferences}
                    onChange={(e) => setFormData({...formData, preferences: e.target.value})}
                    placeholder="Destinos preferidos, tipo de acomodação, etc..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Observações</label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button 
                  onClick={handleCreateCustomer}
                  disabled={!formData.name || !formData.email}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:scale-105 transition-all duration-200 border-0 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✅ Criar Cliente
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

      {/* Edit Customer Form Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-admin-bg-overlay z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
              <div className="flex justify-between items-center">
                <h2 className="bg-white rounded-xl shadow-lg border border-gray-200-title">Editar Cliente</h2>
                <button 
                  className="text-text-slate-600 hover:text-text-slate-900"
                  onClick={() => { setShowEditForm(false); resetForm(); }}
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nome *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Telefone</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Data de Nascimento</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <select 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Regular">Regular</option>
                    <option value="Premium">Premium</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Endereço</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Preferências</label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                    value={formData.preferences}
                    onChange={(e) => setFormData({...formData, preferences: e.target.value})}
                    placeholder="Destinos preferidos, tipo de acomodação, etc..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Observações</label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button 
                  onClick={handleEditCustomer}
                  disabled={!formData.name || !formData.email}
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

      {/* Customer 360 View Modal */}
      {show360View && selectedCustomer && (
        <div className="fixed inset-0 bg-admin-bg-overlay z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                🎯 Visão 360° - {selectedCustomer.name}
              </h2>
              <button 
                className="text-gray-500 hover:text-gray-700 text-2xl"
                onClick={() => setShow360View(false)}
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <Timeline360 customerId={selectedCustomer.id} />
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}