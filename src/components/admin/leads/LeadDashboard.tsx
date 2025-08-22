'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  LayoutGrid, 
  List, 
  Plus, 
  RefreshCw, 
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Filter,
  Search,
  Download,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  MessageSquare,
  Loader2,
  BarChart3,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Import enhanced components
import { EnhancedLeadCard } from './EnhancedLeadCard';
import { LeadTableView } from './LeadTableView';
import { LeadFilters, FilterState } from './LeadFilters';
import { BulkActions } from './BulkActions';
import { LeadTag } from './TagManager';

interface Lead {
  id: string;
  nome: string;
  email: string;
  whatsapp?: string;
  telefone?: string;
  origem?: string;
  destino?: string;
  dataPartida?: string;
  dataRetorno?: string;
  numeroPassageiros?: number;
  status: string;
  source: string;
  createdAt: string;
  orcamentoTotal?: number;
  priority?: 'baixa' | 'media' | 'alta' | 'urgente';
  assignedTo?: string;
  notes?: string;
  lastActivity?: string;
  score?: number;
  tags?: Array<{
    id: string;
    name: string;
    color: string;
    category: string;
  }>;
}

interface LeadsStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  conversion: number;
  avgValue: number;
  avgResponseTime: number;
  activeLeads: number;
  closedLeads: number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
  byPriority: Record<string, number>;
  recentActivity: Array<{
    id: string;
    type: 'created' | 'updated' | 'contacted' | 'converted';
    leadName: string;
    timestamp: string;
    details: string;
  }>;
}

interface SystemHealth {
  emailQueue: {
    pending: number;
    processing: number;
    failed: number;
    avgProcessingTime: number;
  };
  notifications: {
    lastSent: string | null;
    successRate: number;
    failureRate: number;
  };
  database: {
    status: 'healthy' | 'warning' | 'critical';
    responseTime: number;
  };
}

interface LeadDashboardProps {
  className?: string;
}

export function LeadDashboard({ className = '' }: LeadDashboardProps) {
  // State management
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadsStats>({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    conversion: 0,
    avgValue: 0,
    avgResponseTime: 0,
    activeLeads: 0,
    closedLeads: 0,
    byStatus: {},
    bySource: {},
    byPriority: {},
    recentActivity: []
  });
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    emailQueue: { pending: 0, processing: 0, failed: 0, avgProcessingTime: 0 },
    notifications: { lastSent: null, successRate: 0, failureRate: 0 },
    database: { status: 'healthy', responseTime: 0 }
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<LeadTag[]>([]);
  const [showSystemHealth, setShowSystemHealth] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: [],
    priority: [],
    source: [],
    assignedTo: '',
    dateRange: { from: undefined, to: undefined },
    budgetRange: { min: undefined, max: undefined },
    origem: '',
    destino: '',
    hasNotes: undefined,
    tags: [],
    tagCategories: []
  });

  // Error boundary
  const [hasError, setHasError] = useState(false);

  // Data fetching with error handling
  const fetchData = useCallback(async (showLoadingState = true) => {
    try {
      if (showLoadingState) setLoading(true);
      setError(null);

      // Fetch leads, stats, and system health in parallel
      const [leadsResponse, statsResponse, healthResponse] = await Promise.allSettled([
        fetch('/api/admin/leads?page=1&limit=1000'),
        fetch('/api/admin/leads?stats=true'),
        fetch('/api/admin/system/health')
      ]);

      // Handle leads
      if (leadsResponse.status === 'fulfilled' && leadsResponse.value.ok) {
        const leadsData = await leadsResponse.value.json();
        const leadsWithTags = (leadsData.leads || []).map((lead: Lead) => ({
          ...lead,
          tags: getRandomTags(lead.id) // This would come from your actual tag system
        }));
        setLeads(leadsWithTags);
      } else {
        console.error('Failed to fetch leads:', leadsResponse);
      }

      // Handle stats
      if (statsResponse.status === 'fulfilled' && statsResponse.value.ok) {
        const statsData = await statsResponse.value.json();
        setStats(statsData);
      } else {
        console.error('Failed to fetch stats:', statsResponse);
      }

      // Handle system health
      if (healthResponse.status === 'fulfilled' && healthResponse.value.ok) {
        const healthData = await healthResponse.value.json();
        setSystemHealth(healthData);
      } else {
        // Use mock data for system health if endpoint doesn't exist
        setSystemHealth({
          emailQueue: { pending: 2, processing: 1, failed: 0, avgProcessingTime: 1200 },
          notifications: { lastSent: new Date().toISOString(), successRate: 98.5, failureRate: 1.5 },
          database: { status: 'healthy', responseTime: 45 }
        });
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar dados');
    } finally {
      if (showLoadingState) setLoading(false);
    }
  }, []);

  // Initialize data and auto-refresh
  useEffect(() => {
    fetchData();
    loadMockTags();

    // Set up auto-refresh
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchData(false); // Refresh without loading state
      }, 30000); // Refresh every 30 seconds
      
      setRefreshInterval(interval);
      return () => clearInterval(interval);
    }
  }, [fetchData, autoRefresh]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [refreshInterval]);

  // Error handling
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      setHasError(true);
      setError(event.error?.message || 'Erro inesperado');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Mock tags (replace with your actual tag loading logic)
  const loadMockTags = () => {
    const mockTags: LeadTag[] = [
      { id: '1', name: 'Cliente Premium', color: 'bg-purple-100 text-purple-800 border-purple-200', category: 'quality', description: 'Cliente com alto potencial', count: 12 },
      { id: '2', name: 'Urgente', color: 'bg-red-100 text-red-800 border-red-200', category: 'urgency', description: 'Requer atenção imediata', count: 8 },
      { id: '3', name: 'Facebook', color: 'bg-blue-100 text-blue-800 border-blue-200', category: 'source', description: 'Veio do Facebook', count: 25 },
      { id: '4', name: 'Viagem Negócios', color: 'bg-green-100 text-green-800 border-green-200', category: 'service', description: 'Viagem corporativa', count: 15 },
      { id: '5', name: 'Orçamento Alto', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', category: 'budget', description: 'Orçamento acima de R$ 10k', count: 6 },
      { id: '6', name: 'Retornante', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', category: 'quality', description: 'Cliente já atendido antes', count: 18 }
    ];
    setAvailableTags(mockTags);
  };

  const getRandomTags = (leadId: string) => {
    const tagPool = availableTags;
    const seed = leadId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const numTags = seed % 4;
    const shuffled = [...tagPool].sort(() => (seed % 17) - 8.5);
    return shuffled.slice(0, numTags);
  };

  // Filter leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        if (!lead.nome?.toLowerCase().includes(searchTerm) &&
            !lead.email?.toLowerCase().includes(searchTerm) &&
            !lead.whatsapp?.includes(searchTerm) &&
            !lead.telefone?.includes(searchTerm)) {
          return false;
        }
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(lead.status)) {
        return false;
      }

      // Priority filter
      if (filters.priority.length > 0 && lead.priority && !filters.priority.includes(lead.priority)) {
        return false;
      }

      // Source filter
      if (filters.source.length > 0 && !filters.source.includes(lead.source)) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.from || filters.dateRange.to) {
        const leadDate = new Date(lead.createdAt);
        if (filters.dateRange.from && leadDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && leadDate > filters.dateRange.to) return false;
      }

      // Budget range filter
      if (filters.budgetRange.min && (!lead.orcamentoTotal || lead.orcamentoTotal < filters.budgetRange.min)) {
        return false;
      }
      if (filters.budgetRange.max && (!lead.orcamentoTotal || lead.orcamentoTotal > filters.budgetRange.max)) {
        return false;
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const leadTagIds = lead.tags?.map(tag => tag.id) || [];
        const hasSelectedTag = filters.tags.some(tagId => leadTagIds.includes(tagId));
        if (!hasSelectedTag) return false;
      }

      return true;
    });
  }, [leads, filters]);

  // Lead actions
  const handleEditLead = (lead: Lead) => {
    console.log('Edit lead:', lead.id);
    // TODO: Implement edit modal
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return;
    
    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete lead');

      setLeads(leads.filter(lead => lead.id !== leadId));
      setSelectedLeads(selectedLeads.filter(id => id !== leadId));
      
      // Show success feedback
      console.log('Lead deleted successfully');
    } catch (error) {
      console.error('Error deleting lead:', error);
      setError('Erro ao excluir lead');
    }
  };

  const handleContactLead = async (leadId: string, method: string) => {
    try {
      // This would integrate with your actual contact system
      console.log(`Contacting lead ${leadId} via ${method}`);
      
      // Update lead activity
      const lead = leads.find(l => l.id === leadId);
      if (lead) {
        lead.lastActivity = new Date().toISOString();
        setLeads([...leads]);
      }
    } catch (error) {
      console.error('Error contacting lead:', error);
      setError('Erro ao entrar em contato com lead');
    }
  };

  const handleViewDetails = (lead: Lead) => {
    console.log('View details for lead:', lead.id);
    // TODO: Implement detail modal or navigation
  };

  // Selection management
  const handleSelectLead = (leadId: string, checked: boolean) => {
    if (checked) {
      setSelectedLeads([...selectedLeads, leadId]);
    } else {
      setSelectedLeads(selectedLeads.filter(id => id !== leadId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(filteredLeads.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  // Bulk actions
  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on ${selectedLeads.length} leads`);
    // TODO: Implement bulk actions
  };

  // System health indicator
  const getHealthStatus = () => {
    const { database, notifications, emailQueue } = systemHealth;
    
    if (database.status === 'critical' || notifications.failureRate > 20 || emailQueue.failed > 10) {
      return { status: 'critical', color: 'text-red-600', icon: AlertTriangle };
    }
    
    if (database.status === 'warning' || notifications.failureRate > 5 || emailQueue.pending > 20) {
      return { status: 'warning', color: 'text-yellow-600', icon: Clock };
    }
    
    return { status: 'healthy', color: 'text-green-600', icon: CheckCircle };
  };

  const healthStatus = getHealthStatus();
  const HealthIcon = healthStatus.icon;

  // Error boundary fallback
  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Oops! Algo deu errado</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setHasError(false);
              setError(null);
              fetchData();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Leads</h1>
          <p className="text-gray-600">Gestão inteligente e monitoramento em tempo real</p>
        </div>
        
        <div className="mt-4 lg:mt-0 flex items-center space-x-3">
          {/* System Health Indicator */}
          <button
            onClick={() => setShowSystemHealth(!showSystemHealth)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${healthStatus.color} border-current bg-white hover:bg-gray-50`}
            title="Status do sistema"
          >
            <HealthIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Sistema {healthStatus.status === 'healthy' ? 'Saudável' : healthStatus.status === 'warning' ? 'Alerta' : 'Crítico'}</span>
            {showSystemHealth ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {/* Auto-refresh toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${autoRefresh ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}
            title={autoRefresh ? 'Desativar atualização automática' : 'Ativar atualização automática'}
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span className="text-sm">Auto-refresh</span>
          </button>

          {/* Manual refresh */}
          <button
            onClick={() => fetchData()}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>

          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Novo Lead</span>
          </button>
        </div>
      </div>

      {/* System Health Panel */}
      {showSystemHealth && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status do Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Fila de Email</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Pendentes:</span>
                  <span className="font-medium">{systemHealth.emailQueue.pending}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processando:</span>
                  <span className="font-medium">{systemHealth.emailQueue.processing}</span>
                </div>
                <div className="flex justify-between">
                  <span>Falhados:</span>
                  <span className={`font-medium ${systemHealth.emailQueue.failed > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {systemHealth.emailQueue.failed}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Notificações</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Taxa de Sucesso:</span>
                  <span className="font-medium text-green-600">{systemHealth.notifications.successRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de Falha:</span>
                  <span className={`font-medium ${systemHealth.notifications.failureRate > 5 ? 'text-red-600' : 'text-green-600'}`}>
                    {systemHealth.notifications.failureRate}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Banco de Dados</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={`font-medium capitalize ${
                    systemHealth.database.status === 'healthy' ? 'text-green-600' : 
                    systemHealth.database.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {systemHealth.database.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tempo de Resposta:</span>
                  <span className="font-medium">{systemHealth.database.responseTime}ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Leads</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">+{stats.today} hoje</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Esta Semana</p>
              <p className="text-2xl font-bold text-gray-900">{stats.thisWeek}</p>
              <p className="text-sm text-gray-500">leads captados</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa Conversão</p>
              <p className="text-2xl font-bold text-gray-900">{stats.conversion}%</p>
              <p className="text-sm text-gray-500">leads para vendas</p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Médio</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(stats.avgValue)}
              </p>
              <p className="text-sm text-gray-500">por lead</p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <LeadFilters
        filters={filters}
        onFiltersChange={setFilters}
        onExport={() => console.log('Export leads')}
        onReset={() => setFilters({
          search: '',
          status: [],
          priority: [],
          source: [],
          assignedTo: '',
          dateRange: { from: undefined, to: undefined },
          budgetRange: { min: undefined, max: undefined },
          origem: '',
          destino: '',
          hasNotes: undefined,
          tags: [],
          tagCategories: []
        })}
        totalLeads={leads.length}
        filteredLeads={filteredLeads.length}
        availableTags={availableTags}
      />

      {/* Bulk Actions */}
      <BulkActions
        selectedLeads={selectedLeads}
        totalLeads={filteredLeads.length}
        onClearSelection={() => setSelectedLeads([])}
        onBulkStatusUpdate={(status) => handleBulkAction(`status-${status}`)}
        onBulkAssign={(assignTo) => handleBulkAction(`assign-${assignTo}`)}
        onBulkDelete={() => handleBulkAction('delete')}
        onBulkExport={() => handleBulkAction('export')}
        onBulkEmail={() => handleBulkAction('email')}
        onBulkWhatsApp={() => handleBulkAction('whatsapp')}
        onBulkAddTags={(tagIds) => handleBulkAction(`add-tags-${tagIds.join(',')}`)}
        onBulkRemoveTags={(tagIds) => handleBulkAction(`remove-tags-${tagIds.join(',')}`)}
        availableTags={availableTags}
      />

      {/* View Toggle and Content */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">
                {selectedLeads.length > 0 
                  ? `${selectedLeads.length} selecionado${selectedLeads.length > 1 ? 's' : ''}`
                  : `${filteredLeads.length} lead${filteredLeads.length !== 1 ? 's' : ''} encontrado${filteredLeads.length !== 1 ? 's' : ''}`
                }
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title="Visualização em cards"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title="Visualização em tabela"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Carregando leads...</span>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum lead encontrado</h3>
              <p className="text-gray-600 mb-6">Tente ajustar os filtros ou adicionar novos leads</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="h-4 w-4 mr-2 inline" />
                Adicionar Novo Lead
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredLeads.map((lead) => (
                <EnhancedLeadCard
                  key={lead.id}
                  lead={lead}
                  isSelected={selectedLeads.includes(lead.id)}
                  onEdit={handleEditLead}
                  onDelete={handleDeleteLead}
                  onAssign={(id) => console.log('Assign', id)}
                  onContact={handleContactLead}
                  onSelect={handleSelectLead}
                />
              ))}
            </div>
          ) : (
            <LeadTableView
              leads={filteredLeads}
              selectedLeads={selectedLeads}
              onSelectLead={handleSelectLead}
              onSelectAll={handleSelectAll}
              onEdit={handleEditLead}
              onDelete={handleDeleteLead}
              onAssign={(id) => console.log('Assign', id)}
              onContact={handleContactLead}
              onViewDetails={handleViewDetails}
            />
          )}
        </div>
      </div>
    </div>
  );
}