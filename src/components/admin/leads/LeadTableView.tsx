'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Mail,
  Phone,
  MessageSquare,
  Edit,
  Trash2,
  UserPlus,
  ExternalLink,
  Calendar,
  DollarSign,
  Star,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Filter
} from 'lucide-react';

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
  lastActivity?: string;
  score?: number;
  tags?: Array<{
    id: string;
    name: string;
    color: string;
    category: string;
  }>;
}

interface LeadTableViewProps {
  leads: Lead[];
  selectedLeads: string[];
  isLoading?: boolean;
  onSelectLead: (leadId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
  onAssign: (leadId: string) => void;
  onContact: (leadId: string, method: string) => void;
  onViewDetails: (lead: Lead) => void;
  className?: string;
}

type SortField = 'nome' | 'email' | 'status' | 'createdAt' | 'priority' | 'orcamentoTotal' | 'score';
type SortDirection = 'asc' | 'desc';

const statusConfig = {
  'novo': { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock, label: 'Novo' },
  'contatado': { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Phone, label: 'Contatado' },
  'cotacao_enviada': { color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Mail, label: 'Cotação Enviada' },
  'negociacao': { color: 'bg-orange-50 text-orange-700 border-orange-200', icon: MessageSquare, label: 'Negociação' },
  'fechado': { color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle, label: 'Fechado' },
  'perdido': { color: 'bg-red-50 text-red-700 border-red-200', icon: AlertCircle, label: 'Perdido' },
  'agendado': { color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Calendar, label: 'Agendado' }
};

const priorityConfig = {
  'baixa': { color: 'text-gray-500', weight: 1, label: 'Baixa' },
  'media': { color: 'text-yellow-500', weight: 2, label: 'Média' },
  'alta': { color: 'text-orange-500', weight: 3, label: 'Alta' },
  'urgente': { color: 'text-red-500', weight: 4, label: 'Urgente' }
};

export function LeadTableView({
  leads,
  selectedLeads,
  isLoading = false,
  onSelectLead,
  onSelectAll,
  onEdit,
  onDelete,
  onAssign,
  onContact,
  onViewDetails,
  className = ''
}: LeadTableViewProps) {
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [actionLoading, setActionLoading] = useState<{ [key: string]: string }>({});

  // Sorting logic
  const sortedLeads = useMemo(() => {
    if (!leads.length) return [];

    return [...leads].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle special cases
      if (sortField === 'priority') {
        aValue = a.priority ? priorityConfig[a.priority].weight : 0;
        bValue = b.priority ? priorityConfig[b.priority].weight : 0;
      } else if (sortField === 'createdAt') {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      } else if (sortField === 'orcamentoTotal') {
        aValue = a.orcamentoTotal || 0;
        bValue = b.orcamentoTotal || 0;
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue?.toLowerCase() || '';
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [leads, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAction = async (leadId: string, action: string, callback: () => void) => {
    setActionLoading((prev: any) => ({ ...prev, [`${leadId}_${action}`]: action }));
    try {
      await callback();
    } finally {
      setActionLoading((prev: any) => {
        const newState = { ...prev };
        delete newState[`${leadId}_${action}`];
        return newState;
      });
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '—';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora';
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d`;
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}m`;
  };

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      <button
        onClick={() => handleSort(field)}
        className="group flex items-center space-x-1 hover:text-gray-700 focus:outline-none focus:text-gray-700"
        aria-label={`Ordenar por ${children}`}
      >
        <span>{children}</span>
        <span className="flex flex-col">
          {sortField === field ? (
            sortDirection === 'asc' ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )
          ) : (
            <ChevronsUpDown className="h-3 w-3 opacity-50 group-hover:opacity-75" />
          )}
        </span>
      </button>
    </th>
  );

  const allSelected = selectedLeads.length === leads.length && leads.length > 0;
  const someSelected = selectedLeads.length > 0 && selectedLeads.length < leads.length;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Table Header with Actions */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={allSelected}
                ref={input => {
                  if (input) input.indeterminate = someSelected;
                }}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSelectAll(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                aria-label="Selecionar todos os leads"
              />
              <span className="text-sm text-gray-700">
                {selectedLeads.length > 0 
                  ? `${selectedLeads.length} selecionado${selectedLeads.length > 1 ? 's' : ''}`
                  : `${leads.length} lead${leads.length !== 1 ? 's' : ''}`
                }
              </span>
            </label>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Filter className="h-4 w-4" />
            <span>Visualização em tabela</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 w-12">
                <span className="sr-only">Seleção</span>
              </th>
              <SortHeader field="nome">Lead</SortHeader>
              <SortHeader field="status">Status</SortHeader>
              <SortHeader field="priority">Prioridade</SortHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Viagem
              </th>
              <SortHeader field="orcamentoTotal">Orçamento</SortHeader>
              <SortHeader field="score">Score</SortHeader>
              <SortHeader field="createdAt">Criado</SortHeader>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <span className="text-gray-500">Carregando leads...</span>
                  </div>
                </td>
              </tr>
            ) : sortedLeads.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum lead encontrado</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedLeads.map((lead) => {
                const statusInfo = statusConfig[lead.status as keyof typeof statusConfig] || statusConfig.novo;
                const priorityInfo = lead.priority ? priorityConfig[lead.priority] : null;
                const StatusIcon = statusInfo.icon;
                const isSelected = selectedLeads.includes(lead.id);

                return (
                  <tr 
                    key={lead.id} 
                    className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                  >
                    {/* Selection */}
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSelectLead(lead.id, e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        aria-label={`Selecionar ${lead.nome}`}
                      />
                    </td>

                    {/* Lead Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {lead.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {lead.nome}
                          </p>
                          <p className="text-sm text-gray-500 truncate" title={lead.email}>
                            {lead.email}
                          </p>
                          {(lead.whatsapp || lead.telefone) && (
                            <p className="text-xs text-gray-400">
                              {lead.whatsapp || lead.telefone}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-6 py-4">
                      {priorityInfo ? (
                        <div className={`flex items-center space-x-1 ${priorityInfo.color}`}>
                          <span className="h-2 w-2 rounded-full bg-current"></span>
                          <span className="text-xs font-medium">{priorityInfo.label}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>

                    {/* Travel */}
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {lead.origem && lead.destino ? (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-900 truncate max-w-32" title={`${lead.origem} → ${lead.destino}`}>
                              {lead.origem} → {lead.destino}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                        {lead.dataPartida && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {formatDate(lead.dataPartida)}
                              {lead.numeroPassageiros && ` • ${lead.numeroPassageiros} pax`}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Budget */}
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${lead.orcamentoTotal ? 'text-green-600' : 'text-gray-400'}`}>
                        {formatCurrency(lead.orcamentoTotal)}
                      </span>
                    </td>

                    {/* Score */}
                    <td className="px-6 py-4">
                      {lead.score ? (
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-sm text-gray-900">{lead.score}%</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>

                    {/* Created */}
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-gray-900">{formatDate(lead.createdAt)}</div>
                        <div className="text-xs text-gray-500">{getTimeSince(lead.createdAt)} atrás</div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onViewDetails(lead)}
                          className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
                          aria-label={`Ver detalhes de ${lead.nome}`}
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleAction(lead.id, 'email', () => onContact(lead.id, 'email'))}
                          disabled={!!actionLoading[`${lead.id}_email`]}
                          className="p-1 text-blue-400 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded disabled:opacity-50"
                          aria-label={`Enviar email para ${lead.nome}`}
                          title="Enviar email"
                        >
                          {actionLoading[`${lead.id}_email`] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Mail className="h-4 w-4" />
                          )}
                        </button>

                        <button
                          onClick={() => handleAction(lead.id, 'whatsapp', () => onContact(lead.id, 'whatsapp'))}
                          disabled={!!actionLoading[`${lead.id}_whatsapp`]}
                          className="p-1 text-green-400 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 rounded disabled:opacity-50"
                          aria-label={`Enviar WhatsApp para ${lead.nome}`}
                          title="Enviar WhatsApp"
                        >
                          {actionLoading[`${lead.id}_whatsapp`] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MessageSquare className="h-4 w-4" />
                          )}
                        </button>

                        <button
                          onClick={() => handleAction(lead.id, 'edit', () => onEdit(lead))}
                          disabled={!!actionLoading[`${lead.id}_edit`]}
                          className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 rounded disabled:opacity-50"
                          aria-label={`Editar ${lead.nome}`}
                          title="Editar"
                        >
                          {actionLoading[`${lead.id}_edit`] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Edit className="h-4 w-4" />
                          )}
                        </button>

                        <button
                          onClick={() => handleAction(lead.id, 'delete', () => onDelete(lead.id))}
                          disabled={!!actionLoading[`${lead.id}_delete`]}
                          className="p-1 text-red-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded disabled:opacity-50"
                          aria-label={`Excluir ${lead.nome}`}
                          title="Excluir"
                        >
                          {actionLoading[`${lead.id}_delete`] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {!isLoading && sortedLeads.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              Mostrando {sortedLeads.length} de {leads.length} lead{leads.length !== 1 ? 's' : ''}
            </span>
            <span>
              {selectedLeads.length > 0 && `${selectedLeads.length} selecionado${selectedLeads.length > 1 ? 's' : ''}`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}