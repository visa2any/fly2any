'use client';

import React, { useState } from 'react';
import { 
  MoreHorizontal, 
  Phone, 
  Mail, 
  MessageSquare, 
  MapPin, 
  Calendar,
  DollarSign,
  User,
  Star,
  Edit,
  Trash2,
  UserPlus,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

// Accessible UI components
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

interface EnhancedLeadCardProps {
  lead: Lead;
  isSelected?: boolean;
  isLoading?: boolean;
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
  onAssign: (leadId: string) => void;
  onContact: (leadId: string, method: string) => void;
  onSelect?: (leadId: string, selected: boolean) => void;
  className?: string;
}

const statusConfig = {
  'novo': { 
    color: 'bg-blue-50 text-blue-700 border-blue-200', 
    icon: Clock, 
    label: 'Novo',
    description: 'Lead recém-recebido'
  },
  'contatado': { 
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200', 
    icon: Phone, 
    label: 'Contatado',
    description: 'Primeiro contato realizado'
  },
  'cotacao_enviada': { 
    color: 'bg-purple-50 text-purple-700 border-purple-200', 
    icon: Mail, 
    label: 'Cotação Enviada',
    description: 'Proposta comercial enviada'
  },
  'negociacao': { 
    color: 'bg-orange-50 text-orange-700 border-orange-200', 
    icon: MessageSquare, 
    label: 'Negociação',
    description: 'Em processo de negociação'
  },
  'fechado': { 
    color: 'bg-green-50 text-green-700 border-green-200', 
    icon: CheckCircle, 
    label: 'Fechado',
    description: 'Venda concluída com sucesso'
  },
  'perdido': { 
    color: 'bg-red-50 text-red-700 border-red-200', 
    icon: AlertCircle, 
    label: 'Perdido',
    description: 'Lead não convertido'
  },
  'agendado': { 
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200', 
    icon: Calendar, 
    label: 'Agendado',
    description: 'Reunião ou contato agendado'
  }
};

const priorityConfig = {
  'baixa': { color: 'text-gray-500', icon: '●', label: 'Baixa' },
  'media': { color: 'text-yellow-500', icon: '●', label: 'Média' },
  'alta': { color: 'text-orange-500', icon: '●', label: 'Alta' },
  'urgente': { color: 'text-red-500', icon: '●', label: 'Urgente' }
};

const sourceIcons = {
  'website': '🌐',
  'whatsapp': '💬',
  'email': '📧',
  'phone': '📞',
  'referral': '👥',
  'facebook': '📘',
  'instagram': '📷',
  'google': '🔍'
};

export function EnhancedLeadCard({ 
  lead, 
  isSelected = false,
  isLoading = false,
  onEdit, 
  onDelete, 
  onAssign, 
  onContact,
  onSelect,
  className = ''
}: EnhancedLeadCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const statusInfo = statusConfig[lead.status as keyof typeof statusConfig] || statusConfig.novo;
  const priorityInfo = lead.priority ? priorityConfig[lead.priority] : null;
  const StatusIcon = statusInfo.icon;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora mesmo';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d atrás`;
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}m atrás`;
  };

  const handleAction = async (action: string, callback: () => void) => {
    setActionLoading(action);
    try {
      await callback();
    } finally {
      setActionLoading(null);
    }
  };

  const cardClasses = `
    group relative bg-white rounded-xl border border-gray-200 transition-all duration-200 ease-in-out
    ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50 border-blue-300' : 'hover:border-gray-300 hover:shadow-md'}
    ${isLoading ? 'opacity-60 pointer-events-none' : ''}
    ${className}
  `.trim();

  return (
    <article 
      className={cardClasses}
      role="article"
      aria-labelledby={`lead-${lead.id}-title`}
      aria-describedby={`lead-${lead.id}-description`}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-xl">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2 text-sm text-gray-600">Carregando...</span>
        </div>
      )}

      {/* Selection Checkbox */}
      {onSelect && (
        <div className="absolute top-4 left-4 z-20">
          <label className="sr-only">Selecionar lead {lead.nome}</label>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSelect(lead.id, e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-2"
            aria-describedby={`lead-${lead.id}-checkbox-desc`}
          />
          <span id={`lead-${lead.id}-checkbox-desc`} className="sr-only">
            {isSelected ? 'Desmarcar' : 'Marcar'} lead {lead.nome}
          </span>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {getInitials(lead.nome || 'N/A')}
              </div>
            </div>

            {/* Lead Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 
                  id={`lead-${lead.id}-title`}
                  className="text-lg font-semibold text-gray-900 truncate"
                >
                  {lead.nome || 'Nome não informado'}
                </h3>
                {priorityInfo && (
                  <div 
                    className={`flex items-center space-x-1 ${priorityInfo.color}`}
                    title={`Prioridade: ${priorityInfo.label}`}
                  >
                    <span className="text-xs" aria-hidden="true">{priorityInfo.icon}</span>
                    <span className="text-xs font-medium">{priorityInfo.label}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span aria-label="Fonte do lead">{sourceIcons[lead.source as keyof typeof sourceIcons] || '📋'}</span>
                <span className="capitalize">{lead.source}</span>
                <span aria-hidden="true">•</span>
                <time dateTime={lead.createdAt}>{getTimeSince(lead.createdAt)}</time>
              </div>
            </div>
          </div>

          {/* Status and Actions */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div 
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}
              title={statusInfo.description}
            >
              <StatusIcon className="h-3 w-3 mr-1" aria-hidden="true" />
              {statusInfo.label}
            </div>

            {/* Actions Dropdown */}
            <div className="relative">
              <button
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                aria-label={`Ações para ${lead.nome}`}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <MoreHorizontal className="h-4 w-4 text-gray-500" />
              </button>

              {/* Dropdown Menu */}
              {isExpanded && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-30">
                  <div className="py-1" role="menu">
                    <button
                      onClick={() => handleAction('edit', () => onEdit(lead))}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      role="menuitem"
                      disabled={actionLoading === 'edit'}
                    >
                      {actionLoading === 'edit' ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Edit className="h-4 w-4 mr-2" />
                      )}
                      Editar Lead
                    </button>
                    <button
                      onClick={() => handleAction('assign', () => onAssign(lead.id))}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      role="menuitem"
                      disabled={actionLoading === 'assign'}
                    >
                      {actionLoading === 'assign' ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <UserPlus className="h-4 w-4 mr-2" />
                      )}
                      Atribuir
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={() => handleAction('delete', () => onDelete(lead.id))}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                      role="menuitem"
                      disabled={actionLoading === 'delete'}
                    >
                      {actionLoading === 'delete' ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Excluir
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Contato</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
                <span className="text-gray-600 truncate" title={lead.email}>
                  {lead.email || 'Email não informado'}
                </span>
              </div>
              {(lead.whatsapp || lead.telefone) && (
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
                  <span className="text-gray-600">
                    {lead.whatsapp || lead.telefone || 'Telefone não informado'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Travel Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Viagem</h4>
            <div className="space-y-2">
              {(lead.origem || lead.destino) && (
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
                  <span className="text-gray-600">
                    {lead.origem || 'N/A'} → {lead.destino || 'N/A'}
                  </span>
                </div>
              )}
              {lead.dataPartida && (
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
                  <span className="text-gray-600">
                    {formatDate(lead.dataPartida)} • {lead.numeroPassageiros || 1} pax
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tags */}
        {lead.tags && lead.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {lead.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${tag.color}`}
                >
                  {tag.name}
                </span>
              ))}
              {lead.tags.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border border-gray-300 bg-gray-50 text-gray-600">
                  +{lead.tags.length - 3} mais
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {/* Budget */}
          <div className="flex items-center space-x-4">
            {lead.orcamentoTotal && (
              <div className="flex items-center space-x-1 text-sm font-medium text-green-600">
                <DollarSign className="h-4 w-4" aria-hidden="true" />
                <span>{formatCurrency(lead.orcamentoTotal)}</span>
              </div>
            )}
            {lead.score && (
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Star className="h-4 w-4" aria-hidden="true" />
                <span>Score: {lead.score}%</span>
              </div>
            )}
          </div>

          {/* Contact Actions */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => handleAction('email', () => onContact(lead.id, 'email'))}
              disabled={actionLoading === 'email'}
              className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors disabled:opacity-50"
              aria-label={`Enviar email para ${lead.nome}`}
            >
              {actionLoading === 'email' ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Mail className="h-3 w-3 mr-1" />
              )}
              Email
            </button>
            <button 
              onClick={() => handleAction('whatsapp', () => onContact(lead.id, 'whatsapp'))}
              disabled={actionLoading === 'whatsapp'}
              className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-colors disabled:opacity-50"
              aria-label={`Enviar WhatsApp para ${lead.nome}`}
            >
              {actionLoading === 'whatsapp' ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <MessageSquare className="h-3 w-3 mr-1" />
              )}
              WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Screen Reader Description */}
      <div id={`lead-${lead.id}-description`} className="sr-only">
        Lead {lead.nome}, status {statusInfo.label}, 
        {priorityInfo && ` prioridade ${priorityInfo.label},`}
        recebido {getTimeSince(lead.createdAt)},
        viagem de {lead.origem || 'origem não informada'} para {lead.destino || 'destino não informado'}
        {lead.orcamentoTotal && `, orçamento ${formatCurrency(lead.orcamentoTotal)}`}
      </div>
    </article>
  );
}