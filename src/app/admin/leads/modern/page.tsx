'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
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
  tags?: string[];
  lastActivity?: string;
  score?: number;
}

interface LeadsStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  conversion: number;
  avgValue: number;
}

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
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
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
    hasNotes: undefined
  });

  // Fetch data
  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/leads?page=1&limit=1000');
      if (!response.ok) throw new Error('Failed to fetch leads');
      
      const data = await response.json();
      setLeads(data.leads || []);
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

  const fetchStats = async () => {
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
    if (!confirm('Tem certeza que deseja excluir este lead?')) return;

    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete lead');

      setLeads(leads.filter(lead => lead.id !== leadId));
      setSelectedLeads(selectedLeads.filter(id => id !== leadId));

      toast({
        title: 'Sucesso',
        description: 'Lead excluído com sucesso'
      });
    } catch (error) {
      console.error('Error deleting lead:', error);
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
    // TODO: Implement bulk status update
    toast({
      title: 'Em desenvolvimento',
      description: 'Funcionalidade de atualização em lote em desenvolvimento'
    });
  };

  const handleBulkAssign = async (assignTo: string) => {
    // TODO: Implement bulk assign
    toast({
      title: 'Em desenvolvimento',
      description: 'Funcionalidade de atribuição em lote em desenvolvimento'
    });
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir ${selectedLeads.length} leads?`)) return;
    
    // TODO: Implement bulk delete
    toast({
      title: 'Em desenvolvimento',
      description: 'Funcionalidade de exclusão em lote em desenvolvimento'
    });
  };

  const handleBulkExport = () => {
    // TODO: Implement bulk export
    toast({
      title: 'Em desenvolvimento',
      description: 'Funcionalidade de exportação em desenvolvimento'
    });
  };

  const handleExport = () => {
    // TODO: Implement export
    toast({
      title: 'Em desenvolvimento',
      description: 'Funcionalidade de exportação em desenvolvimento'
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
      hasNotes: undefined
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Leads</h1>
          <p className="text-gray-500 mt-1">
            Gerencie todos os seus leads de forma eficiente
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchLeads} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.today} hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisWeek}</div>
            <p className="text-xs text-muted-foreground">
              leads captados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversion}%</div>
            <p className="text-xs text-muted-foreground">
              leads para vendas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Médio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(stats.avgValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              por lead
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <LeadFilters
        filters={filters}
        onFiltersChange={setFilters}
        onExport={handleExport}
        onReset={resetFilters}
        totalLeads={leads.length}
        filteredLeads={filteredLeads.length}
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
      />

      {/* View Toggle and Select All */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-gray-600">
              Selecionar todos ({filteredLeads.length})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Leads Display */}
      {loading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredLeads.map((lead) => (
            <div key={lead.id} className="relative">
              <div className="absolute top-3 left-3 z-10">
                <Checkbox
                  checked={selectedLeads.includes(lead.id)}
                  onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
                />
              </div>
              <LeadCard
                lead={lead}
                onEdit={handleEditLead}
                onDelete={handleDeleteLead}
                onAssign={handleAssignLead}
                onContact={handleContactLead}
              />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredLeads.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum lead encontrado
          </h3>
          <p className="text-gray-500 mb-4">
            Tente ajustar os filtros ou adicionar novos leads
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Novo Lead
          </Button>
        </div>
      )}

      {/* Edit Modal */}
      <LeadEditModal
        lead={editingLead}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingLead(null);
        }}
        onSave={handleSaveLead}
      />
    </div>
  );
}