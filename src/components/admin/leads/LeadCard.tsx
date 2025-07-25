'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Phone, 
  Mail, 
  MessageSquare, 
  MapPin, 
  Calendar,
  DollarSign,
  User,
  Star
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

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
  onAssign: (leadId: string) => void;
  onContact: (leadId: string, method: string) => void;
}

const statusColors = {
  'novo': 'bg-blue-100 text-blue-800 border-blue-200',
  'contatado': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'cotacao_enviada': 'bg-purple-100 text-purple-800 border-purple-200',
  'negociacao': 'bg-orange-100 text-orange-800 border-orange-200',
  'fechado': 'bg-green-100 text-green-800 border-green-200',
  'perdido': 'bg-red-100 text-red-800 border-red-200',
  'agendado': 'bg-indigo-100 text-indigo-800 border-indigo-200'
};

const priorityColors = {
  'baixa': 'text-gray-500',
  'media': 'text-yellow-500',
  'alta': 'text-orange-500',
  'urgente': 'text-red-500'
};

const sourceIcons = {
  'website': '🌐',
  'whatsapp': '💬',
  'email': '📧',
  'phone': '📞',
  'referral': '👥'
};

export function LeadCard({ lead, onEdit, onDelete, onAssign, onContact }: LeadCardProps) {
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
    return new Date(dateString).toLocaleDateString('pt-BR');
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

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-400">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {getInitials(lead.nome || 'N/A')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 leading-none">
                  {lead.nome || 'Nome não informado'}
                </h3>
                {lead.priority && (
                  <div className={`flex items-center gap-1 ${priorityColors[lead.priority]}`}>
                    <Star className="h-3 w-3 fill-current" />
                    <span className="text-xs capitalize">{lead.priority}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{sourceIcons[lead.source as keyof typeof sourceIcons] || '📋'}</span>
                <span className="capitalize">{lead.source}</span>
                <span>•</span>
                <span>{getTimeSince(lead.createdAt)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={statusColors[lead.status as keyof typeof statusColors] || statusColors.novo}>
              {lead.status.replace('_', ' ').toUpperCase()}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onEdit(lead)}>
                  <User className="h-4 w-4 mr-2" />
                  Editar Lead
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAssign(lead.id)}>
                  <User className="h-4 w-4 mr-2" />
                  Atribuir
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onContact(lead.id, 'email')}>
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Email
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onContact(lead.id, 'whatsapp')}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(lead.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <User className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Contact Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 truncate">{lead.email || 'N/A'}</span>
            </div>
            {(lead.whatsapp || lead.telefone) && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{lead.whatsapp || lead.telefone || 'N/A'}</span>
              </div>
            )}
          </div>

          {/* Travel Info */}
          <div className="space-y-2">
            {(lead.origem || lead.destino) && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  {lead.origem || 'N/A'} → {lead.destino || 'N/A'}
                </span>
              </div>
            )}
            {lead.dataPartida && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  {formatDate(lead.dataPartida)} • {lead.numeroPassageiros || 1} pax
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {lead.tags && lead.tags.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {lead.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag.id}
                  className={`${tag.color} text-xs`}
                >
                  {tag.name}
                </Badge>
              ))}
              {lead.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{lead.tags.length - 3} mais
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Bottom Row */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4">
            {lead.orcamentoTotal && (
              <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                <DollarSign className="h-4 w-4" />
                {formatCurrency(lead.orcamentoTotal)}
              </div>
            )}
            {lead.score && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <span>Score: {lead.score}%</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onContact(lead.id, 'email')}
              className="h-8"
            >
              <Mail className="h-3 w-3 mr-1" />
              Email
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onContact(lead.id, 'whatsapp')}
              className="h-8"
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              WhatsApp
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}