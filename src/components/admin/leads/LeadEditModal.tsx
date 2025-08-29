'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Save, 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  DollarSign,
  MessageSquare,
  Clock,
  Star,
  Tag
} from 'lucide-react';
import { TagManager, LeadTag } from './TagManager';

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

interface LeadEditModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedLead: Lead) => void;
  isLoading?: boolean;
  availableTags?: LeadTag[];
  onCreateTag?: (tag: Omit<LeadTag, 'id' | 'count'>) => void;
  onUpdateTag?: (tagId: string, tag: Partial<LeadTag>) => void;
  onDeleteTag?: (tagId: string) => void;
}

const statusOptions = [
  { value: 'novo', label: 'Novo', color: 'bg-blue-100 text-blue-800' },
  { value: 'contatado', label: 'Contatado', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'cotacao_enviada', label: 'Cotação Enviada', color: 'bg-purple-100 text-purple-800' },
  { value: 'negociacao', label: 'Negociação', color: 'bg-orange-100 text-orange-800' },
  { value: 'agendado', label: 'Agendado', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'fechado', label: 'Fechado', color: 'bg-green-100 text-green-800' },
  { value: 'perdido', label: 'Perdido', color: 'bg-red-100 text-red-800' }
];

const priorityOptions = [
  { value: 'baixa', label: 'Baixa', color: 'text-gray-500' },
  { value: 'media', label: 'Média', color: 'text-yellow-500' },
  { value: 'alta', label: 'Alta', color: 'text-orange-500' },
  { value: 'urgente', label: 'Urgente', color: 'text-red-500' }
];

export function LeadEditModal({ 
  lead, 
  isOpen, 
  onClose, 
  onSave, 
  isLoading = false,
  availableTags = [],
  onCreateTag = () => {},
  onUpdateTag = () => {},
  onDeleteTag = () => {}
}: LeadEditModalProps) {
  const [formData, setFormData] = useState<Lead | null>(null);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (lead) {
      setFormData({ ...lead });
    }
  }, [lead]);

  const handleInputChange = (field: keyof Lead, value: any) => {
    if (!formData) return;
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSave = () => {
    if (formData) {
      onSave(formData);
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Editar Lead: {formData.nome}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="travel">Viagem</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
            <TabsTrigger value="notes">Notas</TabsTrigger>
            <TabsTrigger value="activity">Atividade</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Informações Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input
                      id="nome"
                      value={formData.nome || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('nome', e.target.value)}
                      placeholder="Digite o nome completo"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
                      placeholder="Digite o email"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={formData.whatsapp || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('whatsapp', e.target.value)}
                      placeholder="Digite o WhatsApp"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('telefone', e.target.value)}
                      placeholder="Digite o telefone"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Lead Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Gestão do Lead
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => handleInputChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <Badge className={option.color}>{option.label}</Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select 
                      value={formData.priority || ''} 
                      onValueChange={(value) => handleInputChange('priority', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <Star className={`h-3 w-3 ${option.color}`} />
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="assignedTo">Atribuído para</Label>
                    <Input
                      id="assignedTo"
                      value={formData.assignedTo || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('assignedTo', e.target.value)}
                      placeholder="Nome do responsável"
                    />
                  </div>

                  <div>
                    <Label htmlFor="orcamentoTotal">Orçamento Total</Label>
                    <Input
                      id="orcamentoTotal"
                      type="number"
                      value={formData.orcamentoTotal || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('orcamentoTotal', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="travel" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Informações da Viagem
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="origem">Origem</Label>
                    <Input
                      id="origem"
                      value={formData.origem || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('origem', e.target.value)}
                      placeholder="Cidade de origem"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="destino">Destino</Label>
                    <Input
                      id="destino"
                      value={formData.destino || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('destino', e.target.value)}
                      placeholder="Cidade de destino"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dataPartida">Data de Partida</Label>
                    <Input
                      id="dataPartida"
                      type="date"
                      value={formData.dataPartida || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('dataPartida', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dataRetorno">Data de Retorno</Label>
                    <Input
                      id="dataRetorno"
                      type="date"
                      value={formData.dataRetorno || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('dataRetorno', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="numeroPassageiros">Número de Passageiros</Label>
                    <Input
                      id="numeroPassageiros"
                      type="number"
                      min="1"
                      value={formData.numeroPassageiros || 1}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('numeroPassageiros', parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tags" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Gestão de Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TagManager
                  tags={availableTags}
                  selectedTags={formData?.tags?.map(t => t.id) || []}
                  onTagsChange={(tagIds) => {
                    if (!formData) return;
                    const selectedTagObjects = availableTags.filter(tag => 
                      tagIds.includes(tag.id)
                    );
                    handleInputChange('tags', selectedTagObjects);
                  }}
                  onCreateTag={onCreateTag}
                  onUpdateTag={onUpdateTag}
                  onDeleteTag={onDeleteTag}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Notas e Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="notes">Notas Internas</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('notes', e.target.value)}
                    placeholder="Adicione notas sobre este lead..."
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Histórico de Atividades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Lead criado</p>
                      <p className="text-xs text-gray-500">
                        {new Date(formData.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  {formData.lastActivity && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Clock className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Última atividade</p>
                        <p className="text-xs text-gray-500">
                          {new Date(formData.lastActivity).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}