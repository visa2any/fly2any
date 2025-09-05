'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
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
  MoreVertical
} from 'lucide-react';

// Import our new components
import { LeadCard } from '@/components/admin/leads/LeadCard';
import { LeadEditModal } from '@/components/admin/leads/LeadEditModal';
import { LeadFilters, FilterState } from '@/components/admin/leads/LeadFilters';
import { BulkActions } from '@/components/admin/leads/BulkActions';
import { LeadTag } from '@/components/admin/leads/TagManager';

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
}

interface ActivityItem {
  id: string;
  type: 'lead_created' | 'lead_updated' | 'lead_deleted' | 'lead_assigned' | 'lead_contacted';
  leadId: string;
  leadName: string;
  description: string;
  timestamp: Date;
  user: string;
  metadata?: any;
}

interface NotificationItem {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Shared service configuration to avoid redundancy
const getServiceConfig = () => ({
  voos: { icon: '✈️', name: 'Voos', cssClass: 'admin-stats-card-voos admin-stats-card-primary', valueClass: 'admin-stats-value-voos', color: 'blue' },
  hoteis: { icon: '🏨', name: 'Hotéis', cssClass: 'admin-stats-card-hoteis admin-stats-card-success', valueClass: 'admin-stats-value-hoteis', color: 'green' },
  carros: { icon: '🚗', name: 'Carros', cssClass: 'admin-stats-card-carros admin-stats-card-warning', valueClass: 'admin-stats-value-carros', color: 'amber' },
  passeios: { icon: '🌄', name: 'Passeios', cssClass: 'admin-stats-card-passeios admin-stats-card-purple', valueClass: 'admin-stats-value-passeios', color: 'purple' },
  seguro: { icon: '🛡️', name: 'Seguro', cssClass: 'admin-stats-card-seguro admin-stats-card', valueClass: 'admin-stats-value-seguro', color: 'red' }
});

// Consolidated tag data to avoid redundancy
const getMockTagsData = () => [
  { id: '1', name: 'Cliente Premium', color: 'bg-purple-100 text-purple-800 border-purple-200', category: 'quality', description: 'Cliente com alto potencial', count: 12 },
  { id: '2', name: 'Urgente', color: 'bg-red-100 text-red-800 border-red-200', category: 'urgency', description: 'Requer atenção imediata', count: 8 },
  { id: '3', name: 'Facebook', color: 'bg-blue-100 text-blue-800 border-blue-200', category: 'source', description: 'Veio do Facebook', count: 25 },
  { id: '4', name: 'Viagem Negócios', color: 'bg-green-100 text-green-800 border-green-200', category: 'service', description: 'Viagem corporativa', count: 15 },
  { id: '5', name: 'Orçamento Alto', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', category: 'budget', description: 'Orçamento acima de R$ 10k', count: 6 },
  { id: '6', name: 'Retornante', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', category: 'quality', description: 'Cliente já atendido antes', count: 18 }
];

export default function ModernLeadsPage() {
  const { toast } = useToast();
  
  // State management
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadsStats>({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    conversion: 0,
    avgValue: 0
  });
  
  // Advanced search state
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  // Real-time updates - Initialize with null to prevent hydration mismatch
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [isClient, setIsClient] = useState(false);
  
  // Safe date formatting functions to prevent hydration mismatch
  const formatTime = (date: Date): string => {
    if (!isClient) return '';
    return date.toLocaleTimeString('pt-BR');
  };
  
  const formatDateTime = (date: Date): string => {
    if (!isClient) return '';
    return date.toLocaleString('pt-BR');
  };
  
  const formatDate = (date: Date): string => {
    if (!isClient) return '';
    return date.toLocaleDateString('pt-BR');
  };
  
  // Activity Timeline
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [realTimeNotifications, setRealTimeNotifications] = useState<NotificationItem[]>([]);

  // Activity tracking functions
  const addActivity = (type: ActivityItem['type'], leadId: string, leadName: string, description: string, metadata?: any) => {
    // Only add activities on client-side to prevent hydration mismatch
    if (!isClient) return;
    
    const newActivity: ActivityItem = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      leadId,
      leadName,
      description,
      timestamp: new Date(),
      user: 'Administrador',
      metadata
    };
    setActivities(prev => [newActivity, ...prev.slice(0, 49)]); // Keep last 50 activities
  };

  // Real-time notification system
  const addNotification = (type: NotificationItem['type'], title: string, message: string) => {
    // Only add notifications on client-side to prevent hydration mismatch
    if (!isClient) return;
    
    const newNotification: NotificationItem = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      timestamp: new Date(),
      read: false
    };
    setRealTimeNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep last 10
    
    // Auto-remove after 5 seconds for success/info notifications
    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        setRealTimeNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 5000);
    }
  };

  // Load mock activities - Using fixed timestamps to prevent hydration mismatch
  const loadMockActivities = () => {
    const baseTime = new Date('2025-01-09T10:00:00Z'); // Fixed base time
    const mockActivities: ActivityItem[] = [
      {
        id: 'activity_1',
        type: 'lead_created',
        leadId: 'lead_123',
        leadName: 'João Silva',
        description: 'Novo lead criado via formulário de voos',
        timestamp: new Date(baseTime.getTime() - 5 * 60000), // Fixed 5 minutes before base
        user: 'Sistema',
        metadata: { source: 'website', service: 'voos' }
      },
      {
        id: 'activity_2',
        type: 'lead_updated',
        leadId: 'lead_456',
        leadName: 'Maria Santos',
        description: 'Status alterado de "novo" para "contatado"',
        timestamp: new Date(baseTime.getTime() - 15 * 60000), // Fixed 15 minutes before base
        user: 'Admin',
        metadata: { oldStatus: 'novo', newStatus: 'contatado' }
      }
    ];
    setActivities(mockActivities);
  };
  
  // Helper function to safely parse budget values and convert to USD
  const parseBudgetValue = (value: any): number => {
    if (!value) return 0;
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : Number(value);
    return isNaN(numValue) ? 0 : numValue;
  };
  
  // Helper function to safely calculate average
  const safeAverage = (total: number, count: number): number => {
    return count > 0 ? total / count : 0;
  };
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [activeTab, setActiveTab] = useState('leads');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Tags state
  const [availableTags, setAvailableTags] = useState<LeadTag[]>([]);

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

  // Generate search suggestions
  const generateSearchSuggestions = (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const suggestions = new Set<string>();
    
    leads.forEach(lead => {
      // Add name matches
      if (lead.nome.toLowerCase().includes(searchTerm.toLowerCase())) {
        suggestions.add(lead.nome);
      }
      // Add email matches
      if (lead.email.toLowerCase().includes(searchTerm.toLowerCase())) {
        suggestions.add(lead.email);
      }
      // Add destination matches
      if (lead.destino?.toLowerCase().includes(searchTerm.toLowerCase())) {
        suggestions.add(lead.destino);
      }
      // Add origin matches
      if (lead.origem?.toLowerCase().includes(searchTerm.toLowerCase())) {
        suggestions.add(lead.origem);
      }
    });
    
    setSearchSuggestions(Array.from(suggestions).slice(0, 5));
    setShowSuggestions(true);
  };

  // Handle search with recent searches
  const handleSearch = (searchTerm: string) => {
    setFilters({...filters, search: searchTerm});
    if (searchTerm && !recentSearches.includes(searchTerm)) {
      setRecentSearches(prev => [searchTerm, ...prev.slice(0, 4)]);
    }
    setShowSuggestions(false);
  };

  // Initialize client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch data with auto-refresh
  useEffect(() => {
    if (!isClient) return;
    
    fetchLeads();
    fetchStats();
    loadMockTags();
    loadMockActivities();
    
    // Auto-refresh every 30 seconds for real-time updates
    const refreshInterval = setInterval(() => {
      if (isLiveMode) {
        fetchLeads();
        fetchStats();
        setLastUpdate(new Date());
        addNotification('info', 'Dashboard atualizado', 'Dados atualizados automaticamente');
      }
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, [isLiveMode, isClient]);

  // Load mock tags using consolidated data
  const loadMockTags = () => {
    setAvailableTags(getMockTagsData());
  };

  // Get random tags for a lead using consolidated data
  const getRandomTags = (leadId: string) => {
    const tagPool = getMockTagsData();
    const seed = leadId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const numTags = (seed % 4) || 1; // 1-3 tags per lead (avoid 0)
    const shuffled = [...tagPool].sort(() => (seed % 17) - 8.5);
    return shuffled.slice(0, numTags);
  };

  const fetchLeads = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/leads?page=1&limit=1000');
      if (!response.ok) throw new Error('Failed to fetch leads');
      
      const data = await response.json();
      
      // Add mock tags to leads for demonstration
      const leadsWithTags = (data.leads || []).map((lead: Lead) => ({
        ...lead,
        tags: getRandomTags(lead.id)
      }));
      
      setLeads(leadsWithTags);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os leads',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (): Promise<void> => {
    try {
      const response = await fetch('/api/admin/leads?stats=true');
      if (!response.ok) throw new Error('Failed to fetch stats');
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Filter leads based on current filters
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

      // Assigned to filter
      if (filters.assignedTo && lead.assignedTo !== filters.assignedTo) {
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

      // Origin/Destination filters
      if (filters.origem && !lead.origem?.toLowerCase().includes(filters.origem.toLowerCase())) {
        return false;
      }
      if (filters.destino && !lead.destino?.toLowerCase().includes(filters.destino.toLowerCase())) {
        return false;
      }

      // Has notes filter
      if (filters.hasNotes !== undefined) {
        const hasNotes = Boolean(lead.notes?.trim());
        if (filters.hasNotes !== hasNotes) return false;
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
    setEditingLead(lead);
    setShowEditModal(true);
  };

  const handleSaveLead = async (updatedLead: Lead) => {
    try {
      const response = await fetch(`/api/admin/leads/${updatedLead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLead)
      });

      if (!response.ok) throw new Error('Failed to update lead');

      // Update local state
      setLeads(leads.map(lead => 
        lead.id === updatedLead.id ? updatedLead : lead
      ));

      setShowEditModal(false);
      setEditingLead(null);

      toast({
        title: 'Sucesso',
        description: 'Lead atualizado com sucesso'
      });
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o lead',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    const leadToDelete = leads.find(l => l.id === leadId);
    if (!leadToDelete) return;
    
    if (!confirm('Tem certeza que deseja excluir este lead?')) return;

    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete lead');

      setLeads(leads.filter(lead => lead.id !== leadId));
      setSelectedLeads(selectedLeads.filter(id => id !== leadId));

      // Add activity tracking
      addActivity('lead_deleted', leadId, leadToDelete.nome, 'Lead excluído do sistema');
      
      // Add success notification
      addNotification('success', 'Lead excluído', `${leadToDelete.nome} foi removido com sucesso`);

      toast({
        title: 'Sucesso',
        description: 'Lead excluído com sucesso'
      });
    } catch (error) {
      console.error('Error deleting lead:', error);
      addNotification('error', 'Erro na exclusão', 'Não foi possível excluir o lead');
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o lead',
        variant: 'destructive'
      });
    }
  };

  const handleAssignLead = async (leadId: string) => {
    // TODO: Implement assign modal
    toast({
      title: 'Em desenvolvimento',
      description: 'Funcionalidade de atribuição em desenvolvimento'
    });
  };

  const handleContactLead = async (leadId: string, method: string) => {
    // TODO: Implement contact functionality
    toast({
      title: 'Em desenvolvimento',
      description: `Funcionalidade de contato via ${method} em desenvolvimento`
    });
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
  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedLeads.length === 0) return;
    
    try {
      const response = await fetch('/api/admin/leads/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateStatus',
          leadIds: selectedLeads,
          data: { status }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Status Atualizado',
          description: result.message
        });
        addActivity('lead_updated', selectedLeads[0], `${selectedLeads.length} leads`, `Status alterado para "${status}"`);
        addNotification('success', 'Operação em lote', result.message);
        await fetchLeads(); // Refresh leads
        await fetchStats(); // Refresh stats
        setSelectedLeads([]); // Clear selection
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Bulk status update error:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar status dos leads'
      });
      addNotification('error', 'Erro na operação', 'Falha ao atualizar status dos leads');
    }
  };

  const handleBulkAssign = async (assignTo: string) => {
    if (selectedLeads.length === 0) return;
    
    try {
      const response = await fetch('/api/admin/leads/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign',
          leadIds: selectedLeads,
          data: { assignedTo: assignTo === 'unassigned' ? null : assignTo }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Leads Atribuídos',
          description: result.message
        });
        addActivity('lead_assigned', selectedLeads[0], `${selectedLeads.length} leads`, `Atribuídos para "${assignTo}"`);
        addNotification('success', 'Atribuição em lote', result.message);
        await fetchLeads();
        await fetchStats();
        setSelectedLeads([]);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Bulk assign error:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atribuir leads'
      });
      addNotification('error', 'Erro na atribuição', 'Falha ao atribuir leads');
    }
  };

  const handleBulkDelete = async (): Promise<void> => {
    if (selectedLeads.length === 0) return;
    if (!confirm(`Tem certeza que deseja excluir ${selectedLeads.length} leads? Esta ação não pode ser desfeita.`)) return;
    
    try {
      const response = await fetch('/api/admin/leads/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: selectedLeads })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Leads Excluídos',
          description: result.message
        });
        addActivity('lead_deleted', selectedLeads[0], `${selectedLeads.length} leads`, 'Leads excluídos em lote');
        addNotification('success', 'Exclusão em lote', result.message);
        await fetchLeads();
        await fetchStats();
        setSelectedLeads([]);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir leads'
      });
      addNotification('error', 'Erro na exclusão', 'Falha ao excluir leads');
    }
  };

  const handleBulkExport = async () => {
    if (selectedLeads.length === 0) return;
    
    try {
      const response = await fetch('/api/admin/leads/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'export',
          leadIds: selectedLeads,
          data: {}
        })
      });

      const result = await response.json();
      
      if (result.success && result.result.leads) {
        // Convert data to CSV
        const leads = result.result.leads;
        const headers = ['ID', 'Nome', 'Email', 'WhatsApp', 'Telefone', 'Origem', 'Destino', 'Status', 'Prioridade', 'Atribuído Para', 'Data Criação'];
        const csvContent = [
          headers.join(','),
          ...leads.map((lead: any) => [
            lead.id,
            `"${lead.nome || ''}"`,
            lead.email || '',
            lead.whatsapp || '',
            lead.telefone || '',
            `"${lead.origem || ''}"`,
            `"${lead.destino || ''}"`,
            lead.status || '',
            lead.priority || '',
            lead.assigned_to || '',
            isClient ? new Date(lead.created_at).toLocaleDateString('pt-BR') : new Date(lead.created_at).toISOString().split('T')[0]
          ].join(','))
        ].join('\n');

        // Download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: 'Exportação Concluída',
          description: `${leads.length} leads exportados com sucesso`
        });
        addActivity('lead_created', selectedLeads[0], `${selectedLeads.length} leads`, 'Dados exportados para CSV');
        addNotification('success', 'Exportação realizada', `${leads.length} leads exportados para CSV`);
      } else {
        throw new Error(result.error || 'Falha na exportação');
      }
    } catch (error) {
      console.error('Bulk export error:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao exportar leads'
      });
      addNotification('error', 'Erro na exportação', 'Falha ao exportar leads para CSV');
    }
  };

  const handleBulkAddTags = async (tagIds: string[]) => {
    if (selectedLeads.length === 0 || tagIds.length === 0) return;
    
    try {
      const response = await fetch('/api/admin/leads/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addTags',
          leadIds: selectedLeads,
          data: { tags: tagIds }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Tags Adicionadas',
          description: result.message
        });
        addActivity('lead_updated', selectedLeads[0], `${selectedLeads.length} leads`, `${tagIds.length} tag(s) adicionada(s)`);
        addNotification('success', 'Tags adicionadas', result.message);
        await fetchLeads();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Bulk add tags error:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar tags'
      });
      addNotification('error', 'Erro nas tags', 'Falha ao adicionar tags aos leads');
    }
  };

  const handleBulkRemoveTags = async (tagIds: string[]) => {
    if (selectedLeads.length === 0 || tagIds.length === 0) return;
    
    try {
      const response = await fetch('/api/admin/leads/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'removeTags',
          leadIds: selectedLeads,
          data: { tags: tagIds }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Tags Removidas',
          description: result.message
        });
        addActivity('lead_updated', selectedLeads[0], `${selectedLeads.length} leads`, `${tagIds.length} tag(s) removida(s)`);
        addNotification('success', 'Tags removidas', result.message);
        await fetchLeads();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Bulk remove tags error:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover tags'
      });
      addNotification('error', 'Erro nas tags', 'Falha ao remover tags dos leads');
    }
  };

  const handleExport = () => {
    toast({
      title: 'Em desenvolvimento',
      description: 'Funcionalidade de exportação em desenvolvimento'
    });
  };

  // Tag management functions
  const handleCreateTag = (tagData: Omit<LeadTag, 'id' | 'count'>) => {
    const newTag: LeadTag = {
      ...tagData,
      id: Date.now().toString(),
      count: 0
    };
    setAvailableTags([...availableTags, newTag]);
    
    toast({
      title: 'Sucesso',
      description: `Tag "${newTag.name}" criada com sucesso`
    });
  };

  const handleUpdateTag = (tagId: string, updates: Partial<LeadTag>) => {
    setAvailableTags(availableTags.map(tag => 
      tag.id === tagId ? { ...tag, ...updates } : tag
    ));
    
    toast({
      title: 'Sucesso',
      description: 'Tag atualizada com sucesso'
    });
  };

  const handleDeleteTag = (tagId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tag?')) return;
    
    setAvailableTags(availableTags.filter(tag => tag.id !== tagId));
    
    // Remove from filters if selected
    if (filters.tags.includes(tagId)) {
      setFilters({
        ...filters,
        tags: filters.tags.filter(id => id !== tagId)
      });
    }
    
    toast({
      title: 'Sucesso',
      description: 'Tag excluída com sucesso'
    });
  };

  const resetFilters = () => {
    setFilters({
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
  };

  return (
    <div className="admin-page">
      {/* Real-time Notifications Overlay */}
      {realTimeNotifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {realTimeNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transition-all duration-300 ${
                notification.type === 'success' ? 'border-l-4 border-green-400' :
                notification.type === 'warning' ? 'border-l-4 border-yellow-400' :
                notification.type === 'error' ? 'border-l-4 border-red-400' :
                'border-l-4 border-blue-400'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                      notification.type === 'success' ? 'bg-green-100 text-green-600' :
                      notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                      notification.type === 'error' ? 'bg-red-100 text-red-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {notification.type === 'success' ? '✅' :
                       notification.type === 'warning' ? '⚠️' :
                       notification.type === 'error' ? '❌' : 'ℹ️'}
                    </div>
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTime(notification.timestamp)}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex">
                    <button
                      onClick={() => setRealTimeNotifications(prev => prev.filter(n => n.id !== notification.id))}
                      className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500"
                    >
                      <span className="sr-only">Fechar</span>
                      <span className="text-xl">×</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="admin-container">
        {/* Enhanced Header with Smart Filters */}
        <div className="admin-header-section">
          <div>
            <h1 className="admin-page-title">🚀 Gestão Inteligente de Leads</h1>
            <p className="admin-page-subtitle">Interface avançada com IA para maximizar conversões • {filteredLeads.length} leads</p>
            
            {/* Smart Filter Chips */}
            <div className="flex flex-wrap gap-2 mt-3">
              <button 
                onClick={() => setFilters({...filters, status: ['novo']})}
                className={`smart-filter-chip ${filters.status.includes('novo') ? 'smart-filter-chip-active' : ''}`}
              >
                🆕 Novos ({leads.filter(l => l.status === 'novo').length})
              </button>
              <button 
                onClick={() => setFilters({...filters, priority: ['alta', 'urgente']})}
                className={`smart-filter-chip ${filters.priority.some(p => ['alta', 'urgente'].includes(p)) ? 'smart-filter-chip-active' : ''}`}
              >
                🔥 Alta Prioridade ({leads.filter(l => ['alta', 'urgente'].includes(l.priority || '')).length})
              </button>
              <button 
                onClick={() => {
                  const today = new Date();
                  const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                  setFilters({...filters, dateRange: { from: thisWeek, to: today }});
                }}
                className="smart-filter-chip"
              >
                📅 Esta Semana ({leads.filter(l => {
                  const leadDate = new Date(l.createdAt);
                  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                  return leadDate >= weekAgo;
                }).length})
              </button>
              <button 
                onClick={() => setFilters({...filters, origem: 'São Paulo'})}
                className="smart-filter-chip"
              >
                🌆 São Paulo ({leads.filter(l => l.origem?.includes('São Paulo')).length})
              </button>
              {Object.keys(filters).some(key => {
                const value = filters[key as keyof typeof filters];
                return Array.isArray(value) ? value.length > 0 : Boolean(value);
              }) && (
                <button 
                  onClick={resetFilters}
                  className="smart-filter-chip bg-red-100 text-red-800 hover:bg-red-200"
                >
                  🔄 Limpar Filtros
                </button>
              )}
            </div>
          </div>
          
          <div className="admin-header-actions">
            <div className="smart-search-container relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Buscar por nome, email, destino..."
                  value={filters.search}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFilters({...filters, search: value});
                    generateSearchSuggestions(value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(filters.search);
                    }
                  }}
                  className="admin-input admin-input-sm w-80 pr-16"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {isClient && (
                    <button
                      onClick={() => setIsLiveMode(!isLiveMode)}
                      className={`text-xs px-2 py-1 rounded ${isLiveMode ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                      title="Toggle live updates"
                    >
                      {isLiveMode ? '🔴 LIVE' : '⏸️'}
                    </button>
                  )}
                </div>
              </div>
              
              {/* Search Suggestions */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1">
                  <div className="p-2 border-b text-xs text-gray-500 font-medium">Sugestões</div>
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                    >
                      🔍 {suggestion}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Recent Searches */}
              {!filters.search && recentSearches.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1">
                  <div className="p-2 border-b text-xs text-gray-500 font-medium">Pesquisas recentes</div>
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-gray-600"
                    >
                      🕒 {search}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={fetchLeads} 
              disabled={loading}
              className="admin-btn admin-btn-outline admin-btn-sm"
              title="Atualizar leads"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Carregando...' : 'Atualizar'}
            </button>
            <button 
              className="admin-btn admin-btn-primary admin-btn-sm"
              onClick={() => {
                // TODO: Implement create lead modal
                toast({ title: 'Em breve', description: 'Criação manual de leads será implementada em breve!' });
              }}
            >
              <Plus className="w-4 h-4" />
              Novo Lead
            </button>
          </div>
        </div>
        
        {/* Floating Action Button */}
        <div className="fab-main" onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} title="Voltar ao topo">
          ↑
        </div>

        {/* Enhanced Stats Cards with Service Analytics */}
        <div className="admin-grid admin-grid-4">
          <div className="admin-stats-card-primary">
            <div className="admin-stats-header">
              <span className="admin-stats-title">Total de Leads</span>
              <Users className="admin-stats-icon" />
            </div>
            <div className="admin-stats-value">{stats.total}</div>
            <div className="admin-stats-label">
              <span className="admin-stats-today-highlight">+{stats.today}</span> hoje
            </div>
          </div>

          <div className="admin-stats-card-success">
            <div className="admin-stats-header">
              <span className="admin-stats-title">Esta Semana</span>
              <TrendingUp className="admin-stats-icon" />
            </div>
            <div className="admin-stats-value">{stats.thisWeek}</div>
            <div className="admin-stats-label">leads captados</div>
          </div>

          <div className="admin-stats-card-warning">
            <div className="admin-stats-header">
              <span className="admin-stats-title">Taxa Conversão</span>
              <Calendar className="admin-stats-icon" />
            </div>
            <div className={`${
              stats.conversion > 20 ? 'admin-stats-value-success' : 
              stats.conversion > 10 ? 'admin-stats-value-warning' : 'admin-stats-value-error'
            }`}>
              {stats.conversion}%
            </div>
            <div className="admin-stats-label">leads para vendas</div>
          </div>

          <div className="admin-stats-card-purple">
            <div className="admin-stats-header">
              <span className="admin-stats-title">Valor Médio</span>
              <DollarSign className="admin-stats-icon" />
            </div>
            <div className="admin-stats-value-purple">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(stats.avgValue)}
            </div>
            <div className="admin-stats-label">por lead</div>
          </div>
        </div>
        
        {/* Service Distribution Cards */}
        <div className="admin-grid admin-grid-5 mt-4">
          {(() => {
            const serviceStats = leads.reduce((acc, lead) => {
              const services = Array.isArray(lead.selectedServices) ? lead.selectedServices : [lead.source || 'outros'];
              services.forEach(service => {
                if (!acc[service]) acc[service] = { count: 0, revenue: 0 };
                acc[service].count++;
                acc[service].revenue += parseBudgetValue(lead.orcamentoTotal);
              });
              return acc;
            }, {} as Record<string, { count: number; revenue: number }>);
            
            // Use shared service configuration
            const serviceConfig = getServiceConfig();
            
            return Object.entries(serviceConfig).map(([key, config]) => {
              const stats = serviceStats[key] || { count: 0, revenue: 0 };
              const percentage = leads.length > 0 ? (stats.count / leads.length * 100).toFixed(1) : '0';
              
              return (
                <div key={key} className={config.cssClass}>
                  <div className="admin-stats-header">
                    <span className="admin-stats-title-sm">{config.icon} {config.name}</span>
                  </div>
                  <div className={config.valueClass}>{stats.count}</div>
                  <div className="admin-stats-label-xs">{percentage}% dos leads</div>
                </div>
              );
            });
          })()
          }
        </div>

        {/* Filters */}
        <LeadFilters
          filters={filters}
          onFiltersChange={setFilters}
          onExport={handleExport}
          onReset={resetFilters}
          totalLeads={leads.length}
          filteredLeads={filteredLeads.length}
          availableTags={availableTags}
        />

        {/* Bulk Actions */}
        <BulkActions
          selectedLeads={selectedLeads}
          totalLeads={filteredLeads.length}
          onClearSelection={() => setSelectedLeads([])}
          onBulkStatusUpdate={handleBulkStatusUpdate}
          onBulkAssign={handleBulkAssign}
          onBulkDelete={handleBulkDelete}
          onBulkExport={handleBulkExport}
          onBulkEmail={() => toast({ title: 'Em desenvolvimento', description: 'Email em lote em desenvolvimento' })}
          onBulkWhatsApp={() => toast({ title: 'Em desenvolvimento', description: 'WhatsApp em lote em desenvolvimento' })}
          onBulkAddTags={handleBulkAddTags}
          onBulkRemoveTags={handleBulkRemoveTags}
          availableTags={availableTags}
        />

        {/* Tabs System */}
        <div className="admin-tabs">
          <div className="admin-tabs-list">
            <button 
              className={`admin-tab-trigger ${activeTab === 'leads' ? 'active' : ''}`}
              onClick={() => setActiveTab('leads')}
            >
              👥 Leads ({filteredLeads.length})
            </button>
            <button 
              className={`admin-tab-trigger ${activeTab === 'services' ? 'active' : ''}`}
              onClick={() => setActiveTab('services')}
            >
              🌍 Serviços
            </button>
            <button 
              className={`admin-tab-trigger ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              📊 Analytics
            </button>
            <button 
              className={`admin-tab-trigger ${activeTab === 'tags' ? 'active' : ''}`}
              onClick={() => setActiveTab('tags')}
            >
              🏷️ Tags
            </button>
            <button 
              className={`admin-tab-trigger ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              📋 Atividade ({activities.length})
            </button>
            <button 
              className={`admin-tab-trigger ${activeTab === 'performance' ? 'active' : ''}`}
              onClick={() => setActiveTab('performance')}
            >
              📈 Performance
            </button>
          </div>
          
          <div className="admin-tab-content">
            {activeTab === 'leads' && (
              <>
                {/* View Toggle and Select All */}
                <div className="admin-card">
                  <div className="admin-card-content">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSelectAll(e.target.checked)}
                            className="admin-checkbox"
                          />
                          <span className="admin-label-inline admin-text-secondary">
                            Selecionar todos ({filteredLeads.length})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="admin-label-inline admin-text-muted">Visualização:</span>
                        <button
                          className={`admin-btn admin-btn-sm ${viewMode === 'grid' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                          onClick={() => setViewMode('grid')}
                        >
                          <LayoutGrid className="w-4 h-4" />
                          Cards
                        </button>
                        <button
                          className={`admin-btn admin-btn-sm ${viewMode === 'table' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                          onClick={() => setViewMode('table')}
                        >
                          <List className="w-4 h-4" />
                          Tabela
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Leads Display */}
                {loading ? (
                  <div className="admin-loading">
                    <div className="admin-spinner"></div>
                    <span className="text-gray-600">Carregando leads...</span>
                  </div>
                ) : (
                  <div className="admin-card">
                    <div className="admin-card-header">
                      <div>
                        <h3 className="admin-card-title">Leads ({filteredLeads.length})</h3>
                        <p className="admin-card-description">Visualização em cards dos leads</p>
                      </div>
                    </div>
                    <div className="admin-card-content">
                      <div className="admin-grid admin-grid-3">
                        {filteredLeads.map((lead) => {
                          // Calculate lead score dynamically
                          const calculateLeadScore = (lead: Lead) => {
                            let score = 50; // base score
                            if (lead.whatsapp) score += 20;
                            if (lead.orcamentoTotal) score += 15;
                            if (lead.dataPartida) score += 10;
                            if (lead.numeroPassageiros && lead.numeroPassageiros > 2) score += 10;
                            return Math.min(score, 95);
                          };
                          
                          const leadScore = calculateLeadScore(lead);
                          const priorityClass = `lead-priority-${lead.priority || 'media'}`;
                          const statusClass = `lead-status-${lead.status.toLowerCase()}`;
                          
                          return (
                            <div key={lead.id} className="relative group">
                              <div className="admin-checkbox-container">
                                <input
                                  type="checkbox"
                                  checked={selectedLeads.includes(lead.id)}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSelectLead(lead.id, e.target.checked)}
                                  className="admin-checkbox"
                                />
                              </div>
                              
                              {/* Enhanced Lead Card */}
                              <div className="lead-card-enhanced">
                                {/* Quick Actions Overlay */}
                                <div className="lead-quick-actions">
                                  {lead.whatsapp && (
                                    <a 
                                      href={`https://wa.me/${lead.whatsapp.replace(/[^0-9]/g, '')}?text=Olá! Recebemos seu pedido de orçamento.`}
                                      className="lead-quick-action-btn"
                                      title="WhatsApp"
                                      target="_blank"
                                    >
                                      💬
                                    </a>
                                  )}
                                  <a 
                                    href={`mailto:${lead.email}?subject=Re: Orçamento de Viagem`}
                                    className="lead-quick-action-btn"
                                    title="Email"
                                  >
                                    📧
                                  </a>
                                  <button 
                                    onClick={() => handleEditLead(lead)}
                                    className="lead-quick-action-btn"
                                    title="Editar"
                                  >
                                    ✏️
                                  </button>
                                </div>
                                
                                {/* Lead Score Indicator */}
                                <div className="absolute top-3 left-3 flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${
                                    leadScore >= 80 ? 'lead-score-excellent' : 
                                    leadScore >= 60 ? 'lead-score-good' : 
                                    leadScore >= 40 ? 'lead-score-average' : 'lead-score-poor'
                                  }`} title={`Lead Score: ${leadScore}%`}></div>
                                  <span className="text-xs font-medium text-gray-500">{leadScore}%</span>
                                </div>
                                
                                {/* Priority Badge */}
                                <div className="absolute top-3 right-16">
                                  <span className={`text-xs px-2 py-1 rounded-full ${priorityClass}`}>
                                    {lead.priority === 'urgente' ? '🔥' : lead.priority === 'alta' ? '⚡' : lead.priority === 'media' ? '📋' : '📝'} 
                                    {lead.priority || 'média'}
                                  </span>
                                </div>
                                
                                <div className="p-6">
                                  {/* Header */}
                                  <div className="flex items-start justify-between mb-4">
                                    <div>
                                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{lead.nome}</h3>
                                      <p className="text-sm text-gray-600">{lead.email}</p>
                                      {lead.whatsapp && (
                                        <p className="text-sm text-green-600 font-medium">📱 {lead.whatsapp}</p>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusClass}`}>
                                        {lead.status === 'novo' && '🆕'}
                                        {lead.status === 'contatado' && '📞'}
                                        {lead.status === 'cotado' && '💰'}
                                        {lead.status === 'fechado' && '✅'}
                                        {lead.status === 'perdido' && '❌'}
                                        {' ' + lead.status}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* Travel Details */}
                                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-lg">✈️</span>
                                      <div className="flex-1">
                                        <p className="font-medium text-gray-900">
                                          {lead.origem || 'Origem'} → {lead.destino || 'Destino'}
                                        </p>
                                        <div className="text-sm text-gray-600 mt-1">
                                          {lead.dataPartida && (
                                            <span>🗓️ {formatDate(new Date(lead.dataPartida))}</span>
                                          )}
                                          {lead.dataRetorno && lead.dataPartida && (
                                            <span> → {formatDate(new Date(lead.dataRetorno))}</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-sm">
                                      <div>
                                        <span className="text-gray-600">👥 {lead.numeroPassageiros || 1} passageiro(s)</span>
                                        {lead.orcamentoTotal && (
                                          <span className="ml-4 font-semibold text-green-600">
                                            💰 ${lead.orcamentoTotal}
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-gray-500 text-xs">
                                        {formatDate(new Date(lead.createdAt))}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Services Tags */}
                                  <div className="flex flex-wrap gap-2 mb-4">
                                    {(Array.isArray(lead.selectedServices) ? lead.selectedServices : [lead.source || 'outros']).map((service, index) => (
                                      <span key={index} className="service-tag">
                                        {service === 'voos' && '✈️'}
                                        {service === 'hoteis' && '🏨'}
                                        {service === 'carros' && '🚗'}
                                        {service === 'passeios' && '🌄'}
                                        {service === 'seguro' && '🛡️'}
                                        {' ' + service}
                                      </span>
                                    ))}
                                  </div>
                                  
                                  {/* Action Buttons */}
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleEditLead(lead)}
                                      className="flex-1 admin-btn admin-btn-outline admin-btn-sm"
                                    >
                                      ✏️ Editar
                                    </button>
                                    {lead.whatsapp && (
                                      <a
                                        href={`https://wa.me/${lead.whatsapp.replace(/[^0-9]/g, '')}?text=Olá ${lead.nome}! Recebemos seu pedido de orçamento.`}
                                        target="_blank"
                                        className="flex-1 admin-btn admin-btn-success admin-btn-sm text-center"
                                      >
                                        💬 WhatsApp
                                      </a>
                                    )}
                                    <button
                                      onClick={() => handleContactLead && handleContactLead(lead.id)}
                                      className="admin-btn admin-btn-primary admin-btn-sm"
                                    >
                                      📞
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Empty State */}
                      {filteredLeads.length === 0 && (
                        <div className="admin-empty-state">
                          <div className="admin-empty-icon">👥</div>
                          <h3 className="admin-empty-title">
                            Nenhum lead encontrado
                          </h3>
                          <p className="admin-empty-description">
                            Tente ajustar os filtros ou adicionar novos leads
                          </p>
                          <button className="admin-btn admin-btn-primary">
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Novo Lead
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'analytics' && (
              <div className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <h3 className="admin-card-title">📊 Analytics de Leads</h3>
                    <p className="admin-card-description">Métricas e insights de performance</p>
                  </div>
                </div>
                <div className="admin-card-content">
                  <div className="admin-grid admin-grid-2">
                    <div className="admin-stats-card">
                      <div className="admin-stats-header">
                        <span className="admin-stats-title">Taxa de Conversão</span>
                        <TrendingUp className="admin-stats-icon" />
                      </div>
                      <div className="admin-stats-value">{stats.conversion}%</div>
                      <div className="admin-stats-label">último mês</div>
                    </div>
                    <div className="admin-stats-card">
                      <div className="admin-stats-header">
                        <span className="admin-stats-title">Tempo Médio</span>
                        <Calendar className="admin-stats-icon" />
                      </div>
                      <div className="admin-stats-value">2.5 dias</div>
                      <div className="admin-stats-label">para conversão</div>
                    </div>
                  </div>
                  <div className="admin-divider"></div>
                  <div className="admin-badge admin-badge-info">
                    🚧 Analytics avançados em desenvolvimento
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <h3 className="admin-card-title">🌍 Análise por Serviços</h3>
                    <p className="admin-card-description">Performance detalhada por categoria de serviço</p>
                  </div>
                </div>
                <div className="admin-card-content">
                  {(() => {
                    const serviceStats = leads.reduce((acc, lead) => {
                      const services = Array.isArray(lead.selectedServices) ? lead.selectedServices : [lead.source || 'outros'];
                      services.forEach(service => {
                        if (!acc[service]) acc[service] = { count: 0, revenue: 0, avgDeal: 0, conversion: 0 };
                        acc[service].count++;
                        acc[service].revenue += parseBudgetValue(lead.orcamentoTotal);
                      });
                      return acc;
                    }, {} as Record<string, { count: number; revenue: number; avgDeal: number; conversion: number }>);

                    // Calculate averages with null safety
                    Object.keys(serviceStats).forEach(service => {
                      serviceStats[service].avgDeal = safeAverage(serviceStats[service].revenue, serviceStats[service].count);
                      serviceStats[service].conversion = Math.random() * 25 + 10; // Mock data for now
                    });

                    // Use shared service configuration
                    const serviceConfig = getServiceConfig();

                    return (
                      <>
                        <div className="admin-grid admin-grid-5">
                          {Object.entries(serviceConfig).map(([key, config]) => {
                            const stats = serviceStats[key] || { count: 0, revenue: 0, avgDeal: 0, conversion: 0 };
                            const percentage = leads.length > 0 ? (stats.count / leads.length * 100).toFixed(1) : '0';
                            
                            return (
                              <div key={key} className={config.cssClass}>
                                <div className="admin-stats-header">
                                  <span className="admin-stats-title">{config.icon} {config.name}</span>
                                </div>
                                <div className="admin-stats-value">{stats.count}</div>
                                <div className="admin-stats-label">{percentage}% dos leads</div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="admin-divider"></div>

                        {/* Detailed Service Metrics */}
                        <div className="space-y-6">
                          <h4 className="text-lg font-semibold text-gray-900">📊 Métricas Detalhadas</h4>
                          
                          {Object.entries(serviceConfig).map(([key, config]) => {
                            const stats = serviceStats[key] || { count: 0, revenue: 0, avgDeal: 0, conversion: 0 };
                            
                            if (stats.count === 0) return null;
                            
                            return (
                              <div key={key} className="admin-card">
                                <div className="admin-card-header">
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl">{config.icon}</span>
                                    <div>
                                      <h5 className="admin-card-title">{config.name}</h5>
                                      <p className="admin-card-description">Análise detalhada do serviço</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="admin-card-content">
                                  <div className="admin-grid admin-grid-4">
                                    <div className="admin-stats-card-compact">
                                      <span className="admin-stats-title-sm">Total de Leads</span>
                                      <div className="admin-stats-value-sm text-blue-600">{stats.count}</div>
                                      <span className="admin-stats-label-xs">captados</span>
                                    </div>
                                    
                                    <div className="admin-stats-card-compact">
                                      <span className="admin-stats-title-sm">Receita Total</span>
                                      <div className="admin-stats-value-sm text-green-600">
                                        {new Intl.NumberFormat('en-US', {
                                          style: 'currency',
                                          currency: 'USD',
                                          minimumFractionDigits: 0
                                        }).format(stats.revenue)}
                                      </div>
                                      <span className="admin-stats-label-xs">em orçamentos</span>
                                    </div>
                                    
                                    <div className="admin-stats-card-compact">
                                      <span className="admin-stats-title-sm">Ticket Médio</span>
                                      <div className="admin-stats-value-sm text-purple-600">
                                        {new Intl.NumberFormat('en-US', {
                                          style: 'currency',
                                          currency: 'USD',
                                          minimumFractionDigits: 0
                                        }).format(stats.avgDeal)}
                                      </div>
                                      <span className="admin-stats-label-xs">por lead</span>
                                    </div>
                                    
                                    <div className="admin-stats-card-compact">
                                      <span className="admin-stats-title-sm">Taxa Conversão</span>
                                      <div className={`admin-stats-value-sm ${
                                        stats.conversion > 20 ? 'text-green-600' : 
                                        stats.conversion > 10 ? 'text-amber-600' : 'text-red-600'
                                      }`}>
                                        {stats.conversion.toFixed(1)}%
                                      </div>
                                      <span className="admin-stats-label-xs">estimada</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          
                          {Object.keys(serviceStats).length === 0 && (
                            <div className="admin-empty-state">
                              <div className="admin-empty-icon">📊</div>
                              <h3 className="admin-empty-title">Nenhum dado disponível</h3>
                              <p className="admin-empty-description">
                                Aguarde leads serem criados para visualizar métricas por serviço
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {activeTab === 'tags' && (
              <div className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <h3 className="admin-card-title">🏷️ Gestão de Tags</h3>
                    <p className="admin-card-description">Organize e categorize seus leads</p>
                  </div>
                </div>
                <div className="admin-card-content">
                  <div className="admin-grid admin-grid-4">
                    {availableTags.map((tag) => (
                      <div key={tag.id} className="admin-stats-card">
                        <div className="admin-stats-header">
                          <span className="admin-stats-title">{tag.name}</span>
                          <MoreVertical className="admin-stats-icon" />
                        </div>
                        <div className="admin-stats-value">
                          {leads.filter(lead => lead.tags?.some(t => t.id === tag.id)).length}
                        </div>
                        <div className="admin-stats-label">leads marcados</div>
                      </div>
                    ))}
                  </div>
                  {availableTags.length === 0 && (
                    <div className="admin-empty-state">
                      <div className="admin-empty-icon">🏷️</div>
                      <h3 className="admin-empty-title">Nenhuma tag criada</h3>
                      <p className="admin-empty-description">Crie tags para organizar seus leads</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <h3 className="admin-card-title">📋 Timeline de Atividades</h3>
                    <p className="admin-card-description">Histórico completo de ações e alterações</p>
                  </div>
                  {isClient && (
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${isLiveMode ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {isLiveMode ? '🔴 Ao vivo' : '⏸️ Pausado'}
                      </span>
                      {lastUpdate && (
                        <span className="text-xs text-gray-500">
                          Última atualização: {formatTime(lastUpdate)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="admin-card-content">
                  <div className="space-y-4">
                    {activities.map((activity, index) => {
                      const isRecent = Date.now() - activity.timestamp.getTime() < 5 * 60000; // 5 minutes
                      const getActivityIcon = (type: string) => {
                        switch (type) {
                          case 'lead_created': return '🆕';
                          case 'lead_updated': return '✏️';
                          case 'lead_deleted': return '🗑️';
                          case 'lead_assigned': return '👤';
                          case 'lead_contacted': return '📞';
                          default: return '📋';
                        }
                      };
                      
                      return (
                        <div key={activity.id} className={`flex items-start gap-4 p-4 rounded-lg border ${isRecent ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                          <div className="flex-shrink-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${isRecent ? 'bg-blue-100' : 'bg-gray-100'}`}>
                              {getActivityIcon(activity.type)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-900">
                                {activity.leadName}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{activity.user}</span>
                                <span>•</span>
                                <span>{formatDateTime(activity.timestamp)}</span>
                                {isRecent && <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">NOVO</span>}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                            {activity.metadata && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {Object.entries(activity.metadata).map(([key, value]) => (
                                  <span key={key} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                    {key}: {String(value)}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {activities.length === 0 && (
                    <div className="admin-empty-state">
                      <div className="admin-empty-icon">📋</div>
                      <h3 className="admin-empty-title">Nenhuma atividade registrada</h3>
                      <p className="admin-empty-description">As atividades aparecerão aqui conforme você gerencia os leads</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <h3 className="admin-card-title">📈 Dashboard de Performance</h3>
                    <p className="admin-card-description">Métricas avançadas e KPIs do sistema de leads</p>
                  </div>
                </div>
                <div className="admin-card-content">
                  {/* Performance Metrics */}
                  <div className="admin-grid admin-grid-4 mb-8">
                    <div className="admin-stats-card-primary">
                      <div className="admin-stats-header">
                        <span className="admin-stats-title">Conversão Hoje</span>
                        <TrendingUp className="admin-stats-icon" />
                      </div>
                      <div className="admin-stats-value">
                        {leads.length > 0 ? ((leads.filter(l => l.status === 'fechado').length / leads.length) * 100).toFixed(1) : '0'}%
                      </div>
                      <div className="admin-stats-label">vs. 12.5% ontem</div>
                    </div>
                    
                    <div className="admin-stats-card-success">
                      <div className="admin-stats-header">
                        <span className="admin-stats-title">Tempo Resposta</span>
                        <Calendar className="admin-stats-icon" />
                      </div>
                      <div className="admin-stats-value">2.3h</div>
                      <div className="admin-stats-label">tempo médio</div>
                    </div>
                    
                    <div className="admin-stats-card-warning">
                      <div className="admin-stats-header">
                        <span className="admin-stats-title">Leads Quentes</span>
                        <Users className="admin-stats-icon" />
                      </div>
                      <div className="admin-stats-value">
                        {leads.filter(l => l.priority === 'alta' || l.priority === 'urgente').length}
                      </div>
                      <div className="admin-stats-label">alta prioridade</div>
                    </div>
                    
                    <div className="admin-stats-card-purple">
                      <div className="admin-stats-header">
                        <span className="admin-stats-title">ROI Estimado</span>
                        <DollarSign className="admin-stats-icon" />
                      </div>
                      <div className="admin-stats-value">285%</div>
                      <div className="admin-stats-label">retorno investimento</div>
                    </div>
                  </div>

                  {/* Performance Trends */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">📊 Tendências de Performance</h4>
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border">
                      <div className="text-center">
                        <div className="text-4xl mb-2">📈</div>
                        <h5 className="text-lg font-medium text-gray-900">Dashboard Interativo em Desenvolvimento</h5>
                        <p className="text-gray-600 mt-1">Gráficos dinâmicos de conversão, análise temporal e insights avançados</p>
                        <div className="mt-4 flex justify-center gap-4 text-sm">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">📊 Charts</span>
                          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">🎯 KPIs</span>
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">📈 Trends</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="admin-divider"></div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">⚡ Estatísticas Rápidas</h4>
                  <div className="admin-grid admin-grid-2">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Leads processados hoje:</span>
                        <span className="font-semibold text-blue-600">{stats.today}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Taxa de resposta:</span>
                        <span className="font-semibold text-green-600">87.5%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Leads em follow-up:</span>
                        <span className="font-semibold text-orange-600">
                          {leads.filter(l => l.status === 'follow_up').length}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Valor total pipeline:</span>
                        <span className="font-semibold text-purple-600">
                          ${leads.reduce((sum, lead) => sum + (lead.orcamentoTotal || 0), 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Leads sem contato:</span>
                        <span className="font-semibold text-red-600">
                          {leads.filter(l => l.status === 'novo').length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Score médio dos leads:</span>
                        <span className="font-semibold text-blue-600">
                          {leads.length > 0 ? Math.round(leads.reduce((sum, lead) => sum + (lead.score || 50), 0) / leads.length) : 50}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        <LeadEditModal
          lead={editingLead}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingLead(null);
          }}
          onSave={handleSaveLead}
          availableTags={availableTags}
          onCreateTag={handleCreateTag}
          onUpdateTag={handleUpdateTag}
          onDeleteTag={handleDeleteTag}
        />
      </div>
    </div>
  );
}