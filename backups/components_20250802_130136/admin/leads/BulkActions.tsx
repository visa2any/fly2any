'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, 
  Download, 
  Mail, 
  MessageSquare, 
  User, 
  Tag,
  MoreHorizontal,
  X
} from 'lucide-react';

interface BulkActionsProps {
  selectedLeads: string[];
  totalLeads: number;
  onClearSelection: () => void;
  onBulkStatusUpdate: (status: string) => void;
  onBulkAssign: (assignTo: string) => void;
  onBulkDelete: () => void;
  onBulkExport: () => void;
  onBulkEmail: () => void;
  onBulkWhatsApp: () => void;
  onBulkAddTags?: (tagIds: string[]) => void;
  onBulkRemoveTags?: (tagIds: string[]) => void;
  availableTags?: Array<{
    id: string;
    name: string;
    color: string;
    category: string;
  }>;
}

const statusOptions = [
  { value: 'novo', label: 'Novo' },
  { value: 'contatado', label: 'Contatado' },
  { value: 'cotacao_enviada', label: 'Cotação Enviada' },
  { value: 'negociacao', label: 'Negociação' },
  { value: 'agendado', label: 'Agendado' },
  { value: 'fechado', label: 'Fechado' },
  { value: 'perdido', label: 'Perdido' }
];

export function BulkActions({
  selectedLeads,
  totalLeads,
  onClearSelection,
  onBulkStatusUpdate,
  onBulkAssign,
  onBulkDelete,
  onBulkExport,
  onBulkEmail,
  onBulkWhatsApp,
  onBulkAddTags = () => {},
  onBulkRemoveTags = () => {},
  availableTags = []
}: BulkActionsProps) {
  if (selectedLeads.length === 0) {
    return null;
  }

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50">
      <CardContent className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {selectedLeads.length} selecionado{selectedLeads.length > 1 ? 's' : ''}
            </Badge>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* Status Update */}
            <Select onValueChange={onBulkStatusUpdate}>
              <SelectTrigger className="w-48 h-8">
                <SelectValue placeholder="Alterar status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Assign */}
            <Select onValueChange={onBulkAssign}>
              <SelectTrigger className="w-48 h-8">
                <SelectValue placeholder="Atribuir para" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user1">João Silva</SelectItem>
                <SelectItem value="user2">Maria Santos</SelectItem>
                <SelectItem value="user3">Pedro Costa</SelectItem>
                <SelectItem value="unassigned">Não atribuído</SelectItem>
              </SelectContent>
            </Select>

            {/* Tags Actions */}
            {availableTags.length > 0 && (
              <div className="flex gap-1">
                <Select onValueChange={(tagId) => onBulkAddTags([tagId])}>
                  <SelectTrigger className="w-40 h-8">
                    <SelectValue placeholder="+ Adicionar tag" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTags.map((tag) => (
                      <SelectItem key={tag.id} value={tag.id}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${tag.color.split(' ')[0]}`} />
                          <span>{tag.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select onValueChange={(tagId) => onBulkRemoveTags([tagId])}>
                  <SelectTrigger className="w-40 h-8">
                    <SelectValue placeholder="- Remover tag" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTags.map((tag) => (
                      <SelectItem key={tag.id} value={tag.id}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${tag.color.split(' ')[0]}`} />
                          <span>{tag.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Communication Actions */}
            <div className="flex gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onBulkEmail}
                className="h-8 px-3"
              >
                <Mail className="h-3 w-3 mr-1" />
                Email
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onBulkWhatsApp}
                className="h-8 px-3"
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                WhatsApp
              </Button>
            </div>

            {/* Export/Delete Actions */}
            <div className="flex gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onBulkExport}
                className="h-8 px-3"
              >
                <Download className="h-3 w-3 mr-1" />
                Exportar
              </Button>
              
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={onBulkDelete}
                className="h-8 px-3"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Excluir
              </Button>
            </div>
          </div>
        </div>

        {/* Selection Summary */}
        <div className="mt-2 text-xs text-blue-600">
          {selectedLeads.length === totalLeads ? (
            <span>Todos os leads estão selecionados</span>
          ) : (
            <span>
              {selectedLeads.length} de {totalLeads} leads selecionados
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}